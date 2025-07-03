// app/api/menu/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    const menu = await db.collection('menus').findOne({ _id: new ObjectId(id) });

    if (!menu) {
      return NextResponse.json({ error: 'ไม่พบเมนู' }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเมนู' }, { status: 500 });
  }
}