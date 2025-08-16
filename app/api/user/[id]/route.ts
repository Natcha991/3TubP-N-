//api/user/[id]
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const data = await req.json();

  try {
    const updated = await User.findByIdAndUpdate(params.id, data, { new: true });
    if (!updated) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/user/[id] error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการอัปเดต' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    // ✅ เพิ่มการคำนวณ
    let idealWeight: number | null = null;

    if (user.height && user.gender) {
      if (user.gender === 'female') {
        idealWeight = (user.height - 110) * 26;
      } else if (user.gender === 'male') {
        idealWeight = (user.height - 100) * 26;
      }
    }

    return NextResponse.json(
      {
        ...user.toObject(),
        idealWeight, // 🔥 ส่งค่าเพิ่มมาด้วย
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/user/[id] error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' }, { status: 500 });
  }
}


// //api/user/[id]
// import { connectToDatabase } from '@/lib/mongodb';

// import  User  from '@/models/User';

// import { NextResponse } from 'next/server';

// export async function PATCH(req: Request, { params }: { params: { id: string } }) {
//   await connectToDatabase();
//   const data = await req.json();

//   try {
//     const updated = await User.findByIdAndUpdate(params.id, data, { new: true });
//     if (!updated) {
//       return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
//     }

//     return NextResponse.json(updated, { status: 200 });
//   } catch (error) {
//     console.error('PATCH /api/user/[id] error:', error);
//     return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการอัปเดต' }, { status: 500 });
//   }
// }

// export async function GET(req: Request, { params }: { params: { id: string } }) {
//   await connectToDatabase();

//   try {
//     const user = await User.findById(params.id);
//     if (!user) {
//       return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
//     }

//     return NextResponse.json(user, { status: 200 });
//   } catch (error) {
//     console.error('GET /api/user/[id] error:', error);
//     return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' }, { status: 500 });
//   }
// }