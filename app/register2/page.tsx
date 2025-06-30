'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Register2Page() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username }),
    });

    if (res.ok) {
      // 👉 อาจเก็บ userID ไว้ใน localStorage หรือ context
      router.push('/register3');
    } else {
      alert('เกิดข้อผิดพลาดในการลงทะเบียน');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <input
        type="text"
        placeholder="ชื่อ"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">ลงทะเบียน</button>
    </form>
  );
}