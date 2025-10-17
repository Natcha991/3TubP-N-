// /app/api/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client, WebhookEvent, FollowEvent } from "@line/bot-sdk";
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
interface GeminiPart { text: string }
interface GeminiContent { role: string; parts: GeminiPart[] }
interface GeminiCandidate { content: GeminiContent }
interface GeminiResponse { candidates?: GeminiCandidate[] }

// 🔹 ข้อความ fallback
function getFriendlyFallback(): string {
  const options = [
    "อ๋อ ผมอาจไม่แน่ใจ แต่ลองเล่าเพิ่มหน่อยครับ",
    "น่าสนใจครับ! คุณอยากให้ผมแนะนำเมนูอีกไหม?",
    "ฮ่า ๆ ผมอาจตีความไม่ถูก แต่เรามาคุยเรื่องอาหารต่อกันดีกว่า",
  ];
  return options[Math.floor(Math.random() * options.length)];
}

// 🔹 ฟังก์ชันหลัก (Webhook)
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-line-signature");
    if (!signature) return new NextResponse("Missing signature", { status: 401 });

    const hash = crypto.createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
      .update(body).digest("base64");
    if (signature !== hash) return new NextResponse("Invalid signature", { status: 401 });

    await connectToDatabase();
    const parsedBody = JSON.parse(body) as { events: WebhookEvent[] };

    for (const event of parsedBody.events) {

      // 🆕 กรณี follow (เพิ่มเพื่อน)
      if (event.type === "follow") {
        const followEvent = event as FollowEvent;
        const userId = followEvent.source.userId!;
        let userDoc = await User.findOne({ lineId: userId });
        if (!userDoc) {
          userDoc = await User.create({
            lineId: userId,
            awaitingName: true,
            conversation: [],
          });
        }
        await client.replyMessage(followEvent.replyToken, {
          type: "text",
          text:
            "สวัสดีครับ 😊 ผมคือ Mr. Rice ผู้ช่วยด้านโภชนาการของคุณครับ\n" +
            "ก่อนอื่นขอทราบชื่อเล่นของคุณหน่อยครับ 🍚",
        });
        continue;
      }

      // ✅ ตรวจสอบเฉพาะข้อความ
      if (event.type !== "message" || event.message.type !== "text") continue;

      const messageEvent = event as import("@line/bot-sdk").MessageEvent;
      const replyToken = messageEvent.replyToken;
      const userId = messageEvent.source.userId!;

      // 🔹 ดึงข้อความผู้ใช้
      let userMessage = (messageEvent.message as { text: string }).text.trim();

      // 🔹 หาผู้ใช้ใน MongoDB
      let userDoc = await User.findOne({ lineId: userId });

      if (!userDoc) {
        // หากเริ่มพิมพ์โดยไม่ผ่าน follow
        const existingUser = await User.findOne({ name: userMessage });
        if (existingUser) {
          existingUser.lineId = userId;
          await existingUser.save();
          await client.replyMessage(replyToken, {
            type: "text",
            text: `สวัสดีครับคุณ ${existingUser.name}! ยินดีต้อนรับกลับครับ 😊`,
          });
          continue;
        } else {
          userDoc = await User.create({
            name: userMessage || "ไม่มี",
            lineId: userId,
            awaitingName: true,
            conversation: [],
          });
          await client.replyMessage(replyToken, {
            type: "text",
            text: `ยินดีที่ได้รู้จักครับคุณ ${userMessage || "ไม่มี"}! คุณช่วยบอกหน่อยว่าไลฟ์สไตล์ของคุณเป็นแบบไหนครับ?`,
          });
          continue;
        }
      }

      // 🔹 ถ้ากำลังรอชื่อ
      if (userDoc.awaitingName) {
        const name = userMessage || "ไม่มี";
        await User.updateOne({ lineId: userId }, { name, awaitingName: false });
        await client.replyMessage(replyToken, {
          type: "text",
          text: `ยินดีที่ได้รู้จักครับ คุณ ${name} 😊 ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
        });
        continue;
      }

      // 🔹 ถ้าพิมพ์ชื่อของตัวเอง
      if (userMessage === userDoc.name) {
        await client.replyMessage(replyToken, {
          type: "text",
          text: `ยินดีต้อนรับกลับครับ คุณ ${userDoc.name} 😊`,
        });
        continue;
      }

      // 🔹 โต้ตอบผ่าน Gemini AI
      const recentConversation = (userDoc.conversation || []).slice(-10);
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              ...recentConversation.map((_msg: { role: string; text: string }) => ({
                role: _msg.role,
                parts: [{ text: _msg.text }],
              })),
              {
                role: "user",
                parts: [{ text: `
คุณชื่อ Mr. Rice เป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ
เชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง
-ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด
-หากผู้ใช้พิมพ์ให้ แนะนำเมนู ให้เลือกเมนูที่เหมาะกับผู้ใช้จากข้อมูลของผู้ใช้ (goal, condition, lifestyle) 
และเขียนเหตุผลว่าเหมาะกับผู้ใช้เพราะอะไร
-หากไม่แน่ใจให้ตอบอย่างสุภาพ ไม่พูดว่า "ไม่เข้าใจ"
- ไม่ต้องสวัสดีผู้ใช้ 
ข้อความจากผู้ใช้: "${userMessage}"
                ` }],
              },
            ],
          }),
        }
      );

      const data: GeminiResponse = await geminiResponse.json();
      const replyText = data.candidates?.[0]?.content.parts?.[0]?.text || getFriendlyFallback();

      // 🔹 บันทึกบทสนทนา
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

      // 🔹 ส่งข้อความกลับผู้ใช้
      await client.replyMessage(replyToken, { type: "text", text: replyText });
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
