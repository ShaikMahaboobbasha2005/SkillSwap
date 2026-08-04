const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");
const Skill = require("../models/Skill");

const USER_POPULATE_FIELDS = "name email profilePicture profileBanner location avgRating completedSwaps";
const SKILL_POPULATE_FIELDS = "name category level type status description yearsOfExperience";

const createSwapRequest = async (fromUserId, data) => {
  const { toUser: toUserId, offeredSkill: offeredSkillId, wantedSkill: wantedSkillId, message } = data;

  // 1. Self-request prevention
  if (fromUserId.toString() === toUserId.toString()) {
    const error = new Error("You cannot send a swap request to yourself.");
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate target user existence
  const targetUser = await User.findById(toUserId);
  if (!targetUser) {
    const error = new Error("Target user not found.");
    error.statusCode = 404;
    throw error;
  }

  // 3. Validate skill existence
  const offeredSkill = await Skill.findById(offeredSkillId);
  if (!offeredSkill) {
    const error = new Error("Offered skill not found.");
    error.statusCode = 404;
    throw error;
  }

  const wantedSkill = await Skill.findById(wantedSkillId);
  if (!wantedSkill) {
    const error = new Error("Wanted skill not found.");
    error.statusCode = 404;
    throw error;
  }

  // 4. Validate skill active status
  if (offeredSkill.status !== "Active") {
    const error = new Error("Offered skill is inactive.");
    error.statusCode = 400;
    throw error;
  }

  if (wantedSkill.status !== "Active") {
    const error = new Error("Wanted skill is inactive.");
    error.statusCode = 400;
    throw error;
  }

  // 5. Validate skill ownership & type
  if (offeredSkill.owner.toString() !== fromUserId.toString()) {
    const error = new Error("Offered skill must belong to you.");
    error.statusCode = 400;
    throw error;
  }

  if (wantedSkill.owner.toString() !== toUserId.toString()) {
    const error = new Error("Wanted skill must belong to the target user.");
    error.statusCode = 400;
    throw error;
  }

  if (offeredSkill.type && offeredSkill.type !== "Offer") {
    const error = new Error("Offered skill must be a skill you offer.");
    error.statusCode = 400;
    throw error;
  }

  if (wantedSkill.type && wantedSkill.type !== "Offer") {
    const error = new Error("Requested skill must be a skill the target user offers.");
    error.statusCode = 400;
    throw error;
  }

  // 6. Skill-pair duplicate request prevention (pending or accepted, in either direction)
  const existingRequest = await SwapRequest.findOne({
    $or: [
      {
        fromUser: fromUserId,
        toUser: toUserId,
        offeredSkill: offeredSkillId,
        wantedSkill: wantedSkillId,
      },
      {
        fromUser: toUserId,
        toUser: fromUserId,
        offeredSkill: wantedSkillId,
        wantedSkill: offeredSkillId,
      },
    ],
    status: { $in: ["pending", "accepted"] },
  });

  if (existingRequest) {
    const isAccepted = existingRequest.status === "accepted";
    const error = new Error(
      isAccepted
        ? "You already have an active swap for these skills."
        : "You already have a pending swap request for these skills."
    );
    error.statusCode = 409;
    throw error;
  }

  // Create new swap request
  const newRequest = new SwapRequest({
    fromUser: fromUserId,
    toUser: toUserId,
    offeredSkill: offeredSkillId,
    wantedSkill: wantedSkillId,
    message: message || "",
    status: "pending",
  });

  await newRequest.save();

  return await SwapRequest.findById(newRequest._id)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS);
};

const getSwapRequests = async (userId, queryParams = {}) => {
  const {
    type = "all",
    status,
    page = 1,
    limit = 10,
  } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  if (type === "incoming") {
    filter.toUser = userId;
  } else if (type === "outgoing") {
    filter.fromUser = userId;
  } else {
    filter.$or = [{ fromUser: userId }, { toUser: userId }];
  }

  if (status) {
    filter.status = status;
  }

  const [swapRequests, total] = await Promise.all([
    SwapRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("fromUser", USER_POPULATE_FIELDS)
      .populate("toUser", USER_POPULATE_FIELDS)
      .populate("offeredSkill", SKILL_POPULATE_FIELDS)
      .populate("wantedSkill", SKILL_POPULATE_FIELDS),
    SwapRequest.countDocuments(filter),
  ]);

  return {
    swapRequests,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

const getSwapRequestById = async (swapId, userId) => {
  const swapRequest = await SwapRequest.findById(swapId)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS);

  if (!swapRequest) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    throw error;
  }

  const isSender = swapRequest.fromUser._id.toString() === userId.toString();
  const isReceiver = swapRequest.toUser._id.toString() === userId.toString();

  if (!isSender && !isReceiver) {
    const error = new Error("Access denied. You are not a participant in this swap request.");
    error.statusCode = 403;
    throw error;
  }

  return swapRequest;
};

const acceptSwapRequest = async (swapId, userId) => {
  const swapRequest = await SwapRequest.findById(swapId);

  if (!swapRequest) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    throw error;
  }

  // Permission check: Only receiver (toUser) can accept
  if (swapRequest.toUser.toString() !== userId.toString()) {
    const error = new Error("Only the recipient can accept a swap request.");
    error.statusCode = 403;
    throw error;
  }

  // Status check: Must be pending
  if (swapRequest.status !== "pending") {
    const error = new Error("Only pending swap requests can be accepted.");
    error.statusCode = 400;
    throw error;
  }

  // Re-validate skills before accept
  const offeredSkill = await Skill.findById(swapRequest.offeredSkill);
  const wantedSkill = await Skill.findById(swapRequest.wantedSkill);

  if (!offeredSkill || offeredSkill.status !== "Active" || !wantedSkill || wantedSkill.status !== "Active") {
    const error = new Error(
      "Cannot accept swap request because one or both skills are no longer active or have been deleted."
    );
    error.statusCode = 400;
    throw error;
  }

  swapRequest.status = "accepted";
  await swapRequest.save();

  // TODO (Phase 7): Initialize Socket.io chat room creation for accepted swap request

  return await SwapRequest.findById(swapRequest._id)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS);
};

const rejectSwapRequest = async (swapId, userId) => {
  const swapRequest = await SwapRequest.findById(swapId);

  if (!swapRequest) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    throw error;
  }

  // Permission check: Only receiver (toUser) can reject
  if (swapRequest.toUser.toString() !== userId.toString()) {
    const error = new Error("Only the recipient can reject a swap request.");
    error.statusCode = 403;
    throw error;
  }

  // Status check: Must be pending
  if (swapRequest.status !== "pending") {
    const error = new Error("Only pending swap requests can be rejected.");
    error.statusCode = 400;
    throw error;
  }

  swapRequest.status = "rejected";
  await swapRequest.save();

  return await SwapRequest.findById(swapRequest._id)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS);
};

const cancelSwapRequest = async (swapId, userId) => {
  const swapRequest = await SwapRequest.findById(swapId);

  if (!swapRequest) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    throw error;
  }

  // Permission check: Only sender (fromUser) can cancel
  if (swapRequest.fromUser.toString() !== userId.toString()) {
    const error = new Error("Only the sender can cancel a swap request.");
    error.statusCode = 403;
    throw error;
  }

  // Status check: Must be pending
  if (swapRequest.status !== "pending") {
    const error = new Error("Only pending swap requests can be cancelled.");
    error.statusCode = 400;
    throw error;
  }

  // Soft Cancellation: Change status to cancelled (never delete document)
  swapRequest.status = "cancelled";
  await swapRequest.save();

  return await SwapRequest.findById(swapRequest._id)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS);
};

const getSwapStats = async (userId) => {
  const [
    pendingIncoming,
    pendingOutgoing,
    acceptedIncoming,
    acceptedOutgoing,
    rejectedIncoming,
    rejectedOutgoing,
    cancelledIncoming,
    cancelledOutgoing,
    totalIncoming,
    totalOutgoing,
  ] = await Promise.all([
    SwapRequest.countDocuments({ toUser: userId, status: "pending" }),
    SwapRequest.countDocuments({ fromUser: userId, status: "pending" }),
    SwapRequest.countDocuments({ toUser: userId, status: "accepted" }),
    SwapRequest.countDocuments({ fromUser: userId, status: "accepted" }),
    SwapRequest.countDocuments({ toUser: userId, status: "rejected" }),
    SwapRequest.countDocuments({ fromUser: userId, status: "rejected" }),
    SwapRequest.countDocuments({ toUser: userId, status: "cancelled" }),
    SwapRequest.countDocuments({ fromUser: userId, status: "cancelled" }),
    SwapRequest.countDocuments({ toUser: userId }),
    SwapRequest.countDocuments({ fromUser: userId }),
  ]);

  const accepted = acceptedIncoming + acceptedOutgoing;
  const rejected = rejectedIncoming + rejectedOutgoing;
  const cancelled = cancelledIncoming + cancelledOutgoing;

  return {
    pendingIncoming,
    pendingOutgoing,
    accepted,
    rejected,
    cancelled,
    totalIncoming,
    totalOutgoing,

    // Tab-contextual breakdowns
    incoming: {
      pending: pendingIncoming,
      accepted: acceptedIncoming,
      rejected: rejectedIncoming,
      cancelled: cancelledIncoming,
      total: totalIncoming,
    },
    outgoing: {
      pending: pendingOutgoing,
      accepted: acceptedOutgoing,
      rejected: rejectedOutgoing,
      cancelled: cancelledOutgoing,
      total: totalOutgoing,
    },
  };
};

module.exports = {
  createSwapRequest,
  getSwapRequests,
  getSwapRequestById,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  getSwapStats,
};
