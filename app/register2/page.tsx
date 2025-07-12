'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Register2() {
  const router = useRouter();
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const user = await res.json();
    localStorage.setItem('userId', user._id); // สำรองไว้เผื่อใช้

    // ✅ แนบ id ไปใน URL
    router.push(`/register3?id=${user._id}`);
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
      <div className="flex flex-col items-center mt-[5rem]">
        <div className="w-full">
          <h1 className='w-[330px] text-center text-[#333333] mt-2 font-prompt font-[500] text-3xl '>ผมชื่อ Mr.Rice นะ<br></br>แล้วคุณละ?</h1>
        </div>
        <div className='font-prompt flex items-center mt-[2rem] z-107'>
          <input
            value={name} onChange={(e) => setName(e.target.value)} className='p-[0.5rem] px-[0.8rem] rounded-3xl border-[#333333] border-2   bg-white' placeholder='ชื่อของคุณ'></input>
          <button onClick={handleSubmit} type='submit' className='bg-grey-400 w-[45px]  transition hover:scale-105 duration-300 cursor-pointer flex items-center justify-center rounded-4xl border-[#333333] border-2 ml-[0.5rem] h-[45px]'><img src="/image%2082.png"></img></button>
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (จัดกลางแนวตั้ง, ชิดขวา, กินขอบ) */}
      {/* ----------------------------------------------------- */}
      <div className="flex justify-center z-10 mt-[4rem] overflow-hidden animate-sizeUpdown">
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
        </div>
      </div>
    </div>
  ); 
}