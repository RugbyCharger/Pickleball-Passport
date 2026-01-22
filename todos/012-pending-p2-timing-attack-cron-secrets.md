# Timing Attack Vulnerability in Cron Secret Comparison

---
status: pending
priority: p2
issue_id: "012"
tags: [code-review, security, cryptography]
dependencies: []
---

## Problem Statement

Cron job authentication uses simple string comparison for secret validation, which is vulnerable to timing attacks. The same pattern exists in 7+ cron endpoints.

**Why it matters:** Timing attacks can leak secret values byte-by-byte through response time analysis.

## Findings

**Source:** Security Sentinel Agent

**Affected Files:**
- `/Users/grantcharge/Pickleball-Passport/app/api/cron/charge-installments/route.ts:31-49`
- `/Users/grantcharge/Pickleball-Passport/app/api/cron/send-payment-reminders/route.ts`
- `/Users/grantcharge/Pickleball-Passport/app/api/cron/expire-gifts/route.ts`
- Plus 4 more cron endpoints

**Vulnerable Pattern:**
```typescript
if (authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## Proposed Solutions

### Option 1: Use timingSafeEqual (Recommended)

```typescript
import { timingSafeEqual } from 'crypto'

const expectedAuth = `Bearer ${cronSecret}`
const authBuffer = Buffer.from(authHeader || '')
const expectedBuffer = Buffer.from(expectedAuth)

if (authBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(authBuffer, expectedBuffer)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Pros:** Industry standard, prevents timing attacks
**Cons:** Slightly more code
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] All cron endpoints use timing-safe comparison
- [ ] Shared utility function created for reuse
- [ ] No secret values leaked through timing

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during security review | Simple string comparison vulnerable to timing |
