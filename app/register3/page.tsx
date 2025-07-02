'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Register3() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id'); // 🔍 ดึง userId ที่ส่งมาจาก register2

  const [birthday, setBirthday] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert('ไม่พบรหัสผู้ใช้');
      return;
    }

    const res = await fetch(`/api/user/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthday }),
    });

    if (res.ok) {
      router.push(`/register4?id=${userId}`); // 👉 ไปหน้าถัดไป พร้อมส่ง userId ต่อ
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึกวันเกิด');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4 w-[300px]">
        <h1 className="text-xl font-bold text-center">วันเกิดของคุณคือ?</h1>
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
        <button type="submit" className="bg-orange-400 text-white py-2 px-4 rounded w-full">
          ถัดไป
        </button>
      </form>
    </div>
  );
}