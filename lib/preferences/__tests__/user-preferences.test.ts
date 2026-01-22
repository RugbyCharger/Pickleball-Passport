import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUserPreferences, canSendNotification, updateUserPreferences, unsubscribeFromAll } from '../user-preferences';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
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

    (db.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: mockPrefs,
    });

    const result = await getUserPreferences('user_123');
    expect(result).toEqual(mockPrefs);
  });

  it('should return default preferences when user has no preferences', async () => {
    (db.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: null,
    });

    const result = await getUserPreferences('user_123');
    expect(result.emailPreTripSequence).toBe(true);
    expect(result.emailMarketing).toBe(false);
  });

  it('should throw error when user not found', async () => {
    (db.user.findUnique as any).mockResolvedValue(null);
    await expect(getUserPreferences('nonexistent')).rejects.toThrow('User not found');
  });
});

describe('canSendNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when preference is enabled', async () => {
    (db.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: { emailPreTripSequence: true },
    });

    const result = await canSendNotification('user_123', 'emailPreTripSequence');
    expect(result).toBe(true);
  });

  it('should return false when preference is disabled', async () => {
    (db.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: { emailMarketing: false },
    });

    const result = await canSendNotification('user_123', 'emailMarketing');
    expect(result).toBe(false);
  });

  it('should use default when preference not set', async () => {
    (db.user.findUnique as any).mockResolvedValue({
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
    (db.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: { emailMarketing: false },
    });

    (db.user.update as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: { emailMarketing: true },
    });

    await updateUserPreferences('user_123', { emailMarketing: true });

    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: 'user_123' },
      data: {
        notificationPreferences: expect.objectContaining({ emailMarketing: true }),
        preferenceUpdatedAt: expect.any(Date),
      },
    });
  });

  it('should merge with existing preferences', async () => {
    (db.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: { emailMarketing: false, smsEnabled: true },
    });

    (db.user.update as any).mockResolvedValue({
      id: 'user_123',
    });

    await updateUserPreferences('user_123', { emailMarketing: true });

    expect(db.user.update).toHaveBeenCalledWith({
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
    (db.user.findUnique as any).mockResolvedValue({
      id: 'user_123',
      notificationPreferences: {
        emailPreTripSequence: true,
        emailMarketing: true,
      },
    });

    (db.user.update as any).mockResolvedValue({ id: 'user_123' });

    await unsubscribeFromAll('user_123');

    expect(db.user.update).toHaveBeenCalledWith({
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
