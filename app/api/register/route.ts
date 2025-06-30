// app/api/register/route.ts
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, username } = await req.json();

    if (!name || !username) {
      return NextResponse.json({ message: 'ต้องระบุชื่อและ username' }, { status: 400 });
    }

    const newUser = await User.create({ name, username });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน' }, { status: 500 });
  }
}