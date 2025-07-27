import { Suspense } from 'react';
import HomePage from './HomeClientPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="relative h-[731px] w-screen overflow-hidden flex flex-col items-center justify-center
                bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700 font-prompt">
      <div className="absolute top-0 left-0">
        <img src="/Group%2099.png" alt="Decoration"></img>
      </div>
      <div className="absolute right-0 rotate-[180deg] top-[30rem]">
        <img src="/Group%2099.png" alt="Decoration"></img>
      </div>
      <div className="absolute top-[34rem] left-[1.5rem] animate-shakeright">
        <img className='' src="/image%2084.png" alt="Decoration"></img>
      </div>
      <div className="absolute top-[3rem] left-[19rem] rotate-[35deg] animate-shakeright2">
        <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
      </div>
      {/* ส่วนสีพื้นหลัง */}
      <img className='animate-sizeUpdown2 mb-[1.5rem]' src="/image%2069.png"></img>
      <p className="z-10">กำลังโหลดข้อมูล...</p>
    </div>}>
      <HomePage />
    </Suspense>
  );
}