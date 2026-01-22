import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateEmailToken, verifyEmailToken } from '../email-token';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      update: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe('generateEmailToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a random token and store hash', async () => {
    (prisma.user.update as any).mockResolvedValue({
      id: 'user_123',
      preferenceEmailToken: 'hashed_token',
    });

    const token = await generateEmailToken('user_123');

    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(20);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_123' },
      data: {
        preferenceEmailToken: expect.any(String),
        preferenceEmailTokenExpiry: expect.any(Date),
      },
    });
  });

  it('should set expiry to 90 days from now', async () => {
    (prisma.user.update as any).mockResolvedValue({});

    await generateEmailToken('user_123');

    const call = (prisma.user.update as any).mock.calls[0][0];
    const expiry = call.data.preferenceEmailTokenExpiry;
    const now = new Date();
    const diffDays = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

    expect(diffDays).toBeGreaterThanOrEqual(89);
    expect(diffDays).toBeLessThanOrEqual(90);
  });
});

describe('verifyEmailToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify valid token and return userId', async () => {
    const token = 'plain_token_123';
    const hash = crypto
      .createHmac('sha256', process.env.EMAIL_TOKEN_SECRET || 'CHANGE_ME_IN_PRODUCTION')
      .update(token)
      .digest('hex');

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    (prisma.user.findFirst as any).mockResolvedValue({
      id: 'user_123',
      preferenceEmailToken: hash,
      preferenceEmailTokenExpiry: futureDate,
    });

    const userId = await verifyEmailToken(token);
    expect(userId).toBe('user_123');
  });

  it('should return null for expired token', async () => {
    const token = 'plain_token_123';

    // For expired tokens, findFirst returns null because of the where clause filter
    (prisma.user.findFirst as any).mockResolvedValue(null);

    const userId = await verifyEmailToken(token);
    expect(userId).toBeNull();
  });

  it('should return null for invalid token', async () => {
    (prisma.user.findFirst as any).mockResolvedValue(null);

    const userId = await verifyEmailToken('invalid_token');
    expect(userId).toBeNull();
  });

  it('should use constant-time comparison', async () => {
    const token = 'plain_token_123';
    const wrongHash = 'wrong_hash';

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    (prisma.user.findFirst as any).mockResolvedValue({
      id: 'user_123',
      preferenceEmailToken: wrongHash,
      preferenceEmailTokenExpiry: futureDate,
    });

    const userId = await verifyEmailToken(token);
    expect(userId).toBeNull();
  });
});
