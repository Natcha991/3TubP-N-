'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

import Image from "next/image";

export default function Home() {
    const router = useRouter();

    const goto = () => {
        router.push("/register1");
    };

    return (
        <div className="relative h-screen w-screen flex flex-col items-center bg-gradient-to-br from-orange-300 to-orange-100">
            <div className="absolute left-0">
                <img src="/group%2099.png"></img>
            </div>
            <div className="absolute right-0 rotate-[180deg] top-[30rem]">
                <img src="/group%2099.png"></img>
            </div>
            <div className="absolute top-[20rem] left-[1.5rem]  animate-shakeright">
                <img className='' src="/image%2084.png"></img>
            </div>
            <div className="absolute top-[3rem] left-[19rem] rotate-[35deg] animate-shakeright2">
                <img src="/image%2084.png" className='w-[140px]'></img>
            </div>

            {/* ส่วนข้อความด้านบน */}
            <div className="block mt-[8rem]">
                <div className="w-[300px]">
                    <h1 className='text-[#FF4545] font-prompt font-[600] text-7xl'>10 บาท</h1>
                    <h1 className='w-[200px] text-[#333333] mt-2 font-prompt font-[500] text-2xl'>เปลี่ยนชีวิต คุณได้ด้วยการกิน</h1>
                </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (จัดกลางแนวตั้ง, ชิดขวา, กินขอบ) */}
            {/* ----------------------------------------------------- */}
            <div className="absolute right-0 top-1/2 -translate-y-55 transform translate-x-23 md:translate-x-12">
                {/* Mr.Rice bubble */}
                <div className="bg-[#f1c783a4] absolute top-[17rem] left-[-1rem] border-white border-2 inline-flex p-[1rem] px-[1.7rem] font-Unbounded text-[#333333] rounded-4xl z-10">
                    Mr.Rice
                </div>
                <img
                    src="/image%2081.png"
                    alt='Decor'
                    // กำหนดความกว้างและความสูงคงที่
                    className="w-[350px] h-[540px]" 
                />
            </div>
            {/* ----------------------------------------------------- */}


            {/* ส่วนล่างสุด (เมนู/ต่อไป) */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt">
                <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
                    <div onClick={goto} className="flex items-center">
                        <h1 className='bg-[#ff9e303e] text-2xl rounded-4xl py-[0.3rem] px-[1.5rem]'>ต่อไป</h1>
                        <img className='absolute left-[9.2rem] p-[0.5rem] w-[2.5rem] h-[2.5rem] rounded-4xl bg-[#FFBA9F] ' src="/image%2082.png" alt='Next'></img>
                    </div> 
                    <div className="flex items-center pr-[1rem]">
                        <h1 className='bg-[#ff9e303e] text-2xl rounded-4xl py-[0.3rem] px-[1.5rem]'>เมนู</h1>
                        <img className='absolute left-[20.8rem] p-[0.5rem] w-[2.5rem] h-[2.5rem] rounded-4xl bg-[#FFBA9F] ' src="/image%2083.png" alt='Next'></img>
                    </div>
                </div>
            </div>
        </div>
    );
}