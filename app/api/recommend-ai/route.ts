///api/recommend-ai
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
const Menu = mongoose.models.Menu || mongoose.model('Menu', new mongoose.Schema({
  name: String,
  calories: Number,
  image: String,
  tags: [String],
}, { strict: false }), 'menus');
const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', new mongoose.Schema({}, { strict: false }), 'recommendations');

interface AIMenu {
  name: string;
  calories: number;
  image?: string;
  reason?: string;
}

export async function GET(request: NextRequest) {
  try {
    // ✅ เชื่อมต่อ Database
    await connectToDatabase();

    const refresh = request.nextUrl.searchParams.get('refresh') === 'true';

    const user = await User.findOne().sort({ _id: -1 });
    const menus = await Menu.find();

    if (!user || menus.length === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ใช้หรือเมนู' }, { status: 400 });
    }

    const userId = user._id.toString();

    // ✅ ดึงข้อมูลจากแคชถ้ายังไม่ refresh
    if (!refresh) {
      const existing = await Recommendation.findOne({ userId });
      if (existing?.recommendedMenus?.length) {
        return NextResponse.json({ recommendedMenus: existing.recommendedMenus });
      }
    }

    // ✅ ส่ง prompt ให้ Gemini AI
    const prompt = `
แนะนำเมนูอาหารจากข้าวกล้องที่เหมาะกับผู้ใช้รายนี้:
- เป้าหมาย: ${Array.isArray(user.goals) ? user.goals.join(', ') : user.goals || '-'}
- โรคประจำตัว: ${Array.isArray(user.conditions) ? user.conditions.join(', ') : user.conditions || '-'}
- ไลฟ์สไตล์: ${Array.isArray(user.lifestyle) ? user.lifestyle.join(', ') : user.lifestyle || '-'}

รายการเมนูทั้งหมด:
${menus.map((m, i) => `${i + 1}. ${m.name} (${m.calories} KCAL) - tags: ${m.tags?.join(', ')}`).join('\n')}

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

    const menuMap = new Map(menus.map((m) => [m.name.trim(), m]));

    const recommendedMenus = parsedMenus
      .map((aiMenu) => {
        const matched = menuMap.get(aiMenu.name.trim());
        return matched ? {
          _id: matched._id.toString(),
          name: aiMenu.name,
          calories: aiMenu.calories,
          image: matched.image || '/default.png',
          reason: aiMenu.reason || '',
        } : null;
      })
      .filter(Boolean);

    // ✅ บันทึกผลลง database
    await Recommendation.create({
      userId,
      recommendedMenus,
      createdAt: new Date(),
    });

    return NextResponse.json({ recommendedMenus });
  } catch (error: unknown) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'AI ประมวลผลล้มเหลว' }, { status: 500 });
  }
}
