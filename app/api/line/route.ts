import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client, WebhookEvent, TextMessage } from "@line/bot-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

// ✅ ตั้งค่า LINE Client
const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

// ✅ ประเภทข้อมูลของผู้ใช้
interface ChatUser {
  name?: string;
  lifestyle?: string;
  goal?: string;
  condition?: string;
  awaitingName?: boolean;
}

// ✅ ฟังก์ชันเรียก Gemini
async function handleGeminiResponse(user: ChatUser, message: string): Promise<string> {
  const systemPrompt = `
คุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ เหมือนเพื่อนที่คุยกันสบาย ๆ
ผู้ใช้ชื่อ: "${user.name ?? "ไม่ทราบชื่อ"}"
ข้อความจากผู้ใช้: "${message}"
🧠 แนวทางการตอบคำถาม:
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

  const data = await res.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "ขอโทษครับ ผมไม่เข้าใจคำถามครับ"
  );
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

  const events: WebhookEvent[] = JSON.parse(body).events;

  for (const event of events) {
    if (event.type !== "message" || event.message.type !== "text") continue;

    const userId = event.source.userId!;
    const userMessage = event.message.text.trim();

    // ✅ ค้นหาผู้ใช้ในฐานข้อมูล
    const userDoc = await User.findOne({ lineId: userId });

    // ✅ ถ้าไม่พบ user → สร้างใหม่และให้พิมพ์ชื่อ
    if (!userDoc) {
      await User.create({ lineId: userId, awaitingName: true });
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: "สวัสดีครับ 😊 กรุณากรอกชื่อของคุณ หรือพิมพ์ 'ไม่มี' ถ้าไม่มีชื่อครับ",
      });
      continue;
    }

    // ✅ ถ้ายังไม่ได้กรอกชื่อ
    if (userDoc.awaitingName) {
      const name = userMessage === "ไม่มี" ? "ไม่มี" : userMessage;

      // ถ้าข้อความสั้นเกินไป (เช่น 1 ตัวอักษร) ให้ถือว่าไม่ใช่ชื่อ
      if (name.length < 2 && name !== "ไม่มี") {
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "ชื่อของคุณควรมีอย่างน้อย 2 ตัวอักษรครับ 😊",
        });
        continue;
      }

      await User.updateOne({ lineId: userId }, { name, awaitingName: false });
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: `ยินดีที่ได้รู้จักครับคุณ ${name}! ตอนนี้คุณสามารถคุยเรื่องอาหารและสุขภาพได้เลยครับ 🍚`,
      });
      continue;
    }

    // ✅ ถ้ามีชื่อแล้ว → ให้ Gemini ตอบกลับ
    const user: ChatUser = {
      name: userDoc.name,
      lifestyle: userDoc.lifestyle,
      goal: userDoc.goal,
      condition: userDoc.condition,
    };

    const replyText = await handleGeminiResponse(user, userMessage);
    const reply: TextMessage = { type: "text", text: replyText };
    await client.replyMessage(event.replyToken, reply);
  }

  return NextResponse.json({ status: "ok" });
}
