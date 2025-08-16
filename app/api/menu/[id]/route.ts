// api/menu/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Menu from '@/models/Menu';

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = context.params;

    const menu = await Menu.findById(id).lean(); // lean() ให้ได้ plain JS object

    if (!menu) {
      return NextResponse.json({ error: 'ไม่พบเมนู' }, { status: 404 });
    }

    return NextResponse.json({
      id: menu._id,
      name: menu.name,
      image: menu.image || '/default.png',
      description: menu.description || '',
      tags: menu.tags || [],
      ingredients: menu.ingredients || [],
      instructions: menu.instructions || [],
      kcal: menu.calories || 0,
      nutrient: menu.nutrient || {
        protein: 0,
        carbohydrate: 0,
        fat: 0,
        fiber: 0,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเมนู' },
      { status: 500 }
    );
  }
}
