import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Pickleball Passport
 *
 * Test Framework Architecture:
 * - E2E tests: Critical user journeys (booking, payments, authentication)
 * - API tests: tRPC endpoints, Stripe integration, database operations
 * - Component tests: React components with Testing Library
 *
 * Knowledge Base References:
 * - fixture-architecture.md: Test fixtures with auto-cleanup
 * - data-factories.md: Faker-based test data generation
 * - network-first.md: Route interception patterns
 * - test-quality.md: Test design principles
 */

export default defineConfig({
  testDir: './tests',

  // Test execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Timeouts (aligned with TEA standards)
  timeout: 60 * 1000, // Test timeout: 60s
  expect: {
    timeout: 15 * 1000, // Assertion timeout: 15s
  },

  // Test configuration
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure', // Powerful debugging with screenshots, network, console
    screenshot: 'only-on-failure', // Reduce storage overhead
    video: 'retain-on-failure', // Keep videos only when tests fail
    actionTimeout: 15 * 1000, // Action timeout: 15s (click, fill, etc.)
    navigationTimeout: 30 * 1000, // Navigation timeout: 30s
  },

  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  // Browser projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Development server (optional - uncomment if needed)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
