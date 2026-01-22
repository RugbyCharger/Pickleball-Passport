# Security-Critical TODOs Left in Production Code

---
status: pending
priority: p1
issue_id: "009"
tags: [code-review, security, technical-debt, critical]
dependencies: []
---

## Problem Statement

Multiple TODO comments indicate security-critical features are not implemented, including bank account encryption, webhook signature verification, and SMS functionality.

**Why it matters:** These TODOs indicate known security gaps that should be addressed before production or clearly documented as accepted risks.

## Findings

**Source:** Pattern Recognition Agent

**Critical TODOs:**

1. **Bank Account Encryption** - `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/partner.ts:1824-1831`
   ```typescript
   accountNumber String // TODO: Encrypt in production
   routingNumber String // TODO: Encrypt in production
   ```

2. **SendGrid Webhook Verification** - `/Users/grantcharge/Pickleball-Passport/app/api/webhooks/sendgrid/events/route.ts:46`
   ```typescript
   // TODO: Implement SendGrid signature verification for production
   ```

3. **SMS Not Implemented** - `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/admin.ts:1357`
   ```typescript
   // TODO: Actually send SMS via Twilio when configured
   ```

4. **Admin Alert Missing** - `/Users/grantcharge/Pickleball-Passport/app/api/webhooks/stripe/route.ts:760`
   ```typescript
   // TODO: Send email alert to admin team
   ```

## Proposed Solutions

### Option 1: Address All Security TODOs (Recommended)

Create focused PRs to address each TODO:
1. PR: Implement field-level encryption for bank details
2. PR: Add SendGrid webhook signature verification
3. PR: Complete Twilio SMS integration
4. PR: Implement admin alert emails

**Pros:** Completes security features
**Cons:** Significant effort
**Effort:** Large (combined)
**Risk:** Low per PR

### Option 2: Document as Accepted Risks
If features are not needed, document why in a security decisions log.

**Pros:** Clear documentation
**Cons:** May leave gaps
**Effort:** Small
**Risk:** Medium (if gaps are real)

## Acceptance Criteria

- [ ] Bank details encrypted or moved to Stripe
- [ ] SendGrid webhook signatures verified
- [ ] SMS functionality complete or feature removed
- [ ] Admin alerts implemented
- [ ] No security-critical TODOs remain
- [ ] Risk acceptance documented for any deferred items

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during pattern review | Multiple security TODOs in production code |

## Resources

- SendGrid Webhook Security
- Twilio SMS Documentation
