// app/api/ingredient/random/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    // Get limit from query params (default to 3)
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    // Use MongoDB aggregation to get random ingredients
    const randomIngredients = await db.collection('ingredients')
      .aggregate([
        { $sample: { size: limit } },
        { $project: { _id: 1, name: 1, image: 1, price: 1 } } // Only return necessary fields
      ])
      .toArray();

    return NextResponse.json(randomIngredients);
  } catch (error) {
    console.error('Error fetching random ingredients:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}