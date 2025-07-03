// src/app/api/saveChat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; // แก้ path ตามโปรเจกต์คุณ
import Chat from '@/models/Chat'; // แก้ path ตามจริง

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { sessionId, chatLog } = await req.json();

    if (!sessionId || !chatLog) {
      return NextResponse.json({ message: 'Missing sessionId or chatLog' }, { status: 400 });
    }

    const newChat = await Chat.create({
      sessionId,
      chatLog,
      createdAt: new Date()
    });

    return NextResponse.json({ message: 'Saved successfully', data: newChat }, { status: 200 });
  } catch (error) {
    console.error("❌ SaveChat API Error:", error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
