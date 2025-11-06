import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * This prevents conflicting classes and maintains proper CSS precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for Zambian market
 * @param amount - Amount in Kwacha
 * @param showSymbol - Whether to show currency symbol
 */
export function formatCurrency(amount: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('en-ZM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return showSymbol ? `K ${formatted}` : formatted;
}

/**
 * Format phone number for Zambian format
 * @param phone - Phone number string
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Handle Zambian phone numbers
  if (cleaned.startsWith('260')) {
    // International format: +260 97 123 4567
    const match = cleaned.match(/^(260)(\d{2})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
  } else if (cleaned.startsWith('09') || cleaned.startsWith('07') || cleaned.startsWith('06')) {
    // Local format: 097 123 4567
    const match = cleaned.match(/^(0\d{2})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
  }

  return phone; // Return original if no pattern matches
}

/**
 * Validate Zambian phone number
 * @param phone - Phone number to validate
 */
export function isValidZambianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');

  // Check for valid Zambian phone patterns
  const zambianPatterns = [
    /^260\d{9}$/, // International: 260xxxxxxxxx
    /^0[967]\d{8}$/, // Local: 09xxxxxxxx, 07xxxxxxxx, 06xxxxxxxx
  ];

  return zambianPatterns.some(pattern => pattern.test(cleaned));
}

/**
 * Generate a random ID for client-side use
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce function for search and API calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format date for local display
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-ZM', options).format(dateObj);
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param lat1 - Latitude 1
 * @param lon1 - Longitude 1
 * @param lat2 - Latitude 2
 * @param lon2 - Longitude 2
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Check if device is mobile based on user agent
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get initials from a name
 * @param name - Full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

/**
 * Sleep utility for async operations
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if string is empty or only whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, letter => letter.toUpperCase());
}
