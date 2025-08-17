'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import Image from 'next/image';
import MethodCard from '@/app/components/MethodCard';

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

  const [appHeight, setAppHeight] = useState('100svh');

  // Mobile viewport height fix + safe-area awareness
  useEffect(() => {
    const updateAppHeight = () => {
      if (typeof window !== 'undefined') {
        const height = window?.visualViewport?.height || window.innerHeight;
        setAppHeight(`${height}px`);
      }
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
        if (!res.ok) throw new Error('Menu not found');
        const data = await res.json();
        setMenu(data);
      } catch (error) {
        console.error('Error loading menu:', error);
      }
    };
    fetchMenu();
  }, [menuId]);

  useEffect(() => {
    const loadIngredients = async () => {
      const ingredientNames = Array.isArray(menu?.ingredients)
        ? menu.ingredients
        : menu?.ingredients
        ? [menu.ingredients]
        : [];

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
          const res = await fetch(
            `/api/menu?tag=${encodeURIComponent(tagToSearch)}&excludeId=${menu._id}`
          );
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to fetch similar menus: ${errorText}`);
          }
          const data = await res.json();
          setSimilarMenus(data);
        } catch (err: unknown) {
          const error = err as Error;
          console.error('Error fetching similar menus:', error);
          setSimilarMenusError(error.message || 'ไม่สามารถโหลดเมนูใกล้เคียงได้');
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
      : menu?.instructions
      ? [menu.instructions as string]
      : [];
    if (nextStepIndex < instructions.length) {
      setTimeout(() => {
        setDisplayedSteps((prev) => [...prev, instructions[nextStepIndex]]);
        setNextStepIndex((prev) => prev + 1);
        setIsNextStepAnimating(false);
      }, 250);
    } else {
      setIsNextStepAnimating(false);
    }
  }, [menu?.instructions, nextStepIndex]);

  const handleGoBack = useCallback(() => {
    setIsBackAnimating(true);
    setTimeout(() => {
      router.push(`/home?id=${userId}`);
      setIsBackAnimating(false);
    }, 200);
  }, [router, userId]);

  const handleCalButtonClick = useCallback(() => {
    setAnimatingCalIndex(0);
    setTimeout(() => {
      router.push(`/cal/${menuId}?userId=${userId}`);
      setAnimatingCalIndex(null);
    }, 200);
  }, [router, menuId, userId]);

  const handleIngredientClick = useCallback(
    (ingName: string, index: number) => {
      setAnimatingIngredientIndex(index);
      setTimeout(() => {
        router.push(
          `/ingredient/${encodeURIComponent(ingName)}?menuId=${menuId}${
            userId ? `&userId=${userId}` : ''
          }`
        );
        setAnimatingIngredientIndex(null);
      }, 200);
    },
    [router, menuId, userId]
  );

  const handleSimilarMenuClick = useCallback(
    (similarMenuId: string) => {
      setAnimatingSimilarMenuId(similarMenuId);
      setTimeout(() => {
        router.push(`/menu/${similarMenuId}${userId ? `?userId=${userId}` : ''}`);
        setAnimatingSimilarMenuId(null);
      }, 200);
    },
    [router, userId]
  );

  const getStepImage = useCallback((step: string): string => {
    const keywords = [
      'เตรียมวัตถุดิบ',
      'ต้ม',
      'ผัด',
      'นึ่ง',
      'ย่าง',
      'ปรุงรส',
      'เสิร์ฟ',
      'อบ',
      'ใส่',
      'แช่',
      'เคี่ยว',
      'ปั่น',
      'คั่ว',
      'ทอด',
      'หมัก',
      'เจียว',
      'ทา',
      'ซอย',
      'ผสม',
      'ห่อ',
      'หัน',
      'หุง',
      'ชุบ',
      'คลุก',
      'ตี',
      'ตำ',
      'ลวก',
    ];
    for (const key of keywords) {
      if (step.includes(key)) return `/methods/${encodeURIComponent(key)}.png`;
    }
    return '/methods/default.png';
  }, []);

  // Accessible, mobile-first skeletons
  const IngredientSkeleton = memo(() => (
    <div className="bg-[#FFFAD2] w-full h-[3.25rem] rounded-xl border border-[#C9AF90] animate-pulse" />
  ));
  IngredientSkeleton.displayName = 'IngredientSkeleton';

  // LOADING STATE
  if (!menu) {
    return (
      <div
        className="relative w-screen overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-gray-700 font-prompt"
        style={{ minHeight: appHeight, paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Decorative images */}
        <div className="pointer-events-none select-none absolute left-0 top-0 w-[40%] max-w-[220px] z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Group%2099.png" alt="Decoration" loading="eager" />
        </div>
        <div className="pointer-events-none select-none absolute right-0 rotate-180 top-[30vh] w-[40%] max-w-[220px] z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Group%2099.png" alt="Decoration" loading="lazy" />
        </div>
        <div className="pointer-events-none select-none absolute top-[70vh] left-[3.5vw] animate-shakeright w-[35vw] max-w-[180px] z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/image%2084.png" alt="Decoration" loading="lazy" />
        </div>
        <div className="pointer-events-none select-none absolute top-[10vh] right-[5vw] rotate-[35deg] animate-shakeright2 w-[28vw] max-w-[120px] z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/image%2084.png" className="w-[140px]" alt="Decoration" loading="lazy" />
        </div>

        <Image
          className="animate-sizeUpdown2 mb-6 w-auto max-h-[35vh] object-contain"
          src="/image%2069.png"
          alt="Background decoration"
          width={560}
          height={280}
          priority
          sizes="(max-width: 768px) 70vw, 560px"
        />
        <p className="z-10 text-sm sm:text-base">กำลังโหลดข้อมูล...</p>
        <div className="mt-4 w-full max-w-[680px] px-4 space-y-2">
          {[...Array(4)].map((_, i) => (
            <IngredientSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const instructions = Array.isArray(menu.instructions)
    ? (menu.instructions as string[])
    : [menu.instructions as string];

  return (
    <main
      className="relative w-screen overflow-hidden bg-gradient-to-br from-orange-50 to-white font-prompt text-[clamp(12px,3.5vw,16px)] leading-relaxed"
      style={{ minHeight: appHeight, paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Decorative background images - absolute positioned */}
      <div className="pointer-events-none select-none absolute left-0 top-0 w-[35%] max-w-[180px] z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Group%2099.png" alt="" aria-hidden="true" />
      </div>
      <div className="pointer-events-none select-none absolute right-0 rotate-180 top-[20vh] w-[35%] max-w-[180px] z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Group%2099.png" alt="" aria-hidden="true" />
      </div>

      {/* Scrollable content container */}
      <div className="relative z-10 flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 left-0 right-0 z-20 flex justify-between items-center w-full px-3 sm:px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <button
            aria-label="ย้อนกลับ"
            onClick={handleGoBack}
            className={`bg-white h-10 w-10 flex justify-center items-center rounded-full shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 transition-transform active:scale-95 ${
              isBackAnimating ? 'animate-press' : ''
            }`}
          >
            <Image src="/Group%2084.png" alt="back" width={16} height={16} />
          </button>
        </div>

        {/* Hero image section */}
        <section className="relative w-full mt-1">
          <div className="w-full px-3 sm:px-4">
            <div className="relative w-full overflow-hidden rounded-2xl">
              <Image
                className="h-auto max-h-[42vh] w-full object-cover [mask-image:linear-gradient(to_bottom,black_85%,transparent)]"
                src={menu.image ? `/menus/${encodeURIComponent(menu.image)}` : '/default.png'}
                alt={menu.name}
                width={1200}
                height={800}
                priority
                sizes="100vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  (target as any).onerror = null;
                  target.src = '/default.png';
                }}
              />
            </div>
          </div>

          {/* Cal button */}
          <button
            onClick={handleCalButtonClick}
            aria-label="คำนวณแคลอรี่"
            className={`bg-[#FE5D35] text-white h-12 w-12 sm:h-14 sm:w-14 flex justify-center items-center rounded-full shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 absolute right-4 sm:right-6 -bottom-6 ${
              animatingCalAnimatIndex !== null ? 'animate-press' : ''
            }`}
          >
            <Image src="/cal.png" alt="cal" width={36} height={36} />
          </button>
        </section>

        {/* Content sections */}
        <div className="px-3 sm:px-4 mt-10 space-y-8 pb-24">
          {/* Title + Description + Tags */}
          <section aria-labelledby="menu-heading" className="max-w-[800px] mx-auto">
            <h1 id="menu-heading" className="text-[clamp(18px,5.2vw,28px)] font-semibold text-[#611E1E] leading-tight mb-2">
              {menu.name}
            </h1>

            <p className="text-[0.95em] text-[#953333] leading-relaxed mb-3">
              {menu.description}
            </p>

            {Array.isArray(menu.tags) && menu.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="แท็กเมนู">
                {menu.tags.map((tag, index) => (
                  <li key={index}>
                    <span className="bg-[#ff770041] inline-block px-3 py-1 rounded-full">
                      <span className="font-medium text-[0.75em] text-[#953333]">{tag}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Ingredients */}
          <section aria-labelledby="ingredients-heading" className="max-w-[800px] mx-auto">
            <h2 id="ingredients-heading" className="text-[clamp(16px,4.6vw,22px)] font-semibold text-[#333333] mb-4">
              วัตถุดิบ
            </h2>
            <div className="space-y-2 animate-OpenScene2">
              {ingredientsData.length === 0 && (
                <>
                  <IngredientSkeleton />
                  <IngredientSkeleton />
                </>
              )}
              {ingredientsData.map((ing, i) => (
                <button
                  key={i}
                  onClick={() => handleIngredientClick(ing.name, i)}
                  className={`bg-[#FFFAD2] w-full flex items-center justify-between p-3 sm:p-3.5 border border-[#C9AF90] rounded-xl transition-transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 ${
                    animatingIngredientIndex === i ? 'animate-press' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Image
                      className="rounded-full object-cover flex-shrink-0"
                      src={ing.image ? `/ingredients/${encodeURIComponent(ing.image)}` : '/default.png'}
                      alt={ing.name}
                      width={36}
                      height={36}
                      sizes="(max-width: 640px) 36px, 36px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        (target as any).onerror = null;
                        target.src = '/default.png';
                      }}
                    />
                    <span className="text-[0.95em] font-medium truncate">{ing.name}</span>
                  </div>
                  <span className="text-[0.8em] text-[#777] font-medium whitespace-nowrap">฿ {ing.price}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Methods */}
          <section aria-labelledby="method-heading" className="max-w-[800px] mx-auto">
            <h2 id="method-heading" className="text-[clamp(16px,4.6vw,22px)] font-semibold text-[#333333] mb-4">
              วิธีการทำ
            </h2>

            <div
              ref={methodCardsContainerRef}
              className="space-y-3 overflow-y-auto max-h-[50dvh] pb-2 pr-1 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-[#C9AF90]"
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
                className={`bg-[#FFF5DD] border-2 border-[#C9AF90] px-6 py-2 rounded-xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 ${
                  isNextStepAnimating ? 'animate-press' : ''
                }`}
              >
                <div className="text-center text-[#333333]">
                  <div className="text-[0.95em] font-medium">ถัดไป</div>
                  <div className="text-[0.75em] opacity-80">(กดเพื่อดูวิธีต่อไป)</div>
                </div>
              </button>
            </div>
          </section>

          {/* Similar menus */}
          <section aria-labelledby="similar-heading" className="max-w-[900px] mx-auto">
            <h2 id="similar-heading" className="text-[clamp(16px,4.6vw,22px)] font-semibold text-[#333333] mb-4">
              เมนูใกล้เคียง
            </h2>

            {isLoadingSimilarMenus ? (
              <p className="text-gray-600 text-[0.9em]">กำลังโหลดเมนูใกล้เคียง...</p>
            ) : similarMenusError ? (
              <p className="text-red-500 text-[0.9em]">{similarMenusError}</p>
            ) : similarMenus.length === 0 ? (
              <p className="text-gray-600 text-[0.9em]">ไม่พบเมนูใกล้เคียง</p>
            ) : (
              <div
                className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:[grid-template-columns:repeat(auto-fill,minmax(7.25rem,1fr))] gap-3"
                role="list"
                aria-label="รายการเมนูใกล้เคียง"
              >
                {similarMenus.map((similarMenu) => (
                  <button
                    key={similarMenu._id}
                    onClick={() => handleSimilarMenuClick(similarMenu._id)}
                    className={`bg-white border-2 border-[#C9AF90] rounded-t-[36px] shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 ${
                      animatingSimilarMenuId === similarMenu._id ? 'animate-press' : ''
                    }`}
                  >
                    <div className="w-full flex justify-center pt-2">
                      <Image
                        className="animate-sizeUpdown object-cover rounded-t-[36px]"
                        src={
                          similarMenu.image
                            ? `/menus/${encodeURIComponent(similarMenu.image)}`
                            : '/default.png'
                        }
                        alt={similarMenu.name}
                        width={120}
                        height={100}
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 200px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          (target as any).onerror = null;
                          target.src = '/default.png';
                        }}
                      />
                    </div>
                    <div className="px-2 pb-2">
                      <p className="text-[0.75em] text-[#953333] text-center line-clamp-2 leading-tight">
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
    </main>
  );
}
