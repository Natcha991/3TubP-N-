'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function Home() {
    const router = useRouter();
    const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
    const [isNextAnimating, setIsNextAnimating] = useState(false);
    const [isMenuAnimating, setIsMenuAnimating] = useState(false);
    const [appHeight, setAppHeight] = useState('100vh'); // เพิ่ม state สำหรับความสูงจริงของจอ

    useEffect(() => {
        // สำหรับจัดการความสูงของจอจริงบนมือถือ (Safari/Chrome Mobile UI)
        const updateAppHeight = () => {
            setAppHeight(`${window.innerHeight}px`);
        };

        if (typeof window !== 'undefined') {
            const userId = localStorage.getItem('userId');
            setIsRegistered(!!userId);

            // Set initial height
            updateAppHeight();
            // Add resize listener
            window.addEventListener('resize', updateAppHeight);
        }

        // Clean up event listener
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', updateAppHeight);
            }
        };
    }, []);

    const handleNavigationClick = (buttonType: 'next' | 'menu') => {
        if (isRegistered === null) {
            console.log("Checking registration status, please wait...");
            return;
        }

        if (buttonType === 'next') {
            setIsNextAnimating(true);
        } else {
            setIsMenuAnimating(true);
        }

        const animationDuration = 300;

        setTimeout(() => {
            if (buttonType === 'next') {
                setIsNextAnimating(false);
            } else {
                setIsMenuAnimating(false);
            }

            if (isRegistered) {
                router.push("/login");
            } else {
                router.push("/register1");
            }
        }, animationDuration);
    };

    if (isRegistered === null) {
        return (
            <div
                className="relative w-screen overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700 font-prompt"
                style={{ height: appHeight }} // ใช้ appHeight ที่คำนวณจาก JS
            >
                {/* Decoration images - อาจจะต้องปรับขนาดด้วย w-auto หรือ max-w-[] */}
                <div className="absolute left-0 **w-[40%] max-w-[200px]**"> {/* ปรับขนาดตามความเหมาะสม */}
                    <img src="/Group%2099.png" alt="Decoration"></img>
                </div>
                <div className="absolute right-0 rotate-[180deg] top-[30rem] **w-[40%] max-w-[200px]**">
                    <img src="/Group%2099.png" alt="Decoration"></img>
                </div>
                <div className="absolute top-[34rem] left-[1.5rem] animate-shakeright **w-[20%] max-w-[100px]**">
                    <img className='' src="/image%2084.png" alt="Decoration"></img>
                </div>
                <div className="absolute top-[3rem] left-[19rem] rotate-[35deg] animate-shakeright2 **w-[30%] max-w-[140px]**">
                    <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
                </div>
                {/* ส่วนสีพื้นหลัง */}
                <img className='animate-sizeUpdown2 mb-[1.5rem] **max-h-[30vh]**' src="/image%2069.png" alt="Background"></img> {/* จำกัดความสูง */}
                <p className="z-10">กำลังเข้าสู่เว็ปไซต์...</p>
            </div>
        );
    }

    return (
        <div
            className="relative w-screen flex flex-col overflow-hidden items-center bg-gradient-to-br from-orange-300 to-orange-100"
            style={{ height: appHeight }} // ใช้ appHeight ที่คำนวณจาก JS
        >
            {/* Decoration images - ปรับขนาดและตำแหน่งให้เหมาะสมกับ viewport */}
            <div className="absolute left-0 **w-[40%] max-w-[200px]**">
                <img src="/Group%2099.png" alt="Decoration"></img>
            </div>
            <div className="absolute right-0 rotate-[180deg] top-[30rem] **w-[40%] max-w-[200px]**">
                <img src="/Group%2099.png" alt="Decoration"></img>
            </div>
            <div className="absolute top-[20rem] left-[1.5rem] animate-shakeright **w-[20%] max-w-[100px]**">
                <img className='' src="/image%2084.png" alt="Decoration"></img>
            </div>
            <div className="absolute top-[3rem] left-[19rem] rotate-[35deg] animate-shakeright2 **w-[30%] max-w-[140px]**">
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
            </div>

            {/* ส่วนข้อความด้านบน */}
            <div className="block mt-[8rem] **max-h-[30vh] overflow-hidden**"> {/* อาจจะใช้ flex-grow แทน mt-[8rem] เพื่อการจัดวางที่ยืดหยุ่น */}
                <div className="w-[300px]">
                    <h1 className='text-[#FF4545] font-prompt font-[600] text-7xl animate-dopdop'>ข้าวขาว</h1>
                    <h1 className='w-[200px] text-[#333333] mt-2 font-prompt font-[500] text-2xl'>ศัตรูของคนไทย โดยไม่รู้ตัว</h1>
                </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (จัดกลางแนวตั้ง, ชิดขวา, กินขอบ) */}
            {/* ----------------------------------------------------- */}
            <div className="absolute right-0 top-[25rem] -translate-y-55 transform translate-x-23 md:translate-x-12 **max-h-[60vh] overflow-hidden flex items-end**"> {/* จำกัดความสูงและจัดให้ชิดด้านล่างของ div นี้ */} 
                <img
                    src="/image%2081.png"
                    alt='Decor'
                    className="w-auto **h-full object-contain** animate-sizeUpdown" // h-full จะทำให้รูปสูงเท่า parent div
                />
            </div>
            {/* ----------------------------------------------------- */}

            {/* ส่วนล่างสุด (เมนู/ต่อไป) */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt **z-20**"> {/* เพิ่ม z-index ให้ปุ่มอยู่บนสุด */}
                <div className="bg-white w-[500px] px-[4rem] py-[3rem] rounded-t-4xl flex justify-between">
                    <div onClick={() => handleNavigationClick('next')} className={`flex relative items-center cursor-pointer ${isNextAnimating ? 'animate-press' : ''}`}>
                        <h1 className={`bg-[#ff9e303e] text-2xl rounded-4xl py-[0.3rem] px-[1.5rem] ${isNextAnimating ? 'animate-flash-fill' : ''}`}>ต่อไป</h1>
                        <img className='absolute left-[5.3rem] p-[0.5rem] w-[2.5rem] h-[2.5rem] rounded-4xl bg-[#FFBA9F] ' src="/image%2082.png" alt='Next'></img>
                    </div>
                    <div onClick={() => handleNavigationClick('menu')} className={`flex relative items-center pr-[1rem] cursor-pointer ${isMenuAnimating ? 'animate-press' : ''}`}>
                        <h1 className={`bg-[#ff9e303e] text-2xl rounded-4xl py-[0.3rem] px-[1.5rem] ${isMenuAnimating ? 'animate-flash-fill' : ''}`}>เมนู</h1>
                        <img className='absolute left-[4.5rem] p-[0.5rem] w-[2.5rem] h-[2.5rem] rounded-4xl bg-[#FFBA9F] ' src="/image%2083.png" alt='Next'></img>
                    </div>
                </div>
            </div>
        </div>
    );
}