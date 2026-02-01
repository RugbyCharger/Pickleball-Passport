# Phase 18: Security Hardening - Research

**Researched:** 2026-02-01
**Domain:** Authorization, Encryption at Rest, Webhook Signature Verification, Structured Logging
**Confidence:** HIGH

## Summary

This phase addresses four critical security requirements to close security holes that could cause data breaches, financial fraud, or system manipulation. The codebase already has solid foundations from Phase 01 security work, but gaps remain.

**Current State Assessment:**
1. **Admin Route Protection (SEC-01)** - Middleware and admin layout already verify authentication and role, but could benefit from returning 403 Forbidden instead of silent redirects for API-level access attempts
2. **Bank Account Encryption (SEC-02)** - The `PartnerPayoutMethod` model was removed in Phase 01; Stripe Connect handles all bank data. However, any partner financial data in the schema should be audited
3. **Webhook Signature Verification (SEC-03)** - Stripe webhooks already verify signatures; SendGrid webhooks already use the official SDK with proper ECDSA verification
4. **Console.log Audit (SEC-04)** - 225+ console.log statements exist across 50+ files despite pino structured logging infrastructure being available

**Primary recommendation:** Focus effort on SEC-01 (returning proper 403 responses) and SEC-04 (migrating all console.log to pino). SEC-02 and SEC-03 are largely complete from Phase 01.

## Current State Analysis

### SEC-01: Admin Route Protection

**What exists:**
- `middleware.ts` uses `clerkMiddleware` with `createRouteMatcher` for admin routes
- Admin layout (`app/(dashboard)/dashboard/admin/layout.tsx`) does server-side database role verification
- tRPC `adminProcedure` enforces ADMIN role via database check (throws FORBIDDEN)

**Gaps:**
- Middleware redirects unauthorized users to `/dashboard` (not a 403 response)
- API routes under `/api/admin/*` (if any) may not have consistent protection
- No logging of unauthorized access attempts for security audit

**Code Evidence (middleware.ts lines 17-33):**
```typescript
if (isAdminRoute(request)) {
  const { userId } = await auth()
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', request.url)
    return NextResponse.redirect(signInUrl)  // Redirect, not 403
  }
  return NextResponse.next()  // Role check deferred to layout
}
```

### SEC-02: Partner Bank Account Encryption

**What exists:**
- `PartnerPayoutMethod` model was REMOVED from Prisma schema (confirmed via grep)
- All partner payouts use Stripe Connect (`stripeConnectAccountId` on `PartnerProfile`)
- Stripe handles all bank account data externally (PCI compliant)

**Status:** COMPLETE from Phase 01. No action needed unless new sensitive fields were added.

**Verification needed:** Audit schema for any other sensitive financial fields that might need encryption.

### SEC-03: Webhook Signature Verification

**Stripe Webhooks (app/api/webhooks/stripe/route.ts):**
- Already verifies signature using `verifyWebhookSignature()` from `@/lib/stripe/stripe-service`
- Returns 400 for invalid signature
- Logs signature failures via `stripeLogger.error`

**SendGrid Webhooks (app/api/webhooks/sendgrid/events/route.ts):**
- Already uses official `@sendgrid/eventwebhook` SDK
- Uses `EventWebhook.convertPublicKeyToECDSA()` and `verifySignature()`
- Returns 401 for invalid signature
- Production requires verification key; development warns but allows

**Status:** COMPLETE from Phase 01. Both webhooks properly verify signatures.

### SEC-04: Console.log Statements

**Current count:** 225 console.log/error/warn statements across 50 files

**High-risk locations (potential PII exposure):**
- `app/api/webhooks/stripe/route.ts` - 11 console statements with payment/booking data
- `app/api/cron/*` - Multiple files with extensive logging
- `lib/email/send-*.ts` - Email-related logging

**Existing infrastructure:**
- Pino logger configured at `lib/logger/index.ts`
- 19 pre-configured module loggers (stripeLogger, emailLogger, etc.)
- Automatic redaction of sensitive fields (password, token, secret, apiKey, etc.)

**Gap:** Redaction paths don't include email, phone, or bank-related fields that could be PII.

## Standard Stack

### Core (Already Present)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| @clerk/nextjs | ^6.36.5 | Authentication & middleware | In use |
| pino | latest | Structured logging with redaction | In use |
| stripe | latest | Webhook signature verification | In use |
| @sendgrid/eventwebhook | latest | ECDSA signature verification | In use |

### Supporting (May Need)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| prisma-field-encryption | ^2.x | Field-level encryption at rest | If any sensitive fields need encryption |

### No New Installations Required

The existing stack is sufficient for all SEC-01 through SEC-04 requirements.

## Architecture Patterns

### Pattern 1: Middleware 403 Response for API Routes

**What:** Return 403 Forbidden for unauthorized API access attempts instead of redirects
**When to use:** API routes under admin namespace
**Example:**
```typescript
// Source: Clerk best practices
export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    const { userId } = await auth()

    if (!userId) {
      // For API routes: return 403, not redirect
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Admin access required' },
          { status: 403 }
        )
      }
      // For page routes: redirect to sign-in
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Check admin role from database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!dbUser || dbUser.role !== 'ADMIN') {
      // Log unauthorized access attempt
      authLogger.warn(
        { userId, path: request.nextUrl.pathname },
        'Unauthorized admin access attempt'
      )

      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Admin role required' },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  return NextResponse.next()
})
```

### Pattern 2: Pino Logger Migration

**What:** Replace console.log with structured pino loggers
**When to use:** All production code logging
**Example:**
```typescript
// Source: Pino best practices
// BEFORE
console.log(`Payment succeeded for booking: ${bookingId}`)
console.error('Error handling payment success:', error)

// AFTER
stripeLogger.info({ bookingId }, 'Payment succeeded')
stripeLogger.error({ err: error, bookingId }, 'Error handling payment success')
```

### Pattern 3: Extended Redaction for PII

**What:** Add email, phone, and financial identifiers to pino redaction paths
**When to use:** All structured logging
**Example:**
```typescript
// Source: Pino redaction docs
const redactPaths = [
  // Existing
  'password',
  'token',
  'secret',
  'apiKey',
  '*.password',
  '*.token',
  // Add PII fields
  'email',
  'phone',
  'phoneNumber',
  'accountNumber',
  'routingNumber',
  'ssn',
  'bankAccount',
  '*.email',
  '*.phone',
  '*.phoneNumber',
  '*.accountNumber',
]
```

### Anti-Patterns to Avoid

- **Silent redirects for API 403s:** API clients expect error responses, not HTML redirects
- **Logging full objects:** Use specific fields to avoid accidental PII exposure
- **Relying on console.log in production:** No structured queries, no aggregation, no redaction

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Field encryption | Custom AES wrapper | prisma-field-encryption | Key rotation, schema integration |
| Log redaction | String replacement | Pino redact option | Performance, reliability |
| Webhook verification | Custom HMAC | Official SDKs | Algorithm correctness, maintenance |
| Role checking | Manual session parsing | Clerk auth() + DB lookup | Security, edge cases |

**Key insight:** Security primitives should use battle-tested libraries. Custom implementations introduce subtle vulnerabilities.

## Common Pitfalls

### Pitfall 1: Middleware Role Check Without Database

**What goes wrong:** Relying solely on Clerk session claims for role verification
**Why it happens:** Session claims may be stale if role was changed after login
**How to avoid:** Always verify critical roles against database for write operations
**Warning signs:** User role changes not taking effect until re-login

### Pitfall 2: Logging Full Request/Response Objects

**What goes wrong:** Sensitive data in nested objects gets logged
**Why it happens:** `console.log(request.body)` captures everything
**How to avoid:** Log specific fields; use pino redaction as safety net
**Warning signs:** Email addresses or tokens appearing in log aggregation

### Pitfall 3: Inconsistent Error Responses

**What goes wrong:** Some 403s return JSON, others redirect, others return HTML error pages
**Why it happens:** Different layers (middleware, API routes, tRPC) handle errors differently
**How to avoid:** Standardize error response format in middleware for all /api/* routes
**Warning signs:** Client code has multiple error handling paths

### Pitfall 4: Forgetting to Update ESLint Rules

**What goes wrong:** New console.log statements added after migration
**Why it happens:** No automated enforcement
**How to avoid:** Add `no-console` ESLint rule with `error` level
**Warning signs:** Console statement count increases over time

## Code Examples

### Console.log to Pino Migration (Stripe Webhook)

```typescript
// Source: Existing codebase pattern
// BEFORE (app/api/webhooks/stripe/route.ts line 192)
console.log(`PaymentRecord updated: ${paymentRecord.id} (installment ${paymentRecord.installmentNumber})`);

// AFTER
stripeLogger.info(
  { paymentRecordId: paymentRecord.id, installmentNumber: paymentRecord.installmentNumber },
  'PaymentRecord updated'
);
```

### Unauthorized Access Logging

```typescript
// Source: Security best practices
// In middleware when admin access denied
import { authLogger } from '@/lib/logger';

authLogger.warn(
  {
    userId,
    attemptedPath: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || 'unknown'
  },
  'Unauthorized admin access attempt'
);
```

### ESLint no-console Rule

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    // Or stricter: 'no-console': 'error'
  },
  overrides: [
    {
      // Allow in scripts and test files
      files: ['scripts/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-page role checks | Middleware + layout verification | 2025 | Centralized, consistent |
| Custom crypto for webhooks | Official SDKs | 2024 | Correct algorithms |
| console.log everywhere | Structured logging (pino) | Ongoing | Observability, compliance |
| Local bank data storage | Stripe Connect | Phase 01 | PCI compliance |

**Deprecated/outdated:**
- `pino-noir` for redaction: Now built into Pino 5+
- Manual ECDSA verification: Use @sendgrid/eventwebhook SDK

## Implementation Priority

Based on current state analysis:

| Requirement | Status | Priority | Effort |
|-------------|--------|----------|--------|
| SEC-01: Admin 403s | Partial | HIGH | Small |
| SEC-02: Bank encryption | Complete | N/A | None |
| SEC-03: Webhook signatures | Complete | N/A | None |
| SEC-04: Console.log audit | Needed | HIGH | Medium |

**Recommended order:**
1. SEC-04 first (highest impact, enables proper observability)
2. SEC-01 second (small change, high security value)
3. Verification of SEC-02 and SEC-03 (already done, just validate)

## Open Questions

1. **ESLint Configuration Location**
   - What we know: Project likely has eslint config
   - What's unclear: Current no-console rule status
   - Recommendation: Check existing config before adding rule

2. **API Routes Under /api/admin/**
   - What we know: tRPC handles most admin operations
   - What's unclear: Are there direct API routes that need protection?
   - Recommendation: Grep for `/api/admin` routes

3. **Partner Financial Data Fields**
   - What we know: PartnerPayoutMethod removed
   - What's unclear: Any other fields storing financial data?
   - Recommendation: Audit PartnerProfile and PartnerPayout models

## Sources

### Primary (HIGH confidence)
- Codebase analysis - middleware.ts, webhook handlers, logger configuration
- [Clerk RBAC Documentation](https://clerk.com/docs/guides/secure/basic-rbac) - Role checking patterns
- [Pino Redaction Docs](https://github.com/pinojs/pino/blob/main/docs/redaction.md) - Sensitive data handling
- [Stripe Webhook Signature Docs](https://docs.stripe.com/webhooks/signature) - Verification patterns

### Secondary (MEDIUM confidence)
- [Better Stack Logging Guide](https://betterstack.com/community/guides/logging/sensitive-data/) - PII in logs best practices
- [SigNoz Pino Guide](https://signoz.io/guides/pino-logger/) - Production logging patterns

### Tertiary (LOW confidence)
- None - all patterns verified against primary sources

## Metadata

**Confidence breakdown:**
- SEC-01 (Admin Routes): HIGH - Verified current implementation and Clerk patterns
- SEC-02 (Bank Data): HIGH - Confirmed removal in Phase 01
- SEC-03 (Webhooks): HIGH - Verified both Stripe and SendGrid implementations
- SEC-04 (Console.log): HIGH - Counted statements, verified pino infrastructure

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable security patterns)
