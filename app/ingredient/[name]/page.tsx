'use client';

import { useParams, useRouter } from 'next/navigation'; // นำเข้า useRouter
import { useEffect, useState } from 'react';
import Image from 'next/image'; // นำเข้า Image component

interface Ingredient {
    name: string;
    description: string;
    image: string; // คาดว่าจะเป็นชื่อไฟล์ภาพ เช่น "rice.png"
    price: number;
}

export default function IngredientPage() {
    const { name: rawName } = useParams() as { name: string | string[] }; // แก้ไข type ของ name ให้รองรับ string[]
    const router = useRouter(); // นำเข้า useRouter

    // ตรวจสอบ rawName เพื่อให้แน่ใจว่าเป็น string เดียวที่ถูกต้อง
    const name = Array.isArray(rawName) ? rawName[0] : (typeof rawName === 'string' ? rawName : '');

    const [ingredient, setIngredient] = useState<Ingredient | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // เพิ่ม state สำหรับการโหลด

    // --- Navigation functions ---
    const gotoHome = () => router.push("/menu"); // กลับหน้าหลัก
    const gotoChatbot = () => {
        // เพิ่ม logic สำหรับไปหน้า Chatbot หรือเปิด Modal Chatbot
        alert("เปิดหน้า Chatbot เพื่อคุยกับ Mr. Rice!");
        // router.push("/chatbot"); // ตัวอย่าง: ถ้ามีหน้า Chatbot แยก
    };

    // --- Data Fetching ---
    useEffect(() => {
        if (!name) {
            setError("ไม่พบชื่อวัตถุดิบใน URL");
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null); // Clear previous errors
            console.log(`Fetching ingredient: /api/ingredient/${encodeURIComponent(name)}`);
            try {
                const res = await fetch(`/api/ingredient/${encodeURIComponent(name)}`);

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error(`API Error: ${res.status} - ${errorText}`);
                    throw new Error("ไม่พบวัตถุดิบที่ต้องการ หรือมีข้อผิดพลาดทางเซิร์ฟเวอร์");
                }

                const data = await res.json();
                if (!data || data.error) {
                    console.error("Data received:", data);
                    throw new Error(data.error || "เกิดข้อผิดพลาดในการประมวลผลข้อมูล");
                }

                setIngredient(data);
            } catch (err: any) {
                console.error("Error fetching ingredient details:", err);
                setError(err.message || "ไม่สามารถโหลดข้อมูลวัตถุดิบได้");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [name]); // Re-fetch when the 'name' changes

    // --- Loading and Error States ---
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen text-center text-lg text-gray-700">กำลังโหลดข้อมูลวัตถุดิบ...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-center text-lg text-red-500">{error}</div>;
    }

    if (!ingredient) { // Should ideally be caught by error state, but as a fallback
        return <div className="flex justify-center items-center h-screen text-center text-lg text-gray-700">ไม่พบข้อมูลวัตถุดิบนี้</div>;
    }

    // Determine the correct image path for the ingredient
    const ingredientImageUrl = ingredient.image
        ? `/ingredients/${ingredient.image}` // Assuming images are in public/ingredients/
        : '/default-ingredient.png'; // Fallback if image path is not provided

    return (
        <div className="relative font-prompt min-h-screen bg-white overflow-x-hidden"> 
            {/* Background elements (fixed for visual effect) */}
            <div className="absolute h-[400px] w-full z-[-2] [mask-image:linear-gradient(to_bottom,black_60%,transparent)] bg-white"></div>
            <div className="absolute top-20 z-[-1]">
                {/* Adjust width/height for Image component */}
                <Image className="h-[400px] w-auto object-cover" src="/image%2070.png" alt="background pattern" width={800} height={400} />
            </div>

            {/* Header with Back Button */}
            <div className="absolute z-10 top-0 left-0 right-0 flex justify-between p-4 items-center w-full max-w-2xl mx-auto">
                <div onClick={gotoHome} className="bg-white h-[50px] flex justify-center cursor-pointer transform transition duration-300 hover:scale-103 items-center w-[50px] rounded-full shadow-grey shadow-xl">
                    <Image className="h-[15px] w-auto" src="/Group%2084.png" alt="back" width={15} height={15} />
                </div>
                {/* No save button on ingredient page in the provided UI */}
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center pt-[4rem] px-4 w-full max-w-2xl mx-auto">
                {/* Ingredient Name and optional brand/detail */}
                <div className="font-prompt font-[600] text-center mt-[4rem] mb-[-2rem]">
                    <h1 className="text-4xl text-[#333333]">{ingredient.name}</h1>
                    {/* If you have a 'brand' or 'type' field in Ingredient interface, you can add it here */}
                    {/* <h1 className="text-[#333333]">ตราสามทัพพี</h1> */}
                </div>

                {/* Ingredient Image */}
                <div className="my-4"> {/* Added margin */}
                    <Image
                        src={ingredientImageUrl}
                        alt={ingredient.name}
                        className="w-full max-h-[300px] object-contain rounded-lg shadow-md"
                        width={350} // Adjust based on your image size
                        height={300} // Adjust based on your image size
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Prevent infinite loop if default.png also fails
                            target.src = '/default-ingredient.png'; // Fallback to a generic default image
                        }}
                        priority // Load the main image immediately
                    />
                </div>

                {/* Price and Chatbot Bubble */}
                <div className="w-[300px] relative">
                    <h1 className="m-[0.5rem] text-[#611E1E] text-lg">ประมาณ {ingredient.price} บาท</h1>
                    <div className="absolute top-[-3.3rem] left-[15rem] -translate-x-1/2 md:left-[14rem] md:translate-x-0"> {/* Adjust positioning for responsiveness */}
                        <div className="w-[150px] h-[40px] z-[-1] absolute top-[1.5rem] shadow-grey shadow-xl left-[-7rem] p-[0.5rem] flex items-center bg-white rounded-md">
                            <h1 className="text-[0.7rem]">เป็นวัตถุดิบที่มีคุณค่ามาก!</h1> {/* Hardcoded text */}
                        </div>
                        <Image onClick={gotoChatbot} className="mt-[3rem] animate-pulse cursor-pointer transform hover:scale-105 duration-300" src="/image%2069.png" alt="Chatbot icon" width={60} height={60} />
                    </div>
                    {/* Ingredient Description */}
                    <div className="h-full p-[1rem] rounded-2xl border-[#FFAC64] bg-[#FFFAD2] border-2 mt-8"> {/* Added margin top */}
                        <p className="text-[#953333] text-[0.8rem]">{ingredient.description}</p>
                    </div>
                </div>

                {/* แหล่งจำหน่ายใกล้คุณ (Nearby Stores) - Hardcoded for now */}
                <div className="relative w-full max-w-[360px] mt-[3rem]">
                    <h1 className="font-[600] text-[#333333] mb-[0.8rem] text-[1.25rem]">แหล่งจำหน่ายใกล้คุณ</h1>
                    <div className="flex gap-4 overflow-x-auto scrollbar-none pb-4"> {/* Added pb-4 for scrollbar */}
                        <div className="flex bg-white rounded-2xl border-2 border-[#C9AF90] w-[250px] items-center flex-shrink-0 shadow-sm">
                            <Image className="h-[80px] w-auto mr-[1rem] rounded-l-2xl object-cover" src="/image%2071.png" alt="store 1" width={80} height={80} />
                            <div className="flex-1">
                                <div className="flex items-center relative">
                                    <Image className="h-[20px] w-auto absolute left-[-0.5rem]" src="/image%2072.png" alt="location icon" width={20} height={20} />
                                    <h1 className="font-[600] text-[0.9rem] ml-[0.7rem] text-[#953333]">ตลาดกิมหยง</h1>
                                </div>
                                <p className="w-[100px] text-[0.5rem] text-[#953333]">
                                    ตลาดกิมหยง อำเภอหาดใหญ่ จังหวัดสงขลา 90110
                                </p>
                            </div>
                        </div>
                        <div className="flex bg-white rounded-2xl border-2 border-[#C9AF90] w-[250px] items-center flex-shrink-0 shadow-sm">
                            <Image className="h-[80px] w-auto mr-[1rem] rounded-l-2xl object-cover" src="/image%2071.png" alt="store 2" width={80} height={80} />
                            <div className="flex-1">
                                <div className="flex items-center relative">
                                    <Image className="h-[20px] w-auto absolute left-[-0.5rem]" src="/image%2072.png" alt="location icon" width={20} height={20} />
                                    <h1 className="font-[600] text-[0.9rem] ml-[0.7rem] text-[#953333]">ตลาดกิมหยง</h1>
                                </div>
                                <p className="w-[100px] text-[0.5rem] text-[#953333]">
                                    ตลาดกิมหยง อำเภอหาดใหญ่ จังหวัดสงขลา 90110
                                </p>
                            </div>
                        </div>
                        <div className="flex bg-white rounded-2xl border-2 border-[#C9AF90] w-[250px] items-center flex-shrink-0 shadow-sm">
                            <Image className="h-[80px] w-auto mr-[1rem] rounded-l-2xl object-cover" src="/image%2071.png" alt="store 3" width={80} height={80} />
                            <div className="flex-1">
                                <div className="flex items-center relative">
                                    <Image className="h-[20px] w-auto absolute left-[-0.5rem]" src="/image%2072.png" alt="location icon" width={20} height={20} />
                                    <h1 className="font-[600] text-[0.9rem] ml-[0.7rem] text-[#953333]">ตลาดกิมหยง</h1>
                                </div>
                                <p className="w-[100px] text-[0.5rem] text-[#953333]">
                                    ตลาดกิมหยง อำเภอหาดใหญ่ จังหวัดสงขลา 90110
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* วัตถุดิบใกล้เคียง (Similar Ingredients) - Hardcoded for now */}
                <div className="relative w-full max-w-[360px] mt-[3rem] mb-[2rem]">
                    <h1 className="font-[600] text-[#333333] mb-[0.8rem] text-[1.25rem]">วัตถุดิบใกล้เคียง</h1>
                    <div className="flex gap-2 justify-center">
                        <div className="flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-full shadow-sm">
                            <Image className="h-[90px] w-auto transform transition duration-300 hover:scale-105 cursor-pointer" src="/image%2073.png" alt="similar ingredient 1" width={90} height={90} />
                            <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333]">ข้าวหอมมะลิ</h1>
                        </div>
                        <div className="flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-full shadow-sm">
                            <Image className="h-[90px] w-auto transform transition duration-300 hover:scale-105 cursor-pointer" src="/image%2073.png" alt="similar ingredient 2" width={90} height={90} />
                            <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333]">ข้าวหอมมะลิ</h1>
                        </div>
                        <div className="flex flex-col items-center bg-white border-2 border-[#C9AF90] rounded-t-full shadow-sm">
                            <Image className="h-[90px] w-auto transform transition duration-300 hover:scale-105 cursor-pointer" src="/image%2073.png" alt="similar ingredient 3" width={90} height={90} />
                            <h1 className="text-[0.8rem] my-[0.4rem] text-[#953333]">ข้าวหอมมะลิ</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}