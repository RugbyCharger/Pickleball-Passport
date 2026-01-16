# Story 4.8: Installment Payment Reminders

Status: in-progress

## Story

As a guest on an installment payment plan,
I want to receive reminders before payments are charged,
So that I'm not surprised and can ensure my payment method is valid.

## Acceptance Criteria

### AC-1: 7-Day Payment Reminder Email

- [ ] Email sent 7 days before scheduled payment due date
- [ ] Triggered by daily cron job (runs same time as charge-installments)
- [ ] Only sent for PENDING payments with installmentNumber >= 2
- [ ] Only sent once per payment (track with `reminderSentAt` field)
- [ ] Skip if booking is cancelled

### AC-2: Email Content

- [ ] Subject: "Upcoming Payment Reminder - Pickleball Passport"
- [ ] Content includes:
  - Guest first name
  - Amount due (formatted)
  - Payment date (scheduled date)
  - Booking reference
  - Package name
  - Payment method on file (last 4 digits)
- [ ] Clear CTA: "Update Payment Method" button
- [ ] Link to booking dashboard page

### AC-3: Email Design

- [ ] Professional design matching brand
- [ ] Ocean blue (#003D5C) headers
- [ ] Gold (#D4AF37) accent for CTA button
- [ ] Mobile-responsive
- [ ] Consistent with existing email templates

### AC-4: Database Schema Update

- [ ] Add `reminderSentAt DateTime?` field to PaymentRecord model
- [ ] Create Prisma migration
- [ ] Index on reminderSentAt for query performance

### AC-5: Cron Job Implementation

- [ ] New endpoint: `GET /api/cron/send-payment-reminders`
- [ ] Secured with CRON_SECRET (same as charge-installments)
- [ ] Query: Find PENDING payments due in 7 days with null reminderSentAt
- [ ] Process in batches (max 100 per run)
- [ ] Log summary: total found, emails sent, errors
- [ ] Non-blocking: Email failures don't stop processing

### AC-6: Error Handling

- [ ] If SendGrid fails: Log error, mark reminder as NOT sent (will retry next day)
- [ ] If payment data missing: Log warning, skip payment
- [ ] If booking/user missing: Log error, skip payment
- [ ] All errors logged with context (booking reference, payment ID)

### AC-7: Testing

- [ ] Unit test: Email template generates correct content
- [ ] Unit test: Cron job finds correct payments (7 days out)
- [ ] Unit test: Skips payments with reminderSentAt already set
- [ ] Unit test: Skips cancelled bookings
- [ ] Integration test: Full flow with test database

## Tasks / Subtasks

- [ ] Task 1: Database Schema Update (AC: 4)
  - [ ] Add reminderSentAt field to PaymentRecord in schema.prisma
  - [ ] Create migration: `npx prisma migrate dev --name add-reminder-sent-at`
  - [ ] Generate Prisma client: `npx prisma generate`

- [ ] Task 2: Email Template (AC: 2, 3)
  - [ ] Create `lib/email/templates/upcoming-payment-reminder.ts`
  - [ ] Define UpcomingPaymentReminderData interface
  - [ ] Build email content with payment details
  - [ ] Include "Update Payment Method" CTA button
  - [ ] Apply brand styling

- [ ] Task 3: Reminder Service (AC: 1, 5)
  - [ ] Create `lib/payments/send-payment-reminders.ts`
  - [ ] Query for payments due in 7 days
  - [ ] Filter: PENDING status, installmentNumber >= 2, reminderSentAt is null
  - [ ] Send email for each eligible payment
  - [ ] Update reminderSentAt after successful send

- [ ] Task 4: Cron Endpoint (AC: 5, 6)
  - [ ] Create `app/api/cron/send-payment-reminders/route.ts`
  - [ ] Verify CRON_SECRET authorization
  - [ ] Call reminder service
  - [ ] Return summary response
  - [ ] Add error handling and logging

- [ ] Task 5: Vercel Cron Configuration
  - [ ] Add cron schedule to vercel.json (daily, same as charge-installments)

- [ ] Task 6: Testing (AC: 7)
  - [ ] Write unit tests for email template
  - [ ] Write unit tests for reminder service
  - [ ] Test cron endpoint manually

- [ ] Task 7: Documentation
  - [ ] Update sprint status
  - [ ] Add inline code comments

## Dev Notes

### Architecture

**Existing Infrastructure:**
- Cron job pattern: `app/api/cron/charge-installments/route.ts`
- Email sending: `lib/email/send-email.ts`
- Base templates: `lib/email/templates/base.ts`
- PaymentRecord model: `prisma/schema.prisma`

**New Files to Create:**
1. `lib/email/templates/upcoming-payment-reminder.ts` - Email template
2. `lib/payments/send-payment-reminders.ts` - Reminder service
3. `app/api/cron/send-payment-reminders/route.ts` - Cron endpoint

**Schema Change:**
```prisma
model PaymentRecord {
  // ... existing fields ...
  reminderSentAt DateTime?  // When 7-day reminder was sent
}
```

### Query Logic

Find payments due in exactly 7 days:
```typescript
const today = new Date()
const sevenDaysFromNow = addDays(today, 7)

// Start and end of the target day
const targetDayStart = startOfDay(sevenDaysFromNow)
const targetDayEnd = endOfDay(sevenDaysFromNow)

const paymentsToRemind = await prisma.paymentRecord.findMany({
  where: {
    status: 'PENDING',
    installmentNumber: { gte: 2 }, // Skip first payment (already paid)
    reminderSentAt: null,         // Not already reminded
    dueDate: {
      gte: targetDayStart,
      lte: targetDayEnd,
    },
    booking: {
      status: { not: 'CANCELLED' },
    },
  },
  include: {
    booking: {
      include: {
        user: true,
        package: true,
        trip: true,
      },
    },
  },
})
```

### Email Template Structure

```typescript
interface UpcomingPaymentReminderData {
  firstName: string
  email: string
  bookingReference: string
  packageName: string
  installmentNumber: number
  installmentAmount: number // cents
  dueDate: string // ISO date
  paymentMethodLast4?: string
  updatePaymentUrl: string
}
```

### Cron Schedule

Add to vercel.json:
```json
{
  "crons": [
    {
      "path": "/api/cron/charge-installments",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/send-payment-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Dependencies

- E4-S6: Installment Payment Plans (done) - PaymentRecord model
- E4-S7: Scheduled Payment Processing (done) - Cron pattern
- E11-S1: SendGrid Integration (done) - Email infrastructure

### Related Stories

- E4-S12: Update Payment Method (done) - CTA links to this feature
- E11-S3: Payment Reminder Emails (duplicate - same feature)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Implementation Date:** 2026-01-16

**What was implemented:**
1. Added `reminderSentAt` field to `PaymentRecord` model in Prisma schema
2. Created migration: `prisma/migrations/20260116090000_add_reminder_sent_at/migration.sql`
3. Created email template: `lib/email/templates/upcoming-payment-reminder.ts`
4. Created reminder service: `lib/payments/send-payment-reminders.ts`
5. Created cron endpoint: `app/api/cron/send-payment-reminders/route.ts`
6. Updated `vercel.json` with cron schedule (8 AM UTC daily)

**Post-deployment steps required:**
1. Run migration: `npx prisma migrate deploy`
2. Regenerate Prisma client: `npx prisma generate`

**Cron schedule:**
- Payment reminders: 8 AM UTC daily (1 hour before charge-installments)
- Payment charges: 9 AM UTC daily

**Testing notes:**
- Can manually trigger: `curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/send-payment-reminders`

### File List

**Files to Create:**
1. `lib/email/templates/upcoming-payment-reminder.ts`
2. `lib/payments/send-payment-reminders.ts`
3. `app/api/cron/send-payment-reminders/route.ts`

**Files to Modify:**
1. `prisma/schema.prisma` - Add reminderSentAt field
2. `vercel.json` - Add cron schedule
3. `_bmad-output/implementation/sprint-status.yaml` - Update status
