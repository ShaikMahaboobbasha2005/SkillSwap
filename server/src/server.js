require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const discoverRoutes = require("./routes/discoverRoutes");
const swapRoutes = require("./routes/swapRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const initSockets = require("./sockets/socketHandler");
const notificationService = require("./services/notificationService");
const { initMeetingReminderJob } = require("./jobs/meetingReminderJob");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// CORS configuration
const defaultDevOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const parseAllowedOrigins = () => {
  const origins = new Set();

  // Separate CORS_ORIGINS environment variable for multiple allowed origins
  if (process.env.CORS_ORIGINS) {
    process.env.CORS_ORIGINS.split(",")
      .map((url) => url.trim().replace(/\/+$/, ""))
      .filter(Boolean)
      .forEach((url) => origins.add(url));
  }

  // Canonical frontend URL
  if (process.env.CLIENT_URL) {
    process.env.CLIENT_URL.split(",")
      .map((url) => url.trim().replace(/\/+$/, ""))
      .filter(Boolean)
      .forEach((url) => origins.add(url));
  }

  // Keep localhost development origins available in development or when unconfigured
  if (process.env.NODE_ENV !== "production" || origins.size === 0) {
    defaultDevOrigins.forEach((url) => origins.add(url));
  }

  return Array.from(origins);
};

const allowedOrigins = parseAllowedOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests, mobile clients, curl, or tools without Origin header
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.trim().replace(/\/+$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Socket.io setup attached to HTTP server
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = origin.trim().replace(/\/+$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error(`Socket.IO CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

app.set("io", io);

// Set Socket.io instance on notificationService for centralized real-time delivery
notificationService.setIO(io);

// Body Parser Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillSwap API is running",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/meetings", meetingRoutes);

// Initialize Socket.io Connection & Event Handlers
initSockets(io);

// Initialize Background Meeting Reminder Job
initMeetingReminderJob(io);

// Shared Error Handler Middleware
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

// Start Server using http.Server instance
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});