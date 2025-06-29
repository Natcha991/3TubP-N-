'use client'; // ต้องมีถ้าใช้ React Hooks ใน Client Component

import { useRouter } from 'next/navigation';
import React, { useState } from 'react'; // นำเข้า useState
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // ต้องนำเข้า CSS ด้วย
import Image from 'next/image'; // ใช้ Next.js Image component สำหรับภาพ

export default function Register2() { // ชื่อ Component ควรเป็น PascalCase (Register2) 
    
    const [birthdate, setBirthdate] = useState<Date | null>(null); // ระบุ type เป็น Date หรือ null

    const router = useRouter();

    // ฟังก์ชันสำหรับจัดการการ submit ฟอร์ม
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { // ระบุ type ของ event
        e.preventDefault(); // ป้องกันการรีเฟรชหน้าเมื่อ submit 
        console.log('วันเกิด:', birthdate ? birthdate.toLocaleDateString('th-TH') : 'ไม่ได้ระบุ'); // ฟอร์แมตวันที่ให้เป็น dd/MM/yyyy แบบไทย

        // คุณสามารถนำข้อมูลนี้ไปใช้ต่อได้ เช่น ส่งไป API
        // ตัวอย่าง: ถ้าต้องการไปหน้าถัดไปหลังจาก submit สำเร็จ
        // router.push("/some-other-page");
    };

    // ฟังก์ชันสำหรับนำทางไปยังหน้า /register2 (ดูเหมือนจะซ้ำซ้อนถ้าเป็นหน้านี้อยู่แล้ว)
    // ถ้าปุ่มนี้มีจุดประสงค์อื่น (เช่น ไปหน้าแรก) ให้เปลี่ยน path
    const goToRegister2 = () => {
        router.push("/register2"); // หากต้องการไปยังหน้าเดียวกันนี้ อาจไม่จำเป็นต้องมีปุ่มนี้
    };

    return (
        <div className="relative h-screen w-screen cursor-pointer flex flex-col items-center bg-gradient-to-br from-orange-300 to-orange-100">
            {/* ภาพประกอบด้านซ้ายบน */}
            <div className="absolute left-0 top-0"> {/* เพิ่ม top-0 เพื่อให้ชิดขอบบน */}
                <Image src="/group%2099.png" alt="Decoration" width={200} height={200} /> {/* กำหนด width, height */}
            </div>
            {/* ภาพประกอบด้านขวาล่าง */}
            <div className="absolute right-0 rotate-[180deg] top-[30rem]">
                <Image src="/group%2099.png" alt="Decoration" width={200} height={200} /> {/* กำหนด width, height */}
            </div>
            {/* ภาพประกอบเคลื่อนไหว */}
            <div className="absolute top-[20rem] left-[1.5rem] animate-shakeright">
                <Image className='' src="/image%2084.png" alt="Decoration" width={100} height={100} /> {/* กำหนด width, height */}
            </div>
            {/* ภาพประกอบเคลื่อนไหวอีกอัน */}
            <div className="absolute top-[35rem] left-[19rem] rotate-[35deg] animate-shakeright2">
                <Image src="/image%2084.png" className='w-[140px]' alt="Decoration" width={140} height={140} /> {/* กำหนด width, height */}
            </div>

            {/* ส่วนข้อความด้านบนและ Form สำหรับ input */}
            <div className="flex flex-col items-center mt-[8rem]">
                <div className="w-full">
                    <h1 className='w-[300px] text-center text-[#333333] mt-2 font-prompt font-[500] text-3xl'>แล้ววันเกิดของคุณล่ะ
                        คือวันไหน?</h1>
                </div>

                <div className="flex mt-[2rem] justify-center items-center font-prompt z-30">
                    {/* DatePicker สำหรับใส่วันเกิด */}
                    <DatePicker
                        selected={birthdate}
                        onChange={(date: Date | null) => setBirthdate(date)} // ระบุ type ของ date
                        dateFormat="dd/MM/yyyy" // กำหนดรูปแบบการแสดงผลวันที่
                        placeholderText="วันเกิดของคุณ" // ข้อความ placeholder
                        showYearDropdown // แสดง Dropdown เลือกปี
                        scrollableYearDropdown // ทำให้ Dropdown ปีเลื่อนได้
                        yearDropdownItemNumber={100} // จำนวนปีที่แสดงใน Dropdown
                        className="p-[0.5rem] px-[0.8rem] rounded-3xl border-[#333333] border-2 bg-white ml-[0.5rem]" // ใช้คลาส CSS เดียวกัน
                    />

                    {/* ปุ่ม Submit */}
                    <button
                        type='submit' // ใช้ type="submit" เพื่อให้ Form รับรู้
                        className='bg-grey-400 w-[45px] p-[0.8rem] transition hover:scale-105 duration-300 cursor-pointer flex items-center justify-center rounded-4xl border-[#333333] border-2 ml-[0.5rem] h-[45px]'
                    >
                        <Image src="/image%2082.png" alt="Submit" width={24} height={24} /> {/* ใช้ Image component และกำหนด width, height */}
                    </button>
                </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (จัดกลางแนวตั้ง, ชิดขวา, กินขอบ) */}
            {/* ----------------------------------------------------- */}
            <div className="flex justify-center z-10 mt-[4rem] overflow-hidden">
                <Image
                    src="/image%2087.png"
                    alt='Decor'
                    // กำหนดความกว้างและความสูงคงที่
                    className="w-full h-[540px] object-cover" // เพิ่ม object-cover เพื่อให้รูปภาพครอบคลุมพื้นที่โดยไม่บิดเบี้ยว
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