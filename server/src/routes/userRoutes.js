const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { updateProfileSchema } = require("../utils/profileValidation");

// Protected own profile alias (/api/users/me)
router.get("/me", authMiddleware, profileController.getMe);
router.put(
  "/me",
  authMiddleware,
  validateRequest(updateProfileSchema),
  profileController.updateMe
);

// Public route to view user profile by ID (/api/users/:id)
router.get("/:id", profileController.getPublicProfile);

module.exports = router;
