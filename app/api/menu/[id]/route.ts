import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Menu from '@/models/Menu';

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = context.params;

    const menu = await Menu.findById(id);

    if (!menu) {
      return NextResponse.json({ error: 'ไม่พบเมนู' }, { status: 404 });
    }

    const nutrientsArray = menu.nutrient
      ? Object.entries(menu.nutrient).map(([label, value]) => ({ label, value }))
      : [];

    return NextResponse.json({
      id: menu._id,
      name: menu.name,
      image: menu.image || '/default.png', // รูปจาก public
      description: menu.description || '',
      tags: menu.tags || [],
      ingredients: menu.ingredients || [],
      instructions: menu.instructions || [],
      kcal: menu.calories ?? 0,
      nutrients: nutrientsArray,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเมนู' },
      { status: 500 }
    );
  }
}
