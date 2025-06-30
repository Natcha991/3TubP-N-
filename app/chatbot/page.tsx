'use client'
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
// ตรวจสอบให้แน่ใจว่าได้ติดตั้ง @google/generative-ai library แล้ว
// ถ้าใช้ในฝั่ง client side ของ Next.js อาจจะใช้ '@google/generative-ai' ตรงๆ ก็ได้
// แต่ถ้าใช้ฝั่ง server หรือ API route ต้องเป็น '@google/generative-ai/nodejs'
// สำหรับ 'use client' component นี้ '@google/generative-ai' ตัวเดียวก็พอแล้ว
import { GoogleGenerativeAI } from "@google/generative-ai";

// กำหนด Interface สำหรับ Chat Message Object
interface ChatMessage {
    from: string; // 'user' หรือ 'ai'
    text: string;
    timestamp: string; // เพิ่ม timestamp เพื่อเก็บเวลาของแต่ละข้อความ
}

export default function IngredientPage() {
    const router = useRouter();
    const [message, setMessage] = useState("");
    // แก้ไข Type ของ chatLog ให้รวม timestamp
    const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // ตรวจสอบให้แน่ใจว่า API Key มีอยู่และเป็น string
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY as string);

    // ลบ currentTime ออกจาก state เพราะจะเก็บเวลาใน chatLog แทน
    // const [currentTime, setCurrentTime] = useState(''); // ลบออก

    const goto = () => router.push("/");

    useEffect(() => {
        if (chatContainerRef.current) {
            // เลื่อน scroll ลงล่างสุดเมื่อมีข้อความใหม่
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }

        // ลบ logic การอัปเดตเวลาทุกนาทีออก เพราะเราจะสร้าง timestamp เมื่อส่งข้อความแทน
        // ไม่มีความจำเป็นต้องมี setInterval ใน useEffect นี้แล้ว
    }, [chatLog, isLoading]); // chatLog, isLoading ยังคงอยู่ใน dependencies สำหรับ chat scroll

    const getFontSizeClass = (text: string, isAI: boolean) => {
        if (!isAI) {
            return "text-base";
        }
        if (text.length > 250) {
            return "text-xs";
        } else if (text.length > 120) {
            return "text-sm";
        }
        return "text-base";
    };

    // ฟังก์ชันช่วยสำหรับสร้าง timestamp
    const getFormattedTime = (): string => {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Bangkok'
        };
        // ใช้เวลาปัจจุบันของ Bangkok ตามที่ระบุไว้
        return new Intl.DateTimeFormat('th-TH', options).format(now);
    };

    const handleSend = async () => {
  if (message.trim() === "") return;

  const userMessage = message;
  const currentMessageTime = getFormattedTime();
  const userChat = { from: "user", text: userMessage, timestamp: currentMessageTime };

  setChatLog((prev) => [...prev, userChat]);
  setMessage("");
  setIsLoading(true);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `สมมุติว่าคุณเป็นนักโภชนาการชายที่มีความรู้ด้านอาหารที่คุณนั้นเป็นคนที่ใจดีคนที่ใจดี อ่อนโยน สุภาพ ที่ถามตอบอย่างเป็นธรรมชาติเหมือนคน สิ่งแรกที่คุณจะต้องทำคือคุณต้องเริ่มต้นบทสนทนาด้วยการถามคำถามผู้ใช้งาน 3 ข้อ โดยถามทีละข้อและรอคำตอบก่อนจะถามข้อถัดไป คำถามคือ 1. คุณชอบอาหารอะไรบ้าง 2. คุณแพ้อาหารหรือมีโรคประจำตัวอะไรหรือไม่ 3. คุณมีเป้าหมายด้านสุขภาพอะไร  โดยคำถามแต่ละข้อให้ถามเพียงครั้งเดียวเท่านั้น ห้ามย้อนกลับไปถามซ้ำ  หากผู้ใช้ตอบคำถามทั้ง3คำถามครบแล้วให้ถามว่าจะช่วยแนะนำอะไรมั้ย แล้วคำถามอื่นต่อจากคำถามนี้ให้คุณให้คำตอบต่อจากนี้โดยอ้างอิงจากคำตอบก่อนหน้านี้ส่วนต่อจากนี้คือส่วนที่คุณวิเคราะห์หลังจากคุณถามว่ามีอะไรให้ช่วยมั้ยถ้าผู้ใช้ถามเกี่ยวกับตารางอาหารหรือสถานการณ์นี้ควรกินอะไรก็แนะนำโดยอ้างอิงตามข้อมูลที่ได้มาโดยคำถามทั้งหมดนี้ถามแค่ครั้งเดียว จากคำตอบของผู้ใช้ถ้ามีคนใส่ชื่ออาหารคุณก็ให้ข้อมูลว่านี่คืออะไร มีวัตถุดิบอะไรบ้าง มีวิธีการทำอย่างไร มีสารอาหารอะไรบ้าง เหมาะสำหรับบุคคลไหน แต่ถ้าผู้ใช้ใส่ช่วงเวลาหรือสถานการณ์มาว่าควรกินอะไรให้ตอบเป็นชื่ออาหารที่เหมาะสมกับตอนนั้น แต่ถ้าผู้ใช้อยากให้คุณทำรายการแนะนำอาหารในแต่ละวันหรือสัปดาห์คุณต้องทำตรางมื้ออาหารตั้งแต่เช้ายันเย็นให้และต้องดีต่อสุขภาพ ถ้าผุ้ใช้เสนอวัตถุดิบหรือเมนูมาแล้วถามว่าควรกินคู่กับอะไร ให้คุณตอบเป็นเมนูหรือวัตถุดิบที่เข้ากับวัตถุดิบหรือเมนูนั้นๆ ถ้าผู้ใช้ถามว่าไม่รู้จะกินอะไรให้คุณแนะนำอาหารอย่างนึงตามข้อมูลโดยอ้างอิงจากข้อมูลที่ได้รับมาและถามผู้ใช้ว่าคุณชอบมั้ยถ้าไม่ลองเสนอเมนูใหม่และให้ข้อมูลเหมือนเดิมถ้ามีเวลาด้วยให้เอาเวลาที่ผุ็ใช้งานถามมาคิดด้วย โดยคำถามจะมาแค่อย่างเดียว ถ้าผู้ใช้ถามที่ไม่ใช่เรื่องของสุขภาพหรืออาหารให้ตอบกลับไปว่าคุณไม่มีข้อมูลและให้ผู้ใช้ถามใหม่ ซึ่งทุกประโยคที่คุณพูดออกมานั้นจะต้องสั้น กระชับ และคุณต้องแบ่งparagraphให้ผู้ใช้งานด้วย`,
    });

    // สร้างประวัติสนทนา
    const historyText = [...chatLog, userChat]
      .map(msg => `${msg.from === "user" ? "ผู้ใช้" : "AI"}: ${msg.text}`)
      .join("\n");

    const result = await model.generateContent(historyText);
    const response = await result.response;
    const aiText = await response.text();
    const aiChat = { from: "ai", text: aiText, timestamp: getFormattedTime() };

    setChatLog((prev) => [...prev, aiChat]);

    // ✅ บันทึกลง MongoDB ด้วยแชทล่าสุด
    await fetch("/api/saveChat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "user123",
        chatLog: [userChat, aiChat],
      }),
    });

  } catch (error) {
    console.error("AI Error:", error);
    const errorChat = {
      from: "ai",
      text: "❌ ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI ลองใหม่อีกครั้งนะครับ",
      timestamp: getFormattedTime()
    };
    setChatLog((prev) => [...prev, errorChat]);
  } finally {
    setIsLoading(false);
  }
};


    return (
        <div className="relative font-prompt min-h-screen flex flex-col">
            <div className="absolute h-[450px] w-full z-[-2] bg-gradient-to-b from-purple-900 to-orange-200"></div>
            <div className="absolute h-[500px] top-[28rem] w-full z-[-2] bg-[#55673E]"></div>

            <div className="relative z-20 flex justify-between m-[2rem] items-center w-[calc(100%-4rem)]">
                <div
                    onClick={goto}
                    className="bg-white h-[50px] flex justify-center cursor-pointer transform transition duration-300 hover:scale-103 items-center w-[50px] rounded-full shadow-grey shadow-xl"
                >
                    <img className="h-[15px]" src="Group%2084.png" alt="Back arrow icon" />
                </div>
                <h1 className="font-bold text-2xl text-white">3 TupP chat</h1>
                <div>
                    <img src="/image%2075.png" alt="User avatar icon" />
                </div>
            </div>

            <div className="sm:flex flex-col items-center">
                <div className="absolute top-[11rem] left-[-3.5rem] xl:left-[10rem] z-0">
                    <img className="w-[220px]" src="/image%2076.png" alt="Decorative chat bubble graphic"></img>
                </div>

                {/* สลับฝั่ง แชท user กับ AI ให้ที */}

                <div className="h-[650px] xl:h-[500px] xl:w-[700px] overflow-y-auto scrollbar-none pt-[4rem] relative z-10">
                    <div ref={chatContainerRef} className="flex flex-col gap-[1rem] px-[1.5rem] ml-[4rem] mt-[0rem] pb-[2rem]">
                        {chatLog.map((msg, index) => (
                            // เปลี่ยนเงื่อนไขที่นี่: ถ้าเป็น user ให้ self-end (ชิดขวา), ถ้าเป็น ai ให้ self-start (ชิดซ้าย)
                            <div key={index} className={`flex flex-col items-center gap-1 ${msg.from === "user" ? "self-end" : "self-start"}`}>
                                {/* แสดงเวลาของข้อความแต่ละอัน เฉพาะถ้าเป็นข้อความ AI (เพราะเราจะย้าย user ไปขวา) */}
                                {msg.from === "user" && ( // <--- เปลี่ยนจาก user เป็น ai
                                    <h1 className="text-white text-[0.7rem] self-center">
                                        {msg.timestamp}
                                    </h1>
                                )}
                                {/* เปลี่ยนเงื่อนไขที่นี่: ถ้าเป็น user ให้ flex-row-reverse (รูปอยู่ขวา), ถ้าเป็น ai ไม่ต้อง flex-row-reverse (รูปอยู่ซ้าย) */}
                                <div className={`flex items-start gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                                    <img
                                        // คุณใช้รูปเดียวกันสำหรับ user และ ai ซึ่งโอเค แต่ถ้ามีรูปแยกก็เปลี่ยนตรงนี้
                                        src={msg.from === "ai" ? "/image%2075.png" : "/image%2075.png"}
                                        alt={msg.from === "ai" ? "AI avatar" : "User avatar"}
                                        className="w-[40px] h-[40px] rounded-full flex-shrink-0"
                                    />
                                    <div className={`break-words p-2 rounded-2xl shadow
                    ${msg.from === "user" // <--- เปลี่ยนจาก ai เป็น user สำหรับ bg-color และ max-width ของ user
                                            ? `bg-blue-500 text-white max-w-[calc(100vw-120px)] text-base` // สมมติสีพื้นหลัง user เป็นสีน้ำเงิน
                                            : `bg-white text-gray-800 max-w-[calc(100vw-150px)] ${getFontSizeClass(msg.text, true)}`}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-2 flex-row-reverse">
                                <img src="/image%2075.png" alt="AI avatar" className="w-[40px] h-[40px] rounded-full flex-shrink-0" />
                                <div className="max-w-[calc(100vw-120px)] break-words p-2 bg-gray-200 rounded-2xl shadow text-base">
                                    AI กำลังคิดคำตอบ...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white w-[90%] max-w-[500px] mx-auto mb-[2rem] rounded-full h-[45px] px-4 flex items-center shadow-md absolute bottom-0 left-1/2 -translate-x-1/2 z-20">
                <input
                    className="flex-1 outline-none px-2"
                    type="text"
                    placeholder="พิมพ์ข้อความ..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={isLoading}
                    aria-label="Message input"
                />
                <img
                    className="w-[20px] h-[20px] cursor-pointer rotate-180"
                    src="/Group%2084.png"
                    alt="Send button"
                    onClick={handleSend}
                    style={{ opacity: isLoading ? 0.5 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                />
            </div>
        </div>
    );
}