'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Register7() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  const [condition, setCondition] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert('ไม่พบรหัสผู้ใช้');
      return;
    }

    const res = await fetch(`/api/user/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ condition }),
    });

    if (res.ok) {
      router.push(`/register8?id=${userId}`); // ✅ ไปหน้า lifestyle
    } else {
      alert('❌ เกิดข้อผิดพลาดในการบันทึกเงื่อนไขสุขภาพ');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4 w-[300px]">
        <h1 className="text-xl font-bold text-center">คุณมีโรคประจำตัวหรือเงื่อนไขสุขภาพหรือไม่?</h1>

        <input
          type="text"
          placeholder="เช่น เบาหวาน, ความดัน, ไม่มี"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        <button type="submit" className="bg-orange-400 text-white py-2 px-4 rounded w-full">
          ถัดไป
        </button>
      </form>
    </div>
  );
}