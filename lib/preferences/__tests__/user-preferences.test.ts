import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUserPreferences, canSendNotification, updateUserPreferences, unsubscribeFromAll } from '../user-preferences';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('getUserPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user preferences when user exists', async () => {
    const mockPrefs = {
      emailPreTripSequence: true,
      emailPostTripFollowUp: false,
      emailAlumniEvents: true,
      emailMarketing: false,
      emailNewsletter: false,
      smsEnabled: true,
      inAppEnabled: true,
      whatsappEnabled: true,
    };

    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: mockPrefs,
    });

    const result = await getUserPreferences('user_123');
    expect(result).toEqual(mockPrefs);
  });

  it('should return default preferences when user has no preferences', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: null,
    });

    const result = await getUserPreferences('user_123');
    expect(result.emailPreTripSequence).toBe(true);
    expect(result.emailMarketing).toBe(false);
  });

  it('should throw error when user not found', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    await expect(getUserPreferences('nonexistent')).rejects.toThrow('User not found');
  });
});

describe('canSendNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when preference is enabled', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: { emailPreTripSequence: true },
    });

    const result = await canSendNotification('user_123', 'emailPreTripSequence');
    expect(result).toBe(true);
  });

  it('should return false when preference is disabled', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: { emailMarketing: false },
    });

    const result = await canSendNotification('user_123', 'emailMarketing');
    expect(result).toBe(false);
  });

  it('should use default when preference not set', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: {},
    });

    const result = await canSendNotification('user_123', 'emailPreTripSequence');
    expect(result).toBe(true); // Default is true
  });
});

describe('updateUserPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user preferences', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: { emailMarketing: false },
    });

    (prisma.user.update as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: { emailMarketing: true },
    });

    await updateUserPreferences('user_123', { emailMarketing: true });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_123' },
      data: {
        notificationPreferences: expect.objectContaining({ emailMarketing: true }),
        preferenceUpdatedAt: expect.any(Date),
      },
    });
  });

  it('should merge with existing preferences', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: { emailMarketing: false, smsEnabled: true },
    });

    (prisma.user.update as any).mockResolvedValue({
      id: 'user_123',
    });

    await updateUserPreferences('user_123', { emailMarketing: true });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_123' },
      data: {
        notificationPreferences: expect.objectContaining({
          emailMarketing: true,
          smsEnabled: true,
        }),
        preferenceUpdatedAt: expect.any(Date),
      },
    });
  });
});

describe('unsubscribeFromAll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should disable all optional notifications', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: {
        emailPreTripSequence: true,
        emailMarketing: true,
      },
    });

    (prisma.user.update as any).mockResolvedValue({ id: 'user_123' });

    await unsubscribeFromAll('user_123');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_123' },
      data: {
        notificationPreferences: {
          emailPreTripSequence: false,
          emailPostTripFollowUp: false,
          emailAlumniEvents: false,
          emailMarketing: false,
          emailNewsletter: false,
          smsEnabled: false,
          inAppEnabled: false,
          whatsappEnabled: false,
        },
        preferenceUpdatedAt: expect.any(Date),
      },
    });
  });
});
