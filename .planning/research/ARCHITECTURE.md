# Architecture Research: Payment & Partner Systems

**Domain:** Payment failure recovery, partner payouts, webhook idempotency, email reliability
**Researched:** 2026-01-26
**Overall Confidence:** HIGH (verified against existing codebase + Stripe/Upstash documentation)

## Executive Summary

The existing codebase has solid foundations for payment processing with Stripe webhooks, PaymentRecord tracking for installments, retry logic via `retry-calculator.ts`, and Stripe Connect integration for partner payouts. However, several areas need hardening:

1. **Payment Failure Recovery**: Current retry logic exists but lacks state machine formalization, comprehensive notification flow, and admin escalation paths.
2. **Partner Payouts**: Stripe Connect Express accounts are implemented but batch processing and payout scheduling are missing.
3. **Webhook Idempotency**: Basic idempotency via `WebhookEvent` table exists but has race condition risks and no distributed lock mechanism.
4. **Email Reliability**: Direct SendGrid calls without queue, no retry on transient failures, no delivery tracking beyond SendGrid webhooks.

---

## 1. Payment Failure Recovery

### Current State Analysis

The codebase has:
- `PaymentRecord` model with `status`, `retryCount`, `lastAttemptAt`, `failureReason` fields
- `retry-calculator.ts` with exponential backoff: 1 day, 3 days, 7 days
- `charge-installments/route.ts` cron job processing due payments
- `chargeInstallment()` function for Stripe PaymentIntent creation

### Recommended State Machine

```
                    ┌─────────────┐
                    │   PENDING   │
                    └──────┬──────┘
                           │ Due date reached
                           ▼
                    ┌─────────────┐
        ┌───────────│  CHARGING   │───────────┐
        │           └─────────────┘           │
        │ Success                       Failure (transient)
        ▼                                     │
┌─────────────┐                               │
│    PAID     │                               ▼
└─────────────┘                    ┌─────────────────────┐
                                   │  FAILED_RETRYABLE   │
                                   │ (retryCount < 4)    │
                                   └──────────┬──────────┘
                                              │
                           ┌──────────────────┼──────────────────┐
                           │                  │                  │
                      retry 1            retry 2             retry 3
                      (+1 day)           (+3 days)           (+7 days)
                           │                  │                  │
                           └──────────────────┴──────────────────┘
                                              │
                                      All retries exhausted
                                              │
                                              ▼
                                   ┌─────────────────────┐
                                   │   FAILED_PERMANENT  │
                                   │  (requires action)  │
                                   └─────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `PaymentStateMachine` | State transitions, validation | PaymentRecord (Prisma), Events |
| `PaymentCharger` | Stripe API calls, error classification | Stripe SDK, StateMachine |
| `PaymentNotifier` | Email/SMS for failure states | SendGrid, Notification Queue |
| `PaymentRecoveryJob` | Cron job orchestration | StateMachine, Charger, Notifier |
| `AdminAlertService` | Escalation for permanent failures | Admin notification system |

### Notification Flow for Failures

```typescript
// Recommended notification triggers by state
interface PaymentNotificationConfig {
  FAILED_RETRYABLE: {
    // Attempt 1 failure
    retry1: {
      email: 'installment-payment-failed',
      sms: false, // Not yet, just email
      includeUpdatePaymentLink: true,
      nextRetryDate: 'Tomorrow',
    },
    // Attempt 2 failure
    retry2: {
      email: 'installment-payment-failed-urgent',
      sms: true, // Add SMS urgency
      includeUpdatePaymentLink: true,
      nextRetryDate: '3 days from now',
    },
    // Attempt 3 failure
    retry3: {
      email: 'installment-payment-failed-final-warning',
      sms: true,
      includeUpdatePaymentLink: true,
      nextRetryDate: '7 days (final attempt)',
    },
  },
  FAILED_PERMANENT: {
    email: 'installment-payment-failed-booking-at-risk',
    sms: true,
    adminAlert: true, // Escalate to admin
    includeCallToAction: 'Contact support',
  },
}
```

### Implementation Pattern (tRPC/Prisma Compatible)

```typescript
// lib/payments/payment-state-machine.ts
export type PaymentState =
  | 'PENDING'
  | 'CHARGING'
  | 'PAID'
  | 'FAILED_RETRYABLE'
  | 'FAILED_PERMANENT';

export interface StateTransition {
  fromState: PaymentState;
  toState: PaymentState;
  trigger: 'DUE_DATE' | 'CHARGE_SUCCESS' | 'CHARGE_FAILED_TRANSIENT' | 'CHARGE_FAILED_PERMANENT' | 'RETRY';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export class PaymentStateMachine {
  private validTransitions: Map<PaymentState, PaymentState[]> = new Map([
    ['PENDING', ['CHARGING']],
    ['CHARGING', ['PAID', 'FAILED_RETRYABLE', 'FAILED_PERMANENT']],
    ['FAILED_RETRYABLE', ['CHARGING', 'FAILED_PERMANENT']],
    // PAID and FAILED_PERMANENT are terminal states
  ]);

  canTransition(from: PaymentState, to: PaymentState): boolean {
    return this.validTransitions.get(from)?.includes(to) ?? false;
  }

  async transition(
    paymentRecordId: string,
    toState: PaymentState,
    trigger: StateTransition['trigger'],
    prisma: PrismaClient
  ): Promise<void> {
    // Atomic transition with audit logging
    await prisma.$transaction(async (tx) => {
      const record = await tx.paymentRecord.findUniqueOrThrow({
        where: { id: paymentRecordId },
      });

      const fromState = this.mapStatusToState(record.status);
      if (!this.canTransition(fromState, toState)) {
        throw new Error(`Invalid transition: ${fromState} -> ${toState}`);
      }

      await tx.paymentRecord.update({
        where: { id: paymentRecordId },
        data: {
          status: this.mapStateToStatus(toState),
          // Update retry tracking fields as needed
        },
      });

      // Emit event for notification handling
      await this.emitTransitionEvent({ fromState, toState, trigger, paymentRecordId });
    });
  }
}
```

### Stripe Error Classification

```typescript
// Extend existing retry-calculator.ts
export const ERROR_CATEGORIES = {
  // Transient - should retry
  TRANSIENT: [
    'card_declined',           // Generic decline, may work on retry
    'insufficient_funds',       // User may add funds
    'processing_error',         // Stripe temporary issue
    'card_velocity_exceeded',   // Rate limit, try later
  ],

  // Requires user action - retry with notification
  ACTION_REQUIRED: [
    'authentication_required',  // 3DS needed
    'expired_card',             // Card expired
    'incorrect_cvc',            // Wrong CVC entered
  ],

  // Permanent - don't retry, escalate
  PERMANENT: [
    'card_not_supported',       // Card type not accepted
    'currency_not_supported',   // Currency mismatch
    'do_not_honor',             // Bank refuses
    'fraudulent',               // Suspected fraud
    'lost_card',                // Reported lost
    'stolen_card',              // Reported stolen
    'invalid_account',          // Account closed
  ],
} as const;
```

---

## 2. Partner Payout Processing

### Current State Analysis

The codebase has:
- `PartnerProfile` with Stripe Connect fields (`stripeConnectAccountId`, `stripeConnectPayoutsEnabled`)
- `PartnerPayout` model with `status`, `stripeTransferId`, `stripePayoutId`
- `stripe-connect.ts` with `createTransfer()` function
- Webhook handlers for `account.updated`, `transfer.created`, `transfer.reversed`

### Recommendation: Stripe Connect Express (Already Implemented)

**Use Stripe Connect Express** (already in place) because:
1. Stripe handles KYC/compliance
2. Partners get Stripe Express Dashboard
3. Automatic payout to partner bank accounts
4. Platform fee collection via `application_fee_amount`

### Batch Payout Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Payout Processing Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Partner Requests Payout (Min 1000 points = $800)         │
│     └─> PartnerPayout created with status: PENDING            │
│                                                               │
│  2. Admin Approval (or Auto-Approve for verified partners)   │
│     └─> PartnerPayout status: APPROVED                        │
│                                                               │
│  3. Batch Processor (Cron: weekly on Mondays)                │
│     ├─> Query APPROVED payouts                                │
│     ├─> Validate partner.stripeConnectPayoutsEnabled          │
│     ├─> Create Stripe Transfer to Connected Account           │
│     ├─> Update PartnerPayout with stripeTransferId            │
│     └─> Status: PROCESSING                                    │
│                                                               │
│  4. Stripe Webhook: transfer.created                         │
│     └─> Update PartnerPayout status: COMPLETED                │
│                                                               │
│  5. Stripe Webhook: transfer.reversed (if issues)            │
│     └─> Update PartnerPayout status: FAILED                   │
│     └─> Restore partner points                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Batch Payout Implementation

```typescript
// lib/payments/batch-partner-payouts.ts
export interface BatchPayoutResult {
  processed: number;
  successful: number;
  failed: number;
  details: Array<{
    payoutId: string;
    partnerId: string;
    amount: number;
    status: 'success' | 'failed';
    error?: string;
  }>;
}

export async function processBatchPayouts(): Promise<BatchPayoutResult> {
  // 1. Get approved payouts with enabled Connect accounts
  const payouts = await prisma.partnerPayout.findMany({
    where: {
      status: 'APPROVED', // Admin approved, ready to process
      partner: {
        stripeConnectPayoutsEnabled: true,
        stripeConnectAccountId: { not: null },
      },
    },
    include: {
      partner: true,
    },
    take: 50, // Batch limit
  });

  // 2. Check platform balance before processing
  const { available } = await getPlatformBalance();
  const totalNeeded = payouts.reduce((sum, p) => sum + p.amountInCents, 0);

  if (available < totalNeeded) {
    throw new Error(`Insufficient platform balance: ${available} < ${totalNeeded}`);
  }

  // 3. Process each payout
  const results = await Promise.allSettled(
    payouts.map(async (payout) => {
      return await prisma.$transaction(async (tx) => {
        // Mark as processing (prevents double-processing)
        await tx.partnerPayout.update({
          where: { id: payout.id },
          data: { status: 'PROCESSING' },
        });

        // Create Stripe transfer
        const transfer = await createTransfer({
          amount: payout.amountInCents,
          connectedAccountId: payout.partner.stripeConnectAccountId!,
          payoutId: payout.id,
          description: `Partner payout - ${payout.pointsRedeemed} points`,
        });

        // Update with transfer ID
        await tx.partnerPayout.update({
          where: { id: payout.id },
          data: {
            stripeTransferId: transfer.transferId,
            processedAt: new Date(),
          },
        });

        return { payoutId: payout.id, transferId: transfer.transferId };
      });
    })
  );

  // 4. Compile results
  // ... (aggregate success/failure counts)
}
```

### Payout Status Enum Extension

```prisma
// Recommended extension to existing PayoutStatus
enum PayoutStatus {
  PENDING     // Partner requested
  APPROVED    // Admin approved (or auto-approved)
  PROCESSING  // Transfer initiated
  COMPLETED   // Transfer confirmed via webhook
  FAILED      // Transfer failed/reversed
  CANCELLED   // Admin cancelled before processing
}
```

---

## 3. Webhook Idempotency

### Current State Analysis

The codebase has:
- `WebhookEvent` model with `stripeEventId` (unique), `processed`, `processedAt`
- Upsert pattern in `stripe/route.ts`: checks `processed` before handling
- Basic protection against duplicate processing

### Problem: Race Conditions

The current pattern has a race condition window:

```
Request A: SELECT WHERE stripeEventId = 'evt_123' (not found)
Request B: SELECT WHERE stripeEventId = 'evt_123' (not found)
Request A: INSERT evt_123 with processed=false
Request B: INSERT evt_123 (fails on unique constraint, but could cause issues)
Request A: Process event
Request B: May process duplicate or error
```

### Recommended Pattern: Distributed Lock with Redis

```typescript
// lib/webhooks/idempotency.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const LOCK_TTL_SECONDS = 60; // Lock expires after 60 seconds

export interface IdempotencyResult {
  shouldProcess: boolean;
  alreadyProcessed: boolean;
  lockAcquired: boolean;
}

export async function acquireWebhookLock(eventId: string): Promise<IdempotencyResult> {
  const lockKey = `webhook:lock:${eventId}`;
  const processedKey = `webhook:processed:${eventId}`;

  // Check if already processed (fast path)
  const isProcessed = await redis.get(processedKey);
  if (isProcessed === 'true') {
    return { shouldProcess: false, alreadyProcessed: true, lockAcquired: false };
  }

  // Try to acquire lock (atomic SET NX with expiry)
  const lockAcquired = await redis.set(lockKey, Date.now(), {
    nx: true, // Only set if not exists
    ex: LOCK_TTL_SECONDS,
  });

  if (!lockAcquired) {
    // Another worker is processing this event
    return { shouldProcess: false, alreadyProcessed: false, lockAcquired: false };
  }

  return { shouldProcess: true, alreadyProcessed: false, lockAcquired: true };
}

export async function markWebhookProcessed(eventId: string): Promise<void> {
  const processedKey = `webhook:processed:${eventId}`;
  const lockKey = `webhook:lock:${eventId}`;

  // Mark as processed (TTL: 7 days to handle late retries)
  await redis.set(processedKey, 'true', { ex: 60 * 60 * 24 * 7 });

  // Release lock
  await redis.del(lockKey);
}

export async function releaseWebhookLock(eventId: string): Promise<void> {
  const lockKey = `webhook:lock:${eventId}`;
  await redis.del(lockKey);
}
```

### Updated Webhook Handler Pattern

```typescript
// app/api/webhooks/stripe/route.ts (updated pattern)
export async function POST(req: NextRequest) {
  // ... signature verification ...

  const event = verifyWebhookSignature(body, signature, webhookSecret);

  // Idempotency check with distributed lock
  const idempotency = await acquireWebhookLock(event.id);

  if (idempotency.alreadyProcessed) {
    return NextResponse.json({ received: true, status: 'already_processed' });
  }

  if (!idempotency.lockAcquired) {
    // Another instance is processing - return 200 to prevent Stripe retry
    return NextResponse.json({ received: true, status: 'processing_elsewhere' });
  }

  try {
    // Process event based on type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      // ... other handlers ...
    }

    // Mark as processed (both Redis and DB for durability)
    await markWebhookProcessed(event.id);
    await prisma.webhookEvent.upsert({
      where: { stripeEventId: event.id },
      create: { stripeEventId: event.id, type: event.type, processed: true },
      update: { processed: true, processedAt: new Date() },
    });

    return NextResponse.json({ received: true, status: 'processed' });
  } catch (error) {
    // Release lock on failure (allow retry)
    await releaseWebhookLock(event.id);
    throw error;
  }
}
```

### Idempotency for Database Operations

```typescript
// Pattern for idempotent database updates
async function handlePaymentSuccessIdempotent(
  paymentIntent: Stripe.PaymentIntent,
  eventId: string
) {
  const { bookingId } = paymentIntent.metadata;

  await prisma.$transaction(async (tx) => {
    // Check if this event already processed for this payment
    const payment = await tx.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      throw new Error(`Payment not found for intent: ${paymentIntent.id}`);
    }

    // Idempotency: skip if already SUCCEEDED
    if (payment.status === 'SUCCEEDED') {
      console.log(`Payment ${payment.id} already succeeded, skipping`);
      return;
    }

    // Atomic update with status check (optimistic locking)
    const updated = await tx.payment.updateMany({
      where: {
        id: payment.id,
        status: { not: 'SUCCEEDED' }, // Only update if not already succeeded
      },
      data: {
        status: 'SUCCEEDED',
        // ... other fields
      },
    });

    if (updated.count === 0) {
      console.log(`Payment ${payment.id} was updated by another process`);
      return;
    }

    // Continue with booking confirmation, emails, etc.
    // These should also be idempotent or use event-sourcing
  });
}
```

---

## 4. Email Queue Architecture

### Current State Analysis

The codebase has:
- Direct SendGrid API calls in `sendgrid.ts`
- No queue or retry mechanism for transient failures
- `EmailSend` model for tracking (but not fully utilized)
- SendGrid webhook handler for delivery events

### Problem: Fire-and-Forget Emails

Current issues:
1. If SendGrid API fails, email is lost
2. No visibility into pending/queued emails
3. No rate limiting for bulk sends
4. Webhook handler processes have no background processing

### Recommended Architecture: Redis-Based Email Queue

```
┌───────────────────────────────────────────────────────────────────┐
│                      Email Queue Architecture                       │
├───────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐    │
│  │ Email       │    │ Redis       │    │ Email Worker        │    │
│  │ Dispatcher  │───>│ Stream      │───>│ (Background Job)    │    │
│  └─────────────┘    │ "emails"    │    └──────────┬──────────┘    │
│        │            └─────────────┘               │               │
│        │                  │                       │               │
│  Immediate sends    Consumer Group          ┌────┴────┐          │
│  (transactional)    for reliable            │ SendGrid │          │
│                     processing              │   API    │          │
│                                             └────┬────┘          │
│                                                  │               │
│                                    ┌─────────────┴─────────────┐ │
│                                    │       EmailSend           │ │
│                                    │   (Delivery Tracking)     │ │
│                                    └───────────────────────────┘ │
│                                                                     │
└───────────────────────────────────────────────────────────────────┘
```

### Email Queue Implementation with Upstash Redis Streams

```typescript
// lib/email/email-queue.ts
import { Redis } from '@upstash/redis';
import { emailLogger } from '@/lib/logger';

const redis = Redis.fromEnv();
const STREAM_KEY = 'email:queue';
const CONSUMER_GROUP = 'email-processors';
const CONSUMER_NAME = `worker-${process.env.VERCEL_GIT_COMMIT_SHA || 'local'}`;

export interface QueuedEmail {
  id: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  templateId?: string;
  userId?: string;
  priority: 'high' | 'normal' | 'low';
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Queue an email for async delivery
 * Use for: marketing emails, reminders, non-critical notifications
 */
export async function queueEmail(
  email: Omit<QueuedEmail, 'id' | 'retryCount' | 'createdAt'>
): Promise<string> {
  const queuedEmail: QueuedEmail = {
    ...email,
    id: crypto.randomUUID(),
    retryCount: 0,
    maxRetries: email.maxRetries ?? 3,
    createdAt: new Date().toISOString(),
  };

  // Add to Redis Stream
  const streamId = await redis.xadd(STREAM_KEY, '*', {
    payload: JSON.stringify(queuedEmail),
  });

  emailLogger.info(
    { emailId: queuedEmail.id, streamId, to: email.to },
    'Email queued'
  );

  // Also create EmailSend record for tracking
  // await prisma.emailSend.create({ ... });

  return queuedEmail.id;
}

/**
 * Send email immediately (bypasses queue)
 * Use for: payment receipts, booking confirmations, OTPs
 */
export async function sendEmailImmediate(
  options: SendEmailOptions
): Promise<void> {
  // Direct SendGrid call (existing implementation)
  await sendEmail(options);
}

/**
 * Process queued emails (called by worker/cron)
 */
export async function processEmailQueue(batchSize: number = 10): Promise<{
  processed: number;
  failed: number;
}> {
  // Ensure consumer group exists
  try {
    await redis.xgroup(STREAM_KEY, {
      type: 'CREATE',
      group: CONSUMER_GROUP,
      id: '0',
      options: { MKSTREAM: true },
    });
  } catch (e) {
    // Group already exists, ignore
  }

  // Read messages from stream
  const messages = await redis.xreadgroup(
    CONSUMER_GROUP,
    CONSUMER_NAME,
    STREAM_KEY,
    '>',
    { count: batchSize }
  );

  if (!messages || messages.length === 0) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  for (const [_streamKey, entries] of messages) {
    for (const entry of entries) {
      const [messageId, fields] = entry;
      const email: QueuedEmail = JSON.parse(fields.payload);

      try {
        await sendEmail({
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
          userId: email.userId,
        });

        // Acknowledge successful processing
        await redis.xack(STREAM_KEY, CONSUMER_GROUP, messageId);
        processed++;

        // Update EmailSend status
        // await prisma.emailSend.update({ ... status: 'SENT' });
      } catch (error) {
        if (email.retryCount < email.maxRetries) {
          // Re-queue with incremented retry count
          await queueEmail({
            ...email,
            retryCount: email.retryCount + 1,
          });
        } else {
          // Max retries exceeded, mark as failed
          emailLogger.error(
            { emailId: email.id, error },
            'Email delivery failed after max retries'
          );
          // await prisma.emailSend.update({ ... status: 'BOUNCED' });
        }

        // Acknowledge to remove from pending (we've handled it)
        await redis.xack(STREAM_KEY, CONSUMER_GROUP, messageId);
        failed++;
      }
    }
  }

  return { processed, failed };
}
```

### Email Types and Queue Strategy

| Email Type | Priority | Queue Strategy | Retry |
|------------|----------|----------------|-------|
| Payment Receipt | High | Immediate (sync) | No retry, log failure |
| Booking Confirmation | High | Immediate (sync) | No retry, log failure |
| Password Reset/OTP | High | Immediate (sync) | No retry |
| Pre-Trip Reminders | Normal | Queued | 3 retries |
| Payment Failure Notification | Normal | Queued | 3 retries |
| Partner Notifications | Normal | Queued | 3 retries |
| Marketing/Newsletter | Low | Queued + Batch | 3 retries |

### Cron Job for Email Queue Processing

```typescript
// app/api/cron/process-email-queue/route.ts
export async function GET(req: NextRequest) {
  // Verify CRON_SECRET...

  const result = await processEmailQueue(50); // Process up to 50 emails

  return NextResponse.json({
    processed: result.processed,
    failed: result.failed,
    timestamp: new Date().toISOString(),
  });
}
```

---

## 5. Integration Points

### System Integration Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           System Integration Map                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌───────────────┐         ┌───────────────┐         ┌───────────────┐     │
│   │    Stripe     │────────>│   Webhooks    │────────>│    tRPC       │     │
│   │   Payments    │         │   Handler     │         │   Routers     │     │
│   └───────────────┘         └───────┬───────┘         └───────────────┘     │
│          │                          │                         │             │
│          │                    ┌─────┴─────┐                   │             │
│          ▼                    ▼           ▼                   ▼             │
│   ┌───────────────┐   ┌───────────┐ ┌───────────┐    ┌───────────────┐     │
│   │   Stripe      │   │  Upstash  │ │  Prisma   │    │   Email       │     │
│   │   Connect     │   │   Redis   │ │   (DB)    │    │   Queue       │     │
│   └───────────────┘   └───────────┘ └───────────┘    └───────────────┘     │
│          │                  │              │                 │             │
│          │            ┌─────┴─────────┐    │                 │             │
│          │            │               │    │                 │             │
│          ▼            ▼               ▼    ▼                 ▼             │
│   ┌───────────────────────────────────────────────────────────────────┐   │
│   │                        Background Jobs (Cron)                      │   │
│   ├───────────────┬───────────────┬───────────────┬───────────────────┤   │
│   │ charge-       │ process-      │ batch-partner-│ send-payment-     │   │
│   │ installments  │ email-queue   │ payouts       │ reminders         │   │
│   └───────────────┴───────────────┴───────────────┴───────────────────┘   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow: Payment Failure Scenario

```
1. Cron job triggers (charge-installments)
   │
2. PaymentStateMachine.transition(PENDING -> CHARGING)
   │
3. Stripe PaymentIntent.create() with saved PaymentMethod
   │
4. ◄─ Stripe returns payment_intent.failed (card_declined)
   │
5. PaymentStateMachine.transition(CHARGING -> FAILED_RETRYABLE)
   │
6. Update PaymentRecord: retryCount++, failureReason, lastAttemptAt
   │
7. Queue notification email (emailQueue.queueEmail)
   │
8. ◄─ Email worker sends failure notification
   │
9. Wait for next retry date (exponential backoff)
   │
10. Guest updates payment method via UpdatePaymentMethodModal
    │
11. Repeat from step 1 on next cron run
```

### Data Flow: Partner Payout Scenario

```
1. Partner requests payout (min 1000 points)
   │
2. Create PartnerPayout (status: PENDING)
   │
3. Admin approves (status: APPROVED) - or auto-approve for verified
   │
4. Weekly cron job (batch-partner-payouts)
   │
5. Verify partner.stripeConnectPayoutsEnabled
   │
6. Check platform balance >= total payout amount
   │
7. Stripe Transfer.create() to Connected Account
   │
8. Update PartnerPayout (status: PROCESSING, stripeTransferId)
   │
9. ◄─ Webhook: transfer.created
   │
10. Update PartnerPayout (status: COMPLETED)
    │
11. Send partner notification email
```

---

## 6. Failure Scenario Handling

### Webhook Processing Failure

| Failure Type | Detection | Recovery |
|--------------|-----------|----------|
| Signature invalid | Immediate (HTTP 400) | Stripe auto-retries |
| Lock acquisition failed | Immediate | Return 200, other worker handles |
| DB write failed | Exception caught | Release lock, Stripe retries |
| Handler threw error | Exception caught | Log, release lock, Stripe retries |
| Worker timeout | Lock TTL expires | Another worker can acquire |

### Payment Failure Escalation

| Retry Count | Days Since Due | Action |
|-------------|----------------|--------|
| 1 | +1 day | Email: "Payment failed, we'll retry tomorrow" |
| 2 | +4 days | Email + SMS: "Payment failed, final attempts coming" |
| 3 | +11 days | Email + SMS: "Final retry scheduled for {date}" |
| 4 (final) | +18 days | Email + SMS + Admin Alert: "Manual intervention required" |

### Email Delivery Failure

| Failure Type | Retry Strategy | Final Action |
|--------------|----------------|--------------|
| Rate limited (429) | Exponential backoff, max 3 retries | Re-queue with delay |
| Server error (5xx) | Immediate retry, max 3 | Mark failed, alert admin |
| Invalid email (400) | No retry | Mark bounced, update user |
| Timeout | Retry once | Mark failed, log |

---

## 7. Recommended Database Schema Additions

```prisma
// Additions to existing schema

// For payment state machine audit trail
model PaymentStateTransition {
  id              String   @id @default(cuid())
  paymentRecordId String
  paymentRecord   PaymentRecord @relation(fields: [paymentRecordId], references: [id])

  fromState       String   // 'PENDING', 'CHARGING', etc.
  toState         String
  trigger         String   // 'DUE_DATE', 'CHARGE_SUCCESS', 'CHARGE_FAILED_TRANSIENT', etc.

  metadata        Json?    // Error codes, Stripe details, etc.
  createdAt       DateTime @default(now())

  @@index([paymentRecordId])
  @@index([createdAt])
}

// For email queue tracking (extends existing EmailSend)
// Add these fields to EmailSend:
//   queuedAt      DateTime?
//   processingAt  DateTime?
//   retryCount    Int @default(0)
//   maxRetries    Int @default(3)
//   priority      String @default("normal") // 'high', 'normal', 'low'
```

---

## 8. Implementation Priority

### Phase 1: Webhook Hardening (Week 1)
1. Implement Redis-based distributed lock for webhooks
2. Add idempotency checks in DB operations
3. Test with Stripe CLI webhook forwarding

### Phase 2: Payment State Machine (Week 2)
1. Formalize state machine with transitions
2. Add PaymentStateTransition audit model
3. Enhance notification flow per state

### Phase 3: Email Queue (Week 3)
1. Implement Redis Streams-based queue
2. Add cron job for queue processing
3. Update non-critical emails to use queue

### Phase 4: Partner Payouts Batch Processing (Week 4)
1. Add APPROVED status to payout workflow
2. Implement weekly batch payout cron job
3. Add admin payout management UI

---

## Sources

- Stripe Webhook Best Practices: https://docs.stripe.com/webhooks/best-practices (HIGH confidence)
- Stripe Idempotency: https://docs.stripe.com/webhooks/process-undelivered-events (HIGH confidence)
- Stripe Connect Destination Charges: https://docs.stripe.com/connect/destination-charges (HIGH confidence)
- Upstash Redis Streams: https://github.com/upstash/redis-js (HIGH confidence)
- Upstash Distributed Locks: Context7 documentation (HIGH confidence)
- Existing codebase analysis: `app/api/webhooks/stripe/route.ts`, `lib/payments/`, `lib/stripe/` (HIGH confidence)
