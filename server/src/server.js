require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Connect Database
connectDB();

// CORS configuration
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parser Middleware
app.use(express.json());

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillSwap API is running",
  });
});

// Routes
app.use("/api/auth", authRoutes);

// Shared Error Handler Middleware
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});