// ✅ เพิ่ม goal/lifestyle/condition mapping ให้ครบตามระบบ user
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Menu from '@/models/Menu';
import User from '@/models/User';

const goalToTags: Record<string, string[]> = {
  'ลดน้ำหนัก': ['แคลอรี่ต่ำ', 'ผักเยอะ', 'ไม่ทอด', 'ไขมันต่ำ'],
  'เพิ่มกล้ามเนื้อ': ['โปรตีนสูง', 'พลังงานสูง', 'อกไก่', 'ไข่', 'ถั่ว'],
  'ควบคุมน้ำหนัก': ['สมดุล', 'พลังงานพอเหมาะ'],
  'ลดไขมัน': ['ไขมันต่ำ', 'ไม่ผัดน้ำมัน', 'ต้ม', 'ย่าง'],
  'ลีน': ['โปรตีนสูง', 'ไขมันต่ำ', 'ไม่ใส่น้ำตาล'],
};

const conditionToBlockedTags: Record<string, string[]> = {
  'โรคไต': ['โซเดียมสูง', 'ถั่ว', 'โปรตีนสูงเกินไป'],
  'โรคเบาหวาน': ['น้ำตาลสูง', 'ของหวาน'],
  'โรคความดันโลหิตสูง': ['โซเดียมสูง', 'เค็ม'],
  'โรคหัวใจ': ['ไขมันอิ่มตัว', 'คอเลสเตอรอลสูง'],
  'แพ้อาหาร': [],
  'ตั้งครรภ์': [],
  'ให้นมบุตร': [],
  'อื่นๆ': [],
};

const lifestyleToTags: Record<string, string[]> = {
  'กินง่าย อยู่ง่าย': ['เมนูทั่วไป', 'ทำง่าย'],
  'แอคทีฟ': ['พลังงานสูง', 'โปรตีนสูง'],
  'สายปาร์ตี้': ['ทำง่าย', 'เร็ว', 'กล่องเดียวจบ'],
  'ติดบ้าน': ['ทำกินที่บ้าน', 'ต้ม', 'อบ'],
  'รักสุขภาพ': ['ไม่ใส่น้ำตาล', 'ไม่ทอด', 'ออร์แกนิค'],
  'กินมังสวิรัติ': ['มังสวิรัติ'],
  'กินเจ': ['เจ'],
  'ไม่ทานเนื้อสัตว์': ['วีแกน'],
  'ทำงานหนัก': ['อิ่มนาน', 'แคลอรี่สูง'],
  'เดินทางบ่อย': ['พกพาสะดวก', 'กล่องเดียวจบ'],
};

function matchMenuToUser(menuTags: string[], user: any): boolean {
  const matchedTags = new Set<string>();
  const blockedTags = new Set<string>();

  if (goalToTags[user.goal]) {
    goalToTags[user.goal].forEach(tag => matchedTags.add(tag));
  }
  if (lifestyleToTags[user.lifestyle]) {
    lifestyleToTags[user.lifestyle].forEach(tag => matchedTags.add(tag));
  }
  if (conditionToBlockedTags[user.condition]) {
    conditionToBlockedTags[user.condition].forEach(tag => blockedTags.add(tag));
  }

  const hasMatch = menuTags.some(tag => matchedTags.has(tag));
  const isBlocked = menuTags.some(tag => blockedTags.has(tag));

  return hasMatch && !isBlocked;
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const excludeIds = searchParams.get('excludeIds') || '';

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const excluded: string[] = excludeIds
      .split(',')
      .map(id => id.trim())
      .filter(id => !!id);

    const allMenus = await Menu.find({ _id: { $nin: excluded } }).lean();
    const matchedMenus = allMenus.filter(menu => matchMenuToUser(menu.tags || [], user));

    let brownRiceMenus = matchedMenus.filter(menu => menu.tags?.includes("ข้าวกล้อง"));
    let otherMenus = matchedMenus.filter(menu => !menu.tags?.includes("ข้าวกล้อง"));

    const shuffledBrownRice = brownRiceMenus.sort(() => 0.5 - Math.random()).slice(0, 2);
    const shuffledOthers = otherMenus.sort(() => 0.5 - Math.random());

    while (shuffledBrownRice.length < 2 && shuffledOthers.length > 0) {
      const next = shuffledOthers.shift();
      if (next) shuffledBrownRice.push(next);
    }

    const finalMenus = [...shuffledBrownRice];
    while (finalMenus.length < 5 && shuffledOthers.length > 0) {
      const next = shuffledOthers.shift();
      if (next) finalMenus.push(next);
    }

    return NextResponse.json({ menus: finalMenus });
  } catch (err) {
    console.error('Error in nearby API:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
