# Pitfalls Research: API Security

**Project:** Pickleball Passport
**Focus:** Adding rate limiting, CSRF protection, and CSP headers to existing Next.js + tRPC + Vercel app
**Researched:** 2026-02-01
**Confidence:** HIGH (verified against official docs and current project structure)

---

## Rate Limiting Pitfalls

### Critical (blocks deployment or causes outages)

#### RL-C1: Webhook Endpoints Rate Limited (Blocks Stripe/SendGrid)

**What goes wrong:** Rate limiting applied globally catches webhook endpoints. Stripe retries with exponential backoff, but if limits persist, webhooks fail permanently. SendGrid drops events silently.

**Why it happens:** Webhook routes (`/api/webhooks/*`) are POST endpoints like any other API route. Generic middleware-based rate limiting doesn't distinguish between user requests and server-to-server webhooks.

**Warning signs:**
- Stripe webhook failures in Stripe dashboard
- Missing payment confirmations after successful checkout
- SendGrid events showing "dropped" status
- `WebhookEvent` table shows gaps in received events

**Prevention:**
```typescript
// In rate limiting middleware, EXEMPT webhook paths
const RATE_LIMIT_EXEMPT = [
  '/api/webhooks/stripe',
  '/api/webhooks/sendgrid/events',
  '/api/webhooks/clerk',
  '/api/webhooks/whatsapp',
  '/api/cron/*' // Vercel cron jobs have their own auth
];
```

**Phase:** SEC-05 (Rate Limiting) - implement from day one

**Sources:** [Stripe Webhooks Docs](https://docs.stripe.com/webhooks), [SendGrid Webhook Guide](https://inventivehq.com/blog/sendgrid-webhooks-guide)

---

#### RL-C2: Mobile App Blocked by IP-Based Rate Limits

**What goes wrong:** Mobile users share cellular carrier IPs (CGNAT). A single IP can represent thousands of legitimate users. IP-based rate limiting blocks entire carrier networks.

**Why it happens:** Pickleball Passport has a mobile app consuming the same tRPC API. Default rate limiting uses IP as the identifier. On mobile networks, many users share IPs.

**Warning signs:**
- Spike in 429 errors on mobile analytics
- Support tickets from mobile users about "can't load app"
- Upstash/Redis rate limit keys show very few unique IPs with high counts

**Prevention:**
```typescript
// Use Clerk userId as primary identifier, IP as fallback for unauthenticated
const identifier = ctx.userId || ctx.headers.get('x-forwarded-for');

// Different limits for authenticated vs unauthenticated
const limit = ctx.userId ? 100 : 10; // per window
```

**Phase:** SEC-05 (Rate Limiting) - design decision upfront

**Sources:** [API Rate Limiting 2026](https://www.levo.ai/resources/blogs/api-rate-limiting-guide-2026), [Mobile API Best Practices](https://dzone.com/articles/secure-apis-guide-to-authentication-rate-limiting-data-validation)

---

#### RL-C3: Serverless Instance Rate Limit State Not Shared

**What goes wrong:** In-memory rate limiting (using Map or local storage) doesn't work on Vercel. Each serverless instance has its own state. Under load, Vercel spins up new instances, each with fresh counters.

**Why it happens:** Vercel serverless functions are stateless. Rate limit state stored in function memory is per-instance, not global.

**Warning signs:**
- Rate limits seem to "reset" randomly
- Attackers bypass limits by sending requests quickly
- Load testing shows rate limits not working under concurrent load

**Prevention:**
```typescript
// MUST use external state store
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Ephemeral cache reduces Redis calls when function is "hot"
const cache = new Map();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  ephemeralCache: cache,
});
```

**Phase:** SEC-05 (Rate Limiting) - architecture decision

**Sources:** [Upstash Edge Rate Limiting](https://upstash.com/blog/edge-rate-limiting), [Next.js Rate Limiting Discussion](https://github.com/vercel/next.js/discussions/12134)

---

### Moderate (degrades user experience)

#### RL-M1: tRPC Batch Requests Count as Single Request

**What goes wrong:** tRPC's `httpBatchLink` combines multiple queries into single HTTP requests. Rate limiting the HTTP layer sees fewer requests than actual procedure calls. Attackers batch 50 expensive queries in one request.

**Why it happens:** The mobile app uses `httpBatchLink` for performance. Each HTTP POST to `/api/trpc` can contain multiple procedures.

**Warning signs:**
- Server CPU/DB load high but request counts low
- Slow response times on tRPC endpoints
- Single users make many procedure calls but only a few HTTP requests in logs

**Prevention:**
```typescript
// Option 1: Rate limit at tRPC procedure level using middleware
const rateLimitMiddleware = t.middleware(async ({ ctx, next, path }) => {
  const result = await ratelimit.limit(`${ctx.userId}:${path}`);
  if (!result.success) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
  }
  return next();
});

// Option 2: Limit batch size in tRPC configuration
// In tRPC route handler
const handler = fetchRequestHandler({
  ...,
  batching: { enabled: true, maxSize: 5 }, // Limit batch size
});
```

**Phase:** SEC-05 (Rate Limiting) - tRPC-specific configuration

**Sources:** [tRPC Rate Limiting Discussion](https://github.com/trpc/trpc/issues/3227), [trpc-limiter Package](https://github.com/OrJDev/trpc-limiter)

---

#### RL-M2: Middleware Execution Billing Overhead

**What goes wrong:** Rate limiting in Edge Middleware runs on EVERY request, including static assets, prefetches, and link hovers. On high-traffic sites, this explodes Edge Function invocations and costs.

**Why it happens:** Next.js App Router prefetches links. Users scrolling a page can trigger 20-30 middleware executions. Vercel bills per-invocation.

**Warning signs:**
- Vercel billing shows unexpectedly high Edge Function usage
- Middleware invocation count >> actual page views
- Users report hitting Vercel's free tier limits quickly

**Prevention:**
```typescript
// Configure middleware matcher to SKIP static assets and be selective
export const config = {
  matcher: [
    // Only run on API routes (skip static, images, etc.)
    '/api/:path*',
    // Or specific protected pages
    '/dashboard/:path*',
  ],
  // NEVER match _next, static files
};
```

**Phase:** SEC-05 (Rate Limiting) - middleware configuration

**Sources:** [Vercel Pricing Breakdown](https://flexprice.io/blog/vercel-pricing-breakdown), [Next.js CSP Issue #53928](https://github.com/vercel/next.js/issues/53928)

---

#### RL-M3: Rate Limit Headers Not Communicated to Mobile App

**What goes wrong:** Mobile app doesn't know its rate limit status. Users spam retry buttons when requests fail, making things worse. No graceful degradation.

**Why it happens:** Rate limiting returns 429 but mobile app doesn't parse `Retry-After` or `X-RateLimit-*` headers for user feedback.

**Warning signs:**
- Mobile crash analytics shows repeated 429 errors
- Users report "app not loading" during peak times
- No exponential backoff in mobile retry logic

**Prevention:**
```typescript
// Always return rate limit headers
const headers = {
  'X-RateLimit-Limit': String(result.limit),
  'X-RateLimit-Remaining': String(result.remaining),
  'X-RateLimit-Reset': String(result.reset),
  'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
};

// Mobile app should parse and respect
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  await delay(parseInt(retryAfter) * 1000);
}
```

**Phase:** SEC-05 (Rate Limiting) + mobile app update

---

### Minor (tech debt)

#### RL-m1: Different Limits for Same User on Web vs Mobile

**What goes wrong:** User authenticated on both web and mobile. Each client has separate rate limit counters, but the backend sees them as one user. Total load exceeds intended limits.

**Why it happens:** Rate limiting keyed on `userId` counts all devices together, but if keyed on `userId:clientType` they're separate.

**Prevention:** Decide on strategy upfront - typically combine all user traffic under one limit with higher threshold.

**Phase:** SEC-05 (Rate Limiting) - design decision

---

## CSRF Pitfalls

### Critical (security vulnerability)

#### CS-C1: Webhook Endpoints Reject Legitimate Traffic

**What goes wrong:** CSRF protection applied globally rejects Stripe/SendGrid webhooks. These are server-to-server calls without CSRF tokens, so they fail with 403.

**Why it happens:** Generic CSRF middleware checks all POST requests. Webhooks don't have browser-originated sessions or tokens.

**Warning signs:**
- All webhooks return 403 in production
- Stripe shows "endpoint returned 403" errors
- Payments succeed but confirmations don't arrive

**Prevention:**
```typescript
// Webhook routes use signature verification instead of CSRF
// Current implementation correctly uses:
// - Stripe: verifyWebhookSignature() with stripe-signature header
// - SendGrid: EventWebhook ECDSA signature verification

// Ensure CSRF middleware SKIPS these paths:
const CSRF_EXEMPT = ['/api/webhooks/*'];
```

**Phase:** SEC-06 (CSRF Protection) - critical exemption

**Sources:** [Stripe Webhook Security](https://docs.stripe.com/webhooks), [SendGrid Webhook Security](https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/getting-started-event-webhook-security-features)

---

#### CS-C2: Mobile App Blocked by CSRF (No Browser Cookies)

**What goes wrong:** CSRF protection relies on same-site cookies and origin headers. Mobile apps (React Native/Expo) don't have browser cookies. All mobile API calls fail.

**Why it happens:** The mobile app uses Bearer token auth via Clerk (`Authorization: Bearer ${token}`). CSRF patterns assume browser-based sessions.

**Warning signs:**
- All mobile API calls return 403 after CSRF enabled
- Web app works fine, mobile completely broken
- Clerk token is valid but requests rejected

**Prevention:**
```typescript
// CSRF protection should ONLY apply to cookie-based sessions
// Bearer token auth is CSRF-immune by design (token must be explicitly included)

// In CSRF middleware:
function shouldApplyCSRF(req: Request): boolean {
  // Skip if using Bearer token (mobile app)
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return false; // Token-based auth is CSRF-immune
  }

  // Apply CSRF for cookie-based sessions
  return true;
}
```

**Phase:** SEC-06 (CSRF Protection) - design decision

**Sources:** [CSRF Protection in Next.js](https://medium.com/@mmalishshrestha/implementing-csrf-protection-in-next-js-applications-9a29d137a12d)

---

#### CS-C3: tRPC Mutation Routes Vulnerable Without Custom Protection

**What goes wrong:** tRPC uses POST for all mutations. Next.js Server Actions have built-in CSRF protection (Origin/Host header check), but tRPC route handlers don't.

**Why it happens:** tRPC's `/api/trpc/[trpc]` is a custom route handler, not a Server Action. Manual CSRF protection required.

**Warning signs:**
- Security audit flags tRPC endpoints as CSRF-vulnerable
- Cross-origin POST requests to tRPC succeed (when they shouldn't)

**Prevention:**
```typescript
// Add Origin/Host check to tRPC handler
export async function POST(req: Request) {
  // For browser requests, verify origin
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');

  if (origin && !origin.includes(host)) {
    return new Response('CSRF check failed', { status: 403 });
  }

  return fetchRequestHandler({ ... });
}
```

**Phase:** SEC-06 (CSRF Protection) - tRPC-specific

**Sources:** [Next.js Security Guide](https://nextjs.org/blog/security-nextjs-server-components-actions)

---

### Moderate (requires manual handling)

#### CS-M1: SameSite Cookie Conflicts with Embedded Checkout

**What goes wrong:** If Stripe Checkout or other payment flows use iframes or redirects, SameSite=Strict cookies may not be sent back, breaking session continuity.

**Why it happens:** CSRF protection often involves SameSite=Strict cookies. Stripe Checkout redirects to stripe.com then back. The return redirect may not have session cookie.

**Warning signs:**
- Users logged out after Stripe redirect
- Payment succeeds but booking not linked to user
- Session cookie missing on success/cancel URL return

**Prevention:**
```typescript
// Use SameSite=Lax for session cookies (allows top-level navigation)
// Or handle authentication state via query params with signature
const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
// Verify session_id server-side instead of relying on cookie
```

**Phase:** SEC-06 (CSRF Protection) - payment flow testing

---

### Minor (cosmetic issues)

#### CS-m1: CSRF Token Endpoint Creates Noise in Logs

**What goes wrong:** CSRF token endpoint called frequently, cluttering access logs.

**Prevention:** Mark CSRF token endpoints with appropriate log levels.

**Phase:** SEC-06 (CSRF Protection) - logging configuration

---

## CSP Pitfalls

### Critical (breaks production site)

#### CSP-C1: Static Pages Break with Nonce-Based CSP

**What goes wrong:** Nonce-based CSP requires dynamic rendering. Statically generated pages don't have request context for nonces. Pages render without inline scripts working.

**Why it happens:** Next.js App Router defaults to static rendering. Nonces are generated per-request in middleware. Static pages built at deploy time don't have a request.

**Warning signs:**
- Production site shows blank pages or broken interactivity
- Console errors: "Refused to execute inline script"
- Works in `next dev` but breaks in `next build && next start`
- Hydration fails silently

**Prevention:**
```typescript
// Option 1: Force dynamic rendering on pages that need nonces
export const dynamic = 'force-dynamic';

// Option 2: Use experimental hash-based CSP (Next.js 13.5+)
// Allows static generation with SRI hashes instead of nonces
// experimental: { sri: { algorithm: 'sha256' } }

// Option 3: Accept 'unsafe-inline' for specific trusted patterns
// Less secure but allows static rendering
```

**Phase:** SEC-07 (Security Headers) - architecture decision

**Sources:** [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy), [CSP with App Router](https://0xdbe.github.io/NextJS-CSP-AppRouter/)

---

#### CSP-C2: Clerk Components Blocked by CSP

**What goes wrong:** Clerk's authentication UI components inject inline scripts and styles. Strict CSP blocks them, breaking sign-in/sign-up flows.

**Why it happens:** Clerk loads scripts from `clerk.com` domains and uses inline styles. CSP needs to explicitly allow these.

**Warning signs:**
- Sign-in modal doesn't render
- Console errors: "Refused to load the script 'https://clerk.com/...'"
- White screen on `/sign-in` page

**Prevention:**
```typescript
// CSP must include Clerk domains
const cspDirectives = {
  'script-src': ["'self'", 'https://*.clerk.com', 'https://*.clerk.dev'],
  'connect-src': ["'self'", 'https://*.clerk.com', 'https://*.clerk.dev'],
  'img-src': ["'self'", 'https://img.clerk.com'],
  'style-src': ["'self'", "'unsafe-inline'"], // Clerk uses inline styles
  'frame-src': ["'self'", 'https://*.clerk.com'],
  'worker-src': ["'self'", 'blob:'],
};

// Or use @arcjet/nosecone with Clerk preset
```

**Phase:** SEC-07 (Security Headers) - Clerk configuration

**Sources:** [Clerk CSP Headers](https://clerk.com/docs/guides/secure/best-practices/csp-headers)

---

#### CSP-C3: Stripe.js Blocked by CSP

**What goes wrong:** Stripe Elements/Checkout requires loading scripts from stripe.com. CSP blocks payment forms.

**Why it happens:** Stripe.js is loaded from external CDN. CSP needs to allow stripe.com domains for scripts, frames, and connections.

**Warning signs:**
- Payment form doesn't render
- Stripe Elements show loading forever
- Console: "Refused to frame 'https://js.stripe.com'"

**Prevention:**
```typescript
const cspDirectives = {
  'script-src': ["'self'", 'https://js.stripe.com'],
  'frame-src': ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
  'connect-src': ["'self'", 'https://api.stripe.com'],
  'img-src': ["'self'", 'https://*.stripe.com'],
};
```

**Phase:** SEC-07 (Security Headers) - payment integration

**Sources:** [Next.js CSP with Stripe](https://github.com/vercel/next.js/discussions/49348)

---

#### CSP-C4: CVE-2025-29927 Middleware Bypass

**What goes wrong:** CSP headers set via middleware can be bypassed entirely. Attackers add `x-middleware-subrequest` header to skip middleware execution.

**Why it happens:** Critical vulnerability in Next.js disclosed March 2025. Affects versions 11.1.4 through 14.2.25 and 15.x before 15.2.3.

**Warning signs:**
- Security scanner flags CVE-2025-29927
- CSP headers missing on some requests
- Security headers inconsistent

**Prevention:**
```bash
# MUST upgrade Next.js to patched version
npm install next@^15.2.3  # or 14.2.25+

# Verify version in package.json
# Current project: Next.js 16.1.1 - SAFE
```

**Phase:** SEC-07 (Security Headers) - prerequisite check

**Sources:** [CVE-2025-29927 Analysis](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass)

---

### Moderate (breaks specific features)

#### CSP-M1: Analytics and Tracking Scripts Blocked

**What goes wrong:** Google Analytics, Vercel Analytics, or other tracking scripts blocked. No analytics data collected.

**Why it happens:** Third-party analytics load external scripts not in CSP allowlist.

**Warning signs:**
- Analytics dashboard shows zero traffic
- Console: "Refused to load the script"

**Prevention:**
```typescript
// Add analytics domains to CSP
const cspDirectives = {
  'script-src': [
    "'self'",
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://va.vercel-scripts.com', // Vercel Analytics
  ],
  'connect-src': [
    "'self'",
    'https://www.google-analytics.com',
    'https://vitals.vercel-insights.com',
  ],
};
```

**Phase:** SEC-07 (Security Headers) - analytics configuration

---

#### CSP-M2: Image Uploads Preview Broken by img-src

**What goes wrong:** Supabase Storage image previews blocked. Users can't see uploaded images.

**Why it happens:** `img-src` doesn't include Supabase Storage domain.

**Warning signs:**
- Uploaded images show broken image icon
- Profile pictures don't display
- Console: "Refused to load the image"

**Prevention:**
```typescript
const cspDirectives = {
  'img-src': [
    "'self'",
    'data:', // For base64 inline images
    'blob:', // For local file previews
    `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co`,
  ],
};
```

**Phase:** SEC-07 (Security Headers) - storage integration

---

#### CSP-M3: Vercel Toolbar Breaks with Strict CSP

**What goes wrong:** Vercel's development toolbar (Comments, Analytics preview) doesn't work with strict CSP.

**Why it happens:** Vercel Toolbar injects scripts that don't have nonces.

**Warning signs:**
- Toolbar doesn't appear in preview deployments
- Comments feature broken
- Errors in console about Vercel scripts

**Prevention:**
```typescript
// Only apply strict CSP in production
const isProduction = process.env.NODE_ENV === 'production'
  && !process.env.VERCEL_ENV?.includes('preview');

if (!isProduction) {
  // Relaxed CSP for preview/development
}
```

**Phase:** SEC-07 (Security Headers) - deployment-aware configuration

**Sources:** [Vercel Toolbar CSP Discussion](https://community.vercel.com/t/vercel-toolbar-with-strict-csp-follow-up/1768)

---

#### CSP-M4: Report-Only Mode Not Tested Before Enforcement

**What goes wrong:** CSP deployed in enforcement mode immediately. Unknown violations break features.

**Why it happens:** Skipping report-only testing phase.

**Warning signs:**
- Production breakage on deploy
- Features that worked in development fail in production
- No visibility into what would break

**Prevention:**
```typescript
// Deploy in report-only mode first
'Content-Security-Policy-Report-Only': cspString,

// Set up reporting endpoint
'report-uri': '/api/csp-reports',
'report-to': 'csp-endpoint',

// Monitor for 1-2 weeks before enforcing
```

**Phase:** SEC-07 (Security Headers) - deployment strategy

---

### Minor (cosmetic or edge cases)

#### CSP-m1: WebSocket Connections Blocked

**What goes wrong:** Real-time features using WebSocket fail. Supabase Realtime or similar blocked.

**Prevention:** Add `wss://` to `connect-src`.

**Phase:** SEC-07 (Security Headers) - if using realtime features

---

#### CSP-m2: PDF Generation Fails with Strict CSP

**What goes wrong:** PDF receipt generation may use canvas or other features that conflict with CSP.

**Prevention:** Test PDF generation with CSP enabled. May need to adjust or run PDF generation server-side only.

**Phase:** SEC-07 (Security Headers) - PDF feature testing

---

## Cross-Cutting Pitfalls

### CC-C1: Middleware Order Conflicts (Rate Limit + CSP + Clerk)

**What goes wrong:** Next.js has single middleware file. Clerk middleware, rate limiting, and CSP nonce generation conflict or execute in wrong order.

**Why it happens:** All security features need middleware. Order matters. Clerk must run before rate limiting (to get userId). CSP nonce must be generated before response headers are set.

**Warning signs:**
- `auth()` returns null in rate limiting code
- CSP headers overwritten
- Middleware timeout under load

**Prevention:**
```typescript
// Single middleware.ts with explicit ordering
export default clerkMiddleware(async (auth, request) => {
  // 1. Generate CSP nonce first
  const nonce = crypto.randomUUID();

  // 2. Rate limiting (needs userId from Clerk)
  const { userId } = await auth();
  const identifier = userId || request.ip;
  const rateLimitResult = await ratelimit.limit(identifier);

  if (!rateLimitResult.success) {
    return new Response('Rate limited', {
      status: 429,
      headers: { 'Retry-After': '60' }
    });
  }

  // 3. Continue with CSP headers
  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', `... 'nonce-${nonce}' ...`);
  response.headers.set('x-nonce', nonce);

  return response;
});
```

**Phase:** All phases - architecture upfront

---

### CC-C2: Environment-Specific Security Bypasses

**What goes wrong:** Security disabled in development but not re-enabled for production. Or production config tested only in staging.

**Why it happens:** Different NODE_ENV, VERCEL_ENV values. Easy to misconfigure.

**Warning signs:**
- Security headers missing in production
- Rate limiting works locally, not in prod
- Staging works, production doesn't

**Prevention:**
```typescript
// Explicit environment checks
const isProduction =
  process.env.NODE_ENV === 'production' &&
  process.env.VERCEL_ENV === 'production';

// Always apply in production, optionally in others
const shouldEnforce = isProduction || process.env.FORCE_SECURITY === 'true';
```

**Phase:** All phases - deployment testing

---

## Pitfall Summary

| ID | Pitfall | Severity | Phase | Prevention |
|-----|---------|----------|-------|------------|
| RL-C1 | Webhooks rate limited | Critical | SEC-05 | Exempt webhook paths |
| RL-C2 | Mobile blocked by IP limits | Critical | SEC-05 | Use userId + fallback IP |
| RL-C3 | Instance state not shared | Critical | SEC-05 | Use Upstash Redis |
| RL-M1 | tRPC batch bypasses limits | Moderate | SEC-05 | Limit at procedure level |
| RL-M2 | Middleware billing overhead | Moderate | SEC-05 | Selective matcher config |
| RL-M3 | No rate limit headers for mobile | Moderate | SEC-05 | Return X-RateLimit headers |
| CS-C1 | Webhooks rejected by CSRF | Critical | SEC-06 | Exempt + use signature verification |
| CS-C2 | Mobile blocked (no cookies) | Critical | SEC-06 | Skip CSRF for Bearer auth |
| CS-C3 | tRPC vulnerable without protection | Critical | SEC-06 | Add Origin/Host check |
| CS-M1 | SameSite breaks payment redirect | Moderate | SEC-06 | Use Lax + session_id verification |
| CSP-C1 | Static pages break with nonce | Critical | SEC-07 | Force dynamic or use hashes |
| CSP-C2 | Clerk blocked by CSP | Critical | SEC-07 | Add Clerk domains |
| CSP-C3 | Stripe blocked by CSP | Critical | SEC-07 | Add Stripe domains |
| CSP-C4 | CVE-2025-29927 bypass | Critical | SEC-07 | Upgrade Next.js to 15.2.3+ |
| CSP-M1 | Analytics blocked | Moderate | SEC-07 | Add analytics domains |
| CSP-M2 | Image uploads blocked | Moderate | SEC-07 | Add Supabase Storage domain |
| CSP-M3 | Vercel Toolbar breaks | Moderate | SEC-07 | Environment-aware CSP |
| CSP-M4 | No report-only testing | Moderate | SEC-07 | Deploy report-only first |
| CC-C1 | Middleware order conflicts | Critical | All | Single file, explicit order |
| CC-C2 | Environment bypass | Critical | All | Explicit env checks |

---

## Project-Specific Integration Notes

Based on analysis of the current Pickleball Passport codebase:

### Current Middleware Structure (`middleware.ts`)
The existing Clerk middleware already handles authentication. Rate limiting and CSP must be integrated INTO this existing structure, not as separate middleware files.

### Webhook Endpoints to Exempt
From current codebase:
- `/api/webhooks/stripe` - Stripe payments (uses signature verification)
- `/api/webhooks/sendgrid/events` - Email events (uses ECDSA signature)
- `/api/webhooks/clerk` - User sync
- `/api/webhooks/whatsapp` - WhatsApp messaging
- `/api/cron/*` - Vercel cron jobs (have their own auth via CRON_SECRET)

### tRPC Configuration (`/api/trpc/[trpc]/route.ts`)
Current handler uses `fetchRequestHandler`. CSRF protection and rate limiting should be added here for mutations.

### Mobile App (`mobile/lib/trpc.ts`)
Uses Bearer token authentication via `httpBatchLink`. CSRF should NOT apply to these requests.

---

## Sources

### Rate Limiting
- [Upstash Edge Rate Limiting](https://upstash.com/blog/edge-rate-limiting) - Vercel + Upstash integration patterns
- [Next.js Rate Limiting Discussion #12134](https://github.com/vercel/next.js/discussions/12134) - Community patterns
- [trpc-limiter Package](https://github.com/OrJDev/trpc-limiter) - tRPC-specific rate limiting
- [API Rate Limiting 2026](https://www.levo.ai/resources/blogs/api-rate-limiting-guide-2026) - Mobile/IP considerations
- [Vercel Pricing Breakdown](https://flexprice.io/blog/vercel-pricing-breakdown) - Middleware billing

### CSRF Protection
- [Next.js Security Guide](https://nextjs.org/blog/security-nextjs-server-components-actions) - Server Actions CSRF
- [CSRF Protection in Next.js](https://medium.com/@mmalishshrestha/implementing-csrf-protection-in-next-js-applications-9a29d137a12d) - Implementation patterns
- [Stripe Webhooks Docs](https://docs.stripe.com/webhooks) - Signature verification
- [SendGrid Webhook Security](https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/getting-started-event-webhook-security-features) - ECDSA verification

### CSP Headers
- [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy) - Official documentation
- [Clerk CSP Headers](https://clerk.com/docs/guides/secure/best-practices/csp-headers) - Clerk-specific config
- [CVE-2025-29927 Analysis](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) - Middleware bypass vulnerability
- [CSP with App Router](https://0xdbe.github.io/NextJS-CSP-AppRouter/) - Static vs dynamic rendering
- [@next-safe/middleware](https://next-safe-middleware.vercel.app/) - Strict CSP implementation
- [Vercel Toolbar CSP](https://community.vercel.com/t/vercel-toolbar-with-strict-csp-follow-up/1768) - Preview environment handling
