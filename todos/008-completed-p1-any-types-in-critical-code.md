# Use of `any` Types in Critical Code Paths

---
status: completed
priority: p1
issue_id: "008"
tags: [code-review, typescript, type-safety, critical]
dependencies: []
---

## Problem Statement

The codebase uses `catch (error: any)` and other unsafe type patterns in critical areas including payment processing and form handling. This bypasses TypeScript's safety guarantees.

**Why it matters:** Type safety in payment code prevents subtle bugs that could cause incorrect charges or data corruption.

## Findings

**Source:** TypeScript Reviewer Agent

**Critical Locations:**
- `/Users/grantcharge/Pickleball-Passport/lib/payments/charge-installment.ts` - `any` types in payment processing
- `/Users/grantcharge/Pickleball-Passport/components/booking/guest-profile-form.tsx` - `any` in user data handling
- `/Users/grantcharge/Pickleball-Passport/app/(dashboard)/dashboard/admin/cms/media/page.tsx` - 5 instances of `catch (error: any)`

**Evidence:**
```typescript
// Multiple files use this pattern
catch (error: any) {
  console.error(error.message)
}
```

## Proposed Solutions

### Option 1: Proper Error Type Narrowing (Recommended)

```typescript
catch (error: unknown) {
  if (error instanceof Error) {
    logger.error({ err: error }, 'Payment processing failed')
  } else {
    logger.error({ error: String(error) }, 'Unknown payment error')
  }
}
```

**Pros:** Type-safe, catches all error types properly
**Cons:** More verbose
**Effort:** Small
**Risk:** Low

### Option 2: Create Typed Error Utilities

```typescript
// lib/utils/error.ts
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

// Usage
catch (error: unknown) {
  logger.error(getErrorMessage(error))
}
```

**Pros:** DRY, consistent error handling
**Cons:** Another utility to maintain
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] No `any` types in payment processing code
- [ ] No `any` types in user data handling
- [ ] All catch blocks use `error: unknown`
- [ ] TypeScript strict mode passes
- [ ] ESLint `@typescript-eslint/no-explicit-any` enabled

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during TypeScript review | any types bypass safety in critical code |

## Resources

- TypeScript Error Handling Best Practices
- @typescript-eslint/no-explicit-any rule
