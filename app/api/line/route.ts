// /app/api/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client, WebhookEvent, TextMessage } from "@line/bot-sdk";
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
interface GeminiCandidate {
  content: GeminiContent;
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

// 🔹 ข้อความ fallback
function getFriendlyFallback(): string {
  const options = [
    "อ๋อ ผมอาจไม่แน่ใจ แต่ลองเล่าเพิ่มหน่อยครับ",
    "น่าสนใจครับ! คุณอยากให้ผมแนะนำเมนูอีกไหม?",
    "ฮ่า ๆ ผมอาจตีความไม่ถูก แต่เรามาคุยเรื่องอาหารต่อกันดีกว่า",
  ];
  return options[Math.floor(Math.random() * options.length)];
}

// 🔹 ฟังก์ชันหลัก (Webhook)
export async function POST(req: NextRequest) {
  try {
    const body: string = await req.text();
    const signature: string | null = req.headers.get("x-line-signature");
    if (!signature) return new NextResponse("Missing signature", { status: 401 });

    const hash: string = crypto
      .createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
      .update(body)
      .digest("base64");

    if (signature !== hash) return new NextResponse("Invalid signature", { status: 401 });

    await connectToDatabase();
    const parsedBody: { events: WebhookEvent[] } = JSON.parse(body);
    const events: WebhookEvent[] = parsedBody.events;

    for (const event of events) {
      if (event.type !== "message") continue;
      const message = event.message as TextMessage;
      if (message.type !== "text") continue;

      const userMessage: string = message.text.trim();
      const userId: string = event.source.userId!;
      let userDoc = await User.findOne({ lineId: userId });

      // 🆕 ผู้ใช้ใหม่ → ขอชื่อ
      if (!userDoc) {
        userDoc = await User.create({
          lineId: userId,
          awaitingField: "checkRegistered", // เริ่มด้วยถามว่าเคยลงทะเบียนหรือไม่
          conversation: [],
        });

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `ก่อนที่เราจะเริ่มกัน
ผมขอทราบหน่อยได้ไหมครับว่า
คุณเคยลงทะเบียนในเว็บแอปแล้วหรือยัง?

🔹 ถ้าเคย → พิมพ์ ชื่อเดียวกับที่ใช้ในเว็บแอป
🔹 ถ้ายังไม่เคย → พิมพ์คำว่า "ไม่เคย"`,
        });
        continue;
      }

      if (userDoc.awaitingField) {
        const field = userDoc.awaitingField;
        const value = userMessage.trim() || "ไม่มี";

        // ถ้า field คือ checkRegistered
        if (field === "checkRegistered") {
          if (value === "ไม่เคย") {
            // เริ่ม flow ถามข้อมูลส่วนตัว
            await User.updateOne({ lineId: userId }, { awaitingField: "name" });
            await client.replyMessage(event.replyToken, {
              type: "text",
              text: "โอเคครับ 😊 กรุณาพิมพ์ชื่อเล่นของคุณ",
            });
          } else {
            // user พิมพ์ชื่อที่เคยลงทะเบียน → หา user ในเว็บแอป แล้วดึงข้อมูล
            // ... (ใส่ logic สำหรับ user ที่เคยลงทะเบียน)
            await client.replyMessage(event.replyToken, {
              type: "text",
              text: `ยินดีต้อนรับกลับครับ คุณ ${value} 😊`,
            });
            await User.updateOne({ lineId: userId }, { awaitingField: null, name: value });
          }
          continue;
        }

        // mapping field ถัดไป
        const nextFields: { [key: string]: string | null } = {
          name: "birthday",
          birthday: "gender",
          gender: "height",
          height: "weight",
          weight: "goal",
          goal: "condition",
          condition: "lifestyle",
          lifestyle: null,
        };

        // update field ปัจจุบันและ awaitingField
        await User.updateOne({ lineId: userId }, { [field]: value, awaitingField: nextFields[field] || null });

        // คำถาม field ถัดไป
        const questions: { [key: string]: string } = {
          name: "กรุณาพิมพ์วันเกิดของคุณ (YYYY-MM-DD)",
          birthday: "คุณเป็นเพศอะไรครับ?",
          gender: "ส่วนสูงของคุณเท่าไหร่ครับ? (cm)",
          height: "น้ำหนักของคุณเท่าไหร่ครับ? (kg)",
          weight: "เป้าหมายด้านสุขภาพของคุณคืออะไรครับ?",
          goal: "มีเงื่อนไขสุขภาพอะไรไหมครับ? หากไม่มีให้พิมพ์ 'ไม่มี'",
          condition: "ไลฟ์สไตล์ของคุณเป็นแบบไหนครับ? เช่น นั่งทำงานทั้งวัน, ออกกำลังกายเป็นประจำ",
        };

        if (nextFields[field]) {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: questions[nextFields[field]]!,
          });
        } else {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: `ขอบคุณครับ 😊 ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลย`,
          });
        }
        continue;
      }

      // ผู้ใช้พิมพ์ชื่อของตนเอง → แสดงข้อความต้อนรับเท่านั้น
      if (userMessage === userDoc.name) {
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `ยินดีต้อนรับคุณ ${userDoc.name} กลับมาครับ 😊`,
        });
        continue;
      }

      // 🤖 หากไม่ใช่ชื่อ → ส่งไป Gemini
      const recentConversation: { role: string; text: string }[] = (userDoc.conversation || []).slice(-10);

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              ...recentConversation.map((msg) => ({ role: msg.role, parts: [{ text: msg.text }] })),
              {
                role: "user",
                parts: [
                  {
                    text: `
คุณชื่อ Mr. Rice เป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ  
เชี่ยวชาญเรื่องข้าว โดยเฉพาะข้าวกล้อง  
-ตอบสั้น กระชับ ไม่เกิน 4 บรรทัด  
-หากผู้ใช้พิมพ์ให้ แนะนำเมนู ให้เลือกเมนูที่เหมาะกับผู้ใช้จากข้อมูลของผู้ใช้ (goal, condition, lifestyle) 
และเขียนเหตุผลว่าเหมาะกับผู้ใช้เพราะอะไร และเพิ่มความสุภาพอาจจะใช้เป็นผมขอแนะนำ
-หากไม่แน่ใจให้ตอบอย่างสุภาพ ไม่พูดว่า "ไม่เข้าใจ"
- ไม่ต้องสวัสดีผู้ใช้ 
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
      const replyText: string = data.candidates?.[0]?.content.parts?.[0]?.text || getFriendlyFallback();

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