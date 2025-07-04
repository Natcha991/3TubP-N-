'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddIngredientForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      ...formData,
      price: Number(formData.price) || 0,
    };

    const res = await fetch('/api/ingredient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert('✅ เพิ่มวัตถุดิบสำเร็จ');
      router.push('/ingredient');
    } else {
      alert('❌ เกิดข้อผิดพลาด');
    }
  };

  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const ingredients = JSON.parse(text);

      if (!Array.isArray(ingredients)) {
        alert('❌ รูปแบบไฟล์ไม่ถูกต้อง ต้องเป็น array ของวัตถุดิบ');
        return;
      }

      const res = await fetch('/api/ingredient/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      });

      if (!res.ok) throw new Error('Upload failed');
      alert('✅ อัปโหลดวัตถุดิบสำเร็จแล้ว');
      router.push('/ingredient');
    } catch (err) {
      console.error('❌ Upload Error:', err);
      alert('เกิดข้อผิดพลาดในการอัปโหลด');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input name="name" placeholder="ชื่อวัตถุดิบ" value={formData.name} onChange={handleChange} />
        <input name="description" placeholder="คำอธิบาย" value={formData.description} onChange={handleChange} />
        <input name="image" placeholder="ชื่อไฟล์รูปภาพ เช่น garlic.png" value={formData.image} onChange={handleChange} />
        <input name="price" placeholder="ราคาโดยประมาณ (บาท)" value={formData.price} onChange={handleChange} />
        <button type="submit">บันทึกวัตถุดิบ</button>
      </form>

      <hr className="my-4" />

      <div>
        <label className="font-semibold block mb-1">📂 อัปโหลดวัตถุดิบจากไฟล์ JSON:</label>
        <input type="file" accept=".json" onChange={handleJsonUpload} />
        <p className="text-sm text-gray-500">* ต้องเป็น array ของ object วัตถุดิบ เช่น [&#123;"name": "กระเทียม", "price": 5&#125;]</p>
      </div>
    </div>
  );
}
