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

            <div className="flex flex-col z-100 items-center mt-[4rem]">
                <div className="w-full">
                    <h1 className='w-[350px] text-center text-[#333333] mt-2 font-prompt font-[600] text-3xl'>เลือกเป้าหมายด้านสุขภาพ</h1>
                </div> 
            </div> 

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