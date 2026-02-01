---
phase: 18-security-hardening
plan: 01
subsystem: logging
tags: [security, pino, eslint, pii-redaction, webhooks]
dependency-graph:
  requires: []
  provides: [pii-safe-logging, no-console-enforcement, structured-webhook-logs]
  affects: [all-api-routes]
tech-stack:
  added: []
  patterns: [structured-logging, pii-redaction, eslint-enforcement]
key-files:
  created: []
  modified:
    - lib/logger/index.ts
    - eslint.config.mjs
    - app/api/webhooks/stripe/route.ts
decisions:
  - id: SEC-04-PII
    choice: Redact email, phone, accountNumber, ssn, cardNumber at logger level
    rationale: Prevents accidental PII exposure regardless of developer intent
metrics:
  duration: 5m
  completed: 2026-02-01
---

# Phase 18 Plan 01: Console Log Migration & PII Redaction Summary

**One-liner:** Pino structured logging with PII redaction, ESLint no-console enforcement, and zero console.log in Stripe webhook

## What Was Done

### Task 1: PII Redaction Paths Added to Pino Logger
- Added 20 new PII redaction paths to `lib/logger/index.ts`
- Includes: email, phone, phoneNumber, accountNumber, routingNumber, ssn, bankAccount, cardNumber, cvv
- Nested patterns: `*.email`, `user.email`, `guest.email`, `customer.email`, `recipient.email`
- Any log call that includes these fields will automatically redact the values

### Task 2: ESLint no-console Rule Enforced
- Added `no-console` rule at error level in `eslint.config.mjs`
- Allows `console.warn` and `console.error` as fallbacks
- Exempts: `scripts/**`, test files (`*.test.ts`, `*.spec.ts`), `tests/**`, `__tests__/**`
- New console.log statements in production code will fail linting

### Task 3: Stripe Webhook Console Migration
- Replaced 32 console.log/error/warn statements with structured pino loggers
- Used appropriate loggers: stripeLogger, paymentLogger, partnerLogger, emailLogger, pdfLogger
- All log calls now include structured context (paymentId, bookingId, etc.)
- Zero console statements remain in production webhook code

## Key Implementation Details

### PII Redaction Configuration
```typescript
const redactPaths = [
  // Existing auth fields...
  'password', 'token', 'secret', 'apiKey',

  // NEW: PII fields
  'email', 'phone', 'phoneNumber',
  'accountNumber', 'routingNumber', 'ssn',
  'bankAccount', 'cardNumber', 'cvv',
  '*.email', '*.phone', '*.accountNumber',
  'user.email', 'guest.email', 'customer.email',
]
```

### ESLint no-console Rule
```javascript
{
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
  },
  ignores: ["scripts/**", "**/*.test.ts", "**/*.spec.ts", "tests/**"],
}
```

### Structured Logger Usage Pattern
```typescript
// Before
console.log(`Payment succeeded for booking: ${bookingId}`);

// After
paymentLogger.info({ bookingId }, 'Payment succeeded');
```

## Commits

| Commit | Description | Files |
|--------|-------------|-------|
| 1203d24 | Add PII redaction paths to pino logger | lib/logger/index.ts |
| b8c30d1 | Add ESLint no-console rule | eslint.config.mjs |
| 200e237 | Migrate Stripe webhook console.log to pino | app/api/webhooks/stripe/route.ts |

## Verification Results

- [x] `lib/logger/index.ts` includes PII redaction for email, phone, accountNumber (6 email patterns confirmed)
- [x] `eslint.config.mjs` has no-console rule at error level
- [x] `app/api/webhooks/stripe/route.ts` has 0 console statements (verified: count = 0)
- [x] Stripe webhook uses stripeLogger, paymentLogger, partnerLogger, emailLogger, pdfLogger (31 structured log calls)
- [x] File exceeds min_lines requirement (1116 lines > 50 required)

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for 18-02:** Bank account encryption plan can proceed independently.

**Note:** Other files in the codebase may still have console.log statements. The ESLint rule will flag them on next lint run, allowing incremental migration.
