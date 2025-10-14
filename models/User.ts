// models/User.ts
import mongoose, { Schema } from 'mongoose';


const UserSchema = new Schema({
  name: { type: String, required: true, unique: true },
  birthday: Date,
  gender: String,
  weight: Number,
  height: Number,
  goal: String,
  condition: String,
  lifestyle: String,
  lineId: { type: String, unique: true, sparse: true },
  awaitingName: { type: Boolean, default: true }, // ✅ เพิ่มบรรทัดนี้
}, { timestamps: true });


export default mongoose.models.User || mongoose.model('User', UserSchema, 'users');