'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Register4() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  const [gender, setGender] = useState('');

  const handleSubmit = async (selectedGender: string) => {
    if (!userId) {
      alert('ไม่พบรหัสผู้ใช้');
      return;
    }

    setGender(selectedGender); // ตั้งค่าเพศที่เลือกก่อนส่ง

    const res = await fetch(`/api/user/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender: selectedGender }), // ใช้ selectedGender โดยตรง
    });

    if (res.ok) {
      router.push(`/register5?id=${userId}`); // ✅ ไปหน้าเก็บน้ำหนัก/ส่วนสูง
    } else {
      alert('❌ เกิดข้อผิดพลาดในการบันทึกเพศ');
    }
  };

  return (
    // แก้ไข: เพิ่ม flex flex-col, overflow-hidden ให้กับ div หลัก
    // เพื่อให้จัดการ Layout ในแนวตั้งได้ดีขึ้น และซ่อน Scrollbar ที่ไม่ต้องการ
    <div className="relative h-[731px] w-screen cursor-pointer flex flex-col items-center bg-gradient-to-br from-orange-300 to-orange-100 overflow-hidden">
      {/* รูปภาพตกแต่งด้านข้าง/มุม - ยังคงใช้ absolute ได้ */}
      <div className="absolute left-0 top-0"> {/* แก้ไข: เพิ่ม top-0 เพื่อให้ชิดขอบบน */}
        <img src="/Group%2099.png" alt="Decoration"></img>
      </div>
      <div className="absolute right-0 rotate-[180deg] top-[30rem]">
        <img src="/Group%2099.png" alt="Decoration"></img>
      </div>
      <div className="absolute top-[20rem] left-[1.5rem] w-[100px] animate-shakeright">
        <img className='' src="/image%2084.png" alt="Decoration"></img>
      </div>
      <div className="absolute top-[30rem] left-[19rem] rotate-[35deg] animate-shakeright2">
        <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
      </div>

      {/* แก้ไข: เพิ่ม div ครอบเนื้อหาหลักที่อยู่ใน flow (h1, ตัวเลือกเพศ, img)
          ให้เป็น flex-col และใช้ justify-between เพื่อจัดเรียงลูกๆ
          และใช้ pb-[...] เพื่อเว้นที่ว่างให้ footer
      */}
      <div className="flex flex-col items-center justify-between h-full pt-[5rem] pb-[13rem]"> {/* แก้ไข: h-full และปรับ pb */}
        {/* ส่วนข้อความด้านบน */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-full">
            <h1 className='w-[330px] text-center text-[#333333] mt-2 font-prompt font-[500] text-[1.8rem]'>ผมเป็นผู้ชายนะแล้วคุณล่ะ?</h1>
          </div>
        </div>

        {/* ส่วนตัวเลือก ชาย หรือ หญิง */}
        {/* แก้ไข: เพิ่ม z-index ให้ตัวเลือกเพศ เพื่อให้แน่ใจว่าอยู่เหนือ content อื่นๆ หากมีการทับซ้อน */}
        <div className="font-prompt gap-2 flex items-center mt-[1rem] cursor-pointer z-20"> {/* แก้ไข: z-index */}
          <button
            type='button'
            onClick={() => handleSubmit('ชาย')}
            className={`bg-[#ACE5FF] border-2 ${gender === 'ชาย' ? 'border-[#FF6600]' : 'border-[#333333]'} flex text-[1rem] rounded-2xl px-[3rem] py-[1.5rem]`}
          >
            ผู้ชาย
          </button>
          <button
            type='button'
            onClick={() => handleSubmit('หญิง')}
            className={`bg-[#FF9BCD] border-2 ${gender === 'หญิง' ? 'border-[#FF6600]' : 'border-[#333333]'} flex text-[1rem] rounded-2xl px-[3rem] py-[1.5rem]`}
          >
            ผู้หญิง
          </button>
        </div>

        {/* ----------------------------------------------------- */}
        {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (จัดกลางแนวตั้ง, ชิดขวา, กินขอบ) */}
        {/* แก้ไข: รักษาสูง h-[430px] */}
        {/* ----------------------------------------------------- */}
        <div className="flex justify-center z-10 mt-[1rem] animate-sizeUpdown">
          <img
            src="/image%2086.png"
            alt='Decor'
            className="w-auto h-[430px] object-cover"
          />
        </div>

        {/* แก้ไข: ลบ div flex-grow ที่นี่ออก และใช้ justify-between ใน parent แทน */}
        {/* <div className="flex-grow"></div> */}
      </div>

      {/* ส่วนล่างสุด (เมนู/ต่อไป) - ยังคงใช้ absolute เพื่อให้ติดขอบล่าง */}
      <div className="absolute top-[591px] left-0 right-0 flex justify-center font-prompt">
        <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
          {/* สามารถเพิ่มเนื้อหาสำหรับส่วนล่างสุดได้ที่นี่ */}
        </div>
      </div>
    </div>
  );
}