import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client, WebhookEvent } from "@line/bot-sdk";

// ✅ LINE Configuration
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

const client = new Client(lineConfig);

// ✅ Type ของ Gemini API
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
    // ตรวจสอบ signature ของ LINE
    const body = await req.text();
    const signature = req.headers.get("x-line-signature")!;
    const hash = crypto
      .createHmac("sha256", lineConfig.channelSecret)
      .update(body)
      .digest("base64");

    if (signature !== hash) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const events: WebhookEvent[] = JSON.parse(body).events;

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const userMessage = event.message.text;

        // ✅ เรียก Gemini API
        const geminiResponse = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
            process.env.NEXT_PUBLIC_GEMINI_API_KEY,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `
คุณเป็นแชทบอทใน LINE ที่พูดสุภาพและเป็นมิตรกับผู้ใช้
หากผู้ใช้ถามเรื่องทั่วไปให้ตอบสั้น กระชับ และเข้าใจง่าย
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
          "ขอโทษค่ะ ฉันไม่เข้าใจค่ะ";

        // ✅ ตอบกลับไปยัง LINE
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: replyText,
        });
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
