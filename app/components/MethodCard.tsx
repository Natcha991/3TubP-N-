// components/MethodCard.tsx
import React from 'react';

// กำหนด Type สำหรับ Props ของ MethodCard โดยตรงในไฟล์นี้
interface MethodCardProps {
  num: number;
  title: string;
  detail: string;
  imageUrl: string;
}

const MethodCard: React.FC<MethodCardProps> = ({ num, title, detail, imageUrl }) => {
  return (
    <div className="bg-[#FFF5DD] flex justify-between items-center border-2 border-[#C9AF90] sm:w-[400px] w-[400px] max-w-sm h-[7rem] rounded-[8px] overflow-hidden">
      <img className="h-full w-[120px] object-cover rounded-l-[8px]" src={imageUrl} alt={title || "Step Image"} />
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