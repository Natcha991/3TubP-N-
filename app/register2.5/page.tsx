// 'use client'

// export const dynamic = 'force-dynamic';

// import RegisterClientPage25 from './register2.5ClientPage';
// import { Suspense } from 'react';
// import { useState, useEffect } from 'react';

// export default function Page() {

//   const [appHeight, setAppHeight] = useState('100vh'); // เพิ่ม state สำหรับความสูงจริงของจอ

//   // Effect to calculate and set the actual viewport height for mobile browsers
//   useEffect(() => {
//     const updateAppHeight = () => {
//       // Use window.visualViewport.height if available for more accurate usable height
//       // Otherwise, fallback to window.innerHeight
//       setAppHeight(`${window.visualViewport?.height || window.innerHeight}px`);
//     };

//     if (typeof window !== 'undefined') {
//       updateAppHeight(); // Set initial height
//       window.addEventListener('resize', updateAppHeight); // Add resize listener
//       if (window.visualViewport) {
//         window.visualViewport.addEventListener('resize', updateAppHeight); // Listen to visual viewport changes
//       }
//     }

//     // Cleanup event listener on component unmount
//     return () => {
//       if (typeof window !== 'undefined') {
//         window.removeEventListener('resize', updateAppHeight);
//         if (window.visualViewport) {
//           window.visualViewport.removeEventListener('resize', updateAppHeight);
//         }
//       }
//     };
//   }, []);

//   return (
//     <Suspense fallback={<div
//             className="relative w-screen overflow-hidden flex flex-col items-center justify-center
//                        bg-gradient-to-br from-orange-300 to-orange-100 text-xl text-gray-700 font-prompt"
//             style={{ height: appHeight }} // Apply the calculated height
//         >
//             {/* Decoration images - ปรับขนาดด้วย w-[%] และ max-w-[] หรือ vw/vh เพื่อให้ Responsive */}
//             {/* ปรับตำแหน่ง top/left/right ให้ยืดหยุ่นมากขึ้นด้วยหน่วย vh/vw */}
//             <div className="absolute left-0 top-0 w-[ุ60vw] max-w-[250px]">
//                 <img src="/Group%2099.png" alt="Decoration"></img>
//             </div>
//             <div className="absolute right-0 bottom-0 rotate-[180deg] top-[30vh] w-[60vw] max-w-[250px]">
//                 <img src="/Group%2099.png" alt="Decoration"></img>
//             </div>
//             <div className="absolute top-[74vh] left-[3.5vw] animate-shakeright w-[30vw] max-w-[200px]">
//                 <img className='' src="/image%2084.png" alt="Decoration"></img>
//             </div>
//             <div className="absolute top-[10vh] right-[5vw] rotate-[35deg] animate-shakeright2 w-[25vw] max-w-[120px]">
//                 <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
//             </div>
//             {/* ส่วนสีพื้นหลัง (Image 69.png) - ปรับให้ใช้ max-h-[vh] และ object-contain เพื่อให้ Responsive */}
//             <img className='animate-sizeUpdown2 mb-[1.5rem] w-auto max-h-[40vh] object-contain' src="/image%2069.png" alt="Background decoration"></img>
//             <p className="z-10">กำลังโหลดข้อมูล...</p>
//         </div>}>
//       <RegisterClientPage25 />
//     </Suspense>
//   );
// }
