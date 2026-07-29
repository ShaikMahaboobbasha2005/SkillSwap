import api from "./api";

/**
 * Fetch public skills discovery list with search, filters, pagination, and sorting
 * @param {Object} params - Query parameters (search, category, type, level, page, limit, sort)
 * @returns {Promise<{ data: Array, pagination: Object }>} Discovery API payload
 */
export const getDiscoveredSkills = async (params = {}) => {
  const response = await api.get("/discover", { params });
  return response.data;
};

export default {
  getDiscoveredSkills,
};
