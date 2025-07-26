'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';


export default function Home() {
    const router = useRouter();
    const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
    const [isNextAnimating, setIsNextAnimating] = useState(false);
    const [isMenuAnimating, setIsMenuAnimating] = useState(false);

    useEffect(() => {
        // ตรวจสอบ Local Storage เมื่อ Component โหลดครั้งแรก
        // โค้ดนี้จะทำงานฝั่ง Client เท่านั้น
        if (typeof window !== 'undefined') {
            const userId = localStorage.getItem('userId');
            setIsRegistered(!!userId); // ถ้ามี userId จะเป็น true, ถ้าไม่มีจะเป็น false
        }
    }, []); // ให้ทำงานแค่ครั้งเดียวเมื่อ Component mount

    // ฟังก์ชันสำหรับจัดการการคลิกปุ่ม "ต่อไป" และ "เมนู"
    const handleNavigationClick = (buttonType: 'next' | 'menu') => {
        if (isRegistered === null) {
            console.log("Checking registration status, please wait...");
            return;
        }

        // Set the appropriate animation state based on buttonType
        if (buttonType === 'next') {
            setIsNextAnimating(true);
        } else {
            setIsMenuAnimating(true);
        }

        // Animation duration (should match your CSS animation duration, e.g., 0.3s)
        const animationDuration = 300; // milliseconds

        setTimeout(() => {
            // Reset animation state after the delay (optional, but good practice if not immediately navigating)
            if (buttonType === 'next') {
                setIsNextAnimating(false);
            } else {
                setIsMenuAnimating(false);
            }

            // Navigate based on registration status
            if (isRegistered) {
                router.push("/login");
            } else {
                router.push("/register1");
            }
        }, animationDuration);
    };

    // คุณอาจจะเพิ่ม Loader หรือ UI อื่นๆ ในขณะที่กำลังตรวจสอบ isRegistered
    if (isRegistered === null) {
        return (
            <div className="relative h-[731px] w-screen overflow-hidden flex flex-col items-center justify-center
                bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700 font-prompt">
                <div className="absolute left-0">
                    <img src="/Group%2099.png" alt="Decoration"></img>
                </div>
                <div className="absolute right-0 rotate-[180deg] top-[30rem]">
                    <img src="/Group%2099.png" alt="Decoration"></img>
                </div>
                <div className="absolute top-[34rem] left-[1.5rem] animate-shakeright">
                    <img className='' src="/image%2084.png" alt="Decoration"></img>
                </div>
                <div className="absolute top-[3rem] left-[19rem] rotate-[35deg] animate-shakeright2">
                    <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
                </div>
                {/* ส่วนสีพื้นหลัง */}
                <img className='animate-sizeUpdown2 mb-[1.5rem]' src="/image%2069.png"></img>
                <p className="z-10">กำลังเข้าสู่เว็ปไซต์...</p>
            </div>
        );
    }

    return (
        <div className="relative h-[731px] w-screen flex flex-col overflow-hidden items-center bg-gradient-to-br from-orange-300 to-orange-100">
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
                    <h1 className='text-[#FF4545] font-prompt font-[600] text-7xl animate-dopdop'>ข้าวขาว</h1>
                    <h1 className='w-[200px] text-[#333333] mt-2 font-prompt font-[500] text-2xl'>ศัตรูของคนไทย โดยไม่รู้ตัว</h1>
                </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (จัดกลางแนวตั้ง, ชิดขวา, กินขอบ) */}
            {/* ----------------------------------------------------- */}
            <div className="absolute right-0 top-[25rem] -translate-y-55 transform translate-x-23 md:translate-x-12 ">
                {/* Mr.Rice bubble */}
                <div className="bg-[#f1c783] opacity-50 absolute top-[14rem] left-[-1rem] border-white border-2 inline-flex p-[1rem] px-[1.7rem] font-Unbounded text-[#333333] rounded-4xl z-10">
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
            <div className="absolute top-[591px] left-0 shadow-3xl right-0 flex justify-center font-prompt">
                <div className="bg-white w-[500px] px-[4rem] py-[3rem] rounded-t-4xl shadow-lg flex justify-between">
                    {/* ปุ่ม "ต่อไป" - เรียก handleNavigationClick เพื่อตรวจสอบสถานะ */}
                    <div onClick={() => handleNavigationClick('next')} className={`flex relative items-center cursor-pointer ${isNextAnimating ? 'animate-press' : ''}`}>
                        <h1 className={`bg-[#ff9e303e] text-2xl rounded-4xl py-[0.3rem] px-[1.5rem] ${isNextAnimating ? 'animate-flash-fill' : ''}`}>ต่อไป</h1>
                        <img className='absolute left-[5.3rem] p-[0.5rem] w-[2.5rem] h-[2.5rem] rounded-4xl bg-[#FFBA9F] ' src="/image%2082.png" alt='Next'></img>
                    </div>
                    {/* ปุ่ม "เมนู" - เรียก handleNavigationClick เพื่อตรวจสอบสถานะ */}
                    <div onClick={() => handleNavigationClick('menu')} className={`flex relative items-center pr-[1rem] cursor-pointer ${isMenuAnimating ? 'animate-press' : ''}`}>
                        <h1 className={`bg-[#ff9e303e] text-2xl rounded-4xl py-[0.3rem] px-[1.5rem] ${isMenuAnimating ? 'animate-flash-fill' : ''}`}>เมนู</h1>
                        <img className='absolute left-[4.5rem] p-[0.5rem] w-[2.5rem] h-[2.5rem] rounded-4xl bg-[#FFBA9F] ' src="/image%2083.png" alt='Next'></img>
                    </div>
                </div>
            </div>
        </div>
    );
}