const MeetingSession = require("../models/MeetingSession");
const notificationService = require("../services/notificationService");

/**
 * Checks and processes upcoming meeting reminders with atomic duplicate prevention
 * @param {Object} io - Socket.io instance
 */
const checkMeetingReminders = async (io = null) => {
  try {
    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // 1. Process 15-Minute Reminders
    // Target: scheduled meetings starting within 15 minutes that haven't received the 15m reminder yet
    const upcomingMeetings = await MeetingSession.find({
      status: "scheduled",
      scheduledAt: { $lte: fifteenMinutesFromNow, $gte: tenMinutesAgo },
      reminded15m: false,
    }).populate("swap").populate("participants", "name profilePicture");

    for (const meeting of upcomingMeetings) {
      // Atomic update to guarantee idempotency and avoid duplicate reminders
      const updated = await MeetingSession.findOneAndUpdate(
        { _id: meeting._id, reminded15m: false, status: "scheduled" },
        { $set: { reminded15m: true } },
        { new: true }
      );

      if (!updated) continue; // Concurrency guard: already processed

      const participants = meeting.participants || [];
      if (participants.length >= 2) {
        const userA = participants[0];
        const userB = participants[1];

        const userAId = (userA._id || userA).toString();
        const userBId = (userB._id || userB).toString();
        const userAName = userA.name || "Swap Partner";
        const userBName = userB.name || "Swap Partner";

        // Notify User A about User B
        try {
          await notificationService.createNotification({
            user: userAId,
            sender: userBId,
            swap: meeting.swap?._id || meeting.swap,
            type: "meeting_reminder",
            title: "Upcoming Video Session",
            message: `Your learning session with ${userBName} starts in 15 minutes.`,
          });
        } catch (err) {
          console.warn(`[ReminderJob] Failed to create 15m notification for user ${userAId}:`, err.message);
        }

        // Notify User B about User A
        try {
          await notificationService.createNotification({
            user: userBId,
            sender: userAId,
            swap: meeting.swap?._id || meeting.swap,
            type: "meeting_reminder",
            title: "Upcoming Video Session",
            message: `Your learning session with ${userAName} starts in 15 minutes.`,
          });
        } catch (err) {
          console.warn(`[ReminderJob] Failed to create 15m notification for user ${userBId}:`, err.message);
        }

        // Socket.io alerts
        if (io) {
          io.to(`user:${userAId}`).emit("notification", {
            type: "meeting_reminder",
            title: "Upcoming Video Session",
            swapId: (meeting.swap?._id || meeting.swap).toString(),
          });
          io.to(`user:${userBId}`).emit("notification", {
            type: "meeting_reminder",
            title: "Upcoming Video Session",
            swapId: (meeting.swap?._id || meeting.swap).toString(),
          });
        }
      }
    }

    // 2. Process Start-Time Reminders / Auto-Activation
    // Target: scheduled meetings whose start time has arrived (within last 15 minutes window)
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const startingMeetings = await MeetingSession.find({
      status: "scheduled",
      scheduledAt: { $lte: now, $gte: fifteenMinutesAgo },
      remindedStart: false,
    }).populate("swap").populate("participants", "name profilePicture");

    for (const meeting of startingMeetings) {
      // Atomically transition status to active and mark remindedStart: true
      const updated = await MeetingSession.findOneAndUpdate(
        { _id: meeting._id, remindedStart: false, status: "scheduled" },
        { $set: { remindedStart: true, status: "active" } },
        { new: true }
      );

      if (!updated) continue;

      const participants = meeting.participants || [];
      if (participants.length >= 2) {
        const userA = participants[0];
        const userB = participants[1];

        const userAId = (userA._id || userA).toString();
        const userBId = (userB._id || userB).toString();
        const userAName = userA.name || "Swap Partner";
        const userBName = userB.name || "Swap Partner";

        // Notify User A
        try {
          await notificationService.createNotification({
            user: userAId,
            sender: userBId,
            swap: meeting.swap?._id || meeting.swap,
            type: "meeting_started",
            title: "Video Session Starting",
            message: `Your learning session with ${userBName} is starting now. Click to join!`,
          });
        } catch (err) {
          console.warn(`[ReminderJob] Failed to create start notification for user ${userAId}:`, err.message);
        }

        // Notify User B
        try {
          await notificationService.createNotification({
            user: userBId,
            sender: userAId,
            swap: meeting.swap?._id || meeting.swap,
            type: "meeting_started",
            title: "Video Session Starting",
            message: `Your learning session with ${userAName} is starting now. Click to join!`,
          });
        } catch (err) {
          console.warn(`[ReminderJob] Failed to create start notification for user ${userBId}:`, err.message);
        }

        // Socket.io alerts & chat meeting card status update to active
        if (io) {
          const swapIdStr = (meeting.swap?._id || meeting.swap).toString();
          io.to(`swap:${swapIdStr}`).emit("meeting_updated", {
            meetingId: meeting._id.toString(),
            status: "active",
            swapId: swapIdStr,
          });

          io.to(`user:${userAId}`).emit("notification", {
            type: "meeting_started",
            title: "Video Session Starting",
            swapId: swapIdStr,
          });
          io.to(`user:${userBId}`).emit("notification", {
            type: "meeting_started",
            title: "Video Session Starting",
            swapId: swapIdStr,
          });
        }
      }
    }
  } catch (error) {
    console.error("[ReminderJob] Error checking meeting reminders:", error.message);
  }
};

/**
 * Initializes recurring background reminder job
 * @param {Object} io - Socket.io instance
 * @param {number} intervalMs - Poll interval in milliseconds (default 30 seconds)
 * @returns {NodeJS.Timeout}
 */
const initMeetingReminderJob = (io = null, intervalMs = 30000) => {
  // Run once immediately upon start
  checkMeetingReminders(io);

  // Set periodic timer
  const timer = setInterval(() => {
    checkMeetingReminders(io);
  }, intervalMs);

  return timer;
};

module.exports = {
  checkMeetingReminders,
  initMeetingReminderJob,
};
