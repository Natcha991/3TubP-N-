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

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { sessionId, chatLog } = await req.json();

    if (!sessionId || !chatLog) {
      return NextResponse.json({ message: 'Missing sessionId or chatLog' }, { status: 400 });
    }

    const savedChat = await Chat.create({ sessionId, chatLog });
    return NextResponse.json({ message: 'Saved Successfully', data: savedChat }, { status: 200 });
  } catch (error) {
    console.error('❌ Error Saving Chat:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
