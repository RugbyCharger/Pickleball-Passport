# Phase 8 Testing Guide

## Prerequisites

- Development environment running (`npm run dev`)
- Postgres database with test data
- Stripe test mode configured
- `.env.local` with `CRON_SECRET` set

---

## Test Scenario 1: Successful Charge

**Setup:**

1. Create a test booking with installment plan
2. Manually update PaymentRecord #2 to be due today:

```sql
UPDATE "PaymentRecord"
SET "dueDate" = CURRENT_DATE
WHERE "bookingId" = 'your-test-booking-id'
  AND "installmentNumber" = 2
  AND "status" = 'PENDING';
```

**Execute:**

```bash
curl -H "Authorization: Bearer local-development-secret-for-testing" \
  http://localhost:3000/api/cron/charge-installments
```

**Expected:**
- Response shows 1 successful payment
- PaymentRecord status remains PENDING (webhook will update to PAID)
- `stripePaymentIntentId` is populated
- `lastAttemptAt` is updated

**Verify in Stripe Dashboard:**
- Payment intent was created
- Status is `succeeded`

---

## Test Scenario 2: Declined Card (Retry Eligible)

**Setup:**

1. Update test booking's Stripe customer to use declined test card
2. Ensure PaymentRecord is due today

**Test Card:** `4000 0000 0000 0002` (generic decline)

**Execute:**

```bash
curl -H "Authorization: Bearer local-development-secret-for-testing" \
  http://localhost:3000/api/cron/charge-installments
```

**Expected:**
- Response shows 1 failed payment (retry scheduled)
- PaymentRecord `retryCount` = 1
- `lastAttemptAt` is updated
- `failureReason` = 'card_declined'
- Status remains PENDING
- Customer receives reminder email

**Verify Email:**
- Check SendGrid dashboard or logs
- Subject: "Payment Reminder: Installment X"
- Contains next retry date (tomorrow)

---

## Test Scenario 3: Insufficient Funds (Retry Eligible)

**Setup:**

Similar to Test 2, but use card: `4000 0000 0000 9995`

**Expected:**
- Same as Test 2, but `failureReason` = 'insufficient_funds'

---

## Test Scenario 4: Expired Card (Retry Eligible)

**Setup:**

Use test card: `4000 0000 0000 0069`

**Expected:**
- Same as Test 2, but `failureReason` = 'expired_card'

---

## Test Scenario 5: Permanent Failure (4th Attempt)

**Setup:**

1. Manually set PaymentRecord `retryCount` = 3
2. Set `lastAttemptAt` to 7 days ago (eligible for retry)
3. Use declined test card

```sql
UPDATE "PaymentRecord"
SET "retryCount" = 3,
    "lastAttemptAt" = CURRENT_DATE - INTERVAL '7 days',
    "dueDate" = CURRENT_DATE - INTERVAL '11 days'
WHERE "bookingId" = 'your-test-booking-id'
  AND "installmentNumber" = 2;
```

**Execute:**

```bash
curl -H "Authorization: Bearer local-development-secret-for-testing" \
  http://localhost:3000/api/cron/charge-installments
```

**Expected:**
- Response shows 1 permanent failure
- PaymentRecord status = 'FAILED'
- `retryCount` = 4
- Admin receives alert email

**Verify Admin Email:**
- Subject: "🚨 Payment Failed: [booking-ref]"
- Contains failure history (4 attempts)
- Includes customer contact info

---

## Test Scenario 6: Retry Eligibility

**Setup:**

Create PaymentRecords with various retry states:

```sql
-- Not yet eligible (last attempt yesterday, needs 1 day)
UPDATE "PaymentRecord" SET "retryCount" = 1, "lastAttemptAt" = CURRENT_DATE - INTERVAL '12 hours';

-- Eligible (last attempt 2 days ago, retry count 1)
UPDATE "PaymentRecord" SET "retryCount" = 1, "lastAttemptAt" = CURRENT_DATE - INTERVAL '2 days';

-- Not yet eligible (last attempt 2 days ago, needs 3 days for retry 2)
UPDATE "PaymentRecord" SET "retryCount" = 2, "lastAttemptAt" = CURRENT_DATE - INTERVAL '2 days';

-- Eligible (last attempt 4 days ago, retry count 2)
UPDATE "PaymentRecord" SET "retryCount" = 2, "lastAttemptAt" = CURRENT_DATE - INTERVAL '4 days';
```

**Execute cron job**

**Expected:**
- Only eligible payments are charged
- Not-yet-eligible payments are skipped

---

## Test Scenario 7: Cancelled Booking

**Setup:**

1. Create test booking with installment plan
2. Cancel the booking (status = 'CANCELLED')
3. Ensure PaymentRecord is due today

**Execute cron job**

**Expected:**
- Payment is skipped
- Response shows error: 'booking_cancelled'
- PaymentRecord status remains PENDING (not updated)

---

## Test Scenario 8: Missing Stripe Customer

**Setup:**

1. Create PaymentRecord due today
2. Set booking `stripeCustomerId` to NULL

```sql
UPDATE "Booking"
SET "stripeCustomerId" = NULL
WHERE "id" = 'your-test-booking-id';
```

**Execute cron job**

**Expected:**
- Payment fails permanently
- Response shows error: 'customer_not_found'
- Admin receives alert email

---

## Test Scenario 9: Batch Processing

**Setup:**

Create 25 PaymentRecords all due today

**Execute cron job**

**Expected:**
- All 25 payments are processed
- Processed in batches of 10
- 1-second delay between batches
- Execution time ~3-4 seconds

---

## Test Scenario 10: Unauthorized Request

**Execute:**

```bash
curl http://localhost:3000/api/cron/charge-installments
```

**Expected:**
- Response: `{ "error": "Unauthorized" }`
- Status: 401

---

## Test Scenario 11: Idempotency

**Setup:**

1. Create PaymentRecord due today
2. Call cron endpoint twice quickly

**Execute:**

```bash
curl -H "Authorization: Bearer local-development-secret-for-testing" \
  http://localhost:3000/api/cron/charge-installments

curl -H "Authorization: Bearer local-development-secret-for-testing" \
  http://localhost:3000/api/cron/charge-installments
```

**Expected:**
- First call: Payment intent created
- Second call: No duplicate charge (idempotency key prevents it)
- Check Stripe dashboard: Only 1 payment intent exists

---

## Verifying Webhook Integration

After charging an installment:

1. Check Stripe dashboard for webhook events
2. Verify `payment_intent.succeeded` event was sent
3. Check PaymentRecord was updated to PAID by webhook (Phase 6)
4. Verify `paidDate` was set

---

## Manual Database Inspection

Check PaymentRecord state:

```sql
SELECT
  "id",
  "installmentNumber",
  "status",
  "amountCents",
  "dueDate",
  "retryCount",
  "lastAttemptAt",
  "failureReason",
  "stripePaymentIntentId",
  "paidDate"
FROM "PaymentRecord"
WHERE "bookingId" = 'your-test-booking-id'
ORDER BY "installmentNumber";
```

---

## Production Testing (Vercel)

Once deployed to Vercel:

1. Manually trigger cron job via Vercel dashboard
2. Check Vercel function logs for output
3. Verify payments were processed correctly
4. Confirm emails were sent via SendGrid

---

## Stripe Test Cards Reference

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Generic decline |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 0069 | Expired card |
| 4000 0025 0000 3155 | Requires authentication |

Full list: https://stripe.com/docs/testing#cards
