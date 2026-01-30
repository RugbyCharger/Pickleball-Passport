# Phase 16: SMS Integration - Research

**Researched:** 2026-01-30
**Domain:** Twilio SMS integration for urgent notifications
**Confidence:** HIGH

## Summary

Phase 16 adds SMS notification capabilities to Pickleball Passport for time-sensitive updates that require immediate guest attention. The infrastructure is well-scaffolded with Twilio stubs, UI components, and tRPC procedures already in place. The email notification system provides a proven pattern to follow.

**Key findings:**
- Twilio client library (v5.11.2) is already installed and typed
- Existing `lib/sms/twilio.ts` provides complete SMS infrastructure with lazy initialization, phone validation, and error handling
- Three admin UI dialogs exist for flight delays, itinerary changes, and emergency alerts
- tRPC admin procedures are scaffolded but marked "TODO" - they log instead of sending SMS
- User preference system includes `smsEnabled` flag (default: true)
- Email infrastructure provides patterns for preference checking, logging, and graceful degradation

**Primary recommendation:** Connect existing scaffolded components by implementing SMS sending in tRPC procedures, respecting user preferences for non-emergency messages, and adding admin panel trigger buttons.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| twilio | 5.11.2 | SMS API integration | Official Twilio Node.js SDK with TypeScript support |
| @prisma/client | 5.22.0 | User preferences storage | Existing DB layer, `notificationPreferences.smsEnabled` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pino logger | (existing) | SMS audit trail | Already configured in `lib/logger` as `smsLogger` |
| zod | (existing) | Input validation | Phone number format, message length constraints |
| tRPC | 11.8.1 | API layer | Admin triggers already use tRPC procedures |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Twilio | AWS SNS | SNS cheaper at scale but requires AWS infrastructure, Twilio simpler for MVP |
| tRPC procedures | Next.js Route Handlers | Route handlers work but tRPC already established pattern |
| Custom retry | Twilio auto-retry | Auto-retry built into client library (set `autoRetry: true`) |

**Installation:**
```bash
# Already installed
npm list twilio
# twilio@5.11.2
```

## Architecture Patterns

### Recommended Project Structure
```
lib/sms/
├── twilio.ts              # SMS client and utilities (EXISTS)
└── notifications.ts       # Business logic wrappers (TO BUILD)

lib/preferences/
└── user-preferences.ts    # Preference checking (EXISTS)

server/routers/
└── admin.ts              # tRPC admin procedures (SCAFFOLD EXISTS)

components/admin/
├── send-flight-delay-sms-dialog.tsx       # UI (EXISTS)
├── send-itinerary-change-sms-dialog.tsx   # UI (EXISTS)
└── send-emergency-alert-sms-dialog.tsx    # UI (EXISTS)
```

### Pattern 1: Preference-Aware SMS Sending
**What:** Check user preferences before sending non-emergency SMS
**When to use:** Flight delays, itinerary changes (opt-out allowed)
**Example:**
```typescript
// Follows email pattern from lib/email/sendgrid.ts lines 60-92
import { canSendNotification } from '@/lib/preferences/user-preferences';
import { sendSMS } from '@/lib/sms/twilio';

// For optional notifications
if (!(await canSendNotification(userId, 'smsEnabled'))) {
  smsLogger.info({ userId }, 'User opted out of SMS');
  return;
}

await sendSMS({
  to: user.guestProfile.phone,
  message: 'Your flight to Phuket has been delayed...',
});
```

### Pattern 2: Emergency Override (No Preference Check)
**What:** Send SMS regardless of preference for safety-critical messages
**When to use:** Emergency broadcasts, severe weather, urgent safety alerts
**Example:**
```typescript
// Emergency alert bypasses preferences
// From components/admin/send-emergency-alert-sms-dialog.tsx line 83
await sendSMS({
  to: user.guestProfile.phone,
  message: `URGENT: ${alertMessage}. Contact: ${contactInfo}`,
});
// Note: UI warns admin this overrides opt-out (line 83)
```

### Pattern 3: Batch SMS with Error Tolerance
**What:** Send to multiple recipients, log failures but continue
**When to use:** Trip group alerts
**Example:**
```typescript
// From lib/sms/twilio.ts lines 129-150
import { sendBatchSMS } from '@/lib/sms/twilio';

await sendBatchSMS(
  guests.map((g) => ({
    to: g.user.guestProfile.phone,
    message: emergencyMessage,
  }))
);
// Uses Promise.allSettled - partial failures allowed
```

### Anti-Patterns to Avoid
- **Don't throw on SMS failure:** Email pattern (sendgrid.ts line 116-121) logs but doesn't throw - SMS failures shouldn't break booking flows
- **Don't send to invalid numbers:** Validate with `isValidPhoneNumber()` first (twilio.ts line 55-58)
- **Don't expose Twilio client in frontend:** Security risk - keep in server procedures only
- **Don't forget to mask phone numbers in logs:** Use `maskPhoneNumber()` helper (twilio.ts line 64-69)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Phone validation | Custom regex | `isValidPhoneNumber()` in twilio.ts | E.164 format complex (country codes, length rules) |
| SMS segmentation | Character counting | Twilio auto-segments | 160 char GSM-7, 70 char Unicode, plus concatenation headers (6 bytes overhead) |
| Retry logic | Custom backoff | Twilio `autoRetry: true` flag | Library handles 429 rate limits with exponential backoff |
| Message queueing | Custom queue | Twilio queuing | Messages auto-queued at rate limit (1-10 MPS depending on sender type) |
| Phone masking | Manual redaction | `maskPhoneNumber()` helper | Preserves last 4 digits for support while masking sensitive data |

**Key insight:** Twilio SDK handles complex SMS infrastructure (segmentation, concatenation, delivery receipts, rate limiting). The existing `lib/sms/twilio.ts` wrapper already implements security best practices.

## Common Pitfalls

### Pitfall 1: Sending SMS Without Preference Check
**What goes wrong:** Guests who opted out still receive non-emergency SMS
**Why it happens:** Email pattern requires explicit check, easy to forget
**How to avoid:**
- Emergency alerts: Skip preference check (safety override)
- Flight delays/changes: ALWAYS check `canSendNotification(userId, 'smsEnabled')`
**Warning signs:** User complaints, regulatory issues (TCPA compliance)

### Pitfall 2: Not Validating Phone Numbers
**What goes wrong:** Twilio charges for failed sends to invalid numbers
**Why it happens:** User input in `guestProfile.phone` not validated on save
**How to avoid:**
- Use `isValidPhoneNumber()` before calling `sendSMS()`
- Add E.164 format validation to GuestProfile form (future enhancement)
**Warning signs:** High error rates in logs, unexpected Twilio charges

### Pitfall 3: SMS Too Long (Unexpected Segmentation)
**What goes wrong:** Message costs 3x expected due to multi-segment splitting
**Why it happens:** Unicode characters reduce limit to 70 chars, concatenation overhead
**How to avoid:**
- Keep messages under 160 chars (GSM-7) or 70 chars (Unicode)
- UI shows character count with warning (itinerary-change dialog line 84)
- Test with emoji/unicode in dev environment
**Warning signs:** Higher than expected Twilio costs per message

### Pitfall 4: Missing Phone Numbers (Silent Failures)
**What goes wrong:** Guest assumes they'll get SMS but phone not on file
**Why it happens:** Phone is optional in GuestProfile schema (line 275 schema.prisma)
**How to avoid:**
- Filter out null phones before batch sending (emergency-alert dialog pattern)
- Show admin how many guests will/won't receive message
- Log skipped recipients clearly
**Warning signs:** Guests report not receiving alerts when others did

### Pitfall 5: Emergency Alerts Blocked by Opt-Out
**What goes wrong:** Safety-critical message doesn't reach guest
**Why it happens:** Developer applies preference check to emergency alerts
**How to avoid:**
- Document which message types bypass preferences
- Emergency broadcasts NEVER check `smsEnabled`
- UI clearly indicates override (emergency dialog line 83)
**Warning signs:** Guest in emergency situation unreachable

## Code Examples

Verified patterns from existing codebase:

### Complete tRPC Procedure (Flight Delay Pattern)
```typescript
// From lib/trpc/server/routers/admin.ts (scaffolded, needs completion)
sendFlightDelaySMS: adminProcedure
  .input(
    z.object({
      bookingId: z.string(),
      delayInfo: z.object({
        tripDate: z.string(),
        newTime: z.string(),
        contactInfo: z.string(),
      }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // 1. Get booking with user preferences
    const booking = await ctx.db.booking.findUnique({
      where: { id: input.bookingId },
      include: {
        user: {
          select: {
            id: true,
            notificationPreferences: true,
            guestProfile: { select: { phone: true, firstName: true } },
          },
        },
      },
    });

    if (!booking) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
    }

    // 2. Check preference (flight delays are optional)
    if (!(await canSendNotification(booking.user.id, 'smsEnabled'))) {
      smsLogger.info({ userId: booking.user.id }, 'User opted out of SMS');
      return { sent: false, reason: 'opted_out' };
    }

    // 3. Validate phone
    const phone = booking.user.guestProfile?.phone;
    if (!phone || !isValidPhoneNumber(phone)) {
      return { sent: false, reason: 'invalid_phone' };
    }

    // 4. Send SMS
    await sendSMS({
      to: phone,
      message: `Flight delay for ${booking.bookingReference}: New departure ${input.delayInfo.newTime}. Contact: ${input.delayInfo.contactInfo}`,
    });

    return { sent: true };
  }),
```

### Emergency Broadcast (Batch Pattern)
```typescript
// From lib/trpc/server/routers/admin.ts (scaffolded)
sendEmergencyAlertSMS: adminProcedure
  .input(
    z.object({
      tripId: z.string(),
      alertMessage: z.string().min(1).max(160), // Enforce single segment
      contactInfo: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // Get all confirmed guests (no preference check for emergency)
    const bookings = await ctx.db.booking.findMany({
      where: { tripId: input.tripId, status: 'CONFIRMED' },
      include: {
        user: { include: { guestProfile: { select: { phone: true } } } },
      },
    });

    // Filter valid phones
    const validPhones = bookings.filter(
      (b) => b.user.guestProfile?.phone && isValidPhoneNumber(b.user.guestProfile.phone)
    );

    // Batch send
    await sendBatchSMS(
      validPhones.map((b) => ({
        to: b.user.guestProfile!.phone!,
        message: `URGENT: ${input.alertMessage}. Contact: ${input.contactInfo}`,
      }))
    );

    return {
      sentCount: validPhones.length,
      skippedCount: bookings.length - validPhones.length,
    };
  }),
```

### Lazy Client Initialization (Security Pattern)
```typescript
// From lib/sms/twilio.ts lines 14-36
// Pattern: Lazy load expensive dependency
let twilioClientPromise: Promise<Twilio> | null = null;

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
// Benefits: No Twilio import unless needed, singleton pattern
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Synchronous Twilio import | Lazy async import with promise cache | Twilio v5.x (2024) | Faster cold starts, optional dependency |
| Manual message segmentation | Automatic UCS-2/GSM-7 detection | Always (Twilio handles) | No manual character counting needed |
| Custom retry logic | Built-in `autoRetry` flag | Twilio v4.x+ | Simpler error handling, exponential backoff |
| Plain text logging | Structured logging with masking | Current codebase pattern | GDPR/PII compliance |
| E.164 format not enforced | Validation with `isValidPhoneNumber()` | Current implementation | Prevents invalid sends, saves costs |

**Deprecated/outdated:**
- **Twilio REST API v2010-04-01**: Still supported but use SDK instead (type safety, retry logic)
- **Hard-coded credentials**: Use environment variables (security best practice)
- **Throwing on SMS failure**: Email pattern (sendgrid.ts) logs but doesn't throw - SMS should follow

## Existing Implementation Analysis

### What Exists (High Quality)
```
✓ lib/sms/twilio.ts - Complete SMS infrastructure
  - Lazy initialization with type safety
  - E.164 phone validation
  - Phone number masking for logs
  - Batch sending with Promise.allSettled
  - Graceful degradation (logs warning if not configured)

✓ components/admin/*.tsx - Three UI dialogs
  - Flight delay SMS (dialog + form validation)
  - Itinerary change SMS (textarea with character hint)
  - Emergency alert SMS (destructive styling, confirmation)

✓ lib/preferences/user-preferences.ts
  - canSendNotification() helper
  - smsEnabled default: true

✓ Prisma schema User model
  - notificationPreferences JSON field
  - smsEnabled key exists in default value (line 226)
```

### What Needs Building
```
⚠ tRPC admin procedures (admin.ts)
  - Currently log instead of send (marked "TODO")
  - Need to call sendSMS() with preference checks
  - Return success/failure counts

⚠ Admin panel integration
  - Dialogs exist but not rendered in UI
  - Need to add to bookings page
  - Need to add to trips page

⚠ Environment variable documentation
  - .env.test.example exists but no root .env.example
  - Need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
```

## Open Questions

Things that couldn't be fully resolved:

1. **Should SMS delivery receipts be tracked?**
   - What we know: Twilio supports status callbacks via webhooks
   - What's unclear: Whether MVP needs delivery tracking or just send-and-forget
   - Recommendation: Skip for MVP (logs show send attempts), add in future if needed

2. **Rate limiting per admin user?**
   - What we know: Emergency broadcasts could send 100+ SMS at once
   - What's unclear: Whether to throttle admin broadcast frequency
   - Recommendation: Trust admin judgment for MVP, monitor abuse patterns

3. **International phone numbers?**
   - What we know: E.164 supports international (+44, +61, etc.)
   - What's unclear: Whether Twilio account has international sending enabled
   - Recommendation: Test with Twilio account, document supported countries

## Sources

### Primary (HIGH confidence)
- Existing codebase: `lib/sms/twilio.ts`, `lib/email/sendgrid.ts` (email pattern to follow)
- Twilio SDK v5.11.2: package.json, TypeScript types included
- Prisma schema: User.notificationPreferences, GuestProfile.phone (lines 226, 275)

### Secondary (MEDIUM confidence)
- [How to Send an SMS With TypeScript Using Twilio](https://www.twilio.com/en-us/blog/send-sms-typescript-twilio) - Official Twilio TypeScript guide
- [Twilio Node.js GitHub](https://github.com/twilio/twilio-node) - SDK repository
- [Understanding Twilio Rate Limits and Message Queues](https://help.twilio.com/articles/115002943027-Understanding-Twilio-Rate-Limits-and-Message-Queues) - Rate limiting behavior
- [Twilio SMS Best Practices Part 1: API basics](https://www.twilio.com/blog/programmable-sms-api-basics-best-practices) - Message segmentation, queueing
- [Best Practices for Scaling with Messaging Services](https://www.twilio.com/docs/messaging/guides/best-practices-at-scale) - Messaging Services, sender types

### Tertiary (LOW confidence - general patterns)
- [Emergency SMS Alert System](https://www.text-em-all.com/emergency-text-alert) - Emergency broadcast patterns
- [23 Message Types for Airlines](https://www.clickatell.com/blog/delight-airline-customers-with-23sms-texttypes/) - Flight delay notification examples
- [15 Essential Emergency Text Messages Examples](https://www.dialmycalls.com/blog/emergency-text-message-examples) - Emergency messaging best practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Twilio SDK already installed, existing code follows best practices
- Architecture: HIGH - Email infrastructure provides proven pattern, SMS stubs well-structured
- Pitfalls: HIGH - Identified from existing codebase patterns (phone optional, preference checking)

**Research date:** 2026-01-30
**Valid until:** 60 days (Twilio API stable, existing patterns unlikely to change)
