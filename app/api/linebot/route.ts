import { Client } from "@line/bot-sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.events) {
    return NextResponse.json({ message: "No events" }, { status: 400 });
  }

  for (const event of body.events) {
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
