const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { handleUploadMiddleware } = require("../middleware/uploadMiddleware");
const { updateProfileSchema } = require("../utils/profileValidation");

// Protected Own Profile routes (/api/profile/me)
router.get("/me", authMiddleware, profileController.getMe);
router.put(
  "/me",
  authMiddleware,
  validateRequest(updateProfileSchema),
  profileController.updateMe
);
router.post(
  "/upload-image",
  authMiddleware,
  handleUploadMiddleware("image"),
  profileController.uploadImage
);

module.exports = router;
