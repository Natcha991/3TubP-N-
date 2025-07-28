// app/api/search-menu/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Menu from '@/models/Menu';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';

    // ใช้ mongoose model แทนการใช้ db.collection
    const menus = await Menu.find({
      name: { $regex: query, $options: 'i' }, // ค้นหาแบบไม่สนตัวพิมพ์เล็ก/ใหญ่
    })

    return NextResponse.json({ menus });
  } catch (error) {
    console.error('SearchMenu API error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}