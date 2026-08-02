import api from "./api";

/**
 * Fetch persisted message history for an accepted swap request.
 * @param {string} swapId - Swap request ID
 * @param {Object} [params] - Query parameters e.g. { page, limit }
 * @returns {Promise<Object>} API response data
 */
export const getMessageHistory = async (swapId, params = {}) => {
  const response = await api.get(`/chat/${swapId}/messages`, { params });
  return response.data;
};

/**
 * Fetch all accepted swap conversations for the current user.
 * @returns {Promise<Object>} API response data
 */
export const getConversations = async () => {
  const response = await api.get("/chat/conversations");
  return response.data;
};

/**
 * Fetch total unread incoming messages count for navbar badge.
 * @returns {Promise<Object>} API response data
 */
export const getUnreadCount = async () => {
  const response = await api.get("/chat/unread-count");
  return response.data;
};

/**
 * Mark all incoming unread messages in a swap request as read.
 * @param {string} swapId - Swap request ID
 * @returns {Promise<Object>} API response data
 */
export const markAsRead = async (swapId) => {
  const response = await api.patch(`/chat/${swapId}/read`);
  return response.data;
};

const chatService = {
  getMessageHistory,
  getConversations,
  getUnreadCount,
  markAsRead,
};

export default chatService;
