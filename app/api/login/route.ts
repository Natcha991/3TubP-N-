// app/api/login/route.ts

import { connectToDatabase } from '@/lib/mongodb';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import User from '@/models/User';
=======
import { User} from '@/models/User';
>>>>>>> Stashed changes
=======
import { User} from '@/models/User';
>>>>>>> Stashed changes
=======
import { User} from '@/models/User';
>>>>>>> Stashed changes
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name } = await req.json();

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ message: 'กรุณาระบุชื่อผู้ใช้' }, { status: 400 });
    }

    const user = await User.findOne({ name: name.trim() });

    if (!user) {
      return NextResponse.json({ message: '❌ ไม่พบชื่อผู้ใช้นี้ในระบบ' }, { status: 404 });
    }

    return NextResponse.json({ userId: user._id.toString() }, { status: 200 });

  } catch (error) {
    console.error('❌ POST /api/login error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในระบบเซิร์ฟเวอร์' }, { status: 500 });
  }
}