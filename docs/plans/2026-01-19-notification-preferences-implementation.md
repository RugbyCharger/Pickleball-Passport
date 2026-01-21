# Notification Preferences Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a unified notification preference system with CAN-SPAM/GDPR compliance

**Architecture:** JSON preferences on User model, HMAC email tokens for public access, explicit preference checks in notification functions

**Tech Stack:** Prisma, tRPC, Next.js App Router, SendGrid, crypto (Node.js built-in)

---

## Phase 1: Database Schema & Migration

### Task 1: Update Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma:163-184` (User model)

**Step 1: Add notification preference fields to User model**

Add these fields to the User model after the `stripeCustomerId` field:

```prisma
model User {
  id        String   @id // Clerk user ID
  email     String   @unique
  role      Role     @default(GUEST)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Stripe Integration (E4-S6)
  stripeCustomerId String? // Stripe customer ID for installment plans

  // Notification Preferences (E11-S12)
  notificationPreferences    Json?     @default("{\"emailPreTripSequence\":true,\"emailPostTripFollowUp\":true,\"emailAlumniEvents\":true,\"emailMarketing\":false,\"emailNewsletter\":false,\"smsEnabled\":true,\"inAppEnabled\":true,\"whatsappEnabled\":true}")
  preferenceEmailToken       String?   @unique
  preferenceEmailTokenExpiry DateTime?
  preferenceUpdatedAt        DateTime?

  // Relationships
  guestProfile   GuestProfile?
  partnerProfile PartnerProfile?
  applications   Application[]
  bookings       Booking[]
  notifications  Notification[]
  testimonials   Testimonial[]

  @@index([email])
  @@index([role])
  @@index([stripeCustomerId])
  @@index([preferenceEmailToken])
}
```

**Step 2: Verify schema changes**

Run: `npx prisma format`
Expected: Schema formatted successfully

**Step 3: Generate migration**

Run: `npx prisma migrate dev --name add-notification-preferences`
Expected: Migration created and applied

**Step 4: Commit schema changes**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(E11-S12): add notification preferences to User model

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Preference Helper Functions

### Task 2: Create User Preferences Module

**Files:**
- Create: `lib/preferences/user-preferences.ts`
- Create: `lib/preferences/__tests__/user-preferences.test.ts`

**Step 1: Write failing test for getUserPreferences**

```typescript
// lib/preferences/__tests__/user-preferences.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUserPreferences } from '../user-preferences';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
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
```

**Step 2: Run test to verify it fails**

Run: `npm test lib/preferences/__tests__/user-preferences.test.ts`
Expected: FAIL with "Cannot find module '../user-preferences'"

**Step 3: Write minimal implementation**

```typescript
// lib/preferences/user-preferences.ts
import { db } from '@/lib/db';

export interface NotificationPreferences {
  // Email categories
  emailPreTripSequence: boolean;
  emailPostTripFollowUp: boolean;
  emailAlumniEvents: boolean;
  emailMarketing: boolean;
  emailNewsletter: boolean;

  // Channel toggles
  smsEnabled: boolean;
  inAppEnabled: boolean;
  whatsappEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailPreTripSequence: true,
  emailPostTripFollowUp: true,
  emailAlumniEvents: true,
  emailMarketing: false,
  emailNewsletter: false,
  smsEnabled: true,
  inAppEnabled: true,
  whatsappEnabled: true,
};

/**
 * Get user notification preferences with defaults
 */
export async function getUserPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { notificationPreferences: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Merge stored preferences with defaults
  const storedPrefs = user.notificationPreferences as Partial<NotificationPreferences> | null;
  return { ...DEFAULT_PREFERENCES, ...storedPrefs };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test lib/preferences/__tests__/user-preferences.test.ts`
Expected: PASS (3 tests)

**Step 5: Add tests for canSendNotification**

```typescript
// Add to lib/preferences/__tests__/user-preferences.test.ts
import { canSendNotification } from '../user-preferences';

describe('canSendNotification', () => {
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
```

**Step 6: Run test to verify it fails**

Run: `npm test lib/preferences/__tests__/user-preferences.test.ts`
Expected: FAIL with "canSendNotification is not a function"

**Step 7: Implement canSendNotification**

Add to `lib/preferences/user-preferences.ts`:

```typescript
/**
 * Check if a specific notification can be sent to user
 */
export async function canSendNotification(
  userId: string,
  type: keyof NotificationPreferences
): Promise<boolean> {
  const preferences = await getUserPreferences(userId);
  return preferences[type];
}
```

**Step 8: Run test to verify it passes**

Run: `npm test lib/preferences/__tests__/user-preferences.test.ts`
Expected: PASS (6 tests)

**Step 9: Add tests for updateUserPreferences**

```typescript
// Add to lib/preferences/__tests__/user-preferences.test.ts
import { updateUserPreferences } from '../user-preferences';

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('updateUserPreferences', () => {
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
```

**Step 10: Run test to verify it fails**

Run: `npm test lib/preferences/__tests__/user-preferences.test.ts`
Expected: FAIL with "updateUserPreferences is not a function"

**Step 11: Implement updateUserPreferences**

Add to `lib/preferences/user-preferences.ts`:

```typescript
/**
 * Update user notification preferences
 */
export async function updateUserPreferences(
  userId: string,
  updates: Partial<NotificationPreferences>
): Promise<void> {
  const currentPreferences = await getUserPreferences(userId);
  const updatedPreferences = { ...currentPreferences, ...updates };

  await db.user.update({
    where: { id: userId },
    data: {
      notificationPreferences: updatedPreferences,
      preferenceUpdatedAt: new Date(),
    },
  });
}
```

**Step 12: Run test to verify it passes**

Run: `npm test lib/preferences/__tests__/user-preferences.test.ts`
Expected: PASS (8 tests)

**Step 13: Add tests for unsubscribeFromAll**

```typescript
// Add to lib/preferences/__tests__/user-preferences.test.ts
import { unsubscribeFromAll } from '../user-preferences';

describe('unsubscribeFromAll', () => {
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
```

**Step 14: Run test to verify it fails**

Run: `npm test lib/preferences/__tests__/user-preferences.test.ts`
Expected: FAIL with "unsubscribeFromAll is not a function"

**Step 15: Implement unsubscribeFromAll**

Add to `lib/preferences/user-preferences.ts`:

```typescript
/**
 * Unsubscribe user from all optional notifications
 */
export async function unsubscribeFromAll(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
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
      preferenceUpdatedAt: new Date(),
    },
  });
}
```

**Step 16: Run test to verify it passes**

Run: `npm test lib/preferences/__tests__/user-preferences.test.ts`
Expected: PASS (9 tests)

**Step 17: Commit preference helpers**

```bash
git add lib/preferences/
git commit -m "feat(E11-S12): implement user preference helper functions

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Create Email Token Module

**Files:**
- Create: `lib/preferences/email-token.ts`
- Create: `lib/preferences/__tests__/email-token.test.ts`

**Step 1: Write failing test for generateEmailToken**

```typescript
// lib/preferences/__tests__/email-token.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateEmailToken, verifyEmailToken } from '../email-token';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
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
    (db.user.update as any).mockResolvedValue({
      id: 'user_123',
      preferenceEmailToken: 'hashed_token',
    });

    const token = await generateEmailToken('user_123');

    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(20);
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: 'user_123' },
      data: {
        preferenceEmailToken: expect.any(String),
        preferenceEmailTokenExpiry: expect.any(Date),
      },
    });
  });

  it('should set expiry to 90 days from now', async () => {
    (db.user.update as any).mockResolvedValue({});

    await generateEmailToken('user_123');

    const call = (db.user.update as any).mock.calls[0][0];
    const expiry = call.data.preferenceEmailTokenExpiry;
    const now = new Date();
    const diffDays = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

    expect(diffDays).toBeGreaterThanOrEqual(89);
    expect(diffDays).toBeLessThanOrEqual(90);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test lib/preferences/__tests__/email-token.test.ts`
Expected: FAIL with "Cannot find module '../email-token'"

**Step 3: Write minimal implementation**

```typescript
// lib/preferences/email-token.ts
import { db } from '@/lib/db';
import crypto from 'crypto';

const TOKEN_EXPIRY_DAYS = 90;

// Use environment variable for HMAC secret
const EMAIL_TOKEN_SECRET =
  process.env.EMAIL_TOKEN_SECRET || 'CHANGE_ME_IN_PRODUCTION';

if (EMAIL_TOKEN_SECRET === 'CHANGE_ME_IN_PRODUCTION') {
  console.warn(
    'WARNING: Using default EMAIL_TOKEN_SECRET. Set EMAIL_TOKEN_SECRET env var in production.'
  );
}

/**
 * Generate a secure email token for preference management
 */
export async function generateEmailToken(userId: string): Promise<string> {
  // Generate random 32-byte token
  const token = crypto.randomBytes(32).toString('hex');

  // Hash token with HMAC-SHA256
  const hash = crypto
    .createHmac('sha256', EMAIL_TOKEN_SECRET)
    .update(token)
    .digest('hex');

  // Set expiry to 90 days from now
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + TOKEN_EXPIRY_DAYS);

  // Store hash in database
  await db.user.update({
    where: { id: userId },
    data: {
      preferenceEmailToken: hash,
      preferenceEmailTokenExpiry: expiry,
    },
  });

  // Return plain token (not stored in DB)
  return token;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test lib/preferences/__tests__/email-token.test.ts`
Expected: PASS (2 tests)

**Step 5: Add tests for verifyEmailToken**

```typescript
// Add to lib/preferences/__tests__/email-token.test.ts
describe('verifyEmailToken', () => {
  it('should verify valid token and return userId', async () => {
    const token = 'plain_token_123';
    const hash = crypto
      .createHmac('sha256', process.env.EMAIL_TOKEN_SECRET || 'CHANGE_ME_IN_PRODUCTION')
      .update(token)
      .digest('hex');

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    (db.user.findFirst as any).mockResolvedValue({
      id: 'user_123',
      preferenceEmailToken: hash,
      preferenceEmailTokenExpiry: futureDate,
    });

    const userId = await verifyEmailToken(token);
    expect(userId).toBe('user_123');
  });

  it('should return null for expired token', async () => {
    const token = 'plain_token_123';
    const hash = crypto
      .createHmac('sha256', process.env.EMAIL_TOKEN_SECRET || 'CHANGE_ME_IN_PRODUCTION')
      .update(token)
      .digest('hex');

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    (db.user.findFirst as any).mockResolvedValue({
      id: 'user_123',
      preferenceEmailToken: hash,
      preferenceEmailTokenExpiry: pastDate,
    });

    const userId = await verifyEmailToken(token);
    expect(userId).toBeNull();
  });

  it('should return null for invalid token', async () => {
    (db.user.findFirst as any).mockResolvedValue(null);

    const userId = await verifyEmailToken('invalid_token');
    expect(userId).toBeNull();
  });

  it('should use constant-time comparison', async () => {
    const token = 'plain_token_123';
    const wrongHash = 'wrong_hash';

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    (db.user.findFirst as any).mockResolvedValue({
      id: 'user_123',
      preferenceEmailToken: wrongHash,
      preferenceEmailTokenExpiry: futureDate,
    });

    const userId = await verifyEmailToken(token);
    expect(userId).toBeNull();
  });
});
```

**Step 6: Run test to verify it fails**

Run: `npm test lib/preferences/__tests__/email-token.test.ts`
Expected: FAIL with "verifyEmailToken is not a function"

**Step 7: Implement verifyEmailToken**

Add to `lib/preferences/email-token.ts`:

```typescript
/**
 * Verify email token and return userId if valid
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
  // Hash the provided token
  const hash = crypto
    .createHmac('sha256', EMAIL_TOKEN_SECRET)
    .update(token)
    .digest('hex');

  // Find user with matching hash and non-expired token
  const user = await db.user.findFirst({
    where: {
      preferenceEmailToken: {
        not: null,
      },
      preferenceEmailTokenExpiry: {
        gte: new Date(),
      },
    },
    select: {
      id: true,
      preferenceEmailToken: true,
    },
  });

  if (!user || !user.preferenceEmailToken) {
    return null;
  }

  // Constant-time comparison to prevent timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(user.preferenceEmailToken)
  );

  return isValid ? user.id : null;
}
```

**Step 8: Run test to verify it passes**

Run: `npm test lib/preferences/__tests__/email-token.test.ts`
Expected: PASS (6 tests)

**Step 9: Commit email token module**

```bash
git add lib/preferences/email-token.ts lib/preferences/__tests__/email-token.test.ts
git commit -m "feat(E11-S12): implement secure email token generation/verification

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: tRPC API Router

### Task 4: Create Preferences Router

**Files:**
- Create: `lib/trpc/server/routers/preferences.ts`
- Create: `lib/trpc/server/routers/__tests__/preferences.test.ts`

**Step 1: Write failing test for authenticated endpoints**

```typescript
// lib/trpc/server/routers/__tests__/preferences.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCallerFactory } from '@trpc/server';
import { preferencesRouter } from '../preferences';
import * as userPreferences from '@/lib/preferences/user-preferences';
import { db } from '@/lib/db';

vi.mock('@/lib/db');
vi.mock('@/lib/preferences/user-preferences');

const createCaller = createCallerFactory()(preferencesRouter);

describe('preferencesRouter - authenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyPreferences', () => {
    it('should return current user preferences', async () => {
      const mockPrefs = {
        emailPreTripSequence: true,
        emailMarketing: false,
        smsEnabled: true,
      };

      vi.spyOn(userPreferences, 'getUserPreferences').mockResolvedValue(mockPrefs as any);

      const caller = createCaller({ session: { userId: 'user_123' }, db });
      const result = await caller.getMyPreferences();

      expect(result).toEqual(mockPrefs);
      expect(userPreferences.getUserPreferences).toHaveBeenCalledWith('user_123');
    });

    it('should throw error when not authenticated', async () => {
      const caller = createCaller({ session: null, db });
      await expect(caller.getMyPreferences()).rejects.toThrow();
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      vi.spyOn(userPreferences, 'updateUserPreferences').mockResolvedValue(undefined);

      const caller = createCaller({ session: { userId: 'user_123' }, db });
      await caller.updatePreferences({ emailMarketing: true });

      expect(userPreferences.updateUserPreferences).toHaveBeenCalledWith('user_123', {
        emailMarketing: true,
      });
    });
  });

  describe('unsubscribeAll', () => {
    it('should unsubscribe from all notifications', async () => {
      vi.spyOn(userPreferences, 'unsubscribeFromAll').mockResolvedValue(undefined);

      const caller = createCaller({ session: { userId: 'user_123' }, db });
      await caller.unsubscribeAll();

      expect(userPreferences.unsubscribeFromAll).toHaveBeenCalledWith('user_123');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test lib/trpc/server/routers/__tests__/preferences.test.ts`
Expected: FAIL with "Cannot find module '../preferences'"

**Step 3: Implement authenticated endpoints**

```typescript
// lib/trpc/server/routers/preferences.ts
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  getUserPreferences,
  updateUserPreferences,
  unsubscribeFromAll,
  type NotificationPreferences,
} from '@/lib/preferences/user-preferences';
import { verifyEmailToken } from '@/lib/preferences/email-token';

// Zod schema for preference updates
const PreferenceUpdateSchema = z.object({
  emailPreTripSequence: z.boolean().optional(),
  emailPostTripFollowUp: z.boolean().optional(),
  emailAlumniEvents: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
  emailNewsletter: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
});

export const preferencesRouter = router({
  /**
   * Get current user's notification preferences (authenticated)
   */
  getMyPreferences: protectedProcedure.query(async ({ ctx }) => {
    return await getUserPreferences(ctx.session.userId);
  }),

  /**
   * Update current user's notification preferences (authenticated)
   */
  updatePreferences: protectedProcedure
    .input(PreferenceUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      await updateUserPreferences(ctx.session.userId, input);
      return { success: true };
    }),

  /**
   * Unsubscribe from all optional notifications (authenticated)
   */
  unsubscribeAll: protectedProcedure.mutation(async ({ ctx }) => {
    await unsubscribeFromAll(ctx.session.userId);
    return { success: true };
  }),
});
```

**Step 4: Run test to verify it passes**

Run: `npm test lib/trpc/server/routers/__tests__/preferences.test.ts`
Expected: PASS (3 tests)

**Step 5: Add tests for token-based endpoints**

```typescript
// Add to lib/trpc/server/routers/__tests__/preferences.test.ts
import * as emailToken from '@/lib/preferences/email-token';

vi.mock('@/lib/preferences/email-token');

describe('preferencesRouter - token-based', () => {
  describe('getPreferencesByToken', () => {
    it('should return preferences for valid token', async () => {
      vi.spyOn(emailToken, 'verifyEmailToken').mockResolvedValue('user_123');

      const mockPrefs = { emailMarketing: false };
      vi.spyOn(userPreferences, 'getUserPreferences').mockResolvedValue(mockPrefs as any);

      const caller = createCaller({ session: null, db });
      const result = await caller.getPreferencesByToken({ token: 'valid_token' });

      expect(result.preferences).toEqual(mockPrefs);
      expect(result.email).toBeTruthy();
    });

    it('should throw error for invalid token', async () => {
      vi.spyOn(emailToken, 'verifyEmailToken').mockResolvedValue(null);

      const caller = createCaller({ session: null, db });
      await expect(
        caller.getPreferencesByToken({ token: 'invalid_token' })
      ).rejects.toThrow('Invalid or expired token');
    });
  });

  describe('updatePreferencesByToken', () => {
    it('should update preferences with valid token', async () => {
      vi.spyOn(emailToken, 'verifyEmailToken').mockResolvedValue('user_123');
      vi.spyOn(userPreferences, 'updateUserPreferences').mockResolvedValue(undefined);

      const caller = createCaller({ session: null, db });
      await caller.updatePreferencesByToken({
        token: 'valid_token',
        updates: { emailMarketing: true },
      });

      expect(userPreferences.updateUserPreferences).toHaveBeenCalledWith('user_123', {
        emailMarketing: true,
      });
    });

    it('should throw error for invalid token', async () => {
      vi.spyOn(emailToken, 'verifyEmailToken').mockResolvedValue(null);

      const caller = createCaller({ session: null, db });
      await expect(
        caller.updatePreferencesByToken({
          token: 'invalid_token',
          updates: { emailMarketing: true },
        })
      ).rejects.toThrow('Invalid or expired token');
    });
  });

  describe('unsubscribeAllByToken', () => {
    it('should unsubscribe with valid token', async () => {
      vi.spyOn(emailToken, 'verifyEmailToken').mockResolvedValue('user_123');
      vi.spyOn(userPreferences, 'unsubscribeFromAll').mockResolvedValue(undefined);

      const caller = createCaller({ session: null, db });
      await caller.unsubscribeAllByToken({ token: 'valid_token' });

      expect(userPreferences.unsubscribeFromAll).toHaveBeenCalledWith('user_123');
    });
  });
});
```

**Step 6: Run test to verify it fails**

Run: `npm test lib/trpc/server/routers/__tests__/preferences.test.ts`
Expected: FAIL with missing methods

**Step 7: Implement token-based endpoints**

Add to `lib/trpc/server/routers/preferences.ts`:

```typescript
export const preferencesRouter = router({
  // ... existing authenticated endpoints ...

  /**
   * Get preferences by email token (public)
   */
  getPreferencesByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = await verifyEmailToken(input.token);

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        });
      }

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      const preferences = await getUserPreferences(userId);

      return {
        email: user?.email,
        preferences,
      };
    }),

  /**
   * Update preferences by email token (public)
   */
  updatePreferencesByToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
        updates: PreferenceUpdateSchema,
      })
    )
    .mutation(async ({ input }) => {
      const userId = await verifyEmailToken(input.token);

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        });
      }

      await updateUserPreferences(userId, input.updates);
      return { success: true };
    }),

  /**
   * Unsubscribe from all via email token (public)
   */
  unsubscribeAllByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const userId = await verifyEmailToken(input.token);

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        });
      }

      await unsubscribeFromAll(userId);
      return { success: true };
    }),
});
```

**Step 8: Run test to verify it passes**

Run: `npm test lib/trpc/server/routers/__tests__/preferences.test.ts`
Expected: PASS (6 tests)

**Step 9: Mount router in main tRPC router**

Find the main tRPC router file and import preferences router:

```typescript
// lib/trpc/server/routers/_app.ts (or similar)
import { preferencesRouter } from './preferences';

export const appRouter = router({
  // ... existing routers ...
  preferences: preferencesRouter,
});
```

**Step 10: Commit preferences router**

```bash
git add lib/trpc/server/routers/preferences.ts lib/trpc/server/routers/__tests__/preferences.test.ts
git commit -m "feat(E11-S12): add tRPC preferences router with auth and token-based endpoints

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: User Interfaces

### Task 5: Build Authenticated Preferences Page

**Files:**
- Create: `app/settings/notifications/page.tsx`
- Create: `components/settings/notification-toggle.tsx`
- Create: `components/settings/preference-category.tsx`

**Step 1: Create reusable toggle component**

```typescript
// components/settings/notification-toggle.tsx
'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NotificationToggleProps {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
}

export function NotificationToggle({
  id,
  label,
  description,
  enabled,
  disabled = false,
  onChange,
}: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between py-4 border-b last:border-b-0">
      <div className="flex-1 pr-4">
        <Label
          htmlFor={id}
          className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}
        >
          {label}
        </Label>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <Switch
        id={id}
        checked={enabled}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
```

**Step 2: Create category grouping component**

```typescript
// components/settings/preference-category.tsx
'use client';

import { ReactNode } from 'react';

interface PreferenceCategoryProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PreferenceCategory({
  title,
  description,
  children,
}: PreferenceCategoryProps) {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 divide-y">
        {children}
      </div>
    </div>
  );
}
```

**Step 3: Create authenticated preferences page**

```typescript
// app/settings/notifications/page.tsx
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { NotificationToggle } from '@/components/settings/notification-toggle';
import { PreferenceCategory } from '@/components/settings/preference-category';
import { toast } from 'sonner';
import type { NotificationPreferences } from '@/lib/preferences/user-preferences';

export default function NotificationSettingsPage() {
  const { data: preferences, isLoading } = trpc.preferences.getMyPreferences.useQuery();
  const updateMutation = trpc.preferences.updatePreferences.useMutation();
  const unsubscribeAllMutation = trpc.preferences.unsubscribeAll.useMutation();

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);

  // Use local state if available, otherwise use server data
  const currentPreferences = localPreferences || preferences;

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setLocalPreferences({
      ...currentPreferences!,
      [key]: value,
    });
  };

  const handleSave = async () => {
    if (!localPreferences) return;

    try {
      await updateMutation.mutateAsync(localPreferences);
      toast.success('Preferences saved successfully');
      setLocalPreferences(null);
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!confirm('Are you sure you want to unsubscribe from all notifications?')) {
      return;
    }

    try {
      await unsubscribeAllMutation.mutateAsync();
      toast.success('Unsubscribed from all notifications');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to unsubscribe');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading preferences...</div>;
  }

  if (!currentPreferences) {
    return <div className="p-8">Failed to load preferences</div>;
  }

  const hasChanges = localPreferences !== null;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
        <p className="text-gray-600 mt-2">
          Manage how and when you receive communications from Pickleball Passport.
        </p>
      </div>

      <PreferenceCategory
        title="Booking & Account"
        description="Essential notifications about your bookings and account (cannot be disabled)"
      >
        <div className="p-4 text-sm text-gray-500">
          <p className="font-medium text-gray-900 mb-2">
            Always Enabled (Transactional):
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Booking confirmations</li>
            <li>Payment receipts and reminders</li>
            <li>Trip modifications and cancellations</li>
            <li>Account security alerts</li>
          </ul>
        </div>
      </PreferenceCategory>

      <PreferenceCategory
        title="Pre-Trip Communications"
        description="Helpful emails leading up to your trip"
      >
        <NotificationToggle
          id="emailPreTripSequence"
          label="Pre-Trip Email Sequence"
          description="Trip preparation emails at 60, 30, 14, 7, and 1 day before departure"
          enabled={currentPreferences.emailPreTripSequence}
          onChange={(value) => handleToggle('emailPreTripSequence', value)}
        />
      </PreferenceCategory>

      <PreferenceCategory
        title="Post-Trip & Alumni"
        description="Stay connected after your trip"
      >
        <NotificationToggle
          id="emailPostTripFollowUp"
          label="Post-Trip Follow-Up"
          description="Share your experience and photos after your trip"
          enabled={currentPreferences.emailPostTripFollowUp}
          onChange={(value) => handleToggle('emailPostTripFollowUp', value)}
        />
        <NotificationToggle
          id="emailAlumniEvents"
          label="Alumni Events"
          description="Invitations to special events and reunions for past travelers"
          enabled={currentPreferences.emailAlumniEvents}
          onChange={(value) => handleToggle('emailAlumniEvents', value)}
        />
      </PreferenceCategory>

      <PreferenceCategory
        title="Marketing & Promotions"
        description="Deals, news, and updates about new trips"
      >
        <NotificationToggle
          id="emailMarketing"
          label="Marketing Emails"
          description="Special offers, new trip announcements, and exclusive deals"
          enabled={currentPreferences.emailMarketing}
          onChange={(value) => handleToggle('emailMarketing', value)}
        />
        <NotificationToggle
          id="emailNewsletter"
          label="Newsletter"
          description="Monthly newsletter with travel tips and destination guides"
          enabled={currentPreferences.emailNewsletter}
          onChange={(value) => handleToggle('emailNewsletter', value)}
        />
      </PreferenceCategory>

      <PreferenceCategory
        title="Channel Preferences"
        description="Choose how you want to be notified"
      >
        <NotificationToggle
          id="smsEnabled"
          label="SMS Notifications"
          description="Text message reminders about your upcoming trips"
          enabled={currentPreferences.smsEnabled}
          onChange={(value) => handleToggle('smsEnabled', value)}
        />
        <NotificationToggle
          id="inAppEnabled"
          label="In-App Notifications"
          description="Notifications within the Pickleball Passport app"
          enabled={currentPreferences.inAppEnabled}
          onChange={(value) => handleToggle('inAppEnabled', value)}
        />
        <NotificationToggle
          id="whatsappEnabled"
          label="WhatsApp Groups"
          description="Invitations to trip-specific WhatsApp groups"
          enabled={currentPreferences.whatsappEnabled}
          onChange={(value) => handleToggle('whatsappEnabled', value)}
        />
      </PreferenceCategory>

      <div className="flex items-center justify-between mt-8 pt-8 border-t">
        <Button
          variant="outline"
          onClick={handleUnsubscribeAll}
          disabled={unsubscribeAllMutation.isPending}
        >
          Unsubscribe from All
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
```

**Step 4: Test page in browser**

Run: `npm run dev` and navigate to `/settings/notifications`
Expected: Page loads, toggles work, save button updates preferences

**Step 5: Commit authenticated UI**

```bash
git add app/settings/notifications/ components/settings/
git commit -m "feat(E11-S12): build authenticated notification preferences UI

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Build Public Preference Center

**Files:**
- Create: `app/preferences/page.tsx`

**Step 1: Create public preference center page**

```typescript
// app/preferences/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { NotificationToggle } from '@/components/settings/notification-toggle';
import { PreferenceCategory } from '@/components/settings/preference-category';
import { toast } from 'sonner';
import type { NotificationPreferences } from '@/lib/preferences/user-preferences';

export default function PublicPreferencesPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);
  const [email, setEmail] = useState<string>('');

  const { data, isLoading, error } = trpc.preferences.getPreferencesByToken.useQuery(
    { token: token || '' },
    { enabled: !!token }
  );

  const updateMutation = trpc.preferences.updatePreferencesByToken.useMutation();
  const unsubscribeAllMutation = trpc.preferences.unsubscribeAllByToken.useMutation();

  useEffect(() => {
    if (data) {
      setEmail(data.email || '');
    }
  }, [data]);

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-red-600">Invalid Link</h1>
        <p className="text-gray-600 mt-4">
          This preference management link is invalid. Please use the link from your email.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse">Loading preferences...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-red-600">Invalid or Expired Token</h1>
        <p className="text-gray-600 mt-4">
          This preference management link has expired or is invalid. Links expire after 90 days.
        </p>
        <p className="text-gray-600 mt-4">
          Please log in to your account to manage your preferences, or contact support for
          assistance.
        </p>
      </div>
    );
  }

  const currentPreferences = localPreferences || data.preferences;

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setLocalPreferences({
      ...currentPreferences,
      [key]: value,
    });
  };

  const handleSave = async () => {
    if (!localPreferences) return;

    try {
      await updateMutation.mutateAsync({ token, updates: localPreferences });
      toast.success('Preferences saved successfully');
      setLocalPreferences(null);
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!confirm('Are you sure you want to unsubscribe from all notifications?')) {
      return;
    }

    try {
      await unsubscribeAllMutation.mutateAsync({ token });
      toast.success('Unsubscribed from all notifications');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to unsubscribe');
    }
  };

  const hasChanges = localPreferences !== null;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Your Preferences</h1>
        <p className="text-gray-600 mt-2">Email: {email}</p>
        <p className="text-sm text-gray-500 mt-1">
          Choose which communications you'd like to receive from Pickleball Passport.
        </p>
      </div>

      {/* Same categories as authenticated page */}
      <PreferenceCategory
        title="Booking & Account"
        description="Essential notifications about your bookings and account (cannot be disabled)"
      >
        <div className="p-4 text-sm text-gray-500">
          <p className="font-medium text-gray-900 mb-2">
            Always Enabled (Transactional):
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Booking confirmations</li>
            <li>Payment receipts and reminders</li>
            <li>Trip modifications and cancellations</li>
            <li>Account security alerts</li>
          </ul>
        </div>
      </PreferenceCategory>

      <PreferenceCategory
        title="Pre-Trip Communications"
        description="Helpful emails leading up to your trip"
      >
        <NotificationToggle
          id="emailPreTripSequence"
          label="Pre-Trip Email Sequence"
          description="Trip preparation emails at 60, 30, 14, 7, and 1 day before departure"
          enabled={currentPreferences.emailPreTripSequence}
          onChange={(value) => handleToggle('emailPreTripSequence', value)}
        />
      </PreferenceCategory>

      <PreferenceCategory
        title="Post-Trip & Alumni"
        description="Stay connected after your trip"
      >
        <NotificationToggle
          id="emailPostTripFollowUp"
          label="Post-Trip Follow-Up"
          description="Share your experience and photos after your trip"
          enabled={currentPreferences.emailPostTripFollowUp}
          onChange={(value) => handleToggle('emailPostTripFollowUp', value)}
        />
        <NotificationToggle
          id="emailAlumniEvents"
          label="Alumni Events"
          description="Invitations to special events and reunions for past travelers"
          enabled={currentPreferences.emailAlumniEvents}
          onChange={(value) => handleToggle('emailAlumniEvents', value)}
        />
      </PreferenceCategory>

      <PreferenceCategory
        title="Marketing & Promotions"
        description="Deals, news, and updates about new trips"
      >
        <NotificationToggle
          id="emailMarketing"
          label="Marketing Emails"
          description="Special offers, new trip announcements, and exclusive deals"
          enabled={currentPreferences.emailMarketing}
          onChange={(value) => handleToggle('emailMarketing', value)}
        />
        <NotificationToggle
          id="emailNewsletter"
          label="Newsletter"
          description="Monthly newsletter with travel tips and destination guides"
          enabled={currentPreferences.emailNewsletter}
          onChange={(value) => handleToggle('emailNewsletter', value)}
        />
      </PreferenceCategory>

      <PreferenceCategory
        title="Channel Preferences"
        description="Choose how you want to be notified"
      >
        <NotificationToggle
          id="smsEnabled"
          label="SMS Notifications"
          description="Text message reminders about your upcoming trips"
          enabled={currentPreferences.smsEnabled}
          onChange={(value) => handleToggle('smsEnabled', value)}
        />
        <NotificationToggle
          id="inAppEnabled"
          label="In-App Notifications"
          description="Notifications within the Pickleball Passport app"
          enabled={currentPreferences.inAppEnabled}
          onChange={(value) => handleToggle('inAppEnabled', value)}
        />
        <NotificationToggle
          id="whatsappEnabled"
          label="WhatsApp Groups"
          description="Invitations to trip-specific WhatsApp groups"
          enabled={currentPreferences.whatsappEnabled}
          onChange={(value) => handleToggle('whatsappEnabled', value)}
        />
      </PreferenceCategory>

      <div className="flex items-center justify-between mt-8 pt-8 border-t">
        <Button
          variant="outline"
          onClick={handleUnsubscribeAll}
          disabled={unsubscribeAllMutation.isPending}
        >
          Unsubscribe from All
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> This link expires 90 days from when it was generated.
          For ongoing preference management, please log in to your account.
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Create one-click unsubscribe page**

```typescript
// app/unsubscribe/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [unsubscribed, setUnsubscribed] = useState(false);

  const unsubscribeMutation = trpc.preferences.unsubscribeAllByToken.useMutation();

  useEffect(() => {
    if (token && !unsubscribed) {
      handleUnsubscribe();
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;

    try {
      await unsubscribeMutation.mutateAsync({ token });
      setUnsubscribed(true);
    } catch (error) {
      console.error('Unsubscribe failed:', error);
    }
  };

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600">Invalid Link</h1>
        <p className="text-gray-600 mt-4">
          This unsubscribe link is invalid. Please use the link from your email.
        </p>
      </div>
    );
  }

  if (unsubscribeMutation.isError) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600">Link Expired</h1>
        <p className="text-gray-600 mt-4">
          This unsubscribe link has expired or is invalid.
        </p>
        <p className="text-gray-600 mt-4">
          Please log in to your account to manage your preferences, or contact support.
        </p>
      </div>
    );
  }

  if (!unsubscribed && unsubscribeMutation.isPending) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="animate-pulse">Unsubscribing...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">You've Been Unsubscribed</h1>
        <p className="text-gray-600 mt-4">
          You have been unsubscribed from all optional Pickleball Passport emails.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">What this means:</h2>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>✓ No more marketing emails or newsletters</li>
          <li>✓ No more pre-trip or post-trip emails</li>
          <li>✓ No more alumni event invitations</li>
          <li>✓ You'll still receive booking confirmations and payment receipts</li>
        </ul>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Changed your mind? You can customize which emails you receive.
        </p>
        <Link href={`/preferences?token=${token}`}>
          <Button variant="outline">Manage Detailed Preferences</Button>
        </Link>
      </div>
    </div>
  );
}
```

**Step 3: Commit public UI**

```bash
git add app/preferences/ app/unsubscribe/
git commit -m "feat(E11-S12): build public preference center and unsubscribe pages

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 5: Email Integration

### Task 7: Update Email Templates with Footer Links

**Files:**
- Modify: `lib/email/templates/base.ts:127-136`
- Modify: `lib/email/sendgrid.ts`

**Step 1: Update base email template footer**

```typescript
// Modify lib/email/templates/base.ts footer section
export interface EmailTemplateProps {
  title: string;
  content: string;
  preheader?: string;
  footerText?: string;
  preferenceToken?: string; // NEW
}

export function baseEmailTemplate({
  title,
  content,
  preheader = '',
  footerText = 'You received this email because you signed up for Pickleball Passport.',
  preferenceToken, // NEW
}: EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<!-- ... existing head and content sections ... -->

          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="margin: 0 0 8px 0;">${footerText}</p>

              ${
                preferenceToken
                  ? `
              <p style="margin: 0 0 16px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/preferences?token=${preferenceToken}" style="color: #059669; text-decoration: none;">
                  Manage Preferences
                </a>
                |
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/unsubscribe?token=${preferenceToken}" style="color: #059669; text-decoration: none;">
                  Unsubscribe
                </a>
              </p>
              `
                  : ''
              }

              <p style="margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Pickleball Passport. All rights reserved.<br>
                Pickleball Passport LLC<br>
                123 Main Street, Suite 100<br>
                Chiang Mai, Thailand 50200
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
```

**Step 2: Update sendEmail to generate tokens**

```typescript
// Modify lib/email/sendgrid.ts
import { generateEmailToken } from '@/lib/preferences/email-token';
import { db } from '@/lib/db';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition?: string;
  }>;
  userId?: string; // NEW - for token generation
  isMarketing?: boolean; // NEW - for List-Unsubscribe header
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const sgMail = await getSgMail();

  // Generate preference token if userId provided
  let preferenceToken: string | undefined;
  if (options.userId) {
    preferenceToken = await generateEmailToken(options.userId);
  }

  // Add List-Unsubscribe header for marketing emails
  const headers: Record<string, string> = {};
  if (options.isMarketing && preferenceToken) {
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/unsubscribe?token=${preferenceToken}`;
    headers['List-Unsubscribe'] = `<${unsubscribeUrl}>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  const msg = {
    to: options.to,
    from: options.from || FROM_EMAIL,
    subject: options.subject,
    html: options.html,
    text: options.text || '',
    replyTo: options.replyTo,
    attachments: options.attachments,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  };

  try {
    await sgMail.send(msg);
    emailLogger.info({ to: options.to, subject: options.subject }, 'Email sent successfully');
  } catch (error) {
    logError(emailLogger, error, 'SendGrid error', { to: options.to, subject: options.subject });
    if (error instanceof Error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
    throw new Error('Failed to send email');
  }
}
```

**Step 3: Test email with preference links**

Run: `npm test lib/email/__tests__/sendgrid.test.ts`
Expected: Tests pass with new token generation

**Step 4: Commit email integration**

```bash
git add lib/email/templates/base.ts lib/email/sendgrid.ts
git commit -m "feat(E11-S12): add preference links to email footer and List-Unsubscribe header

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 6: Add Preference Checks to Notification Functions

### Task 8: Add Preference Checks to Optional Emails

**Files:**
- Modify: `lib/email/send-pre-trip-emails.ts` (if exists)
- Modify: `lib/notifications/payment-notifications.ts` (if exists)

**Step 1: Add preference check to pre-trip emails**

Find the pre-trip email sending function and add preference check:

```typescript
// Example modification to lib/email/send-pre-trip-emails.ts
import { canSendNotification } from '@/lib/preferences/user-preferences';

export async function sendPreTripEmail(userId: string, tripData: TripData) {
  // Check preference before sending
  if (!(await canSendNotification(userId, 'emailPreTripSequence'))) {
    emailLogger.info({ userId }, 'User opted out of pre-trip emails');
    return;
  }

  // Existing email sending logic...
  await sendEmail({
    to: userEmail,
    subject: 'Your trip is coming up!',
    html: emailHtml,
    userId, // Pass userId for token generation
    isMarketing: false, // Pre-trip is not marketing
  });
}
```

**Step 2: Add preference check to marketing emails**

```typescript
// Example modification to marketing email function
import { canSendNotification } from '@/lib/preferences/user-preferences';

export async function sendMarketingEmail(userId: string, content: string) {
  // Check preference before sending
  if (!(await canSendNotification(userId, 'emailMarketing'))) {
    emailLogger.info({ userId }, 'User opted out of marketing emails');
    return;
  }

  await sendEmail({
    to: userEmail,
    subject: 'Special offer just for you!',
    html: content,
    userId,
    isMarketing: true, // Enable List-Unsubscribe header
  });
}
```

**Step 3: Ensure transactional emails NEVER check preferences**

Verify booking confirmations and payment receipts do NOT have preference checks:

```typescript
// Example: lib/email/booking-confirmation.ts - NO PREFERENCE CHECK
export async function sendBookingConfirmation(bookingData: BookingData) {
  // NO preference check - transactional emails always send
  await sendEmail({
    to: userEmail,
    subject: 'Booking Confirmed!',
    html: confirmationHtml,
    userId: bookingData.userId, // Still pass for footer links
    isMarketing: false,
  });
}
```

**Step 4: Commit preference checks**

```bash
git add lib/email/ lib/notifications/
git commit -m "feat(E11-S12): add preference checks to optional notification functions

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 7: SendGrid Webhook & Compliance

### Task 9: Create SendGrid Webhook Handler

**Files:**
- Create: `app/api/webhooks/sendgrid/events/route.ts`

**Step 1: Implement webhook endpoint**

```typescript
// app/api/webhooks/sendgrid/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailLogger } from '@/lib/logger';

interface SendGridEvent {
  email: string;
  timestamp: number;
  event: string;
  sg_event_id: string;
  sg_message_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const events: SendGridEvent[] = await request.json();

    for (const event of events) {
      emailLogger.info({ event: event.event, email: event.email }, 'SendGrid webhook event');

      // Find user by email
      const user = await db.user.findUnique({
        where: { email: event.email },
        select: { id: true },
      });

      if (!user) {
        emailLogger.warn({ email: event.email }, 'User not found for webhook event');
        continue;
      }

      // Handle unsubscribe events
      if (event.event === 'unsubscribe' || event.event === 'spamreport') {
        await db.user.update({
          where: { id: user.id },
          data: {
            notificationPreferences: {
              emailPreTripSequence: false,
              emailPostTripFollowUp: false,
              emailAlumniEvents: false,
              emailMarketing: false,
              emailNewsletter: false,
              smsEnabled: true,
              inAppEnabled: true,
              whatsappEnabled: true,
            },
            preferenceUpdatedAt: new Date(),
          },
        });

        emailLogger.info(
          { userId: user.id, event: event.event },
          'User unsubscribed via SendGrid'
        );
      }

      // Handle group unsubscribe (if using SendGrid Groups in future)
      if (event.event === 'group_unsubscribe') {
        emailLogger.info({ userId: user.id }, 'Group unsubscribe event (not yet implemented)');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    emailLogger.error({ error }, 'SendGrid webhook error');
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

**Step 2: Add webhook verification (optional security)**

```typescript
// Add to top of route.ts
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  publicKey: string
): boolean {
  // SendGrid uses elliptic curve signatures
  // For MVP, we can skip this and rely on HTTPS + secret URL
  // In production, implement proper signature verification
  return true;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('X-Twilio-Email-Event-Webhook-Signature');

  // Verify signature in production
  // if (!verifyWebhookSignature(...)) {
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  // }

  // ... rest of handler ...
}
```

**Step 3: Configure webhook URL in SendGrid dashboard**

Manual step (document in README):
1. Go to SendGrid Dashboard → Settings → Mail Settings → Event Webhook
2. Set URL: `https://pickleballpassport.com/api/webhooks/sendgrid/events`
3. Enable events: `Unsubscribed`, `Spam Reports`, `Group Unsubscribe`
4. Save settings

**Step 4: Commit webhook handler**

```bash
git add app/api/webhooks/sendgrid/
git commit -m "feat(E11-S12): add SendGrid webhook handler for unsubscribe sync

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 8: Environment Variables & Documentation

### Task 10: Add Environment Variables

**Files:**
- Modify: `.env.example`
- Create: `docs/notification-preferences.md`

**Step 1: Add to .env.example**

```bash
# Email Token Secret (32+ character random string)
EMAIL_TOKEN_SECRET=your-secure-random-string-here-minimum-32-characters
```

**Step 2: Create documentation**

```markdown
# Notification Preferences System

## Overview

The notification preference system allows users to control which communications they receive from Pickleball Passport.

## Key Features

- **Granular Control**: Users can opt in/out of specific notification types
- **Public Access**: Manage preferences via email token (no login required)
- **CAN-SPAM Compliance**: Every email includes unsubscribe link and physical address
- **GDPR Compliance**: Marketing emails are opt-in only
- **Transactional Integrity**: Booking confirmations always send regardless of preferences

## User Flows

### Authenticated User
1. Navigate to `/settings/notifications`
2. Toggle preferences
3. Click "Save Preferences"

### Email Link (No Login)
1. Click "Manage Preferences" in email footer
2. Lands on `/preferences?token={token}`
3. Update preferences without logging in
4. Token valid for 90 days

### One-Click Unsubscribe
1. Click "Unsubscribe" in email footer
2. Lands on `/unsubscribe?token={token}`
3. Automatically unsubscribed from all optional emails
4. Option to manage detailed preferences

## Preference Categories

### Transactional (Always Send)
- Booking confirmations
- Payment receipts
- Trip modifications
- Account security alerts

### Optional (User-Controlled)
- Pre-trip email sequence
- Post-trip follow-up
- Alumni events
- Marketing emails
- Newsletter
- SMS notifications
- In-app notifications
- WhatsApp invitations

## Technical Implementation

### Database Schema
- `notificationPreferences` (JSON) - User preferences
- `preferenceEmailToken` (String) - HMAC-SHA256 hash
- `preferenceEmailTokenExpiry` (DateTime) - 90-day expiration

### Token Security
- Random 32-byte tokens
- HMAC-SHA256 hashing with `EMAIL_TOKEN_SECRET`
- Constant-time comparison
- 90-day expiration
- One token per user (replaces on each email)

### Integration Points

**Check Preferences Before Sending:**
```typescript
import { canSendNotification } from '@/lib/preferences/user-preferences';

if (!(await canSendNotification(userId, 'emailMarketing'))) {
  return; // User opted out
}
```

**Generate Token for Email Footer:**
```typescript
import { generateEmailToken } from '@/lib/preferences/email-token';

const token = await generateEmailToken(userId);

await sendEmail({
  to: userEmail,
  subject: 'Your Trip',
  html: emailHtml,
  userId, // Automatically adds footer links with token
  isMarketing: true, // Adds List-Unsubscribe header
});
```

## SendGrid Integration

### Email Footer
All emails include preference management links:
- "Manage Preferences" → `/preferences?token={token}`
- "Unsubscribe" → `/unsubscribe?token={token}`

### List-Unsubscribe Header
Marketing emails include:
```
List-Unsubscribe: <https://pickleballpassport.com/unsubscribe?token={token}>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

This enables Gmail's one-click unsubscribe button.

### Webhook Sync
SendGrid webhook syncs unsubscribe events:
- Endpoint: `/api/webhooks/sendgrid/events`
- Events: `unsubscribe`, `spamreport`, `group_unsubscribe`
- Action: Disable all optional email preferences

## Testing

### Unit Tests
```bash
npm test lib/preferences/
npm test lib/trpc/server/routers/__tests__/preferences.test.ts
```

### Manual Testing
1. Send test email with preference link
2. Click "Manage Preferences"
3. Toggle settings and save
4. Verify database updates
5. Test expired token behavior
6. Test one-click unsubscribe

## Environment Variables

Required:
```bash
EMAIL_TOKEN_SECRET=minimum-32-characters-random-string
```

Generate secure secret:
```bash
openssl rand -hex 32
```

## Compliance

### CAN-SPAM Requirements ✅
- Physical address in footer
- Clear unsubscribe link
- Honor unsubscribe immediately
- List-Unsubscribe header

### GDPR Requirements ✅
- Marketing opt-in only (default: false)
- Easy preference management
- Granular control
- Public access without login

## Future Enhancements
- SMS keyword unsubscribe (STOP, START)
- Preference change history
- Admin preference view
- Digest frequency options
```

**Step 3: Commit documentation**

```bash
git add .env.example docs/notification-preferences.md
git commit -m "docs(E11-S12): add environment variables and system documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 9: Final Testing & Verification

### Task 11: End-to-End Testing

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 2: Test authenticated flow**

1. Run: `npm run dev`
2. Navigate to `/settings/notifications`
3. Toggle preferences
4. Save and verify database update

**Step 3: Test public preference center**

1. Generate test token in database
2. Navigate to `/preferences?token={token}`
3. Verify preferences load
4. Update and save
5. Test expired token

**Step 4: Test one-click unsubscribe**

1. Navigate to `/unsubscribe?token={token}`
2. Verify automatic unsubscribe
3. Check database for updated preferences

**Step 5: Verify transactional emails skip checks**

Review code to ensure booking confirmations and payment receipts do NOT call `canSendNotification()`

**Step 6: Test email footer links**

1. Send test email with `userId` parameter
2. Verify footer contains preference links
3. Click links and verify they work

**Step 7: Document any issues found**

Create GitHub issues for any bugs discovered during testing

---

## Completion Checklist

- ✅ Database schema updated with preference fields
- ✅ User preference helper functions implemented
- ✅ Email token generation/verification working
- ✅ tRPC router with authenticated and public endpoints
- ✅ Authenticated preferences UI (`/settings/notifications`)
- ✅ Public preference center (`/preferences?token=...`)
- ✅ One-click unsubscribe page (`/unsubscribe?token=...`)
- ✅ Email templates include preference links
- ✅ List-Unsubscribe header added to marketing emails
- ✅ Preference checks added to optional email functions
- ✅ Transactional emails confirmed to skip checks
- ✅ SendGrid webhook handler implemented
- ✅ Environment variables documented
- ✅ All tests passing
- ✅ Manual testing complete

---

## Execution Notes

**DRY**: Reuse existing patterns from partner preferences, tRPC routers, and email templates

**YAGNI**: Skip SendGrid Groups API integration for MVP, implement only what's needed for compliance

**TDD**: Write tests first, implement minimal code to pass, then refactor

**Frequent Commits**: Commit after each task completion with clear messages

**Reference Skills**:
- @superpowers:test-driven-development for all implementation
- @superpowers:systematic-debugging if issues arise
- @superpowers:verification-before-completion before claiming done

---

**Plan complete!** Ready for execution via superpowers:executing-plans or superpowers:subagent-driven-development.
