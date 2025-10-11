// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message, // Gemini รุ่น text-bison ใช้ 'prompt'
          temperature: 0.7,
          max_output_tokens: 500
        })
      }
    );

    const data = await res.json();
    const text = data?.candidates?.[0]?.output || '❌ ไม่สามารถตอบได้';

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error('Error from Gemini API:', err);
    return NextResponse.json({ reply: '❌ เกิดข้อผิดพลาด AI' });
  }
}

