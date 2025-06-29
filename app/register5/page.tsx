'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

import Image from "next/image";

export default function register2() {
    const router = useRouter();

    const goto = () => {
        router.push("/register2");
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
            <div className="flex flex-col items-center mt-[8rem]">
                <div className="w-full">
                    <h1 className='w-[300px] text-center text-[#333333] mt-2 font-prompt font-[500] text-3xl'>ทีนี้ ผมอยากรู้น้ำหนัก ส่วนสูงของคุณหน่อย</h1>
                </div>
                {/* แก้แค่ส่วนนี้ */}
                <div className="font-prompt flex flex-col items-center justify-center mt-[2rem]">
                    <div className="flex gap-2">
                        <input className='rounded-3xl w-[130px] border-[#333333] border-2 p-[0.5rem]   bg-white' placeholder='น้ำหนัก'></input>
                        <input className=' rounded-3xl w-[130px] border-[#333333] border-2 p-[0.5rem]  bg-white' placeholder='ส่วนสูง'></input>
                    </div>
                    <div className="flex mt-[1rem]">
                        <button className='bg-white py-[0.5rem] px-[1rem] rounded-2xl'>ถัดไป</button>
                        <button type='submit' className='bg-grey-400 w-[45px] transition hover:scale-105 duration-300 cursor-pointer flex items-center justify-center rounded-4xl border-[#333333] border-2 ml-[0.5rem] h-[45px]'><img src="/image%2082.png"></img></button>
                    </div>
                </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (จัดกลางแนวตั้ง, ชิดขวา, กินขอบ) */}
            {/* ----------------------------------------------------- */}
            <div className="flex justify-center z-10 mt-[0.2rem] overflow-hidden">
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