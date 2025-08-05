'use client';

import { useState, useEffect, useRef } from 'react'; // เพิ่ม useRef
import { useRouter, useSearchParams } from 'next/navigation';

export default function Register25() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [animate, setAnimate] = useState(false)
    const userId = searchParams.get('id'); // ดึง userId ที่ส่งมาจาก register2 
    const [error, setError] = useState<string | null>(null);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [appHeight, setAppHeight] = useState('100vh'); // State for actual viewport height

    // State สำหรับรูปโปรไฟล์
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // เก็บ File object
    const [previewImage, setPreviewImage] = useState<string | null>(null); // เก็บ URL สำหรับแสดงรูป
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref สำหรับ input type="file"

    // Effect สำหรับ appHeight และ keyboard detection
    useEffect(() => {
        const updateViewportState = () => {
            const currentViewportHeight = window.visualViewport?.height || window.innerHeight;
            setAppHeight(`${currentViewportHeight}px`);

            const initialViewportHeight = window.innerHeight;
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

    // ฟังก์ชันจัดการเมื่อเลือกไฟล์รูปภาพ
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // สร้าง URL สำหรับแสดงตัวอย่างรูปภาพ
            setPreviewImage(URL.createObjectURL(file));
            setError(null); // Clear error if image is selected
        } else {
            setSelectedFile(null);
            setPreviewImage(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        if (!userId) {
            setError('ไม่พบรหัสผู้ใช้ กรุณาลองใหม่อีกครั้ง');
            return;
        }
        if (!selectedFile) {
            setError('กรุณาเลือกรูปโปรไฟล์');
            return;
        } 

        setAnimate(true)

        try {
            // สร้าง FormData สำหรับส่งไฟล์
            const formData = new FormData();
            formData.append('profilePicture', selectedFile);
            formData.append('userId', userId); // ส่ง userId ไปด้วย

            // สมมติว่ามี API endpoint สำหรับอัปโหลดรูปโปรไฟล์
            const res = await fetch(`/api/user/profile-picture/${userId}`, {
                method: 'PATCH', // หรือ POST ถ้าเป็นการสร้างใหม่
                body: formData, // ไม่ต้องกำหนด 'Content-Type': 'application/json' เมื่อใช้ FormData
            });

            if (res.ok) {
                // Redirect ไปหน้าถัดไป (เช่น register4 หรือ home)
                router.push(`/register4?id=${userId}`); // เปลี่ยนเป็น register4 หรือ home ตาม flow ของคุณ
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปโปรไฟล์');
            }
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Profile upload error:', error);
            setError(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        }
    };

    return (
        <div
            className="relative w-screen overflow-hidden flex flex-col items-center justify-between
                       bg-gradient-to-br from-orange-300 to-orange-100 font-prompt"
            style={{ height: appHeight }} // Apply the calculated height to fill the screen
        >
            {/* ภาพประกอบด้านบนซ้าย - ใช้ absolute เพื่อให้ลอยอยู่เหนือเนื้อหา */}
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
            <div className="absolute top-[20vh] right-0 rotate-[35deg] animate-shakeright2 w-[25vw] max-w-[120px] z-10">
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration" />
            </div>

            <div className="flex flex-col items-center justify-between flex-grow pt-[5rem] px-4">
                <div className="w-full text-center">
                    <h1 className='w-[300px] inline-block text-[#333333] mt-2 font-prompt font-[500] text-3xl'>
                        ตั้งรูปโปรไฟล์ของคุณ
                    </h1>
                </div>

                {/* ส่วนอัปโหลดรูปโปรไฟล์ */}
                <div className="flex flex-col items-center mb-[21rem] gap-6">
                    {/* Input type="file" ที่ซ่อนไว้ */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                    />
                    {/* วงกลมสำหรับแสดงรูปและกดเลือกรูป */}
                    <div
                        className="relative w-40 h-40 z-50 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden border-4 border-white shadow-lg transition-transform duration-300 hover:scale-105"
                        onClick={() => fileInputRef.current?.click()} // คลิกวงกลมเพื่อเปิด File Explorer
                    >
                        {previewImage ? (
                            <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : (
                            // Placeholder icon/image if no image is selected
                            <img src="/image%2087.png" alt="Placeholder" className="w-full h-full object-contain" /> // ใช้ image 87.png เป็น placeholder
                        )}
                        {/* Overlay icon for selecting image */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white text-4xl opacity-0 hover:opacity-100 transition-opacity duration-300">
                            +
                        </div>
                    </div>
                    {/* แสดง error เมื่อมีข้อความ */}
                    {error && (
                        <p className="mt-[-1rem] text-center text-sm text-red-600">
                            {error}
                        </p>
                    )}
                    <button onClick={handleSubmit} className={`bg-orange-400 z-200 text-[0.7rem] text-white py-2 px-4 rounded-full ${animate ? "animate-press" : ''}`}>
                        บันทึกโปรไฟล์
                    </button>
                </div> 
            </div>

            <div className="absolute right-0 top-[31rem] z-12 -translate-y-55 transform translate-x-25 md:translate-x-12"> 
                <img
                    src="/image%20102.png"
                    alt='Decor'
                    className="w-auto max-h-[50vh] object-contain animate-sizeUpdown"
                />
            </div>

            {/* ส่วนล่างสุด (Footer) - ซ่อนเมื่อแป้นพิมพ์เปิด */}
            <div className={`absolute bottom-0 left-0 right-0 flex justify-center font-prompt z-40 ${isKeyboardOpen ? 'hidden' : ''}`}>
                <div className="bg-white w-full max-w-[500px] px-[4rem] py-[4rem] rounded-t-4xl shadow-lg flex justify-between">
                    {/* เนื้อหาในส่วนล่างสุด */}
                </div>
            </div>
        </div>
    );
}
