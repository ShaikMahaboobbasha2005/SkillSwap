const mongoose = require("mongoose");
const Portfolio = require("../models/Portfolio");
const PortfolioReport = require("../models/PortfolioReport");
const User = require("../models/User");
const Skill = require("../models/Skill");
const {
  uploadPortfolioToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured,
} = require("../config/cloudinary");

const USER_POPULATE_FIELDS = "name profilePicture location avgRating completedSwaps";
const SKILL_POPULATE_FIELDS = "name category level type";

const validateObjectId = (id, label = "ID") => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid ${label} format.`);
    error.statusCode = 400;
    throw error;
  }
};

/**
 * Create a new portfolio item with media upload and validation
 * @param {string} userId - Authenticated user ID
 * @param {Object} file - Multer uploaded file
 * @param {Object} body - Request body containing caption and optional skillId
 * @returns {Promise<Object>} Created portfolio document populated
 */
const createPortfolioItem = async (userId, file, body = {}) => {
  if (!file) {
    const error = new Error("Media file is required.");
    error.statusCode = 400;
    throw error;
  }

  const { caption = "", skillId } = body;
  const mediaType = file.mediaType || (file.mimetype.startsWith("video/") ? "video" : "image");

  // 1. Portfolio Limits Validation (Active & Reported items only)
  const [imageCount, videoCount] = await Promise.all([
    Portfolio.countDocuments({
      user: userId,
      "media.type": "image",
      moderationStatus: { $in: ["active", "reported"] },
    }),
    Portfolio.countDocuments({
      user: userId,
      "media.type": "video",
      moderationStatus: { $in: ["active", "reported"] },
    }),
  ]);
  const totalCount = imageCount + videoCount;

  if (mediaType === "image" && imageCount >= 20) {
    const error = new Error("You have reached the maximum limit of 20 portfolio images.");
    error.statusCode = 400;
    throw error;
  }

  if (mediaType === "video" && videoCount >= 10) {
    const error = new Error("You have reached the maximum limit of 10 portfolio videos.");
    error.statusCode = 400;
    throw error;
  }

  if (totalCount >= 30) {
    const error = new Error("You have reached the maximum limit of 30 total portfolio items.");
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate linked skill if provided
  let linkedSkillId = null;
  if (skillId && typeof skillId === "string" && skillId.trim().length > 0) {
    validateObjectId(skillId.trim(), "skill ID");
    const skill = await Skill.findById(skillId.trim());
    if (!skill) {
      const error = new Error("Linked skill not found.");
      error.statusCode = 404;
      throw error;
    }
    if (skill.owner.toString() !== userId.toString()) {
      const error = new Error("You can only link skills that belong to you.");
      error.statusCode = 403;
      throw error;
    }
    linkedSkillId = skill._id;
  }

  // 3. Upload media to Cloudinary
  const uploadResult = await uploadPortfolioToCloudinary(file.buffer, file.mimetype, mediaType);

  // 4. Video duration validation (max 60 seconds)
  if (mediaType === "video" && uploadResult.duration && uploadResult.duration > 60) {
    // Immediately delete the invalid uploaded asset from Cloudinary
    await deleteFromCloudinary(uploadResult.publicId, { resource_type: "video" });
    const error = new Error("Video duration cannot exceed 60 seconds.");
    error.statusCode = 400;
    throw error;
  }

  // 5. Create Portfolio Document
  const newPortfolio = new Portfolio({
    user: userId,
    media: {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      type: mediaType,
      thumbnailUrl: uploadResult.thumbnailUrl || "",
      duration: uploadResult.duration || null,
    },
    caption: typeof caption === "string" ? caption.trim() : "",
    skill: linkedSkillId,
    moderationStatus: "active",
  });

  await newPortfolio.save();

  const savedItem = await Portfolio.findById(newPortfolio._id)
    .populate("user", USER_POPULATE_FIELDS)
    .populate("skill", SKILL_POPULATE_FIELDS);

  return formatPortfolioItem(savedItem, userId);
};

/**
 * Format reaction summary and current user reaction state
 * @param {Array} reactions - Reactions array
 * @param {string|null} currentUserId - Authenticated user ID if present
 * @returns {{reactionSummary: Object, currentUserReaction: string|null}}
 */
const formatReactionSummary = (reactions = [], currentUserId = null) => {
  const summary = {
    like: 0,
    impressive: 0,
    great_work: 0,
    creative: 0,
    total: 0,
  };

  let currentUserReaction = null;

  if (Array.isArray(reactions)) {
    for (const r of reactions) {
      if (r && r.type && summary.hasOwnProperty(r.type)) {
        summary[r.type] += 1;
        summary.total += 1;
      }
      if (
        currentUserId &&
        r &&
        r.user &&
        (r.user._id ? r.user._id.toString() : r.user.toString()) === currentUserId.toString()
      ) {
        currentUserReaction = r.type;
      }
    }
  }

  return {
    reactionSummary: summary,
    currentUserReaction,
  };
};

/**
 * Helper to attach formatted reaction summary to portfolio document
 * @param {Object} item - Mongoose portfolio document or object
 * @param {string|null} currentUserId - Authenticated user ID if present
 * @returns {Object}
 */
const formatPortfolioItem = (item, currentUserId = null) => {
  if (!item) return null;
  const obj = typeof item.toObject === "function" ? item.toObject() : { ...item };
  const { reactionSummary, currentUserReaction } = formatReactionSummary(obj.reactions, currentUserId);
  obj.reactionSummary = reactionSummary;
  obj.currentUserReaction = currentUserReaction;
  delete obj.reactions;
  return obj;
};

/**
 * Get all active and reported portfolio items for a specific user
 * @param {string} targetUserId - Target user ID
 * @param {Object} queryParams - Query parameters (e.g. ?type=image|video)
 * @param {string|null} currentUserId - Current authenticated user ID if any
 * @returns {Promise<{portfolio: Array, total: number}>}
 */
const getUserPortfolio = async (targetUserId, queryParams = {}, currentUserId = null) => {
  validateObjectId(targetUserId, "user ID");

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const { type } = queryParams;
  const filter = {
    user: targetUserId,
    moderationStatus: { $in: ["active", "reported"] },
  };

  if (type) {
    if (type !== "image" && type !== "video") {
      const error = new Error("Invalid type filter. Allowed values: image, video");
      error.statusCode = 400;
      throw error;
    }
    filter["media.type"] = type;
  }

  const portfolio = await Portfolio.find(filter)
    .sort({ createdAt: -1 })
    .populate("user", USER_POPULATE_FIELDS)
    .populate("skill", SKILL_POPULATE_FIELDS);

  const formattedPortfolio = portfolio.map((item) => formatPortfolioItem(item, currentUserId));

  return {
    portfolio: formattedPortfolio,
    total: formattedPortfolio.length,
  };
};

/**
 * Get a single active or reported portfolio item by ID
 * @param {string} portfolioId - Portfolio item ID
 * @param {string|null} currentUserId - Current authenticated user ID if any
 * @returns {Promise<Object>}
 */
const getPortfolioItemById = async (portfolioId, currentUserId = null) => {
  validateObjectId(portfolioId, "portfolio ID");

  const item = await Portfolio.findOne({
    _id: portfolioId,
    moderationStatus: { $in: ["active", "reported"] },
  })
    .populate("user", USER_POPULATE_FIELDS)
    .populate("skill", SKILL_POPULATE_FIELDS);

  if (!item) {
    const error = new Error("Portfolio item not found.");
    error.statusCode = 404;
    throw error;
  }

  return formatPortfolioItem(item, currentUserId);
};

/**
 * Update caption and/or linked skill for a portfolio item
 * @param {string} portfolioId - Portfolio item ID
 * @param {string} userId - Authenticated user ID
 * @param {Object} body - Update fields (caption, skillId)
 * @returns {Promise<Object>} Updated portfolio item
 */
const updatePortfolioItem = async (portfolioId, userId, body = {}) => {
  validateObjectId(portfolioId, "portfolio ID");

  const item = await Portfolio.findById(portfolioId);
  if (!item) {
    const error = new Error("Portfolio item not found.");
    error.statusCode = 404;
    throw error;
  }

  // Ownership verification
  if (item.user.toString() !== userId.toString()) {
    const error = new Error("You do not have permission to update this portfolio item.");
    error.statusCode = 403;
    throw error;
  }

  const { caption, skillId } = body;

  if (caption !== undefined) {
    item.caption = typeof caption === "string" ? caption.trim() : "";
  }

  if (skillId !== undefined) {
    if (skillId === null || skillId === "") {
      item.skill = null;
    } else {
      validateObjectId(skillId, "skill ID");
      const skill = await Skill.findById(skillId);
      if (!skill) {
        const error = new Error("Linked skill not found.");
        error.statusCode = 404;
        throw error;
      }
      if (skill.owner.toString() !== userId.toString()) {
        const error = new Error("You can only link skills that belong to you.");
        error.statusCode = 403;
        throw error;
      }
      item.skill = skill._id;
    }
  }

  await item.save();

  const updatedItem = await Portfolio.findById(item._id)
    .populate("user", USER_POPULATE_FIELDS)
    .populate("skill", SKILL_POPULATE_FIELDS);

  return formatPortfolioItem(updatedItem, userId);
};

/**
 * Permanently delete a portfolio item and its Cloudinary media asset
 * @param {string} portfolioId - Portfolio item ID
 * @param {string} userId - Authenticated user ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
const deletePortfolioItem = async (portfolioId, userId) => {
  validateObjectId(portfolioId, "portfolio ID");

  const item = await Portfolio.findById(portfolioId);
  if (!item) {
    const error = new Error("Portfolio item not found.");
    error.statusCode = 404;
    throw error;
  }

  // Ownership verification
  if (item.user.toString() !== userId.toString()) {
    const error = new Error("You do not have permission to delete this portfolio item.");
    error.statusCode = 403;
    throw error;
  }

  // 1. Delete asset from Cloudinary safely
  const resourceType = item.media?.type === "video" ? "video" : "image";
  if (item.media?.publicId) {
    const deleteResult = await deleteFromCloudinary(item.media.publicId, {
      resource_type: resourceType,
    });

    if (isCloudinaryConfigured() && deleteResult && deleteResult.error) {
      console.error(`[Portfolio Service] Cloudinary cleanup failed for ${item.media.publicId}:`, deleteResult.error);
      const error = new Error(
        "Failed to delete media asset from Cloudinary: " + (deleteResult.error.message || "Unknown error")
      );
      error.statusCode = 500;
      throw error;
    }
  }

  // 2. Delete document from MongoDB
  await Portfolio.findByIdAndDelete(portfolioId);

  // 3. Clean up associated reports if any
  try {
    await PortfolioReport.deleteMany({ portfolioItem: portfolioId });
  } catch (cleanErr) {
    console.warn(`[Portfolio Service] Failed to clean up reports for deleted portfolio ${portfolioId}:`, cleanErr.message);
  }

  return {
    success: true,
    message: "Portfolio item deleted successfully",
  };
};

/**
 * Toggle / update reaction on a portfolio item (1 reaction per user rule)
 * @param {string} portfolioId - Portfolio item ID
 * @param {string} userId - Authenticated user ID
 * @param {string} reactionType - "like" | "impressive" | "great_work" | "creative"
 * @returns {Promise<{action: string, reactionSummary: Object, currentUserReaction: string|null}>}
 */
const toggleReaction = async (portfolioId, userId, reactionType) => {
  validateObjectId(portfolioId, "portfolio ID");
  validateObjectId(userId, "user ID");

  const allowedTypes = ["like", "impressive", "great_work", "creative"];
  if (!allowedTypes.includes(reactionType)) {
    const error = new Error("Invalid reaction type. Allowed values: like, impressive, great_work, creative");
    error.statusCode = 400;
    throw error;
  }

  const item = await Portfolio.findOne({
    _id: portfolioId,
    moderationStatus: { $in: ["active", "reported"] },
  });

  if (!item) {
    const error = new Error("Portfolio item not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!Array.isArray(item.reactions)) {
    item.reactions = [];
  }

  const existingIndex = item.reactions.findIndex(
    (r) => r.user && r.user.toString() === userId.toString()
  );

  let action = "added";

  if (existingIndex >= 0) {
    if (item.reactions[existingIndex].type === reactionType) {
      // Same reaction clicked -> remove it
      item.reactions.splice(existingIndex, 1);
      action = "removed";
    } else {
      // Different reaction clicked -> update type
      item.reactions[existingIndex].type = reactionType;
      item.reactions[existingIndex].createdAt = new Date();
      action = "updated";
    }
  } else {
    // New reaction -> push
    item.reactions.push({
      user: userId,
      type: reactionType,
      createdAt: new Date(),
    });
    action = "added";
  }

  await item.save();

  const { reactionSummary, currentUserReaction } = formatReactionSummary(item.reactions, userId);

  return {
    action,
    reactionSummary,
    currentUserReaction,
  };
};

/**
 * Get all users who reacted to a portfolio item with sanitized public user fields
 * @param {string} portfolioId - Portfolio item ID
 * @returns {Promise<{reactions: Array, total: number}>}
 */
const getPortfolioReactions = async (portfolioId) => {
  validateObjectId(portfolioId, "portfolio ID");

  const item = await Portfolio.findOne({
    _id: portfolioId,
    moderationStatus: { $in: ["active", "reported"] },
  }).populate("reactions.user", "_id name profilePicture location");

  if (!item) {
    const error = new Error("Portfolio item not found.");
    error.statusCode = 404;
    throw error;
  }

  const sanitizedReactions = (item.reactions || [])
    .filter((r) => r.user && r.user._id)
    .map((r) => ({
      _id: r._id,
      type: r.type,
      createdAt: r.createdAt,
      user: {
        _id: r.user._id,
        name: r.user.name ? r.user.name.trim() : "Unknown User",
        profilePicture: r.user.profilePicture || "",
        location: r.user.location || "",
      },
    }))
    .reverse(); // Newest reactions first

  return {
    reactions: sanitizedReactions,
    total: sanitizedReactions.length,
  };
};

/**
 * Report a portfolio item for moderation review
 * @param {string} portfolioId - Target portfolio ID
 * @param {string} reporterId - Authenticated reporter user ID
 * @param {Object} reportData - { reason: string, description?: string }
 * @returns {Promise<{success: boolean, message: string}>}
 */
const reportPortfolioItem = async (portfolioId, reporterId, reportData = {}) => {
  validateObjectId(portfolioId, "portfolio ID");
  validateObjectId(reporterId, "reporter user ID");

  const item = await Portfolio.findOne({
    _id: portfolioId,
    moderationStatus: { $in: ["active", "reported"] },
  });

  if (!item) {
    const error = new Error("Portfolio item not found.");
    error.statusCode = 404;
    throw error;
  }

  // Prevent users from reporting their own portfolio items
  if (item.user.toString() === reporterId.toString()) {
    const error = new Error("You cannot report your own portfolio item.");
    error.statusCode = 403;
    throw error;
  }

  // Check for existing active report by the same user
  const existingReport = await PortfolioReport.findOne({
    portfolioItem: portfolioId,
    reporter: reporterId,
  });

  if (existingReport) {
    const error = new Error("You have already reported this portfolio item.");
    error.statusCode = 409;
    throw error;
  }

  const { reason, description = "" } = reportData;

  const newReport = new PortfolioReport({
    portfolioItem: portfolioId,
    reporter: reporterId,
    reason,
    description: typeof description === "string" ? description.trim() : "",
    status: "pending",
  });

  try {
    await newReport.save();
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error("You have already reported this portfolio item.");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }

  // Update portfolio item status and report count
  if (item.moderationStatus === "active") {
    item.moderationStatus = "reported";
  }
  item.reportCount = (item.reportCount || 0) + 1;
  await item.save();

  return {
    success: true,
    message: "Portfolio item reported successfully.",
  };
};

module.exports = {
  createPortfolioItem,
  getUserPortfolio,
  getPortfolioItemById,
  updatePortfolioItem,
  deletePortfolioItem,
  toggleReaction,
  getPortfolioReactions,
  reportPortfolioItem,
  formatReactionSummary,
  formatPortfolioItem,
};
