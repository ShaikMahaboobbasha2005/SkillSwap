const express = require("express");
const router = express.Router();
const swapController = require("../controllers/swapController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { createSwapRequestSchema } = require("../utils/swapValidation");

// Protected Swap Request Routes
router.post(
  "/",
  authMiddleware,
  validateRequest(createSwapRequestSchema),
  swapController.createSwapRequest
);

router.get("/", authMiddleware, swapController.getSwapRequests);
router.get("/incoming", authMiddleware, swapController.getIncomingSwapRequests);
router.get("/outgoing", authMiddleware, swapController.getOutgoingSwapRequests);
router.get("/history", authMiddleware, swapController.getSwapHistory);
router.get("/stats", authMiddleware, swapController.getSwapStats);
router.get("/:id", authMiddleware, swapController.getSwapRequestById);

router.patch("/:id/accept", authMiddleware, swapController.acceptSwapRequest);
router.patch("/:id/reject", authMiddleware, swapController.rejectSwapRequest);
router.patch("/:id/cancel", authMiddleware, swapController.cancelSwapRequest);
router.patch("/:id/complete", authMiddleware, swapController.completeSwapRequest);
router.patch("/:id/request-completion", authMiddleware, swapController.requestCompletion);
router.patch("/:id/confirm-completion", authMiddleware, swapController.confirmCompletion);
router.patch("/:id/cancel-completion-request", authMiddleware, swapController.cancelCompletionRequest);
router.patch("/:id/leave", authMiddleware, swapController.leaveSwapRequest);

module.exports = router;
