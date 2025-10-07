// import { middleware, Client, MiddlewareConfig } from "@line/bot-sdk";
// import type { NextApiRequest, NextApiResponse } from "next";

// const config: MiddlewareConfig & { channelAccessToken: string } = {
//   channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
//   channelSecret: process.env.LINE_CHANNEL_SECRET!,
// };

// const client = new Client(config);

// // 👇 ตัวฟังก์ชันหลักที่จะตอบกลับข้อความ
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).send("Method Not Allowed");
//   }

//   // 👇 ใช้ middleware แบบ async/await (เพิ่ม next)
//   await new Promise<void>((resolve, reject) => {
//     middleware(config)(req as any, res as any, (result: any) => {
//       if (result instanceof Error) reject(result);
//       else resolve();
//     });
//   });

//   const events = req.body.events;

//   for (const event of events) {
//     if (event.type === "message" && event.message.type === "text") {
//       await client.replyMessage(event.replyToken, {
//         type: "text",
//         text: `คุณพิมพ์ว่า: ${event.message.text}`,
//       });
//     }
//   }

//   res.status(200).send("OK");
// }


import { Client, middleware, MiddlewareConfig } from "@line/bot-sdk";
import { NextRequest, NextResponse } from "next/server";

const config: MiddlewareConfig & { channelAccessToken: string } = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

const client = new Client(config);

export async function POST(req: NextRequest) {
  // แปลง body เป็น JSON
  const body = await req.json();

  // เรียก middleware ของ LINE
  await new Promise<void>((resolve, reject) => {
    middleware(config)(req as any, {} as any, (err: any) => {
      if (err instanceof Error) reject(err);
      else resolve();
    });
  });

  const events = body.events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: `คุณพิมพ์ว่า: ${event.message.text}`,
      });
    }
  }

  return NextResponse.json({ status: "ok" });
}

export async function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
