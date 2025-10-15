import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client, WebhookEvent } from "@line/bot-sdk";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

dotenv.config();

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

const client = new Client(lineConfig);

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
    await connectToDatabase();

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const userMessage = event.message.text.trim();
        const userId = event.source.userId;

        let user = await User.findOne({ lineId: userId });

        // 🧩 ถ้ายังไม่มี user → สร้างใหม่ + ถามชื่อ
        if (!user) {
          // ตรวจว่าข้อความนี้ “อาจเป็นชื่อ” ไหม
          const looksLikeName =
            /^[ก-๙a-zA-Z]{2,20}$/.test(userMessage) && !userMessage.includes(" ");

          if (looksLikeName) {
            user = new User({ lineId: userId, name: userMessage });
            await user.save();

            await client.replyMessage(event.replyToken, {
              type: "text",
              text: `ยินดีที่ได้รู้จักครับ คุณ${userMessage} 😊 วันนี้อยากให้ผมช่วยแนะนำเรื่องอะไรดีครับ?`,
            });
            continue;
          } else {
            await client.replyMessage(event.replyToken, {
              type: "text",
              text: "สวัสดีครับ ผมขอทราบชื่อของคุณก่อนนะครับ (พิมพ์ชื่อเล่นได้เลยครับ 😊)",
            });
            continue;
          }
        }

        // 🧠 ถ้ามีชื่อแล้ว → ส่งข้อความต่อให้ Gemini
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
                      text: `
คุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ
ผู้ใช้ชื่อ: ${user.name}
ข้อความจากผู้ใช้: "${userMessage}"
แนวทางการตอบ:
- ตอบสุภาพ กระชับ ไม่เกิน 4 บรรทัด
- ใช้ภาษาที่เข้าใจง่าย
- ถามกลับได้บ้างเล็กน้อยเพื่อให้ผู้ใช้รู้สึกเป็นกันเอง
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
          "ขอโทษครับ ผมไม่แน่ใจว่าคุณหมายถึงอะไรครับ";

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: replyText,
        });
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}



// src/app/api/line/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";
// import { Client } from "@line/bot-sdk";
// import { connectToDatabase } from "@/lib/connectToDatabase";
// import User from "@/models/User";

// const client = new Client({
//   channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
//   channelSecret: process.env.LINE_CHANNEL_SECRET!,
// });

// export async function POST(req: NextRequest) {
//   await connectToDatabase(); // ✅ ใช้ฟังก์ชันที่คุณเขียนไว้

//   const body = await req.text();
//   const signature = req.headers.get("x-line-signature")!;
//   const hash = crypto
//     .createHmac("SHA256", process.env.LINE_CHANNEL_SECRET!)
//     .update(body)
//     .digest("base64");

//   if (hash !== signature)
//     return NextResponse.json({ status: "invalid signature" }, { status: 401 });

//   const events = JSON.parse(body).events;

//   for (const event of events) {
//     if (event.type === "message" && event.message.type === "text") {
//       const userMessage = event.message.text.trim();
//       const userId = event.source.userId;

//       let user = await User.findOne({ lineId: userId });

//       if (!user) {
//         if (userMessage === "ไม่มี") {
//           user = await User.create({ name: "ไม่มี", lineId: userId });
//           await client.replyMessage(event.replyToken, {
//             type: "text",
//             text: "ไม่เป็นไรครับ 😊 งั้นเริ่มกันใหม่ คุณช่วยบอกหน่อยว่าไลฟ์สไตล์ของคุณเป็นแบบไหน เช่น นั่งทำงานทั้งวัน หรือชอบออกกำลังกายครับ?",
//           });
//         } else {
//           const existingUser = await User.findOne({ name: userMessage });
//           if (existingUser) {
//             existingUser.lineId = userId;
//             await existingUser.save();
//             await client.replyMessage(event.replyToken, {
//               type: "text",
//               text: `สวัสดีครับคุณ ${existingUser.name}! ยินดีต้อนรับกลับครับ 😊`,
//             });
//           } else {
//             user = await User.create({ name: userMessage, lineId: userId });
//             await client.replyMessage(event.replyToken, {
//               type: "text",
//               text: `ยินดีที่ได้รู้จักครับคุณ ${userMessage}! คุณช่วยบอกหน่อยว่าไลฟ์สไตล์ของคุณเป็นแบบไหนครับ?`,
//             });
//           }
//         }
//       } else {
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: `สวัสดีครับคุณ ${user.name}! ผมจำคุณได้จากเว็บแอปครับ 😊`,
//         });
//       }
//     }
//   }

//   return NextResponse.json({ status: "ok" });
// }
