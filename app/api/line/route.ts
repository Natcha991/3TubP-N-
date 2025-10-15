// // /app/api/line/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";
// import { Client, WebhookEvent } from "@line/bot-sdk";
// import dotenv from "dotenv";
// import { connectToDatabase } from "@/lib/mongodb";
// import User from "@/models/User";


// dotenv.config();


// const client = new Client({
//   channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
//   channelSecret: process.env.LINE_CHANNEL_SECRET!,
// });


// interface GeminiPart { text: string; }
// interface GeminiContent { role: string; parts: GeminiPart[]; }
// interface GeminiResponse { candidates?: { content: GeminiContent }[]; }


// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.text();
//     const signature = req.headers.get("x-line-signature")!;
//     const hash = crypto.createHmac("sha256", process.env.LINE_CHANNEL_SECRET!).update(body).digest("base64");
//     if (signature !== hash) return new NextResponse("Invalid signature", { status: 401 });


//     await connectToDatabase();
//     const events: WebhookEvent[] = JSON.parse(body).events;


//     for (const event of events) {
//       if (event.type !== "message" || event.message.type !== "text") continue;


//       const userMessage = event.message.text.trim();
//       const userId = event.source.userId!;


//       // 🔹 ดึงข้อมูลผู้ใช้จาก Mongo
//       const user = await User.findOne({ lineId: userId });
//       if (!user) {
//         // ผู้ใช้ใหม่ → สร้าง user + รอกรอกชื่อ
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: "สวัสดีครับ 😊 กรุณากรอกชื่อของคุณก่อน (พิมพ์ชื่อเล่นได้เลยครับ)",
//         });
//         await User.create({ lineId: userId, awaitingName: true });
//         continue;
//       }


//       // ผู้ใช้รอกรอกชื่อ

//       // 🆕 ผู้ใช้ใหม่ → รอกรอกชื่อ
//       if (user.awaitingName) {
//         const name = userMessage || "ไม่มี";

//         // อัปเดตชื่อและตั้ง awaitingName = false
//         await User.updateOne({ lineId: userId }, { name, awaitingName: false });

//         // ตอบข้อความต้อนรับผู้ใช้ใหม่
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: `ยินดีที่ได้รู้จักครับ คุณ ${name} 😊 ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
//         });

//         continue;
//       }

//       // 👤 ผู้ใช้เก่า (ชื่อมีอยู่ใน Mongo) → ต้อนรับเฉพาะตัว
//       if (!user.awaitingName && userMessage === user.name) {
//         await client.replyMessage(event.replyToken, {
//           type: "text",
//           text: `ยินดีต้อนรับคุณ ${user.name} เข้าสู่การให้บริการทางไลน์ chat bot หวังว่าจะสร้างความสะดวกสบายให้กับคุณ และขอบคุณสำหรับแรงสนับสนุนตลอดมาครับ 😊`,
//         });

//         continue;
//       }


//       // 🔹 ส่งข้อความทั่วไปไป Gemini AI
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
// หากผู้ใช้ถามเรื่องทั่วไปให้ตอบสั้น กระชับ และเข้าใจง่าย
// ข้อความจากผู้ใช้: 📌 แนวทางการพูด:
// - ตอบสั้น กระชับ ไม่เกิน 4 บรรทัดทุกคำถามและคำตอบ
// - แบ่งย่อหน้าให้อ่านง่าย
//  "${userMessage}"
// 🧠 แนวทางการตอบคำถาม:
// - หากผู้ใช้พูดถึง “สถานการณ์” เช่น ตอนเช้า, หลังออกกำลังกาย → แนะนำเมนูที่เหมาะกับสถานการณ์นั้น (ไม่จำกัดเฉพาะในลิสต์)
// - หากผู้ใช้พิมพ์ “ชื่อเมนู” → อธิบายว่าเมนูนั้นคืออะไร, ใช้วัตถุดิบอะไร, วิธีทำ, สารอาหาร, เหมาะกับใคร และถามว่า “มีตรงไหนในเมนูนี้ที่คุณยังสงสัยเพิ่มเติมไหมครับ?”
// - หากผู้ใช้ขอ “ตารางอาหาร” → จัดเมนูให้ครบ 3 มื้อ/วัน โดยสามารถใช้เมนูจากในหรือนอกลิสต์ได้
// - หากผู้ใช้เสนอ “วัตถุดิบ” เช่น มะละกอ → แนะนำเมนูที่ใช้วัตถุดิบนั้นได้อย่างอิสระ ไม่จำกัด
// - หากผู้ใช้ขอเมนูอาหารไทย, อาหคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ เหมือนเพื่อนที่คุยกันสบาย ๆ นอกจากนี้คุณยังเป็นเชี่ยวชาญในเรื่องข้าวโดยเฉพาะข้าวกล้อง ที่อยากจะใช้ข้าวกล้องในการดูแลสุขภาพ คุณเป็นแชทบอทใน LINE ที่พูดสุภาพและเป็นมิตรกับผู้ใช้
// หากผู้ใช้ถามเรื่องทั่วไปให้ตอบสั้น กระชับ และเข้าใจง่าย
// ข้อความจากผู้ใช้: 📌 แนวทางการพูด:
// - ตอบสั้น กระชับ ไม่เกิน 4 บรรทัดทุกคำถามและคำตอบ
// - แบ่งย่อหน้าให้อ่านง่ายารจีน, อาหารญี่ปุ่น ฯลฯ → แนะนำเมนูสุขภาพจากสัญชาตินั้น ๆ ได้อย่างอิสระ แม้เมนูนั้นจะไม่อยู่ในรายการด้านบน
// - หากผู้ใช้ไม่รู้จะกินอะไร → แนะนำเมนูที่ดีต่อสุขภาพ แล้วถามว่า “คุณชอบเมนูนี้มั้ยครับ?”
// - หากผู้ใช้พูดถึง “ปัญหาสุขภาพ” และต้องการคำแนะนำ → coach โดยถามย้อนกลับสั้น ๆ ให้ผู้ใช้คิดทบทวน
// -หากระหว่างการcoachมีเกี่ยวรายละเอียดเกี่ยวกับการกินคุณลองสอดแทรกข้าวกล้องตามความคิดของคุณเข้าไปด้วย
// - หากผู้ใช้ถามเกี่ยวกับผลกระทบต่อสุขภาพจากการไม่ดูแลตัวเองเช่นการอดนอนหรือการอดอาหาร  ให้คุณตอบจำนวนวันที่สามารถอดทนแบบคร่าวๆ และให้คุณอธิบายผลกระทบเบื้องต้นในแบบอ่อนโยน สุภาพ ไม่ชวนตกใจ
// - หากผู้ใช้ถามเรื่องนอกเหนือจากอาหาร, สุขภาพ, การออกกำลังกาย การนอน การไม่ดูแลสุขภาพ ผลกระทบจากการไม่ดูแลสุขภาพ และการดูแลตนเอง → ตอบว่า:
// "ขออภัยครับ ผมสามารถตอบได้เฉพาะเรื่องอาหารและสุขภาพเท่านั้นนะครับ"`,
//                   },
//                 ],
//               },
//             ],
//           }),
//         }
//       );


//       const data: GeminiResponse = await geminiResponse.json();
//       const replyText = data.candidates?.[0]?.content.parts?.[0]?.text || "ขอโทษครับ ผมไม่แน่ใจว่าคุณหมายถึงอะไรครับ";


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

      // 👋 ผู้ใช้เก่า (พิมพ์ start)
      if (!user.awaitingName && userMessage === user.name ) {
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `ยินดีต้อนรับคุณ ${user.name} เข้าสู่การให้บริการ LINE Chatbot หวังว่าจะสร้างความสะดวกสบายให้กับคุณ และขอขอบคุณสำหรับแรงสนับสนุนตลอดมาครับ 😊`,
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
                    text: `คุณชื่อ Mr. Rice และคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ เหมือนเพื่อนที่คุยกันสบาย ๆ นอกจากนี้คุณยังเป็นเชี่ยวชาญในเรื่องข้าวโดยเฉพาะข้าวกล้อง ที่อยากจะใช้ข้าวกล้องในการดูแลสุขภาพ คุณเป็นแชทบอทใน LINE ที่พูดสุภาพและเป็นมิตรกับผู้ใช้
 หากผู้ใช้ถามเรื่องทั่วไปให้ตอบสั้น กระชับ และเข้าใจง่าย
 ข้อความจากผู้ใช้: 📌 แนวทางการพูด:
- ตอบสั้น กระชับ ไม่เกิน 4 บรรทัดทุกคำถามและคำตอบ
 - แบ่งย่อหน้าให้อ่านง่าย  และไม่ต้องสวัสดีผู้ใช้ "${userMessage}"  
🧠 แนวทางการตอบคำถาม:
- หากผู้ใช้พูดถึง “สถานการณ์” เช่น ตอนเช้า, หลังออกกำลังกาย → แนะนำเมนูที่เหมาะกับสถานการณ์นั้น (ไม่จำกัดเฉพาะในลิสต์)
 - หากผู้ใช้พิมพ์ “ชื่อเมนู” → อธิบายว่าเมนูนั้นคืออะไร, ใช้วัตถุดิบอะไร, วิธีทำ, สารอาหาร, เหมาะกับใคร และถามว่า “มีตรงไหนในเมนูนี้ที่คุณยังสงสัยเพิ่มเติมไหมครับ?”
 - หากผู้ใช้ขอ “ตารางอาหาร” → จัดเมนูให้ครบ 3 มื้อ/วัน โดยสามารถใช้เมนูจากในหรือนอกลิสต์ได้
 - หากผู้ใช้เสนอ “วัตถุดิบ” เช่น มะละกอ → แนะนำเมนูที่ใช้วัตถุดิบนั้นได้อย่างอิสระ ไม่จำกัด
 - หากผู้ใช้ขอเมนูอาหารไทย, อาหคุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติ เหมือนเพื่อนที่คุยกันสบาย ๆ นอกจากนี้คุณยังเป็นเชี่ยวชาญในเรื่องข้าวโดยเฉพาะข้าวกล้อง ที่อยากจะใช้ข้าวกล้องในการดูแลสุขภาพ คุณเป็นแชทบอทใน LINE ที่พูดสุภาพและเป็นมิตรกับผู้ใช้
 หากผู้ใช้ถามเรื่องทั่วไปให้ตอบสั้น กระชับ และเข้าใจง่าย
 ข้อความจากผู้ใช้: 📌 แนวทางการพูด:
 - ตอบสั้น กระชับ ไม่เกิน 4 บรรทัดทุกคำถามและคำตอบ
- แบ่งย่อหน้าให้อ่านง่ายารจีน, อาหารญี่ปุ่น ฯลฯ → แนะนำเมนูสุขภาพจากสัญชาตินั้น ๆ ได้อย่างอิสระ แม้เมนูนั้นจะไม่อยู่ในรายการด้านบน
 - หากผู้ใช้ไม่รู้จะกินอะไร → แนะนำเมนูที่ดีต่อสุขภาพ แล้วถามว่า “คุณชอบเมนูนี้มั้ยครับ?”
 - หากผู้ใช้พูดถึง “ปัญหาสุขภาพ” และต้องการคำแนะนำ → coach โดยถามย้อนกลับสั้น ๆ ให้ผู้ใช้คิดทบทวน
 -หากระหว่างการcoachมีเกี่ยวรายละเอียดเกี่ยวกับการกินคุณลองสอดแทรกข้าวกล้องตามความคิดของคุณเข้าไปด้วย
 - หากผู้ใช้ถามเกี่ยวกับผลกระทบต่อสุขภาพจากการไม่ดูแลตัวเองเช่นการอดนอนหรือการอดอาหาร  ให้คุณตอบจำนวนวันที่สามารถอดทนแบบคร่าวๆ และให้คุณอธิบายผลกระทบเบื้องต้นในแบบอ่อนโยน สุภาพ ไม่ชวนตกใจ
 - หากผู้ใช้ถามเรื่องนอกเหนือจากอาหาร, สุขภาพ, การออกกำลังกาย การนอน การไม่ดูแลสุขภาพ ผลกระทบจากการไม่ดูแลสุขภาพ และการดูแลตนเอง → ตอบว่า:
 "ขออภัยครับ ผมสามารถตอบได้เฉพาะเรื่องอาหารและสุขภาพเท่านั้นนะครับ"`,
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
