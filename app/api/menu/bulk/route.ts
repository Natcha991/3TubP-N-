import { connectToDatabase } from '@/lib/mongodb';
import Menu from '@/models/Menu';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { menus } = await req.json(); // ✅ รับแบบ { menus: [...] }

    if (!Array.isArray(menus) || menus.length === 0) {
      return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้องหรือว่างเปล่า' }, { status: 400 });
    }

    const inserted = await Menu.insertMany(menus);
    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error('POST /api/menu/bulk error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดขณะอัปโหลดเมนูจำนวนมาก' }, { status: 500 });
  }
}