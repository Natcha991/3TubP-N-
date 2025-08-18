'use client';

// **ตรวจสอบว่า next/navigation มี useSearchParams ถูก import แล้ว**
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
    const { id: menuId } = useParams() as { id: string }; // ดึง menuId จาก dynamic route
    const searchParams = useSearchParams(); // Hook สำหรับดึง query parameters
    const userId = searchParams.get('userId'); // <<< ดึง userId จาก URL ของ MenuPage

    const methodCardsContainerRef = useRef<HTMLDivElement>(null);

    const [menu, setMenu] = useState<MenuItem | null>(null);
    const [ingredientsData, setIngredientsData] = useState<Ingredient[]>([]);
    const [displayedSteps, setDisplayedSteps] = useState<string[]>([]);
    const [nextStepIndex, setNextStepIndex] = useState(0);
    const [similarMenus, setSimilarMenus] = useState<MenuItem[]>([]);
    const [isLoadingSimilarMenus, setIsLoadingSimilarMenus] = useState<boolean>(false);
    const [similarMenusError, setSimilarMenusError] = useState<string | null>(null);

    // **เพิ่ม state สำหรับควบคุม animate-press ในแต่ละจุด**
    const [isBackAnimating, setIsBackAnimating] = useState(false);
    const [animatingIngredientIndex, setAnimatingIngredientIndex] = useState<number | null>(null);
    const [isNextStepAnimating, setIsNextStepAnimating] = useState(false);
    const [animatingSimilarMenuId, setAnimatingSimilarMenuId] = useState<string | null>(null);
    const [animatingCalAnimatIndex, setAnimatingCalIndex] = useState<number | null>(null);

    const [appHeight, setAppHeight] = useState('100vh');

    // Effect to calculate and set the actual viewport height for mobile browsers
    useEffect(() => {
        const updateAppHeight = () => {
            setAppHeight(`${window.visualViewport?.height || window.innerHeight}px`);
        };

        if (typeof window !== 'undefined') {
            updateAppHeight();
            window.addEventListener('resize', updateAppHeight);
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', updateAppHeight);
            }
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', updateAppHeight);
                if (window.visualViewport) {
                    window.visualViewport.removeEventListener('resize', updateAppHeight);
                }
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
        if (menu && menu.tags && menu.tags.length > 0) {
            const fetchSimilarMenus = async () => {
                setIsLoadingSimilarMenus(true);
                setSimilarMenusError(null);
                try {
                    const tagToSearch = menu.tags[0];
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
        } else if (menu && menu.tags && menu.tags.length === 0) {
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
        setIsNextStepAnimating(true); // Start animation for next step button
        const instructions = Array.isArray(menu?.instructions)
            ? menu.instructions
            : (menu?.instructions ? [menu.instructions] : []);
        if (nextStepIndex < instructions.length) {
            setTimeout(() => { // Add timeout for animation to play
                setDisplayedSteps((prev) => [...prev, instructions[nextStepIndex]]);
                setNextStepIndex((prev) => prev + 1);
                setIsNextStepAnimating(false); // End animation after action
            }, 300); // Match animate-press duration
        } else {
            setIsNextStepAnimating(false); // If no more steps, turn off animation
        }
    };

    const handleGoBack = () => {
        setIsBackAnimating(true); // Start animation for back button
        setTimeout(() => {
            router.push(`/home?id=${userId}`);
            setIsBackAnimating(false); // End animation after navigation
        }, 300); // Match animate-press duration
    };

    // ปุ่มไปหน้า /app/cal
    const handleCalButtonClick = () => {
        setTimeout(() => {
            router.push(`/cal/${menuId}?userId=${userId}`); // ส่ง menuId ไปหน้า cal/[id]
            setAnimatingCalIndex(null);
        }, 300);
    };


    const handleIngredientClick = (ingName: string, index: number) => {
        setAnimatingIngredientIndex(index); // Start animation for clicked ingredient
        setTimeout(() => {
            router.push(`/ingredient/${encodeURIComponent(ingName)}?menuId=${menuId}${userId ? `&userId=${userId}` : ''}`);
            setAnimatingIngredientIndex(null); // End animation after navigation
        }, 300); // Match animate-press duration
    };

    const handleSimilarMenuClick = (similarMenuId: string) => {
        setAnimatingSimilarMenuId(similarMenuId); // Start animation for clicked similar menu
        setTimeout(() => {
            router.push(`/menu/${similarMenuId}${userId ? `?userId=${userId}` : ''}`);
            setAnimatingSimilarMenuId(null); // End animation after navigation
        }, 300); // Match animate-press duration
    };

    const getStepImage = (step: string): string => {
        const keywords = ["เตรียมวัตถุดิบ", "ต้ม", "ผัด", "นึ่ง", "ย่าง", "ปรุงรส", "เสิร์ฟ", "อบ", "ใส่", "แช่", "เคี่ยว", "ปั่น", "คั่ว", "ทอด", "หมัก", "เจียว", "ทา", "ซอย", "ผสม", "ห่อ", "หัน", "หุง", "ชุบ", "คลุก", "ตี", "ตำ", "ลวก"];
        for (const key of keywords) {
            if (step.includes(key)) {
                return `/methods/${encodeURIComponent(key)}.png`;
            }
        }
        return "/methods/default.png";
    };

    if (!menu) return <div
        className="relative w-screen overflow-hidden flex flex-col items-center justify-center
                   bg-gradient-to-br from-orange-300 to-orange-100 text-base sm:text-xl lg:text-2xl text-gray-700 font-prompt"
        style={{ height: appHeight }}
    >
        <div className="absolute left-0 top-0 w-[40vw] sm:w-[35vw] md:w-[30vw] lg:w-[25vw] xl:w-[20vw] max-w-[250px]">
            <img src="/Group%2099.png" alt="Decoration"></img>
        </div>
        <div className="absolute right-0 bottom-0 rotate-[180deg] top-[20vh] sm:top-[25vh] md:top-[30vh] w-[40vw] sm:w-[35vw] md:w-[30vw] lg:w-[25vw] xl:w-[20vw] max-w-[250px]">
            <img src="/Group%2099.png" alt="Decoration"></img>
        </div>
        <div className="absolute top-[65vh] sm:top-[70vh] md:top-[74vh] left-[3vw] sm:left-[3.5vw] animate-shakeright w-[25vw] sm:w-[20vw] md:w-[18vw] lg:w-[15vw] max-w-[200px]">
            <img className='' src="/image%2084.png" alt="Decoration"></img>
        </div>
        <div className="absolute top-[8vh] sm:top-[10vh] right-[4vw] sm:right-[5vw] rotate-[35deg] animate-shakeright2 w-[20vw] sm:w-[18vw] md:w-[15vw] lg:w-[12vw] max-w-[120px]">
            <img src="/image%2084.png" className='w-[80px] sm:w-[100px] md:w-[120px] lg:w-[140px]' alt="Decoration"></img>
        </div>
        <img className='animate-sizeUpdown2 mb-6 w-auto h-[25vh] sm:h-[30vh] md:h-[35vh] lg:h-[40vh] object-contain' src="/image%2069.png" alt="Background decoration"></img>
        <p className="z-10 px-4 text-center">กำลังโหลดข้อมูล...</p>
    </div>

    const instructions = Array.isArray(menu.instructions)
        ? menu.instructions
        : [menu.instructions];

    return (
        <div className="relative flex flex-col items-center min-h-screen">
            {/* Navigation Header - Responsive */}
            <div className="absolute z-10 flex justify-between items-center top-4 sm:top-6 md:top-8 left-4 right-4 sm:left-6 sm:right-6 md:left-8 md:right-8 lg:left-12 lg:right-12">
                {/* 1. ปุ่มย้อนกลับ - Responsive */}
                <div
                    onClick={handleGoBack}
                    className={`bg-white h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex justify-center cursor-pointer transform hover:scale-105 items-center rounded-full shadow-2xl ${isBackAnimating ? "animate-press" : ''}`}
                >
                    <Image 
                        className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" 
                        src="/Group%2084.png" 
                        alt="back" 
                        width={20} 
                        height={20} 
                    />
                </div>
            </div>

            {/* Hero Image Section - Responsive */}
            <div className="relative w-full flex flex-col items-center">
                <Image
                    className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] w-full max-w-4xl object-cover mb-4 sm:mb-6 md:mb-8 [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
                    src={menu.image ? `/menus/${encodeURIComponent(menu.image)}` : "/default.png"}
                    alt={menu.name}
                    width={800}
                    height={450}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/default.png";
                    }}
                    priority
                />

                {/* Cal Button - Responsive Position */}
                <div
                    onClick={handleCalButtonClick}
                    className={`absolute bottom-2 sm:bottom-4 md:bottom-6 right-4 sm:right-8 md:right-12 lg:right-16 bg-[#FE5D35] opacity-100 h-12 w-12 sm:h-16 sm:w-16 md:h-18 md:w-18 lg:h-20 lg:w-20 flex justify-center items-center cursor-pointer rounded-full shadow-2xl transform hover:scale-105 ${animatingCalAnimatIndex !== null ? "animate-press" : ""}`}
                >
                    <Image 
                        className="h-12 w-12 sm:h-16 sm:w-16 md:h-18 md:w-18 lg:h-20 lg:w-20" 
                        src="/cal.png" 
                        alt="calories" 
                        width={80} 
                        height={80} 
                    />
                </div>
            </div>

            {/* Content Container - Responsive */}
            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl px-4 sm:px-6 md:px-8">
                {/* Menu Title and Description - Responsive */}
                <div className="mb-6 sm:mb-8 md:mb-10">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-prompt text-[#611E1E] font-semibold mb-2 sm:mb-3">
                        {menu.name}
                    </h1>

                    <p className="text-xs sm:text-sm md:text-base text-[#953333] font-prompt leading-relaxed max-w-full sm:max-w-md md:max-w-lg">
                        {menu.description}
                    </p>

                    {/* Tags - Responsive */}
                    {Array.isArray(menu.tags) && menu.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                            {menu.tags.map((tag, index) => (
                                <div
                                    key={index}
                                    className="bg-[#ff770041] inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-2xl"
                                >
                                    <span className="font-semibold text-xs sm:text-sm md:text-base text-[#953333] font-prompt">
                                        {tag}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ingredients Section - Responsive */}
                <div className="font-prompt mb-8 sm:mb-10 md:mb-12">
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#333333] mb-4 sm:mb-6 font-semibold">
                        วัตถุดิบ
                    </h2>
                    <div className="flex flex-col items-center gap-3 sm:gap-4 animate-OpenScene2">
                        {ingredientsData.map((ing, i) => (
                            <div
                                key={i}
                                // 2. วัตถุดิบ - Responsive
                                onClick={() => handleIngredientClick(ing.name, i)}
                                className={`bg-[#FFFAD2] flex justify-between px-3 sm:px-4 md:px-6 items-center border border-[#C9AF90] w-full h-12 sm:h-14 md:h-16 rounded-lg hover:scale-102 cursor-pointer transition-all duration-200 ${animatingIngredientIndex === i ? "animate-press" : ''}`}
                            >
                                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                    <Image
                                        className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-cover rounded-full"
                                        src={ing.image ? `/ingredients/${encodeURIComponent(ing.image)}` : "/default.png"}
                                        alt={ing.name}
                                        width={48}
                                        height={48}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = "/default.png";
                                        }}
                                    />
                                    <span className="text-sm sm:text-base md:text-lg font-medium">
                                        {ing.name}
                                    </span>
                                </div>
                                <span className="text-xs sm:text-sm md:text-base text-[#777] font-medium">
                                    ฿ {ing.price}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions Section - Responsive */}
                <div className="font-prompt mb-8 sm:mb-10 md:mb-12">
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#333333] mb-4 sm:mb-6 font-semibold">
                        วิธีการทำ
                    </h2>
                    <div 
                        ref={methodCardsContainerRef} 
                        className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 overflow-y-auto pb-4 max-h-[50vh] sm:max-h-[60vh] scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-rounded-md scrollbar-thumb-[#C9AF90]"
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

                    {/* Next Step Button - Responsive */}
                    <div className="flex justify-center mt-4 sm:mt-6 mb-8 sm:mb-12">
                        <button
                            onClick={handleNextStep}
                            disabled={nextStepIndex >= instructions.length}
                            className={`flex-none bg-[#FFF5DD] cursor-pointer flex justify-center items-center border-2 border-[#C9AF90] w-24 sm:w-28 md:w-32 h-10 sm:h-12 md:h-14 rounded-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${isNextStepAnimating ? "animate-press" : ''}`}
                        >
                            <div className="flex flex-col items-center text-[#333333]">
                                <span className="text-xs sm:text-sm md:text-base mb-[-0.2rem] font-medium">
                                    ถัดไป
                                </span>
                                <span className="text-[0.3rem] sm:text-[0.4rem] md:text-[0.5rem]">
                                    (กดเพื่อดูวิธีต่อไป)
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Similar Menus Section - Responsive */}
                <div className="relative w-full mb-8 sm:mb-12 md:mb-16">
                    <h2 className="font-semibold text-[#333333] mb-4 sm:mb-6 md:mb-8 text-lg sm:text-xl md:text-2xl lg:text-3xl">
                        เมนูใกล้เคียง
                    </h2>
                    <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap">
                        {isLoadingSimilarMenus ? (
                            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                                กำลังโหลดเมนูใกล้เคียง...
                            </p>
                        ) : similarMenusError ? (
                            <p className="text-red-500 text-sm sm:text-base md:text-lg px-4 text-center">
                                {similarMenusError}
                            </p>
                        ) : similarMenus.length === 0 ? (
                            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                                ไม่พบเมนูใกล้เคียง
                            </p>
                        ) : (
                            similarMenus.slice(0, window.innerWidth < 640 ? 2 : window.innerWidth < 768 ? 3 : 4).map((similarMenu) => (
                                <div
                                    key={similarMenu._id}
                                    // 4. เมนูใกล้เคียง - Responsive
                                    onClick={() => handleSimilarMenuClick(similarMenu._id)}
                                    className={`flex flex-col items-center w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40 bg-white border-2 border-[#C9AF90] rounded-t-full shadow-sm cursor-pointer transform transition duration-300 hover:scale-105 ${animatingSimilarMenuId === similarMenu._id ? "animate-press" : ''}`}
                                >
                                    <Image
                                        className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 xl:h-32 xl:w-32 animate-sizeUpdown object-cover rounded-t-full"
                                        src={similarMenu.image ? `/menus/${encodeURIComponent(similarMenu.image)}` : "/default.png"}
                                        alt={similarMenu.name}
                                        width={128}
                                        height={128}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = "/default.png";
                                        }}
                                    />
                                    <h3 className="text-[0.6rem] sm:text-xs md:text-sm lg:text-base my-2 sm:my-3 text-[#953333] text-center px-1 sm:px-2 leading-tight">
                                        {similarMenu.name.length > 15 ? `${similarMenu.name.substring(0, 15)}...` : similarMenu.name}
                                    </h3>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}