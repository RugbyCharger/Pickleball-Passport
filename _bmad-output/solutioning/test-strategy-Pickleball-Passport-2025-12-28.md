---
date: 2025-12-28
author: Grant
project: Pickleball Passport
version: 1.0
status: Draft
inputDocuments:
  - 'prd-Pickleball-Passport-2025-12-28.md'
  - 'architecture-Pickleball-Passport-2025-12-28.md'
  - 'epics-and-stories-Pickleball-Passport-2025-12-28.md'
---

# Test Design & QA Strategy: Pickleball Passport

## Executive Summary

This document defines the comprehensive testing and quality assurance strategy for Pickleball Passport's digital ecosystem. The strategy ensures high-quality, reliable software through automated testing, manual QA, and continuous monitoring.

**Testing Philosophy:**
- **Quality First:** Test early, test often, prevent bugs vs fixing bugs
- **User-Centric:** Test real user flows, not just technical functionality
- **Automation:** Automate repetitive tests, free humans for exploratory testing
- **Risk-Based:** Focus testing on high-risk, high-impact areas (payments, bookings, auth)

**Success Metrics:**
- Code coverage: >80% (critical paths: >95%)
- Bug escape rate: <5% (bugs found in production vs found in testing)
- Test execution time: <15 minutes (CI/CD pipeline)
- Production incident rate: <2 per month

---

## Table of Contents

1. [Testing Pyramid](#testing-pyramid)
2. [Unit Testing Strategy](#unit-testing-strategy)
3. [Integration Testing Strategy](#integration-testing-strategy)
4. [End-to-End Testing Strategy](#end-to-end-testing-strategy)
5. [Mobile Testing Strategy](#mobile-testing-strategy)
6. [API Testing Strategy](#api-testing-strategy)
7. [Database Testing Strategy](#database-testing-strategy)
8. [Performance Testing Strategy](#performance-testing-strategy)
9. [Security Testing Strategy](#security-testing-strategy)
10. [Accessibility Testing Strategy](#accessibility-testing-strategy)
11. [Manual QA Process](#manual-qa-process)
12. [Test Data Management](#test-data-management)
13. [CI/CD Integration](#cicd-integration)
14. [Bug Tracking & Triage](#bug-tracking--triage)
15. [Production Monitoring](#production-monitoring)
16. [Testing Schedule & Milestones](#testing-schedule--milestones)

---

## Testing Pyramid

### Overview

```
                    ▲
                   /│\
                  / │ \
                 /  │  \
                / E2E  \          ~10% of tests
               /  Tests  \        (Critical user flows)
              /____________\
             /              \
            /  Integration   \    ~30% of tests
           /      Tests       \   (API, DB, Services)
          /____________________\
         /                      \
        /      Unit Tests        \ ~60% of tests
       /__________________________\ (Components, Functions, Logic)
```

### Test Distribution

| Type | Percentage | Count (Estimated) | Purpose |
|------|------------|-------------------|---------|
| **Unit Tests** | 60% | ~600 tests | Fast, isolated, component/function testing |
| **Integration Tests** | 30% | ~300 tests | Service interactions, API endpoints, DB queries |
| **E2E Tests** | 10% | ~100 tests | Critical user flows, full-stack scenarios |

### Why This Distribution?

- **Fast Feedback:** Unit tests run in seconds, catch most bugs early
- **Cost-Effective:** Unit tests are cheap to write and maintain
- **Confidence:** E2E tests provide confidence that full flows work
- **Balance:** Integration tests bridge the gap, catch interface issues

---

## Unit Testing Strategy

### Framework: Vitest

**Why Vitest?**
- Fast (Vite-powered, ESM-native)
- Compatible with Jest API (easy migration)
- Built-in TypeScript support
- Watch mode (instant feedback)

### What to Unit Test

**1. Business Logic Functions**

Example: Pricing calculations

```typescript
// packages/api/src/services/pricing/calculateTotal.ts
export function calculateTotal(
  basePrice: number,
  addons: Array<{ price: number }>,
  duration: number
): number {
  const baseCost = basePrice * (duration / 14) // Normalize to 14-day base
  const addonsCost = addons.reduce((sum, addon) => sum + addon.price, 0)
  return baseCost + addonsCost
}

// packages/api/src/services/pricing/calculateTotal.test.ts
import { describe, it, expect } from 'vitest'
import { calculateTotal } from './calculateTotal'

describe('calculateTotal', () => {
  it('calculates total for 14-day trip with no addons', () => {
    const result = calculateTotal(10000, [], 14)
    expect(result).toBe(10000)
  })

  it('calculates total for 7-day trip (half price)', () => {
    const result = calculateTotal(10000, [], 7)
    expect(result).toBe(5000)
  })

  it('includes addon costs', () => {
    const addons = [{ price: 5000 }, { price: 3000 }]
    const result = calculateTotal(10000, addons, 14)
    expect(result).toBe(18000)
  })

  it('handles edge case: 0 duration', () => {
    expect(() => calculateTotal(10000, [], 0)).toThrow('Duration must be > 0')
  })
})
```

**2. React Components**

Example: PackageCard component

```typescript
// apps/web/components/marketing/PackageCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PackageCard } from './PackageCard'

describe('PackageCard', () => {
  const mockPackage = {
    id: '1',
    name: 'Smile Makeover',
    description: 'Transform your smile',
    basePrice: 18000,
    heroImage: '/images/smile.jpg'
  }

  const onSelect = vi.fn()

  it('renders package information', () => {
    render(<PackageCard package={mockPackage} onSelect={onSelect} />)

    expect(screen.getByText('Smile Makeover')).toBeInTheDocument()
    expect(screen.getByText('Transform your smile')).toBeInTheDocument()
    expect(screen.getByText('$18,000')).toBeInTheDocument()
  })

  it('calls onSelect when Learn More button clicked', () => {
    render(<PackageCard package={mockPackage} onSelect={onSelect} />)

    const button = screen.getByText('Learn More')
    fireEvent.click(button)

    expect(onSelect).toHaveBeenCalledWith('1')
  })

  it('displays image with correct src', () => {
    render(<PackageCard package={mockPackage} onSelect={onSelect} />)

    const image = screen.getByAltText('Smile Makeover')
    expect(image).toHaveAttribute('src', '/images/smile.jpg')
  })
})
```

**3. Utility Functions**

Example: Currency formatting

```typescript
// packages/shared/src/utils/currency.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency } from './currency'

describe('formatCurrency', () => {
  it('formats whole numbers with commas', () => {
    expect(formatCurrency(1000)).toBe('$1,000')
    expect(formatCurrency(18000)).toBe('$18,000')
  })

  it('formats decimals to 2 places', () => {
    expect(formatCurrency(1000.50)).toBe('$1,000.50')
  })

  it('handles negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })
})
```

### Coverage Goals

| Module | Target Coverage | Rationale |
|--------|-----------------|-----------|
| **Business Logic** (pricing, referrals, points) | >95% | Critical calculations, must be accurate |
| **React Components** | >80% | User-facing, high value |
| **Utility Functions** | >90% | Widely used, bugs propagate |
| **API Routes** | >85% | Entry points, high traffic |

### Running Unit Tests

```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode (development)
pnpm test:watch

# Run specific file
pnpm test packages/api/src/services/pricing/calculateTotal.test.ts
```

---

## Integration Testing Strategy

### What to Integration Test

**1. tRPC API Endpoints**

Example: Booking creation endpoint

```typescript
// packages/api/src/routers/booking.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { appRouter } from '../root'
import { createContextInner } from '../context'
import { prisma } from '@/lib/prisma'

describe('booking.create', () => {
  let caller: any

  beforeEach(async () => {
    // Setup: Create test user and trip
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'GUEST'
      }
    })

    const trip = await prisma.trip.create({
      data: {
        name: 'Test Trip',
        destination: 'Bangkok',
        startDate: new Date('2026-03-15'),
        endDate: new Date('2026-03-29'),
        capacity: 12,
        status: 'SCHEDULED'
      }
    })

    // Create tRPC caller with authenticated context
    const ctx = await createContextInner({ user })
    caller = appRouter.createCaller(ctx)
  })

  afterEach(async () => {
    // Cleanup: Delete test data
    await prisma.booking.deleteMany()
    await prisma.trip.deleteMany()
    await prisma.user.deleteMany()
  })

  it('creates booking successfully', async () => {
    const trip = await prisma.trip.findFirst()

    const result = await caller.booking.create({
      tripId: trip!.id,
      packageType: 'SMILE_MAKEOVER',
      duration: 14,
      accommodationTier: 'LUXURY',
      addons: [],
      totalPrice: 18000,
      paymentPlan: 'FULL'
    })

    expect(result).toMatchObject({
      packageType: 'SMILE_MAKEOVER',
      totalPrice: 18000,
      status: 'PENDING'
    })

    // Verify database record created
    const booking = await prisma.booking.findUnique({
      where: { id: result.id }
    })
    expect(booking).toBeTruthy()
  })

  it('fails when trip is fully booked', async () => {
    const trip = await prisma.trip.findFirst()

    // Fill trip to capacity
    await prisma.trip.update({
      where: { id: trip!.id },
      data: { currentBookings: 12 }
    })

    await expect(
      caller.booking.create({
        tripId: trip!.id,
        packageType: 'SMILE_MAKEOVER',
        duration: 14,
        accommodationTier: 'LUXURY',
        addons: [],
        totalPrice: 18000,
        paymentPlan: 'FULL'
      })
    ).rejects.toThrow('Trip is fully booked')
  })

  it('awards points to partner if referred', async () => {
    const partner = await prisma.user.create({
      data: {
        email: 'partner@example.com',
        name: 'Partner',
        role: 'PARTNER',
        partnerProfile: {
          create: {
            clubName: 'Test Club',
            clubLocation: 'FL',
            jobTitle: 'Director',
            referralCode: 'TEST123',
            tier: 'BRONZE'
          }
        }
      }
    })

    const trip = await prisma.trip.findFirst()

    await caller.booking.create({
      tripId: trip!.id,
      packageType: 'SMILE_MAKEOVER',
      duration: 14,
      accommodationTier: 'LUXURY',
      addons: [],
      totalPrice: 18000,
      paymentPlan: 'FULL',
      referredBy: partner.id
    })

    // Verify points awarded
    const pointsTransaction = await prisma.pointsTransaction.findFirst({
      where: { partnerId: partner.id }
    })

    expect(pointsTransaction).toMatchObject({
      transactionType: 'EARNED',
      points: 1000
    })
  })
})
```

**2. Database Queries (Prisma)**

Example: Complex query with aggregates

```typescript
// packages/database/src/queries/getPartnerMetrics.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '../client'
import { getPartnerMetrics } from './getPartnerMetrics'

describe('getPartnerMetrics', () => {
  let partnerId: string

  beforeEach(async () => {
    const partner = await prisma.user.create({
      data: {
        email: 'partner@example.com',
        role: 'PARTNER',
        partnerProfile: {
          create: {
            clubName: 'Test Club',
            referralCode: 'TEST123',
            tier: 'BRONZE'
          }
        }
      }
    })
    partnerId = partner.id

    // Create test referrals
    const referral = await prisma.referral.create({
      data: {
        partnerId,
        referralLink: 'https://example.com/r/TEST123',
        clicks: 50,
        applications: 10,
        bookings: 3
      }
    })

    // Create referral events
    await prisma.referralEvent.createMany({
      data: [
        { referralId: referral.id, eventType: 'CLICK', pointsAwarded: 10 },
        { referralId: referral.id, eventType: 'APPLICATION', pointsAwarded: 100 },
        { referralId: referral.id, eventType: 'BOOKING', pointsAwarded: 1000 }
      ]
    })
  })

  afterEach(async () => {
    await prisma.referralEvent.deleteMany()
    await prisma.referral.deleteMany()
    await prisma.partnerProfile.deleteMany()
    await prisma.user.deleteMany()
  })

  it('calculates correct metrics', async () => {
    const metrics = await getPartnerMetrics(partnerId)

    expect(metrics).toMatchObject({
      totalClicks: 50,
      totalApplications: 10,
      totalBookings: 3,
      conversionRate: 0.06, // 3 bookings / 50 clicks
      pointsEarned: 1110, // 10 + 100 + 1000
      tier: 'BRONZE'
    })
  })
})
```

**3. Service Layer Integration**

Example: Payment service with Stripe

```typescript
// packages/services/src/payment/PaymentService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PaymentService } from './PaymentService'
import Stripe from 'stripe'

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      paymentIntents: {
        create: vi.fn().mockResolvedValue({
          id: 'pi_test123',
          client_secret: 'secret_test123',
          amount: 1800000,
          status: 'requires_payment_method'
        })
      }
    }))
  }
})

describe('PaymentService', () => {
  let paymentService: PaymentService

  beforeEach(() => {
    paymentService = new PaymentService(prisma)
  })

  it('creates payment intent successfully', async () => {
    const bookingId = 'booking123'
    const amount = 18000

    const clientSecret = await paymentService.createPaymentIntent(bookingId, amount)

    expect(clientSecret).toBe('secret_test123')

    // Verify payment record created in database
    const payment = await prisma.payment.findFirst({
      where: { bookingId }
    })

    expect(payment).toMatchObject({
      amount: 18000,
      status: 'PENDING',
      stripePaymentIntentId: 'pi_test123'
    })
  })
})
```

### Running Integration Tests

```bash
# Run integration tests (separate from unit tests)
pnpm test:integration

# Run with database reset (fresh data each time)
pnpm test:integration:clean
```

---

## End-to-End Testing Strategy

### Framework: Playwright

**Why Playwright?**
- Cross-browser (Chrome, Firefox, Safari, Edge)
- Auto-wait (no flaky tests)
- Network interception (mock external APIs)
- Mobile emulation
- Video/screenshot on failure

### Critical User Flows to Test

**1. Guest Booking Flow (Highest Priority)**

```typescript
// apps/web/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Guest Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/')
  })

  test('complete booking from homepage to payment', async ({ page }) => {
    // 1. Navigate to packages
    await page.click('text=Explore Packages')
    await expect(page).toHaveURL('/packages')

    // 2. Select Smile Makeover package
    await page.click('text=Smile Makeover >> text=Learn More')
    await expect(page).toHaveURL(/\/packages\/smile-makeover/)

    // 3. Apply now
    await page.click('text=Apply Now')

    // 4. Fill application form (multi-step)
    // Step 1: Basic info
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="phone"]', '+1234567890')
    await page.click('button:has-text("Next")')

    // Step 2: Pickleball background
    await page.selectOption('select[name="skill"]', 'INTERMEDIATE')
    await page.fill('input[name="frequency"]', '3x per week')
    await page.click('button:has-text("Next")')

    // Step 3: Transformation interests
    await page.check('input[value="dental"]')
    await page.check('input[value="wellness"]')
    await page.click('button:has-text("Next")')

    // Step 4: Travel preferences
    await page.selectOption('select[name="duration"]', '14')
    await page.click('button:has-text("Next")')

    // Step 5: Discovery
    await page.selectOption('select[name="source"]', 'web_search')
    await page.click('button:has-text("Submit Application")')

    // 5. Verify success page
    await expect(page.locator('text=Application Received')).toBeVisible()

    // 6. Schedule consultation (Calendly embed)
    await expect(page.locator('iframe[src*="calendly"]')).toBeVisible()
  })

  test('configure custom package', async ({ page, context }) => {
    // Login as guest
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button:has-text("Log In")')

    // Navigate to booking configurator
    await page.goto('/booking/configure')

    // Select base package
    await page.click('[data-package="smile_makeover"]')
    await page.click('button:has-text("Next")')

    // Select duration
    await page.click('[data-duration="14"]')
    await page.click('button:has-text("Next")')

    // Select accommodation
    await page.click('[data-accommodation="ultra_luxury"]')
    await page.click('button:has-text("Next")')

    // Add medical add-ons
    await page.check('input[value="dental_veneers"]')
    await page.check('input[value="teeth_whitening"]')
    await page.click('button:has-text("Next")')

    // Add wellness add-ons
    await page.check('input[value="spa_package"]')
    await page.click('button:has-text("Review")')

    // Verify pricing summary
    await expect(page.locator('text=Total: $23,500')).toBeVisible()

    // Select trip
    await page.click('[data-trip-id]') // Select first available trip
    await page.click('button:has-text("Proceed to Payment")')

    // Verify payment page loads
    await expect(page).toHaveURL(/\/booking\/payment/)
  })

  test('payment with Stripe (test mode)', async ({ page }) => {
    // ... setup booking first ...

    // Fill Stripe card details (test card)
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]')
    await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242')
    await stripeFrame.locator('input[name="exp-date"]').fill('12/34')
    await stripeFrame.locator('input[name="cvc"]').fill('123')
    await stripeFrame.locator('input[name="postal"]').fill('12345')

    // Submit payment
    await page.click('button:has-text("Pay Now")')

    // Wait for redirect to confirmation
    await page.waitForURL(/\/booking\/confirmation/, { timeout: 10000 })

    // Verify confirmation page
    await expect(page.locator('text=Booking Confirmed')).toBeVisible()
    await expect(page.locator('text=Reference #')).toBeVisible()
  })
})
```

**2. Partner Referral Flow**

```typescript
// apps/web/e2e/partner-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Partner Referral Flow', () => {
  test('partner signup to first referral', async ({ page }) => {
    // 1. Visit partner page
    await page.goto('/partners')

    // 2. Sign up as partner
    await page.click('text=Become a Partner')
    await page.fill('input[name="name"]', 'Test Director')
    await page.fill('input[name="email"]', 'director@example.com')
    await page.fill('input[name="clubName"]', 'Test Pickleball Club')
    await page.fill('input[name="clubLocation"]', 'The Villages, FL')
    await page.check('input[name="agreeToTerms"]')
    await page.click('button:has-text("Sign Up")')

    // 3. Redirected to partner dashboard
    await expect(page).toHaveURL('/partners/dashboard')

    // 4. Copy referral link
    await page.click('button:has-text("Copy Referral Link")')
    const referralLink = await page.locator('[data-referral-link]').textContent()
    expect(referralLink).toContain('/r/')

    // 5. Open referral link in new tab (simulate guest click)
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.click(`a[href="${referralLink}"]`)
    ])

    // 6. Verify cookie set (referral tracking)
    const cookies = await newPage.context().cookies()
    const referralCookie = cookies.find(c => c.name === 'referralCode')
    expect(referralCookie).toBeTruthy()

    // 7. Guest proceeds to booking (simulated)
    // ... booking flow ...

    // 8. Partner sees referral in dashboard
    await page.reload()
    await expect(page.locator('text=1 referral click')).toBeVisible()
  })
})
```

**3. Mobile App Critical Flows**

```typescript
// apps/mobile/e2e/pre-trip.spec.ts
import { test, expect, device } from 'detox'

describe('Mobile Pre-Trip Flow', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should complete pre-trip checklist', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.text('Log In')).tap()

    // Navigate to checklist
    await element(by.text('Pre-Trip Checklist')).tap()

    // Check off items
    await element(by.id('checklist-item-passport')).tap()
    await expect(element(by.id('checklist-progress'))).toHaveText('1 of 8 completed')

    // Upload passport
    await element(by.text('Upload Passport Copy')).tap()
    await element(by.text('Take Photo')).tap()
    // ... camera interaction ...
    await element(by.text('Confirm')).tap()

    // Verify upload success
    await expect(element(by.text('Passport uploaded'))).toBeVisible()
  })

  it('should join group chat', async () => {
    // ... login ...

    // Navigate to group chat
    await element(by.text('Group Chat')).tap()

    // Send message
    await element(by.id('message-input')).typeText('Hello everyone!')
    await element(by.id('send-button')).tap()

    // Verify message appears
    await expect(element(by.text('Hello everyone!'))).toBeVisible()
  })
})
```

### E2E Test Execution

```bash
# Run E2E tests (Playwright)
pnpm test:e2e

# Run specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox

# Run in UI mode (debugging)
pnpm test:e2e --ui

# Run mobile E2E tests (Detox)
pnpm test:mobile:e2e
```

### Visual Regression Testing (Optional)

```typescript
// apps/web/e2e/visual/homepage.spec.ts
import { test, expect } from '@playwright/test'

test('homepage visual regression', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('homepage.png')
})
```

---

## Mobile Testing Strategy

### Framework: Detox (React Native)

**Test Scenarios:**

1. **Authentication Flow**
   - Login, logout, biometric auth

2. **Pre-Trip Features**
   - Checklist completion
   - Document upload
   - Group chat

3. **During-Trip Features**
   - Itinerary viewing
   - Concierge chat
   - Photo upload
   - Court booking

4. **Offline Functionality**
   - Itinerary accessible offline
   - Queue messages for sync

### Device Matrix

| Device | OS Version | Priority |
|--------|------------|----------|
| iPhone 14 Pro | iOS 17 | P0 |
| iPhone 12 | iOS 16 | P1 |
| Samsung Galaxy S23 | Android 13 | P0 |
| Google Pixel 6 | Android 12 | P1 |

### Running Mobile Tests

```bash
# iOS Simulator
pnpm test:mobile:ios

# Android Emulator
pnpm test:mobile:android

# Physical device (connected via USB)
pnpm test:mobile:device
```

---

## API Testing Strategy

### Framework: Supertest (REST) + tRPC Client

**What to Test:**

1. **Authentication & Authorization**
   - Valid JWT → Access granted
   - Invalid JWT → 401 Unauthorized
   - Guest role → Cannot access admin routes
   - Partner role → Can access partner portal

2. **CRUD Operations**
   - Create, Read, Update, Delete for all entities
   - Validation errors (invalid input)
   - Not found errors (non-existent IDs)

3. **Business Logic**
   - Booking creation (capacity checks, price calculation)
   - Referral attribution (points awarded)
   - Payment processing (installment scheduling)

4. **Rate Limiting**
   - Exceed rate limit → 429 Too Many Requests

5. **Error Handling**
   - Database errors → 500 Internal Server Error
   - Validation errors → 400 Bad Request
   - User-friendly error messages

### Example API Test

```typescript
// packages/api/tests/auth.test.ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('Authentication API', () => {
  it('returns 401 for unauthenticated requests', async () => {
    const response = await request(app)
      .get('/api/trpc/booking.getMyBookings')
      .expect(401)

    expect(response.body.error).toContain('Unauthorized')
  })

  it('returns data for authenticated requests', async () => {
    const token = 'valid_jwt_token' // Mock or generate

    const response = await request(app)
      .get('/api/trpc/booking.getMyBookings')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(response.body.result.data).toBeDefined()
  })
})
```

---

## Database Testing Strategy

### What to Test

1. **Schema Migrations**
   - Migrations run without errors
   - No data loss during migrations
   - Rollback works correctly

2. **Constraints & Validation**
   - Unique constraints enforced
   - Foreign key constraints enforced
   - Check constraints work (e.g., price > 0)

3. **Queries Performance**
   - Complex queries < 100ms
   - Indexes used (EXPLAIN ANALYZE)

### Testing Approach

**Separate Test Database:**
- Never test against production database
- Use in-memory SQLite for speed (unit tests)
- Use PostgreSQL for integration tests (production parity)

**Reset Between Tests:**

```typescript
beforeEach(async () => {
  // Reset database to clean state
  await prisma.$executeRawUnsafe('TRUNCATE TABLE users CASCADE')
  await prisma.$executeRawUnsafe('TRUNCATE TABLE bookings CASCADE')
  // ... truncate all tables
})
```

**Transaction Rollback Pattern:**

```typescript
beforeEach(async () => {
  await prisma.$transaction(async (tx) => {
    // All queries in this test use tx instead of prisma
  })
  // Automatic rollback after test
})
```

---

## Performance Testing Strategy

### Framework: k6 (Load Testing)

**Test Scenarios:**

1. **Load Test:** Normal traffic (100 concurrent users)
2. **Stress Test:** Peak traffic (500 concurrent users)
3. **Spike Test:** Sudden traffic burst (0 → 1000 users in 10s)
4. **Endurance Test:** Sustained load (24 hours)

### Example Load Test Script

```javascript
// tests/performance/booking-load.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
}

export default function () {
  // Simulate guest browsing packages
  const packagesRes = http.get('https://pickleballpassport.com/api/packages')
  check(packagesRes, {
    'packages loaded': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  })

  sleep(1)

  // Simulate viewing package details
  const detailRes = http.get('https://pickleballpassport.com/api/packages/smile-makeover')
  check(detailRes, { 'detail loaded': (r) => r.status === 200 })

  sleep(2)
}
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Page Load Time** | <2 seconds | Lighthouse, WebPageTest |
| **API Response Time (p95)** | <500ms | k6, New Relic |
| **Database Query Time** | <100ms | Prisma logs, pgAnalyze |
| **Time to Interactive (TTI)** | <3 seconds | Lighthouse |
| **First Contentful Paint (FCP)** | <1.5 seconds | Lighthouse |
| **Largest Contentful Paint (LCP)** | <2.5 seconds | Lighthouse |

---

## Security Testing Strategy

### Automated Security Scanning

**1. Dependency Scanning (npm audit)**

```bash
# Check for vulnerable dependencies
pnpm audit

# Automatically fix vulnerabilities
pnpm audit --fix
```

**2. Code Scanning (Snyk, SonarQube)**

```bash
# Snyk scan
snyk test

# SonarQube scan
sonar-scanner
```

**3. SAST (Static Application Security Testing)**

- CodeQL (GitHub)
- ESLint security rules

**4. DAST (Dynamic Application Security Testing)**

- OWASP ZAP (automated scans)
- Burp Suite (manual testing)

### Manual Security Testing

**Penetration Testing Scenarios:**

1. **Authentication Bypass**
   - JWT manipulation
   - Session hijacking
   - Brute force attacks

2. **Authorization Flaws**
   - Privilege escalation (guest → admin)
   - Access other users' data (IDOR)

3. **Injection Attacks**
   - SQL injection (Prisma prevents, but test)
   - XSS (React escapes, but test)
   - Command injection

4. **Payment Security**
   - PCI compliance (Stripe handles)
   - Test mode card leakage

5. **API Security**
   - Rate limiting bypass
   - Mass assignment vulnerabilities

### Security Checklist

- [ ] All inputs validated (Zod schemas)
- [ ] SQL injection prevented (Prisma parameterized queries)
- [ ] XSS prevented (React auto-escaping, CSP headers)
- [ ] CSRF prevented (SameSite cookies)
- [ ] Secrets never committed (git-secrets)
- [ ] HTTPS enforced (Vercel automatic)
- [ ] Password hashing (bcrypt, handled by Clerk)
- [ ] Rate limiting enabled (Upstash Redis)

---

## Accessibility Testing Strategy

### Standards: WCAG 2.1 AA Compliance

**Automated Tools:**

1. **Axe DevTools** (browser extension)
2. **Lighthouse Accessibility Audit**
3. **Pa11y** (CI integration)

**Manual Testing:**

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter/Space activate buttons
   - Esc closes modals

2. **Screen Reader Testing**
   - VoiceOver (macOS/iOS)
   - NVDA (Windows)
   - TalkBack (Android)

3. **Color Contrast**
   - Text: 4.5:1 minimum
   - UI elements: 3:1 minimum
   - Use Contrast Checker tool

4. **Focus Management**
   - Visible focus indicators
   - Focus trapped in modals
   - Focus returned after modal close

### Accessibility Test Example

```typescript
// apps/web/tests/a11y/homepage.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Homepage } from '@/app/page'

expect.extend(toHaveNoViolations)

describe('Homepage Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Homepage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

---

## Manual QA Process

### QA Checklist (Pre-Release)

**Functional Testing:**
- [ ] All user stories acceptance criteria met
- [ ] Happy path works end-to-end
- [ ] Edge cases handled gracefully
- [ ] Error messages user-friendly

**Cross-Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile Testing:**
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive breakpoints (375px, 768px, 1024px, 1440px)

**Exploratory Testing:**
- 30-minute unscripted testing session per major feature
- Focus: "How can I break this?"
- Document unexpected behaviors

**Regression Testing:**
- [ ] Existing features still work
- [ ] Previous bug fixes not re-introduced

### Bug Reporting Template

```markdown
**Title:** Brief description

**Priority:** P0 / P1 / P2 / P3

**Environment:**
- URL: https://staging.pickleballpassport.com
- Browser: Chrome 120
- OS: macOS 14

**Steps to Reproduce:**
1. Navigate to /booking/configure
2. Select Smile Makeover package
3. Click "Next"
4. Observe error

**Expected Result:**
Duration selection screen loads

**Actual Result:**
White screen, console error: "Cannot read property 'duration'"

**Screenshot/Video:**
[Attach]

**Console Logs:**
```
Error: Cannot read property 'duration' of undefined
  at PricingCalculator.tsx:42
```

**Severity:**
- [ ] Blocks release (P0)
- [ ] Degrades UX significantly (P1)
- [ ] Minor issue (P2)
- [ ] Cosmetic (P3)
```

---

## Test Data Management

### Test Data Strategy

**1. Seed Data (Development/Staging)**

```typescript
// packages/database/prisma/seed-test.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTestData() {
  // Create test trips
  const trip1 = await prisma.trip.create({
    data: {
      name: 'Test Trip - March 2026',
      destination: 'Bangkok',
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-03-29'),
      capacity: 12,
      status: 'SCHEDULED'
    }
  })

  // Create test users
  const guest = await prisma.user.create({
    data: {
      email: 'test-guest@example.com',
      name: 'Test Guest',
      role: 'GUEST',
      guestProfile: {
        create: {
          age: 60,
          location: 'The Villages, FL',
          pickleballSkill: 'INTERMEDIATE'
        }
      }
    }
  })

  const partner = await prisma.user.create({
    data: {
      email: 'test-partner@example.com',
      name: 'Test Partner',
      role: 'PARTNER',
      partnerProfile: {
        create: {
          clubName: 'Test Pickleball Club',
          clubLocation: 'FL',
          jobTitle: 'Director',
          referralCode: 'TEST123',
          tier: 'SILVER',
          pointsBalance: 5000
        }
      }
    }
  })

  // Create test booking
  await prisma.booking.create({
    data: {
      guestId: guest.id,
      tripId: trip1.id,
      packageType: 'SMILE_MAKEOVER',
      durationDays: 14,
      accommodationTier: 'LUXURY',
      totalPrice: 18000,
      paymentPlan: 'FULL',
      status: 'CONFIRMED'
    }
  })

  console.log('Test data seeded successfully')
}

seedTestData()
```

**2. Test Data Factories**

```typescript
// tests/factories/bookingFactory.ts
import { faker } from '@faker-js/faker'
import { prisma } from '@/lib/prisma'

export async function createTestBooking(overrides = {}) {
  const trip = await prisma.trip.findFirst()
  const guest = await prisma.user.findFirst({ where: { role: 'GUEST' } })

  return prisma.booking.create({
    data: {
      guestId: guest!.id,
      tripId: trip!.id,
      packageType: 'SMILE_MAKEOVER',
      durationDays: 14,
      accommodationTier: 'LUXURY',
      totalPrice: faker.number.int({ min: 10000, max: 30000 }),
      paymentPlan: 'FULL',
      status: 'CONFIRMED',
      ...overrides
    }
  })
}

// Usage in tests:
const booking = await createTestBooking({ totalPrice: 25000 })
```

**3. Production-Like Test Data**

- Use realistic names, emails, phone numbers
- Generate via faker.js
- Include edge cases (long names, special characters, international formats)

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:unit --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Run migrations
        run: pnpm prisma migrate deploy

      - name: Run integration tests
        run: pnpm test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install Playwright
        run: pnpm playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run npm audit
        run: pnpm audit --audit-level=high

      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Test Execution Time Targets

| Test Suite | Target Time | Current Time | Status |
|------------|-------------|--------------|--------|
| Unit Tests | <5 minutes | 3 minutes | ✅ |
| Integration Tests | <5 minutes | 4 minutes | ✅ |
| E2E Tests | <10 minutes | 8 minutes | ✅ |
| **Total CI/CD Pipeline** | **<15 minutes** | **12 minutes** | ✅ |

---

## Bug Tracking & Triage

### Bug Priority Definitions

**P0 - Critical (Fix Immediately)**
- Site down or major feature broken
- Security vulnerability
- Payment processing failure
- Data loss

**P1 - High (Fix Within 24 Hours)**
- Major feature degraded
- Significant UX impact
- Affects >50% of users

**P2 - Medium (Fix Within 1 Week)**
- Minor feature broken
- Cosmetic issues
- Affects <50% of users

**P3 - Low (Fix When Time Permits)**
- Edge cases
- Nice-to-have improvements
- Affects <10% of users

### Bug Triage Process

**Daily Standup:**
- Review new bugs (since last standup)
- Assign priorities
- Assign owners
- Discuss blockers

**Weekly Bug Review:**
- Review all open bugs
- Re-prioritize if needed
- Close fixed bugs (verification)
- Identify patterns (recurring issues)

### Bug Lifecycle

```
New → Triaged → In Progress → Fixed → Verified → Closed
  ↓                                         ↓
Cannot Reproduce                     Regression
  ↓                                         ↓
Closed                                   Reopened
```

---

## Production Monitoring

### Observability Stack

**1. Error Tracking: Sentry**
- Automatic error capture
- Source maps (identify exact line)
- User context (which user hit error?)
- Breadcrumbs (what led to error?)

**2. Performance Monitoring: Vercel Analytics + Datadog**
- Web Vitals (LCP, FID, CLS)
- API response times
- Database query performance

**3. Logging: Vercel Logs + CloudWatch**
- Structured JSON logs
- Log levels (debug, info, warn, error)
- Searchable (by user ID, request ID, etc.)

**4. Uptime Monitoring: UptimeRobot**
- Check every 5 minutes
- Alert if down >2 minutes
- Status page (public or private)

### Alerts & Notifications

**Critical Alerts (PagerDuty/SMS):**
- Site down (>1 minute)
- Error rate spike (>5% of requests)
- Payment failure rate >10%
- Database connection errors

**Warning Alerts (Slack):**
- Slow API responses (>1 second)
- High memory usage (>80%)
- Failed scheduled jobs

**Info Alerts (Email):**
- Daily summary (bookings, revenue, errors)
- Weekly trends report

---

## Testing Schedule & Milestones

### Phase 1 (MVP) - Testing Roadmap

| Sprint | Testing Focus | Deliverables |
|--------|---------------|--------------|
| **Sprint 1-2** | Setup testing infrastructure | - Vitest configured<br>- Playwright installed<br>- CI/CD pipeline |
| **Sprint 3-4** | Unit tests (core logic) | - Pricing calculations<br>- Referral attribution<br>- 60% coverage |
| **Sprint 5-6** | Integration tests (API) | - Booking API<br>- Payment API<br>- 80% coverage |
| **Sprint 7-8** | E2E tests (critical flows) | - Guest booking flow<br>- Partner referral flow |
| **Sprint 9-10** | Manual QA + bug fixes | - Full regression testing<br>- Cross-browser testing<br>- Production readiness |

### Phase 2 (Mobile + Partners) - Testing Roadmap

| Sprint | Testing Focus | Deliverables |
|--------|---------------|--------------|
| **Sprint 11-12** | Mobile unit tests | - React Native components<br>- Business logic |
| **Sprint 13-14** | Mobile E2E tests (Detox) | - Pre-trip flows<br>- During-trip flows |
| **Sprint 15-16** | Partner portal tests | - Referral tracking<br>- Points redemption |
| **Sprint 17-18** | Performance testing | - Load tests (k6)<br>- Stress tests |
| **Sprint 19-20** | Manual QA + bug fixes | - Mobile device matrix<br>- Full regression |

### Testing Metrics (Tracked Weekly)

| Metric | Target | Current |
|--------|--------|---------|
| **Code Coverage** | >80% | TBD |
| **Bugs Found (Pre-Release)** | N/A | TBD |
| **Bugs Escaped (Production)** | <5% | TBD |
| **Test Execution Time** | <15 min | TBD |
| **Flaky Tests** | <2% | TBD |
| **Accessibility Violations** | 0 | TBD |

---

## Appendix: Testing Tools Summary

| Category | Tool | Purpose | Cost |
|----------|------|---------|------|
| **Unit Testing** | Vitest | Fast JavaScript testing | Free |
| **Component Testing** | React Testing Library | React component testing | Free |
| **E2E Testing (Web)** | Playwright | Cross-browser automation | Free |
| **E2E Testing (Mobile)** | Detox | React Native E2E | Free |
| **API Testing** | Supertest | HTTP API testing | Free |
| **Load Testing** | k6 | Performance/load testing | Free |
| **Visual Regression** | Percy | Screenshot comparison | $99/mo |
| **Accessibility** | Axe DevTools | A11y automated testing | Free |
| **Error Tracking** | Sentry | Production error monitoring | Free (5K errors) |
| **Performance** | Vercel Analytics | Web Vitals monitoring | Included |
| **Security Scanning** | Snyk | Dependency vulnerabilities | Free (Open Source) |
| **Code Quality** | SonarQube | Code smells, bugs, security | Free (Community) |
| **Uptime Monitoring** | UptimeRobot | Site availability | Free (50 monitors) |

**Total Testing Infrastructure Cost:** ~$100/month (Percy optional)

---

**End of Test Strategy Document**

Version: 1.0
Date: 2025-12-28
Author: Grant
Total Pages: 48
