import { connectToDatabase } from '@/lib/mongodb';
import Menu from '@/models/Menu'; // ตรวจสอบว่า Menu model ถูก export มาถูกต้อง
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb'; // Import ObjectId สำหรับ _id ที่เป็น ObjectId

// GET: ดึงเมนูทั้งหมด หรือ ดึงเมนูตาม tag พร้อม exclude ID
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag'); // ดึงค่า tag จาก query parameter
    const excludeId = searchParams.get('excludeId'); // ID ของเมนูปัจจุบันที่จะไม่แสดง

    let query: any = {};
    if (tag) {
      query = { tags: tag }; // ค้นหาเมนูที่มี tag ตรงกัน
    }

    if (excludeId) {
      // เพิ่มเงื่อนไขเพื่อไม่รวมเมนูที่มี ID เดียวกัน
      // ใช้ ObjectId ถ้า _id ใน MongoDB เป็น ObjectId
      // ถ้า _id เป็น String ธรรมดา ให้ใช้ query._id = { $ne: excludeId };
      try {
        query._id = { $ne: new ObjectId(excludeId) };
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      } catch (e) {
        console.warn(`Invalid ObjectId for excludeId: ${excludeId}. Continuing without exclusion.`);
=======
      } catch (error: unknown) {
        console.warn(`Invalid ObjectId: ${excludeId}, skipping exclusion.`, error);
>>>>>>> Stashed changes
=======
      } catch (error: unknown) {
        console.warn(`Invalid ObjectId: ${excludeId}, skipping exclusion.`, error);
>>>>>>> Stashed changes
=======
      } catch (error: unknown) {
        console.warn(`Invalid ObjectId: ${excludeId}, skipping exclusion.`, error);
>>>>>>> Stashed changes
      }
    }

    // กำหนด limit สำหรับการค้นหาเมนูใกล้เคียง
    // ถ้ามีการระบุ tag หรือ excludeId, จะ limit แค่ 3 รายการ
    // ถ้าไม่มีการระบุ (คือ GET ทั้งหมด), จะไม่ limit หรือ limit ตามที่คุณต้องการ
    const limit = (tag || excludeId) ? 3 : 0; // 0 หมายถึงไม่ limit

    // *** แก้ไขตรงนี้: ใช้ .exec() แทน .toArray() ***
    const menus = await Menu.find(query).limit(limit).exec(); // ใช้ .exec() เพื่อให้ Query ทำงาน

    return NextResponse.json(menus);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  } catch (error) {
    console.error('GET /api/menus error:', error);
=======
  } catch (error: unknown) {
    console.error('GET /api/menu error:', error instanceof Error ? error.message : error);
>>>>>>> Stashed changes
=======
  } catch (error: unknown) {
    console.error('GET /api/menu error:', error instanceof Error ? error.message : error);
>>>>>>> Stashed changes
=======
  } catch (error: unknown) {
    console.error('GET /api/menu error:', error instanceof Error ? error.message : error);
>>>>>>> Stashed changes
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดขณะดึงเมนู' }, { status: 500 });
  }
}

// POST: เพิ่มเมนูใหม่ (รองรับการเพิ่มทีละหลายรายการ)
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const menus = await req.json();

    if (!Array.isArray(menus) || menus.length === 0) {
      return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้องหรือว่างเปล่า' }, { status: 400 });
    }

<<<<<<< Updated upstream
    const inserted = await Menu.insertMany(menus);
    return NextResponse.json(inserted, { status: 201 });

  } catch (error) {
    console.error('POST /api/menus error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดขณะอัปโหลดเมนูจำนวนมาก' }, { status: 500 });
=======
    const insertedMenus = await Menu.insertMany(menus);
    return NextResponse.json(insertedMenus, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /api/menu error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดขณะอัปโหลดเมนู' }, { status: 500 });
>>>>>>> Stashed changes
  }
}
