import api from "./api";

/**
 * Submit a rating & review for a completed swap.
 * @param {string} swapId - Swap request ID
 * @param {Object} data - { stars: number, review?: string }
 * @returns {Promise<Object>} Response data { rating, updatedAvgRating }
 */
export const createRating = async (swapId, data) => {
  const response = await api.post(`/ratings/${swapId}`, data);
  return response.data;
};

/**
 * Fetch ratings received by a specific user.
 * @param {string} userId - User ID
 * @param {Object} [params] - { page, limit }
 * @returns {Promise<Object>} Response data
 */
export const getRatingsForUser = async (userId, params = {}) => {
  const response = await api.get(`/ratings/user/${userId}`, { params });
  return response.data;
};

/**
 * Check if the current user has rated a specific completed swap.
 * @param {string} swapId - Swap request ID
 * @returns {Promise<Object>} Response data { hasRated: boolean, rating: Object|null }
 */
export const getRatingStatusForSwap = async (swapId) => {
  const response = await api.get(`/ratings/swap/${swapId}/status`);
  return response.data;
};

const ratingService = {
  createRating,
  getRatingsForUser,
  getRatingStatusForSwap,
};

export default ratingService;
