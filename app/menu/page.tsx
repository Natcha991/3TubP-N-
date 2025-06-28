'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import MethodCard from "@/app/components/MethodCard"; // ปรับ path ตามโครงสร้างไฟล์จริงของคุณ

// กำหนด Type สำหรับข้อมูล MethodCardData โดยตรงในไฟล์นี้
interface MethodCardData {
    Num: number;
    title: string;
    detail: string;
    imageUrl: string;
}

export default function MenuPage() {
    const router = useRouter();
    const methodCardsContainerRef = useRef<HTMLDivElement>(null);

    const goto = () => {
        router.push("/");
    };

    const gotoIngredientPage = () => {
        router.push("/ingredient");
    };

    // ข้อมูลวิธีทำอาหารทั้งหมด (พร้อม Type Assertion)
    const allMethodCards: MethodCardData[] = [
        {
            Num: 1,
            title: "ใส่ผักบุ้ง",
            detail: "ล้างผักบุ้งให้สะอาด หั่นเป็นท่อนพอดีคำ เตรียมไว้สำหรับผัด",
            imageUrl: "https://www.pholfoodmafia.com/wp-content/uploads/2022/07/3Sizzling-Thai-Sukiyaki-500x314.jpg"
        },
        {
            Num: 2,
            title: "ผัดพริกกระเทียม",
            detail: "ตั้งกระทะ ใส่น้ำมันเล็กน้อย ใส่พริกและกระเทียมสับลงไปผัดจนมีกลิ่นหอม",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Pad_Krapao_Moo_%28Thai_Basil_Pork%29_%287313888796%29.jpg/1200px-Pad_Krapao_Moo_%28Thai_Basil_Pork%29_%287313888796%29.jpg"
        },
        {
            Num: 3,
            title: "ใส่เนื้อสัตว์",
            detail: "ใส่หมูสับ ไก่ หรือเนื้อสัตว์อื่นๆ ลงไปผัดจนสุกและเปลี่ยนสี",
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6s8b6f7F6z-4q-y-q-o-q-o-q-o-q-o-q-o-q-o&s"
        },
        {
            Num: 4,
            title: "ปรุงรส",
            detail: "ปรุงรสด้วยน้ำปลา ซีอิ๊วขาว น้ำตาล และน้ำมันหอยตามชอบ ผัดให้เข้ากัน",
            imageUrl: "https://kitchen.apt.ge/wp-content/uploads/2016/11/IMG_20200816_132049_optimized.jpg"
        },
        {
            Num: 5,
            title: "ใส่ผักบุ้งและกะเพรา",
            detail: "ใส่ผักบุ้งและใบกะเพราลงไปผัดอย่างรวดเร็วจนสลด ปิดไฟ",
            imageUrl: "https://www.thairath.co.th/media/DtbeFKunrYhws3AU67FhF7626t2cE2d3B22.jpg"
        },
        {
            Num: 6,
            title: "พร้อมเสิร์ฟ",
            detail: "ตักข้าวผัดกะเพราใส่จาน ทานคู่กับข้าวสวยร้อนๆ และไข่ดาว",
            imageUrl: "https://krua.co/wp-content/uploads/2023/11/Pad-Krapao-Moo-Sab-2-1200x800.jpg"
        }
    ];

    // State สำหรับเก็บการ์ดที่ถูกแสดง และ Index ของการ์ดถัดไป (พร้อม Type)
    const [displayedMethodCards, setDisplayedMethodCards] = useState<MethodCardData[]>([]);
    const [nextMethodCardIndex, setNextMethodCardIndex] = useState<number>(0);

    // ใช้ useEffect เพื่อให้เพิ่มการ์ดแรกเมื่อ Component โหลดครั้งแรกเท่านั้น
    useEffect(() => {
        if (allMethodCards.length > 0 && displayedMethodCards.length === 0) {
            setDisplayedMethodCards([allMethodCards[0]]);
            setNextMethodCardIndex(1);
        }
    }, []);

    // ใช้ useEffect เพื่อ scroll ไปยังด้านล่างสุดเมื่อมีการ์ดใหม่เพิ่มเข้ามา
    useEffect(() => {
        if (methodCardsContainerRef.current) {
            methodCardsContainerRef.current.scrollTop = methodCardsContainerRef.current.scrollHeight;
        }
    }, [displayedMethodCards]);

    const Nextstep = () => {
        if (nextMethodCardIndex < allMethodCards.length) {
            setDisplayedMethodCards(prevCards => [...prevCards, allMethodCards[nextMethodCardIndex]]);
            setNextMethodCardIndex(prevIndex => prevIndex + 1);
        } else {
            alert("คุณทำครบทุกขั้นตอนแล้ว!");
        }
    }; 

    return ( 

        // ให้ทุกส่วนอยู่ตรงกลางแก้มา 

        <div className="relative flex flex-col items-center"> 
            <div className="absolute z-1 flex justify-between m-[2rem] items-center sm:w-[95%] w-[85%]"> 
                <div onClick={goto} className="bg-white h-[50px] flex justify-center cursor-pointer transform transition duration-300 hover:scale-103 items-center w-[50px] rounded-full shadow-2xl"> 
                    <img className="h-[15px]" src="Group%2084.png" alt=""></img> 
                </div> 
                <div className="transform transition duration-300 hover:scale-103 items-center w-[50px] rounded-full cursor-pointer"> 
                    <img className="h-[40px]" src="image%2065.png" alt=""></img> 
                </div> 
            </div> 
            <div className=""> 
                <img className="h-[330px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)] object-cover" src="https://pbs.twimg.com/media/FLZKlc4VgAILVgN?format=jpg&name=large" alt=""></img> 
            </div> 
            <div className="mx-[1.5rem]"> 
                <h1 className="text-3xl font-prompt text-[#611E1E] font-[600]">ข้าวผัดกระเทียม</h1> 
                <h1 className="text-[0.7rem] w-[250px] mt-[0.5rem] text-[#953333] font-prompt">ข้าวผัดร้อนๆ จากข้าวกล้อง 
                    ใส่ถั่วลันเตา แครอท และเครื่องปรุง 
                    รสกลมกล่อม สัมผัสหนึบหนับ หอม อร่อย ทำง่าย อิ่มนาน</h1> 
                <div className="bg-[#ff770041] inline-block px-[1rem] py-[0.2rem] mt-[0.8rem] rounded-2xl"> 
                    <h1 className="font-[600] text-[0.8rem] text-[#953333] font-prompt">อาหารเย็น</h1> 
                </div> 

                <div className="font-prompt mt-[1.4rem]"> 
                    <h1 className="text-[1.6rem] text-[#333333] mb-[1.5rem] font-[600]">วัตถุดิบ</h1> 
                    <div className="flex flex-col items-center gap-4"> 
                        <div onClick={gotoIngredientPage} className="bg-[#FFFAD2] flex justify-between px-[1rem] items-center border-1 border-[#C9AF90] w-full h-[2rem] rounded-[8px] transform transition duration-300 hover:scale-102 cursor-pointer"> 
                            <div className="flex items-center gap-2.5"> 
                                <img className="h-[50px]" src="image%2066.png" alt=""></img> 
                                <h1>ข้าวกล้องหุงสุก</h1> 
                            </div> 
                            <div className="flex gap-2 text-[#81440F]"> 
                                <h1>1</h1> 
                                <h1>ถ้วย</h1> 
                            </div> 
                        </div> 
                        <div onClick={gotoIngredientPage} className="bg-[#FFFAD2] flex justify-between px-[1rem] items-center border-1 border-[#C9AF90] w-full h-[2rem] rounded-[8px] transform transition duration-300 hover:scale-102 cursor-pointer"> 
                            <div className="flex items-center gap-2.5"> 
                                <img className="h-[50px]" src="image%2067.png" alt=""></img> 
                                <h1>ถั่วลันเตา</h1> 
                            </div> 
                            <div className="flex gap-2 text-[#81440F]"> 
                                <h1>1</h1> 
                                <h1>กรัม</h1> 
                            </div> 
                        </div> 
                        <div onClick={gotoIngredientPage} className="bg-[#FFFAD2] flex justify-between px-[1rem] items-center border-1 border-[#C9AF90] w-full h-[2rem]  rounded-[8px] transform transition duration-300 hover:scale-102 cursor-pointer"> 
                            <div className="flex items-center gap-2.5"> 
                                <img className="h-[50px]" src="image%2066.png" alt=""></img> 
                                <h1>ข้าวกล้องหุงสุก</h1> 
                            </div> 
                            <div className="flex gap-2 text-[#81440F]"> 
                                <h1>1</h1> 
                                <h1>ถ้วย</h1> 
                            </div> 
                        </div> 
                        <div onClick={gotoIngredientPage} className="bg-[#FFFAD2] flex justify-between px-[1rem] items-center border-1 border-[#C9AF90] w-full h-[2rem] rounded-[8px]  transform transition duration-300 hover:scale-102 cursor-pointer"> 
                            <div className="flex items-center gap-2.5"> 
                                <img className="h-[50px]" src="image%2067.png" alt=""></img> 
                                <h1>ถั่วลันเตา</h1> 
                            </div> 
                            <div className="flex gap-2 text-[#81440F]"> 
                                <h1>1</h1> 
                                <h1>กรัม</h1> 
                            </div> 
                        </div> 
                        <div onClick={gotoIngredientPage} className="bg-[#FFFAD2] flex justify-between px-[1rem] items-center border-1 border-[#C9AF90] w-full h-[2rem] rounded-[8px] transform transition duration-300 hover:scale-102 cursor-pointer"> 
                            <div className="flex items-center gap-2.5"> 
                                <img className="h-[50px]" src="image%2067.png" alt=""></img> 
                                <h1>ถั่วลันเตา</h1> 
                            </div> 
                            <div className="flex gap-2 text-[#81440F]"> 
                                <h1>1</h1> 
                                <h1>กรัม</h1> 
                            </div> 
                        </div> 
                    </div> 
                </div> 
                {/* ส่วนของวิธีทำอาหาร */} 
                <div className="font-prompt mt-[3rem]">
                    <h1 className="text-[1.6rem] text-[#333333] mb-[1.5rem] font-[600]">วิธีการทำ</h1>
                    <div ref={methodCardsContainerRef} className="flex flex-col items-center gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-[#C9AF90] scrollbar-track-transparent pb-4">
                        {displayedMethodCards.map((card) => (
                            <MethodCard
                                key={card.Num}
                                num={card.Num}
                                title={card.title}
                                detail={card.detail}
                                imageUrl={card.imageUrl}
                            />
                        ))}
                    </div> 
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={Nextstep}
                            disabled={nextMethodCardIndex >= allMethodCards.length}
                            className="flex-none bg-[#FFF5DD] cursor-pointer flex justify-center items-center border-2 border-[#C9AF90] w-[6.5rem] h-[2.5rem] rounded-[8px] transform transition duration-300 hover:scale-103
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex flex-col items-center text-[#333333]">
                                <h1 className="text-[0.8rem] mb-[-0.2rem]">ถัดไป</h1>
                                <h1 className="text-[0.4rem]">(กดเพื่อดูวิธีต่อไป)</h1>
                            </div>
                        </button>
                    </div>
                </div> 

                <div className="relative flex justify-center font-prompt"> 
                    <div className="w-full max-w-[360px] mb-[2rem]"> 
                        <h1 className="font-[600] text-[#333333] mt-[1.5rem] mb-[0.8rem] text-[1.25rem]">เมนูใกล้เคียง</h1> 
                        <div className="flex gap-2 justify-center"> 
                            <div className="flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-full"> 
                                <img className="h-[90px] transform transition duration-300 hover:scale-105 cursor-pointer" src="/image%2074.png" alt=""></img> 
                                <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333]">บิมบิมบับ</h1> 
                            </div> 
                            <div className="flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-full"> 
                                <img className="h-[90px] transform transition duration-300 hover:scale-105 cursor-pointer" src="/image%2074.png" alt=""></img> 
                                <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333]">บิมบิมบับ</h1> 
                            </div> 
                            <div className="flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-full"> 
                                <img className="h-[90px] transform transition duration-300 hover:scale-105 cursor-pointer" src="/image%2074.png" alt=""></img> 
                                <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333]">บิมบิมบับ</h1> 
                            </div> 
                        </div> 
                    </div> 
                </div> 
            </div> 
        </div > 
    );

}