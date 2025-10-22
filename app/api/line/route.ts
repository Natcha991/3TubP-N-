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
  { key: "condition", text: "คุณมีโรคประจำตัวหรือข้อจำกัดด้านอาหารไหมครับ?" },
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

        // ✅ ตรวจสอบว่าเป็นกลุ่มหรือไม่
        // ✅ ตรวจสอบว่าเป็นกลุ่มหรือไม่
        const isGroup = event.source.type === "group" || event.source.type === "room";
        const lineId = event.source.userId; // ✅ เก็บ userId ของคนที่พิมพ์แทน groupId

        if (!lineId) continue; // ป้องกันกรณีไม่มี id

        // ✅ ประกาศ user แค่ครั้งเดียว
        let user = await User.findOne({ lineId });

        // 🆕 ถ้าเป็น "ผู้ใช้ใหม่ในกลุ่ม" — เก็บเฉพาะ lineId ยังไม่ต้องมีชื่อ
        if (!user) {
          user = await User.create({
            lineId,
            conversation: [],
            awaitingName: false,
            awaitingField: null,
          });
          console.log(`✅ บันทึกผู้ใช้ใหม่จากกลุ่ม: ${lineId}`);
        }


        // 👥 ถ้าเป็นกลุ่ม — ส่งต่อข้อความไป Gemini ทันที
        if (isGroup) {
          const recentConversation = (user?.conversation || []).slice(-10);

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
                        text: `คุณชื่อ Mr. Rice เป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ ตอบสั้นไม่เกิน 4 บรรทัด และพูดเหมือนคุยกับหลายคนในกลุ่ม ข้อความจากกลุ่ม: "${userMessage}"`,
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

          // 🗂️ เก็บบทสนทนา
          await User.updateOne(
            { lineId },
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
            },
            { upsert: true }
          );

          await client.replyMessage(event.replyToken, {
            type: "text",
            text: replyText,
          });
          continue;
        }

        // 👇 ส่วนนี้คือโค้ดเดิมทั้งหมด (ไม่ต้องประกาศ user ซ้ำ)
        if (!user) {
          if (userMessage === "ไม่มี") {
            user = await User.create({
              name: "ไม่มี",
              lineId: event.source.userId!,
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
              lineId: event.source.userId!,
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

        if (!user.awaitingName && userMessage === user.name) {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: `ยินดีต้อนรับคุณ ${user.name} กลับมาครับ 😊`,
          });
          continue;
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
          data.candidates?.[0]?.content.parts?.[0]?.text || getFriendlyFallback();

        await User.updateOne(
          { lineId: event.source.userId! },
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
