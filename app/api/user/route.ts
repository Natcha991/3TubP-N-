// app/api/user/route.ts
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connectToDatabase();
  const data = await req.json();
  const newUser = await User.create({ name: data.name });
  return NextResponse.json(newUser, { status: 201 });
}