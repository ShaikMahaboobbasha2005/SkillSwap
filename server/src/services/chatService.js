const Message = require("../models/Message");
const SwapRequest = require("../models/SwapRequest");
const { isValidObjectId } = require("../utils/chatValidation");

const SENDER_POPULATE_FIELDS = "name profilePicture";
const USER_POPULATE_FIELDS = "name profilePicture location";
const SKILL_POPULATE_FIELDS = "name category level type status";

const validateSwapId = (swapId) => {
  if (!isValidObjectId(swapId)) {
    const error = new Error("Invalid swap request ID format.");
    error.statusCode = 400;
    error.code = "INVALID_SWAP_ID";
    throw error;
  }
};

const verifyAcceptedSwapParticipant = async (swapId, userId) => {
  validateSwapId(swapId);

  const swapRequest = await SwapRequest.findById(swapId);
  if (!swapRequest) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    error.code = "SWAP_NOT_FOUND";
    throw error;
  }

  if (swapRequest.status !== "accepted") {
    const error = new Error("Chat is only available for accepted swap requests.");
    error.statusCode = 403;
    error.code = "SWAP_NOT_ACCEPTED";
    throw error;
  }

  const isSender = swapRequest.fromUser.toString() === userId.toString();
  const isReceiver = swapRequest.toUser.toString() === userId.toString();

  if (!isSender && !isReceiver) {
    const error = new Error("Access denied. You are not a participant in this swap request.");
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  return swapRequest;
};

const getMessagesBySwapId = async (swapId, userId, queryParams = {}) => {
  await verifyAcceptedSwapParticipant(swapId, userId);

  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(queryParams.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const total = await Message.countDocuments({ swapRequest: swapId });

  // Fetch most recent messages batch sorted desc, then reverse to chronological order
  const messagesDesc = await Message.find({ swapRequest: swapId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", SENDER_POPULATE_FIELDS)
    .lean();

  const messages = messagesDesc.reverse();

  return {
    messages,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const saveMessage = async ({ swapId, senderId, content, status = "sent" }) => {
  await verifyAcceptedSwapParticipant(swapId, senderId);

  const trimmedContent = (content || "").trim();
  if (!trimmedContent) {
    const error = new Error("Message content cannot be empty.");
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  if (trimmedContent.length > 2000) {
    const error = new Error("Message content cannot exceed 2000 characters.");
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const newMessage = new Message({
    swapRequest: swapId,
    sender: senderId,
    content: trimmedContent,
    status,
    deliveredAt: status === "delivered" ? new Date() : undefined,
  });

  await newMessage.save();

  return await Message.findById(newMessage._id)
    .populate("sender", SENDER_POPULATE_FIELDS)
    .lean();
};

const getConversations = async (userId) => {
  // Find all accepted swap requests involving the current user
  const acceptedSwaps = await SwapRequest.find({
    status: "accepted",
    $or: [{ fromUser: userId }, { toUser: userId }],
  })
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS)
    .lean();

  const conversations = await Promise.all(
    acceptedSwaps.map(async (swap) => {
      const isSender = swap.fromUser._id.toString() === userId.toString();
      const counterpart = isSender ? swap.toUser : swap.fromUser;

      const offeredSkillName = isSender ? swap.offeredSkill?.name : swap.wantedSkill?.name;
      const learnedSkillName = isSender ? swap.wantedSkill?.name : swap.offeredSkill?.name;

      // Fetch last message
      const lastMessage = await Message.findOne({ swapRequest: swap._id })
        .sort({ createdAt: -1 })
        .populate("sender", SENDER_POPULATE_FIELDS)
        .lean();

      // Count unread incoming messages for current user
      const unreadCount = await Message.countDocuments({
        swapRequest: swap._id,
        sender: { $ne: userId },
        status: { $ne: "read" },
      });

      const lastActivityAt = lastMessage
        ? lastMessage.createdAt
        : swap.updatedAt || swap.createdAt;

      return {
        swapId: swap._id,
        swap,
        counterpart,
        offeredSkillName,
        learnedSkillName,
        lastMessage,
        unreadCount,
        lastActivityAt,
      };
    })
  );

  // Sort by latest message/activity timestamp, newest first
  return conversations.sort(
    (a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt)
  );
};

const getTotalUnreadCount = async (userId) => {
  const acceptedSwaps = await SwapRequest.find({
    status: "accepted",
    $or: [{ fromUser: userId }, { toUser: userId }],
  }).select("_id");

  const swapIds = acceptedSwaps.map((s) => s._id);

  if (swapIds.length === 0) return 0;

  return await Message.countDocuments({
    swapRequest: { $in: swapIds },
    sender: { $ne: userId },
    status: { $ne: "read" },
  });
};

const markMessagesAsRead = async (swapId, userId) => {
  await verifyAcceptedSwapParticipant(swapId, userId);

  const now = new Date();
  await Message.updateMany(
    {
      swapRequest: swapId,
      sender: { $ne: userId },
      status: { $ne: "read" },
    },
    {
      $set: {
        status: "read",
        readAt: now,
      },
    }
  );

  const totalUnreadCount = await getTotalUnreadCount(userId);

  return {
    swapId,
    unreadCount: 0,
    totalUnreadCount,
    readAt: now,
  };
};

const markMessagesAsDeliveredForUser = async (userId) => {
  const acceptedSwaps = await SwapRequest.find({
    status: "accepted",
    $or: [{ fromUser: userId }, { toUser: userId }],
  }).select("_id");

  const swapIds = acceptedSwaps.map((s) => s._id);

  if (swapIds.length === 0) return { modifiedCount: 0 };

  const now = new Date();
  const result = await Message.updateMany(
    {
      swapRequest: { $in: swapIds },
      sender: { $ne: userId },
      status: "sent",
    },
    {
      $set: {
        status: "delivered",
        deliveredAt: now,
      },
    }
  );

  return { modifiedCount: result.modifiedCount, deliveredAt: now };
};

module.exports = {
  validateSwapId,
  verifyAcceptedSwapParticipant,
  getMessagesBySwapId,
  saveMessage,
  getConversations,
  getTotalUnreadCount,
  markMessagesAsRead,
  markMessagesAsDeliveredForUser,
};
