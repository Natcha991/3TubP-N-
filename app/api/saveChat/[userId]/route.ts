import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI!;
const ChatSchema = new mongoose.Schema({
  sessionId: String,
  chatLog: Array,
  createdAt: { type: Date, default: Date.now },
});
const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { dbName: '3tubp' });
    console.log('✅ Connected to MongoDB');
  }
}

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const userId = params.userId;
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
