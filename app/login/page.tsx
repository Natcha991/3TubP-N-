'use client'; // จำเป็นสำหรับ App Router และ Pages Router ที่ใช้ Hooks

import { useState, useEffect } from 'react'; // เพิ่ม useEffect
import { useRouter } from 'next/navigation'; // สำหรับการ redirect

export default function LoginPage() {
    const [username, setUsername] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [appHeight, setAppHeight] = useState('100vh'); // เพิ่ม state สำหรับความสูงจริงของจอ

    const router = useRouter();

    useEffect(() => {
        // สำหรับจัดการความสูงของจอจริงบนมือถือ (Safari/Chrome Mobile UI)
        const updateAppHeight = () => {
            setAppHeight(`${window.innerHeight}px`);
        };

        if (typeof window !== 'undefined') {
            // Set initial height
            updateAppHeight();
            // Add resize listener
            window.addEventListener('resize', updateAppHeight);
        }

        // Clean up event listener
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', updateAppHeight);
            }
        };
    }, []); // ให้ทำงานแค่ครั้งเดียวเมื่อ Component mount

    const goRegister = () => {
        setIsAnimating(true);

        setTimeout(() => {
            router.push('/register2');
        }, 300);
    };

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault(); // ป้องกันการ reload หน้าเมื่อ submit form

        if (!username.trim()) {
            setError('กรุณาป้อนชื่อผู้ใช้');
            return;
        }

        setLoading(true);
        setError(null); // เคลียร์ข้อผิดพลาดเก่าเมื่อพยายาม Login ใหม่

        try {
            // ส่ง username ไปยัง Backend API
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: username.trim() }), // ส่ง name ที่ตัดช่องว่างออก
            });

            if (res.ok) {
                const data = await res.json();
                const userId = data.userId; // รับ userId จาก Backend ที่ส่งกลับมา

                if (userId) {
                    // เก็บ userId ไว้ใน Local Storage (สำหรับการทดสอบหรือถ้าไม่ต้องการ Auth ที่ซับซ้อนมาก)
                    // **คำเตือน:** สำหรับ Production ควรใช้ HttpOnly Cookies เพื่อความปลอดภัยที่ดีกว่า
                    localStorage.setItem('userId', userId);

                    // Redirect ไปยังหน้า Home พร้อมส่ง userId เป็น Query Parameter
                    router.push(`/home?id=${userId}`);
                } else {
                    setError('ไม่ได้รับรหัสผู้ใช้จากเซิร์ฟเวอร์');
                }
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
            }
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Login error:', error);
            setError(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        } finally {
            setLoading(false);
        }
    };

    return (
        // ใช้ appHeight ที่คำนวณจาก JS เพื่อความสูงที่ถูกต้องบนมือถือ
        <div
            className="relative flex w-screen flex-col overflow-hidden items-center bg-gradient-to-br from-orange-300 to-orange-100"
            style={{ height: appHeight }}
        >
            {/* Decoration images - ปรับขนาดด้วย w-[%] และ max-w-[] เพื่อให้ Responsive */}
            <div className="absolute left-0 w-[30%] max-w-[150px]"> {/*  */}
                <img src="/Group%2099.png" alt="Decoration"></img>
            </div>
            <div className="absolute right-0 rotate-[180deg] top-[30rem] w-[30%] max-w-[150px]"> {/*  */}
                <img src="/Group%2099.png" alt="Decoration"></img>
            </div>
            <div className="absolute top-[20rem] left-[0.3rem] animate-shakeright w-[60%] max-w-[100px]"> {/*  */}
                <img className='' src="/image%2084.png" alt="Decoration"></img>
            </div>
            <div className="absolute top-[35rem] left-[19rem] rotate-[35deg] animate-shakeright2 w-[45%] max-w-[120px]"> {/*  */}
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration"></img>
            </div>

            {/* ส่วนข้อความด้านบนและฟอร์ม */}
            {/* ใช้ flex-grow เพื่อให้ส่วนนี้ขยายตัวและดันรูปภาพด้านล่างลงไปได้ */}
            <div className="mt-[5rem] flex flex-col items-center z-200 flex-grow">
                <div className="w-full">
                    <h1 className='w-[330px] text-center font-prompt text-3xl font-[500] text-[#333333] mt-2'>
                        กรอกชื่อเพื่อเข้าสู่ระบบ
                    </h1>
                </div>
                <form onSubmit={handleLogin} className='font-prompt relative z-107 mt-[2rem] flex items-center'>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className='rounded-3xl border-2 border-[#333333] bg-white p-[0.5rem] px-[0.8rem]'
                        placeholder='ชื่อของคุณ'
                    />
                    <button
                        type='submit'
                        disabled={loading}
                        className='bg-grey-400 relative ml-[0.5rem] flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-4xl border-2 border-[#333333] transition duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50'
                    >
                        <img src="/image%2082.png" alt="Login Icon" className="w-[20px] object-cover" /> {/*  */}
                        {loading && (
                            <span className="absolute inset-0 flex items-center justify-center text-[0.6rem] text-white bg-black bg-opacity-50 rounded-4xl">
                                กำลังโหลด...
                            </span>
                        )}
                    </button>
                </form>
                <div className="">
                    <h1 onClick={goRegister} className={`text-md text-red-600 mt-2 underline z-200 font-prompt cursor-pointer ${isAnimating ? "animate-press" : ''}`}>ยังไม่มีรหัส?</h1>
                </div>
                {error && (
                    <p className="mt-4 text-center text-sm text-red-600 z-107">
                        {error}
                    </p>
                )}
            </div>

            {/* ----------------------------------------------------- */}
            {/* ส่วนรูปภาพด้านล่าง (ไม่ใช่ fixed) */}
            {/* ปรับให้ใช้ max-h-[vh] และ object-contain เพื่อให้ Responsive */}
            <div className="flex justify-center overflow-hidden animate-sizeUpdown w-full"> {/* ลบ absolute bottom-0 ออก */}
                <img
                    src="/image%2086.png"
                    alt='Decor'
                    // กำหนดความสูงสูงสุดเป็น 60% ของ viewport height และให้รูปภาพปรับขนาดแบบ contain
                    className="w-auto max-h-[60vh] object-contain"
                />
            </div>
        </div>
    );
}