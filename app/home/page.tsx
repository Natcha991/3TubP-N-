'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface MenuItem {
  _id: string;
  name: string;
  calories: number;
  image: string;
  reason?: string;
  description?: string;
}

export default function Home() {
  const router = useRouter();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch('/api/recommend-ai');
        const text = await res.text();

        if (!res.ok) throw new Error(text || res.statusText);
        if (!text) return setMenus([]);

        const data = JSON.parse(text);
        const menuArray = Array.isArray(data.recommendedMenus)
          ? data.recommendedMenus
          : Array.isArray(data)
          ? data
          : [];

        setMenus(menuArray);
      } catch (error) {
        console.error('Error fetching menus:', error);
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

  const getImageUrl = (image: string) =>
    image ? `/menus/${encodeURIComponent(image)}` : '/default.png';

  const mainDisplayedMenu = menus.length > 0 ? menus[0] : null;

  if (isLoadingMenus) {
    return (
      <div className="flex font-prompt min-h-screen items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div>
      <div className="relative flex justify-center font-prompt"> 
        <div className="[background:linear-gradient(0deg,rgba(255,255,255,0.54)_0%,rgba(255,255,255,1)_100%)] w-[181px] pt-[7rem] pb-[5rem] px-[2rem] mr-[11.5rem] rounded-br-3xl">
          <div className="absolute top-[2rem]">
            <img className="w-[60px] bg-white h-[60px] rounded-full object-cover" src="/image%2076.png" />
          </div>
          <h1 className="text-[#333333] font-prompt mt-12 text-2xl font-bold font-unbounded">
            {mainDisplayedMenu?.name || 'ไม่พบเมนู'}
          </h1>
          <div className="py-[1rem] flex flex-col items-baseline">
            <h1 className="text-[#333333] font-Unbounded text-5xl font-bold">
              {mainDisplayedMenu?.calories || 0}
            </h1>
            <h1 className="text-[#333333] font-Unbounded text-[0.7rem] ml-[0.2rem]">KCAL</h1>
          </div>
          <div className="mt-2">
            <p className="text-[#333333] font-prompt text-[0.9rem] leading-tight">
              {mainDisplayedMenu?.description || 'ไม่พบรายละเอียดเมนู'}
            </p>
          </div>
        </div>
        <img
          className="absolute z-[-1] object-cover max-w-[365px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
          src={mainDisplayedMenu?.image ? getImageUrl(mainDisplayedMenu.image) : "/default.png"}
          alt={mainDisplayedMenu?.name || "Main Menu"}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/default.png";
          }}
        />
      </div>

      <div className="flex flex-col items-center">
        <h1 className="font-[600] mt-[1.5rem] text-[#333333] font-prompt mb-[1rem] mr-[9rem] text-[1.6rem]">เมนูแนะนำ</h1>
        <div className="flex justify-center gap-3">
          {menus.length === 0 ? (
            <p>ไม่พบเมนูแนะนำ</p>
          ) : (
            menus.slice(1, 3).map((item) => (
              <div
                key={item._id}
                onClick={() => goto(item._id)}
                className="bg-white inline-block w-[155px] py-[1rem] rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer"
              >
                <div className="flex flex-col items-center">
                  <img
                    className="h-[8rem] w-[8rem] object-cover"
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/default.png";
                    }}
                  />
                  <div className="flex items-center">
                    <div className="w-[0.1rem] h-[2rem] mt-[0.8rem] mr-[0.4rem] ml-[0.5rem] bg-[#333333]"></div>
                    <div>
                      <h1 className="text-[0.9rem] w-[123px] font-bold mt-2.5 mb-1 font-prompt">{item.name?.toUpperCase()}</h1>
                      <div className="flex items-baseline mt-[-0.3rem]">
                        <h1 className="text-[0.8rem] font-Unbounded">{item.calories}</h1>
                        <h1 className="text-[0.5rem] ml-[0.3rem] font-Unbounded">KCAL</h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ส่วนเมนูพิเศษ (index 3-4) */}
        <div className="flex justify-center gap-3 my-5">
          {menus.length < 3 ? (
            <p>ไม่พบเมนูพิเศษเพิ่มเติม</p>
          ) : (
            menus.slice(3, 5).map((item) => (
              <div
                key={item._id}
                onClick={() => goto(item._id)}
                className="bg-white inline-block w-[155px] py-[1rem] rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer"
              >
                <div className="flex flex-col items-center">
                  <img
                    className="h-[8rem] w-[8rem] object-cover"
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/default.png";
                    }}
                  />
                  <div className="flex items-center">
                    <div className="w-[0.1rem] h-[2rem] mt-[0.8rem] mr-[0.4rem] ml-[0.5rem] bg-[#333333]"></div>
                    <div>
                      <h1 className="text-[0.9rem] w-[123px] font-bold mt-2.5 mb-1 font-prompt">{item.name?.toUpperCase()}</h1>
                      <div className="flex items-baseline mt-[-0.3rem]">
                        <h1 className="text-[0.8rem] font-Unbounded">{item.calories}</h1>
                        <h1 className="text-[0.5rem] ml-[0.3rem] font-Unbounded">KCAL</h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}