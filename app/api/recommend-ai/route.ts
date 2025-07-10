import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface MenuItem {
  _id: any;
  name: string;
  calories: number;
  image?: string;
  tags?: string[];
}

interface AIMenu {
  name: string;
  calories: number;
  image?: string;
  reason?: string;
}

export async function GET(request: NextRequest) {
  try {
    const refresh = request.nextUrl.searchParams.get('refresh') === 'true';

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    const user = await db.collection('users').findOne({}, { sort: { _id: -1 } });
    const menus: MenuItem[] = await db.collection('menus').find({}).toArray();

    if (!user || menus.length === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ใช้หรือเมนู' }, { status: 400 });
    }

    const userId = user._id.toString();

    // ✅ STEP 1: ใช้แคชถ้ายังไม่กด refresh
    if (!refresh) {
      const existing = await db.collection('recommendations').findOne({ userId });
      if (existing && Array.isArray(existing.recommendedMenus)) {
        return NextResponse.json({ recommendedMenus: existing.recommendedMenus });
      }
    }

    // ✅ STEP 2: สร้าง prompt เพื่อส่งให้ Gemini
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
    const parsedMenus: AIMenu[] = JSON.parse(jsonStr);

    const menuMap = Object.fromEntries(
      menus.map((m: MenuItem) => [m.name.trim(), m])
    );

    const recommendedMenus = parsedMenus.map((aiMenu: AIMenu) => {
      const matched = menuMap[aiMenu.name.trim()];
      return {
        _id: matched?._id?.toString() || 'undefined',
        name: aiMenu.name,
        calories: aiMenu.calories,
        image: matched?.image || '/default.png',
        reason: aiMenu.reason || '',
      };
    }).filter((m) => m._id !== 'undefined');

    // ✅ STEP 3: บันทึกผลลัพธ์ใหม่ลง MongoDB
    await db.collection('recommendations').insertOne({
      userId,
      recommendedMenus,
      createdAt: new Date(),
    });

    return NextResponse.json({ recommendedMenus });
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'AI ประมวลผลล้มเหลว' }, { status: 500 });
  }
}