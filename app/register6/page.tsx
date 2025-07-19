export const dynamic = 'force-dynamic';

import RegisterClientPage6 from './register6ClientPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div className="overflow-hidden">
        <div className="absolute left-0">
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
        <div className="flex flex-col font-prompt min-h-screen items-center justify-center bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700">
          <img className='animate-sizeUpdown2 mb-[1.5rem]' src="/image%2069.png"></img>
          กำลังโหลดข้อมูล...
        </div>
      </div>}>
      <RegisterClientPage6 />
    </Suspense>
  );
}
