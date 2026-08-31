import api from "./api";

/**
 * Start an instant video meeting session for an accepted swap.
 * @param {string} swapId - Swap request ID
 * @returns {Promise<Object>} API response data
 */
export const createInstantMeeting = async (swapId) => {
  const response = await api.post("/meetings/instant", { swapId });
  return response.data;
};

/**
 * Schedule a future video learning session for an accepted swap.
 * @param {Object} data - { swapId, scheduledAt, duration, note }
 * @returns {Promise<Object>} API response data
 */
export const scheduleMeeting = async ({ swapId, scheduledAt, duration = 30, note = "" }) => {
  const response = await api.post("/meetings", {
    swapId,
    scheduledAt,
    duration,
    note,
  });
  return response.data;
};

/**
 * Fetch meeting details by ID.
 * @param {string} meetingId - Meeting session ID
 * @returns {Promise<Object>} API response data
 */
export const getMeetingDetails = async (meetingId) => {
  const response = await api.get(`/meetings/${meetingId}`);
  return response.data;
};

/**
 * Join an active or scheduled video meeting session.
 * @param {string} meetingId - Meeting session ID
 * @returns {Promise<Object>} API response data with Jitsi configuration
 */
export const joinMeeting = async (meetingId) => {
  const response = await api.get(`/meetings/${meetingId}/join`);
  return response.data;
};

/**
 * Cancel a scheduled or active video meeting session.
 * @param {string} meetingId - Meeting session ID
 * @returns {Promise<Object>} API response data
 */
export const cancelMeeting = async (meetingId) => {
  const response = await api.patch(`/meetings/${meetingId}/cancel`);
  return response.data;
};

const meetingService = {
  createInstantMeeting,
  scheduleMeeting,
  getMeetingDetails,
  joinMeeting,
  cancelMeeting,
};

export default meetingService;
