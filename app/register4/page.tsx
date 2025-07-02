'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Register4() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  const [gender, setGender] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert('ไม่พบรหัสผู้ใช้');
      return;
    }

    const res = await fetch(`/api/user/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender }),
    });

    if (res.ok) {
      router.push(`/register5?id=${userId}`); // ✅ ไปหน้าเก็บน้ำหนัก/ส่วนสูง
    } else {
      alert('❌ เกิดข้อผิดพลาดในการบันทึกเพศ');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4 w-[300px]">
        <h1 className="text-xl font-bold text-center">ระบุเพศของคุณ</h1>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
          className="w-full border rounded p-2"
        >
          <option value="">-- เลือกเพศ --</option>
          <option value="ชาย">ชาย</option>
          <option value="หญิง">หญิง</option>
          <option value="ไม่ระบุ">ไม่ระบุ</option>
        </select>

        <button type="submit" className="bg-orange-400 text-white py-2 px-4 rounded w-full">
          ถัดไป
        </button>
      </form>
    </div>
  );
}