const mongoose = require("mongoose");
const MeetingSession = require("../models/MeetingSession");
const Message = require("../models/Message");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");
const notificationService = require("./notificationService");

const SENDER_POPULATE_FIELDS = "name profilePicture";
const USER_POPULATE_FIELDS = "name profilePicture location";
const SKILL_POPULATE_FIELDS = "name category level type status";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Generates a unique, collision-resistant deterministic room name for Jitsi Meet
 * @param {string} swapId
 * @param {string} meetingId
 * @returns {string}
 */
const generateRoomName = (swapId, meetingId) => {
  const sId = swapId ? swapId.toString().slice(-6) : "swap";
  const mId = meetingId ? meetingId.toString().slice(-6) : "meet";
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `skillswap-${sId}-${mId}-${randomSuffix}`;
};

/**
 * Validates swap participation and ensures the swap is accepted
 * @param {string|mongoose.Types.ObjectId} swapId
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<Object>}
 */
const verifyAcceptedSwapParticipant = async (swapId, userId) => {
  if (!swapId || !isValidObjectId(swapId)) {
    const error = new Error("Invalid swap request ID format.");
    error.statusCode = 400;
    error.code = "INVALID_SWAP_ID";
    throw error;
  }

  const swap = await SwapRequest.findById(swapId)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS);

  if (!swap) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    error.code = "SWAP_NOT_FOUND";
    throw error;
  }

  const fromUserId = (swap.fromUser?._id || swap.fromUser)?.toString();
  const toUserId = (swap.toUser?._id || swap.toUser)?.toString();
  const reqUserId = userId.toString();

  const isSender = fromUserId === reqUserId;
  const isReceiver = toUserId === reqUserId;

  if (!isSender && !isReceiver) {
    const error = new Error("Access denied. You are not a participant in this swap request.");
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  if (swap.status !== "accepted") {
    const error = new Error(
      `Video meetings require an accepted swap relationship. Current status is '${swap.status}'.`
    );
    error.statusCode = 403;
    error.code = "SWAP_NOT_ACCEPTED";
    throw error;
  }

  return swap;
};

/**
 * Creates an instant video meeting session
 * @param {Object} params - { swapId, userId, io }
 * @returns {Promise<Object>}
 */
const createInstantMeeting = async ({ swapId, userId, io = null }) => {
  const swap = await verifyAcceptedSwapParticipant(swapId, userId);

  const fromUserId = (swap.fromUser?._id || swap.fromUser).toString();
  const toUserId = (swap.toUser?._id || swap.toUser).toString();
  const partnerId = fromUserId === userId.toString() ? toUserId : fromUserId;

  const meetingId = new mongoose.Types.ObjectId();
  const roomName = generateRoomName(swapId, meetingId);

  const meeting = await MeetingSession.create({
    _id: meetingId,
    swap: swap._id,
    participants: [fromUserId, toUserId],
    createdBy: userId,
    roomName,
    scheduledAt: new Date(),
    duration: 30,
    status: "active",
    type: "instant",
    note: "Instant Video Session",
  });

  // Create a meeting message in the chat
  const message = await Message.create({
    swapRequest: swap._id,
    sender: userId,
    content: "📹 Started an instant video meeting session",
    type: "meeting",
    meetingSession: meeting._id,
    status: "sent",
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", SENDER_POPULATE_FIELDS)
    .populate("meetingSession")
    .lean();

  // Real-time broadcast if socket.io is available
  if (io) {
    io.to(`swap:${swap._id}`).emit("new_message", {
      message: populatedMessage,
      swapId: swap._id.toString(),
    });

    // Notify the partner in their personal room
    io.to(`user:${partnerId}`).emit("meeting_created", {
      type: "instant",
      meeting,
      swapId: swap._id.toString(),
      senderName: swap.fromUser?._id?.toString() === userId.toString() ? swap.fromUser.name : swap.toUser?.name,
    });
  }

  return {
    meeting,
    message: populatedMessage,
  };
};

/**
 * Schedules a future video meeting session
 * @param {Object} params - { swapId, scheduledAt, duration, note, userId, io }
 * @returns {Promise<Object>}
 */
const scheduleMeeting = async ({ swapId, scheduledAt, duration = 30, note = "", userId, io = null }) => {
  const swap = await verifyAcceptedSwapParticipant(swapId, userId);

  if (!scheduledAt) {
    const error = new Error("Scheduled date and time are required.");
    error.statusCode = 400;
    error.code = "INVALID_SCHEDULE_DATE";
    throw error;
  }

  const scheduledDate = new Date(scheduledAt);
  if (isNaN(scheduledDate.getTime())) {
    const error = new Error("Invalid date format for scheduledAt.");
    error.statusCode = 400;
    error.code = "INVALID_DATE_FORMAT";
    throw error;
  }

  // Allow scheduling if within 2 minutes in past or in future
  if (scheduledDate.getTime() < Date.now() - 2 * 60 * 1000) {
    const error = new Error("Scheduled time cannot be in the past.");
    error.statusCode = 400;
    error.code = "PAST_DATE_NOT_ALLOWED";
    throw error;
  }

  const sanitizedDuration = Math.max(15, Math.min(120, parseInt(duration, 10) || 30));
  const sanitizedNote = (note || "").trim().slice(0, 300);

  const fromUserId = (swap.fromUser?._id || swap.fromUser).toString();
  const toUserId = (swap.toUser?._id || swap.toUser).toString();
  const partnerId = fromUserId === userId.toString() ? toUserId : fromUserId;

  const meetingId = new mongoose.Types.ObjectId();
  const roomName = generateRoomName(swapId, meetingId);

  const meeting = await MeetingSession.create({
    _id: meetingId,
    swap: swap._id,
    participants: [fromUserId, toUserId],
    createdBy: userId,
    roomName,
    scheduledAt: scheduledDate,
    duration: sanitizedDuration,
    status: "scheduled",
    type: "scheduled",
    note: sanitizedNote,
  });

  const creator = fromUserId === userId.toString() ? swap.fromUser : swap.toUser;
  const creatorName = creator?.name || "Swap Partner";

  // Create a chat message card for the scheduled meeting
  const messageContent = sanitizedNote
    ? `📹 Video Session Scheduled: "${sanitizedNote}"`
    : `📹 Video Session Scheduled for ${scheduledDate.toLocaleDateString()}`;

  const message = await Message.create({
    swapRequest: swap._id,
    sender: userId,
    content: messageContent,
    type: "meeting",
    meetingSession: meeting._id,
    status: "sent",
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", SENDER_POPULATE_FIELDS)
    .populate("meetingSession")
    .lean();

  // Create In-App Notification for the partner
  try {
    const formattedTime = scheduledDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const formattedDate = scheduledDate.toLocaleDateString([], { month: "short", day: "numeric" });
    await notificationService.createNotification({
      user: partnerId,
      sender: userId,
      swap: swap._id,
      type: "meeting_scheduled",
      title: "Video Session Scheduled",
      message: `${creatorName} scheduled a video session for ${formattedDate} at ${formattedTime}.`,
    });
  } catch (err) {
    console.warn("Failed to create scheduled meeting notification:", err.message);
  }

  // Real-time broadcast
  if (io) {
    io.to(`swap:${swap._id}`).emit("new_message", {
      message: populatedMessage,
      swapId: swap._id.toString(),
    });

    io.to(`user:${partnerId}`).emit("notification", {
      type: "meeting_scheduled",
      title: "Video Session Scheduled",
      swapId: swap._id.toString(),
    });
  }

  return {
    meeting,
    message: populatedMessage,
  };
};

/**
 * Gets meeting details by ID (verifying participant access)
 * @param {string|mongoose.Types.ObjectId} meetingId
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<Object>}
 */
const getMeetingById = async (meetingId, userId) => {
  if (!meetingId || !isValidObjectId(meetingId)) {
    const error = new Error("Invalid meeting ID format.");
    error.statusCode = 400;
    error.code = "INVALID_MEETING_ID";
    throw error;
  }

  const meeting = await MeetingSession.findById(meetingId)
    .populate("swap")
    .populate("participants", USER_POPULATE_FIELDS)
    .populate("createdBy", USER_POPULATE_FIELDS);

  if (!meeting) {
    const error = new Error("Meeting session not found.");
    error.statusCode = 404;
    error.code = "MEETING_NOT_FOUND";
    throw error;
  }

  const isParticipant = meeting.participants.some(
    (p) => (p._id || p).toString() === userId.toString()
  );

  if (!isParticipant) {
    const error = new Error("Access denied. You are not a participant in this meeting session.");
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  return meeting;
};

/**
 * Validates authorization to join a meeting session
 * @param {string|mongoose.Types.ObjectId} meetingId
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<Object>}
 */
const joinMeeting = async (meetingId, userId) => {
  const meeting = await getMeetingById(meetingId, userId);

  if (meeting.status === "cancelled") {
    const error = new Error("This meeting session has been cancelled.");
    error.statusCode = 400;
    error.code = "MEETING_CANCELLED";
    throw error;
  }

  // If status is scheduled, update to active upon joining
  if (meeting.status === "scheduled") {
    meeting.status = "active";
    await meeting.save();
  }

  const user = await User.findById(userId).select("name profilePicture email").lean();

  return {
    meetingId: meeting._id,
    swapId: meeting.swap?._id || meeting.swap,
    roomName: meeting.roomName,
    jitsiDomain: "meet.jit.si",
    status: meeting.status,
    type: meeting.type,
    duration: meeting.duration,
    note: meeting.note,
    scheduledAt: meeting.scheduledAt,
    user: {
      id: userId,
      name: user?.name || "Participant",
      profilePicture: user?.profilePicture || "",
    },
  };
};

/**
 * Cancels a scheduled or active meeting session
 * @param {string|mongoose.Types.ObjectId} meetingId
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {Object} io
 * @returns {Promise<Object>}
 */
const cancelMeeting = async (meetingId, userId, io = null) => {
  const meeting = await getMeetingById(meetingId, userId);

  if (meeting.status === "cancelled") {
    return meeting;
  }

  meeting.status = "cancelled";
  await meeting.save();

  const otherParticipantId = meeting.participants
    .map((p) => (p._id || p).toString())
    .find((id) => id !== userId.toString());

  // Notify other participant
  if (otherParticipantId) {
    try {
      const canceller = await User.findById(userId).select("name").lean();
      await notificationService.createNotification({
        user: otherParticipantId,
        sender: userId,
        swap: meeting.swap?._id || meeting.swap,
        type: "meeting_cancelled",
        title: "Video Session Cancelled",
        message: `${canceller?.name || "Your partner"} cancelled the video session.`,
      });
    } catch (err) {
      console.warn("Failed to create cancellation notification:", err.message);
    }
  }

  // Real-time socket broadcast
  if (io) {
    const swapIdStr = (meeting.swap?._id || meeting.swap).toString();
    io.to(`swap:${swapIdStr}`).emit("meeting_updated", {
      meetingId: meeting._id.toString(),
      status: "cancelled",
      swapId: swapIdStr,
    });

    if (otherParticipantId) {
      io.to(`user:${otherParticipantId}`).emit("notification", {
        type: "meeting_cancelled",
        title: "Video Session Cancelled",
        swapId: swapIdStr,
      });
    }
  }

  return meeting;
};

module.exports = {
  generateRoomName,
  verifyAcceptedSwapParticipant,
  createInstantMeeting,
  scheduleMeeting,
  getMeetingById,
  joinMeeting,
  cancelMeeting,
};
