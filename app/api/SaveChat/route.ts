// /app/api/saveChat/route.ts
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

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ message: 'Missing userId' }, { status: 400 });

  try {
    await connectToDatabase();
    const chats = await Chat.find({ sessionId: userId }).sort({ createdAt: 1 }); // เรียงตามเวลา
    return NextResponse.json(chats, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching chat history:", error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
