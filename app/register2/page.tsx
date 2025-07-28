'use client';
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useState , useCallback , useEffect} from 'react';

export default function Register2() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState('');
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [appHeight, setAppHeight] = useState('100vh'); // เพิ่ม state สำหรับความสูงจริงของจอ

    // Effect to calculate and set the actual viewport height for mobile browsers
    useEffect(() => {
        const updateAppHeight = () => {
            setAppHeight(`${window.innerHeight}px`);
        };

        if (typeof window !== 'undefined') {
            updateAppHeight(); // Set initial height
            window.addEventListener('resize', updateAppHeight); // Add resize listener
        }

        // Cleanup event listener on component unmount
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', updateAppHeight);
            }
        };
    }, []); // Run only once on component mount


    const handleResize = useCallback(() => {
        // ตรวจสอบว่า window.visualViewport มีอยู่จริง (สำหรับเบราว์เซอร์ที่รองรับ)
        if (typeof window !== 'undefined' && window.visualViewport) {
            const viewportHeight = window.visualViewport.height;
            const initialViewportHeight = window.innerHeight; // ความสูงของ viewport เมื่อแป้นพิมพ์ปิด

            // ตรวจจับว่าความสูงของ viewport ลดลงอย่างมีนัยสำคัญหรือไม่ (บ่งชี้ว่าแป้นพิมพ์เปิด)
            // ปรับค่า 0.9 นี้ได้ตามความเหมาะสม (เช่น 0.85 หรือ 0.95)
            setIsKeyboardOpen(viewportHeight < initialViewportHeight * 0.9);
        }
    }, []);

    useEffect(() => {
        // ตรวจสอบว่า window.visualViewport มีอยู่จริงก่อนเพิ่ม Listener
        if (typeof window !== 'undefined' && window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            // เรียก handleResize ครั้งแรกเมื่อ component mount เพื่อตรวจสอบสถานะเริ่มต้น
            handleResize();
        }

        // Cleanup function: ลบ Event Listener เมื่อ component unmount เพื่อป้องกัน memory leak
        return () => {
            if (typeof window !== 'undefined' && window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
        };
    }, [handleResize]);


    const handleSubmit = async () => {
        setError('');

        setLoading(true);

        // This setTimeout logic seems problematic. The API call should not be delayed by 300ms
        // and the error check for empty name should happen before setting loading to true.
        // Let's refactor this part for better logic flow.
        if (name.trim() === '') {
            setError('กรุณากรอกชื่อก่อน');
            setLoading(false); // Ensure loading is false if validation fails
            return;
        }

        try {
            const res = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const user = await res.json();

            if (res.status === 409) {
                setError('❌ ชื่อนี้ถูกใช้แล้ว กรุณาตั้งชื่อใหม่');
                return;
            }

            if (!res.ok) {
                setError(user.message || 'เกิดข้อผิดพลาดในการสมัคร');
                return;
            }

            localStorage.setItem('userId', user._id);
            router.push(`/register3?id=${user._id}`);
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
            className="relative w-screen flex flex-col items-center justify-between
                       bg-gradient-to-br from-orange-300 to-orange-100 font-prompt overflow-hidden"
            style={{ height: appHeight }} // Apply the calculated height
        >
            {/* รูปภาพตกแต่งด้านข้าง/มุม - ปรับขนาดด้วย w-[%] และ max-w-[] เพื่อให้ Responsive */}
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

            {/* ส่วนเนื้อหาหลักที่อยู่ใน flow (h1, input, img) */}
            {/* ใช้ flex-col และ justify-between เพื่อจัดเรียงลูกๆ และใช้ flex-grow เพื่อให้ขยายเต็มพื้นที่ */}
            {/* ปรับ pb เพื่อเว้นที่ว่างให้ footer */}
            <div className="flex flex-col items-center justify-between flex-grow pt-[5rem] pb-[13rem]"> {/* flex-grow here */}
                {/* ส่วนข้อความด้านบน */}
                <div className="flex flex-col items-center mb-4">
                    <div className="w-full">
                        <h1 className='w-[330px] text-center text-[#333333] font-prompt font-[500] text-3xl '>
                            ผมชื่อ Mr.Rice นะ<br></br>แล้วคุณละ?
                        </h1>
                    </div>
                </div>

                {/* ส่วน Input และปุ่ม */}
                {/* เพิ่ม z-index ให้ input field เพื่อให้แน่ใจว่าอยู่เหนือ content อื่นๆ หากมีการทับซ้อน */}
                <div className='font-prompt flex flex-col items-center mt-[1rem] z-20'>
                    <div className='flex items-center'>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className='p-[0.5rem] px-[0.8rem] rounded-3xl border-[#333333] border-2 bg-white'
                            placeholder='ชื่อของคุณ'
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            type='submit'
                            className='relative bg-grey-400 w-[45px] transition hover:scale-105 duration-300 cursor-pointer flex items-center justify-center rounded-4xl border-[#333333] border-2 ml-[0.5rem] h-[45px]'
                        >
                            <img src="/image%2082.png" alt="Submit" />
                            {loading && (
                                <span className="absolute inset-0 flex items-center justify-center text-[0.6rem] text-white bg-black bg-opacity-50 rounded-4xl">
                                    กำลังโหลด...
                                </span>
                            )}
                        </button>
                    </div>

                    {/* แสดง error เมื่อมีข้อความ */}
                    {error && (
                        <p className="text-red-600 text-sm mt-2">{error}</p>
                    )}
                </div>

                {/* รูปภาพตัวละคร image_86.png - ปรับให้ใช้ max-h-[vh] และ object-contain เพื่อให้ Responsive */}
                <div className="flex justify-center z-10 mt-[3.5rem] animate-sizeUpdown">
                    <img src="/image%2086.png" alt='Decor' className="w-auto max-h-[50vh] object-contain" /> {/* Changed h-[430px] to max-h-[40vh] */}
                </div>
            </div>

            {/* ส่วนล่างสุด (เมนู/ต่อไป) - ยังคงใช้ absolute เพื่อให้ติดขอบล่าง */}
            {/* ซ่อนส่วนนี้เมื่อแป้นพิมพ์เปิด */}
            <div className={`absolute bottom-0 left-0 right-0 flex justify-center font-prompt ${isKeyboardOpen ? 'hidden' : ''}`}>
                <div className="bg-white w-[500px] px-[4rem] py-[4rem] rounded-t-4xl shadow-lg flex justify-between">
                    {/* เนื้อหาในส่วนล่างสุด */}
                </div>
            </div>
        </div>
    );
}
