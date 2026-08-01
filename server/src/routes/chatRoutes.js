const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected Message History Route
router.get("/:swapId/messages", authMiddleware, chatController.getMessages);

module.exports = router;
