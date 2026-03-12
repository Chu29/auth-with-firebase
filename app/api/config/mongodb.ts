import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI as string;

if (!MONGO_URI) {
  throw new Error("MONGODB_URI is not defined");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached = (global as { mongoose?: MongooseCache }).mongoose;

if (!cached) {
  cached = (global as { mongoose?: MongooseCache }).mongoose = {
    conn: null,
    promise: null,
  };
}

async function dbConnect() {
  try {
    if (!cached) {
      throw new Error("Cache not initialized");
    }
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGO_URI, { bufferCommands: false });
    }
    cached.conn = await cached.promise;
    console.log("Connected to MongoDB");
    return cached.conn;
  } catch (error) {
    cached!.promise = null;
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

export default dbConnect;
