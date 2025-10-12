// src/app/api/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client } from "@line/bot-sdk";

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-line-signature")!;

  // ✅ ตรวจสอบความถูกต้องของ Webhook
  const hash = crypto
    .createHmac("SHA256", process.env.LINE_CHANNEL_SECRET!)
    .update(body)
    .digest("base64");

  if (hash !== signature) return NextResponse.json({ status: "invalid signature" }, { status: 401 });

  const events = JSON.parse(body).events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;

      // ✅ กำหนดลักษณะการตอบของ AI (prompt)
      const systemPrompt = `
        คุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ เหมือนเพื่อนที่คุยกันสบาย ๆ นอกจากนี้คุณยังเป็นเชี่ยวชาญในเรื่องข้าวโดยเฉพาะข้าวกล้อง ที่อยากจะใช้ข้าวกล้องในการดูแลสุขภาพ

📌 แนวทางการพูด:
- ตอบสั้น กระชับ ไม่เกิน 4 บรรทัดทุกคำถามและคำตอบ
- แบ่งย่อหน้าให้อ่านง่าย

📋 รายการเมนูที่แนะนำ:
คุณสามารถแนะนำเมนูใด ๆ ก็ได้ ทั้งในและนอกลิสต์นี้  
รายการด้านล่างใช้เป็นตัวอย่างหรือแนวทางเบื้องต้น:
      `;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: `${systemPrompt}\n\nผู้ใช้: ${userMessage}` }] },
            ],
          }),
        }
      );

      const data = await geminiResponse.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "ขอโทษค่ะ ฉันไม่เข้าใจ";

      await client.replyMessage(event.replyToken, {
        type: "text",
        text: aiText,
      });
    }
  }

  return NextResponse.json({ status: "ok" });
}
