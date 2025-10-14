// src/app/api/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client } from "@line/bot-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";

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

// ✅ สร้าง type สำหรับ user ที่ใช้ใน chatbot
interface ChatUser {
  name: string;
  lifestyle?: string;
  goal?: string;
  condition?: string;
  awaitingName?: boolean;
}

async function handleGeminiResponse(user: ChatUser, message: string) {
  const systemPrompt = `
คุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ เหมือนเพื่อนที่คุยกันสบาย ๆ นอกจากนี้คุณยังเป็นเชี่ยวชาญในเรื่องข้าวโดยเฉพาะข้าวกล้อง ที่อยากจะใช้ข้าวกล้องในการดูแลสุขภาพ คุณเป็นแชทบอทใน LINE ที่พูดสุภาพและเป็นมิตรกับผู้ใช้
ผู้ใช้ชื่อ: "${user.name}"
ข้อความจากผู้ใช้: "${message}" 🧠 แนวทางการตอบคำถาม:
- หากผู้ใช้พูดถึง “สถานการณ์” เช่น ตอนเช้า, หลังออกกำลังกาย → แนะนำเมนูที่เหมาะกับสถานการณ์นั้น (ไม่จำกัดเฉพาะในลิสต์)
- หากผู้ใช้พิมพ์ “ชื่อเมนู” → อธิบายว่าเมนูนั้นคืออะไร, ใช้วัตถุดิบอะไร, วิธีทำ, สารอาหาร, เหมาะกับใคร และถามว่า “มีตรงไหนในเมนูนี้ที่คุณยังสงสัยเพิ่มเติมไหมครับ?”
- หากผู้ใช้ขอ “ตารางอาหาร” → จัดเมนูให้ครบ 3 มื้อ/วัน โดยสามารถใช้เมนูจากในหรือนอกลิสต์ได้
- หากผู้ใช้เสนอ “วัตถุดิบ” เช่น มะละกอ → แนะนำเมนูที่ใช้วัตถุดิบนั้นได้อย่างอิสระ ไม่จำกัด
- หากผู้ใช้ไม่รู้จะกินอะไร → แนะนำเมนูสุขภาพ แล้วถามว่า “คุณชอบเมนูนี้มั้ยครับ?”
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

  const events = JSON.parse(body).events;

  for (const event of events) {
    if (event.type !== "message" || event.message.type !== "text") continue;

    const userId = event.source.userId!;
    const userMessage = event.message.text.trim();

    // ✅ ดึง user จาก DB โดยใช้ Mongoose type
    let userDoc = await User.findOne({ lineId: userId }).lean<IUser>();

    // ✅ ผู้ใช้ใหม่
    if (!userDoc) {
      await User.create({ lineId: userId, awaitingName: true });
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: "สวัสดีครับ 😊 กรุณากรอกชื่อของคุณ หรือพิมพ์ 'ไม่มี' ถ้าไม่มีชื่อ",
      });
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
      await User.updateOne(
        { lineId: userId },
        { name, awaitingName: false }
      );

      await client.replyMessage(event.replyToken, {
        type: "text",
        text: `ยินดีที่ได้รู้จักครับคุณ ${name}! ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
      });
      continue;
    }

    // ✅ ข้อความทั่วไป → ส่งไป Gemini AI
    const replyText = await handleGeminiResponse(user, userMessage);

    await client.replyMessage(event.replyToken, {
      type: "text",
      text: replyText,
    });
  }

  return NextResponse.json({ status: "ok" });
}
