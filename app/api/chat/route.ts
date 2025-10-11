// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // เรียก Gemini API (text-bison-001)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: message,
          temperature: 0.7,
          max_output_tokens: 500
        }),
      }
    );

    const data = await res.json();
    console.log("Gemini API response:", data); // ดูโครงสร้างจริง

    // อ่านข้อความตอบกลับ
    const text = data?.candidates?.[0]?.output || "❌ ไม่สามารถตอบได้";

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Error from Gemini API:", error);
    return NextResponse.json({ reply: "❌ เกิดข้อผิดพลาดในการเรียก AI" });
  }
}
