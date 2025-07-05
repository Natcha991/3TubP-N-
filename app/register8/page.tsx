'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react'; // ตรวจสอบว่าได้ติดตั้ง lucide-react แล้ว

export default function Register8() { // เปลี่ยนชื่อ Component เป็น Register8 ตามที่ระบุใน Backend
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id'); // ดึง userId จาก URL

  // ใช้ selectedLifestyles ในการเก็บไลฟ์สไตล์ที่เลือก
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // รายการไลฟ์สไตล์ที่คุณต้องการให้ผู้ใช้เลือก
  const lifestyles: string[] = [
    'กินง่าย อยู่ง่าย',
    'แอคทีฟ',
    'สายปาร์ตี้',
    'ติดบ้าน',
    'รักสุขภาพ',
    'กินมังสวิรัติ',
    'กินเจ',
    'ไม่ทานเนื้อสัตว์',
    'ทำงานหนัก',
    'เดินทางบ่อย',
  ];

  const handleLifestyleToggle = (lifestyle: string, index: number): void => {
    setSelectedLifestyles((prev) => {
      if (prev.includes(lifestyle)) {
        // ถ้ามีอยู่แล้ว ให้ลบออก
        return prev.filter((l) => l !== lifestyle);
      } else {
        // ถ้ายังไม่มี ให้เพิ่มเข้ามา
        // เลื่อนไปยังรายการที่เลือก
        scrollToSelected(index);
        return [...prev, lifestyle];
      }
    });
  };

  const scrollToSelected = (index: number): void => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const chipWidth = 140; // Approximate width of each chip + spacing, adjust if needed
      const scrollLeft = index * chipWidth - container.clientWidth / 2 + chipWidth / 2;

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth',
      });
    }
  };

  // ฟังก์ชันสำหรับส่งข้อมูลไลฟ์สไตล์ไปยัง Backend
  const handleSubmit = async () => {
    if (!userId) {
      alert('ไม่พบรหัสผู้ใช้');
      return;
    }

    if (selectedLifestyles.length === 0) {
      alert('กรุณาเลือกไลฟ์สไตล์อย่างน้อยหนึ่งข้อ');
      return;
    }

    try {
      const res = await fetch(`/api/user/${userId}`, { // ใช้ userId ใน URL endpoint
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // ส่งไลฟ์สไตล์เป็น string ที่คั่นด้วย comma
        body: JSON.stringify({ lifestyle: selectedLifestyles.join(',') }), // เปลี่ยน key เป็น 'lifestyle' ตาม Backend ที่ให้มา
      });

      if (res.ok) {
        alert('บันทึกข้อมูลเรียบร้อยแล้ว');
        router.push(`/home?id=${userId}`); // ✅ แก้ไขให้ถูกต้อง
      } else {
        alert('❌ เกิดข้อผิดพลาดในการบันทึกไลฟ์สไตล์');
      }
    } catch (error) {
      console.error('Error submitting lifestyles:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  // Auto scroll to first selected item on mount (ถ้ามีไลฟ์สไตล์ที่เลือกไว้แต่แรก)
  useEffect(() => {
    if (selectedLifestyles.length > 0) {
      const firstSelectedIndex = lifestyles.findIndex((lifestyle) =>
        selectedLifestyles.includes(lifestyle)
      );
      if (firstSelectedIndex !== -1) {
        setTimeout(() => scrollToSelected(firstSelectedIndex), 100);
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="relative h-screen w-screen cursor-pointer font-prompt flex flex-col items-center bg-gradient-to-br from-orange-300 to-orange-100">
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

      <div className="flex flex-col z-100 items-center mt-[4rem]">
        <div className="w-full">
          <h1 className='text-center text-[#333333] mt-2 font-prompt font-[600] text-3xl'>เลือกไลฟ์สไตล์ของคุณ</h1>
        </div>
        <div className="flex-1 flex items-start justify-center pt-11">
          <div className="w-full max-w-sm">
            {/* Scrollable Chips */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide"
            >
              <div className="flex space-x-3 px-4 pb-4" style={{ width: 'max-content' }}>
                {lifestyles.map((lifestyle, index) => (
                  <button
                    key={index}
                    onClick={() => handleLifestyleToggle(lifestyle, index)}
                    className={`
                      relative flex items-center justify-center px-4 py-3 rounded-2xl min-w-max transition-all duration-200 shadow-sm whitespace-nowrap
                      ${selectedLifestyles.includes(lifestyle)
                        ? 'bg-white border-2 border-orange-400 shadow-md scale-105'
                        : 'bg-white/80 border-2 border-gray-200 hover:border-gray-300 hover:scale-102'
                      }
                    `}
                  >
                    <span className={`
                      text-sm font-medium
                      ${selectedLifestyles.includes(lifestyle) ? 'text-gray-800' : 'text-gray-600'}
                    `}>
                      {lifestyle}
                    </span>

                    {selectedLifestyles.includes(lifestyle) && (
                      <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-bounce">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex mt-[1rem] justify-center">
              {/* ปุ่ม "เสร็จสิ้น" สำหรับส่งข้อมูล */}
              <button
                onClick={handleSubmit} // เรียก handleSubmit เมื่อคลิก
                className='bg-orange-400 text-white py-2 px-4 rounded-full w-40 flex justify-center items-center gap-2' // ปรับปุ่มให้เป็นสไตล์ที่ใช้บ่อย
              >
                เสร็จสิ้น
                <img src="/image%2082.png" alt="Next" className="h-4 w-4 transform rotate-90" /> {/* เพิ่มไอคอน */}
              </button>
            </div>

          </div>

          <div className="absolute right-0 top-[32rem] z-102 -translate-y-55 transform translate-x-35 md:translate-x-12">
            <img
              src="/image%20102.png"
              alt='Decor'
              className="w-[430px] h-[540px]"
            />
          </div>

          {/* ส่วนล่างสุด (เมนู/ต่อไป) */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt">
            <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
              {/* สามารถเพิ่มเนื้อหาสำหรับส่วนล่างสุดได้ที่นี่ */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}