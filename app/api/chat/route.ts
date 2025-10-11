// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ reply: '❌ ไม่มีข้อความส่งมา' }, { status: 400 });
    }

    // เรียก Gemini Pro API
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await res.json();

    // Log response เพื่อ debug
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    // ตรวจสอบ response และ fallback
    let text = '❌ ไม่สามารถตอบได้ตอนนี้';
    if (res.ok && data?.candidates?.length > 0) {
      const firstCandidate = data.candidates[0];
      const partText = firstCandidate?.content?.[0]?.parts?.[0]?.text;
      if (partText && partText.trim() !== '') text = partText;
    } else {
      console.error('Error from Gemini API:', data);
    }

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error('❌ Exception in /api/chat:', err);
    return NextResponse.json({ reply: '❌ เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' });
  }
}
