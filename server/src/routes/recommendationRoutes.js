const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/recommendations (Protected route for authenticated users)
router.get("/", authMiddleware, recommendationController.getRecommendations);

module.exports = router;
