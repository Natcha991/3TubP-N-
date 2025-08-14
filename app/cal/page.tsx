'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Calendar } from 'lucide-react';
import BackgroundDecor from '../components/BackgroundDecor';
import { Prompt } from 'next/font/google';

const prompt = Prompt({
  weight: ['400', '700', '800', '900'],
  subsets: ['thai', 'latin'],
});

export default function FoodPage() {
  const foodName = 'กุ้งลวก';
  const time = '19:32';
  const kcal = 210;
  const subtitleKcal = 399;
  const dailyGoal = 1990;
  const progress = Math.min(kcal / dailyGoal, 1);

  const nutrients = [
    { label: 'โปรตีน', value: '14 g' },
    { label: 'คาร์โบไฮเดรต', value: '28 g' },
    { label: 'ไขมัน', value: '14 g' },
    { label: 'ใยอาหาร', value: '14 g' },
  ];

  return (
    <main className={`${prompt.className} relative min-h-screen overflow-x-hidden`}>
      {/* พื้นหลังเดิม */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <BackgroundDecor />
      </div>

      {/* คอนเทนเนอร์หลัก */}
      <div className="relative z-10 mx-auto max-w-[1100px] lg:px-6 py-6 lg:py-10">
        
        {/* รูปอาหาร */}
        <section
          className="
            relative -mt-6 sm:mt-0
            left-1/2 -mx-[50vw] w-screen
            sm:left-auto sm:mx-0 sm:w-auto
          "
        >
          <div className="relative h-[410px] sm:h-[320px] lg:h-[520px] overflow-hidden rounded-none sm:rounded-[24px] bg-[#FFF3E0] shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
            <Image
              src="/ingredients/ผัดผักกุ้ง.png"
              alt="shrimp"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />

            {/* vignette + bottom fade */}
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(68%_68%_at_50%_45%,rgba(255,246,209,0)_0%,rgba(255,246,209,0.12)_58%,rgba(0,0,0,0.28)_100%)]" />
            {/* fade ด้านล่าง (ขึ้นบน) */}
            <div className="absolute inset-x-0 bottom-0 h-24 [background:linear-gradient(0deg,rgba(255,246,209,0.95),rgba(255,246,209,0))]" />
            {/* fade ด้านบน (ลงล่าง) — แก้ไวยากรณ์ให้ถูก */}
            <div className="absolute inset-x-0 top-0 h-24 [background:linear-gradient(180deg,rgba(255,246,209,0.95),rgba(255,246,209,0))]" />

            {/* ปุ่มย้อนกลับ */}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                history.length ? history.back() : (window.location.href = '/');
              }}
              aria-label="ย้อนกลับ"
              className="absolute left-4 top-4 grid place-items-center rounded-full bg-white shadow-[0_10px_22px_rgba(0,0,0,0.2)] size-9 active:scale-95 transition-transform"
            >
              <ChevronLeft className="size-5 text-[#222]" />
            </Link>

            {/* ชื่อ + เวลา */}
            <div className="absolute inset-x-0 top-6 text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
              <h1 className="text-[32px] sm:text-[34px] lg:text-[46px] leading-none font-extrabold text-[#1F1F1F]">
                {foodName}
              </h1>
              <span className="mt-2 inline-block text-[13px] sm:text-[14px] font-semibold text-[#1F1F1F] bg-white/75 px-2 py-[2px] rounded-full">
                {time}
              </span>
            </div>
          </div>
        </section>

        {/* กล่องล่าง */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start justify-items-center mt-0">
          
          {/* การ์ด 210 */}
          <section className="w-full lg:w-full">
            <div
              className="
                relative left-1/2 -mx-[50vw] w-screen sm:static sm:mx-0 sm:w-auto
                rounded-none sm:rounded-[20px] overflow-hidden
                bg-[#f2ede4] shadow-[0_16px_36px_rgba(0,0,0,0.12)]
                -mt-px
              "
            >
              <div className="py-1 sm:py-7 text-center">
                <div className="text-[96px] sm:text-[100px] lg:text-[120px] leading-none font-black tracking-[0.5px] text-[#2B2B2B]">
                  {kcal}
                </div>
                <div className="mt-2 text-[16px] sm:text-[18px] lg:text-[20px] font-extrabold text-[#FF7A1A]">
                  {subtitleKcal} cal
                </div>
              </div>
            </div>
          </section>

          {/* ขวาล่าง */}
          <section className="w-full max-w-[373px] lg:max-w-none lg:w-full flex flex-col gap-5 sm:gap-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              
              {/* สารอาหาร */}
              <div className="rounded-[16px] bg-white p-3.5 sm:p-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
                <div className="inline-flex">
                  <span className="rounded-full bg-[#FF6B2C] text-white text-[15px] sm:text-[16px] font-extrabold px-3 py-1 shadow-[0_6px_18px_rgba(255,107,44,0.45)]">
                    สารอาหาร
                  </span>
                </div>
                <ul className="mt-3 divide-y divide-[#E8EDF3] rounded-[12px] overflow-hidden">
                  {nutrients.map((n) => (
                    <li key={n.label} className="flex items-center justify-between px-3 py-2 bg-[#FAFCFF]">
                      <span className="text-[13px] sm:text-[14px] font-medium text-[#3A3A3A]">{n.label}</span>
                      <span className="text-[12px] sm:text-[13px] text-[#9CA3AF] tabular-nums">{n.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* cal/day + weekly */}
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* เกจ */}
                <div className="rounded-[16px] bg-white px-3.5 py-3.5 sm:p-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
                  <div className="w-fit mx-auto -mt-6 mb-1.5">
                    <div className="rounded-full px-3 py-1 text-[12px] font-bold text-white bg-[#FF7A1A] shadow-[0_8px_20px_rgba(255,122,26,0.35)]">
                      cal / day
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col items-center">
                    <svg viewBox="0 0 100 60" className="w-[140px] h-[84px]" aria-hidden="true">
                      <path
                        d="M10 50 A40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#D7DCE4"
                        strokeWidth="10"
                        strokeLinecap="round"
                        pathLength={100}
                      />
                      <path
                        d="M10 50 A40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#37C871"
                        strokeWidth="10"
                        strokeLinecap="round"
                        pathLength={100}
                        style={{ strokeDasharray: `${progress * 100} 100` }}
                      />
                    </svg>
                    <div className="mt-1 text-center">
                      <div className="text-[22px] sm:text-[24px] font-extrabold text-[#222] leading-none">{kcal}</div>
                      <div className="text-[11px] sm:text-[12px] text-[#FF7A1A]">{dailyGoal} cal</div>
                    </div>
                  </div>
                  <div className="mt-3 h-[12px] rounded-[10px] bg-[#00A862]/90" />
                </div>

                {/* weekly log */}
                <button
                  type="button"
                  onClick={() => alert('เปิด weekly log')}
                  className="text-left rounded-[16px] bg-white p-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[16px] sm:text-[18px] font-semibold text-[#2F2F2F]">
                      weekly
                      <div className="text-[12px] text-[#8C8C8C] leading-none">log</div>
                    </div>
                    <div className="rounded-[12px] bg-[#FFF2E7] p-2 shadow-[inset_0_-2px_0_rgba(0,0,0,0.06)]">
                      <Calendar className="size-5 text-[#FF7A1A]" strokeWidth={2.6} />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
