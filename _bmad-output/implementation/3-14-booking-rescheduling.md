# Story 3.14: Booking Rescheduling

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a guest who needs to reschedule,
I want to move my booking to a different trip,
So that I don't lose my deposit.

## Acceptance Criteria

### AC-1: Reschedule Button Display & Eligibility

- [ ] Display "Reschedule Booking" button on booking details page ([app/(dashboard)/dashboard/bookings/[id]/page.tsx])
- [ ] Button only visible when booking status is `CONFIRMED` or `PENDING_PAYMENT`
- [ ] Button hidden when status is `CANCELLED` or `COMPLETED`
- [ ] Button disabled if trip has already started (startDate < today)
- [ ] **Eligibility Rule:** Booking is eligible if <30 days before trip (no refund period)
- [ ] **Reschedule Limit:** Button disabled if reschedule has already been used once
- [ ] Track reschedule count in booking metadata or new field
- [ ] Protected route - requires Clerk authentication
- [ ] User must own the booking (userId matches authenticated user)
- [ ] Button styled as secondary action (not destructive like cancel)

### AC-2: Reschedule Modal - Trip Selection

- [ ] Clicking "Reschedule Booking" opens rescheduling modal
- [ ] Modal displays current booking details (trip name, dates, package, total)
- [ ] Modal shows eligibility status: "You have 1 reschedule available" or "Reschedule limit reached"
- [ ] Modal explains reschedule policy clearly:
  - **Available:** <30 days before trip (non-refundable period)
  - **Limit:** One reschedule per booking
  - **Price adjustment:** May apply if new trip has different pricing
- [ ] Fetch and display available future trips (tRPC query: `trip.getAvailableForReschedule`)
- [ ] Filter trips: startDate > today, same package type, has availability (currentBookings < maxCapacity)
- [ ] Display trips in card/list format with:
  - Trip name
  - Start date → End date
  - Location (e.g., "Phuket, Thailand")
  - Spots available (e.g., "8 spots left")
  - Price per person (may differ from original booking)
- [ ] Allow user to select one trip (radio button selection)
- [ ] Show loading state while fetching trips

### AC-3: Price Adjustment Calculation & Display

- [ ] Calculate price difference between original trip and new trip
- [ ] Price calculation:
  ```typescript
  // New trip may have different base pricing
  const originalTripPrice = booking.totalPrice
  const newTripPrice = calculateNewTripPrice(newTrip, booking)
  const priceDifference = newTripPrice - originalTripPrice
  ```
- [ ] Display price adjustment prominently:
  - If `priceDifference > 0`: "Additional charge: $X" (green box)
  - If `priceDifference < 0`: "Credit applied: $X" (blue box)
  - If `priceDifference === 0`: "No price adjustment" (gray box)
- [ ] For price increases: Show Stripe payment form to charge difference
- [ ] For price decreases: Explain credit will be applied (future use or refund to card)
- [ ] Display breakdown:
  - Original price: $X
  - New trip price: $Y
  - Difference: ±$Z
- [ ] Format currency with commas and 2 decimal places

### AC-4: Reschedule Confirmation

- [ ] "Confirm Reschedule" button disabled until trip is selected
- [ ] Display confirmation summary before processing:
  - Old trip: Name, Dates
  - New trip: Name, Dates
  - Price adjustment (if any)
  - Reschedule count increment (e.g., "This will use your 1 allowed reschedule")
- [ ] Two buttons: "Cancel" (closes modal) and "Confirm Reschedule" (primary)
- [ ] Show loading spinner during processing
- [ ] Disable button during processing to prevent double-clicks

### AC-5: Reschedule Processing (tRPC Mutation)

- [ ] tRPC mutation: `booking.reschedule`
- [ ] Input validation:
  ```typescript
  z.object({
    bookingId: z.string().uuid(),
    newTripId: z.string().uuid()
  })
  ```
- [ ] Authorization check: booking.userId === ctx.userId
- [ ] Verify booking exists and is reschedulable:
  - Status must be CONFIRMED or PENDING_PAYMENT
  - Trip must not have started yet
  - Reschedule count < 1 (enforce one-time limit)
  - <30 days before original trip (non-refundable period)
- [ ] Verify new trip exists, has availability, and matches package
- [ ] Calculate price adjustment server-side (do NOT trust client)
- [ ] Begin database transaction (atomic operation)

### AC-6: Trip Capacity Management

- [ ] Decrement original trip capacity: `oldTrip.currentBookings -= 1`
- [ ] Increment new trip capacity: `newTrip.currentBookings += 1`
- [ ] Verify new trip has availability before incrementing (currentBookings < maxCapacity)
- [ ] Handle capacity errors: "Selected trip is now full. Please choose another trip."
- [ ] Use Prisma transaction to ensure atomic capacity updates

### AC-7: Payment Processing for Price Differences

- [ ] **If price increases (priceDifference > 0):**
  - Create Stripe PaymentIntent for difference amount
  - Process payment through existing Stripe integration
  - Create Payment record with status `SUCCEEDED`
  - Store stripePaymentIntentId
  - Handle payment failures: rollback booking changes
- [ ] **If price decreases (priceDifference < 0):**
  - Issue credit to customer's Stripe balance OR
  - Process refund to original payment method
  - Create Payment record with negative amount and status `REFUNDED`
  - Store stripeRefundId
- [ ] **If price equal (priceDifference === 0):**
  - No payment processing required
  - Update booking only

### AC-8: Booking Update

- [ ] Update booking record with new trip:
  ```typescript
  await tx.booking.update({
    where: { id: bookingId },
    data: {
      tripId: newTripId,
      totalPrice: newTripPrice,
      updatedAt: new Date(),
      // Track reschedule count
      metadata: {
        rescheduledAt: new Date(),
        rescheduled Count: (booking.rescheduleCount || 0) + 1,
        originalTripId: booking.tripId
      }
    }
  })
  ```
- [ ] Store original trip ID for audit trail
- [ ] Increment reschedule count
- [ ] Update total price if different
- [ ] Record reschedule timestamp

### AC-9: Email Notification

- [ ] Send reschedule confirmation email after successful reschedule
- [ ] Email includes:
  - Booking reference number
  - Old trip details (name, dates)
  - New trip details (name, dates, location)
  - Price adjustment details (charge or credit)
  - Updated confirmation PDF (if applicable)
  - "What to expect next" section
  - Customer support contact information
- [ ] Email template: Follow existing SendGrid pattern
- [ ] Handle email failures gracefully (log error, don't block reschedule)

### AC-10: Loading & Success States

- [ ] Show loading spinner on "Confirm Reschedule" button during processing
- [ ] Disable all interactive elements during processing
- [ ] On success:
  - Close modal
  - Show success toast: "Booking rescheduled successfully! New trip: {tripName}"
  - Refresh booking data (React Query invalidation)
  - Booking details page updates to show new trip details
  - Reschedule button disabled (limit reached)
- [ ] Loading state minimum 500ms (prevent flash)

### AC-11: Error Handling

- [ ] Display specific error messages via toast:
  - "Trip has already started - cannot reschedule"
  - "Booking has already been rescheduled (limit: 1)"
  - "Selected trip is no longer available"
  - "Payment processing failed - please try again"
  - "Network error - please try again"
- [ ] Keep modal open on error (allow retry or trip reselection)
- [ ] Log errors to console for debugging
- [ ] Provide support email in critical error messages
- [ ] Handle Stripe-specific errors (card declined, insufficient funds, etc.)

### AC-12: Mobile Responsiveness

- [ ] Modal full-screen on mobile (<640px)
- [ ] Modal centered with max-width on desktop (max-w-2xl for trip list)
- [ ] Trip selection cards stack vertically on mobile
- [ ] Touch-friendly button sizes (minimum 48px height)
- [ ] Scrollable trip list if many options available
- [ ] Sticky modal header and footer on mobile
- [ ] Price adjustment box readable on small screens

### AC-13: Accessibility

- [ ] Modal has proper ARIA attributes:
  - `role="dialog"`
  - `aria-labelledby="modal-title"`
  - `aria-describedby="modal-description"`
  - `aria-modal="true"`
- [ ] Focus trap within modal (tab navigation loops inside modal)
- [ ] Auto-focus on trip selection area when modal opens
- [ ] ESC key closes modal
- [ ] Keyboard navigation for trip selection (arrow keys + Enter)
- [ ] Screen reader announces:
  - Selected trip details
  - Price adjustments
  - Reschedule eligibility status
- [ ] Color contrast meets WCAG AA standards
- [ ] Disabled states clearly communicated

## Tasks / Subtasks

- [ ] Task 1: Add reschedule tracking to Booking model (AC: 1, 5, 8)
  - [ ] Subtask 1.1: Add `rescheduleCount` field to Booking model (Prisma schema)
  - [ ] Subtask 1.2: Add `rescheduledAt` timestamp field (nullable DateTime)
  - [ ] Subtask 1.3: Add `originalTripId` field to track rescheduling history (nullable String)
  - [ ] Subtask 1.4: Run Prisma migration: `npx prisma migrate dev --name add-reschedule-tracking`
  - [ ] Subtask 1.5: Generate Prisma client: `npx prisma generate`

- [ ] Task 2: Create trip.getAvailableForReschedule query (AC: 2)
  - [ ] Subtask 2.1: Add query to `lib/trpc/server/routers/trip.ts`
  - [ ] Subtask 2.2: Implement filtering logic (future trips, same package, has availability)
  - [ ] Subtask 2.3: Add proper authorization and input validation
  - [ ] Subtask 2.4: Include trip details: dates, location, capacity, pricing
  - [ ] Subtask 2.5: Add TypeScript types and Zod schema

- [ ] Task 3: Create booking.reschedule mutation (AC: 5, 6, 7, 8)
  - [ ] Subtask 3.1: Add `reschedule` mutation to `lib/trpc/server/routers/booking.ts`
  - [ ] Subtask 3.2: Implement authorization checks (user owns booking)
  - [ ] Subtask 3.3: Implement eligibility validation (<30 days, reschedule count < 1)
  - [ ] Subtask 3.4: Implement price adjustment calculation (server-side)
  - [ ] Subtask 3.5: Integrate Stripe payment for price increases
  - [ ] Subtask 3.6: Integrate Stripe refund for price decreases
  - [ ] Subtask 3.7: Update booking record (tripId, totalPrice, rescheduleCount)
  - [ ] Subtask 3.8: Update trip capacities (decrement old, increment new) atomically
  - [ ] Subtask 3.9: Create Payment records for charges/refunds
  - [ ] Subtask 3.10: Add proper error handling and rollback logic
  - [ ] Subtask 3.11: Add TypeScript types and Zod validation

- [ ] Task 4: Create ReschedulingModal component (AC: 2, 3, 4, 10, 11, 12, 13)
  - [ ] Subtask 4.1: Create `components/booking/rescheduling-modal.tsx`
  - [ ] Subtask 4.2: Implement modal UI with Radix UI Dialog
  - [ ] Subtask 4.3: Add trip selection UI (radio buttons, trip cards)
  - [ ] Subtask 4.4: Implement price adjustment display logic
  - [ ] Subtask 4.5: Integrate Stripe Elements for price increase payments
  - [ ] Subtask 4.6: Add loading states (spinner, disabled buttons)
  - [ ] Subtask 4.7: Add success/error toast notifications (using Sonner)
  - [ ] Subtask 4.8: Style with Tailwind (mobile-first, responsive)
  - [ ] Subtask 4.9: Add accessibility attributes (ARIA, focus trap)
  - [ ] Subtask 4.10: Implement keyboard navigation (ESC, Tab, Arrow keys)

- [ ] Task 5: Update booking details page (AC: 1)
  - [ ] Subtask 5.1: Add "Reschedule Booking" button to booking details page
  - [ ] Subtask 5.2: Implement visibility/eligibility logic (status, date, reschedule count)
  - [ ] Subtask 5.3: Integrate ReschedulingModal component
  - [ ] Subtask 5.4: Wire up mutation to modal's confirm action
  - [ ] Subtask 5.5: Handle success state (invalidate queries, update UI)

- [ ] Task 6: Implement email notification (AC: 9)
  - [ ] Subtask 6.1: Create SendGrid email template for rescheduling
  - [ ] Subtask 6.2: Add email sending logic in booking.reschedule mutation
  - [ ] Subtask 6.3: Include all required fields (old trip, new trip, price adjustment)
  - [ ] Subtask 6.4: Handle email failures gracefully (log, don't block)

- [ ] Task 7: Testing & validation (AC: All)
  - [ ] Subtask 7.1: Test reschedule eligibility rules (<30 days, count limit)
  - [ ] Subtask 7.2: Test trip capacity management (decrement/increment)
  - [ ] Subtask 7.3: Test price adjustment scenarios (increase, decrease, equal)
  - [ ] Subtask 7.4: Test Stripe payment integration (charges and refunds)
  - [ ] Subtask 7.5: Test authorization checks (user can only reschedule own bookings)
  - [ ] Subtask 7.6: Test edge cases (trip full, trip started, already rescheduled)
  - [ ] Subtask 7.7: Test modal accessibility (keyboard, screen reader)
  - [ ] Subtask 7.8: Test mobile responsiveness
  - [ ] Subtask 7.9: Run TypeScript validation (0 errors)
  - [ ] Subtask 7.10: Test production build: `npm run build`

## Dev Notes

### Architecture Requirements (MUST FOLLOW)

**Database Schema Changes:**
- **NEW FIELDS REQUIRED** in Booking model:
  ```prisma
  model Booking {
    // ... existing fields
    rescheduleCount Int      @default(0) // Track number of reschedules
    rescheduledAt   DateTime? // Last reschedule timestamp
    originalTripId  String?   // Original trip before reschedule (audit trail)
    // ... rest of model
  }
  ```
- Migration required: `npx prisma migrate dev --name add-reschedule-tracking`
- Payment model already supports positive (SUCCEEDED) and negative (REFUNDED) amounts

**Stripe Integration Pattern:**
- Use existing Stripe client instance from architecture
- Stripe API version: `2025-12-15.clover` (latest, from recent work)
- For price increases: `stripe.paymentIntents.create()` + payment processing
- For price decreases: `stripe.refunds.create()` on original PaymentIntent
- Store all transaction IDs in Payment records for audit trail

**tRPC API Pattern:**
```typescript
// lib/trpc/server/routers/booking.ts
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
})

export const bookingRouter = router({
  // ... existing mutations

  reschedule: protectedProcedure
    .input(z.object({
      bookingId: z.string().uuid(),
      newTripId: z.string().uuid()
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Authorization: Verify user owns booking
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: {
          trip: true,
          package: true,
          payments: {
            where: { status: 'SUCCEEDED' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })

      if (!booking || booking.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to reschedule this booking'
        })
      }

      // 2. Validate booking is reschedulable
      if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING_PAYMENT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only confirmed bookings can be rescheduled'
        })
      }

      // 3. Check reschedule limit (max 1 reschedule)
      if ((booking.rescheduleCount || 0) >= 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reschedule limit reached. Each booking can only be rescheduled once.'
        })
      }

      // 4. Check eligibility: <30 days before trip
      const tripStartDate = new Date(booking.trip!.startDate)
      const now = new Date()
      const daysUntilTrip = Math.floor(
        (tripStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysUntilTrip >= 30) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Rescheduling is only available less than 30 days before trip. Consider canceling for a refund instead.'
        })
      }

      if (tripStartDate <= now) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot reschedule - trip has already started'
        })
      }

      // 5. Validate new trip
      const newTrip = await ctx.prisma.trip.findUnique({
        where: { id: input.newTripId }
      })

      if (!newTrip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Selected trip not found'
        })
      }

      if (newTrip.packageId !== booking.packageId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'New trip must be for the same package type'
        })
      }

      if (newTrip.currentBookings >= newTrip.maxCapacity) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Selected trip is full. Please choose another trip.'
        })
      }

      // 6. Calculate price adjustment
      // Note: For MVP, assume same pricing. Future: calculate based on trip pricing
      const priceDifference = 0 // TODO: Implement dynamic pricing per trip
      let stripePaymentIntentId: string | null = null
      let stripeRefundId: string | null = null

      // 7. Process payment if price differs
      if (priceDifference > 0) {
        // Price increase: charge difference
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: priceDifference,
            currency: 'usd',
            customer: booking.payments[0]?.stripeCustomerId,
            metadata: {
              bookingId: booking.id,
              bookingReference: booking.bookingReference,
              type: 'reschedule_price_adjustment',
              originalTripId: booking.tripId!,
              newTripId: input.newTripId
            }
          })
          stripePaymentIntentId = paymentIntent.id
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Payment processing failed: ${error.message}`
          })
        }
      } else if (priceDifference < 0) {
        // Price decrease: issue refund
        const payment = booking.payments[0]
        if (payment?.stripePaymentIntentId) {
          try {
            const refund = await stripe.refunds.create({
              payment_intent: payment.stripePaymentIntentId,
              amount: Math.abs(priceDifference),
              reason: 'requested_by_customer',
              metadata: {
                bookingId: booking.id,
                type: 'reschedule_price_adjustment'
              }
            })
            stripeRefundId = refund.id
          } catch (error: any) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Refund processing failed: ${error.message}`
            })
          }
        }
      }

      // 8. Update booking and trip capacities atomically
      const updatedBooking = await ctx.prisma.$transaction(async (tx) => {
        // Decrement old trip capacity
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

        // Increment new trip capacity
        await tx.trip.update({
          where: { id: input.newTripId },
          data: {
            currentBookings: {
              increment: 1
            }
          }
        })

        // Update booking
        const updated = await tx.booking.update({
          where: { id: input.bookingId },
          data: {
            tripId: input.newTripId,
            totalPrice: booking.totalPrice + priceDifference,
            rescheduleCount: (booking.rescheduleCount || 0) + 1,
            rescheduledAt: new Date(),
            originalTripId: booking.tripId,
            updatedAt: new Date()
          },
          include: {
            trip: true
          }
        })

        // Create payment records if price changed
        if (priceDifference > 0 && stripePaymentIntentId) {
          await tx.payment.create({
            data: {
              bookingId: booking.id,
              amount: priceDifference,
              status: 'SUCCEEDED',
              stripePaymentIntentId,
              stripeCustomerId: booking.payments[0]?.stripeCustomerId
            }
          })
        } else if (priceDifference < 0 && stripeRefundId) {
          await tx.payment.create({
            data: {
              bookingId: booking.id,
              amount: priceDifference, // Negative amount
              status: 'REFUNDED',
              stripePaymentIntentId: stripeRefundId,
              stripeCustomerId: booking.payments[0]?.stripeCustomerId
            }
          })
        }

        return updated
      })

      // 9. Send reschedule confirmation email (non-blocking)
      // TODO: Implement email sending
      // sendRescheduleEmail(booking, updatedBooking.trip!).catch(console.error)

      return {
        success: true,
        newTrip: updatedBooking.trip,
        priceDifference,
        bookingReference: booking.bookingReference
      }
    })
})
```

**Trip Selection Query Pattern:**
```typescript
// lib/trpc/server/routers/trip.ts
export const tripRouter = router({
  getAvailableForReschedule: protectedProcedure
    .input(z.object({
      bookingId: z.string().uuid()
    }))
    .query(async ({ ctx, input }) => {
      // Get booking to check package type
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.bookingId },
        select: { packageId: true, userId: true }
      })

      if (!booking || booking.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Unauthorized'
        })
      }

      // Fetch future trips with same package and availability
      const trips = await ctx.prisma.trip.findMany({
        where: {
          packageId: booking.packageId,
          startDate: {
            gt: new Date() // Future trips only
          },
          currentBookings: {
            lt: ctx.prisma.trip.fields.maxCapacity // Has availability
          }
        },
        orderBy: {
          startDate: 'asc'
        },
        include: {
          package: {
            select: {
              name: true
            }
          }
        },
        take: 20 // Limit results
      })

      return trips.map(trip => ({
        id: trip.id,
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        location: trip.location,
        currentBookings: trip.currentBookings,
        maxCapacity: trip.maxCapacity,
        spotsAvailable: trip.maxCapacity - trip.currentBookings,
        packageName: trip.package.name
      }))
    })
})
```

**Key Implementation Points:**
1. **Reschedule Limit Enforcement:** Track rescheduleCount in database, enforce max 1 reschedule server-side
2. **Eligibility Window:** Only allow rescheduling in <30 days window (non-refundable period)
3. **Atomic Capacity Updates:** Use Prisma transactions to ensure trip capacity changes are atomic
4. **Price Adjustment:** For MVP, assume same pricing. Future enhancement: dynamic trip pricing
5. **Audit Trail:** Store originalTripId to track rescheduling history
6. **Authorization:** Always verify user owns booking before any operations

### Component Patterns

**Modal Component Pattern (using Radix UI Dialog):**
```typescript
'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Calendar } from 'lucide-react'

interface ReschedulingModalProps {
  bookingId: string
  bookingReference: string
  currentTripName: string
  currentTripStartDate: Date
  rescheduleCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ReschedulingModal({
  bookingId,
  bookingReference,
  currentTripName,
  currentTripStartDate,
  rescheduleCount,
  open,
  onOpenChange
}: ReschedulingModalProps) {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const router = useRouter()
  const utils = trpc.useUtils()

  // Fetch available trips
  const { data: trips, isLoading: tripsLoading } = trpc.trip.getAvailableForReschedule.useQuery(
    { bookingId },
    { enabled: open }
  )

  // Reschedule mutation
  const rescheduleMutation = trpc.booking.reschedule.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Booking rescheduled successfully! New trip: ${data.newTrip.name}`
      )
      utils.booking.getById.invalidate({ bookingId })
      onOpenChange(false)
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Rescheduling failed. Please try again.')
    }
  })

  const selectedTrip = trips?.find(t => t.id === selectedTripId)
  const hasRescheduleAvailable = rescheduleCount < 1

  const handleReschedule = () => {
    if (!selectedTripId) return
    rescheduleMutation.mutate({
      bookingId,
      newTripId: selectedTripId
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <Dialog.Title id="modal-title" className="text-2xl font-serif font-bold text-gray-900">
              Reschedule Booking
            </Dialog.Title>
            <p className="text-gray-600 mt-2">
              Booking: <strong>{bookingReference}</strong>
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Trip Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Current Trip</h3>
              <p className="text-sm text-gray-700">
                {currentTripName} - {new Date(currentTripStartDate).toLocaleDateString()}
              </p>
            </div>

            {/* Eligibility Status */}
            {hasRescheduleAvailable ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-green-700">
                  ✓ You have 1 reschedule available
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Select a new trip below to reschedule your booking.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-red-700">
                  Reschedule limit reached
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  You have already rescheduled this booking. Contact support for assistance.
                </p>
              </div>
            )}

            {/* Trip Selection */}
            {hasRescheduleAvailable && (
              <>
                <h3 className="font-semibold text-gray-900 mb-4">Select New Trip</h3>

                {tripsLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-ocean-blue" />
                    <span className="ml-2 text-gray-600">Loading available trips...</span>
                  </div>
                )}

                {!tripsLoading && trips && trips.length === 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600">No trips currently available for rescheduling.</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Please contact support for assistance.
                    </p>
                  </div>
                )}

                {!tripsLoading && trips && trips.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {trips.map((trip) => (
                      <button
                        key={trip.id}
                        onClick={() => setSelectedTripId(trip.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          selectedTripId === trip.id
                            ? 'border-ocean-blue bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{trip.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <Calendar className="inline h-4 w-4 mr-1" />
                              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {trip.location}
                            </p>
                          </div>
                          <div className="ml-4 text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {trip.spotsAvailable} spots left
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Price Adjustment Note */}
                {selectedTrip && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> No price adjustment for this reschedule.
                      Your booking total remains the same.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 justify-end">
            <Dialog.Close asChild>
              <button
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                disabled={rescheduleMutation.isPending}
              >
                Cancel
              </button>
            </Dialog.Close>
            {hasRescheduleAvailable && (
              <button
                onClick={handleReschedule}
                disabled={!selectedTripId || rescheduleMutation.isPending}
                className="px-4 py-2 text-white bg-ocean-blue hover:bg-ocean-blue/90 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {rescheduleMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {rescheduleMutation.isPending ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Form Libraries & Dependencies

**Required Packages:**
- `@radix-ui/react-dialog` - Accessible modal/dialog component (already installed from E3-S13)
- `sonner` - Toast notifications (already installed)
- `lucide-react` - Icons (Calendar, Loader2) (already installed)
- `stripe` - Stripe Node.js SDK (already installed)

**No new installations required** - all dependencies exist from previous stories.

### File Structure & Locations

**Files to Create:**
- `components/booking/rescheduling-modal.tsx` - Rescheduling modal component
- `lib/emails/templates/reschedule-confirmation.tsx` - Email template (optional for now)

**Files to Modify:**
- `prisma/schema.prisma` - Add reschedule tracking fields to Booking model
- `lib/trpc/server/routers/booking.ts` - Add `reschedule` mutation
- `lib/trpc/server/routers/trip.ts` - Add `getAvailableForReschedule` query
- `app/(dashboard)/dashboard/bookings/[id]/page.tsx` - Add "Reschedule Booking" button

**Database Migration Required:**
```bash
npx prisma migrate dev --name add-reschedule-tracking
npx prisma generate
```

### Testing Requirements

**Unit Tests:**
- Reschedule eligibility logic (<30 days, count limit)
- Trip capacity decrement/increment logic
- Price adjustment calculation (for future dynamic pricing)
- Authorization checks (user owns booking)

**Integration Tests:**
- Full reschedule flow (button → modal → mutation → success)
- Trip selection and confirmation
- Toast notifications
- Booking details page updates after reschedule
- Trip capacity management (test with full trips)
- Stripe payment/refund integration (if price adjustments enabled)

**TypeScript Validation:**
- Run `npx tsc --noEmit` - must pass with 0 errors
- All components properly typed
- No `any` types used
- Proper Prisma generated types

### UI/UX Design Specifications

**Colors (from architecture):**
- Primary: Ocean Blue (#003D5C)
- Accent: Gold (#D4AF37)
- Success: Emerald (#10B981)
- Info: Blue (#3B82F6)
- Error: Red (#EF4444)
- Background: Slate-50 to White gradient

**Typography:**
- Headings: Serif (Playfair Display via Tailwind `font-serif`)
- Body: Sans-serif (Inter via Tailwind `font-sans`)

**Modal Styling:**
- Modal overlay: `bg-black/50`
- Modal background: `bg-white`
- Modal max-width: `max-w-2xl` (wider for trip list)
- Modal padding: `p-6`
- Rounded corners: `rounded-lg`
- Shadow: `shadow-xl`
- Sticky header and footer for long trip lists

**Trip Card Styling:**
- Selected trip: `border-ocean-blue bg-blue-50`
- Unselected trip: `border-gray-200 hover:border-gray-300`
- Border width: `border-2`
- Padding: `p-4`
- Transition: `transition-colors`

**Button Styling:**
- Primary (Confirm): `bg-ocean-blue hover:bg-ocean-blue/90 text-white`
- Secondary (Cancel): `bg-gray-100 hover:bg-gray-200 text-gray-700`
- Disabled: `opacity-50 cursor-not-allowed`

### Previous Story Intelligence

**From E3-S13 (Booking Cancellation Flow - JUST COMPLETED):**
- ✅ Radix UI Dialog pattern works excellently for booking modals
- ✅ Sonner toast notifications provide great user feedback
- ✅ tRPC mutations with React Query handle state seamlessly
- ✅ Server-side calculation prevents client manipulation
- ✅ Atomic Prisma transactions ensure data consistency
- ✅ Trip capacity management pattern established (decrement on cancel)
- ✅ Stripe refund integration successful
- ✅ TypeScript strict mode: 0 errors achieved
- ✅ Mobile-responsive modal design working well

**Key Patterns to Replicate:**
1. **Authorization:** `ctx.userId === booking.userId` check in all mutations
2. **Atomic Operations:** Prisma `$transaction` for multi-table updates
3. **Error Handling:** Try-catch + TRPCError with user-friendly messages
4. **Loading States:** `mutation.isPending` for buttons and spinners
5. **React Query Invalidation:** `utils.booking.getById.invalidate()` after mutations
6. **Stripe Integration:** Wrap in try-catch, store transaction IDs in Payment records

**Rescheduling-Specific Learnings:**
- Use same modal pattern as cancellation but with trip selection
- Track reschedule count in database to enforce limits
- Decrement old trip + increment new trip capacity atomically
- Consider price adjustments (future enhancement)
- Provide clear eligibility messaging in UI

### Git Intelligence Summary

**Recent Patterns from Last Commit (72c9fbb):**
- Conventional commits: `feat: Booking Cancellation Flow (E3-S13 - 8 pts)`
- Detailed commit body explaining implementation
- TypeScript validation before commit
- Co-authored with Claude Code
- Story completion pattern: mark status as "done" in story file

**Files Modified in E3-S13 (Cancellation):**
- `lib/trpc/server/routers/booking.ts` - Added cancel mutation
- `components/booking/cancellation-modal.tsx` - Created modal
- `components/booking/cancel-booking-button.tsx` - Created button
- `app/(dashboard)/dashboard/bookings/[id]/page.tsx` - Integrated button
- `lib/email/sendgrid.ts` - Attempted lazy initialization fix

**Testing Approach from Recent Work:**
- TypeScript: `npx tsc --noEmit` (must pass with 0 errors)
- Build: `npm run build` (should succeed, SendGrid issue noted)
- Manual browser testing for user flows
- Stripe test mode for payment testing

### Latest Technical Information (Web Research)

**Stripe Payment Adjustments (2025 Best Practices):**
- For additional charges: Create new PaymentIntent with incremental amount
- For refunds: Use `stripe.refunds.create()` on original PaymentIntent
- Always include metadata for audit trail
- Best practice: Track all transactions in Payment records
- Source: [Stripe Payment Intents API](https://docs.stripe.com/api/payment_intents)

**Trip Capacity Management Pattern:**
- Use Prisma `increment` and `decrement` for atomic updates
- Always wrap capacity changes in transactions
- Check availability before incrementing (prevent overbooking)
- Pattern:
  ```typescript
  await tx.trip.update({
    where: { id },
    data: { currentBookings: { decrement: 1 } }
  })
  ```

**Radix UI Dialog Best Practices:**
- Use Portal for proper z-index layering
- Implement focus trap for accessibility
- Handle ESC key for quick close
- Use sticky headers/footers for long content
- Source: [Radix UI Dialog Documentation](https://www.radix-ui.com/primitives/docs/components/dialog)

### References

**Source Documents:**
- [Epics File: Epic 3, Story 14](/_bmad-output/solutioning/epics-and-stories-Pickleball-Passport-2025-12-28.md#L1027-L1050)
- [Prisma Schema: Booking Model](/prisma/schema.prisma#L285-L326)
- [Prisma Schema: Trip Model](/prisma/schema.prisma#L200-240) (approximate)
- [Previous Story: E3-S13 Booking Cancellation](/_bmad-output/implementation/3-13-booking-cancellation-flow.md)

**Related Stories:**
- E3-S13: Booking Cancellation Flow (COMPLETED - provides modal and Stripe patterns)
- E3-S16: Booking Modification (Change Add-Ons) - similar price adjustment logic
- E4-S4: Webhook Handler (future - for async payment confirmations)
- E11-S5: Payment Receipt Email (will send receipts for adjustments)

**Dependencies:**
- ✅ Booking details page exists (E3-S11, E3-S12)
- ✅ Stripe integration exists (E4-S1, E4-S2, E4-S3)
- ✅ Trip model and capacity tracking exists
- ✅ Radix UI Dialog and Sonner toast (E3-S13)
- ⚠️ SendGrid integration has known build issue (defer email AC)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

### File List
