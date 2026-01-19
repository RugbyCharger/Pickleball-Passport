# Notification Preferences System Design

**Date:** 2026-01-19
**Story:** 11-12 - Notification Preferences
**Priority:** P2 - Critical for compliance (CAN-SPAM, GDPR)
**Status:** Design Complete

---

## Overview

Design a unified notification preferences system that allows users (guests and partners) to manage their communication preferences across all channels (email, SMS, in-app, WhatsApp). The system must ensure CAN-SPAM and GDPR compliance while providing granular user control.

## Goals

1. **Compliance**: Meet CAN-SPAM and GDPR requirements for email marketing
2. **User Control**: Give users granular control over notification types and channels
3. **Simplicity**: Minimize complexity while providing full functionality
4. **Consistency**: Align with existing partner notification preference pattern
5. **Security**: Secure public access to preferences without requiring login

## Architecture Decisions

### 1. Storage Approach

**Decision:** JSON field on User model

**Rationale:**
- Consistent with existing `PartnerProfile.notificationPreferences` pattern
- Fast to implement for MVP
- Flexible schema for future preference additions
- No additional joins needed for preference checks
- Sufficient for current scale and query patterns

**Alternative Considered:** Separate `NotificationPreferences` table - More normalized but adds complexity and joins without clear benefits at current scale.

### 2. Preference Checking Pattern

**Decision:** Explicit checks in each notification function

**Rationale:**
- Clear intent - easy to see which emails respect preferences
- Matches existing partner notification pattern
- Easy to audit and debug
- Transactional emails skip checks entirely (no accidental opt-out)

**Pattern:**
```typescript
// Optional emails check preferences
if (!await canSendNotification(userId, 'emailPreTripSequence')) {
  return; // User opted out
}
await sendEmail(...);

// Transactional emails never check
await sendBookingConfirmation(...); // Always sends
```

**Alternative Considered:** Centralized check in `sendEmail()` wrapper - Less explicit, harder to distinguish transactional vs marketing emails.

### 3. Public Access Security

**Decision:** HMAC-based email tokens

**Rationale:**
- Simple, proven security model
- Fast verification (database lookup only)
- 90-day expiration with auto-refresh
- Single token per user (replaces old on each email)

**Token Flow:**
1. Generate random 32-byte token
2. Store HMAC-SHA256 hash in database
3. Include token in email footer link
4. Verify token on public preference page
5. Refresh token on every email send

**Alternative Considered:** JWT tokens - More complex, no clear benefit for this use case.

### 4. SendGrid Integration

**Decision:** Lightweight compliance approach

**Rationale:**
- Email footer links (preference management + unsubscribe)
- List-Unsubscribe header for one-click unsubscribe
- Webhook endpoint to sync SendGrid unsubscribe events
- Source of truth stays in local database
- Skip SendGrid Groups API for MVP simplicity

**Alternative Considered:** Full SendGrid Groups integration - More complexity, more API calls, diminishing returns.

## Database Schema

### User Model Changes

```prisma
model User {
  // ... existing fields

  // Notification Preferences (Story 11-12)
  notificationPreferences    Json?     @default("{\"emailPreTripSequence\":true,\"emailPostTripFollowUp\":true,\"emailAlumniEvents\":true,\"emailMarketing\":false,\"emailNewsletter\":false,\"smsEnabled\":true,\"inAppEnabled\":true,\"whatsappEnabled\":true}")
  preferenceEmailToken       String?   @unique
  preferenceEmailTokenExpiry DateTime?
  preferenceUpdatedAt        DateTime?
}
```

### Default Preferences Object

```typescript
interface NotificationPreferences {
  // Email categories
  emailPreTripSequence: boolean;    // Default: true
  emailPostTripFollowUp: boolean;   // Default: true
  emailAlumniEvents: boolean;       // Default: true
  emailMarketing: boolean;          // Default: false (opt-in only - GDPR)
  emailNewsletter: boolean;         // Default: false (opt-in only - GDPR)

  // Channel toggles
  smsEnabled: boolean;              // Default: true
  inAppEnabled: boolean;            // Default: true
  whatsappEnabled: boolean;         // Default: true
}
```

### Transactional vs Optional

**Transactional (Always Send - No Preferences):**
- Booking confirmations
- Payment receipts
- Booking updates/changes
- Trip modifications
- Cancellations/refunds
- Account security alerts

**Optional (User-Controlled):**
- Pre-trip email sequence (60/30/14/7/1 day emails)
- Post-trip follow-up emails
- Alumni event invitations
- Marketing emails and special offers
- Newsletter subscription
- SMS trip reminders
- WhatsApp group invitations

## Component Architecture

### Core Modules

**1. `lib/preferences/user-preferences.ts`**

Helper functions for preference management:

```typescript
// Get user preferences with defaults
async function getUserPreferences(userId: string): Promise<NotificationPreferences>

// Check if specific notification can be sent
async function canSendNotification(
  userId: string,
  type: keyof NotificationPreferences
): Promise<boolean>

// Update user preferences
async function updateUserPreferences(
  userId: string,
  updates: Partial<NotificationPreferences>
): Promise<void>

// Unsubscribe from all optional notifications
async function unsubscribeFromAll(userId: string): Promise<void>
```

**2. `lib/preferences/email-token.ts`**

Secure token generation and verification:

```typescript
// Generate token for email footer links
async function generateEmailToken(userId: string): Promise<string>

// Verify token and return userId
async function verifyEmailToken(token: string): Promise<string | null>
```

**Security:**
- Random 32-byte tokens
- HMAC-SHA256 hashing (uses `EMAIL_TOKEN_SECRET` env var)
- 90-day expiration
- Constant-time comparison
- One token per user (replaces previous)

**3. `lib/trpc/server/routers/preferences.ts`**

tRPC API endpoints:

```typescript
// Authenticated endpoints
getMyPreferences() // Get current user's preferences
updatePreferences(updates) // Update current user's preferences
unsubscribeAll() // Unsubscribe from all optional

// Public endpoints (token-based)
getPreferencesByToken(token) // Get preferences via email token
updatePreferencesByToken(token, updates) // Update via token
unsubscribeAllByToken(token) // Public unsubscribe
```

### User Interfaces

**1. Authenticated Preferences Page: `/settings/notifications`**

- Protected route (requires login)
- Full preference management interface
- Category grouping:
  - Booking & Account (transactional - grayed out)
  - Pre-Trip Communications
  - Post-Trip & Alumni
  - Marketing & Promotions
  - Channel Preferences (SMS, In-App, WhatsApp)
- Toggle switches for each preference
- "Save Preferences" button
- "Unsubscribe from All" option

**2. Public Preference Center: `/preferences?token={token}`**

- NO login required (token-based authentication)
- Accessed via email footer "Manage Preferences" link
- Same UI as authenticated page
- Token validation on load
- Displays email address (from token lookup)
- Save updates directly
- Confirmation message after save

**3. One-Click Unsubscribe: `/unsubscribe/one-click?token={token}`**

- Instant unsubscribe from all marketing
- Confirmation page
- Link to manage detailed preferences
- Complies with List-Unsubscribe header standard

## SendGrid Compliance Integration

### Email Footer Template Updates

**File:** `lib/email/templates/base.ts`

Add to footer of ALL emails:

```html
<footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
  <p>
    <a href="https://pickleballpassport.com/preferences?token={{preferenceToken}}" style="color: #0066cc;">
      Manage Preferences
    </a>
    |
    <a href="https://pickleballpassport.com/unsubscribe?token={{preferenceToken}}" style="color: #0066cc;">
      Unsubscribe
    </a>
  </p>
  <p style="font-size: 12px; color: #999;">
    Pickleball Passport LLC<br>
    123 Main Street, Suite 100<br>
    City, State 12345
  </p>
</footer>
```

### List-Unsubscribe Header

Add to marketing/optional emails only:

```typescript
// In sendEmail() when sending marketing emails
headers: {
  'List-Unsubscribe': `<https://pickleballpassport.com/unsubscribe/one-click?token=${token}>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
}
```

This enables Gmail's one-click unsubscribe button.

### SendGrid Webhook Endpoint

**File:** `app/api/webhooks/sendgrid/events/route.ts`

Handle SendGrid events:

```typescript
POST /api/webhooks/sendgrid/events

// Process events:
// - 'unsubscribe' → Update user preferences (disable all marketing)
// - 'group_unsubscribe' → Update specific category
// - 'spam_report' → Treat as unsubscribe (disable all)

// Verify webhook signature
// Update local preferences
// Log all events
```

## Integration Points

### Files to Create

1. `lib/preferences/user-preferences.ts` - Preference helper functions
2. `lib/preferences/email-token.ts` - Token generation/verification
3. `lib/trpc/server/routers/preferences.ts` - tRPC API
4. `app/settings/notifications/page.tsx` - Authenticated preferences UI
5. `app/preferences/page.tsx` - Public preference center
6. `app/unsubscribe/page.tsx` - Public unsubscribe page
7. `app/unsubscribe/one-click/page.tsx` - One-click unsubscribe
8. `app/api/webhooks/sendgrid/events/route.ts` - Webhook handler
9. `components/settings/notification-toggle.tsx` - Reusable toggle component
10. `components/settings/preference-category.tsx` - Category grouping component

### Files to Modify

**1. Database Schema:**
- `prisma/schema.prisma` - Add preference fields to User model
- Migration: `npx prisma migrate dev --name add-notification-preferences`

**2. Email Templates:**
- `lib/email/templates/base.ts` - Add preference links to footer
- Update to generate token and include in footer

**3. Email Sending Service:**
- `lib/email/sendgrid.ts` - Add List-Unsubscribe header for marketing emails
- Generate and refresh email tokens when sending

**4. Notification Functions (Add Preference Checks):**
- `lib/email/send-pre-trip-emails.ts` - Check `emailPreTripSequence`
- `lib/notifications/payment-notifications.ts` - Check for optional emails
- `lib/sms/trip-reminders.ts` (if exists) - Check `smsEnabled`
- `lib/whatsapp/group-manager.ts` (Story 11-10) - Check `whatsappEnabled`

**5. Navigation:**
- `app/layout.tsx` or `app/dashboard/layout.tsx` - Add link to `/settings/notifications`

**6. tRPC Router:**
- `lib/trpc/server/routers/user.ts` - Import and mount preferences router

## Implementation Flow

### Phase 1: Database & Core Functions
1. Add fields to User model (Prisma migration)
2. Implement `lib/preferences/user-preferences.ts`
3. Implement `lib/preferences/email-token.ts`
4. Create tRPC preferences router

### Phase 2: User Interfaces
5. Build authenticated preferences page (`/settings/notifications`)
6. Build public preference center (`/preferences?token=...`)
7. Build one-click unsubscribe page
8. Add navigation link to settings

### Phase 3: Email Integration
9. Update email footer template with preference links
10. Add token generation to email sending flow
11. Add List-Unsubscribe header to marketing emails

### Phase 4: Preference Checks
12. Add preference checks to pre-trip email sequence
13. Add checks to optional payment notifications
14. Add checks to SMS/WhatsApp functions
15. Ensure transactional emails skip checks

### Phase 5: Compliance
16. Create SendGrid webhook endpoint
17. Test webhook with SendGrid events
18. Verify CAN-SPAM compliance (footer, address, unsubscribe)
19. Test GDPR compliance (opt-in defaults, easy unsubscribe)

## Security Considerations

### Email Token Security
- HMAC-SHA256 hashing prevents token guessing
- Random 32-byte tokens (2^256 possibilities)
- 90-day expiration limits exposure window
- Single token per user (old tokens invalidated)
- Constant-time comparison prevents timing attacks

### Public Endpoint Protection
- Rate limiting on token verification endpoints
- Log suspicious activity (multiple failed tokens)
- Token required for all preference updates
- No sensitive data exposed in token

### Privacy
- Only show user's own preferences
- No enumeration of valid email addresses
- Preferences not visible to other users
- Audit log of preference changes (optional)

## Testing Strategy

### Unit Tests
- Preference helper functions
- Email token generation/verification
- Default preference merging
- Preference update validation

### Integration Tests
- tRPC preference endpoints (authenticated)
- tRPC preference endpoints (token-based)
- Email sending with preference checks
- SendGrid webhook processing

### Manual Testing
- Load authenticated preferences page
- Toggle preferences and save
- Access public preference page via token
- Verify transactional emails always send
- Verify optional emails respect preferences
- Test "Unsubscribe from All" button
- Test one-click unsubscribe
- Test expired token handling

### Compliance Testing
- Verify all emails have footer links
- Verify List-Unsubscribe header on marketing emails
- Test SendGrid webhook integration
- Verify physical address in footer (CAN-SPAM)
- Verify opt-in defaults for marketing (GDPR)

## Performance Considerations

### Caching
- Cache user preferences in memory (short TTL)
- Reduce database queries for frequently checked preferences
- Invalidate cache on preference updates

### Database
- Index on `preferenceEmailToken` for fast token lookup
- Index on `preferenceEmailTokenExpiry` for cleanup queries
- JSON field queries are efficient in PostgreSQL

### Email Sending
- Token generation is non-blocking
- Token refresh on every email (minimal overhead)
- Preference checks add ~1 DB query per optional email

## Compliance Checklist

### CAN-SPAM Requirements
- ✅ Physical address in footer
- ✅ Clear "Unsubscribe" link in every email
- ✅ Honor unsubscribe requests immediately
- ✅ Identify message as advertisement (for marketing emails)
- ✅ List-Unsubscribe header for email client integration

### GDPR Requirements
- ✅ Opt-in for marketing emails (default: false)
- ✅ Easy access to preference management
- ✅ Clear description of each notification type
- ✅ Granular control (not all-or-nothing)
- ✅ Public access without login (via email token)
- ✅ Right to opt-out at any time

## Success Metrics

- **Compliance:** 100% of emails have unsubscribe link
- **User Control:** Users can manage preferences without support
- **Opt-out Rate:** Track category-specific opt-out rates
- **Unsubscribe Method:** Track email link vs one-click vs SendGrid
- **Token Usage:** Monitor public preference center access
- **Support Reduction:** Fewer unsubscribe support tickets

## Future Enhancements

### V2 Features (Post-MVP)
- Preference change history and audit log
- Admin view of user preferences (support tool)
- Analytics dashboard for opt-out trends
- Digest frequency options (daily/weekly batching)
- A/B testing for preference defaults
- SMS keyword-based unsubscribe (STOP, UNSTOP)
- WhatsApp preference management
- Mobile app notification preferences

### Potential Improvements
- SendGrid Groups API integration (two-way sync)
- Email preference templates (save common settings)
- Bulk preference updates (admin tool)
- Export preference data (GDPR compliance)
- Preference recommendations based on behavior

## References

### Regulatory
- [CAN-SPAM Act Compliance Guide](https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business)
- [GDPR Email Marketing Guidelines](https://gdpr.eu/email-marketing/)

### Technical
- [SendGrid Unsubscribe Groups](https://docs.sendgrid.com/ui/sending-email/unsubscribe-groups)
- [List-Unsubscribe Header RFC](https://www.rfc-editor.org/rfc/rfc8058.html)

### Internal
- Story 11-12: Notification Preferences (this implementation)
- Story 11-9: Partner Notification System (existing pattern)
- Architecture Doc: Communication system design

---

## Design Validation

This design has been validated to ensure:

1. **Simplicity:** Minimal database changes, reuses existing patterns
2. **Compliance:** Full CAN-SPAM and GDPR compliance
3. **Security:** Secure public access via HMAC tokens
4. **Consistency:** Aligns with partner notification preferences
5. **Flexibility:** Easy to add new preference types
6. **Performance:** Efficient preference checks, minimal overhead
7. **User Experience:** Clear UI, public access, granular control

**Next Steps:**
1. Review and approve design
2. Create implementation plan (use superpowers:writing-plans)
3. Set up git worktree (use superpowers:using-git-worktrees)
4. Implement in phases (database → UI → integration → compliance)
