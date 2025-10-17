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

// // 🔹 โครงสร้าง Gemini Response
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

// function getFriendlyFallback() {
//   const options = [
//     "อ๋อ ผมอาจไม่แน่ใจ แต่ลองเล่าเพิ่มหน่อยครับ",
//     "น่าสนใจครับ! คุณอยากให้ผมแนะนำเมนูอีกไหม?",
//     "ฮ่า ๆ ผมอาจตีความไม่ถูก แต่เรามาคุยเรื่องอาหารต่อกันดีกว่า"
//   ];
//   return options[Math.floor(Math.random() * options.length)];
// }

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

//     for (const event of events) {
//       if (event.type !== "message" || event.message.type !== "text") continue;

//       const userMessage = event.message.text.trim();
//       const userId = event.source.userId!;
//       const user = await User.findOne({ lineId: userId });

//       // 🆕 ผู้ใช้ใหม่ → ขอชื่อ
//       if (!user) {
//         await User.create({ lineId: userId, awaitingName: true, conversation: [] });
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: "สวัสดีครับ 😊 กรุณาพิมพ์ชื่อเล่นของคุณก่อนครับ",
//         });
//         continue;
//       }

//       // 📝 ผู้ใช้กรอกชื่อ
//       if (user.awaitingName) {
//         const name = userMessage || "ไม่มี";
//         await User.updateOne(
//           { lineId: userId },
//           { name, awaitingName: false }
//         );
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: `ยินดีที่ได้รู้จักครับ คุณ ${name} 😊 ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
//         });
//         continue;
//       }

//       // 👋 ผู้ใช้เก่า (ถ้าพิมพ์ชื่อของตนเอง)
//       if (!user.awaitingName && userMessage === user.name) {
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: `ยินดีต้อนรับคุณ ${user.name} กลับมาครับ 😊`,
//         });
//         continue;
//       }

//       // 🧠 ดึงบทสนทนาก่อนหน้า (ไม่เกิน 5 ข้อความล่าสุด)
//       const recentConversation = (user.conversation || []).slice(-10);

//       // 🤖 ส่งไป Gemini พร้อมบริบทก่อนหน้า
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
// คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ เหมือนเพื่อนที่คุยกันสบาย ๆ  
// คุณเชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง และชอบใช้ข้าวกล้องดูแลสุขภาพ  
// คุณเป็นแชทบอทใน LINE ที่พูดสุภาพและเป็นมิตรกับผู้ใช้  


// 🧠 แนวทางการตอบ:
// - ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด
// - แบ่งย่อหน้าให้อ่านง่าย  
// - ไม่ต้องสวัสดีผู้ใช้  
// - ถ้าไม่แน่ใจเกี่ยวกับข้อความผู้ใช้ ให้ตอบอย่างสุภาพและเป็นมิตร แทนที่จะบอกว่า "ไม่เข้าใจ"

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
//       const replyText =
//         data.candidates?.[0]?.content.parts?.[0]?.text ||
//         getFriendlyFallback();
//       // 🗂️ อัปเดตบทสนทนาในฐานข้อมูล
//       await User.updateOne(
//         { lineId: userId },
//         {
//           $push: {
//             conversation: {
//               $each: [
//                 { role: "user", text: userMessage },
//                 { role: "assistant", text: replyText },
//               ], $slice: -10
//             } // เก็บไว้สูงสุด 10 ข้อความ
//           },
//         }
//       );

//       // 📤 ส่งข้อความกลับ LINE
//       await client.replyMessage(event.replyToken, {
//         type: "text",
//         text: replyText,
//       });
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

// 🔹 โครงสร้าง Gemini Response
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

// 🔹 ข้อความ fallback ถ้า Gemini ไม่ตอบ
function getFriendlyFallback() {
  const options = [
    "อ๋อ ผมอาจไม่แน่ใจ แต่ลองเล่าเพิ่มหน่อยครับ",
    "น่าสนใจครับ! คุณอยากให้ผมแนะนำเมนูอีกไหม?",
    "ฮ่า ๆ ผมอาจตีความไม่ถูก แต่เรามาคุยเรื่องอาหารต่อกันดีกว่า",
  ];
  return options[Math.floor(Math.random() * options.length)];
}

// 🔹 ฟังก์ชันวิเคราะห์และแนะนำเมนู
function getMenuRecommendation(user: any) {
  const { goal, condition, lifestyle } = user;
  let menu = "";
  let reason = "";

  if (goal === "ลดน้ำหนัก") {
    menu = "สลัดอกไก่ไข่ต้ม";
    reason = `เป็นเมนูพลังงานต่ำและมีโปรตีนจาก "อกไก่" ที่ช่วยให้อิ่มนาน เหมาะกับเป้าหมายการลดน้ำหนักของคุณ`;
  } else if (goal === "เพิ่มกล้ามเนื้อ") {
    menu = "ข้าวกล้องกับปลาย่าง";
    reason = `มีโปรตีนจาก "ปลา" และคาร์บเชิงซ้อนจาก "ข้าวกล้อง" เหมาะกับการสร้างกล้ามเนื้อ`;
  } else {
    menu = "ข้าวผัดผักรวมมิตร";
    reason = `เป็นเมนูสมดุล ให้พลังงานและไฟเบอร์พอเหมาะ`;
  }

  if (lifestyle === "นั่งทำงานนาน") {
    reason += ` และมีไฟเบอร์สูงช่วยเรื่องระบบขับถ่ายจากการนั่งทำงานนาน`;
  } else if (lifestyle === "ออกกำลังกายบ่อย") {
    reason += ` และมีคาร์บเพียงพอสำหรับฟื้นฟูกล้ามเนื้อหลังออกกำลังกาย`;
  }

  if (condition === "เบาหวาน") {
    reason += ` โดยไม่มีน้ำตาลส่วนเกิน เหมาะกับผู้ที่ควบคุมน้ำตาลในเลือด`;
  }

  return { menu, reason };
}

// 🔹 ฟังก์ชันหลัก (Webhook)
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-line-signature")!;
    const hash = crypto
      .createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
      .update(body)
      .digest("base64");
    if (signature !== hash) return new NextResponse("Invalid signature", { status: 401 });

    await connectToDatabase();
    const events: WebhookEvent[] = JSON.parse(body).events;

    for (const event of events) {
      if (event.type !== "message" || event.message.type !== "text") continue;

      const userMessage = event.message.text.trim();
      const userId = event.source.userId!;
      const user = await User.findOne({ lineId: userId });

      // 🆕 ผู้ใช้ใหม่ → ขอชื่อ
      if (!user) {
        await User.create({ lineId: userId, awaitingName: true, conversation: [] });
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "สวัสดีครับ 😊 กรุณาพิมพ์ชื่อเล่นของคุณก่อนครับ",
        });
        continue;
      }

      // 📝 ผู้ใช้กรอกชื่อ
      if (user.awaitingName) {
        const name = userMessage || "ไม่มี";
        await User.updateOne({ lineId: userId }, { name, awaitingName: false });
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `ยินดีที่ได้รู้จักครับ คุณ ${name} 😊 ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
        });
        continue;
      }

      // ✅ ถ้าผู้ใช้พิมพ์ "ชื่อ" ของตนเอง → แสดงข้อมูลและแนะนำเมนู
      if (userMessage === user.name) {
        const { menu, reason } = getMenuRecommendation(user);

        const reply = `
👋 สวัสดีคุณ ${user.name}
🎂 วันเกิด: ${user.birthday ? new Date(user.birthday).toLocaleDateString("th-TH") : "ไม่ระบุ"}
⚧️ เพศ: ${user.gender || "ไม่ระบุ"}
📏 ส่วนสูง: ${user.height || "-"} ซม.
⚖️ น้ำหนัก: ${user.weight || "-"} กก.
🎯 เป้าหมาย: ${user.goal || "-"}
💬 สภาพร่างกาย: ${user.condition || "-"}
💡 ไลฟ์สไตล์: ${user.lifestyle || "-"}

🍽️ เมนูที่เหมาะกับคุณคือ “${menu}”
เพราะ${reason}.
        `;

        await client.replyMessage(event.replyToken, { type: "text", text: reply });
        continue;
      }

      // 🤖 หากไม่ใช่ชื่อ → ให้ Gemini ตอบปกติ
      const recentConversation = (user.conversation || []).slice(-10);

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              ...recentConversation.map((msg: { role: string; text: string }) => ({
                role: msg.role,
                parts: [{ text: msg.text }],
              })),
              {
                role: "user",
                parts: [
                  {
                    text: `
คุณชื่อ Mr. Rice เป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ  
เชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง  
ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด  
หากไม่แน่ใจให้ตอบอย่างสุภาพ ไม่พูดว่า "ไม่เข้าใจ"

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
        data.candidates?.[0]?.content.parts?.[0]?.text || getFriendlyFallback();

      // 🗂️ บันทึกบทสนทนา
      await User.updateOne(
        { lineId: userId },
        {
          $push: {
            conversation: {
              $each: [
                { role: "user", text: userMessage },
                { role: "assistant", text: replyText },
              ],
              $slice: -10,
            },
          },
        }
      );

      // 📤 ส่งกลับ
      await client.replyMessage(event.replyToken, { type: "text", text: replyText });
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
