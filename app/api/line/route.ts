// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";
// import { Client, WebhookEvent } from "@line/bot-sdk";

// const lineConfig = {
//   channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
//   channelSecret: process.env.LINE_CHANNEL_SECRET!,
// };

// const client = new Client(lineConfig);

// export async function POST(req: NextRequest) {
//   const body = await req.text();
//   const signature = req.headers.get("x-line-signature")!;
//   const hash = crypto
//     .createHmac("sha256", lineConfig.channelSecret)
//     .update(body)
//     .digest("base64");

//   if (hash !== signature) {
//     return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
//   }

//   const events = JSON.parse(body).events as WebhookEvent[];

//   for (const event of events) {
//     if (event.type === "message" && event.message.type === "text") {
//       const userMessage = event.message.text;

//       try {
//         // ✅ เรียก Gemini chatbot API ที่มีอยู่แล้ว
//         const response = await fetch(`${process.env.INTERNAL_API_BASE}api/chat`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ message: userMessage }),
//         });


//         const data = await response.json();
//         const replyText = data.reply || "ขอโทษนะ ฉันตอบไม่ได้ตอนนี้ 😅";

//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: replyText,
//         });
//       } catch (err) {
//         console.error("Gemini error:", err);
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: "❌ มีปัญหาในการเรียก Gemini API",
//         });
//       }
//     }
//   }

//   return NextResponse.json({ ok: true });
// }
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
  const signature = crypto
    .createHmac("sha256", lineConfig.channelSecret)
    .update(body)
    .digest("base64");

  const checkHeader = req.headers.get("x-line-signature");
  if (signature !== checkHeader) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  const events = JSON.parse(body).events as WebhookEvent[];

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;

      // ✅ ส่งข้อความไปให้ API chat เพื่อให้ Gemini ตอบ
      const chatRes = await fetch(
        `${process.env.INTERNAL_API_BASE}/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
        }
      );

      const chatData = await chatRes.json();
      const replyMessage = chatData.text || "❌ ไม่สามารถตอบได้ตอนนี้3";

      // ✅ ส่งข้อความตอบกลับผู้ใช้ใน LINE
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: replyMessage,
      });
    }
  }

  return NextResponse.json({ message: "ok" });
}

