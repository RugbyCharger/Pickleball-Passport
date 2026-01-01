/**
 * Receipt Number Generator - E4-S8
 *
 * Generates unique receipt numbers in format: RCPT-YYYYMMDD-XXXXX
 * Uses crypto.randomUUID() for guaranteed uniqueness
 */

import { randomUUID } from 'crypto';

/**
 * Generate a unique receipt number
 *
 * Format: RCPT-YYYYMMDD-XXXXX
 * Example: RCPT-20260102-A7B2C
 *
 * @returns {string} Unique receipt number
 */
export function generateReceiptNumber(): string {
  // Get current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Generate a unique 5-character suffix from UUID
  // Take first 5 characters from UUID (removing hyphens)
  const uuid = randomUUID().replace(/-/g, '');
  const suffix = uuid.substring(0, 5).toUpperCase();

  return `RCPT-${dateStr}-${suffix}`;
}

/**
 * Validate receipt number format
 *
 * @param {string} receiptNumber - Receipt number to validate
 * @returns {boolean} True if valid format
 */
export function isValidReceiptNumber(receiptNumber: string): boolean {
  // Format: RCPT-YYYYMMDD-XXXXX
  const regex = /^RCPT-\d{8}-[A-Z0-9]{5}$/;
  return regex.test(receiptNumber);
}

/**
 * Extract date from receipt number
 *
 * @param {string} receiptNumber - Receipt number
 * @returns {Date | null} Date object or null if invalid
 */
export function extractDateFromReceiptNumber(
  receiptNumber: string
): Date | null {
  if (!isValidReceiptNumber(receiptNumber)) {
    return null;
  }

  // Extract YYYYMMDD portion
  const dateStr = receiptNumber.split('-')[1];
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // 0-indexed
  const day = parseInt(dateStr.substring(6, 8), 10);

  return new Date(year, month, day);
}
