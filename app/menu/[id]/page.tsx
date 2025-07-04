'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import MethodCard from "@/app/components/MethodCard";

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
  const { id } = useParams() as { id: string };
  const methodCardsContainerRef = useRef<HTMLDivElement>(null);

  const [menu, setMenu] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/menu/${id}`);
        if (!res.ok) throw new Error("Menu not found");
        const data = await res.json();
        setMenu(data);
      } catch (error) {
        console.error("Error loading menu:", error);
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
    <div className="relative flex flex-col items-center">
      {/* HEADER */}
      <div className="absolute z-1 flex justify-between m-[2rem] items-center sm:w-[95%] w-[85%]">
        <div onClick={goto} className="bg-white h-[50px] flex justify-center cursor-pointer transform hover:scale-103 items-center w-[50px] rounded-full shadow-2xl">
          <img className="h-[15px]" src="/Group%2084.png" alt="back" />
        </div>
        <div className="transform hover:scale-103 items-center w-[50px] rounded-full cursor-pointer">
          <img className="h-[40px]" src="/image%2065.png" alt="menu" />
        </div>
      </div>

      {/* ภาพเมนู */}
      <div className="">
        <img className="h-[330px] object-cover" src={menu.image || "/default.png"} alt={menu.name} />
      </div>

      {/* ข้อมูลเมนู */}
      <div className="mx-[1.5rem]">
        <h1 className="text-3xl font-prompt text-[#611E1E] font-[600]">{menu.name}</h1>
        <h1 className="text-[0.7rem] w-[250px] mt-[0.5rem] text-[#953333] font-prompt">{menu.description}</h1>

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