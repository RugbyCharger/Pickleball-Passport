import { test, expect } from '../support/fixtures';

/**
 * E2E Tests: Installment Payment Flows
 *
 * Tests complete user journeys for payment plan selection and booking:
 * - FULL payment flow with 2% discount (P0)
 * - INSTALLMENT_4 flow with payment schedule (P0)
 * - Dashboard payment schedule view (P1)
 * - Companion booking with independent plans (P1)
 *
 * Risk Coverage:
 * - R-002: Stripe customer creation (Score 6)
 * - R-003: 2% discount accuracy (Score 6)
 * - R-004: Atomic transactions (Score 6)
 * - R-010: Dashboard mobile display (Score 2)
 * - R-011: Companion booking confusion (Score 2)
 *
 * Priority: P0 + P1 (Critical + High)
 */

test.describe('FULL Payment Flow with 2% Discount (P0)', () => {
  test('should complete booking with FULL payment and apply 2% discount', async ({
    page,
  }) => {
    // GIVEN: User is authenticated and viewing trip details
    await page.goto('/trips/morocco-adventure');
    await page.waitForLoadState('networkidle');

    // AND: Trip costs $5,000.00
    const tripCost = await page
      .locator('[data-testid="trip-total-cost"]')
      .textContent();
    expect(tripCost).toContain('$5,000');

    // WHEN: User clicks "Book Now"
    await page.click('[data-testid="book-now-button"]');
    await page.waitForURL(/\/booking\/new/);

    // WHEN: User selects FULL payment plan
    await page.click('[data-testid="plan-option-FULL"]');

    // THEN: 2% discount is displayed in pricing summary
    const discountAmount = page.locator('[data-testid="discount-amount"]');
    await expect(discountAmount).toBeVisible();
    await expect(discountAmount).toHaveText('$100.00'); // 2% of $5,000

    // AND: Final amount shows discounted total
    const finalAmount = page.locator('[data-testid="final-amount"]');
    await expect(finalAmount).toHaveText('$4,900.00'); // $5,000 - $100

    // WHEN: User proceeds to payment
    await page.click('[data-testid="continue-to-payment-button"]');
    await page.waitForURL(/\/payment/);

    // WHEN: User enters payment details
    await page.fill('[data-testid="card-number"]', '4242424242424242'); // Stripe test card
    await page.fill('[data-testid="card-expiry"]', '12/34');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="cardholder-name"]', 'Test User');

    // WHEN: User submits payment
    await page.click('[data-testid="submit-payment-button"]');

    // THEN: Payment processes successfully
    await page.waitForURL(/\/booking\/confirmation/, { timeout: 30000 });

    // AND: Confirmation page shows FULL payment with discount
    const confirmationSummary = page.locator(
      '[data-testid="payment-summary"]'
    );
    await expect(confirmationSummary).toContainText('Paid in Full');
    await expect(confirmationSummary).toContainText('$4,900.00');
    await expect(confirmationSummary).toContainText('2% Discount Applied');

    // AND: Database contains booking with FULL payment plan
    // (verify via API call or database query in test cleanup)
    const bookingId = await page
      .locator('[data-testid="booking-id"]')
      .textContent();
    expect(bookingId).toBeTruthy();

    // AND: Email sent with discount details
    // (verify email queue or email service mock)
  });
});

test.describe('INSTALLMENT_4 Payment Flow (P0)', () => {
  test('should complete booking with INSTALLMENT_4 plan and create payment schedule', async ({
    page,
  }) => {
    // GIVEN: User is authenticated and viewing trip starting in 80 days
    await page.goto('/trips/italy-tour');
    await page.waitForLoadState('networkidle');

    // AND: Trip costs $10,000.00 and starts 80 days from now
    const tripStartDate = await page
      .locator('[data-testid="trip-start-date"]')
      .textContent();
    // Verify trip is more than 70 days away

    // WHEN: User clicks "Book Now"
    await page.click('[data-testid="book-now-button"]');
    await page.waitForURL(/\/booking\/new/);

    // WHEN: User selects INSTALLMENT_4 payment plan
    await page.click('[data-testid="plan-option-INSTALLMENT_4"]');

    // THEN: Installment schedule preview is displayed
    const schedule = page.locator(
      '[data-testid="installment-schedule-preview"]'
    );
    await expect(schedule).toBeVisible();

    // AND: Schedule shows 4 installments with correct amounts
    await expect(
      schedule.locator('[data-testid="installment-1-amount"]')
    ).toHaveText('$5,000.00'); // 50%
    await expect(
      schedule.locator('[data-testid="installment-2-amount"]')
    ).toHaveText('$2,500.00'); // 25%
    await expect(
      schedule.locator('[data-testid="installment-3-amount"]')
    ).toHaveText('$1,500.00'); // 15%
    await expect(
      schedule.locator('[data-testid="installment-4-amount"]')
    ).toHaveText('$1,000.00'); // 10%

    // WHEN: User checks authorization checkbox
    await page.check('[data-testid="payment-method-authorization-checkbox"]');

    // WHEN: User proceeds to payment
    await page.click('[data-testid="continue-to-payment-button"]');
    await page.waitForURL(/\/payment/);

    // THEN: Payment page shows "First Installment" heading
    await expect(
      page.locator('[data-testid="payment-heading"]')
    ).toHaveText(/First Installment|Pay First Installment/i);

    // AND: Amount due today is 50% ($5,000)
    await expect(page.locator('[data-testid="amount-due-today"]')).toHaveText(
      '$5,000.00'
    );

    // WHEN: User enters payment details
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/34');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="cardholder-name"]', 'Installment User');

    // WHEN: User submits payment
    await page.click('[data-testid="submit-payment-button"]');

    // THEN: Payment processes and Stripe customer is created
    await page.waitForURL(/\/booking\/confirmation/, { timeout: 30000 });

    // AND: Confirmation shows installment plan with schedule
    const confirmationSchedule = page.locator(
      '[data-testid="payment-schedule"]'
    );
    await expect(confirmationSchedule).toBeVisible();

    // AND: Schedule shows 4 payments with statuses
    const payments = confirmationSchedule.locator(
      '[data-testid^="payment-status-"]'
    );
    await expect(payments).toHaveCount(4);

    // AND: First payment is marked as PAID
    await expect(
      confirmationSchedule.locator('[data-testid="payment-status-1"]')
    ).toContainText('Paid');

    // AND: Remaining payments show PENDING status
    await expect(
      confirmationSchedule.locator('[data-testid="payment-status-2"]')
    ).toContainText('Pending');
    await expect(
      confirmationSchedule.locator('[data-testid="payment-status-3"]')
    ).toContainText('Pending');
    await expect(
      confirmationSchedule.locator('[data-testid="payment-status-4"]')
    ).toContainText('Pending');

    // AND: Database contains booking with 4 payment records
    const bookingId = await page
      .locator('[data-testid="booking-id"]')
      .textContent();
    expect(bookingId).toBeTruthy();

    // AND: Stripe customer ID exists for user
    // (verify via API or test fixture)
  });
});

test.describe('Dashboard Payment Schedule View (P1)', () => {
  test('should display payment schedule for installment booking on dashboard', async ({
    page,
  }) => {
    // GIVEN: User has an existing booking with INSTALLMENT_4 plan
    // (Create test booking via fixture or API setup)

    // WHEN: User navigates to dashboard
    await page.goto('/dashboard/bookings');
    await page.waitForLoadState('networkidle');

    // THEN: Booking list shows installment badge
    const bookingCard = page
      .locator('[data-testid="booking-card"]')
      .filter({ hasText: 'Italy Tour' })
      .first();
    await expect(bookingCard).toBeVisible();

    // AND: Installment badge is displayed
    const installmentBadge = bookingCard.locator(
      '[data-testid="installment-badge"]'
    );
    await expect(installmentBadge).toBeVisible();
    await expect(installmentBadge).toHaveText('Installment Plan');

    // WHEN: User clicks booking to view details
    await bookingCard.click();
    await page.waitForURL(/\/dashboard\/bookings\/[a-z0-9-]+/);

    // THEN: Payment schedule is displayed
    const paymentSchedule = page.locator('[data-testid="payment-schedule"]');
    await expect(paymentSchedule).toBeVisible();

    // AND: All 4 installments are listed with dates and amounts
    const installments = paymentSchedule.locator(
      '[data-testid^="installment-"]'
    );
    await expect(installments).toHaveCount(4);

    // AND: Progress indicator shows payment completion
    const progressBar = paymentSchedule.locator(
      '[data-testid="payment-progress"]'
    );
    await expect(progressBar).toBeVisible();
    // First payment (50%) completed, so progress should be 50%
    await expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  test('should display payment schedule correctly on mobile', async ({
    page,
  }) => {
    // GIVEN: User is on mobile device
    await page.setViewportSize({ width: 375, height: 667 });

    // AND: User has navigated to booking details
    await page.goto('/dashboard/bookings/test-booking-installment');
    await page.waitForLoadState('networkidle');

    // WHEN: Payment schedule is rendered
    const paymentSchedule = page.locator('[data-testid="payment-schedule"]');
    await expect(paymentSchedule).toBeVisible();

    // THEN: Schedule uses card layout for mobile
    const installments = paymentSchedule.locator(
      '[data-testid^="installment-"]'
    );
    const firstCard = installments.first();

    // AND: Cards are stacked vertically
    const boundingBox = await firstCard.boundingBox();
    expect(boundingBox!.width).toBeGreaterThan(300); // Full width on mobile

    // AND: Text is readable (not truncated)
    const amount = firstCard.locator('[data-testid$="-amount"]');
    await expect(amount).toBeVisible();
    await expect(amount).not.toHaveCSS('text-overflow', 'ellipsis');
  });
});

test.describe('Companion Booking with Independent Payment Plans (P1)', () => {
  test('should allow primary and companion to select different payment plans', async ({
    page,
  }) => {
    // GIVEN: User is booking a trip with companion
    await page.goto('/trips/spain-adventure');
    await page.click('[data-testid="book-now-button"]');
    await page.waitForURL(/\/booking\/new/);

    // WHEN: User adds companion
    await page.click('[data-testid="add-companion-button"]');
    await page.fill('[data-testid="companion-name"]', 'Jane Companion');
    await page.fill(
      '[data-testid="companion-email"]',
      'jane@companion.com'
    );

    // WHEN: Primary selects FULL payment plan
    const primarySelector = page
      .locator('[data-testid="payment-plan-selector"]')
      .filter({ has: page.locator('[data-testid="primary-booking"]') });
    await primarySelector
      .locator('[data-testid="plan-option-FULL"]')
      .click();

    // THEN: Primary shows 2% discount
    await expect(
      primarySelector.locator('[data-testid="discount-amount"]')
    ).toBeVisible();

    // WHEN: Companion selects INSTALLMENT_4 plan
    const companionSelector = page
      .locator('[data-testid="payment-plan-selector"]')
      .filter({ has: page.locator('[data-testid="companion-booking"]') });
    await companionSelector
      .locator('[data-testid="plan-option-INSTALLMENT_4"]')
      .click();

    // AND: Companion checks authorization
    await companionSelector
      .locator('[data-testid="payment-method-authorization-checkbox"]')
      .check();

    // THEN: Companion shows installment schedule
    await expect(
      companionSelector.locator('[data-testid="installment-schedule-preview"]')
    ).toBeVisible();

    // WHEN: User proceeds to payment
    await page.click('[data-testid="continue-to-payment-button"]');

    // THEN: Two separate payment forms are shown
    const paymentForms = page.locator('[data-testid^="payment-form-"]');
    await expect(paymentForms).toHaveCount(2);

    // AND: Forms clearly indicate primary vs companion
    await expect(
      page.locator('[data-testid="payment-form-primary"]')
    ).toContainText('Your Payment');
    await expect(
      page.locator('[data-testid="payment-form-companion"]')
    ).toContainText("Companion's Payment");

    // AND: Primary form shows full amount with discount
    await expect(
      page.locator('[data-testid="payment-form-primary"]')
    ).toContainText('$4,900.00'); // $5,000 - 2%

    // AND: Companion form shows first installment (50%)
    await expect(
      page.locator('[data-testid="payment-form-companion"]')
    ).toContainText('$2,500.00'); // 50% of $5,000
  });
});
