/**
 * Utilities for birthday calculations, formatting, countdowns, and age milestones.
 */

// Month names helper
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Parses birthday string 'YYYY-MM-DD' or 'MM-DD'
 */
export function parseBirthday(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  
  if (parts.length === 3) {
    return { year: parts[0], month: parts[1], day: parts[2] };
  } else if (parts.length === 2) {
    return { year: null, month: parts[0], day: parts[1] };
  }
  return null;
}

/**
 * Checks if birthday matches today's date
 */
export function isBirthdayToday(dateStr) {
  const parsed = parseBirthday(dateStr);
  if (!parsed) return false;
  
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  return parsed.month === currentMonth && parsed.day === currentDay;
}

/**
 * Returns the number of days until the next birthday (0 means today)
 */
export function getDaysUntilBirthday(dateStr) {
  const parsed = parseBirthday(dateStr);
  if (!parsed) return 999;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Try current year
  let nextBday = new Date(today.getFullYear(), parsed.month - 1, parsed.day);

  // If already passed this year, it falls in next year
  if (nextBday < today) {
    nextBday = new Date(today.getFullYear() + 1, parsed.month - 1, parsed.day);
  }

  const diffTime = nextBday.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formats date into readable string, e.g., "October 12" or "Oct 12, 2001"
 */
export function formatBirthday(dateStr, includeYear = false) {
  const parsed = parseBirthday(dateStr);
  if (!parsed) return dateStr;

  const monthName = MONTHS[parsed.month - 1];
  if (includeYear && parsed.year) {
    return `${monthName} ${parsed.day}, ${parsed.year}`;
  }
  return `${monthName} ${parsed.day}`;
}

/**
 * Calculates current or upcoming turning age if birth year is provided
 */
export function getTurningAge(dateStr) {
  const parsed = parseBirthday(dateStr);
  if (!parsed || !parsed.year) return null;

  const now = new Date();
  let turningYear = now.getFullYear();
  const thisYearBday = new Date(turningYear, parsed.month - 1, parsed.day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (thisYearBday < today) {
    turningYear += 1;
  }
  return turningYear - parsed.year;
}

/**
 * Sorts an array of batchmates by upcoming birthday
 */
export function sortByUpcomingBirthday(members) {
  return [...members].sort((a, b) => {
    const daysA = getDaysUntilBirthday(a.birthday);
    const daysB = getDaysUntilBirthday(b.birthday);
    return daysA - daysB;
  });
}
