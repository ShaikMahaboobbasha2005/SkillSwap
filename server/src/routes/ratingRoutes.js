const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { createRatingSchema } = require("../utils/ratingValidation");

// Protected Route: Submit a rating & review for a completed swap
router.post(
  "/:swapId",
  authMiddleware,
  validateRequest(createRatingSchema),
  ratingController.createRating
);

// Protected Route: Check if authenticated user has rated a specific swap
router.get("/swap/:swapId/status", authMiddleware, ratingController.getRatingStatusForSwap);

// Public Route: Fetch ratings received by a specific user (newest first, paginated)
router.get("/user/:userId", ratingController.getRatingsForUser);

module.exports = router;
