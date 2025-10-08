// import { Client, WebhookEvent } from "@line/bot-sdk";
// import { NextRequest, NextResponse } from "next/server";

// // กำหนดค่า client แบบปลอดภัย
// const client = new Client({
//   channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
//   channelSecret: process.env.LINE_CHANNEL_SECRET || "",
// });

// export async function POST(req: NextRequest) {
//   try {
//     const body: { events?: WebhookEvent[] } = await req.json();

//     if (!body.events) {
//       return NextResponse.json({ message: "No events" }, { status: 400 });
//     }

//     // loop event
//     for (const event of body.events) {
//       if (event.type === "message" && event.message.type === "text") {
//         try {
//           await client.replyMessage(event.replyToken, {
//             type: "text",
//             text: `คุณพิมพ์ว่า: ${event.message.text}`,
//           });
//         } catch (err) {
//           console.error("LINE API Error:", err);
//         }
//       }
//     }

//     return NextResponse.json({ status: "ok" });
//   } catch (err) {
//     console.error("Request Error:", err);
//     return NextResponse.json({ message: "Invalid request" }, { status: 400 });
//   }
// }

// export async function GET() {
//   return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
// }
