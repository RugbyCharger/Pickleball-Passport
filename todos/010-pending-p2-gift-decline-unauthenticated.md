# Gift Decline Operation Allows Unauthenticated State Changes

---
status: pending
priority: p2
issue_id: "010"
tags: [code-review, security, authentication]
dependencies: []
---

## Problem Statement

The `declineGift` procedure is a `publicProcedure`, allowing anyone with a gift token to decline the gift without authentication. While this may be intentional for UX, it creates an attack vector.

**Why it matters:** An attacker who intercepts or guesses a gift token can decline someone else's gift, triggering refunds and business loss.

## Findings

**Source:** Security Sentinel Agent

**Location:** `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/gift.ts:283-378`

## Proposed Solutions

### Option 1: Require Email Verification (Recommended)
Add email verification to decline flow.

**Pros:** Prevents unauthorized declines
**Cons:** Slightly more friction for legitimate users
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] Decline requires email match verification
- [ ] Attack vector closed for token enumeration
- [ ] UX remains acceptable for legitimate users

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during security review | Public procedure allows unauthenticated state changes |
