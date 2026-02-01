# Features Research: API Security

**Domain:** Luxury travel booking platform (Pickleball Passport)
**Researched:** 2026-02-01
**Focus Areas:** Rate Limiting, CSRF Protection, Content Security Policy

---

## Rate Limiting Features

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Per-user rate limiting on authenticated endpoints** | Prevents individual users from overwhelming the system; industry standard for booking APIs | Medium | Use Clerk user ID as identifier. Upstash Ratelimit with sliding window recommended. |
| **Per-IP rate limiting on public/unauthenticated endpoints** | Protects login, newsletter signup, contact forms from abuse | Low | Fallback for anonymous users. Use `x-forwarded-for` header parsing. |
| **Payment endpoint protection** | Critical for Stripe integration; prevents payment abuse and charge-back attacks | Medium | Stricter limits (e.g., 5 payment attempts per minute per user). |
| **429 Too Many Requests response with Retry-After header** | HTTP standard; required for proper client behavior | Low | Include `Retry-After` header so clients/mobile apps know when to retry. |
| **Login/auth endpoint protection** | Prevents brute force attacks on authentication | Medium | Stricter limits than general API (e.g., 5 failed attempts per 15 minutes). |
| **Graceful degradation (fail-open option)** | If Redis is down, API should still function | Low | Stripe engineering pattern: catch exceptions, fail open, don't break production. |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Tiered rate limits by user role** | Partners and admins may need higher limits for bulk operations | Medium | Guest: 60 req/min, Partner: 120 req/min, Admin: 300 req/min |
| **Endpoint-specific limits** | Search/browse can be generous; mutations should be stricter | Medium | Read: 100 req/min, Write: 30 req/min, Payment: 5 req/min |
| **Rate limit analytics dashboard** | Visibility into who's hitting limits, potential abuse patterns | High | Upstash provides built-in analytics; Unkey offers namespace-based tracking. |
| **Webhook processing rate control** | Prevent Stripe webhook floods from overwhelming your API | Medium | Cap at 90 events/sec to stay under Stripe's 100 req/sec fetch limit. |
| **Request queuing for exceeded limits** | Better UX than hard rejection; queue and process when limit resets | High | Use Redis or SQS for queue; FIFO processing with timestamps. |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Global IP rate limiting as primary defense** | Mobile users share IPs (carrier NAT); causes false positives | Use user-based limiting for authenticated endpoints; IP-based only for anonymous. |
| **Complex multi-algorithm rate limiting** | Over-engineering; sliding window covers 90% of use cases | Start with sliding window algorithm. Add token bucket only if specific burst needs arise. |
| **Client-side rate limit enforcement only** | Easily bypassed; provides no real protection | Always enforce server-side. Client-side is UX sugar only. |
| **Aggressive rate limits on read operations** | Hurts legitimate browsing; travel apps are naturally browse-heavy | Be generous with reads (100+/min); strict only on mutations. |
| **Custom rate limiting implementation** | Reinventing the wheel; security-critical code prone to bugs | Use battle-tested libraries: Upstash Ratelimit, Unkey, or trpc-limiter. |

---

## CSRF Protection Features

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **SameSite cookie configuration** | Modern browser standard; Clerk handles this automatically with `Lax` setting | None | Already provided by Clerk. Verify cookies have `SameSite=Lax` attribute. |
| **Origin/Host header validation for Server Actions** | Next.js App Router validates this automatically for Server Actions | None | Built-in to Next.js. Verify you're on Next.js 15.2.3+ (CVE-2025-29927 patch). |
| **State-changing operations require POST** | Standard HTTP semantics; GET requests should never mutate data | Low | Audit all tRPC mutations use POST method (tRPC default). |
| **No mutations on navigation** | Clerk best practice: "navigation alone should never trigger a mutation" | Low | Review that no links trigger backend changes without user confirmation. |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Custom CSRF tokens for API routes** | Extra protection for non-Server-Action routes (e.g., webhook endpoints) | Medium | Use `@edge-csrf/nextjs` for custom route handlers that aren't tRPC. |
| **Double-submit cookie pattern for mobile app** | Mobile apps using token auth benefit from additional CSRF layer | Medium | Send CSRF token in header AND cookie; validate both match. |
| **Origin allowlist for partner integrations** | Support legitimate cross-origin requests from known partners | Low | Maintain explicit allowlist rather than wildcard CORS. |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Manual CSRF token implementation for all routes** | Unnecessary when using Clerk + Next.js App Router; adds maintenance burden | Trust Clerk's SameSite cookies + Next.js Origin validation for standard flows. |
| **Disabling SameSite for "better UX"** | Breaks core CSRF protection for marginal convenience gains | Keep `SameSite=Lax`. Educate users on why re-login after external links is rare. |
| **CSRF tokens stored in localStorage** | Vulnerable to XSS; defeats purpose of CSRF protection | Store in httpOnly cookie or server session. |
| **Ignoring Server Actions CSRF for tRPC** | tRPC runs via API routes, not Server Actions; different CSRF model | Understand that tRPC uses POST + Clerk cookies, which provides protection. |

---

## CSP (Content Security Policy) Features

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Script-src whitelist for Stripe** | Required for Stripe.js to function | Medium | `https://js.stripe.com`, `https://*.js.stripe.com` |
| **Frame-src for Stripe 3D Secure** | Required for payment verification flows | Low | `https://js.stripe.com`, `https://hooks.stripe.com` |
| **Connect-src for Stripe API** | Required for Stripe API calls | Low | `https://api.stripe.com`, `https://checkout.stripe.com` |
| **Clerk domains in CSP** | Required for Clerk authentication | Medium | FAPI hostname, `https://challenges.cloudflare.com`, `https://img.clerk.com` |
| **Worker-src for Stripe web workers** | Stripe.js uses web workers for performance | Low | `'self'`, `blob:` |
| **img-src for Stripe/Clerk assets** | Required for logos, verification images | Low | `https://*.stripe.com`, `https://img.clerk.com` |

### Required CSP Directive Summary

```
default-src 'self';
script-src 'self' https://js.stripe.com https://*.js.stripe.com https://checkout.stripe.com https://clerk.your-domain.com https://challenges.cloudflare.com;
connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://clerk.your-domain.com;
frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://challenges.cloudflare.com;
img-src 'self' https://*.stripe.com https://img.clerk.com data:;
worker-src 'self' blob:;
style-src 'self' 'unsafe-inline';
```

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Nonce-based strict CSP** | Maximum XSS protection; blocks all inline scripts except nonced | High | Requires dynamic rendering in Next.js. Use middleware to generate nonces per-request. |
| **CSP violation reporting** | Visibility into blocked resources, potential attacks | Medium | `report-uri` or `report-to` directive pointing to logging service. |
| **Environment-specific CSP** | Stricter in production, relaxed in development | Low | Allow `'unsafe-eval'` in dev for Next.js hot reload; remove in prod. |
| **Google Pay CSP directives** | Support Google Pay as payment method | Low | Add `https://pay.google.com` to frame-src, script-src, and `https://www.gstatic.com` to img-src. |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **`'unsafe-inline'` in script-src** | Defeats purpose of CSP; allows XSS payloads to execute | Use nonces or hashes. Only `'unsafe-inline'` in style-src where Clerk requires it. |
| **`'unsafe-eval'` in production** | Allows eval() attacks; only needed for dev hot reload | Remove from production CSP; verify no dependencies require eval(). |
| **Wildcard `*` in any directive** | No protection; allows any domain | Explicitly list required domains. |
| **CSP via meta tag only** | Limited directive support; can be bypassed in some scenarios | Always use HTTP header. Meta tag as fallback only. |
| **Overly strict CSP that breaks Stripe** | Broken payments = no revenue | Test thoroughly in staging. Stripe needs specific domains. |
| **Nonce-based CSP for static marketing pages** | Forces dynamic rendering for pages that should be cached | Use hash-based CSP or relaxed policy for purely static public pages. |

---

## Feature Summary

| Feature | Category | Complexity | Mobile App Compatible | Dependencies |
|---------|----------|------------|----------------------|--------------|
| Per-user rate limiting (authenticated) | Table Stakes | Medium | Yes | Upstash Redis, Clerk user ID |
| Per-IP rate limiting (unauthenticated) | Table Stakes | Low | Yes | Upstash Redis |
| Payment endpoint protection | Table Stakes | Medium | Yes | Rate limiter |
| 429 response with Retry-After | Table Stakes | Low | Yes | Rate limiter |
| Login endpoint protection | Table Stakes | Medium | Yes | Rate limiter |
| SameSite cookies (Clerk) | Table Stakes | None | N/A (web only) | Clerk (already configured) |
| Origin validation (Next.js) | Table Stakes | None | N/A (web only) | Next.js 15.2.3+ |
| Stripe CSP directives | Table Stakes | Medium | N/A (web only) | Next.js middleware |
| Clerk CSP directives | Table Stakes | Medium | N/A (web only) | Next.js middleware |
| Tiered rate limits by role | Differentiator | Medium | Yes | Role middleware exists |
| Endpoint-specific limits | Differentiator | Medium | Yes | Rate limiter |
| Rate limit analytics | Differentiator | High | N/A | Upstash/Unkey dashboard |
| Nonce-based strict CSP | Differentiator | High | N/A (web only) | Dynamic rendering |
| CSP violation reporting | Differentiator | Medium | N/A (web only) | Logging service |

---

## Implementation Dependencies on Existing Features

### Already Built (from project context)
- Clerk authentication with role-based procedures (`adminProcedure`, `partnerProcedure`, `guestProcedure`)
- tRPC middleware system (`lib/trpc/server/trpc.ts`)
- Stripe payment integration
- Mobile app consuming same API

### New Infrastructure Needed
- **Upstash Redis** - For distributed rate limiting (serverless-compatible)
- **Rate limit middleware** - tRPC middleware using `@upstash/ratelimit` or `trpc-limiter`
- **CSP middleware** - Next.js middleware for header injection

### Mobile App Considerations
- Rate limiting should use user ID (not IP) for authenticated mobile requests
- Mobile apps using token-based auth still benefit from rate limiting
- CSRF protection is less relevant for mobile (no cookies in same-origin sense)
- CSP does not apply to mobile apps (native views don't enforce CSP)
- Mobile should handle 429 responses gracefully with exponential backoff

---

## Recommended Implementation Order

1. **Rate Limiting (Priority 1)** - Most impactful security improvement
   - Start with payment and auth endpoints
   - Add general API rate limiting
   - Implement role-based tiers

2. **CSP (Priority 2)** - Required for XSS protection
   - Start with permissive policy that allows Stripe/Clerk
   - Test thoroughly in staging
   - Gradually tighten

3. **CSRF Validation (Priority 3)** - Mostly already handled
   - Verify Clerk cookie settings
   - Upgrade Next.js if below 15.2.3
   - Audit for navigation-triggered mutations

---

## Sources

### Rate Limiting
- [Zuplo: 10 Best Practices for API Rate Limiting in 2025](https://zuplo.com/learning-center/10-best-practices-for-api-rate-limiting-in-2025)
- [Cloudflare: Rate Limiting Best Practices](https://developers.cloudflare.com/waf/rate-limiting-rules/best-practices/)
- [Booking.com: Demand API Rate Limiting](https://developers.booking.com/demand/docs/development-guide/rate-limiting)
- [Stripe: Rate Limits Documentation](https://docs.stripe.com/rate-limits)
- [Stripe Dev Blog: Rate-Limit Friendly Pattern for Webhooks](https://stripe.dev/blog/stay-within-limits-api-rate-limit-friendly-pattern-for-stripe-webhooks)
- [Upstash: Rate Limiting Next.js API Routes](https://upstash.com/blog/nextjs-ratelimiting)
- [Unkey: How to Ratelimit tRPC Routes](https://www.unkey.com/blog/ratelimit-trpc-routes)
- [trpc-limiter GitHub](https://github.com/OrJDev/trpc-limiter)

### CSRF Protection
- [Clerk: CSRF Protection Best Practices](https://clerk.com/docs/guides/secure/best-practices/csrf-protection)
- [OWASP: Cross-Site Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Next.js: How to Think About Security](https://nextjs.org/blog/security-nextjs-server-components-actions)
- [Medium: Modern CSRF Mitigation in SPAs](https://medium.com/tresorit-engineering/modern-csrf-mitigation-in-single-page-applications-695bcb538eec)

### Content Security Policy
- [Next.js: Content Security Policy Guide](https://nextjs.org/docs/app/guides/content-security-policy)
- [Stripe: Integration Security Guide](https://docs.stripe.com/security/guide) - HIGH confidence (official)
- [Clerk: CSP Headers Configuration](https://clerk.com/docs/guides/secure/best-practices/csp-headers) - HIGH confidence (official)
- [web.dev: Strict CSP with Nonces](https://web.dev/articles/strict-csp)
- [GitHub: Stripe CSP Issue Discussion](https://github.com/stripe/stripe-js/issues/127)
- [CSPLite: Stripe CSP Rules](https://csplite.com/csp/svc155/)

### Travel/Booking Industry
- [Booking.com: Connectivity APIs](https://developers.booking.com/connectivity/docs)
- [TechTarget: API Rate Limiting for Attack Surface Reduction](https://www.techtarget.com/searchsecurity/feature/Implement-API-rate-limiting-to-reduce-attack-surfaces)
