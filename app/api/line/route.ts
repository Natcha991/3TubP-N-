// /app/api/line/route.ts
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

// 🔹 fallback ถ้า Gemini ไม่ตอบ
function getFriendlyFallback() {
  const options = [
    "อ๋อ ผมอาจไม่แน่ใจ แต่ลองเล่าเพิ่มหน่อยครับ",
    "น่าสนใจครับ! คุณอยากให้ผมแนะนำเมนูอีกไหม?",
    "ฮ่า ๆ ผมอาจตีความไม่ถูก แต่เรามาคุยเรื่องอาหารต่อกันดีกว่า",
  ];
  return options[Math.floor(Math.random() * options.length)];
}

// 🔹 ลำดับคำถาม
const questionFlow = [
  { key: "birthday", text: "คุณเกิดวันที่เท่าไรครับ? (เช่น 15/02/2008)" },
  { key: "gender", text: "เพศของคุณคืออะไรครับ? (ชาย / หญิง / อื่น ๆ)" },
  { key: "weight", text: "น้ำหนักของคุณตอนนี้กี่กิโลกรัมครับ?" },
  { key: "height", text: "ส่วนสูงของคุณกี่เซนติเมตรครับ?" },
  { key: "goal", text: "เป้าหมายของคุณคืออะไรครับ? (ลดน้ำหนัก / เพิ่มกล้าม / รักษาสุขภาพ)" },
  { key: "condition", text: "คุณมีโรคประจำตัวหรือข้อจำกัดด้านอาหารไหมครับ?" },
  { key: "lifestyle", text: "สุดท้ายครับ ไลฟ์สไตล์ของคุณเป็นแบบไหน เช่น นั่งทำงานทั้งวัน หรือออกกำลังกายบ่อย?" },
];

export async function POST(req: NextRequest) {
  try {
    // ✅ ตรวจสอบลายเซ็นจาก LINE
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
      if (event.type !== "message" || event.message.type !== "text") continue;

      const userMessage = event.message.text.trim();
      const sourceType = event.source.type;
      const lineId = event.source.userId;

      if (!lineId) continue;

      let user = await User.findOne({ lineId });

      // ✅ ถ้าเป็น "กลุ่ม" หรือ "รูม"
      if (sourceType === "group" || sourceType === "room") {
        // ➤ ถ้าเป็นผู้ใช้ใหม่ ให้เก็บเฉพาะ lineId
        if (!user) {
          user = await User.create({
            lineId,
            conversation: [],
            awaitingName: false,
            awaitingField: null,
          });
        }

        // ➤ เก็บข้อความผู้ใช้ลงในบทสนทนา
        user.conversation.push({ role: "user", text: userMessage });
        await user.save();

        // 💬 ใช้ Gemini ตัวเดียวกับแชทส่วนตัว
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
                      text: `คุณชื่อ Mr. Rice เป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ ตอบในบริบทกลุ่ม ข้อความจากผู้ใช้: "${userMessage}"`,
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

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: replyText,
        });
        continue;
      }


      // 👇 ด้านล่างคือระบบสำหรับแชทส่วนตัว (เหมือนเดิม)
      if (!user) {
        if (userMessage === "ไม่มี") {
          user = await User.create({
            name: "ไม่มี",
            lineId,
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
            lineId,
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

      // 💬 ส่วนของการส่งข้อความไป Gemini สำหรับแชทส่วนตัว
      const recentConversation = (user.conversation || []).slice(-10);
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
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
                    text: `คุณชื่อ Mr. Rice เป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ เชี่ยวชาญเรื่องข้าวกล้อง ตอบสั้นไม่เกิน 4 บรรทัด ข้อความจากผู้ใช้: "${userMessage}"`,
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
        }
      );

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
