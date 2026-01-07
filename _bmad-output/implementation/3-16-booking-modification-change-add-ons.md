# Story 3.16: Booking Modification (Change Add-Ons)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a guest before my trip,
I want to add or remove add-ons,
So that I can adjust my experience.

## Acceptance Criteria

### AC-1: Modify Booking Button Display (Eligibility Check)

- [ ] "Modify Booking" button displayed on Booking Details page ([app/(dashboard)/dashboard/bookings/[id]/page.tsx](app/(dashboard)/dashboard/bookings/[id]/page.tsx:187-214))
- [ ] Button placement: In action buttons section alongside Reschedule and Cancel buttons
- [ ] Button styling: `variant="outline"` (secondary action), blue theme color
- [ ] Button icon: `Edit` or `Settings` from lucide-react
- [ ] Button text: "Modify Add-Ons" or "Modify Booking"
- [ ] Eligibility rules (button visible only if ALL conditions met):
  - Booking status === `CONFIRMED`
  - Trip is assigned (`booking.trip` exists)
  - More than 60 days until trip start: `daysUntilTrip > 60`
  - Trip has not started: `tripStartDate > now`
- [ ] Button hidden if any eligibility condition fails
- [ ] Tooltip on hover explains eligibility (when disabled or hidden)
- [ ] Mobile-responsive layout (stacks vertically on small screens)

### AC-2: Modification Modal/Flow Entry Point

- [ ] Clicking "Modify Booking" opens modification confirmation modal
- [ ] Modal displays current booking summary:
  - Package name (locked - cannot change)
  - Duration (locked - cannot change)
  - Accommodation tier (locked - cannot change)
  - **Current add-ons** (modifiable) - list all selected add-ons
  - Current total price
- [ ] Modal explains modification rules:
  - "You can add or remove add-ons"
  - "Base package, duration, and accommodation cannot be changed"
  - "Price adjustments will be processed immediately"
- [ ] "Continue to Configurator" button navigates to modification flow
- [ ] "Cancel" button closes modal, no changes made
- [ ] Loading states during navigation

### AC-3: Locked Configurator Mode (Base Package/Duration/Accommodation)

- [ ] New route: `/app/booking/modify/[bookingId]/page.tsx`
- [ ] Load existing booking data from database
- [ ] Initialize booking store in **modification mode** with:
  - `isModificationMode: true`
  - `originalBookingId: bookingId`
  - `lockedPackageId: booking.packageId` (read-only)
  - `lockedDuration: booking.duration` (read-only)
  - `lockedAccommodationTier: booking.accommodationTier` (read-only)
  - `originalAddOns: booking.bookingAddOns` (for comparison)
- [ ] Package selector ([components/booking/package-selector.tsx](components/booking/package-selector.tsx)) in locked state:
  - Display selected package with checkmark
  - Gray out other packages
  - Disable selection (all packages non-interactive)
  - Tooltip: "Cannot change package in modification mode"
- [ ] Duration selector (if separate page) skipped or locked similarly
- [ ] Accommodation selector (if separate page) skipped or locked similarly
- [ ] Navigation flow: Skip directly to add-on selection pages

### AC-4: Add-On Selection (Medical, Cosmetic, Wellness, Cultural)

- [ ] Medical add-ons selector ([components/booking/medical-add-ons-selector.tsx](components/booking/medical-add-ons-selector.tsx)):
  - Pre-populate with current selections from `booking.bookingAddOns`
  - Enable full add/remove functionality
  - Multi-select checkboxes work normally
  - Visual indication of "currently selected" add-ons
- [ ] Wellness add-ons selector ([components/booking/wellness-add-ons-selector.tsx](components/booking/wellness-add-ons-selector.tsx)):
  - Same pre-population and modification capabilities
  - Independent from medical add-ons
- [ ] Real-time price difference calculation as user modifies selections:
  - Calculate: `newAddOnsTotal - originalAddOnsTotal`
  - Display: "Price Increase: +$XXX" (green) or "Price Decrease: -$XXX" (red)
  - Show both original and new totals for comparison
- [ ] "Changes Summary" panel shows:
  - **Added:** List of newly selected add-ons
  - **Removed:** List of deselected add-ons
  - **Unchanged:** Optional - show add-ons that remain selected

### AC-5: Pricing Summary Updates (Modification Mode)

- [ ] Pricing summary ([components/booking/pricing-summary.tsx](components/booking/pricing-summary.tsx)) displays:
  - **Original Total:** $X,XXX (grayed out, strikethrough)
  - **New Total:** $X,XXX (prominent, colored based on change)
  - **Price Adjustment:** Shows difference clearly:
    - If increase: "+ $XXX to charge" (red/orange)
    - If decrease: "- $XXX refund" (green)
    - If no change: "$0 - No payment adjustment" (neutral)
- [ ] Price difference calculated server-side for accuracy (client is preview only)
- [ ] Pricing updates in real-time as add-ons change
- [ ] Sticky pricing summary (stays visible while scrolling on mobile)

### AC-6: Modification Review Page

- [ ] Create review page: `/app/booking/modify/[bookingId]/review/page.tsx`
- [ ] Display comprehensive change summary:
  - Booking reference number
  - Package name (unchanged)
  - **Added add-ons:** Name, price (each)
  - **Removed add-ons:** Name, price (each)
  - **Original add-ons total:** $X,XXX
  - **New add-ons total:** $X,XXX
  - **Price difference:** $XXX (charge/refund)
- [ ] Payment adjustment section:
  - If price increase: "You will be charged $XXX"
  - If price decrease: "You will receive a refund of $XXX"
  - If no change: "No payment adjustment needed"
- [ ] Terms acceptance:
  - Checkbox: "I confirm these changes to my booking"
  - Explain modification policy (no refunds <60 days)
- [ ] "Confirm Modification" button (primary CTA)
  - Triggers tRPC mutation
  - Disabled until terms accepted
  - Loading state during processing
- [ ] "Back to Add-Ons" button (secondary action)

### AC-7: Server-Side Validation (tRPC booking.modify Mutation)

- [ ] New tRPC mutation: `booking.modify` in [lib/trpc/server/routers/booking.ts](lib/trpc/server/routers/booking.ts:1078+)
- [ ] Input schema (Zod validation):
  ```typescript
  z.object({
    bookingId: z.string().cuid(),
    addOnIds: z.array(z.string().cuid()), // Complete new list of add-on IDs
  })
  ```
- [ ] Authorization: Verify user owns booking (follow cancel/reschedule pattern)
- [ ] Validation checks:
  - Booking status === `CONFIRMED`
  - Trip is assigned
  - Calculate `daysUntilTrip` from `trip.startDate`
  - Verify `daysUntilTrip > 60`
  - Verify trip has not started: `tripStartDate > now`
  - Return clear error messages for each validation failure
- [ ] Fetch current booking with relations:
  ```typescript
  include: {
    bookingAddOns: { include: { addOn: true } },
    payments: true,
    trip: true,
    package: true,
  }
  ```
- [ ] Calculate price changes (server-side only - NEVER trust client):
  - `originalAddOnsTotal = sum(bookingAddOns.price)`
  - Fetch new add-ons from database
  - `newAddOnsTotal = sum(newAddOns.thPrice)`
  - `priceDifference = newAddOnsTotal - originalAddOnsTotal`

### AC-8: Stripe Payment Adjustment (Price Increase)

- [ ] **If `priceDifference > 0`:** Charge additional amount
- [ ] Create new Stripe PaymentIntent:
  ```typescript
  const paymentIntent = await stripe.paymentIntents.create({
    amount: priceDifference, // In cents
    currency: 'usd',
    customer: booking.payments[0]?.stripeCustomerId || undefined,
    metadata: {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      type: 'modification_price_adjustment',
      adjustmentReason: 'addons_modification',
    },
  })
  ```
- [ ] Return `clientSecret` to frontend for payment confirmation
- [ ] Frontend redirects to payment page with Stripe Elements
- [ ] After successful payment, webhook confirms payment
- [ ] Create Payment record in database:
  ```typescript
  {
    bookingId: booking.id,
    amount: priceDifference,
    status: 'SUCCEEDED',
    stripePaymentIntentId: paymentIntent.id,
    stripeCustomerId: customer.id,
  }
  ```

### AC-9: Stripe Refund Processing (Price Decrease)

- [ ] **If `priceDifference < 0`:** Issue partial refund
- [ ] Find original payment intent ID from booking.payments
- [ ] Create Stripe refund:
  ```typescript
  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
    amount: Math.abs(priceDifference), // Positive value in cents
    reason: 'requested_by_customer',
    metadata: {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      type: 'modification_price_adjustment',
      adjustmentReason: 'addons_removed',
    },
  })
  ```
- [ ] Create Payment record (negative amount):
  ```typescript
  {
    bookingId: booking.id,
    amount: priceDifference, // Negative value
    status: 'REFUNDED',
    stripePaymentIntentId: refund.id,
  }
  ```
- [ ] Refund appears on customer's card in 5-10 business days (Stripe standard)
- [ ] Display refund timeline to guest: "Refund of $XXX will appear on your card in 5-10 business days"

### AC-10: Atomic Database Update (Transaction)

- [ ] All database changes in single transaction: `prisma.$transaction()`
- [ ] Transaction steps:
  1. Delete all existing BookingAddOn records: `bookingAddOn.deleteMany({ where: { bookingId } })`
  2. Create new BookingAddOn records: `bookingAddOn.createMany({ data: newAddOns.map(...) })`
  3. Update Booking totals:
     ```typescript
     {
       addOnsTotal: newAddOnsTotal,
       totalPrice: booking.basePrice + booking.accommodationPrice + newAddOnsTotal,
       updatedAt: new Date(),
     }
     ```
  4. Create Payment record (if price adjustment made)
- [ ] If any step fails, rollback entire transaction (atomicity guarantee)
- [ ] Return success response with updated booking data

### AC-11: Modification Confirmation Email

- [ ] Create email template: [lib/email/templates/booking-modification.ts](lib/email/templates/booking-modification.ts)
- [ ] Template data interface:
  ```typescript
  {
    firstName: string,
    email: string,
    bookingReference: string,
    packageName: string,
    addedAddOns: Array<{ name: string, price: number }>,
    removedAddOns: Array<{ name: string, price: number }>,
    originalTotal: number,
    newTotal: number,
    priceDifference: number,
    adjustmentType: 'charge' | 'refund' | 'none',
    tripStartDate: string,
    tripEndDate: string,
    destination: string,
    portalUrl?: string,
  }
  ```
- [ ] Email content includes:
  - Subject: "Booking Modified - [Booking Reference]"
  - Header: "Your booking has been successfully modified!"
  - Change summary: Added/removed add-ons with prices
  - Updated pricing breakdown
  - Payment adjustment details:
    - If charged: "We've charged $XXX to your card ending in XXXX"
    - If refunded: "A refund of $XXX will appear on your card in 5-10 business days"
  - Updated trip summary (dates, destination)
  - Link to view updated booking details
  - Support contact information
- [ ] Send email via SendGrid: `sendBookingModification(email, data)`
- [ ] Email sending is non-blocking (mutation succeeds even if email fails)
- [ ] Log email delivery status for debugging

### AC-12: Success State & Redirect

- [ ] After successful modification, redirect to booking details page: `/dashboard/bookings/[id]`
- [ ] Display success toast notification: "Booking modified successfully!"
- [ ] Booking details page shows updated information:
  - Updated add-ons list
  - Updated total price
  - Payment history shows adjustment (charge or refund)
- [ ] "Modify Booking" button still visible (can modify again if >60 days)

### AC-13: Error Handling & User Feedback

- [ ] Client-side validation errors:
  - Show inline error messages
  - Prevent submission until resolved
  - Clear, actionable error text
- [ ] Server-side validation errors (tRPC errors):
  - `<60 days`: "Modifications are only allowed more than 60 days before your trip. Please contact support for assistance."
  - `Trip started`: "Cannot modify - your trip has already started. Please contact support."
  - `Not CONFIRMED`: "Only confirmed bookings can be modified."
  - `User doesn't own`: "Unauthorized" (generic security error)
- [ ] Stripe payment errors:
  - Card declined: "Payment declined. Please try a different card."
  - Network error: "Payment processing failed. Please try again."
  - Allow retry without losing changes
- [ ] Database errors:
  - Generic message: "Something went wrong. Please try again."
  - Log detailed error for debugging
  - Transaction rollback ensures data consistency
- [ ] Email delivery failure:
  - Don't fail mutation (booking is successfully modified)
  - Log failure for admin follow-up
  - Guest can see changes in booking details

### AC-14: Loading States & User Experience

- [ ] Modify button: Loading spinner during navigation
- [ ] Add-on selection: Debounced price recalculation (avoid excessive updates)
- [ ] Review page "Confirm" button:
  - Loading spinner during mutation
  - Text changes: "Confirming..." or "Processing Payment..."
  - Disable button during processing
  - Prevent double-submission
- [ ] Payment page: Stripe Elements loading state
- [ ] Success redirect: Brief loading indicator before redirect

### AC-15: Accessibility Requirements

- [ ] Modify button:
  - Accessible label: `aria-label="Modify booking add-ons"`
  - Keyboard accessible: Tab navigation, Enter to activate
- [ ] Modal:
  - Focus trap (Tab cycles within modal)
  - Escape key closes modal
  - Focus returns to trigger button on close
- [ ] Form inputs:
  - Proper labels with `htmlFor`
  - Error messages with `aria-describedby`
  - Required fields marked with `aria-required`
- [ ] Price changes:
  - Screen reader announcements: `role="status"` for dynamic updates
  - Color not sole indicator (use icons + text)
- [ ] Keyboard navigation throughout flow
- [ ] Color contrast meets WCAG AA: 4.5:1 for text

### AC-16: Mobile Responsiveness

- [ ] Modify button: Touch-friendly size (min 48px height)
- [ ] Configurator: Full-width on mobile (<640px)
- [ ] Add-on cards: Stack vertically on small screens
- [ ] Pricing summary: Sticky footer on mobile
- [ ] Review page: Single column layout on mobile
- [ ] Payment page: Stripe Elements mobile-optimized
- [ ] All touch targets: Adequate spacing (min 8px between)

## Tasks / Subtasks

- [ ] Task 1: Create ModifyBookingButton component (AC: 1)
  - [ ] Subtask 1.1: Create [components/booking/modify-booking-button.tsx](components/booking/modify-booking-button.tsx)
  - [ ] Subtask 1.2: Implement eligibility logic (>60 days, CONFIRMED, trip assigned)
  - [ ] Subtask 1.3: Add date calculation utility: `calculateDaysUntilDate(tripStartDate)`
  - [ ] Subtask 1.4: Add button styling (outline variant, blue theme, Edit icon)
  - [ ] Subtask 1.5: Add tooltip for disabled states
  - [ ] Subtask 1.6: Test mobile responsiveness

- [ ] Task 2: Create ModificationModal component (AC: 2)
  - [ ] Subtask 2.1: Create [components/booking/modification-modal.tsx](components/booking/modification-modal.tsx)
  - [ ] Subtask 2.2: Display current booking summary (package, add-ons, price)
  - [ ] Subtask 2.3: Show modification rules explanation
  - [ ] Subtask 2.4: Implement "Continue to Configurator" navigation
  - [ ] Subtask 2.5: Add accessibility attributes (focus trap, ARIA)
  - [ ] Subtask 2.6: Test keyboard navigation (Tab, Escape)

- [ ] Task 3: Update booking store for modification mode (AC: 3, 4)
  - [ ] Subtask 3.1: Add modification mode fields to [lib/stores/booking-store.ts](lib/stores/booking-store.ts):
    ```typescript
    isModificationMode: boolean
    originalBookingId: string | null
    originalAddOns: SelectedAddOn[]
    lockedPackageId: string | null
    lockedDuration: number | null
    lockedAccommodationTier: AccommodationTier | null
    ```
  - [ ] Subtask 3.2: Add price difference calculation method
  - [ ] Subtask 3.3: Add `enterModificationMode()` action to initialize state
  - [ ] Subtask 3.4: Add `exitModificationMode()` action to reset state
  - [ ] Subtask 3.5: Update localStorage persistence (exclude modification state)

- [ ] Task 4: Create modification entry route (AC: 3)
  - [ ] Subtask 4.1: Create [app/booking/modify/[bookingId]/page.tsx](app/booking/modify/[bookingId]/page.tsx)
  - [ ] Subtask 4.2: Fetch booking data with tRPC: `booking.getById`
  - [ ] Subtask 4.3: Initialize booking store with locked configurations
  - [ ] Subtask 4.4: Pre-populate add-on selections from current booking
  - [ ] Subtask 4.5: Redirect to add-ons selection (skip package/duration/accommodation)
  - [ ] Subtask 4.6: Add loading state while fetching booking

- [ ] Task 5: Update PackageSelector for locked mode (AC: 3)
  - [ ] Subtask 5.1: Detect modification mode in [components/booking/package-selector.tsx](components/booking/package-selector.tsx)
  - [ ] Subtask 5.2: Render locked state (display only, no interaction)
  - [ ] Subtask 5.3: Show selected package with checkmark and "locked" badge
  - [ ] Subtask 5.4: Gray out other packages with tooltip: "Cannot change package"
  - [ ] Subtask 5.5: Skip navigation if in modification mode

- [ ] Task 6: Update add-on selectors for pre-population (AC: 4)
  - [ ] Subtask 6.1: Update [components/booking/medical-add-ons-selector.tsx](components/booking/medical-add-ons-selector.tsx)
    - Detect modification mode
    - Pre-select add-ons from `store.originalAddOns`
    - Enable full add/remove functionality
  - [ ] Subtask 6.2: Update [components/booking/wellness-add-ons-selector.tsx](components/booking/wellness-add-ons-selector.tsx)
    - Same pre-population and modification capabilities
  - [ ] Subtask 6.3: Add visual indicator for "currently selected" add-ons
  - [ ] Subtask 6.4: Test add/remove functionality works correctly

- [ ] Task 7: Update pricing summary for modification mode (AC: 5)
  - [ ] Subtask 7.1: Update [components/booking/pricing-summary.tsx](components/booking/pricing-summary.tsx)
  - [ ] Subtask 7.2: Detect modification mode
  - [ ] Subtask 7.3: Display original total (grayed, strikethrough)
  - [ ] Subtask 7.4: Display new total (prominent)
  - [ ] Subtask 7.5: Show price difference with color coding:
    - Increase: Red/orange with "+" prefix
    - Decrease: Green with "-" prefix
    - No change: Neutral with "$0"
  - [ ] Subtask 7.6: Test real-time updates as add-ons change

- [ ] Task 8: Create modification review page (AC: 6)
  - [ ] Subtask 8.1: Create [app/booking/modify/[bookingId]/review/page.tsx](app/booking/modify/[bookingId]/review/page.tsx)
  - [ ] Subtask 8.2: Display comprehensive change summary (added/removed add-ons)
  - [ ] Subtask 8.3: Show price comparison (original vs new)
  - [ ] Subtask 8.4: Add payment adjustment explanation
  - [ ] Subtask 8.5: Add terms acceptance checkbox
  - [ ] Subtask 8.6: Implement "Confirm Modification" button with mutation trigger
  - [ ] Subtask 8.7: Add "Back to Add-Ons" navigation
  - [ ] Subtask 8.8: Test loading states and error handling

- [ ] Task 9: Create booking.modify tRPC mutation (AC: 7, 8, 9, 10)
  - [ ] Subtask 9.1: Add mutation to [lib/trpc/server/routers/booking.ts](lib/trpc/server/routers/booking.ts:1078+) after reschedule
  - [ ] Subtask 9.2: Define Zod input schema (`bookingId`, `addOnIds`)
  - [ ] Subtask 9.3: Implement authorization check (user owns booking)
  - [ ] Subtask 9.4: Implement validation checks:
    - Status === CONFIRMED
    - Trip assigned
    - >60 days until trip
    - Trip not started
  - [ ] Subtask 9.5: Calculate price difference (server-side only)
  - [ ] Subtask 9.6: Implement Stripe payment intent creation (if price increase)
  - [ ] Subtask 9.7: Implement Stripe refund creation (if price decrease)
  - [ ] Subtask 9.8: Implement atomic database transaction:
    - Delete old BookingAddOn records
    - Create new BookingAddOn records
    - Update Booking totals
    - Create Payment record
  - [ ] Subtask 9.9: Return success response with booking details

- [ ] Task 10: Create booking modification email template (AC: 11)
  - [ ] Subtask 10.1: Create [lib/email/templates/booking-modification.ts](lib/email/templates/booking-modification.ts)
  - [ ] Subtask 10.2: Follow pattern from [lib/email/templates/booking-confirmation.ts](lib/email/templates/booking-confirmation.ts)
  - [ ] Subtask 10.3: Design email HTML with sections:
    - Confirmation header
    - Change summary (added/removed add-ons)
    - Updated pricing breakdown
    - Payment adjustment details
    - Updated trip summary
    - Link to booking details
    - Support contact
  - [ ] Subtask 10.4: Add `sendBookingModification()` function to [lib/email/sendgrid.ts](lib/email/sendgrid.ts)
  - [ ] Subtask 10.5: Test email template with sample data

- [ ] Task 11: Integrate ModifyBookingButton into booking details page (AC: 1)
  - [ ] Subtask 11.1: Import ModifyBookingButton in [app/(dashboard)/dashboard/bookings/[id]/page.tsx](app/(dashboard)/dashboard/bookings/[id]/page.tsx)
  - [ ] Subtask 11.2: Add button to action buttons section (lines 187-214)
  - [ ] Subtask 11.3: Pass required props (bookingId, bookingReference, status, tripStartDate, currentAddOns)
  - [ ] Subtask 11.4: Test button visibility based on eligibility
  - [ ] Subtask 11.5: Verify mobile layout (buttons stack correctly)

- [ ] Task 12: End-to-end testing (AC: All)
  - [ ] Subtask 12.1: Test full modification flow (button → modal → configurator → review → payment)
  - [ ] Subtask 12.2: Test price increase scenario:
    - Add expensive add-ons
    - Verify payment page appears
    - Complete test payment
    - Verify booking updated
    - Verify email sent
  - [ ] Subtask 12.3: Test price decrease scenario:
    - Remove add-ons
    - Verify refund message appears
    - Verify refund processed in Stripe
    - Verify booking updated
    - Verify email sent
  - [ ] Subtask 12.4: Test no price change scenario:
    - Add and remove different add-ons (net zero)
    - Verify no payment action
    - Verify booking updated
  - [ ] Subtask 12.5: Test validation errors:
    - Attempt modification <60 days (should fail)
    - Attempt on non-CONFIRMED booking (should fail)
    - Attempt on started trip (should fail)
  - [ ] Subtask 12.6: Test accessibility:
    - Keyboard navigation (Tab through entire flow)
    - Screen reader announcements
    - Focus management
  - [ ] Subtask 12.7: Test mobile responsiveness on real device
  - [ ] Subtask 12.8: Test Stripe webhook handling for modification payments
  - [ ] Subtask 12.9: Run TypeScript validation: `npx tsc --noEmit` (0 errors)

## Dev Notes

### Architecture Requirements (MUST FOLLOW)

**Critical Implementation Pattern: Follow Reschedule Story (E3-S14)**

This story is essentially "reschedule for add-ons" - the patterns established in the reschedule mutation are EXACTLY what we need:
- Eligibility validation (>60 days check)
- Price adjustment logic (charge increase, refund decrease)
- Atomic database transactions
- Stripe integration patterns
- Email confirmation flow

**Reference File:** [lib/trpc/server/routers/booking.ts:845-1076](lib/trpc/server/routers/booking.ts:845-1076) - Reschedule mutation

### Database Schema (No Migration Needed)

All required fields already exist:
- `Booking` model has all necessary fields (no schema changes needed)
- `BookingAddOn` model is join table for booking ↔ add-on relationship
- `Payment` model handles both charges and refunds

**Booking → BookingAddOn Relationship:**
```prisma
model Booking {
  bookingAddOns BookingAddOn[]
  addOnsTotal   Int  // In cents
  totalPrice    Int  // In cents
}

model BookingAddOn {
  id        String  @id @default(cuid())
  bookingId String
  booking   Booking @relation(fields: [bookingId], references: [id])
  addOnId   String
  addOn     AddOn   @relation(fields: [addOnId], references: [id])
  quantity  Int     @default(1)
  price     Int     // Frozen price at time of booking (cents)
}
```

### tRPC Mutation Pattern (booking.modify)

**Location:** Add after reschedule mutation (line 1078+) in [lib/trpc/server/routers/booking.ts](lib/trpc/server/routers/booking.ts)

**Critical Implementation Notes:**
1. **NEVER trust client calculations** - Always recalculate prices server-side
2. **Use atomic transactions** - All database updates in single `$transaction()`
3. **Follow reschedule pattern exactly** - Eligibility checks, price adjustments, error handling
4. **Process payment BEFORE database updates** - If Stripe fails, don't modify booking
5. **Email is non-blocking** - Mutation succeeds even if email fails

**Input Schema:**
```typescript
const modifyBookingInput = z.object({
  bookingId: z.string().cuid(),
  addOnIds: z.array(z.string().cuid()), // Complete new list of add-on IDs
})
```

**Mutation Structure:**
```typescript
/**
 * Modify Booking Add-Ons (E3-S16)
 *
 * Allows guests to change add-ons (not base package) if >60 days before trip.
 * Follows same pattern as reschedule mutation for price adjustments.
 */
modify: guestProcedure
  .input(modifyBookingInput)
  .mutation(async ({ ctx, input }) => {
    // 1. AUTHORIZATION & VALIDATION (Lines ~20-80, follow reschedule pattern)

    // Fetch booking with relations
    const booking = await ctx.db.booking.findUnique({
      where: { id: input.bookingId },
      include: {
        bookingAddOns: { include: { addOn: true } },
        payments: { orderBy: { createdAt: 'desc' } },
        trip: true,
        package: true,
        user: { include: { guestProfile: true } },
      },
    })

    if (!booking) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' })
    }

    // Verify user owns booking
    if (booking.userId !== ctx.session.user.id) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    // Verify booking status
    if (booking.status !== 'CONFIRMED') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Only confirmed bookings can be modified',
      })
    }

    // Verify trip assigned
    if (!booking.trip) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No trip assigned to this booking',
      })
    }

    // Calculate days until trip
    const tripStartDate = new Date(booking.trip.startDate)
    const now = new Date()
    const daysUntilTrip = Math.floor(
      (tripStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Verify >60 days before trip
    if (daysUntilTrip <= 60) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Modifications are only allowed more than 60 days before trip. Please contact support for assistance.',
      })
    }

    // Verify trip not started
    if (tripStartDate <= now) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot modify - trip has already started',
      })
    }

    // 2. CALCULATE PRICE DIFFERENCE (Server-side only!)

    // Original add-ons total
    const originalAddOnsTotal = booking.bookingAddOns.reduce(
      (sum, ba) => sum + ba.price,
      0
    )

    // Fetch new add-ons from database
    const newAddOns = await ctx.db.addOn.findMany({
      where: { id: { in: input.addOnIds } },
    })

    if (newAddOns.length !== input.addOnIds.length) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Some add-ons not found',
      })
    }

    // Calculate new add-ons total
    const newAddOnsTotal = newAddOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)

    // Calculate price difference
    const priceDifference = newAddOnsTotal - originalAddOnsTotal

    // 3. PROCESS PAYMENT ADJUSTMENT (Follow reschedule pattern exactly)

    let stripePaymentIntentId: string | null = null
    let stripeRefundId: string | null = null

    if (priceDifference > 0) {
      // Price increased - charge difference
      const paymentIntent = await stripe.paymentIntents.create({
        amount: priceDifference,
        currency: 'usd',
        customer: booking.payments[0]?.stripeCustomerId || undefined,
        automatic_payment_methods: { enabled: true },
        metadata: {
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          type: 'modification_price_adjustment',
          adjustmentReason: 'addons_modification',
        },
      })

      stripePaymentIntentId = paymentIntent.id

      // Return client secret for payment confirmation on frontend
      return {
        requiresPayment: true,
        clientSecret: paymentIntent.client_secret,
        amount: priceDifference,
      }
    } else if (priceDifference < 0) {
      // Price decreased - issue refund
      const refund = await stripe.refunds.create({
        payment_intent: booking.payments[0].stripePaymentIntentId,
        amount: Math.abs(priceDifference),
        reason: 'requested_by_customer',
        metadata: {
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          type: 'modification_price_adjustment',
          adjustmentReason: 'addons_removed',
        },
      })

      stripeRefundId = refund.id
    }

    // 4. UPDATE DATABASE (Atomic transaction)

    const updatedBooking = await ctx.db.$transaction(async (tx) => {
      // Delete existing add-ons
      await tx.bookingAddOn.deleteMany({
        where: { bookingId: input.bookingId },
      })

      // Create new add-ons
      await tx.bookingAddOn.createMany({
        data: newAddOns.map((addOn) => ({
          bookingId: input.bookingId,
          addOnId: addOn.id,
          quantity: 1,
          price: addOn.thPrice,
        })),
      })

      // Update booking totals
      const updatedBooking = await tx.booking.update({
        where: { id: input.bookingId },
        data: {
          addOnsTotal: newAddOnsTotal,
          totalPrice: booking.basePrice + booking.accommodationPrice + newAddOnsTotal,
          updatedAt: new Date(),
        },
        include: {
          bookingAddOns: { include: { addOn: true } },
          trip: true,
          package: true,
        },
      })

      // Create payment record if adjustment made
      if (stripePaymentIntentId || stripeRefundId) {
        await tx.payment.create({
          data: {
            bookingId: input.bookingId,
            amount: priceDifference,
            status: priceDifference > 0 ? 'SUCCEEDED' : 'REFUNDED',
            stripePaymentIntentId: stripePaymentIntentId || stripeRefundId,
            stripeCustomerId: booking.payments[0]?.stripeCustomerId,
          },
        })
      }

      return updatedBooking
    })

    // 5. SEND CONFIRMATION EMAIL (Non-blocking)

    const guestFirstName = booking.user.guestProfile?.firstName || booking.user.email.split('@')[0]

    // Calculate added/removed add-ons for email
    const originalAddOnIds = booking.bookingAddOns.map((ba) => ba.addOnId)
    const newAddOnIds = input.addOnIds

    const addedAddOnIds = newAddOnIds.filter((id) => !originalAddOnIds.includes(id))
    const removedAddOnIds = originalAddOnIds.filter((id) => !newAddOnIds.includes(id))

    const addedAddOns = newAddOns.filter((addOn) => addedAddOnIds.includes(addOn.id))
    const removedAddOns = booking.bookingAddOns
      .filter((ba) => removedAddOnIds.includes(ba.addOnId))
      .map((ba) => ba.addOn)

    try {
      const { sendBookingModification } = await import('@/lib/email/sendgrid')

      await sendBookingModification(booking.user.email, {
        firstName: guestFirstName,
        email: booking.user.email,
        bookingReference: booking.bookingReference,
        packageName: booking.package.name,
        addedAddOns: addedAddOns.map((a) => ({ name: a.name, price: a.thPrice })),
        removedAddOns: removedAddOns.map((a) => ({ name: a.name, price: a.price })),
        originalTotal: booking.basePrice + booking.accommodationPrice + originalAddOnsTotal,
        newTotal: updatedBooking.totalPrice,
        priceDifference,
        adjustmentType: priceDifference > 0 ? 'charge' : priceDifference < 0 ? 'refund' : 'none',
        tripStartDate: booking.trip.startDate.toISOString(),
        tripEndDate: booking.trip.endDate.toISOString(),
        destination: booking.trip.destination,
      })
    } catch (emailError) {
      // Log but don't fail mutation
      console.error('Failed to send modification confirmation email:', emailError)
    }

    // 6. RETURN SUCCESS RESPONSE

    return {
      success: true,
      requiresPayment: false,
      priceDifference,
      adjustmentType: priceDifference > 0 ? 'charge' : priceDifference < 0 ? 'refund' : 'none',
      newAddOnsTotal,
      newTotalPrice: updatedBooking.totalPrice,
      bookingReference: booking.bookingReference,
    }
  })
```

### Stripe API Integration (2026 Best Practices)

**For Price Increases (Charge Additional Amount):**

Stripe does NOT support modifying existing charges. You MUST create a new PaymentIntent:
- **Method:** `stripe.paymentIntents.create()`
- **Amount:** Price difference only (not full new amount)
- **Customer:** Link to existing customer ID for payment method reuse
- **Metadata:** Include booking info and adjustment type

**Source:** [Stripe PaymentIntents API Documentation](https://docs.stripe.com/api/payment_intents)

**For Price Decreases (Partial Refund):**

Stripe supports partial refunds on existing charges:
- **Method:** `stripe.refunds.create()`
- **Amount:** Absolute value of price difference
- **Payment Intent:** Reference original payment intent ID
- **Reason:** `'requested_by_customer'`
- **Timeline:** 5-10 business days for refund to appear on card

**Important:** You CAN provide the PaymentIntent ID directly to the Refunds API (instead of Charge ID).

**Source:** [Stripe Refunds Documentation](https://docs.stripe.com/refunds)

**Critical Notes:**
- Cannot use incremental authorization (only works before capture)
- Cannot modify existing charge amount after creation
- Must create NEW payment intent for additional charges
- Refunds can be partial (specify amount) or full (omit amount)

**Sources:**
- [Payment Intents | Stripe API Reference](https://docs.stripe.com/api/payment_intents)
- [Refund and cancel payments | Stripe Documentation](https://docs.stripe.com/refunds)
- [Create a refund | Stripe API Reference](https://docs.stripe.com/api/refunds/create)

### Booking Store Modifications

**Add to [lib/stores/booking-store.ts](lib/stores/booking-store.ts):**

```typescript
interface BookingStore {
  // ... existing fields

  // Modification mode
  isModificationMode: boolean
  originalBookingId: string | null
  originalAddOns: SelectedAddOn[]
  lockedPackageId: string | null
  lockedDuration: number | null
  lockedAccommodationTier: AccommodationTier | null

  // Actions
  enterModificationMode: (booking: {
    bookingId: string
    packageId: string
    duration: number
    accommodationTier: AccommodationTier
    addOns: SelectedAddOn[]
  }) => void

  exitModificationMode: () => void

  calculatePriceDifference: () => number
}

// Implementation
enterModificationMode: (booking) => set({
  isModificationMode: true,
  originalBookingId: booking.bookingId,
  originalAddOns: booking.addOns,
  lockedPackageId: booking.packageId,
  lockedDuration: booking.duration,
  lockedAccommodationTier: booking.accommodationTier,
  selectedAddOns: booking.addOns, // Pre-populate current selections
}),

exitModificationMode: () => set({
  isModificationMode: false,
  originalBookingId: null,
  originalAddOns: [],
  lockedPackageId: null,
  lockedDuration: null,
  lockedAccommodationTier: null,
}),

calculatePriceDifference: () => {
  const state = get()
  const originalTotal = state.originalAddOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)
  const newTotal = state.selectedAddOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)
  return newTotal - originalTotal
},
```

### Date Validation Utility

**Create: [lib/utils/date-validation.ts](lib/utils/date-validation.ts)**

```typescript
/**
 * Calculate days until a future date
 */
export function calculateDaysUntilDate(targetDate: Date): number {
  return Math.floor(
    (new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
}

/**
 * Check if booking can be modified (>60 days before trip)
 */
export function canModifyBooking(
  tripStartDate: Date,
  bookingStatus: string
): { canModify: boolean; reason?: string } {
  const daysUntil = calculateDaysUntilDate(tripStartDate)

  if (bookingStatus !== 'CONFIRMED') {
    return { canModify: false, reason: 'Booking must be confirmed' }
  }

  if (new Date(tripStartDate) <= new Date()) {
    return { canModify: false, reason: 'Trip has already started' }
  }

  if (daysUntil <= 60) {
    return {
      canModify: false,
      reason: 'Modifications allowed only 60+ days before trip'
    }
  }

  return { canModify: true }
}
```

**Use this utility in:**
- `ModifyBookingButton` component (client-side)
- `booking.modify` mutation (server-side validation)

### Email Template Pattern

**Follow: [lib/email/templates/booking-confirmation.ts](lib/email/templates/booking-confirmation.ts)**

**Key sections to include:**
1. **Header:** "Booking Modified Successfully!"
2. **Change Summary:**
   - **Added:** Dental Implants ($3,000), Facial Rejuvenation ($2,000)
   - **Removed:** Hair Transplant ($4,500)
3. **Pricing:**
   - Original Add-Ons Total: $6,500
   - New Add-Ons Total: $5,500
   - Price Adjustment: **Refund of $1,000**
4. **Payment Details:**
   - "A refund of $1,000 will appear on your card ending in 4242 within 5-10 business days"
5. **Updated Booking:**
   - Booking Reference: #PBP-2026-001234
   - Package: Ultimate Wellness (unchanged)
   - Duration: 14 days (unchanged)
   - Trip Dates: March 15-29, 2026
6. **Next Steps:**
   - View updated booking details: [Link]
   - Questions? Contact support@pickleballpassport.com
7. **Footer:** Standard booking footer

### Component File Structure

**New Files to Create:**
1. [components/booking/modify-booking-button.tsx](components/booking/modify-booking-button.tsx) - Entry point button
2. [components/booking/modification-modal.tsx](components/booking/modification-modal.tsx) - Confirmation modal
3. [app/booking/modify/[bookingId]/page.tsx](app/booking/modify/[bookingId]/page.tsx) - Modification entry route
4. [app/booking/modify/[bookingId]/review/page.tsx](app/booking/modify/[bookingId]/review/page.tsx) - Review changes page
5. [lib/email/templates/booking-modification.ts](lib/email/templates/booking-modification.ts) - Email template
6. [lib/utils/date-validation.ts](lib/utils/date-validation.ts) - Date utilities

**Files to Modify:**
1. [lib/trpc/server/routers/booking.ts](lib/trpc/server/routers/booking.ts) - Add booking.modify mutation
2. [lib/stores/booking-store.ts](lib/stores/booking-store.ts) - Add modification mode state
3. [components/booking/package-selector.tsx](components/booking/package-selector.tsx) - Add locked state
4. [components/booking/medical-add-ons-selector.tsx](components/booking/medical-add-ons-selector.tsx) - Pre-population
5. [components/booking/wellness-add-ons-selector.tsx](components/booking/wellness-add-ons-selector.tsx) - Pre-population
6. [components/booking/pricing-summary.tsx](components/booking/pricing-summary.tsx) - Modification mode display
7. [app/(dashboard)/dashboard/bookings/[id]/page.tsx](app/(dashboard)/dashboard/bookings/[id]/page.tsx) - Add modify button
8. [lib/email/sendgrid.ts](lib/email/sendgrid.ts) - Add sendBookingModification function

### Previous Story Intelligence

**From E3-S13 (Booking Cancellation):**
- ✅ Atomic transaction pattern: `prisma.$transaction()` proven reliable
- ✅ Stripe refund pattern working well
- ✅ Date validation utility already exists (reuse for >60 days check)
- ✅ Toast notifications with Sonner library effective
- ✅ tRPC error handling pattern established

**From E3-S14 (Booking Rescheduling):**
- ✅ Price adjustment logic (charge/refund) pattern established - **THIS IS THE KEY PATTERN TO FOLLOW**
- ✅ Eligibility checks (<30 days for reschedule, >60 days for modification)
- ✅ Trip capacity management (not needed for modification)
- ✅ Payment intent creation for price increases works perfectly
- ✅ Refund creation for price decreases tested and working

**From E3-S15 (Referral Code Application):**
- ✅ Booking store updates pattern clear
- ✅ tRPC query with conditional execution (`enabled` flag) effective
- ✅ Success/error state handling in components proven
- ✅ Atomic transaction for booking + related records reliable

**Critical Pattern to Follow:**

The reschedule mutation (lines 845-1076) is the PERFECT template for this story:
- Same eligibility validation approach
- Same price adjustment logic
- Same Stripe integration patterns
- Same atomic transaction structure
- Same email confirmation flow

**Adapt reschedule mutation by:**
1. Change eligibility: `<30 days` → `>60 days`
2. Change what's modified: `trip assignment` → `add-ons`
3. Keep everything else the same: price adjustment, transactions, emails

### Git Intelligence Summary

**Recent Commit Patterns:**
- Conventional commit format: `feat: Implement E3-SXX Story Name`
- Detailed commit messages explaining business logic
- Co-authored with Claude Code signature
- TypeScript validation before commit: `npx tsc --noEmit`

**Recent Story Commits:**
- `feat: Implement E3-S15 Referral Code Application at Booking` (most recent)
- `feat: Implement E3-S14 Booking Rescheduling` (price adjustment pattern)
- `feat: Implement E3-S13 Booking Cancellation` (refund pattern)

**Pattern for This Story:**
```bash
git add .
git commit -m "feat: Implement E3-S16 Booking Modification (Change Add-Ons)

Allow guests to modify booking add-ons if >60 days before trip.
Supports add/remove add-ons with automatic price adjustments.
Price increase: Charge via Stripe PaymentIntent
Price decrease: Issue partial refund
Atomic database updates and email notifications.

🤖 Generated with Claude Code

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Testing Requirements

**Unit Tests:**
- Date validation utility (`calculateDaysUntilDate`, `canModifyBooking`)
- Price difference calculation (client preview vs server actual)
- Booking store modification mode actions

**Integration Tests (Critical):**
1. **Price Increase Flow:**
   - Add expensive add-ons ($5,000 increase)
   - Verify PaymentIntent created
   - Complete payment with Stripe test card
   - Verify booking updated atomically
   - Verify Payment record created
   - Verify email sent
2. **Price Decrease Flow:**
   - Remove expensive add-ons ($3,000 decrease)
   - Verify refund created in Stripe
   - Verify booking updated atomically
   - Verify Payment record created (negative amount)
   - Verify email sent with refund timeline
3. **No Price Change Flow:**
   - Swap add-ons (add $2K, remove $2K = $0 net)
   - Verify no Stripe call made
   - Verify booking updated
   - Verify email sent (shows swap, no payment change)
4. **Validation Errors:**
   - Attempt <60 days: Should fail with clear error
   - Attempt on PENDING booking: Should fail
   - Attempt on started trip: Should fail
   - Attempt with non-existent add-on IDs: Should fail
5. **Authorization:**
   - Attempt to modify another user's booking: Should fail (403)

**E2E Tests:**
- Full user journey: View booking → Click modify → Select add-ons → Review → Pay/Refund → Confirmation
- Mobile responsiveness testing on real device
- Accessibility testing with keyboard navigation and screen reader

**TypeScript Validation:**
```bash
npx tsc --noEmit
```
Must pass with 0 errors in modified files.

### UI/UX Design Specifications

**Colors (from architecture):**
- Primary action: Blue (`blue-600`: #2563EB)
- Success: Green (`green-600`: #16A34A)
- Error/Charge: Red (`red-600`: #DC2626)
- Neutral: Slate (`slate-600`: #475569)

**Button Styling:**
- Modify button: `variant="outline"` with blue accent
- Icon: `Edit` or `Settings` (lucide-react)
- Hover: Subtle blue background
- Disabled: Gray with reduced opacity

**Price Difference Display:**
- Increase: Red/orange background, "+" prefix, bold
- Decrease: Green background, "-" prefix, bold
- No change: Neutral gray, "$0" text

**Typography:**
- Headings: `text-2xl font-bold`
- Labels: `text-sm font-semibold`
- Body: `text-base`
- Help text: `text-sm text-slate-600`

### Risk Mitigation

**Risk 1: Price Calculation Discrepancy**
- **Mitigation:** Server calculation is source of truth. Client preview is informational only.
- **Validation:** Compare client preview to server result in tests.

**Risk 2: Race Conditions (Concurrent Modifications)**
- **Mitigation:** Use optimistic locking with `updatedAt` timestamp check.
- **Implementation:** Check `booking.updatedAt` hasn't changed before committing transaction.

**Risk 3: Payment Failure During Modification**
- **Mitigation:** Process payment BEFORE database updates. If Stripe fails, no booking changes.
- **Implementation:** Payment processing outside transaction, only commit DB if payment succeeds.

**Risk 4: Add-On Availability Change**
- **Mitigation:** Validate all add-on IDs still exist and are active before processing.
- **Error:** "Some selected add-ons are no longer available. Please refresh and try again."

**Risk 5: Email Delivery Failure**
- **Mitigation:** Email sending is non-blocking. Log failures for admin follow-up.
- **Impact:** Low - Guest can see changes in booking details page even without email.

### Performance Considerations

1. **Debounced Price Calculation:** Debounce add-on selection changes by 300ms before recalculating price
2. **Parallel Data Fetching:** Fetch booking details and available add-ons in parallel on modification entry
3. **Optimistic UI Updates:** Show add-on selection immediately, sync with server in background
4. **Lazy Load Components:** Code-split modification flow to reduce initial bundle size

### References

**Source Documents:**
- [Epics File: Epic 3, Story 16](/_bmad-output/solutioning/epics-and-stories-Pickleball-Passport-2025-12-28.md#L1075-L1097) - Story requirements
- [Booking Router: Reschedule Mutation](/lib/trpc/server/routers/booking.ts#L845-L1076) - Price adjustment pattern (KEY REFERENCE)
- [Booking Router: Cancel Mutation](/lib/trpc/server/routers/booking.ts#L637-L820) - Refund pattern
- [Cancellation Modal Component](/components/booking/cancellation-modal.tsx) - Date validation pattern
- [Reschedule Modal Component](/components/booking/rescheduling-modal.tsx) - Eligibility check pattern
- [Booking Store](/lib/stores/booking-store.ts) - State management pattern
- [Booking Confirmation Email](/lib/email/templates/booking-confirmation.ts) - Email template pattern

**Related Stories:**
- ✅ E3-S13: Booking Cancellation Flow - Refund processing pattern
- ✅ E3-S14: Booking Rescheduling - Price adjustment pattern (CRITICAL REFERENCE)
- ✅ E3-S15: Referral Code Application - Booking store updates, tRPC patterns
- ✅ E3-S1 to E3-S5: Package Configurator - Add-on selection UI
- ✅ E3-S12: Booking Details Page - Where modify button goes

**External Documentation:**
- [Stripe PaymentIntents API](https://docs.stripe.com/api/payment_intents) - Creating additional charges
- [Stripe Refunds API](https://docs.stripe.com/api/refunds/create) - Partial refund processing
- [Stripe Refunds Documentation](https://docs.stripe.com/refunds) - Refund best practices and timelines

**Dependencies:**
- ✅ Booking model exists with all required fields
- ✅ BookingAddOn model exists for add-on tracking
- ✅ Payment model supports both charges and refunds
- ✅ Stripe integration functional (tested in E3-S13, E3-S14, E4-S1 to E4-S5)
- ✅ Email system functional (tested in E3-S13, E3-S14, E11-S1, E11-S2)
- ✅ Package configurator components exist and working
- ✅ Date validation utilities exist (from cancellation/reschedule)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

**Files to Create:**
1. components/booking/modify-booking-button.tsx
2. components/booking/modification-modal.tsx
3. app/booking/modify/[bookingId]/page.tsx
4. app/booking/modify/[bookingId]/review/page.tsx
5. lib/email/templates/booking-modification.ts
6. lib/utils/date-validation.ts

**Files to Modify:**
1. lib/trpc/server/routers/booking.ts
2. lib/stores/booking-store.ts
3. components/booking/package-selector.tsx
4. components/booking/medical-add-ons-selector.tsx
5. components/booking/wellness-add-ons-selector.tsx
6. components/booking/pricing-summary.tsx
7. app/(dashboard)/dashboard/bookings/[id]/page.tsx
8. lib/email/sendgrid.ts
