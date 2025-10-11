// app/api/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client, WebhookEvent } from "@line/bot-sdk"; // ✅ เพิ่ม WebhookEvent เพื่อลดการใช้ any

const lineConfig = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
    channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

const client = new Client({ channelAccessToken: lineConfig.channelAccessToken });

// verify signature helper
function verifySignature(body: string, signature: string | null) {
    if (!signature) return false;
    const hash = crypto.createHmac("sha256", lineConfig.channelSecret).update(body).digest("base64");
    return hash === signature;
}

export async function POST(req: NextRequest) {
    const bodyText = await req.text();
    const signature = req.headers.get("x-line-signature");

    if (!verifySignature(bodyText, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let body;
    try {
        body = JSON.parse(bodyText);
    } catch (_err) { // ✅ เปลี่ยน e → _err เพื่อไม่ให้ ESLint เตือนว่า "ไม่ได้ใช้"
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // handle each event (message, follow, postback, etc.)
    const events = body.events || [];
    await Promise.all(events.map(handleEvent));

    return NextResponse.json({ status: "ok" });
}

// ✅ แก้ type จาก any → WebhookEvent (ของ LINE SDK)
async function handleEvent(event: WebhookEvent) {
    try {
        if (event.type === "message" && event.message.type === "text") {
            const userText: string = event.message.text;

            const sharedApiUrl = `${process.env.INTERNAL_API_BASE}/api/shared-data?query=${encodeURIComponent(userText)}`;
            const resp = await fetch(sharedApiUrl);
            const info = resp.ok ? await resp.json() : { text: "ขออภัย ไม่พบข้อมูล" };

            const replyText = info.text || `รับข้อความ: ${userText}`;
            await client.replyMessage(event.replyToken, {
                type: "text",
                text: replyText,
            });
        } else if (event.type === "follow") {
            await client.replyMessage(event.replyToken, {
                type: "text",
                text: "สวัสดี! ยินดีต้อนรับครับ/ค่ะ 😊",
            });
        } else if (event.type === "postback") {
            await client.replyMessage(event.replyToken, {
                type: "text",
                text: `คุณกด: ${JSON.stringify(event.postback)}`,
            });
        }
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
