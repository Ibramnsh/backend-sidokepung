import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    // Find user in database
    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists.",
      });
    }

    // Create new admin user
    const newUser = new User({
      username,
      password,
      role: "admin",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Admin account created successfully!",
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Update verifyToken to provide better error messages
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "No Authorization header provided. Please include 'Authorization: Bearer <token>' in your request headers.",
        howToGetToken: "First login at POST /api/auth/login to get a token",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid Authorization header format. Use 'Bearer <token>'",
        receivedHeader: authHeader,
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found.",
      });
    }

    res.json({
      success: true,
      message: "Token is valid",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      tokenInfo: {
        issuedAt: new Date(decoded.iat * 1000),
        expiresAt: new Date(decoded.exp * 1000),
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format.",
      });
    }

    res.status(401).json({
      success: false,
      message: "Token verification failed.",
    });
  }
};
