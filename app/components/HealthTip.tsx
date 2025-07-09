'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import React from 'react';


interface Tip {
  id: string;
  content: React.ReactNode;
}

export default function HealthTip({ userId }: { userId: string }) {
  const router = useRouter();

  const tips: Tip[] = [
    {
      id: 'water',
      content: (
        <>
          <span className="text-blue-600 font-bold">น้ำ</span> อย่างไรให้ไม่เสียสุขภาพ
        </>
      ),
    },
    {
      id: 'sleep',
      content: (
        <>
          <span className="text-purple-600 font-bold">นอน</span> แล้วทำอย่างไรนอนให้ดีจริงเหรอ?
        </>
      ),
    },
    {
      id: 'chew',
      content: (
        <>
          <span className="text-orange-600 font-bold">เคี้ยว</span> ให้พอดี เพื่อช่วยย่อย?
        </>
      ),
    },
  ];

  const [tipIndex, setTipIndex] = useState(0);
  const tip = tips[tipIndex];

  const gotoChat = () => {
    router.push(`/chatbot?id=${userId}&topic=${tip.id}`);
  };

  return (
    <div className="relative cursor-pointer flex justify-center font-prompt" onClick={gotoChat}>
      <div className="[background:linear-gradient(0deg,rgba(255,255,255,0.54)_0%,rgba(255,255,255,1)_100%)] w-[181px] pt-[7rem] pb-[5rem] px-[2rem] mr-[11.5rem] rounded-br-3xl">
        <div className="absolute top-[2rem]">
          <img className="w-[60px] bg-white h-[60px] rounded-full object-cover" src="/image%2076.png" />
        </div>
        <h1 className="text-[#333333] font-prompt mt-12 text-[1rem] font-bold font-unbounded leading-tight">
          เคี้ยว ขา ๆ ช่วยให้ผอมได้ไหม?
        </h1>
        <div className="py-[1rem] flex flex-col items-center">
          <img src="/heart.png" className="w-[2rem] mb-1" />
          <h1 className="text-[#333333] font-unbounded text-xs">HEALTH</h1>
        </div>
        <p className="text-xs mt-[-0.7rem] text-[#333333]">แนะนำโดย Mr. Rice</p>
      </div>
      <img
        className="absolute z-[-1] object-cover max-w-[365px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
        src="/health-bg.png"
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
