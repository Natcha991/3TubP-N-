// app/api/login/route.ts

import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connectToDatabase();

  const { username } = await req.json(); // Frontend ยังส่งเป็น 'username' มา

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return NextResponse.json({ message: 'ชื่อผู้ใช้ไม่ถูกต้องหรือไม่ระบุ' }, { status: 400 });
  }

  try {
    // 🔴 แก้ไขตรงนี้: ค้นหาด้วย field 'name' แทน 'username'
    const user = await User.findOne({ name: username.trim() }); // <<< แก้ไขตรงนี้เป็น `name`

    if (!user) {
      console.log(`Login attempt failed: User '${username}' not found.`);
      return NextResponse.json({ message: 'ไม่พบชื่อผู้ใช้นี้ กรุณาตรวจสอบอีกครั้ง' }, { status: 404 });
    }

    console.log(`User '${username}' logged in successfully with ID: ${user._id}`);
    return NextResponse.json({ userId: user._id.toString() }, { status: 200 });
  } catch (error: unknown) { // ใช้ unknown และ type guard
    console.error('POST /api/login error:', error);

    let errorMessage = 'Unknown server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
      errorMessage = (error as any).message;
    }

    return NextResponse.json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', error: errorMessage }, { status: 500 });
  }
}