# Story 4.4: Stripe Webhook Handler

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a system administrator,
I want Stripe webhook events to be processed reliably,
So that payment statuses are accurately reflected and customers are notified of payment events.

## Acceptance Criteria

### AC-1: Webhook Endpoint Enhancement

- [ ] Enhance existing webhook route at `app/api/webhooks/stripe/route.ts`
- [ ] Add support for additional critical webhook events:
  - `charge.refunded` - Refund processed (CRITICAL for E3-S13)
  - `charge.dispute.created` - Payment disputed
  - `charge.dispute.closed` - Dispute resolved
  - `customer.subscription.updated` - Future subscription support
- [ ] Current events already implemented (verify functionality):
  - `payment_intent.succeeded` - Payment completed
  - `payment_intent.payment_failed` - Payment failed
  - `payment_intent.canceled` - Payment canceled
- [ ] Webhook signature verification using `stripe.webhooks.constructEvent()` (already implemented)
- [ ] Return 200 OK immediately after event validation (already implemented)

### AC-2: Idempotent Event Processing

- [ ] Create `WebhookEvent` database model to track processed events:
  ```prisma
  model WebhookEvent {
    id            String   @id @default(cuid())
    stripeEventId String   @unique
    type          String
    processed     Boolean  @default(true)
    createdAt     DateTime @default(now())

    @@index([stripeEventId])
    @@index([type])
  }
  ```
- [ ] Before processing any event, check if `stripeEventId` already exists
- [ ] If event already processed, return 200 OK immediately (prevent duplicate processing)
- [ ] Create WebhookEvent record AFTER successful event processing
- [ ] Use database transaction to ensure atomicity (event processing + webhook record)

### AC-3: Refund Event Handler (`charge.refunded`)

- [ ] Implement `handleRefundCompleted(charge: Stripe.Charge)` function
- [ ] Find Payment record by `stripePaymentIntentId` from charge
- [ ] Verify refund hasn't already been recorded (check Payment status)
- [ ] Update Payment record:
  - Set status to `REFUNDED`
  - Store refund amount: `refundedAmount` field (amount in cents)
  - Store refund ID: `stripeRefundId` field
  - Set `updatedAt` timestamp
- [ ] Find associated Booking record
- [ ] If booking status is `CONFIRMED`, update to `CANCELLED`
- [ ] Decrement Trip `currentBookings` count if booking had a trip assigned
- [ ] Send refund confirmation email to guest:
  - Refund amount
  - Original booking reference
  - Expected timeline (5-10 business days)
  - Customer support contact
- [ ] Handle edge cases:
  - Partial refunds (record amount, don't change booking status)
  - Multiple refunds for same payment
  - Refund for non-existent payment (log error, return 200 OK)
- [ ] Use database transaction for all updates

### AC-4: Dispute Event Handler (`charge.dispute.created`)

- [ ] Implement `handleDisputeCreated(dispute: Stripe.Dispute)` function
- [ ] Find Payment record by `stripePaymentIntentId` from dispute charge
- [ ] Find associated Booking record
- [ ] Create admin notification:
  - Type: `DISPUTE_ALERT`
  - Priority: `URGENT`
  - Include: Booking reference, dispute reason, dispute amount, deadline
- [ ] Send email alert to admin team:
  - Subject: "URGENT: Payment Dispute - Booking {reference}"
  - Dispute amount and reason
  - Evidence deadline (respond before this date)
  - Link to Stripe dashboard
  - Link to booking details in admin panel
- [ ] Do NOT automatically cancel booking (requires manual review)
- [ ] Log dispute details for audit trail
- [ ] Return 200 OK (acknowledge webhook)

### AC-5: Dispute Resolution Handler (`charge.dispute.closed`)

- [ ] Implement `handleDisputeClosed(dispute: Stripe.Dispute)` function
- [ ] Find Payment record by `stripePaymentIntentId`
- [ ] Check dispute status: `won` or `lost`
- [ ] If dispute WON:
  - Create success notification for admin
  - No payment status change (already SUCCEEDED)
  - Log resolution for audit
- [ ] If dispute LOST:
  - Update Payment status to `REFUNDED`
  - Update Booking status to `CANCELLED` if currently `CONFIRMED`
  - Decrement Trip `currentBookings` if applicable
  - Send email notification to guest explaining outcome
  - Create admin notification with final outcome
- [ ] Log all dispute outcomes for compliance
- [ ] Return 200 OK

### AC-6: Enhanced Error Handling & Logging

- [ ] Wrap all event handlers in try-catch blocks
- [ ] Log errors with context:
  - Event ID
  - Event type
  - Error message
  - Stack trace
- [ ] Return 200 OK even on processing errors (prevent Stripe retries for unrecoverable errors)
- [ ] Only return 500 for signature verification failures or critical system errors
- [ ] Log successful event processing:
  - Event type
  - Event ID
  - Processing duration
  - Actions taken
- [ ] Use structured logging (JSON format) for easier parsing
- [ ] Create error notification for admins if critical webhook fails

### AC-7: Database Schema Migration

- [ ] Create Prisma migration for WebhookEvent model
- [ ] Add new fields to Payment model (if not present):
  - `refundedAmount Int?` - Amount refunded in cents
  - `stripeRefundId String?` - Stripe refund ID for audit
- [ ] Run migration: `npx prisma migrate dev --name add-webhook-event-tracking`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Verify migration in development database

### AC-8: Environment Variable Configuration

- [ ] Verify `STRIPE_WEBHOOK_SECRET` is set in `.env` (already required)
- [ ] Document webhook secret setup in Dev Notes
- [ ] Add validation: Return 503 if webhook secret not configured
- [ ] Update `.env.example` with webhook secret placeholder:
  ```
  # Stripe Webhook Secret (from Stripe Dashboard → Webhooks)
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

### AC-9: Email Notifications

- [ ] Create refund confirmation email template
- [ ] Email content:
  - Booking reference
  - Refund amount
  - Original payment date
  - Refund initiation date
  - Expected timeline (5-10 business days)
  - Reason for refund (if available)
  - Customer support contact
- [ ] Use existing SendGrid integration from E11-S1, E11-S2
- [ ] Handle email failures gracefully (log error, don't block webhook processing)
- [ ] Email template should match existing brand design (ocean blue, gold accents)

### AC-10: Testing with Stripe CLI

- [ ] Document Stripe CLI testing workflow in Dev Notes
- [ ] Test all webhook events:
  - `stripe trigger payment_intent.succeeded`
  - `stripe trigger payment_intent.payment_failed`
  - `stripe trigger charge.refunded`
  - `stripe trigger charge.dispute.created`
- [ ] Verify idempotency: Trigger same event twice, ensure only processed once
- [ ] Verify signature verification: Test with invalid signature
- [ ] Test with real Stripe test mode data (not just CLI triggers)

### AC-11: Security Requirements

- [ ] Webhook signature verification is MANDATORY (already implemented)
- [ ] Never trust webhook data without signature verification
- [ ] Rate limiting considerations (optional - Stripe already rate limits)
- [ ] HTTPS enforcement in production (Next.js handles this)
- [ ] Validate event object structure before processing
- [ ] Sanitize all data before database insertion
- [ ] No sensitive data in logs (redact card details, emails in production)

### AC-12: Documentation

- [ ] Update Dev Notes with:
  - Webhook setup instructions
  - Stripe CLI testing guide
  - Idempotency explanation
  - Event handler architecture
  - Troubleshooting common issues
- [ ] Add inline code comments explaining critical sections
- [ ] Document webhook secret rotation process
- [ ] Add README section for webhook configuration

## Tasks / Subtasks

- [ ] Task 1: Database Schema Changes (AC: 2, 7)
  - [ ] Subtask 1.1: Add WebhookEvent model to Prisma schema
  - [ ] Subtask 1.2: Add refundedAmount and stripeRefundId fields to Payment model
  - [ ] Subtask 1.3: Create migration: `npx prisma migrate dev --name add-webhook-event-tracking`
  - [ ] Subtask 1.4: Generate Prisma client: `npx prisma generate`
  - [ ] Subtask 1.5: Verify migration applied successfully in database
  - [ ] Subtask 1.6: Test new models in Prisma Studio

- [ ] Task 2: Idempotency Implementation (AC: 2)
  - [ ] Subtask 2.1: Create helper function `checkEventProcessed(eventId: string): Promise<boolean>`
  - [ ] Subtask 2.2: Create helper function `markEventProcessed(eventId: string, eventType: string): Promise<void>`
  - [ ] Subtask 2.3: Add idempotency check at start of webhook handler
  - [ ] Subtask 2.4: Add WebhookEvent creation at end of event processing
  - [ ] Subtask 2.5: Wrap in database transaction with event handler logic
  - [ ] Subtask 2.6: Test with duplicate event IDs

- [ ] Task 3: Refund Event Handler (AC: 3)
  - [ ] Subtask 3.1: Create `handleRefundCompleted(charge: Stripe.Charge)` function
  - [ ] Subtask 3.2: Find Payment by stripePaymentIntentId from charge
  - [ ] Subtask 3.3: Update Payment status to REFUNDED with refund details
  - [ ] Subtask 3.4: Find associated Booking and update status to CANCELLED
  - [ ] Subtask 3.5: Decrement Trip currentBookings count (atomic operation)
  - [ ] Subtask 3.6: Handle partial refunds (don't cancel booking)
  - [ ] Subtask 3.7: Add database transaction for atomic updates
  - [ ] Subtask 3.8: Create refund email notification (see Task 6)
  - [ ] Subtask 3.9: Test with Stripe CLI: `stripe trigger charge.refunded`

- [ ] Task 4: Dispute Event Handlers (AC: 4, 5)
  - [ ] Subtask 4.1: Create `handleDisputeCreated(dispute: Stripe.Dispute)` function
  - [ ] Subtask 4.2: Create admin notification for new dispute
  - [ ] Subtask 4.3: Send urgent email alert to admin team
  - [ ] Subtask 4.4: Log dispute details for audit trail
  - [ ] Subtask 4.5: Create `handleDisputeClosed(dispute: Stripe.Dispute)` function
  - [ ] Subtask 4.6: Handle "won" dispute (success notification)
  - [ ] Subtask 4.7: Handle "lost" dispute (refund + cancel booking)
  - [ ] Subtask 4.8: Send outcome notification to guest
  - [ ] Subtask 4.9: Test with Stripe CLI (if trigger available)

- [ ] Task 5: Enhance Existing Webhook Route (AC: 1, 6, 11)
  - [ ] Subtask 5.1: Review existing webhook handlers (payment_intent.succeeded, etc.)
  - [ ] Subtask 5.2: Add charge.refunded event handler to switch statement
  - [ ] Subtask 5.3: Add charge.dispute.created event handler
  - [ ] Subtask 5.4: Add charge.dispute.closed event handler
  - [ ] Subtask 5.5: Enhance error handling with try-catch blocks
  - [ ] Subtask 5.6: Add structured logging for all events
  - [ ] Subtask 5.7: Add performance logging (processing duration)
  - [ ] Subtask 5.8: Validate webhook secret is configured
  - [ ] Subtask 5.9: Add inline comments explaining critical sections

- [ ] Task 6: Email Notifications (AC: 9)
  - [ ] Subtask 6.1: Create refund confirmation email template
  - [ ] Subtask 6.2: Add email content (booking ref, amount, timeline, support)
  - [ ] Subtask 6.3: Style template with brand colors (ocean blue, gold)
  - [ ] Subtask 6.4: Integrate with existing SendGrid service
  - [ ] Subtask 6.5: Handle email failures gracefully (log, don't throw)
  - [ ] Subtask 6.6: Test email delivery in development
  - [ ] Subtask 6.7: Create dispute alert email template for admins
  - [ ] Subtask 6.8: Create dispute outcome email template for guests

- [ ] Task 7: Testing & Validation (AC: 10, 12)
  - [ ] Subtask 7.1: Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
  - [ ] Subtask 7.2: Login to Stripe CLI: `stripe login`
  - [ ] Subtask 7.3: Forward webhooks to local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  - [ ] Subtask 7.4: Test payment_intent.succeeded event
  - [ ] Subtask 7.5: Test payment_intent.payment_failed event
  - [ ] Subtask 7.6: Test charge.refunded event
  - [ ] Subtask 7.7: Test charge.dispute.created event (if available)
  - [ ] Subtask 7.8: Test idempotency (trigger same event twice)
  - [ ] Subtask 7.9: Test signature verification failure
  - [ ] Subtask 7.10: Verify all database updates are atomic
  - [ ] Subtask 7.11: Run TypeScript validation: `npx tsc --noEmit`
  - [ ] Subtask 7.12: Document testing workflow in Dev Notes

- [ ] Task 8: Documentation (AC: 12)
  - [ ] Subtask 8.1: Add webhook setup section to Dev Notes
  - [ ] Subtask 8.2: Document Stripe CLI testing workflow
  - [ ] Subtask 8.3: Explain idempotency strategy
  - [ ] Subtask 8.4: Document event handler architecture
  - [ ] Subtask 8.5: Add troubleshooting guide
  - [ ] Subtask 8.6: Update .env.example with webhook secret
  - [ ] Subtask 8.7: Add inline code comments
  - [ ] Subtask 8.8: Document webhook secret rotation process

## Dev Notes

### Architecture Requirements (MUST FOLLOW)

**Existing Webhook Infrastructure:**
- Webhook endpoint already exists: `app/api/webhooks/stripe/route.ts` ([app/api/webhooks/stripe/route.ts:1-347])
- Signature verification already implemented using `verifyWebhookSignature()` ([lib/stripe/stripe-service.ts:152-163])
- Current events handled:
  - `payment_intent.succeeded` - Updates payment and booking status, sends confirmation email
  - `payment_intent.payment_failed` - Updates payment status, logs failure
  - `payment_intent.canceled` - Updates payment status to PENDING
- Stripe API version: `2025-12-15.clover` ([lib/stripe/stripe-service.ts:25])

**What Needs to Be Added:**
1. WebhookEvent model for idempotency tracking
2. Refund event handler (`charge.refunded`)
3. Dispute event handlers (`charge.dispute.created`, `charge.dispute.closed`)
4. Enhanced error handling and logging
5. Refund confirmation email template

**Critical Implementation Notes:**
- ✅ Signature verification is ALREADY implemented and secure
- ✅ Payment success handler is ALREADY sending emails
- ⚠️ Idempotency is NOT implemented (events can be processed multiple times)
- ⚠️ Refund events are NOT handled (E3-S13 processes refunds but doesn't handle async events)
- ⚠️ Dispute handling is NOT implemented

### Database Schema Changes

**New Model: WebhookEvent**
```prisma
// Add to prisma/schema.prisma

model WebhookEvent {
  id            String   @id @default(cuid())
  stripeEventId String   @unique // Stripe event ID (evt_...)
  type          String   // Event type (charge.refunded, etc.)
  processed     Boolean  @default(true)
  processedAt   DateTime @default(now())
  createdAt     DateTime @default(now())

  @@index([stripeEventId])
  @@index([type])
  @@index([createdAt])
}
```

**Payment Model Updates:**
```prisma
// Add to existing Payment model (prisma/schema.prisma:377-405)

model Payment {
  // ... existing fields ...

  // ADD THESE FIELDS:
  refundedAmount Int?    // Amount refunded in cents
  stripeRefundId String? // Stripe refund ID (re_...)

  // ... rest of model ...
}
```

**Migration Commands:**
```bash
# Create migration
npx prisma migrate dev --name add-webhook-event-tracking

# Generate Prisma client
npx prisma generate

# Verify in Prisma Studio
npx prisma studio
```

### Webhook Event Handler Architecture

**Current Structure (app/api/webhooks/stripe/route.ts):**
```typescript
export async function POST(req: NextRequest) {
  // 1. Verify signature (ALREADY IMPLEMENTED ✅)
  // 2. Switch on event type (ALREADY IMPLEMENTED ✅)
  // 3. Call specific handler function (ALREADY IMPLEMENTED ✅)
  // 4. Return 200 OK (ALREADY IMPLEMENTED ✅)
}
```

**Enhancement: Add Idempotency Check**
```typescript
export async function POST(req: NextRequest) {
  try {
    // ... existing signature verification ...

    // NEW: Check if event already processed
    const alreadyProcessed = await checkEventProcessed(event.id)
    if (alreadyProcessed) {
      console.log(`Event ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true })
    }

    // Handle event based on type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      // NEW: Refund handler
      case 'charge.refunded':
        await handleRefundCompleted(event.data.object as Stripe.Charge)
        break

      // NEW: Dispute handlers
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute)
        break

      case 'charge.dispute.closed':
        await handleDisputeClosed(event.data.object as Stripe.Dispute)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // NEW: Mark event as processed
    await markEventProcessed(event.id, event.type)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
```

### Idempotency Implementation Pattern

**Helper Functions:**
```typescript
/**
 * Check if webhook event has already been processed
 */
async function checkEventProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: eventId }
  })

  return existing !== null
}

/**
 * Mark webhook event as processed
 */
async function markEventProcessed(eventId: string, eventType: string): Promise<void> {
  await prisma.webhookEvent.create({
    data: {
      stripeEventId: eventId,
      type: eventType,
      processed: true
    }
  })
}
```

**Why Idempotency is Critical:**
- Stripe may retry webhooks if they don't receive a 200 OK within 5 seconds
- Network issues can cause duplicate deliveries
- Without idempotency, the same refund could be processed twice
- Database constraints (unique stripeEventId) prevent duplicates
- Best practice: Check BEFORE processing, record AFTER success

### Refund Event Handler Implementation

**Event: `charge.refunded`**
```typescript
/**
 * Handle Refund Completed
 *
 * Triggered when a refund is processed (either from E3-S13 cancellation or Stripe dashboard).
 * Updates payment status, booking status, and sends confirmation email.
 */
async function handleRefundCompleted(charge: Stripe.Charge) {
  const { payment_intent: paymentIntentId, amount_refunded, id: chargeId } = charge

  if (!paymentIntentId) {
    console.error('Charge missing payment_intent:', chargeId)
    return
  }

  try {
    // Find payment by payment intent ID
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId as string },
      include: {
        booking: {
          include: {
            trip: true,
            user: true,
            package: true
          }
        }
      }
    })

    if (!payment) {
      console.error(`Payment not found for intent: ${paymentIntentId}`)
      return
    }

    // Check if this is a partial refund or full refund
    const isFullRefund = amount_refunded >= payment.amount

    // Use transaction for atomic updates
    await prisma.$transaction(async (tx) => {
      // Update payment record
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          refundedAmount: amount_refunded,
          stripeRefundId: charge.refund as string || null
        }
      })

      // If full refund, update booking status
      if (isFullRefund && payment.booking.status === 'CONFIRMED') {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CANCELLED' }
        })

        // Decrement trip capacity if booking has a trip
        if (payment.booking.tripId) {
          await tx.trip.update({
            where: { id: payment.booking.tripId },
            data: {
              currentBookings: {
                decrement: 1
              }
            }
          })
        }
      }
    })

    // Send refund confirmation email (non-blocking)
    const { sendRefundConfirmation } = await import('@/lib/email/sendgrid')

    await sendRefundConfirmation(payment.booking.user.email, {
      firstName: payment.booking.user.email.split('@')[0], // Fallback
      email: payment.booking.user.email,
      bookingReference: payment.booking.bookingReference,
      packageName: payment.booking.package.name,
      refundAmount: amount_refunded,
      originalAmount: payment.amount,
      isPartialRefund: !isFullRefund,
      refundDate: new Date().toISOString(),
      expectedTimeline: '5-10 business days'
    }).catch(console.error) // Don't fail webhook if email fails

    console.log(`Refund processed for payment ${payment.id}: $${amount_refunded / 100}`)
  } catch (error) {
    console.error('Error handling refund:', error)
    throw error // Re-throw to trigger Stripe retry if needed
  }
}
```

**Key Implementation Points:**
1. **Find Payment:** Use `stripePaymentIntentId` from charge object
2. **Partial vs Full Refund:** Check `amount_refunded` vs original `payment.amount`
3. **Atomic Updates:** Use Prisma transaction for payment + booking + trip updates
4. **Trip Capacity:** Decrement `currentBookings` if booking had a trip assigned
5. **Email Notification:** Send refund confirmation (non-blocking, handle errors)
6. **Error Handling:** Wrap in try-catch, log errors, re-throw for Stripe retry

### Dispute Event Handlers Implementation

**Event: `charge.dispute.created`**
```typescript
/**
 * Handle Dispute Created
 *
 * When a guest disputes a charge with their bank.
 * Creates urgent admin notification and email alert.
 */
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const { id: disputeId, amount, reason, charge, evidence_details } = dispute

  try {
    // Find payment by charge ID
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: (charge as Stripe.Charge).payment_intent as string },
      include: {
        booking: {
          include: {
            user: true,
            package: true
          }
        }
      }
    })

    if (!payment) {
      console.error(`Payment not found for charge: ${charge}`)
      return
    }

    // Create admin notification
    await prisma.notification.create({
      data: {
        userId: 'ADMIN', // Admin user ID
        type: 'GENERAL', // Or create DISPUTE_ALERT type
        title: `🚨 URGENT: Payment Dispute - ${payment.booking.bookingReference}`,
        content: `
          A payment dispute has been filed for booking ${payment.booking.bookingReference}.

          Dispute Amount: $${amount / 100}
          Reason: ${reason}
          Deadline: ${new Date(evidence_details.due_by * 1000).toLocaleDateString()}

          Action Required: Review evidence and respond in Stripe dashboard.
        `,
        linkUrl: `https://dashboard.stripe.com/disputes/${disputeId}`,
        linkText: 'View in Stripe Dashboard'
      }
    })

    // Send email alert to admin team
    const { sendAdminAlert } = await import('@/lib/email/sendgrid')

    await sendAdminAlert('admin@pickleballpassport.com', {
      subject: `URGENT: Payment Dispute - ${payment.booking.bookingReference}`,
      bookingReference: payment.booking.bookingReference,
      disputeAmount: amount,
      disputeReason: reason,
      deadline: new Date(evidence_details.due_by * 1000).toISOString(),
      stripeDisputeUrl: `https://dashboard.stripe.com/disputes/${disputeId}`,
      adminPanelUrl: `/admin/bookings/${payment.bookingId}`
    }).catch(console.error)

    console.log(`Dispute created for payment ${payment.id}: ${disputeId}`)
  } catch (error) {
    console.error('Error handling dispute creation:', error)
  }
}
```

**Event: `charge.dispute.closed`**
```typescript
/**
 * Handle Dispute Closed
 *
 * When a dispute is resolved (won or lost).
 * Updates payment/booking status if dispute was lost.
 */
async function handleDisputeClosed(dispute: Stripe.Dispute) {
  const { id: disputeId, status, charge, amount } = dispute

  try {
    // Find payment
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: (charge as Stripe.Charge).payment_intent as string },
      include: {
        booking: {
          include: {
            user: true,
            trip: true
          }
        }
      }
    })

    if (!payment) {
      console.error(`Payment not found for charge: ${charge}`)
      return
    }

    if (status === 'won') {
      // Dispute won - no action needed, just notify admin
      await prisma.notification.create({
        data: {
          userId: 'ADMIN',
          type: 'GENERAL',
          title: `✅ Dispute Won - ${payment.booking.bookingReference}`,
          content: `The dispute for booking ${payment.booking.bookingReference} was resolved in your favor.`,
          linkUrl: `https://dashboard.stripe.com/disputes/${disputeId}`
        }
      })

      console.log(`Dispute won: ${disputeId}`)
    } else if (status === 'lost') {
      // Dispute lost - refund the guest, cancel booking
      await prisma.$transaction(async (tx) => {
        // Update payment to REFUNDED
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'REFUNDED',
            refundedAmount: amount,
            stripeRefundId: disputeId
          }
        })

        // Cancel booking if currently confirmed
        if (payment.booking.status === 'CONFIRMED') {
          await tx.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CANCELLED' }
          })

          // Decrement trip capacity
          if (payment.booking.tripId) {
            await tx.trip.update({
              where: { id: payment.booking.tripId },
              data: {
                currentBookings: {
                  decrement: 1
                }
              }
            })
          }
        }

        // Notify admin
        await tx.notification.create({
          data: {
            userId: 'ADMIN',
            type: 'GENERAL',
            title: `❌ Dispute Lost - ${payment.booking.bookingReference}`,
            content: `The dispute for booking ${payment.booking.bookingReference} was lost. Booking has been cancelled and refund issued.`
          }
        })
      })

      // Send email to guest explaining outcome
      const { sendDisputeOutcomeEmail } = await import('@/lib/email/sendgrid')

      await sendDisputeOutcomeEmail(payment.booking.user.email, {
        firstName: payment.booking.user.email.split('@')[0],
        bookingReference: payment.booking.bookingReference,
        outcome: 'resolved in your favor',
        refundAmount: amount
      }).catch(console.error)

      console.log(`Dispute lost: ${disputeId}, booking cancelled`)
    }
  } catch (error) {
    console.error('Error handling dispute closure:', error)
  }
}
```

### Stripe CLI Testing Workflow

**Installation:**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Other platforms: https://stripe.com/docs/stripe-cli
```

**Setup:**
```bash
# Login to Stripe account
stripe login

# This will open browser for authentication
```

**Local Webhook Testing:**
```bash
# Forward webhooks to local development server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output a webhook signing secret (whsec_...)
# Copy this and add to .env as STRIPE_WEBHOOK_SECRET
```

**Trigger Test Events:**
```bash
# In a separate terminal window:

# Test payment success
stripe trigger payment_intent.succeeded

# Test payment failure
stripe trigger payment_intent.payment_failed

# Test refund
stripe trigger charge.refunded

# Test dispute creation (may not be available in CLI)
stripe trigger charge.dispute.created

# Custom event with specific data
stripe events resend evt_... --api-key sk_test_...
```

**Verify Webhook Processing:**
1. Watch the `stripe listen` terminal for incoming events
2. Check application logs for processing messages
3. Check database for WebhookEvent records
4. Verify Payment and Booking status updates
5. Check email delivery (if configured)

**Test Idempotency:**
```bash
# Send the same event twice
stripe events resend evt_1234567890
stripe events resend evt_1234567890

# Should process once, skip second time
```

### Environment Variable Setup

**.env Configuration:**
```bash
# Stripe Secret Key (already configured)
STRIPE_SECRET_KEY=sk_test_51ABC...

# Stripe Publishable Key (already configured)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...

# Webhook Secret (GET FROM STRIPE CLI OR DASHBOARD)
STRIPE_WEBHOOK_SECRET=whsec_...

# For Production: Get from Stripe Dashboard → Webhooks → Add endpoint
# https://dashboard.stripe.com/webhooks
```

**Getting Webhook Secret:**

**Option 1: Stripe CLI (Development)**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Output will show:
# > Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

**Option 2: Stripe Dashboard (Production)**
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
   - `charge.dispute.created`
   - `charge.dispute.closed`
5. Click "Add endpoint"
6. Copy the signing secret (whsec_...)
7. Add to production environment variables

### Email Template Structure

**Refund Confirmation Email:**
```typescript
// lib/email/templates/refund-confirmation.ts

export interface RefundConfirmationData {
  firstName: string
  email: string
  bookingReference: string
  packageName: string
  refundAmount: number // in cents
  originalAmount: number // in cents
  isPartialRefund: boolean
  refundDate: string // ISO date
  expectedTimeline: string // "5-10 business days"
}

export function generateRefundConfirmationEmail(data: RefundConfirmationData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          /* Ocean blue and gold brand colors */
          .header { background-color: #003D5C; color: white; padding: 20px; }
          .amount { color: #10B981; font-size: 24px; font-weight: bold; }
          .info-box { background: #F3F4F6; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Refund Processed - Pickleball Passport</h1>
        </div>

        <div style="padding: 20px;">
          <p>Hi ${data.firstName},</p>

          <p>Your refund has been processed successfully.</p>

          <div class="info-box">
            <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
            <p><strong>Package:</strong> ${data.packageName}</p>
            <p><strong>Original Amount:</strong> $${(data.originalAmount / 100).toLocaleString()}</p>
            <p><strong>Refund Amount:</strong> <span class="amount">$${(data.refundAmount / 100).toLocaleString()}</span></p>
            ${data.isPartialRefund ? '<p><em>(Partial refund)</em></p>' : ''}
            <p><strong>Processed On:</strong> ${new Date(data.refundDate).toLocaleDateString()}</p>
          </div>

          <h3>What Happens Next?</h3>
          <ul>
            <li>Your refund will appear on your original payment method within ${data.expectedTimeline}</li>
            <li>You will receive a separate receipt email from Stripe</li>
            <li>If you have any questions, please contact our support team</li>
          </ul>

          <p>We're sorry to see you go. If there's anything we can do to improve your experience, please let us know.</p>

          <p>
            <strong>Customer Support:</strong><br>
            Email: support@pickleballpassport.com<br>
            Phone: +1 (555) 123-4567
          </p>
        </div>
      </body>
    </html>
  `
}
```

### Common Pitfalls to Avoid

1. **❌ DON'T trust webhook data without signature verification**
   - ALWAYS verify signature using `stripe.webhooks.constructEvent()`
   - Never process webhooks with invalid signatures
   - This is the #1 security requirement for webhooks

2. **❌ DON'T process events without idempotency**
   - Stripe WILL retry webhooks if they don't receive 200 OK
   - Without idempotency, you'll process the same refund twice
   - Use WebhookEvent model to track processed events

3. **❌ DON'T return errors for processing failures**
   - Return 200 OK even if processing fails (for unrecoverable errors)
   - Only return 4xx/5xx for signature failures or critical system errors
   - Otherwise Stripe will keep retrying forever

4. **❌ DON'T block webhook processing on email sending**
   - Email delivery can fail and shouldn't block the webhook
   - Use `.catch(console.error)` to handle email failures gracefully
   - Wrap email sending in try-catch

5. **❌ DON'T forget to decrement trip capacity on cancellation**
   - When refund triggers cancellation, decrement `trip.currentBookings`
   - Otherwise trip capacity tracking will be incorrect
   - Use atomic increment/decrement operations

6. **❌ DON'T update booking status for partial refunds**
   - Only cancel booking if it's a FULL refund
   - Check `amount_refunded >= original_payment_amount`
   - Partial refunds should update payment but leave booking CONFIRMED

7. **❌ DON'T hardcode admin email addresses**
   - Use environment variable: `ADMIN_EMAIL=admin@pickleballpassport.com`
   - Or fetch from admin user records in database
   - Makes it easier to change in production

8. **❌ DON'T log sensitive data in production**
   - Redact card details, full emails, etc.
   - Log event IDs and types, not full payloads
   - Stripe dashboard has full event details if needed

### Performance Considerations

**Webhook Response Time:**
- Stripe expects 200 OK within 5 seconds
- If processing takes longer, acknowledge immediately and process async
- Current implementation processes synchronously (acceptable for our use case)
- For high-volume apps, consider job queue (Bull, BullMQ, Inngest)

**Database Transactions:**
- Use Prisma transactions for atomic updates
- Keep transactions as short as possible
- Only include critical operations in transaction
- Email sending happens AFTER transaction commits

**Retry Logic:**
- Stripe automatically retries failed webhooks (up to 3 days)
- Idempotency ensures safe retries
- Failed events appear in Stripe dashboard for manual replay
- Monitor webhook failures in Stripe dashboard

### Security Best Practices

**Webhook Signature Verification:**
- ✅ ALREADY IMPLEMENTED in existing code
- Uses `stripe.webhooks.constructEvent()` with webhook secret
- Prevents malicious webhook spoofing
- NEVER skip signature verification

**HTTPS Enforcement:**
- ✅ Next.js handles HTTPS in production automatically
- Webhooks MUST be sent to HTTPS endpoints
- Stripe rejects non-HTTPS webhook URLs

**Data Validation:**
- Validate event object structure before processing
- Check for required fields (payment_intent, charge, etc.)
- Handle missing or malformed data gracefully

**Rate Limiting:**
- Stripe already rate limits webhook deliveries
- No additional rate limiting needed on our side
- Monitor for unusual spike in webhooks (potential attack)

### Troubleshooting Guide

**Problem: Webhook signature verification fails**
- Check: `STRIPE_WEBHOOK_SECRET` is set correctly in .env
- Check: Using correct secret (development vs production)
- Check: Raw request body is used (not parsed JSON)
- Check: Stripe API version matches (2025-12-15.clover)

**Problem: Events processed multiple times**
- Check: WebhookEvent model exists in database
- Check: `checkEventProcessed()` is called before processing
- Check: `markEventProcessed()` is called after success
- Check: Database unique constraint on `stripeEventId`

**Problem: Refund not updating booking status**
- Check: Refund amount equals original payment amount (full refund)
- Check: Booking status is CONFIRMED (not already CANCELLED)
- Check: Database transaction completed successfully
- Check: Trip capacity decrement executed

**Problem: Emails not sending**
- Check: SendGrid API key configured
- Check: Email template exists
- Check: Email errors are logged (not thrown)
- Check: SendGrid dashboard for delivery status

**Problem: Stripe CLI not forwarding events**
- Check: `stripe listen` is running
- Check: Forwarding to correct URL (localhost:3000/api/webhooks/stripe)
- Check: Port 3000 is accessible
- Check: Firewall not blocking incoming connections

### Production Checklist

**Before Deploying:**
- [ ] WebhookEvent model migrated to production database
- [ ] Payment model updated with refundedAmount and stripeRefundId fields
- [ ] STRIPE_WEBHOOK_SECRET configured in production environment
- [ ] Webhook endpoint added in Stripe Dashboard (production mode)
- [ ] All event types selected in Stripe webhook configuration
- [ ] HTTPS endpoint verified (Stripe requires HTTPS)
- [ ] Email templates tested and working
- [ ] Admin email addresses configured
- [ ] TypeScript validation passes: `npx tsc --noEmit`
- [ ] Production build succeeds: `npm run build`

**Post-Deployment:**
- [ ] Trigger test event from Stripe Dashboard
- [ ] Verify webhook appears in application logs
- [ ] Check WebhookEvent record created in database
- [ ] Verify idempotency (replay event, should skip)
- [ ] Monitor Stripe Dashboard → Webhooks → View logs
- [ ] Set up alerts for webhook failures
- [ ] Document webhook secret rotation process

### Related Stories & Dependencies

**Depends On:**
- ✅ E4-S1: Stripe Integration Setup (webhook signature verification)
- ✅ E4-S2: Payment Intent Creation (payment_intent.succeeded handler exists)
- ✅ E3-S13: Booking Cancellation (refund processing, needs async event handling)
- ✅ E11-S1: SendGrid Integration (email sending infrastructure)
- ✅ E11-S2: Booking Confirmation Email (email template pattern)

**Unblocks:**
- E4-S8: Receipt Generation (needs webhook for payment_intent.succeeded)
- E4-S9: Refund Processing (needs charge.refunded webhook handler)
- E11-S5: Payment Receipt Email (triggered by payment_intent.succeeded)

**Related Stories:**
- E4-S5: Payment Failure Handling (payment_intent.payment_failed already implemented)
- E5-S8: Scheduled Trip Reminders (notification pattern similar to dispute alerts)
- E5-S9: Bulk Notifications (admin notification pattern)

### References

**Stripe Documentation:**
- [Webhook Events Documentation](https://stripe.com/docs/webhooks)
- [charge.refunded Event](https://stripe.com/docs/api/events/types#event_types-charge.refunded)
- [charge.dispute.created Event](https://stripe.com/docs/api/events/types#event_types-charge.dispute.created)
- [Webhook Signature Verification](https://stripe.com/docs/webhooks/signatures)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

**Code References:**
- Existing webhook handler: [app/api/webhooks/stripe/route.ts:1-347]
- Stripe service: [lib/stripe/stripe-service.ts:1-196]
- Booking router (cancel mutation): [lib/trpc/server/routers/booking.ts:280-310]
- Payment model: [prisma/schema.prisma:377-405]
- Booking model: [prisma/schema.prisma:285-331]

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

(To be filled by dev agent)

### Completion Notes

(To be filled by dev agent upon story completion)

### File List

**Files to Modify:**
1. `app/api/webhooks/stripe/route.ts` - Add refund and dispute handlers
2. `prisma/schema.prisma` - Add WebhookEvent model and Payment fields

**Files to Create:**
1. `lib/email/templates/refund-confirmation.ts` - Refund email template
2. `lib/email/templates/dispute-alert.ts` - Dispute alert email template (optional)

**Migrations:**
1. Prisma migration: `add-webhook-event-tracking`

**Environment Variables:**
- `STRIPE_WEBHOOK_SECRET` - Already required, verify setup

**No Breaking Changes** - Enhances existing webhook infrastructure
