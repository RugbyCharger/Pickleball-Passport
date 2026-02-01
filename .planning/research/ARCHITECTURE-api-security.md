# Architecture Research: API Security

**Project:** Pickleball Passport
**Milestone:** v2.3 API Security Hardening
**Researched:** 2026-02-01
**Confidence:** HIGH (verified with official docs and existing codebase)

## Current Architecture

### Request Flow Overview

```
                                  +------------------+
                                  |   Mobile App     |
                                  | (Bearer Token)   |
                                  +--------+---------+
                                           |
                                           v
+-------------+    +-----------------+    +------------------+    +----------------+
|   Browser   |--->|   middleware.ts |--->| /api/trpc/[trpc] |--->|  tRPC Router   |
| (Same-site) |    | (Clerk + Admin) |    |   route.ts       |    |  + Procedures  |
+-------------+    +-----------------+    +------------------+    +----------------+
                           |                      |                       |
                           v                      v                       v
                   +---------------+      +---------------+       +---------------+
                   |  Auth Check   |      | createContext |       |  Middleware   |
                   |  Role Check   |      |  (User + DB)  |       | (Auth/Admin)  |
                   +---------------+      +---------------+       +---------------+
```

### Existing Middleware Structure

**File:** `middleware.ts` (root)

Current responsibilities:
1. Clerk authentication via `clerkMiddleware()`
2. Admin route protection (database role check)
3. Dashboard route protection (auth required)
4. Public route passthrough

```typescript
// Current middleware pattern
export default clerkMiddleware(async (auth, request) => {
  // Admin routes: auth + DB role check
  // Dashboard routes: auth check
  // Public routes: passthrough
})
```

### tRPC Handler Structure

**File:** `app/api/trpc/[trpc]/route.ts`

Current flow:
1. `fetchRequestHandler` receives request
2. `createTRPCContext` creates context with user + db
3. `appRouter` routes to appropriate procedure
4. Procedure middleware handles auth/role checks

### Client Configurations

**Web Client** (`app/providers.tsx`):
- Uses `httpBatchLink` with relative URL
- No explicit headers (relies on cookies)
- Same-origin requests benefit from SameSite cookies

**Mobile Client** (`mobile/lib/trpc.ts`):
- Uses `httpBatchLink` with explicit API URL
- Sends `Authorization: Bearer ${token}` header
- Cross-origin requests from mobile device

### Existing Rate Limiting Infrastructure

**File:** `lib/rate-limit/index.ts`

Already implemented:
- Upstash Redis client with lazy initialization
- Rate limiters: `newsletter`, `contact`, `api`, `ticketStatus`, `giftResend`
- IP extraction utility supporting Vercel/Cloudflare headers
- Graceful degradation (allows if not configured)

**Packages:** `@upstash/ratelimit@2.0.7`, `@upstash/redis@1.36.1`

---

## Rate Limiting Architecture

### Recommended Approach: Hybrid (Edge + tRPC)

**Layer 1: Edge Middleware (Global)**
- Applies to ALL requests before they hit Node.js
- Best for DDoS protection and global limits
- Fast (no cold start), cost-effective

**Layer 2: tRPC Middleware (Per-Procedure)**
- Fine-grained limits per endpoint/user
- Access to user context (userId, role)
- Business logic integration (e.g., tier-based limits)

### Integration Architecture

```
Request
    |
    v
+-------------------+
| Edge Middleware   |  <-- Global rate limit (e.g., 100 req/min per IP)
| (middleware.ts)   |      Uses: @upstash/ratelimit with ephemeral cache
+-------------------+
    |
    | (if allowed)
    v
+-------------------+
| Clerk Middleware  |  <-- Auth + route protection (existing)
+-------------------+
    |
    v
+-------------------+
| tRPC Handler      |
+-------------------+
    |
    v
+-------------------+
| tRPC Procedure    |  <-- Per-endpoint rate limits
| Middleware        |      Uses: existing lib/rate-limit + trpc-limiter pattern
+-------------------+
```

### State Storage

**Recommended:** Upstash Redis (already configured)

Advantages:
- Already in package.json and configured
- Serverless-friendly (HTTP-based, no TCP connections)
- Global edge locations match Vercel deployment
- Ephemeral cache support reduces Redis calls

**Configuration needed:**
- `UPSTASH_REDIS_REST_URL` (in `.env.test.example`, needs production setup)
- `UPSTASH_REDIS_REST_TOKEN`

### Edge Middleware Implementation Pattern

```typescript
// middleware.ts modification
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Outside handler for ephemeral caching
const redis = Redis.fromEnv()
const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'ratelimit:global',
  ephemeralCache: new Map(), // Cache while function is "hot"
})

export default clerkMiddleware(async (auth, request) => {
  // Skip rate limiting for internal/static requests
  if (shouldSkipRateLimit(request)) {
    return // Continue to existing logic
  }

  const ip = getIpFromRequest(request)
  const { success, limit, remaining, reset } = await globalLimiter.limit(ip)

  if (!success) {
    return new NextResponse('Rate Limited', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    })
  }

  // Continue to existing Clerk/admin logic...
})
```

### tRPC Per-Procedure Rate Limiting Pattern

Extend existing `lib/rate-limit/index.ts`:

```typescript
// lib/trpc/server/middleware/rate-limit.ts
import { TRPCError } from '@trpc/server'
import { checkRateLimit, getIpAddress } from '@/lib/rate-limit'

export const rateLimitMiddleware = (
  limiterType: 'api' | 'contact' | 'newsletter' | 'ticketStatus' | 'giftResend'
) =>
  t.middleware(async ({ ctx, next }) => {
    const ip = getIpAddress(ctx.headers)
    const result = await checkRateLimit(limiterType, ip)

    if (result && !result.success) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded',
      })
    }

    return next()
  })

// Usage in procedures:
export const rateLimitedProcedure = publicProcedure.use(rateLimitMiddleware('api'))
```

---

## CSRF Architecture

### Attack Vector Analysis

**tRPC uses JSON content-type** which provides inherent protection:
- HTML forms can only submit `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`
- tRPC clients send `application/json`
- CORS blocks cross-origin JSON requests

**However, tRPC v11 issue [#5522](https://github.com/trpc/trpc/issues/5522) notes:**
- `fetchRequestHandler` (used in App Router) DOES check Content-Type
- But zero-input mutations could still be vulnerable

### Recommended Approach: Defense in Depth

**Layer 1: Content-Type Validation**
- Already handled by `fetchRequestHandler` in tRPC 11.8.1
- Verify explicitly in tRPC handler for mutations

**Layer 2: Origin Header Validation**
- Validate `Origin` header matches allowed origins
- Implement in middleware for API routes

**Layer 3: SameSite Cookies**
- Clerk uses `SameSite=Lax` by default
- Sufficient for state-changing operations on navigation

### Mobile App Consideration

The mobile app uses Bearer tokens, not cookies:
```typescript
// mobile/lib/trpc.ts
async headers() {
  const token = await getToken();
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
}
```

**CSRF is not a concern for mobile:**
- No automatic cookie sending
- Token must be explicitly included
- Cannot be exploited via browser-based attacks

### Implementation Architecture

```typescript
// In middleware.ts - Origin validation for mutations
function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const method = request.method

  // Skip for non-mutating requests
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true
  }

  // Allow requests without origin (same-origin, non-browser)
  if (!origin) {
    return true // Mobile app, server-to-server
  }

  // Validate origin against allowed list
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://pickleballpassport.com',
    'https://www.pickleballpassport.com',
  ].filter(Boolean)

  return allowedOrigins.some(allowed => origin === allowed)
}
```

### tRPC Content-Type Enforcement (Belt and Suspenders)

```typescript
// app/api/trpc/[trpc]/route.ts - Explicit validation
const handler = (req: Request) => {
  // Extra content-type check for mutations
  if (req.method === 'POST') {
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Invalid Content-Type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  return fetchRequestHandler({ ... })
}
```

---

## CSP Architecture

### Next.js 16 CSP Options

**Option 1: Middleware-based Nonces (Strict)**
- Generate nonce per request
- Pass via `x-nonce` header
- Requires dynamic rendering for ALL pages
- **Not recommended:** Performance impact, complexity

**Option 2: Static CSP Headers (Recommended)**
- Set via `next.config.ts` headers
- Works with static pages
- Use `strict-dynamic` for script loading
- No nonce management needed

**Option 3: Clerk's Built-in CSP**
- Available in `@clerk/nextjs >=6.14.0`
- `contentSecurityPolicy` option in `clerkMiddleware()`
- Automatically handles Clerk domains

### Recommended Approach: Static + Clerk Integration

Since Pickleball Passport uses:
- Clerk for auth
- Google reCAPTCHA v3
- Stripe Elements
- Mux video player
- Multiple third-party scripts

A static CSP with explicit allowlists is most practical.

### Integration Point: next.config.ts

```typescript
// next.config.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://*.clerk.accounts.dev
    https://challenges.cloudflare.com
    https://www.google.com/recaptcha/
    https://www.gstatic.com/recaptcha/
    https://js.stripe.com
    https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:
    https://img.clerk.com
    https://images.unsplash.com
    https://*.stripe.com;
  font-src 'self';
  connect-src 'self'
    https://*.clerk.accounts.dev
    https://api.stripe.com
    https://www.google-analytics.com
    wss://*.stream-io-api.com;
  frame-src 'self'
    https://challenges.cloudflare.com
    https://js.stripe.com
    https://www.google.com/recaptcha/;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: cspHeader },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],
}
```

### CSP Development vs Production

```typescript
// Development allows unsafe-eval for React Refresh
const isDev = process.env.NODE_ENV === 'development'
const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval' ..."
  : "'self' 'unsafe-inline' ..."  // Remove unsafe-eval in prod
```

### Clerk CSP Integration (Alternative)

If using Clerk's built-in CSP:

```typescript
// middleware.ts
export default clerkMiddleware(
  async (auth, request) => { /* existing logic */ },
  {
    contentSecurityPolicy: {
      directives: {
        'script-src': ['https://www.google.com/recaptcha/', 'https://js.stripe.com'],
        'connect-src': ['https://api.stripe.com', 'wss://*.stream-io-api.com'],
        'frame-src': ['https://js.stripe.com', 'https://www.google.com/recaptcha/'],
        'img-src': ['https://images.unsplash.com', 'https://*.stripe.com'],
      },
    },
  }
)
```

---

## Integration Diagram

```
                        INTERNET
                            |
                            v
+---------------------------------------------------------------+
|                     VERCEL EDGE                                |
|  +----------------------------------------------------------+ |
|  |                   middleware.ts                           | |
|  |                                                           | |
|  |  1. Rate Limit Check (Upstash)                           | |
|  |     - Global: 100 req/min per IP                         | |
|  |     - Ephemeral cache for hot functions                  | |
|  |                                                           | |
|  |  2. Origin Validation (CSRF)                             | |
|  |     - POST requests only                                 | |
|  |     - Allowlist: pickleballpassport.com, localhost       | |
|  |                                                           | |
|  |  3. Clerk Auth (existing)                                | |
|  |     - Session validation                                 | |
|  |     - Admin role check (DB lookup)                       | |
|  |                                                           | |
|  +----------------------------------------------------------+ |
+---------------------------------------------------------------+
                            |
                            v
+---------------------------------------------------------------+
|                    SERVERLESS FUNCTION                         |
|  +----------------------------------------------------------+ |
|  |              app/api/trpc/[trpc]/route.ts                | |
|  |                                                           | |
|  |  4. Content-Type Validation (CSRF)                       | |
|  |     - Require application/json for POST                  | |
|  |                                                           | |
|  |  5. tRPC Context Creation                                | |
|  |     - User from Clerk                                    | |
|  |     - Database client                                    | |
|  |     - Request headers                                    | |
|  |                                                           | |
|  +----------------------------------------------------------+ |
|  +----------------------------------------------------------+ |
|  |                    tRPC Router                            | |
|  |                                                           | |
|  |  6. Procedure Rate Limits                                | |
|  |     - Per-endpoint (contact: 3/min, newsletter: 5/min)  | |
|  |     - User-based limits for authenticated endpoints      | |
|  |                                                           | |
|  |  7. Auth Middleware (existing)                           | |
|  |     - protectedProcedure: requires auth                  | |
|  |     - adminProcedure: requires ADMIN role                | |
|  |                                                           | |
|  +----------------------------------------------------------+ |
+---------------------------------------------------------------+
                            |
                            v
                        RESPONSE
                            |
+---------------------------------------------------------------+
|                     CSP HEADERS                                |
|  (Set via next.config.ts headers or middleware)               |
|  - Content-Security-Policy                                    |
|  - X-Frame-Options: DENY                                      |
|  - X-Content-Type-Options: nosniff                            |
+---------------------------------------------------------------+
```

---

## Build Order

Based on dependency analysis:

### Phase 1: SEC-05 Rate Limiting (Foundation)

**Why first:**
- Infrastructure already partially exists (`lib/rate-limit/index.ts`)
- No dependencies on other security features
- Protects against abuse while implementing other features

**Implementation order:**
1. Extend existing `lib/rate-limit/index.ts` with edge-compatible patterns
2. Add global rate limiting to `middleware.ts`
3. Create tRPC rate limit middleware
4. Apply to sensitive procedures (contact, newsletter, gift resend)

**Dependencies:**
- Upstash Redis credentials (already in `.env.test.example`)

### Phase 2: SEC-06 CSRF Protection

**Why second:**
- Builds on middleware pattern established in SEC-05
- Relatively simple - mostly validation logic
- No external dependencies

**Implementation order:**
1. Add Origin validation to `middleware.ts`
2. Add explicit Content-Type check to tRPC handler
3. Document which endpoints are protected and why
4. Test with mobile app to ensure Bearer token flow unaffected

**Dependencies:**
- SEC-05 middleware structure (can parallelize if careful)

### Phase 3: SEC-07 CSP Headers

**Why third:**
- Requires inventory of all third-party scripts/resources
- May require adjustments based on CSP violations in staging
- Does not affect rate limiting or CSRF logic

**Implementation order:**
1. Audit all third-party resources (Clerk, Stripe, reCAPTCHA, Mux, etc.)
2. Implement initial CSP in `next.config.ts`
3. Deploy to staging and monitor for violations
4. Iterate on directives until stable
5. Consider `Content-Security-Policy-Report-Only` during rollout

**Dependencies:**
- None (can technically be done in parallel)
- Benefits from having SEC-05/06 stable first

### Build Order Summary

```
Week 1-2: SEC-05 Rate Limiting
  |-- Extend lib/rate-limit
  |-- Middleware integration
  +-- tRPC middleware

Week 2-3: SEC-06 CSRF Protection (can overlap)
  |-- Origin validation
  +-- Content-Type enforcement

Week 3-4: SEC-07 CSP Headers
  |-- Resource audit
  |-- Initial CSP
  +-- Iteration cycle
```

---

## Sources

### Official Documentation
- [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy) - Middleware nonce implementation
- [Clerk CSP Headers](https://clerk.com/docs/guides/secure/best-practices/csp-headers) - Built-in CSP support
- [Clerk Middleware Reference](https://clerk.com/docs/reference/nextjs/clerk-middleware) - Composition patterns

### Rate Limiting
- [Upstash Edge Rate Limiting](https://upstash.com/blog/edge-rate-limiting) - Ephemeral cache pattern
- [Vercel Rate Limiting Guide](https://vercel.com/guides/rate-limiting-edge-middleware-vercel-kv) - Edge middleware approach
- [trpc-limiter](https://github.com/OrJDev/trpc-limiter) - Per-procedure rate limiting

### CSRF Protection
- [tRPC Content-Type Issue #5522](https://github.com/trpc/trpc/issues/5522) - CSRF vulnerability details
- [LogRocket CSRF Guide](https://blog.logrocket.com/protecting-next-js-apps-csrf-attacks/) - Implementation patterns

### Security Best Practices
- [Complete Next.js Security Guide 2025](https://www.turbostarter.dev/blog/complete-nextjs-security-guide-2025-authentication-api-protection-and-best-practices) - Defense in depth
- [Clerk Authentication Guide 2025](https://clerk.com/articles/complete-authentication-guide-for-nextjs-app-router) - CVE-2025-29927 awareness

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Rate Limiting | HIGH | Existing infrastructure, official Upstash docs verified |
| CSRF | HIGH | tRPC behavior verified via GitHub issues, Clerk docs |
| CSP | MEDIUM | Third-party integrations need testing; Clerk CSP option available |
| Build Order | HIGH | Clear dependency analysis from codebase |
| Mobile Compatibility | HIGH | Code inspection confirms Bearer token approach |
