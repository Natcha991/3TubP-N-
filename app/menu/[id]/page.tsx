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

    // แก้ไข goto ให้ส่ง userId กลับไปด้วย เมื่อกลับไป home page
    // จะใช้ ?id=userId ถ้า userId มีค่า ไม่เช่นนั้นก็แค่ /home
    const goto = () => {
        router.push(`/home?id=${userId}`);
    };

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
                } catch (err: any) {
                    console.error("Error fetching similar menus:", err);
                    setSimilarMenusError(err.message || "ไม่สามารถโหลดเมนูใกล้เคียงได้");
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

    const getStepImage = (step: string): string => {
        const keywords = ["เตรียมวัตถุดิบ", "ต้ม", "ผัด", "นึ่ง", "ย่าง", "ปรุงรส", "เสิร์ฟ", "อบ", "ใส่", "แช่"];
        for (const key of keywords) {
            if (step.includes(key)) {
                return `/methods/${encodeURIComponent(key)}.png`;
            }
        }
        return "/methods/default.png";
    };

    if (!menu) return <div className="flex flex-col font-prompt min-h-screen items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700">
        <img className='animate-sizeUpdown2 mb-[1.5rem]' src="/image%2069.png"></img>
        กำลังโหลดข้อมูล...
    </div>

    const instructions = Array.isArray(menu.instructions)
        ? menu.instructions
        : [menu.instructions];

    return (
        <div className="relative flex flex-col items-center">
            <div className="absolute z-1 flex justify-between m-[2rem] items-center sm:w-[95%] w-[85%]">
                {/* แก้ไข onClick ของปุ่มย้อนกลับ เพื่อส่ง userId กลับไปด้วย */}
                <div onClick={goto} className="bg-white h-[50px] flex justify-center cursor-pointer transform hover:scale-103 items-center w-[50px] rounded-full shadow-2xl">
                    <Image className="h-[15px]" src="/Group%2084.png" alt="back" width={15} height={15} />
                </div>
                <div className="transform hover:scale-103 items-center w-[50px] rounded-full cursor-pointer">
                    <Image className="h-[40px]" src="/image%2065.png" alt="menu" width={40} height={40} />
                </div>
            </div>

            <div>
                <Image
                    className="h-[330px] object-cover mb-[2rem] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
                    src={menu.image ? `/menus/${encodeURIComponent(menu.image)}` : "/default.png"}
                    alt={menu.name}
                    width={500}
                    height={330}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/default.png";
                    }}
                    priority
                />
            </div>

            <div className="mx-[1.5rem] w-[400px]">
                <h1 className="text-3xl font-prompt text-[#611E1E] font-[600]">{menu.name}</h1>
                <h1 className="text-[0.7rem] w-[250px] mt-[0.5rem] text-[#953333] font-prompt">{menu.description}</h1>

                {Array.isArray(menu.tags) && menu.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-[0.8rem]">
                        {menu.tags.map((tag, index) => (
                            <div key={index} className="bg-[#ff770041] inline-block px-[1rem] py-[0.2rem] rounded-2xl">
                                <h1 className="font-[600] text-[0.8rem] text-[#953333] font-prompt">{tag}</h1>
                            </div>
                        ))}
                    </div>
                )}

                <div className="font-prompt mt-[3rem]">
                    <h1 className="text-[1.6rem] text-[#333333] mb-[1.5rem] font-[600]">วัตถุดิบ</h1>
                    <div className="flex flex-col items-center gap-4 animate-OpenScene2">
                        {ingredientsData.map((ing, i) => (
                            <div
                                key={i}
                                // **จุดสำคัญที่แก้ไข: เพิ่ม userId เข้าไปใน URL เมื่อคลิกวัตถุดิบ**
                                onClick={() => router.push(
                                    // ใช้ template literal เพื่อรวม string และ optional userId
                                    `/ingredient/${encodeURIComponent(ing.name)}?menuId=${menuId}${userId ? `&userId=${userId}` : ''}`
                                )}
                                className="bg-[#FFFAD2] flex justify-between px-[1rem] items-center border border-[#C9AF90] w-full h-[3rem] rounded-[8px] hover:scale-102 cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Image
                                        className="h-[40px] w-[40px] object-cover rounded-full"
                                        src={ing.image ? `/ingredients/${encodeURIComponent(ing.image)}` : "/default.png"}
                                        alt={ing.name}
                                        width={40}
                                        height={40}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = "/default.png";
                                        }}
                                    />
                                    <h1>{ing.name}</h1>
                                </div>
                                <h1 className="text-[0.8rem] text-[#777]">฿ {ing.price}</h1>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="font-prompt mt-[3rem]">
                    <h1 className="text-[1.6rem] text-[#333333] mb-[1.5rem] font-[600]">วิธีการทำ</h1>
                    <div ref={methodCardsContainerRef} className="flex flex-col items-center gap-4 overflow-y-auto pb-4 max-h-full scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-rounded-md scrollbar-thumb-[#C9AF90]">
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

                    {/* ส่วน "เมนูใกล้เคียง" ที่ดึงข้อมูลจาก API */}
                    <div className="relative w-full max-w-[450px] mt-[3rem] mb-[5rem]">
                        <h1 className="font-[600] text-[#333333] mb-[2rem] text-[1.6rem]">เมนูใกล้เคียง</h1>
                        <div className="flex gap-2 justify-center">
                            {isLoadingSimilarMenus ? (
                                <p className="text-gray-600">กำลังโหลดเมนูใกล้เคียง...</p>
                            ) : similarMenusError ? (
                                <p className="text-red-500">{similarMenusError}</p>
                            ) : similarMenus.length === 0 ? (
                                <p className="text-gray-600">ไม่พบเมนูใกล้เคียง</p>
                            ) : (
                                similarMenus.map((similarMenu) => (
                                    <div
                                        key={similarMenu._id}
                                        // **แก้ไข: ส่ง userId ไปยังหน้ารายละเอียดเมนูที่คล้ายกันด้วย**
                                        onClick={() => router.push(
                                            `/menu/${similarMenu._id}${userId ? `?userId=${userId}` : ''}`
                                        )}
                                        className="flex flex-col items-center w-[130px] bg-white border-2 border-[#C9AF90] rounded-t-full shadow-sm cursor-pointer transform transition duration-300 hover:scale-105"
                                    >
                                        <Image
                                            className="h-[130px] animate-sizeUpdown w-auto object-cover rounded-t-full"
                                            src={similarMenu.image ? `/menus/${encodeURIComponent(similarMenu.image)}` : "/default.png"}
                                            alt={similarMenu.name}
                                            width={90}
                                            height={90}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = "/default.png";
                                            }}
                                        />
                                        <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333] text-center px-1">
                                            {similarMenu.name}
                                        </h1>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}