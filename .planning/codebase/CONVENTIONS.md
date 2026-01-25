# Coding Conventions

**Analysis Date:** 2026-01-25

## Naming Patterns

**Files:**
- kebab-case for all file names: `charge-installment.ts`, `user-preferences.ts`, `send-payment-reminders.ts`
- Single-word component files: `card.tsx`, `button.tsx`, `dialog.tsx`
- API routes follow Next.js convention: `route.ts` for API endpoints
- Test files use `__tests__` directory with `.test.ts` suffix: `__tests__/charge-installment.test.ts`

**Functions:**
- camelCase for function names: `chargeInstallment()`, `getUserPreferences()`, `createMockRequest()`
- Export named async functions: `export async function chargeInstallment()`
- Export named constants for exported routers: `export const bookingQueriesRouter = router({})`
- Export named interfaces/types: `export interface ChargeInstallmentInput {}`

**Variables:**
- camelCase for all variables and parameters: `lastAttemptDate`, `stripeSecretKey`, `mockPayments`
- Single-letter loop variables acceptable: `for (let i = 0; i < 15; i++)`
- Prefix mock objects with `mock`: `mockStripe`, `mockPayments`, `mockPaymentRecord`
- Prefix test helpers with action: `createMockRequest()`, `createMockPaymentRecord()`

**Types:**
- PascalCase for interfaces and types: `ChargeInstallmentInput`, `PaymentRecordWithBooking`, `NotificationPreferences`
- Suffix result/response types: `ChargeInstallmentResult`, `ChargeInstallmentInput`
- Use `Record<string, unknown>` for flexible object typing

## Code Style

**Formatting:**
- No custom Prettier config detected; uses ESLint defaults
- Lines generally kept under 120 characters
- Function definitions include clear type annotations
- JSDoc comments precede function exports

**Linting:**
- ESLint config: `eslint.config.mjs`
- Uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Enforces TypeScript strict mode (tsconfig `strict: true`)
- Target: ES2017, JSX: react-jsx

## Import Organization

**Order:**
1. External dependencies (React, Next.js, libraries): `import { describe, it, expect } from 'vitest'`
2. Absolute imports from project (`@/`): `import { prisma } from '@/lib/db'`
3. Type imports separated: `import type { NotificationPreferences } from '@/lib/preferences/user-preferences'`

**Path Aliases:**
- Primary alias: `@/` points to root directory (set in tsconfig.json)
- Used throughout: `@/lib/db`, `@/lib/payments/charge-installment`, `@/components/ui/button`
- Never use relative imports with `../` in src files; always use `@/`

**Module Imports Pattern:**
```typescript
// ESM imports with explicit naming
import { prisma } from '@/lib/db'
import * as chargeInstallmentModule from '@/lib/payments/charge-installment'
import type { Role } from '@prisma/client'

// Wildcard imports for module mocking
import * as stripeModule from '@/lib/stripe/get-stripe'
```

## Error Handling

**Patterns:**
- Use try/catch blocks for async operations (shown in charge-installment.ts)
- Functions return typed result objects with `success`, `errorCode`, `errorMessage`: `ChargeInstallmentResult`
- Distinguish error types: `shouldRetry` boolean for transient errors, `isPermanentFailure` for permanent failures
- Database operations wrapped in try/catch with logger utility: `logError(logger, error, message, context)`
- Export error checking functions: `isTransientError()`, `isPermanentError()`

**Logger Usage:**
- Use logger instances not console: `paymentLogger.error()`, `stripeLogger.error()`
- Log with structured context objects: `{ paymentRecordId, bookingId, amount }`
- Special error functions: `logError()`, `logStripeError()`, `logDbOperation()`

## Logging

**Framework:** Pino with structured JSON logging (not console)

**Module Loggers (pre-configured in `lib/logger/index.ts`):**
- `paymentLogger` for payment operations
- `stripeLogger` for Stripe API interactions
- `emailLogger` for email sending
- `bookingLogger` for booking operations
- `giftLogger` for gift operations
- `cronLogger` for cron jobs
- `apiLogger` for API requests
- `webhookLogger` for webhook processing

**Patterns:**
```typescript
// Use specialized loggers from lib/logger
import { paymentLogger, logError } from '@/lib/logger'

// Log events with context
paymentLogger.info({ bookingId, amount }, 'Processing payment')

// Log errors with stack trace
logError(paymentLogger, error, 'Payment processing failed', { bookingId })

// Log Stripe errors with metadata
logStripeError(stripeError, 'Stripe API error', { customerId })
```

## Comments

**When to Comment:**
- Complex business logic: "Exponential backoff: 1, 3, 7 days"
- Non-obvious conditions: "Skip payments not eligible for retry"
- Implementation notes referencing specs: "E4-S6 Phase 8"
- Error context: "Max retries exceeded"

**JSDoc/TSDoc Pattern:**
- Use block comments for all exported functions/interfaces
- Include parameter descriptions with @param
- Include return type descriptions with @returns
- Include usage examples for public utilities with @example

**Example:**
```typescript
/**
 * Charge an installment payment using Stripe off-session payment intent
 *
 * @param input - Payment record ID to charge
 * @returns Result object with success status and error info
 */
export async function chargeInstallment(
  input: ChargeInstallmentInput
): Promise<ChargeInstallmentResult> {
```

## Function Design

**Size:** Vary by complexity; helper functions like `createMockRequest()` are 5-10 lines; business logic functions 40-80 lines before helper extraction

**Parameters:**
- Single object parameter preferred for functions with multiple params: `chargeInstallment({ paymentRecordId })`
- Destructure parameters in function signature: `function Card({ className, ...props })`
- Optional parameters use `?:` in types

**Return Values:**
- Async functions return typed objects (not raw values): `Promise<ChargeInstallmentResult>`
- Include metadata in return objects: `{ success, paymentRecordId, stripePaymentIntentId, errorCode }`
- Use null to indicate absence: `nextRetryDate: Date | null`

## Module Design

**Exports:**
- Named exports for functions: `export async function chargeInstallment()`
- Named exports for interfaces: `export interface ChargeInstallmentInput {}`
- Named exports for constants: `export const bookingQueriesRouter = router({})`
- Export as last line of file (see card.tsx: `export { Card, CardHeader, ... }`)

**Barrel Files:**
- `/lib/logger/index.ts` exports all logger instances and helper functions
- Consolidates related exports for easier importing

**Organization Example:**
```typescript
// 1. Imports
import { prisma } from '@/lib/db'

// 2. Types/Interfaces
export interface ChargeInstallmentInput { ... }

// 3. Constants
const MAX_RETRIES = 3

// 4. Functions
export async function chargeInstallment() { ... }

// 5. Exports (if needed)
export { someHelper }
```

## Component Patterns

**Client/Server Components:**
- Use `'use client'` directive explicitly in client components
- Server components (default) handle auth and data fetching
- Example: `app/preferences/page.tsx` uses `'use client'` for state management

**Component Props:**
- Use destructuring in component signatures: `function Card({ className, ...props })`
- Spread HTML props: `{...props}` passed to underlying elements
- Use React.ComponentProps for typing: `React.ComponentProps<"div">`
- Apply class merging with `cn()`: `className={cn("base-class", className)}`

**UI Library:**
- Use `@/lib/utils` for the `cn()` helper function
- Radix UI components wrapped in shadcn/ui style
- TailwindCSS for styling

---

*Convention analysis: 2026-01-25*
