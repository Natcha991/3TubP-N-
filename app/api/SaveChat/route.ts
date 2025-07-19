import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI!;

if (!uri) throw new Error('MONGODB_URI not set');

const ChatSchema = new mongoose.Schema({
  sessionId: String,
  chatLog: Array,
  createdAt: { type: Date, default: Date.now },
});

// ✅ ป้องกัน Mongoose model re-declare บน serverless
const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, {
      dbName: '3tubp',
    });
    console.log('✅ Connected to MongoDB');
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { sessionId, chatLog } = await req.json();

    if (!sessionId || !chatLog) {
      return NextResponse.json({ message: 'Missing sessionId or chatLog' }, { status: 400 });
    }

    const newChat = await Chat.create({ sessionId, chatLog });
    return NextResponse.json({ message: 'Saved', data: newChat });
  } catch (err) {
    console.error('❌ POST Error:', err);
    return NextResponse.json({ message: 'Error Saving Chat' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ message: 'Missing userId' }, { status: 400 });

  try {
    await connectDB();
    const chats = await Chat.find({ sessionId: userId }).sort({ createdAt: 1 });
    return NextResponse.json(chats);
  } catch (err) {
    console.error('❌ GET Error:', err);
    return NextResponse.json({ message: 'Error fetching chats' }, { status: 500 });
  }
}
