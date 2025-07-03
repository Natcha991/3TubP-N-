'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface MenuItem {
  _id: string;
  name: string;
  calories: number;
  image: string;
  reason?: string;
}

interface UserProfile {
  name: string;
  kcal: number;
  nutrients: {
    label: string;
    value: string | number;
  }[];
  profileImage: string;
}

export default function Home() {
  const router = useRouter();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.warn('No userId found in localStorage');
        setIsLoadingProfile(false);
        return;
      }

      try {
        const res = await fetch(`/api/user/${userId}`);
        const text = await res.text();
        if (!res.ok) throw new Error(text || res.statusText);
        if (!text) throw new Error('Empty response from API');
        const data = JSON.parse(text);

        setUserProfile({
          name: data.name || 'Unknown',
          kcal: data.caloriesConsumed || 0,
          nutrients: [
            { label: 'Nutrient1', value: data.nutrient1 || 'N/A' },
            { label: 'Nutrient2', value: data.nutrient2 || 'N/A' },
            { label: 'Nutrient3', value: data.nutrient3 || 'N/A' },
          ],
          profileImage:
            data.profileImage ||
            'https://www.jomopetfood.com/wp-content/uploads/2022/06/golden-retriever-gf655a30dd_1920-1200x800.jpg',
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile({
          name: 'Guest',
          kcal: 0,
          nutrients: [{ label: 'Error', value: 'Loading failed' }],
          profileImage:
            'https://www.jomopetfood.com/wp-content/uploads/2022/06/golden-retriever-gf655a30dd_1920-1200x800.jpg',
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch('/api/recommend-ai');
        const text = await res.text();
        if (!res.ok) throw new Error(text || res.statusText);
        if (!text) throw new Error('Empty response from API');
        const data = JSON.parse(text);

        const menuArray = Array.isArray(data.recommendedMenus)
          ? data.recommendedMenus
          : Array.isArray(data)
          ? data
          : [];

        console.log("Final menus: ", menuArray);
        setMenus(menuArray);
      } catch (error) {
        console.error('Error fetching AI menus:', error);
        setMenus([]);
      } finally {
        setIsLoadingMenus(false);
      }
    };

    fetchMenus();
  }, []);

  const goto = (id: string) => {
    if (!id || id === 'undefined') return;
    router.push(`/menu/${id}`);
  };

  if (isLoadingProfile || isLoadingMenus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div>
      <div className="flex relative justify-center">
        <div className="[background:linear-gradient(0deg,rgba(255,255,255,0.54)_0%,rgba(255,255,255,1)_100%)] w-[181px] pt-[7rem] pb-[5rem] px-[2rem] mr-[11.5rem] rounded-br-3xl">
          <div className="absolute top-[2rem]">
            <img className="w-[41px] h-[41px] rounded-full object-cover" src={userProfile?.profileImage} alt="Profile" />
          </div>
          <h1 className="text-[#333333] font-Unbounded text-2xl font-bold">{userProfile?.name}</h1>
          <div className="py-[2rem] flex items-baseline">
            <h1 className="text-[#333333] font-Unbounded text-6xl font-bold">{userProfile?.kcal}</h1>
            <h1 className="text-[#333333] font-Unbounded text-[0.7rem] ml-[0.2rem]">KCAL</h1>
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col gap-[1rem]">
              {userProfile?.nutrients.map((n, i) => (
                <p key={`nutrient-${i}-label`} className="text-[#333333] font-Unbounded text-[1rem]">
                  {n.label}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-[1rem]">
              {userProfile?.nutrients.map((n, i) => (
                <p key={`nutrient-${i}-value`} className="text-[#333333] font-Unbounded text-[1rem]">
                  {n.value}
                </p>
              ))}
            </div>
          </div>
        </div>
        <img className="absolute z-[-1] object-cover max-w-[365px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]" src="/image%2048.png" alt="Hero Background" />
      </div>

      <div className="flex flex-col items-center">
        <h1 className="font-[600] mt-[1.5rem] text-[#333333] font-prompt mb-[1rem] mr-[9rem] text-[1.6rem]">เมนูแนะนำ</h1>
        <div className="flex justify-center gap-3">
          {menus.length === 0 ? (
            <p>ไม่พบเมนูแนะนำ</p>
          ) : (
            menus.slice(0, 2).map((item) => {
              if (!item._id) return null;
              return (
                <div
                  key={item._id}
                  onClick={() => goto(item._id)}
                  className="bg-white inline-block w-[155px] py-[1rem] rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    <img className="h-[8rem] w-[8rem]" src={item.image || "/default.png"} alt={item.name || "เมนูอาหาร"} />
                    <div className="flex items-center">
                      <div className="w-[0.1rem] h-[2rem] mt-[0.8rem] mr-[0.4rem] ml-[0.5rem] bg-[#333333]"></div>
                      <div>
                        <h1 className="text-[0.9rem] w-[123px] font-bold mt-2.5 mb-1 font-prompt">{item.name?.toUpperCase() || "ไม่ทราบชื่อเมนู"}</h1>
                        <div className="flex items-baseline mt-[-0.3rem]">
                          <h1 className="text-[0.8rem] font-Unbounded">{item.calories}</h1>
                          <h1 className="text-[0.5rem] ml-[0.3rem] font-Unbounded">KCAL</h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="relative">
          <h1 className="font-[600] my-[1.5rem] text-center mb-[2rem] text-[1.6rem] font-Pro text-[#333333] font-prompt">เมนูสำหรับผู้เป็นเบาหวาน</h1>
          <div className="flex justify-center gap-3 my-5">
            {menus
              .filter(item => (item.reason?.includes('เบาหวาน') || item.name.toLowerCase().includes('เบาหวาน')) && item._id)
              .slice(0, 2)
              .map((item) => (
                <div
                  key={item._id}
                  onClick={() => goto(item._id)}
                  className="bg-white inline-block w-[155px] py-[1rem] rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    <img className="h-[8rem] w-[8rem]" src={item.image || "/default.png"} alt={item.name || "เมนูอาหาร"} />
                    <div className="flex items-center">
                      <div className="w-[0.1rem] h-[2rem] mt-[0.8rem] mr-[0.4rem] ml-[0.5rem] bg-[#333333]"></div>
                      <div>
                        <h1 className="text-[0.9rem] w-[123px] font-bold mt-2.5 mb-1 font-prompt">{item.name?.toUpperCase() || "ไม่ทราบชื่อเมนู"}</h1>
                        <div className="flex items-baseline mt-[-0.3rem]">
                          <h1 className="text-[0.8rem] font-Unbounded">{item.calories}</h1>
                          <h1 className="text-[0.5rem] ml-[0.3rem] font-Unbounded">KCAL</h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
