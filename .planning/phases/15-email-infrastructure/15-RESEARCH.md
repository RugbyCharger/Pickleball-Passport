# Phase 15: Email Infrastructure - Research

**Researched:** 2026-01-30
**Domain:** Email Sequences, Scheduled Sending, Vercel Cron Jobs
**Confidence:** HIGH

## Summary

Phase 15 extends the existing email infrastructure to deliver scheduled emails at key trip lifecycle moments. The codebase already has a mature email system with SendGrid integration, Vercel cron jobs, and database-driven tracking (see `lib/email/send-pre-trip-emails.ts` and `lib/payments/send-payment-reminders.ts`). This phase adds three new email sequences:

1. **Payment reminders** (COMM-01): 7 days before scheduled installment
2. **Pre-trip nurture** (COMM-02): 60/30/14/7/1 days before departure
3. **Post-trip follow-up** (COMM-03): 3/7/14/30/60 days after return

**Critical finding:** The pre-trip (COMM-02) and payment reminder (COMM-01) email sequences are **already implemented** in the codebase. The research confirms these implementations are complete and functional. Phase 15 only needs to implement the **post-trip follow-up sequence (COMM-03)**.

**Primary recommendation:** Extend the existing pattern (database array tracking + daily cron job) to implement post-trip follow-up emails, matching the established architecture exactly.

## Standard Stack

The established libraries/tools for this domain (all already in use):

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @sendgrid/mail | 8.x | Transactional email sending | Already integrated, official SDK |
| date-fns | 4.x | Date calculations for milestones | Already used for pre-trip sequence |
| Prisma | 5.22.0 | Database ORM for tracking state | Already configured |
| Vercel Cron | N/A | Scheduled job execution | Already configured with 7 cron jobs |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pino / custom logger | N/A | Structured logging | Already in `lib/logger` |
| zod | 3.x | Input validation | Already used in tRPC routers |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Daily cron | SendGrid send_at | SendGrid limits to 72 hours max scheduling |
| DB array tracking | Separate EmailSent table | More complex, existing pattern works |
| Custom email builder | SendGrid Dynamic Templates | Code templates give more control, already working |

**Installation:**
```bash
# No new packages needed - all dependencies exist
```

## Architecture Patterns

### Recommended Project Structure (Matching Existing)

```
lib/email/
  send-email.ts          # Core sendEmail function (EXISTS)
  sendgrid.ts            # SendGrid client (EXISTS)
  send-pre-trip-emails.ts       # Pre-trip service (EXISTS - COMM-02)
  send-post-trip-emails.ts      # Post-trip service (NEW - COMM-03)
  templates/
    pre-trip-sequence.ts        # Pre-trip templates (EXISTS)
    post-trip-sequence.ts       # Post-trip templates (NEW)
    upcoming-payment-reminder.ts # Payment reminder (EXISTS - COMM-01)
app/api/cron/
  send-pre-trip-emails/route.ts       # Cron endpoint (EXISTS)
  send-post-trip-emails/route.ts      # Cron endpoint (NEW)
  send-payment-reminders/route.ts     # Cron endpoint (EXISTS)
```

### Pattern 1: Database Array Tracking (Established Pattern)

**What:** Store sent email milestones as string array on Booking model
**When to use:** For tracking which emails in a sequence have been sent
**Example:**
```typescript
// Source: prisma/schema.prisma (line 540)
model Booking {
  preTripEmailsSent String[] @default([]) // ["60_DAYS", "30_DAYS", etc.]
  // NEW: Add for post-trip
  postTripEmailsSent String[] @default([]) // ["3_DAYS", "7_DAYS", etc.]
}
```

### Pattern 2: Milestone-Based Query (Established Pattern)

**What:** Calculate target date from today + milestone days, query bookings matching that date
**When to use:** Finding bookings that need emails at a specific milestone
**Example:**
```typescript
// Source: lib/email/send-pre-trip-emails.ts (lines 76-124)
async function processOneMilestone(
  today: Date,
  milestoneKey: string,
  daysAfterTrip: number // For post-trip: positive number
): Promise<ProcessResult> {
  // Calculate target trip end date
  const targetTripEndDate = addDays(today, -daysAfterTrip) // Subtract for "X days ago"
  const targetStart = startOfDay(targetTripEndDate)
  const targetEnd = endOfDay(targetTripEndDate)

  // Find eligible bookings
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'COMPLETED', // Trip completed
      tripId: { not: null },
      trip: {
        endDate: {
          gte: targetStart,
          lte: targetEnd,
        },
      },
      NOT: {
        postTripEmailsSent: {
          has: milestoneKey,
        },
      },
    },
    include: {
      user: true,
      package: true,
      trip: true,
    },
    take: 100, // Safety limit
  })
  // ... send emails
}
```

### Pattern 3: Non-Blocking Error Handling (Established Pattern)

**What:** Log email failures, continue processing remaining bookings
**When to use:** Always in batch email processing
**Example:**
```typescript
// Source: lib/email/send-pre-trip-emails.ts (lines 163-231)
for (const booking of bookings) {
  try {
    await sendEmail({ ... })
    // Mark as sent only after successful send
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        postTripEmailsSent: { push: milestoneKey },
      },
    })
    sent++
  } catch (error) {
    // Log but don't throw - continue with other bookings
    console.error(`Error sending email for ${booking.bookingReference}:`, error)
    errors++
  }
}
```

### Pattern 4: Cron Endpoint Security (Established Pattern)

**What:** Verify CRON_SECRET header before processing
**When to use:** All cron endpoints
**Example:**
```typescript
// Source: app/api/cron/send-pre-trip-emails/route.ts (lines 19-40)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron job not configured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Process emails...
}
```

### Anti-Patterns to Avoid
- **SendGrid send_at for scheduling:** Limited to 72 hours, don't use for sequences spanning weeks/months
- **Storing sent state in separate table:** Adds complexity, existing array pattern works well
- **Processing without limits:** Always include `take: 100` or similar safety limit
- **Failing entire batch on one error:** Continue processing, log failures

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email tracking | Custom event system | DB array on Booking | Existing pattern, atomic updates |
| Date calculations | Manual math | date-fns addDays/differenceInDays | Timezone safe, tested |
| Email templating | Dynamic template strings | baseEmailTemplate + generatePlainText | Consistent branding, HTML+text |
| Cron security | Custom auth | CRON_SECRET pattern | Vercel standard, already configured |
| User preferences | Per-email opt-out | canSendNotification service | Already implemented (E11-S12) |

**Key insight:** The entire email sequence infrastructure exists. Don't reinvent - extend the existing patterns.

## Common Pitfalls

### Pitfall 1: Duplicate Email Sends

**What goes wrong:** Same email sent multiple times to same guest
**Why it happens:** Race conditions, missing idempotency check, retrying after partial success
**How to avoid:**
- Always check milestone array BEFORE sending
- Mark as sent immediately AFTER successful send (not before)
- Use atomic push operation in Prisma
**Warning signs:** Multiple identical emails in logs, customer complaints

### Pitfall 2: Trip Date Changes Breaking Sequence

**What goes wrong:** Guest reschedules trip but emails still sent based on old dates
**Why it happens:** Query is date-based, doesn't account for trip modifications
**How to avoid:**
- Query uses trip.endDate directly from database (always current)
- Clear postTripEmailsSent array if trip dates change significantly
- Consider adding updatedAt check for recently modified bookings
**Warning signs:** Emails arriving at wrong time relative to actual trip

### Pitfall 3: Cancelled Bookings Receiving Emails

**What goes wrong:** Guests who cancelled still receive emails
**Why it happens:** Status check missing or incomplete
**How to avoid:**
- Always filter by `status: 'COMPLETED'` for post-trip (not just "not CANCELLED")
- For gift bookings, check giftStatus is 'ACCEPTED'
- Use soft-delete `deletedAt: null` filter
**Warning signs:** Complaints from cancelled guests, wasted SendGrid usage

### Pitfall 4: User Preference Bypass

**What goes wrong:** Emails sent to users who opted out
**Why it happens:** Not checking canSendNotification before sending
**How to avoid:**
- For marketing/optional emails, call `canSendNotification(userId, 'emailPostTripFollowUp')` first
- Transactional emails (payment reminders) bypass preferences
- Include preference link in email footer
**Warning signs:** Unsubscribe complaints, potential CAN-SPAM issues

### Pitfall 5: Timezone Confusion in Date Calculations

**What goes wrong:** Emails sent on wrong day for guests in different timezones
**Why it happens:** Using local date instead of UTC, inconsistent date handling
**How to avoid:**
- Store all dates as UTC in database
- Use startOfDay/endOfDay from date-fns (handles boundaries correctly)
- Cron runs at fixed UTC time (existing pattern: 7 AM, 8 AM, 9 AM UTC)
**Warning signs:** Emails arriving day early/late for some guests

### Pitfall 6: Vercel Cron Timeout

**What goes wrong:** Job times out before completing all emails
**Why it happens:** Too many emails to process, slow database queries
**How to avoid:**
- Use `take: 100` limit per milestone
- Add database indexes on query fields
- Process milestones sequentially with batching
- Log execution time for monitoring
**Warning signs:** Partial processing, executionTimeMs > 50000 in logs

## Code Examples

Verified patterns from existing codebase:

### Post-Trip Milestone Constants
```typescript
// Matches pre-trip pattern from lib/email/templates/pre-trip-sequence.ts
export const POST_TRIP_MILESTONES = {
  THREE_DAYS: { key: '3_DAYS', daysAfterTrip: 3, label: '3 Days After' },
  SEVEN_DAYS: { key: '7_DAYS', daysAfterTrip: 7, label: '7 Days After' },
  FOURTEEN_DAYS: { key: '14_DAYS', daysAfterTrip: 14, label: '14 Days After' },
  THIRTY_DAYS: { key: '30_DAYS', daysAfterTrip: 30, label: '30 Days After' },
  SIXTY_DAYS: { key: '60_DAYS', daysAfterTrip: 60, label: '60 Days After' },
} as const

export type PostTripMilestoneKey = typeof POST_TRIP_MILESTONES[keyof typeof POST_TRIP_MILESTONES]['key']
```

### Query for Post-Trip Bookings (Adapting Pre-Trip Pattern)
```typescript
// Source: Adapted from lib/email/send-pre-trip-emails.ts
const bookings = await prisma.booking.findMany({
  where: {
    status: 'COMPLETED', // Key difference: COMPLETED not CONFIRMED
    tripId: { not: null },
    deletedAt: null, // Respect soft deletes
    trip: {
      endDate: {
        gte: targetStart,
        lte: targetEnd,
      },
    },
    NOT: {
      postTripEmailsSent: {
        has: milestoneKey,
      },
    },
    // Skip unaccepted gift bookings
    OR: [
      { isGift: false },
      { isGift: true, giftStatus: 'ACCEPTED' },
    ],
  },
  include: {
    user: true,
    package: true,
    trip: true,
  },
  take: 100,
})
```

### Email Generation Pattern
```typescript
// Source: Matches lib/email/templates/pre-trip-sequence.ts pattern
export function generatePostTripEmail(
  data: PostTripEmailData,
  milestone: PostTripMilestoneKey
): { html: string; text: string; subject: string } {
  let content: string
  let subject: string

  switch (milestone) {
    case '3_DAYS':
      content = generate3DaysEmail(data)
      subject = `Welcome Back! How Was Your ${data.packageName} Experience?`
      break
    case '7_DAYS':
      content = generate7DaysEmail(data)
      subject = `Share Your Transformation Story, ${data.firstName}!`
      break
    // ... other milestones
  }

  const html = baseEmailTemplate({
    title: subject,
    content,
    preheader: `Post-trip update from Pickleball Passport`,
  })

  return { html, text: generatePlainText(content), subject }
}
```

### User Preference Check (For Optional Emails)
```typescript
// Source: lib/email/sendgrid.ts comments (lines 60-89)
import { canSendNotification } from '@/lib/preferences/user-preferences'

// Post-trip follow-ups are OPTIONAL - check preferences
if (!(await canSendNotification(booking.userId, 'emailPostTripFollowUp'))) {
  console.log(`User ${booking.userId} opted out of post-trip emails`)
  skipped++
  continue
}

await sendEmail({
  to: userEmail,
  subject,
  html,
  text,
  userId: booking.userId, // For preference token generation
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual email sends | Cron-driven automation | Already implemented | Consistent delivery, no manual work |
| External queue (BullMQ) | Vercel Cron + DB state | Vercel native | Simpler architecture, no Redis needed |
| SendGrid Dynamic Templates | Code-based templates | Project decision | Full control, versioned in repo |

**Deprecated/outdated:**
- SendGrid's `send_at` parameter: Limited to 72 hours, not suitable for multi-week sequences
- External job queues (Bull, BullMQ): Adds infrastructure complexity, Vercel Cron sufficient

## Implementation Requirements (From Requirements)

### COMM-01: Payment Reminder Emails (7 Days Before Installment)
**Status:** ALREADY IMPLEMENTED
- Location: `lib/payments/send-payment-reminders.ts`
- Cron: `/api/cron/send-payment-reminders` (9 AM UTC daily)
- Tracking: `PaymentRecord.reminderSentAt` field
- Template: `lib/email/templates/upcoming-payment-reminder.ts`

### COMM-02: Pre-Trip Nurture Sequence (60/30/14/7/1 Days Before)
**Status:** ALREADY IMPLEMENTED
- Location: `lib/email/send-pre-trip-emails.ts`
- Cron: `/api/cron/send-pre-trip-emails` (7 AM UTC daily)
- Tracking: `Booking.preTripEmailsSent` string array
- Template: `lib/email/templates/pre-trip-sequence.ts`

### COMM-03: Post-Trip Follow-up Sequence (3/7/14/30/60 Days After)
**Status:** TO BE IMPLEMENTED
- Required schema: `Booking.postTripEmailsSent String[] @default([])`
- Required index: `@@index([status, tripId])` for efficient queries
- Cron timing: Suggest 6 AM UTC (before pre-trip emails)
- User preference: Check `emailPostTripFollowUp` before sending

## Open Questions

Things that couldn't be fully resolved:

1. **Post-trip email content**
   - What we know: Need 5 milestone emails (3/7/14/30/60 days after)
   - What's unclear: Specific content/CTAs for each milestone
   - Recommendation: Define during planning - testimonial request, referral CTA, rebooking offer

2. **Booking status transition**
   - What we know: Post-trip requires `status: 'COMPLETED'`
   - What's unclear: Is there automation to move CONFIRMED to COMPLETED?
   - Recommendation: Verify transition exists or add to requirements

3. **Trip.endDate availability**
   - What we know: Schema has `Trip.endDate DateTime`
   - What's unclear: Is endDate always populated for all trips?
   - Recommendation: Query should handle null endDate gracefully

## Sources

### Primary (HIGH confidence)
- Existing codebase: `lib/email/send-pre-trip-emails.ts` - Complete implementation pattern
- Existing codebase: `lib/payments/send-payment-reminders.ts` - Payment reminder pattern
- Existing codebase: `prisma/schema.prisma` - Database schema with tracking fields
- Existing codebase: `vercel.json` - 7 cron jobs already configured

### Secondary (MEDIUM confidence)
- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs) - Cron configuration and limits
- [SendGrid Scheduling Parameters](https://docs.sendgrid.com/for-developers/sending-email/scheduling-parameters) - 72-hour limit confirmed
- [SendGrid Node.js Scheduled Send](https://github.com/sendgrid/sendgrid-nodejs/blob/main/docs/use-cases/scheduled-send.md) - API usage

### Tertiary (LOW confidence)
- [Encharge Email Sequence Templates](https://encharge.io/email-sequence-templates/) - Industry patterns for post-purchase follow-up

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in production use
- Architecture: HIGH - Exact pattern exists, just needs extension
- Pitfalls: HIGH - Based on existing implementation review
- Post-trip content: LOW - Needs business input for specific messaging

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (60 days - stable architecture, no expected changes)
