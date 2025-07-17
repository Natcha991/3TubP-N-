// app/api/register/route.ts

import { connectToDatabase } from '@/lib/mongodb';

import User from '@/models/User';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connectToDatabase();

  const { name, birthday, gender, weight, height, goal, condition, lifestyle } = await req.json();

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ message: 'กรุณาระบุชื่อผู้ใช้' }, { status: 400 });
  }

  try {
    const existingUser = await User.findOne({ name: name.trim() });

    if (existingUser) {
      return NextResponse.json({ message: 'ชื่อผู้ใช้มีคนใช้แล้ว กรุณาเลือกชื่อใหม่' }, { status: 409 });
    }

    const newUser = await User.create({
      name: name.trim(),
      birthday,
      gender,
      weight,
      height,
      goal,
      condition,
      lifestyle,
    });

    return NextResponse.json({ message: 'สมัครสมาชิกสำเร็จ', userId: newUser._id.toString() }, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /api/register error:', error);

    let errorMessage = 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์';
    if (error instanceof Error) errorMessage = error.message;

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}