'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react'; // ตรวจสอบว่าได้ติดตั้ง lucide-react แล้ว

export default function Register6() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

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
      let newGoals;
      if (prev.includes(goal)) {
        newGoals = prev.filter((g) => g !== goal);
      } else {
        newGoals = [...prev, goal];
      }
      // เลื่อนไปยังรายการที่เลือก หากมีการเพิ่มใหม่
      if (!prev.includes(goal)) {
        // ใช้ setTimeout เพื่อให้แน่ใจว่า DOM อัปเดตก่อน scroll
        setTimeout(() => scrollToSelected(index), 0);
      }
      return newGoals;
    });
  };

  const scrollToSelected = (index: number): void => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Chip width + margin-right (space-x-6)
      // px-6 (padding) + text width. Assume roughly 140px for a chip.
      // Or calculate dynamically:
      const chipElement = container.children[0]?.children[index] as HTMLElement;
      if (chipElement) {
        const chipOffsetLeft = chipElement.offsetLeft;
        const chipWidth = chipElement.offsetWidth;
        const containerWidth = container.clientWidth;

        // Calculate scroll position to center the selected chip
        const scrollLeft = chipOffsetLeft - (containerWidth / 2) + (chipWidth / 2);

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  };

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
        body: JSON.stringify({ goal: selectedGoals.join(',') }),
      });

      if (res.ok) {
        router.push(`/register7?id=${userId}`);
      } else {
        alert('❌ เกิดข้อผิดพลาดในการบันทึกเป้าหมาย');
      }
    } catch (error) {
      console.error('Error submitting goals:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  // Auto select "เพิ่มกล้ามเนื้อ" and scroll to it on mount
  useEffect(() => {
    if (selectedGoals.length === 0) {
      setSelectedGoals(['เพิ่มกล้ามเนื้อ']);
    }
  }, [selectedGoals]); // เพิ่ม selectedGoals ใน dependency array เพื่อป้องกัน loop

  useEffect(() => {
    // Scroll only once after initial selection or when selectedGoals changes
    if (selectedGoals.length > 0) {
      const firstSelectedIndex = goals.findIndex((goal) => selectedGoals.includes(goal));
      if (firstSelectedIndex !== -1 && scrollContainerRef.current) {
        // ใช้ setTimeout เพื่อให้แน่ใจว่า DOM อัปเดตเสร็จสิ้นก่อนที่จะ scroll
        // โดยเฉพาะอย่างยิ่งเมื่อมีการ setState ที่เปลี่ยนขนาดของ elements
        setTimeout(() => scrollToSelected(firstSelectedIndex), 100);
      }
    }
  }, [selectedGoals, goals]); // เพิ่ม goals ใน dependency array ด้วย

  return (
    <div className="relative min-h-screen w-screen cursor-pointer overflow-hidden font-prompt flex flex-col items-center bg-gradient-to-br from-orange-300 to-orange-100">
      {/* Background Decorations - ปรับ z-index ให้ต่ำ เพื่อไม่ให้บัง content หลัก */}
      <div className="absolute left-0 top-0 z-0"> {/* เพิ่ม top-0 เพื่อให้เริ่มจากขอบบน */}
        <img src="/Group%2099.png" alt="Decoration"></img>
      </div>
      <div className="absolute right-0 top-[30rem] rotate-[180deg] z-0">
        <img src="/Group%2099.png" alt="Decoration"></img>
      </div>
      <div className="absolute top-[28rem] left-[0rem] animate-shakeright z-0">
        <img className='w-[150px]' src="/image%2084.png" alt="Decoration"></img>
      </div>
      <div className="absolute top-[35rem] left-[19rem] rotate-[35deg] animate-shakeright2 z-0">
        <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
      </div>

      {/* Main Content Container - ใช้ flex-grow เพื่อให้เนื้อหาขยายเต็มที่ */}
      <div className="flex flex-col items-center w-full flex-grow pt-[4rem] relative z-10"> {/* ปรับ z-index และเพิ่ม flex-grow */}
        <div className="w-full">
          <h1 className='text-center text-[#333333] mt-3 font-prompt font-[600] text-3xl'>เลือกเป้าหมายด้านสุขภาพ</h1>
        </div>

        {/* Flex container for the goal chips and next button */}
        <div className="flex flex-col items-center justify-start flex-grow w-full max-w-sm mt-5 px-4"> {/* ปรับ pt-11 เป็น mt-11, เพิ่ม px-4, max-w-sm */}
          {/* Scrollable Chips Container */}
          <div
            ref={scrollContainerRef}
            // เพิ่ม overflow-x-auto และ w-full
            className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide"
          >
            {/* Inner div to hold the chips - remove width: 'max-content' if it's causing issues */}
            <div className="inline-flex space-x-6 pb-4 pt-7 pl-4"> {/* เปลี่ยนเป็น inline-flex */}
              {goals.map((goal, index) => (
                <button
                  key={index}
                  onClick={() => handleGoalToggle(goal, index)}
                  className={`
                    relative flex z-120 animate-sizeUpdown items-center mt-[-1rem] justify-center px-6 py-8 rounded-2xl min-w-max transition-all duration-200 shadow-sm
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

          <div className="flex mt-[1rem] justify-center z-400 w-full"> {/* เพิ่ม w-full */}
            {/* ปุ่ม "ถัดไป" สำหรับส่งข้อมูล */}
            <button
              onClick={handleSubmit}
              className='bg-orange-400 z-200 text-white py-2 px-2 rounded-full w-30 flex justify-center items-center gap-2'
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {/* Mr. Rice Character and Speech Bubble - ควรอยู่ในตำแหน่งที่ถูกต้องและ z-index สูงพอ */}
      {/* ปรับตำแหน่งและ z-index ให้เหมาะสม */}
      <div className="absolute right-0 top-[30rem] z-1 -translate-y-55 transform translate-x-25 md:translate-x-12">
        <div className="absolute animate-showUp z-25 left-[-2.5rem] top-[4rem] w-[140px] h-[100px]"> {/* ปรับ z-index */}
          <div className="bg-[#f1c783a4] absolute top-[1.5rem] left-[-3.5rem] border-white border-2 inline-flex py-[0.5rem] px-[1rem] font-Unbounded text-[#333333] rounded-4xl z-30"> {/* ปรับ z-index */}
            Mr.Rice
          </div>
          <div className="bg-white text-[1rem] shadow-xl absolute text-center top-[3rem] left-[-5rem] px-[1rem] pt-[1.8rem] pb-[1rem] rounded-2xl rounded-br-none z-20"> {/* ปรับ z-index */}
            <h1>ผมจะได้ช่วยแนะนำคุณได้ถูกทางยังไงละ</h1>
          </div>
        </div>
        <img
          src="/image%20102.png"
          alt='Decor'
          className="w-auto h-[430px] animate-sizeUpdown"
        />
      </div>

      {/* Bottom section (Footer like) */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt"> {/* ปรับ z-index */}
        <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
          {/* สามารถเพิ่มเนื้อหาสำหรับส่วนล่างสุดได้ที่นี่ */}
        </div>
      </div>
    </div>
  );
}