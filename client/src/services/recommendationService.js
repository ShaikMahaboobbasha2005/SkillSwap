import api from "./api";

/**
 * Fetch skill-based recommendations for the authenticated user
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Number of items per page
 * @param {boolean} [ai=false] - Optional flag to trigger Gemini AI semantic ranking
 * @returns {Promise<{ success: boolean, data: { recommendations: Array }, meta: Object }>}
 */
export const getRecommendations = async (page = 1, limit = 10, ai = false) => {
  const params = { page, limit };
  if (ai) {
    params.ai = "true";
  }

  const response = await api.get("/recommendations", { params });
  return response.data;
};

export default {
  getRecommendations,
};

