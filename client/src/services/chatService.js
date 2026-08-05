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
 * Fetch unread conversation count for navbar badge.
 * @returns {Promise<Object>} API response data containing unreadConversationCount and totalUnreadMessageCount
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
export const markAsRead = async (swapId, messageIds = null) => {
  const response = await api.patch(
    `/chat/${swapId}/read`,
    messageIds ? { messageIds } : {}
  );
  return response.data;
};

/**
 * Delete a user's own message for everyone.
 * @param {string} swapId - Swap request ID
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} API response data
 */
export const deleteMessage = async (swapId, messageId) => {
  const response = await api.delete(`/chat/${swapId}/messages/${messageId}`);
  return response.data;
};

const chatService = {
  getMessageHistory,
  getConversations,
  getUnreadCount,
  markAsRead,
  deleteMessage,
};

export default chatService;
