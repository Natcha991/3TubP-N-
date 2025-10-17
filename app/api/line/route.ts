import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client, WebhookEvent } from "@line/bot-sdk";
import dotenv from "dotenv";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

dotenv.config();

// 🔹 สร้าง LINE client
const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

// 🔹 โครงสร้าง Gemini Response
interface GeminiPart {
  text: string;
}
interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}
interface GeminiResponse {
  candidates?: { content: GeminiContent }[];
}

function getFriendlyFallback() {
  const options = [
    "อ๋อ ผมอาจไม่แน่ใจ แต่ลองเล่าเพิ่มหน่อยครับ",
    "น่าสนใจครับ! คุณอยากให้ผมแนะนำเมนูอีกไหม?",
    "ฮ่า ๆ ผมอาจตีความไม่ถูก แต่เรามาคุยเรื่องอาหารต่อกันดีกว่า"
  ];
  return options[Math.floor(Math.random() * options.length)];
}

export async function POST(req: NextRequest) {
  try {
    // ✅ ตรวจสอบลายเซ็น
    const body = await req.text();
    const signature = req.headers.get("x-line-signature")!;
    const hash = crypto
      .createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
      .update(body)
      .digest("base64");
    if (signature !== hash) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    // ✅ เชื่อมต่อฐานข้อมูล
    await connectToDatabase();
    const events: WebhookEvent[] = JSON.parse(body).events;

    for (const event of events) {
      if (event.type !== "message" || event.message.type !== "text") continue;

      const userMessage = event.message.text.trim();
      const userId = event.source.userId!;
      const user = await User.findOne({ lineId: userId });

      // 🆕 ผู้ใช้ใหม่ → ขอชื่อ
      if (!user) {
        await User.create({ lineId: userId, awaitingName: true, conversation: [] });
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "สวัสดีครับ 😊 กรุณาพิมพ์ชื่อเล่นของคุณก่อนครับ",
        });
        continue;
      }

      // 📝 ผู้ใช้กรอกชื่อ
      if (user.awaitingName) {
        const name = userMessage || "ไม่มี";
        await User.updateOne(
          { lineId: userId },
          { name, awaitingName: false }
        );
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `ยินดีที่ได้รู้จักครับ คุณ ${name} 😊 ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
        });
        continue;
      }

      // 👋 ผู้ใช้เก่า (ถ้าพิมพ์ชื่อของตนเอง)
      if (!user.awaitingName && userMessage === user.name) {
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `ยินดีต้อนรับคุณ ${user.name} กลับมาครับ 😊`,
        });
        continue;
      }

      // 🧠 ดึงบทสนทนาก่อนหน้า (ไม่เกิน 5 ข้อความล่าสุด)
      const recentConversation = (user.conversation || []).slice(-5);

      // 🤖 ส่งไป Gemini พร้อมบริบทก่อนหน้า
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              ...recentConversation.map((msg: { role: string; text: string }) => ({
                role: msg.role,
                parts: [{ text: msg.text }],
              })),
              {
                role: "user",
                parts: [
                  {
                    text: `
คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ เหมือนเพื่อนที่คุยกันสบาย ๆ  
คุณเชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง และชอบใช้ข้าวกล้องดูแลสุขภาพ  
คุณเป็นแชทบอทใน LINE ที่พูดสุภาพและเป็นมิตรกับผู้ใช้  


🧠 แนวทางการตอบ:
- ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด
- แบ่งย่อหน้าให้อ่านง่าย  
- ไม่ต้องสวัสดีผู้ใช้  
- ถ้าไม่แน่ใจเกี่ยวกับข้อความผู้ใช้ ให้ตอบอย่างสุภาพและเป็นมิตร แทนที่จะบอกว่า "ไม่เข้าใจ"

ข้อความจากผู้ใช้: "${userMessage}"
                    `,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data: GeminiResponse = await geminiResponse.json();
      const replyText =
        data.candidates?.[0]?.content.parts?.[0]?.text ||
        getFriendlyFallback();
      // 🗂️ อัปเดตบทสนทนาในฐานข้อมูล
      await User.updateOne(
        { lineId: userId },
        {
          $push: {
            conversation: {
              $each: [
                { role: "user", text: userMessage },
                { role: "assistant", text: replyText },
              ], $slice: -10
            } // เก็บไว้สูงสุด 10 ข้อความ
          },
        }
      );

      // 📤 ส่งข้อความกลับ LINE
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: replyText,
      });
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
