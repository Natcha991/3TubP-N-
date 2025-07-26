export const dynamic = 'force-dynamic';

import RegisterClientPage8 from './register8ClientPage';
import { Suspense } from 'react';
import Image from 'next/image'; // Import Next.js Image component

export default function Page() {
  return (
    <Suspense fallback={
      // เปลี่ยน div หลักนี้ให้มี class สีพื้นหลังโดยตรง
      // และยังคงมี h-[731px] w-screen overflow-hidden ตามที่คุณต้องการ
      <div className="relative h-[731px] w-screen overflow-hidden flex flex-col items-center justify-center
                      bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700 font-prompt">
        {/* รูปภาพตกแต่งด้านข้าง/มุม - วางอยู่ภายใน div พื้นหลังนี้ */}
        <div className="absolute left-0 top-0">
          {/* กำหนด width/height ให้ Image component */}
          <img src="/Group%2099.png" alt="Decoration" width={200} height={200} />
        </div>
        <div className="absolute right-0 rotate-[180deg] top-[30rem]">
          {/* กำหนด width/height ให้ Image component */}
          <img src="/Group%2099.png" alt="Decoration" width={200} height={200} />
        </div>
        <div className="absolute top-[34rem] left-[1.5rem] animate-shakeright">
          {/* กำหนด width/height ให้ Image component */}
          <img className='' src="/image%2084.png" alt="Decoration" width={100} height={100} />
        </div>
        <div className="absolute top-[3rem] left-[19rem] rotate-[35deg] animate-shakeright2">
          {/* กำหนด width/height ให้ Image component */}
          <img src="/image%2084.png" className='w-[140px]' alt="Decoration" width={140} height={140} />
        </div>

        {/* ส่วนเนื้อหาหลักที่แสดงเมื่อ loading */}
        {/* ให้จัดกลางด้วย flexbox ของ parent (div ที่มีพื้นหลัง) */}
        <img className='animate-sizeUpdown2 mb-[1.5rem] z-10' src="/image%2069.png" alt="Loading icon" width={100} height={100} />
        <p className="z-10">กำลังโหลดข้อมูล...</p>
      </div>
    }>
      <RegisterClientPage8 />
    </Suspense>
  );
}