import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Menu {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  ingredients: string[];
  steps: string[];
}

const MenuPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/menu/${id}`);
        const data = await res.json();
        setMenu(data);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!menu) {
    return <p className="p-4 text-center">ไม่พบเมนู</p>;
  }

  return (
    <div className="px-4 sm:px-6 md:px-8 pb-16">
      {/* ปุ่มย้อนกลับ */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
      >
        ←
      </button>

      {/* รูปเมนู */}
      <img
        src={menu.image}
        alt={menu.title}
        className="w-full h-auto rounded-2xl object-cover"
      />

      {/* ข้อมูลเมนู */}
      <div className="mt-4 space-y-3">
        <h1 className="text-[clamp(1.25rem,4vw,1.75rem)] font-bold leading-snug">
          {menu.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-700">{menu.description}</p>

        {/* แท็ก */}
        <div className="flex flex-wrap gap-2 mt-2">
          {menu.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs sm:text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* วัตถุดิบ */}
      <section className="mt-6">
        <h2 className="text-lg font-bold mb-2">วัตถุดิบ</h2>
        <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
          {menu.ingredients.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </section>

      {/* วิธีทำ */}
      <section className="mt-6">
        <h2 className="text-lg font-bold mb-2">วิธีทำ</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base">
          {menu.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </section>

      {/* ปุ่ม */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-orange-500 text-white text-sm sm:text-base">
          เริ่มทำอาหาร
        </button>
        <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-200 text-gray-800 text-sm sm:text-base">
          เพิ่มในรายการโปรด
        </button>
      </div>
    </div>
  );
};

export default MenuPage;
