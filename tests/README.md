# Pickleball Passport Test Suite

**Framework**: Playwright
**Version**: 1.x
**Test Directory**: `./tests/`

---

## Overview

This test suite provides comprehensive E2E, API, and component testing for Pickleball Passport using Playwright. The architecture follows BMad TEA (Test Engineering & Automation) best practices with fixture-based testing, data factories, and automated cleanup.

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install -D @playwright/test @faker-js/faker
npx playwright install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.test.example .env.test
```

Fill in the test environment variables:
- `DATABASE_URL`: Test database connection string (separate from dev DB)
- `STRIPE_SECRET_KEY`: Stripe test mode secret key
- `CLERK_SECRET_KEY`: Clerk test environment secret
- Other service credentials (use test/sandbox environments)

### 3. Verify Installation

Run the example tests:

```bash
npm test
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug specific test
npm run test:debug

# View test report
npm run test:report
```

### Advanced Commands

```bash
# Run specific test file
npx playwright test tests/e2e/booking.spec.ts

# Run tests matching pattern
npx playwright test --grep "installment"

# Run tests in specific browser
npx playwright test --project=chromium

# Run with trace enabled
npx playwright test --trace on

# Update snapshots
npx playwright test --update-snapshots
```

---

## Architecture Overview

### Directory Structure

```
tests/
├── e2e/                          # End-to-end tests
│   ├── booking/                  # Booking flow tests
│   ├── payment/                  # Payment tests (full, installment)
│   └── authentication/           # Auth tests
├── api/                          # API tests
│   ├── trpc/                     # tRPC endpoint tests
│   └── webhooks/                 # Webhook tests (Stripe, Clerk)
├── component/                    # Component tests
│   └── booking/                  # React component tests
└── support/                      # Test infrastructure
    ├── fixtures/                 # Test fixtures (auto-cleanup)
    │   ├── factories/            # Data factories (faker-based)
    │   └── index.ts              # Fixture exports
    ├── helpers/                  # Utility functions
    └── page-objects/             # Page object models (optional)
```

### Fixture Architecture

**Pattern**: Pure functions → fixtures → mergeTests

Fixtures provide:
- **Auto-cleanup**: Automatically delete created test data
- **Isolation**: Each test gets fresh, independent data
- **Composability**: Fixtures can depend on other fixtures
- **Type-safety**: Full TypeScript support

**Example**:

```typescript
import { test, expect } from '@/tests/support/fixtures';

test('should create booking', async ({ authenticatedUser }) => {
  // authenticatedUser fixture provides:
  // - Logged-in user session
  // - User data (id, email, token)
  // - Auto-cleanup (user deleted after test)
});
```

### Data Factories

**Pattern**: Faker-based random data generation with overrides

Factories provide:
- **Randomization**: Use `@faker-js/faker` for all test data (no hardcoded values)
- **Overrides**: Specify exact values when needed
- **Bulk creation**: Generate multiple objects easily
- **Type-safe**: Full TypeScript interfaces

**Example**:

```typescript
import { createUser, createBooking } from '@/tests/support/fixtures/factories';

// Random user
const user = createUser();

// User with specific email
const user = createUser({ email: 'test@example.com' });

// Generate 5 users
const users = createUsers(5);

// Installment booking (automatically sets trip 75 days away)
const booking = createInstallmentBooking();
```

---

## Best Practices

### 1. Given-When-Then Structure

**Always use Given-When-Then comments for clarity**:

```typescript
test('should display error for invalid credentials', async ({ page }) => {
  // GIVEN: User is on login page
  await page.goto('/login');

  // WHEN: User submits invalid credentials
  await page.fill('[data-testid="email-input"]', 'invalid@example.com');
  await page.click('[data-testid="login-button"]');

  // THEN: Error message is displayed
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

### 2. Selector Strategy (data-testid)

**Use data-testid attributes for all selectors**:

```typescript
// ✅ CORRECT: Stable, explicit selector
await page.click('[data-testid="login-button"]');

// ❌ WRONG: Brittle CSS selector
await page.click('button.bg-blue-500.px-4');

// ❌ WRONG: Text-based selector (breaks with i18n)
await page.click('text=Log In');
```

**Hierarchy for selectors**:
1. `data-testid` (preferred)
2. ARIA roles and labels
3. Semantic HTML tags
4. CSS selectors (last resort)

### 3. Network-First Pattern

**CRITICAL**: Intercept routes BEFORE navigation to prevent race conditions.

```typescript
test('should load user dashboard', async ({ page }) => {
  // ✅ CORRECT: Intercept BEFORE navigation
  await page.route('**/api/user', (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ id: 1 }) })
  );
  await page.goto('/dashboard');

  // ❌ WRONG: Navigate then intercept (race condition)
  await page.goto('/dashboard');
  await page.route('**/api/user', handler); // Too late!
});
```

### 4. One Assertion Per Test

**Atomic test design** - each test verifies a single behavior:

```typescript
// ✅ CORRECT: One assertion
test('should display user name', async ({ page }) => {
  await expect(page.locator('[data-testid="user-name"]')).toHaveText('John');
});

// ❌ WRONG: Multiple assertions (not atomic)
test('should display user info', async ({ page }) => {
  await expect(page.locator('[data-testid="user-name"]')).toHaveText('John');
  await expect(page.locator('[data-testid="user-email"]')).toHaveText('john@example.com');
});
```

### 5. No Hard Waits

**Never use `page.waitForTimeout()` or `sleep()`**:

```typescript
// ✅ CORRECT: Explicit wait for condition
await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

// ✅ CORRECT: Wait for network request
await page.waitForResponse('**/api/booking');

// ❌ WRONG: Hard wait (flaky)
await page.waitForTimeout(5000); // What if it takes 6 seconds?
```

### 6. Auto-Cleanup

**Always clean up created test data**:

```typescript
// ✅ CORRECT: Fixture with auto-cleanup
test('should create booking', async ({ authenticatedUser }) => {
  // User automatically deleted after test
});

// ❌ WRONG: Manual cleanup (easy to forget)
test('should create booking', async ({ page }) => {
  const user = await createUserAPI();
  // ... test logic ...
  await deleteUserAPI(user.id); // What if test fails before this?
});
```

---

## Knowledge Base References

This test suite follows patterns from the BMad TEA knowledge base:

- **fixture-architecture.md**: Test fixture patterns with auto-cleanup
- **data-factories.md**: Faker-based data generation
- **network-first.md**: Route interception patterns
- **test-quality.md**: Test design principles
- **selector-resilience.md**: Selector best practices
- **timing-debugging.md**: Race condition prevention

See `_bmad/bmm/testarch/tea-index.csv` for complete knowledge fragment listing.

---

## CI/CD Integration

Tests run automatically in CI with:
- **Retries**: 2 retries on failure
- **Workers**: 1 worker (serial execution to avoid database conflicts)
- **Reporters**: JUnit XML (for CI integration) + HTML report
- **Artifacts**: Screenshots, videos, traces (only on failure)

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: test-results/
```

---

## Troubleshooting

### Tests failing locally

1. **Check environment variables**: Ensure `.env.test` is configured
2. **Reset test database**: Run migrations on test database
3. **Clear browser cache**: `npx playwright install --force`
4. **Check service availability**: Ensure Stripe test mode, Clerk test environment are accessible

### Tests flaky in CI

1. **Enable trace**: Run with `--trace on` to debug
2. **Check network interception**: Ensure network-first pattern is used
3. **Review timeouts**: Increase timeouts if needed
4. **Check database isolation**: Ensure tests don't share data

### Debug mode not working

1. **Run with --debug**: `npx playwright test --debug`
2. **Use UI mode**: `npm run test:ui` for interactive debugging
3. **Add `await page.pause()`**: Pause execution at specific points

---

## Contributing

### Adding New Tests

1. **Choose test level**: E2E, API, or Component
2. **Use factories**: Generate test data with factories
3. **Follow patterns**: Given-When-Then, one assertion per test
4. **Add data-testid**: Add selectors to components if needed
5. **Clean up**: Use fixtures for auto-cleanup

### Adding New Fixtures

1. **Create fixture**: Extend `test` in `tests/support/fixtures/index.ts`
2. **Implement cleanup**: Always provide teardown logic
3. **Document usage**: Add JSDoc comments with examples
4. **Export**: Re-export from `index.ts`

### Adding New Factories

1. **Create factory file**: In `tests/support/fixtures/factories/`
2. **Use faker**: Generate all data with `@faker-js/faker`
3. **Support overrides**: Allow specific values via parameters
4. **Add helpers**: Provide convenience functions (e.g., `createInstallmentBooking`)

---

## Questions or Issues?

- Review test design document: `_bmad-output/test-design-epic-4-6.md`
- Check ATDD checklist: `_bmad-output/atdd-checklist-4-6.md`
- Consult knowledge base: `_bmad/bmm/testarch/knowledge/`
- Ask in team standup

---

**Generated by BMad TEA Agent** - Test Framework Setup
**Date**: 2026-01-13
