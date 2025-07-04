// app/api/ingredient/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    const body = await req.json();

    if (!Array.isArray(body.ingredients)) {
      return NextResponse.json({ error: 'invalid format' }, { status: 400 });
    }

    const inserted = await db.collection('ingredients').insertMany(body.ingredients);

    return NextResponse.json({ message: 'Ingredients uploaded', insertedCount: inserted.insertedCount });
  } catch (error) {
    console.error('Bulk ingredient upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}