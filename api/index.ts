import express from "express";
import cors from "cors";
import connectDB from "../src/config/db";

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"] // Ganti dengan domain frontend Anda
        : ["http://localhost:3000", "http://localhost:5173"], // untuk development
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Backend Sidokepung API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    availableRoutes: [
      "GET /",
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
  });
});

// Import routes
import petaRoutes from "../src/routes/petaRoutes";
import pekerjaanRoutes from "../src/routes/pekerjaanRoutes";
import authRoutes from "../src/routes/authRoutes";

// API Routes
app.use("/api/peta", petaRoutes);
app.use("/api/pekerjaan", pekerjaanRoutes);
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    availableRoutes: [
      "GET /",
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
  });
});

export default app;
