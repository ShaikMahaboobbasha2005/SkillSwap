const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");
const authMiddleware = require("../middleware/authMiddleware");

// All meeting routes require authenticated user
router.use(authMiddleware);

// POST /api/meetings/instant — Start instant meeting
router.post("/instant", meetingController.createInstantMeeting);

// POST /api/meetings — Schedule a session
router.post("/", meetingController.scheduleMeeting);

// GET /api/meetings/:id — Get meeting details
router.get("/:id", meetingController.getMeetingById);

// GET /api/meetings/:id/join — Join meeting (returns Jitsi config & verifies active status)
router.get("/:id/join", meetingController.joinMeeting);

// PATCH /api/meetings/:id/cancel — Cancel meeting
router.patch("/:id/cancel", meetingController.cancelMeeting);

module.exports = router;
