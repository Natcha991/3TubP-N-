// /lib/mongodb.ts
import mongoose, { Connection } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("⚠️ กรุณาตั้งค่า MONGODB_URI ในไฟล์ .env.local");
}

type MongooseCache = {
  conn: Connection | null;
  promise: Promise<Connection> | null;
};

// ใช้ global เพื่อเก็บ cache การเชื่อมต่อ (ป้องกัน connect ซ้ำ)
const globalForMongoose = globalThis as unknown as { mongoose?: MongooseCache };

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalForMongoose.mongoose;

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
