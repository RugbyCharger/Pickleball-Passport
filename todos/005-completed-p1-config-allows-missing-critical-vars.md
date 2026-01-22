# Configuration Allows Missing Critical Environment Variables

---
status: completed
priority: p1
issue_id: "005"
tags: [code-review, architecture, reliability, critical]
dependencies: []
---

## Problem Statement

Environment variables for critical services (Stripe, Clerk) are marked as optional in the configuration, allowing the application to start with missing configuration. This can cause runtime failures that should be caught at startup.

**Why it matters:** Fail-fast configuration validation prevents mysterious runtime errors and makes deployment issues immediately visible.

## Findings

**Source:** Architecture Strategist Agent

**Location:** `/Users/grantcharge/Pickleball-Passport/lib/config.ts`

**Evidence:**
Critical service keys use `.optional()`:
- `STRIPE_SECRET_KEY` - Payment processing
- `CLERK_SECRET_KEY` - Authentication
- Other critical infrastructure vars

The app can start successfully but will fail at runtime when these services are accessed.

## Proposed Solutions

### Option 1: Fail-Fast Configuration Validation (Recommended)

```typescript
const requiredEnv = z.object({
  STRIPE_SECRET_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  // ... other required vars
})

// Parse at module load - throws if missing
export const config = requiredEnv.parse(process.env)
```

**Pros:** Immediate feedback, clear error messages
**Cons:** May break local dev without all vars
**Effort:** Small
**Risk:** Low

### Option 2: Build-Time vs Runtime Separation
Different validation for build vs runtime configuration.

**Pros:** More flexible for different environments
**Cons:** More complex
**Effort:** Medium
**Risk:** Low

## Acceptance Criteria

- [ ] App fails to start if critical vars missing
- [ ] Clear error message indicates which var is missing
- [ ] Development environment has sensible defaults or clear setup docs
- [ ] CI/CD validates all required vars before deployment

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during architecture review | Optional critical config is risky |

## Resources

- 12-Factor App: Config
- Zod Environment Validation
