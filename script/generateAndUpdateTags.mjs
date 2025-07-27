import fs from "fs";
import mongoose from "mongoose";

// ✅ MongoDB URI
const MONGODB_URI = "mongodb+srv://Sarn:sarnsarn@cluster0.zoyzeyy.mongodb.net/3tubptest?retryWrites=true&w=majority&appName=Cluster0";

// ✅ Dynamic schema
const menuSchema = new mongoose.Schema({}, { strict: false });
const Menu = mongoose.model("Menu", menuSchema);

// ✅ กฎ tag (ไม่มีนม)
const tagRules = {
  "โปรตีนสูง": ["อกไก่", "ไข่", "เต้าหู้", "ปลา", "ถั่ว", "โปรตีน", "ไก่", "เนื้อ", "กุ้ง", "หมู"],
  "พลังงานสูง": ["ข้าว", "มัน", "กล้วย", "ธัญพืช", "คาร์โบไฮเดรต", "แคลอรี่สูง", "ไขมันดี"],
  "แคลอรี่ต่ำ": ["ผัก", "ต้ม", "นึ่ง", "น้ำซุป", "แคลอรี่ต่ำ", "เบา", "ย่อยง่าย"],
  "ไขมันต่ำ": ["ไม่ทอด", "นึ่ง", "ต้ม", "ไม่มีน้ำมัน", "ไขมันต่ำ"],
  "ไม่ใส่น้ำตาล": ["ไม่หวาน", "ไม่มีน้ำตาล", "ไม่ใส่น้ำตาล"],
  "โซเดียมต่ำ": ["จืด", "ไม่เค็ม", "โซเดียมต่ำ", "เบาเค็ม"],
  "ข้าวกล้อง": ["ข้าวกล้อง"],
  "มังสวิรัติ": ["เต้าหู้", "เห็ด", "ไม่มีเนื้อสัตว์", "ผักล้วน"],
  "วีแกน": ["ไม่มีเนื้อสัตว์", "ไม่มีไข่", "มังสวิรัติแท้"],
  "ทำง่าย": ["ง่าย", "สะดวก", "วัตถุดิบน้อย"],
  "ต้ม": ["ต้ม"],
  "นึ่ง": ["นึ่ง"],
  "อบ": ["อบ"],
  "ผัด": ["ผัด"],
  "ทอด": ["ทอด"],
  "กล่องเดียวจบ": ["กล่อง", "จานเดียว", "ครบจบ", "พกพาสะดวก"],
  "ทำกินที่บ้าน": ["ทำเอง", "บ้าน", "เตา", "หม้อ"],
  "สุขภาพ": ["สุขภาพ", "clean", "เฮลท์ตี้", "เพื่อสุขภาพ"]
};

// ✅ ใช้ includes สำหรับภาษาไทย
function extractTags(menu) {
  const content = [...(menu.ingredients || []), menu.description || "", menu.name || ""]
    .join(" ")
    .toLowerCase();

  const tags = new Set();

  for (const [tag, keywords] of Object.entries(tagRules)) {
    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        tags.add(tag);
        break;
      }
    }
  }

  return Array.from(tags).sort();
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const raw = fs.readFileSync("AllMenus_tagged_cleaned.json", "utf-8");
    const menus = JSON.parse(raw);

    for (const menu of menus) {
      let query;
      if (menu._id && typeof menu._id === "object" && menu._id.$oid) {
        query = { _id: new mongoose.Types.ObjectId(menu._id.$oid) };
      } else if (menu._id && typeof menu._id === "string") {
        query = { _id: new mongoose.Types.ObjectId(menu._id) };
      } else {
        query = { name: menu.name };
      }

      const tags = menu.tags && menu.tags.length > 0 ? menu.tags : extractTags(menu);

      // ✅ ลบ tags เก่าออกทั้งหมด
      await Menu.updateOne(query, { $unset: { tags: "" } });

      // ✅ เขียน tag ใหม่ลงไปแบบ clean
      const result = await Menu.updateOne(query, { $set: { tags } });

      if (result.matchedCount > 0) {
        console.log(`✅ Replaced tags for: ${menu.name}`);
      } else {
        console.warn(`⚠️ Not found: ${menu.name}`);
      }
    }

    console.log("🎉 เสร็จสิ้นการล้าง + ใส่ tags ใหม่ลง MongoDB");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
