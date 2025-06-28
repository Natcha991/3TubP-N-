import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI not found in .env.local');
}

const MenuSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  riceType: String,
  description: String,
  healthNote: String,
  tags: [String],
  ingredients: [String],
  instructions: String,
});

const Menu = mongoose.models.Menu || mongoose.model('Menu', MenuSchema);

async function main() {
  await mongoose.connect(MONGODB_URI!); // ✅ ย้ายเข้ามาใน main()

  await Menu.deleteMany({}); // เคลียร์เมนูเก่า
  await Menu.insertMany([
    {
      name: 'ข้าวกล้องผัดกะเพราไก่',
      calories: 450,
      riceType: 'ข้าวกล้องหอมมะลิ',
      description: 'เมนูสุขภาพ เผ็ดนิดๆ โปรตีนสูง',
      healthNote: 'โปรตีนสูงจากอกไก่ ไม่มีไขมันทรานส์',
      tags: ['มื้อกลางวัน', 'โปรตีนสูง'],
      ingredients: ['ข้าวกล้อง', 'อกไก่', 'ใบกะเพรา', 'พริก', 'กระเทียม'],
      instructions: 'ผัดทุกอย่างในกระทะด้วยน้ำมันมะกอกจนสุก',
    },
    {
      name: 'ข้าวกล้องต้มยำเห็ด',
      calories: 320,
      riceType: 'ข้าวกล้องแดง',
      description: 'ต้มยำรสแซ่บ เห็ดรวมเพื่อสุขภาพ',
      healthNote: 'เสริมภูมิคุ้มกันด้วยเห็ดหลายชนิด ไม่มีเนื้อสัตว์',
      tags: ['อาหารเจ', 'แซ่บ', 'ย่อยง่าย'],
      ingredients: ['ข้าวกล้องแดง', 'เห็ดหอม', 'เห็ดฟาง', 'ตะไคร้', 'ใบมะกรูด', 'พริก'],
      instructions: 'ต้มวัตถุดิบทั้งหมดในน้ำเดือด แล้วปรุงรสด้วยน้ำมะนาวและพริกสด',
    },
  ]);

  console.log('✅ เพิ่มเมนูใหม่สำเร็จแล้ว');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ เกิดข้อผิดพลาด:', err);
  process.exit(1);
});