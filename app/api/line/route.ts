// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";
// import { Client } from "@line/bot-sdk";
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
//     if (hash !== signature)
//       return NextResponse.json({ status: "invalid signature" }, { status: 401 });

//     // ✅ เชื่อมต่อฐานข้อมูล
//     await connectToDatabase();

//     const events = JSON.parse(body).events;

//     for (const event of events) {
//       if (event.type === "message" && event.message.type === "text") {
//         const userMessage = event.message.text.trim();
//         const userId = event.source.userId!;

//         // 🔍 ตรวจสอบว่าผู้ใช้นี้มีอยู่หรือยัง
//         let user = await User.findOne({ lineId: userId });

//         // 🆕 ผู้ใช้ใหม่ → บันทึก lineId ลง Mongo
//         if (!user) {
//           if (userMessage === "ไม่มี") {
//             user = await User.create({
//               name: "ไม่มี",
//               lineId: userId,
//               conversation: [],
//               awaitingName: false,
//             });
//             await client.replyMessage(event.replyToken, {
//               type: "text",
//               text: "ไม่เป็นไรครับ 😊 งั้นเริ่มกันใหม่ คุณช่วยบอกหน่อยว่าไลฟ์สไตล์ของคุณเป็นแบบไหน เช่น นั่งทำงานทั้งวัน หรือชอบออกกำลังกายครับ?",
//             });
//             continue;
//           } else {
//             user = await User.create({
//               name: userMessage,
//               lineId: userId,
//               conversation: [],
//               awaitingName: false,
//             });
//             await client.replyMessage(event.replyToken, {
//               type: "text",
//               text: `ยินดีที่ได้รู้จักครับคุณ ${userMessage}! คุณช่วยบอกหน่อยว่าไลฟ์สไตล์ของคุณเป็นแบบไหนครับ?`,
//             });
//             continue;
//           }
//         }

//         // 👋 ผู้ใช้เก่า (ถ้าพิมพ์ชื่อของตนเอง)
//         if (!user.awaitingName && userMessage === user.name) {
//           await client.replyMessage(event.replyToken, {
//             type: "text",
//             text: `ยินดีต้อนรับคุณ ${user.name} กลับมาครับ 😊`,
//           });
//           continue;
//         }

//         // 🧠 ดึงบทสนทนาก่อนหน้า (ไม่เกิน 10 ข้อความล่าสุด)
//         const recentConversation = (user.conversation || []).slice(-10);

//         // 🤖 ส่งไป Gemini พร้อมบริบทก่อนหน้า
//         const geminiResponse = await fetch(
//           `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               contents: [
//                 ...recentConversation.map((msg: { role: string; text: string }) => ({
//                   role: msg.role,
//                   parts: [{ text: msg.text }],
//                 })),
//                 {
//                   role: "user",
//                   parts: [
//                     {
//                       text: `
// คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ เหมือนเพื่อนที่คุยกันสบาย ๆ  
// คุณเชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง และชอบใช้ข้าวกล้องดูแลสุขภาพ  
// คุณเป็นแชทบอทใน LINE ที่พูดสุภาพและเป็นมิตรกับผู้ใช้  

// 🧠 แนวทางการตอบ:
// - ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด
// - แบ่งย่อหน้าให้อ่านง่าย  
// - ไม่ต้องสวัสดีผู้ใช้  
// - ถ้าไม่แน่ใจเกี่ยวกับข้อความผู้ใช้ ให้ตอบอย่างสุภาพและเป็นมิตร แทนที่จะบอกว่า "ไม่เข้าใจ"

// ข้อความจากผู้ใช้: "${userMessage}"
//                       `,
//                     },
//                   ],
//                 },
//               ],
//             }),
//           }
//         );

//         const data: GeminiResponse = await geminiResponse.json();
//         const replyText =
//           data.candidates?.[0]?.content.parts?.[0]?.text ||
//           getFriendlyFallback();

//         // 🗂️ อัปเดตบทสนทนาในฐานข้อมูล
//         await User.updateOne(
//           { lineId: userId },
//           {
//             $push: {
//               conversation: {
//                 $each: [
//                   { role: "user", text: userMessage },
//                   { role: "assistant", text: replyText },
//                 ],
//                 $slice: -10,
//               },
//             },
//           }
//         );

//         // 📤 ส่งข้อความกลับ LINE
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: replyText,
//         });
//       }
//     }

//     return NextResponse.json({ message: "OK" });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     return NextResponse.json({ error: String(error) }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client } from "@line/bot-sdk";
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

function getFriendlyFallback() {
  const options = [
    "อ๋อ ผมอาจไม่แน่ใจ แต่ลองเล่าเพิ่มหน่อยครับ",
    "น่าสนใจครับ! คุณอยากให้ผมแนะนำเมนูอีกไหม?",
    "ฮ่า ๆ ผมอาจตีความไม่ถูก แต่เรามาคุยเรื่องอาหารต่อกันดีกว่า",
  ];
  return options[Math.floor(Math.random() * options.length)];
}

// 🔹 คำถามแต่ละขั้นตอน
const questionFlow = [
  { key: "birthday", text: "คุณเกิดวันที่เท่าไรครับ? (เช่น 15/02/2008)" },
  { key: "gender", text: "เพศของคุณคืออะไรครับ? (ชาย / หญิง / อื่น ๆ)" },
  { key: "weight", text: "น้ำหนักของคุณตอนนี้กี่กิโลกรัมครับ?" },
  { key: "height", text: "ส่วนสูงของคุณกี่เซนติเมตรครับ?" },
  { key: "goal", text: "เป้าหมายของคุณคืออะไรครับ? (เช่น ลดน้ำหนัก เพิ่มกล้าม หรือรักษาสุขภาพ)" },
  { key: "restriction", text: "คุณมีโรคประจำตัวหรือข้อจำกัดด้านอาหารไหมครับ?" },
  { key: "lifestyle", text: "สุดท้ายครับ ไลฟ์สไตล์ของคุณเป็นแบบไหน เช่น นั่งทำงานทั้งวัน หรือออกกำลังกายบ่อย?" },
];

export async function POST(req: NextRequest) {
  try {
    // ✅ ตรวจสอบลายเซ็น
    const body = await req.text();
    const signature = req.headers.get("x-line-signature")!;
    const hash = crypto
      .createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
      .update(body)
      .digest("base64");
    if (hash !== signature)
      return NextResponse.json({ status: "invalid signature" }, { status: 401 });

    await connectToDatabase();
    const events = JSON.parse(body).events;

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const userMessage = event.message.text.trim();
        const userId = event.source.userId!;

        let user = await User.findOne({ lineId: userId });

        // 🆕 ถ้าเป็นผู้ใช้ใหม่
        if (!user) {
          if (userMessage === "ไม่มี") {
            user = await User.create({
              name: "ไม่มี",
              lineId: userId,
              conversation: [],
              awaitingField: "birthday", // เริ่มที่คำถามวันเกิด
            });
            await client.replyMessage(event.replyToken, {
              type: "text",
              text: questionFlow[0].text,
            });
            continue;
          } else {
            user = await User.create({
              name: userMessage,
              lineId: userId,
              conversation: [],
              awaitingField: "birthday",
            });
            await client.replyMessage(event.replyToken, {
              type: "text",
              text: `ยินดีที่ได้รู้จักครับคุณ ${userMessage}! ${questionFlow[0].text}`,
            });
            continue;
          }
        }

        // ✅ ถ้ามีฟิลด์ที่รอเก็บข้อมูล
        if (user.awaitingField) {
          const currentIndex = questionFlow.findIndex(
            (q) => q.key === user.awaitingField
          );
          const currentKey = questionFlow[currentIndex].key;

          // 🗂️ เก็บข้อมูลของคำตอบนี้
          (user as any)[currentKey] = userMessage;

          // 🔍 ถ้ายังมีคำถามต่อไป
          const nextQuestion = questionFlow[currentIndex + 1];
          if (nextQuestion) {
            user.awaitingField = nextQuestion.key;
            await user.save();

            await client.replyMessage(event.replyToken, {
              type: "text",
              text: nextQuestion.text,
            });
            continue;
          } else {
            // ✅ ครบทุกคำถามแล้ว
            user.awaitingField = null;
            await user.save();

            await client.replyMessage(event.replyToken, {
              type: "text",
              text: `ขอบคุณครับคุณ ${user.name} 🙏 ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้วครับ ผมจะใช้ข้อมูลนี้แนะนำเมนูให้เหมาะกับสุขภาพของคุณครับ 🍚`,
            });
            continue;
          }
        }

        // 👋 ถ้าผู้ใช้เก่าพิมพ์ชื่อของตนเอง
        if (!user.awaitingField && userMessage === user.name) {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: `ยินดีต้อนรับคุณ ${user.name} กลับมาครับ 😊`,
          });
          continue;
        }

        // 🧠 ดึงบทสนทนาก่อนหน้า
        const recentConversation = (user.conversation || []).slice(-10);

        // 🤖 ส่งข้อความไป Gemini
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
คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ  
และให้คำแนะนำด้านอาหารเหมือนเพื่อนที่คุยกันสบาย ๆ  

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
