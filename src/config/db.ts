import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const connectDB = async () => {
  try {
    // Vercel environment variables
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI

    if (!mongoUri) {
      console.error("MONGO_URI or MONGODB_URI is not defined in environment variables")
      throw new Error("Database URI not found")
    }

    // Mongoose connection options optimized for serverless
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    }

    // Check if already connected
    if (mongoose.connections[0].readyState) {
      console.log("Already connected to MongoDB")
      return
    }

    await mongoose.connect(mongoUri, options)
    console.log("MongoDB connected successfully.")
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}

export default connectDB
