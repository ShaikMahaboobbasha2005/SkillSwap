const mongoose = require("mongoose");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");
const Skill = require("../models/Skill");
const notificationService = require("./notificationService");

const USER_POPULATE_FIELDS = "name email profilePicture profileBanner location avgRating completedSwaps";
const SKILL_POPULATE_FIELDS = "name category level type status description yearsOfExperience";

const validateSwapId = (swapId) => {
  if (!swapId || !mongoose.Types.ObjectId.isValid(swapId)) {
    const error = new Error("Invalid swap request ID format.");
    error.statusCode = 400;
    throw error;
  }
};

const formatSwapWithSnapshots = (swap) => {
  if (!swap) return swap;

  const doc = typeof swap.toObject === "function" ? swap.toObject() : { ...swap };

  const snapshotOfferedName = doc.offeredSkillSnapshot?.name || doc.offeredSkillName || "";
  const snapshotOfferedLevel = doc.offeredSkillSnapshot?.level || doc.offeredSkillLevel || "";
  const snapshotWantedName = doc.wantedSkillSnapshot?.name || doc.wantedSkillName || "";
  const snapshotWantedLevel = doc.wantedSkillSnapshot?.level || doc.wantedSkillLevel || "";

  if (!doc.offeredSkillSnapshot) {
    doc.offeredSkillSnapshot = { name: snapshotOfferedName, level: snapshotOfferedLevel };
  }
  if (!doc.wantedSkillSnapshot) {
    doc.wantedSkillSnapshot = { name: snapshotWantedName, level: snapshotWantedLevel };
  }

  // Sync / Fallback for offeredSkill
  if (doc.offeredSkill && typeof doc.offeredSkill === "object") {
    if (!doc.offeredSkillName) doc.offeredSkillName = doc.offeredSkill.name || "";
    if (!doc.offeredSkillLevel) doc.offeredSkillLevel = doc.offeredSkill.level || "";
  } else if (!doc.offeredSkill && snapshotOfferedName) {
    doc.offeredSkill = {
      name: snapshotOfferedName,
      level: snapshotOfferedLevel,
      isDeleted: true,
    };
  }

  // Sync / Fallback for wantedSkill
  if (doc.wantedSkill && typeof doc.wantedSkill === "object") {
    if (!doc.wantedSkillName) doc.wantedSkillName = doc.wantedSkill.name || "";
    if (!doc.wantedSkillLevel) doc.wantedSkillLevel = doc.wantedSkill.level || "";
  } else if (!doc.wantedSkill && snapshotWantedName) {
    doc.wantedSkill = {
      name: snapshotWantedName,
      level: snapshotWantedLevel,
      isDeleted: true,
    };
  }

  return doc;
};

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

  // Create new swap request with skill snapshots
  const newRequest = new SwapRequest({
    fromUser: fromUserId,
    toUser: toUserId,
    offeredSkill: offeredSkillId,
    wantedSkill: wantedSkillId,
    offeredSkillSnapshot: {
      name: offeredSkill.name || "",
      level: offeredSkill.level || "",
    },
    wantedSkillSnapshot: {
      name: wantedSkill.name || "",
      level: wantedSkill.level || "",
    },
    offeredSkillName: offeredSkill.name || "",
    offeredSkillLevel: offeredSkill.level || "",
    wantedSkillName: wantedSkill.name || "",
    wantedSkillLevel: wantedSkill.level || "",
    message: message || "",
    status: "pending",
  });

  await newRequest.save();

  const created = await SwapRequest.findById(newRequest._id)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS);

  return formatSwapWithSnapshots(created);
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

  const filter = {
    hiddenFor: { $ne: userId },
  };

  if (type === "incoming") {
    filter.toUser = userId;
  } else if (type === "outgoing") {
    filter.fromUser = userId;
  } else {
    filter.$or = [{ fromUser: userId }, { toUser: userId }];
  }

  const ALLOWED_ACTIVE_STATUSES = ["pending", "accepted"];

  if (status && status.toLowerCase() !== "all") {
    const normalizedStatus = status.toLowerCase();
    if (ALLOWED_ACTIVE_STATUSES.includes(normalizedStatus)) {
      filter.status = normalizedStatus;
    } else {
      filter.status = { $in: ALLOWED_ACTIVE_STATUSES };
    }
  } else {
    filter.status = { $in: ALLOWED_ACTIVE_STATUSES };
  }

  const [swapRequestsRaw, total] = await Promise.all([
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

  const swapRequests = swapRequestsRaw.map(formatSwapWithSnapshots);

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

  return formatSwapWithSnapshots(swapRequest);
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

  const updated = await SwapRequest.findById(swapRequest._id)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS);

  return formatSwapWithSnapshots(updated);
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

  const updated = await SwapRequest.findById(swapRequest._id)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS);

  return formatSwapWithSnapshots(updated);
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

  const updated = await SwapRequest.findById(swapRequest._id)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS);

  return formatSwapWithSnapshots(updated);
};

const markSwapCompletion = async (swapId, userId) => {
  validateSwapId(swapId);

  const existingSwap = await SwapRequest.findById(swapId)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS);

  if (!existingSwap) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    throw error;
  }

  const fromUserIdStr = existingSwap.fromUser?._id ? String(existingSwap.fromUser._id) : String(existingSwap.fromUser);
  const toUserIdStr = existingSwap.toUser?._id ? String(existingSwap.toUser._id) : String(existingSwap.toUser);
  const currentUserIdStr = String(userId);

  const isFromUser = fromUserIdStr === currentUserIdStr;
  const isToUser = toUserIdStr === currentUserIdStr;

  if (!isFromUser && !isToUser) {
    const error = new Error("Access denied. You are not a participant in this swap request.");
    error.statusCode = 403;
    throw error;
  }

  // Idempotent: If already completed, return populated swap
  if (existingSwap.status === "completed") {
    const completedSwap = await SwapRequest.findById(swapId)
      .populate("fromUser", USER_POPULATE_FIELDS)
      .populate("toUser", USER_POPULATE_FIELDS)
      .populate("offeredSkill", SKILL_POPULATE_FIELDS)
      .populate("wantedSkill", SKILL_POPULATE_FIELDS)
      .populate("leftBy", USER_POPULATE_FIELDS)
      .populate("completionRequestedBy", USER_POPULATE_FIELDS);
    return formatSwapWithSnapshots(completedSwap);
  }

  if (existingSwap.status !== "accepted") {
    const error = new Error("Only active accepted swap requests can be marked as completed.");
    error.statusCode = 400;
    throw error;
  }

  // Evaluate confirmation states
  const fromUserConfirmed = isFromUser || Boolean(existingSwap.completion?.fromUserConfirmed);
  const toUserConfirmed = isToUser || Boolean(existingSwap.completion?.toUserConfirmed);
  const bothConfirmed = fromUserConfirmed && toUserConfirmed;

  const now = new Date();
  const partnerId = isFromUser ? existingSwap.toUser?._id || existingSwap.toUser : existingSwap.fromUser?._id || existingSwap.fromUser;
  const requesterUser = isFromUser ? existingSwap.fromUser : existingSwap.toUser;

  if (bothConfirmed) {
    // Perform atomic state transition to 'completed'
    const updatedSwap = await SwapRequest.findOneAndUpdate(
      { _id: swapId, status: "accepted" },
      {
        $set: {
          status: "completed",
          "completion.fromUserConfirmed": true,
          "completion.toUserConfirmed": true,
          completionRequestedBy: null,
          completionRequestedAt: null,
          completedAt: now,
          endedAt: now,
        },
      },
      { new: true }
    );

    if (updatedSwap) {
      // Increment completedSwaps for both participants exactly once (Phase 8.1 logic)
      await User.updateMany(
        { _id: { $in: [fromUserIdStr, toUserIdStr] } },
        { $inc: { completedSwaps: 1 } }
      );

      // Trigger notification inside try/catch so failure never prevents swap completion
      try {
        await notificationService.createNotification({
          user: partnerId,
          sender: userId,
          swap: swapId,
          type: "completion_confirmed",
          title: "Swap Completed!",
          message: `${requesterUser?.name || "Your swap partner"} confirmed completion. Your swap is officially completed!`,
        });
      } catch (notifErr) {
        console.error("Failed to create completion confirmed notification:", notifErr?.message || notifErr);
      }
    }
  } else {
    // Only current user confirmed so far
    const updateField = isFromUser ? "completion.fromUserConfirmed" : "completion.toUserConfirmed";
    await SwapRequest.findByIdAndUpdate(swapId, {
      $set: {
        completionRequestedBy: userId,
        completionRequestedAt: now,
        [updateField]: true,
      },
    });

    // Trigger notification inside try/catch
    try {
      await notificationService.createNotification({
        user: partnerId,
        sender: userId,
        swap: swapId,
        type: "completion_request",
        title: "Completion Requested",
        message: `${requesterUser?.name || "Your swap partner"} marked your swap as completed. Please confirm if the skill exchange is complete.`,
      });
    } catch (notifErr) {
      console.error("Failed to create completion request notification:", notifErr?.message || notifErr);
    }
  }

  const finalSwap = await SwapRequest.findById(swapId)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS)
    .populate("leftBy", USER_POPULATE_FIELDS)
    .populate("completionRequestedBy", USER_POPULATE_FIELDS);

  return formatSwapWithSnapshots(finalSwap);
};

const requestCompletion = async (swapId, userId) => {
  return await markSwapCompletion(swapId, userId);
};

const confirmCompletion = async (swapId, userId) => {
  return await markSwapCompletion(swapId, userId);
};

const completeSwapRequest = async (swapId, userId) => {
  return await markSwapCompletion(swapId, userId);
};

const cancelCompletionRequest = async (swapId, userId) => {
  validateSwapId(swapId);

  const existingSwap = await SwapRequest.findById(swapId)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS);

  if (!existingSwap) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    throw error;
  }

  const isFromUser = existingSwap.fromUser._id.toString() === userId.toString();
  const isToUser = existingSwap.toUser._id.toString() === userId.toString();

  if (!isFromUser && !isToUser) {
    const error = new Error("Access denied. You are not a participant in this swap request.");
    error.statusCode = 403;
    throw error;
  }

  if (existingSwap.status !== "accepted") {
    const error = new Error("Only active accepted swap requests can be updated.");
    error.statusCode = 400;
    throw error;
  }

  const partnerId = isFromUser ? existingSwap.toUser._id : existingSwap.fromUser._id;
  const cancellerUser = isFromUser ? existingSwap.fromUser : existingSwap.toUser;

  await SwapRequest.findByIdAndUpdate(swapId, {
    $set: {
      completionRequestedBy: null,
      completionRequestedAt: null,
      "completion.fromUserConfirmed": false,
      "completion.toUserConfirmed": false,
    },
  });

  // Create Notification if partner declined completion request
  if (existingSwap.completionRequestedBy && existingSwap.completionRequestedBy.toString() !== userId.toString()) {
    try {
      await notificationService.createNotification({
        user: partnerId,
        sender: userId,
        swap: swapId,
        type: "completion_cancelled",
        title: "Completion Request Not Confirmed",
        message: `${cancellerUser.name || "Your swap partner"} marked the swap as not yet completed. The swap remains active.`,
      });
    } catch (notifErr) {
      console.error("Failed to create completion cancelled notification:", notifErr);
    }
  }

  return await SwapRequest.findById(swapId)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS)
    .populate("leftBy", USER_POPULATE_FIELDS)
    .populate("completionRequestedBy", USER_POPULATE_FIELDS);
};

const leaveSwapRequest = async (swapId, userId) => {
  const existingSwap = await SwapRequest.findById(swapId);

  if (!existingSwap) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    throw error;
  }

  // Permission check: Must be a participant (fromUser or toUser)
  const isSender = existingSwap.fromUser.toString() === userId.toString();
  const isReceiver = existingSwap.toUser.toString() === userId.toString();

  if (!isSender && !isReceiver) {
    const error = new Error("Access denied. You are not a participant in this swap request.");
    error.statusCode = 403;
    throw error;
  }

  // Idempotency check: If already left, return existing document
  if (existingSwap.status === "left") {
    return await SwapRequest.findById(swapId)
      .populate("fromUser", USER_POPULATE_FIELDS)
      .populate("toUser", USER_POPULATE_FIELDS)
      .populate("offeredSkill", SKILL_POPULATE_FIELDS)
      .populate("wantedSkill", SKILL_POPULATE_FIELDS)
      .populate("leftBy", USER_POPULATE_FIELDS);
  }

  // Status check: Must be accepted to transition to left
  if (existingSwap.status !== "accepted") {
    const error = new Error("Only accepted swap requests can be ended/left.");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();

  // Atomic conditional status update
  await SwapRequest.findOneAndUpdate(
    { _id: swapId, status: "accepted" },
    { $set: { status: "left", leftBy: userId, endedAt: now } },
    { new: true }
  );

  return await SwapRequest.findById(swapId)
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS)
    .populate("leftBy", USER_POPULATE_FIELDS);
};

const getSwapHistory = async (userId, queryParams = {}) => {
  const { status, page = 1, limit = 10 } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const ALLOWED_HISTORY_STATUSES = ["completed", "left", "rejected", "cancelled"];

  const filter = {
    $or: [{ fromUser: userId }, { toUser: userId }],
    chatDeletedFor: { $ne: userId },
  };

  if (status && status.toLowerCase() !== "all") {
    const normalizedStatus = status.toLowerCase();
    if (ALLOWED_HISTORY_STATUSES.includes(normalizedStatus)) {
      filter.status = normalizedStatus;
    } else {
      filter.status = { $in: ALLOWED_HISTORY_STATUSES };
    }
  } else {
    filter.status = { $in: ALLOWED_HISTORY_STATUSES };
  }

  const [swapRequestsRaw, total] = await Promise.all([
    SwapRequest.find(filter)
      .sort({ endedAt: -1, updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("fromUser", USER_POPULATE_FIELDS)
      .populate("toUser", USER_POPULATE_FIELDS)
      .populate("offeredSkill", SKILL_POPULATE_FIELDS)
      .populate("wantedSkill", SKILL_POPULATE_FIELDS)
      .populate("leftBy", USER_POPULATE_FIELDS),
    SwapRequest.countDocuments(filter),
  ]);

  const swapRequests = swapRequestsRaw.map(formatSwapWithSnapshots);

  return {
    swapRequests,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
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
    completedIncoming,
    completedOutgoing,
    leftIncoming,
    leftOutgoing,
  ] = await Promise.all([
    SwapRequest.countDocuments({ toUser: userId, status: "pending", hiddenFor: { $ne: userId } }),
    SwapRequest.countDocuments({ fromUser: userId, status: "pending", hiddenFor: { $ne: userId } }),
    SwapRequest.countDocuments({ toUser: userId, status: "accepted", hiddenFor: { $ne: userId } }),
    SwapRequest.countDocuments({ fromUser: userId, status: "accepted", hiddenFor: { $ne: userId } }),
    SwapRequest.countDocuments({ toUser: userId, status: "rejected", chatDeletedFor: { $ne: userId } }),
    SwapRequest.countDocuments({ fromUser: userId, status: "rejected", chatDeletedFor: { $ne: userId } }),
    SwapRequest.countDocuments({ toUser: userId, status: "cancelled", chatDeletedFor: { $ne: userId } }),
    SwapRequest.countDocuments({ fromUser: userId, status: "cancelled", chatDeletedFor: { $ne: userId } }),
    SwapRequest.countDocuments({ toUser: userId, status: "completed", chatDeletedFor: { $ne: userId } }),
    SwapRequest.countDocuments({ fromUser: userId, status: "completed", chatDeletedFor: { $ne: userId } }),
    SwapRequest.countDocuments({ toUser: userId, status: "left", chatDeletedFor: { $ne: userId } }),
    SwapRequest.countDocuments({ fromUser: userId, status: "left", chatDeletedFor: { $ne: userId } }),
  ]);

  const accepted = acceptedIncoming + acceptedOutgoing;
  const rejected = rejectedIncoming + rejectedOutgoing;
  const cancelled = cancelledIncoming + cancelledOutgoing;
  const completed = completedIncoming + completedOutgoing;
  const left = leftIncoming + leftOutgoing;

  const totalIncomingActive = pendingIncoming + acceptedIncoming;
  const totalOutgoingActive = pendingOutgoing + acceptedOutgoing;
  const totalHistory = completed + left + rejected + cancelled;

  return {
    pendingIncoming,
    pendingOutgoing,
    accepted,
    rejected,
    cancelled,
    completed,
    left,
    totalIncoming: totalIncomingActive,
    totalOutgoing: totalOutgoingActive,
    totalHistory,

    // Tab-contextual breakdowns
    incoming: {
      pending: pendingIncoming,
      accepted: acceptedIncoming,
      rejected: rejectedIncoming,
      cancelled: cancelledIncoming,
      completed: completedIncoming,
      left: leftIncoming,
      total: totalIncomingActive,
    },
    outgoing: {
      pending: pendingOutgoing,
      accepted: acceptedOutgoing,
      rejected: rejectedOutgoing,
      cancelled: cancelledOutgoing,
      completed: completedOutgoing,
      left: leftOutgoing,
      total: totalOutgoingActive,
    },
  };
};

const hideSwapForUser = async (swapId, userId) => {
  validateSwapId(swapId);

  const existingSwap = await SwapRequest.findById(swapId);
  if (!existingSwap) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    throw error;
  }

  const fromUserIdStr = existingSwap.fromUser?._id ? String(existingSwap.fromUser._id) : String(existingSwap.fromUser);
  const toUserIdStr = existingSwap.toUser?._id ? String(existingSwap.toUser._id) : String(existingSwap.toUser);
  const currentUserIdStr = String(userId);

  if (fromUserIdStr !== currentUserIdStr && toUserIdStr !== currentUserIdStr) {
    const error = new Error("Access denied. You are not a participant in this swap request.");
    error.statusCode = 403;
    throw error;
  }

  const updatedSwap = await SwapRequest.findByIdAndUpdate(
    swapId,
    { $addToSet: { hiddenFor: userId } },
    { new: true }
  )
    .populate("fromUser", USER_POPULATE_FIELDS)
    .populate("toUser", USER_POPULATE_FIELDS)
    .populate("offeredSkill", SKILL_POPULATE_FIELDS)
    .populate("wantedSkill", SKILL_POPULATE_FIELDS)
    .populate("leftBy", USER_POPULATE_FIELDS)
    .populate("completionRequestedBy", USER_POPULATE_FIELDS);

  return formatSwapWithSnapshots(updatedSwap);
};

module.exports = {
  createSwapRequest,
  getSwapRequests,
  getSwapRequestById,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  completeSwapRequest,
  requestCompletion,
  confirmCompletion,
  cancelCompletionRequest,
  leaveSwapRequest,
  getSwapHistory,
  getSwapStats,
  hideSwapForUser,
};

