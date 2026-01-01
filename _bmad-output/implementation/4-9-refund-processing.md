# Story 4.9: Refund Processing (Admin UI)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an admin,
I want to manually process refunds for guest bookings,
So that I can handle cancellations, disputes, and exceptional cases professionally.

## Acceptance Criteria

### AC-1: Admin Refund UI Location

- [ ] Add "Process Refund" button to admin booking management view
- [ ] Available in booking details page: `/admin/bookings/[id]`
- [ ] Only visible for bookings with status `CONFIRMED` or `PENDING`
- [ ] Only visible if payment status is `SUCCEEDED`
- [ ] Disabled if refund already processed (payment status `REFUNDED`)
- [ ] Button color: Red (destructive action)
- [ ] Icon: RefundIcon or DollarSign with reverse arrow

### AC-2: Refund Dialog/Modal UI

- [ ] Open modal when "Process Refund" button clicked
- [ ] Modal title: "Process Refund - Booking {reference}"
- [ ] Display booking summary:
  - Guest name and email
  - Package name
  - Booking reference
  - Original payment amount
  - Payment date
  - Current booking status
- [ ] Warning message: "This action cannot be undone. The guest will be notified via email."
- [ ] Refund reason dropdown (required):
  - "Guest Cancellation"
  - "Medical Emergency"
  - "Trip Cancellation"
  - "Service Issue"
  - "Dispute Resolution"
  - "Other"
- [ ] Refund amount input:
  - Default: Full payment amount
  - Editable for partial refunds
  - Validation: Must be > 0 and ≤ original payment amount
  - Display as currency ($15,000.00)
- [ ] Optional notes text area (internal use only)
- [ ] Confirm checkbox: "I confirm this refund is authorized"
- [ ] Action buttons:
  - "Cancel" (secondary)
  - "Process Refund" (destructive, disabled until confirmed)

### AC-3: Refund Processing via Stripe API

- [ ] Create tRPC mutation: `admin.processRefund`
- [ ] Accept parameters:
  - `bookingId: string`
  - `amount: number` (in cents)
  - `reason: RefundReason`
  - `notes?: string`
- [ ] Verify admin authentication (Clerk role check)
- [ ] Find booking with payment details
- [ ] Validate refund eligibility:
  - Payment status is `SUCCEEDED`
  - Booking not already refunded
  - Refund amount ≤ original payment amount
- [ ] Call Stripe Refunds API:
  ```typescript
  stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
    amount: refundAmount, // in cents
    reason: 'requested_by_customer', // or appropriate Stripe reason
    metadata: {
      bookingReference: booking.bookingReference,
      adminReason: reason,
      adminNotes: notes || '',
      processedBy: adminUserId
    }
  })
  ```
- [ ] Handle Stripe API errors gracefully
- [ ] Return refund ID and status

### AC-4: Database Updates (Atomic Transaction)

- [ ] Wrap all updates in Prisma transaction
- [ ] Update Payment record:
  - Set `status` to `REFUNDED`
  - Set `refundedAmount` to refund amount
  - Set `stripeRefundId` to Stripe refund ID
  - Update `updatedAt` timestamp
- [ ] Update Booking record:
  - Set `status` to `CANCELLED` (if full refund)
  - Keep `CONFIRMED` if partial refund
  - Update `updatedAt` timestamp
- [ ] If booking has Trip assigned:
  - Decrement `trip.currentBookings` by 1 (atomic operation)
  - Only if full refund and booking was CONFIRMED
- [ ] Create Admin Activity Log:
  - Action: "REFUND_PROCESSED"
  - Admin user ID
  - Booking reference
  - Refund amount
  - Reason and notes
  - Timestamp
- [ ] Rollback transaction if any step fails

### AC-5: Email Notifications

- [ ] Send refund confirmation email to guest (use existing template from E4-S4)
- [ ] Email includes:
  - Refund amount
  - Original payment amount
  - Booking reference
  - Expected refund timeline (5-10 business days)
  - Reason for refund (guest-friendly version)
  - Customer support contact
- [ ] Send admin notification email (internal):
  - Subject: "Refund Processed - {bookingReference}"
  - Admin who processed refund
  - Refund amount and reason
  - Booking details
  - Link to admin panel
- [ ] Handle email failures gracefully (log error, don't block refund)

### AC-6: Webhook Handler Integration

- [ ] Existing `charge.refunded` webhook handler will:
  - Detect refund (already implemented in E4-S4)
  - Update payment/booking status (idempotent)
  - Send refund confirmation email (if not already sent)
  - Handle duplicate events gracefully
- [ ] No additional webhook changes needed
- [ ] Refund initiated here triggers webhook asynchronously

### AC-7: Success Feedback

- [ ] On successful refund:
  - Close modal
  - Show success toast: "Refund processed successfully. {guestEmail} will be notified."
  - Refresh booking details page (show updated status)
  - Display refund badge on booking card
- [ ] Payment status shows "REFUNDED" badge (red)
- [ ] Booking status shows "CANCELLED" (if full refund)
- [ ] Display refund details:
  - Refund amount
  - Refund date
  - Stripe refund ID
  - Reason
  - Processed by (admin name)

### AC-8: Error Handling

- [ ] Stripe API errors:
  - Show user-friendly error message in modal
  - Log detailed error server-side
  - Don't close modal (allow retry)
  - Common errors:
    - Payment already refunded
    - Insufficient balance
    - Payment not found
    - Network timeout
- [ ] Validation errors:
  - Refund amount exceeds original payment
  - Booking already cancelled
  - Payment not in SUCCEEDED status
  - Missing required fields (reason)
- [ ] Transaction rollback on database errors
- [ ] All errors logged with context (booking ref, admin ID)

### AC-9: Partial Refund Support

- [ ] Allow partial refunds (less than full payment amount)
- [ ] Partial refund behavior:
  - Update `payment.refundedAmount` (not `payment.amount`)
  - Keep booking status as `CONFIRMED`
  - Don't decrement trip capacity
  - Send partial refund email to guest
  - Display "Partially Refunded" badge
- [ ] Track total refunded amount (sum of all partial refunds)
- [ ] Prevent over-refunding (total refunds > original payment)

### AC-10: Refund History Display

- [ ] Add "Refund History" section to booking details
- [ ] Display all refunds for this booking:
  - Refund amount
  - Refund date
  - Stripe refund ID (clickable link to Stripe dashboard)
  - Reason
  - Admin who processed
  - Notes (admin-only)
- [ ] Show total refunded vs. original payment
- [ ] Highlight if multiple partial refunds exist

### AC-11: Admin Permission Check

- [ ] Verify user has admin role (Clerk `publicMetadata.role === 'admin'`)
- [ ] Only admins can access refund UI
- [ ] API mutation protected with admin role check
- [ ] Non-admins receive 403 Forbidden error
- [ ] Audit log includes admin user ID for accountability

### AC-12: Stripe Dashboard Integration

- [ ] Include link to Stripe refund details
- [ ] Link format: `https://dashboard.stripe.com/refunds/{refundId}`
- [ ] Opens in new tab
- [ ] Available after refund processed
- [ ] Allows admin to verify refund status in Stripe

### AC-13: Refund Reason Categorization

- [ ] Define RefundReason enum:
  ```typescript
  enum RefundReason {
    GUEST_CANCELLATION = 'guest_cancellation'
    MEDICAL_EMERGENCY = 'medical_emergency'
    TRIP_CANCELLATION = 'trip_cancellation'
    SERVICE_ISSUE = 'service_issue'
    DISPUTE_RESOLUTION = 'dispute_resolution'
    OTHER = 'other'
  }
  ```
- [ ] Store reason in Payment model or separate RefundLog table
- [ ] Use for analytics and reporting
- [ ] Guest-friendly reason mapping for emails

### AC-14: Refund Timeline Display

- [ ] Show expected refund timeline in confirmation email
- [ ] Standard: "5-10 business days" for card refunds
- [ ] Vary by payment method if applicable
- [ ] Include in admin UI (info tooltip)

### AC-15: Testing

- [ ] Test full refund flow (admin UI → Stripe → webhook → email)
- [ ] Test partial refund flow
- [ ] Test validation errors (invalid amount, already refunded)
- [ ] Test Stripe API errors (mock network failure)
- [ ] Test permission checks (non-admin users)
- [ ] Test email delivery (success and failure)
- [ ] Test trip capacity decrement (atomic operation)
- [ ] Verify webhook idempotency (refund processed twice)
- [ ] Test on production-like data (Stripe test mode)

### AC-16: Security Requirements

- [ ] Admin-only access (role-based authentication)
- [ ] Audit log for all refund actions
- [ ] Rate limiting on refund mutation (prevent abuse)
- [ ] CSRF protection (built-in with tRPC)
- [ ] Validate refund amount on server (don't trust client)
- [ ] Prevent duplicate refunds (check payment status)
- [ ] No sensitive data in logs (card numbers)

### AC-17: Performance Optimization

- [ ] Stripe API call should complete within 10 seconds
- [ ] Database transaction should be fast (< 1 second)
- [ ] Optimistic UI update (show processing state)
- [ ] Disable refund button during processing (prevent double-clicks)
- [ ] Show loading spinner in modal

### AC-18: Documentation

- [ ] Add inline comments to refund mutation
- [ ] Document refund workflow in Dev Notes
- [ ] Add admin guide: "How to Process Refunds"
- [ ] Document refund reasons and their use cases
- [ ] Update API documentation with refund mutation
- [ ] Add troubleshooting guide for common refund issues

### AC-19: Related Story Integration

- [ ] Integrates with E3-S13 (Booking Cancellation Flow):
  - Guest cancellation triggers refund request
  - Admin processes refund here
  - Completion of refund story
- [ ] Integrates with E4-S4 (Webhook Handler):
  - Webhook handles async refund confirmation
  - Sends email and updates status
  - Already implemented, no changes needed
- [ ] Sets up for E4-S8 (Receipt Generation):
  - Refund receipt generation (future enhancement)
  - Include refund amount in receipt

### AC-20: Edge Cases

- [ ] Handle multiple partial refunds (sum ≤ original amount)
- [ ] Handle refund after partial payment (installments)
- [ ] Handle refund for disputed payments
- [ ] Handle refund when trip already started
- [ ] Handle refund when guest already checked in
- [ ] Display appropriate warnings for each edge case

## Tasks / Subtasks

- [ ] Task 1: Database Schema Updates (AC: 13)
  - [ ] Subtask 1.1: Add RefundReason enum to Prisma schema (or use string)
  - [ ] Subtask 1.2: Verify Payment model has refund fields (from E4-S4)
  - [ ] Subtask 1.3: Create RefundLog table (optional, for detailed history):
    ```prisma
    model RefundLog {
      id              String   @id @default(cuid())
      paymentId       String
      payment         Payment  @relation(fields: [paymentId], references: [id])
      amount          Int      // Refund amount in cents
      stripeRefundId  String   @unique
      reason          String   // RefundReason
      notes           String?  // Admin notes
      processedBy     String   // Admin user ID (Clerk)
      processedAt     DateTime @default(now())

      @@index([paymentId])
      @@index([stripeRefundId])
    }
    ```
  - [ ] Subtask 1.4: Run migration: `npx prisma migrate dev --name add-refund-log`
  - [ ] Subtask 1.5: Generate Prisma client

- [ ] Task 2: Admin Refund Mutation (AC: 3, 4, 11, 16)
  - [ ] Subtask 2.1: Create mutation in `lib/trpc/server/routers/admin.ts`
  - [ ] Subtask 2.2: Define input schema with Zod:
    ```typescript
    const processRefundSchema = z.object({
      bookingId: z.string().cuid(),
      amount: z.number().int().positive(),
      reason: z.enum(['guest_cancellation', 'medical_emergency', ...]),
      notes: z.string().optional()
    })
    ```
  - [ ] Subtask 2.3: Verify admin role using Clerk
  - [ ] Subtask 2.4: Find booking with payment details (include relations)
  - [ ] Subtask 2.5: Validate refund eligibility (payment status, amount)
  - [ ] Subtask 2.6: Call Stripe refunds API
  - [ ] Subtask 2.7: Wrap database updates in Prisma transaction
  - [ ] Subtask 2.8: Update Payment, Booking, Trip (if applicable)
  - [ ] Subtask 2.9: Create RefundLog record (if using separate table)
  - [ ] Subtask 2.10: Return refund details (refundId, status, amount)
  - [ ] Subtask 2.11: Handle errors gracefully (throw TRPCError)

- [ ] Task 3: Stripe Refund API Integration (AC: 3, 8)
  - [ ] Subtask 3.1: Import Stripe client (use existing from E4-S1)
  - [ ] Subtask 3.2: Call `stripe.refunds.create()` with payment intent
  - [ ] Subtask 3.3: Pass refund amount (in cents)
  - [ ] Subtask 3.4: Include metadata (booking ref, reason, admin ID)
  - [ ] Subtask 3.5: Handle Stripe errors (already refunded, insufficient balance)
  - [ ] Subtask 3.6: Return Stripe refund object
  - [ ] Subtask 3.7: Test with Stripe test mode

- [ ] Task 4: Email Notifications (AC: 5)
  - [ ] Subtask 4.1: Reuse existing refund confirmation email (E4-S4)
  - [ ] Subtask 4.2: Call `sendRefundConfirmation()` after successful refund
  - [ ] Subtask 4.3: Pass refund data (amount, reason, booking ref)
  - [ ] Subtask 4.4: Create admin notification email (optional)
  - [ ] Subtask 4.5: Handle email failures gracefully (log, don't throw)
  - [ ] Subtask 4.6: Test email delivery

- [ ] Task 5: Admin UI - Refund Button (AC: 1)
  - [ ] Subtask 5.1: Update booking details page: `/admin/bookings/[id]/page.tsx`
  - [ ] Subtask 5.2: Add "Process Refund" button (conditional rendering)
  - [ ] Subtask 5.3: Check booking status (CONFIRMED or PENDING)
  - [ ] Subtask 5.4: Check payment status (SUCCEEDED)
  - [ ] Subtask 5.5: Disable if already refunded
  - [ ] Subtask 5.6: Style as destructive action (red color)
  - [ ] Subtask 5.7: Add icon (RefundIcon or DollarSign)
  - [ ] Subtask 5.8: Add permission check (admin role)

- [ ] Task 6: Admin UI - Refund Modal (AC: 2, 7, 17)
  - [ ] Subtask 6.1: Create refund modal component: `components/admin/refund-modal.tsx`
  - [ ] Subtask 6.2: Display booking summary (guest, package, amount)
  - [ ] Subtask 6.3: Add warning message
  - [ ] Subtask 6.4: Add refund reason dropdown (use Select from shadcn/ui)
  - [ ] Subtask 6.5: Add refund amount input (default to full amount)
  - [ ] Subtask 6.6: Add currency formatting ($15,000.00)
  - [ ] Subtask 6.7: Add validation (amount ≤ original payment)
  - [ ] Subtask 6.8: Add notes text area (optional)
  - [ ] Subtask 6.9: Add confirmation checkbox
  - [ ] Subtask 6.10: Add Cancel and Process Refund buttons
  - [ ] Subtask 6.11: Disable Process button until confirmed
  - [ ] Subtask 6.12: Add loading state during processing
  - [ ] Subtask 6.13: Handle success (close modal, show toast)
  - [ ] Subtask 6.14: Handle errors (show error message, keep modal open)

- [ ] Task 7: Admin UI - Refund History Display (AC: 10)
  - [ ] Subtask 7.1: Add "Refund History" section to booking details
  - [ ] Subtask 7.2: Fetch refund logs from database
  - [ ] Subtask 7.3: Display refund list (table or cards)
  - [ ] Subtask 7.4: Show refund amount, date, reason, admin
  - [ ] Subtask 7.5: Add link to Stripe dashboard
  - [ ] Subtask 7.6: Show total refunded vs. original payment
  - [ ] Subtask 7.7: Highlight partial refunds

- [ ] Task 8: Admin UI - Status Badges (AC: 7)
  - [ ] Subtask 8.1: Update booking card to show refund status
  - [ ] Subtask 8.2: Add "REFUNDED" badge (red) for full refunds
  - [ ] Subtask 8.3: Add "Partially Refunded" badge (orange) for partial refunds
  - [ ] Subtask 8.4: Update payment status display
  - [ ] Subtask 8.5: Show refund details below booking summary

- [ ] Task 9: Partial Refund Logic (AC: 9)
  - [ ] Subtask 9.1: Calculate total refunded (sum of all refunds)
  - [ ] Subtask 9.2: Validate total refunds ≤ original payment
  - [ ] Subtask 9.3: Keep booking CONFIRMED if partial refund
  - [ ] Subtask 9.4: Don't decrement trip capacity for partial refunds
  - [ ] Subtask 9.5: Update UI to show "Partially Refunded" status
  - [ ] Subtask 9.6: Test multiple partial refunds

- [ ] Task 10: Testing & Validation (AC: 15)
  - [ ] Subtask 10.1: Test full refund flow end-to-end
  - [ ] Subtask 10.2: Test partial refund flow
  - [ ] Subtask 10.3: Test validation errors (invalid amount, already refunded)
  - [ ] Subtask 10.4: Test Stripe API errors (mock failures)
  - [ ] Subtask 10.5: Test permission checks (non-admin users)
  - [ ] Subtask 10.6: Test email delivery
  - [ ] Subtask 10.7: Test trip capacity decrement
  - [ ] Subtask 10.8: Test webhook idempotency
  - [ ] Subtask 10.9: Test on Stripe test mode
  - [ ] Subtask 10.10: Run TypeScript validation: `npx tsc --noEmit`

- [ ] Task 11: Documentation (AC: 18)
  - [ ] Subtask 11.1: Add inline comments to refund mutation
  - [ ] Subtask 11.2: Document refund workflow in Dev Notes
  - [ ] Subtask 11.3: Create admin guide: "How to Process Refunds"
  - [ ] Subtask 11.4: Document refund reasons
  - [ ] Subtask 11.5: Add troubleshooting guide

## Dev Notes

### Architecture Requirements (MUST FOLLOW)

**Existing Infrastructure:**
- Stripe refund webhook handler: `app/api/webhooks/stripe/route.ts` (E4-S4)
- Refund confirmation email: `lib/email/templates/refund-confirmation.ts` (E4-S4)
- SendGrid integration: `lib/email/sendgrid.ts` (E11-S1)
- Payment model with refund fields: `prisma/schema.prisma` (E4-S4)
- Admin dashboard: `/admin/bookings` (E5-S2)
- Booking cancellation flow: E3-S13 (triggers refund request)

**What Needs to Be Added:**
1. Admin refund mutation (tRPC)
2. Stripe refund API call (server-side)
3. Refund modal UI component
4. Refund history display
5. Permission checks (admin role)
6. Optional: RefundLog table for detailed tracking

**Critical Implementation Notes:**
- ✅ Webhook handler ALREADY handles refund events (E4-S4)
- ✅ Email template ALREADY exists (E4-S4)
- ✅ Payment model ALREADY has refund fields (E4-S4)
- ⚠️ Admin UI for manual refunds NOT implemented yet
- ⚠️ This completes the refund story started in E3-S13

### Refund Processing Flow

**Flow Diagram:**
```
Admin clicks "Process Refund"
        ↓
  Refund Modal Opens
        ↓
  Admin enters amount, reason, notes
        ↓
  Admin confirms refund
        ↓
  tRPC mutation called
        ↓
  Verify admin role
        ↓
  Validate refund eligibility
        ↓
  Call Stripe refunds API
        ↓
  Database transaction:
    - Update Payment (status, refundedAmount, stripeRefundId)
    - Update Booking (status to CANCELLED if full refund)
    - Decrement Trip capacity (if full refund)
    - Create RefundLog record
        ↓
  Send refund confirmation email to guest
        ↓
  Return success to UI
        ↓
  UI shows success toast
        ↓
  Booking details page refreshes
        ↓
  [Async] Stripe webhook fires (charge.refunded)
        ↓
  [Async] Webhook handler processes event (idempotent)
```

### tRPC Refund Mutation

**File:** `lib/trpc/server/routers/admin.ts`

```typescript
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { adminProcedure } from '../trpc'
import { stripe } from '@/lib/stripe/stripe-service'
import { sendRefundConfirmation } from '@/lib/email/sendgrid'

const processRefundSchema = z.object({
  bookingId: z.string().cuid(),
  amount: z.number().int().positive(), // in cents
  reason: z.enum([
    'guest_cancellation',
    'medical_emergency',
    'trip_cancellation',
    'service_issue',
    'dispute_resolution',
    'other'
  ]),
  notes: z.string().optional()
})

export const adminRouter = router({
  // ... existing mutations ...

  processRefund: adminProcedure
    .input(processRefundSchema)
    .mutation(async ({ ctx, input }) => {
      const { bookingId, amount, reason, notes } = input
      const adminUserId = ctx.userId // From Clerk auth

      try {
        // Find booking with payment details
        const booking = await ctx.prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            payment: true,
            user: true,
            package: true,
            trip: true
          }
        })

        if (!booking) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Booking not found'
          })
        }

        const payment = booking.payment

        if (!payment) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No payment found for this booking'
          })
        }

        // Validate refund eligibility
        if (payment.status === 'REFUNDED') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Payment already fully refunded'
          })
        }

        if (payment.status !== 'SUCCEEDED') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot refund payment with status: ${payment.status}`
          })
        }

        // Calculate total refunded so far
        const totalRefunded = payment.refundedAmount || 0

        // Validate refund amount
        if (amount > payment.amount - totalRefunded) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Refund amount ($${amount / 100}) exceeds remaining payment amount ($${(payment.amount - totalRefunded) / 100})`
          })
        }

        // Call Stripe refunds API
        const stripeRefund = await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          amount,
          reason: 'requested_by_customer', // Stripe-specific reason
          metadata: {
            bookingReference: booking.bookingReference,
            adminReason: reason,
            adminNotes: notes || '',
            processedBy: adminUserId
          }
        })

        console.log(`[Refund] Stripe refund created: ${stripeRefund.id}`)

        // Determine if this is a full refund
        const isFullRefund = (totalRefunded + amount) >= payment.amount

        // Database transaction for atomic updates
        await ctx.prisma.$transaction(async (tx) => {
          // Update Payment record
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: isFullRefund ? 'REFUNDED' : 'SUCCEEDED',
              refundedAmount: totalRefunded + amount,
              stripeRefundId: stripeRefund.id, // Latest refund ID
              updatedAt: new Date()
            }
          })

          // Update Booking status (only if full refund)
          if (isFullRefund && booking.status === 'CONFIRMED') {
            await tx.booking.update({
              where: { id: booking.id },
              data: {
                status: 'CANCELLED',
                updatedAt: new Date()
              }
            })

            // Decrement trip capacity
            if (booking.tripId) {
              await tx.trip.update({
                where: { id: booking.tripId },
                data: {
                  currentBookings: {
                    decrement: 1
                  }
                }
              })
            }
          }

          // Create RefundLog (optional - if using separate table)
          // await tx.refundLog.create({
          //   data: {
          //     paymentId: payment.id,
          //     amount,
          //     stripeRefundId: stripeRefund.id,
          //     reason,
          //     notes: notes || null,
          //     processedBy: adminUserId
          //   }
          // })
        })

        console.log(`[Refund] Database updated for booking ${booking.bookingReference}`)

        // Send refund confirmation email to guest (non-blocking)
        sendRefundConfirmation(booking.user.email, {
          firstName: booking.user.email.split('@')[0], // Fallback
          email: booking.user.email,
          bookingReference: booking.bookingReference,
          packageName: booking.package.name,
          refundAmount: amount,
          originalAmount: payment.amount,
          isPartialRefund: !isFullRefund,
          refundDate: new Date().toISOString(),
          expectedTimeline: '5-10 business days'
        }).catch(console.error)

        console.log(`[Refund] Email sent to ${booking.user.email}`)

        // Return success
        return {
          success: true,
          refundId: stripeRefund.id,
          amount,
          isFullRefund,
          bookingReference: booking.bookingReference
        }
      } catch (error) {
        console.error('[Refund] Processing error:', error)

        // Handle Stripe errors
        if (error instanceof Error && 'type' in error) {
          const stripeError = error as any

          if (stripeError.type === 'StripeCardError') {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Stripe error: ${stripeError.message}`
            })
          }

          if (stripeError.code === 'charge_already_refunded') {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'This payment has already been refunded'
            })
          }
        }

        // Re-throw TRPCErrors
        if (error instanceof TRPCError) {
          throw error
        }

        // Generic error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process refund. Please try again.'
        })
      }
    })
})
```

### Admin Refund Modal Component

**File:** `components/admin/refund-modal.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { AlertTriangle, DollarSign } from 'lucide-react'

const refundFormSchema = z.object({
  amount: z.number().int().positive(),
  reason: z.enum([
    'guest_cancellation',
    'medical_emergency',
    'trip_cancellation',
    'service_issue',
    'dispute_resolution',
    'other'
  ]),
  notes: z.string().optional(),
  confirmed: z.boolean().refine((val) => val === true, {
    message: 'You must confirm this refund'
  })
})

type RefundFormValues = z.infer<typeof refundFormSchema>

interface RefundModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: {
    id: string
    bookingReference: string
    user: { email: string }
    package: { name: string }
    payment: {
      id: string
      amount: number // in cents
      refundedAmount?: number
      status: string
    }
    status: string
  }
  onSuccess?: () => void
}

const REFUND_REASONS = [
  { value: 'guest_cancellation', label: 'Guest Cancellation' },
  { value: 'medical_emergency', label: 'Medical Emergency' },
  { value: 'trip_cancellation', label: 'Trip Cancellation' },
  { value: 'service_issue', label: 'Service Issue' },
  { value: 'dispute_resolution', label: 'Dispute Resolution' },
  { value: 'other', label: 'Other' }
]

export function RefundModal({ open, onOpenChange, booking, onSuccess }: RefundModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const processRefundMutation = trpc.admin.processRefund.useMutation()

  const maxRefundAmount = booking.payment.amount - (booking.payment.refundedAmount || 0)

  const form = useForm<RefundFormValues>({
    resolver: zodResolver(refundFormSchema),
    defaultValues: {
      amount: maxRefundAmount, // Default to full remaining amount
      reason: 'guest_cancellation',
      notes: '',
      confirmed: false
    }
  })

  const onSubmit = async (data: RefundFormValues) => {
    setIsProcessing(true)

    try {
      const result = await processRefundMutation.mutateAsync({
        bookingId: booking.id,
        amount: data.amount,
        reason: data.reason,
        notes: data.notes
      })

      toast.success(
        `Refund processed successfully. ${booking.user.email} will be notified.`,
        {
          description: `Refund ID: ${result.refundId}`
        }
      )

      onOpenChange(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to process refund', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Process Refund - {booking.bookingReference}</DialogTitle>
          <DialogDescription>
            Process a refund for this booking. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Booking Summary */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Guest:</span>
            <span className="font-medium">{booking.user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Package:</span>
            <span className="font-medium">{booking.package.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Original Payment:</span>
            <span className="font-medium">{formatCurrency(booking.payment.amount)}</span>
          </div>
          {booking.payment.refundedAmount && booking.payment.refundedAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Already Refunded:</span>
              <span className="font-medium text-orange-600">
                {formatCurrency(booking.payment.refundedAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Maximum Refund:</span>
            <span className="font-semibold">{formatCurrency(maxRefundAmount)}</span>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-destructive mb-1">Warning</p>
            <p className="text-muted-foreground">
              This action cannot be undone. The guest will be notified via email and the refund
              will be processed immediately through Stripe.
            </p>
          </div>
        </div>

        {/* Refund Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Refund Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refund Amount *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="15000.00"
                        className="pl-9"
                        value={(field.value / 100).toFixed(2)}
                        onChange={(e) => {
                          const dollars = parseFloat(e.target.value) || 0
                          field.onChange(Math.round(dollars * 100))
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Maximum: {formatCurrency(maxRefundAmount)}. Enter amount in dollars.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Refund Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refund Reason *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REFUND_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any internal notes about this refund..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    These notes are for internal use only and won't be shared with the guest.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirmation Checkbox */}
            <FormField
              control={form.control}
              name="confirmed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I confirm this refund is authorized *</FormLabel>
                    <FormDescription>
                      Check this box to confirm you have authorization to process this refund.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!form.watch('confirmed') || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Process Refund'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

### Integrating Refund Button in Booking Details

**Update:** `app/admin/bookings/[id]/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { RefundModal } from '@/components/admin/refund-modal'
import { Button } from '@/components/ui/button'
import { DollarSign } from 'lucide-react'

export default function AdminBookingDetailsPage({ params }: { params: { id: string } }) {
  const [refundModalOpen, setRefundModalOpen] = useState(false)

  // ... existing code to fetch booking ...

  const canRefund =
    booking.payment &&
    booking.payment.status === 'SUCCEEDED' &&
    (booking.status === 'CONFIRMED' || booking.status === 'PENDING')

  return (
    <div>
      {/* ... existing booking details ... */}

      {/* Refund Button */}
      {canRefund && (
        <div className="flex justify-end mt-6">
          <Button
            variant="destructive"
            onClick={() => setRefundModalOpen(true)}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Process Refund
          </Button>
        </div>
      )}

      {/* Refund Modal */}
      <RefundModal
        open={refundModalOpen}
        onOpenChange={setRefundModalOpen}
        booking={booking}
        onSuccess={() => {
          // Refresh booking data
          router.refresh()
        }}
      />
    </div>
  )
}
```

### Refund History Display

**Add to Booking Details Page:**

```typescript
{/* Refund History Section */}
{booking.payment?.refundedAmount && booking.payment.refundedAmount > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Refund History</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Total Refunded</p>
            <p className="text-sm text-muted-foreground">
              Stripe Refund ID: {booking.payment.stripeRefundId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-destructive">
              ${(booking.payment.refundedAmount / 100).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              of ${(booking.payment.amount / 100).toLocaleString()}
            </p>
          </div>
        </div>

        <a
          href={`https://dashboard.stripe.com/refunds/${booking.payment.stripeRefundId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          View in Stripe Dashboard →
        </a>
      </div>
    </CardContent>
  </Card>
)}
```

### Testing Workflow

**Local Testing:**
```bash
# 1. Start development server
npm run dev

# 2. Login as admin user
# 3. Navigate to /admin/bookings
# 4. Select a booking with SUCCEEDED payment
# 5. Click "Process Refund"
# 6. Enter refund amount and reason
# 7. Confirm refund
# 8. Verify Stripe refund created (check Stripe dashboard)
# 9. Verify database updated (payment status, booking status)
# 10. Verify email sent to guest
# 11. Check webhook fired (stripe listen logs)
```

**Test Cases:**
```typescript
// Test 1: Full refund
// - Refund full payment amount
// - Booking status → CANCELLED
// - Trip capacity decremented
// - Email sent

// Test 2: Partial refund
// - Refund 50% of payment
// - Booking status → CONFIRMED (stays same)
// - Trip capacity NOT decremented
// - Email sent with partial refund notice

// Test 3: Multiple partial refunds
// - Refund 30% first
// - Refund 40% second
// - Refund 30% third
// - Total = 100% → Booking status → CANCELLED

// Test 4: Validation errors
// - Try refund > remaining amount (should fail)
// - Try refund on already refunded payment (should fail)
// - Try refund without confirmation (button disabled)

// Test 5: Permission check
// - Login as non-admin user
// - Refund button should not appear
// - API call should return 403 Forbidden

// Test 6: Stripe API error
// - Mock Stripe API failure
// - Should show error message
// - Should not update database
// - Modal should stay open for retry
```

### Common Pitfalls to Avoid

1. **❌ DON'T forget to verify admin role**
   - Always check Clerk `publicMetadata.role === 'admin'`
   - Protect both UI and API mutation

2. **❌ DON'T allow over-refunding**
   - Calculate total refunded (sum of all partial refunds)
   - Validate: `refundAmount ≤ (originalAmount - totalRefunded)`

3. **❌ DON'T update booking status for partial refunds**
   - Only set status to CANCELLED if full refund
   - Partial refunds should keep booking CONFIRMED

4. **❌ DON'T forget database transaction**
   - Wrap Payment + Booking + Trip updates in transaction
   - Rollback all changes if any step fails

5. **❌ DON'T decrement trip capacity for partial refunds**
   - Only decrement if full refund AND booking was CONFIRMED
   - Check `isFullRefund` before decrementing

6. **❌ DON'T block on email sending**
   - Use `.catch(console.error)` for non-blocking
   - Email failure shouldn't prevent refund

7. **❌ DON'T trust client-side validation only**
   - Always validate refund amount on server
   - Check payment status on server
   - Prevent tampering

### Security Best Practices

**Admin Role Verification:**
```typescript
// In tRPC procedure
const user = await clerkClient.users.getUser(ctx.userId)
const role = user.publicMetadata.role

if (role !== 'admin') {
  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'Admin access required'
  })
}
```

**Audit Logging:**
- Log all refund actions
- Include: admin user ID, booking ref, amount, reason, timestamp
- Store in RefundLog table or admin activity log

**Rate Limiting:**
- Limit refunds per admin per hour (prevent abuse)
- Use tRPC middleware or API rate limiter

### Performance Considerations

**Stripe API Performance:**
- Refund creation typically takes 1-2 seconds
- Show loading state in UI
- Disable button during processing

**Database Transaction:**
- Should complete in < 1 second
- Use atomic operations for trip capacity

**Email Sending:**
- Non-blocking (don't wait for SendGrid)
- Queue in background if needed

### Related Stories Integration

**E3-S13: Booking Cancellation Flow**
- Guest requests cancellation
- Admin reviews and processes refund HERE
- Completes the cancellation story

**E4-S4: Webhook Handler**
- Handles `charge.refunded` event
- Updates payment/booking status (idempotent)
- Sends email if not already sent
- Already fully implemented

**E4-S8: Receipt Generation (Future)**
- Generate refund receipt PDF
- Attach to refund confirmation email
- Future enhancement

### Troubleshooting Guide

**Problem: Refund button not visible**
- Check: User has admin role
- Check: Payment status is SUCCEEDED
- Check: Booking status is CONFIRMED or PENDING

**Problem: Stripe API error "already refunded"**
- Check: Payment status in database
- Check: Stripe dashboard for refund history
- Solution: Update database to match Stripe

**Problem: Trip capacity not decremented**
- Check: Is this a full refund?
- Check: Was booking CONFIRMED before refund?
- Check: Database transaction completed successfully

**Problem: Email not sent**
- Check: SendGrid API key configured
- Check: Email template exists
- Check: Refund confirmation function called
- Check: SendGrid logs for errors

**Problem: Webhook not firing**
- Check: Stripe webhook configured
- Check: Webhook secret matches
- Check: Stripe dashboard → Webhooks → Event log
- Solution: Webhook is async, may take a few seconds

### References

**Stripe Refunds API:**
- [Create Refund](https://stripe.com/docs/api/refunds/create)
- [Refund Object](https://stripe.com/docs/api/refunds/object)
- [Refund Reasons](https://stripe.com/docs/api/refunds/create#create_refund-reason)

**Code References:**
- Webhook handler: `app/api/webhooks/stripe/route.ts` (E4-S4)
- Refund email: `lib/email/templates/refund-confirmation.ts` (E4-S4)
- Admin dashboard: `app/admin/bookings/[id]/page.tsx` (E5-S2)
- Booking cancellation: E3-S13

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

(To be filled by dev agent)

### Completion Notes

(To be filled by dev agent after implementation)

### File List

**Files to Create:**
1. `components/admin/refund-modal.tsx` - Refund modal component
2. Optional: `lib/trpc/server/routers/admin.ts` - Add refund mutation (or update existing)

**Files to Modify:**
1. `app/admin/bookings/[id]/page.tsx` - Add refund button and modal
2. `lib/trpc/server/routers/admin.ts` - Add processRefund mutation
3. Optional: `prisma/schema.prisma` - Add RefundLog table (if tracking detailed history)

**Migrations:**
1. Optional: `add-refund-log` (if creating RefundLog table)

**Environment Variables:**
- `STRIPE_SECRET_KEY` - Already configured (E4-S1)
- `CLERK_SECRET_KEY` - Already configured (E2-S1)

**Dependencies:**
- No new dependencies required (all already installed)

**No Breaking Changes** - Enhances admin dashboard with refund capabilities
