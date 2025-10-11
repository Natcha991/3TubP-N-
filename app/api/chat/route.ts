// // src/app/api/chat/route.ts
// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   const { message } = await req.json();

//   const res = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: message }] }],
//       }),
//     }
//   );


//   const data = await res.json();
//   const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '❌ ไม่สามารถตอบได้';

//   return NextResponse.json({ reply: text });
// }

// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

// Type-safe interfaces สำหรับ Gemini Pro
interface GeminiContent {
  type: string;
  text: string;
}

interface GeminiMessage {
  author: string;
  content: GeminiContent[];
}

interface GeminiCandidate {
  content: GeminiContent[];
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { reply: "❌ ไม่มีข้อความส่งมา" },
        { headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateMessage?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-pro",
          messages: [
            {
              author: "user",
              content: [{ type: "text", text: message }],
            } as GeminiMessage,
          ],
        }),
      }
    );

    const data: GeminiResponse = await res.json();

    if (!res.ok) {
      console.error("Gemini API error:", data);
      return NextResponse.json(
        { reply: "❌ ไม่สามารถตอบได้" },
        { headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    // ดึงข้อความจาก response แบบ type-safe
    const text =
      data?.candidates?.[0]?.content
        ?.filter(c => c.type === "text")
        .map(c => c.text)
        .join("\n") || "❌ ไม่สามารถตอบได้";

    return NextResponse.json(
      { reply: text },
      { headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { reply: "❌ เกิดข้อผิดพลาด" },
      { headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}
