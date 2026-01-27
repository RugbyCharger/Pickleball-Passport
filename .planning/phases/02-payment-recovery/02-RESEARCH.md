# Phase 2: Payment Recovery & Data Integrity - Research Findings

**Research Date:** 2026-01-26
**Phase Goal:** Guests can recover from payment failures and overbooking is prevented
**Dependencies:** Phase 1 (completed)

---

## Executive Summary

Phase 2 implementation benefits from **substantial existing infrastructure**. The codebase already has 80-90% of the building blocks needed:
- UpdatePaymentMethodModal with full Stripe integration
- Email templates for installment failures (guest + admin)
- Admin alerts service
- Atomic capacity checks in booking router
- In-app notification system

The remaining work focuses on **wiring these components together** in the Stripe webhook handler and adding the missing overbooking admin alert.

---

## 1. Payment Failure Email Notification (PAY-01)

### Current State
- **Stripe webhook handler** exists at `/app/api/webhooks/stripe/route.ts`
- `handlePaymentFailure()` function already updates Payment and PaymentRecord to FAILED status
- **TODO comment on line 492**: `// TODO E4-S6 Phase 6: Create admin notification for failed installment`
- **TODO comment on line 495**: `// TODO: Send payment failure email with retry link`
- **Email template exists**: `lib/email/templates/installment-payment-reminder.ts` with:
  - Guest name, booking reference, package name
  - Installment number and amount
  - Failure reason (mapped to user-friendly messages)
  - **Update payment URL** parameter ready

### Implementation Approach
1. Import `generateInstallmentReminderEmail` in webhook handler
2. After PaymentRecord update in `handlePaymentFailure()`:
   - Fetch booking details with user, package, trip
   - Construct email data with `updatePaymentUrl: ${BASE_URL}/dashboard/bookings/${bookingId}`
   - Send via existing `sendEmail()` function
3. Add in-app notification using existing `createPaymentFailureNotification()`

### Stripe Best Practices (from research)
- Check `attempt_count` on `invoice.payment_failed` to avoid spamming on retries
- Consider disabling Stripe's built-in failed payment emails to prevent duplicates
- Send email only on first failure, rely on automatic retries for subsequent attempts
- Log event IDs for idempotency (already implemented with WebhookEvent upsert)

**Sources:**
- [Stripe Subscriptions Webhooks](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Stripe Customer Emails](https://docs.stripe.com/billing/revenue-recovery/customer-emails)

### Time Estimate: 2-3 hours

---

## 2. Dashboard Update Payment Method (PAY-02)

### Current State
- **Component exists**: `components/booking/update-payment-method-button.tsx`
- **Modal exists**: `components/booking/update-payment-method-modal.tsx` with full Stripe Elements integration
- **Already integrated** in booking detail page (`/dashboard/bookings/[id]/page.tsx`, lines 589-596)
- Payment schedule display shows OVERDUE status for failed payments
- Button is conditionally rendered for installment plans with Stripe customer

### Implementation Approach
**Already complete!** The component:
1. Detects failed/overdue payments via PaymentScheduleDisplay
2. Shows "Update Payment Method" button
3. Opens modal with Stripe CardElement
4. Creates SetupIntent via tRPC mutation
5. Attaches new payment method and sets as default
6. Triggers retry of pending payments

### Existing tRPC Mutations
```typescript
// lib/trpc/server/routers/payment.ts
createSetupIntent   // Creates Stripe SetupIntent for card collection
updatePaymentMethod // Attaches new PM, sets default, triggers retry
retryPayment        // Manually retry a failed PaymentRecord
```

### Verification Needed
- Confirm button visibility condition for FAILED payments (not just OVERDUE)
- Test end-to-end flow in staging

### Time Estimate: 1-2 hours (mostly testing/polish)

---

## 3. Stripe Integration for Card Replacement (PAY-03)

### Current State
**Fully implemented** in `update-payment-method-modal.tsx`:
- Stripe Elements CardElement for secure input
- SetupIntent flow (not PaymentIntent) for saving cards
- Error handling with user-friendly messages
- Loading states and success confirmation

### Stripe Node.js Patterns (from Context7)
```javascript
// Attach payment method to customer
const attached = await stripe.paymentMethods.attach('pm_123', {
  customer: 'cus_123'
});

// Set as default payment method
await stripe.customers.update('cus_123', {
  invoice_settings: {
    default_payment_method: 'pm_123'
  }
});
```

The existing `updatePaymentMethod` mutation follows this exact pattern.

### Implementation Approach
**No additional work needed** - fully functional.

### Time Estimate: 0 hours (complete)

---

## 4. Failed Payment Email with Direct Link (PAY-04)

### Current State
The email template (`installment-payment-reminder.ts`) already includes:
- `updatePaymentUrl` parameter
- CTA button: "Update Payment Method"
- Styled button linking to dashboard

### Implementation Approach
Simply ensure the URL passed to the template is correct:
```typescript
updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${booking.id}`
```

This links directly to the booking detail page where the UpdatePaymentMethodButton is already rendered.

### Time Estimate: 0 hours (included in PAY-01)

---

## 5. Atomic Capacity Check (DAT-01)

### Current State
**Already implemented** with PostgreSQL atomic operations:

1. **In `assignTrip` mutation** (booking.ts, line 1346):
```sql
UPDATE "Trip"
SET "currentBookings" = "currentBookings" + 1
WHERE id = ${tripId}
AND "currentBookings" < capacity
```

2. **In `handlePaymentSuccess` webhook** (route.ts, line 237):
Same atomic UPDATE with capacity check.

3. **In `reschedule` mutation** (booking.ts):
Transaction-wrapped decrement/increment operations.

### PostgreSQL Concurrency Pattern
The codebase correctly uses the atomic increment pattern rather than read-modify-write:
- Single UPDATE statement with WHERE condition
- Returns affected row count (0 if at capacity)
- Prevents race conditions inherently

**Sources:**
- [PostgreSQL Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Avoiding Read-Modify-Write Anti-patterns](https://www.enterprisedb.com/blog/postgresql-anti-patterns-read-modify-write-cycles)

### Time Estimate: 0 hours (complete)

---

## 6. Overbooking Prevention (DAT-02)

### Current State
**Partially implemented** - rejection logic exists but response is inconsistent:

1. **In booking router**: Throws TRPCError with 'BAD_REQUEST' code
2. **In webhook handler**: Logs error but continues processing (lines 244-257)

### Issue in Webhook Handler
```typescript
if (incrementResult === 0) {
  // Trip is at capacity - this is a rare edge case
  console.error(`CRITICAL: Trip ${booking.tripId} at capacity...`);
  await tx.booking.update({
    where: { id: bookingId },
    data: { status: 'CONFIRMED' }, // Still confirms booking!
  });
  return;
}
```

This allows "soft overbooking" - booking is confirmed but admin must resolve.

### Implementation Approach
Two options:
1. **Hard rejection**: Cancel the booking, trigger refund
2. **Soft rejection** (current): Confirm but alert admin (recommended for luxury product)

Recommend keeping soft rejection but adding:
- Admin notification (DAT-03)
- Guest communication that trip selection may need adjustment
- Dashboard indicator for admin to resolve

### Time Estimate: 1-2 hours

---

## 7. Admin Overbooking Alert (DAT-03)

### Current State
- **Admin alerts service exists**: `lib/email/admin-alerts.ts`
- **sendAdminAlert()** function ready to use
- **TODO in webhook** (line 256): `// TODO: Send alert to admin about potential overbooking`
- No email template for overbooking specifically

### Implementation Approach

1. **Create overbooking alert template** (new file):
   - `lib/email/templates/overbooking-alert-admin.ts`
   - Include: guest info, booking reference, trip details, capacity status
   - Recommended actions

2. **Add helper to admin-alerts.ts**:
```typescript
export async function sendOverbookingAlert(data: OverbookingAlertData): Promise<void>
```

3. **Wire into webhook handler**:
```typescript
if (incrementResult === 0) {
  await sendOverbookingAlert({
    bookingReference: booking.bookingReference,
    guestEmail: booking.user.email,
    tripName: booking.trip?.name,
    tripCapacity: booking.trip?.capacity,
    currentBookings: booking.trip?.currentBookings,
    bookingAdminUrl: `${BASE_URL}/admin/bookings/${booking.id}`
  });
}
```

### Time Estimate: 2-3 hours

---

## Technical Decisions Required

### Decision 1: Payment Failure Email Timing
**Options:**
- A) Send on first failure only (recommended by Stripe)
- B) Send on every failure with different messaging
- C) Send on first + final failures

**Recommendation:** Option A - aligns with Stripe best practices, avoids email fatigue.

### Decision 2: Overbooking Response
**Options:**
- A) Hard rejection: Cancel booking, refund automatically
- B) Soft rejection: Confirm but flag for admin (current)
- C) Waitlist: Create WAITLISTED status

**Recommendation:** Option B - for $15-25K luxury packages, personal admin resolution is more appropriate than automated rejection.

### Decision 3: Payment Recovery Link Destination
**Options:**
- A) Booking detail page (current)
- B) Dedicated payment recovery page
- C) Stripe-hosted payment update page

**Recommendation:** Option A - keeps user in your ecosystem, already implemented.

---

## Existing Infrastructure Summary

| Component | Location | Status |
|-----------|----------|--------|
| Stripe webhook handler | `/app/api/webhooks/stripe/route.ts` | Exists, needs PAY-01 wiring |
| UpdatePaymentMethodModal | `/components/booking/update-payment-method-modal.tsx` | Complete |
| UpdatePaymentMethodButton | `/components/booking/update-payment-method-button.tsx` | Complete |
| Installment reminder template | `/lib/email/templates/installment-payment-reminder.ts` | Complete |
| Admin failure template | `/lib/email/templates/installment-failure-admin.ts` | Complete |
| Admin alerts service | `/lib/email/admin-alerts.ts` | Ready |
| Payment notifications | `/lib/notifications/payment-notifications.ts` | Complete |
| Atomic capacity check | booking.ts `assignTrip`, webhook `handlePaymentSuccess` | Complete |
| PaymentRecord schema | Prisma schema | Has retryCount, failureReason |
| Trip schema | Prisma schema | Has capacity, currentBookings |

---

## Implementation Order

**Recommended sequence:**

1. **PAY-01 + PAY-04**: Payment failure email with link (~3 hours)
   - Minimal code, high impact
   - Enables recovery flow

2. **PAY-02 verification**: Test existing modal flow (~1 hour)
   - Confirm works end-to-end
   - Fix any edge cases

3. **DAT-03**: Admin overbooking alert (~2-3 hours)
   - Create template
   - Wire into webhook

4. **DAT-02 refinement**: Review soft rejection behavior (~1 hour)
   - Ensure guest communication is appropriate
   - Add logging

**Total estimate: 7-10 hours**

---

## Testing Checklist

### PAY-01/PAY-04: Payment Failure Email
- [ ] Trigger `payment_intent.payment_failed` webhook in Stripe test mode
- [ ] Verify email arrives within 5 minutes
- [ ] Confirm link goes to correct booking page
- [ ] Verify in-app notification created

### PAY-02/PAY-03: Payment Method Update
- [ ] Click "Update Payment Method" from booking page
- [ ] Enter test card (4242...)
- [ ] Verify new card is set as default in Stripe
- [ ] Verify failed payment is retried
- [ ] Check PaymentRecord updates to PAID

### DAT-01/DAT-02: Capacity Check
- [ ] Create trip at capacity
- [ ] Attempt to confirm payment for booking on that trip
- [ ] Verify atomic check prevents increment
- [ ] Verify booking status is appropriate

### DAT-03: Admin Alert
- [ ] Trigger overbooking scenario
- [ ] Verify admin email received
- [ ] Confirm email includes all relevant details

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Email delivery delay | Low | Medium | SendGrid SLA, monitoring |
| Race condition in capacity | Low | High | Already mitigated with atomic SQL |
| Stripe webhook failure | Low | High | Idempotency already implemented |
| User confusion on recovery | Medium | Medium | Clear email copy, direct links |

---

## References

- [Stripe Webhook Best Practices](https://docs.stripe.com/webhooks)
- [Stripe Payment Recovery](https://docs.stripe.com/billing/revenue-recovery/smart-retries)
- [PostgreSQL Concurrency](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Supabase RLS Performance](https://supabase.com/docs/guides/database/postgres/row-level-security)
