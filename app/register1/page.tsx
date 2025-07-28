'use client';
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; // Import useState and useEffect

export default function Home() {
    const router = useRouter();
    const [appHeight, setAppHeight] = useState('100vh'); // Add state for actual viewport height

    // Effect to calculate and set the actual viewport height for mobile browsers
    useEffect(() => {
        const updateAppHeight = () => {
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
            style={{ height: appHeight }} // Apply the calculated height
        >
            {/* Decoration images - Adjust sizes with w-[%] and max-w-[] for responsiveness */}
            <div className="absolute left-0 top-0 w-[60%] max-w-[250px]"> {/*  */}
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            <div className="absolute right-0 rotate-[180deg] top-[30rem] w-[60%] max-w-[250px]"> {/*  */}
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            {/* Adjust top/left of these decorative images to fit the new layout if they overlap */}
            <div className="absolute top-[20rem] left-[1.5rem] animate-shakeright w-[20%] max-w-[100px]"> {/*  */}
                <img src="/image%2084.png" alt="Decoration" />
            </div>
            <div className="absolute top-[30rem] left-[19rem] rotate-[35deg] animate-shakeright2 w-[25%] max-w-[120px]"> {/*  */}
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration" />
            </div>

            {/* Main content area (text + Mr.Rice image) */}
            {/* Use flex-grow to allow this section to expand and push other content */}
            {/* Adjust padding-top to create space from the top */}
            <div className="flex flex-col items-center flex-grow justify-center pt-19 pb-8"> {/* Added pb-8 for bottom padding */}
                {/* Top text section */}
                <div className="flex flex-col items-center mb-4 text-center">
                    <h1 className='w-[300px] text-[#333333] font-[500] text-3xl animate-dopdop leading-tight'>
                        เดี๋ยวก่อน!! ก่อนจะไปดูเมนู ผมขอถามอะไรคุณก่อนสิ
                    </h1>
                </div>

                {/* Mr.Rice image section */}
                {/* Use max-h-[vh] and object-contain for responsive image sizing */}
                <div className="flex justify-center z-10 animate-sizeUpdown mt-8 flex-grow items-center"> {/* Added flex-grow and items-center to center the image vertically within its flex container */}
                    <img
                        src="/image%2085.png"
                        alt='Mr.Rice asking'
                        className="w-auto max-h-[60vh] object-contain" // Set max height relative to viewport and maintain aspect ratio
                    />
                </div>
            </div>

            {/* Removed the empty bottom absolute div as requested */}
            {/* <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt">
                <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
                </div>
            </div> */}
        </div>
    );
}
