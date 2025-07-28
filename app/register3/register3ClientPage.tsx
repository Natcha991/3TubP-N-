'use client';

import { useState, useEffect, useCallback } from 'react'; // เพิ่ม useEffect, useCallback
import { useRouter, useSearchParams } from 'next/navigation';

export default function Register3() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id'); // 🔍 ดึง userId ที่ส่งมาจาก register2
    const [loading, setLoading] = useState<boolean>(false);
    const [birthday, setBirthday] = useState('');
    const [error, setError] = useState<string | null>(null); // เพิ่ม state สำหรับข้อผิดพลาด
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false); // เพิ่ม state สำหรับสถานะแป้นพิมพ์
    const [appHeight, setAppHeight] = useState('100vh'); // เพิ่ม state สำหรับความสูงจริงของจอ

    // Effect to calculate and set the actual viewport height for mobile browsers
    useEffect(() => {
        const updateAppHeight = () => {
            // Use window.visualViewport.height if available for more accurate usable height
            // Otherwise, fallback to window.innerHeight
            setAppHeight(`${window.visualViewport?.height || window.innerHeight}px`);
        };

        if (typeof window !== 'undefined') {
            updateAppHeight(); // Set initial height
            window.addEventListener('resize', updateAppHeight); // Add resize listener
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

    // Callback function for keyboard detection
    const handleResize = useCallback(() => {
        if (typeof window !== 'undefined' && window.visualViewport) {
            const viewportHeight = window.visualViewport.height;
            const initialViewportHeight = window.innerHeight;
            setIsKeyboardOpen(viewportHeight < initialViewportHeight * 0.9); // Adjust threshold as needed
        }
    }, []);

    // Effect for keyboard detection
    useEffect(() => {
        if (typeof window !== 'undefined' && window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            handleResize(); // Initial check
        }
        return () => {
            if (typeof window !== 'undefined' && window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
        };
    }, [handleResize]); // Dependency on handleResize

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        if (!userId) {
            setError('ไม่พบรหัสผู้ใช้ กรุณาลองใหม่อีกครั้ง'); // แสดงข้อผิดพลาดใน UI แทน alert
            return;
        }
        if (!birthday) {
            setError('กรุณาเลือกวันเกิด'); // แสดงข้อผิดพลาดใน UI แทน alert
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
                setError(errorData.message || 'เกิดข้อผิดพลาดในการบันทึกวันเกิด'); // แสดงข้อผิดพลาดจาก API
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
            style={{ height: appHeight }} // Apply the calculated height
        >
            {/* ภาพประกอบด้านซ้ายบน - ปรับขนาดด้วย vw/vh และ max-w/h */}
            <div className="absolute left-0 top-0 w-[30vw] max-w-[150px]">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            {/* ภาพประกอบด้านขวาล่าง - ปรับขนาดด้วย vw/vh และ max-w/h */}
            <div className="absolute right-0 rotate-[180deg] top-[30vh] w-[30vw] max-w-[150px]">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            {/* ภาพประกอบเคลื่อนไหว - ปรับขนาดและตำแหน่งด้วย vw/vh และ max-w/h */}
            <div className="absolute top-[20vh] left-[1.5vw] animate-shakeright w-[20vw] max-w-[100px]">
                <img className='' src="/image%2084.png" alt="Decoration" />
            </div>
            {/* ภาพประกอบเคลื่อนไหวอีกอัน - ปรับขนาดและตำแหน่งด้วย vw/vh และ max-w/h */}
            <div className="absolute top-[30vh] right-[5vw] rotate-[35deg] animate-shakeright2 w-[25vw] max-w-[120px]">
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration" />
            </div>

            {/* ส่วนข้อความด้านบนและ Form สำหรับ input */}
            {/* ใช้ flex-grow เพื่อให้ส่วนนี้ขยายตัวและดันรูปภาพด้านล่างลงไปได้ */}
            {/* ปรับ padding-top และ padding-bottom ให้สัมพันธ์กับ vh */}
            <div className="flex flex-col items-center flex-grow justify-start pt-[5vh] pb-[15vh]">
                <div className="w-full">
                    <h1 className='w-[300px] text-center text-[#333333] mt-2 font-prompt font-[500] text-3xl'>แล้ววันเกิดของคุณล่ะ
                        คือวันไหน?</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex mt-[1.5rem] justify-center items-center font-prompt z-30">
                    {/* DatePicker สำหรับใส่วันเกิด */}
                    <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        required
                        className="p-[0.8rem] px-[0.8rem] rounded-3xl border-[#333333] border-2 bg-white ml-[0.5rem]"
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
                    <p className="mt-2 text-red-600 text-sm text-center">{error}</p>
                )}
            </div>

            {/* ส่วนรูปภาพที่ต้องการให้โดนจอกิน - ปรับให้ใช้ max-h-[vh] และ object-contain เพื่อให้ Responsive */}
            {/* เพิ่ม flex-grow และ items-center เพื่อให้รูปภาพอยู่ตรงกลางและขยายตามพื้นที่ที่เหลือ */}
            <div className="flex justify-center z-10 mt-[1rem] overflow-hidden animate-sizeUpdown flex-grow items-center">
                <img
                    src="/image%2087.png"
                    alt='Decor'
                    className="w-auto max-h-[45vh] object-contain" // ปรับ max-h ให้ยืดหยุ่น
                />
            </div>

            {/* ส่วนล่างสุด - ยังคงใช้ absolute เพื่อให้ติดขอบล่าง และซ่อนเมื่อแป้นพิมพ์เปิด */}
            <div className={`absolute bottom-0 left-0 right-0 flex justify-center font-prompt ${isKeyboardOpen ? 'hidden' : ''}`}>
                <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
                    {/* ถ้ามีปุ่ม "ต่อไป" หรือเนื้อหาอื่น ๆ ในส่วนนี้ ให้เพิ่มได้เลย */}
                </div>
            </div>
        </div>
    );
}
