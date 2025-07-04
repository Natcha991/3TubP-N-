'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Ingredient {
  name: string;
  description: string;
  image: string;
  price: number;
}

export default function IngredientPage() {
  const { name } = useParams() as { name: string };
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/ingredient/${encodeURIComponent(name)}`);
        if (!res.ok) throw new Error("ไม่พบวัตถุดิบ");

        const data = await res.json();
        if (!data || data.error) throw new Error("เกิดข้อผิดพลาด");

        setIngredient(data);
      } catch (err) {
        console.error("Error fetching ingredient:", err);
        setError("ไม่พบข้อมูลวัตถุดิบนี้");
      }
    };

    fetchData();
  }, [name]);

  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!ingredient)
    return <div className="text-center mt-10">กำลังโหลด...</div>;

  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <h1 className="text-2xl font-bold mb-2">{ingredient.name}</h1>

      <img
        src={
          ingredient.image
            ? ingredient.image
            : 'https://via.placeholder.com/400x250.png?text=No+Image'
        }
        alt={ingredient.name}
        className="w-full max-h-[300px] object-contain my-4 rounded"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = 'https://via.placeholder.com/400x250.png?text=No+Image';
        }}
      />

      <p className="text-gray-700 mb-2">{ingredient.description}</p>
      <p className="mt-2 font-semibold">
        ราคาโดยประมาณ: {ingredient.price} บาท
      </p>
    </div>
  );
}