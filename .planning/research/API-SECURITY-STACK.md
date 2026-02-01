# Stack Research: API Security

**Project:** Pickleball Passport
**Milestone:** v2.3 API Security Hardening (SEC-05, SEC-06, SEC-07)
**Researched:** 2026-02-01
**Confidence:** HIGH (verified with official docs)

## Executive Summary

This research evaluates stack requirements for adding rate limiting, CSRF protection, and CSP headers to an existing Next.js 16.1.1 + tRPC 11.8.1 + Clerk + Vercel application.

**Key Finding:** The project already has most required infrastructure in place. SEC-06 (CSRF) requires zero new dependencies. SEC-05 and SEC-07 require configuration changes, not new libraries.

---

## Rate Limiting (SEC-05)

### Current State

The project **already has** `@upstash/ratelimit` v2.0.8 and `@upstash/redis` v1.36.1 installed and configured at `/lib/rate-limit/index.ts`. Rate limiting is already applied to:
- Newsletter subscription (5 req/min/IP)
- Contact form (3 req/min/IP)
- Ticket status lookup (10 req/hour/email)
- Gift resend (3 req/24h/gift)

### What's Needed for SEC-05

**No new dependencies required.** The task is to:

1. Extend existing rate limiters to cover additional public endpoints
2. Optionally add middleware-level rate limiting for global protection
3. Add rate limit response headers for client transparency

### Recommended Approach

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **tRPC procedure-level** (current) | Granular control, endpoint-specific limits | Requires adding to each procedure | **Use for sensitive endpoints** |
| **Next.js middleware-level** | Global protection, blocks at edge | Less granular, one limit for all | **Use for DDoS protection** |
| **Hybrid** | Best of both | More complexity | **Recommended** |

### Middleware Enhancement Pattern

```typescript
// middleware.ts addition
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const globalRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min global
  ephemeralCache: new Map(),
  prefix: '@upstash/ratelimit:global',
  analytics: true,
})
```

### Version Verification

| Package | Installed | Latest | Action |
|---------|-----------|--------|--------|
| @upstash/ratelimit | 2.0.8 | 2.0.8 | Current |
| @upstash/redis | 1.36.1 | 1.36.1 | Current |

**Source:** npm registry, verified 2026-02-01

---

## CSRF Protection (SEC-06)

### Current State

**tRPC v11.8.1 has built-in CSRF protection via Content-Type validation.**

The [PR #5526](https://github.com/trpc/trpc/pull/5526) merged in March 2024 enforces `application/json` Content-Type for POST/PUT/DELETE requests. Since HTML forms can only submit with `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`, this effectively blocks form-based CSRF attacks.

### What's Needed for SEC-06

**No new dependencies required.** The built-in protection covers tRPC mutations. For additional defense-in-depth:

1. **Verify** tRPC Content-Type validation is active (it is by default in v11)
2. **Add Origin header validation** in Next.js middleware for non-tRPC routes
3. **Document** the protection in security docs

### Why NOT to Add Token-Based CSRF

| Approach | Rationale |
|----------|-----------|
| **Double-submit cookie** | Unnecessary - tRPC Content-Type check provides equivalent protection |
| **CSRF token in state** | Adds complexity without benefit for JSON APIs |
| **Synchronizer token** | Overkill for SPA architecture with same-origin API |

### Recommended Defense-in-Depth

```typescript
// middleware.ts - Origin validation for sensitive routes
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  'https://pickleballpassport.com',
]

if (request.method !== 'GET') {
  const origin = request.headers.get('origin')
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }
}
```

### Confidence Level

**HIGH** - Verified via [tRPC GitHub PR #5526](https://github.com/trpc/trpc/pull/5526) and [issue #5522](https://github.com/trpc/trpc/issues/5522). The feature is confirmed in tRPC v11.

---

## Content Security Policy (SEC-07)

### Current State

**No CSP headers currently configured.** The `next.config.ts` has no security headers defined.

### Recommended Approach

**Use Clerk's built-in CSP support** via `clerkMiddleware` configuration. This is the optimal approach because:

1. Clerk already manages the middleware
2. Clerk provides automatic nonce generation for strict CSP
3. Clerk documents required domains for its scripts

### Implementation Options

| Approach | Security | Performance | Complexity | Recommendation |
|----------|----------|-------------|------------|----------------|
| **Clerk CSP (default)** | Good | High (static) | Low | **Start here** |
| **Clerk CSP (strict)** | Highest | Lower (dynamic) | Medium | Production goal |
| **next.config.js headers** | Good | High | Low | Fallback option |
| **Custom middleware** | Flexible | Varies | High | Only if needed |

### Clerk CSP Configuration

```typescript
// middleware.ts
export default clerkMiddleware(
  async (auth, request) => {
    // existing logic
  },
  {
    contentSecurityPolicy: {
      strict: false, // Start with default, upgrade to strict later
      directives: {
        'connect-src': [
          'https://api.stripe.com',
          'https://api.sendgrid.com',
          process.env.NEXT_PUBLIC_SUPABASE_URL,
        ],
        'frame-src': ['https://js.stripe.com'],
        'img-src': ['https://img.clerk.com', 'https://images.unsplash.com'],
      },
    },
  }
)
```

### Required CSP Directives for This App

| Directive | Required Origins | Reason |
|-----------|-----------------|--------|
| `script-src` | Clerk FAPI, Cloudflare challenges | Clerk auth |
| `connect-src` | Stripe API, Supabase, tRPC endpoint | API calls |
| `frame-src` | Stripe checkout, Cloudflare | Payment & Clerk |
| `img-src` | Clerk images, Supabase storage | User content |
| `style-src` | `'unsafe-inline'` (required) | Clerk CSS-in-JS |
| `worker-src` | `'self'`, `blob:` | Service workers |

### Version Requirements

Clerk's `contentSecurityPolicy` option requires `@clerk/nextjs` >= 6.14.0. The project has v6.36.5, which is compatible.

**Source:** [Clerk CSP Documentation](https://clerk.com/docs/guides/secure/best-practices/csp-headers)

---

## Recommended Stack Additions

| Library | Version | Purpose | Integration Point | Action |
|---------|---------|---------|-------------------|--------|
| @upstash/ratelimit | 2.0.8 | Rate limiting | Already installed | Configure |
| @upstash/redis | 1.36.1 | Redis client | Already installed | Configure |
| @clerk/nextjs | 6.36.5 | CSP via middleware | Already installed | Configure |
| (none) | - | CSRF protection | tRPC built-in | Verify |

**Total new dependencies: 0**

---

## What NOT to Add

| Library | Why Not |
|---------|---------|
| `helmet` | Express-only, doesn't work with Next.js App Router |
| `csrf` / `csurf` | Unnecessary - tRPC Content-Type check provides protection |
| `express-rate-limit` | Express-only, Upstash already handles this |
| `next-safe` / `@next-safe/middleware` | Clerk's built-in CSP is simpler for this stack |
| `arcjet` | Adds another service dependency; Upstash already sufficient |
| `rate-limiter-flexible` | Requires persistent connections; not Vercel Edge compatible |

### Rationale for Minimal Additions

1. **Upstash is already configured** - Adding Arcjet would duplicate functionality
2. **tRPC v11 has CSRF built-in** - Adding token-based CSRF is unnecessary complexity
3. **Clerk has CSP support** - Adding a separate CSP library conflicts with Clerk middleware
4. **Solo developer capacity** - Fewer dependencies = less maintenance

---

## Integration Points

### middleware.ts Changes (Primary)

```typescript
// Current: Clerk auth + route protection
// Add: CSP configuration, optional global rate limit, origin validation

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export default clerkMiddleware(
  async (auth, request) => {
    // Rate limit check (global, optional)
    // Origin validation for mutations
    // Existing auth logic
  },
  {
    contentSecurityPolicy: {
      // CSP directives
    },
  }
)
```

### tRPC Context Changes (None Needed)

The existing `lib/trpc/server/trpc.ts` already has headers in context, which enables:
- IP extraction for rate limiting (already implemented)
- CSRF protection (automatic via tRPC v11)

### next.config.ts Changes (Fallback)

Only needed if Clerk CSP configuration proves insufficient:

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}
```

---

## Vercel Serverless Compatibility

| Feature | Vercel Compatibility | Notes |
|---------|---------------------|-------|
| @upstash/ratelimit | YES | HTTP-based, no persistent connections |
| tRPC CSRF (Content-Type) | YES | Built into request handling |
| Clerk CSP | YES | Middleware runs at edge |
| Nonce-based CSP | YES* | Requires dynamic rendering |

*Nonce-based strict CSP disables static generation. For pages that can be static, use `strict: false` initially.

---

## Implementation Priority

1. **SEC-07: CSP Headers** - Add Clerk CSP configuration (lowest risk, immediate security benefit)
2. **SEC-06: CSRF Verification** - Verify tRPC protection is active, add Origin check
3. **SEC-05: Rate Limiting** - Extend existing rate limiters to remaining public endpoints

This order minimizes risk while providing immediate security improvements.

---

## Public Endpoints Requiring Rate Limiting (SEC-05)

Based on the codebase analysis, these public procedures need rate limiting:

### Already Rate Limited (Verified)
- `newsletter.subscribe` - 5 req/min/IP
- `contact.submit` - 3 req/min/IP
- `support.checkStatus` (ticket lookup) - 10 req/hour/email
- `gift.resend` - 3 req/24h/gift

### Needs Rate Limiting
- `newsletter.confirm` - Prevent token brute-forcing
- `newsletter.unsubscribe` - Prevent abuse
- `guestTestimonial.*` - Public testimonial submission (if exists)
- `package.list` / `package.get` - Public package browsing (low priority, read-only)
- Any other `publicProcedure` endpoints

### Recommended New Rate Limiters

```typescript
// lib/rate-limit/index.ts additions

/**
 * Token validation: 10 attempts per hour per token
 * Prevents brute-force attacks on confirmation tokens
 */
tokenValidation: () => {
  const client = getRedis();
  if (!client) return null;
  return new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:token-validation',
    analytics: true,
  });
},

/**
 * Public reads: 100 requests per minute per IP
 * Allows browsing but prevents scraping
 */
publicRead: () => {
  const client = getRedis();
  if (!client) return null;
  return new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:public-read',
    analytics: true,
  });
},
```

---

## Sources

### Verified (HIGH confidence)
- [Upstash Ratelimit Documentation](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Upstash Ratelimit GitHub - Next.js Middleware Example](https://github.com/upstash/ratelimit-js/tree/main/examples/nextjs-middleware)
- [tRPC CSRF PR #5526](https://github.com/trpc/trpc/pull/5526)
- [tRPC CSRF Issue #5522](https://github.com/trpc/trpc/issues/5522)
- [Clerk CSP Documentation](https://clerk.com/docs/guides/secure/best-practices/csp-headers)
- [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy)
- [Vercel Edge Rate Limiting](https://upstash.com/blog/edge-rate-limiting)

### Cross-Referenced (MEDIUM confidence)
- [Arcjet Documentation](https://docs.arcjet.com/rate-limiting/reference/) - Alternative evaluated, not recommended
- [Next.js Security Headers](https://blog.logrocket.com/using-next-js-security-headers/) - General patterns

### npm Registry (verified 2026-02-01)
- @upstash/ratelimit: 2.0.8
- @upstash/redis: 1.36.1
- @clerk/nextjs: 6.36.5 (project) / latest available

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Rate Limiting Stack | HIGH | Already implemented, just needs extension |
| CSRF Protection | HIGH | tRPC v11 feature verified in GitHub PR |
| CSP Implementation | HIGH | Clerk official documentation, version compatible |
| Vercel Compatibility | HIGH | All solutions designed for serverless/edge |

---

**Last Updated:** 2026-02-01
**Next Steps:** Proceed to roadmap creation using this stack assessment
