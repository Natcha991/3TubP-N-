'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react'; // ตรวจสอบว่าได้ติดตั้ง lucide-react แล้ว

export default function Register6() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id'); // ดึง userId จาก URL

  // ใช้ selectedGoals ในการเก็บเป้าหมายที่เลือก
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const goals: string[] = [
    'เพิ่มกล้ามเนื้อ',
    'ลดน้ำหนัก',
    'ควบคุมน้ำหนัก',
    'ลดไขมัน',
    'ลีน',
  ];

  const handleGoalToggle = (goal: string, index: number): void => {
    setSelectedGoals((prev) => {
      if (prev.includes(goal)) {
        // ถ้ามีอยู่แล้ว ให้ลบออก
        return prev.filter((g) => g !== goal);
      } else {
        // ถ้ายังไม่มี ให้เพิ่มเข้ามา
        // เลื่อนไปยังรายการที่เลือก
        scrollToSelected(index);
        return [...prev, goal];
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

  // ฟังก์ชันสำหรับส่งข้อมูลเป้าหมายไปยัง Backend
  const handleSubmit = async () => {
    if (!userId) {
      alert('ไม่พบรหัสผู้ใช้');
      return;
    }

    if (selectedGoals.length === 0) {
      alert('กรุณาเลือกเป้าหมายอย่างน้อยหนึ่งข้อ');
      return;
    }

    try {
      const res = await fetch(`/api/user/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: selectedGoals.join(',') }), // ส่งเป้าหมายเป็น string ที่คั่นด้วย comma
      });

      if (res.ok) {
        router.push(`/register7?id=${userId}`); // ✅ ไปหน้าเงื่อนไขสุขภาพ
      } else {
        alert('❌ เกิดข้อผิดพลาดในการบันทึกเป้าหมาย');
      }
    } catch (error) {
      console.error('Error submitting goals:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  // Auto scroll to first selected item on mount
  useEffect(() => {

    if (selectedGoals.length === 0) {
      setSelectedGoals(['เพิ่มกล้ามเนื้อ']);
    }

    if (selectedGoals.length > 0) {
      const firstSelectedIndex = goals.findIndex((goal) =>
        selectedGoals.includes(goal)
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
          <h1 className='text-center text-[#333333] mt-3 font-prompt font-[600] text-3xl'>เลือกเป้าหมายด้านสุขภาพ</h1>
        </div>
        <div className="flex-1 flex items-start justify-center pt-11">
          <div className="w-full max-w-sm">
            {/* Scrollable Chips */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide"
            >
              <div className="flex space-x-6 px-4 pb-4" style={{ width: 'max-content' }}>
                {goals.map((goal, index) => (
                  <button
                    key={index}
                    onClick={() => handleGoalToggle(goal, index)}
                    className={`
                      relative flex z-120 items-center mt-3 justify-center px-6 py-8 rounded-2xl min-w-max transition-all duration-200 shadow-sm whitespace-nowrap
                      ${selectedGoals.includes(goal)
                        ? 'bg-white border-2 border-orange-400 shadow-md scale-115'
                        : 'bg-white/80 hover:border-gray-300 scale-90'
                      }
                    `}
                  >
                    <span className={`
                      text-sm font-medium
                      ${selectedGoals.includes(goal) ? 'text-gray-800' : 'text-gray-600'}
                    `}>
                      {goal}
                    </span>

                    {selectedGoals.includes(goal) && (
                      <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-bounce">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex mt-[1rem] justify-center">
              {/* ปุ่ม "ถัดไป" สำหรับส่งข้อมูล */}
              <button
                onClick={handleSubmit} // เรียก handleSubmit เมื่อคลิก
                className='bg-orange-400 z-200 text-white py-2 px-4 rounded-full w-40 flex justify-center items-center gap-2' // ปรับปุ่มให้เป็นสไตล์ที่ใช้บ่อย
              >
                ถัดไป  {/* เพิ่มไอคอน */}
              </button>
            </div>

          </div>

          <div className="absolute right-0 top-[32rem] z-102 -translate-y-55 transform translate-x-35 md:translate-x-12 animate-sizeUpdown">
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