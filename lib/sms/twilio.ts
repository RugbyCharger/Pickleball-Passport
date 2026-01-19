/**
 * Twilio SMS Service
 * E11-S6: SMS Notifications
 *
 * Provides utilities for sending SMS via Twilio API
 * Follows the same pattern as SendGrid email service
 */

import type { Twilio } from 'twilio';
import { createLogger, logError } from '@/lib/logger';

const smsLogger = createLogger('sms');

// Initialize Twilio with credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

const isConfiguredFlag = !!(accountSid && authToken && phoneNumber);

let twilioClientPromise: Promise<Twilio> | null = null;

// Lazy initialization of Twilio client
async function getTwilioClient(): Promise<Twilio> {
  if (!isConfiguredFlag) {
    throw new Error('Twilio credentials are not configured');
  }

  if (!twilioClientPromise) {
    twilioClientPromise = import('twilio').then(({ default: twilio }) => {
      return twilio(accountSid, authToken);
    });
  }

  return twilioClientPromise;
}

if (!isConfiguredFlag) {
  smsLogger.warn('Twilio credentials are not set. SMS functionality will be disabled.');
}

const FROM_PHONE = phoneNumber || '';

export interface SendSMSOptions {
  to: string; // E.164 format: "+15551234567"
  message: string; // Brief, actionable text
  from?: string; // Optional override of default Twilio number
}

/**
 * Validate phone number format (E.164)
 * Format: +[country code][number]
 * Example: "+15551234567"
 */
export function isValidPhoneNumber(phone: string): boolean {
  // E.164 format: +[1-9][0-14 digits]
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

/**
 * Format phone number for logging (mask sensitive data)
 * Shows only last 4 digits: "+1555****5678"
 */
function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return '****';
  const last4 = phone.slice(-4);
  const masked = phone.slice(0, -4).replace(/\d/g, '*');
  return `${masked}${last4}`;
}

/**
 * Send an SMS using Twilio
 * 
 * @param options - SMS options (to, message, from)
 * @throws Never throws - logs errors and returns gracefully
 */
export async function sendSMS(options: SendSMSOptions): Promise<void> {
  // Validate phone number format
  if (!isValidPhoneNumber(options.to)) {
    smsLogger.warn(
      { to: maskPhoneNumber(options.to) },
      'Invalid phone number format - must be E.164 (e.g., +15551234567)'
    );
    return;
  }

  // Check if Twilio is configured
  if (!isConfiguredFlag) {
    smsLogger.warn(
      { to: maskPhoneNumber(options.to) },
      'Twilio not configured - SMS not sent'
    );
    return;
  }

  try {
    const client = await getTwilioClient();
    const fromNumber = options.from || FROM_PHONE;

    const result = await client.messages.create({
      body: options.message,
      from: fromNumber,
      to: options.to,
    });

    smsLogger.info(
      {
        to: maskPhoneNumber(options.to),
        from: maskPhoneNumber(fromNumber),
        messageSid: result.sid,
        status: result.status,
      },
      'SMS sent successfully'
    );
  } catch (error) {
    // Log error but don't throw - SMS failures should not block critical flows
    logError(smsLogger, error, 'Failed to send SMS', {
      to: maskPhoneNumber(options.to),
      from: maskPhoneNumber(options.from || FROM_PHONE),
    });
  }
}

/**
 * Send multiple SMS messages in batch
 * 
 * @param messages - Array of SMS options
 */
export async function sendBatchSMS(messages: SendSMSOptions[]): Promise<void> {
  if (!isConfiguredFlag) {
    smsLogger.warn({ count: messages.length }, 'Twilio not configured - batch SMS not sent');
    return;
  }

  const results = await Promise.allSettled(
    messages.map((msg) => sendSMS(msg))
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  smsLogger.info(
    {
      total: messages.length,
      successful,
      failed,
    },
    'Batch SMS completed'
  );
}

/**
 * Verify Twilio configuration
 */
export function isConfigured(): boolean {
  return isConfiguredFlag;
}
