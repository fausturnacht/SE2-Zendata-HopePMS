/**
 * @file dateUtils.ts
 * @description Date/time formatting utilities localized to GMT+8 (Asia/Manila).
 *
 * All date operations in the PMS use these helpers to ensure consistency.
 * The timezone is hardcoded to Asia/Manila because HOPE, Inc. operates
 * in the Philippines, and late-night edits must be recorded on the
 * correct local calendar day for audit compliance.
 */

/**
 * Returns the current date in YYYY-MM-DD format, adjusted for GMT+8 (Asia/Manila).
 * This ensures that late-night updates are recorded on the correct local day.
 *
 * Uses the 'en-CA' locale because it natively formats dates as YYYY-MM-DD,
 * which matches the ISO-8601 date format expected by the Supabase `date` columns.
 *
 * @returns {string} Today's date as "YYYY-MM-DD" in Philippine Standard Time.
 */
export const getTodayGMT8 = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

/**
 * Returns the current date and time in "YYYY-MM-DD HH:mm" format, adjusted for GMT+8.
 *
 * Used primarily for generating human-readable audit stamps that include
 * both date and time (e.g. "2026-05-11 20:45").
 *
 * @returns {string} Current date-time as "YYYY-MM-DD HH:mm" in Philippine Standard Time.
 */
export const getNowGMT8 = () => {
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());
  
  // 'en-CA' locale returns "YYYY-MM-DD, HH:mm" — remove the comma+space separator
  return dateStr.replace(', ', ' ');
};
