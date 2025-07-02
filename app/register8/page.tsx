'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Register8() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  const [lifestyle, setLifestyle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert('ไม่พบรหัสผู้ใช้');
      return;
    }

    const res = await fetch(`/api/user/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lifestyle }),
    });

    if (res.ok) {
      alert('✅ บันทึกข้อมูลเรียบร้อยแล้ว');
      router.push('/menu'); // ✅ ไปหน้าเมนู หรือจะเปลี่ยนหน้าอื่นก็ได้
    } else {
      alert('❌ เกิดข้อผิดพลาดในการบันทึกไลฟ์สไตล์');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4 w-[300px]">
        <h1 className="text-xl font-bold text-center">ไลฟ์สไตล์ของคุณเป็นแบบไหน?</h1>

        <input
          type="text"
          placeholder="เช่น ทำงานออฟฟิศ, ออกกำลังกายทุกวัน"
          value={lifestyle}
          onChange={(e) => setLifestyle(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        <button type="submit" className="bg-orange-400 text-white py-2 px-4 rounded w-full">
          เสร็จสิ้น
        </button>
      </form>
    </div>
  );
}