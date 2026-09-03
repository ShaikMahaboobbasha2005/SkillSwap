const mongoose = require("mongoose");
const Rating = require("../models/Rating");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");
const notificationService = require("./notificationService");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const REVIEWER_POPULATE_FIELDS = "name profilePicture location";

const SWAP_POPULATE_CONFIG = {
  path: "swapRequest",
  select:
    "_id fromUser toUser offeredSkill wantedSkill offeredSkillName wantedSkillName offeredSkillSnapshot wantedSkillSnapshot status completedAt",
  populate: [
    { path: "offeredSkill", select: "name category level" },
    { path: "wantedSkill", select: "name category level" },
  ],
};

/**
 * Recalculate and update the average rating of a user based ONLY on ratings received.
 * @param {string|ObjectId} ratedUserId - User ID who received ratings
 * @returns {Promise<number>} Updated avgRating value (rounded to 1 decimal place)
 */
const recalculateUserRating = async (ratedUserId) => {
  const targetId =
    typeof ratedUserId === "string" ? new mongoose.Types.ObjectId(ratedUserId) : ratedUserId;

  const aggregateResult = await Rating.aggregate([
    { $match: { ratedUser: targetId } },
    { $group: { _id: "$ratedUser", avgStars: { $avg: "$stars" } } },
  ]);

  let avgRating = 0;
  if (aggregateResult.length > 0 && typeof aggregateResult[0].avgStars === "number") {
    avgRating = Math.round(aggregateResult[0].avgStars * 10) / 10;
  }

  await User.findByIdAndUpdate(ratedUserId, { $set: { avgRating } });
  return avgRating;
};

/**
 * Create a rating for a completed swap request and trigger server-side reputation recalculation.
 * @param {string} swapId - Swap request ID
 * @param {string} reviewerId - Authenticated user ID submitting the rating
 * @param {Object} ratingData - { stars, review }
 * @returns {Promise<Object>} { rating: populatedRating, updatedAvgRating }
 */
const createRating = async (swapId, reviewerId, ratingData) => {
  const { stars, review = "" } = ratingData;

  // 1. Validate swapId ObjectId format
  if (!objectIdRegex.test(swapId)) {
    const error = new Error("Invalid swap ID format.");
    error.statusCode = 400;
    throw error;
  }

  // 2. Fetch SwapRequest document
  const swap = await SwapRequest.findById(swapId);
  if (!swap) {
    const error = new Error("Swap request not found.");
    error.statusCode = 404;
    throw error;
  }

  // 3. Verify swap status is completed
  if (swap.status !== "completed") {
    const error = new Error("Ratings can only be submitted for completed swaps.");
    error.statusCode = 400;
    throw error;
  }

  // 4. Verify user is a participant
  const isSender = swap.fromUser.toString() === reviewerId.toString();
  const isReceiver = swap.toUser.toString() === reviewerId.toString();

  if (!isSender && !isReceiver) {
    const error = new Error("Access denied. You are not a participant in this swap request.");
    error.statusCode = 403;
    throw error;
  }

  // 5. Derive ratedUser server-side (counterpart)
  const ratedUserId = isSender ? swap.toUser : swap.fromUser;

  // 6. Self-rating prevention
  if (reviewerId.toString() === ratedUserId.toString()) {
    const error = new Error("You cannot rate yourself.");
    error.statusCode = 400;
    throw error;
  }

  // 7. Application-level check for duplicate rating
  const existingRating = await Rating.findOne({
    swapRequest: swapId,
    reviewer: reviewerId,
  });

  if (existingRating) {
    const error = new Error("You have already submitted a rating for this swap.");
    error.statusCode = 409;
    throw error;
  }

  // 8. Create and persist Rating (handled with E11000 fallback)
  let newRating;
  try {
    newRating = await Rating.create({
      swapRequest: swapId,
      reviewer: reviewerId,
      ratedUser: ratedUserId,
      stars,
      review: review ? review.trim() : "",
    });
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error("You have already submitted a rating for this swap.");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }

  // 9. Recalculate the rated user's reputation from persisted Rating documents
  const updatedAvgRating = await recalculateUserRating(ratedUserId);

  // 10. Populate rating document
  const populatedRating = await Rating.findById(newRating._id)
    .populate("reviewer", REVIEWER_POPULATE_FIELDS)
    .populate("ratedUser", REVIEWER_POPULATE_FIELDS)
    .populate(SWAP_POPULATE_CONFIG);

  // 11. Trigger in-app Notification for ratedUser inside try/catch
  try {
    const reviewerName = populatedRating.reviewer?.name || "Your swap partner";
    await notificationService.createNotification({
      user: ratedUserId,
      sender: reviewerId,
      swap: swapId,
      type: "rating_received",
      title: "New Review Received",
      message: `${reviewerName} rated your completed swap ${stars} star${stars > 1 ? "s" : ""}.`,
    });
  } catch (notifErr) {
    console.warn("Failed to create rating received notification:", notifErr?.message || notifErr);
  }

  return {
    rating: populatedRating,
    updatedAvgRating,
  };
};

/**
 * Fetch ratings received by a specific user with pagination.
 * @param {string} ratedUserId - User ID who received ratings
 * @param {Object} query - { page, limit }
 * @returns {Promise<Object>} { ratings, total, page, limit, totalPages }
 */
const getRatingsForUser = async (ratedUserId, query = {}) => {
  // 1. Validate ratedUserId ObjectId format
  if (!objectIdRegex.test(ratedUserId)) {
    const error = new Error("Invalid user ID format.");
    error.statusCode = 400;
    throw error;
  }

  // 2. Verify target user exists
  const targetUser = await User.findById(ratedUserId);
  if (!targetUser) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // 3. Parse pagination options
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // 4. Query ratings received by ratedUser, newest first
  const filter = { ratedUser: ratedUserId };

  const [ratings, total] = await Promise.all([
    Rating.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reviewer", REVIEWER_POPULATE_FIELDS)
      .populate(SWAP_POPULATE_CONFIG),
    Rating.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 0;

  return {
    ratings,
    total,
    page,
    limit,
    totalPages,
  };
};

/**
 * Check if the authenticated user has submitted a rating for a specific swap request.
 * @param {string} swapId - Swap request ID
 * @param {string} reviewerId - User ID to check
 * @returns {Promise<Object>} { hasRated: boolean, rating: Object|null }
 */
const getRatingStatusForSwap = async (swapId, reviewerId) => {
  if (!objectIdRegex.test(swapId)) {
    const error = new Error("Invalid swap ID format.");
    error.statusCode = 400;
    throw error;
  }

  const rating = await Rating.findOne({
    swapRequest: swapId,
    reviewer: reviewerId,
  })
    .populate("reviewer", REVIEWER_POPULATE_FIELDS)
    .populate(SWAP_POPULATE_CONFIG);

  return {
    hasRated: Boolean(rating),
    rating: rating || null,
  };
};

module.exports = {
  createRating,
  recalculateUserRating,
  getRatingsForUser,
  getRatingStatusForSwap,
};
