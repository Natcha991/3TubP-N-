'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Register2() {
  const router = useRouter();
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const user = await res.json();
    localStorage.setItem('userId', user._id); // สำรองไว้เผื่อใช้

    // ✅ แนบ id ไปใน URL
    router.push(`/register3?id=${user._id}`);
  };
  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อของคุณ" />
      <button onClick={handleSubmit}>ถัดไป</button>
    </div>
  );
}