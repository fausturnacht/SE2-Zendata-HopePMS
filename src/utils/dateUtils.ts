/**
 * Returns the current date in YYYY-MM-DD format, adjusted for GMT+8 (Asia/Manila).
 * This ensures that late-night updates are recorded on the correct local day.
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
 * Returns the current date and time in YYYY-MM-DD HH:mm format, adjusted for GMT+8.
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
  
  return dateStr.replace(', ', ' ');
};
