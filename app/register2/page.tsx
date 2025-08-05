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
    const [appHeight, setAppHeight] = useState('100vh'); // State for actual viewport height

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
        // Check if window.visualViewport exists (for browsers that support it)
        if (typeof window !== 'undefined' && window.visualViewport) {
            const viewportHeight = window.visualViewport.height;
            const initialViewportHeight = window.innerHeight; // Viewport height when keyboard is closed

            // Detect if viewport height significantly reduces (indicating keyboard is open)
            // Adjust the 0.9 threshold as needed (e.g., 0.85 or 0.95)
            // Added a small delta to avoid false positives on minor resizes
            setIsKeyboardOpen(viewportHeight < initialViewportHeight * 0.95);
        }
    }, []);

    useEffect(() => {
        // Check if window.visualViewport exists before adding Listener
        if (typeof window !== 'undefined' && window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            // Call handleResize initially when component mounts to check initial status
            handleResize();
        }

        // Cleanup function: remove Event Listener when component unmount to prevent memory leak
        return () => {
            if (typeof window !== 'undefined' && window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
        };
    }, [handleResize]);


    const handleSubmit = async () => {
        setError('');

        if (name.trim() === '') {
            setError('กรุณากรอกชื่อก่อน');
            return; // Exit if validation fails
        }
        
        setLoading(true); // Set loading state only after basic validation passes

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
            router.push(`/register2.5?id=${user._id}`);
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Registration error:', error);
            setError(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        } finally {
            setLoading(false); // Ensure loading is false regardless of success or failure
        }
    };

    return (
        // Use appHeight for accurate viewport height on mobile devices
        <div
            className="relative w-screen flex flex-col items-center justify-between
                       bg-gradient-to-br from-orange-300 to-orange-100 font-prompt overflow-hidden"
            style={{ height: appHeight }} // Apply the calculated height
        >
            {/* รูปภาพตกแต่งด้านข้าง/มุม - ใช้ absolute เพื่อให้ลอยอยู่เหนือเนื้อหาและไม่ได้รับผลกระทบจากแป้นพิมพ์ */}
            {/* ปรับขนาดด้วย w-[%] และ max-w-[] เพื่อให้ Responsive และไม่โดนบีบเมื่อแป้นพิมพ์ขึ้น */}
            <div className="absolute left-0 top-0 w-[60%] max-w-[250px] z-10"> {/*  */}
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            <div className="absolute right-0 rotate-[180deg] top-[30rem] w-[60%] max-w-[250px] z-10"> {/*  */}
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            {/* Adjust top/left of these decorative images to fit the new layout if they overlap */}
            <div className="absolute top-[20rem] left-[1.5rem] animate-shakeright w-[20%] max-w-[100px] z-10"> {/*  */}
                <img src="/image%2084.png" alt="Decoration" />
            </div>
            <div className="absolute top-[30rem] left-[19rem] rotate-[35deg] animate-shakeright2 w-[25%] max-w-[120px] z-10"> {/*  */}
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration" />
            </div>

            {/* ส่วนเนื้อหาหลักที่อยู่ใน flow (h1, input, img) */}
            {/* ใช้ flex-col และ justify-between เพื่อจัดเรียงลูกๆ และใช้ flex-grow เพื่อให้ขยายเต็มพื้นที่ */}
            {/* ปรับ pb เพื่อเว้นที่ว่างให้ footer โดยสัมพันธ์กับ isKeyboardOpen */}
            <div className="flex flex-col items-center justify-between flex-grow pt-[5rem] px-4"
                style={{ paddingBottom: isKeyboardOpen ? '0' : '13rem' }}> {/* Dynamic padding-bottom */}
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
                <div className="flex justify-center z-30 mt-[2.8rem] animate-sizeUpdown">
                    <img src="/image%2086.png" alt='Decor' className="w-auto max-h-[50vh] object-contain" />
                </div>
            </div>

            {/* ส่วนล่างสุด (เมนู/ต่อไป) - ซ่อนเมื่อแป้นพิมพ์เปิด */}
            {/* สังเกตว่า `hidden` class ถูกเพิ่มตามเงื่อนไข `isKeyboardOpen` */}
            <div className={`absolute bottom-0 left-0 right-0 flex justify-center font-prompt z-20 ${isKeyboardOpen ? 'hidden' : ''}`}>
                <div className="bg-white w-full max-w-[500px] px-[4rem] py-[4rem] rounded-t-4xl shadow-lg flex justify-between">
                    {/* เนื้อหาในส่วนล่างสุด */}
                </div>
            </div>
        </div>
    );
}