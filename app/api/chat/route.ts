// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // ✅ ใช้โมเดล Gemini รุ่นใหม่
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();

    // ✅ ดึงข้อความที่ตอบกลับได้อย่างปลอดภัย
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "❌ ไม่สามารถตอบได้ตอนนี้1";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error from Gemini API:", error);
    return NextResponse.json({ text: "❌ ไม่สามารถตอบได้ตอนนี้2" });
  }
}
