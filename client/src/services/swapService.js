import api from "./api";

/**
 * Helper to clean query parameter objects by removing undefined, null, or empty string values.
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
 * Send a new swap request to another user.
 * @param {Object} data - { toUser, offeredSkill, wantedSkill, message }
 * @returns {Promise<Object>} API response data
 */
export const createSwap = async (data) => {
  const response = await api.post("/swaps", data);
  return response.data;
};

/**
 * Fetch swap requests for the current user (all, incoming, or outgoing) with optional filtering and pagination.
 * @param {Object} [params] - { page, limit, status, type }
 * @returns {Promise<Object>} API response data
 */
export const getAllSwaps = async (params = {}) => {
  const response = await api.get("/swaps", { params: cleanParams(params) });
  return response.data;
};

/**
 * Fetch incoming swap requests for the logged-in user.
 * @param {Object} [params] - { page, limit, status }
 * @returns {Promise<Object>} API response data
 */
export const getIncomingSwaps = async (params = {}) => {
  const response = await api.get("/swaps/incoming", { params: cleanParams(params) });
  return response.data;
};

/**
 * Fetch outgoing swap requests for the logged-in user.
 * @param {Object} [params] - { page, limit, status }
 * @returns {Promise<Object>} API response data
 */
export const getOutgoingSwaps = async (params = {}) => {
  const response = await api.get("/swaps/outgoing", { params: cleanParams(params) });
  return response.data;
};

/**
 * Fetch details for a specific swap request by ID.
 * @param {string} id - Swap request ID
 * @returns {Promise<Object>} API response data
 */
export const getSwapDetails = async (id) => {
  const response = await api.get(`/swaps/${id}`);
  return response.data;
};

/**
 * Accept a pending swap request (Recipient only).
 * @param {string} id - Swap request ID
 * @returns {Promise<Object>} API response data
 */
export const acceptSwap = async (id) => {
  const response = await api.patch(`/swaps/${id}/accept`);
  return response.data;
};

/**
 * Reject a pending swap request (Recipient only).
 * @param {string} id - Swap request ID
 * @returns {Promise<Object>} API response data
 */
export const rejectSwap = async (id) => {
  const response = await api.patch(`/swaps/${id}/reject`);
  return response.data;
};

/**
 * Cancel a pending swap request (Sender only).
 * @param {string} id - Swap request ID
 * @returns {Promise<Object>} API response data
 */
export const cancelSwap = async (id) => {
  const response = await api.patch(`/swaps/${id}/cancel`);
  return response.data;
};

/**
 * Complete an accepted swap request (Participant only).
 * @param {string} id - Swap request ID
 * @returns {Promise<Object>} API response data
 */
export const completeSwap = async (id) => {
  const response = await api.patch(`/swaps/${id}/complete`);
  return response.data;
};

/**
 * Request completion of an accepted swap request.
 * @param {string} id - Swap request ID
 * @returns {Promise<Object>} API response data
 */
export const requestCompletion = async (id) => {
  const response = await api.patch(`/swaps/${id}/request-completion`);
  return response.data;
};

/**
 * Confirm completion of an accepted swap request.
 * @param {string} id - Swap request ID
 * @returns {Promise<Object>} API response data
 */
export const confirmCompletion = async (id) => {
  const response = await api.patch(`/swaps/${id}/confirm-completion`);
  return response.data;
};

/**
 * Cancel/Decline a pending completion request for an accepted swap.
 * @param {string} id - Swap request ID
 * @returns {Promise<Object>} API response data
 */
export const cancelCompletionRequest = async (id) => {
  const response = await api.patch(`/swaps/${id}/cancel-completion-request`);
  return response.data;
};

/**
 * Leave an ongoing accepted swap request (Participant only).
 * @param {string} id - Swap request ID
 * @returns {Promise<Object>} API response data
 */
export const leaveSwap = async (id) => {
  const response = await api.patch(`/swaps/${id}/leave`);
  return response.data;
};

/**
 * Fetch swap history for the current user (completed, left, cancelled).
 * @param {Object} [params] - { page, limit, status }
 * @returns {Promise<Object>} API response data
 */
export const getSwapHistory = async (params = {}) => {
  const response = await api.get("/swaps/history", { params: cleanParams(params) });
  return response.data;
};

/**
 * Fetch swap statistics summary (counts for pending, accepted, rejected, cancelled, completed, left).
 * @returns {Promise<Object>} API response data
 */
export const getSwapStats = async () => {
  const response = await api.get("/swaps/stats");
  return response.data;
};

/**
 * Hide a swap request from the current user's incoming/outgoing request list.
 * @param {string} id - Swap request ID
 * @returns {Promise<Object>} API response data
 */
export const hideSwap = async (id) => {
  const response = await api.patch(`/swaps/${id}/hide`);
  return response.data;
};

const swapService = {
  createSwap,
  getAllSwaps,
  getIncomingSwaps,
  getOutgoingSwaps,
  getSwapDetails,
  acceptSwap,
  rejectSwap,
  cancelSwap,
  completeSwap,
  requestCompletion,
  confirmCompletion,
  cancelCompletionRequest,
  leaveSwap,
  hideSwap,
  getSwapHistory,
  getSwapStats,
};

export default swapService;

