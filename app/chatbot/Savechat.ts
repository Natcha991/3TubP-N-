// pages/api/saveChat.ts
import { connectToDatabase } from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  from: String,
  text: String,
  timestamp: String,
}, { timestamps: true });

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end("Method Not Allowed");

  try {
    await connectToDatabase();
    const newChat = new Chat(req.body);
    await newChat.save();
    res.status(200).json({ message: "✅ บันทึกแล้ว" });
  } catch (err) {
    console.error("❌ Mongo Error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึก" });
  }
}
