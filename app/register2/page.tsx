'use client';
export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation';
import { useState , useCallback , useEffect} from 'react';

export default function Register2() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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

    setLoading(true)

    setTimeout(() => {
      if (name.trim() === '') {
        setError('กรุณากรอกชื่อก่อน');
        return;
      }
    }, 300);



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
  };

  return (
    // แก้ไข: เพิ่ม flex flex-col, overflow-hidden ให้กับ div หลัก
    // เพื่อให้จัดการ Layout ในแนวตั้งได้ดีขึ้น และซ่อน Scrollbar ที่ไม่ต้องการ
    <div className="relative h-screen w-screen flex flex-col items-center justify-between
                       bg-gradient-to-br from-orange-300 to-orange-100 font-prompt overflow-hidden">
      {/* รูปภาพตกแต่งด้านข้าง/มุม - ยังคงใช้ absolute ได้ */}
      <div className="absolute left-0 top-0"> {/* แก้ไข: เพิ่ม top-0 เพื่อให้ชิดขอบบน */}
        <img src="/Group%2099.png" alt="Decoration" />
      </div>
      <div className="absolute right-0 rotate-[180deg] top-[30rem]">
        <img src="/Group%2099.png" alt="Decoration" />
      </div>
      <div className="absolute top-[20rem] left-[-1rem] animate-shakeright">
        <img className='' src="/image%2084.png" alt="Decoration" />
      </div>
      <div className="absolute top-[30rem] left-[19rem] rotate-[35deg] animate-shakeright2">
        <img src="/image%2084.png" className='w-[140px]' alt="Decoration" />
      </div>

      {/* แก้ไข: เพิ่ม div ครอบเนื้อหาหลักที่อยู่ใน flow (h1, input, img)
          ให้เป็น flex-col และใช้ justify-between เพื่อจัดเรียงลูกๆ
          และใช้ pb-[...] เพื่อเว้นที่ว่างให้ footer
      */}
      <div className="flex flex-col items-center justify-between h-full pt-[5rem] pb-[13rem]"> {/* แก้ไข: h-full และปรับ pb */}
        {/* ส่วนข้อความด้านบน */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-full">
            <h1 className='w-[330px] text-center text-[#333333] font-prompt font-[500] text-3xl '>
              ผมชื่อ Mr.Rice นะ<br></br>แล้วคุณละ?
            </h1>
          </div>
        </div>

        {/* ส่วน Input และปุ่ม */}
        {/* แก้ไข: เพิ่ม z-index ให้ input field เพื่อให้แน่ใจว่าอยู่เหนือ content อื่นๆ หากมีการทับซ้อน */}
        <div className='font-prompt flex flex-col items-center mt-[1rem] z-20'> {/* แก้ไข: z-index */}
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

        {/* แก้ไข: รูปภาพตัวละคร image_86.png รักษาสูง 430px */}
        <div className="flex justify-center z-10 mt-[1rem] animate-sizeUpdown">
          <img src="/image%2086.png" alt='Decor' className="w-auto h-[430px] object-cover" />
        </div>

        {/* แก้ไข: ลบ div flex-grow ที่นี่ออก และใช้ justify-between ใน parent แทน */}
        {/* <div className="flex-grow"></div> */}
      </div>

      {/* ส่วนล่างสุด (เมนู/ต่อไป) - ยังคงใช้ absolute เพื่อให้ติดขอบล่าง */}
      <div className={`absolute bottom-0 left-0 right-0 flex justify-center font-prompt ${isKeyboardOpen ? 'hidden' : ''}`}>
        <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
          {/* เนื้อหาในส่วนล่างสุด */}
        </div>
      </div>
    </div>
  );
}