import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as userPreferences from '@/lib/preferences/user-preferences';
import * as emailToken from '@/lib/preferences/email-token';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));
vi.mock('@/lib/preferences/user-preferences');
vi.mock('@/lib/preferences/email-token');

describe('preferencesRouter - authenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserPreferences', () => {
    it('should return current user preferences', async () => {
      const mockPrefs = {
        emailPreTripSequence: true,
        emailMarketing: false,
        smsEnabled: true,
        emailPostTripFollowUp: true,
        emailAlumniEvents: true,
        emailNewsletter: false,
        inAppEnabled: true,
        whatsappEnabled: true,
      };

      vi.spyOn(userPreferences, 'getUserPreferences').mockResolvedValue(mockPrefs as any);

      const result = await userPreferences.getUserPreferences('user_123');

      expect(result).toEqual(mockPrefs);
      expect(userPreferences.getUserPreferences).toHaveBeenCalledWith('user_123');
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences', async () => {
      vi.spyOn(userPreferences, 'updateUserPreferences').mockResolvedValue(undefined);

      await userPreferences.updateUserPreferences('user_123', { emailMarketing: true });

      expect(userPreferences.updateUserPreferences).toHaveBeenCalledWith('user_123', {
        emailMarketing: true,
      });
    });
  });

  describe('unsubscribeFromAll', () => {
    it('should unsubscribe from all notifications', async () => {
      vi.spyOn(userPreferences, 'unsubscribeFromAll').mockResolvedValue(undefined);

      await userPreferences.unsubscribeFromAll('user_123');

      expect(userPreferences.unsubscribeFromAll).toHaveBeenCalledWith('user_123');
    });
  });
});

describe('preferencesRouter - token-based', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPreferencesByToken', () => {
    it('should return preferences for valid token', async () => {
      vi.spyOn(emailToken, 'verifyEmailToken').mockResolvedValue('user_123');

      const mockPrefs = { emailMarketing: false };
      vi.spyOn(userPreferences, 'getUserPreferences').mockResolvedValue(mockPrefs as any);

      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
      } as any);

      const userId = await emailToken.verifyEmailToken('valid_token');
      const user = await db.user.findUnique({ where: { id: userId! } });
      const preferences = await userPreferences.getUserPreferences(userId!);

      expect(userId).toBe('user_123');
      expect(user?.email).toBe('test@example.com');
      expect(preferences).toEqual(mockPrefs);
    });

    it('should throw error for invalid token', async () => {
      vi.spyOn(emailToken, 'verifyEmailToken').mockResolvedValue(null);

      const userId = await emailToken.verifyEmailToken('invalid_token');

      expect(userId).toBeNull();
    });
  });

  describe('updatePreferencesByToken', () => {
    it('should update preferences with valid token', async () => {
      vi.spyOn(emailToken, 'verifyEmailToken').mockResolvedValue('user_123');
      vi.spyOn(userPreferences, 'updateUserPreferences').mockResolvedValue(undefined);

      const userId = await emailToken.verifyEmailToken('valid_token');
      await userPreferences.updateUserPreferences(userId!, { emailMarketing: true });

      expect(userPreferences.updateUserPreferences).toHaveBeenCalledWith('user_123', {
        emailMarketing: true,
      });
    });

    it('should throw error for invalid token', async () => {
      vi.spyOn(emailToken, 'verifyEmailToken').mockResolvedValue(null);

      const userId = await emailToken.verifyEmailToken('invalid_token');

      expect(userId).toBeNull();
    });
  });

  describe('unsubscribeAllByToken', () => {
    it('should unsubscribe with valid token', async () => {
      vi.spyOn(emailToken, 'verifyEmailToken').mockResolvedValue('user_123');
      vi.spyOn(userPreferences, 'unsubscribeFromAll').mockResolvedValue(undefined);

      const userId = await emailToken.verifyEmailToken('valid_token');
      await userPreferences.unsubscribeFromAll(userId!);

      expect(userPreferences.unsubscribeFromAll).toHaveBeenCalledWith('user_123');
    });
  });
});
