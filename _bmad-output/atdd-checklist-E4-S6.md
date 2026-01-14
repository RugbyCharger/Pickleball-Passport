# ATDD Checklist - Epic 4, Story 6: Installment Payment Plans

**Date:** 2026-01-14
**Author:** Grant
**Primary Test Level:** API
**Priority:** P0 + P1 (37 tests, 52 hours effort)

---

## Story Summary

Implement installment payment plans for trip bookings, allowing guests to pay in 4 installments (50%, 25%, 15%, 10%) for trips starting at least 70 days from booking date. Includes Stripe customer creation with retry logic, atomic transaction handling, and 2% discount for full payment upfront.

**As a** guest booking a trip
**I want** to split my payment into 4 installments
**So that** I can manage my budget while securing my spot on the trip

---

## Acceptance Criteria

1. INSTALLMENT_4 payment plan available for trips starting ≥70 days from today
2. First installment (50%) due at booking, subsequent at 45, 30, and 14 days before trip
3. FULL payment plan offers 2% discount
4. Stripe customer created with payment method saved for future charges
5. User must authorize saving payment method via checkbox
6. Booking and payment records created atomically (transaction rollback on failure)
7. Gift bookings restricted to FULL payment only
8. Payment schedule displayed on dashboard and in confirmation email
9. Stripe API failures handled with retry logic and fallback to FULL payment
10. All installment amounts round correctly and sum to exact total

---

## Failing Tests Created (RED Phase)

### Unit Tests (9 tests)

**File:** `tests/unit/installment-calculator.spec.ts` (240 lines)

- ✅ **Test:** should calculate installments for small amount ($10.00)
  - **Status:** RED - `calculateInstallments` function not implemented
  - **Verifies:** Installment split logic works for small amounts

- ✅ **Test:** should calculate installments for typical amount ($5,000.00)
  - **Status:** RED - `calculateInstallments` function not implemented
  - **Verifies:** Installment split logic for standard booking amounts

- ✅ **Test:** should calculate installments for large amount ($15,385.67)
  - **Status:** RED - `calculateInstallments` function not implemented
  - **Verifies:** Rounding logic for odd amounts (R-001)

- ✅ **Test:** should calculate installments for amount with 1 cent ($0.01)
  - **Status:** RED - `calculateInstallments` function not implemented
  - **Verifies:** Edge case minimum amount handling

- ✅ **Test:** should ensure installment sum equals exact total (no rounding errors)
  - **Status:** RED - `calculateInstallments` function not implemented
  - **Verifies:** Critical requirement - no cent loss (R-001)

- ✅ **Test:** should calculate 2% discount for typical amount ($5,000.00)
  - **Status:** RED - `calculateFullPaymentDiscount` function not implemented
  - **Verifies:** 2% discount calculation accuracy (R-003)

- ✅ **Test:** should calculate 2% discount with rounding for odd amount ($1,234.56)
  - **Status:** RED - `calculateFullPaymentDiscount` function not implemented
  - **Verifies:** Discount rounding logic

- ✅ **Test:** should ensure discount never exceeds 2%
  - **Status:** RED - `calculateFullPaymentDiscount` function not implemented
  - **Verifies:** Discount boundary enforcement (R-003)

- ✅ **Test:** should calculate installment dates for leap year trip (Feb 29)
  - **Status:** RED - `calculateInstallmentDates` function not implemented
  - **Verifies:** Date calculation edge cases (R-012)

### API Tests (19 tests)

**File:** `tests/api/booking-create-installment.api.spec.ts` (309 lines)

- ✅ **Test:** should create Stripe customer successfully for new user
  - **Status:** RED - tRPC endpoint `booking.create` not implemented
  - **Verifies:** Stripe customer creation success path (R-002)

- ✅ **Test:** should retry Stripe customer creation on transient failure
  - **Status:** RED - Retry logic not implemented
  - **Verifies:** Exponential backoff retry logic (R-002)

- ✅ **Test:** should fallback to FULL payment after max retries exhausted
  - **Status:** RED - Fallback logic not implemented
  - **Verifies:** Graceful degradation on Stripe failure (R-002)

- ✅ **Test:** should create booking and 4 payment records atomically
  - **Status:** RED - Atomic transaction not implemented
  - **Verifies:** Booking + payments created together (R-004)

- ✅ **Test:** should rollback booking if payment record creation fails
  - **Status:** RED - Transaction rollback not implemented
  - **Verifies:** No orphaned bookings on payment failure (R-004)

- ✅ **Test:** should reject installment plan for trip starting in 69 days
  - **Status:** RED - 70-day validation not implemented
  - **Verifies:** Server-side validation enforces 70-day rule (R-005)

- ✅ **Test:** should allow installment plan for trip starting in exactly 70 days
  - **Status:** RED - Boundary condition not handled
  - **Verifies:** 70-day boundary is inclusive (R-005)

- ✅ **Test:** should allow installment plan for trip starting in 100 days
  - **Status:** RED - Validation logic not implemented
  - **Verifies:** Trips well above threshold are allowed

- ✅ **Test:** should handle timezone edge cases for 70-day validation
  - **Status:** RED - Timezone handling not implemented
  - **Verifies:** Consistent validation across timezones (R-012)

- ✅ **Test:** should disable installment option for gift bookings
  - **Status:** RED - Gift booking restriction not implemented
  - **Verifies:** Business rule: gifts must be FULL payment (R-006)

- ✅ **Test:** should allow FULL payment for gift bookings
  - **Status:** RED - Gift booking logic not implemented
  - **Verifies:** Gift bookings work with FULL plan

**File:** `tests/api/stripe-integration.api.spec.ts` (138 lines)

- ✅ **Test:** should handle slow Stripe response with loading state
  - **Status:** RED - Stripe timeout handling not implemented
  - **Verifies:** Loading states during slow API calls (R-008)

- ✅ **Test:** should timeout after 10 seconds and return error
  - **Status:** RED - Timeout logic not implemented
  - **Verifies:** Stripe API timeout configuration (R-008)

- ✅ **Test:** should send email with 2% discount for FULL payment plan
  - **Status:** RED - Email service integration not implemented
  - **Verifies:** Email confirmation accuracy for FULL plan (R-009)

- ✅ **Test:** should send email with installment schedule for INSTALLMENT_4 plan
  - **Status:** RED - Email template not created
  - **Verifies:** Installment schedule in email (R-009)

### Component Tests (9 tests)

**File:** `tests/component/PaymentPlanSelector.test.tsx` (306 lines)

- ✅ **Test:** should display all payment plan options
  - **Status:** RED - `PaymentPlanSelector` component not created
  - **Verifies:** All plans visible (FULL, INSTALLMENT_4, FINANCING disabled)

- ✅ **Test:** should select FULL payment plan by default
  - **Status:** RED - Default selection logic not implemented
  - **Verifies:** FULL plan as default with 2% discount badge

- ✅ **Test:** should switch to INSTALLMENT_4 plan when clicked
  - **Status:** RED - Plan selection interaction not implemented
  - **Verifies:** User can switch between plans

- ✅ **Test:** should support keyboard navigation between plans
  - **Status:** RED - Keyboard accessibility not implemented
  - **Verifies:** Tab navigation and Enter to select

- ✅ **Test:** should display authorization checkbox for INSTALLMENT_4 plan
  - **Status:** RED - Authorization checkbox not implemented
  - **Verifies:** Checkbox appears for installment plans (R-007)

- ✅ **Test:** should require authorization checkbox to proceed with INSTALLMENT_4
  - **Status:** RED - Validation logic not implemented
  - **Verifies:** Cannot proceed without authorization (R-007)

- ✅ **Test:** should include proper ARIA labels for authorization checkbox
  - **Status:** RED - ARIA attributes not added
  - **Verifies:** Screen reader accessibility (R-007)

- ✅ **Test:** should display installment schedule with correct dates
  - **Status:** RED - `InstallmentSchedulePreview` component not created
  - **Verifies:** Schedule shows 4 installments with dates

- ✅ **Test:** should format installment amounts with currency
  - **Status:** RED - Currency formatting not implemented
  - **Verifies:** Amounts display as $X,XXX.XX format

- ✅ **Test:** should display installment schedule on mobile layout
  - **Status:** RED - Mobile responsive styles not added
  - **Verifies:** Mobile layout works correctly (R-010)

### E2E Tests (4 tests)

**File:** `tests/e2e/installment-payment-flows.spec.ts` (294 lines)

- ✅ **Test:** should complete booking with FULL payment and apply 2% discount
  - **Status:** RED - Full booking flow not implemented end-to-end
  - **Verifies:** Complete happy path with discount (R-003)

- ✅ **Test:** should complete booking with INSTALLMENT_4 plan and create payment schedule
  - **Status:** RED - Installment booking flow not implemented
  - **Verifies:** Complete installment flow with Stripe customer creation (R-002, R-004)

- ✅ **Test:** should display payment schedule for installment booking on dashboard
  - **Status:** RED - Dashboard payment schedule view not implemented
  - **Verifies:** Users can view payment schedule after booking (R-010)

- ✅ **Test:** should allow primary and companion to select different payment plans
  - **Status:** RED - Companion booking logic not implemented
  - **Verifies:** Independent payment plan selection works (R-011)

---

## Data Factories Created

### User Factory

**File:** `tests/support/fixtures/factories/user.factory.ts`

**Exports:**

- `createUser(overrides?)` - Create single user with faker data
- `createUsers(count, overrides?)` - Create multiple users
- `createGuest(overrides?)` - Create user with GUEST role
- `createAdmin(overrides?)` - Create user with ADMIN role

**Example Usage:**

```typescript
import { createUser, createGuest } from '@/tests/support/fixtures';

const user = createUser({ email: 'specific@example.com' });
const guests = createUsers(5);
```

### Booking Factory

**File:** `tests/support/fixtures/factories/booking.factory.ts` (Enhanced)

**Exports:**

- `createBooking(overrides?)` - Create booking with random data
- `createFullPaymentBooking(overrides?)` - Booking with FULL plan
- `createInstallmentBooking(overrides?)` - Booking with INSTALLMENT_4 (75+ days)
- `createNearTermBooking(overrides?)` - Booking < 70 days (fails validation)
- `createExactly70DayBooking(overrides?)` - Boundary test booking
- `create69DayBooking(overrides?)` - Just under threshold
- `createGiftBooking(overrides?)` - Gift booking (FULL only)
- `createBookingWithPrice(priceCents, overrides?)` - Specific amount
- `testBookings.standardFull()` - $5,000 FULL payment
- `testBookings.standardInstallment()` - $10,000 installment
- `testBookings.oddAmount()` - $15,385.67 (rounding test)
- `testBookings.minimal()` - $10.00 (edge case)
- `testBookings.companion()` - Pair of bookings (primary + companion)

**Example Usage:**

```typescript
import { createInstallmentBooking, testBookings } from '@/tests/support/fixtures';

const booking = createInstallmentBooking({ totalPrice: 1000000 });
const standardBooking = testBookings.standardInstallment();
```

### Trip Factory (NEW)

**File:** `tests/support/fixtures/factories/trip.factory.ts`

**Exports:**

- `createTrip(overrides?)` - Trip 80 days from now (installment eligible)
- `createNearTermTrip(overrides?)` - Trip 10-69 days away
- `createFarFutureTrip(overrides?)` - Trip 100-365 days away
- `createExactly70DayTrip(overrides?)` - Boundary test trip
- `createTripWithPrice(priceCents, overrides?)` - Specific price point
- `createTrips(count, overrides?)` - Multiple trips
- `testTrips.standard()` - $5,000 trip (Morocco)
- `testTrips.premium()` - $10,000 trip (Italy)
- `testTrips.oddAmount()` - $15,385.67 trip (Spain)
- `testTrips.minimal()` - $10.00 day trip

**Example Usage:**

```typescript
import { createTrip, testTrips } from '@/tests/support/fixtures';

const trip = createTrip({ pricePerPersonCents: 500000 });
const premiumTrip = testTrips.premium();
```

### Payment Factory (NEW)

**File:** `tests/support/fixtures/factories/payment.factory.ts`

**Exports:**

- `createPayment(overrides?)` - Single payment record
- `createFullPayment(bookingId, amountCents, overrides?)` - FULL payment with discount
- `createInstallmentPayments(bookingId, totalCents, tripStart, overrides?)` - 4 payments
- `createPaymentsWithAmounts(bookingId, amounts[])` - Custom amounts
- `createFailedPayment(bookingId, overrides?)` - Failed payment record
- `testPayments.standardFull(bookingId)` - $5,000 FULL ($4,900 after discount)
- `testPayments.standardInstallment(bookingId, tripStart)` - $10,000 split
- `testPayments.oddAmountInstallment(bookingId, tripStart)` - $15,385.67 split
- `verifyInstallmentSum(payments[], expectedTotal)` - Validation helper

**Example Usage:**

```typescript
import { createInstallmentPayments, verifyInstallmentSum } from '@/tests/support/fixtures';

const payments = createInstallmentPayments(bookingId, 1000000, tripStartDate);
const isValid = verifyInstallmentSum(payments, 1000000); // true
```

### Stripe Factory (NEW)

**File:** `tests/support/fixtures/factories/stripe.factory.ts`

**Exports:**

- `createStripeCustomer(overrides?)` - Mock Stripe customer
- `createStripePaymentMethod(overrides?)` - Mock payment method (card)
- `createStripePaymentIntent(amountCents, customerId, overrides?)` - Mock payment intent
- `createStripeError(code, overrides?)` - Mock Stripe errors
- `testStripe.visaCard()` - Stripe test Visa card
- `testStripe.declinedCard()` - Card that will be declined
- `testStripe.insufficientFundsCard()` - Card with insufficient funds
- `testStripe.customer()` - Standard test customer
- `testStripe.cardDeclinedError()` - Card declined error
- `testStripe.connectionError()` - API connection error
- `testStripe.rateLimitError()` - Rate limit error

**Example Usage:**

```typescript
import { createStripeCustomer, testStripe } from '@/tests/support/fixtures';

const customer = createStripeCustomer({ email: 'test@example.com' });
const visaCard = testStripe.visaCard();
const error = testStripe.cardDeclinedError();
```

---

## Fixtures Created

No custom test fixtures created yet (will be added as needed during implementation).

Current fixture exports available in `tests/support/fixtures/index.ts`:
- All data factories are exported for easy import
- Base Playwright test and expect utilities

**Future fixtures to consider:**
- `authenticatedBookingUser` - User logged in with trip selected, ready to book
- `stripeCustomerWithSavedCard` - User with existing Stripe customer and payment method
- `bookingWithInstallmentPlan` - Complete booking with 4 pending payments

---

## Mock Requirements

### Stripe API Mock

**Customer Creation Endpoint:**

**Endpoint:** `POST https://api.stripe.com/v1/customers`

**Success Response:**

```json
{
  "id": "cus_ABC123",
  "email": "user@example.com",
  "name": "User Name",
  "default_source": null,
  "created": 1705247893
}
```

**Transient Failure Response (for retry testing):**

```json
{
  "error": {
    "type": "api_connection_error",
    "message": "Cannot connect to Stripe. Please try again later."
  }
}
```

**Notes:**
- Mock should support 1-2 transient failures before success (for retry logic testing)
- Use Stripe test mode keys in `.env.test`
- For E2E tests, use actual Stripe test mode (not mocked)

### Email Service Mock

**Endpoint:** Internal email service (implementation-dependent)

**Success Response:**

```json
{
  "status": "queued",
  "messageId": "msg_123456",
  "recipient": "user@example.com"
}
```

**Notes:**
- Do not send real emails in test environment
- Log email contents to test output for verification
- Store emails in test database or memory for API test verification

---

## Required data-testid Attributes

### Booking Page (`/booking/new`)

**Payment Plan Selector:**
- `payment-plan-selector` - Container for payment plan options
- `plan-option-FULL` - FULL payment option button/card
- `plan-option-INSTALLMENT_4` - INSTALLMENT_4 option button/card
- `plan-option-FINANCING` - FINANCING option (disabled)
- `full-plan-discount-badge` - "Save 2%" badge on FULL option
- `installment-schedule-preview` - Installment schedule preview container
- `installment-1`, `installment-2`, `installment-3`, `installment-4` - Individual installment items
- `installment-1-amount`, `installment-2-amount`, etc. - Installment dollar amounts

**Authorization:**
- `payment-method-authorization-checkbox` - Authorization checkbox for installment plans
- `authorization-text` - Authorization agreement text
- `authorization-error` - Error message when checkbox not checked

**Navigation:**
- `continue-to-payment-button` - Button to proceed to payment page

**Pricing Summary:**
- `trip-total-cost` - Original trip cost
- `discount-amount` - Discount amount (for FULL plan)
- `final-amount` - Final amount to pay

### Payment Page (`/payment`)

- `payment-heading` - Page heading ("First Installment" or "Pay Now")
- `amount-due-today` - Amount due today
- `card-number` - Card number input
- `card-expiry` - Card expiry input
- `card-cvc` - Card CVC input
- `cardholder-name` - Cardholder name input
- `submit-payment-button` - Submit payment button

### Confirmation Page (`/booking/confirmation`)

- `booking-id` - Booking ID display
- `payment-summary` - Payment summary container
- `payment-schedule` - Payment schedule container (for installment bookings)
- `payment-status-1`, `payment-status-2`, etc. - Payment status indicators (Paid/Pending)

### Dashboard (`/dashboard/bookings`)

- `booking-card` - Booking card in list
- `installment-badge` - "Installment Plan" badge
- `payment-schedule` - Payment schedule detail view
- `payment-progress` - Progress bar showing payment completion
- `installment-1`, `installment-2`, etc. - Installment items in schedule

**Implementation Example:**

```tsx
// PaymentPlanSelector component
<div data-testid="payment-plan-selector">
  <button
    data-testid="plan-option-FULL"
    aria-checked={selected === 'FULL'}
    onClick={() => selectPlan('FULL')}
  >
    <span>Pay in Full</span>
    <span data-testid="full-plan-discount-badge">Save 2%</span>
  </button>

  <button
    data-testid="plan-option-INSTALLMENT_4"
    aria-checked={selected === 'INSTALLMENT_4'}
    onClick={() => selectPlan('INSTALLMENT_4')}
  >
    <span>4 Installments</span>
  </button>
</div>

// Authorization checkbox
<label>
  <input
    type="checkbox"
    data-testid="payment-method-authorization-checkbox"
    aria-label="Authorize payment method for future installments"
    aria-describedby="auth-description"
    checked={authorized}
    onChange={(e) => setAuthorized(e.target.checked)}
  />
  <span data-testid="authorization-text">
    I authorize Pickleball Passport to charge my payment method
  </span>
</label>
```

---

## Implementation Checklist

### Phase 1: Core Calculation Utilities (P0 - 8 hours)

#### Test: Unit - Installment amount calculation

**File:** `tests/unit/installment-calculator.spec.ts`

**Tasks:**

- [ ] Create `src/lib/utils/installment-calculator.ts`
- [ ] Implement `calculateInstallments(totalAmountCents: number)` function
  - First: `Math.ceil(totalAmountCents * 0.5)` (round up)
  - Second: `Math.floor(totalAmountCents * 0.25)` (round down)
  - Third: `Math.floor(totalAmountCents * 0.15)` (round down)
  - Fourth: `totalAmountCents - first - second - third` (remainder - ensures exact total)
- [ ] Return object with `{ first, second, third, fourth, total }` properties
- [ ] Add unit tests for edge cases (see test file)
- [ ] Run test: `npm run test -- installment-calculator.spec.ts`
- [ ] ✅ All installment calculation tests pass

**Estimated Effort:** 3 hours

#### Test: Unit - 2% discount calculation

**File:** `tests/unit/installment-calculator.spec.ts`

**Tasks:**

- [ ] Add `calculateFullPaymentDiscount(totalAmountCents: number)` function
- [ ] Calculate discount: `Math.floor(totalAmountCents * 0.02)` (always round down)
- [ ] Calculate final amount: `originalAmount - discountAmount`
- [ ] Return object with `{ originalAmount, discountAmount, finalAmount }`
- [ ] Ensure discount never exceeds 2% of original amount
- [ ] Run test: `npm run test -- installment-calculator.spec.ts`
- [ ] ✅ All discount calculation tests pass

**Estimated Effort:** 2 hours

#### Test: Unit - Installment date calculation

**File:** `tests/unit/installment-calculator.spec.ts`

**Tasks:**

- [ ] Add `calculateInstallmentDates(tripStartDate: Date)` function
- [ ] Use `date-fns` library for date calculations
- [ ] Calculate dates:
  - First: today (due at booking)
  - Second: `subDays(tripStartDate, 45)` (45 days before trip)
  - Third: `subDays(tripStartDate, 30)` (30 days before trip)
  - Fourth: `subDays(tripStartDate, 14)` (14 days before trip)
- [ ] Handle leap year edge cases (Feb 29)
- [ ] Handle timezone consistently (use UTC)
- [ ] Run test: `npm run test -- installment-calculator.spec.ts`
- [ ] ✅ Date calculation tests pass

**Estimated Effort:** 3 hours

---

### Phase 2: Database Schema & Prisma Models (P0 - 6 hours)

#### Task: Create payment_records table schema

**Tasks:**

- [ ] Create Prisma migration: `npx prisma migrate dev --name add_payment_records`
- [ ] Define `PaymentRecord` model in `schema.prisma`:
  - `id` (String, @id, @default(cuid()))
  - `bookingId` (String, relation to Booking)
  - `amountCents` (Int)
  - `status` (Enum: PAID, PENDING, FAILED)
  - `dueDate` (DateTime)
  - `paidDate` (DateTime, optional)
  - `percentage` (Int, optional)
  - `installmentNumber` (Int, optional)
  - `stripePaymentIntentId` (String, optional)
  - `createdAt` (DateTime, @default(now()))
  - `updatedAt` (DateTime, @updatedAt)
- [ ] Add `paymentPlan` field to `Booking` model (Enum: FULL, INSTALLMENT_4, FINANCING)
- [ ] Add `stripeCustomerId` field to `User` model (String, optional)
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Generate Prisma client: `npx prisma generate`

**Estimated Effort:** 3 hours

#### Task: Create database transaction wrapper

**Tasks:**

- [ ] Create `src/lib/db/transactions.ts`
- [ ] Implement `createBookingWithPayments(bookingData, paymentRecords[])` function
- [ ] Wrap in Prisma transaction: `prisma.$transaction(async (tx) => { ... })`
- [ ] Create booking first: `tx.booking.create()`
- [ ] Create all payment records: `tx.paymentRecord.createMany()`
- [ ] Return both booking and payments
- [ ] Add error handling with automatic rollback on failure

**Estimated Effort:** 3 hours

---

### Phase 3: tRPC API Endpoints (P0 + P1 - 16 hours)

#### Test: API - Create booking with INSTALLMENT_4 plan

**File:** `tests/api/booking-create-installment.api.spec.ts`

**Tasks:**

- [ ] Create `src/server/api/routers/booking.ts` (if not exists)
- [ ] Add `create` mutation with input schema:
  - `tripId` (string)
  - `startDate` (date string)
  - `paymentPlan` (enum: FULL | INSTALLMENT_4)
  - `paymentMethodId` (string)
  - `isGift` (boolean, optional)
  - `userEmail` (string)
  - `userName` (string)
- [ ] Implement `booking.create` mutation:
  1. Validate 70-day requirement (server-side)
  2. If installment plan: Create/retrieve Stripe customer
  3. Calculate payment amounts using calculator utils
  4. Create booking + payment records atomically
  5. Return booking with payment details
- [ ] Add data-testid requirements to response type
- [ ] Run test: `npm run test:api -- booking-create-installment.api.spec.ts`
- [ ] ✅ Booking creation tests pass

**Estimated Effort:** 6 hours

#### Test: API - Stripe customer creation with retry

**File:** `tests/api/booking-create-installment.api.spec.ts`

**Tasks:**

- [ ] Create `src/lib/stripe/customer.ts`
- [ ] Implement `createOrRetrieveStripeCustomer(userId, email, paymentMethodId)` function
- [ ] Add retry logic with exponential backoff:
  - Max 3 retries
  - Delays: 1s, 2s, 4s
  - Only retry on transient errors (5xx, timeouts)
- [ ] On max retries exhausted: return fallback indication
- [ ] Save `stripeCustomerId` to User model on success
- [ ] Attach payment method to customer: `stripe.paymentMethods.attach()`
- [ ] Set as default payment method
- [ ] Run test: `npm run test:api -- booking-create-installment.api.spec.ts`
- [ ] ✅ Stripe retry tests pass

**Estimated Effort:** 5 hours

#### Test: API - 70-day validation

**File:** `tests/api/booking-create-installment.api.spec.ts`

**Tasks:**

- [ ] Add validation in `booking.create` mutation
- [ ] Calculate days until trip: `differenceInDays(tripStart, now)`
- [ ] If `paymentPlan === 'INSTALLMENT_4'` and `daysUntilTrip < 70`: throw error
- [ ] Error message: "Installment plans require trips starting at least 70 days from today"
- [ ] Handle timezone edge cases using UTC comparison
- [ ] Run test: `npm run test:api -- booking-create-installment.api.spec.ts`
- [ ] ✅ 70-day validation tests pass

**Estimated Effort:** 2 hours

#### Test: API - Gift booking restriction

**File:** `tests/api/booking-create-installment.api.spec.ts`

**Tasks:**

- [ ] Add validation in `booking.create` mutation
- [ ] If `isGift === true` and `paymentPlan !== 'FULL'`: throw error
- [ ] Error message: "Gift bookings must use FULL payment plan"
- [ ] Run test: `npm run test:api -- booking-create-installment.api.spec.ts`
- [ ] ✅ Gift booking tests pass

**Estimated Effort:** 1 hour

#### Test: API - Stripe timeout handling

**File:** `tests/api/stripe-integration.api.spec.ts`

**Tasks:**

- [ ] Configure Stripe API timeout: `stripe.setTimeout(10000)` (10 seconds)
- [ ] Wrap Stripe calls in try-catch
- [ ] On timeout error: return 504 status with clear message
- [ ] Include timing metadata in response: `stripeResponseTime`
- [ ] Add loading state handling in UI (future task)
- [ ] Run test: `npm run test:api -- stripe-integration.api.spec.ts`
- [ ] ✅ Timeout tests pass

**Estimated Effort:** 2 hours

---

### Phase 4: Email Confirmation (P1 - 4 hours)

#### Test: API - Email with payment schedule

**File:** `tests/api/stripe-integration.api.spec.ts`

**Tasks:**

- [ ] Create email templates: `emails/booking-confirmation-full.tsx`, `emails/booking-confirmation-installment.tsx`
- [ ] Use React Email or similar library for templates
- [ ] FULL template: Show 2% discount, original amount, final amount
- [ ] INSTALLMENT template: Show all 4 payments with dates, amounts, statuses
- [ ] Integrate with email service (Resend, SendGrid, etc.)
- [ ] Send email after booking creation in `booking.create` mutation
- [ ] For test environment: Store emails in test database instead of sending
- [ ] Create test endpoint: `GET /api/test/emails?recipient={email}` (test env only)
- [ ] Run test: `npm run test:api -- stripe-integration.api.spec.ts`
- [ ] ✅ Email tests pass

**Estimated Effort:** 4 hours

---

### Phase 5: UI Components (P1 - 12 hours)

#### Test: Component - PaymentPlanSelector

**File:** `tests/component/PaymentPlanSelector.test.tsx`

**Tasks:**

- [ ] Create `src/components/booking/PaymentPlanSelector.tsx`
- [ ] Add state management for selected plan
- [ ] Render 3 plan options: FULL (enabled), INSTALLMENT_4 (enabled), FINANCING (disabled)
- [ ] Show "Save 2%" badge on FULL option
- [ ] Show installment schedule preview when INSTALLMENT_4 selected
- [ ] Add data-testid attributes: `payment-plan-selector`, `plan-option-FULL`, `plan-option-INSTALLMENT_4`, `full-plan-discount-badge`
- [ ] Implement keyboard navigation (Tab, Enter keys)
- [ ] Add ARIA attributes: `aria-checked`, `role="radio"`, `aria-label`
- [ ] Style for mobile responsiveness (<768px)
- [ ] Run test: `npm run test:component -- PaymentPlanSelector.test.tsx`
- [ ] ✅ PaymentPlanSelector tests pass

**Estimated Effort:** 5 hours

#### Test: Component - Authorization checkbox

**File:** `tests/component/PaymentPlanSelector.test.tsx`

**Tasks:**

- [ ] Add authorization checkbox to PaymentPlanSelector (conditional on INSTALLMENT_4)
- [ ] Checkbox state: unchecked by default
- [ ] Add validation: cannot proceed without checking
- [ ] Show error message on validation failure
- [ ] Add data-testid: `payment-method-authorization-checkbox`, `authorization-text`, `authorization-error`
- [ ] Add ARIA: `aria-label`, `aria-describedby`
- [ ] Add authorization text: "I authorize Pickleball Passport to charge my payment method for future installments on [dates]"
- [ ] Run test: `npm run test:component -- PaymentPlanSelector.test.tsx`
- [ ] ✅ Authorization checkbox tests pass

**Estimated Effort:** 3 hours

#### Test: Component - Installment schedule display

**File:** `tests/component/PaymentPlanSelector.test.tsx`

**Tasks:**

- [ ] Create `src/components/booking/InstallmentSchedulePreview.tsx`
- [ ] Accept props: `totalAmountCents`, `tripStartDate`
- [ ] Calculate installments and dates using utility functions
- [ ] Render 4 installment items with:
  - Percentage (50%, 25%, 15%, 10%)
  - Amount (formatted as $X,XXX.XX)
  - Due date (formatted as "MMM DD, YYYY" or "Today" for first)
- [ ] Add data-testid: `installment-schedule-preview`, `installment-1`, `installment-1-amount`, etc.
- [ ] Style for mobile: vertical card layout, touch targets ≥48px
- [ ] Run test: `npm run test:component -- PaymentPlanSelector.test.tsx`
- [ ] ✅ Installment schedule display tests pass

**Estimated Effort:** 4 hours

---

### Phase 6: E2E Integration (P0 + P1 - 6 hours)

#### Test: E2E - FULL payment flow

**File:** `tests/e2e/installment-payment-flows.spec.ts`

**Tasks:**

- [ ] Ensure all components integrated on booking flow pages
- [ ] Verify routing: trip details → booking page → payment page → confirmation
- [ ] Test with Stripe test mode (use test card: 4242 4242 4242 4242)
- [ ] Verify 2% discount applied throughout flow
- [ ] Verify database records created correctly
- [ ] Run test: `npm run test:e2e -- installment-payment-flows.spec.ts`
- [ ] ✅ FULL payment E2E test passes

**Estimated Effort:** 3 hours

#### Test: E2E - INSTALLMENT_4 flow

**File:** `tests/e2e/installment-payment-flows.spec.ts`

**Tasks:**

- [ ] Test complete installment flow end-to-end
- [ ] Verify Stripe customer creation
- [ ] Verify 4 payment records created in database
- [ ] Verify confirmation page shows payment schedule
- [ ] Test with Stripe test mode
- [ ] Run test: `npm run test:e2e -- installment-payment-flows.spec.ts`
- [ ] ✅ INSTALLMENT_4 E2E test passes

**Estimated Effort:** 3 hours

---

### Summary of Implementation Phases

| Phase | Description | Tests | Effort |
|-------|-------------|-------|--------|
| Phase 1 | Core calculation utilities | 9 unit tests | 8 hours |
| Phase 2 | Database schema & transactions | N/A (setup) | 6 hours |
| Phase 3 | tRPC API endpoints | 15 API tests | 16 hours |
| Phase 4 | Email confirmation | 2 API tests | 4 hours |
| Phase 5 | UI components | 9 component tests | 12 hours |
| Phase 6 | E2E integration | 4 E2E tests | 6 hours |
| **Total** | **37 tests** | **52 hours** |

---

## Running Tests

```bash
# Run all failing tests for this story
npm run test -- tests/unit/installment-calculator.spec.ts tests/api/ tests/component/PaymentPlanSelector.test.tsx tests/e2e/installment-payment-flows.spec.ts

# Run specific test file
npm run test -- tests/unit/installment-calculator.spec.ts

# Run specific test level
npm run test:api # API tests only
npm run test:e2e # E2E tests only

# Run tests in headed mode (see browser for E2E)
npm run test:headed -- tests/e2e/installment-payment-flows.spec.ts

# Debug specific test
npm run test:debug -- tests/api/booking-create-installment.api.spec.ts

# Run with UI mode (Playwright UI)
npm run test:ui
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All 37 tests written and failing
- ✅ Fixtures and factories created with faker integration
- ✅ Mock requirements documented (Stripe, Email)
- ✅ data-testid requirements listed (48 attributes)
- ✅ Implementation checklist created with 6 phases
- ✅ Risk coverage mapped (R-001 through R-012)

**Verification:**

- All tests run and fail as expected
- Failure messages are clear: "function not implemented" or "component not created"
- Tests fail due to missing implementation, not test bugs
- Test design follows Given-When-Then structure
- One assertion per test (atomic design)

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Start with Phase 1** (Core utilities) - highest ROI, unblocks other phases
2. **Pick one failing test** from current phase
3. **Read the test** to understand expected behavior
4. **Implement minimal code** to make that specific test pass
5. **Run the test** to verify it now passes (green)
6. **Check off the task** in implementation checklist above
7. **Move to next test** in same phase, repeat steps 2-6
8. **When phase complete**, move to next phase

**Key Principles:**

- One test at a time (focus)
- Minimal implementation (don't over-engineer)
- Run tests frequently (fast feedback)
- Use implementation checklist as roadmap
- Follow phase order (dependencies)

**Progress Tracking:**

- Check off tasks in Implementation Checklist as completed
- Update story status in sprint-status.yaml: `IN PROGRESS`
- Share progress in daily standup
- Tag team members when blocked

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all 37 tests pass** (green phase complete)
2. **Review code for quality:**
   - Readability: Clear variable names, well-structured functions
   - Maintainability: DRY principle, proper separation of concerns
   - Performance: Optimize database queries, reduce Stripe API calls
   - Security: Validate all inputs, protect against SQL injection
3. **Extract duplications:**
   - Share calculation logic across components
   - Create reusable hooks for Stripe integration
   - Consolidate date formatting utilities
4. **Optimize performance:**
   - Add database indexes on `bookingId`, `status`
   - Batch Stripe API calls where possible
   - Cache trip data to reduce queries
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion Criteria:**

- All 37 tests pass (100% green)
- Code quality meets team standards (code review approved)
- No duplications or code smells
- Performance acceptable (< 2s for booking creation)
- Ready for story approval and deployment

---

## Next Steps

1. ✅ **Share this checklist** with dev team (manual handoff complete)
2. **Review in standup** - Discuss approach, clarify questions, assign owner
3. **Run failing tests** to confirm RED phase: `npm run test -- tests/unit/ tests/api/ tests/component/ tests/e2e/installment-payment-flows.spec.ts`
4. **Begin Phase 1 implementation** (Core calculation utilities - 8 hours)
5. **Work one test at a time** (red → green for each)
6. **Share progress daily** in standup (check off tasks in this document)
7. **When Phase 1 complete**, move to Phase 2 (Database schema)
8. **When all tests pass**, enter REFACTOR phase
9. **When refactoring complete**, update story status to `DONE` in sprint-status.yaml
10. **Create pull request** and tag reviewer

---

## Knowledge Base References Applied

This ATDD workflow consulted the following TEA knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup using Playwright's `test.extend()`
- **data-factories.md** - Factory patterns using `@faker-js/faker` for random test data generation with overrides support
- **component-tdd.md** - Component test strategies using Playwright Component Testing (not used yet - E2E approach taken for components)
- **network-first.md** - Route interception patterns (intercept BEFORE navigation to prevent race conditions) - to be applied in E2E tests
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)
- **test-healing-patterns.md** - Common failure patterns and resilience strategies
- **selector-resilience.md** - data-testid > ARIA > text > CSS hierarchy
- **timing-debugging.md** - Race condition prevention, explicit waits over hard waits
- **test-levels-framework.md** - Test level selection framework (API primary, E2E secondary, Component tertiary, Unit supporting)

See `_bmad/bmm/testarch/tea-index.csv` for complete knowledge fragment mapping.

---

## Risk Coverage Matrix

| Risk ID | Score | Category | Mitigation | Test Coverage |
|---------|-------|----------|-----------|---------------|
| R-001 | 9 | DATA | Installment rounding | 5 unit tests (sum validation) |
| R-002 | 6 | SEC | Stripe customer fails | 3 API tests (retry, fallback) |
| R-003 | 6 | BUS | Discount not applied | 3 unit + 1 E2E test |
| R-004 | 6 | DATA | Non-atomic records | 2 API tests (transaction, rollback) |
| R-005 | 4 | TECH | 70-day validation | 4 API tests (boundary, timezone) |
| R-006 | 3 | BUS | Gift installments | 2 API tests |
| R-007 | 3 | SEC | No authorization | 3 component tests (checkbox, ARIA) |
| R-008 | 4 | PERF | Stripe slowness | 2 API tests (timeout) |
| R-009 | 4 | OPS | Email missing schedule | 2 API tests (templates) |
| R-010 | 2 | OPS | Mobile display | 2 component + 1 E2E test |
| R-011 | 2 | BUS | Companion confusion | 1 E2E test |
| R-012 | 2 | TECH | Date calculations | 1 unit test (leap year, timezone) |

**High-priority risks (≥6):** 4 risks, 100% covered by P0 tests
**Medium-priority risks (3-5):** 4 risks, 100% covered by P1 tests
**Low-priority risks (1-2):** 4 risks, 100% covered by P1 tests (mobile, edge cases)

---

## Notes

- **Stripe Test Mode:** All tests use Stripe test mode keys from `.env.test`. Use test card `4242 4242 4242 4242` for successful payments.
- **Database:** Tests require a separate test database. Configure `DATABASE_URL` in `.env.test` to point to test DB (will be reset between test runs).
- **Email Service:** Test environment should not send real emails. Store emails in test database or use email service's test mode.
- **Timezone Handling:** All date calculations use UTC to ensure consistency across timezones. Use `date-fns` library for date operations.
- **Currency Precision:** All amounts stored in cents (integers) to avoid floating-point rounding errors. Never use dollars with decimals for calculations.
- **Atomic Transactions:** Booking and payment record creation MUST be wrapped in database transaction. Any failure rolls back entire operation (no orphaned records).
- **Retry Logic:** Stripe customer creation has exponential backoff: 1s → 2s → 4s. Only retry on transient errors (5xx, timeouts). Max 3 attempts before fallback to FULL payment.
- **Authorization Checkbox:** Required by Stripe's authorization rules and consumer protection laws. Must be checked before saving payment method for future charges.
- **Companion Bookings:** Each booking has independent payment plan selection. Primary can choose FULL, companion can choose INSTALLMENT_4 (or vice versa). Separate payment processing for each.

---

## Contact

**Questions or Issues?**

- Ask in team standup (daily)
- Tag @Grant in Slack/Discord
- Refer to `./_bmad/bmm/docs/tea-README.md` for TEA workflow documentation
- Consult `./_bmad/bmm/testarch/knowledge` for testing best practices
- Reference test design document: `./_bmad-output/test-design-epic-4-6.md`

---

**Generated by BMad TEA Agent** - 2026-01-14
