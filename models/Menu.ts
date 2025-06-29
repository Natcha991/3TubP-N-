import mongoose, { Schema } from 'mongoose';

const MenuSchema = new Schema({
  name: String,
  calories: Number,
  riceType: String,
  description: String,
  healthNote: String,
  tags: [String],
  ingredients: [String],
  instructions: [String], // ✅ ตรงนี้สำคัญมาก
  image: String, // 👈 ชื่อไฟล์รูป เช่น "friedrice.png"
}, { timestamps: true });

export default mongoose.models.Menu || mongoose.model('Menu', MenuSchema, 'menus');