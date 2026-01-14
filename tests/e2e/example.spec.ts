import { test, expect } from '../support/fixtures';

/**
 * Example Test Suite - Demonstrates Playwright testing patterns
 *
 * Knowledge Base References:
 * - test-quality.md: Given-When-Then structure, one assertion per test
 * - network-first.md: Route interception before navigation
 * - selector-resilience.md: data-testid selector strategy
 */

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    // GIVEN: User navigates to homepage
    await page.goto('/');

    // THEN: Page loads with expected title
    await expect(page).toHaveTitle(/Pickleball Passport/i);
  });

  test('should display navigation menu', async ({ page }) => {
    // GIVEN: User is on homepage
    await page.goto('/');

    // THEN: Main navigation is visible
    await expect(page.locator('nav')).toBeVisible();
  });
});

test.describe('Authentication (Example)', () => {
  test.skip('should display login form', async ({ page }) => {
    // GIVEN: User navigates to login page
    await page.goto('/sign-in');

    // THEN: Login form is displayed
    await expect(page.locator('[data-testid="sign-in-form"]')).toBeVisible();
  });

  test.skip('should handle invalid credentials', async ({ page }) => {
    // GIVEN: User is on login page
    await page.goto('/sign-in');

    // WHEN: User submits invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // THEN: Error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});

/**
 * Note: These are example tests. Remove or adapt them based on your actual application.
 *
 * Best Practices:
 * 1. Use Given-When-Then comments for clarity
 * 2. One assertion per test (atomic tests)
 * 3. Use data-testid selectors for stability
 * 4. No hard waits (use Playwright's auto-waiting)
 * 5. Intercept network requests before navigation (network-first pattern)
 */
