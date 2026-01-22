# Missing Rate Limiting on Critical Endpoints

---
status: pending
priority: p2
issue_id: "011"
tags: [code-review, security, performance]
dependencies: []
---

## Problem Statement

Several critical endpoints lack rate limiting, including `createPaymentIntent` and gift token lookup. This enables denial of service, token enumeration, and cost amplification attacks.

**Why it matters:** Without rate limits, attackers can exhaust Stripe API quotas, enumerate gift tokens, or cause resource exhaustion.

## Findings

**Source:** Security Sentinel Agent

**Affected Endpoints:**
- `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/booking.ts` - `createPaymentIntent`
- `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/gift.ts` - `getByToken`, `acceptGift`, `declineGift`

## Proposed Solutions

### Option 1: Add Rate Limiting Middleware (Recommended)
Use existing Upstash rate limiter on sensitive procedures.

**Pros:** Existing infrastructure, proven pattern
**Cons:** May affect legitimate high-volume users
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] createPaymentIntent rate limited per user
- [ ] Gift endpoints rate limited per IP
- [ ] Clear error messages for rate limited requests
- [ ] Rate limit configuration documented

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during security review | Critical endpoints lack rate limiting |
