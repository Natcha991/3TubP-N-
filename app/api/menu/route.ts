import { connectToDatabase } from '@/lib/mongodb';
import Menu from '@/models/Menu';
import { NextResponse } from 'next/server';

// GET: ดึงเมนูทั้งหมด
export async function GET() {
  try {
    await connectToDatabase();
    const menus = await Menu.find({});
    return NextResponse.json(menus);
  } catch (error) {
    console.error('GET /api/menu error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดขณะดึงเมนู' }, { status: 500 });
  }
}

// POST: เพิ่มเมนูใหม่
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();

    // Optional: ตรวจสอบข้อมูลเบื้องต้น
    if (!data.name || !data.ingredients || !data.instructions) {
      return NextResponse.json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    const newMenu = await Menu.create(data);
    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error('POST /api/menu error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดขณะบันทึกเมนู' }, { status: 500 });
  }
}