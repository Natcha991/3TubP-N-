'use client';

import { useRouter , useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatMessage {
  from: string;
  text: string;
  timestamp: string;
}

export default function IngredientPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const userId = searchParams.get('id'); // ดึง userId จาก URL

  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY as string
  );

  const goto = () => router.push(`/home?id=${userId}`);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatLog, isLoading]);

  const getFontSizeClass = (text: string, isAI: boolean) => {
    if (!isAI) return "text-base";
    if (text.length > 250) return "text-xs";
    if (text.length > 120) return "text-sm";
    return "text-base";
  };

  const getFormattedTime = (): string => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Bangkok",
    };
    return new Intl.DateTimeFormat("th-TH", options).format(now);
  };

  const handleSend = async () => {
    if (message.trim() === "") return;

    const userMessage = message;
    const currentMessageTime = getFormattedTime();
    const userChat = {
      from: "user",
      text: userMessage,
      timestamp: currentMessageTime,
    };

    setChatLog((prev) => [...prev, userChat]);
    setMessage("");
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `คุณเป็นนักโภชนาการผู้ชายที่ใจดี อ่อนโยน สุภาพ และให้คำแนะนำด้านอาหารอย่างเป็นธรรมชาติเหมือนเพื่อนที่คุยกันสบายๆ




ก่อนจะเริ่มตอบคำถามของผู้ใช้ ขอให้คุณเริ่มต้นด้วยการถาม 3 คำถาม เพื่อเข้าใจความชอบ ความต้องการ และเป้าหมายของผู้ใช้ โดยถามทีละข้อ และรอให้ผู้ใช้ตอบกลับก่อนจึงถามข้อถัดไป




คำถามคือ:




1. คุณชอบอาหารประเภทไหนบ้าง?  
2. คุณมีอาการแพ้อาหาร หรือโรคประจำตัวอะไรไหม?  
3. คุณมีเป้าหมายด้านสุขภาพอะไรเป็นพิเศษหรือเปล่า?




ถามแค่ครั้งเดียว ไม่ย้อนกลับไปถามใหม่ และทำแค่ตอนเริ่มต้นสนทนาเท่านั้น




เมื่อผู้ใช้ตอบครบทั้ง 3 ข้อแล้ว  
**ให้คุณแนะนำเมนูอาหารที่เหมาะกับผู้ใช้ทันที โดยอิงจากคำตอบทั้งหมดที่ได้รับ**




---




หลังจากนั้น หากผู้ใช้ถามเพิ่มเติม ให้ใช้แนวทางดังนี้ โดยคำตอบที่คุณตอนั้นจะ สั้นกระชับไม่เกินสามบรรทัด และแบ่งย่อหน้าให้อ่านง่าย:




- ถ้าผู้ใช้ถามเกี่ยวกับช่วงเวลา หรือสถานการณ์ (เช่น ตอนเช้า, หลังออกกำลังกาย) → ให้แนะนำอาหารที่เหมาะสมกับเวลานั้น
- ถ้ามีชื่ออาหาร → ให้ข้อมูลว่าอาหารนั้นคืออะไร, มีวัตถุดิบอะไร, ทำอย่างไร, มีสารอาหารอะไร และเหมาะกับใคร
- ถ้าผู้ใช้ขอ “ตารางอาหารประจำวันหรือสัปดาห์” → ให้จัดเมนูครบ 3 มื้อ/วัน และดีต่อสุขภาพ
- ถ้าผู้ใช้เสนอวัตถุดิบหรือเมนู → แนะนำสิ่งที่กินคู่กันได้
- ถ้าผู้ใช้ไม่รู้จะกินอะไร → แนะนำเมนูจากข้อมูลที่ได้ และถามว่า “คุณชอบเมนูนี้มั้ย?” ถ้าไม่ ให้เสนอเมนูใหม่พร้อมข้อมูล
-ถ้าผู้ใช้ ได้ถามปัญหาสุขภาพของตนเองกับคุณให้  ถ้าผู้ใช้ต้องการให้คุณcoaching ให้คุณตอบกลับกลับผู้ใช้งานด้วยคำถามที่มีความหมายและเป็นการย้อนให้ผู้ใช้ได้คิดทบทวนกับตนเองด้วยข้อความที่สั้นและกระชับ โดยคำถามนั้นจะไม่่เป็นชี้นำผู้ใช้งาน โดยก็จะต้องถามผู้ใช้ไปเรื่อยๆจนผู้ใช้งานพบคำตอบและวิธีแก้ปัญหาของปัญหาที่เขาพบเจอโดยคุณจะต้องใช้คำถามให้น้อยที่สุด และอยากเปลี่ยนแปลงตนเองตามคำตอบนั้น
หากผู้ใช้ถามเรื่องที่ไม่เกี่ยวกับสุขภาพหรืออาหาร ให้ตอบอย่างสุภาพว่า “คุณไม่มีข้อมูลในเรื่องนั้น” และแนะนำให้ถามในหัวข้ออาหารหรือสุขภาพแทน
`,
      });

      const historyText = [...chatLog, userChat]
        .map((msg) => `${msg.from === "user" ? "ผู้ใช้" : "AI"}: ${msg.text}`)
        .join("\n");

      const result = await model.generateContent(historyText);
      const response = await result.response;
      const aiText = await response.text();

      const aiChat = {
        from: "ai",
        text: aiText,
        timestamp: getFormattedTime(),
      };

      setChatLog((prev) => [...prev, aiChat]);

      await fetch("/api/saveChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: "user123", chatLog: [userChat, aiChat] }),
      });
    } catch (error) {
      console.error("AI Error:", error);
      const errorChat = {
        from: "ai",
        text: "❌ ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI ลองใหม่อีกครั้งนะครับ",
        timestamp: getFormattedTime(),
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
          <img className="w-[220px]" src="/image%2076.png" alt="Decorative chat bubble graphic" />
        </div>

        <div className="h-[650px] xl:h-[500px] xl:w-[700px] overflow-y-auto scrollbar-none pt-[4rem] relative z-10">
          <div
            ref={chatContainerRef}
            className="flex flex-col gap-[1rem] px-[1.5rem] ml-[4rem] mt-[0rem] pb-[2rem]"
          >
            {chatLog.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-1 ${msg.from === "user" ? "self-end" : "self-start"
                  }`}
              >
                {msg.from === "user" && (
                  <h1 className="text-white text-[0.7rem] self-center">
                    {msg.timestamp}
                  </h1>
                )}
                <div
                  className={`flex items-start gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""
                    }`}
                >
                  <img
                    src={
                      msg.from === "ai"
                        ? "/image%2075.png"
                        : "/image%2075.png"
                    }
                    alt={msg.from === "ai" ? "AI avatar" : "User avatar"}
                    className="w-[40px] h-[40px] rounded-full flex-shrink-0"
                  />
                  <div
                    className={`break-words p-2 rounded-2xl shadow ${msg.from === "user"
                        ? "bg-blue-500 text-white max-w-[calc(100vw-120px)] text-base"
                        : `bg-white text-gray-800 max-w-[calc(100vw-150px)] ${getFontSizeClass(
                          msg.text,
                          true
                        )}`
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2 flex-row-reverse">
                <img
                  src="/image%2075.png"
                  alt="AI avatar"
                  className="w-[40px] h-[40px] rounded-full flex-shrink-0"
                />
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
          style={{ opacity: isLoading ? 0.5 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
        />
      </div>
    </div>
  );
}
