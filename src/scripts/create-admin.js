const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// User Schema (simplified for script)
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Create admin user
    const adminUser = new User({
      username: "admin",
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Please change the password after first login");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

createAdminUser();
