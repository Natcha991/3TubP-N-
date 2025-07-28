'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react'; // Added useEffect, useCallback

export default function Register5() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id');
    const [loading, setLoading] = useState<boolean>(false);

    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [error, setError] = useState<string | null>(null); // Added state for error message
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false); // State for keyboard status
    const [appHeight, setAppHeight] = useState('100vh'); // State for actual viewport height

    // Combined Effect for appHeight and keyboard detection
    useEffect(() => {
        const updateViewportState = () => {
            const currentViewportHeight = window.visualViewport?.height || window.innerHeight;
            setAppHeight(`${currentViewportHeight}px`);

            const initialViewportHeight = window.innerHeight;
            // Detect if viewport height significantly reduces (indicating keyboard is open)
            setIsKeyboardOpen(currentViewportHeight < initialViewportHeight * 0.95); // Adjust threshold as needed
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

        if (!weight || !height) {
            setError('กรุณาป้อนน้ำหนักและส่วนสูงให้ครบถ้วน');
            return;
        }

        if (Number(weight) <= 0 || Number(height) <= 0) {
            setError('น้ำหนักและส่วนสูงต้องมากกว่า 0');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/user/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weight: Number(weight),
                    height: Number(height),
                }),
            });

            if (res.ok) {
                router.push(`/register6?id=${userId}`); // ✅ Go to the next page for goal
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'เกิดข้อผิดพลาดในการบันทึกน้ำหนัก/ส่วนสูง');
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
        // Apply appHeight to the main div for accurate mobile viewport height
        <div
            className="relative w-screen flex flex-col items-center
                       bg-gradient-to-br from-orange-300 to-orange-100 font-prompt overflow-hidden"
            style={{ height: appHeight }} // Apply the calculated height to fill the screen
        >
            {/* รูปภาพตกแต่งด้านข้าง/มุม - ใช้ absolute เพื่อให้ลอยอยู่เหนือเนื้อหา */}
            {/* ปรับขนาดด้วย vw/vh และ max-w/h เพื่อให้ Responsive */}
            <div className="absolute left-0 top-0 w-[60vw] max-w-[250px] z-10">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            <div className="absolute right-0 rotate-[180deg] top-[60vh] w-[30vw] max-w-[250px] bottom-0 z-10">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            <div className="absolute top-[20vh] left-[1.5vw] w-[20vw] max-w-[100px] animate-shakeright z-10">
                <img src="/image%2084.png" alt="Decoration" />
            </div>
            <div className="absolute top-[50vh] right-0 rotate-[35deg] w-[25vw] max-w-[120px] animate-shakeright2 z-10">
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration" />
            </div>

            {/* ส่วนข้อความด้านบนและ Form */}
            {/* ใช้ flex-grow เพื่อให้ส่วนนี้ขยายตัวและดันรูปภาพด้านล่างได้ */}
            {/* ปรับ padding-bottom แบบ dynamic เพื่อให้ Input field ไม่ถูกบังเมื่อ Keyboard เปิด */}
            <div
                className="flex flex-col items-center justify-between flex-grow pt-[5rem] px-4"
                style={{ paddingBottom: isKeyboardOpen ? '1rem' : '2rem' }} // Dynamic padding-bottom
            >
                <div className="w-full text-center mb-4">
                    <h1 className='max-w-[330px] inline-block text-[#333333] mt-2 font-[500] text-[1.5rem]'>
                        ทีนี้ ผมอยากรู้น้ำหนัก<br />ส่วนสูงของคุณหน่อย
                    </h1>
                </div>

                <form className="flex flex-col items-center justify-center mt-[1.5rem] z-20" onSubmit={handleSubmit}>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="น้ำหนัก (kg)"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            required
                            className='rounded-3xl w-[130px] border-[#333333] border-2 p-[0.5rem] bg-white text-center'
                        />
                        <input
                            type="number"
                            placeholder="ส่วนสูง (cm)"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            required
                            className='rounded-3xl w-[130px] border-[#333333] border-2 p-[0.5rem] bg-white text-center'
                        />
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
                    </div>
                    {/* แสดงข้อผิดพลาด */}
                    {error && (
                        <p className="mt-4 text-red-600 text-sm text-center z-20">{error}</p>
                    )}
                </form>
            </div>

            {/* ส่วนรูปภาพ Mr.Rice (image_100.png) - อยู่ใน flow ของเนื้อหาหลัก */}
            {/* ใช้ max-h-[vh] และ object-contain เพื่อให้ Responsive */}
            <div className="flex justify-center z-40 mb-[17rem] animate-sizeUpdown flex-grow items-center">
                <img
                    src="/image%20100.png"
                    alt='Mr.Rice asking for weight and height'
                    className="w-auto max-h-[50vh] object-contain" // Changed h-[430px] to max-h-[50vh]
                />
            </div>

            {/* ส่วนล่างสุด (เมนู/ต่อไป) - ยังคงใช้ absolute เพื่อให้ติดขอบล่าง */}
            {/* ใช้ bottom-0 แทน top เพื่อให้มันติดขอบล่างเสมอไม่ว่าจะความสูงจอเท่าไร */}
            {/* ซ่อนเมื่อแป้นพิมพ์เปิด */}
            <div className={`absolute bottom-0 left-0 right-0 flex justify-center font-prompt z-30 ${isKeyboardOpen ? 'hidden' : ''}`}>
                <div className="bg-white w-full max-w-[500px] px-[4rem] py-[4rem] rounded-t-4xl shadow-lg flex justify-between">
                    {/* สามารถเพิ่มเนื้อหาสำหรับส่วนล่างสุดได้ที่นี่ */}
                </div>
            </div>
        </div>
    );
}