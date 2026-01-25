# Testing Patterns

**Analysis Date:** 2026-01-25

## Test Framework

**Runner:**
- Vitest 4.0.17 (found in package.json)
- Config: `vitest.config.ts`

**Assertion Library:**
- Vitest built-in expect() assertions

**Run Commands:**
```bash
npm test                # Run all tests (vitest)
npm run test:unit       # Run unit tests (vitest run)
npm run test:watch      # Watch mode
npm run test:ui         # UI mode with @vitest/ui
npm run test:e2e        # Run Playwright E2E tests
npm run test:e2e:ui     # E2E UI mode
npm run test:e2e:headed # E2E with browser visible
npm run test:e2e:debug  # E2E debug mode
npm run test:e2e:report # Show E2E report
```

## Test File Organization

**Location:**
- Unit tests co-located with source files: `lib/payments/__tests__/charge-installment.test.ts`
- Tests in `__tests__` directory adjacent to implementation
- E2E tests excluded from vitest in config: `'**/tests/**'`, `'**/.worktrees/**'`

**Naming:**
- Test files: `.test.ts` suffix: `charge-installment.test.ts`, `retry-calculator.test.ts`
- Test suites: `describe()` blocks matching functionality

**Structure:**
```
lib/
  payments/
    charge-installment.ts (implementation)
    __tests__/
      charge-installment.test.ts (unit tests)
      retry-calculator.test.ts (unit tests)

app/
  api/
    cron/
      charge-installments/
        route.ts (implementation)
      __tests__/
        charge-installments-route.test.ts (integration tests)
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

describe('GET /api/cron/charge-installments', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    vi.clearAllMocks()
    originalEnv = { ...process.env }
    process.env.CRON_SECRET = 'test-cron-secret-123'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Authorization', () => {
    it('should return 401 if authorization header missing', async () => {
      // Arrange
      const request = createMockRequest()

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })
})
```

**Patterns:**
- **Setup**: `beforeEach()` clears mocks and restores state
- **Teardown**: `afterEach()` restores original environment (process.env, timers)
- **Organization**: Nested describe blocks by feature/concern (Authorization, Payment Processing, Error Handling)
- **Test names**: Start with "should": "should return 401 if authorization header missing"
- **Comments**: Arrange/Act/Assert pattern with inline comments

## Mocking

**Framework:** Vitest `vi` module

**Module Mocking:**
```typescript
// At top level
vi.mock('@/lib/payments/charge-installment')
vi.mock('@/lib/db', () => ({
  prisma: {
    paymentRecord: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// In tests, use vi.mocked() to get typed mock
vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue([])
vi.mocked(chargeInstallmentModule.chargeInstallment).mockResolvedValue({
  success: true,
  paymentRecordId: 'pay_test123',
})
```

**Patterns:**
- Mock entire modules or just specific functions
- Use `vi.fn()` to create mock functions
- Use `mockResolvedValue()` for async success
- Use `mockRejectedValue()` for async errors
- Use `mockReturnValue()` for sync returns
- Clear mocks between tests: `vi.clearAllMocks()`

**What to Mock:**
- Database queries (Prisma)
- External APIs (Stripe, email, logging)
- Service modules with external dependencies
- Date/time (with `vi.useFakeTimers()`, `vi.setSystemTime()`)
- Environment variables (with `vi.stubEnv()`)

**What NOT to Mock:**
- Pure utility functions (date formatting, calculations)
- Logic being tested (the function under test itself)
- Helper functions defined in the test file

## Fixtures and Factories

**Test Data:**
```typescript
// Helper factory functions
const createMockRequest = (authorization?: string) => {
  const headers = new Headers()
  if (authorization) {
    headers.set('authorization', authorization)
  }
  return new NextRequest('https://example.com/api/cron/charge-installments', {
    headers,
  })
}

const createMockPaymentRecord = (overrides?: any) => ({
  id: 'pay_test123',
  bookingId: 'bk_test123',
  amountCents: 50000,
  dueDate: new Date('2026-01-15'),
  status: 'PENDING',
  installmentNumber: 2,
  retryCount: 0,
  lastAttemptAt: null,
  booking: {
    id: 'bk_test123',
    bookingReference: 'BK-TEST-001',
    user: {
      id: 'user_test123',
      firstName: 'John',
      lastName: 'Doe',
    },
    // ... more fields
  },
  ...overrides,
})
```

**Location:**
- Factory functions defined within test file, often in `beforeEach()` scope or top-level describe
- Specific to the test suite they serve
- Accept override objects for test variations

## Coverage

**Requirements:** Not enforced (no coverage thresholds detected)

**View Coverage:**
```bash
# Via Vitest
npm run test:unit -- --coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions/modules
- Approach: Mock all dependencies, test single function behavior
- Example: `lib/payments/__tests__/retry-calculator.test.ts` tests pure functions like `getNextRetryDate()`

**Integration Tests:**
- Scope: Multiple components working together (route + service + database)
- Approach: Mock database and external APIs, test flow through route handler
- Example: `app/api/cron/__tests__/charge-installments-route.test.ts` tests GET route with payment processing

**E2E Tests:**
- Framework: Playwright 1.57.0 (specified in package.json as `@playwright/test`)
- Configuration: Not explored (separate config file)

## Common Patterns

**Async Testing:**
```typescript
it('should process successful payment and track result', async () => {
  // Arrange
  const request = createMockRequest('Bearer test-cron-secret-123')
  const mockPayments = [createMockPaymentRecord()]
  vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue(mockPayments as any)
  vi.mocked(chargeInstallmentModule.chargeInstallment).mockResolvedValue({
    success: true,
    paymentRecordId: 'pay_test123',
    shouldRetry: false,
    isPermanentFailure: false,
  })

  // Act
  const response = await GET(request)
  const data = await response.json()

  // Assert
  expect(data.successful).toBe(1)
})
```

**Error Testing:**
```typescript
it('should handle unexpected errors gracefully', async () => {
  // Arrange
  const request = createMockRequest('Bearer test-cron-secret-123')
  const mockPayments = [createMockPaymentRecord()]
  vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue(mockPayments as any)
  vi.mocked(chargeInstallmentModule.chargeInstallment).mockRejectedValue(
    new Error('Database connection lost')
  )

  // Act
  const response = await GET(request)
  const data = await response.json()

  // Assert
  expect(data.errors).toBe(1)
  expect(data.results[0]).toMatchObject({
    result: 'error',
    errorCode: 'unexpected_error',
  })
})
```

**Batch Testing:**
```typescript
it('should process multiple payments in parallel batches', async () => {
  // Arrange
  const mockPayments = Array.from({ length: 15 }, (_, i) =>
    createMockPaymentRecord({ id: `pay_test${i}` })
  )
  vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue(mockPayments as any)
  // ... setup mocks

  // Act
  const response = await GET(request)
  const data = await response.json()

  // Assert
  expect(data.totalEligible).toBe(15)
  expect(chargeInstallmentModule.chargeInstallment).toHaveBeenCalledTimes(15)
})
```

**State/Time Testing:**
```typescript
it('should schedule retry 1 for +1 day after failure', () => {
  // Setup fake time
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))

  // Test with controlled time
  const failureDate = new Date('2026-01-15T12:00:00Z')
  const nextRetry = getNextRetryDate(failureDate, 1)

  // Assert
  expect(nextRetry!.toISOString().split('T')[0]).toBe('2026-01-16')

  // Cleanup
  vi.useRealTimers()
})
```

## Setup and Configuration

**Test Setup File:** `src/test/setup.ts`
- Runs before all tests via vitest config
- Sets environment variables: `vi.stubEnv('NODE_ENV', 'test')`
- Global mocks and configurations
- Currently minimal; can be expanded for global test utilities

**Vitest Config:** `vitest.config.ts`
- Environment: jsdom (for DOM testing)
- Globals: true (no need to import describe/it/expect)
- Setup files: `src/test/setup.ts`
- Excludes: node_modules, dist, cypress, .git, .idea, playwrig tests, git worktrees
- Path alias: `@/` points to root

## Database Testing

**Approach:** Always mock Prisma with `vi.mock('@/lib/db')`
- Never use real database in tests
- Define mock implementations in mock function

**Pattern:**
```typescript
vi.mock('@/lib/db', () => ({
  prisma: {
    paymentRecord: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// Setup mock behavior
vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue([...mockData])
```

## Assertions

**Common Patterns:**
- `expect().toBe()` for exact equality
- `expect().toEqual()` for deep equality
- `expect().toMatchObject()` for partial object matching
- `expect().toHaveBeenCalled()` for function call verification
- `expect().toHaveBeenCalledWith()` for argument verification
- `expect().toHaveBeenCalledTimes()` for call count
- `expect(async)().rejects.toThrow()` for async error testing

**Example:**
```typescript
expect(response.status).toBe(200)
expect(data).toMatchObject({
  successful: 1,
  failedRetry: 0,
  results: expect.any(Array),
})
expect(chargeInstallmentModule.chargeInstallment).toHaveBeenCalledWith({
  paymentRecordId: 'pay_test123',
})
```

---

*Testing analysis: 2026-01-25*
