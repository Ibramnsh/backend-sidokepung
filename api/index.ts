import express from "express"
import cors from "cors"
import connectDB from "../src/config/db"
import mongoose from "mongoose"

const app = express()

// Middleware
app.use(
  cors({
    origin: [
      //   "https://desa-cantik-sda.vercel.app",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      //   "https://desacantik.pahlawan140.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"], // Metode yang diizinkan
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Backend Sidokepung API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongooseState: mongoose.connection.readyState,
    availableRoutes: [
      "GET /",
      "GET /debug",
      "GET /api/auth/test",
      "POST /api/auth/login",
      "POST /api/auth/create-admin",
      "GET /api/auth/create-admin-form",
      "GET /api/peta",
      "GET /api/pekerjaan",
      "POST /api/pekerjaan",
      "PUT /api/pekerjaan/:id",
      "DELETE /api/pekerjaan/:id",
    ],
  })
})

// Debug endpoint yang lebih aman
app.get("/debug", async (req, res) => {
  try {
    console.log("🔍 Debug endpoint called")

    const dbStatus = mongoose.connection.readyState
    const statusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    }

    console.log("Current mongoose state:", dbStatus)

    // Try to connect if not connected
    if (dbStatus !== 1) {
      console.log("Attempting to connect...")
      await connectDB()
    }

    const debugInfo = {
      message: "Debug information",
      database: {
        status: statusMap[mongoose.connection.readyState],
        host: mongoose.connection.host || "not connected",
        name: mongoose.connection.name || "not connected",
        readyState: mongoose.connection.readyState,
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        MONGO_URI_EXISTS: !!process.env.MONGO_URI,
        MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
        JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
        ALL_ENV_KEYS: Object.keys(process.env).filter((key) => key.includes("MONGO") || key.includes("JWT")),
      },
    }

    // Only try to list collections if connected
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      try {
        const collections = await mongoose.connection.db.listCollections().toArray()
        debugInfo.database.collections = collections.map((c) => c.name)
      } catch (collError) {
        debugInfo.database.collectionsError = collError.message
      }
    } else {
      debugInfo.database.collectionsError = "Not connected to database"
    }

    res.json(debugInfo)
  } catch (error) {
    console.error("Debug endpoint error:", error)
    res.status(500).json({
      error: "Debug failed",
      details: error.message,
      type: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Import routes
import petaRoutes from "../src/routes/petaRoutes"
import pekerjaanRoutes from "../src/routes/pekerjaanRoutes"
import authRoutes from "../src/routes/authRoutes"

// API Routes
app.use("/api/peta", petaRoutes)
app.use("/api/pekerjaan", pekerjaanRoutes)
app.use("/api/auth", authRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error:", err)
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    requestedPath: req.originalUrl,
    availableRoutes: [
      "GET /",
      "GET /debug",
      "GET /api/auth/test",
      "POST /api/auth/login",
      "POST /api/auth/create-admin",
      "GET /api/auth/create-admin-form",
      "GET /api/peta",
      "GET /api/pekerjaan",
      "POST /api/pekerjaan",
      "PUT /api/pekerjaan/:id",
      "DELETE /api/pekerjaan/:id",
    ],
  })
})

export default app
