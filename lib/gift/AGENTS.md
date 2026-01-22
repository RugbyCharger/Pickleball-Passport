# Gift State Machine Documentation

> **For AI Agents and Developers**: This document explains the gift booking state machine pattern
> used in Pickleball Passport. Read this before modifying any gift-related code.

## Overview

The Gift State Machine manages the lifecycle of gift bookings from purchase through acceptance,
decline, or expiration. It provides:

- **Centralized state validation** - All transitions go through the state machine
- **Audit trail** - Every state change is recorded in `GiftStateTransition` table
- **Automated expiration** - Cron job expires gifts after 30 days without response
- **Side effect management** - Emails, refunds, and booking updates are handled atomically

## State Diagram

```
                    ┌──────────────────────────────────────────────────┐
                    │                  GIFT LIFECYCLE                   │
                    └──────────────────────────────────────────────────┘

                                       ┌───────────┐
                                       │  PENDING  │
                                       │   (new)   │
                                       └─────┬─────┘
                                             │
                      ┌──────────────────────┼──────────────────────┐
                      │                      │                      │
                      ▼                      ▼                      │
               ┌───────────┐          ┌───────────┐                 │
               │   SENT    │          │  EXPIRED  │◀────────────────┤
               │(notified) │          │ (timeout) │                 │
               └─────┬─────┘          └───────────┘                 │
                     │                     (T)                      │
                     │                                              │
      ┌──────────────┼──────────────┬───────────────────────────────┘
      │              │              │
      ▼              ▼              ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│ ACCEPTED  │  │ DECLINED  │  │  EXPIRED  │
│(received) │  │ (refund)  │  │ (timeout) │
└───────────┘  └───────────┘  └───────────┘
     (T)            (T)            (T)

(T) = Terminal state - no further transitions allowed
```

## Valid State Transitions

| From State | To State   | Trigger                                  | Side Effects                            |
|------------|------------|------------------------------------------|----------------------------------------|
| PENDING    | SENT       | Scheduled delivery date reached (cron)   | Email to recipient, set expiration     |
| PENDING    | EXPIRED    | 30 days without send (rare edge case)    | Refund, email to purchaser             |
| SENT       | ACCEPTED   | Recipient accepts via API                | Transfer ownership, emails to both     |
| SENT       | DECLINED   | Recipient declines via API               | Refund, cancel booking, emails to both |
| SENT       | EXPIRED    | 30 days after send without response      | Refund, cancel booking, email purchaser|

### Invalid Transitions (Will Throw Error)

- Any transition from ACCEPTED, DECLINED, or EXPIRED (terminal states)
- PENDING → ACCEPTED (must be SENT first)
- PENDING → DECLINED (must be SENT first)
- SENT → PENDING (no going back)

## Key Files

```
lib/gift/
├── gift-state-machine.ts        # State machine with validation rules
├── gift-transition-service.ts   # Service for executing transitions
├── __tests__/
│   ├── gift-state-machine.test.ts       # 47 unit tests
│   └── gift-transition-service.test.ts  # 15 unit tests
└── AGENTS.md                    # This documentation

lib/trpc/server/routers/gift.ts  # tRPC router using state machine

app/api/cron/
├── send-scheduled-gifts/route.ts # PENDING → SENT transitions
└── expire-gifts/route.ts         # SENT → EXPIRED transitions

prisma/schema.prisma             # GiftState enum, GiftStateTransition model

components/dashboard/
└── gift-state-timeline.tsx      # UI component for displaying history
```

## Database Schema

### GiftState Enum

```prisma
enum GiftState {
  PENDING   // Payment complete, waiting to send notification
  SENT      // Gift notification email sent to recipient
  ACCEPTED  // Recipient accepted gift, booking transferred (terminal)
  DECLINED  // Recipient declined gift, refund processed (terminal)
  EXPIRED   // Gift expired after 30 days without response (terminal)
}
```

### Booking Fields

```prisma
model Booking {
  // Existing gift fields
  isGift              Boolean
  giftStatus          GiftStatus    // Old enum, kept for backwards compat
  giftRecipientEmail  String?
  giftRecipientName   String?
  giftMessage         String?
  giftDeliveryDate    DateTime?
  giftAcceptedAt      DateTime?
  giftAcceptanceToken String?

  // New state machine fields (GS-001)
  giftStateChangedAt  DateTime?     // Last transition timestamp
  giftExpiresAt       DateTime?     // When gift expires (30 days after SENT)

  // Relation to audit trail
  giftStateTransitions GiftStateTransition[]
}
```

### GiftStateTransition Model (Audit Trail)

```prisma
model GiftStateTransition {
  id        String    @id @default(cuid())
  bookingId String
  booking   Booking   @relation(...)

  fromState GiftState // Previous state
  toState   GiftState // New state
  reason    String    // Human-readable reason
  metadata  Json?     // { triggeredBy, userId, additionalContext }

  createdAt DateTime  @default(now())

  @@index([bookingId])
  @@index([createdAt])
}
```

## Code Examples

### Basic State Transition

```typescript
import { GiftState } from '@prisma/client'
import { transitionGiftState } from '@/lib/gift/gift-transition-service'

// Transition a gift to ACCEPTED
const result = await transitionGiftState(
  bookingId,
  GiftState.ACCEPTED,
  'user',  // triggeredBy: 'user' | 'system' | 'cron'
  {
    recipientUserId: ctx.user.id,
    recipientEmail: ctx.user.email,
  }
)

if (!result.success) {
  throw new Error(result.error)
}
```

### Validating Transitions

```typescript
import { giftStateMachine } from '@/lib/gift/gift-state-machine'
import { GiftState } from '@prisma/client'

// Check if transition is valid
const canAccept = giftStateMachine.canTransition(
  GiftState.SENT,
  GiftState.ACCEPTED
) // true

// Get detailed validation result
const validation = giftStateMachine.validateTransition(
  GiftState.PENDING,
  GiftState.ACCEPTED
)
// { valid: false, error: "Invalid transition from PENDING to ACCEPTED..." }

// Get valid transitions from a state
const validTransitions = giftStateMachine.getValidTransitions(GiftState.SENT)
// [GiftState.ACCEPTED, GiftState.DECLINED, GiftState.EXPIRED]

// Check if state is terminal
const isTerminal = giftStateMachine.isTerminalState(GiftState.ACCEPTED) // true
```

### Getting Transition History

```typescript
import { getGiftStateHistory } from '@/lib/gift/gift-transition-service'

const history = await getGiftStateHistory(bookingId)
// Returns array of GiftStateTransition records, newest first
```

### Creating Custom Metadata

```typescript
const metadata = giftStateMachine.createMetadata('user', {
  userId: 'user_123',
  reason: 'Manual acceptance by admin',
  additionalContext: { adminNote: 'Verified by phone' },
})
```

## Side Effects by Transition

### PENDING → SENT

```
1. Update booking.giftStatus to 'SENT'
2. Set booking.giftExpiresAt = deliveryDate + 30 days
3. Record transition in GiftStateTransition
4. Send gift notification email to recipient
```

### SENT → ACCEPTED

```
1. Update booking.giftStatus to 'ACCEPTED'
2. Update booking.userId to recipient (transfer ownership)
3. Set booking.giftAcceptedAt = now()
4. Record transition in GiftStateTransition
5. Send confirmation email to recipient
6. Send notification email to purchaser
```

### SENT → DECLINED

```
1. Update booking.giftStatus to 'DECLINED'
2. Update booking.status to 'CANCELLED'
3. Process Stripe refund
4. Decrement trip capacity
5. Record transition in GiftStateTransition
6. Send notification email to purchaser
7. Send confirmation email to recipient
```

### SENT → EXPIRED (via cron)

```
1. Update booking.giftStatus to 'DECLINED' (backwards compat)
2. Update booking.status to 'CANCELLED'
3. Process Stripe refund
4. Decrement trip capacity
5. Record transition in GiftStateTransition
6. Send expiration notification email to purchaser
```

## Error Handling

### Invalid Transition Errors

```typescript
try {
  giftStateMachine.assertValidTransition(
    GiftState.ACCEPTED,
    GiftState.DECLINED
  )
} catch (error) {
  // Error: "Cannot transition from terminal state ACCEPTED"
}
```

### Transition Service Error Handling

The transition service returns a result object instead of throwing:

```typescript
const result = await transitionGiftState(...)

if (!result.success) {
  // Log the error
  console.error(result.error)

  // Return user-friendly message
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: result.error,
  })
}
```

### Cron Job Error Handling

Cron jobs process gifts individually and continue on failure:

```typescript
for (const gift of expiredGifts) {
  try {
    const result = await transitionGiftState(...)
    if (result.success) successCount++
    else failedCount++
  } catch (error) {
    failedCount++
    // Log but continue processing
  }
}
```

## Testing Patterns

### Unit Tests for State Machine

```typescript
describe('canTransition', () => {
  it('should allow PENDING → SENT', () => {
    expect(giftStateMachine.canTransition(
      GiftState.PENDING,
      GiftState.SENT
    )).toBe(true)
  })

  it('should not allow ACCEPTED → anything', () => {
    const allStates = giftStateMachine.getAllStates()
    for (const state of allStates) {
      expect(giftStateMachine.canTransition(
        GiftState.ACCEPTED,
        state
      )).toBe(false)
    }
  })
})
```

### Unit Tests for Transition Service (with mocks)

```typescript
vi.mock('@/lib/db', () => ({
  prisma: {
    booking: { findUnique: vi.fn(), update: vi.fn() },
    giftStateTransition: { create: vi.fn() },
    $transaction: vi.fn((cb) => cb({ ... })),
  },
}))

vi.mock('@/lib/email/sendgrid', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

it('should transition from PENDING to SENT', async () => {
  vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking)
  vi.mocked(prisma.$transaction).mockImplementation(async (cb) => {
    return cb({
      giftStateTransition: {
        create: vi.fn().mockResolvedValue({ id: 'transition-1' }),
      },
      booking: { update: vi.fn() },
    })
  })

  const result = await transitionGiftState(
    'booking-1',
    GiftState.SENT,
    'cron',
    { skipEmails: true }
  )

  expect(result.success).toBe(true)
})
```

## Cron Job Configuration

### Vercel Cron (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/send-scheduled-gifts",
      "schedule": "0 16 * * *"
    },
    {
      "path": "/api/cron/expire-gifts",
      "schedule": "0 10 * * *"
    }
  ]
}
```

### Schedule Summary

| Cron Job             | Time (UTC) | Time (PST) | Purpose                        |
|---------------------|------------|------------|--------------------------------|
| send-scheduled-gifts| 16:00      | 9:00 AM    | PENDING → SENT                |
| expire-gifts        | 10:00      | 3:00 AM    | SENT → EXPIRED (30 day check) |

## Configuration Constants

```typescript
// lib/gift/gift-transition-service.ts
const GIFT_EXPIRATION_DAYS = 30

// app/api/cron/expire-gifts/route.ts
const BATCH_SIZE = 10
const MAX_GIFTS_PER_RUN = 100
const BATCH_DELAY_MS = 1000
```

## Backwards Compatibility

The new `GiftState` enum coexists with the old `GiftStatus` enum:

- `GiftStatus` is still used in the `booking.giftStatus` field
- `GiftState` is used in the `GiftStateTransition` audit table
- The transition service maps between them:

```typescript
function mapStateToStatus(state: GiftState): GiftStatus {
  const mapping = {
    PENDING: 'PENDING',
    SENT: 'SENT',
    ACCEPTED: 'ACCEPTED',
    DECLINED: 'DECLINED',
    EXPIRED: 'DECLINED', // EXPIRED maps to DECLINED for backwards compat
  }
  return mapping[state]
}
```

## UI Components

### GiftStateTimeline

Full timeline component showing state history with expiration countdown:

```tsx
<GiftStateTimeline
  currentState={booking.giftStatus}
  expiresAt={booking.giftExpiresAt?.toISOString()}
  stateHistory={booking.giftStateTransitions}
  isAdmin={false}
/>
```

### GiftStatusBadge

Simple inline badge with expiration warning:

```tsx
<GiftStatusBadge
  currentState={booking.giftStatus}
  expiresAt={booking.giftExpiresAt?.toISOString()}
/>
```

## Common Pitfalls

1. **Don't bypass the state machine** - Always use `transitionGiftState()` instead of
   direct Prisma updates to ensure audit logging and side effects.

2. **Check terminal states** - Always validate transitions before attempting them.
   Terminal states (ACCEPTED, DECLINED, EXPIRED) cannot be changed.

3. **Handle failures gracefully** - The transition service returns a result object.
   Check `result.success` before proceeding.

4. **Test with skipEmails** - Use `{ skipEmails: true }` in tests to avoid
   actually sending emails or making Stripe calls.

5. **Mind the expiration** - `giftExpiresAt` is set when transitioning to SENT.
   The expire-gifts cron checks this field daily.

## Related Documentation

- [E3-S18: Gift Booking Flow](../trpc/server/routers/gift.ts) - Original gift implementation
- [Stripe Integration](../payments/) - Payment and refund handling
- [Email Templates](../email/templates/gift-*.ts) - Gift-related email templates

---

*Last updated: 2026-01-20 (GS-001 through GS-008)*
*Test coverage: 62+ unit tests across state machine and transition service*
