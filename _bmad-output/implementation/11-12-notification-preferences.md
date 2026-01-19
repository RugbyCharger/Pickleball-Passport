# Story 11-12: Notification Preferences

Status: ready-for-dev

## Story

As a user (guest, partner, or admin),
I want to manage my notification preferences across all channels (email, SMS, in-app, WhatsApp),
So that I only receive communications I'm interested in and can control notification frequency.

## Acceptance Criteria

### AC-1: Guest Notification Preferences Page

- [ ] Page: `/settings/notifications` or `/account/notifications`
- [ ] Protected route (guest role required)
- [ ] Categories with toggle controls:
  - **Booking & Account** (cannot unsubscribe from transactional)
    - ✅ Booking confirmations (required, greyed out)
    - ✅ Payment receipts (required, greyed out)
    - ✅ Account security alerts (required, greyed out)
    - ⚙️ Booking updates and changes (optional)
  - **Pre-Trip Communications**
    - ⚙️ Pre-trip email sequence (60/30/14/7/1 day emails)
    - ⚙️ SMS trip reminders
    - ⚙️ WhatsApp group invitations
  - **During Trip**
    - ⚙️ Daily itinerary updates
    - ⚙️ In-app notifications
    - ⚙️ WhatsApp group messages
  - **Post-Trip & Alumni**
    - ⚙️ Post-trip follow-up emails
    - ⚙️ Alumni event invitations
    - ⚙️ Referral program updates
  - **Marketing & Promotions**
    - ⚙️ Marketing emails and offers
    - ⚙️ Newsletter subscription
    - ⚙️ Special promotions
- [ ] Save preferences button
- [ ] "Unsubscribe from all" option (except transactional emails)

### AC-2: Partner Notification Preferences Page

- [ ] Page: `/partners/settings/notifications`
- [ ] Protected route (partner role required)
- [ ] Already implemented in Story 11-9 ✅
- [ ] Verify integration with this unified preferences system
- [ ] Categories:
  - **Referral Activity**
    - ⚙️ Referral clicks (daily digest)
    - ⚙️ Application submissions (instant)
    - ⚙️ Booking confirmations (instant)
  - **Points & Rewards**
    - ⚙️ Points earned notifications
    - ⚙️ Tier changes
    - ⚙️ Commission available
  - **Performance Reports**
    - ⚙️ Monthly performance summary
    - ⚙️ Weekly digest
- [ ] Email vs In-app notification toggles

### AC-3: Channel-Specific Preferences

- [ ] **Email Preferences**
  - Frequency options:
    - Instant (as they happen)
    - Daily digest (batched once per day)
    - Weekly digest (batched once per week)
  - Category-specific frequency (pre-trip vs marketing)
  - Unsubscribe from all (except transactional)

- [ ] **SMS Preferences**
  - Toggle SMS notifications on/off
  - SMS only for urgent updates (default)
  - Phone number verification status

- [ ] **In-App Notifications**
  - Toggle in-app notifications on/off
  - Category-specific toggles
  - Sound/vibration preferences (future mobile app)

- [ ] **WhatsApp Preferences**
  - Opt-in to WhatsApp communications
  - Join trip group chat (toggle)
  - Receive WhatsApp updates

### AC-4: Email Preference Center (Public Unsubscribe Page)

- [ ] Public page: `/preferences?token={email_token}` or `/unsubscribe?token={email_token}`
- [ ] Accessible via "Manage Preferences" link in email footer
- [ ] No login required (email token-based authentication)
- [ ] Display email address (from token)
- [ ] Same category toggles as authenticated preferences page
- [ ] "Unsubscribe from all" button
- [ ] Save button
- [ ] Confirmation message after save
- [ ] Comply with CAN-SPAM and GDPR requirements

### AC-5: One-Click Unsubscribe (Email Header)

- [ ] Add `List-Unsubscribe` header to all marketing emails
- [ ] Format: `<mailto:unsubscribe@pickleballpassport.com?subject=unsubscribe-{userId}>` or URL
- [ ] Process mailto unsubscribe requests:
  - Email webhook endpoint to capture unsubscribe requests
  - Automatically update user preferences
  - Send confirmation email
- [ ] URL-based unsubscribe: `/unsubscribe/one-click?token={token}`
  - One-click unsubscribe from all marketing emails
  - Display confirmation page
  - Option to re-subscribe or manage preferences

### AC-6: Database Schema for Preferences

- [ ] Extend `User` model with `notificationPreferences` JSON field or separate table
- [ ] Store preferences per channel and category:
  - `emailBookingUpdates: boolean`
  - `emailPreTripSequence: boolean`
  - `emailPostTripFollowUp: boolean`
  - `emailAlumniEvents: boolean`
  - `emailMarketing: boolean`
  - `emailNewsle` tter: boolean`
  - `emailFrequency: "instant" | "daily" | "weekly"`
  - `smsEnabled: boolean`
  - `inAppEnabled: boolean`
  - `whatsappEnabled: boolean`
- [ ] Default preferences: All enabled (except marketing = opt-in only)
- [ ] Migration: `npx prisma migrate dev --name add-notification-preferences`

### AC-7: SendGrid Unsubscribe Group Integration

- [ ] Create SendGrid unsubscribe groups:
  - Transactional (cannot unsubscribe)
  - Pre-Trip Communications
  - Post-Trip & Alumni
  - Marketing & Promotions
- [ ] Map categories to SendGrid groups
- [ ] Sync preferences to SendGrid:
  - When user updates preferences → Update SendGrid suppression list
  - When SendGrid webhook receives unsubscribe → Update local preferences
- [ ] Webhook endpoint: `/api/webhooks/sendgrid/unsubscribe`
- [ ] Process SendGrid webhook events

### AC-8: Preference Checking in Notification Functions

- [ ] Update all email sending functions to check preferences before sending
- [ ] Pattern:
  ```typescript
  const userPrefs = await getUserNotificationPreferences(userId);
  if (!userPrefs.emailPreTripSequence) {
    logger.info('User opted out of pre-trip emails, skipping');
    return;
  }
  ```
- [ ] Apply to:
  - `lib/email/templates/*.ts` (all marketing/optional emails)
  - `lib/notifications/payment-notifications.ts`
  - `lib/notifications/partner-notifications.ts`
  - `lib/sms/trip-reminders.ts`
  - `lib/whatsapp/group-manager.ts`
- [ ] Never check preferences for transactional emails (booking confirmation, payment receipt)

### AC-9: Preference Management API (tRPC)

- [ ] tRPC router: `preferences`
- [ ] Queries:
  - `getMyPreferences()` - Get current user's preferences
  - `getPreferencesByToken(token)` - Get preferences by email token (public)
- [ ] Mutations:
  - `updatePreferences(preferences)` - Update authenticated user preferences
  - `updatePreferencesByToken(token, preferences)` - Update via email token
  - `unsubscribeAll(userId)` - Unsubscribe from all non-transactional
  - `unsubscribeAllByToken(token)` - Public unsubscribe all
- [ ] Webhook handlers:
  - `processSendGridUnsubscribe(event)` - Handle SendGrid webhook

### AC-10: Email Footer Links

- [ ] Add "Manage Preferences" link to all email footers
- [ ] Generate secure email token for preference access
- [ ] Link format: `https://pickleballpassport.com/preferences?token={token}`
- [ ] Token should be:
  - Unique per user
  - Expiration: 90 days (refresh on each email)
  - Secure (HMAC signed or JWT)
- [ ] Update base email template to include preference link

### AC-11: Admin View of User Preferences (Support Tool)

- [ ] Admin page: `/admin/users/[userId]/preferences`
- [ ] Display user's current notification preferences
- [ ] Show preference history (when changed, what changed)
- [ ] Admin can manually update preferences (for support cases)
- [ ] Display SendGrid suppression status
- [ ] Option to re-enable all notifications (support reset)

### AC-12: Preference Analytics Dashboard

- [ ] Admin dashboard: `/admin/analytics/notification-preferences`
- [ ] Metrics:
  - Opt-out rate by category (% of users who disabled)
  - Most commonly disabled categories
  - Unsubscribe rate over time
  - Re-subscription rate (users who opt back in)
  - Breakdown by user type (guest vs partner)
- [ ] Visual charts (line graph, bar chart)
- [ ] Export data as CSV

### AC-13: Preference Defaults for New Users

- [ ] Set default preferences on user creation:
  - All transactional: Enabled (cannot disable)
  - Pre-trip, post-trip, alumni: Enabled (opt-out available)
  - Marketing: Disabled (must opt-in, GDPR compliance)
  - Newsletter: Disabled (must opt-in)
- [ ] Opt-in checkboxes during signup:
  - "I want to receive special offers and promotions"
  - "Subscribe to the Pickleball Passport newsletter"
- [ ] Consent tracking (when user opted in, which checkbox)

### AC-14: Testing & Compliance

- [ ] Test preference updates save correctly
- [ ] Test email sending respects preferences
- [ ] Test public unsubscribe page (token-based)
- [ ] Test one-click unsubscribe
- [ ] Test SendGrid webhook integration
- [ ] Verify transactional emails always send (ignore preferences)
- [ ] Test "Unsubscribe from all" button
- [ ] Verify GDPR compliance (right to opt-out, data portability)
- [ ] Test preference analytics calculations
- [ ] Verify email footer links generate valid tokens

## Implementation Details

### Files to Create

1. **app/settings/notifications/page.tsx** (NEW)
   - Guest notification preferences page
   - Toggle controls for all categories
   - Save functionality

2. **app/preferences/page.tsx** (NEW)
   - Public preference center (email token-based)
   - Unsubscribe page accessible from email footer
   - No login required

3. **app/unsubscribe/one-click/page.tsx** (NEW)
   - One-click unsubscribe confirmation page
   - Display success message
   - Option to manage detailed preferences

4. **app/admin/users/[userId]/preferences/page.tsx** (NEW)
   - Admin view of user notification preferences
   - Support tool for managing user preferences

5. **app/admin/analytics/notification-preferences/page.tsx** (NEW)
   - Analytics dashboard for preference metrics
   - Opt-out rates, trends, charts

6. **components/settings/notification-toggle.tsx** (NEW)
   - Reusable toggle component for notification preferences
   - Props: category, label, description, value, onChange

7. **components/settings/preference-category.tsx** (NEW)
   - Group related notification toggles
   - Collapsible category sections

8. **lib/preferences/get-user-preferences.ts** (NEW)
   - Helper function to fetch user notification preferences
   - Cache preferences for performance
   - Type-safe preference interface

9. **lib/preferences/email-token.ts** (NEW)
   - Generate secure email tokens for preference access
   - Verify and decode email tokens
   - Token expiration handling

10. **lib/trpc/server/routers/preferences.ts** (NEW)
    - tRPC router for preference management
    - Queries: getMyPreferences, getPreferencesByToken
    - Mutations: updatePreferences, unsubscribeAll

11. **app/api/webhooks/sendgrid/unsubscribe/route.ts** (NEW)
    - Webhook endpoint for SendGrid unsubscribe events
    - Verify webhook signature
    - Update user preferences in database

### Files to Modify

1. **prisma/schema.prisma**
   - Add `notificationPreferences` JSON field to `User` model
   - OR create separate `NotificationPreferences` table
   - Add `preferenceEmailToken` and `preferenceEmailTokenExpiry` to `User`
   - Migration: `npx prisma migrate dev --name add-notification-preferences`

2. **lib/email/sendgrid.ts**
   - Add `checkUserPreferences()` before sending optional emails
   - Add `List-Unsubscribe` header to marketing emails
   - Integrate SendGrid unsubscribe groups

3. **lib/email/templates/base.ts**
   - Add "Manage Preferences" link to email footer
   - Generate preference token for each email
   - Include unsubscribe link

4. **lib/notifications/payment-notifications.ts**
   - Check user preferences before sending optional payment emails
   - Skip if user opted out

5. **lib/notifications/partner-notifications.ts**
   - Already has preference checking (Story 11-9) ✅
   - Verify integration with new unified preferences system

6. **lib/sms/trip-reminders.ts** (if exists from Story 11-6)
   - Check user preferences before sending SMS
   - Respect `smsEnabled` preference

7. **app/layout.tsx** or **app/dashboard/layout.tsx**
   - Add "Notification Settings" link to account menu
   - Navigation to `/settings/notifications`

8. **lib/trpc/server/routers/user.ts**
   - Import preferences router
   - Add to user router: `preferences: preferencesRouter`

### Database Schema

```typescript
// Option 1: JSON field in User model (Simpler for MVP)
model User {
  // ... existing fields

  notificationPreferences Json? @default("{\"emailBookingUpdates\":true,\"emailPreTripSequence\":true,\"emailPostTripFollowUp\":true,\"emailAlumniEvents\":true,\"emailMarketing\":false,\"emailNewsletter\":false,\"emailFrequency\":\"instant\",\"smsEnabled\":true,\"inAppEnabled\":true,\"whatsappEnabled\":true}")

  preferenceEmailToken       String?  @unique
  preferenceEmailTokenExpiry DateTime?

  preferenceUpdatedAt DateTime?
}

// Option 2: Separate table (More normalized, better for complex queries)
model NotificationPreferences {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Email preferences
  emailBookingUpdates    Boolean @default(true)
  emailPreTripSequence   Boolean @default(true)
  emailPostTripFollowUp  Boolean @default(true)
  emailAlumniEvents      Boolean @default(true)
  emailMarketing         Boolean @default(false) // Opt-in only
  emailNewsletter        Boolean @default(false) // Opt-in only
  emailFrequency         String  @default("instant") // instant, daily, weekly

  // Channel preferences
  smsEnabled      Boolean @default(true)
  inAppEnabled    Boolean @default(true)
  whatsappEnabled Boolean @default(true)

  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

// Preference change history (optional, for compliance & support)
model NotificationPreferenceHistory {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  changedField String // e.g., "emailMarketing"
  oldValue     Boolean
  newValue     Boolean
  changedVia   String // "web", "email_link", "admin", "sendgrid_webhook"

  createdAt DateTime @default(now())

  @@index([userId])
}
```

### Preference Helper Functions

```typescript
// lib/preferences/get-user-preferences.ts
import { db } from '@/lib/db';

export interface NotificationPreferences {
  emailBookingUpdates: boolean;
  emailPreTripSequence: boolean;
  emailPostTripFollowUp: boolean;
  emailAlumniEvents: boolean;
  emailMarketing: boolean;
  emailNewsletter: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly';
  smsEnabled: boolean;
  inAppEnabled: boolean;
  whatsappEnabled: boolean;
}

/**
 * Get user notification preferences
 */
export async function getUserNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { notificationPreferences: true },
  });

  if (!user || !user.notificationPreferences) {
    // Return default preferences
    return getDefaultPreferences();
  }

  return user.notificationPreferences as NotificationPreferences;
}

/**
 * Update user notification preferences
 */
export async function updateUserNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  const currentPrefs = await getUserNotificationPreferences(userId);

  const updatedPrefs = {
    ...currentPrefs,
    ...preferences,
  };

  await db.user.update({
    where: { id: userId },
    data: {
      notificationPreferences: updatedPrefs,
      preferenceUpdatedAt: new Date(),
    },
  });
}

/**
 * Check if user can receive specific notification type
 */
export async function canSendNotification(
  userId: string,
  notificationType: keyof NotificationPreferences
): Promise<boolean> {
  const prefs = await getUserNotificationPreferences(userId);
  return prefs[notificationType] === true;
}

/**
 * Default preferences for new users
 */
function getDefaultPreferences(): NotificationPreferences {
  return {
    emailBookingUpdates: true,
    emailPreTripSequence: true,
    emailPostTripFollowUp: true,
    emailAlumniEvents: true,
    emailMarketing: false, // Opt-in only
    emailNewsletter: false, // Opt-in only
    emailFrequency: 'instant',
    smsEnabled: true,
    inAppEnabled: true,
    whatsappEnabled: true,
  };
}
```

### Email Token Generation

```typescript
// lib/preferences/email-token.ts
import crypto from 'crypto';
import { db } from '@/lib/db';

const TOKEN_SECRET = process.env.EMAIL_TOKEN_SECRET!;
const TOKEN_EXPIRY_DAYS = 90;

/**
 * Generate secure email token for preference access
 */
export async function generateEmailToken(userId: string): Promise<string> {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY_DAYS);

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(token)
    .digest('hex');

  // Store hashed token in database
  await db.user.update({
    where: { id: userId },
    data: {
      preferenceEmailToken: hashedToken,
      preferenceEmailTokenExpiry: expiryDate,
    },
  });

  return token;
}

/**
 * Verify and get user ID from email token
 */
export async function verifyEmailToken(
  token: string
): Promise<string | null> {
  const hashedToken = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(token)
    .digest('hex');

  const user = await db.user.findFirst({
    where: {
      preferenceEmailToken: hashedToken,
      preferenceEmailTokenExpiry: {
        gte: new Date(),
      },
    },
    select: { id: true },
  });

  return user?.id || null;
}
```

### tRPC Preferences Router

```typescript
// lib/trpc/server/routers/preferences.ts
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import {
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
} from '@/lib/preferences/get-user-preferences';
import { verifyEmailToken } from '@/lib/preferences/email-token';
import { TRPCError } from '@trpc/server';

const preferencesSchema = z.object({
  emailBookingUpdates: z.boolean().optional(),
  emailPreTripSequence: z.boolean().optional(),
  emailPostTripFollowUp: z.boolean().optional(),
  emailAlumniEvents: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
  emailNewsletter: z.boolean().optional(),
  emailFrequency: z.enum(['instant', 'daily', 'weekly']).optional(),
  smsEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
});

export const preferencesRouter = router({
  /**
   * Get current user's notification preferences
   */
  getMyPreferences: protectedProcedure.query(async ({ ctx }) => {
    return getUserNotificationPreferences(ctx.user.id);
  }),

  /**
   * Get preferences by email token (public)
   */
  getPreferencesByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const userId = await verifyEmailToken(input.token);

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        });
      }

      const prefs = await getUserNotificationPreferences(userId);
      return { userId, preferences: prefs };
    }),

  /**
   * Update authenticated user's preferences
   */
  updatePreferences: protectedProcedure
    .input(preferencesSchema)
    .mutation(async ({ input, ctx }) => {
      await updateUserNotificationPreferences(ctx.user.id, input);
      return { success: true };
    }),

  /**
   * Update preferences via email token (public)
   */
  updatePreferencesByToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
        preferences: preferencesSchema,
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

      await updateUserNotificationPreferences(userId, input.preferences);
      return { success: true };
    }),

  /**
   * Unsubscribe from all non-transactional emails
   */
  unsubscribeAll: protectedProcedure.mutation(async ({ ctx }) => {
    await updateUserNotificationPreferences(ctx.user.id, {
      emailPreTripSequence: false,
      emailPostTripFollowUp: false,
      emailAlumniEvents: false,
      emailMarketing: false,
      emailNewsletter: false,
    });

    return { success: true };
  }),

  /**
   * Public unsubscribe all via email token
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

      await updateUserNotificationPreferences(userId, {
        emailPreTripSequence: false,
        emailPostTripFollowUp: false,
        emailAlumniEvents: false,
        emailMarketing: false,
        emailNewsletter: false,
      });

      return { success: true };
    }),
});
```

### Guest Notification Preferences Page

```typescript
// app/settings/notifications/page.tsx
'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { NotificationToggle } from '@/components/settings/notification-toggle';
import { PreferenceCategory } from '@/components/settings/preference-category';

export default function NotificationPreferencesPage() {
  const { data: preferences, refetch } = api.preferences.getMyPreferences.useQuery();
  const updatePreferences = api.preferences.updatePreferences.useMutation();

  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleSave = async () => {
    await updatePreferences.mutateAsync(localPrefs);
    await refetch();
    alert('Preferences saved successfully!');
  };

  if (!preferences) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
      <p className="text-gray-600 mb-8">
        Manage how and when you receive notifications from Pickleball Passport.
      </p>

      <div className="space-y-8">
        {/* Booking & Account (Transactional - Cannot disable) */}
        <PreferenceCategory title="Booking & Account" description="Essential notifications about your bookings and account">
          <NotificationToggle
            label="Booking confirmations"
            description="Confirmation emails when you book a trip"
            value={true}
            disabled
            required
          />
          <NotificationToggle
            label="Payment receipts"
            description="Receipts for payments and transactions"
            value={true}
            disabled
            required
          />
          <NotificationToggle
            label="Booking updates"
            description="Important changes to your booking"
            value={localPrefs.emailBookingUpdates}
            onChange={(value) =>
              setLocalPrefs({ ...localPrefs, emailBookingUpdates: value })
            }
          />
        </PreferenceCategory>

        {/* Pre-Trip Communications */}
        <PreferenceCategory title="Pre-Trip Communications" description="Helpful emails and messages before your trip">
          <NotificationToggle
            label="Pre-trip email sequence"
            description="5 helpful emails at 60, 30, 14, 7, and 1 day before your trip"
            value={localPrefs.emailPreTripSequence}
            onChange={(value) =>
              setLocalPrefs({ ...localPrefs, emailPreTripSequence: value })
            }
          />
          <NotificationToggle
            label="SMS trip reminders"
            description="Text message reminders for important trip milestones"
            value={localPrefs.smsEnabled}
            onChange={(value) =>
              setLocalPrefs({ ...localPrefs, smsEnabled: value })
            }
          />
          <NotificationToggle
            label="WhatsApp group invitations"
            description="Invitations to join your trip's WhatsApp group chat"
            value={localPrefs.whatsappEnabled}
            onChange={(value) =>
              setLocalPrefs({ ...localPrefs, whatsappEnabled: value })
            }
          />
        </PreferenceCategory>

        {/* Post-Trip & Alumni */}
        <PreferenceCategory title="Post-Trip & Alumni" description="Stay connected after your transformation journey">
          <NotificationToggle
            label="Post-trip follow-up emails"
            description="Check-in emails after you return home"
            value={localPrefs.emailPostTripFollowUp}
            onChange={(value) =>
              setLocalPrefs({ ...localPrefs, emailPostTripFollowUp: value })
            }
          />
          <NotificationToggle
            label="Alumni event invitations"
            description="Invitations to alumni events and meetups"
            value={localPrefs.emailAlumniEvents}
            onChange={(value) =>
              setLocalPrefs({ ...localPrefs, emailAlumniEvents: value })
            }
          />
        </PreferenceCategory>

        {/* Marketing & Promotions */}
        <PreferenceCategory title="Marketing & Promotions" description="Special offers and updates">
          <NotificationToggle
            label="Marketing emails and offers"
            description="Special promotions and new trip announcements"
            value={localPrefs.emailMarketing}
            onChange={(value) =>
              setLocalPrefs({ ...localPrefs, emailMarketing: value })
            }
          />
          <NotificationToggle
            label="Newsletter subscription"
            description="Monthly newsletter with travel tips and stories"
            value={localPrefs.emailNewsletter}
            onChange={(value) =>
              setLocalPrefs({ ...localPrefs, emailNewsletter: value })
            }
          />
        </PreferenceCategory>

        {/* In-App Notifications */}
        <PreferenceCategory title="In-App Notifications" description="Notifications within the member portal">
          <NotificationToggle
            label="In-app notifications"
            description="Show notifications in the member portal"
            value={localPrefs.inAppEnabled}
            onChange={(value) =>
              setLocalPrefs({ ...localPrefs, inAppEnabled: value })
            }
          />
        </PreferenceCategory>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={updatePreferences.isLoading}>
            {updatePreferences.isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocalPrefs(preferences)}
          >
            Reset
          </Button>
        </div>

        {/* Unsubscribe All */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-2">Unsubscribe from All</h3>
          <p className="text-sm text-gray-600 mb-4">
            You'll still receive essential booking and account notifications.
          </p>
          <Button
            variant="destructive"
            onClick={async () => {
              if (confirm('Are you sure you want to unsubscribe from all optional communications?')) {
                await api.preferences.unsubscribeAll.mutate();
                await refetch();
              }
            }}
          >
            Unsubscribe from All
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### SendGrid Unsubscribe Webhook

```typescript
// app/api/webhooks/sendgrid/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger, logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const events = await request.json();

    for (const event of events) {
      const { email, event: eventType, sg_event_id } = event;

      if (eventType === 'unsubscribe' || eventType === 'group_unsubscribe') {
        // Find user by email
        const user = await db.user.findUnique({
          where: { email },
        });

        if (user) {
          // Update preferences to disable all marketing emails
          await db.user.update({
            where: { id: user.id },
            data: {
              notificationPreferences: {
                ...user.notificationPreferences,
                emailMarketing: false,
                emailNewsletter: false,
              },
              preferenceUpdatedAt: new Date(),
            },
          });

          logger.info(
            { userId: user.id, email, eventId: sg_event_id },
            'User unsubscribed via SendGrid'
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(logger, error, 'Failed to process SendGrid unsubscribe webhook');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Testing Checklist

- [ ] Guest can view and update notification preferences
- [ ] Partner preferences integrate with unified system
- [ ] Public preference page works with email token
- [ ] One-click unsubscribe works
- [ ] Transactional emails cannot be disabled
- [ ] Email sending respects user preferences
- [ ] SendGrid webhook updates local preferences
- [ ] "Unsubscribe from all" disables optional emails only
- [ ] Preference email tokens expire correctly
- [ ] Admin can view user preferences
- [ ] Analytics dashboard displays opt-out metrics
- [ ] Default preferences apply to new users
- [ ] Email footer includes preference link
- [ ] List-Unsubscribe header added to marketing emails

## Dev Notes

### Architecture Compliance

**User Preferences Storage:**
- Store preferences in database (User model JSON field or separate table)
- Default preferences for new users
- Preference change history for compliance

**Token-Based Public Access:**
- Secure email tokens for public preference access
- No login required for email preference management
- Token expiration and refresh

**SendGrid Integration:**
- Unsubscribe groups for category management
- Webhook integration for suppression list sync
- List-Unsubscribe header for email clients

**Preference Checking:**
- Check preferences before sending optional emails
- Never check for transactional emails
- Performance: Cache preferences, async checks

**Compliance:**
- CAN-SPAM compliance (unsubscribe link, one-click)
- GDPR compliance (right to opt-out, data portability)
- Consent tracking (when opted in)

### Library & Framework Requirements

**Existing Dependencies (No new packages needed):**
- Prisma - Already installed
- tRPC - Already installed
- Next.js - Already installed
- SendGrid - Already installed

**TypeScript Patterns:**
- Type-safe preference interfaces
- Optional fields with `?` notation
- Enum for email frequency

### Integration Points

1. **All Email Sending Functions (High Priority)**
   - Location: `lib/email/templates/*.ts`, `lib/notifications/*.ts`
   - Action: Check user preferences before sending
   - Function: `canSendNotification(userId, type)`
   - Status: Update all email sending code

2. **Email Footer (High Priority)**
   - Location: `lib/email/templates/base.ts`
   - Action: Add "Manage Preferences" link
   - Generate email token for each user
   - Status: Template update needed

3. **SendGrid Unsubscribe Groups (High Priority)**
   - Location: SendGrid dashboard
   - Action: Create unsubscribe groups
   - Map to local categories
   - Status: SendGrid configuration needed

4. **Partner Preferences (Medium Priority)**
   - Location: `app/partners/settings/notifications/page.tsx` (Story 11-9)
   - Action: Verify integration with unified system
   - Status: Integration check needed

### Previous Story Intelligence

**From Story 11-9 (Partner Notification System):**
- Partner preferences already implemented ✅
- Preference checking pattern established
- In-app and email preference toggles

**From Story 11-7 (In-App Notifications):**
- In-app notification system exists
- Notification filtering by type
- Mark as read functionality

**From Story 11-6 (SMS Notifications):**
- SMS notification infrastructure
- Preference for SMS opt-in/opt-out

**From Story 11-4 (Pre-Trip Email Sequence):**
- Pre-trip email templates exist
- Need preference checking integration

**From Epic 2 (User Authentication):**
- User model and authentication
- Profile management foundation

**Key Patterns to Follow:**
1. Token-based public access (no login required)
2. Preference checking before sending
3. SendGrid integration for unsubscribes
4. Transactional emails always send (ignore preferences)
5. User-friendly toggle UI
6. Analytics for opt-out tracking

### Email Preference Best Practices

**UI/UX:**
- Clear category names and descriptions
- Visual distinction: Transactional (greyed out) vs Optional (toggles)
- One-page preference management (no nested clicks)
- Instant feedback on save
- "Unsubscribe from all" option prominent but not destructive

**Email Footer:**
- Include "Manage Preferences" link (not just "Unsubscribe")
- Preference link with secure token (no login required)
- Physical address (CAN-SPAM requirement)
- Social media links

**Compliance:**
- Honor unsubscribe requests immediately (<10 days per CAN-SPAM)
- Keep unsubscribe records for compliance audits
- Provide preference management (not just all-or-nothing)
- Track consent for marketing emails

### References

**Architecture:**
- [Architecture Doc](../../solutioning/architecture-Pickleball-Passport-2025-12-28.md) - User management and communication patterns

**Previous Stories:**
- [Story 11-9](./11-9-partner-notification-system.md) - Partner notification preferences
- [Story 11-7](./11-7-in-app-notifications.md) - In-app notification system
- [Story 11-6](./11-6-sms-notifications-twilio.md) - SMS notification opt-in
- [Story 11-4](./11-4-pre-trip-email-sequence.md) - Pre-trip emails to apply preferences to

**Existing Code:**
- `lib/email/sendgrid.ts` - Email sending service
- `lib/email/templates/base.ts` - Base template with footer
- `lib/notifications/partner-notifications.ts` - Preference checking example

**External Documentation:**
- CAN-SPAM Act: https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business
- GDPR Email Marketing: https://gdpr.eu/email-marketing/
- SendGrid Unsubscribe Groups: https://docs.sendgrid.com/ui/sending-email/unsubscribe-groups

## Dependencies

- E11-S1: SendGrid Integration (done) ✅ - Email infrastructure
- E11-S7: In-App Notifications (done) ✅ - In-app notification system
- E11-S9: Partner Notification System (done) ✅ - Partner preferences pattern
- E2-S2: User Signup Flow (done) ✅ - User model foundation

## Story Points

3 points

**Breakdown:**
- Database schema & models (0.5 pt) - Preferences model, email tokens
- Guest preferences page (0.75 pt) - UI with toggle controls
- Public preference center (0.5 pt) - Token-based access, unsubscribe page
- tRPC router (0.5 pt) - CRUD operations for preferences
- Preference checking integration (0.5 pt) - Update all email sending code
- SendGrid webhook (0.25 pt) - Unsubscribe event handling
- Testing & polish (0.25 pt) - Unit tests, integration verification

## Priority

P2 - Medium

**Rationale:**
- Required for email compliance (CAN-SPAM, GDPR)
- Improves user experience and control
- Reduces unsubscribe rate (give granular control)
- Not blocking for MVP but important for production launch
- Partner preferences already exist (Story 11-9)
- Can be implemented incrementally (start with basic toggles, add advanced later)
