const fs = require('fs');

// โหลดไฟล์เมนู JSON ที่มีเมนูทั้งหมด
const menus = JSON.parse(fs.readFileSync('./AllMenus.json', 'utf-8'));

// สร้าง Set เพื่อเก็บ ingredient แบบไม่ซ้ำ
const ingredientSet = new Set();

// ลูปผ่านเมนูทั้งหมด
menus.forEach(menu => {
  const ingredients = Array.isArray(menu.ingredients)
    ? menu.ingredients
    : (menu.ingredients ? [menu.ingredients] : []);

  ingredients.forEach(ing => {
    ingredientSet.add(ing.trim());
  });
});

// แปลง Set เป็น Array และ sort ให้เรียง
const uniqueIngredients = Array.from(ingredientSet).sort();

// เขียนเป็นไฟล์ใหม่
fs.writeFileSync('./ingredients_extracted.json', JSON.stringify(uniqueIngredients, null, 2), 'utf-8');

console.log(`✅ Extracted ${uniqueIngredients.length} unique ingredients.`);
