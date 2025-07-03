// app/api/recommend-ai/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '@/lib/mongodb'; // ✅ ใช้ตาม lib ของคุณ

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface MenuItem {
  name: string;
  calories: number;
  image?: string;
  tags?: string[];
}

export async function GET() {
  try {
    const mongoose = await connectToDatabase(); // ✅ เชื่อม Mongoose แล้วดึง connection
    const db = mongoose.connection.db;

    const user = await db.collection('users').findOne({}, { sort: { _id: -1 } });
    const menus: MenuItem[] = await db.collection('menus').find({}).toArray();

    if (!user || menus.length === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ใช้หรือเมนู' }, { status: 400 });
    }

    const prompt = `
แนะนำเมนูอาหารจากข้าวกล้องที่เหมาะกับผู้ใช้รายนี้:
- เป้าหมาย: ${Array.isArray(user.goals) ? user.goals.join(', ') : user.goals || '-'}
- โรคประจำตัว: ${Array.isArray(user.conditions) ? user.conditions.join(', ') : user.conditions || '-'}
- ไลฟ์สไตล์: ${Array.isArray(user.lifestyle) ? user.lifestyle.join(', ') : user.lifestyle || '-'}

รายการเมนูทั้งหมด:
${menus.map((m: MenuItem, i: number) => `${i + 1}. ${m.name} (${m.calories} KCAL) - tags: ${m.tags?.join(', ')}`).join('\n')}

กรุณาเลือกเมนูที่เหมาะสมที่สุด 3-5 รายการ และตอบกลับใน JSON:
[
  {
    "name": "ชื่อเมนู",
    "calories": 300,
    "image": "url",
    "reason": "เหตุผล"
  }
]
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    const jsonStart = responseText.indexOf('[');
    const jsonEnd = responseText.lastIndexOf(']');
    const jsonStr = responseText.slice(jsonStart, jsonEnd + 1);
    const recommendedMenus = JSON.parse(jsonStr);

    return NextResponse.json({ recommendedMenus });
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'AI ประมวลผลล้มเหลว' }, { status: 500 });
  }
}
