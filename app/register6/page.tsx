'use client';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useState, useRef, useEffect } from "react";
import React from 'react';

import Image from "next/image";

export default function Register2() {
    const router = useRouter();

    const goto = () => {
        router.push("/register2");
    };

    const [selectedGoals, setSelectedGoals] = useState<string[]>(['ควบคุมน้ำหนัก']);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const goals: string[] = [
        'เพิ่มกล้ามเนื้อ',
        'ลดน้ำหนัก',
        'ควบคุมน้ำหนัก',
        'ลดไขมัน',
        'ลีน'
    ];

    const handleGoalToggle = (goal: string, index: number): void => {
        setSelectedGoals(prev => {
            if (prev.includes(goal)) {
                return prev.filter(g => g !== goal);
            } else {
                // Auto scroll to selected item
                scrollToSelected(index);
                return [...prev, goal];
            }
        });
    };

    const scrollToSelected = (index: number): void => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const chipWidth = 140; // ประมาณความกว้างของแต่ละ chip + spacing
            const scrollLeft = index * chipWidth - container.clientWidth / 2 + chipWidth / 2;

            container.scrollTo({
                left: Math.max(0, scrollLeft),
                behavior: 'smooth'
            });
        }
    };

    const handleSubmit = (): void => {
        console.log('Selected goals:', selectedGoals);

        // API call example
        // const submitGoals = async () => {
        //   try {
        //     const response = await fetch('/api/user/goals', {
        //       method: 'POST',
        //       headers: { 'Content-Type': 'application/json' },
        //       body: JSON.stringify({ goals: selectedGoals })
        //     });
        //     const data = await response.json();
        //     if (data.success) {
        //       // Handle success
        //     }
        //   } catch (error) {
        //     console.error('Error:', error);
        //   }
        // };
        // submitGoals();
    };

    // Auto scroll to first selected item on mount
    useEffect(() => {
        if (selectedGoals.length > 0) {
            const firstSelectedIndex = goals.findIndex(goal => selectedGoals.includes(goal));
            if (firstSelectedIndex !== -1) {
                setTimeout(() => scrollToSelected(firstSelectedIndex), 100);
            }
        }
    }, []);


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
                    <h1 className=' text-center text-[#333333] mt-2 font-prompt font-[600] text-3xl'>เลือกเป้าหมายด้านสุขภาพ</h1>
                </div>
                <div className="flex-1 flex items-start justify-center pt-11">
                    <div className="w-full max-w-sm">
                        {/* Scrollable Chips */}
                        <div
                            ref={scrollContainerRef}
                            className="overflow-x-auto scrollbar-hide"
                        >
                            <div className="flex space-x-3 px-4 pb-4" style={{ width: 'max-content' }}>
                                {goals.map((goal, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleGoalToggle(goal, index)}
                                        className={`
                    relative flex items-center justify-center px-4 py-3 rounded-2xl min-w-max transition-all duration-200 shadow-sm whitespace-nowrap
                    ${selectedGoals.includes(goal)
                                                ? 'bg-white border-2 border-orange-400 shadow-md scale-105'
                                                : 'bg-white/80 border-2 border-gray-200 hover:border-gray-300 hover:scale-102'
                                            }
                  `}
                                    >
                                        <span className={`
                    text-sm font-medium
                    ${selectedGoals.includes(goal) ? 'text-gray-800' : 'text-gray-600'}
                  `}>
                                            {goal}
                                        </span>

                                        {selectedGoals.includes(goal) && (
                                            <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-bounce">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex mt-[1rem] justify-center">
                            <button className='bg-white py-[0.5rem] px-[1rem] rounded-2xl'>ถัดไป</button>
                            <button type='submit' className='bg-grey-400 w-[45px] transition hover:scale-105 duration-300 cursor-pointer flex items-center justify-center rounded-4xl border-[#333333] border-2 ml-[0.5rem] h-[45px]'><img src="/image%2082.png"></img></button>
                        </div>

                    </div>

                    <div className="absolute right-0 top-[32rem] z-102 -translate-y-55 transform translate-x-35 md:translate-x-12">
                        
                        <img
                            src="/image%20102.png"
                            alt='Decor'
                            // กำหนดความกว้างและความสูงคงที่
                            className="w-[430px] h-[540px]"
                        />
                    </div>


                    {/* ส่วนล่างสุด (เมนู/ต่อไป) */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt">
                        <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}