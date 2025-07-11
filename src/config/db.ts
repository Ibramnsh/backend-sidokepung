import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

let isConnected = false

const connectDB = async () => {
  if (isConnected) {
    console.log("Already connected to MongoDB")
    return
  }

  try {
    // Check if environment variables exist
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI

    console.log("Environment check:")
    console.log("- NODE_ENV:", process.env.NODE_ENV)
    console.log("- MONGO_URI exists:", !!process.env.MONGO_URI)
    console.log("- MONGODB_URI exists:", !!process.env.MONGODB_URI)
    console.log("- Using URI:", mongoUri ? "URI found" : "URI missing")

    if (!mongoUri) {
      console.error("❌ MONGO_URI or MONGODB_URI is not defined in environment variables")
      throw new Error("Database URI not found")
    }

    console.log("🔄 Attempting to connect to MongoDB...")

    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    }

    const conn = await mongoose.connect(mongoUri, options)
    isConnected = true

    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`)
    console.log(`📊 Database name: ${conn.connection.name}`)
    return conn
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
    })
    isConnected = false
    throw error
  }
}

export default connectDB
