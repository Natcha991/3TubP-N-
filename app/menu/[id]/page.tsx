'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
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

  // Enhanced viewport height fix แบบเดียวกับโค้ดพี่
  useEffect(() => {
    const updateAppHeight = () => {
      if (typeof window !== 'undefined') {
        const height = window?.visualViewport?.height || window.innerHeight;
        setAppHeight(`${height}px`);
      }
    };

    if (typeof window !== 'undefined') {
      updateAppHeight();
      window.addEventListener('resize', updateAppHeight);
      window.addEventListener('orientationchange', updateAppHeight);
      window.visualViewport?.addEventListener('resize', updateAppHeight);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateAppHeight);
        window.removeEventListener('orientationchange', updateAppHeight);
        window.visualViewport?.removeEventListener('resize', updateAppHeight);
      }
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

  const handleNextStep = useCallback(() => {
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
  }, [menu?.instructions, nextStepIndex]);

  const handleGoBack = useCallback(() => {
    setIsBackAnimating(true);
    setTimeout(() => {
      router.push(`/home?id=${userId}`);
      setIsBackAnimating(false);
    }, 300);
  }, [router, userId]);

  const handleCalButtonClick = useCallback(() => {
    setAnimatingCalIndex(0);
    setTimeout(() => {
      router.push(`/cal/${menuId}?userId=${userId}`);
      setAnimatingCalIndex(null);
    }, 300);
  }, [router, menuId, userId]);

  const handleIngredientClick = useCallback((ingName: string, index: number) => {
    setAnimatingIngredientIndex(index);
    setTimeout(() => {
      router.push(`/ingredient/${encodeURIComponent(ingName)}?menuId=${menuId}${userId ? `&userId=${userId}` : ''}`);
      setAnimatingIngredientIndex(null);
    }, 300);
  }, [router, menuId, userId]);

  const handleSimilarMenuClick = useCallback((similarMenuId: string) => {
    setAnimatingSimilarMenuId(similarMenuId);
    setTimeout(() => {
      router.push(`/menu/${similarMenuId}${userId ? `?userId=${userId}` : ''}`);
      setAnimatingSimilarMenuId(null);
    }, 300);
  }, [router, userId]);

  const getStepImage = useCallback((step: string): string => {
    const keywords = ["เตรียมวัตถุดิบ", "ต้ม", "ผัด", "นึ่ง", "ย่าง", "ปรุงรส", "เสิร์ฟ", "อบ", "ใส่", "แช่", "เคี่ยว", "ปั่น", "คั่ว", "ทอด", "หมัก", "เจียว", "ทา", "ซอย", "ผสม", "ห่อ", "หัน", "หุง", "ชุบ", "คลุก", "ตี", "ตำ", "ลวก"];
    for (const key of keywords) {
      if (step.includes(key)) return `/methods/${encodeURIComponent(key)}.png`;
    }
    return "/methods/default.png";
  }, []);

  // LOADING STATE
  if (!menu) {
    return (
      <div
        className="relative w-screen overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-gray-700 font-prompt"
        style={{ height: appHeight }}
      >
        {/* Decorative images - ใช้ % และ max-w แบบโค้ดพี่ */}
        <div className="absolute left-0 top-0 w-[40%] max-w-[220px] z-10">
          <img src="/Group%2099.png" alt="Decoration" />
        </div>
        <div className="absolute right-0 rotate-180 top-[30vh] w-[40%] max-w-[220px] z-10">
          <img src="/Group%2099.png" alt="Decoration" />
        </div>
        <div className="absolute top-[70vh] left-[3.5vw] animate-shakeright w-[35vw] max-w-[180px] z-10">
          <img src="/image%2084.png" alt="Decoration" />
        </div>
        <div className="absolute top-[10vh] right-[5vw] rotate-[35deg] animate-shakeright2 w-[28vw] max-w-[120px] z-10">
          <img src="/image%2084.png" className="w-[140px]" alt="Decoration" />
        </div>
        
        <img className="animate-sizeUpdown2 mb-6 w-auto max-h-[35vh] object-contain" src="/image%2069.png" alt="Background decoration" />
        <p className="z-10 text-base">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const instructions = Array.isArray(menu.instructions)
    ? (menu.instructions as string[])
    : [menu.instructions as string];

  return (
    <div 
      className="relative w-screen overflow-hidden bg-gradient-to-br from-orange-50 to-white font-prompt"
      style={{ minHeight: appHeight }}
    >
      {/* Decorative background images - absolute positioned */}
      <div className="absolute left-0 top-0 w-[35%] max-w-[180px] z-0">
        <img src="/Group%2099.png" alt="Decoration" />
      </div>
      <div className="absolute right-0 rotate-180 top-[20vh] w-[35%] max-w-[180px] z-0">
        <img src="/Group%2099.png" alt="Decoration" />
      </div>

      {/* Scrollable content container */}
      <div className="relative z-10 flex flex-col">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center w-full px-4 pt-4">
          <button
            aria-label="ย้อนกลับ"
            onClick={handleGoBack}
            className={`bg-white h-[2.5rem] w-[2.5rem] flex justify-center items-center rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200 ${isBackAnimating ? "animate-press" : ""}`}
          >
            <Image src="/Group%2084.png" alt="back" width={14} height={14} />
          </button>
        </div>

        {/* Hero image section */}
        <div className="relative w-full mt-[4rem]">
          <div className="w-full px-4">
            <Image
              className="w-full h-auto max-h-[40vh] object-cover rounded-2xl [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
              src={menu.image ? `/menus/${encodeURIComponent(menu.image)}` : "/default.png"}
              alt={menu.name}
              width={400}
              height={300}
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                (target as any).onerror = null;
                target.src = "/default.png";
              }}
            />
          </div>

          {/* Cal button */}
          <button
            onClick={handleCalButtonClick}
            aria-label="คำนวณแคลอรี่"
            className={`bg-[#FE5D35] text-white h-[3rem] w-[3rem] flex justify-center items-center rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200 absolute right-6 -bottom-6 ${animatingCalAnimatIndex !== null ? "animate-press" : ""}`}
          >
            <Image src="/cal.png" alt="cal" width={36} height={36} />
          </button>
        </div>

        {/* Content sections */}
        <div className="px-4 mt-8 space-y-8 pb-8">
          {/* Title + Description + Tags */}
          <div>
            <h1 className="text-xl font-semibold text-[#611E1E] leading-tight mb-2">
              {menu.name}
            </h1>

            <p className="text-sm text-[#953333] leading-relaxed mb-3">
              {menu.description}
            </p>

            {Array.isArray(menu.tags) && menu.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {menu.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-[#ff770041] inline-block px-3 py-1 rounded-full"
                  >
                    <span className="font-medium text-xs text-[#953333]">{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Ingredients */}
          <section>
            <h2 className="text-lg font-semibold text-[#333333] mb-4">วัตถุดิบ</h2>
            <div className="space-y-2 animate-OpenScene2">
              {ingredientsData.map((ing, i) => (
                <button
                  key={i}
                  onClick={() => handleIngredientClick(ing.name, i)}
                  className={`bg-[#FFFAD2] w-full flex items-center justify-between p-3 border border-[#C9AF90] rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200 ${animatingIngredientIndex === i ? "animate-press" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      className="rounded-full object-cover"
                      src={ing.image ? `/ingredients/${encodeURIComponent(ing.image)}` : "/default.png"}
                      alt={ing.name}
                      width={32}
                      height={32}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        (target as any).onerror = null;
                        target.src = "/default.png";
                      }}
                    />
                    <span className="text-sm font-medium">{ing.name}</span>
                  </div>
                  <span className="text-xs text-[#777] font-medium">฿ {ing.price}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Methods */}
          <section>
            <h2 className="text-lg font-semibold text-[#333333] mb-4">วิธีการทำ</h2>
            
            <div
              ref={methodCardsContainerRef}
              className="space-y-3 overflow-y-auto max-h-[50vh] pb-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-[#C9AF90]"
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

            {/* Next step button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleNextStep}
                disabled={nextStepIndex >= instructions.length}
                className={`bg-[#FFF5DD] border-2 border-[#C9AF90] px-6 py-2 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isNextStepAnimating ? "animate-press" : ""}`}
              >
                <div className="text-center text-[#333333]">
                  <div className="text-sm font-medium">ถัดไป</div>
                  <div className="text-xs">(กดเพื่อดูวิธีต่อไป)</div>
                </div>
              </button>
            </div>
          </section>

          {/* Similar menus */}
          <section>
            <h2 className="text-lg font-semibold text-[#333333] mb-4">เมนูใกล้เคียง</h2>

            {isLoadingSimilarMenus ? (
              <p className="text-gray-600 text-sm">กำลังโหลดเมนูใกล้เคียง...</p>
            ) : similarMenusError ? (
              <p className="text-red-500 text-sm">{similarMenusError}</p>
            ) : similarMenus.length === 0 ? (
              <p className="text-gray-600 text-sm">ไม่พบเมนูใกล้เคียง</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {similarMenus.map((similarMenu) => (
                  <button
                    key={similarMenu._id}
                    onClick={() => handleSimilarMenuClick(similarMenu._id)}
                    className={`bg-white border-2 border-[#C9AF90] rounded-t-[50px] shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 ${animatingSimilarMenuId === similarMenu._id ? "animate-press" : ""}`}
                  >
                    <div className="w-full flex justify-center pt-2">
                      <Image
                        className="animate-sizeUpdown object-cover rounded-t-[50px]"
                        src={similarMenu.image ? `/menus/${encodeURIComponent(similarMenu.image)}` : "/default.png"}
                        alt={similarMenu.name}
                        width={80}
                        height={70}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          (target as any).onerror = null;
                          target.src = "/default.png";
                        }}
                      />
                    </div>
                    <div className="px-2 pb-2">
                      <p className="text-xs text-[#953333] text-center line-clamp-2 leading-tight">
                        {similarMenu.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}