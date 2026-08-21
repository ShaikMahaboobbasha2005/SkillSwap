import api from "./api";

/**
 * Clean query parameter objects by removing undefined, null, or empty string values.
 * @param {Object} params
 * @returns {Object} Cleaned parameters
 */
const cleanParams = (params = {}) => {
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

/**
 * Fetch all active portfolio items for a specific user.
 * @param {string} userId - User ID
 * @param {Object} [params] - Optional filters e.g. { type: "image" | "video" }
 * @returns {Promise<Object>} API response { success: true, data: { portfolio: [], total: number } }
 */
export const getUserPortfolio = async (userId, params = {}) => {
  const response = await api.get(`/portfolio/user/${userId}`, {
    params: cleanParams(params),
  });
  return response.data;
};

/**
 * Fetch a single active portfolio item by ID.
 * @param {string} id - Portfolio item ID
 * @returns {Promise<Object>} API response { success: true, data: {} }
 */
export const getPortfolioItem = async (id) => {
  const response = await api.get(`/portfolio/${id}`);
  return response.data;
};

/**
 * Create a new portfolio item (multipart/form-data with media file).
 * @param {FormData} formData - FormData containing media, optional caption, optional skillId
 * @param {Function} [onUploadProgress] - Optional Axios upload progress callback
 * @returns {Promise<Object>} API response { success: true, message: string, data: {} }
 */
export const createPortfolioItem = async (formData, onUploadProgress) => {
  const response = await api.post("/portfolio", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
  return response.data;
};

/**
 * Update an owned portfolio item's caption and/or linked skill.
 * @param {string} id - Portfolio item ID
 * @param {Object} data - { caption?: string, skillId?: string|null }
 * @returns {Promise<Object>} API response { success: true, message: string, data: {} }
 */
export const updatePortfolioItem = async (id, data) => {
  const response = await api.patch(`/portfolio/${id}`, data);
  return response.data;
};

/**
 * Permanently delete an owned portfolio item and its Cloudinary media asset.
 * @param {string} id - Portfolio item ID
 * @returns {Promise<Object>} API response { success: true, message: string }
 */
export const deletePortfolioItem = async (id) => {
  const response = await api.delete(`/portfolio/${id}`);
  return response.data;
};

/**
 * Add, change, or remove reaction on a portfolio item (toggle).
 * @param {string} id - Portfolio item ID
 * @param {string} type - "like" | "impressive" | "great_work" | "creative"
 * @returns {Promise<Object>} API response { success: true, message: string, data: { action, reactionSummary, currentUserReaction } }
 */
export const togglePortfolioReaction = async (id, type) => {
  const response = await api.post(`/portfolio/${id}/reaction`, { type });
  return response.data;
};

/**
 * Get all users who reacted to a portfolio item.
 * @param {string} id - Portfolio item ID
 * @returns {Promise<Object>} API response { success: true, data: { reactions: [], total: number } }
 */
export const getPortfolioReactions = async (id) => {
  const response = await api.get(`/portfolio/${id}/reactions`);
  return response.data;
};

const portfolioService = {
  getUserPortfolio,
  getPortfolioItem,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  togglePortfolioReaction,
  getPortfolioReactions,
};

export default portfolioService;
