'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import MethodCard from "@/app/components/MethodCard";

interface MenuItem {
  _id: string;
  name: string;
  image: string;
  calories: number;
  description: string;
  ingredients: string[] | string;
  instructions: string[] | string;
  tags: string[] | string;
}

interface Ingredient {
  name: string;
  image: string;
  description: string;
  price: number;
}

export default function MenuPage() {
  const router = useRouter();
  const { id: menuId } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const methodCardsContainerRef = useRef<HTMLDivElement>(null);

  const [menu, setMenu] = useState<MenuItem | null>(null);
  const [ingredientsData, setIngredientsData] = useState<Ingredient[]>([]);
  const [displayedSteps, setDisplayedSteps] = useState<string[]>([]);
  const [nextStepIndex, setNextStepIndex] = useState(0);
  const [similarMenus, setSimilarMenus] = useState<MenuItem[]>([]);
  const [isLoadingSimilarMenus, setIsLoadingSimilarMenus] = useState<boolean>(false);
  const [similarMenusError, setSimilarMenusError] = useState<string | null>(null);

  const [isBackAnimating, setIsBackAnimating] = useState(false);
  const [animatingIngredientIndex, setAnimatingIngredientIndex] = useState<number | null>(null);
  const [isNextStepAnimating, setIsNextStepAnimating] = useState(false);
  const [animatingSimilarMenuId, setAnimatingSimilarMenuId] = useState<string | null>(null);
  const [animatingCalAnimatIndex, setAnimatingCalIndex] = useState<number | null>(null);

  const [appHeight, setAppHeight] = useState('100vh');

  // Viewport height fix (มือถือ)
  useEffect(() => {
    const updateAppHeight = () => {
      setAppHeight(`${window?.visualViewport?.height || window.innerHeight}px`);
    };
    updateAppHeight();
    window.addEventListener('resize', updateAppHeight);
    window.visualViewport?.addEventListener('resize', updateAppHeight);
    return () => {
      window.removeEventListener('resize', updateAppHeight);
      window.visualViewport?.removeEventListener('resize', updateAppHeight);
    };
  }, []);

  useEffect(() => {
    if (!menuId) return;
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/menu/${menuId}`);
        if (!res.ok) throw new Error("Menu not found");
        const data = await res.json();
        setMenu(data);
      } catch (error) {
        console.error("Error loading menu:", error);
      }
    };
    fetchMenu();
  }, [menuId]);

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
    if (menu && menu.tags && (menu.tags as string[]).length > 0) {
      const fetchSimilarMenus = async () => {
        setIsLoadingSimilarMenus(true);
        setSimilarMenusError(null);
        try {
          const tagToSearch = (menu.tags as string[])[0];
          const res = await fetch(`/api/menu?tag=${encodeURIComponent(tagToSearch)}&excludeId=${menu._id}`);
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to fetch similar menus: ${errorText}`);
          }
          const data = await res.json();
          setSimilarMenus(data);
        } catch (err: unknown) {
          const error = err as Error;
          console.error("Error fetching similar menus:", error);
          setSimilarMenusError(error.message || "ไม่สามารถโหลดเมนูใกล้เคียงได้");
        } finally {
          setIsLoadingSimilarMenus(false);
        }
      };
      fetchSimilarMenus();
    } else if (menu && menu.tags && (menu.tags as string[]).length === 0) {
      setSimilarMenus([]);
      setIsLoadingSimilarMenus(false);
    }
  }, [menu]);

  useEffect(() => {
    if (!menu || !menu.instructions) return;
    if (displayedSteps.length > 0) return;

    const instructions = Array.isArray(menu.instructions)
      ? menu.instructions
      : [menu.instructions];

    if (instructions.length > 0) {
      setDisplayedSteps([instructions[0]]);
      setNextStepIndex(1);
    }
  }, [menu, displayedSteps.length]);

  useEffect(() => {
    if (methodCardsContainerRef.current) {
      methodCardsContainerRef.current.scrollTop = methodCardsContainerRef.current.scrollHeight;
    }
  }, [displayedSteps]);

  const handleNextStep = () => {
    setIsNextStepAnimating(true);
    const instructions = Array.isArray(menu?.instructions)
      ? (menu?.instructions as string[])
      : (menu?.instructions ? [menu.instructions as string] : []);
    if (nextStepIndex < instructions.length) {
      setTimeout(() => {
        setDisplayedSteps((prev) => [...prev, instructions[nextStepIndex]]);
        setNextStepIndex((prev) => prev + 1);
        setIsNextStepAnimating(false);
      }, 300);
    } else {
      setIsNextStepAnimating(false);
    }
  };

  const handleGoBack = () => {
    setIsBackAnimating(true);
    setTimeout(() => {
      router.push(`/home?id=${userId}`);
      setIsBackAnimating(false);
    }, 300);
  };

  const handleCalButtonClick = () => {
    setTimeout(() => {
      router.push(`/cal/${menuId}?userId=${userId}`);
      setAnimatingCalIndex(null);
    }, 300);
  };

  const handleIngredientClick = (ingName: string, index: number) => {
    setAnimatingIngredientIndex(index);
    setTimeout(() => {
      router.push(`/ingredient/${encodeURIComponent(ingName)}?menuId=${menuId}${userId ? `&userId=${userId}` : ''}`);
      setAnimatingIngredientIndex(null);
    }, 300);
  };

  const handleSimilarMenuClick = (similarMenuId: string) => {
    setAnimatingSimilarMenuId(similarMenuId);
    setTimeout(() => {
      router.push(`/menu/${similarMenuId}${userId ? `?userId=${userId}` : ''}`);
      setAnimatingSimilarMenuId(null);
    }, 300);
  };

  const getStepImage = (step: string): string => {
    const keywords = ["เตรียมวัตถุดิบ", "ต้ม", "ผัด", "นึ่ง", "ย่าง", "ปรุงรส", "เสิร์ฟ", "อบ", "ใส่", "แช่", "เคี่ยว", "ปั่น", "คั่ว", "ทอด", "หมัก", "เจียว", "ทา", "ซอย", "ผสม", "ห่อ", "หัน", "หุง", "ชุบ", "คลุก", "ตี", "ตำ", "ลวก"];
    for (const key of keywords) {
      if (step.includes(key)) return `/methods/${encodeURIComponent(key)}.png`;
    }
    return "/methods/default.png";
  };

  // LOADING
  if (!menu) {
    return (
      <div
        className="relative w-screen overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700 font-prompt"
        style={{ minHeight: appHeight }}
      >
        <div className="absolute left-0 top-0 w-[40vw] max-w-[220px] md:max-w-[260px]">
          <img src="/Group%2099.png" alt="Decoration" />
        </div>
        <div className="absolute right-0 bottom-0 rotate-180 top-[30vh] w-[40vw] max-w-[220px] md:max-w-[260px]">
          <img src="/Group%2099.png" alt="Decoration" />
        </div>
        <div className="absolute top-[70vh] left-[3.5vw] animate-shakeright w-[35vw] max-w-[180px] md:max-w-[220px]">
          <img src="/image%2084.png" alt="Decoration" />
        </div>
        <div className="absolute top-[10vh] right-[5vw] rotate-[35deg] animate-shakeright2 w-[28vw] max-w-[120px]">
          <img src="/image%2084.png" className="w-[140px]" alt="Decoration" />
        </div>
        <img className="animate-sizeUpdown2 mb-6 w-auto max-h-[35vh] object-contain" src="/image%2069.png" alt="Background decoration" />
        <p className="z-10 text-base md:text-lg">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const instructions = Array.isArray(menu.instructions)
    ? (menu.instructions as string[])
    : [menu.instructions as string];

  return (
    <div className="relative flex flex-col items-center">
      {/* Top bar */}
      <div className="absolute z-10 flex justify-between items-center w-full px-4 sm:px-6 md:px-8 pt-4">
        <button
          aria-label="ย้อนกลับ"
          onClick={handleGoBack}
          className={`bg-white h-12 w-12 flex justify-center cursor-pointer items-center rounded-full shadow-2xl transform hover:scale-105 ${isBackAnimating ? "animate-press" : ""}`}
        >
          <Image src="/Group%2084.png" alt="back" width={16} height={16} />
        </button>
      </div>

      {/* Hero image + Cal button */}
      <div className="relative w-full">
        <div className="w-full mx-auto max-w-screen-lg">
          <Image
            className="w-full h-auto max-h-[420px] object-cover mb-6 sm:mb-8 [mask-image:linear-gradient(to_bottom,black_65%,transparent)]"
            src={menu.image ? `/menus/${encodeURIComponent(menu.image)}` : "/default.png"}
            alt={menu.name}
            width={1200}
            height={600}
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              (target as any).onerror = null;
              target.src = "/default.png";
            }}
          />
        </div>

        <button
          onClick={handleCalButtonClick}
          aria-label="คำนวณแคลอรี่"
          className={`bg-[#FE5D35] text-white h-16 w-16 sm:h-[72px] sm:w-[72px] flex justify-center items-center rounded-full shadow-2xl transform hover:scale-105 transition absolute right-4 sm:right-6 -top-6 sm:-top-8 ${animatingCalAnimatIndex !== null ? "animate-press" : ""}`}
        >
          <Image src="/cal.png" alt="cal" width={64} height={64} />
        </button>
      </div>

      {/* Title + Desc + Tags */}
      <div className="w-full max-w-screen-md px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl sm:text-3xl font-prompt text-[#611E1E] font-semibold">{menu.name}</h1>

        <p className="text-xs sm:text-sm mt-2 text-[#953333] font-prompt max-w-prose">
          {menu.description}
        </p>

        {Array.isArray(menu.tags) && menu.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {menu.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-[#ff770041] inline-block px-3 py-1 rounded-2xl"
              >
                <span className="font-semibold text-xs sm:text-sm text-[#953333] font-prompt">{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ingredients */}
      <section className="w-full max-w-screen-md px-4 sm:px-6 md:px-8 mt-10">
        <h2 className="text-xl sm:text-2xl text-[#333333] mb-4 sm:mb-6 font-[600] font-prompt">วัตถุดิบ</h2>

        {/* mobile: list / md+: grid 2 col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 animate-OpenScene2">
          {ingredientsData.map((ing, i) => (
            <button
              key={i}
              onClick={() => handleIngredientClick(ing.name, i)}
              className={`bg-[#FFFAD2] text-left flex justify-between px-3 sm:px-4 items-center border border-[#C9AF90] w-full h-14 rounded-lg hover:scale-[1.02] transition cursor-pointer ${animatingIngredientIndex === i ? "animate-press" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Image
                  className="rounded-full object-cover"
                  src={ing.image ? `/ingredients/${encodeURIComponent(ing.image)}` : "/default.png"}
                  alt={ing.name}
                  width={44}
                  height={44}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    (target as any).onerror = null;
                    target.src = "/default.png";
                  }}
                />
                <span className="text-sm sm:text-base">{ing.name}</span>
              </div>
              <span className="text-xs sm:text-sm text-[#777]">฿ {ing.price}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Methods */}
      <section className="w-full max-w-screen-md px-4 sm:px-6 md:px-8 mt-10">
        <h2 className="text-xl sm:text-2xl text-[#333333] mb-4 sm:mb-6 font-[600] font-prompt">วิธีการทำ</h2>

        {/* กล่องสเต็ปเลื่อนอัตโนมัติ สูงยืดหยุ่นตามจอ */}
        <div
          ref={methodCardsContainerRef}
          className="flex flex-col items-stretch gap-3 overflow-y-auto pb-4 max-h-[55vh] sm:max-h-[60vh] md:max-h-[62vh] scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-[#C9AF90]"
        >
          {displayedSteps.map((step, index) => (
            <MethodCard
              key={index}
              num={index + 1}
              title={`ขั้นตอนที่ ${index + 1}`}
              detail={step}
              imageUrl={getStepImage(step)}
            />
          ))}
        </div>

        {/* ปุ่มถัดไป */}
        <div className="flex justify-center mt-4 mb-10">
          <button
            onClick={handleNextStep}
            disabled={nextStepIndex >= instructions.length}
            className={`bg-[#FFF5DD] border-2 border-[#C9AF90] w-28 h-10 rounded-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed ${isNextStepAnimating ? "animate-press" : ""}`}
          >
            <div className="flex flex-col items-center text-[#333333] leading-tight">
              <span className="text-sm">ถัดไป</span>
              <span className="text-[10px]">(กดเพื่อดูวิธีต่อไป)</span>
            </div>
          </button>
        </div>
      </section>

      {/* Similar menus */}
      <section className="w-full max-w-screen-lg px-4 sm:px-6 md:px-8 mt-4 mb-16">
        <h2 className="font-[600] text-[#333333] mb-6 text-xl sm:text-2xl">เมนูใกล้เคียง</h2>

        {isLoadingSimilarMenus ? (
          <p className="text-gray-600">กำลังโหลดเมนูใกล้เคียง...</p>
        ) : similarMenusError ? (
          <p className="text-red-500">{similarMenusError}</p>
        ) : similarMenus.length === 0 ? (
          <p className="text-gray-600">ไม่พบเมนูใกล้เคียง</p>
        ) : (
          <div
            className="
              grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5
              gap-3 sm:gap-4 md:gap-5 place-items-stretch
            "
          >
            {similarMenus.map((similarMenu) => (
              <button
                key={similarMenu._id}
                onClick={() => handleSimilarMenuClick(similarMenu._id)}
                className={`flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-[999px] shadow-sm cursor-pointer transform transition hover:scale-[1.03] ${animatingSimilarMenuId === similarMenu._id ? "animate-press" : ""}`}
              >
                <div className="w-full flex justify-center pt-2">
                  <Image
                    className="animate-sizeUpdown object-cover rounded-t-[999px]"
                    src={similarMenu.image ? `/menus/${encodeURIComponent(similarMenu.image)}` : "/default.png"}
                    alt={similarMenu.name}
                    width={140}
                    height={120}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      (target as any).onerror = null;
                      target.src = "/default.png";
                    }}
                  />
                </div>
                <div className="px-2 pb-3 w-full">
                  <p className="text-[12px] sm:text-sm text-[#953333] text-center line-clamp-2">
                    {similarMenu.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
