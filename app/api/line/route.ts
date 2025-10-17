// // /app/api/line/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";
// import { Client, WebhookEvent, TextMessage } from "@line/bot-sdk";
// import dotenv from "dotenv";
// import { connectToDatabase } from "@/lib/mongodb";
// import User from "@/models/User";

// dotenv.config();

// // 🔹 สร้าง LINE client
// const client = new Client({
//   channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
//   channelSecret: process.env.LINE_CHANNEL_SECRET!,
// });

// // 🔹 โครงสร้าง Gemini Response
// interface GeminiPart {
//   text: string;
// }
// interface GeminiContent {
//   role: string;
//   parts: GeminiPart[];
// }
// interface GeminiCandidate {
//   content: GeminiContent;
// }
// interface GeminiResponse {
//   candidates?: GeminiCandidate[];
// }

// // 🔹 ข้อความ fallback
// function getFriendlyFallback(): string {
//   const options = [
//     "อ๋อ ผมอาจไม่แน่ใจ แต่ลองเล่าเพิ่มหน่อยครับ",
//     "น่าสนใจครับ! คุณอยากให้ผมแนะนำเมนูอีกไหม?",
//     "ฮ่า ๆ ผมอาจตีความไม่ถูก แต่เรามาคุยเรื่องอาหารต่อกันดีกว่า",
//   ];
//   return options[Math.floor(Math.random() * options.length)];
// }

// // 🔹 ฟังก์ชันหลัก (Webhook)
// export async function POST(req: NextRequest) {
//   try {
//     const body: string = await req.text();
//     const signature: string | null = req.headers.get("x-line-signature");
//     if (!signature) return new NextResponse("Missing signature", { status: 401 });

//     const hash: string = crypto
//       .createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
//       .update(body)
//       .digest("base64");

//     if (signature !== hash) return new NextResponse("Invalid signature", { status: 401 });

//     await connectToDatabase();
//     const parsedBody: { events: WebhookEvent[] } = JSON.parse(body);
//     const events: WebhookEvent[] = parsedBody.events;

//     for (const event of events) {
//       if (event.type !== "message") continue;
//       const message = event.message as TextMessage;
//       if (message.type !== "text") continue;

//       const userMessage: string = message.text.trim();
//       const userId: string = event.source.userId!;
//       const userDoc = await User.findOne({ lineId: userId });

//       // 🆕 ผู้ใช้ใหม่ → ขอชื่อ
//       if (!userDoc) {
//         await User.create({ lineId: userId, awaitingName: true, conversation: [] });
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: "สวัสดีครับ 😊 กรุณาพิมพ์ชื่อเล่นของคุณก่อนครับ",
//         });
//         continue;
//       }

//       // ผู้ใช้กรอกชื่อ
//       if (userDoc.awaitingName) {
//         const name: string = userMessage || "ไม่มี";
//         await User.updateOne({ lineId: userId }, { name, awaitingName: false });
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: `ยินดีที่ได้รู้จักครับ คุณ ${name} 😊 ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
//         });
//         continue;
//       }

//       // ผู้ใช้พิมพ์ชื่อของตนเอง → แสดงข้อความต้อนรับเท่านั้น
//       if (userMessage === userDoc.name) {
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: `ยินดีต้อนรับคุณ ${userDoc.name} กลับมาครับ 😊`,
//         });
//         continue;
//       }

//       // 🤖 หากไม่ใช่ชื่อ → ส่งไป Gemini
//       const recentConversation: { role: string; text: string }[] = (userDoc.conversation || []).slice(-10);

//       const geminiResponse = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [
//               ...recentConversation.map((msg) => ({ role: msg.role, parts: [{ text: msg.text }] })),
//               {
//                 role: "user",
//                 parts: [
//                   {
//                     text: `
// คุณชื่อ Mr. Rice เป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ  
// เชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง  
// -ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด  
// -หากผู้ใช้พิมพ์ให้ แนะนำเมนู ให้เลือกเมนูที่เหมาะกับผู้ใช้จากข้อมูลของผู้ใช้ (goal, condition, lifestyle) 
// และเขียนเหตุผลว่าเหมาะกับผู้ใช้เพราะอะไร
// -หากไม่แน่ใจให้ตอบอย่างสุภาพ ไม่พูดว่า "ไม่เข้าใจ"
// - ไม่ต้องสวัสดีผู้ใช้ 
// ข้อความจากผู้ใช้: "${userMessage}"
//                     `,
//                   },
//                 ],
//               },
//             ],
//           }),
//         }
//       );

//       const data: GeminiResponse = await geminiResponse.json();
//       const replyText: string = data.candidates?.[0]?.content.parts?.[0]?.text || getFriendlyFallback();

//       // 🗂️ บันทึกบทสนทนา
//       await User.updateOne(
//         { lineId: userId },
//         {
//           $push: {
//             conversation: {
//               $each: [
//                 { role: "user", text: userMessage },
//                 { role: "assistant", text: replyText },
//               ],
//               $slice: -10,
//             },
//           },
//         }
//       );

//       // 📤 ส่งกลับ
//       await client.replyMessage(event.replyToken, { type: "text", text: replyText });
//     }

//     return NextResponse.json({ message: "OK" });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     return NextResponse.json({ error: String(error) }, { status: 500 });
//   }
// }

// /app/api/line/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";
// import { Client, WebhookEvent, TextMessage } from "@line/bot-sdk";
// import dotenv from "dotenv";
// import { connectToDatabase } from "@/lib/mongodb";
// import User from "@/models/User";

// dotenv.config();

// // 🔹 สร้าง LINE client
// const client = new Client({
//   channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
//   channelSecret: process.env.LINE_CHANNEL_SECRET!,
// });

// // 🔹 โครงสร้าง Gemini Response
// interface GeminiPart { text: string }
// interface GeminiContent { role: string; parts: GeminiPart[] }
// interface GeminiCandidate { content: GeminiContent }
// interface GeminiResponse { candidates?: GeminiCandidate[] }

// // 🔹 ข้อความ fallback
// function getFriendlyFallback(): string {
//   const options = [
//     "อ๋อ ผมอาจไม่แน่ใจ แต่ลองเล่าเพิ่มหน่อยครับ",
//     "น่าสนใจครับ! คุณอยากให้ผมแนะนำเมนูอีกไหม?",
//     "ฮ่า ๆ ผมอาจตีความไม่ถูก แต่เรามาคุยเรื่องอาหารต่อกันดีกว่า",
//   ];
//   return options[Math.floor(Math.random() * options.length)];
// }

// // 🔹 ฟังก์ชันหลัก (Webhook)
// export async function POST(req: NextRequest) {
//   try {
//     const body: string = await req.text();
//     const signature: string | null = req.headers.get("x-line-signature");
//     if (!signature) return new NextResponse("Missing signature", { status: 401 });

//     const hash: string = crypto
//       .createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
//       .update(body)
//       .digest("base64");
//     if (signature !== hash) return new NextResponse("Invalid signature", { status: 401 });

//     await connectToDatabase();
//     const parsedBody: { events: WebhookEvent[] } = JSON.parse(body);
//     const events: WebhookEvent[] = parsedBody.events;

//     for (const event of events) {
//       if (event.type !== "message") continue;
//       const message = event.message as TextMessage;
//       if (message.type !== "text") continue;

//       const userMessage = message.text.trim();
//       const userId = event.source.userId!;
//       let userDoc = await User.findOne({ lineId: userId });

//       // 🆕 ผู้ใช้ใหม่ → สร้าง doc และถามว่าเคยลงทะเบียนหรือไม่
//       if (!userDoc) {
//         userDoc = await User.create({
//           lineId: userId,
//           awaitingField: "checkRegistered",
//           conversation: [],
//         });

//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: `ก่อนที่เราจะเริ่มกัน
// ผมขอทราบหน่อยได้ไหมครับว่า
// คุณเคยลงทะเบียนในเว็บแอปแล้วหรือยัง?

// 🔹 ถ้าเคย → พิมพ์ ชื่อเดียวกับที่ใช้ในเว็บแอป
// 🔹 ถ้ายังไม่เคย → พิมพ์คำว่า "ไม่เคย"`,
//         });
//         continue;
//       }

//       // 🔹 flow สำหรับ awaitingField
//       if (userDoc.awaitingField) {
//         const field = userDoc.awaitingField;
//         const value = userMessage || "ไม่มี";

//         // ถ้า field คือ checkRegistered
//         if (field === "checkRegistered") {
//           if (value === "ไม่เคย") {
//             // เริ่ม flow ถามข้อมูลส่วนตัว
//             await User.updateOne({ lineId: userId }, { awaitingField: "name" });
//             await client.replyMessage(event.replyToken, {
//               type: "text",
//               text: "โอเคครับ 😊 กรุณาพิมพ์ชื่อเล่นของคุณ",
//             });
//             continue;
//           } else {
//             // user พิมพ์ชื่อที่เคยลงทะเบียน
//             await User.updateOne({ lineId: userId }, { name: value, awaitingField: null });
//             await client.replyMessage(event.replyToken, {
//               type: "text",
//               text: `ยินดีต้อนรับกลับครับ คุณ ${value} 😊`,
//             });
//             continue;
//           }
//         }

//         // mapping field ถัดไป
//         const nextFields: { [key: string]: string | null } = {
//           name: "birthday",
//           birthday: "gender",
//           gender: "height",
//           height: "weight",
//           weight: "goal",
//           goal: "condition",
//           condition: "lifestyle",
//           lifestyle: null,
//         };

//         // คำถาม field ถัดไป
//         const questions: { [key: string]: string } = {
//           name: "กรุณาพิมพ์วันเกิดของคุณ (YYYY-MM-DD)",
//           birthday: "คุณเป็นเพศอะไรครับ?",
//           gender: "ส่วนสูงของคุณเท่าไหร่ครับ? (cm)",
//           height: "น้ำหนักของคุณเท่าไหร่ครับ? (kg)",
//           weight: "เป้าหมายด้านสุขภาพของคุณคืออะไรครับ?",
//           goal: "มีเงื่อนไขสุขภาพอะไรไหมครับ? หากไม่มีให้พิมพ์ 'ไม่มี'",
//           condition: "ไลฟ์สไตล์ของคุณเป็นแบบไหนครับ? เช่น นั่งทำงานทั้งวัน, ออกกำลังกายเป็นประจำ",
//         };

//         // อัปเดต field ปัจจุบันและ awaitingField
//         await User.updateOne(
//           { lineId: userId },
//           { [field]: value, awaitingField: nextFields[field] || null }
//         );

//         // ส่งคำถาม field ถัดไป หรือจบ flow
//         if (nextFields[field]) {
//           await client.replyMessage(event.replyToken, {
//             type: "text",
//             text: questions[nextFields[field]]!,
//           });
//         } else {
//           await client.replyMessage(event.replyToken, {
//             type: "text",
//             text: "ขอบคุณครับ 😊 ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลย",
//           });
//         }

//         continue;
//       }

//       // 🔹 ผู้ใช้พิมพ์ชื่อของตนเอง → ต้อนรับ
//       if (userMessage === userDoc.name) {
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: `ยินดีต้อนรับคุณ ${userDoc.name} กลับมาครับ 😊 ผม Mr. Rice ยินดีให้คำปรึกษาเรื่องข้าวกล้องครับ หากคุณต้องการเมนูแนะนำ หรือมีคำถามอะไร ถามผมได้เลย`,
//         });
//         continue;
//       }

//       // 🔹 ส่งข้อความไป Gemini
//       const recentConversation = (userDoc.conversation || []).slice(-10);
//       const geminiResponse = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [
//               ...recentConversation.map((msg: { role: string; text: string }) => ({
//                 role: msg.role,
//                 parts: [{ text: msg.text }],
//               })),
//               {
//                 role: "user",
//                 parts: [
//                   {
//                     text: `
// คุณชื่อ Mr. Rice เป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ  
// เชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง  
// -ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด  
// -หากผู้ใช้พิมพ์ให้ แนะนำเมนู ให้เลือกเมนูที่เหมาะกับผู้ใช้จากข้อมูลของผู้ใช้ (goal, condition, lifestyle) 
// และเขียนเหตุผลว่าเหมาะกับผู้ใช้เพราะอะไร และเพิ่มความสุภาพอาจจะใช้เป็นผมขอแนะนำ
// -หากไม่แน่ใจให้ตอบอย่างสุภาพ ไม่พูดว่า "ไม่เข้าใจ"
// - ไม่ต้องสวัสดีผู้ใช้ 
// ข้อความจากผู้ใช้: "${userMessage}"
//                     `,
//                   },
//                 ],
//               },
//             ],
//           }),
//         }
//       );

//       const data: GeminiResponse = await geminiResponse.json();
//       const replyText = data.candidates?.[0]?.content.parts?.[0]?.text || getFriendlyFallback();

//       // บันทึกบทสนทนา
//       await User.updateOne(
//         { lineId: userId },
//         {
//           $push: {
//             conversation: {
//               $each: [
//                 { role: "user", text: userMessage },
//                 { role: "assistant", text: replyText },
//               ],
//               $slice: -10,
//             },
//           },
//         }
//       );

//       // ส่งข้อความตอบกลับ
//       await client.replyMessage(event.replyToken, { type: "text", text: replyText });
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

// ===============================
// 🔹 สร้าง LINE client
// ===============================
const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

// ===============================
// 🔹 สร้าง interface สำหรับโครงสร้างข้อมูลจาก Gemini
// ===============================
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
// 🔸 ฟังก์ชันหลัก POST
// ===============================
export async function POST(req: NextRequest) {
  try {
    // ===========================
    // ✅ ตรวจสอบลายเซ็น
    // ===========================
    const body = await req.text();
    const signature = req.headers.get("x-line-signature")!;
    const hash = crypto
      .createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
      .update(body)
      .digest("base64");

    if (signature !== hash) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    // ===========================
    // ✅ เชื่อมต่อฐานข้อมูล
    // ===========================
    await connectToDatabase();

    const events: WebhookEvent[] = JSON.parse(body).events;

    // ===========================
    // ✅ วนลูปจัดการ event จากผู้ใช้
    // ===========================
    for (const event of events) {
      if (event.type !== "message" || event.message.type !== "text") continue;

      const userMessage = event.message.text.trim();
      const userId = event.source.userId!;
      const user = await User.findOne({ lineId: userId });

      // ===========================
      // 🆕 ผู้ใช้ใหม่ → สร้าง user และขอชื่อ
      // ===========================
      if (!user) {
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "สวัสดีครับ 😊 กรุณากรอกชื่อของคุณก่อน (พิมพ์ชื่อเล่นได้เลยครับ)",
        });
        await User.create({ lineId: userId, awaitingName: true });
        continue;
      }

      // ===========================
      // 📝 ผู้ใช้รอกรอกชื่อ
      // ===========================
      if (user.awaitingName) {
        const name = userMessage || "ไม่มี";
        await User.updateOne({ lineId: userId }, { name, awaitingName: false });

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `ยินดีที่ได้รู้จักครับ คุณ ${name} 😊 ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
        });
        continue;
      }

      // ===========================
      // 👋 ผู้ใช้เก่า (พิมพ์ชื่อของตัวเอง)
      // ===========================
      if (!user.awaitingName && userMessage === user.name) {
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `ยินดีต้อนรับคุณ ${user.name} เข้าสู่บริการ LINE Chatbot หวังว่าจะสร้างความสะดวกสบายให้กับคุณ และขอขอบคุณสำหรับแรงสนับสนุนตลอดมาครับ 😊`,
        });
        continue;
      }

      // ===========================
      // 🤖 ส่งข้อความไปที่ Gemini
      // ===========================
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
                    text: `คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ เหมือนเพื่อนที่คุยกันสบาย ๆ คุณเชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง และชอบใช้ข้าวกล้องดูแลสุขภาพ คุณเป็นแชทบอทใน LINE ที่พูดสุภาพและเป็นมิตรกับผู้ใช้ 🧠
แนวทางการตอบ:
- ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด
- แบ่งย่อหน้าให้อ่านง่าย
- ไม่ต้องสวัสดีผู้ใช้
ข้อความจากผู้ใช้: "${userMessage}"`,
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

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
