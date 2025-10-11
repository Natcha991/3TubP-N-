// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ reply: "❌ ไม่มีข้อความส่งมา" });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateMessage?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-pro",
          messages: [
            {
              author: "user",
              content: [{ type: "text", text: message }],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini API error:", data);
      return NextResponse.json({ reply: "❌ ไม่สามารถตอบได้" });
    }

    // อ่านข้อความจาก response
    const text =
      data?.candidates?.[0]?.content
        ?.map((c: any) => c.text)
        .join("\n") || "❌ ไม่สามารถตอบได้";

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ reply: "❌ เกิดข้อผิดพลาด" });
  }
}
