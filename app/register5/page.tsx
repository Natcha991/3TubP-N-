'use client';
export const dynamic = 'force-dynamic'
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Register5() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id');

    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            alert('ไม่พบรหัสผู้ใช้');
            return;
        }

        const res = await fetch(`/api/user/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                weight: Number(weight),
                height: Number(height),
            }),
        });

        if (res.ok) {
            router.push(`/register6?id=${userId}`); // ✅ ไปหน้าเก็บเป้าหมาย
        } else {
            alert('❌ เกิดข้อผิดพลาดในการบันทึกน้ำหนัก/ส่วนสูง');
        }
    };

    return (
        <div className="relative h-screen w-screen cursor-pointer flex flex-col items-center bg-gradient-to-br from-orange-300 to-orange-100">
            <div className="absolute left-0">
                <img src="/group%2099.png"></img>
            </div>
            <div className="absolute right-0 rotate-[180deg] top-[30rem]">
                <img src="/group%2099.png"></img>
            </div>
            <div className="absolute top-[20rem] left-[1.5rem]  animate-shakeright">
                <img className='' src="/image%2084.png"></img>
            </div>
            <div className="absolute top-[35rem] left-[19rem] rotate-[35deg] animate-shakeright2">
                <img src="/image%2084.png" className='w-[140px]'></img>
            </div>

            {/* ส่วนข้อความด้านบน */}
            <div className="flex flex-col items-center mt-[5rem]">
                <div className="w-full">
                    <h1 className='w-[300px] text-center text-[#333333] mt-2 font-prompt font-[500] text-3xl'>ทีนี้ ผมอยากรู้น้ำหนัก ส่วนสูงของคุณหน่อย</h1>
                </div>
                {/* แก้แค่ส่วนนี้ */}
                <form className="font-prompt flex flex-col items-center justify-center mt-[3rem] z-100" onSubmit={handleSubmit} >
                    <div className="flex gap-2">
                        <input type="number"
                            placeholder="น้ำหนัก (kg)"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            required className='rounded-3xl w-[130px] border-[#333333] border-2 p-[0.5rem]   bg-white'></input>
                        <input
                            type="number"
                            placeholder="ส่วนสูง (cm)"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            required
                            className=' rounded-3xl w-[130px] border-[#333333] border-2 p-[0.5rem]  bg-white'></input>
                    </div>
                    <button
                        type='submit' // เรียก handleSubmit เมื่อคลิก
                        className='bg-orange-400 mt-5 z-200 text-white py-2 px-4 rounded-full w-40 flex justify-center items-center gap-2' // ปรับปุ่มให้เป็นสไตล์ที่ใช้บ่อย
                    >
                        ถัดไป {/* เพิ่มไอคอน */}
                    </button>
                </form>
            </div>

            {/* ----------------------------------------------------- */}
            {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (จัดกลางแนวตั้ง, ชิดขวา, กินขอบ) */}
            {/* ----------------------------------------------------- */}
            <div className="flex justify-center z-10 overflow-hidden mt-[1rem] animate-sizeUpdown">
                <img
                    src="/image%20100.png"
                    alt='Decor'
                    // กำหนดความกว้างและความสูงคงที่
                    className="w-full h-[540px]"
                />
            </div>


            {/* ส่วนล่างสุด (เมนู/ต่อไป) */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt">
                <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
                </div>
            </div>
        </div>
    );
}