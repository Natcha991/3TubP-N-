import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error('MONGODB_URI not set');

const ChatSchema = new mongoose.Schema({
  sessionId: String,
  chatLog: Array,
  createdAt: { type: Date, default: Date.now },
});

const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { dbName: '3tubp' });
    console.log('✅ Connected to MongoDB');
  }
}

export async function GET(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const sessionId = params.sessionId;
  if (!sessionId) {
    return NextResponse.json({ message: 'Missing sessionId' }, { status: 400 });
  }

  try {
    await connectDB();
    const chats = await Chat.find({ sessionId }).sort({ createdAt: 1 });
    return NextResponse.json(chats, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching chats:', error);
    return NextResponse.json({ message: 'Error fetching chats' }, { status: 500 });
  }
}
