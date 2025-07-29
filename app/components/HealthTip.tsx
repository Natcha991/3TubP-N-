'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';

interface Tip {
  id: string;
  content: React.ReactNode;
  headline: string;
  imageHead: string;
}

export default function HealthTip({ userId }: { userId: string }) {
  const router = useRouter(); // ✅ ย้ายมาก่อน return
  const [tipIndex, setTipIndex] = useState(0); // ✅ เรียกเสมอ
  const tips: Tip[] = [
    {
      id: 'water',
      content: (
        <>
          <span className="text-blue-600 font-bold">น้ำ</span> อย่างไรให้ไม่เสียสุขภาพ
        </>
      ),
      headline: 'ดื่มน้ำแค่ไหนถึงจะพอดี?',
      imageHead: '/drinking-water.jpg',
    },
    {
      id: 'sleep',
      content: (
        <>
          <span className="text-purple-600 font-bold">นอน</span> แล้วทำอย่างไรนอนให้ดีจริงเหรอ?
        </>
      ),
      headline: 'นอนยังไงให้ตื่นมาสดชื่น?',
      imageHead: '/การนอน.png',
    },
    {
      id: 'chew',
      content: (
        <>
          <span className="text-orange-600 font-bold">เคี้ยว</span> ให้พอดี เพื่อช่วยย่อย?
        </>
      ),
      headline: 'เคี้ยว ช้า ๆ ช่วยให้ผอมได้ไหม?',
      imageHead: '/scum.jpg',
    },
    {
      id: 'GABA',
      content: (
        <>
          <span className="text-orange-600 font-bold">ความเครียด</span> ข้าวกล้อง ช่วยได้ไหม?
        </>
      ),
      headline: 'ข้าวกล้องสามารถลดความเครียดได้ไหม?',
      imageHead: '/ข้าวกล้องลดเครียด.png',
    },
    {
      id: 'Kee',
      content: (
        <>
          <span className="text-orange-600 font-bold">ปัญหาขับถ่าย</span> ข้าวกล้อง ช่วยได้ไหม?
        </>
      ),
      headline: 'ปัญหาขับถ่าย ข้าวกล้องช่วยได้ไหม?',
      imageHead: '/ข้าวกล้องขับถ่าย.png',
    }
  ];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * tips.length);
    setTipIndex(randomIndex);
  }, [tips.length]);

  if (!userId) return null; // ✅ Early return หลังเรียก Hook

  const tip = tips[tipIndex];

  const gotoChat = () => {
    router.push(`/chatbot?id=${userId}&topic=${tip.id}`);
  };

  return (
    <div className="relative cursor-pointer flex justify-center font-prompt" onClick={gotoChat}>
      <div className="[background:linear-gradient(0deg,rgba(255,255,255,0.54)_0%,rgba(255,255,255,1)_100%)] w-[245px] pt-[7rem] pb-[2rem] px-[2rem] mr-[11.5rem] rounded-br-3xl">
        <div className="absolute top-[2rem]">
          <img
            className="w-[60px] bg-white h-[60px] rounded-full object-cover"
            src="/image%2075.png"
            alt="Mr. Rice"
          />
        </div>
        <h1 className="text-[#333333] w-[150px] absolute font-prompt mt-12 text-[1.7rem] font-bold font-unbounded leading-tight">
          {tip.headline}
        </h1>
        <div className="py-[1rem] mt-[9rem] flex flex-col items-center">
          <img src="/image%2069.png" className="w-[2rem] mt-[2rem] mb-1" alt="icon" />
          <h1 className="text-[#333333] font-prompt text-xs mb-[1rem]">แนะนำโดย Mr.Rice</h1>
        </div>
      </div>
      <img
        className="absolute z-[-1] object-cover w-[433px] h-[450px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
        src={tip.imageHead}
        alt="Health Tip"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = "/default.png";
        }}
      />
    </div>
  );
}
