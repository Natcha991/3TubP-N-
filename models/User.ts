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
  isFromGroup?: boolean; // 🆕 เพิ่ม: ระบุว่าผู้ใช้นี้มาจากกลุ่ม
  awaitingName?: boolean;
  conversation: { role: string; text: string }[];
  awaitingField?: string | null;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: false, unique: false }, // ✅ เปลี่ยนจาก unique: true → false (กัน error กรณีชื่อซ้ำ)
    birthday: Date,
    gender: String,
    weight: Number,
    height: Number,
    goal: String,
    condition: String,
    lifestyle: String,
    lineId: { type: String, unique: true, sparse: true },
    isFromGroup: { type: Boolean, default: false }, // 🆕 ใช้บอกว่าผู้ใช้นี้มาจากแชทกลุ่มไหม
    awaitingName: { type: Boolean, default: true },
    awaitingField: { type: String, default: null },

    // ✅ เก็บบทสนทนา (จำสิ่งที่คุยไปก่อนหน้า)
    conversation: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema, "users");
