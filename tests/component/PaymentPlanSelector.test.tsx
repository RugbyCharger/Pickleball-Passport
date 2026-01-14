import { test, expect } from '@playwright/test';

/**
 * Component Tests: PaymentPlanSelector Component
 *
 * Tests the payment plan selection UI component:
 * - Plan selection interaction
 * - Keyboard navigation
 * - Default states
 * - Authorization checkbox (P1)
 *
 * Risk Coverage:
 * - R-007: Payment method saved without authorization (Score 3)
 *
 * Priority: P1 (High) - Run on PR to main
 *
 * NOTE: These tests use Playwright for E2E testing of components in browser.
 * For React Testing Library or component testing framework, adjust imports.
 */

test.describe('PaymentPlanSelector - Plan Selection (P1)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to booking page with payment plan selector
    await page.goto('/booking/new?tripId=test-trip');

    // Wait for payment plan selector to load
    await page.waitForSelector('[data-testid="payment-plan-selector"]');
  });

  test('should display all payment plan options', async ({ page }) => {
    // GIVEN: User is on booking page
    // (setup in beforeEach)

    // WHEN: Payment plan selector is rendered
    const selector = page.locator('[data-testid="payment-plan-selector"]');

    // THEN: All payment plan options are visible
    await expect(
      selector.locator('[data-testid="plan-option-FULL"]')
    ).toBeVisible();
    await expect(
      selector.locator('[data-testid="plan-option-INSTALLMENT_4"]')
    ).toBeVisible();

    // AND: FINANCING option is disabled (future feature)
    const financingOption = selector.locator(
      '[data-testid="plan-option-FINANCING"]'
    );
    await expect(financingOption).toBeDisabled();
  });

  test('should select FULL payment plan by default', async ({ page }) => {
    // GIVEN: User is on booking page
    const selector = page.locator('[data-testid="payment-plan-selector"]');

    // WHEN: Component first renders
    // (no action needed)

    // THEN: FULL payment plan is selected by default
    const fullOption = selector.locator('[data-testid="plan-option-FULL"]');
    await expect(fullOption).toHaveAttribute('aria-checked', 'true');

    // AND: 2% discount badge is displayed
    await expect(
      selector.locator('[data-testid="full-plan-discount-badge"]')
    ).toHaveText('Save 2%');
  });

  test('should switch to INSTALLMENT_4 plan when clicked', async ({
    page,
  }) => {
    // GIVEN: User is on booking page with FULL plan selected
    const selector = page.locator('[data-testid="payment-plan-selector"]');

    // WHEN: User clicks INSTALLMENT_4 option
    await page.click('[data-testid="plan-option-INSTALLMENT_4"]');

    // THEN: INSTALLMENT_4 plan is selected
    const installmentOption = selector.locator(
      '[data-testid="plan-option-INSTALLMENT_4"]'
    );
    await expect(installmentOption).toHaveAttribute('aria-checked', 'true');

    // AND: FULL plan is no longer selected
    const fullOption = selector.locator('[data-testid="plan-option-FULL"]');
    await expect(fullOption).toHaveAttribute('aria-checked', 'false');

    // AND: Installment schedule preview is displayed
    await expect(
      selector.locator('[data-testid="installment-schedule-preview"]')
    ).toBeVisible();
  });

  test('should support keyboard navigation between plans', async ({ page }) => {
    // GIVEN: User is on booking page
    const fullOption = page.locator('[data-testid="plan-option-FULL"]');

    // WHEN: User focuses on FULL option and presses Tab
    await fullOption.focus();
    await page.keyboard.press('Tab');

    // THEN: Focus moves to INSTALLMENT_4 option
    const installmentOption = page.locator(
      '[data-testid="plan-option-INSTALLMENT_4"]'
    );
    await expect(installmentOption).toBeFocused();

    // WHEN: User presses Enter to select
    await page.keyboard.press('Enter');

    // THEN: INSTALLMENT_4 plan is selected
    await expect(installmentOption).toHaveAttribute('aria-checked', 'true');
  });
});

test.describe('PaymentPlanSelector - Authorization Checkbox (P1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/booking/new?tripId=test-trip');
    await page.waitForSelector('[data-testid="payment-plan-selector"]');

    // Select INSTALLMENT_4 plan to show authorization checkbox
    await page.click('[data-testid="plan-option-INSTALLMENT_4"]');
  });

  test('should display authorization checkbox for INSTALLMENT_4 plan', async ({
    page,
  }) => {
    // GIVEN: User has selected INSTALLMENT_4 plan
    // (setup in beforeEach)

    // WHEN: Payment plan is INSTALLMENT_4
    // (already set)

    // THEN: Authorization checkbox is visible
    const checkbox = page.locator(
      '[data-testid="payment-method-authorization-checkbox"]'
    );
    await expect(checkbox).toBeVisible();

    // AND: Checkbox is unchecked by default
    await expect(checkbox).not.toBeChecked();

    // AND: Authorization text is displayed
    await expect(
      page.locator('[data-testid="authorization-text"]')
    ).toContainText(
      'I authorize Pickleball Passport to charge my payment method'
    );
  });

  test('should require authorization checkbox to proceed with INSTALLMENT_4', async ({
    page,
  }) => {
    // GIVEN: User has selected INSTALLMENT_4 plan but not checked authorization

    // WHEN: User attempts to proceed to payment
    const continueButton = page.locator(
      '[data-testid="continue-to-payment-button"]'
    );
    await continueButton.click();

    // THEN: Validation error is displayed
    const errorMessage = page.locator('[data-testid="authorization-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(
      'You must authorize future charges to use installment plans'
    );

    // AND: User remains on booking page (no navigation)
    expect(page.url()).toContain('/booking/new');
  });

  test('should include proper ARIA labels for authorization checkbox', async ({
    page,
  }) => {
    // GIVEN: Authorization checkbox is displayed
    const checkbox = page.locator(
      '[data-testid="payment-method-authorization-checkbox"]'
    );

    // WHEN: Screen reader accesses checkbox
    // (checking ARIA attributes)

    // THEN: Checkbox has proper ARIA label
    await expect(checkbox).toHaveAttribute(
      'aria-label',
      'Authorize payment method for future installments'
    );

    // AND: Checkbox has describedby for additional context
    await expect(checkbox).toHaveAttribute('aria-describedby');
    const describedById = await checkbox.getAttribute('aria-describedby');
    const description = page.locator(`#${describedById}`);
    await expect(description).toContainText(
      'We will charge your saved payment method'
    );

    // AND: Checkbox is keyboard accessible (checked in previous test)
  });
});

test.describe('PaymentPlanSelector - Installment Schedule Display (P1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/booking/new?tripId=test-trip-80days');
    await page.waitForSelector('[data-testid="payment-plan-selector"]');
    await page.click('[data-testid="plan-option-INSTALLMENT_4"]');
  });

  test('should display installment schedule with correct dates', async ({
    page,
  }) => {
    // GIVEN: User has selected INSTALLMENT_4 plan
    const schedule = page.locator(
      '[data-testid="installment-schedule-preview"]'
    );

    // WHEN: Schedule is rendered
    await expect(schedule).toBeVisible();

    // THEN: All 4 installments are displayed
    const installments = schedule.locator('[data-testid^="installment-"]');
    await expect(installments).toHaveCount(4);

    // AND: First installment shows "Today" or "At Booking"
    const firstInstallment = schedule.locator('[data-testid="installment-1"]');
    await expect(firstInstallment).toContainText('50%');
    await expect(firstInstallment).toContainText(/Today|At Booking/i);

    // AND: Subsequent installments show future dates
    const secondInstallment = schedule.locator(
      '[data-testid="installment-2"]'
    );
    await expect(secondInstallment).toContainText('25%');
    await expect(secondInstallment).toContainText(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date format

    const thirdInstallment = schedule.locator('[data-testid="installment-3"]');
    await expect(thirdInstallment).toContainText('15%');

    const fourthInstallment = schedule.locator('[data-testid="installment-4"]');
    await expect(fourthInstallment).toContainText('10%');
  });

  test('should format installment amounts with currency', async ({ page }) => {
    // GIVEN: User has selected INSTALLMENT_4 plan for $5,000 trip
    const schedule = page.locator(
      '[data-testid="installment-schedule-preview"]'
    );

    // WHEN: Schedule displays amounts
    // (amounts calculated based on trip total)

    // THEN: Amounts are formatted as currency
    const firstAmount = schedule.locator(
      '[data-testid="installment-1-amount"]'
    );
    await expect(firstAmount).toHaveText(/\$\d{1,3}(,\d{3})*\.\d{2}/); // $X,XXX.XX format

    // AND: All amounts displayed are correct percentages
    // (exact values tested in unit tests - here we verify display format)
  });

  test('should display installment schedule on mobile layout', async ({
    page,
  }) => {
    // GIVEN: User is on mobile device
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

    const schedule = page.locator(
      '[data-testid="installment-schedule-preview"]'
    );

    // WHEN: Schedule is rendered on mobile
    await expect(schedule).toBeVisible();

    // THEN: Schedule uses vertical card layout
    const installments = schedule.locator('[data-testid^="installment-"]');
    await expect(installments.first()).toHaveCSS('flex-direction', 'column');

    // AND: Touch targets are at least 48px (accessibility)
    const boundingBox = await installments.first().boundingBox();
    expect(boundingBox!.height).toBeGreaterThanOrEqual(48);
  });
});
