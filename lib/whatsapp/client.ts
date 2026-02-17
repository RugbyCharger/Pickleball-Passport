/**
 * WhatsApp Business API Client
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Provides utilities for sending WhatsApp messages via the Meta Business API.
 * Follows the same pattern as Twilio SMS service (lib/sms/twilio.ts).
 *
 * API Reference: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { createLogger, logError } from '@/lib/logger';

const whatsappLogger = createLogger('whatsapp');

// WhatsApp Business API Configuration
const apiKey = process.env.WHATSAPP_API_KEY;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

const BASE_URL = 'https://graph.facebook.com/v18.0';

const isConfiguredFlag = !!(apiKey && phoneNumberId && businessAccountId);

if (!isConfiguredFlag) {
  whatsappLogger.warn(
    'WhatsApp credentials are not set. WhatsApp messaging functionality will be disabled.'
  );
}

// Lazy initialization of axios client
let axiosClientPromise: Promise<AxiosInstance> | null = null;

async function getAxiosClient(): Promise<AxiosInstance> {
  if (!isConfiguredFlag) {
    throw new Error('WhatsApp credentials are not configured');
  }

  if (!axiosClientPromise) {
    axiosClientPromise = Promise.resolve(
      axios.create({
        baseURL: BASE_URL,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      })
    );
  }

  return axiosClientPromise;
}

/**
 * WhatsApp message types
 */
export interface WhatsAppTextMessage {
  type: 'text';
  to: string;
  message: string;
}

export interface WhatsAppTemplateParameter {
  type: 'text';
  text: string;
}

export interface WhatsAppTemplateMessage {
  type: 'template';
  to: string;
  templateName: string;
  languageCode?: string;
  parameters?: Record<string, string>;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SendTemplateResult {
  success: boolean;
  messageId?: string;
  error?: string;
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
 * Check if WhatsApp is properly configured
 */
export function isConfigured(): boolean {
  return isConfiguredFlag;
}

/**
 * Get the webhook verify token
 */
export function getWebhookVerifyToken(): string | undefined {
  return webhookVerifyToken;
}

/**
 * Send a text message via WhatsApp
 *
 * @param to - Recipient phone number in E.164 format (e.g., "+15551234567")
 * @param message - Text message to send
 * @returns Result object with success status and message ID
 *
 * @example
 * const result = await sendMessage('+15551234567', 'Hello from The Pickleball Passport!');
 * if (result.success) {
 *   console.log('Message sent:', result.messageId);
 * }
 */
export async function sendMessage(
  to: string,
  message: string
): Promise<SendMessageResult> {
  // Validate phone number format
  if (!isValidPhoneNumber(to)) {
    whatsappLogger.warn(
      { to: maskPhoneNumber(to) },
      'Invalid phone number format - must be E.164 (e.g., +15551234567)'
    );
    return {
      success: false,
      error: 'Invalid phone number format',
    };
  }

  // Check if WhatsApp is configured
  if (!isConfiguredFlag) {
    whatsappLogger.warn(
      { to: maskPhoneNumber(to) },
      'WhatsApp not configured - message not sent'
    );
    return {
      success: false,
      error: 'WhatsApp not configured',
    };
  }

  try {
    const client = await getAxiosClient();

    // Remove the leading '+' for WhatsApp API (they use just the number)
    const recipientNumber = to.replace(/^\+/, '');

    const response = await client.post(`/${phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientNumber,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    });

    const messageId = response.data?.messages?.[0]?.id;

    whatsappLogger.info(
      {
        to: maskPhoneNumber(to),
        messageId,
      },
      'WhatsApp message sent successfully'
    );

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{
      error?: {
        message?: string;
        code?: number;
        error_subcode?: number;
      };
    }>;

    const errorMessage =
      axiosError.response?.data?.error?.message ||
      axiosError.message ||
      'Unknown error';

    // Log error but don't throw - WhatsApp failures should not block critical flows
    logError(whatsappLogger, error, 'Failed to send WhatsApp message', {
      to: maskPhoneNumber(to),
      errorCode: axiosError.response?.data?.error?.code,
      errorSubcode: axiosError.response?.data?.error?.error_subcode,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send a template message via WhatsApp
 *
 * Template messages must be pre-approved by Meta and use specific templates
 * registered in your WhatsApp Business Manager.
 *
 * @param to - Recipient phone number in E.164 format (e.g., "+15551234567")
 * @param templateName - Name of the pre-approved template
 * @param parameters - Optional parameters to substitute in the template
 * @param languageCode - Language code for the template (default: "en")
 * @returns Result object with success status and message ID
 *
 * @example
 * const result = await sendTemplateMessage(
 *   '+15551234567',
 *   'trip_group_invitation',
 *   { guest_name: 'John', trip_name: 'Cabo Adventure', invite_link: 'https://...' }
 * );
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  parameters?: Record<string, string>,
  languageCode: string = 'en'
): Promise<SendTemplateResult> {
  // Validate phone number format
  if (!isValidPhoneNumber(to)) {
    whatsappLogger.warn(
      { to: maskPhoneNumber(to), templateName },
      'Invalid phone number format - must be E.164 (e.g., +15551234567)'
    );
    return {
      success: false,
      error: 'Invalid phone number format',
    };
  }

  // Check if WhatsApp is configured
  if (!isConfiguredFlag) {
    whatsappLogger.warn(
      { to: maskPhoneNumber(to), templateName },
      'WhatsApp not configured - template message not sent'
    );
    return {
      success: false,
      error: 'WhatsApp not configured',
    };
  }

  try {
    const client = await getAxiosClient();

    // Remove the leading '+' for WhatsApp API
    const recipientNumber = to.replace(/^\+/, '');

    // Build template components if parameters provided
    const components: Array<{
      type: string;
      parameters: Array<{ type: string; text: string }>;
    }> = [];

    if (parameters && Object.keys(parameters).length > 0) {
      // Convert parameters object to ordered array for body component
      const bodyParameters = Object.values(parameters).map((value) => ({
        type: 'text' as const,
        text: value,
      }));

      components.push({
        type: 'body',
        parameters: bodyParameters,
      });
    }

    const payload: {
      messaging_product: string;
      recipient_type: string;
      to: string;
      type: string;
      template: {
        name: string;
        language: { code: string };
        components?: typeof components;
      };
    } = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
      },
    };

    if (components.length > 0) {
      payload.template.components = components;
    }

    const response = await client.post(`/${phoneNumberId}/messages`, payload);

    const messageId = response.data?.messages?.[0]?.id;

    whatsappLogger.info(
      {
        to: maskPhoneNumber(to),
        templateName,
        messageId,
      },
      'WhatsApp template message sent successfully'
    );

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{
      error?: {
        message?: string;
        code?: number;
        error_subcode?: number;
      };
    }>;

    const errorMessage =
      axiosError.response?.data?.error?.message ||
      axiosError.message ||
      'Unknown error';

    // Log error but don't throw - WhatsApp failures should not block critical flows
    logError(whatsappLogger, error, 'Failed to send WhatsApp template message', {
      to: maskPhoneNumber(to),
      templateName,
      errorCode: axiosError.response?.data?.error?.code,
      errorSubcode: axiosError.response?.data?.error?.error_subcode,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send multiple messages in batch (non-blocking)
 *
 * @param messages - Array of text messages to send
 * @returns Summary of batch results
 */
export async function sendBatchMessages(
  messages: Array<{ to: string; message: string }>
): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: SendMessageResult[];
}> {
  if (!isConfiguredFlag) {
    whatsappLogger.warn(
      { count: messages.length },
      'WhatsApp not configured - batch messages not sent'
    );
    return {
      total: messages.length,
      successful: 0,
      failed: messages.length,
      results: messages.map(() => ({
        success: false,
        error: 'WhatsApp not configured',
      })),
    };
  }

  const results = await Promise.all(
    messages.map((msg) => sendMessage(msg.to, msg.message))
  );

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  whatsappLogger.info(
    {
      total: messages.length,
      successful,
      failed,
    },
    'Batch WhatsApp messages completed'
  );

  return {
    total: messages.length,
    successful,
    failed,
    results,
  };
}

// Export logger for use by other WhatsApp modules
export { whatsappLogger };
