//app/api/user/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import View from '@/models/View';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, menuId } = body;

    if (!userId || !menuId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await connectToDatabase();
    await View.create({ userId, menuId });

    return NextResponse.json({ message: 'View recorded' });
  } catch (error) {
    console.error("❌ View error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
