'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react'; // Added useEffect for appHeight

export default function Register4() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id');

    const [gender, setGender] = useState('');
    const [appHeight, setAppHeight] = useState('100vh'); // State for actual viewport height

    // Effect to calculate and set the actual viewport height for mobile browsers
    useEffect(() => {
        const updateAppHeight = () => {
            // Use window.visualViewport.height if available for more accurate usable height
            // Otherwise, fallback to window.innerHeight
            setAppHeight(`${window.visualViewport?.height || window.innerHeight}px`);
        };

        if (typeof window !== 'undefined') {
            updateAppHeight(); // Set initial height
            window.addEventListener('resize', updateAppHeight); // Add resize listener for window (fallback)
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', updateAppHeight); // Listen to visual viewport changes
            }
        }

        // Cleanup event listener on component unmount
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', updateAppHeight);
                if (window.visualViewport) {
                    window.visualViewport.removeEventListener('resize', updateAppHeight);
                }
            }
        };
    }, []); // Run only once on component mount

    const handleSubmit = async (selectedGender: string) => {
        if (!userId) {
            alert('ไม่พบรหัสผู้ใช้'); // Consider using an in-component error state instead of alert
            return;
        }

        // setGender(selectedGender); // This state update is not strictly necessary before fetch if only used for UI highlight

        const res = await fetch(`/api/user/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gender: selectedGender }), // Use selectedGender directly
        });

        if (res.ok) {
            setGender(selectedGender); // Update state here to show immediate feedback if needed
            router.push(`/register5?id=${userId}`); // ✅ Go to next page (weight/height)
        } else {
            alert('❌ เกิดข้อผิดพลาดในการบันทึกเพศ'); // Consider using an in-component error state instead of alert
        }
    };

    return (
        // Apply appHeight to the main div for accurate mobile viewport height
        <div
            className="relative w-screen flex flex-col items-center
                       bg-gradient-to-br from-orange-300 to-orange-100 font-prompt overflow-hidden"
            style={{ height: appHeight }} // Apply the calculated height to fill the screen
        >
            {/* รูปภาพตกแต่งด้านข้าง/มุม - ยังคงใช้ absolute ได้ */}
            {/* ปรับขนาดด้วย vw/vh และ max-w/h เพื่อให้ Responsive */}
            <div className="absolute left-0 top-0 w-[60vw] max-w-[250px] z-10">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            <div className="absolute right-0 rotate-[180deg] top-[30vh] w-[60vw] bottom-0 max-w-[250px] z-10">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            <div className="absolute top-[20vh] left-[1.5vw] animate-shakeright w-[20vw] max-w-[100px] z-10">
                <img src="/image%2084.png" alt="Decoration" />
            </div>
            <div className="absolute top-[50vh] right-0 rotate-[35deg] animate-shakeright2 w-[25vw] max-w-[120px] z-10">
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration" />
            </div>

            {/* ส่วนเนื้อหาหลักที่อยู่ใน flow (h1, ตัวเลือกเพศ, img) */}
            {/* ใช้ flex-col และ justify-between เพื่อจัดเรียงลูกๆ และ flex-grow เพื่อให้ขยายเต็มพื้นที่ */}
            {/* ปรับ pb เพื่อเว้นที่ว่างให้ footer */}
            <div className="flex flex-col items-center justify-between flex-grow pt-[5rem] pb-[13rem] px-4"> {/* px-4 for horizontal padding */}
                {/* ส่วนข้อความด้านบน */}
                <div className="flex flex-col items-center mb-4 text-center">
                    <h1 className='max-w-[330px] text-[#333333] mt-2 font-[500] text-[1.8rem]'>
                        ผมเป็นผู้ชายนะ<br />แล้วคุณล่ะ?
                    </h1>
                </div>

                {/* ส่วนตัวเลือก ชาย หรือ หญิง */}
                {/* เพิ่ม z-index ให้ตัวเลือกเพศ เพื่อให้แน่ใจว่าอยู่เหนือ content อื่นๆ หากมีการทับซ้อน */}
                <div className="font-prompt gap-2 flex items-center mt-[1rem] cursor-pointer z-20">
                    <button
                        type='button'
                        onClick={() => handleSubmit('ชาย')}
                        className={`bg-[#ACE5FF] border-2 ${gender === 'ชาย' ? 'border-[#FF6600]' : 'border-[#333333]'} flex text-[1rem] rounded-2xl px-[3rem] py-[1.5rem] transition duration-200`}
                    >
                        ผู้ชาย
                    </button>
                    <button
                        type='button'
                        onClick={() => handleSubmit('หญิง')}
                        className={`bg-[#FF9BCD] border-2 ${gender === 'หญิง' ? 'border-[#FF6600]' : 'border-[#333333]'} flex text-[1rem] rounded-2xl px-[3rem] py-[1.5rem] transition duration-200`}
                    >
                        ผู้หญิง
                    </button>
                </div>

                {/* ส่วนรูปภาพ Mr.Rice (image_86.png) - อยู่ใน flow ของเนื้อหาหลัก */}
                {/* ใช้ max-h-[vh] และ object-contain เพื่อให้ Responsive */}
                <div className="flex justify-center z-40 mt-[1rem] animate-sizeUpdown">
                    <img
                        src="/image%2086.png"
                        alt='Mr.Rice character'
                        className="w-auto max-h-[50vh] object-contain" // Changed h-[430px] to max-h-[50vh]
                    />
                </div>
            </div>

            {/* ส่วนล่างสุด (เมนู/ต่อไป) - ยังคงใช้ absolute เพื่อให้ติดขอบล่าง */}
            {/* ใช้ bottom-0 แทน top เพื่อให้มันติดขอบล่างเสมอไม่ว่าจะความสูงจอเท่าไร */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt z-30">
                <div className="bg-white w-full max-w-[500px] px-[4rem] py-[4rem] rounded-t-4xl shadow-lg flex justify-between">
                    {/* สามารถเพิ่มเนื้อหาสำหรับส่วนล่างสุดได้ที่นี่ */}
                </div>
            </div>
        </div>
    );
}