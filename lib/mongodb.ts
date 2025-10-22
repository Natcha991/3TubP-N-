import mongoose, { Connection } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error("⚠️ กรุณาตั้งค่า MONGODB_URI ในไฟล์ .env.local");
}

// ✅ แคชการเชื่อมต่อของแต่ละกลุ่ม
type GlobalWithMongooseCache = typeof globalThis & {
  mongooseGroups?: Record<
    string,
    { conn: Connection | null; promise: Promise<Connection> | null }
  >;
};

const globalWithMongoose = global as GlobalWithMongooseCache;
globalWithMongoose.mongooseGroups ??= {};

export async function connectToDatabase(groupId = "default"): Promise<Connection> {
  // ตรวจสอบว่ามีกลุ่มนี้ใน cache หรือยัง
  if (!globalWithMongoose.mongooseGroups![groupId]) {
    globalWithMongoose.mongooseGroups![groupId] = { conn: null, promise: null };
  }

  const cached = globalWithMongoose.mongooseGroups![groupId];

  // ใช้การเชื่อมต่อเดิมถ้ามีอยู่แล้ว
  if (cached.conn) return cached.conn;

  // ถ้ายังไม่เชื่อมต่อ ให้เชื่อมต่อใหม่
  if (!cached.promise) {
    cached.promise = mongoose
      .createConnection(MONGODB_URI, {
        dbName: `3tubptest_${groupId}`, // ✅ ใช้ชื่อฐานตามกลุ่ม
        bufferCommands: false,
      })
      .asPromise();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
