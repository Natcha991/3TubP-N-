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
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg'>('sm');

  // Enhanced viewport height and screen size detection
  useEffect(() => {
    const updateAppHeight = () => {
      const height = window?.visualViewport?.height || window.innerHeight;
      setAppHeight(`${height}px`);
      
      // Detect screen size for better responsive handling
      const width = window.innerWidth;
      if (width < 480) setScreenSize('xs');
      else if (width < 768) setScreenSize('sm');
      else if (width < 1024) setScreenSize('md');
      else setScreenSize('lg');
    };

    updateAppHeight();
    window.addEventListener('resize', updateAppHeight);
    window.addEventListener('orientationchange', updateAppHeight);
    window.visualViewport?.addEventListener('resize', updateAppHeight);
    
    return () => {
      window.removeEventListener('resize', updateAppHeight);
      window.removeEventListener('orientationchange', updateAppHeight);
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

  // Dynamic sizing based on screen size
  const getImageDimensions = () => {
    switch (screenSize) {
      case 'xs': return { width: 1000, height: 500 };
      case 'sm': return { width: 1100, height: 550 };
      case 'md': return { width: 1200, height: 600 };
      default: return { width: 1200, height: 600 };
    }
  };

  const getCalButtonSize = () => {
    return screenSize === 'xs' ? 'h-14 w-14' : 'h-16 w-16 sm:h-[72px] sm:w-[72px]';
  };

  // LOADING STATE
  if (!menu) {
    return (
      <div
        className="relative w-screen overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-gray-700 font-prompt"
        style={{ minHeight: appHeight }}
      >
        <div className="absolute left-0 top-0 w-[35vw] max-w-[180px] sm:w-[40vw] sm:max-w-[220px] md:max-w-[260px]">
          <img src="/Group%2099.png" alt="Decoration" className="w-full h-auto" />
        </div>
        <div className="absolute right-0 bottom-0 rotate-180 top-[25vh] sm:top-[30vh] w-[35vw] max-w-[180px] sm:w-[40vw] sm:max-w-[220px] md:max-w-[260px]">
          <img src="/Group%2099.png" alt="Decoration" className="w-full h-auto" />
        </div>
        <div className="absolute top-[65vh] sm:top-[70vh] left-[2vw] sm:left-[3.5vw] animate-shakeright w-[30vw] max-w-[150px] sm:w-[35vw] sm:max-w-[180px] md:max-w-[220px]">
          <img src="/image%2084.png" alt="Decoration" className="w-full h-auto" />
        </div>
        <div className="absolute top-[8vh] sm:top-[10vh] right-[3vw] sm:right-[5vw] rotate-[35deg] animate-shakeright2 w-[25vw] max-w-[100px] sm:w-[28vw] sm:max-w-[120px]">
          <img src="/image%2084.png" alt="Decoration" className="w-full h-auto max-w-[140px]" />
        </div>
        <img 
          className="animate-sizeUpdown2 mb-4 sm:mb-6 w-auto max-h-[30vh] sm:max-h-[35vh] object-contain" 
          src="/image%2069.png" 
          alt="Background decoration" 
        />
        <p className="z-10 text-sm sm:text-base md:text-lg px-4 text-center">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const instructions = Array.isArray(menu.instructions)
    ? (menu.instructions as string[])
    : [menu.instructions as string];

  const imageDimensions = getImageDimensions();

  return (
    <div className="relative flex flex-col items-center min-h-screen">
      {/* Top bar - Smaller for mobile */}
      <div className="absolute z-20 flex justify-between items-center w-full px-2 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-4">
        <button
          aria-label="ย้อนกลับ"
          onClick={handleGoBack}
          className={`bg-white h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex justify-center items-center rounded-full shadow-md sm:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 ${isBackAnimating ? "animate-press" : ""}`}
        >
          <Image 
            src="/Group%2084.png" 
            alt="back" 
            width={screenSize === 'xs' ? 12 : 14} 
            height={screenSize === 'xs' ? 12 : 14} 
          />
        </button>
      </div>

      {/* Hero image + Cal button - Enhanced mobile optimization */}
      <div className="relative w-full">
        <div className="w-full mx-auto max-w-screen-lg">
          <Image
            className={`w-full h-auto object-cover mb-3 sm:mb-4 md:mb-6 [mask-image:linear-gradient(to_bottom,black_65%,transparent)] 
                      max-h-[240px] xs:max-h-[260px] sm:max-h-[300px] md:max-h-[380px] lg:max-h-[420px]`}
            src={menu.image ? `/menus/${encodeURIComponent(menu.image)}` : "/default.png"}
            alt={menu.name}
            width={imageDimensions.width}
            height={imageDimensions.height}
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
          className={`bg-[#FE5D35] text-white h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 flex justify-center items-center rounded-full shadow-md sm:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 absolute right-2 sm:right-3 md:right-6 -top-3 sm:-top-4 md:-top-8 ${animatingCalAnimatIndex !== null ? "animate-press" : ""}`}
        >
          <Image 
            src="/cal.png" 
            alt="cal" 
            width={screenSize === 'xs' ? 36 : screenSize === 'sm' ? 48 : 64} 
            height={screenSize === 'xs' ? 36 : screenSize === 'sm' ? 48 : 64} 
          />
        </button>
      </div>

      {/* Title + Desc + Tags - Compact mobile typography */}
      <div className="w-full max-w-screen-md px-2 sm:px-4 md:px-6 lg:px-8">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-prompt text-[#611E1E] font-semibold leading-tight">
          {menu.name}
        </h1>

        <p className="text-[11px] sm:text-xs md:text-sm mt-1.5 sm:mt-2 text-[#953333] font-prompt max-w-prose leading-relaxed">
          {menu.description}
        </p>

        {Array.isArray(menu.tags) && menu.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3">
            {menu.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-[#ff770041] inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl"
              >
                <span className="font-semibold text-[10px] sm:text-xs md:text-sm text-[#953333] font-prompt">{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ingredients - Compact mobile grid */}
      <section className="w-full max-w-screen-md px-2 sm:px-4 md:px-6 lg:px-8 mt-6 sm:mt-8 md:mt-10">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#333333] mb-2 sm:mb-3 md:mb-6 font-[600] font-prompt">วัตถุดิบ</h2>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2.5 md:gap-4 animate-OpenScene2">
          {ingredientsData.map((ing, i) => (
            <button
              key={i}
              onClick={() => handleIngredientClick(ing.name, i)}
              className={`bg-[#FFFAD2] text-left flex justify-between px-2.5 sm:px-3 items-center border border-[#C9AF90] w-full h-10 sm:h-12 md:h-14 rounded-md sm:rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer ${animatingIngredientIndex === i ? "animate-press" : ""}`}
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                <Image
                  className="rounded-full object-cover flex-shrink-0"
                  src={ing.image ? `/ingredients/${encodeURIComponent(ing.image)}` : "/default.png"}
                  alt={ing.name}
                  width={screenSize === 'xs' ? 28 : 36}
                  height={screenSize === 'xs' ? 28 : 36}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    (target as any).onerror = null;
                    target.src = "/default.png";
                  }}
                />
                <span className="text-xs sm:text-sm md:text-base truncate font-prompt">{ing.name}</span>
              </div>
              <span className="text-[10px] sm:text-xs md:text-sm text-[#777] font-prompt flex-shrink-0 ml-1.5">฿ {ing.price}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Methods - Compact mobile scrolling */}
      <section className="w-full max-w-screen-md px-2 sm:px-4 md:px-6 lg:px-8 mt-6 sm:mt-8 md:mt-10">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#333333] mb-2 sm:mb-3 md:mb-6 font-[600] font-prompt">วิธีการทำ</h2>

        <div
          ref={methodCardsContainerRef}
          className={`flex flex-col items-stretch gap-1.5 sm:gap-2.5 overflow-y-auto pb-2 sm:pb-4 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-[#C9AF90]
                     max-h-[45vh] sm:max-h-[50vh] md:max-h-[55vh] lg:max-h-[60vh]`}
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

        {/* Next step button - Smaller mobile sizing */}
        <div className="flex justify-center mt-2 sm:mt-3 mb-6 sm:mb-8">
          <button
            onClick={handleNextStep}
            disabled={nextStepIndex >= instructions.length}
            className={`bg-[#FFF5DD] border-2 border-[#C9AF90] w-20 h-8 sm:w-24 sm:h-9 md:w-28 md:h-10 rounded-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isNextStepAnimating ? "animate-press" : ""}`}
          >
            <div className="flex flex-col items-center text-[#333333] leading-tight font-prompt">
              <span className="text-[10px] sm:text-xs md:text-sm">ถัดไป</span>
              <span className="text-[8px] sm:text-[9px] md:text-[10px]">(กดเพื่อดูวิธีต่อไป)</span>
            </div>
          </button>
        </div>
      </section>

      {/* Similar menus - Compact mobile grid */}
      <section className="w-full max-w-screen-lg px-2 sm:px-4 md:px-6 lg:px-8 mt-1 sm:mt-2 mb-8 sm:mb-12">
        <h2 className="font-[600] text-[#333333] mb-3 sm:mb-4 text-base sm:text-lg md:text-xl lg:text-2xl font-prompt">เมนูใกล้เคียง</h2>

        {isLoadingSimilarMenus ? (
          <p className="text-gray-600 text-xs sm:text-sm font-prompt">กำลังโหลดเมนูใกล้เคียง...</p>
        ) : similarMenusError ? (
          <p className="text-red-500 text-xs sm:text-sm font-prompt">{similarMenusError}</p>
        ) : similarMenus.length === 0 ? (
          <p className="text-gray-600 text-xs sm:text-sm font-prompt">ไม่พบเมนูใกล้เคียง</p>
        ) : (
          <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2.5 md:gap-4 place-items-stretch">
            {similarMenus.map((similarMenu) => (
              <button
                key={similarMenu._id}
                onClick={() => handleSimilarMenuClick(similarMenu._id)}
                className={`flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-[999px] shadow-sm cursor-pointer transform transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${animatingSimilarMenuId === similarMenu._id ? "animate-press" : ""}`}
              >
                <div className="w-full flex justify-center pt-1 sm:pt-1.5">
                  <Image
                    className="animate-sizeUpdown object-cover rounded-t-[999px]"
                    src={similarMenu.image ? `/menus/${encodeURIComponent(similarMenu.image)}` : "/default.png"}
                    alt={similarMenu.name}
                    width={screenSize === 'xs' ? 80 : 100}
                    height={screenSize === 'xs' ? 70 : 85}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      (target as any).onerror = null;
                      target.src = "/default.png";
                    }}
                  />
                </div>
                <div className="px-1 sm:px-1.5 pb-1.5 sm:pb-2 w-full">
                  <p className="text-[9px] sm:text-[10px] md:text-[11px] text-[#953333] text-center line-clamp-2 font-prompt leading-tight">
                    {similarMenu.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Safe area for mobile navigation */}
      <div className="h-2 sm:h-4"></div>
    </div>
  );
}