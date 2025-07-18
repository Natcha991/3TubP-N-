'use client';
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Home() {
    const router = useRouter();

    const goto = () => {
        router.push("/register2");
    };

    return (
        // ใช้ h-screen เพื่อให้ div หลักสูงเท่า viewport
        // ใช้ overflow-hidden เพื่อซ่อน scrollbar ที่อาจจะเกิดจากการล้น
        // และ flex flex-col เพื่อจัดเรียงเนื้อหาหลัก
        <div onClick={goto} className="relative h-screen w-screen cursor-pointer flex flex-col items-center bg-gradient-to-br from-orange-300 to-orange-100 overflow-hidden">

            {/* รูปภาพตกแต่งด้านข้าง/มุม - ยังคงใช้ absolute ได้ */}
            <div className="absolute left-0 top-0">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            <div className="absolute right-0 rotate-[180deg] top-[30rem]">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            <div className="absolute top-[20rem] left-[1.5rem] animate-shakeright">
                <img src="/image%2084.png" alt="Decoration" />
            </div>
            <div className="absolute top-[30rem] left-[19rem] rotate-[35deg] animate-shakeright2">
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration" />
            </div>

            {/* ส่วนเนื้อหาหลักที่ต้องการให้เรียงตามปกติ */}
            {/* ใช้ flex-col เพื่อจัดเรียงลูกๆ ในแนวตั้ง */}
            {/* กำหนด padding-top เพื่อเว้นที่สำหรับข้อความ */}
            <div className="flex flex-col items-center justify-between h-full pt-[6rem] pb-[13rem]"> {/* เพิ่ม h-full และปรับ pb ให้พอดี */}
                {/* ส่วนข้อความด้านบน */}
                <div className="flex flex-col items-center mb-4">
                    <div className="w-full">
                        <h1 className='w-[300px] text-center text-[#333333] font-prompt font-[500] text-3xl animate-dopdop'>เดี๋ยวก่อน!! ก่อนจะไปดูเมนู ผมขอถามอะไรคุณก่อนสิ</h1>
                    </div>
                </div>

                {/* ----------------------------------------------------- */}
                {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (จัดกลางแนวตั้ง, ชิดขวา, กินขอบ) */}
                {/* ----------------------------------------------------- */}
                <div className="flex justify-center z-10 animate-sizeUpdown">
                    <img
                        src="/image%2085.png"
                        alt='Decor'
                        className="w-auto h-[430px] object-cover" // รักษาสูง 430px และใช้ object-cover
                    />
                </div>

                {/* Spacer หรือ Element ว่างเพื่อดันรูปภาพขึ้นไป */}
                {/* หากต้องการให้รูปภาพอยู่ตรงกลางระหว่างข้อความและ footer */}
                <div className="flex-grow"></div> {/* ตัวนี้จะดัน content ด้านบนให้ขึ้นไป และ content ด้านล่างให้ลงมา */}

            </div>

            {/* ส่วนล่างสุด (เมนู/ต่อไป) - ยังคงใช้ absolute เพื่อให้ติดขอบล่าง */}
            {/* ต้องมั่นใจว่า bottom-0 ทำให้มันอยู่ชิดขอบล่างของ parent div หลัก (h-screen) */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt">
                <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
                    {/* เนื้อหาในส่วนล่างสุด */}
                </div>
            </div>
        </div>
    );
}