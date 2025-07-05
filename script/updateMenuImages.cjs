const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// ✅ 1. เชื่อมต่อ MongoDB
const uri = 'mongodb+srv://Sarn:sarnsarn@cluster0.zoyzeyy.mongodb.net/3tubptest?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('3tubptest'); // ✅ ชื่อ database
    const menus = db.collection('menus'); // ✅ ชื่อ collection

    // ✅ 2. โหลดไฟล์ JSON ที่มี image mapping
    const filePath = path.join(__dirname, '../data/100_random_thai_menus.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const menuData = JSON.parse(rawData);

    let updated = 0;

    for (const menu of menuData) {
      const imageName = menu.name.replace(/\s/g, '_') + '.png';

      const result = await menus.updateOne(
        { name: menu.name },
        { $set: { image: imageName } }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ ${menu.name} → ${imageName}`);
        updated++;
      } else {
        console.warn(`⚠️ ไม่พบหรือไม่สามารถอัปเดต: ${menu.name}`);
      }
    }

    console.log(`🎉 อัปเดตเมนูสำเร็จทั้งหมด: ${updated} รายการ`);
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
  } finally {
    await client.close();
  }
}

run();