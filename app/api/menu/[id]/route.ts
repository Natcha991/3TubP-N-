import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

import Menu from '@/models/Menu'; // สร้าง Mongoose model ให้เรียบร้อย

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = context.params;

    const menu = await Menu.findById(id);

    if (!menu) {
      return NextResponse.json({ error: 'ไม่พบเมนู' }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเมนู' }, { status: 500 });
  }
}
