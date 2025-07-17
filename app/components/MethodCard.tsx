// components/MethodCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';

interface MethodCardProps {
  num: number; // ยังเก็บไว้ใน props เผื่อใช้ แต่ไม่ต้อง destructure มาใช้ถ้ายังไม่ใช้จริง
  title: string;
  detail: string;
  imageUrl: string;
}

const MethodCard: React.FC<MethodCardProps> = ({ title, detail, imageUrl }) => {
  return (
    <div className="bg-[#FFF5DD] animate-OpenScene flex justify-between items-center border-2 border-[#C9AF90] sm:w-[400px] w-[400px] max-w-sm h-[7rem] rounded-[8px] overflow-hidden">
      <Image
        className="h-full w-[120px] object-cover rounded-l-[8px]"
        src={imageUrl}
        alt={title || "Step Image"}
        width={120}
        height={112} // คำนวณตาม 7rem = 112px เพื่อไม่ให้ layout shift
      />
      <div className="flex flex-col items-center justify-center gap-1 flex-grow p-2">
        <div className="flex gap-1.5 font-[600] text-[#333333]"> 
          <h1>{title}</h1>
        </div>
        <h1 className="text-[0.8rem] text-[#333333] w-[90%] text-center">{detail}</h1>
      </div>
    </div>
  );
};

export default MethodCard;
