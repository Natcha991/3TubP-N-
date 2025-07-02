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

    // ตั้งค่าเพศที่เลือกก่อนส่ง
    setGender(selectedGender); 

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
    <div className="relative h-screen w-screen cursor-pointer flex flex-col items-center bg-gradient-to-br from-orange-300 to-orange-100">
      <div className="absolute left-0">
        <img src="/group%2099.png" alt="Decoration"></img>
      </div>
      <div className="absolute right-0 rotate-[180deg] top-[30rem]">
        <img src="/group%2099.png" alt="Decoration"></img>
      </div>
      <div className="absolute top-[20rem] left-[1.5rem] animate-shakeright">
        <img className='' src="/image%2084.png" alt="Decoration"></img>
      </div>
      <div className="absolute top-[35rem] left-[19rem] rotate-[35deg] animate-shakeright2">
        <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
      </div>

      {/* ส่วนข้อความด้านบน */}
      <div className="flex flex-col items-center mt-[8rem]">
        <div className="w-full">
          <h1 className='w-[330px] text-center text-[#333333] mt-2 font-prompt font-[500] text-2xl'>ผมเป็นผู้ชายนะ แล้วคุณล่ะ?</h1>
        </div>

        {/* ส่วนตัวเลือก ชาย หรือ หญิง */}
        <div className="font-prompt gap-2 flex items-center mt-[2rem] cursor-pointer z-110">
          <button
            type='button' // เปลี่ยนเป็น type='button' เพื่อไม่ให้ submit form โดยตรง
            onClick={() => handleSubmit('ชาย')}
            className={`bg-[#ACE5FF] border-2 ${gender === 'ชาย' ? 'border-[#FF6600]' : 'border-[#333333]'} flex text-2xl rounded-2xl px-[3rem] py-[1.5rem]`}
          >
            {/* คุณสามารถใส่รูปภาพได้ที่นี่: <img src="" alt="Male icon"> */}
            ผู้ชาย
          </button>
          <button
            type='button' // เปลี่ยนเป็น type='button' เพื่อไม่ให้ submit form โดยตรง
            onClick={() => handleSubmit('หญิง')}
            className={`bg-[#FF9BCD] border-2 ${gender === 'หญิง' ? 'border-[#FF6600]' : 'border-[#333333]'} flex text-2xl rounded-2xl px-[3rem] py-[1.5rem]`}
          >
            {/* คุณสามารถใส่รูปภาพได้ที่นี่: <img src="" alt="Female icon"> */}
            ผู้หญิง
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (จัดกลางแนวตั้ง, ชิดขวา, กินขอบ) */}
      {/* ----------------------------------------------------- */}
      <div className="flex justify-center z-10 mt-[2.5rem] overflow-hidden">
        <img
          src="/image%2086.png"
          alt='Decor'
          // กำหนดความกว้างและความสูงคงที่
          className="w-full h-[540px]"
        />
      </div>

      {/* ส่วนล่างสุด (เมนู/ต่อไป) */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt">
        <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
          {/* สามารถเพิ่มเนื้อหาสำหรับส่วนล่างสุดได้ที่นี่ */}
        </div>
      </div>
    </div>
  );
}