# Installment Payment Cron Job Design
**Epic**: E4-S6 Phase 8
**Date**: 2026-01-15
**Status**: Approved

## Overview

Automated cron job that runs daily to charge scheduled installment payments for bookings using the 4-installment payment plan. This completes the installment payment feature by automating the charging of installments 2, 3, and 4 after the initial payment.

## Context

### What's Already Built (Phases 1-7)
- ✅ Calculation utilities for 4-installment schedule (50%, 25%, 15%, 10%)
- ✅ PaymentRecord database model with due dates
- ✅ Booking API creates PaymentRecords for all 4 installments
- ✅ Stripe customer creation and payment method storage
- ✅ Webhook handler updates PaymentRecord status on payment success/failure
- ✅ UI components with authorization checkbox

### What Phase 8 Adds
- Automated charging of subsequent installments (2, 3, 4)
- Retry logic for failed payments
- Customer notifications for payment reminders
- Admin alerts for permanently failed payments

## Architecture

### High-Level Flow
```
Daily Cron (9 AM)
  ↓
Find Due/Overdue PaymentRecords
  ↓
For Each Payment:
  ├─ Validate booking & customer
  ├─ Create Stripe Payment Intent (off_session, confirm: true)
  ├─ Store payment intent ID in PaymentRecord
  └─ Webhook handles status update (Phase 6)
```

### Key Design Decisions

#### 1. Payment Method Strategy
**Approach**: Use Stripe payment intents with `off_session` confirmation

- Create payment intent with `customer` parameter
- Set `confirm: true` for immediate charge
- Set `off_session: true` to indicate automated payment
- Stripe automatically uses customer's default payment method
- Handles 3D Secure authentication if required

**Why**: This follows Stripe's best practices for recurring payments and provides clear error handling.

#### 2. Due Date Query
```typescript
const duePayments = await prisma.paymentRecord.findMany({
  where: {
    status: 'PENDING',
    OR: [
      // New payments due today or overdue
      { dueDate: { lte: today }, retryCount: 0 },

      // Failed payments ready for retry
      {
        retryCount: { gte: 1, lt: 4 },
        lastAttemptAt: { lte: getRetryDate(retryCount) }
      }
    ]
  },
  include: {
    booking: {
      include: { user: true, trip: true }
    }
  }
})
```

**Why**: Single query captures both new charges and retry attempts efficiently.

#### 3. Idempotency
Each payment attempt uses unique idempotency key:
```typescript
const idempotencyKey = `installment-${paymentRecordId}-${retryCount}-${dueDate}`
```

**Why**: Prevents duplicate charges if cron runs multiple times for the same payment.

## Retry Logic (Exponential Backoff)

### Retry Schedule
| Attempt | Timing | Days After Previous |
|---------|--------|---------------------|
| 1 (original) | On due date | - |
| 2 | 24 hours later | +1 day |
| 3 | After attempt 2 | +3 days |
| 4 (final) | After attempt 3 | +7 days |

**Total Grace Period**: 11 days from original due date

### Schema Changes
```prisma
model PaymentRecord {
  // ... existing fields ...
  retryCount     Int      @default(0)  // Track retry attempts (0-3)
  lastAttemptAt  DateTime?             // When last charge was attempted
  failureReason  String?               // Stripe error message for debugging
}
```

### Retry Eligibility

**Transient Errors** (retry eligible):
- `card_declined`
- `insufficient_funds`
- `expired_card`
- `authentication_required`

**Permanent Errors** (no retry):
- Customer deleted
- Payment method removed
- Invalid customer ID

**System Errors**:
- Logged but don't update PaymentRecord
- Will retry on next cron run

### Failure Handling

#### Customer Notifications
After each failed attempt (1-3), send customer email:
- Subject: "Payment Reminder: Upcoming Installment Due"
- Includes next retry date
- Link to update payment method in dashboard
- Friendly, non-alarming tone

#### Admin Notifications
After 4th failure only:
- Email to admin with booking details
- Dashboard flag for manual follow-up
- Customer contact information
- Full failure history with error codes

#### Booking Status
- Booking remains `CONFIRMED` if previous installments paid
- No automatic cancellation
- Admin decides whether to cancel or work with customer
- Customer can still access dashboard and update payment method

## Security

### 1. Authentication
```typescript
const authHeader = req.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

Environment variable `CRON_SECRET` must be set in Vercel.

### 2. Rate Limiting
- Process payments in batches of 10
- 1-second delay between batches
- Maximum 100 payments per execution (safety limit)
- Prevents Stripe API rate limit issues

### 3. Idempotency Keys
- Unique key per payment attempt prevents duplicate charges
- Format: `installment-${recordId}-${retry}-${date}`
- Protects against cron running multiple times

## Implementation Plan

### New Files

#### 1. `app/api/cron/charge-installments/route.ts`
Main cron endpoint handler:
- Verifies authentication
- Finds due payments
- Orchestrates charging process
- Returns execution summary

#### 2. `lib/payments/charge-installment.ts`
Core payment charging logic:
- Creates Stripe payment intent
- Handles errors and categorizes them
- Updates PaymentRecord with attempt info
- Returns success/failure result

#### 3. `lib/payments/retry-calculator.ts`
Retry date calculation utilities:
- `getRetryDate(retryCount)`: Calculate next retry date
- `isRetryEligible(error)`: Determine if error is transient
- `getNextRetryDate(lastAttempt, retryCount)`: Calculate backoff

#### 4. `lib/email/installment-reminder.ts`
Customer reminder email templates:
- Failed payment notification
- Next retry date information
- Link to update payment method
- Support contact information

### Modified Files

#### 1. `prisma/schema.prisma`
Add retry tracking fields to PaymentRecord:
```prisma
model PaymentRecord {
  // ... existing fields ...
  retryCount     Int      @default(0)
  lastAttemptAt  DateTime?
  failureReason  String?
}
```

Migration: `npx prisma migrate dev --name add_retry_fields_to_payment_record`

#### 2. `vercel.json`
Add cron configuration:
```json
{
  "crons": [{
    "path": "/api/cron/charge-installments",
    "schedule": "0 9 * * *"
  }]
}
```

Schedule: Daily at 9:00 AM UTC

### Environment Variables
Add to Vercel project settings:
```
CRON_SECRET=<random-secure-string>
```

## Monitoring & Logging

### Execution Response
```typescript
{
  processedAt: "2026-01-15T09:00:00Z",
  totalProcessed: 25,
  successful: 22,
  failed: 2,
  retryScheduled: 1,
  permanentFailures: 0,
  errors: [],
  executionTimeMs: 3420
}
```

### Logs Per Payment
```typescript
{
  paymentRecordId: "rec_xxx",
  bookingReference: "PBP-2026-123456",
  installmentNumber: 2,
  amountCents: 75000,
  attempt: 1,
  result: "success" | "failed_retry" | "failed_permanent",
  stripePaymentIntentId?: "pi_xxx",
  error?: "card_declined"
}
```

### Metrics to Track
- Daily success rate
- Average retry attempts before success
- Most common failure reasons
- Peak payment processing times
- Failed payments requiring admin intervention

## Testing Strategy

### Local Testing
1. **Mock cron trigger**: Call endpoint with auth header
2. **Test mode cards**: Use Stripe test cards for different scenarios
3. **Database state**: Manually create PaymentRecords with past due dates
4. **Webhook verification**: Ensure PaymentRecord updates work end-to-end

### Test Scenarios
| Scenario | Setup | Expected Result |
|----------|-------|-----------------|
| Successful charge | Due payment, valid card | Status → PAID, paidDate set |
| Declined card | Due payment, declined test card | Status → PENDING, retryCount++, email sent |
| Expired card | Due payment, expired test card | Status → PENDING, retryCount++, email sent |
| 4th failure | Payment with retryCount=3 | Status → FAILED, admin alert |
| No due payments | All payments future-dated | No charges attempted |
| Overdue payment | Payment 5 days past due | Charged immediately |
| Multiple retries | Various retry schedules | Only eligible retries attempted |

### Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`
- Expired: `4000 0000 0000 0069`

## Edge Cases

### 1. Customer Deleted Payment Method
- Error: `payment_method_not_found`
- Action: Mark retry eligible, send customer email
- Customer must add new payment method via dashboard

### 2. Stripe Customer Deleted
- Error: `customer_not_found`
- Action: Mark as permanent failure, admin alert
- Admin must manually recreate payment flow

### 3. Booking Cancelled After Installment Plan Started
- Booking status: `CANCELLED`
- Action: Skip charging, don't process PaymentRecords
- Refund logic handled separately (not in cron)

### 4. Multiple Payments Due Same Day
- Common for trips starting on same date
- Batch processing handles this efficiently
- No special logic needed

### 5. Trip Start Date Approaches with Unpaid Installments
- Cron continues retry schedule
- Admin dashboard flags urgent payments
- Admin can manually resolve or cancel booking

## Success Criteria

✅ Cron job successfully charges due installments
✅ Failed payments retry with exponential backoff
✅ Customers receive friendly reminder emails
✅ Admins notified only for permanent failures
✅ No duplicate charges (idempotency works)
✅ Webhook integration works end-to-end
✅ Rate limiting prevents API issues
✅ Detailed logging for monitoring
✅ All test scenarios pass

## Future Enhancements (Not in Phase 8)

- Dashboard view for admins to see upcoming charges
- Manual retry button in admin interface
- Customer self-service payment method update flow
- SMS notifications for failed payments
- Automatic booking cancellation after X failures (requires business rules)
- Analytics dashboard for payment success rates

## Dependencies

- Phase 6 webhook handler (already complete)
- Stripe customer creation (already complete)
- PaymentRecord model (already complete)
- Email service infrastructure (existing)

## Rollout Plan

1. Deploy schema migration (retry fields)
2. Deploy cron job code (won't run until configured)
3. Add `CRON_SECRET` to Vercel environment
4. Deploy `vercel.json` to enable cron schedule
5. Monitor first execution via Vercel logs
6. Validate webhook updates work correctly
7. Test failure scenarios with test mode bookings

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Duplicate charges | Low | High | Idempotency keys |
| Stripe rate limits | Medium | Medium | Batch processing with delays |
| Webhook failures | Low | High | PaymentRecord includes payment intent ID |
| Customer complaints | Medium | Low | Friendly email messaging |
| Admin email overload | Low | Medium | Only alert on permanent failures |

## Notes

- This design leverages Phase 6 webhook handler for PaymentRecord updates
- No changes needed to booking creation flow (Phase 4)
- Email templates should match existing confirmation email style
- Consider adding feature flag for gradual rollout
- Monitor closely for first 2 weeks after deployment
