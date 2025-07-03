'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface MenuItem {
  name: string;
  calories: number;
  image: string;
  reason?: string;
}

export default function Home() {
  const router = useRouter();
  const goto = () => router.push("/menu");

  const [menus, setMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch('/api/recommend-ai');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setMenus(data.recommendedMenus || []);
      } catch (error) {
        console.error('Error fetching AI menus:', error);
      }
    };

    fetchMenus();
  }, []);

  return (
    <div className="">
      {/* ... Profile section ไม่ต้องเปลี่ยน ... */}

      <div className="flex flex-col items-center">
        <h1 className="font-[600] mt-[1.5rem] text-[#333333] font-prompt mb-[1rem] mr-[9rem] text-[1.6rem]">เมนูแนะนำ</h1>
        <div className="flex justify-center gap-3">
          {menus.length === 0 ? (
            <p>กำลังโหลดเมนู...</p>
          ) : (
            menus.slice(0, 2).map((item, idx) => (
              <div
                key={idx}
                onClick={goto}
                className="bg-white inline-block w-[155px] py-[1rem] rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer"
              >
                <div className="flex flex-col items-center">
                  <img className="h-[8rem] w-[8rem]" src={item.image} alt={item.name} />
                  <div className="flex items-center">
                    <div className="w-[0.1rem] h-[2rem] mt-[0.8rem] mr-[0.4rem] ml-[0.5rem] bg-[#333333]"></div>
                    <div>
                      <h1 className="text-[0.9rem] w-[123px] font-bold mt-2.5 mb-1 font-prompt">
                        {item.name.toUpperCase()}
                      </h1>
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

        {/* เมนูสำหรับผู้เป็นเบาหวาน */}
        <div className="relative">
          <h1 className="font-[600] my-[1.5rem] text-center mb-[2rem] text-[1.6rem] font-Pro text-[#333333] font-prompt">
            เมนูสำหรับผู้เป็นเบาหวาน
          </h1>
          <div className="flex justify-center gap-3 my-5">
            {menus.length === 0 ? (
              <p>กำลังโหลดเมนู...</p>
            ) : (
              menus
                .filter(item => item.reason?.includes('เบาหวาน')) // หรือดูจากชื่อเมนู / tags ได้ด้วย
                .slice(0, 2) // เอาแค่ 2 เมนู
                .map((item, idx) => (
                  <div
                    key={idx}
                    onClick={goto}
                    className="bg-white inline-block w-[155px] py-[1rem] rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <img className="h-[8rem] w-[8rem]" src={item.image} alt={item.name} />
                      <div className="flex items-center">
                        <div className="w-[0.1rem] h-[2rem] mt-[0.8rem] mr-[0.4rem] ml-[0.5rem] bg-[#333333]"></div>
                        <div>
                          <h1 className="text-[0.9rem] w-[123px] font-bold mt-2.5 mb-1 font-prompt">
                            {item.name.toUpperCase()}
                          </h1>
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
    </div>
  );
}
