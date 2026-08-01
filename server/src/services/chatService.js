const Message = require("../models/Message");
const SwapRequest = require("../models/SwapRequest");
const { isValidObjectId } = require("../utils/chatValidation");

const SENDER_POPULATE_FIELDS = "name profilePicture";

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

const saveMessage = async ({ swapId, senderId, content }) => {
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
  });

  await newMessage.save();

  return await Message.findById(newMessage._id)
    .populate("sender", SENDER_POPULATE_FIELDS)
    .lean();
};

module.exports = {
  validateSwapId,
  verifyAcceptedSwapParticipant,
  getMessagesBySwapId,
  saveMessage,
};
