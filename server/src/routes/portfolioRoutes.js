const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const authMiddleware = require("../middleware/authMiddleware");
const { optionalAuthMiddleware } = require("../middleware/authMiddleware");
const { handlePortfolioUploadMiddleware } = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  updatePortfolioSchema,
  portfolioReactionSchema,
  reportPortfolioSchema,
} = require("../utils/portfolioValidation");

// Protected: Create portfolio item (multipart/form-data with media file)
router.post(
  "/",
  authMiddleware,
  handlePortfolioUploadMiddleware,
  portfolioController.createPortfolioItem
);

// Protected: Report a portfolio item for moderation review
router.post(
  "/:id/report",
  authMiddleware,
  validateRequest(reportPortfolioSchema),
  portfolioController.reportPortfolioItem
);

// Protected: Add / change / remove reaction on a portfolio item
router.post(
  "/:id/reaction",
  authMiddleware,
  validateRequest(portfolioReactionSchema),
  portfolioController.toggleReaction
);

// Public / Optional Auth: Get all users who reacted to a portfolio item
router.get(
  "/:id/reactions",
  optionalAuthMiddleware,
  portfolioController.getPortfolioReactions
);

// Public / Optional Auth: Get user's active portfolio items (supports optional ?type=image|video)
router.get(
  "/user/:userId",
  optionalAuthMiddleware,
  portfolioController.getUserPortfolio
);

// Public / Optional Auth: Get single active portfolio item by ID
router.get(
  "/:id",
  optionalAuthMiddleware,
  portfolioController.getPortfolioItemById
);

// Protected: Update portfolio item (caption, skillId)
router.patch(
  "/:id",
  authMiddleware,
  validateRequest(updatePortfolioSchema),
  portfolioController.updatePortfolioItem
);

// Protected: Delete portfolio item permanently
router.delete("/:id", authMiddleware, portfolioController.deletePortfolioItem);

module.exports = router;
