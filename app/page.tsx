'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';


export default function Home() {
    const router = useRouter();
    const [isRegistered, setIsRegistered] = useState<boolean | null>(null); // สถานะว่าเคยลงทะเบียนแล้วหรือยัง

    useEffect(() => {
        // ตรวจสอบ Local Storage เมื่อ Component โหลดครั้งแรก
        // โค้ดนี้จะทำงานฝั่ง Client เท่านั้น
        if (typeof window !== 'undefined') {
            const userId = localStorage.getItem('userId');
            setIsRegistered(!!userId); // ถ้ามี userId จะเป็น true, ถ้าไม่มีจะเป็น false
        }
    }, []); // ให้ทำงานแค่ครั้งเดียวเมื่อ Component mount

    // ฟังก์ชันสำหรับจัดการการคลิกปุ่ม "ต่อไป" และ "เมนู"
    const handleNavigationClick = () => {
        if (isRegistered === null) {
            // ยังไม่โหลดสถานะการลงทะเบียน อาจจะรอสักครู่หรือแสดง Loading
            console.log("Checking registration status, please wait...");
            return; // ไม่ทำอะไรต่อจนกว่าสถานะจะพร้อม
        }

        if (isRegistered) {
            // ถ้าเคยลงทะเบียนแล้ว ให้ไปหน้า Login
            router.push("/login");
        } else {
            // ถ้ายังไม่เคยลงทะเบียน ให้ไปหน้า Register1
            router.push("/register1");
        }
    };

    // คุณอาจจะเพิ่ม Loader หรือ UI อื่นๆ ในขณะที่กำลังตรวจสอบ isRegistered
    if (isRegistered === null) {
        return (
            <div className="overflow-hidden">
        <div className="absolute left-0">
          <img src="/group%2099.png" alt="Decoration"></img>
        </div>
        <div className="absolute right-0 rotate-[180deg] top-[30rem]">
          <img src="/group%2099.png" alt="Decoration"></img>
        </div>
        <div className="absolute top-[44rem] left-[1.5rem] animate-shakeright">
          <img className='' src="/image%2084.png" alt="Decoration"></img>
        </div>
        <div className="absolute top-[3rem] left-[19rem] rotate-[35deg] animate-shakeright2">
          <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
        </div>
        <div className="flex flex-col font-prompt min-h-screen items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700">
          <img className='animate-sizeUpdown2 mb-[1.5rem]' src="/image%2069.png"></img>
          กำลังเข้าสู่เว็ปไซต์..
        </div>
      </div>
        );
    }

    return (
        <div className="relative h-screen w-screen flex flex-col items-center bg-gradient-to-br from-orange-300 to-orange-100">
            <div className="absolute left-0">
                <img src="/Group%2099.png" alt="Decoration"></img>
            </div>
            <div className="absolute right-0 rotate-[180deg] top-[30rem]">
                <img src="/Group%2099.png" alt="Decoration"></img>
            </div>
            <div className="absolute top-[20rem] left-[1.5rem] animate-shakeright">
                <img className='' src="/image%2084.png" alt="Decoration"></img>
            </div>
            <div className="absolute top-[3rem] left-[19rem] rotate-[35deg] animate-shakeright2">
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
            </div>

            {/* ส่วนข้อความด้านบน */}
            <div className="block mt-[8rem]">
                <div className="w-[300px]">
                    <h1 className='text-[#FF4545] font-prompt font-[600] text-7xl animate-dopdop'>10 บาท</h1>
                    <h1 className='w-[200px] text-[#333333] mt-2 font-prompt font-[500] text-2xl'>เปลี่ยนชีวิต คุณได้ด้วยการกิน</h1>
                </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (จัดกลางแนวตั้ง, ชิดขวา, กินขอบ) */}
            {/* ----------------------------------------------------- */}
            <div className="absolute right-0 top-[25rem] -translate-y-55 transform translate-x-23 md:translate-x-12 ">
                {/* Mr.Rice bubble */}
                <div className="bg-[#f1c783a4] absolute top-[14rem] left-[-1rem] border-white border-2 inline-flex p-[1rem] px-[1.7rem] font-Unbounded text-[#333333] rounded-4xl z-10">
                    Mr.Rice
                </div>
                <img
                    src="/image%2081.png"
                    alt='Decor'
                    // กำหนดความกว้างและความสูงคงที่
                    className="w-auto h-[470px] animate-sizeUpdown"
                />
            </div>
            {/* ----------------------------------------------------- */}


            {/* ส่วนล่างสุด (เมนู/ต่อไป) */}
            <div className="absolute bottom-0 left-0 shadow-3xl right-0 flex justify-center font-prompt">
                <div className="bg-white w-[500px] px-[4rem] py-[3rem] rounded-t-4xl shadow-lg flex justify-between">
                    {/* ปุ่ม "ต่อไป" - เรียก handleNavigationClick เพื่อตรวจสอบสถานะ */}
                    <div onClick={handleNavigationClick} className="flex items-center cursor-pointer">
                        <h1 className='bg-[#ff9e303e] text-2xl rounded-4xl py-[0.3rem] px-[1.5rem]'>ต่อไป</h1>
                        <img className='absolute left-[9.2rem] p-[0.5rem] w-[2.5rem] h-[2.5rem] rounded-4xl bg-[#FFBA9F] ' src="/image%2082.png" alt='Next'></img>
                    </div>
                    {/* ปุ่ม "เมนู" - เรียก handleNavigationClick เพื่อตรวจสอบสถานะ */}
                    <div onClick={handleNavigationClick} className="flex items-center pr-[1rem] cursor-pointer">
                        <h1 className='bg-[#ff9e303e] text-2xl rounded-4xl py-[0.3rem] px-[1.5rem]'>เมนู</h1>
                        <img className='absolute left-[19.8rem] p-[0.5rem] w-[2.5rem] h-[2.5rem] rounded-4xl bg-[#FFBA9F] ' src="/image%2083.png" alt='Next'></img>
                    </div>
                </div>
            </div>
        </div>
    );
}