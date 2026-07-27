require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json());

// Port
const PORT = process.env.PORT || 5000;

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillSwap API is running",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});