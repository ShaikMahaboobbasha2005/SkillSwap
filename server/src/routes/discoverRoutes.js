const express = require("express");
const router = express.Router();
const discoverController = require("../controllers/discoverController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/discover (Protected route for authenticated users)
router.get("/", authMiddleware, discoverController.discover);

module.exports = router;
