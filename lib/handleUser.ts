// /lib/handleUser.ts
import { connectToDatabase } from "./mongodb";
import User from "@/models/User";

export interface ChatUser {
  _id: string;
  lineId: string;
  name?: string;
  lifestyle?: string;
  goal?: string;
  condition?: string;
  awaitingName?: boolean;
}

// ✅ ฟังก์ชันตรวจสอบหรือสร้างผู้ใช้
export async function getOrCreateUser(lineId: string, userMessage?: string) {
  await connectToDatabase();

  // ดึงผู้ใช้จาก DB
  const user = await User.findOne({ lineId }) ?? new User({ lineId, awaitingName: true });

  // 🧩 ถ้ายังไม่มีผู้ใช้ → สร้างใหม่
  if (!user._id) {  // กรณีเพิ่งสร้าง
    await user.save();
    return {
      user: user.toObject() as ChatUser,
      replyText: "สวัสดีครับ 😊 กรุณากรอกชื่อของคุณ หรือพิมพ์ 'ไม่มี' ถ้าไม่มีชื่อ",
    };
  }

  // 🧩 ถ้ามีผู้ใช้แต่ยังไม่ได้กรอกชื่อ
  if (user.awaitingName) {
    const name = userMessage && userMessage !== "ไม่มี" ? userMessage : "ไม่มี";
    user.name = name;
    user.awaitingName = false;
    await user.save();

    return {
      user: user.toObject() as ChatUser,
      replyText: `ยินดีที่ได้รู้จักครับคุณ ${name}! ตอนนี้คุณสามารถถามเรื่องเมนูอาหารหรือสุขภาพได้เลยครับ`,
    };
  }

  // 🧩 ผู้ใช้เก่า มีข้อมูลครบแล้ว → ส่งข้อความทักทายแบบพิเศษ
  return {
    user: user.toObject() as ChatUser,
    replyText: `ยินดีต้อนรับคุณ ${user.name} เข้าสู่การให้บริการทางไลน์ chat bot หวังว่าจะสร้างความสะดวกสบายให้กับคุณ และขอบคุณสำหรับแรงสนับสนุนตลอดมาครับ 😊`,
  };
}
