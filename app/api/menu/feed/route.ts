//app/api/menu/feed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import View from '@/models/View';
import Menu from '@/models/Menu';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const views = await View.find({ userId }).sort({ viewedAt: -1 }).limit(10);
    const viewedIds = views.map((v) => v.menuId);

    const recommended = await Menu.find({
      name: { $regex: 'ข้าวกล้อง', $options: 'i' },
      _id: { $nin: viewedIds },
    }).limit(5);

    return NextResponse.json(recommended);
  } catch (error) {
    console.error("❌ Feed error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
