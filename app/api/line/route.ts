// src/app/api/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client, TextMessage } from "@line/bot-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import User, { IUser } from '@/models/User';

// ✅ สร้าง LINE client
const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

// ✅ ฟังก์ชันเรียก Gemini AI
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

// ✅ Type สำหรับ user ที่ใช้ใน chatbot
interface ChatUser {
  name: string;
  lifestyle?: string;
  goal?: string;
  condition?: string;
  awaitingName?: boolean;
}

// ✅ ฟังก์ชันเรียก Gemini AI
async function handleGeminiResponse(user: ChatUser, message: string): Promise<string> {
  const systemPrompt = `
คุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารเหมือนเพื่อน
ผู้ใช้ชื่อ: "${user.name}"
ข้อความจากผู้ใช้: "${message}" 🧠 แนวทางการตอบคำถาม:
- หากผู้ใช้พูดถึง “สถานการณ์” เช่น ตอนเช้า, หลังออกกำลังกาย → แนะนำเมนูที่เหมาะสม
- หากผู้ใช้พิมพ์ “ชื่อเมนู” → อธิบายรายละเอียดเมนู
- หากผู้ใช้ขอ “ตารางอาหาร” → จัดเมนู 3 มื้อ/วัน
- หากผู้ใช้เสนอ “วัตถุดิบ” → แนะนำเมนูอิสระ
- หากผู้ใช้ถามเรื่องนอกเหนือจากอาหารและสุขภาพ → ตอบว่า: "ขออภัยครับ ผมสามารถตอบได้เฉพาะเรื่องอาหารและสุขภาพเท่านั้นนะครับ"
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "system", parts: [{ text: systemPrompt }] },
          { role: "user", parts: [{ text: message }] },
        ],
      }),
    }
  );

  const data: GeminiResponse = await res.json();
  return data.candidates?.[0]?.content.parts?.[0]?.text || "ขอโทษครับ ผมไม่เข้าใจคำถามครับ";
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const body = await req.text();
  const signature = req.headers.get("x-line-signature")!;
  const hash = crypto
    .createHmac("SHA256", process.env.LINE_CHANNEL_SECRET!)
    .update(body)
    .digest("base64");

  if (hash !== signature)
    return NextResponse.json({ status: "invalid signature" }, { status: 401 });

  const parsedBody: { events: any[] } = JSON.parse(body);
  const events = parsedBody.events;

  for (const event of events) {
    if (event.type !== "message" || event.message.type !== "text") continue;

    const userId: string = event.source.userId!;
    const userMessage: string = event.message.text.trim();

    // ✅ ดึง user จาก DB
    const userDoc = await User.findOne({ lineId: userId }).lean<IUser>();

    // ✅ ผู้ใช้ใหม่
    if (!userDoc) {
      await User.create({ lineId: userId, awaitingName: true });
      const reply: TextMessage = {
        type: "text",
        text: "สวัสดีครับ 😊 กรุณากรอกชื่อของคุณ หรือพิมพ์ 'ไม่มี' ถ้าไม่มีชื่อ",
      };
      await client.replyMessage(event.replyToken, reply);
      continue;
    }

    // ✅ แปลง userDoc เป็น ChatUser
    const user: ChatUser = {
      name: userDoc.name || "",
      lifestyle: userDoc.lifestyle,
      goal: userDoc.goal,
      condition: userDoc.condition,
      awaitingName: userDoc.awaitingName,
    };

    // ✅ กรณีผู้ใช้ต้องกรอกชื่อ
    if (user.awaitingName) {
      const name = userMessage === "ไม่มี" ? "ไม่มี" : userMessage;
      await User.updateOne({ lineId: userId }, { name, awaitingName: false });

      const reply: TextMessage = {
        type: "text",
        text: `ยินดีที่ได้รู้จักครับคุณ ${name}! ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
      };
      await client.replyMessage(event.replyToken, reply);
      continue;
    }

    // ✅ ข้อความทั่วไป → ส่งไป Gemini AI
    const replyText = await handleGeminiResponse(user, userMessage);
    const reply: TextMessage = { type: "text", text: replyText };
    await client.replyMessage(event.replyToken, reply);
  }

  return NextResponse.json({ status: "ok" });
}
