import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import User from "./models/User.js";
import { getSettings } from "./controllers/adminController.js";

dotenv.config();

// Connect to MongoDB
await connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Public Routes
app.get("/api/public/settings", getSettings);

// Payment Routes
app.use("/api/payments", paymentRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// Health Check
app.get("/", (req, res) => {
    res.send("Backend is running successfully 🚀");
});

// Database Test
app.get("/test-db", async (req, res) => {
    try {
        const count = await User.countDocuments();

        res.json({
            success: true,
            message: "Database is working!",
            totalUsers: count,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
