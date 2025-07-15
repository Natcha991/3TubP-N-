// app/api/user/route.ts(register)

import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name } = await req.json();

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ message: 'กรุณาระบุชื่อผู้ใช้' }, { status: 400 });
    }

    const exists = await User.findOne({ name: name.trim() });
    if (exists) {
      return NextResponse.json({ message: '❌ ชื่อซ้ำ กรุณาตั้งชื่อใหม่' }, { status: 409 });
    }

    const user = await User.create({ name: name.trim() });
    return NextResponse.json(user, { status: 201 });

  } catch (error) {
    console.error('❌ POST /api/user error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในระบบเซิร์ฟเวอร์' }, { status: 500 });
  }
}