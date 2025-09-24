// config/db.js
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGO_URL;

if (!MONGODB_URI) {
    console.error("❌ MONGO_URL is missing in environment variables");
    throw new Error("Please define the MONGO_URL environment variable");
}

// For Vercel serverless environment
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        console.log("✅ Using cached database connection");
        return cached.conn;
    }

    if (!cached.promise) {
        console.log("🔌 Creating new database connection...");
        
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => {
                console.log("✅ MongoDB connected successfully");
                return mongoose;
            })
            .catch((error) => {
                console.error("❌ MongoDB connection error:", error);
                cached.promise = null;
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error("❌ Failed to connect to MongoDB:", error);
        throw error;
    }
}

module.exports = connectDB;