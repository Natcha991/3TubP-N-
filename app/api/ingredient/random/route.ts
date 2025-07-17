// app/api/ingredient/random/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Ingredient from '@/models/Ingredient';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase(); // ✅ แค่ connect
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    const randomIngredients = await Ingredient.aggregate([
      { $sample: { size: limit } },
      { $project: { _id: 1, name: 1, image: 1, price: 1 } }
    ]);

    return NextResponse.json(randomIngredients);
  } catch (error) {
    console.error('Error fetching random ingredients:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}
