import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

let isConnected = false

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("Already connected to MongoDB")
    return mongoose.connection
  }

  try {
    // Check if environment variables exist
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI

    console.log("🔍 Environment check:")
    console.log("- NODE_ENV:", process.env.NODE_ENV)
    console.log("- MONGO_URI exists:", !!process.env.MONGO_URI)
    console.log("- MONGODB_URI exists:", !!process.env.MONGODB_URI)

    if (!mongoUri) {
      console.error("❌ MONGO_URI or MONGODB_URI is not defined in environment variables")
      console.log(
        "Available env vars:",
        Object.keys(process.env).filter((key) => key.includes("MONGO")),
      )
      throw new Error("Database URI not found")
    }

    // Log partial URI for debugging (hide password)
    const uriForLog = mongoUri.replace(/:([^:@]{8})[^:@]*@/, ":****@")
    console.log("🔗 Connecting to:", uriForLog)

    console.log("🔄 Attempting to connect to MongoDB...")

    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increase timeout
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: "majority",
    }

    // Disconnect if already connected with different state
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    const conn = await mongoose.connect(mongoUri, options)
    isConnected = true

    console.log(`✅ MongoDB connected successfully!`)
    console.log(`📊 Host: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)
    console.log(`📊 Ready State: ${conn.connection.readyState}`)

    return conn.connection
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
