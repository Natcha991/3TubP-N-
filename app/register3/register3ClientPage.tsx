'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Register3() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id'); // 🔍 ดึง userId ที่ส่งมาจาก register2
    const [loading, setLoading] = useState<boolean>(false);
    const [birthday, setBirthday] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [appHeight, setAppHeight] = useState('100vh'); // State for actual viewport height

    // Combined Effect for appHeight and keyboard detection
    useEffect(() => {
        const updateViewportState = () => {
            // Use window.visualViewport.height if available for more accurate usable height
            // Otherwise, fallback to window.innerHeight
            const currentViewportHeight = window.visualViewport?.height || window.innerHeight;
            setAppHeight(`${currentViewportHeight}px`);

            const initialViewportHeight = window.innerHeight;
            // Detect if viewport height significantly reduces (indicating keyboard/date picker is open)
            // Adjust the threshold (e.g., 0.9 or 0.95) as needed for your specific UI and device behavior
            setIsKeyboardOpen(currentViewportHeight < initialViewportHeight * 0.95);
        };

        if (typeof window !== 'undefined') {
            updateViewportState(); // Set initial state
            window.addEventListener('resize', updateViewportState); // Add resize listener for window (fallback)

            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', updateViewportState); // Listen to visual viewport changes
            }
        }

        // Cleanup event listeners on component unmount
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', updateViewportState);
                if (window.visualViewport) {
                    window.visualViewport.removeEventListener('resize', updateViewportState);
                }
            }
        };
    }, []); // Run only once on component mount

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        if (!userId) {
            setError('ไม่พบรหัสผู้ใช้ กรุณาลองใหม่อีกครั้ง');
            return;
        }
        if (!birthday) {
            setError('กรุณาเลือกวันเกิด');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/user/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ birthday }),
            });

            if (res.ok) {
                router.push(`/register4?id=${userId}`); // 👉 ไปหน้าถัดไป พร้อมส่ง userId ต่อ
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'เกิดข้อผิดพลาดในการบันทึกวันเกิด');
            }
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Registration error:', error);
            setError(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        } finally {
            setLoading(false);
        }
    };

    return (
        // ใช้ appHeight ที่คำนวณจาก JS เพื่อความสูงที่ถูกต้องบนมือถือ
        <div
            className="relative w-screen overflow-hidden flex flex-col items-center justify-between
                       bg-gradient-to-br from-orange-300 to-orange-100 font-prompt"
            style={{ height: appHeight }} // Apply the calculated height to fill the screen
        >
            {/* ภาพประกอบด้านบนซ้าย - ใช้ absolute เพื่อให้ลอยอยู่เหนือเนื้อหาและไม่ได้รับผลกระทบจากแป้นพิมพ์ */}
            <div className="absolute left-0 top-0 w-[60vw] max-w-[250px] z-10">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            {/* ภาพประกอบด้านขวาล่าง (หมุน 180 องศา) */}
            <div className="absolute right-0 rotate-[180deg] bottom-0 w-[60vw] max-w-[250px] z-10">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            {/* ภาพประกอบเคลื่อนไหว - ตัวแรก */}
            <div className="absolute top-[40vh] left-[4.5vw] animate-shakeright w-[20vw] max-w-[100px] z-10">
                <img src="/image%2084.png" alt="Decoration" />
            </div>
            {/* ภาพประกอบเคลื่อนไหว - ตัวที่สอง */}
            <div className="absolute top-[50vh] right-0 rotate-[35deg] animate-shakeright2 w-[25vw] max-w-[120px] z-10">
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration" />
            </div>

            {/* ส่วนข้อความด้านบนและ Form สำหรับ input */}
            {/* ใช้ flex-grow เพื่อให้ส่วนนี้ขยายตัวและดันรูปภาพด้านล่างได้ */}
            {/* ปรับ padding-bottom แบบ dynamic เพื่อให้ Input field ไม่ถูกบังเมื่อ Date Picker เปิด */}
            <div className="flex flex-col items-center justify-between flex-grow pt-[5rem] px-4"
                style={{ paddingBottom: isKeyboardOpen ? '1rem' : '5vh' }}> {/* Dynamic padding-bottom */}
                
                <div className="w-full text-center">
                    <h1 className='w-[300px] inline-block text-[#333333] mt-2 font-prompt font-[500] text-3xl'>
                        แล้ววันเกิดของคุณล่ะคือวันไหน?
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="flex mt-[1.5rem] justify-center items-center font-prompt z-30">
                    {/* DatePicker สำหรับใส่วันเกิด */}
                    <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        required
                        className="p-[0.8rem] px-[0.8rem] rounded-3xl border-[#333333] border-2 bg-white" // ลบ ml-[0.5rem] เพราะมีปุ่มอยู่ติดกัน
                    />

                    {/* ปุ่ม Submit */}
                    <button
                        type='submit'
                        disabled={loading}
                        className='relative bg-grey-400 w-[45px] p-[0.8rem] transition hover:scale-105 duration-300 cursor-pointer flex items-center justify-center rounded-4xl border-[#333333] border-2 ml-[0.5rem] h-[45px]'
                    >
                        <img src="/image%2082.png" alt="Submit" width={24} height={24} />
                        {loading && (
                            <span className="absolute inset-0 flex items-center justify-center text-[0.6rem] text-white bg-black bg-opacity-50 rounded-4xl">
                                กำลังโหลด...
                            </span>
                        )}
                    </button>
                </form>
                {/* แสดงข้อผิดพลาด */}
                {error && (
                    <p className="mt-2 text-red-600 text-sm text-center z-30">{error}</p>
                )}
            </div>

            {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน (image_87.png) */}
            {/* ใช้ flex-grow และ items-center เพื่อให้รูปภาพอยู่ตรงกลางและขยายตามพื้นที่ที่เหลือ */}
            <div className="flex justify-center z-50 mb-[18rem] animate-sizeUpdown">
                    <img src="/image%2087.png" alt='Decor' className="w-auto max-h-[50vh] object-contain" />
                </div>

            {/* ส่วนล่างสุด - ยังคงใช้ absolute เพื่อให้ติดขอบล่าง และซ่อนเมื่อแป้นพิมพ์/Date Picker เปิด */}
            <div className={`absolute bottom-0 left-0 right-0 flex justify-center font-prompt z-40 ${isKeyboardOpen ? 'hidden' : ''}`}>
                <div className="bg-white w-full max-w-[500px] px-[4rem] py-[4rem] rounded-t-4xl shadow-lg flex justify-between">
                    {/* ถ้ามีปุ่ม "ต่อไป" หรือเนื้อหาอื่น ๆ ในส่วนนี้ ให้เพิ่มได้เลย */}
                </div>
            </div>
        </div>
    );
}