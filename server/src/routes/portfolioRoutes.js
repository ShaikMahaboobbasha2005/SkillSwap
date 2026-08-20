const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const authMiddleware = require("../middleware/authMiddleware");
const { handlePortfolioUploadMiddleware } = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { updatePortfolioSchema } = require("../utils/portfolioValidation");

// Protected: Create portfolio item (multipart/form-data with media file)
router.post(
  "/",
  authMiddleware,
  handlePortfolioUploadMiddleware,
  portfolioController.createPortfolioItem
);

// Public: Get user's active portfolio items (supports optional ?type=image|video)
router.get("/user/:userId", portfolioController.getUserPortfolio);

// Public: Get single active portfolio item by ID
router.get("/:id", portfolioController.getPortfolioItemById);

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
