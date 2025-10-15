// src/app/api/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client } from "@line/bot-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

export async function POST(req: NextRequest) {
  await connectToDatabase(); // ✅ ใช้ฟังก์ชันที่คุณเขียนไว้

  const body = await req.text();
  const signature = req.headers.get("x-line-signature")!;
  const hash = crypto
    .createHmac("SHA256", process.env.LINE_CHANNEL_SECRET!)
    .update(body)
    .digest("base64");

  if (hash !== signature)
    return NextResponse.json({ status: "invalid signature" }, { status: 401 });

  const events = JSON.parse(body).events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text.trim();
      const userId = event.source.userId;

      let user = await User.findOne({ lineId: userId });

      if (!user) {
        if (userMessage === "ไม่มี") {
          user = await User.create({ name: "ไม่มี", lineId: userId });
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: "ไม่เป็นไรครับ 😊 งั้นเริ่มกันใหม่ คุณช่วยบอกหน่อยว่าไลฟ์สไตล์ของคุณเป็นแบบไหน เช่น นั่งทำงานทั้งวัน หรือชอบออกกำลังกายครับ?",
          });
        } else {
          const existingUser = await User.findOne({ name: userMessage });
          if (existingUser) {
            existingUser.lineId = userId;
            await existingUser.save();
            await client.replyMessage(event.replyToken, {
              type: "text",
              text: `สวัสดีครับคุณ ${existingUser.name}! ยินดีต้อนรับกลับครับ 😊`,
            });
          } else {
            user = await User.create({ name: userMessage, lineId: userId });
            await client.replyMessage(event.replyToken, {
              type: "text",
              text: `ยินดีที่ได้รู้จักครับคุณ ${userMessage}! คุณช่วยบอกหน่อยว่าไลฟ์สไตล์ของคุณเป็นแบบไหนครับ?`,
            });
          }
        }
      } else {
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `สวัสดีครับคุณ ${user.name}! ผมจำคุณได้จากเว็บแอปครับ 😊`,
        });
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}
