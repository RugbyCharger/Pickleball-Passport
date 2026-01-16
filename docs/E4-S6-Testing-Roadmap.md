# E4-S6 Testing Roadmap: Installment Payment Plans

**Status:** Phase 8 Complete ✅ → Moving to Testing Phases
**Date:** 2026-01-15
**Epic:** E4-S6 Installment Payment Plans

---

## Overview

Phase 8 (Cron Job Implementation) is complete and verified with mock data. Now we need to implement comprehensive testing to ensure the entire installment payment system works correctly.

Based on the **Test Design Document** ([test-design-epic-4-6.md](_bmad-output/test-design-epic-4-6.md)), we need:

- **P0 Tests:** 15 critical scenarios (30 hours)
- **P1 Tests:** 22 high-priority scenarios (22 hours)
- **P2/P3 Tests:** 28 regression scenarios (17 hours)
- **Total:** 65 test scenarios (~69 hours / ~9 days)

---

## Testing Phases Breakdown

### Phase 9: Component & Integration Testing

**Goal:** Implement unit tests, component tests, and API tests for installment payment logic

**Priority:** P0 + P1 tests (critical and high-priority)

**Scope:**
- Unit tests for calculation logic
- Component tests for UI elements
- API tests for business logic
- Integration tests for Stripe mocking

**Duration:** ~5-6 days

---

### Phase 10: E2E Testing

**Goal:** End-to-end tests covering complete user journeys through the payment system

**Priority:** P0 E2E + P1 E2E + P2 regression

**Scope:**
- Full payment flow (with 2% discount)
- 4-installment payment flow
- Payment retry scenarios
- Error handling and edge cases
- Mobile responsiveness

**Duration:** ~3-4 days

---

## Phase 9: Component & Integration Testing

### Test Categories

#### 1. Unit Tests (Priority: P0)

**File:** `lib/payments/__tests__/installment-calculator.test.ts`

Test scenarios:
- ✅ Retry calculator (already done in Phase 8)
- [ ] Installment amount calculation (50%, 25%, 15%, 10%)
- [ ] Rounding logic and sum validation
- [ ] 2% discount calculation for FULL payment
- [ ] Date calculations (60d, 30d, 7d before trip)
- [ ] Error categorization (transient vs permanent)

**Critical Test Cases (R-001 - Rounding Errors):**
```typescript
describe('Installment Calculator', () => {
  it('should split $10 correctly: [$5.00, $2.50, $1.50, $1.00]', () => {
    const result = calculateInstallments(1000) // $10 in cents
    expect(result).toEqual([500, 250, 150, 100])
    expect(result.reduce((a, b) => a + b)).toBe(1000)
  })

  it('should split $15,385.67 and sum to exact total', () => {
    const result = calculateInstallments(1538567) // in cents
    expect(result.reduce((a, b) => a + b)).toBe(1538567)
  })

  it('should adjust last installment for odd totals', () => {
    const result = calculateInstallments(1000347) // $10,003.47
    expect(result.reduce((a, b) => a + b)).toBe(1000347)
  })
})
```

**Test Count:** 8 unit tests
**Time:** ~4 hours

---

#### 2. Component Tests (Priority: P1)

**Framework:** React Testing Library + Vitest

**Components to Test:**

**A. Payment Plan Selection Component**
File: `src/components/booking/__tests__/PaymentPlanSelector.test.tsx`

Test scenarios:
- [ ] Three payment options render correctly
- [ ] Default selection is "Pay in Full"
- [ ] 2% discount badge displays on FULL option
- [ ] "Most Popular" badge displays on INSTALLMENT_4
- [ ] Selected option highlighted with blue border
- [ ] Radio selection changes on click
- [ ] Mobile responsive (stacks vertically <768px)

**B. Installment Schedule Component**
File: `src/components/booking/__tests__/InstallmentSchedule.test.tsx`

Test scenarios:
- [ ] 4 installments display with correct amounts
- [ ] Dates calculated correctly (today, -60d, -30d, -7d)
- [ ] Total sum displayed at bottom
- [ ] Help text about auto-charging visible
- [ ] Validation error if trip <70 days away

**C. Payment Authorization Checkbox**
File: `src/components/booking/__tests__/PaymentAuthCheckbox.test.tsx`

Test scenarios (R-007 - Authorization):
- [ ] Checkbox renders with proper ARIA labels
- [ ] Checkbox is required (cannot submit unchecked)
- [ ] Error message displays when validation fails
- [ ] Screen reader announces requirement
- [ ] Keyboard accessible (Tab, Space to toggle)

**Test Count:** 18 component tests
**Time:** ~9 hours

---

#### 3. API / Integration Tests (Priority: P0 + P1)

**Framework:** Vitest + Stripe Mock Server

**A. Booking Creation with Installment Plan**
File: `src/server/api/routers/__tests__/booking-installment.test.ts`

Test scenarios (R-004 - Atomic Transactions):
- [ ] Create booking with INSTALLMENT_4 plan
- [ ] 4 PaymentRecords created atomically
- [ ] Rollback on failure (no orphaned records)
- [ ] Stripe customer ID saved correctly
- [ ] First installment charged immediately

**B. Full Payment with Discount**
File: `src/server/api/routers/__tests__/booking-full-payment.test.ts`

Test scenarios (R-003 - Discount Calculation):
- [ ] 2% discount calculated correctly
- [ ] Single Payment record created
- [ ] Discount persists through payment flow
- [ ] Receipt reflects discount as line item

**C. Stripe Customer Creation with Retry**
File: `src/lib/payments/__tests__/stripe-customer.test.ts`

Test scenarios (R-002 - Customer Creation Fails):
- [ ] Success case: Customer created, ID saved
- [ ] Retry case: Failure → retry → success
- [ ] Fallback case: Multiple failures → fall back to FULL payment
- [ ] User notification sent on fallback

**D. Business Rule Validations**
File: `src/server/api/routers/__tests__/booking-validation.test.ts`

Test scenarios (R-005, R-006):
- [ ] Trip must be 70+ days away for installments
- [ ] Exactly 70 days → allowed
- [ ] 69 days → rejected with error message
- [ ] Gift bookings → installments disabled
- [ ] isGift=true → only FULL payment option

**Test Count:** 22 API tests
**Time:** ~11 hours

---

## Phase 10: E2E Testing

### E2E Test Scenarios

**Framework:** Playwright

**File Structure:**
```
e2e/
  payment/
    full-payment.spec.ts
    installment-payment.spec.ts
    payment-retry.spec.ts
    payment-errors.spec.ts
```

---

#### 1. Full Payment E2E (Priority: P0)

**File:** `e2e/payment/full-payment.spec.ts`

**Scenario:** User selects FULL payment, receives 2% discount, completes payment

```typescript
test('Full payment with 2% discount end-to-end', async ({ page }) => {
  // 1. Navigate to booking review
  // 2. Select "Pay in Full" option
  // 3. Verify 2% discount displayed
  // 4. Verify discounted total shown
  // 5. Enter payment details (Stripe test card)
  // 6. Submit payment
  // 7. Verify success message
  // 8. Check database: Booking created with paymentPlan=FULL
  // 9. Check database: Single Payment record with discounted amount
  // 10. Verify confirmation email sent with discount line item
})
```

**Test Count:** 1 test
**Time:** ~2 hours

---

#### 2. 4-Installment Payment E2E (Priority: P0)

**File:** `e2e/payment/installment-payment.spec.ts`

**Scenario:** User selects INSTALLMENT_4, authorizes future charges, completes first payment

```typescript
test('4-installment payment end-to-end', async ({ page }) => {
  // 1. Navigate to booking review
  // 2. Select "4-Payment Installment Plan"
  // 3. Verify installment schedule displays (4 payments)
  // 4. Verify dates calculated correctly
  // 5. Check authorization checkbox
  // 6. Enter payment details (Stripe test card)
  // 7. Submit payment
  // 8. Verify success message
  // 9. Check database: Booking with paymentPlan=INSTALLMENT_4
  // 10. Check database: 4 PaymentRecords created
  // 11. Check database: First payment status=PAID
  // 12. Check database: Remaining 3 payments status=PENDING
  // 13. Check database: Stripe customer ID saved
  // 14. Verify confirmation email with schedule
})
```

**Test Count:** 1 test
**Time:** ~2 hours

---

#### 3. Payment Retry Flow E2E (Priority: P1)

**File:** `e2e/payment/payment-retry.spec.ts`

**Scenario:** Installment payment fails, retry scheduled, customer receives email

```typescript
test('Failed payment retry flow', async ({ page }) => {
  // Setup: Create booking with PaymentRecord due today
  // 1. Trigger cron job (or mock time to due date)
  // 2. Use declined test card (4000 0000 0000 0002)
  // 3. Verify payment status=PENDING
  // 4. Verify retryCount incremented
  // 5. Verify lastAttemptAt updated
  // 6. Verify customer email sent with retry date
  // 7. Fast-forward time to retry date
  // 8. Trigger cron job again
  // 9. Use successful test card
  // 10. Verify payment status=PAID
})
```

**Test Count:** 3 tests (attempt 1 failure, retry success, max retries exceeded)
**Time:** ~6 hours

---

#### 4. Error Handling E2E (Priority: P1)

**File:** `e2e/payment/payment-errors.spec.ts`

**Test scenarios:**
- [ ] Trip <70 days → installments disabled
- [ ] Stripe customer creation fails → falls back to FULL
- [ ] First payment declined → error message shown
- [ ] Payment method cannot be saved → error shown
- [ ] Network error during payment → retry mechanism

**Test Count:** 5 tests
**Time:** ~5 hours

---

#### 5. Mobile Responsiveness E2E (Priority: P2)

**File:** `e2e/payment/mobile-responsive.spec.ts`

**Test scenarios:**
- [ ] Payment options stack vertically on mobile
- [ ] Installment schedule cards display correctly
- [ ] Touch targets ≥48px
- [ ] Horizontal scrolling not required
- [ ] Payment form accessible on mobile

**Test Count:** 3 tests
**Time:** ~3 hours

---

#### 6. Accessibility E2E (Priority: P2)

**File:** `e2e/payment/accessibility.spec.ts`

**Test scenarios:**
- [ ] Screen reader announces payment options
- [ ] Keyboard navigation complete flow (Tab, Enter, Space)
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Error messages announced

**Test Count:** 4 tests
**Time:** ~4 hours

---

## Testing Tools & Setup

### Required Tools

1. **Vitest** - Unit and integration tests
   ```bash
   npm install -D vitest @vitest/ui
   ```

2. **React Testing Library** - Component tests
   ```bash
   npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```

3. **Playwright** - E2E tests
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

4. **Stripe Test Mode** - Payment testing
   - Use Stripe test cards
   - Mock Stripe webhooks locally
   - Test customer creation

5. **Mock Email Service** - Email validation
   ```bash
   npm install -D nodemailer-mock
   ```

---

## Test Data Factories

**File:** `src/test/factories/booking.factory.ts`

```typescript
export function createTestBooking(overrides?: Partial<Booking>) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    tripId: faker.string.uuid(),
    packageId: faker.string.uuid(),
    paymentPlan: 'FULL',
    totalPriceCents: 100000, // $1,000
    ...overrides,
  }
}

export function createTestPaymentRecord(overrides?: Partial<PaymentRecord>) {
  return {
    id: faker.string.uuid(),
    bookingId: faker.string.uuid(),
    amountCents: 50000,
    status: 'PENDING',
    dueDate: new Date(),
    installmentNumber: 1,
    retryCount: 0,
    ...overrides,
  }
}
```

---

## Test Execution Strategy

### Local Development

```bash
# Run unit tests
npm run test:unit

# Run component tests
npm run test:component

# Run API tests
npm run test:api

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:unit

  component-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:component

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

---

## Quality Gates

### Phase 9 Completion Criteria

- [ ] All P0 unit tests pass (8/8)
- [ ] All P0 component tests pass (6/18)
- [ ] All P0 API tests pass (8/22)
- [ ] Code coverage ≥80% for payment logic
- [ ] No high-risk (≥6) items unmitigated

### Phase 10 Completion Criteria

- [ ] All P0 E2E tests pass (2/2)
- [ ] All P1 E2E tests pass (8/12)
- [ ] Payment retry flow validated
- [ ] Error handling tested
- [ ] Mobile responsiveness verified
- [ ] Accessibility checks pass

---

## Time Estimates

| Phase | Category | Tests | Hours | Days (8h) |
|-------|----------|-------|-------|-----------|
| 9 | Unit Tests | 8 | 4 | 0.5 |
| 9 | Component Tests | 18 | 9 | 1.1 |
| 9 | API Tests | 22 | 11 | 1.4 |
| **9 Total** | **-** | **48** | **24** | **3 days** |
| 10 | E2E Critical | 2 | 4 | 0.5 |
| 10 | E2E Retry | 3 | 6 | 0.75 |
| 10 | E2E Errors | 5 | 5 | 0.6 |
| 10 | E2E Mobile | 3 | 3 | 0.4 |
| 10 | E2E A11y | 4 | 4 | 0.5 |
| **10 Total** | **-** | **17** | **22** | **2.75 days** |
| **Grand Total** | **-** | **65** | **46** | **~6 days** |

---

## Next Steps

### Immediate Actions

1. **Set up testing framework**
   - Install Vitest, Playwright, React Testing Library
   - Configure test runners
   - Set up Stripe test mode

2. **Create test data factories**
   - Booking factory
   - PaymentRecord factory
   - User factory

3. **Start with P0 unit tests**
   - Installment calculator
   - Discount calculator
   - Retry logic (already done ✅)

4. **Move to component tests**
   - Payment plan selector
   - Installment schedule
   - Authorization checkbox

5. **Finish with E2E tests**
   - Full payment flow
   - Installment payment flow
   - Retry scenarios

---

## References

- [Test Design Document](_bmad-output/test-design-epic-4-6.md)
- [Story: E4-S6](_bmad-output/implementation/4-6-installment-payment-plans.md)
- [Phase 8 Local Testing](LOCAL_TESTING_COMPLETE.md)
- [Stripe Test Cards](https://stripe.com/docs/testing)

---

**Status:** Ready to begin Phase 9 (Component & Integration Testing)
**Estimated Completion:** 6 days (both phases)
**Priority:** P0 tests first (critical paths)
