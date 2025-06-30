// models/User.ts
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: String,
  birthdate: Date,
  healthCondition: String,
  lifestyle: String,
  goal: String,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema, 'users');