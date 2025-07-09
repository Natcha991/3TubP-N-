'use client';

import { useRouter , useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import menuData from '@/data/menu_image_mapping.json';

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

  const topic = searchParams.get("topic");
  const topicMessages: Record<string, string> = {
    water: "การดื่มน้ำในแต่ละวันสำคัญแค่ไหน และควรดื่มเท่าไหร่?",
    sleep: "อยากนอนหลับลึกและตื่นสดชื่นขึ้น ควรปรับอะไรบ้าง?",
    chew: "การเคี้ยวช้ากับการย่อยอาหารเกี่ยวกันไหมครับ?",
  };

  const isAutoSent = useRef(false); // ป้องกันการส่งซ้ำ

  

  useEffect(() => {
    

    const autoMessage = topic && topicMessages[topic];

    if (autoMessage && !isAutoSent.current) {
      isAutoSent.current = true;
      handleSendAuto(autoMessage);
    }
  }, [topic]);

  const userId = searchParams.get('id');
  const allowedMenu = menuData;
  const allowedMenuNames = menuData.map((m) => m.name);

  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY as string
  );

  const goto = () => router.push(`/home?id=${userId}`);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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

  const handleSendAuto = async (msg: string) => {
    const userChat = {
      from: "user",
      text: msg,
      timestamp: getFormattedTime(),
    };
    setChatLog((prev) => [...prev, userChat]);
    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: "ตอบแบบสั้น กระชับ ไม่เกิน 4 บรรทัด",
      });
      const historyText = [...chatLog, userChat]
        .map((msg) => `${msg.from === "user" ? "ผู้ใช้" : "AI"}: ${msg.text}`)
        .join("\n");
      const result = await model.generateContent(historyText);
      const aiText = await result.response.text();
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
      setChatLog((prev) => [...prev, {
        from: "ai",
        text: "❌ ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI ลองใหม่อีกครั้งนะครับ",
        timestamp: getFormattedTime(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (message.trim() === "") return;
    const userChat = {
      from: "user",
      text: message,
      timestamp: getFormattedTime(),
    };
    setChatLog((prev) => [...prev, userChat]);
    setMessage("");
    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `คุณเป็นนักโภชนาการใจดี อ่อนโยน ให้คำแนะนำสั้น กระชับ ไม่เกิน 4 บรรทัด\n- ตอบเฉพาะเมนูจากรายการ:\n${allowedMenuNames.join("\n")}`,
      });
      const historyText = [...chatLog, userChat]
        .map((msg) => `${msg.from === "user" ? "ผู้ใช้" : "AI"}: ${msg.text}`)
        .join("\n");
      const result = await model.generateContent(historyText);
      const aiText = await result.response.text();
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
      setChatLog((prev) => [...prev, {
        from: "ai",
        text: "❌ ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI ลองใหม่อีกครั้งนะครับ",
        timestamp: getFormattedTime(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative font-prompt min-h-screen flex flex-col">
      <div className="absolute h-[450px] w-full z-[-2] bg-gradient-to-b from-purple-900 to-orange-200"></div>
      <div className="absolute h-[500px] top-[28rem] w-full z-[-2] bg-[#55673E]"></div>

      <div className="relative z-20 flex justify-between m-[2rem] items-center w-[calc(100%-4rem)]">
        <div onClick={goto} className="bg-white h-[50px] flex justify-center cursor-pointer items-center w-[50px] rounded-full shadow-xl">
          <img className="h-[15px]" src="Group%2084.png" alt="Back" />
        </div>
        <h1 className="font-bold text-2xl text-white">3 TupP chat</h1>
        <img src="/image%2075.png" alt="User avatar" />
      </div>

      <div className="sm:flex flex-col items-center">
        <div className="absolute top-[11rem] left-[-3.5rem] xl:left-[10rem] z-0">
          <img className="w-[220px]" src="/image%2076.png" alt="Decorative icon" />
        </div>
        <div className="h-[650px] xl:h-[500px] xl:w-[700px] overflow-y-auto pt-[4rem] relative z-10">
          <div ref={chatContainerRef} className="flex flex-col gap-[1rem] px-[1.5rem] ml-[4rem] pb-[2rem]">
            {chatLog.map((msg, index) => (
              <div key={index} className={`flex flex-col items-center gap-1 ${msg.from === "user" ? "self-end" : "self-start"}`}>
                {msg.from === "user" && <h1 className="text-white text-[0.7rem] self-center">{msg.timestamp}</h1>}
                <div className={`flex items-start gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                  <img src="/image%2075.png" alt="avatar" className="w-[40px] h-[40px] rounded-full" />
                  <div className={`break-words p-2 rounded-2xl shadow ${msg.from === "user" ? "bg-blue-500 text-white" : `bg-white text-gray-800 ${getFontSizeClass(msg.text, true)}`} max-w-[calc(100vw-150px)]`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2 flex-row-reverse">
                <img src="/image%2075.png" alt="AI avatar" className="w-[40px] h-[40px] rounded-full" />
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
        />
        <img
          className="w-[20px] h-[20px] cursor-pointer rotate-180"
          src="/Group%2084.png"
          alt="Send"
          onClick={handleSend}
          style={{ opacity: isLoading ? 0.5 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
        />
      </div>
    </div>
  );
}
