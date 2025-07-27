// api/menu/nearby
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Menu from '@/models/Menu';
import User from '@/models/User';

const goalToTags: Record<string, string[]> = {
  'ลดน้ำหนัก': ['แคลอรี่ต่ำ', 'ไขมันต่ำ', 'ไม่ใส่น้ำตาล', 'ต้ม', 'นึ่ง'],
  'เพิ่มกล้ามเนื้อ': ['โปรตีนสูง', 'พลังงานสูง'],
  'ควบคุมน้ำหนัก': ['แคลอรี่ต่ำ', 'สุขภาพ'],
  'ลดไขมัน': ['ไขมันต่ำ', 'ต้ม', 'นึ่ง', 'อบ'],
  'ลีน': ['โปรตีนสูง', 'ไขมันต่ำ', 'ไม่ใส่น้ำตาล'],
};

const conditionToBlockedTags: Record<string, string[]> = {
  'โรคไต': ['โซเดียมสูง', 'ถั่ว', 'โปรตีนสูง'],  // ใช้ tag "โปรตีนสูง" ตรง ๆ
  'โรคเบาหวาน': [], // ป้องกันความหวาน
  'โรคความดันโลหิตสูง': ['โซเดียมสูง'],
  'โรคหัวใจ': ['ไขมันต่ำ'], // ปรับแทน "ไขมันอิ่มตัว"
  'แพ้อาหาร': [],
  'ตั้งครรภ์': [],
  'ให้นมบุตร': [],
  'อื่นๆ': [],
};

const lifestyleToTags: Record<string, string[]> = {
  'กินง่าย อยู่ง่าย': ['ทำง่าย'],
  'แอคทีฟ': ['พลังงานสูง', 'โปรตีนสูง'],
  'สายปาร์ตี้': ['กล่องเดียวจบ', 'ทำง่าย'],
  'ติดบ้าน': ['ทำกินที่บ้าน', 'อบ', 'ต้ม'],
  'รักสุขภาพ': ['ไม่ใส่น้ำตาล', 'ไขมันต่ำ', 'สุขภาพ'],
  'กินมังสวิรัติ': ['มังสวิรัติ'],
  'กินเจ': ['วีแกน'], // ใช้แทนคำว่า "เจ"
  'ไม่ทานเนื้อสัตว์': ['วีแกน'],
  'ทำงานหนัก': ['พลังงานสูง', 'กล่องเดียวจบ'],
  'เดินทางบ่อย': ['พกพาสะดวก', 'กล่องเดียวจบ'],
};

const lifestyleToBlockedTags: Record<string, string[]> = {
  'กินมังสวิรัติ': ['หมู', 'ไก่', 'เนื้อ', 'ปลา', 'อาหารทะเล', 'กุ้ง'],
  'กินเจ': ['หมู', 'ไก่', 'เนื้อ', 'ปลา', 'อาหารทะเล', 'ไข่', 'นม', 'กุ้ง'],
  'ไม่ทานเนื้อสัตว์': ['หมู', 'ไก่', 'เนื้อ', 'ปลา', 'อาหารทะเล', 'กุ้ง'],
};

function matchMenuToUser(menuTags: string[], user: any): boolean {
  const matchedTags = new Set<string>();
  const blockedTags = new Set<string>();

  const goals = (user.goal || "").split(",").map((s: string) => s.trim());
  const conditions = (user.condition || "").split(",").map((s: string) => s.trim());
  const lifestyles = (user.lifestyle || "").split(",").map((s: string) => s.trim());

  goals.forEach((goal: string) => goalToTags[goal]?.forEach(tag => matchedTags.add(tag)));
  lifestyles.forEach((lf: string) => lifestyleToTags[lf]?.forEach(tag => matchedTags.add(tag)));

  conditions.forEach((cond: string) => conditionToBlockedTags[cond]?.forEach(tag => blockedTags.add(tag)));
  lifestyles.forEach((lf: string) => lifestyleToBlockedTags[lf]?.forEach(tag => blockedTags.add(tag)));

  const hasMatch = menuTags.some(tag => matchedTags.has(tag));
  const isBlocked = menuTags.some(tag => blockedTags.has(tag));

  if (isBlocked) {
    console.log("⛔ Blocked by tags:", menuTags.filter(tag => blockedTags.has(tag)));
  }

  return hasMatch && !isBlocked;
}



function createSeededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  const s = (h >>> 0) / 4294967295;
  return () => (s + Math.random()) % 1;
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const excludeIds = searchParams.get('excludeIds') || '';
    const seed = searchParams.get('seed') || '';

    console.log('🔍 seed:', seed);
    console.log('🧑 userId:', userId);
    console.log('🚫 excludeIds:', excludeIds);

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log("🧑‍🍳 user profile →", user); // ✅ ใส่ตรงนี้

    const excluded: string[] = excludeIds
      .split(',')
      .map(id => id.trim())
      .filter(id => !!id);

    const allMenus = await Menu.find({ _id: { $nin: excluded } }).lean();
    console.log('📦 Total candidate menus:', allMenus.length);

    const matchedMenus = allMenus.filter(menu => matchMenuToUser(menu.tags || [], user));
    console.log('✅ Matched menus after filtering by user:', matchedMenus.map(m => m.name));

    const random = seed ? createSeededRandom(seed) : () => 0.5 - Math.random();

    let brownRiceMenus = matchedMenus.filter(menu => menu.tags?.includes("ข้าวกล้อง"));
    let otherMenus = matchedMenus.filter(menu => !menu.tags?.includes("ข้าวกล้อง"));
    console.log('🍚 Brown rice menus:', brownRiceMenus.map(m => m.name));
    console.log('🍛 Other menus:', otherMenus.map(m => m.name));

    const shuffledBrownRice = brownRiceMenus.sort(() => random() - 0.5).slice(0, 2);
    const shuffledOthers = otherMenus.sort(() => random() - 0.5);

    while (shuffledBrownRice.length < 2 && shuffledOthers.length > 0) {
      const next = shuffledOthers.shift();
      if (next) shuffledBrownRice.push(next);
    }

    const finalMenus = [...shuffledBrownRice];
    while (finalMenus.length < 5 && shuffledOthers.length > 0) {
      const next = shuffledOthers.shift();
      if (next) finalMenus.push(next);
    }

    console.log('🎲 Shuffled brown rice:', shuffledBrownRice.map(m => m.name));
    console.log('🎲 Shuffled others:', shuffledOthers.map(m => m.name));
    console.log('✅ Final menus returned:', finalMenus.map(m => m.name));

    return NextResponse.json({ menus: finalMenus });
  } catch (err) {
    console.error('Error in nearby API:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
