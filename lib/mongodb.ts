import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('⚠️ กรุณาตั้งค่า MONGODB_URI ใน .env.local');
}

// ✅ แก้ type ของ global เป็น { mongoose?: { conn: Connection | null, promise: Promise<Connection> | null } }
type GlobalWithMongooseCache = typeof globalThis & {
  mongoose?: { conn: Connection | null; promise: Promise<Connection> | null };
};

// ✅ เปลี่ยน let -> const และระบุ type ชัดเจน
const globalWithMongoose = global as GlobalWithMongooseCache;

const cached = globalWithMongoose.mongoose ?? (globalWithMongoose.mongoose = { conn: null, promise: null });

export async function connectToDatabase(): Promise<Connection> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: '3tubptest',
      bufferCommands: false,
    }).then((mongoose) => mongoose.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
