'use client';
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image'; // Import Next.js Image component for optimization

export default function Register2() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (name.trim() === '') {
      setError('กรุณากรอกชื่อก่อน');
      return;
    }

    setLoading(true); // Start loading state

    try { // Add try-catch for better error handling
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const user = await res.json();

      if (res.status === 409) {
        setError('❌ ชื่อนี้ถูกใช้แล้ว กรุณาตั้งชื่อใหม่');
        return;
      }

      if (!res.ok) {
        setError(user.message || 'เกิดข้อผิดพลาดในการสมัคร');
        return;
      }

      localStorage.setItem('userId', user._id);
      router.push(`/register3?id=${user._id}`);
    } catch (err) {
      console.error("Submission error:", err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false); // End loading state regardless of success or failure
    }
  };

  return (
    <div className="relative h-[731px] w-screen cursor-pointer flex flex-col items-center bg-gradient-to-br from-orange-300 to-orange-100 overflow-hidden">
      {/* รูปภาพตกแต่งด้านข้าง/มุม - ยังคงใช้ absolute ได้ */}
      <div className="absolute left-0 top-0">
        <Image src="/Group%2099.png" alt="Decoration" width={200} height={200} className="w-auto h-auto" /> {/* Use Image component */}
      </div>
      <div className="absolute right-0 rotate-[180deg] top-[30rem]">
        <Image src="/Group%2099.png" alt="Decoration" width={200} height={200} className="w-auto h-auto" /> {/* Use Image component */}
      </div>
      <div className="absolute top-[20rem] left-[-1rem] animate-shakeright">
        <Image src="/image%2084.png" alt="Decoration" width={100} height={100} className='w-auto h-auto' /> {/* Use Image component */}
      </div>
      <div className="absolute top-[30rem] left-[19rem] rotate-[35deg] animate-shakeright2">
        <Image src="/image%2084.png" alt="Decoration" width={140} height={140} className='w-[140px] h-auto' /> {/* Use Image component */}
      </div>

      {/* เนื้อหาหลักที่อยู่ใน flow */}
      <div className="flex flex-col items-center justify-between h-full pt-[5rem] pb-[13rem]">
        {/* ส่วนข้อความด้านบน */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-full">
            <h1 className='w-[330px] text-center text-[#333333] font-prompt font-[500] text-3xl '>
              ผมชื่อ Mr.Rice นะ<br></br>แล้วคุณละ?
            </h1>
          </div>
        </div>

        {/* ส่วน Input และปุ่ม */}
        <div className='font-prompt flex flex-col items-center mt-[1rem] z-20'>
          <div className='flex items-center'>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='p-[0.5rem] px-[0.8rem] rounded-3xl border-[#333333] border-2 bg-white'
              placeholder='ชื่อของคุณ'
            />
            {/* แก้ไขที่นี่: เพิ่ม relative ให้กับ button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              type='submit'
              className='relative bg-gray-400 w-[45px] transition hover:scale-105 duration-300 cursor-pointer flex items-center justify-center rounded-4xl border-[#333333] border-2 ml-[0.5rem] h-[45px] overflow-hidden' // Added relative and overflow-hidden
            >
              {/* ซ่อนรูปภาพเมื่อ loading, แสดง span เมื่อ loading */}
              {loading ? (
                <span className="absolute inset-0 flex items-center justify-center text-[0.6rem] text-white bg-black bg-opacity-50 rounded-4xl text-center">
                  กำลังโหลด...
                </span>
              ) : (
                <Image src="/image%2082.png" alt="Submit" width={24} height={24} className="w-auto h-auto" /> // Use Image component
              )}
            </button>
          </div>

          {/* แสดง error เมื่อมีข้อความ */}
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* รูปภาพตัวละคร image_86.png รักษาสูง 430px */}
        <div className="flex justify-center z-10 mt-[1rem] animate-sizeUpdown">
          <Image src="/image%2086.png" alt='Decor' width={400} height={430} className="w-auto h-[430px] object-contain" /> {/* Use Image component and object-contain for better scaling */}
        </div>
      </div>

      {/* ส่วนล่างสุด (เมนู/ต่อไป) - ยังคงใช้ absolute เพื่อให้ติดขอบล่าง */}
      <div className="absolute top-[591px] left-0 right-0 flex justify-center font-prompt">
        <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
          {/* เนื้อหาในส่วนล่างสุด */}
        </div>
      </div>
    </div>
  );
}