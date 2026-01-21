/**
 * Unit Tests: WhatsApp Client
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Tests cover:
 * - isConfigured() returns correct values based on env vars
 * - isValidPhoneNumber() validates E.164 format
 * - sendMessage() handles valid/invalid inputs
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock axios before importing the module
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
    })),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
  logError: vi.fn(),
}));

describe('WhatsApp Client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up environment
    delete process.env.WHATSAPP_API_KEY;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    vi.restoreAllMocks();
  });

  describe('isConfigured()', () => {
    it('should return true when all required env vars are set', async () => {
      process.env.WHATSAPP_API_KEY = 'test-api-key';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '123456';
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ba-123';

      const { isConfigured } = await import('../client');
      expect(isConfigured()).toBe(true);
    });

    it('should return false when API_KEY is missing', async () => {
      delete process.env.WHATSAPP_API_KEY;
      process.env.WHATSAPP_PHONE_NUMBER_ID = '123456';
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ba-123';

      const { isConfigured } = await import('../client');
      expect(isConfigured()).toBe(false);
    });

    it('should return false when PHONE_NUMBER_ID is missing', async () => {
      process.env.WHATSAPP_API_KEY = 'test-api-key';
      delete process.env.WHATSAPP_PHONE_NUMBER_ID;
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ba-123';

      const { isConfigured } = await import('../client');
      expect(isConfigured()).toBe(false);
    });

    it('should return false when BUSINESS_ACCOUNT_ID is missing', async () => {
      process.env.WHATSAPP_API_KEY = 'test-api-key';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '123456';
      delete process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

      const { isConfigured } = await import('../client');
      expect(isConfigured()).toBe(false);
    });

    it('should return false when all env vars are missing', async () => {
      delete process.env.WHATSAPP_API_KEY;
      delete process.env.WHATSAPP_PHONE_NUMBER_ID;
      delete process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

      const { isConfigured } = await import('../client');
      expect(isConfigured()).toBe(false);
    });
  });

  describe('isValidPhoneNumber()', () => {
    it('should return true for valid E.164 phone numbers', async () => {
      process.env.WHATSAPP_API_KEY = 'test';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '123';
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ba';

      const { isValidPhoneNumber } = await import('../client');

      expect(isValidPhoneNumber('+15551234567')).toBe(true);
      expect(isValidPhoneNumber('+442079460958')).toBe(true);
      expect(isValidPhoneNumber('+18005550100')).toBe(true);
      expect(isValidPhoneNumber('+12025551234')).toBe(true);
    });

    it('should return false for phone numbers without plus sign', async () => {
      process.env.WHATSAPP_API_KEY = 'test';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '123';
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ba';

      const { isValidPhoneNumber } = await import('../client');

      expect(isValidPhoneNumber('15551234567')).toBe(false);
      expect(isValidPhoneNumber('5551234567')).toBe(false);
    });

    it('should return false for phone numbers with formatting characters', async () => {
      process.env.WHATSAPP_API_KEY = 'test';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '123';
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ba';

      const { isValidPhoneNumber } = await import('../client');

      expect(isValidPhoneNumber('+1-555-123-4567')).toBe(false);
      expect(isValidPhoneNumber('+1 (555) 123-4567')).toBe(false);
      expect(isValidPhoneNumber('+1.555.123.4567')).toBe(false);
    });

    it('should return false for empty string', async () => {
      process.env.WHATSAPP_API_KEY = 'test';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '123';
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ba';

      const { isValidPhoneNumber } = await import('../client');

      expect(isValidPhoneNumber('')).toBe(false);
    });

    it('should return false for invalid formats', async () => {
      process.env.WHATSAPP_API_KEY = 'test';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '123';
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ba';

      const { isValidPhoneNumber } = await import('../client');

      expect(isValidPhoneNumber('+0')).toBe(false); // Cannot start with 0
      expect(isValidPhoneNumber('+')).toBe(false); // Just plus sign
      expect(isValidPhoneNumber('abc')).toBe(false); // Letters
    });
  });

  describe('sendMessage()', () => {
    it('should return error for invalid phone number format', async () => {
      process.env.WHATSAPP_API_KEY = 'test-api-key';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '123456';
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ba-123';

      const { sendMessage } = await import('../client');
      const result = await sendMessage('+1-555-123-4567', 'Hello'); // Has dashes

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid phone number format');
    });

    it('should return error for phone without plus sign', async () => {
      process.env.WHATSAPP_API_KEY = 'test-api-key';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '123456';
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ba-123';

      const { sendMessage } = await import('../client');
      const result = await sendMessage('15551234567', 'Hello');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid phone number format');
    });

    it('should return error for empty phone number', async () => {
      process.env.WHATSAPP_API_KEY = 'test-api-key';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '123456';
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ba-123';

      const { sendMessage } = await import('../client');
      const result = await sendMessage('', 'Hello');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid phone number format');
    });

    it('should return error when WhatsApp is not configured', async () => {
      delete process.env.WHATSAPP_API_KEY;

      const { sendMessage } = await import('../client');
      const result = await sendMessage('+15551234567', 'Hello');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not configured');
    });
  });

  describe('sendTemplateMessage()', () => {
    it('should return error for invalid phone number', async () => {
      process.env.WHATSAPP_API_KEY = 'test-api-key';
      process.env.WHATSAPP_PHONE_NUMBER_ID = '123456';
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ba-123';

      const { sendTemplateMessage } = await import('../client');
      const result = await sendTemplateMessage('invalid-phone', 'template_name');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid phone number format');
    });

    it('should return error when WhatsApp is not configured', async () => {
      delete process.env.WHATSAPP_API_KEY;

      const { sendTemplateMessage } = await import('../client');
      const result = await sendTemplateMessage('+15551234567', 'template_name');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not configured');
    });
  });

  describe('sendBatchMessages()', () => {
    it('should return all failures when WhatsApp is not configured', async () => {
      delete process.env.WHATSAPP_API_KEY;

      const { sendBatchMessages } = await import('../client');
      const messages = [
        { to: '+15551234567', message: 'Test 1' },
        { to: '+15551234568', message: 'Test 2' },
      ];

      const result = await sendBatchMessages(messages);

      expect(result.total).toBe(2);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(2);
      expect(result.results.every((r) => r.success === false)).toBe(true);
    });
  });
});
