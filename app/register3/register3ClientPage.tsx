'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Register3() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id'); // 🔍 ดึง userId ที่ส่งมาจาก register2

    const [birthday, setBirthday] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            alert('ไม่พบรหัสผู้ใช้');
            return;
        }

        const res = await fetch(`/api/user/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ birthday }),
        });

        if (res.ok) {
            router.push(`/register4?id=${userId}`); // 👉 ไปหน้าถัดไป พร้อมส่ง userId ต่อ
        } else {
            alert('เกิดข้อผิดพลาดในการบันทึกวันเกิด');
        }
    };

    return (
        <div className="relative h-screen w-screen cursor-pointer flex flex-col items-center bg-gradient-to-br from-orange-300 to-orange-100">
            {/* ภาพประกอบด้านซ้ายบน */}
            <div className="absolute left-0 top-0"> {/* เพิ่ม top-0 เพื่อให้ชิดขอบบน */}
                <img src="/Group%2099.png" alt="Decoration" width={200} height={200} /> {/* กำหนด width, height */}
            </div>
            {/* ภาพประกอบด้านขวาล่าง */}
            <div className="absolute right-0 rotate-[180deg] top-[30rem]">
                <img src="/Group%2099.png" alt="Decoration" width={200} height={200} /> {/* กำหนด width, height */}
            </div>
            {/* ภาพประกอบเคลื่อนไหว */}
            <div className="absolute top-[20rem] left-[1.5rem] animate-shakeright">
                <img className='' src="/image%2084.png" alt="Decoration" width={100} height={100} /> {/* กำหนด width, height */}
            </div>
            {/* ภาพประกอบเคลื่อนไหวอีกอัน */}
            <div className="absolute top-[30rem] left-[19rem] rotate-[35deg] animate-shakeright2">
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration" width={140} height={140} /> {/* กำหนด width, height */}
            </div>

            {/* ส่วนข้อความด้านบนและ Form สำหรับ input */}
            <div className="flex flex-col items-center mt-[5rem]">
                <div className="w-full">
                    <h1 className='w-[300px] text-center text-[#333333] mt-2 font-prompt font-[500] text-3xl'>แล้ววันเกิดของคุณล่ะ
                        คือวันไหน?</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex mt-[1.5rem] justify-center items-center font-prompt z-30">
                    {/* DatePicker สำหรับใส่วันเกิด */}
                    <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        required
                        className="p-[0.8rem] px-[0.8rem] rounded-3xl border-[#333333] border-2 bg-white ml-[0.5rem]" // ใช้คลาส CSS เดียวกัน
                    />

                    {/* ปุ่ม Submit */}
                    <button
                        type='submit' // ใช้ type="submit" เพื่อให้ Form รับรู้
                        className='bg-grey-400 w-[45px] p-[0.8rem] transition hover:scale-105 duration-300 cursor-pointer flex items-center justify-center rounded-4xl border-[#333333] border-2 ml-[0.5rem] h-[45px]'
                    >
                        <img src="/image%2082.png" alt="Submit" width={24} height={24} /> {/* ใช้ Image component และกำหนด width, height */}
                    </button>
                </form>
            </div>

            {/* ----------------------------------------------------- */}
            {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (จัดกลางแนวตั้ง, ชิดขวา, กินขอบ) */}
            {/* ----------------------------------------------------- */}
            <div className="flex justify-center z-10 mt-[1rem] overflow-hidden animate-sizeUpdown">
                <img
                    src="/image%2087.png"
                    alt='Decor'
                    // กำหนดความกว้างและความสูงคงที่
                    className="w-auto h-[430px] object-cover" // เพิ่ม object-cover เพื่อให้รูปภาพครอบคลุมพื้นที่โดยไม่บิดเบี้ยว
                    width={1000} // กำหนด width ที่เหมาะสมกับ w-full, อาจจะต้องปรับตามขนาดจริง
                    height={540} // กำหนด height ตาม className
                />
            </div>

            {/* ส่วนล่างสุด (เมนู/ต่อไป) */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt">
                <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
                    {/* ถ้ามีปุ่ม "ต่อไป" หรือเนื้อหาอื่น ๆ ในส่วนนี้ ให้เพิ่มได้เลย */}
                </div>
            </div>
        </div>
    );
}