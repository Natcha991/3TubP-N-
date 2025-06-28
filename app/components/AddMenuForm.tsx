'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddMenuForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    riceType: '',
    description: '',
    healthNote: '',
    tags: '',
    ingredients: '',
    instructions: '',
    image: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      ...formData,
      calories: Number(formData.calories) || 0,
      tags: formData.tags.split(',').map(t => t.trim()),
      ingredients: formData.ingredients.split(',').map(i => i.trim()),
      image: formData.image.trim() || 'default.png',
    };

    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert('✅ เพิ่มเมนูสำเร็จ');
      router.push('/menu');
    } else {
      alert('❌ เกิดข้อผิดพลาด');
    }
  };

  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const menus = JSON.parse(text);

      if (!Array.isArray(menus)) {
        alert('❌ รูปแบบไฟล์ไม่ถูกต้อง ต้องเป็น array ของเมนู');
        return;
      }

      const res = await fetch('/api/menu/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menus),
      });

      if (!res.ok) throw new Error('Upload failed');
      alert('✅ อัปโหลดเมนูสำเร็จแล้ว');
      router.push('/menu');
    } catch (err) {
      console.error('❌ Upload Error:', err);
      alert('เกิดข้อผิดพลาดในการอัปโหลด');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input name="name" placeholder="ชื่อเมนู" value={formData.name} onChange={handleChange} />
        <input name="calories" placeholder="แคลอรี่" value={formData.calories} onChange={handleChange} />
        <input name="riceType" placeholder="ประเภทข้าว" value={formData.riceType} onChange={handleChange} />
        <input name="description" placeholder="คำอธิบายเมนู" value={formData.description} onChange={handleChange} />
        <input name="healthNote" placeholder="คำอธิบายเชิงสุขภาพ" value={formData.healthNote} onChange={handleChange} />
        <input name="tags" placeholder="แท็ก เช่น มื้อเช้า,ผู้ป่วยเบาหวาน" value={formData.tags} onChange={handleChange} />
        <textarea name="ingredients" placeholder="วัตถุดิบ เช่น ไก่,ข้าวกล้อง,กระเทียม" value={formData.ingredients} onChange={handleChange} />
        <textarea name="instructions" placeholder="วิธีการทำ" value={formData.instructions} onChange={handleChange} />
        <input name="image" placeholder="ชื่อไฟล์รูปภาพ เช่น friedrice.png" value={formData.image} onChange={handleChange} />
        <button type="submit">บันทึกเมนู</button>
      </form>

      <hr className="my-4" />

      <div>
        <label className="font-semibold block mb-1">📂 อัปโหลดเมนูจากไฟล์ JSON:</label>
        <input type="file" accept=".json" onChange={handleJsonUpload} />
        <p className="text-sm text-gray-500">* ต้องเป็น array ของ object เมนู เช่น [&#123;"name": "...", "calories": 123&#125;]</p>
      </div>
    </div>
  );
}