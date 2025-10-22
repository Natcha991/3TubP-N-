// /models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  birthday?: Date;
  gender?: string;
  weight?: number;
  height?: number;
  goal?: string;
  condition?: string;
  lifestyle?: string;
  lineId?: string;
  awaitingName?: boolean;
  conversation: { role: string; text: string }[];
  awaitingField?: string | null; 
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: false, unique: true },
    birthday: Date,
    gender: String,
    weight: Number,
    height: Number,
    goal: String,
    condition: String,
    lifestyle: String,
    lineId: { type: String, unique: true, sparse: true },
    awaitingName: { type: Boolean, default: true },
    awaitingField: { type: String, default: null }, // เพิ่มตรงนี้

    // ✅ เก็บบทสนทนา (จำสิ่งที่คุยไปก่อนหน้า)
    conversation: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema, "users");
