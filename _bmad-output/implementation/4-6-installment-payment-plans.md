# Story 4.6: Installment Payment Plans

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a guest,
I want to choose an installment plan,
So that I can spread payments over time and make expensive medical tourism packages more accessible.

## Acceptance Criteria

### AC-1: Payment Plan Selection UI

- [ ] On booking review page: "Payment Options" section displayed prominently
- [ ] Three payment options presented as radio cards:
  1. **Pay in Full** (Recommended)
     - 2% discount applied automatically
     - Single payment today
     - Badge: "Save 2%"
  2. **4-Payment Installment Plan**
     - No additional fees
     - Spread over time before trip
     - Badge: "Most Popular"
  3. **Financing** (Affirm - Future)
     - Monthly payments available
     - Badge: "Coming Soon" (disabled initially)
- [ ] Each option displays:
  - Total amount (with discount if applicable)
  - Payment schedule summary
  - Call-to-action button
- [ ] Selected option highlighted with blue border
- [ ] Default selection: "Pay in Full"
- [ ] Mobile-responsive: Stack vertically on small screens

### AC-2: Installment Schedule Display

- [ ] When "4-Payment Installment Plan" selected, show detailed schedule:
  - **Installment 1** (Today): 50% of total - Due immediately
  - **Installment 2** (60 days before trip): 25% of total - Auto-charged on [date]
  - **Installment 3** (30 days before trip): 15% of total - Auto-charged on [date]
  - **Installment 4** (7 days before trip): 10% of total - Auto-charged on [date]
- [ ] Calculate dates based on selected trip start date
- [ ] Display each installment with:
  - Installment number (1 of 4, 2 of 4, etc.)
  - Amount in dollars (formatted with $)
  - Due date (formatted: "Jan 15, 2026")
  - Payment status indicator
- [ ] Show total at bottom: "Total: $X,XXX (4 installments)"
- [ ] Help text: "Payments 2-4 will be automatically charged to your saved payment method on the scheduled dates. You'll receive email reminders 7 days before each payment."
- [ ] Validation: Trip must be at least 70 days away to qualify for installment plan
- [ ] Error message if trip too soon: "Installment plans require booking at least 70 days before departure. Please choose 'Pay in Full'."

### AC-3: Full Payment Discount Calculation

- [ ] When "Pay in Full" selected, apply 2% discount automatically
- [ ] Display:
  - Original subtotal: $X,XXX
  - Discount (2%): -$XX
  - **Total due today:** $X,XXX (bold, prominent)
- [ ] Discount calculated on total booking price (package + add-ons)
- [ ] Discount amount rounded to nearest dollar
- [ ] Help text: "Save 2% by paying in full today!"
- [ ] Discount persists through payment flow
- [ ] Receipt reflects discount as line item

### AC-4: Database Schema for Installment Plans

- [ ] Update Booking model with payment plan field:
  ```prisma
  model Booking {
    // Existing fields...

    // Payment Plan (E4-S6)
    paymentPlan PaymentPlan @default(FULL)

    // Relations
    payments Payment[] // One-to-many relationship
  }

  enum PaymentPlan {
    FULL              // Pay in full (2% discount)
    INSTALLMENT_4     // 4 payments (50%, 25%, 15%, 10%)
    FINANCING         // Affirm financing (future)
  }
  ```
- [ ] Payment model already supports installment tracking (from previous stories):
  - `isInstallment` Boolean field
  - `installmentNumber` Int (1-4)
  - `scheduledDate` DateTime
  - `status` PaymentStatus (PENDING, SUCCEEDED, FAILED)
- [ ] Migration command: `npx prisma migrate dev --name add-payment-plan-enum`

### AC-5: Installment Plan Creation Logic

- [ ] When user selects "4-Payment Installment Plan" and completes booking:
  1. Create Booking with `paymentPlan = INSTALLMENT_4`
  2. Calculate 4 installment amounts based on percentages:
     - Installment 1: 50% of total
     - Installment 2: 25% of total
     - Installment 3: 15% of total
     - Installment 4: 10% of total
  3. Round each installment to nearest dollar
  4. Adjust last installment to ensure sum equals exact total (handle rounding)
  5. Calculate scheduled dates:
     - Installment 1: Today (immediate charge)
     - Installment 2: Trip start date - 60 days
     - Installment 3: Trip start date - 30 days
     - Installment 4: Trip start date - 7 days
  6. Create 4 Payment records in database:
     - Payment 1: status = PENDING, amount = 50%, scheduledDate = today, isInstallment = true, installmentNumber = 1
     - Payments 2-4: status = PENDING, amounts per schedule, isInstallment = true, installmentNumber = 2-4
- [ ] First installment charged immediately via Stripe PaymentIntent
- [ ] Remaining installments scheduled for automatic charging (Story 4-7)
- [ ] Save Stripe customer ID for future charges
- [ ] Transaction is atomic (all payment records created or none)

### AC-6: Full Payment Creation Logic

- [ ] When user selects "Pay in Full":
  1. Calculate discount: total * 0.02 (2%)
  2. Discounted total: original total - discount
  3. Create Booking with `paymentPlan = FULL`
  4. Create single Payment record:
     - status = PENDING
     - amount = discounted total
     - scheduledDate = today
     - isInstallment = false
     - installmentNumber = null
- [ ] Charge full amount immediately via Stripe PaymentIntent
- [ ] Discount reflected in booking total price
- [ ] Receipt shows discount as line item

### AC-7: Payment Form Integration

- [ ] Update payment form (Stripe Elements) to handle selected payment plan
- [ ] If installment plan:
  - Display: "First Installment: $X,XXX due today"
  - Save payment method for future charges (Stripe SetupIntent)
  - Checkbox: "I authorize automatic charges for remaining installments" (required)
  - Help text: "Your card will be securely saved for scheduled payments. You can update your payment method anytime in your dashboard."
- [ ] If full payment:
  - Display: "Total due today: $X,XXX (includes 2% discount)"
  - Standard payment flow (no saved method required)
- [ ] After successful payment:
  - Update first Payment record status to SUCCEEDED
  - Store Stripe PaymentIntent ID
  - Store Stripe Customer ID (for installments)
  - Send confirmation email with payment plan details

### AC-8: Stripe Customer Creation (for Installments)

- [ ] When installment plan selected, create Stripe Customer:
  ```typescript
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user.id,
      bookingId: booking.id,
    }
  })
  ```
- [ ] Save Stripe Customer ID to Booking record
- [ ] Attach payment method to customer for future charges
- [ ] Use SetupIntent to save payment method without charging:
  ```typescript
  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types: ['card'],
  })
  ```
- [ ] After first payment succeeds, retrieve and save payment method ID
- [ ] Set saved payment method as default for customer

### AC-9: Booking Confirmation Email Updates

- [ ] Update booking confirmation email template to include payment plan details
- [ ] If INSTALLMENT_4:
  - Section: "Payment Plan: 4 Installments"
  - Display installment schedule with dates and amounts
  - Show first payment charged today
  - Show upcoming scheduled payments
  - Include reminder: "You'll receive email reminders 7 days before each automatic payment"
  - Link to update payment method in dashboard
- [ ] If FULL:
  - Section: "Payment: Paid in Full"
  - Show discount amount: "You saved $XX with our 2% full payment discount!"
  - Show total amount charged
  - Receipt link

### AC-10: Validation and Business Rules

- [ ] **Trip Date Validation:**
  - Installment plan only available if trip start date >= 70 days from today
  - If < 70 days: Hide installment option, show only "Pay in Full"
  - Error message: "Installment plans require at least 70 days before departure."
- [ ] **Amount Validation:**
  - Calculate installment amounts in cents to avoid rounding errors
  - Ensure sum of 4 installments equals exact booking total
  - Adjust final installment if needed (add/subtract 1-3 cents)
- [ ] **Trip Selection Validation:**
  - User must select trip before payment plan options shown
  - If no trip selected: Disable installment option with message "Select a trip date first"
- [ ] **Payment Method Validation:**
  - For installments: Verify card is valid and can be saved
  - Decline pre-paid cards or cards that can't be used for recurring charges
  - Error message: "This card type cannot be used for installment plans. Please use a different card or choose 'Pay in Full'."
- [ ] **Rounding Precision:**
  - All calculations in cents (multiply by 100 before rounding)
  - Convert to dollars for display only
  - Store amounts in database as cents (integer)

### AC-11: Error Handling

- [ ] **Stripe Customer Creation Fails:**
  - Retry once
  - If still fails: Fall back to single payment, inform user
  - Error message: "We couldn't set up installments. Please pay in full or try again."
- [ ] **First Installment Payment Fails:**
  - Show Stripe error to user (card declined, insufficient funds, etc.)
  - Do not create booking
  - Allow user to retry with different card
  - Clear error message: "Payment failed: [reason]. Please try a different card."
- [ ] **Payment Method Cannot Be Saved:**
  - Prevent installment plan selection
  - Force "Pay in Full" option
  - Inform user: "Your card cannot be saved for future payments. Please pay in full."
- [ ] **Trip Date Changed After Plan Selected:**
  - If new trip date < 70 days: Invalidate installment plan selection
  - Show warning: "The new trip date doesn't allow installments. Please select a different date or pay in full."
  - Re-display payment options

### AC-12: Dashboard Display - Installment Plan Status

- [ ] On guest dashboard, booking card shows payment plan status
- [ ] If INSTALLMENT_4:
  - Badge: "Installment Plan" (blue)
  - Display: "2 of 4 payments complete" (example)
  - Progress bar: Visual representation of payments made
  - Link: "View payment schedule"
- [ ] If FULL:
  - Badge: "Paid in Full" (green)
  - No additional payment info needed
- [ ] Click booking → View detailed payment schedule on booking details page

### AC-13: Booking Details Page - Payment Schedule

- [ ] On booking details page (`/dashboard/bookings/[id]`):
  - Section: "Payment Schedule"
  - If INSTALLMENT_4:
    - Table with columns: Installment, Amount, Due Date, Status, Actions
    - Rows for each of 4 payments:
      - ✅ Installment 1: $X,XXX | Jan 1, 2026 | PAID | View Receipt
      - ⏳ Installment 2: $X,XXX | Mar 1, 2026 | SCHEDULED | -
      - ⏳ Installment 3: $X,XXX | Apr 1, 2026 | SCHEDULED | -
      - ⏳ Installment 4: $X,XXX | Apr 24, 2026 | SCHEDULED | -
    - Status icons: ✅ PAID (green), ⏳ SCHEDULED (blue), ❌ FAILED (red)
    - For failed payments: "Retry Payment" button
    - Outstanding balance displayed: "Remaining: $X,XXX"
  - If FULL:
    - Single row: "Paid in Full: $X,XXX on [date]"
    - Download Receipt button
- [ ] Link to update payment method: "Update Payment Method" (for installments)

### AC-14: Gift Bookings and Companion Bookings with Installments

- [ ] **Gift Bookings:** Installment plans NOT allowed for gift bookings
  - Purchaser must pay in full (no discount for gifts)
  - Disable installment option if `isGift = true`
  - Help text: "Gift bookings must be paid in full"
- [ ] **Companion Bookings:** Installment plans allowed
  - Each companion has separate booking and payment plan choice
  - Primary and companion can choose different payment plans
  - Installments scheduled independently for each booking

### AC-15: Accessibility Requirements

- [ ] Payment option cards:
  - Keyboard accessible (Tab to navigate, Space to select)
  - Screen reader announces: "Pay in Full, radio button, unchecked, Save 2%"
  - ARIA attributes: `role="radio"`, `aria-checked`, `aria-describedby`
- [ ] Installment schedule:
  - Table uses semantic HTML (thead, tbody, th, td)
  - Screen reader announces row headers
  - Payment status icons have text labels (not just colors)
- [ ] Authorization checkbox:
  - Label clearly associated with checkbox
  - Error message linked with `aria-describedby`
  - Required field validation announced
- [ ] Color contrast: All text meets WCAG AA (4.5:1)
- [ ] Focus indicators: Visible on all interactive elements

### AC-16: Mobile Responsiveness

- [ ] Payment option cards: Stack vertically on screens < 768px
- [ ] Installment schedule table: Horizontal scroll or card layout on mobile
- [ ] Each installment displays as card on mobile:
  - Installment number and status icon (top)
  - Amount (large, prominent)
  - Due date (below amount)
  - Action button (bottom)
- [ ] All touch targets: Minimum 48px with 8px spacing
- [ ] Payment form: Full-width on mobile, comfortable input sizes

## Tasks / Subtasks

- [ ] Task 1: Update database schema (AC: 4)
  - [ ] Subtask 1.1: Add PaymentPlan enum to schema.prisma (FULL, INSTALLMENT_4, FINANCING)
  - [ ] Subtask 1.2: Add paymentPlan field to Booking model
  - [ ] Subtask 1.3: Run migration: `npx prisma migrate dev --name add-payment-plan-enum`
  - [ ] Subtask 1.4: Verify migration in database
  - [ ] Subtask 1.5: Regenerate Prisma client

- [ ] Task 2: Create payment plan selection component (AC: 1, 2, 3)
  - [ ] Subtask 2.1: Create components/booking/payment-plan-selector.tsx
  - [ ] Subtask 2.2: Implement three radio card options (Full, Installment, Financing)
  - [ ] Subtask 2.3: Add discount calculation for "Pay in Full" option (2%)
  - [ ] Subtask 2.4: Add installment schedule display component
  - [ ] Subtask 2.5: Calculate installment dates based on trip start date
  - [ ] Subtask 2.6: Add trip date validation (70 days minimum)
  - [ ] Subtask 2.7: Integrate with booking store
  - [ ] Subtask 2.8: Add help text and badges to each option
  - [ ] Subtask 2.9: Test mobile responsiveness

- [ ] Task 3: Update booking store for payment plans (AC: 1, 2)
  - [ ] Subtask 3.1: Add paymentPlan field to booking store ('FULL' | 'INSTALLMENT_4' | 'FINANCING')
  - [ ] Subtask 3.2: Add action: setPaymentPlan(plan)
  - [ ] Subtask 3.3: Add computed value: discountedTotal (if FULL, apply 2% discount)
  - [ ] Subtask 3.4: Add computed value: installmentSchedule (4 payments with amounts and dates)
  - [ ] Subtask 3.5: Add validation: canUseInstallments (trip >= 70 days away)
  - [ ] Subtask 3.6: Update localStorage persistence

- [ ] Task 4: Create installment calculation utility (AC: 5, 6)
  - [ ] Subtask 4.1: Create lib/utils/installment-calculator.ts
  - [ ] Subtask 4.2: Function: calculateInstallmentAmounts(total: number): number[]
    - Returns [50%, 25%, 15%, 10%] with rounding adjustment
  - [ ] Subtask 4.3: Function: calculateInstallmentDates(tripStartDate: Date): Date[]
    - Returns [today, -60 days, -30 days, -7 days]
  - [ ] Subtask 4.4: Function: calculateFullPaymentDiscount(total: number): { discount: number, discountedTotal: number }
  - [ ] Subtask 4.5: Add unit tests for all calculation functions
  - [ ] Subtask 4.6: Handle edge cases (rounding, leap years, timezone)

- [ ] Task 5: Update booking.create tRPC mutation (AC: 5, 6, 8)
  - [ ] Subtask 5.1: Add paymentPlan field to input schema
  - [ ] Subtask 5.2: Validate trip date for installment plans (>= 70 days)
  - [ ] Subtask 5.3: If FULL: Apply 2% discount to booking total
  - [ ] Subtask 5.4: If INSTALLMENT_4: Create Stripe Customer
  - [ ] Subtask 5.5: If INSTALLMENT_4: Calculate 4 installment amounts
  - [ ] Subtask 5.6: If INSTALLMENT_4: Create 4 Payment records with scheduled dates
  - [ ] Subtask 5.7: If FULL: Create single Payment record
  - [ ] Subtask 5.8: Create Stripe PaymentIntent for first payment
  - [ ] Subtask 5.9: Return clientSecret for payment form
  - [ ] Subtask 5.10: Handle Stripe customer creation errors

- [ ] Task 6: Update payment form component (AC: 7, 8)
  - [ ] Subtask 6.1: Update app/booking/payment/page.tsx
  - [ ] Subtask 6.2: Detect selected payment plan from booking store
  - [ ] Subtask 6.3: If INSTALLMENT_4: Create Stripe SetupIntent
  - [ ] Subtask 6.4: If INSTALLMENT_4: Add authorization checkbox
  - [ ] Subtask 6.5: If INSTALLMENT_4: Display first installment amount
  - [ ] Subtask 6.6: If FULL: Display discounted total
  - [ ] Subtask 6.7: After payment succeeds: Save payment method to customer
  - [ ] Subtask 6.8: Update payment confirmation handling
  - [ ] Subtask 6.9: Test payment flows for both plans

- [ ] Task 7: Create Stripe customer creation utility (AC: 8)
  - [ ] Subtask 7.1: Create lib/stripe/create-customer.ts
  - [ ] Subtask 7.2: Function: createStripeCustomer(user, booking)
  - [ ] Subtask 7.3: Function: attachPaymentMethod(customerId, paymentMethodId)
  - [ ] Subtask 7.4: Function: setDefaultPaymentMethod(customerId, paymentMethodId)
  - [ ] Subtask 7.5: Add error handling and retry logic
  - [ ] Subtask 7.6: Store customer ID in booking record

- [ ] Task 8: Update booking confirmation email (AC: 9)
  - [ ] Subtask 8.1: Update lib/email/templates/booking-confirmation.ts
  - [ ] Subtask 8.2: Add conditional section for INSTALLMENT_4 plan
  - [ ] Subtask 8.3: Display installment schedule in email
  - [ ] Subtask 8.4: Add reminder text about automatic charges
  - [ ] Subtask 8.5: Add link to update payment method
  - [ ] Subtask 8.6: Add conditional section for FULL plan (show discount)
  - [ ] Subtask 8.7: Test email rendering for both payment plans

- [ ] Task 9: Update guest dashboard bookings list (AC: 12)
  - [ ] Subtask 9.1: Update components/dashboard/bookings-list.tsx
  - [ ] Subtask 9.2: Query bookings with payment plan and payment count
  - [ ] Subtask 9.3: Display "Installment Plan" badge if INSTALLMENT_4
  - [ ] Subtask 9.4: Display "Paid in Full" badge if FULL
  - [ ] Subtask 9.5: Show payment progress (e.g., "2 of 4 payments complete")
  - [ ] Subtask 9.6: Add progress bar component for installments
  - [ ] Subtask 9.7: Test with different payment plan statuses

- [ ] Task 10: Create payment schedule view (AC: 13)
  - [ ] Subtask 10.1: Create components/booking/payment-schedule.tsx
  - [ ] Subtask 10.2: Query all Payment records for booking
  - [ ] Subtask 10.3: Display table with installment details
  - [ ] Subtask 10.4: Add status icons (✅ PAID, ⏳ SCHEDULED, ❌ FAILED)
  - [ ] Subtask 10.5: Add "View Receipt" links for completed payments
  - [ ] Subtask 10.6: Show outstanding balance
  - [ ] Subtask 10.7: Add mobile-friendly card layout
  - [ ] Subtask 10.8: Integrate into booking details page

- [ ] Task 11: Update booking review page (AC: 1, 2, 3)
  - [ ] Subtask 11.1: Update app/booking/review/page.tsx
  - [ ] Subtask 11.2: Add "Payment Options" section
  - [ ] Subtask 11.3: Integrate PaymentPlanSelector component
  - [ ] Subtask 11.4: Show selected plan summary
  - [ ] Subtask 11.5: Display total with discount if applicable
  - [ ] Subtask 11.6: Validate trip date before showing installment option
  - [ ] Subtask 11.7: Test review flow with both payment plans

- [ ] Task 12: Add validation and error handling (AC: 10, 11)
  - [ ] Subtask 12.1: Implement trip date validation (70 days minimum)
  - [ ] Subtask 12.2: Add amount rounding validation (sum equals total)
  - [ ] Subtask 12.3: Validate trip selection before payment plan selection
  - [ ] Subtask 12.4: Add payment method validation for installments
  - [ ] Subtask 12.5: Handle Stripe customer creation errors
  - [ ] Subtask 12.6: Handle first payment failure
  - [ ] Subtask 12.7: Add trip date change validation
  - [ ] Subtask 12.8: Implement user-friendly error messages

- [ ] Task 13: Handle gift and companion booking rules (AC: 14)
  - [ ] Subtask 13.1: Disable installment option if isGift = true
  - [ ] Subtask 13.2: Show help text for gift bookings
  - [ ] Subtask 13.3: Allow independent payment plans for companion bookings
  - [ ] Subtask 13.4: Test gift booking payment flow
  - [ ] Subtask 13.5: Test companion booking payment flows

- [ ] Task 14: Add accessibility features (AC: 15)
  - [ ] Subtask 14.1: Add keyboard navigation to payment option cards
  - [ ] Subtask 14.2: Add ARIA attributes to radio buttons
  - [ ] Subtask 14.3: Add screen reader labels to status icons
  - [ ] Subtask 14.4: Ensure semantic HTML in payment schedule table
  - [ ] Subtask 14.5: Test with screen reader (VoiceOver/NVDA)
  - [ ] Subtask 14.6: Verify color contrast ratios
  - [ ] Subtask 14.7: Add focus indicators to all interactive elements

- [ ] Task 15: Test mobile responsiveness (AC: 16)
  - [ ] Subtask 15.1: Test payment option cards on mobile (vertical stack)
  - [ ] Subtask 15.2: Test installment schedule table on mobile (card layout)
  - [ ] Subtask 15.3: Test payment form on mobile
  - [ ] Subtask 15.4: Verify all touch targets are 48px minimum
  - [ ] Subtask 15.5: Test on actual mobile devices (iOS, Android)

- [ ] Task 16: End-to-end testing (AC: All)
  - [ ] Subtask 16.1: Test full payment flow (with discount)
  - [ ] Subtask 16.2: Test installment plan flow (4 payments created)
  - [ ] Subtask 16.3: Test trip date validation (70 days)
  - [ ] Subtask 16.4: Test Stripe customer creation
  - [ ] Subtask 16.5: Test payment method saving
  - [ ] Subtask 16.6: Test booking confirmation email for both plans
  - [ ] Subtask 16.7: Test dashboard display for both plans
  - [ ] Subtask 16.8: Test payment schedule view
  - [ ] Subtask 16.9: Test gift booking restriction
  - [ ] Subtask 16.10: Test companion booking independence
  - [ ] Subtask 16.11: Test error scenarios (payment failures, validation errors)
  - [ ] Subtask 16.12: Run TypeScript validation: `npx tsc --noEmit`
  - [ ] Subtask 16.13: Run build validation: `npm run build`

## Dev Notes

### Architecture Requirements (MUST FOLLOW)

**Critical Pattern: Payment Plan Selection**

This story implements a flexible payment system where guests can choose between:
1. **Pay in Full (2% discount):** Single immediate payment with incentive discount
2. **4-Payment Installment Plan:** Spread cost over time with automatic scheduled charges
3. **Financing (Future):** Third-party financing via Affirm (placeholder for now)

**Key Architectural Decisions:**
- Use enum for payment plan type (FULL, INSTALLMENT_4, FINANCING)
- Existing Payment model supports installments (isInstallment, installmentNumber, scheduledDate)
- Stripe Customer required for installments (save payment method)
- Full payment gets 2% discount applied to booking total
- Installment schedule: 50%, 25%, 15%, 10% based on trip dates
- First installment charged immediately, others scheduled for automatic processing (Story 4-7)

### Database Schema

**Migration Required:**

```prisma
enum PaymentPlan {
  FULL              // Pay in full with 2% discount
  INSTALLMENT_4     // 4 payments spread before trip
  FINANCING         // Affirm financing (future)
}

model Booking {
  // Existing fields...

  // Payment Plan (E4-S6)
  paymentPlan PaymentPlan @default(FULL)

  // Stripe customer for installments
  stripeCustomerId String? // Required for INSTALLMENT_4
}

model Payment {
  // Existing fields...

  // Installment tracking (already exists from previous stories)
  isInstallment     Boolean   @default(false)
  installmentNumber Int?      // 1-4 for installment plans
  scheduledDate     DateTime? // When payment is due
  status            PaymentStatus // PENDING, SUCCEEDED, FAILED

  // Stripe integration (already exists)
  stripePaymentIntentId String? @unique
  stripeCustomerId      String?
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add-payment-plan-enum
```

### Installment Calculation Logic

**Calculate Installment Amounts:**

```typescript
// lib/utils/installment-calculator.ts

export function calculateInstallmentAmounts(totalCents: number): number[] {
  // Calculate percentages in cents
  const installment1 = Math.round(totalCents * 0.50) // 50%
  const installment2 = Math.round(totalCents * 0.25) // 25%
  const installment3 = Math.round(totalCents * 0.15) // 15%

  // Calculate remaining for last installment (handles rounding)
  const installment4 = totalCents - installment1 - installment2 - installment3

  return [installment1, installment2, installment3, installment4]
}

export function calculateInstallmentDates(tripStartDate: Date): Date[] {
  const today = new Date()
  const date60DaysBefore = subDays(tripStartDate, 60)
  const date30DaysBefore = subDays(tripStartDate, 30)
  const date7DaysBefore = subDays(tripStartDate, 7)

  return [today, date60DaysBefore, date30DaysBefore, date7DaysBefore]
}

export function canUseInstallmentPlan(tripStartDate: Date): boolean {
  const today = new Date()
  const daysUntilTrip = differenceInDays(tripStartDate, today)
  return daysUntilTrip >= 70
}
```

### Full Payment Discount Calculation

```typescript
export function calculateFullPaymentDiscount(totalCents: number): {
  discount: number
  discountedTotal: number
} {
  const discount = Math.round(totalCents * 0.02) // 2% discount
  const discountedTotal = totalCents - discount

  return { discount, discountedTotal }
}
```

### tRPC Mutation Updates (booking.create)

**Add payment plan to booking creation:**

```typescript
// lib/trpc/server/routers/booking.ts

const createBookingInput = z.object({
  // Existing fields...
  paymentPlan: z.enum(['FULL', 'INSTALLMENT_4', 'FINANCING']).default('FULL'),
})

create: guestProcedure
  .input(createBookingInput)
  .mutation(async ({ ctx, input }) => {
    // 1. VALIDATE TRIP DATE FOR INSTALLMENTS
    if (input.paymentPlan === 'INSTALLMENT_4') {
      const trip = await ctx.db.trip.findUnique({
        where: { id: input.tripId }
      })

      if (!trip || !canUseInstallmentPlan(trip.startDate)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Installment plans require booking at least 70 days before departure.'
        })
      }
    }

    // 2. CALCULATE PRICING
    let totalPrice = calculateBookingTotal(input)
    let discount = 0

    // Apply 2% discount for full payment
    if (input.paymentPlan === 'FULL') {
      const result = calculateFullPaymentDiscount(totalPrice)
      discount = result.discount
      totalPrice = result.discountedTotal
    }

    // 3. CREATE STRIPE CUSTOMER (for installments)
    let stripeCustomerId: string | undefined

    if (input.paymentPlan === 'INSTALLMENT_4') {
      const customer = await stripe.customers.create({
        email: ctx.session.user.email,
        name: ctx.session.user.name,
        metadata: {
          userId: ctx.session.user.id,
        }
      })
      stripeCustomerId = customer.id
    }

    // 4. CREATE BOOKING
    const booking = await ctx.db.booking.create({
      data: {
        userId: ctx.session.user.id,
        packageId: input.packageId,
        tripId: input.tripId,
        totalPrice,
        paymentPlan: input.paymentPlan,
        stripeCustomerId,
        // ... other fields
      }
    })

    // 5. CREATE PAYMENT RECORDS
    let payments: Payment[]

    if (input.paymentPlan === 'INSTALLMENT_4') {
      // Create 4 installment payment records
      const trip = await ctx.db.trip.findUnique({ where: { id: input.tripId! } })
      const amounts = calculateInstallmentAmounts(totalPrice)
      const dates = calculateInstallmentDates(trip!.startDate)

      payments = await Promise.all(
        amounts.map((amount, index) =>
          ctx.db.payment.create({
            data: {
              bookingId: booking.id,
              amount,
              status: 'PENDING',
              isInstallment: true,
              installmentNumber: index + 1,
              scheduledDate: dates[index],
              stripeCustomerId,
            }
          })
        )
      )
    } else {
      // Create single payment record
      payments = [await ctx.db.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalPrice,
          status: 'PENDING',
          isInstallment: false,
          scheduledDate: new Date(),
        }
      })]
    }

    // 6. CREATE STRIPE PAYMENT INTENT FOR FIRST PAYMENT
    const firstPayment = payments[0]
    const paymentIntent = await stripe.paymentIntents.create({
      amount: firstPayment.amount,
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        bookingId: booking.id,
        paymentId: firstPayment.id,
        installmentNumber: firstPayment.installmentNumber || 1,
      }
    })

    // Update payment with Stripe intent ID
    await ctx.db.payment.update({
      where: { id: firstPayment.id },
      data: { stripePaymentIntentId: paymentIntent.id }
    })

    // 7. RETURN PAYMENT CLIENT SECRET
    return {
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
      totalPrice,
      discount,
      paymentPlan: input.paymentPlan,
    }
  })
```

### Stripe Customer and Payment Method Setup

**Save Payment Method for Future Charges:**

```typescript
// After first payment succeeds (in webhook handler or payment confirmation):

async function savePaymentMethodForInstallments(
  paymentIntentId: string,
  bookingId: string
) {
  // Retrieve payment intent with payment method
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  const paymentMethodId = paymentIntent.payment_method as string

  // Get booking to find customer
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  })

  if (!booking?.stripeCustomerId) {
    throw new Error('No Stripe customer found for installment booking')
  }

  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: booking.stripeCustomerId,
  })

  // Set as default payment method
  await stripe.customers.update(booking.stripeCustomerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })
}
```

### Booking Store Extensions

**Add to lib/stores/booking-store.ts:**

```typescript
interface BookingStore {
  // Existing fields...

  // Payment plan
  paymentPlan: 'FULL' | 'INSTALLMENT_4' | 'FINANCING'

  // Actions
  setPaymentPlan: (plan: 'FULL' | 'INSTALLMENT_4' | 'FINANCING') => void

  // Computed values
  canUseInstallments: () => boolean
  discountedTotal: () => number
  installmentSchedule: () => Array<{
    number: number
    amount: number
    dueDate: Date
    percentage: string
  }>
}

// In store implementation:
setPaymentPlan: (plan) => set({ paymentPlan: plan }),

canUseInstallments: () => {
  const state = get()
  if (!state.tripId || !state.trip) return false
  return canUseInstallmentPlan(state.trip.startDate)
},

discountedTotal: () => {
  const state = get()
  if (state.paymentPlan === 'FULL') {
    return calculateFullPaymentDiscount(state.totalPrice).discountedTotal
  }
  return state.totalPrice
},

installmentSchedule: () => {
  const state = get()
  if (!state.trip || state.paymentPlan !== 'INSTALLMENT_4') return []

  const amounts = calculateInstallmentAmounts(state.totalPrice)
  const dates = calculateInstallmentDates(state.trip.startDate)
  const percentages = ['50%', '25%', '15%', '10%']

  return amounts.map((amount, index) => ({
    number: index + 1,
    amount,
    dueDate: dates[index],
    percentage: percentages[index],
  }))
},
```

### Component File Structure

**New Files to Create:**
1. `components/booking/payment-plan-selector.tsx` - Payment plan selection UI
2. `components/booking/installment-schedule-display.tsx` - Installment schedule table
3. `components/booking/payment-schedule.tsx` - Dashboard payment schedule view
4. `lib/utils/installment-calculator.ts` - Calculation utilities
5. `lib/stripe/create-customer.ts` - Stripe customer creation utility

**Files to Modify:**
1. `prisma/schema.prisma` - Add PaymentPlan enum and paymentPlan field
2. `lib/stores/booking-store.ts` - Add payment plan state and computed values
3. `lib/trpc/server/routers/booking.ts` - Update create mutation for payment plans
4. `app/booking/review/page.tsx` - Add payment plan selection
5. `app/booking/payment/page.tsx` - Handle installment payment setup
6. `lib/email/templates/booking-confirmation.ts` - Add payment plan details
7. `components/dashboard/bookings-list.tsx` - Show payment plan badges
8. `app/(dashboard)/dashboard/bookings/[id]/page.tsx` - Add payment schedule section
9. `lib/stripe/webhooks.ts` - Save payment method after first payment

### UI/UX Design Specifications

**Payment Plan Selector Cards:**
- Three radio cards side-by-side on desktop, stacked on mobile
- Each card:
  - 48px height minimum touch target
  - Blue border when selected (3px)
  - Gray border when unselected (1px)
  - Badge in top-right corner (e.g., "Save 2%", "Most Popular")
  - Icon representing payment type (💳, 📅, 🏦)
  - Title in bold
  - Brief description
  - Total amount or first payment amount
- Disabled card (Financing): Grayed out with "Coming Soon" badge

**Installment Schedule Display:**
- Clean table with alternating row colors
- Column headers: Installment, Amount, Due Date, Status
- First row highlighted (Today's payment)
- Future payments in muted color
- Status icons with color coding
- Mobile: Transform to card layout with vertical information

**Payment Form Updates:**
- For installments:
  - Prominent checkbox for authorization
  - Info box explaining automatic charges
  - Link to payment terms
- For full payment:
  - Discount amount highlighted in green
  - Total savings displayed prominently

### Business Rules

1. **Trip Date Minimum:** 70 days required for installment plans
2. **Installment Percentages:** 50%, 25%, 15%, 10% (non-negotiable)
3. **Full Payment Discount:** 2% (applied to total booking price)
4. **Gift Bookings:** Must pay in full (no installments)
5. **Companion Bookings:** Independent payment plan choices
6. **Rounding:** Always favor booking total accuracy over equal splits
7. **Stripe Customer:** Required for installments, optional for full payment

### Edge Cases to Handle

1. **Trip Date Changed:** Revalidate installment eligibility
2. **Rounding Errors:** Adjust last installment to ensure exact total
3. **Stripe Customer Creation Fails:** Fall back to full payment option
4. **Payment Method Declined:** Clear error message, allow retry
5. **Trip < 70 Days:** Hide installment option entirely
6. **No Trip Selected:** Disable payment plan selection
7. **Card Type Incompatible:** Reject pre-paid cards for installments
8. **Leap Year Dates:** Use date-fns for accurate date calculations
9. **Timezone Issues:** Store all dates in UTC, display in user's timezone

### Testing Requirements

**Unit Tests:**
- Installment amount calculation (rounding, sum equals total)
- Installment date calculation (60, 30, 7 days before trip)
- Full payment discount calculation (2%)
- Trip date validation (70 days minimum)
- Stripe customer creation

**Integration Tests:**
1. **Full Payment Flow:**
   - Select "Pay in Full"
   - Verify 2% discount applied
   - Complete payment
   - Verify single Payment record created
   - Verify confirmation email shows discount

2. **Installment Plan Flow:**
   - Select "4-Payment Installment Plan"
   - Verify installment schedule displayed correctly
   - Complete first payment
   - Verify 4 Payment records created with correct amounts and dates
   - Verify Stripe customer created
   - Verify payment method saved
   - Verify confirmation email shows installment schedule

3. **Trip Date Validation:**
   - Select trip < 70 days away
   - Verify installment option hidden
   - Only "Pay in Full" available

4. **Gift Booking Restriction:**
   - Enable gift booking mode
   - Verify installment option disabled
   - Must pay in full

5. **Companion Booking Independence:**
   - Create companion booking
   - Primary selects FULL, companion selects INSTALLMENT_4
   - Verify independent payment plans work

6. **Error Scenarios:**
   - Stripe customer creation fails
   - First payment declined
   - Payment method cannot be saved

**E2E Tests:**
- Full booking flow with full payment
- Full booking flow with installment plan
- Dashboard display for both payment plans
- Payment schedule view
- Mobile responsive layouts
- Accessibility testing (keyboard nav, screen readers)

**TypeScript Validation:**
```bash
npx tsc --noEmit
```

**Build Validation:**
```bash
npm run build
```

### References

**Source Documents:**
- Epic 4, Story 6 in epics-and-stories file
- E4-S1 to E4-S5: Payment infrastructure (Stripe integration, payment intents, webhooks)
- E4-S7: Automated installment charging (scheduled job to charge future installments)
- E4-S8: Installment payment reminders (email reminders before auto-charge)

**External Documentation:**
- Stripe Payment Intents API
- Stripe Customers API
- Stripe Payment Methods API
- Stripe SetupIntents (for saving cards)
- date-fns library (for date calculations)

**Related Stories:**
- E4-S7: Automated Installment Charging (follows this story)
- E4-S8: Installment Payment Reminders (follows E4-S7)
- E4-S11: Payment History View (displays installment status)
- E4-S12: Update Payment Method (for installments)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

**Files to Create:**
1. components/booking/payment-plan-selector.tsx
2. components/booking/installment-schedule-display.tsx
3. components/booking/payment-schedule.tsx
4. lib/utils/installment-calculator.ts
5. lib/stripe/create-customer.ts

**Files to Modify:**
1. prisma/schema.prisma (migration required)
2. lib/stores/booking-store.ts
3. lib/trpc/server/routers/booking.ts
4. app/booking/review/page.tsx
5. app/booking/payment/page.tsx
6. lib/email/templates/booking-confirmation.ts
7. components/dashboard/bookings-list.tsx
8. app/(dashboard)/dashboard/bookings/[id]/page.tsx
9. lib/stripe/webhooks.ts
