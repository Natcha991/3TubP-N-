'use client';

import Image from 'next/image';
import BackgroundDecor from '../../components/BackgroundDecor';
import { Prompt } from 'next/font/google';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const prompt = Prompt({
    weight: ['400', '700', '800', '900'],
    subsets: ['latin', 'thai'],
});

interface UserData {
    height: number;
    gender: 'male' | 'female';
}

interface Nutrient {
    protein?: number;      // g
    carbohydrate?: number; // g
    fat?: number;          // g
    fiber?: number;        // g
}

interface MenuItem {
    id: string;
    name: string;
    image: string;
    kcal: number;
    nutrient: Nutrient;
}

export default function CalPage() {
    const [dayCalories, setDayCalories] = useState<number | null>(null);
    const [mealCalories, setMealCalories] = useState<number | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId'); // ดึง userId จาก URL
    const { id: menuId } = useParams() as { id: string };

    const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    const [menu, setMenu] = useState<MenuItem | null>(null);
    const [isBackAnimating, setIsBackAnimating] = useState(false);
    const [appHeight, setAppHeight] = useState('100vh');

    const progress = menu && dayCalories ? Math.min(menu.kcal / dayCalories, 1) : 0;

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/user/${userId}`);
                if (!res.ok) throw new Error('ไม่พบผู้ใช้');
                const user: UserData = await res.json();

                // 👉 2. คำนวณ dayCalories
                const calculated =
                    user.gender === 'female'
                        ? (user.height - 110) * 26
                        : (user.height - 100) * 26;

                setDayCalories(calculated);
            } catch (err) {
                console.error('โหลดข้อมูลผู้ใช้ล้มเหลว:', err);
            }
        };

        fetchUser();
    }, [userId]);

    // useEffect คำนวณเมื่อ dayCalories มีค่า
    useEffect(() => {
        if (dayCalories) {
            setMealCalories(dayCalories / 3); // แต่ละมื้อ 1/3 ของวัน
        }
    }, [dayCalories]);

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
                if (!res.ok) throw new Error('Menu not found');
                const data = await res.json();
                setMenu({
                    id: data.id,
                    name: data.name,
                    image: data.image,
                    kcal: Number(data.kcal),
                    nutrient: {
                        protein: parseFloat(String(data.nutrient.protein).replace(/[^\d.]/g, "")) || 0,
    carbohydrate: parseFloat(String(data.nutrient.carbohydrate).replace(/[^\d.]/g, "")) || 0,
    fat: parseFloat(String(data.nutrient.fat).replace(/[^\d.]/g, "")) || 0,
    fiber: parseFloat(String(data.nutrient.fiber).replace(/[^\d.]/g, "")) || 0,
                    }
                });
            } catch (error) {
                console.error('Error loading menu:', error);
            }
        };

        fetchMenu();
    }, [menuId]);

    // ปรับความสูง app
    useEffect(() => {
        const updateAppHeight = () => {
            setAppHeight(`${window.visualViewport?.height || window.innerHeight}px`);
        };

        window.addEventListener('resize', updateAppHeight);
        window.visualViewport?.addEventListener('resize', updateAppHeight);

        updateAppHeight();

        return () => {
            window.removeEventListener('resize', updateAppHeight);
            window.visualViewport?.removeEventListener('resize', updateAppHeight);
        };
    }, []);

    useEffect(() => {
        const register4Str = localStorage.getItem('register4');
        if (!register4Str) return;

        try {
            const user = JSON.parse(register4Str) as { gender: 'male' | 'female'; height: number };
            const calculatedDayCalories =
                user.gender === 'female'
                    ? (user.height - 110) * 26
                    : (user.height - 100) * 26;

            setDayCalories(calculatedDayCalories);
        } catch (error) {
            console.error('Error parsing register4:', error);
        }
    }, []);

    const handleGoBack = () => {
        setIsBackAnimating(true);
        setTimeout(() => {
            router.push(`/home?id=${userId}`);
            setIsBackAnimating(false);
        }, 300);
    };


    if (!menu)
        return (
            <div
                className="relative w-screen overflow-hidden flex flex-col items-center justify-center
                                 bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700 font-prompt"
                style={{ height: appHeight }}
            >
                <div className="absolute left-0 top-0 w-[60vw] max-w-[250px]">
                    <img src="/Group%2099.png" alt="Decoration"></img>
                </div>
                <div className="absolute right-0 bottom-0 rotate-[180deg] top-[30vh] w-[60vw] max-w-[250px]">
                    <img src="/Group%2099.png" alt="Decoration"></img>
                </div>
                <div className="absolute top-[74vh] left-[3.5vw] animate-shakeright w-[30vw] max-w-[200px]">
                    <img className='' src="/image%2084.png" alt="Decoration"></img>
                </div>
                <div className="absolute top-[10vh] right-[5vw] rotate-[35deg] animate-shakeright2 w-[25vw] max-w-[120px]">
                    <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
                </div>
                <img className='animate-sizeUpdown2 mb-[1.5rem] w-auto max-h-[40vh] object-contain' src="/image%2069.png" alt="Background decoration"></img>
                <p className="z-10">กำลังโหลดข้อมูล...</p>
            </div>
        );

    return (
        <main className={`${prompt.className} relative min-h-screen overflow-x-hidden`}>
            {/* พื้นหลัง */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <BackgroundDecor />
            </div>

            <div className="relative z-10 mx-auto max-w-[1100px] lg:px-6 py-6 lg:py-10">
                {/* รูปอาหาร */}
                <section>
                    <div className="relative h-[410px] overflow-hidden rounded-none bg-[#FFF3E0] shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
                        <Image
                            src={menu.image ? `/menus/${encodeURIComponent(menu.image)}` : '/default.png'}
                            alt={menu.name}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />

                        <div
                            onClick={handleGoBack}
                            className={`absolute z-20 bg-white h-[50px] w-[50px] flex justify-center items-center cursor-pointer rounded-full shadow-2xl ${isBackAnimating ? 'animate-press' : ''}`}
                        >
                            <Image src="/Group%2084.png" alt="back" width={15} height={15} />
                        </div>

                        <div className="absolute inset-x-0 top-6 text-center z-10">
                            <h1 className="text-[32px] sm:text-[34px] lg:text-[46px] font-extrabold text-[#1F1F1F]">
                                {menu.name}
                            </h1>
                            <span className="mt-2 inline-block text-[13px] sm:text-[14px] font-semibold text-[#1F1F1F] bg-white/75 px-2 py-[2px] rounded-full">
                                {time}
                            </span>
                        </div>
                    </div>
                </section>

                {/* กล่องล่าง */}
                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start justify-items-center mt-0">
                    {/* การ์ด kcal */}
                    <section className="w-full">
                        <div className="relative left-1/2 -mx-[50vw] w-screen sm:static sm:mx-0 sm:w-auto rounded-none sm:rounded-[20px] overflow-hidden bg-[#f2ede4] shadow-[0_16px_36px_rgba(0,0,0,0.12)] -mt-px">
                            <div className="py-1 sm:py-7 text-center">
                                <div className="text-[96px] sm:text-[100px] lg:text-[120px] font-black text-[#2B2B2B]">
                                    {menu.kcal}
                                </div>
                                <div className="mt-2 text-[16px] sm:text-[18px] lg:text-[20px] font-extrabold text-[#FF7A1A]">
                                    {mealCalories !== null ? Number(mealCalories).toFixed(0) : 0} cal
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ขวาล่าง */}
                    <section className="w-full max-w-[373px] lg:max-w-none flex flex-col gap-5 sm:gap-6">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">

                            {/* สารอาหาร */}
                            <div className="rounded-[16px] bg-white p-3.5 sm:p-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
                                <div className="inline-flex">
                                    <span className="rounded-full bg-[#FF6B2C] text-white text-[15px] sm:text-[16px] font-extrabold px-3 py-1 shadow-[0_6px_18px_rgba(255,107,44,0.45)]">
                                        สารอาหาร
                                    </span>
                                </div>
                                <ul className="mt-3 divide-y divide-[#E8EDF3] rounded-[12px] overflow-hidden">
                                    <li className="flex items-center justify-between px-3 py-2 bg-[#FAFCFF]">
                                        <span className="text-[13px] sm:text-[14px] font-medium text-[#3A3A3A]">โปรตีน</span>
                                        <span className="text-[12px] sm:text-[13px] text-[#9CA3AF] tabular-nums">{menu.nutrient.protein ?? 0} g</span>
                                    </li>
                                    <li className="flex items-center justify-between px-3 py-2 bg-[#FAFCFF]">
                                        <span className="text-[13px] sm:text-[14px] font-medium text-[#3A3A3A]">คาร์โบไฮเดรต</span>
                                        <span className="text-[12px] sm:text-[13px] text-[#9CA3AF] tabular-nums">{menu.nutrient.carbohydrate ?? 0} g</span>
                                    </li>
                                    <li className="flex items-center justify-between px-3 py-2 bg-[#FAFCFF]">
                                        <span className="text-[13px] sm:text-[14px] font-medium text-[#3A3A3A]">ไขมัน</span>
                                        <span className="text-[12px] sm:text-[13px] text-[#9CA3AF] tabular-nums">{menu.nutrient.fat ?? 0} g</span>
                                    </li>
                                    <li className="flex items-center justify-between px-3 py-2 bg-[#FAFCFF]">
                                        <span className="text-[13px] sm:text-[14px] font-medium text-[#3A3A3A]">ใยอาหาร</span>
                                        <span className="text-[12px] sm:text-[13px] text-[#9CA3AF] tabular-nums">{menu.nutrient.fiber ?? 0} g</span>
                                    </li>
                                </ul>
                            </div>




                            {/* cal/day + weekly */}
                            <div className="flex flex-col gap-3 sm:gap-4">

                                {/* เกจ */}
                                <div className="rounded-[16px] bg-white px-3.5 py-3.5 sm:p-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
                                    <div className="w-fit mx-auto -mt-6 mb-1.5">
                                        <div className="rounded-full px-3 py-1 text-[12px] font-bold text-white bg-[#FF7A1A] shadow-[0_8px_20px_rgba(255,122,26,0.35)]">
                                            cal / day
                                        </div>
                                    </div>
                                    <div className="mt-2 flex flex-col items-center">
                                        <svg viewBox="0 0 100 60" className="w-[140px] h-[84px]" aria-hidden="true">
                                            <path
                                                d="M10 50 A40 40 0 0 1 90 50"
                                                fill="none"
                                                stroke="#D7DCE4"
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                pathLength={100}
                                            />
                                            <path
                                                d="M10 50 A40 40 0 0 1 90 50"
                                                fill="none"
                                                stroke="#37C871"
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                pathLength={100}
                                                style={{ strokeDasharray: `${progress * 100} 100` }}
                                            />
                                        </svg>
                                        <div className="mt-1 text-center">
                                            <div className="text-[22px] sm:text-[24px] font-extrabold text-[#222] leading-none">
                                                {menu.kcal}
                                            </div>
                                            <div className="text-[11px] sm:text-[12px] text-[#FF7A1A]">{dayCalories} cal</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 h-[12px] rounded-[10px] bg-[#00A862]/90" />
                                </div>

                                {/* weekly log */}
                                {/* <button
                                    type="button"
                                    onClick={() => alert('เปิด weekly log')}
                                    className="text-left rounded-[16px] bg-white p-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-transform"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-[16px] sm:text-[18px] font-semibold text-[#2F2F2F]">
                                            weekly
                                            <div className="text-[12px] text-[#8C8C8C] leading-none">log</div>
                                        </div>
                                        <div className="rounded-[12px] bg-[#FFF2E7] p-2 shadow-[inset_0_-2px_0_rgba(0,0,0,0.06)]">
                                            <Calendar className="size-5 text-[#FF7A1A]" strokeWidth={2.6} />
                                        </div>
                                    </div>
                                </button> */}

                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </main>
    );
}
