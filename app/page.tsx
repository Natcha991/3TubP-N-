'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import Image from "next/image";

// กำหนดประเภทข้อมูลสำหรับ MenuItem เพื่อให้โค้ดมีความชัดเจน
interface MenuItem {
  _id: string;
  name: string;
  calories: number;
  image: string;
  // เพิ่ม field อื่นๆ ที่คุณอาจต้องการใช้จาก API ในอนาคต
  // riceType?: string;
  // description?: string;
}

export default function Home() {
  const router = useRouter();

  const goto = () => {
    router.push("/menu");
  };

  const [menus, setMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch('/api/menu');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: MenuItem[] = await res.json();
        setMenus(data);
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };

    fetchMenus();
  }, []); // [] หมายความว่า useEffect จะทำงานแค่ครั้งเดียวเมื่อ component ถูก mount

  return (
    <div className="">
      <div className="flex relative justify-center">
        <div className="[background:linear-gradient(0deg,rgba(255,255,255,0.54)_0%,rgba(255,255,255,1)_100%)] w-[181px] pt-[7rem] pb-[5rem] px-[2rem] mr-[11.5rem] rounded-br-3xl">
          <div className="absolute top-[2rem]">
            {/* หากคุณต้องการใช้ Next/Image ควรใช้ src เป็น path ในโปรเจกต์ หรือ URL ที่ระบุ domain ใน next.config.js */}
            <img className="w-[41px] h-[41px] rounded-full object-cover" src="https://www.jomopetfood.com/wp-content/uploads/2022/06/golden-retriever-gf655a30dd_1920-1200x800.jpg" alt="Profile" />
          </div>
          <h1 className="text-[#333333] font-Unbounded text-2xl font-bold font-unbounded">Sushi</h1>
          <div className="py-[2rem] flex items-baseline">
            <h1 className="text-[#333333] font-Unbounded text-6xl font-bold">70</h1>
            <h1 className="text-[#333333] font-Unbounded text-[0.7rem] ml-[0.2rem]">KCAL</h1>
          </div>
          <div className="flex justify-between">
            <div className="gap-[1rem]">
              <p className="text-[#333333] font-Unbounded text-[1rem]">Nutrient</p>
              <p className="text-[#333333] font-Unbounded text-[1rem]">Nutrient</p>
              <p className="text-[#333333] font-Unbounded text-[1rem]">Nutrient</p>
            </div>
            <div className="gap-[1rem]">
              <p className="text-[#333333] font-Unbounded text-[1rem]">1</p>
              <p className="text-[#333333] font-Unbounded text-[1rem]">1</p>
              <p className="text-[#333333] font-Unbounded text-[1rem]">1</p>
            </div>
          </div>
        </div>
        {/* หากคุณต้องการใช้ Next/Image ควรใช้ src เป็น path ในโปรเจกต์ หรือ URL ที่ระบุ domain ใน next.config.js */}
        <img className="absolute z-[-1] object-cover max-w-[365px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]" src="/image%2048.png" alt="Hero Background" />
      </div>


      <div className="flex flex-col items-center">
        <h1 className="font-[600] mt-[1.5rem] text-[#333333] font-prompt mb-[1rem] mr-[9rem] text-[1.6rem]">เมนูแนะนำ</h1>
        <div className="flex justify-center gap-3">
          {/* ดึง API มาใส่ในส่วนนี้ ใส่แค่ Name กับ Cal นะ */}
          {menus.length === 0 ? (
            <p>กำลังโหลดเมนู...</p>
          ) : (
            menus.slice(0, 2).map((item) => ( // ตัวอย่าง: แสดงแค่ 2 เมนูแรก
              <div
                key={item._id}
                onClick={goto}
                className="bg-white inline-block w-[155px] py-[1rem] rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer"
              >
                <div className="flex flex-col items-center">
                  {/* คุณอาจต้องเปลี่ยน src ของรูปภาพให้สัมพันธ์กับเมนูแต่ละรายการ */}
                  <img className="h-[8rem] w-[8rem]" src={item.image} alt={item.name} />
                  <div className="flex items-center">
                    <div className="w-[0.1rem] h-[2rem] mt-[0.8rem] mr-[0.4rem] ml-[0.5rem] bg-[#333333]"></div>
                    <div className="">
                      <h1 className="text-[0.9rem] w-[123px] font-bold mt-2.5 mb-1 font-prompt ">{item.name.toUpperCase()}</h1> {/*ชื่อเมนู*/}
                      <div className="flex items-baseline mt-[-0.3rem]">
                        <h1 className="text-[0.8rem] font-Unbounded ">{item.calories}</h1> {/*จำนวนแคล*/}
                        <h1 className="text-[0.5rem] ml-[0.3rem] font-Unbounded ">KCAL</h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* ถึงแค่ตรงนี้ */}
        <div className="relative">
          <h1 className="font-[600] my-[1.5rem] text-center mb-[2rem] text-[1.6rem] font-Pro text-[#333333] font-prompt">เมนูสำหรับผู้เป็นเบาหวาน</h1>
          <div className="flex items-center gap-4 bg-white pl-[0.5rem] rounded-br-2xl rounded-tl-2xl rounded-bl-[45px] rounded-tr-[45px] h-[150px] w-[330px]">
            {/* หากคุณต้องการใช้ Next/Image ควรใช้ src เป็น path ในโปรเจกต์ หรือ URL ที่ระบุ domain ใน next.config.js */}
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
          <div className="flex justify-center gap-3 my-5">
            {/* ดึง API มาใส่ในส่วนนี้ ใส่แค่ Name กับ Cal นะ */}
            {menus.length === 0 ? (
              <p>กำลังโหลดเมนู...</p>
            ) : (
              menus.slice(2, 4).map((item) => ( // ตัวอย่าง: แสดงแค่ 2 เมนูแรก
                <div
                  key={item._id}
                  onClick={goto}
                  className="bg-white inline-block w-[155px] py-[1rem] rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    {/* คุณอาจต้องเปลี่ยน src ของรูปภาพให้สัมพันธ์กับเมนูแต่ละรายการ */}
                    <img className="h-[8rem] w-[8rem]" src={item.image} alt={item.name} />
                    <div className="flex items-center">
                      <div className="w-[0.1rem] h-[2rem] mt-[0.8rem] mr-[0.4rem] ml-[0.5rem] bg-[#333333]"></div>
                      <div className="">
                        <h1 className="text-[0.9rem] w-[123px] font-bold mt-2.5 mb-1 font-prompt ">{item.name.toUpperCase()}</h1> {/*ชื่อเมนู*/}
                        <div className="flex items-baseline mt-[-0.3rem]">
                          <h1 className="text-[0.8rem] font-Unbounded ">{item.calories}</h1> {/*จำนวนแคล*/}
                          <h1 className="text-[0.5rem] ml-[0.3rem] font-Unbounded ">KCAL</h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* <div className="bg-white inline-block p-3 rounded-2xl transform transition duration-300 hover:scale-103 cursor-pointer">
              <div className="flex flex-col"> 
                <img className="h-[8rem] w-[8rem]" src='/image%2063.png' alt="Snakehead Fish" />
                <div className="flex items-center">
                  <div className="w-[0.1rem] h-[2rem] mt-[0.8rem] mr-[0.4rem] ml-[0.5rem] bg-[#333333]"></div>
                  <div className="">
                    <h1 className="text-[0.9rem] font-bold mt-2.5 mb-1 font-Unbounded w-[115px] ">SNAKEHEAD FISH</h1>
                    <div className="flex items-baseline mt-[-0.3rem]">
                      <h1 className="text-[0.8rem] font-Unbounded ">850</h1>
                      <h1 className="text-[0.5rem] ml-[0.3rem] font-Unbounded ">KCAL</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
      </div>
    </div>
  );
}