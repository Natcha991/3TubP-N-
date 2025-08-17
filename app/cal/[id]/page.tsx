'use client';

import Image from 'next/image';
import BackgroundDecor from '../../components/BackgroundDecor';
import { Prompt } from 'next/font/google';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const prompt = Prompt({
    weight: ['300', '400', '500', '600', '700', '800'],
    subsets: ['latin', 'thai'],
});

interface UserData {
    height: number;
    gender: 'male' | 'female';
}

interface Nutrient {
    protein?: number;      
    carbohydrate?: number; 
    fat?: number;          
    fiber?: number;        
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
    const userId = searchParams.get('userId');
    const { id: menuId } = useParams() as { id: string };

    const time = new Date().toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });

    const [menu, setMenu] = useState<MenuItem | null>(null);
    const [isBackAnimating, setIsBackAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const progress = menu && dayCalories ? Math.min(menu.kcal / dayCalories, 1) : 0;
    const progressPercentage = Math.round(progress * 100);

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/user/${userId}`);
                if (!res.ok) throw new Error('ไม่พบผู้ใช้');
                const user: UserData = await res.json();

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

    useEffect(() => {
        if (dayCalories) {
            setMealCalories(dayCalories / 3);
        }
    }, [dayCalories]);

    useEffect(() => {
        if (!menuId) return;

        const fetchMenu = async () => {
            setIsLoading(true);
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
            } finally {
                setIsLoading(false);
            }
        };

        fetchMenu();
    }, [menuId]);

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
        }, 150);
    };

    if (isLoading || !menu) {
        return (
            <div className={`${prompt.className} min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center`}>
                <div className="text-center space-y-6">
                    {/* Enhanced loading animation */}
                    <div className="relative">
                        <div className="w-20 h-20 mx-auto">
                            <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <div className="absolute -inset-4">
                            <div className="w-28 h-28 border border-orange-300 rounded-full opacity-30 animate-ping"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-lg font-medium text-gray-700">กำลังโหลดข้อมูล</p>
                        <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className={`${prompt.className} min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100`}>
            {/* Enhanced Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f97316" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
                <BackgroundDecor />
            </div>

            <div className="relative z-10">
                {/* Hero Section with Food Image */}
                <section className="relative">
                    <div className="relative h-[450px] lg:h-[500px] overflow-hidden bg-white shadow-2xl">
                        {/* Food Image */}
                        <div className="absolute inset-0">
                            <Image
                                src={menu.image ? `/menus/${encodeURIComponent(menu.image)}` : '/default.png'}
                                alt={menu.name}
                                fill
                                sizes="100vw"
                                className="object-cover"
                                priority
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
                        </div>

                        {/* Back Button */}
                        <button
                            onClick={handleGoBack}
                            className={`absolute top-6 left-6 z-30 group ${
                                isBackAnimating ? 'scale-95' : 'hover:scale-105'
                            } transition-all duration-200`}
                        >
                            <div className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center group-hover:bg-white group-hover:shadow-xl">
                                <Image src="/Group%2084.png" alt="back" width={16} height={16} />
                            </div>
                        </button>

                        {/* Food Title & Time */}
                        <div className="absolute inset-x-0 bottom-6 px-6 z-20">
                            <div className="text-center space-y-3">
                                <h1 className="text-3xl lg:text-4xl font-bold text-white drop-shadow-2xl">
                                    {menu.name}
                                </h1>
                                <div className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                                    <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-800">{time} น.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Cards */}
                <div className="px-4 lg:px-8 py-8 max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                        
                        {/* Calories Card */}
                        <div className="order-1">
                            <div className="bg-white rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow duration-300">
                                <div className="mb-6">
                                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-medium text-sm shadow-lg">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        พลังงาน
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="text-7xl lg:text-8xl font-black text-gray-900 leading-none">
                                        {menu.kcal}
                                    </div>
                                    <div className="text-lg font-semibold text-orange-500">
                                        แคลอรี่
                                    </div>
                                    
                                    {/* Recommended daily calories */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <div className="text-sm text-gray-600 mb-2">แนะนำต่อมื้อ</div>
                                        <div className="text-2xl font-bold text-gray-800">
                                            {mealCalories !== null ? Math.round(mealCalories) : 0} <span className="text-lg text-gray-500">kcal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nutrition & Progress Cards */}
                        <div className="order-2 space-y-6">
                            
                            {/* Nutrition Card */}
                            <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">สารอาหาร</h3>
                                    <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l7 7-7 7z" />
                                        </svg>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {[
                                        { name: 'โปรตีน', value: menu.nutrient.protein ?? 0, color: 'bg-blue-500', icon: '🥩' },
                                        { name: 'คาร์โบไฮเดรต', value: menu.nutrient.carbohydrate ?? 0, color: 'bg-amber-500', icon: '🍞' },
                                        { name: 'ไขมัน', value: menu.nutrient.fat ?? 0, color: 'bg-yellow-500', icon: '🥑' },
                                        { name: 'ใยอาหาร', value: menu.nutrient.fiber ?? 0, color: 'bg-green-500', icon: '🥬' },
                                    ].map((nutrient) => (
                                        <div key={nutrient.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg">{nutrient.icon}</span>
                                                <span className="font-medium text-gray-800">{nutrient.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-2 h-2 rounded-full ${nutrient.color}`}></div>
                                                <span className="font-bold text-gray-900 tabular-nums">{nutrient.value} g</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Daily Progress Card */}
                            <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                                <div className="text-center space-y-4">
                                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-medium text-sm shadow-lg">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        ความคืบหนา้วันนี้
                                    </div>

                                    {/* Circular Progress */}
                                    <div className="relative inline-flex items-center justify-center">
                                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 144 144">
                                            <circle
                                                cx="72"
                                                cy="72"
                                                r="64"
                                                fill="none"
                                                stroke="#e5e7eb"
                                                strokeWidth="8"
                                            />
                                            <circle
                                                cx="72"
                                                cy="72"
                                                r="64"
                                                fill="none"
                                                stroke="url(#gradient)"
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                strokeDasharray={`${progress * 402.1} 402.1`}
                                                className="transition-all duration-1000 ease-out"
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="100%" stopColor="#059669" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="text-2xl font-black text-gray-900">{progressPercentage}%</div>
                                            <div className="text-xs text-gray-500">ของวันนี้</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">{menu.kcal}</div>
                                            <div className="text-xs text-gray-500">บริโภค</div>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">{dayCalories}</div>
                                            <div className="text-xs text-gray-500">เป้าหมาย</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
            `}</style>
        </main>
    );
}