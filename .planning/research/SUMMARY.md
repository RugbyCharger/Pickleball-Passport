# Project Research Summary

**Project:** Pickleball Passport API Security (v2.3)
**Domain:** API Security for Next.js + tRPC + Vercel
**Researched:** 2026-02-01
**Confidence:** HIGH

---

## Executive Summary

This milestone (SEC-05, SEC-06, SEC-07) requires zero new dependencies. The Pickleball Passport codebase already has Upstash Redis and rate limiting infrastructure at `lib/rate-limit/index.ts`, tRPC v11.8.1 with built-in Content-Type CSRF protection, and Clerk v6.36.5 with CSP configuration support. The work is primarily configuration and extension of existing patterns rather than new architecture.

The research reveals a critical theme: **webhook and mobile app compatibility must be designed in from the start**. All three features (rate limiting, CSRF, CSP) share the same pitfall pattern - they work correctly for browser-based web traffic but can break webhooks (Stripe, SendGrid, Clerk) and the mobile app if applied naively. The solution is consistent: exempt webhook paths, use userId (not IP) as the primary identifier for authenticated traffic, and skip cookie-based CSRF checks for Bearer token auth.

The recommended build order is SEC-05 (rate limiting) first because it extends existing infrastructure and provides immediate abuse protection. SEC-06 (CSRF) second because tRPC already provides the core protection - this is mostly verification and defense-in-depth. SEC-07 (CSP) third because it requires the most testing and iteration, and benefits from having the other security layers stable.

---

## Key Findings

### Recommended Stack

| Component | Action | Notes |
|-----------|--------|-------|
| **@upstash/ratelimit** 2.0.8 | Configure (already installed) | Extend to cover remaining public endpoints |
| **@upstash/redis** 1.36.1 | Configure (already installed) | Already used for newsletter, contact, ticket status |
| **tRPC** 11.8.1 | Verify (built-in CSRF) | Content-Type validation active by default since v11 |
| **@clerk/nextjs** 6.36.5 | Configure (CSP support) | `contentSecurityPolicy` option in `clerkMiddleware()` |
| **Next.js** 16.1.1 | Safe (CVE-2025-29927 patched) | No upgrade needed |

**Zero new dependencies required.** This is a configuration-focused milestone.

---

### Expected Features

#### Table Stakes (Must Have)

| Feature | Source | Implementation |
|---------|--------|----------------|
| Per-user rate limiting (authenticated) | FEATURES | Use Clerk userId, not just IP |
| Per-IP rate limiting (unauthenticated) | FEATURES | Fallback for anonymous users |
| Payment endpoint protection | FEATURES | 5 req/min per user |
| 429 response with Retry-After header | FEATURES | Required for mobile app retry logic |
| Webhook exemptions from rate limiting | PITFALLS | Stripe, SendGrid, Clerk, WhatsApp paths |
| SameSite=Lax cookies | FEATURES | Already provided by Clerk |
| Origin/Host header validation | ARCHITECTURE | Add to middleware for mutations |
| tRPC Content-Type enforcement | STACK | Already active in tRPC v11.8.1 |
| Stripe CSP directives | FEATURES | js.stripe.com, api.stripe.com, hooks.stripe.com |
| Clerk CSP directives | FEATURES | *.clerk.com, img.clerk.com, challenges.cloudflare.com |

#### Differentiators (Nice to Have)

| Feature | Value | Complexity | Recommendation |
|---------|-------|------------|----------------|
| Tiered rate limits by role | Partners get higher limits | Medium | Phase 2 if needed |
| Rate limit analytics | Visibility into abuse patterns | Low | Upstash provides built-in |
| CSP violation reporting | Monitor blocked resources | Medium | Add after initial CSP stable |
| Nonce-based strict CSP | Maximum XSS protection | High | Defer - impacts static rendering |

#### Anti-Features (Do Not Build)

| Anti-Feature | Why Avoid |
|--------------|-----------|
| Token-based CSRF for tRPC | Unnecessary - Content-Type check sufficient |
| IP-only rate limiting | Breaks mobile app (carrier NAT) |
| In-memory rate limit state | Doesn't work on Vercel serverless |
| Global IP rate limiting as primary | Causes false positives |
| Nonce-based CSP for static pages | Forces dynamic rendering everywhere |
| `helmet` or Express-based libs | Not compatible with Next.js App Router |

---

### Architecture Approach

The security layers integrate into the existing middleware structure:

```
Request Flow:
1. Edge Middleware (middleware.ts)
   - Global rate limit (100 req/min per IP)
   - Origin validation for POST/PUT/DELETE
   - Clerk auth (existing)

2. tRPC Handler (app/api/trpc/[trpc]/route.ts)
   - Content-Type validation (built-in)
   - Per-procedure rate limits via middleware

3. Response Headers (next.config.ts or middleware)
   - CSP, X-Frame-Options, X-Content-Type-Options
```

**Key architectural decisions:**

1. **Single middleware.ts file** - All security in one place, explicit order: rate limit -> origin check -> Clerk auth
2. **Hybrid rate limiting** - Edge middleware for global protection, tRPC middleware for per-procedure limits
3. **Static CSP first** - Use next.config.ts headers, not nonce-based (preserves static rendering)
4. **Bearer token exemption** - Mobile app using Bearer auth is CSRF-immune, skip those checks

---

### Critical Pitfalls

| ID | Pitfall | Severity | Prevention |
|----|---------|----------|------------|
| **RL-C1** | Webhooks rate limited | Critical | Exempt `/api/webhooks/*`, `/api/cron/*` from rate limiting |
| **RL-C2** | Mobile blocked by IP limits | Critical | Use userId as primary identifier, IP only for unauthenticated |
| **CS-C2** | Mobile blocked by CSRF | Critical | Skip CSRF checks for `Authorization: Bearer` requests |
| **CSP-C2** | Clerk blocked by CSP | Critical | Add `*.clerk.com`, `challenges.cloudflare.com` to CSP |
| **CSP-C3** | Stripe blocked by CSP | Critical | Add `js.stripe.com`, `api.stripe.com`, `hooks.stripe.com` to CSP |

**Common theme:** All critical pitfalls involve the security features correctly protecting web traffic but breaking webhooks or mobile. Design exemptions from day one.

---

## Implications for Roadmap

### Suggested Phase Structure

**Phase 1: SEC-05 Rate Limiting** (Priority: Highest)

- **Rationale:** Infrastructure exists, extends existing patterns, provides immediate abuse protection
- **Delivers:** DDoS protection, endpoint-specific limits, mobile-friendly user-based limits
- **Key tasks:**
  1. Add global rate limit to middleware.ts (exempt webhook paths)
  2. Create tRPC rate limit middleware (reuse lib/rate-limit)
  3. Apply to remaining public procedures (newsletter.confirm, newsletter.unsubscribe, etc.)
  4. Add X-RateLimit-* response headers
- **Pitfalls to avoid:** RL-C1 (webhooks), RL-C2 (mobile IPs), RL-M1 (tRPC batching)
- **Research needed:** None - well-documented patterns, existing infrastructure

**Phase 2: SEC-06 CSRF Protection** (Priority: Medium)

- **Rationale:** Mostly verification - tRPC v11 already provides protection, add defense-in-depth
- **Delivers:** Origin validation, Content-Type enforcement, documented security model
- **Key tasks:**
  1. Verify tRPC Content-Type validation is active (test with curl)
  2. Add Origin header validation to middleware for mutations
  3. Document which endpoints are protected and why
  4. Test mobile app still works (Bearer token flow)
- **Pitfalls to avoid:** CS-C1 (webhooks), CS-C2 (mobile), CS-M1 (Stripe redirects)
- **Research needed:** None - standard patterns

**Phase 3: SEC-07 CSP Headers** (Priority: Medium)

- **Rationale:** Requires most iteration, benefits from stable middleware, affects all pages
- **Delivers:** XSS protection, third-party script allowlisting, security headers
- **Key tasks:**
  1. Audit all third-party resources (Clerk, Stripe, reCAPTCHA, Supabase, analytics)
  2. Implement static CSP in next.config.ts
  3. Deploy to staging with Content-Security-Policy-Report-Only first
  4. Add supplementary headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
  5. Iterate based on CSP violations
- **Pitfalls to avoid:** CSP-C1 (static pages), CSP-C2 (Clerk), CSP-C3 (Stripe), CSP-M4 (no report-only)
- **Research needed:** None - official docs comprehensive

### Research Flags

| Phase | Research Needed |
|-------|-----------------|
| SEC-05 Rate Limiting | No - Upstash docs comprehensive, existing lib/rate-limit provides patterns |
| SEC-06 CSRF Protection | No - tRPC built-in, Origin validation is standard |
| SEC-07 CSP Headers | No - Clerk and Stripe docs provide exact directives needed |

**All phases have well-documented patterns.** The research phase has surfaced all necessary implementation details.

### Dependencies Between Phases

```
SEC-05 -----> SEC-06
  |             |
  |  (can overlap if careful - separate middleware concerns)
  |             |
  +-----> SEC-07 (independent, can run in parallel with SEC-06)
```

- SEC-05 and SEC-06 both modify middleware.ts - coordinate to avoid merge conflicts
- SEC-07 is fully independent (uses next.config.ts headers)
- Recommend: SEC-05 first (foundation), then SEC-06 + SEC-07 in parallel

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | All packages already installed, versions verified against npm registry |
| **Features** | HIGH | Clear table stakes from Clerk, Stripe, OWASP docs |
| **Architecture** | HIGH | Existing middleware pattern verified, tRPC Context already exposes headers |
| **Pitfalls** | HIGH | Comprehensive list with project-specific integration notes |
| **Mobile compatibility** | HIGH | Bearer token flow verified in mobile/lib/trpc.ts |
| **Build order** | HIGH | Clear dependency analysis, no circular dependencies |

### Gaps to Address During Planning

1. **Exact CSP directives for reCAPTCHA** - Need to test which Google domains are needed
2. **Supabase Storage domain** - Confirm project ref for img-src directive
3. **Rate limit thresholds** - Current limits (5/min newsletter, 3/min contact) may need tuning based on production traffic
4. **Mobile app retry handling** - Need to update mobile app to respect Retry-After header (out of scope for API security, but flagged)

---

## Sources

### Official Documentation (HIGH confidence)
- [Upstash Ratelimit Documentation](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [tRPC CSRF PR #5526](https://github.com/trpc/trpc/pull/5526)
- [Clerk CSP Headers](https://clerk.com/docs/guides/secure/best-practices/csp-headers)
- [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy)
- [Stripe Integration Security](https://docs.stripe.com/security/guide)

### Community Patterns (MEDIUM confidence)
- [Upstash Edge Rate Limiting Blog](https://upstash.com/blog/edge-rate-limiting)
- [trpc-limiter Package](https://github.com/OrJDev/trpc-limiter)
- [CVE-2025-29927 Analysis](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass)

### Verified Package Versions (npm registry 2026-02-01)
- @upstash/ratelimit: 2.0.8 (current)
- @upstash/redis: 1.36.1 (current)
- @clerk/nextjs: 6.36.5 (project has 6.36.5)
- Next.js: 16.1.1 (project version, CVE patched)

---

**Research completed:** 2026-02-01
**Ready for roadmap:** Yes
