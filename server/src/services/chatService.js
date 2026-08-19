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

const verifySwapParticipantForChat = async (swapId, userId, options = { requireActive: false }) => {
  validateSwapId(swapId);

  const swapRequest = await SwapRequest.findById(swapId)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS)
    .populate("leftBy", USER_POPULATE_FIELDS);

  if (!swapRequest) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    error.code = "SWAP_NOT_FOUND";
    throw error;
  }

  const isSender = swapRequest.fromUser._id.toString() === userId.toString();
  const isReceiver = swapRequest.toUser._id.toString() === userId.toString();

  if (!isSender && !isReceiver) {
    const error = new Error("Access denied. You are not a participant in this swap request.");
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  // Security Rule 6: Check if conversation has been deleted from history by current user
  if (
    Array.isArray(swapRequest.chatDeletedFor) &&
    swapRequest.chatDeletedFor.some((id) => id.toString() === userId.toString())
  ) {
    const error = new Error("Conversation removed from your history or not found.");
    error.statusCode = 404;
    error.code = "CHAT_DELETED";
    throw error;
  }

  const ALLOWED_READ_STATUSES = ["accepted", "completed", "left"];
  if (!ALLOWED_READ_STATUSES.includes(swapRequest.status)) {
    const error = new Error("Chat history is not available for this swap request status.");
    error.statusCode = 403;
    error.code = "SWAP_NOT_ACCEPTED";
    throw error;
  }

  // Backend write protection: Message posting requires active accepted status
  if (options.requireActive && swapRequest.status !== "accepted") {
    const error = new Error("This swap has ended and the conversation is now read-only.");
    error.statusCode = 403;
    error.code = "READ_ONLY";
    throw error;
  }

  return swapRequest;
};

const verifyAcceptedSwapParticipant = async (swapId, userId) => {
  return await verifySwapParticipantForChat(swapId, userId, { requireActive: true });
};

const getMessagesBySwapId = async (swapId, userId, queryParams = {}) => {
  const swapRequest = await verifySwapParticipantForChat(swapId, userId, { requireActive: false });

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
    .populate({
      path: "replyTo",
      select: "_id sender content isDeleted createdAt",
      populate: {
        path: "sender",
        select: SENDER_POPULATE_FIELDS,
      },
    })
    .lean();

  const messages = messagesDesc.reverse();

  return {
    messages,
    swapRequest,
    isReadOnly: swapRequest.status !== "accepted",
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const saveMessage = async ({ swapId, senderId, content, replyTo = null, status = "sent" }) => {
  await verifySwapParticipantForChat(swapId, senderId, { requireActive: true });

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

  let validReplyToId = null;
  if (replyTo) {
    const replyToIdStr = typeof replyTo === "object" ? replyTo._id || replyTo.id : replyTo;
    if (!isValidObjectId(replyToIdStr)) {
      const error = new Error("Invalid reply message ID format.");
      error.statusCode = 400;
      error.code = "INVALID_REPLY_MESSAGE_ID";
      throw error;
    }

    const replyMsg = await Message.findById(replyToIdStr);
    if (!replyMsg) {
      const error = new Error("Referenced reply message not found.");
      error.statusCode = 404;
      error.code = "REPLY_MESSAGE_NOT_FOUND";
      throw error;
    }

    // Strictly validate that referenced reply message belongs to the SAME swap conversation
    if (replyMsg.swapRequest.toString() !== swapId.toString()) {
      const error = new Error("Cannot reply to a message from a different swap conversation.");
      error.statusCode = 400;
      error.code = "SWAP_MISMATCH";
      throw error;
    }

    validReplyToId = replyMsg._id;
  }

  const newMessage = new Message({
    swapRequest: swapId,
    sender: senderId,
    content: trimmedContent,
    replyTo: validReplyToId,
    status,
    deliveredAt: status === "delivered" ? new Date() : undefined,
  });

  await newMessage.save();

  return await Message.findById(newMessage._id)
    .populate("sender", SENDER_POPULATE_FIELDS)
    .populate({
      path: "replyTo",
      select: "_id sender content isDeleted createdAt",
      populate: {
        path: "sender",
        select: SENDER_POPULATE_FIELDS,
      },
    })
    .lean();
};

const getConversations = async (userId) => {
  // Find all active accepted swap requests where user has not deleted chat from history
  const acceptedSwaps = await SwapRequest.find({
    status: "accepted",
    $or: [{ fromUser: userId }, { toUser: userId }],
    chatDeletedFor: { $ne: userId },
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
        .populate({
          path: "replyTo",
          select: "_id sender content isDeleted createdAt",
          populate: {
            path: "sender",
            select: SENDER_POPULATE_FIELDS,
          },
        })
        .lean();

      // Count unread incoming messages for current user (excluding soft-deleted messages)
      const unreadCount = await Message.countDocuments({
        swapRequest: swap._id,
        sender: { $ne: userId },
        status: { $ne: "read" },
        isDeleted: { $ne: true },
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

const getUnreadConversationCount = async (userId) => {
  const acceptedSwaps = await SwapRequest.find({
    status: "accepted",
    $or: [{ fromUser: userId }, { toUser: userId }],
    chatDeletedFor: { $ne: userId },
  }).select("_id");

  const swapIds = acceptedSwaps.map((s) => s._id);

  if (swapIds.length === 0) return 0;

  const unreadSwapIds = await Message.distinct("swapRequest", {
    swapRequest: { $in: swapIds },
    sender: { $ne: userId },
    status: { $ne: "read" },
    isDeleted: { $ne: true },
  });

  return unreadSwapIds.length;
};

const getUnreadCounts = async (userId) => {
  const acceptedSwaps = await SwapRequest.find({
    status: "accepted",
    $or: [{ fromUser: userId }, { toUser: userId }],
    chatDeletedFor: { $ne: userId },
  }).select("_id");

  const swapIds = acceptedSwaps.map((s) => s._id);

  if (swapIds.length === 0) {
    return { unreadConversationCount: 0, totalUnreadMessageCount: 0 };
  }

  const unreadSwapIds = await Message.distinct("swapRequest", {
    swapRequest: { $in: swapIds },
    sender: { $ne: userId },
    status: { $ne: "read" },
    isDeleted: { $ne: true },
  });

  const totalUnreadMessageCount = await Message.countDocuments({
    swapRequest: { $in: swapIds },
    sender: { $ne: userId },
    status: { $ne: "read" },
    isDeleted: { $ne: true },
  });

  return {
    unreadConversationCount: unreadSwapIds.length,
    totalUnreadMessageCount,
  };
};

const getTotalUnreadCount = async (userId) => {
  const counts = await getUnreadCounts(userId);
  return counts.unreadConversationCount;
};

const markMessagesAsRead = async (swapId, userId, messageIds = null) => {
  await verifyAcceptedSwapParticipant(swapId, userId);

  let targetMessageIds = [];
  const now = new Date();

  if (Array.isArray(messageIds) && messageIds.length > 0) {
    const validIds = messageIds.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
      const remainingUnread = await Message.countDocuments({
        swapRequest: swapId,
        sender: { $ne: userId },
        status: { $ne: "read" },
        isDeleted: { $ne: true },
      });
      const unreadCounts = await getUnreadCounts(userId);
      return {
        swapId,
        unreadCount: remainingUnread,
        unreadConversationCount: unreadCounts.unreadConversationCount,
        totalUnreadMessageCount: unreadCounts.totalUnreadMessageCount,
        totalUnreadCount: unreadCounts.unreadConversationCount,
        readAt: now,
        messageIds: [],
      };
    }

    // Find all matching incoming non-deleted messages in this swap for the provided message IDs
    const matchedMsgs = await Message.find({
      _id: { $in: validIds },
      swapRequest: swapId,
      sender: { $ne: userId },
      isDeleted: { $ne: true },
    })
      .select("_id status")
      .lean();

    targetMessageIds = matchedMsgs.map((m) => m._id.toString());

    // Filter messages that need DB update to 'read'
    const unreadIds = matchedMsgs
      .filter((m) => m.status !== "read")
      .map((m) => m._id);

    if (unreadIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadIds } },
        {
          $set: {
            status: "read",
            readAt: now,
          },
        }
      );
    }
  } else {
    // If no messageIds specified, target all incoming unread non-deleted messages in swap
    const filter = {
      swapRequest: swapId,
      sender: { $ne: userId },
      status: { $ne: "read" },
      isDeleted: { $ne: true },
    };

    const targetMessages = await Message.find(filter).select("_id").lean();
    targetMessageIds = targetMessages.map((m) => m._id.toString());

    if (targetMessageIds.length > 0) {
      await Message.updateMany(filter, {
        $set: {
          status: "read",
          readAt: now,
        },
      });
    }
  }

  const remainingUnreadInSwap = await Message.countDocuments({
    swapRequest: swapId,
    sender: { $ne: userId },
    status: { $ne: "read" },
    isDeleted: { $ne: true },
  });

  const unreadCounts = await getUnreadCounts(userId);

  return {
    swapId,
    unreadCount: remainingUnreadInSwap,
    unreadConversationCount: unreadCounts.unreadConversationCount,
    totalUnreadMessageCount: unreadCounts.totalUnreadMessageCount,
    totalUnreadCount: unreadCounts.unreadConversationCount,
    readAt: now,
    messageIds: targetMessageIds,
  };
};

const deleteMessage = async (swapId, messageId, userId) => {
  if (!isValidObjectId(messageId)) {
    const error = new Error("Invalid message ID format.");
    error.statusCode = 400;
    error.code = "INVALID_MESSAGE_ID";
    throw error;
  }

  const swapRequest = await verifyAcceptedSwapParticipant(swapId, userId);

  const message = await Message.findById(messageId);
  if (!message) {
    const error = new Error("Message not found.");
    error.statusCode = 404;
    error.code = "MESSAGE_NOT_FOUND";
    throw error;
  }

  // Strictly validate message belongs to swapId from route
  if (message.swapRequest.toString() !== swapId.toString()) {
    const error = new Error("Message does not belong to the specified swap request.");
    error.statusCode = 400;
    error.code = "SWAP_MISMATCH";
    throw error;
  }

  // Strictly validate user is the original sender
  if (message.sender.toString() !== userId.toString()) {
    const error = new Error("Access denied. You can only delete your own messages.");
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  const recipientId =
    swapRequest.fromUser.toString() === userId.toString()
      ? swapRequest.toUser.toString()
      : swapRequest.fromUser.toString();

  // Idempotent handling if already deleted
  if (message.isDeleted) {
    return {
      messageId: message._id.toString(),
      swapId: swapId.toString(),
      senderId: userId.toString(),
      recipientId,
      isDeleted: true,
      deletedAt: message.deletedAt,
      wasUnread: false,
      recipientUnreadCounts: null,
    };
  }

  const wasUnread = message.status !== "read";

  // Perform soft deletion in DB
  message.isDeleted = true;
  message.deletedAt = new Date();
  message.content = "";
  await message.save();

  let recipientUnreadCounts = null;
  if (wasUnread) {
    recipientUnreadCounts = await getUnreadCounts(recipientId);
  }

  return {
    messageId: message._id.toString(),
    swapId: swapId.toString(),
    senderId: userId.toString(),
    recipientId,
    isDeleted: true,
    deletedAt: message.deletedAt,
    wasUnread,
    recipientUnreadCounts,
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
      isDeleted: { $ne: true },
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

const deleteChatHistoryForUser = async (swapId, userId) => {
  validateSwapId(swapId);

  const swapRequest = await SwapRequest.findById(swapId);
  if (!swapRequest) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    error.code = "SWAP_NOT_FOUND";
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

  // Security Rule 6: Per-user history deletion is only allowed for archived/ended swaps
  const ARCHIVED_STATUSES = ["completed", "left", "cancelled"];
  if (!ARCHIVED_STATUSES.includes(swapRequest.status)) {
    const error = new Error("Active chats cannot be deleted from history until the swap is completed or left.");
    error.statusCode = 400;
    error.code = "ACTIVE_CHAT_NOT_DELETABLE";
    throw error;
  }

  // Idempotent $addToSet: Adds userId to chatDeletedFor array without duplication
  await SwapRequest.findByIdAndUpdate(swapId, {
    $addToSet: { chatDeletedFor: userId },
  });

  return {
    success: true,
    message: "Conversation deleted from your history.",
    swapId,
  };
};

module.exports = {
  validateSwapId,
  verifyAcceptedSwapParticipant,
  verifySwapParticipantForChat,
  getMessagesBySwapId,
  saveMessage,
  getConversations,
  getUnreadConversationCount,
  getUnreadCounts,
  getTotalUnreadCount,
  markMessagesAsRead,
  deleteMessage,
  deleteChatHistoryForUser,
  markMessagesAsDeliveredForUser,
};
