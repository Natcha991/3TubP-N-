// models/User.ts
import mongoose, { Schema } from 'mongoose';


const UserSchema = new Schema({
  name: { type: String, required: true, unique: true }, // ✅ ป้องกันชื่อซ้ำใน database
  birthday: Date,
  gender: String,
  weight: Number,
  height: Number,
  goal: String,
  condition: String,
  lifestyle: String,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema, 'users');