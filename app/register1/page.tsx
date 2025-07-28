'use client';
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const [appHeight, setAppHeight] = useState('100vh'); // State for actual viewport height

    // Effect to calculate and set the actual viewport height for mobile browsers
    useEffect(() => {
        const updateAppHeight = () => {
            // Set appHeight to window.innerHeight to account for mobile browser UI elements
            setAppHeight(`${window.innerHeight}px`);
        };

        if (typeof window !== 'undefined') {
            updateAppHeight(); // Set initial height
            window.addEventListener('resize', updateAppHeight); // Add resize listener
        }

        // Clean up event listener on component unmount
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', updateAppHeight);
            }
        };
    }, []); // Run only once on component mount

    const goto = () => {
        router.push("/register2");
    };

    return (
        // Use appHeight for accurate viewport height on mobile devices
        <div
            onClick={goto} // The entire screen is clickable to navigate
            className="relative w-screen cursor-pointer flex flex-col items-center justify-between
                       bg-gradient-to-br from-orange-300 to-orange-100 font-prompt overflow-hidden"
            style={{ height: appHeight }} // Apply the calculated height to fill the screen without scroll
        >
            {/* Decoration images - Positioned absolutely to stay fixed relative to the viewport. */}
            {/* Adjust sizes with w-[%] and max-w-[] for responsiveness without squishing by keyboard. */}
            <div className="absolute left-0 top-0 w-[60%] max-w-[250px] z-10"> {/* Ensure z-index so they don't get hidden */}
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            <div className="absolute right-0 rotate-[180deg] top-[30rem] w-[60%] max-w-[250px] z-10">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            {/* Adjust top/left of these decorative images to fit the new layout if they overlap */}
            <div className="absolute top-[20rem] left-[1.5rem] animate-shakeright w-[20%] max-w-[100px] z-10">
                <img src="/image%2084.png" alt="Decoration" />
            </div>
            <div className="absolute top-[30rem] left-[19rem] rotate-[35deg] animate-shakeright2 w-[25%] max-w-[120px] z-10">
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration" />
            </div>

            {/* Main content area (text + Mr.Rice image) */}
            {/* Use flex-grow to allow this section to expand and push other content, and center its children */}
            {/* Adjust padding-top/bottom to create space from the top and bottom edges (where the hidden button is). */}
            <div className="flex flex-col items-center flex-grow justify-center px-4 pt-[5.25rem] pb-8">
                {/* Top text section */}
                <div className="flex flex-col items-center text-center">
                    <h1 className='w-[300px] text-[#333333] font-[500] text-3xl animate-dopdop leading-tight'>
                        เดี๋ยวก่อน!! ก่อนจะไปดูเมนู ผมขอถามอะไรคุณก่อนสิ
                    </h1>
                </div>

                {/* Mr.Rice image section */}
                {/* Use max-h-[vh] and object-contain for responsive image sizing. */}
                {/* flex-grow and items-center within this div help center the image vertically. */}
                <div className="flex justify-center z-30 animate-sizeUpdown flex-grow items-center">
                    <img
                        src="/image%2085.png"
                        alt='Mr.Rice asking'
                        className="w-auto max-h-[50vh] object-contain" // Set max height relative to viewport and maintain aspect ratio
                    />
                </div>
            </div>

            {/* ส่วนล่างสุด (ที่ว่างเปล่าในโค้ดนี้) - ติดกับขอบล่างเสมอ และอยู่เหนือเนื้อหาอื่น ๆ ด้วย z-index */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt z-20">
                <div className="bg-white w-full max-w-[500px] px-[4rem] py-[4rem] rounded-t-4xl flex justify-between">
                    {/* เนื้อหาในส่วนล่างสุดจะอยู่ตรงนี้ */}
                </div>
            </div>
        </div>
    );
}