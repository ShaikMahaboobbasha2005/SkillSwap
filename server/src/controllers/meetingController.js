const meetingService = require("../services/meetingService");

/**
 * POST /api/meetings/instant
 * Start an instant video meeting for an accepted swap
 */
const createInstantMeeting = async (req, res, next) => {
  try {
    const { swapId } = req.body;
    const userId = req.user.id;
    const io = req.app.get("io");

    const result = await meetingService.createInstantMeeting({
      swapId,
      userId,
      io,
    });

    return res.status(201).json({
      success: true,
      message: "Instant video meeting session started successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/meetings
 * Schedule a future video meeting for an accepted swap
 */
const scheduleMeeting = async (req, res, next) => {
  try {
    const { swapId, scheduledAt, duration, note } = req.body;
    const userId = req.user.id;
    const io = req.app.get("io");

    const result = await meetingService.scheduleMeeting({
      swapId,
      scheduledAt,
      duration,
      note,
      userId,
      io,
    });

    return res.status(201).json({
      success: true,
      message: "Video meeting session scheduled successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/meetings/:id
 * Get details for a specific meeting session
 */
const getMeetingById = async (req, res, next) => {
  try {
    const meetingId = req.params.id;
    const userId = req.user.id;

    const meeting = await meetingService.getMeetingById(meetingId, userId);

    return res.status(200).json({
      success: true,
      data: { meeting },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/meetings/:id/join
 * Get configuration & credentials to join a meeting session
 */
const joinMeeting = async (req, res, next) => {
  try {
    const meetingId = req.params.id;
    const userId = req.user.id;

    const joinData = await meetingService.joinMeeting(meetingId, userId);

    return res.status(200).json({
      success: true,
      message: "Access granted to join video meeting session.",
      data: joinData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/meetings/:id/cancel
 * Cancel a scheduled or active meeting session
 */
const cancelMeeting = async (req, res, next) => {
  try {
    const meetingId = req.params.id;
    const userId = req.user.id;
    const io = req.app.get("io");

    const meeting = await meetingService.cancelMeeting(meetingId, userId, io);

    return res.status(200).json({
      success: true,
      message: "Video meeting session cancelled successfully.",
      data: { meeting },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInstantMeeting,
  scheduleMeeting,
  getMeetingById,
  joinMeeting,
  cancelMeeting,
};
