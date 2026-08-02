const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected Chat Routes
router.get("/conversations", authMiddleware, chatController.getConversations);
router.get("/unread-count", authMiddleware, chatController.getUnreadCount);
router.get("/:swapId/messages", authMiddleware, chatController.getMessages);
router.patch("/:swapId/read", authMiddleware, chatController.markAsRead);

module.exports = router;
