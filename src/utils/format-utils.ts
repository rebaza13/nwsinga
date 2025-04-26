/**
 * Format a number as Iraqi Dinar (IQD) currency
 * @param value The number to format
 * @param minimumFractionDigits Minimum number of decimal places (default: 0)
 * @param maximumFractionDigits Maximum number of decimal places (default: 0)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number, 
  minimumFractionDigits = 0, 
  maximumFractionDigits = 0
): string {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
}

/**
 * Format a date string or Date object to a localized date string
 * @param date Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return '';

  if (typeof date === 'string') {
    try {
      // Try to parse as a date string
      return new Date(date).toLocaleDateString();
    } catch {
      // If parsing fails, return empty string
      return '';
    }
  }

  // Handle Firestore timestamp object
  if (date && typeof date === 'object' && 'seconds' in date) {
    return new Date((date as { seconds: number }).seconds * 1000).toLocaleDateString();
  }

  if (date instanceof Date) {
    return date.toLocaleDateString();
  }

  return '';
}

/**
 * Format a month string (YYYY-MM) to a localized month and year string
 * @param monthStr Month string in format YYYY-MM
 * @returns Formatted month and year string
 */
export function formatMonthYear(monthStr: string): string {
  if (!monthStr) return '';

  const parts = monthStr.split('-');
  if (parts.length !== 2) return monthStr;

  const year = parts[0];
  const month = parts[1];

  if (!year || !month) return monthStr;

  try {
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  } catch {
    return monthStr;
  }
}

/**
 * Capitalize the first letter of a string
 * @param str String to capitalize
 * @returns Capitalized string
 */
export function capitalizeFirst(str: string | undefined): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
