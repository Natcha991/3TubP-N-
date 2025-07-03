// pages/login.tsx (สำหรับ Pages Router)
// หรือ app/login/page.tsx (สำหรับ App Router) - ต้องใส่ 'use client'; ด้านบน

'use client'; // จำเป็นสำหรับ App Router และ Pages Router ที่ใช้ Hooks

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // สำหรับการ redirect

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // ป้องกันการ reload หน้าเมื่อ submit form

    if (!username.trim()) {
      setError('กรุณาป้อนชื่อผู้ใช้');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ส่ง username ไปยัง Backend API
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }), // ส่ง username ที่ตัดช่องว่างออก
      });

      if (res.ok) {
        const data = await res.json();
        const userId = data.userId; // รับ userId จาก Backend ที่ส่งกลับมา

        if (userId) {
          // เก็บ userId ไว้ใน Local Storage (สำหรับการทดสอบหรือถ้าไม่ต้องการ Auth ที่ซับซ้อนมาก)
          // **คำเตือน:** สำหรับ Production ควรใช้ HttpOnly Cookies เพื่อความปลอดภัยที่ดีกว่า
          localStorage.setItem('userId', userId);

          // Redirect ไปยังหน้า Home พร้อมส่ง userId เป็น Query Parameter
          router.push(`/home?id=${userId}`);
        } else {
          setError('ไม่ได้รับรหัสผู้ใช้จากเซิร์ฟเวอร์');
        }
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">เข้าสู่ระบบ</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              ชื่อผู้ใช้
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="ป้อนชื่อผู้ใช้ของคุณ"
            />
          </div>

          {error && <p className="text-center text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}