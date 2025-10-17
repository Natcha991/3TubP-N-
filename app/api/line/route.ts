// // /app/api/line/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";
// import { Client, WebhookEvent } from "@line/bot-sdk";
// import dotenv from "dotenv";
// import { connectToDatabase } from "@/lib/mongodb";
// import User from "@/models/User";

// dotenv.config();

// // 🔹 สร้าง LINE client
// const client = new Client({
//   channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
//   channelSecret: process.env.LINE_CHANNEL_SECRET!,
// });

// // 🔹 สร้าง interface สำหรับโครงสร้างข้อมูลจาก Gemini
// interface GeminiPart {
//   text: string;
// }

// interface GeminiContent {
//   role: string;
//   parts: GeminiPart[];
// }

// interface GeminiResponse {
//   candidates?: { content: GeminiContent }[];
// }

// // ===============================
// // 🔸 ฟังก์ชันหลัก
// // ===============================
// export async function POST(req: NextRequest) {
//   try {
//     // ✅ ตรวจสอบลายเซ็น
//     const body = await req.text();
//     const signature = req.headers.get("x-line-signature")!;
//     const hash = crypto
//       .createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
//       .update(body)
//       .digest("base64");

//     if (signature !== hash) {
//       return new NextResponse("Invalid signature", { status: 401 });
//     }

//     // ✅ เชื่อมต่อฐานข้อมูล
//     await connectToDatabase();
//     const events: WebhookEvent[] = JSON.parse(body).events;

//     // ✅ วนลูปจัดการ event จากผู้ใช้
//     for (const event of events) {
//       if (event.type !== "message" || event.message.type !== "text") continue;

//       const userMessage = event.message.text.trim();
//       const userId = event.source.userId!;
//       const user = await User.findOne({ lineId: userId });

//       // 🆕 ผู้ใช้ใหม่ → สร้าง user และขอชื่อ
//       if (!user) {
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: "สวัสดีครับ 😊 กรุณากรอกชื่อของคุณก่อน (พิมพ์ชื่อเล่นได้เลยครับ)",
//         });
//         await User.create({ lineId: userId, awaitingName: true });
//         continue;
//       }

//       // 📝 ผู้ใช้รอกรอกชื่อ
//       if (user.awaitingName) {
//         const name = userMessage || "ไม่มี";
//         await User.updateOne({ lineId: userId }, { name, awaitingName: false });

//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: `ยินดีที่ได้รู้จักครับ คุณ ${name} 😊 ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
//         });
//         continue;
//       }

//       // 👋 ผู้ใช้เก่า (พิมพ์ start)
//       if (!user.awaitingName && userMessage === user.name) {
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: `ยินดีต้อนรับคุณ ${user.name} เข้าสู่การให้บริการ LINE Chatbot หวังว่าจะสร้างความสะดวกสบายให้กับคุณ และขอขอบคุณสำหรับแรงสนับสนุนตลอดมาครับ 😊`,
//         });
//         continue;
//       }

//       // 🤖 ส่งข้อความไปที่ Gemini
//       const geminiResponse = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [
//               {
//                 role: "user",
//                 parts: [
//                   {
//                     text: `คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ เหมือนเพื่อนที่คุยกันสบาย ๆ นอกจากนี้คุณยังเป็นเชี่ยวชาญในเรื่องข้าวโดยเฉพาะข้าวกล้อง ที่อยากจะใช้ข้าวกล้องในการดูแลสุขภาพ คุณเป็นแชทบอทใน LINE ที่พูดสุภาพและเป็นมิตรกับผู้ใช้
//  หากผู้ใช้ถามเรื่องทั่วไปให้ตอบสั้น กระชับ และเข้าใจง่าย
//  ข้อความจากผู้ใช้: 📌 แนวทางการพูด:
// - ตอบสั้น กระชับ ไม่เกิน 4 บรรทัดทุกคำถามและคำตอบ
//  - แบ่งย่อหน้าให้อ่านง่าย  และไม่ต้องสวัสดีผู้ใช้ "${userMessage}"  
//  - หากผู้ใช้ถามเรื่องนอกเหนือจากอาหาร, สุขภาพ, การออกกำลังกาย การนอน การไม่ดูแลสุขภาพ ผลกระทบจากการไม่ดูแลสุขภาพ และการดูแลตนเอง → ตอบว่า:
//  "ขออภัยครับ ผมสามารถตอบได้เฉพาะเรื่องอาหารและสุขภาพเท่านั้นนะครับ"`,
//                   },
//                 ],
//               },
//             ],
//           }),
//         }
//       );

//       const data: GeminiResponse = await geminiResponse.json();
//       const replyText =
//         data.candidates?.[0]?.content.parts?.[0]?.text ||
//         "ขอโทษครับ ผมไม่แน่ใจว่าคุณหมายถึงอะไรครับ";

//       client.replyMessage(event.replyToken, {
//         type: "text",
//         text: replyText,
//       }).catch(console.error);

//       User.updateOne({ lineId: userId }, { lastMessage: userMessage })
//         .catch(console.error);;
//     }

//     return NextResponse.json({ message: "OK" });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     return NextResponse.json({ error: String(error) }, { status: 500 });
//   }
// }

// /app/api/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client, WebhookEvent } from "@line/bot-sdk";
import dotenv from "dotenv";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

dotenv.config();

// 🔹 สร้าง LINE client
const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

// 🔹 สร้าง interface สำหรับโครงสร้างข้อมูลจาก Gemini
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

// ===============================
// 🔸 ฟังก์ชันหลัก
// ===============================
export async function POST(req: NextRequest) {
  try {
    // ✅ ตรวจสอบลายเซ็น
    const body = await req.text();
    const signature = req.headers.get("x-line-signature")!;
    const hash = crypto
      .createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
      .update(body)
      .digest("base64");

    if (signature !== hash) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    // ✅ เชื่อมต่อฐานข้อมูล
    await connectToDatabase();
    const events: WebhookEvent[] = JSON.parse(body).events;

    // ✅ วนลูปจัดการ event จากผู้ใช้
    for (const event of events) {
      if (event.type !== "message" || event.message.type !== "text") continue;

      const userMessage = event.message.text.trim();
      const userId = event.source.userId!;
      const user = await User.findOne({ lineId: userId });

      // 🆕 ผู้ใช้ใหม่ → สร้าง user และขอชื่อ
      if (!user) {
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "สวัสดีครับ 😊 กรุณากรอกชื่อของคุณก่อน (พิมพ์ชื่อเล่นได้เลยครับ)",
        });
        await User.create({ lineId: userId, awaitingName: true });
        continue;
      }

      // 📝 ผู้ใช้รอกรอกชื่อ
      if (user.awaitingName) {
        const name = userMessage || "ไม่มี";
        await User.updateOne({ lineId: userId }, { name, awaitingName: false });

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `ยินดีที่ได้รู้จักครับ คุณ ${name} 😊 ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
        });
        continue;
      }

      // 👋 ผู้ใช้เก่า (พิมพ์ชื่อของตัวเอง)
      if (!user.awaitingName && userMessage === user.name) {
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `ยินดีต้อนรับคุณ ${user.name} เข้าสู่บริการ LINE Chatbot ครับ 😊`,
        });
        continue;
      }

      // 🤖 ส่งข้อความไปที่ Gemini
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
คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ เหมือนเพื่อนที่คุยกันสบาย ๆ  
คุณเชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง และชอบใช้ข้าวกล้องดูแลสุขภาพ  
คุณเป็นแชทบอทใน LINE ที่พูดสุภาพและเป็นมิตรกับผู้ใช้  

🧠 แนวทางการตอบ:
- ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด
- แบ่งย่อหน้าให้อ่านง่าย  
- ไม่ต้องสวัสดีผู้ใช้  

ข้อความจากผู้ใช้: "${userMessage}"
`
                  }
                ]
              }
            ]
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

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

