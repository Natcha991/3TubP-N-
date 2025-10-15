// /app/api/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client, WebhookEvent } from "@line/bot-sdk";
import dotenv from "dotenv";
import { connectToDatabase } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";

dotenv.config();

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

interface GeminiPart { text: string; }
interface GeminiContent { role: string; parts: GeminiPart[]; }
interface GeminiResponse { candidates?: { content: GeminiContent }[]; }

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-line-signature")!;
    const hash = crypto.createHmac("sha256", process.env.LINE_CHANNEL_SECRET!).update(body).digest("base64");
    if (signature !== hash) return new NextResponse("Invalid signature", { status: 401 });

    await connectToDatabase();
    const events: WebhookEvent[] = JSON.parse(body).events;

    for (const event of events) {
      if (event.type !== "message" || event.message.type !== "text") continue;

      const userMessage = event.message.text.trim();
      const userId = event.source.userId!;

      // 🔹 ดึงข้อมูลผู้ใช้จาก Mongo
      let user: IUser | null = await User.findOne({ lineId: userId });

      if (!user) {
        // ผู้ใช้ใหม่ → สร้าง user + รอกรอกชื่อ
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "สวัสดีครับ 😊 กรุณากรอกชื่อของคุณก่อน (พิมพ์ชื่อเล่นได้เลยครับ)",
        });
        await User.create({ lineId: userId, awaitingName: true });
        continue;
      }

      // ผู้ใช้รอกรอกชื่อ
      if (user.awaitingName) {
        const name = userMessage || "ไม่มี";
        await User.updateOne({ lineId: userId }, { name, awaitingName: false });

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `ยินดีที่ได้รู้จักครับ คุณ ${name} 😊 ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
        });
        continue;
      }

      // 🔹 ผู้ใช้เก่า → ต้อนรับแบบเฉพาะตัว (ครั้งแรกหลัง login)
      if (!user.awaitingName && userMessage.toLowerCase() === "start") {
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `ยินดีต้อนรับคุณ ${user.name} เข้าสู่การให้บริการ LINE Chatbot หวังว่าจะสร้างความสะดวกสบายให้กับคุณ และขอขอบคุณสำหรับแรงสนับสนุนตลอดมาครับ`,
        });
        continue;
      }

      // 🔹 ส่งข้อความทั่วไปไป Gemini AI
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `คุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ
ผู้ใช้ชื่อ: ${user.name}
ข้อความจากผู้ใช้: "${userMessage}"
แนวทางตอบ:
- ตอบสุภาพ กระชับ ไม่เกิน 4 บรรทัด
- ใช้ภาษาที่เข้าใจง่าย
- ถามกลับได้เล็กน้อยเพื่อให้ผู้ใช้รู้สึกเป็นกันเอง`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data: GeminiResponse = await geminiResponse.json();
      const replyText = data.candidates?.[0]?.content.parts?.[0]?.text || "ขอโทษครับ ผมไม่แน่ใจว่าคุณหมายถึงอะไรครับ";

      await client.replyMessage(event.replyToken, { type: "text", text: replyText });
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
