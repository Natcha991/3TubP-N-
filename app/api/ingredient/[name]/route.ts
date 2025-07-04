// app/api/ingredient/[name]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    const ingredientName = decodeURIComponent(params.name); // 🔁 สำคัญ! แก้ชื่อให้เป็น UTF-8
    const ingredient = await db.collection('ingredients').findOne({ name: ingredientName });

    if (!ingredient) {
      return NextResponse.json({ error: 'ไม่พบวัตถุดิบ' }, { status: 404 });
    }

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}