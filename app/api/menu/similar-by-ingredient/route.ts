// File: app/api/menu/similar-by-ingredient/route.ts
import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url!).searchParams;
    const id = searchParams.get('id');
    if (!id) return new Response("Missing id", { status: 400 });

    const db = await connectToDatabase();
    const currentMenu = await db.collection('menus').findOne({ _id: new ObjectId(id) });
    if (!currentMenu) return new Response("Menu not found", { status: 404 });

    const rawIngredients = currentMenu.ingredients;
    if (!rawIngredients) return new Response("No ingredients found", { status: 404 });

    const currentIngredients = Array.isArray(rawIngredients)
      ? rawIngredients
      : [rawIngredients];

    if (currentIngredients.length === 0) {
      return new Response("No ingredients found", { status: 404 });
    }

    // โหลดเมนูทั้งหมดจากไฟล์ JSON
    const jsonPath = path.join(process.cwd(), 'data', '100_random_thai_menus.json');
    const fileData = await fs.readFile(jsonPath, 'utf-8');
    const allMenus = JSON.parse(fileData);

    // หาเมนูใกล้เคียง
    const similarMenus = allMenus.filter((menu: any) => {
      if (!menu.ingredients || !Array.isArray(menu.ingredients)) return false;
      if (menu.name === currentMenu.name) return false;
      return menu.ingredients.some((ing: string) => currentIngredients.includes(ing));
    });

    return Response.json(similarMenus.slice(0, 6));
  } catch (error) {
    console.error("❌ API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}