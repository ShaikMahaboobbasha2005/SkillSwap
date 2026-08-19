/**
 * Date Utility Functions for SkillSwap Chat
 *
 * All functions operate in the client's LOCAL timezone to ensure correct
 * calendar date boundary detection regardless of UTC midnight boundaries.
 */

/**
 * Returns a local date string key formatted as "YYYY-MM-DD" for a given date input.
 * Returns empty string if the date input is invalid.
 *
 * @param {string|Date|number} dateInput
 * @returns {string} e.g. "2026-08-10"
 */
export function getLocalDateKey(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Checks whether two date inputs fall on the exact same local calendar day.
 *
 * @param {string|Date|number} dateInput1
 * @param {string|Date|number} dateInput2
 * @returns {boolean}
 */
export function isSameDay(dateInput1, dateInput2) {
  if (!dateInput1 || !dateInput2) return false;
  return getLocalDateKey(dateInput1) === getLocalDateKey(dateInput2);
}

/**
 * Formats a timestamp for WhatsApp-style chat date separators:
 * - "Today" if the date matches today in local timezone
 * - "Yesterday" if the date matches yesterday in local timezone
 * - "D MMMM YYYY" (e.g. "10 August 2026") for older dates
 *
 * @param {string|Date|number} dateInput
 * @returns {string} Formatted label or empty string if invalid
 */
export function formatDateSeparator(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const targetKey = getLocalDateKey(date);
  const now = new Date();
  const todayKey = getLocalDateKey(now);

  if (targetKey === todayKey) {
    return "Today";
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);

  if (targetKey === yesterdayKey) {
    return "Yesterday";
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Returns a numeric timestamp (ms since epoch) representing the effective activity
 * time for a conversation/swap entry. Used for consistent sorting and default swap
 * selection across sidebar grouping, display, and swap switching.
 *
 * Priority:
 * 1. lastMessage.createdAt (most recent message timestamp)
 * 2. lastActivityAt (pre-computed by backend)
 * 3. swap.updatedAt
 * 4. swap.createdAt
 * 5. 0 (epoch fallback)
 *
 * @param {Object} conversation - A conversation entry from GET /api/chat/conversations
 * @returns {number} Millisecond timestamp for sorting (higher = more recent)
 */
export function getSwapActivityTimestamp(conversation) {
  if (!conversation) return 0;

  if (conversation.lastMessage?.createdAt) {
    const ts = new Date(conversation.lastMessage.createdAt).getTime();
    if (!isNaN(ts)) return ts;
  }
  if (conversation.lastActivityAt) {
    const ts = new Date(conversation.lastActivityAt).getTime();
    if (!isNaN(ts)) return ts;
  }
  if (conversation.swap?.updatedAt) {
    const ts = new Date(conversation.swap.updatedAt).getTime();
    if (!isNaN(ts)) return ts;
  }
  if (conversation.swap?.createdAt) {
    const ts = new Date(conversation.swap.createdAt).getTime();
    if (!isNaN(ts)) return ts;
  }
  return 0;
}
