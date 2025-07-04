'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// ปรับปรุง MenuItem interface หากมี description เพิ่มเข้ามา
interface MenuItem {
  _id: string; // ควรมี _id สำหรับ key ใน React list
  name: string;
  calories: number;
  image: string; // URL ของรูปภาพเมนู
  reason?: string; // เหตุผลที่แนะนำ (อาจจะยังใช้ในการกรองเมนูเบาหวานในอนาคต หรือลบไปเลย)
  description?: string; // เพิ่ม field description
}

export default function Home() {
  const router = useRouter();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  // 🔴 ลบ state และ isLoading สำหรับ highlightedMenu ออก
  const [isLoadingMenus, setIsLoadingMenus] = useState(true); // เหลือแค่ state การโหลดเมนูหลัก

  // -----------------------------------------------------
  // useEffect สำหรับดึงข้อมูลเมนูทั้งหมด (แนะนำ)
  // -----------------------------------------------------
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch('/api/recommend-ai'); // API สำหรับเมนูแนะนำ
        const text = await res.text();

        // ตรวจสอบสถานะการตอบกลับ HTTP
        if (!res.ok) {
          console.error(`HTTP error! status: ${res.status}, response: ${text}`);
          throw new Error(text || res.statusText);
        }

        // ตรวจสอบว่า response ไม่ว่างเปล่า
        if (!text) {
          console.warn('Empty response from /api/recommend-ai');
          setMenus([]); // ตั้งค่าเป็น array ว่าง
          return;
        }

        const data = JSON.parse(text);

        // ตรวจสอบและตั้งค่า menus จาก data ที่ได้รับ
        const menuArray = Array.isArray(data.recommendedMenus)
          ? data.recommendedMenus
          : Array.isArray(data)
          ? data
          : [];

        console.log("Fetched Menus Data:", menuArray);
        setMenus(menuArray);
      } catch (error) {
        console.error('Error fetching menus:', error);
        setMenus([]); // ตั้งค่าเป็น array ว่างหากเกิดข้อผิดพลาด
      } finally {
        setIsLoadingMenus(false);
      }
    };

    fetchMenus();
  }, []); // [] เพื่อให้รันแค่ครั้งเดียวเมื่อ component mount

  // ฟังก์ชันสำหรับนำทางไปหน้าเมนูพร้อมส่ง ID เมนู
  const goto = (id: string) => {
    if (!id || id === 'undefined') {
      console.warn('Attempted to navigate to menu with invalid ID:', id);
      return; // ไม่ทำอะไรหาก ID ไม่ถูกต้อง
    }
    router.push(`/menu/${id}`);
  };

  // ดึงเมนูแรกสำหรับส่วนแสดงเมนูหลักด้านบน
  const mainDisplayedMenu = menus.length > 0 ? menus[0] : null;

  // ถ้าข้อมูลกำลังโหลดอยู่
  if (isLoadingMenus) { // เหลือแค่ isLoadingMenus
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div>
      {/* ----------------------------------------------------- */}
      {/* ส่วนแสดงเมนูหลักด้านบน (ใช้เมนูแรกจาก menus array) */}
      {/* ----------------------------------------------------- */}
      <div className="relative flex justify-center font-prompt"> 
        <div className="[background:linear-gradient(0deg,rgba(255,255,255,0.54)_0%,rgba(255,255,255,1)_100%)] w-[181px] pt-[7rem] pb-[5rem] px-[2rem] mr-[11.5rem] rounded-br-3xl">
          <div className="absolute top-[2rem]">
            {/* รูปภาพของเมนูหลัก */}
            <img className="w-[80px] bg-black  h-[80px] rounded-full object-cover"
              src={mainDisplayedMenu?.image || "/default_menu.png"} // ใช้รูป default หากไม่มี
              alt={mainDisplayedMenu?.name || "Main Menu"}
            />
          </div>
          {/* ชื่อเมนูหลัก */}
          <h1 className="text-[#333333] font-prompt mt-12 text-2xl font-bold font-unbounded">
            {mainDisplayedMenu?.name || 'ไม่พบเมนู'}
          </h1>
          <div className="py-[1rem] flex flex-col items-baseline">
            {/* แคลอรี่ของเมนูหลัก */}
            <h1 className="text-[#333333] font-Unbounded text-5xl font-bold">
              {mainDisplayedMenu?.calories || 0}
            </h1>
            <h1 className="text-[#333333] font-Unbounded text-[0.7rem] ml-[0.2rem]">KCAL</h1>
          </div>
          {/* คำอธิบายเมนูหลัก */}
          <div className="mt-2">
            <p className="text-[#333333] font-prompt text-[0.9rem] leading-tight">
              {mainDisplayedMenu?.description || 'ไม่พบรายละเอียดเมนู'}
            </p>
          </div>
        </div>
        {/* รุปภาพหลักของเมนูอยู่ตรงนี้ */}
        <img className="absolute z-[-1] object-cover max-w-[365px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]" src="/image%2048.png" alt="Hero Background" />
      </div>

      <div className="flex flex-col items-center">
        <h1 className="font-[600] mt-[1.5rem] text-[#333333] font-prompt mb-[1rem] mr-[9rem] text-[1.6rem]">เมนูแนะนำ</h1>
        <div className="flex justify-center gap-3">
          {menus.length === 0 ? (
            <p>ไม่พบเมนูแนะนำ</p>
          ) : (
            // แสดงเมนูตั้งแต่รายการที่ 1 (index 1) ถึง 2 (index 2)
            menus.slice(1, 3).map((item) => { // เปลี่ยนเป็น slice(1, 3) เพื่อข้ามเมนูแรกที่แสดงไปแล้ว
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
          <h1 className="font-[600] my-[1.5rem] text-center mb-[2rem] text-[1.6rem] font-Pro text-[#333333] font-prompt">เมนูพิเศษสำหรับคุณ</h1>
          {/* ส่วนของเมนูเบาหวานแบบคงที่ (Stir Cauliflower) - คงเดิมหากต้องการ Hardcode */}
          <div className="flex items-center gap-4 bg-white pl-[0.5rem] rounded-br-2xl rounded-tl-2xl rounded-bl-[45px] rounded-tr-[45px] h-[150px] w-[330px]">
            <img className="h-[140px] transform transition duration-500 hover:scale-110" src="/image%2055.png" alt="Stir Cauliflower" />
            <div className="relative top-[-2.3rem] left-[-0.5rem]">
              <h1 className="text-[1rem] leading-6 font-Unbounded font-bold text-[#333333]">STIR CAULIFLOWER</h1>
              <h1 className="text-[0.5rem] font-Unbounded absolute top-[0.45rem] left-[3.2rem]">150 KCAL</h1>
            </div>
            <div className="absolute left-[10rem] mt-[3rem]">
              <div className="grid grid-cols-2">
                <div className="flex gap-1.5 mt-[0.5rem] items-center">
                  <div className="w-[0.5rem] h-[0.5rem] border-none rounded-[100%] bg-[#00EA3E]"></div>
                  <h1 className="text-[0.5rem] text-[#333333] font-prompt">น้ำตาลต่ำ</h1>
                </div>
                <div className="flex gap-1.5 mt-[0.5rem] items-center">
                  <div className="w-[0.5rem] h-[0.5rem] border-none rounded-[100%] bg-[#00EA3E]"></div>
                  <h1 className="text-[0.5rem] text-[#333333] font-prompt">ผัดแบบใช้น้ำมันน้อย</h1>
                </div>
                <div className="flex gap-1.5 mt-[0.5rem] items-center">
                  <div className="w-[0.5rem] h-[0.5rem] border-none rounded-[100%] bg-[#00EA3E]"></div>
                  <h1 className="text-[0.5rem] text-[#333333] font-prompt">ไฟเบอร์สูง</h1>
                </div>
                <div className="flex gap-1.5 mt-[0.5rem] items-center">
                  <div className="w-[0.5rem] h-[0.5rem] border-none rounded-[100%] bg-[#00EA3E]"></div>
                  <h1 className="text-[0.5rem] text-[#333333] font-prompt">ควบคุมน้ำตาลในเลือด</h1>
                </div>
              </div>
              <div className="flex gap-1.5 mt-[0.5rem] items-center">
                <div className="w-[0.5rem] h-[0.5rem] border-none rounded-[100%] bg-[#00EA3E]"></div>
                <h1 className="text-[0.5rem] text-[#333333] font-prompt">อร่อยและดีต่อสุขภาพได้ง่าย ๆ</h1>
              </div>
            </div>
          </div>

          {/* ส่วนของเมนูพิเศษ/สุ่มที่ดึงจาก API (ถัดจากเมนูแนะนำ 2 รายการ) */}
          <div className="flex justify-center gap-3 my-5">
            {menus.length < 3 ? ( // ถ้ามีเมนูไม่ถึง 3 รายการ แสดงว่าไม่มีเมนูพิเศษให้แสดง
              <p>ไม่พบเมนูพิเศษเพิ่มเติม</p>
            ) : (
              menus
                .slice(3, 5) // แสดงเมนูที่ 4 และ 5 (index 3, 4)
                .map((item) => {
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
                            <h1 className="text-[0.9rem] w-[123px] font-bold mt-2.5 mb-1 font-prompt">
                              {item.name?.toUpperCase() || "ไม่ทราบชื่อเมนู"}
                            </h1>
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
        </div>
      </div>
    </div>
  );
}