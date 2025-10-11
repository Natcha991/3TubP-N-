// src/app/api/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client, WebhookEvent } from "@line/bot-sdk";

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

const client = new Client(lineConfig);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-line-signature") || "";

  // ตรวจสอบ signature
  const hash = crypto.createHmac("sha256", lineConfig.channelSecret)
                     .update(body)
                     .digest("base64");

  if (hash !== signature) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const events: WebhookEvent[] = JSON.parse(body).events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;

      // เรียก Google Gemini API
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }],
          }),
        }
      );

      const data = await res.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ ไม่สามารถตอบได้";

      // ส่งข้อความกลับไปยังผู้ใช้
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: replyText,
      });
    }
  }

  return NextResponse.json({ status: "ok" });
}
