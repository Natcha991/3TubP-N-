'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface MenuItem {
  _id: string;
  name: string;
  image: string;
  calories: number;
  description: string;
  ingredients: string[] | string;
  instructions: string[] | string;
  tags: string[];
}

export default function MenuDetailPage() {
  const rawId = useParams()?.id;
  const id = typeof rawId === 'string' ? rawId : '';
  const router = useRouter();
  const [menu, setMenu] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/menu/${id}`);
        if (!res.ok) throw new Error('Menu not found');
        const data = await res.json();
        setMenu(data);
      } catch (error) {
        console.error('Error fetching menu:', error);
        setMenu(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [id]);

  if (isLoading) {
    return <div className="text-center mt-10">กำลังโหลดข้อมูล...</div>;
  }

  if (!menu) {
    return <div className="text-center mt-10 text-red-600">ไม่พบเมนู</div>;
  }

  // 🛡 ป้องกัน error ถ้า instructions หรือ ingredients ไม่ใช่ array
  const instructions = Array.isArray(menu.instructions)
    ? menu.instructions
    : typeof menu.instructions === 'string'
    ? [menu.instructions]
    : [];

  const ingredients = Array.isArray(menu.ingredients)
    ? menu.ingredients
    : typeof menu.ingredients === 'string'
    ? [menu.ingredients]
    : [];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="text-blue-500 underline mb-4">← กลับ</button>

      <h1 className="text-3xl font-bold mb-4">{menu.name}</h1>
      <img src={menu.image || '/default.png'} alt={menu.name} className="w-full h-auto rounded mb-4" />
      <p className="text-lg font-semibold">พลังงาน: {menu.calories} KCAL</p>
      <p className="mt-2 text-gray-700">{menu.description}</p>

      <h2 className="mt-6 text-xl font-bold">วัตถุดิบ</h2>
      {ingredients.length > 0 ? (
        <ul className="list-disc pl-5 text-gray-800">
          {ingredients.map((ing, idx) => (
            <li key={`ing-${idx}`}>{ing}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">ไม่พบข้อมูลวัตถุดิบ</p>
      )}

      <h2 className="mt-6 text-xl font-bold">วิธีทำ</h2>
      {instructions.length > 0 ? (
        <ol className="list-decimal pl-5 text-gray-800">
          {instructions.map((step, idx) => (
            <li key={`step-${idx}`}>{step}</li>
          ))}
        </ol>
      ) : (
        <p className="text-gray-500">ไม่พบขั้นตอนการทำอาหาร</p>
      )}

      <div className="mt-6 flex gap-2">
        <button className="bg-green-500 text-white px-4 py-2 rounded">เพิ่มในเมนูของฉัน</button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded">ถาม Mr. Rice</button>
      </div>
    </div>
  );
}
