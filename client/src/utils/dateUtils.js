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
