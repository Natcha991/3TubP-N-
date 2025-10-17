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

// 🔹 กำหนดชนิดของบทสนทนา
interface ConversationItem {
  role: string;
  text: string;
}

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
        await User.updateOne({ lineId: userId }, { name, awaitingName: false });
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

      // 🧹 คำสั่งรีเซ็ตบทสนทนา
      if (userMessage.toLowerCase() === "รีเซ็ต" || userMessage.toLowerCase() === "reset") {
        await User.updateOne({ lineId: userId }, { $set: { conversation: [] } });
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "ผมได้ล้างประวัติการคุยทั้งหมดแล้วครับ 😊 คุณสามารถเริ่มคุยเรื่องใหม่ได้เลยครับ",
        });
        continue;
      }

      // 🧠 ดึงบทสนทนาก่อนหน้า (ไม่เกิน 10 ข้อความล่าสุด)
      const recentConversation: ConversationItem[] = (user.conversation || []).slice(-10);
      const history = recentConversation.map((msg: ConversationItem) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      // 🤖 ส่งไป Gemini พร้อมบริบทก่อนหน้า + ข้อความล่าสุด
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              ...history,
              {
                role: "user",
                parts: [
                  {
                    text: `คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ
คุณเชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง และชอบใช้ข้าวกล้องดูแลสุขภาพ  
คุณเป็นแชทบอทใน LINE ที่พูดสุภาพและเป็นมิตรกับผู้ใช้  

🧠 แนวทางการตอบ:
- ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด
- แบ่งย่อหน้าให้อ่านง่าย  
- ไม่ต้องสวัสดีผู้ใช้  

ข้อความจากผู้ใช้: "${userMessage}"`,
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
        "ขอโทษครับ ผมไม่แน่ใจว่าคุณหมายถึงอะไรครับ";

      // 🗂️ อัปเดตบทสนทนาในฐานข้อมูล (เก็บ 10 ข้อความล่าสุด)
      await User.updateOne(
        { lineId: userId },
        {
          $push: {
            conversation: {
              $each: [
                { role: "user", text: userMessage },
                { role: "assistant", text: replyText },
              ],
              $slice: -10,
            },
          },
        }
      );

      // 📤 ส่งข้อความกลับ LINE
      await client.replyMessage(event.replyToken, { type: "text", text: replyText });
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
