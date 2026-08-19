/**
 * Swap Request Sorting Utilities
 *
 * Provides priority-based and date-based sorting for swap requests on the Swap Requests page.
 */

/**
 * Priority map for swap statuses when viewing "All" requests.
 * Lower number = higher priority (appears first).
 */
const STATUS_PRIORITY = {
  accepted: 1,
  pending: 2,
  completed: 3,
  rejected: 4,
  cancelled: 5,
};

/**
 * Extracts the most relevant timestamp for a swap based on its status.
 * @param {Object} swap - Swap request object
 * @returns {number} Timestamp in milliseconds
 */
export const getSwapRelevantDate = (swap) => {
  if (!swap) return 0;

  const status = swap.status ? swap.status.toLowerCase() : "";

  let dateValue = null;

  switch (status) {
    case "accepted":
      dateValue = swap.updatedAt || swap.createdAt;
      break;
    case "pending":
      dateValue = swap.createdAt || swap.updatedAt;
      break;
    case "completed":
      dateValue = swap.completedAt || swap.endedAt || swap.updatedAt || swap.createdAt;
      break;
    case "rejected":
      dateValue = swap.updatedAt || swap.createdAt;
      break;
    case "cancelled":
      dateValue = swap.updatedAt || swap.createdAt;
      break;
    case "left":
      dateValue = swap.endedAt || swap.updatedAt || swap.createdAt;
      break;
    default:
      dateValue = swap.updatedAt || swap.createdAt;
      break;
  }

  return dateValue ? new Date(dateValue).getTime() : 0;
};

/**
 * Sorts swap requests by priority status and relevant date.
 * Priority: accepted (1) -> pending (2) -> completed (3) -> rejected (4) -> cancelled (5) -> other (99)
 * Within the same priority group, sorted by most relevant date descending.
 *
 * @param {Array} swaps - Array of swap request objects
 * @returns {Array} New sorted array of swap requests
 */
export const sortSwapsByPriority = (swaps = []) => {
  if (!Array.isArray(swaps)) return [];

  return [...swaps].sort((a, b) => {
    const statusA = a?.status ? a.status.toLowerCase() : "";
    const statusB = b?.status ? b.status.toLowerCase() : "";

    const priorityA = STATUS_PRIORITY[statusA] ?? 99;
    const priorityB = STATUS_PRIORITY[statusB] ?? 99;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Within same priority, sort newest relevant date first
    const dateA = getSwapRelevantDate(a);
    const dateB = getSwapRelevantDate(b);

    return dateB - dateA;
  });
};

/**
 * Sorts swap requests of a specific status by newest/relevant date descending.
 *
 * @param {Array} swaps - Array of swap request objects
 * @returns {Array} New sorted array
 */
export const sortSwapsByDate = (swaps = []) => {
  if (!Array.isArray(swaps)) return [];

  return [...swaps].sort((a, b) => {
    const dateA = getSwapRelevantDate(a);
    const dateB = getSwapRelevantDate(b);
    return dateB - dateA;
  });
};
