// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  birthday?: Date;
  gender?: string;
  weight?: number;
  height?: number;
  goal?: string;
  condition?: string;
  lifestyle?: string;
  lineId?: string;
  awaitingName?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, unique: true },
  birthday: Date,
  gender: String,
  weight: Number,
  height: Number,
  goal: String,
  condition: String,
  lifestyle: String,
  lineId: { type: String, unique: true, sparse: true },
  awaitingName: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema, 'users');
