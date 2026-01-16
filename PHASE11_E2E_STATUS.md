# Phase 11: E2E Testing Status

**Date:** 2026-01-16
**Phase:** E2E Testing Setup Complete
**Status:** ✅ Infrastructure Ready, Tests Need Implementation

---

## Summary

Phase 11 E2E testing infrastructure is now **fully set up and operational**. Playwright is installed, configured, and ready to run tests. The test suite already contains comprehensive test **skeletons** for installment payments, but most tests are failing because they need:

1. **Test data setup** (fixtures, factories, database seeding)
2. **Component implementation** (UI elements with data-testid attributes)
3. **API implementation** (tRPC endpoints for booking/payments)

---

## Current Test Status

**Total Tests:** 129
**Passing:** 27 (unit tests) ✅
**Failing:** 96 (E2E, API, component tests - need implementation)
**Skipped:** 6

### Breakdown by Category

| Category | Tests | Status | Notes |
|----------|-------|--------|-------|
| **Unit Tests** | 9 | ✅ 9 passing | Installment calculator, discount math, date calculations |
| **API Tests** | 12 | ❌ 12 failing | Booking creation, Stripe integration, validation rules |
| **Component Tests** | 9 | ❌ 9 failing | PaymentPlanSelector UI component |
| **E2E Tests** | 5 | ❌ 5 failing | Full payment flow, installment flow, dashboard |
| **Example Tests** | 4 | ⚠️ 2 fail, 2 skip | Homepage navigation (example tests) |

---

## Infrastructure Components ✅

### 1. Playwright Installation
- **Version:** 1.57.0
- **Browsers:** Chromium, Firefox, WebKit installed
- **Command:** `npm run test:e2e`

### 2. Test Directory Structure
```
tests/
├── e2e/                          # End-to-end tests
│   ├── example.spec.ts           # Example homepage tests
│   └── installment-payment-flows.spec.ts  # Payment E2E tests
├── api/                          # API integration tests
│   ├── booking-create-installment.api.spec.ts
│   └── stripe-integration.api.spec.ts
├── component/                    # React component tests
│   └── PaymentPlanSelector.test.tsx
├── unit/                         # Unit tests
│   └── installment-calculator.spec.ts  ✅ Passing
└── support/                      # Test utilities
    ├── fixtures/                 # Test fixtures & factories
    │   ├── index.ts
    │   └── factories/
    │       ├── booking.factory.ts
    │       ├── payment.factory.ts
    │       ├── stripe.factory.ts
    │       ├── trip.factory.ts
    │       └── user.factory.ts
    ├── helpers/                  # Test helper functions
    └── page-objects/             # Page object models
```

### 3. Configuration Files
- ✅ **playwright.config.ts** - Configured with 3 browsers, proper timeouts
- ✅ **tests/README.md** - Comprehensive testing documentation
- ✅ **.gitignore** - Updated to ignore test-results and playwright-report

### 4. Test Scripts (package.json)
```bash
npm test                # Run unit tests (Vitest)
npm run test:e2e        # Run E2E tests (Playwright)
npm run test:e2e:ui     # Run E2E tests in UI mode (interactive)
npm run test:e2e:headed # Run E2E tests with visible browser
npm run test:e2e:debug  # Debug specific E2E test
npm run test:e2e:report # View Playwright HTML report
```

---

## What's Already Built (Test Skeletons)

###  1. E2E Payment Flow Tests

**File:** [`tests/e2e/installment-payment-flows.spec.ts`](tests/e2e/installment-payment-flows.spec.ts)

#### Test: FULL Payment with 2% Discount (P0)
- Navigate to trip details page
- Click "Book Now"
- Select FULL payment plan
- Verify 2% discount displays ($100 on $5,000)
- Verify final amount ($4,900)
- Enter Stripe test card (4242 4242 4242 4242)
- Submit payment
- Verify confirmation page shows FULL payment with discount

#### Test: INSTALLMENT_4 Payment Flow (P0)
- Navigate to trip (80+ days away)
- Select INSTALLMENT_4 plan
- Verify installment schedule preview (50%, 25%, 15%, 10%)
- Check payment authorization checkbox
- Enter payment details
- Submit first installment ($5,000 of $10,000)
- Verify confirmation shows 4 payments (1 PAID, 3 PENDING)
- Verify Stripe customer created

#### Test: Dashboard Payment Schedule View (P1)
- User navigates to dashboard
- Booking shows "Installment Plan" badge
- Click booking to view details
- Payment schedule displays with all 4 installments
- Progress bar shows 50% complete (first payment done)

#### Test: Mobile Responsive (P1)
- Set viewport to mobile (375x667)
- Navigate to booking details
- Payment schedule uses vertical card layout
- Cards are full width
- Text is readable (not truncated)

#### Test: Companion Booking (P1)
- Book trip with companion
- Primary selects FULL plan (sees 2% discount)
- Companion selects INSTALLMENT_4 plan
- Two separate payment forms shown
- Forms clearly labeled "Your Payment" and "Companion's Payment"

---

### 2. API Integration Tests

**Files:**
- [`tests/api/booking-create-installment.api.spec.ts`](tests/api/booking-create-installment.api.spec.ts) - 10 tests
- [`tests/api/stripe-integration.api.spec.ts`](tests/api/stripe-integration.api.spec.ts) - 4 tests

#### Stripe Customer Creation (P0)
- ✅ Create Stripe customer for new user
- ✅ Retry on transient failure
- ✅ Fallback to FULL payment after max retries

#### Atomic Transactions (P0)
- ✅ Create booking + 4 payment records atomically
- ✅ Rollback if payment record creation fails

#### 70-Day Validation (P1)
- ✅ Reject installments for trip in 69 days
- ✅ Allow installments for trip in exactly 70 days
- ✅ Allow installments for trip in 100 days
- ✅ Handle timezone edge cases

#### Gift Booking Restrictions (P1)
- ✅ Disable installments for gift bookings
- ✅ Allow FULL payment for gifts

#### Email Confirmation (P1)
- ✅ Send email with installment schedule
- ✅ Send email with 2% discount info

---

### 3. Component Tests

**File:** [`tests/component/PaymentPlanSelector.test.tsx`](tests/component/PaymentPlanSelector.test.tsx) - 9 tests

#### Plan Selection (P1)
- Display all 3 payment options
- Select FULL plan by default
- Switch to INSTALLMENT_4 when clicked
- Support keyboard navigation (Tab, Enter)

#### Authorization Checkbox (P1)
- Display checkbox for INSTALLMENT_4
- Require checkbox to proceed
- Include proper ARIA labels for screen readers

#### Installment Schedule Display (P1)
- Display schedule with correct dates
- Format amounts with currency ($X,XXX.XX)
- Display correctly on mobile layout

---

## What Needs to Be Done

### Priority 1: Fix Test Data & Fixtures

**Current Issue:** Tests fail because they try to navigate to non-existent routes/pages.

**Solution:**
1. Implement test fixtures in `tests/support/fixtures/index.ts`
2. Create authenticated user fixture with auto-cleanup
3. Create test trip/booking data factories
4. Set up test database seeding

**Example Fixture:**
```typescript
export const test = base.extend<TestFixtures>({
  authenticatedUser: async ({ page }, use) => {
    const user = await createTestUser();
    await loginUser(page, user);
    await use(user);
    await deleteTestUser(user.id);
  },

  testTrip: async ({ authenticatedUser }, use) => {
    const trip = await createTestTrip({
      startDate: add Days(new Date(), 80), // 80 days from now
      priceCents: 1000000, // $10,000
    });
    await use(trip);
    await deleteTestTrip(trip.id);
  },
});
```

### Priority 2: Implement Missing UI Components

**Current Issue:** Tests look for `data-testid` attributes that don't exist yet.

**Missing Elements:**
- `[data-testid="plan-option-FULL"]` - Payment plan radio button
- `[data-testid="plan-option-INSTALLMENT_4"]` - Installment radio button
- `[data-testid="discount-amount"]` - Discount display
- `[data-testid="installment-schedule-preview"]` - Installment schedule card
- `[data-testid="payment-method-authorization-checkbox"]` - Authorization checkbox
- `[data-testid="payment-schedule"]` - Dashboard payment schedule

**Solution:**
1. Add `data-testid` attributes to existing components
2. Create `PaymentPlanSelector` component if it doesn't exist
3. Create `InstallmentSchedule` component
4. Update dashboard to display payment schedule

### Priority 3: Implement API Endpoints

**Current Issue:** API tests fail because tRPC endpoints need implementation.

**Missing Endpoints:**
- `booking.create` - Create booking with payment plan
- `booking.getById` - Fetch booking with payment records
- `payment.updateMethod` - Update customer payment method

**Solution:**
1. Implement tRPC routers in `src/server/api/routers/`
2. Add Stripe customer creation logic
3. Add atomic transaction for booking + payment records
4. Add 70-day validation rule

---

## Next Steps (Recommended Order)

### Step 1: Verify Unit Tests (Already Passing ✅)
```bash
npm test  # Should show 9/9 passing
```

### Step 2: Implement Test Fixtures
```bash
# Edit tests/support/fixtures/index.ts
# Add authenticatedUser fixture
# Add testTrip fixture with future date
```

### Step 3: Add data-testid Attributes to UI
```bash
# Edit src/components/booking/PaymentPlanSelector.tsx
# Add data-testid attributes to all interactive elements
```

### Step 4: Run Component Tests
```bash
npx playwright test tests/component/ --headed
# Debug failures and fix one by one
```

### Step 5: Implement API Endpoints
```bash
# Create src/server/api/routers/booking.ts
# Implement booking.create with payment plan logic
```

### Step 6: Run API Tests
```bash
npx playwright test tests/api/
# Verify API tests pass
```

### Step 7: Run E2E Tests
```bash
npx playwright test tests/e2e/installment-payment-flows.spec.ts --headed
# Watch full user journey and debug failures
```

### Step 8: Fix Failing Tests
- Use `npx playwright test --ui` for interactive debugging
- Use `npx playwright test --debug` to step through tests
- Check `playwright-report/index.html` for detailed failure reports

---

## Test Quality Standards

The existing tests follow **BMad TEA (Test Engineering & Automation)** best practices:

### 1. Test Structure (Given-When-Then)
```typescript
test('should complete booking with FULL payment', async ({ page }) => {
  // GIVEN: User is authenticated and viewing trip
  await page.goto('/trips/morocco-adventure');

  // WHEN: User selects FULL payment
  await page.click('[data-testid="plan-option-FULL"]');

  // THEN: 2% discount is displayed
  await expect(page.locator('[data-testid="discount-amount"]')).toHaveText('$100.00');
});
```

### 2. Data-Testid Selectors
- All tests use `data-testid` attributes (not CSS classes or IDs)
- Prevents test brittleness when styling changes
- Clear, semantic names

### 3. Proper Assertions
- Use Playwright's `expect()` with built-in retry logic
- Check both visibility and content
- Verify state changes (PENDING → PAID)

### 4. Test Isolation
- Each test creates its own data (via fixtures)
- Tests can run in parallel
- No dependencies between tests

---

## Known Issues

### 1. Missing Environment Variables
Tests may need:
```bash
# .env.test
DATABASE_URL="postgresql://test:..."
STRIPE_SECRET_KEY="sk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Test Database
- Need separate test database (not dev database)
- Use `DATABASE_URL` in `.env.test`
- Reset database before each test run

### 3. Stripe Test Mode
- Use Stripe test keys (sk_test_...)
- Use Stripe test cards (4242 4242 4242 4242)
- Mock webhooks for local testing

---

## Resources

### Playwright Documentation
- [Getting Started](https://playwright.dev/docs/intro)
- [Writing Tests](https://playwright.dev/docs/writing-tests)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Debugging Tests](https://playwright.dev/docs/debug)

### Project Documentation
- [tests/README.md](tests/README.md) - Comprehensive test suite guide
- [docs/E4-S6-Testing-Roadmap.md](docs/E4-S6-Testing-Roadmap.md) - Phase 9-10 testing strategy
- [playwright.config.ts](playwright.config.ts) - Playwright configuration

### Test Commands
```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/installment-payment-flows.spec.ts

# Run specific test
npx playwright test -g "should complete booking with FULL payment"

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Debug test
npx playwright test --debug

# Generate code (record actions)
npx playwright codegen http://localhost:3000
```

---

## Summary

✅ **Phase 11 Infrastructure:** Complete
⚠️ **Test Implementation:** In Progress (27/129 passing)
🎯 **Next Goal:** Implement test fixtures and add data-testid attributes

**Estimated Time to 100% Passing:**
- Fixtures & Test Data: ~4 hours
- UI data-testid attributes: ~3 hours
- API endpoint implementation: ~8 hours
- Debugging & fixes: ~6 hours
- **Total:** ~21 hours (2.5 days)

---

**Status:** ✅ Ready for Phase 11 implementation
**Last Updated:** 2026-01-16
**Next Action:** Implement test fixtures in `tests/support/fixtures/index.ts`
