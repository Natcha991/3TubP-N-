// src/models/User.ts
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: String,
  age: Number,
  weight: Number,
  disease: String,
  goal: String,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);