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

/**
 * Pricing engine utilities for bookings
 */

/**
 * Calculate number of days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days
 */
export function calculateDays(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param date - Date to check
 * @returns True if weekend
 */
export function isWeekend(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
}

/**
 * Count weekend days in a date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of weekend days
 */
export function countWeekendDays(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  let weekendDays = 0;
  const currentDate = new Date(start);
  
  while (currentDate < end) {
    if (isWeekend(currentDate)) {
      weekendDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return weekendDays;
}

/**
 * Calculate booking pricing with weekend multipliers
 * @param baseRate - Base daily rate
 * @param startDate - Booking start date
 * @param endDate - Booking end date
 * @param options - Pricing options
 * @returns Pricing breakdown
 */
export function calculateBookingPrice(
  baseRate: number,
  startDate: Date | string,
  endDate: Date | string,
  options: {
    weekendMultiplier?: number; // Default 1.2 (20% increase)
    serviceFeeRate?: number; // Default 0.1 (10%)
    taxRate?: number; // Default 0.16 (16% VAT)
  } = {}
) {
  const {
    weekendMultiplier = 1.2,
    serviceFeeRate = 0.1,
    taxRate = 0.16,
  } = options;

  const totalDays = calculateDays(startDate, endDate);
  const weekendDays = countWeekendDays(startDate, endDate);
  const weekdays = totalDays - weekendDays;

  // Calculate daily rates
  const weekdayRate = baseRate;
  const weekendRate = baseRate * weekendMultiplier;

  // Calculate subtotal
  const weekdayAmount = weekdays * weekdayRate;
  const weekendAmount = weekendDays * weekendRate;
  const subtotal = weekdayAmount + weekendAmount;

  // Calculate fees
  const serviceFee = subtotal * serviceFeeRate;
  const taxAmount = (subtotal + serviceFee) * taxRate;
  const totalAmount = subtotal + serviceFee + taxAmount;

  return {
    totalDays,
    weekdays,
    weekendDays,
    weekdayRate,
    weekendRate,
    weekdayAmount,
    weekendAmount,
    subtotal,
    serviceFee,
    taxAmount,
    totalAmount,
  };
}

/**
 * Generate a unique confirmation number for bookings
 * @returns Confirmation number (format: ZEM-YYYYMMDD-XXXX)
 */
export function generateConfirmationNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `ZEM-${datePart}-${randomPart}`;
}

/**
 * Check if two date ranges overlap
 * @param start1 - Start date of first range
 * @param end1 - End date of first range
 * @param start2 - Start date of second range
 * @param end2 - End date of second range
 * @returns True if ranges overlap
 */
export function dateRangesOverlap(
  start1: Date | string,
  end1: Date | string,
  start2: Date | string,
  end2: Date | string
): boolean {
  const s1 = typeof start1 === 'string' ? new Date(start1) : start1;
  const e1 = typeof end1 === 'string' ? new Date(end1) : end1;
  const s2 = typeof start2 === 'string' ? new Date(start2) : start2;
  const e2 = typeof end2 === 'string' ? new Date(end2) : end2;
  
  return s1 < e2 && s2 < e1;
}
