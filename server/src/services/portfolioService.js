const mongoose = require("mongoose");
const Portfolio = require("../models/Portfolio");
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

  // 1. Portfolio Limits Validation (Active items only)
  const [imageCount, videoCount] = await Promise.all([
    Portfolio.countDocuments({ user: userId, "media.type": "image", moderationStatus: "active" }),
    Portfolio.countDocuments({ user: userId, "media.type": "video", moderationStatus: "active" }),
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

  return await Portfolio.findById(newPortfolio._id)
    .populate("user", USER_POPULATE_FIELDS)
    .populate("skill", SKILL_POPULATE_FIELDS);
};

/**
 * Get all active portfolio items for a specific user
 * @param {string} targetUserId - Target user ID
 * @param {Object} queryParams - Query parameters (e.g. ?type=image|video)
 * @returns {Promise<{portfolio: Array, total: number}>}
 */
const getUserPortfolio = async (targetUserId, queryParams = {}) => {
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
    moderationStatus: "active",
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
    .populate("skill", SKILL_POPULATE_FIELDS);

  return {
    portfolio,
    total: portfolio.length,
  };
};

/**
 * Get a single portfolio item by ID
 * @param {string} portfolioId - Portfolio item ID
 * @returns {Promise<Object>}
 */
const getPortfolioItemById = async (portfolioId) => {
  validateObjectId(portfolioId, "portfolio ID");

  const item = await Portfolio.findOne({
    _id: portfolioId,
    moderationStatus: "active",
  })
    .populate("user", USER_POPULATE_FIELDS)
    .populate("skill", SKILL_POPULATE_FIELDS);

  if (!item) {
    const error = new Error("Portfolio item not found.");
    error.statusCode = 404;
    throw error;
  }

  return item;
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

  return await Portfolio.findById(item._id)
    .populate("user", USER_POPULATE_FIELDS)
    .populate("skill", SKILL_POPULATE_FIELDS);
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

  return {
    success: true,
    message: "Portfolio item deleted successfully",
  };
};

module.exports = {
  createPortfolioItem,
  getUserPortfolio,
  getPortfolioItemById,
  updatePortfolioItem,
  deletePortfolioItem,
};
