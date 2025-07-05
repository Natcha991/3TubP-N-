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

interface Ingredient {
  name: string;
  image: string;
  description: string;
  price: number;
}

export default function MenuPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const methodCardsContainerRef = useRef<HTMLDivElement>(null);

  const [menu, setMenu] = useState<MenuItem | null>(null);
  const [ingredientsData, setIngredientsData] = useState<Ingredient[]>([]);
  const [displayedSteps, setDisplayedSteps] = useState<string[]>([]);
  const [nextStepIndex, setNextStepIndex] = useState(0);

  const goto = () => router.push("/home");

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

  useEffect(() => {
    const loadIngredients = async () => {
      const ingredientNames = Array.isArray(menu?.ingredients)
        ? menu.ingredients
        : (menu?.ingredients ? [menu.ingredients] : []);

      const promises = ingredientNames.map(async (name) => {
        const res = await fetch(`/api/ingredient/${encodeURIComponent(name)}`);
        if (!res.ok) return null;
        return await res.json();
      });

      const results = await Promise.all(promises);
      setIngredientsData(results.filter(Boolean) as Ingredient[]);
    };

    if (menu) loadIngredients();
  }, [menu]);

  useEffect(() => {
    if (menu && menu.instructions && displayedSteps.length === 0) {
      const instructions = Array.isArray(menu.instructions)
        ? menu.instructions
        : [menu.instructions];

      if (instructions.length > 0) {
        setDisplayedSteps([instructions[0]]);
        setNextStepIndex(1);
      }
    }
  }, [menu]);

  useEffect(() => {
    if (methodCardsContainerRef.current) {
      methodCardsContainerRef.current.scrollTop = methodCardsContainerRef.current.scrollHeight;
    }
  }, [displayedSteps]);

  const handleNextStep = () => {
    const instructions = Array.isArray(menu?.instructions)
      ? menu.instructions
      : (menu?.instructions ? [menu.instructions] : []);
    if (nextStepIndex < instructions.length) {
      setDisplayedSteps((prev) => [...prev, instructions[nextStepIndex]]);
      setNextStepIndex((prev) => prev + 1);
    }
  };

  if (!menu) return <div className="text-center mt-10 font-prompt">กำลังโหลดเมนู...</div>;

  const instructions = Array.isArray(menu.instructions)
    ? menu.instructions
    : [menu.instructions];

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute z-1 flex justify-between m-[2rem] items-center sm:w-[95%] w-[85%]">
        <div onClick={goto} className="bg-white h-[50px] flex justify-center cursor-pointer transform hover:scale-103 items-center w-[50px] rounded-full shadow-2xl">
          <img className="h-[15px]" src="/Group%2084.png" alt="back" />
        </div>
        <div className="transform hover:scale-103 items-center w-[50px] rounded-full cursor-pointer">
          <img className="h-[40px]" src="/image%2065.png" alt="menu" />
        </div>
      </div>

      <div>
        <img
          className="h-[330px] object-cover"
          src={menu.image ? `/menus/${encodeURIComponent(menu.image)}` : "/default.png"}
          alt={menu.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/default.png";
          }}
        />
      </div>

      <div className="mx-[1.5rem] w-[400px]">
        <h1 className="text-3xl font-prompt text-[#611E1E] font-[600]">{menu.name}</h1>
        <h1 className="text-[0.7rem] w-[250px] mt-[0.5rem] text-[#953333] font-prompt">{menu.description}</h1>

        {menu.tags.length > 0 && (
          <div className="bg-[#ff770041] inline-block px-[1rem] py-[0.2rem] mt-[0.8rem] rounded-2xl">
            <h1 className="font-[600] text-[0.8rem] text-[#953333] font-prompt">{menu.tags[0]}</h1>
          </div>
        )}

        <div className="font-prompt mt-[1.4rem]">
          <h1 className="text-[1.6rem] text-[#333333] mb-[1.5rem] font-[600]">วัตถุดิบ</h1>
          <div className="flex flex-col items-center gap-4">
            {ingredientsData.map((ing, i) => (
              <div
                key={i}
                onClick={() => router.push(`/ingredient/${encodeURIComponent(ing.name)}?menuId=${id}`)}
                className="bg-[#FFFAD2] flex justify-between px-[1rem] items-center border border-[#C9AF90] w-full h-[3rem] rounded-[8px] hover:scale-102 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    className="h-[40px] w-[40px] object-cover rounded-full"
                    src={ing.image ? `/ingredients/${encodeURIComponent(ing.image)}` : "/default.png"}
                    alt={ing.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/default.png";
                    }}
                  />
                  <h1>{ing.name}</h1>
                </div>
                <h1 className="text-[0.8rem] text-[#777]">฿{ing.price}</h1>
              </div>
            ))}
          </div>
        </div>

        <div className="font-prompt mt-[3rem]">
          <h1 className="text-[1.6rem] text-[#333333] mb-[1.5rem] font-[600]">วิธีการทำ</h1>
          <div ref={methodCardsContainerRef} className="flex flex-col items-center gap-4 overflow-y-auto pb-4 max-h-full scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-[#C9AF90]">
            {displayedSteps.map((step, index) => (
              <MethodCard
                key={index}
                num={index + 1}
                title={`ขั้นตอนที่ ${index + 1}`}
                detail={step}
                imageUrl={menu.image ? `/menus/${encodeURIComponent(menu.image)}` : ""}
              />
            ))}
          </div>

          <div className="flex justify-center mt-4 mb-12">
            <button
              onClick={handleNextStep}
              disabled={nextStepIndex >= instructions.length}
              className="flex-none bg-[#FFF5DD] cursor-pointer flex justify-center items-center border-2 border-[#C9AF90] w-[6.5rem] h-[2.5rem] rounded-[8px] hover:scale-103 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-center text-[#333333]">
                <h1 className="text-[0.8rem] mb-[-0.2rem]">ถัดไป</h1>
                <h1 className="text-[0.4rem]">(กดเพื่อดูวิธีต่อไป)</h1>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}