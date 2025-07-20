//app/api/ingredient/[name]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const db = await connectToDatabase();
    const ingredientName = decodeURIComponent(params.name);
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
