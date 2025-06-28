'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function IngredientPage() {

    const router = useRouter()

    const goto = () => {
        router.push("/menu")
    }

    const gotoChatbot = () => {
        router.push("/chatbot")
    }

    return (
        <div className="relative font-prompt">
            <div className="absolute h-[400px] w-full z-[-2] [mask-image:linear-gradient(to_bottom,black_60%,transparent)] bg-white"></div>
            <div className="absolute top-20 z-[-1]">
                <img className="h-[400px]" src="/image%2070.png" alt=""></img>
            </div>
            <div className="absolute z-1 flex justify-between m-[2rem] items-center w-[85%]">
                <div onClick={goto} className="bg-white h-[50px] flex justify-center cursor-pointer transform transition duration-300 hover:scale-103 items-center w-[50px] rounded-full shadow-grey shadow-xl">
                    <img className="h-[15px]" src="Group%2084.png" alt=""></img>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <div className="font-prompt font-[600] text-center mt-[4rem] mb-[-2rem]">
                    <h1 className="text-4xl text-[#333333]">ข้าวกล้อง</h1>
                    <h1 className="text-[#333333]">ตราสามทัพพี</h1>
                </div>
                <div className="">
                    <img src="/image%2068.png" alt=""></img>
                </div>
                <div className="w-[300px]">
                    <div className="relative">
                        <h1 className="m-[0.5rem] text-[#611E1E]">ประมาณ 42 บาท/กก.</h1>
                        <div className="absolute top-[-5.1rem] left-[14rem]">
                            <div className="w-[150px] h-[40px] z-[-1] absolute top-[1.5rem] shadow-grey shadow-xl left-[-7rem] p-[0.5rem] flex items-center bg-white rounded-md">
                                <h1 className="text-[0.7rem]">เป็นวัตถุดิบที่มีคุณค่ามาก!</h1>
                            </div>
                            <img onClick={gotoChatbot} className="mt-[3rem] animate-pulse cursor-pointer transform hover:scale-105 duration-300" src="/image%2069.png" alt=""></img>
                        </div>
                    </div>
                    <div className="h-full p-[1rem] rounded-2xl border-[#FFAC64] bg-[#FFFAD2] border-2">
                        <h1 className="text-[#953333] text-[0.8rem]">ข้าวที่ยังมีเปลือกชั้นนอก เต็มไปด้วยใยอาหารและวิตามิน ช่วยให้อิ่มนาน ระบบย่อยดี เหมาะกับคนรักสุขภาพที่อยากกินง่าย ๆ แต่ได้ประโยชน์ครบ!</h1>
                    </div>
                </div>
                <div className="relative w-[300px] flex justify-center">
                    <div className="w-full max-w-[360px]">
                        <h1 className="font-[600] text-[#333333] mt-[1.5rem] mb-[0.8rem] text-[1.25rem]">แหล่งจำหน่ายใกล้คุณ</h1>
                        <div className="flex gap-4 overflow-x-auto scrollbar-none">
                            <div className="flex bg-white rounded-2xl border-2 border-[#C9AF90] w-[250px] items-center flex-shrink-0">
                                <img className="h-[80px] mr-[1rem]" src="/image%2071.png" alt="" />
                                <div className="">
                                    <div className="flex items-center relative">
                                        <img className="h-[20px] absolute left-[-0.5rem]" src="/image%2072.png" alt="" />
                                        <h1 className="font-[600] text-[0.9rem] ml-[0.7rem] text-[#953333]">ตลาดกิมหยง</h1>
                                    </div>
                                    <h1 className="w-[100px] text-[0.5rem] text-[#953333]">
                                        ตลาดกิมหยง อำเกอหาดใหญ่ จังหวัดสงขลา 90110
                                    </h1>
                                </div>
                            </div>
                            <div className="flex bg-white rounded-2xl border-2 border-[#C9AF90] w-[250px] items-center flex-shrink-0">
                                <img className="h-[80px] mr-[1rem]" src="/image%2071.png" alt="" />
                                <div>
                                    <div className="flex items-center relative">
                                        <img className="h-[20px] absolute left-[-0.5rem]" src="/image%2072.png" alt="" />
                                        <h1 className="font-[600] text-[0.9rem] ml-[0.7rem] text-[#953333]">ตลาดกิมหยง</h1>
                                    </div>
                                    <h1 className="w-[100px] text-[0.5rem] text-[#953333]">
                                        ตลาดกิมหยง อำเกอหาดใหญ่ จังหวัดสงขลา 90110
                                    </h1>
                                </div>
                            </div>
                            <div className="flex bg-white rounded-2xl border-2 border-[#C9AF90] w-[250px] items-center flex-shrink-0">
                                <img className="h-[80px] mr-[1rem]" src="/image%2071.png" alt="" />
                                <div>
                                    <div className="flex items-center relative">
                                        <img className="h-[20px] absolute left-[-0.5rem]" src="/image%2072.png" alt="" />
                                        <h1 className="font-[600] text-[0.9rem] ml-[0.7rem] text-[#953333]">ตลาดกิมหยง</h1>
                                    </div>
                                    <h1 className="w-[100px] text-[0.5rem] text-[#953333]">
                                        ตลาดกิมหยง อำเกอหาดใหญ่ จังหวัดสงขลา 90110
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative w-[300px] flex justify-center">
                    <div className="w-full max-w-[360px] mb-[2rem]">
                        <h1 className="font-[600] text-[#333333] mt-[1.5rem] mb-[0.8rem] text-[1.25rem]">วัตถุดิบใกล้เคียง</h1>
                        <div className="flex gap-2 justify-center">
                            <div className="flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-full">
                                <img className="h-[90px] transform transition duration-300 hover:scale-105 cursor-pointer" src="/image%2073.png" alt=""></img>
                                <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333]">ข้าวหอมมะลิ</h1>
                            </div>
                            <div className="flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-full">
                                <img className="h-[90px] transform transition duration-300 hover:scale-105 cursor-pointer" src="/image%2073.png" alt=""></img>
                                <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333]">ข้าวหอมมะลิ</h1>
                            </div>
                            <div className="flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-full">
                                <img className="h-[90px] transform transition duration-300 hover:scale-105 cursor-pointer" src="/image%2073.png" alt=""></img>
                                <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333]">ข้าวหอมมะลิ</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}