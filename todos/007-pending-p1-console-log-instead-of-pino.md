# Console Logging Instead of Structured Pino Logging

---
status: pending
priority: p1
issue_id: "007"
tags: [code-review, observability, architecture, critical]
dependencies: []
---

## Problem Statement

The codebase has well-designed Pino structured logging infrastructure, but 228+ `console.log/error/warn` statements exist alongside it, creating inconsistent observability.

**Why it matters:** Console logging doesn't support structured queries, log aggregation, or production monitoring. Inconsistent logging makes debugging and monitoring difficult.

## Findings

**Source:** Architecture Strategist Agent

**Locations:**
- `/Users/grantcharge/Pickleball-Passport/app/api/` directory - **166 console statements** across 33 files
- `/Users/grantcharge/Pickleball-Passport/lib/` directory - **62 console statements** across 21 files
- `/Users/grantcharge/Pickleball-Passport/app/api/webhooks/stripe/route.ts` - **45 console statements** in one file

**Existing Infrastructure:**
Pino infrastructure exists at `/Users/grantcharge/Pickleball-Passport/lib/logger/index.ts` with 17 pre-configured module loggers.

## Proposed Solutions

### Option 1: Migrate All to Pino (Recommended)

Replace all console statements with appropriate Pino loggers:
```typescript
// Before
console.log('Processing payment:', paymentId)
console.error('Payment failed:', error)

// After
stripeLogger.info({ paymentId }, 'Processing payment')
stripeLogger.error({ err: error, paymentId }, 'Payment failed')
```

**Pros:** Consistent structured logging, better production monitoring
**Cons:** Initial migration effort
**Effort:** Medium
**Risk:** Low

### Option 2: ESLint Rule
Add `no-console` ESLint rule to prevent future console usage.

**Pros:** Prevents regression
**Cons:** Doesn't fix existing code
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] Zero console.log/error/warn in production code
- [ ] All logging uses appropriate Pino module loggers
- [ ] ESLint rule prevents console usage
- [ ] Log queries work in production monitoring
- [ ] Sensitive data properly redacted in logs

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during architecture review | 228+ console statements despite Pino infrastructure |

## Resources

- Pino Documentation
- Structured Logging Best Practices
