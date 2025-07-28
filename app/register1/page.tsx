'use client';
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation'; // ไม่ต้องใช้ useState, useCallback ถ้ามีแค่ goto ง่ายๆ

export default function Home() {
    const router = useRouter();

    const goto = () => {
        router.push("/register2");
    };

    // Optional: ถ้ามี animation click และต้องการ debounce
    // const [isNavigating, setIsNavigating] = useState(false);
    // const handleGoto = useCallback(() => {
    //     if (isNavigating) return;
    //     setIsNavigating(true);
    //     setTimeout(() => {
    //         router.push("/register2");
    //         setIsNavigating(false); // Reset if not unmounted
    //     }, 300); // Match animation duration
    // }, [router, isNavigating]);


    return (
        // ใช้ flex flex-col เพื่อให้เนื้อหาหลักจัดเรียงในแนวตั้ง
        // h-screen ทำให้สูงเต็ม viewport
        // items-center เพื่อจัดกึ่งกลางแนวนอน
        // justify-between เพื่อดันส่วนหัวไปบนสุด ส่วนล่างไปล่างสุด
        // overflow-hidden เพื่อป้องกัน scrollbar และทำให้ไม่สามารถเลื่อนได้
        <div
            onClick={goto} // หากต้องการให้คลิกที่ไหนก็ได้ในหน้าแล้วไป
            className="relative h-screen w-screen cursor-pointer flex flex-col items-center justify-between
                       bg-gradient-to-br from-orange-300 to-orange-100 font-prompt overflow-hidden"
        >
            {/* รูปภาพตกแต่งด้านข้าง/มุม - ยังคงใช้ absolute ได้ */}
            <div className="absolute left-0 top-0">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            <div className="absolute right-0 rotate-[180deg] top-[30rem]">
                <img src="/Group%2099.png" alt="Decoration" />
            </div>
            {/* ปรับ top/left ของรูปตกแต่งเหล่านี้ให้เหมาะสมกับ layout ใหม่ ถ้ามันชนกับส่วนอื่น */}
            <div className="absolute top-[20rem] left-[1.5rem] animate-shakeright">
                <img src="/image%2084.png" alt="Decoration" />
            </div>
            <div className="absolute top-[30rem] left-[19rem] rotate-[35deg] animate-shakeright2">
                <img src="/image%2084.png" className='w-[140px]' alt="Decoration" />
            </div>

            {/* ส่วนเนื้อหาหลักที่ต้องการให้เรียงตามปกติ (ข้อความ + รูป Mr.Rice) */}
            {/* ใช้ flex-grow เพื่อให้ส่วนนี้ขยายเต็มพื้นที่ว่างที่เหลืออยู่ระหว่างส่วนบนสุดกับส่วนล่างสุด */}
            {/* เพิ่ม padding-top เพื่อเว้นที่สำหรับข้อความด้านบนสุด */}
            <div className="flex flex-col items-center flex-grow justify-center pt-8"> {/* ปรับ pt-8 ให้เหมาะสม */}
                {/* ส่วนข้อความด้านบน */}
                <div className="flex flex-col items-center mb-4 text-center"> {/* เพิ่ม text-center ให้ข้อความอยู่ตรงกลาง */}
                    <h1 className='w-[300px] text-[#333333] font-[500] text-3xl animate-dopdop leading-tight'>
                        เดี๋ยวก่อน!! ก่อนจะไปดูเมนู ผมขอถามอะไรคุณก่อนสิ
                    </h1>
                </div>

                {/* ส่วนรูปภาพ Mr.Rice */}
                <div className="flex justify-center z-10 animate-sizeUpdown mt-8"> {/* ปรับ mt-8 ให้เหมาะสม */}
                    <img
                        src="/image%2085.png"
                        alt='Mr.Rice asking'
                        className="w-auto h-[430px] object-contain" // ใช้ object-contain หรือ object-cover ตามที่ต้องการ แต่ object-contain จะดีกว่าถ้าไม่ต้องการให้ภาพถูกตัด
                    />
                </div>
            </div>

            {/* ส่วนล่างสุด (เมนู/ต่อไป) - ใช้ absolute และ bottom-0 */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center font-prompt">
                <div className="bg-white w-[500px] px-[4rem] py-[4.5rem] rounded-t-4xl shadow-lg flex justify-between">
                    {/* เนื้อหาในส่วนล่างสุด (ตอนนี้ไม่มีอะไร) */}
                    {/* ถ้ามีปุ่ม "ต่อไป" / "เมนู" อีกในหน้านี้ ต้องระวัง onClick ซ้อนทับกัน */}
                </div>
            </div>
        </div>
    );
}