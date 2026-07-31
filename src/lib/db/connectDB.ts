import mongoose from "mongoose";
import "@/models/registerModels";

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache = globalThis as typeof globalThis & { mongoose?: MongooseCache };
let cached = globalCache.mongoose;

if (!cached) {
  cached = { conn: null, promise: null };
  globalCache.mongoose = cached;
}

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached) {
    cached = { conn: null, promise: null };
    globalCache.mongoose = cached;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
