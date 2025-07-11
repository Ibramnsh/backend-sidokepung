import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import petaRoutes from "./routes/petaRoutes";
import pekerjaanRoutes from "./routes/pekerjaanRoutes";
import authRoutes from "./routes/authRoutes";

// Connect to Database
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/peta", petaRoutes);
app.use("/api/pekerjaan", pekerjaanRoutes);
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});

export default app;
