---
phase: 19
plan: 02
subsystem: security
tags: [csrf, origin-validation, middleware, trpc, security-headers]

dependency-graph:
  requires:
    - 19-01 (webhook exemption pattern, isWebhookRoute matcher)
  provides:
    - Origin header validation for mutation endpoints
    - CSRF protection via Origin + Content-Type validation
    - Documented tRPC CSRF protection model
  affects:
    - All POST/PUT/PATCH/DELETE requests
    - Mobile app API calls (exempted via Bearer token)
    - Webhook endpoints (exempted via isWebhookRoute)

tech-stack:
  added: []
  patterns:
    - Defense-in-depth CSRF protection (Origin + Content-Type)
    - Bearer token CSRF exemption for mobile app
    - Webhook signature verification exemption pattern

files:
  created:
    - lib/security/origin-validation.ts
  modified:
    - middleware.ts
    - lib/trpc/server/trpc.ts

decisions:
  - id: CS-01
    title: Defense-in-depth CSRF strategy
    choice: Origin validation in middleware + tRPC Content-Type validation
    rationale: Two independent layers - Origin blocks cross-site forms, Content-Type blocks non-JSON requests

  - id: CS-02
    title: Bearer token CSRF exemption
    choice: Skip Origin validation for requests with Authorization Bearer header
    rationale: Mobile app uses Bearer tokens (not cookies), making it inherently CSRF-immune

  - id: CS-03
    title: Permissive no-Origin policy
    choice: Allow requests without Origin header if they have JSON Content-Type
    rationale: Same-origin requests may omit Origin; tRPC Content-Type check catches form-based CSRF anyway

metrics:
  duration: 12 minutes
  completed: 2026-02-01
  commits: 2
---

# Phase 19 Plan 02: CSRF Protection and Origin Validation Summary

Implemented defense-in-depth CSRF protection through Origin header validation in middleware, complementing tRPC's built-in Content-Type validation.

## What Was Built

### 1. Origin Validation Utility (lib/security/origin-validation.ts)

New security utility with CSRF protection helpers:

| Function | Purpose |
|----------|---------|
| `validateOrigin(request)` | Validates Origin header against allowed origins |
| `isMutationMethod(method)` | Checks if HTTP method is POST/PUT/PATCH/DELETE |
| `hasBearerToken(request)` | Detects Bearer token auth (mobile app CSRF-immune) |
| `ALLOWED_ORIGINS` | Configuration for production, preview, development origins |

**Allowed Origins Configuration:**
```typescript
ALLOWED_ORIGINS = {
  production: [
    'https://pickleballpassport.com',
    'https://www.pickleballpassport.com',
    'https://app.pickleballpassport.com',
  ],
  preview: /^https:\/\/.*\.vercel\.app$/,  // Vercel preview deployments
  development: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
}
```

### 2. Middleware Integration (middleware.ts)

Added CSRF protection after rate limiting, before Clerk auth:

```
Request Flow:
1. Webhook exemption check (early return)
2. Global rate limiting (100 req/min)
3. NEW: Origin validation (mutations only)
4. Clerk authentication
5. Route-specific authorization
```

CSRF violations return 403 Forbidden with JSON response and are logged with:
- Origin header value
- Request path
- HTTP method
- Client IP

### 3. tRPC CSRF Protection Documentation (lib/trpc/server/trpc.ts)

Added security documentation confirming tRPC v11.8.1 built-in protection:
- Content-Type validation enabled by default
- Blocks form-based CSRF (requires application/json)
- Warning against disabling protection

## Security Model

### Two-Layer CSRF Protection

**Layer 1: Origin Header Validation (Middleware)**
- Validates Origin against allowed origins list
- Blocks cross-site form submissions from unknown origins
- Exempts Bearer token requests (mobile app)
- Exempts webhooks (use signature verification)

**Layer 2: Content-Type Validation (tRPC)**
- Requires `Content-Type: application/json` header
- Blocks HTML form submissions (cannot set custom Content-Type)
- Built into tRPC v11.8.1 by default

### Exemption Patterns

| Pattern | Exemption | Reason |
|---------|-----------|--------|
| Bearer Token | Skip Origin validation | CSRF requires cookie-based auth; Bearer is immune |
| Webhooks | Skip all CSRF checks | Use cryptographic signature verification |
| GET Requests | Skip Origin validation | Read-only, no state changes |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

| Criteria | Status |
|----------|--------|
| SEC-06-01: Origin validation for POST/PUT/PATCH/DELETE | PASS |
| SEC-06-02: tRPC Content-Type validation active | PASS |
| SEC-06-03: Bearer token requests bypass CSRF | PASS |
| SEC-06-04: Webhook endpoints exempted | PASS |

Build verification: `npm run build` passes.

## Commits

| Commit | Description |
|--------|-------------|
| db8e02f | feat(19-02): add origin validation utility for CSRF protection |
| 1ba8dd7 | feat(19-02): integrate origin validation into middleware |

## Next Phase Readiness

Ready for 19-03 (CSP Headers). No blockers.

The middleware pattern established in 19-01 and extended here provides a clean location for adding security headers in the next plan.
