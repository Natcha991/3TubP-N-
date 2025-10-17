// /lib/mongodb.ts
import mongoose, { Connection } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// ✅ ตรวจสอบการตั้งค่า MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error("⚠️ กรุณาตั้งค่า MONGODB_URI ในไฟล์ .env.local");
}

// ✅ สร้างตัวแคช global ป้องกันการเชื่อมต่อซ้ำ
type GlobalWithMongooseCache = typeof globalThis & {
  mongoose?: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
};

const globalWithMongoose = global as GlobalWithMongooseCache;

const cached =
  globalWithMongoose.mongoose ??
  (globalWithMongoose.mongoose = { conn: null, promise: null });

// ✅ ฟังก์ชันเชื่อมต่อ MongoDB
export async function connectToDatabase(): Promise<Connection> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "3tubptest",
        bufferCommands: false,
      })
      .then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
