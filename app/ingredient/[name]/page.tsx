// app/ingredient/[name]/page.tsx
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

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/ingredient/${encodeURIComponent(name)}`);
      const data = await res.json();
      setIngredient(data);
    };

    fetchData();
  }, [name]);

  if (!ingredient) return <div className="text-center mt-10">กำลังโหลด...</div>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">{ingredient.name}</h1>
      <img src={ingredient.image || "/default.png"} alt={ingredient.name} className="w-full my-4 rounded" />
      <p className="text-gray-700">{ingredient.description}</p>
      <p className="mt-2 font-semibold">ราคาโดยประมาณ: {ingredient.price} บาท</p>
    </div>
  );
}