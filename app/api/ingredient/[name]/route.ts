// app/api/ingredient/[name]/route.ts
import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  const { name } = params;

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    const ingredient = await db.collection('ingredients').findOne({ name });

    if (!ingredient) {
      return NextResponse.json({ error: 'ไม่พบวัตถุดิบ' }, { status: 404 });
    }

    return NextResponse.json(ingredient);
  } catch (err) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}