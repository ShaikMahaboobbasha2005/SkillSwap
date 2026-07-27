const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { signupSchema, loginSchema } = require("../utils/authValidation");

// Public routes
router.post("/signup", validateRequest(signupSchema), authController.signup);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/logout", authController.logout);

// Protected routes
router.get("/me", authMiddleware, authController.me);

module.exports = router;
