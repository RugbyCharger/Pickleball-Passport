# Installment Payment Cron Job Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build automated cron job to charge scheduled installment payments with retry logic

**Architecture:** Daily cron job queries due PaymentRecords, creates Stripe off-session payment intents with idempotency keys, relies on existing webhook handler (Phase 6) to update PaymentRecord status. Retry logic uses exponential backoff (1d, 3d, 7d). Customer emails for failures, admin alerts for permanent failures only.

**Tech Stack:** Next.js 15 App Router, Prisma, PostgreSQL, Stripe API, SendGrid, Vercel Cron

---

## Task 1: Database Schema - Add Retry Fields

**Files:**
- Modify: `prisma/schema.prisma:505-531` (PaymentRecord model)

**Step 1: Add retry tracking fields to PaymentRecord model**

Open `prisma/schema.prisma` and locate the PaymentRecord model (around line 505). Add three new fields after `stripePaymentIntentId`:

```prisma
model PaymentRecord {
  id        String              @id @default(cuid())
  bookingId String
  booking   Booking             @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  // Amount and Status
  amountCents Int                 // Payment amount in cents
  status      PaymentRecordStatus @default(PENDING)

  // Installment Details
  dueDate            DateTime  // When this payment is due
  paidDate           DateTime? // When payment was completed
  percentage         Int?      // Percentage of total (50, 25, 15, 10)
  installmentNumber  Int?      // Which installment (1, 2, 3, 4)

  // Stripe Integration
  stripePaymentIntentId String? @unique // Stripe payment intent for this installment

  // E4-S6 Phase 8: Retry Logic
  retryCount     Int      @default(0)  // Track retry attempts (0-3)
  lastAttemptAt  DateTime?             // When last charge was attempted
  failureReason  String?               // Stripe error message for debugging

  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([bookingId])
  @@index([status])
  @@index([dueDate])
  @@index([stripePaymentIntentId])
}
```

**Step 2: Generate and run the migration**

Run:
```bash
npx prisma migrate dev --name add_retry_fields_to_payment_record
```

Expected output: Migration file created and applied successfully

**Step 3: Verify migration was created**

Run:
```bash
ls -la prisma/migrations/ | tail -5
```

Expected: New migration folder with timestamp and name `add_retry_fields_to_payment_record`

**Step 4: Commit schema changes**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(E4-S6): Add retry tracking fields to PaymentRecord

- Add retryCount field (default 0, tracks attempts 0-3)
- Add lastAttemptAt field (timestamp of last charge attempt)
- Add failureReason field (stores Stripe error for debugging)

Phase 8: Database schema for installment retry logic

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Retry Calculator Utility

**Files:**
- Create: `lib/payments/retry-calculator.ts`

**Step 1: Create retry calculator with date calculations**

```typescript
/**
 * Retry Calculator for Failed Installment Payments
 * E4-S6 Phase 8
 *
 * Implements exponential backoff retry strategy:
 * - Attempt 1: On due date
 * - Attempt 2: +1 day after failure
 * - Attempt 3: +3 days after attempt 2
 * - Attempt 4: +7 days after attempt 3
 */

import { addDays } from 'date-fns'

/**
 * Calculate the next retry date based on current retry count
 *
 * @param lastAttemptDate - When the last attempt was made
 * @param currentRetryCount - Current retry count (0-3)
 * @returns Next retry date, or null if max retries exceeded
 */
export function getNextRetryDate(
  lastAttemptDate: Date,
  currentRetryCount: number
): Date | null {
  if (currentRetryCount >= 4) {
    return null // Max retries exceeded
  }

  // Exponential backoff: 1, 3, 7 days
  const daysToAdd = currentRetryCount === 1 ? 1 : currentRetryCount === 2 ? 3 : 7

  return addDays(lastAttemptDate, daysToAdd)
}

/**
 * Check if a payment is eligible for retry based on last attempt time
 *
 * @param lastAttemptDate - When the last attempt was made
 * @param currentRetryCount - Current retry count (1-3)
 * @param now - Current timestamp (defaults to now)
 * @returns True if payment should be retried
 */
export function isRetryEligible(
  lastAttemptDate: Date,
  currentRetryCount: number,
  now: Date = new Date()
): boolean {
  if (currentRetryCount === 0 || currentRetryCount >= 4) {
    return false // First attempt or max retries
  }

  const nextRetryDate = getNextRetryDate(lastAttemptDate, currentRetryCount)
  if (!nextRetryDate) {
    return false
  }

  return now >= nextRetryDate
}

/**
 * Categorize Stripe errors as transient (retry) or permanent (no retry)
 *
 * @param errorCode - Stripe error code
 * @returns True if error is transient and should be retried
 */
export function isTransientError(errorCode: string): boolean {
  const transientErrors = [
    'card_declined',
    'insufficient_funds',
    'expired_card',
    'authentication_required',
    'processing_error',
    'card_velocity_exceeded',
  ]

  return transientErrors.includes(errorCode)
}

/**
 * Categorize errors as permanent (should not retry)
 */
export function isPermanentError(errorCode: string): boolean {
  const permanentErrors = [
    'customer_not_found',
    'payment_method_not_found',
    'invalid_request',
    'card_not_supported',
  ]

  return permanentErrors.includes(errorCode)
}

/**
 * Format retry schedule for customer email
 *
 * @param retryCount - Current retry attempt (1-3)
 * @param lastAttemptDate - When last attempt was made
 * @returns Human-readable next retry date
 */
export function formatNextRetryDate(
  retryCount: number,
  lastAttemptDate: Date
): string {
  const nextDate = getNextRetryDate(lastAttemptDate, retryCount)

  if (!nextDate) {
    return 'No further automatic retries'
  }

  return nextDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
```

**Step 2: Commit retry calculator**

```bash
git add lib/payments/retry-calculator.ts
git commit -m "feat(E4-S6): Add retry calculator utility

Exponential backoff: 1 day, 3 days, 7 days
Error categorization: transient vs permanent
Date formatting for customer emails

Phase 8: Retry logic foundation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Email Template - Payment Reminder

**Files:**
- Create: `lib/email/templates/installment-payment-reminder.ts`

**Step 1: Create customer-facing payment reminder template**

```typescript
/**
 * Installment Payment Reminder Email Template
 * E4-S6 Phase 8
 *
 * Sent when an installment payment fails (attempts 1-3)
 * Friendly tone, includes retry schedule and help info
 */

import { baseEmailTemplate, generatePlainText } from './base'

export interface InstallmentReminderData {
  // Guest details
  firstName: string
  email: string

  // Booking info
  bookingReference: string
  packageName: string
  tripStartDate: string // ISO date string

  // Payment details
  installmentNumber: number // 2, 3, or 4
  installmentAmount: number // In cents
  dueDate: string // ISO date string

  // Retry info
  attemptNumber: number // 1, 2, 3
  nextRetryDate: string // Formatted date like "Monday, January 20, 2026"
  failureReason?: string // Optional user-friendly reason

  // Links
  updatePaymentUrl: string // Link to dashboard to update payment method
}

/**
 * Format currency in USD
 */
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get user-friendly failure reason
 */
function getFriendlyReason(reason?: string): string {
  if (!reason) return 'Your payment could not be processed'

  const reasonMap: Record<string, string> = {
    card_declined: 'Your card was declined',
    insufficient_funds: 'Insufficient funds were available',
    expired_card: 'Your card has expired',
    authentication_required: 'Additional authentication is required',
  }

  return reasonMap[reason] || 'Your payment could not be processed'
}

export function generateInstallmentReminderEmail(
  data: InstallmentReminderData
): {
  html: string
  text: string
  subject: string
} {
  const content = `
    <h1>Payment Reminder: Installment Due 📅</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      We wanted to let you know that we were unable to process your recent installment payment
      for your upcoming Pickleball Passport trip.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 12px 0; color: #92400e; font-weight: 600; font-size: 16px;">
        ⚠️ Payment Attempt Unsuccessful
      </p>
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        ${getFriendlyReason(data.failureReason)}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Payment Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.packageName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Installment:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.installmentNumber} of 4</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Due:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 18px; text-align: right;">${formatCurrency(data.installmentAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Original Due Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatDate(data.dueDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Trip Start Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatDate(data.tripStartDate)}</td>
        </tr>
      </table>
    </div>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        🔄 Automatic Retry Scheduled
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        We'll automatically try to process this payment again on <strong>${data.nextRetryDate}</strong>.
        No action is needed unless you'd like to update your payment method.
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ What You Can Do</h2>

    <p>
      If you'd like to update your payment method or ensure sufficient funds are available,
      you can manage your payment settings in your dashboard:
    </p>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.updatePaymentUrl}" class="button">
        Update Payment Method
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">
        💡 Common Solutions
      </p>
      <ul style="margin: 8px 0; padding-left: 20px; color: #166534; font-size: 14px;">
        <li>Ensure your card has not expired</li>
        <li>Verify sufficient funds are available</li>
        <li>Contact your bank to authorize the charge</li>
        <li>Update to a different payment method if needed</li>
      </ul>
    </div>

    <p>
      If you have any questions or need assistance, please don't hesitate to reach out.
      We're here to help ensure your trip goes smoothly!
    </p>

    <p>
      Thank you for your attention to this matter.<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `

  const html = baseEmailTemplate({
    title: 'Payment Reminder - Pickleball Passport',
    content,
    preheader: `Installment payment reminder - ${formatCurrency(data.installmentAmount)} due`,
    footerText: `This is a payment reminder for your Pickleball Passport booking.`,
  })

  const text = generatePlainText(content)

  return {
    html,
    text,
    subject: `Payment Reminder: Installment ${data.installmentNumber} - ${data.bookingReference}`,
  }
}
```

**Step 2: Commit email template**

```bash
git add lib/email/templates/installment-payment-reminder.ts
git commit -m "feat(E4-S6): Add installment payment reminder email

Friendly customer-facing template for failed payments
Includes retry schedule and update payment link
Common solutions section for self-service

Phase 8: Customer notification

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Email Template - Admin Alert

**Files:**
- Create: `lib/email/templates/installment-failure-admin.ts`

**Step 1: Create admin alert template for permanent failures**

```typescript
/**
 * Installment Payment Failure Admin Alert
 * E4-S6 Phase 8
 *
 * Sent to admin after 4th failed payment attempt
 * Includes full context for manual follow-up
 */

import { baseEmailTemplate, generatePlainText } from './base'

export interface InstallmentFailureAdminData {
  // Guest details
  customerName: string
  customerEmail: string
  customerPhone?: string

  // Booking info
  bookingReference: string
  bookingId: string
  packageName: string
  tripStartDate: string // ISO date string
  tripName: string

  // Payment details
  installmentNumber: number // 2, 3, or 4
  installmentAmount: number // In cents
  originalDueDate: string // ISO date string

  // Failure history
  attempts: Array<{
    attemptNumber: number
    attemptDate: string // ISO date
    errorCode: string
    errorMessage: string
  }>

  // Links
  bookingAdminUrl: string // Link to admin dashboard
  customerDashboardUrl: string // Link customers use
}

/**
 * Format currency in USD
 */
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function generateInstallmentFailureAdminEmail(
  data: InstallmentFailureAdminData
): {
  html: string
  text: string
  subject: string
} {
  const content = `
    <h1>🚨 Installment Payment Failed - Manual Intervention Required</h1>

    <p>
      An installment payment has failed after <strong>4 automatic retry attempts</strong> and requires manual follow-up.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: #fee2e2; border-radius: 12px; border-left: 4px solid #dc2626;">
      <p style="margin: 0 0 8px 0; color: #991b1b; font-weight: 600; font-size: 16px;">
        ⚠️ Payment Permanently Failed
      </p>
      <p style="margin: 0; color: #991b1b; font-size: 14px;">
        All automatic retry attempts have been exhausted. Manual intervention is required.
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">👤 Customer Information</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Name:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">
            <a href="mailto:${data.customerEmail}" style="color: #2563eb; text-decoration: none;">${data.customerEmail}</a>
          </td>
        </tr>
        ${data.customerPhone ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Phone:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">
            <a href="tel:${data.customerPhone}" style="color: #2563eb; text-decoration: none;">${data.customerPhone}</a>
          </td>
        </tr>
        ` : ''}
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Booking Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.packageName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Trip:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.tripName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Trip Start Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${formatDate(data.tripStartDate)}</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">💰 Payment Information</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Installment:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.installmentNumber} of 4</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
          <td style="padding: 8px 0; color: #dc2626; font-weight: bold; font-size: 18px;">${formatCurrency(data.installmentAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Original Due Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${formatDate(data.originalDueDate)}</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📊 Failure History</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: left; font-weight: 600;">Attempt</th>
            <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: left; font-weight: 600;">Date</th>
            <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: left; font-weight: 600;">Error</th>
          </tr>
        </thead>
        <tbody>
          ${data.attempts.map((attempt) => `
          <tr>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">#${attempt.attemptNumber}</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">${formatDate(attempt.attemptDate)}</td>
            <td style="padding: 8px 0; color: #dc2626; font-size: 14px; font-family: monospace;">
              ${attempt.errorCode}<br>
              <span style="color: #6b7280; font-size: 12px;">${attempt.errorMessage}</span>
            </td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ Recommended Actions</h2>

    <ol style="color: #374151; font-size: 14px; line-height: 1.6;">
      <li><strong>Contact Customer:</strong> Reach out via email or phone to discuss payment options</li>
      <li><strong>Verify Payment Method:</strong> Confirm if card is expired or has issues</li>
      <li><strong>Offer Alternative Payment:</strong> Manual invoice, bank transfer, or different card</li>
      <li><strong>Review Booking Status:</strong> Decide whether to cancel or extend payment deadline</li>
      <li><strong>Update Admin Dashboard:</strong> Mark as resolved once handled</li>
    </ol>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.bookingAdminUrl}" class="button">
        View Booking in Admin Dashboard
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        💡 Customer Dashboard Link
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        Share this link with the customer to update their payment method:<br>
        <a href="${data.customerDashboardUrl}" style="color: #2563eb; word-break: break-all;">${data.customerDashboardUrl}</a>
      </p>
    </div>

    <p>
      <strong>Pickleball Passport Admin System</strong> 🏓
    </p>
  `

  const html = baseEmailTemplate({
    title: 'Installment Payment Failed - Admin Alert',
    content,
    preheader: `${data.bookingReference} - Installment ${data.installmentNumber} failed after 4 attempts`,
    footerText: `This is an automated admin alert from Pickleball Passport.`,
  })

  const text = generatePlainText(content)

  return {
    html,
    text,
    subject: `🚨 Payment Failed: ${data.bookingReference} - Installment ${data.installmentNumber}`,
  }
}
```

**Step 2: Commit admin email template**

```bash
git add lib/email/templates/installment-failure-admin.ts
git commit -m "feat(E4-S6): Add admin alert for failed installments

Comprehensive admin alert with failure history
Customer contact info and recommended actions
Only sent after 4th failed attempt

Phase 8: Admin notification

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Core Payment Charging Logic

**Files:**
- Create: `lib/payments/charge-installment.ts`

**Step 1: Create charge installment function with error handling**

```typescript
/**
 * Charge Installment Payment
 * E4-S6 Phase 8
 *
 * Core logic for charging an installment payment via Stripe
 * Handles off-session payment intents with idempotency
 */

import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe/get-stripe'
import { isTransientError, isPermanentError, getNextRetryDate } from './retry-calculator'
import { sendEmail } from '@/lib/email/send-email'
import { generateInstallmentReminderEmail } from '@/lib/email/templates/installment-payment-reminder'
import { generateInstallmentFailureAdminEmail } from '@/lib/email/templates/installment-failure-admin'

export interface ChargeInstallmentInput {
  paymentRecordId: string
}

export interface ChargeInstallmentResult {
  success: boolean
  paymentRecordId: string
  stripePaymentIntentId?: string
  errorCode?: string
  errorMessage?: string
  shouldRetry: boolean
  isPermanentFailure: boolean
}

/**
 * Charge an installment payment using Stripe off-session payment intent
 *
 * @param input - Payment record ID to charge
 * @returns Result object with success status and error info
 */
export async function chargeInstallment(
  input: ChargeInstallmentInput
): Promise<ChargeInstallmentResult> {
  const stripe = getStripe()

  try {
    // Fetch payment record with related booking data
    const paymentRecord = await prisma.paymentRecord.findUnique({
      where: { id: input.paymentRecordId },
      include: {
        booking: {
          include: {
            user: true,
            trip: true,
            package: true,
          },
        },
      },
    })

    if (!paymentRecord) {
      console.error(`PaymentRecord not found: ${input.paymentRecordId}`)
      return {
        success: false,
        paymentRecordId: input.paymentRecordId,
        errorCode: 'payment_record_not_found',
        errorMessage: 'Payment record not found',
        shouldRetry: false,
        isPermanentFailure: true,
      }
    }

    const { booking } = paymentRecord

    // Skip if booking is cancelled
    if (booking.status === 'CANCELLED') {
      console.log(`Skipping payment for cancelled booking: ${booking.bookingReference}`)
      return {
        success: false,
        paymentRecordId: input.paymentRecordId,
        errorCode: 'booking_cancelled',
        errorMessage: 'Booking is cancelled',
        shouldRetry: false,
        isPermanentFailure: true,
      }
    }

    // Verify Stripe customer exists
    if (!booking.stripeCustomerId) {
      console.error(`No Stripe customer for booking: ${booking.bookingReference}`)

      // Send admin alert
      await sendAdminAlert(paymentRecord, 'customer_not_found', 'No Stripe customer ID found')

      return {
        success: false,
        paymentRecordId: input.paymentRecordId,
        errorCode: 'customer_not_found',
        errorMessage: 'No Stripe customer ID',
        shouldRetry: false,
        isPermanentFailure: true,
      }
    }

    // Create idempotency key
    const idempotencyKey = `installment-${paymentRecord.id}-${paymentRecord.retryCount}-${paymentRecord.dueDate.toISOString().split('T')[0]}`

    console.log(`Charging installment: ${booking.bookingReference} - Installment ${paymentRecord.installmentNumber}`)

    // Create payment intent with off_session confirmation
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentRecord.amountCents,
      currency: 'usd',
      customer: booking.stripeCustomerId,
      confirm: true,
      off_session: true,
      description: `Installment ${paymentRecord.installmentNumber} - ${booking.bookingReference}`,
      metadata: {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        paymentRecordId: paymentRecord.id,
        installmentNumber: paymentRecord.installmentNumber?.toString() || '',
        installmentOf: '4',
      },
    }, {
      idempotencyKey,
    })

    // Update payment record with payment intent ID and attempt info
    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        lastAttemptAt: new Date(),
      },
    })

    console.log(`Payment intent created: ${paymentIntent.id} for ${booking.bookingReference}`)

    // Webhook will handle status update (Phase 6)
    return {
      success: true,
      paymentRecordId: paymentRecord.id,
      stripePaymentIntentId: paymentIntent.id,
      shouldRetry: false,
      isPermanentFailure: false,
    }
  } catch (error) {
    console.error(`Error charging installment ${input.paymentRecordId}:`, error)

    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      const errorCode = error.code || 'unknown'
      const errorMessage = error.message

      // Determine if error is transient or permanent
      const isTransient = isTransientError(errorCode)
      const isPermanent = isPermanentError(errorCode)

      // Update payment record with failure info
      const paymentRecord = await prisma.paymentRecord.findUnique({
        where: { id: input.paymentRecordId },
        include: {
          booking: {
            include: {
              user: true,
              trip: true,
              package: true,
            },
          },
        },
      })

      if (paymentRecord) {
        const newRetryCount = paymentRecord.retryCount + 1
        const isLastAttempt = newRetryCount >= 4

        // Update retry count and failure reason
        await prisma.paymentRecord.update({
          where: { id: paymentRecord.id },
          data: {
            retryCount: newRetryCount,
            lastAttemptAt: new Date(),
            failureReason: errorCode,
            // Mark as FAILED if permanent error or max retries reached
            ...(isPermanent || isLastAttempt ? { status: 'FAILED' } : {}),
          },
        })

        // Send customer reminder email (if transient and not last attempt)
        if (isTransient && !isLastAttempt) {
          await sendCustomerReminder(paymentRecord, newRetryCount)
        }

        // Send admin alert if permanent failure or max retries
        if (isPermanent || isLastAttempt) {
          await sendAdminAlert(paymentRecord, errorCode, errorMessage)
        }
      }

      return {
        success: false,
        paymentRecordId: input.paymentRecordId,
        errorCode,
        errorMessage,
        shouldRetry: isTransient,
        isPermanentFailure: isPermanent,
      }
    }

    // Unknown error - don't update payment record, will retry on next cron run
    return {
      success: false,
      paymentRecordId: input.paymentRecordId,
      errorCode: 'unknown_error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      shouldRetry: false,
      isPermanentFailure: false,
    }
  }
}

/**
 * Send customer reminder email for failed payment
 */
async function sendCustomerReminder(
  paymentRecord: any,
  newRetryCount: number
): Promise<void> {
  try {
    const { booking } = paymentRecord
    const user = booking.user

    const nextRetryDate = getNextRetryDate(new Date(), newRetryCount)
    if (!nextRetryDate) return

    const emailData = {
      firstName: user.firstName || 'Guest',
      email: user.emailAddresses?.[0]?.emailAddress || booking.guestEmail || '',
      bookingReference: booking.bookingReference,
      packageName: booking.package.name,
      tripStartDate: booking.trip?.startDate?.toISOString() || '',
      installmentNumber: paymentRecord.installmentNumber || 0,
      installmentAmount: paymentRecord.amountCents,
      dueDate: paymentRecord.dueDate.toISOString(),
      attemptNumber: newRetryCount,
      nextRetryDate: nextRetryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      failureReason: paymentRecord.failureReason,
      updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${booking.id}`,
    }

    const { html, text, subject } = generateInstallmentReminderEmail(emailData)

    await sendEmail({
      to: emailData.email,
      subject,
      html,
      text,
    })

    console.log(`Customer reminder sent to ${emailData.email}`)
  } catch (error) {
    console.error('Error sending customer reminder:', error)
    // Don't throw - email failure shouldn't break payment processing
  }
}

/**
 * Send admin alert for permanently failed payment
 */
async function sendAdminAlert(
  paymentRecord: any,
  errorCode: string,
  errorMessage: string
): Promise<void> {
  try {
    const { booking } = paymentRecord
    const user = booking.user

    // Collect attempt history
    const attempts = []
    for (let i = 1; i <= paymentRecord.retryCount; i++) {
      attempts.push({
        attemptNumber: i,
        attemptDate: paymentRecord.lastAttemptAt?.toISOString() || new Date().toISOString(),
        errorCode: paymentRecord.failureReason || errorCode,
        errorMessage: errorMessage,
      })
    }

    const emailData = {
      customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      customerEmail: user.emailAddresses?.[0]?.emailAddress || booking.guestEmail || '',
      customerPhone: user.phone,
      bookingReference: booking.bookingReference,
      bookingId: booking.id,
      packageName: booking.package.name,
      tripStartDate: booking.trip?.startDate?.toISOString() || '',
      tripName: booking.trip?.name || 'Unknown Trip',
      installmentNumber: paymentRecord.installmentNumber || 0,
      installmentAmount: paymentRecord.amountCents,
      originalDueDate: paymentRecord.dueDate.toISOString(),
      attempts,
      bookingAdminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings/${booking.id}`,
      customerDashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${booking.id}`,
    }

    const { html, text, subject } = generateInstallmentFailureAdminEmail(emailData)

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pickleballpassport.com'

    await sendEmail({
      to: adminEmail,
      subject,
      html,
      text,
    })

    console.log(`Admin alert sent to ${adminEmail}`)
  } catch (error) {
    console.error('Error sending admin alert:', error)
    // Don't throw - email failure shouldn't break payment processing
  }
}
```

**Step 2: Commit charge installment logic**

```bash
git add lib/payments/charge-installment.ts
git commit -m "feat(E4-S6): Add charge installment payment logic

Off-session Stripe payment intent with idempotency
Error categorization and retry eligibility
Customer reminders and admin alerts
Integrates with Phase 6 webhook handler

Phase 8: Core payment charging

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Cron Job Route Handler

**Files:**
- Create: `app/api/cron/charge-installments/route.ts`

**Step 1: Create cron endpoint with authentication and batch processing**

```typescript
/**
 * Charge Installments Cron Job
 * E4-S6 Phase 8
 *
 * Daily cron job (9 AM UTC) that charges due installment payments
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { chargeInstallment } from '@/lib/payments/charge-installment'
import { isRetryEligible } from '@/lib/payments/retry-calculator'

// Maximum payments to process per execution (safety limit)
const MAX_PAYMENTS_PER_RUN = 100

// Batch size for processing (rate limiting)
const BATCH_SIZE = 10

// Delay between batches (milliseconds)
const BATCH_DELAY_MS = 1000

/**
 * GET /api/cron/charge-installments
 *
 * Cron job endpoint - secured with CRON_SECRET
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()

  // 1. Verify authorization
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET not configured')
    return NextResponse.json(
      { error: 'Cron job not configured' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('Unauthorized cron request')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('=== Charge Installments Cron Job Started ===')

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Start of day

    // 2. Find all due payments (new + retry eligible)
    const duePayments = await prisma.paymentRecord.findMany({
      where: {
        status: 'PENDING',
        OR: [
          // New payments due today or overdue
          {
            dueDate: { lte: today },
            retryCount: 0,
          },
          // Failed payments ready for retry (attempts 1-3)
          {
            retryCount: { gte: 1, lt: 4 },
            lastAttemptAt: { not: null },
          },
        ],
      },
      include: {
        booking: {
          include: {
            user: true,
            trip: true,
            package: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc', // Process oldest first
      },
      take: MAX_PAYMENTS_PER_RUN,
    })

    console.log(`Found ${duePayments.length} payments to process`)

    // Filter out payments not yet eligible for retry
    const eligiblePayments = duePayments.filter((payment) => {
      if (payment.retryCount === 0) {
        return true // New payment
      }

      if (!payment.lastAttemptAt) {
        return false // Missing attempt date
      }

      return isRetryEligible(payment.lastAttemptAt, payment.retryCount, today)
    })

    console.log(`${eligiblePayments.length} payments are eligible for charging`)

    // 3. Process payments in batches
    const results: Array<{
      paymentRecordId: string
      bookingReference: string
      installmentNumber: number
      amountCents: number
      result: 'success' | 'failed_retry' | 'failed_permanent' | 'error'
      errorCode?: string
      stripePaymentIntentId?: string
    }> = []

    let successCount = 0
    let failedRetryCount = 0
    let failedPermanentCount = 0
    let errorCount = 0

    for (let i = 0; i < eligiblePayments.length; i += BATCH_SIZE) {
      const batch = eligiblePayments.slice(i, i + BATCH_SIZE)

      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} payments)`)

      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map(async (payment) => {
          try {
            const result = await chargeInstallment({
              paymentRecordId: payment.id,
            })

            let resultType: 'success' | 'failed_retry' | 'failed_permanent' | 'error'
            if (result.success) {
              resultType = 'success'
              successCount++
            } else if (result.isPermanentFailure) {
              resultType = 'failed_permanent'
              failedPermanentCount++
            } else if (result.shouldRetry) {
              resultType = 'failed_retry'
              failedRetryCount++
            } else {
              resultType = 'error'
              errorCount++
            }

            return {
              paymentRecordId: payment.id,
              bookingReference: payment.booking.bookingReference,
              installmentNumber: payment.installmentNumber || 0,
              amountCents: payment.amountCents,
              result: resultType,
              errorCode: result.errorCode,
              stripePaymentIntentId: result.stripePaymentIntentId,
            }
          } catch (error) {
            console.error(`Unexpected error processing payment ${payment.id}:`, error)
            errorCount++

            return {
              paymentRecordId: payment.id,
              bookingReference: payment.booking.bookingReference,
              installmentNumber: payment.installmentNumber || 0,
              amountCents: payment.amountCents,
              result: 'error' as const,
              errorCode: 'unexpected_error',
            }
          }
        })
      )

      results.push(...batchResults)

      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < eligiblePayments.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
      }
    }

    const executionTimeMs = Date.now() - startTime

    // 4. Log summary
    console.log('=== Cron Job Summary ===')
    console.log(`Total found: ${duePayments.length}`)
    console.log(`Total eligible: ${eligiblePayments.length}`)
    console.log(`Successful: ${successCount}`)
    console.log(`Failed (retry scheduled): ${failedRetryCount}`)
    console.log(`Failed (permanent): ${failedPermanentCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log(`Execution time: ${executionTimeMs}ms`)
    console.log('=== Cron Job Complete ===')

    // 5. Return summary
    return NextResponse.json({
      processedAt: new Date().toISOString(),
      totalFound: duePayments.length,
      totalEligible: eligiblePayments.length,
      successful: successCount,
      failedRetry: failedRetryCount,
      failedPermanent: failedPermanentCount,
      errors: errorCount,
      executionTimeMs,
      results,
    })
  } catch (error) {
    console.error('Fatal error in cron job:', error)

    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit cron route handler**

```bash
git add app/api/cron/charge-installments/route.ts
git commit -m "feat(E4-S6): Add cron job route handler

Daily execution at 9 AM UTC
Authentication with CRON_SECRET
Batch processing with rate limiting
Comprehensive execution logging

Phase 8: Cron job implementation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Update Vercel Cron Configuration

**Files:**
- Modify: `vercel.json:1-8`

**Step 1: Add installment charging cron to vercel.json**

Replace the entire vercel.json content with:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-scheduled-gifts",
      "schedule": "0 16 * * *"
    },
    {
      "path": "/api/cron/charge-installments",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Step 2: Commit vercel.json update**

```bash
git add vercel.json
git commit -m "feat(E4-S6): Add installment charging to Vercel cron

Schedule: Daily at 9:00 AM UTC
Endpoint: /api/cron/charge-installments

Phase 8: Cron configuration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Environment Variables Documentation

**Files:**
- Create: `docs/env-setup-phase8.md`

**Step 1: Document required environment variables**

```markdown
# Phase 8 Environment Variables

## Required for Cron Job

Add the following environment variable to Vercel project settings:

### CRON_SECRET

**Description**: Secret token used to authenticate cron job requests

**Required**: Yes (production and preview)

**Value**: Generate a secure random string (32+ characters)

**Example**:
\`\`\`
CRON_SECRET=your-super-secure-random-string-here-32chars
\`\`\`

**How to generate**:
\`\`\`bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
\`\`\`

---

## Optional (Already Configured)

These should already be set up from previous phases:

### ADMIN_EMAIL

**Description**: Email address to receive admin alerts for failed payments

**Default**: `admin@pickleballpassport.com`

**Example**:
\`\`\`
ADMIN_EMAIL=your-admin-email@example.com
\`\`\`

### NEXT_PUBLIC_APP_URL

**Description**: Base URL of the application (for email links)

**Required**: Yes

**Example**:
\`\`\`
NEXT_PUBLIC_APP_URL=https://pickleballpassport.com
\`\`\`

---

## Vercel Setup Instructions

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add `CRON_SECRET` for all environments (Production, Preview, Development)
4. Click **Save**
5. Redeploy the application for changes to take effect

---

## Local Development

For local testing, add to `.env.local`:

\`\`\`
CRON_SECRET=local-development-secret-for-testing
ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

**Note**: `.env.local` is gitignored and should never be committed.

---

## Testing the Cron Job Locally

\`\`\`bash
# Call the endpoint with authorization header
curl -H "Authorization: Bearer local-development-secret-for-testing" \
  http://localhost:3000/api/cron/charge-installments
\`\`\`

Expected response: JSON summary with processed payments
\`\`\`
```

**Step 2: Commit environment docs**

```bash
git add docs/env-setup-phase8.md
git commit -m "docs(E4-S6): Add Phase 8 environment setup guide

CRON_SECRET configuration instructions
Vercel setup steps
Local testing guide

Phase 8: Documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Testing Guide

**Files:**
- Create: `docs/testing-phase8.md`

**Step 1: Create comprehensive testing guide**

```markdown
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

\`\`\`sql
UPDATE "PaymentRecord"
SET "dueDate" = CURRENT_DATE
WHERE "bookingId" = 'your-test-booking-id'
  AND "installmentNumber" = 2
  AND "status" = 'PENDING';
\`\`\`

**Execute:**

\`\`\`bash
curl -H "Authorization: Bearer local-development-secret-for-testing" \
  http://localhost:3000/api/cron/charge-installments
\`\`\`

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

\`\`\`bash
curl -H "Authorization: Bearer local-development-secret-for-testing" \
  http://localhost:3000/api/cron/charge-installments
\`\`\`

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

\`\`\`sql
UPDATE "PaymentRecord"
SET "retryCount" = 3,
    "lastAttemptAt" = CURRENT_DATE - INTERVAL '7 days',
    "dueDate" = CURRENT_DATE - INTERVAL '11 days'
WHERE "bookingId" = 'your-test-booking-id'
  AND "installmentNumber" = 2;
\`\`\`

**Execute:**

\`\`\`bash
curl -H "Authorization: Bearer local-development-secret-for-testing" \
  http://localhost:3000/api/cron/charge-installments
\`\`\`

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

\`\`\`sql
-- Not yet eligible (last attempt yesterday, needs 1 day)
UPDATE "PaymentRecord" SET "retryCount" = 1, "lastAttemptAt" = CURRENT_DATE - INTERVAL '12 hours';

-- Eligible (last attempt 2 days ago, retry count 1)
UPDATE "PaymentRecord" SET "retryCount" = 1, "lastAttemptAt" = CURRENT_DATE - INTERVAL '2 days';

-- Not yet eligible (last attempt 2 days ago, needs 3 days for retry 2)
UPDATE "PaymentRecord" SET "retryCount" = 2, "lastAttemptAt" = CURRENT_DATE - INTERVAL '2 days';

-- Eligible (last attempt 4 days ago, retry count 2)
UPDATE "PaymentRecord" SET "retryCount" = 2, "lastAttemptAt" = CURRENT_DATE - INTERVAL '4 days';
\`\`\`

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

\`\`\`sql
UPDATE "Booking"
SET "stripeCustomerId" = NULL
WHERE "id" = 'your-test-booking-id';
\`\`\`

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

\`\`\`bash
curl http://localhost:3000/api/cron/charge-installments
\`\`\`

**Expected:**
- Response: `{ "error": "Unauthorized" }`
- Status: 401

---

## Test Scenario 11: Idempotency

**Setup:**

1. Create PaymentRecord due today
2. Call cron endpoint twice quickly

**Execute:**

\`\`\`bash
curl -H "Authorization: Bearer local-development-secret-for-testing" \
  http://localhost:3000/api/cron/charge-installments

curl -H "Authorization: Bearer local-development-secret-for-testing" \
  http://localhost:3000/api/cron/charge-installments
\`\`\`

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

\`\`\`sql
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
\`\`\`

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
\`\`\`

**Step 2: Commit testing guide**

```bash
git add docs/testing-phase8.md
git commit -m "docs(E4-S6): Add comprehensive Phase 8 testing guide

11 test scenarios covering all edge cases
Manual SQL queries for setup
Stripe test cards reference
Verification steps for each scenario

Phase 8: Testing documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Final Commit & Summary

**Step 1: Create final summary commit**

```bash
git add -A
git commit -m "feat(E4-S6): Complete Phase 8 - Installment payment cron job

COMPLETE IMPLEMENTATION:

✅ Database schema: Added retry fields (retryCount, lastAttemptAt, failureReason)
✅ Retry calculator: Exponential backoff logic (1d, 3d, 7d)
✅ Email templates: Customer reminders + admin alerts
✅ Payment charging: Off-session Stripe intents with idempotency
✅ Cron job handler: Batch processing with rate limiting
✅ Vercel cron config: Daily execution at 9 AM UTC
✅ Documentation: Environment setup + testing guide

KEY FEATURES:
- Daily automated charging of installments 2, 3, 4
- Exponential backoff retry (4 attempts over 11 days)
- Customer-friendly email reminders
- Admin alerts only for permanent failures
- Idempotency keys prevent duplicate charges
- Batch processing avoids Stripe rate limits
- Integrates with Phase 6 webhook handler

FILES CREATED:
- prisma/migrations/..._add_retry_fields_to_payment_record/
- lib/payments/retry-calculator.ts
- lib/email/templates/installment-payment-reminder.ts
- lib/email/templates/installment-failure-admin.ts
- lib/payments/charge-installment.ts
- app/api/cron/charge-installments/route.ts
- docs/env-setup-phase8.md
- docs/testing-phase8.md

FILES MODIFIED:
- prisma/schema.prisma (PaymentRecord model)
- vercel.json (added cron schedule)

NEXT STEPS:
1. Set CRON_SECRET in Vercel environment variables
2. Deploy to Vercel
3. Monitor first execution via Vercel logs
4. Run test scenarios from testing guide
5. Verify webhook updates work end-to-end

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Step 2: Push all changes to GitHub**

```bash
git push origin main
```

Expected: All commits pushed successfully

---

## Summary

**Phase 8 is now complete!** 🎉

### What Was Built

1. **Database schema** - Added retry tracking fields to PaymentRecord
2. **Retry calculator** - Exponential backoff logic with error categorization
3. **Email templates** - Customer reminders and admin alerts
4. **Payment charging** - Stripe off-session payment intents with idempotency
5. **Cron job handler** - Batch processing with authentication and rate limiting
6. **Vercel configuration** - Daily cron schedule at 9 AM UTC
7. **Documentation** - Environment setup and comprehensive testing guide

### Files Created (8)
- Migration for retry fields
- `lib/payments/retry-calculator.ts`
- `lib/email/templates/installment-payment-reminder.ts`
- `lib/email/templates/installment-failure-admin.ts`
- `lib/payments/charge-installment.ts`
- `app/api/cron/charge-installments/route.ts`
- `docs/env-setup-phase8.md`
- `docs/testing-phase8.md`

### Files Modified (2)
- `prisma/schema.prisma`
- `vercel.json`

### Key Features
- ✅ Automated charging of installments 2, 3, 4
- ✅ Exponential backoff retry (1d, 3d, 7d)
- ✅ Customer-friendly email notifications
- ✅ Admin alerts for permanent failures only
- ✅ Idempotency prevents duplicate charges
- ✅ Batch processing avoids rate limits
- ✅ Integrates with Phase 6 webhook handler

### Before Deploying
1. Set `CRON_SECRET` in Vercel environment variables
2. Verify `ADMIN_EMAIL` is configured
3. Test locally using testing guide
4. Deploy to Vercel
5. Monitor first execution via logs

### Next Phases (E4-S6)
- **Phase 9**: Component testing (UI + integration)
- **Phase 10**: E2E testing (full flow validation)
