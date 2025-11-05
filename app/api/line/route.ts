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
//     "ฮ่า ๆ ผมอาจตีความไม่ถูก แต่เรามาคุยเรื่องอาหารต่อกันดีกว่า",
//   ];
//   return options[Math.floor(Math.random() * options.length)];
// }

// // 🔹 คำถามแต่ละขั้นตอน
// const questionFlow = [
//   { key: "birthday", text: "คุณเกิดวันที่เท่าไรครับ? (เช่น 15/02/2008)" },
//   { key: "gender", text: "เพศของคุณคืออะไรครับ? (ชาย / หญิง / อื่น ๆ)" },
//   { key: "weight", text: "น้ำหนักของคุณตอนนี้กี่กิโลกรัมครับ?" },
//   { key: "height", text: "ส่วนสูงของคุณกี่เซนติเมตรครับ?" },
//   { key: "goal", text: "เป้าหมายของคุณคืออะไรครับ? (เช่น ลดน้ำหนัก เพิ่มกล้าม หรือรักษาสุขภาพ)" },
//   { key: "condition", text: "คุณมีโรคประจำตัวหรือข้อจำกัดด้านอาหารไหมครับ?" },
//   { key: "lifestyle", text: "สุดท้ายครับ ไลฟ์สไตล์ของคุณเป็นแบบไหน เช่น นั่งทำงานทั้งวัน หรือออกกำลังกายบ่อย?" },
// ];

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

//     await connectToDatabase();
//     const events = JSON.parse(body).events;

//     for (const event of events) {
//       if (event.type === "message" && event.message.type === "text") {
//         const userMessage = event.message.text.trim();
//         const userId = event.source.userId!;
//         const isGroupChat = event.source.type === "group"; // 🔹 ตรวจสอบว่ากลุ่มหรือไม่
//         let user = await User.findOne({ lineId: userId });

//         // 🆕 ถ้าอยู่ในกลุ่ม
//         if (isGroupChat) {
//           if (!user && isGroupChat) {
//             // 🔹 นับจำนวน Guest เดิมใน MongoDB
//             const guestCount = await User.countDocuments({ name: /^Guest/ });
//             const guestName = `Guest${guestCount + 1}`; // สร้างชื่อ Guest ใหม่ไม่ซ้ำ

//             // ➕ สร้าง user ใหม่ พร้อม conversation ว่าง
//             user = await User.create({
//               lineId: userId,
//               name: guestName,
//               awaitingName: false, // ไม่รอชื่อในกลุ่ม
//               conversation: [],    // เก็บข้อความต่อเนื่อง
//               awaitingField: null,
//             });
//           }

//           // 🧠 ดึงบทสนทนาก่อนหน้า (ล่าสุด 10 ข้อความ)
//           const recentConversation = (user.conversation || []).slice(-10);

//           // 🤖 ส่งไป Gemini
//           const geminiResponse = await fetch(
//             `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
//             {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 contents: [
//                   ...recentConversation.map((msg: { role: string; text: string }) => ({
//                     role: msg.role,
//                     parts: [{ text: msg.text }],
//                   })),
//                   {
//                     role: "user",
//                     parts: [
//                       {
//                         text: `คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ คุณเชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด - ไม่ต้องสวัสดีผู้ใช้ ข้อความจากผู้ใช้: "${userMessage}"`,
//                       },
//                     ],
//                   },
//                 ],
//               }),
//             }
//           );

//           const data: GeminiResponse = await geminiResponse.json();
//           const replyText =
//             data.candidates?.[0]?.content.parts?.[0]?.text || getFriendlyFallback();

//           // 🗂️ อัปเดตบทสนทนา (push ข้อความ user + assistant)
//           await User.updateOne(
//             { lineId: userId },
//             {
//               $push: {
//                 conversation: {
//                   $each: [
//                     { role: "user", text: userMessage },
//                     { role: "assistant", text: replyText },
//                   ],
//                   $slice: -10, // เก็บแค่ 10 ข้อความล่าสุด
//                 },
//               },
//             }
//           );

//           // 📤 ส่งกลับ LINE
//           await client.replyMessage(event.replyToken, {
//             type: "text",
//             text: replyText,
//           });

//           continue; // ✅ จบขั้นตอนสำหรับกลุ่ม
//         }

//         // 🆕 ผู้ใช้ส่วนตัว (Private chat) → ใช้โค้ดเดิมทั้งหมด
//         if (!user) {

//           if (userMessage === "ไม่มี") {
//             user = await User.create({
//               name: "ไม่มี",
//               lineId: userId,
//               conversation: [],
//               awaitingName: true,
//               awaitingField: null,
//             });

//             await client.replyMessage(event.replyToken, {
//               type: "text",
//               text: "สวัสดีครับ ผมชื่อ MR.Rice คุณชื่ออะไรครับ?",
//             });
//             continue;
//           } else {
//             user = await User.create({
//               name: userMessage,
//               lineId: userId,
//               conversation: [],
//               awaitingName: false,
//               awaitingField: "birthday",
//             });

//             await client.replyMessage(event.replyToken, {
//               type: "text",
//               text: `ยินดีที่ได้รู้จักครับคุณ ${userMessage}! 🎉\n${questionFlow[0].text}`,
//             });
//             continue;
//           }
//         }

//         // 👤 ถ้ายังรอชื่อ
//         if (user.awaitingName) {
//           user.name = userMessage;
//           user.awaitingName = false;
//           user.awaitingField = "birthday";
//           await user.save();

//           await client.replyMessage(event.replyToken, {
//             type: "text",
//             text: `ยินดีที่ได้รู้จักครับคุณ ${userMessage}! 🎉\n${questionFlow[0].text}`,
//           });
//           continue;
//         }

//         // 📋 ถ้ามี field ที่รอคำตอบ
//         if (user.awaitingField) {
//           const currentField = user.awaitingField;
//           user[currentField] = userMessage;

//           const currentIndex = questionFlow.findIndex(q => q.key === currentField);
//           const nextQuestion = questionFlow[currentIndex + 1];

//           if (nextQuestion) {
//             user.awaitingField = nextQuestion.key;
//             await user.save();

//             await client.replyMessage(event.replyToken, {
//               type: "text",
//               text: nextQuestion.text,
//             });
//           } else {
//             user.awaitingField = null;
//             await user.save();

//             await client.replyMessage(event.replyToken, {
//               type: "text",
//               text: `ขอบคุณครับคุณ ${user.name}! 🙏 ผมบันทึกข้อมูลของคุณเรียบร้อยแล้วครับ พร้อมแนะนำเมนูสุขภาพให้แล้วนะครับ 🍚`,
//             });
//           }
//           continue;
//         }

//         // 👋 ผู้ใช้เก่า (พิมพ์ชื่อของตนเอง)
//         if (!user.awaitingName && userMessage === user.name) {
//           await client.replyMessage(event.replyToken, {
//             type: "text",
//             text: `ยินดีต้อนรับคุณ ${user.name} กลับมาครับ 😊`,
//           });
//           continue;
//         }

//         // 🧠 ดึงบทสนทนาก่อนหน้า
//         const recentConversation = (user.conversation || []).slice(-10);

//         // 🤖 ส่งไป Gemini
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
//                       text: `คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ คุณเชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด - ไม่ต้องสวัสดีผู้ใช้ ข้อความจากผู้ใช้: "${userMessage}"`,
//                     },
//                   ],
//                 },
//               ],
//             }),
//           }
//         );

//         const data: GeminiResponse = await geminiResponse.json();
//         const replyText =
//           data.candidates?.[0]?.content.parts?.[0]?.text || getFriendlyFallback();

//         // 🗂️ อัปเดตบทสนทนา
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

//         // 📤 ส่งกลับ LINE
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

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

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

function getFriendlyFallback(): string {
  const options: string[] = [
    "อ๋อ ผมอาจไม่แน่ใจ แต่ลองเล่าเพิ่มหน่อยครับ",
    "น่าสนใจครับ! คุณอยากให้ผมแนะนำเมนูอีกไหม?",
    "ฮ่า ๆ ผมอาจตีความไม่ถูก แต่เรามาคุยเรื่องอาหารต่อกันดีกว่า",
  ];
  return options[Math.floor(Math.random() * options.length)];
}

const questionFlow: { key: string; text: string }[] = [
  { key: "birthday", text: "คุณเกิดวันที่เท่าไรครับ? (เช่น 15/02/2008)" },
  { key: "gender", text: "เพศของคุณคืออะไรครับ? (ชาย / หญิง / อื่น ๆ)" },
  { key: "weight", text: "น้ำหนักของคุณตอนนี้กี่กิโลกรัมครับ?" },
  { key: "height", text: "ส่วนสูงของคุณกี่เซนติเมตรครับ?" },
  { key: "goal", text: "เป้าหมายของคุณคืออะไรครับ? (เช่น ลดน้ำหนัก เพิ่มกล้าม หรือรักษาสุขภาพ)" },
  { key: "condition", text: "คุณมีโรคประจำตัวหรือข้อจำกัดด้านอาหารไหมครับ?" },
  { key: "lifestyle", text: "สุดท้ายครับ ไลฟ์สไตล์ของคุณเป็นแบบไหน เช่น นั่งทำงานทั้งวัน หรือออกกำลังกายบ่อย?" },
];

export async function POST(req: NextRequest) {
  try {
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

    async function isNutritionRelated(message: string): Promise<boolean> {
      const prompt = `
  ให้คุณวิเคราะห์ว่า ข้อความนี้เกี่ยวข้องกับเรื่องโภชนาการ อาหาร ข้าว สุขภาพ หรือ คำทักทาย ไหม
  ตอบแค่ "ใช่" หรือ "ไม่" เท่านั้น
  ข้อความ: "${message}"
  `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      return replyText?.includes("ใช่");
    }


    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const userMessage = event.message.text.trim();
        const userId = event.source.userId!;
        const isGroupChat = event.source.type === "group";
        let user = await User.findOne({ lineId: userId });

        // ✅ ถ้าเป็นแชทส่วนตัว และผู้ใช้มีชื่อขึ้นต้นด้วย Guest → ให้เปลี่ยนชื่อได้
        if (!isGroupChat && user && /^Guest/i.test(user.name)) {
          user.name = userMessage;
          user.awaitingName = false;
          user.awaitingField = "birthday";
          await user.save();

          await client.replyMessage(event.replyToken, {
            type: "text",
            text: `ยินดีที่ได้รู้จักครับคุณ ${userMessage}! 🎉\n${questionFlow[0].text}`,
          });
          continue;
        }

        // 🆕 ถ้าอยู่ในกลุ่ม
        if (isGroupChat) {
          if (!user) {
            const guestCount = await User.countDocuments({ name: /^Guest/ });
            const guestName = `Guest${guestCount + 1}`;
            user = await User.create({
              lineId: userId,
              name: guestName,
              awaitingName: false,
              conversation: [],
              awaitingField: null,
            });
          }

          // 🔹 ตรวจสอบว่าเกี่ยวข้องกับโภชนาการไหม (ด้วย Gemini)
          const isNutritionTopic = await isNutritionRelated(userMessage);

          if (!isNutritionTopic) {
            continue; // ❌ ข้ามข้อความที่ไม่เกี่ยวข้อง
          }

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
                        text: `คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ คุณเชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด - ไม่ต้องสวัสดีผู้ใช้ ข้อความจากผู้ใช้: "${userMessage}"`,
                      },
                    ],
                  },
                ],
              }),
            }
          );

          const data: GeminiResponse = await geminiResponse.json();
          const replyText =
            data.candidates?.[0]?.content.parts?.[0]?.text;

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
            text: replyText || "เรื่องนี้ผมอาจไม่ถนัดครับ 😊 ถ้าอยากคุยเรื่องอาหารสุขภาพ ผมยินดีเลย!",
          });


          continue;
        }

        // 🧍‍♂️ ผู้ใช้ใหม่ (ส่วนตัว)
        if (!user) {
          if (userMessage === "ไม่มี") {
            user = await User.create({
              name: "ไม่มี",
              lineId: userId,
              conversation: [],
              awaitingName: true,
              awaitingField: null,
            });

            await client.replyMessage(event.replyToken, {
              type: "text",
              text: "สวัสดีครับ ผมชื่อ MR.Rice คุณชื่ออะไรครับ?",
            });
            continue;
          } else {
            user = await User.create({
              name: userMessage,
              lineId: userId,
              conversation: [],
              awaitingName: false,
              awaitingField: "birthday",
            });

            await client.replyMessage(event.replyToken, {
              type: "text",
              text: `ยินดีที่ได้รู้จักครับคุณ ${userMessage}! 🎉\n${questionFlow[0].text}`,
            });
            continue;
          }
        }

        // 👤 ถ้ายังรอชื่อ
        if (user.awaitingName) {
          user.name = userMessage;
          user.awaitingName = false;
          user.awaitingField = "birthday";
          await user.save();

          await client.replyMessage(event.replyToken, {
            type: "text",
            text: `ยินดีที่ได้รู้จักครับคุณ ${userMessage}! 🎉\n${questionFlow[0].text}`,
          });
          continue;
        }

        // 📋 ถ้ามี field ที่รอคำตอบ
        if (user.awaitingField) {
          const currentField = user.awaitingField;
          user[currentField] = userMessage;

          const currentIndex = questionFlow.findIndex(q => q.key === currentField);
          const nextQuestion = questionFlow[currentIndex + 1];

          if (nextQuestion) {
            user.awaitingField = nextQuestion.key;
            await user.save();

            await client.replyMessage(event.replyToken, {
              type: "text",
              text: nextQuestion.text,
            });
          } else {
            user.awaitingField = null;
            await user.save();

            await client.replyMessage(event.replyToken, {
              type: "text",
              text: `ขอบคุณครับคุณ ${user.name}! 🙏 ผมบันทึกข้อมูลของคุณเรียบร้อยแล้วครับ พร้อมแนะนำเมนูสุขภาพให้แล้วนะครับ 🍚`,
            });
          }
          continue;
        }

        // 👋 ผู้ใช้เก่าทักมาอีกครั้ง
        if (!user.awaitingName && userMessage === user.name) {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: `ยินดีต้อนรับคุณ ${user.name} กลับมาครับ 😊`,
          });
          continue;
        }

        // 🤖 คุยกับ Gemini ต่อ
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
                      คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี 
                      อ่อนโยน สุภาพ คุณเชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง 
                      ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด 
                      - ไม่ต้องสวัสดีผู้ใช้ ข้อความจากผู้ใช้: "${userMessage}"`,
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
