# Features Research: Go-to-Market Readiness

**Domain:** Luxury travel booking platform (pickleball + medical tourism + wellness)
**Researched:** 2026-01-26
**Overall confidence:** HIGH (based on codebase analysis + industry standards)

## Executive Summary

This research identifies table stakes features required for Pickleball Passport to go to market. The existing codebase is approximately 85% complete, with critical gaps in payment failure handling, partner payouts, and certain transactional emails. The platform has strong foundations but requires hardening in areas that directly impact revenue (payment failures) and distribution channel (partner experience).

---

## Payment Flow Completeness

### Current State

The codebase has a solid payment foundation:
- Stripe payment intents with webhook handling (`app/api/webhooks/stripe/route.ts`)
- Installment plans with 4-payment schedule
- Auto-charge cron job (`app/api/cron/charge-installments/route.ts`)
- Retry calculator with exponential backoff (`lib/payments/retry-calculator.ts`)
- Payment failure email templates exist (`lib/email/templates/installment-payment-reminder.ts`)

### Gap Analysis

| Gap | Impact | Confidence |
|-----|--------|------------|
| No customer-facing retry UI | Guests can't self-service fix failed payments | HIGH |
| Admin not notified of permanent failures | Lost revenue if admin unaware | HIGH |
| Initial payment failure (not installment) has no email | Guest confused if first payment fails | HIGH |
| Payment method update flow incomplete | Guests can't fix expired cards easily | MEDIUM |

### What Happens When Payments Fail (Current)

1. **Installment payments:** Cron job charges, Stripe webhook updates status, retry scheduled (3 attempts), customer email sent, admin alert after permanent failure
2. **Initial payments:** Webhook marks as FAILED, logs error, **no customer email**, **no retry guidance**
3. **Payment disputes:** Logged to console, **no admin email alert** (TODO in code)

### Table Stakes - Must Have

| Feature | Why Critical | Complexity | Current State |
|---------|--------------|------------|---------------|
| Failed payment customer email (initial) | Guest has no idea why booking didn't complete | Low | Missing - TODO at line 495 in stripe webhook |
| Failed payment retry link | Guest needs way to fix payment method | Medium | Missing - dashboard shows status but no action |
| Admin alert for payment failures | Ops must know when revenue at risk | Low | Exists for installments, missing for initial |
| Dunning sequence for failed installments | Industry standard - 3-email sequence | Medium | Partially exists - single reminder email |

### Nice to Have (v1.1+)

| Feature | Value | Complexity |
|---------|-------|------------|
| Network tokenization | 4-6% higher approval rates | High |
| Card expiry pre-notification | Proactive vs reactive | Medium |
| Multiple payment method storage | Fallback for failed primary | Medium |

### Anti-Features (Don't Build for v1)

| Feature | Why Avoid |
|---------|-----------|
| ACH/bank transfer payments | Complexity + 3-5 day settlement doesn't fit trip booking timeline |
| Cryptocurrency payments | Volatility risk, low customer demand in 55+ demographic |
| Complex refund rules engine | Manual refunds via Stripe dashboard sufficient for launch volume |

---

## Partner Portal Features

### Current State

Partner portal foundation exists with:
- Dashboard with stats (`lib/trpc/server/routers/partner.ts`)
- Referral tracking and points calculation
- Tier system (Bronze/Silver/Gold/Platinum)
- Commission reports page (`app/(dashboard)/dashboard/partner/commissions/page.tsx`)
- Stripe Connect integration for payouts (`lib/stripe/stripe-connect.ts`)
- Partner payout admin page (`app/(dashboard)/dashboard/admin/partner-payouts/page.tsx`)

### Gap Analysis

| Gap | Impact | Confidence |
|-----|--------|------------|
| Partner dashboard is placeholder | Partners can't see their referrals in real-time | HIGH |
| Points redemption not implemented | Points earned but meaningless until redeemable | HIGH |
| Referral link generation UI missing | Partners can't easily get their link | HIGH |
| Marketing materials access unclear | Partners need assets to refer effectively | MEDIUM |
| Bank account data stored in plaintext | PCI compliance risk | HIGH (security) |

### What Partners Need to Refer Successfully

Based on industry standards and codebase analysis:

1. **Tracking & Attribution**
   - Unique referral link (exists in DB, needs UI)
   - Real-time referral status updates (partially exists)
   - Cookie duration visibility (30 days standard)

2. **Commission Transparency**
   - Clear commission rates by tier (exists in code)
   - Commission reports with CSV export (exists)
   - Pending vs paid commissions (needs UI)

3. **Payout Management**
   - Minimum payout threshold visibility
   - Payout request mechanism (partially built)
   - Payout history (exists in admin, needs partner view)

4. **Marketing Resources**
   - Referral link generator with UTM params
   - Shareable marketing materials
   - Co-branded landing pages (nice to have)

### Table Stakes - Must Have

| Feature | Why Critical | Complexity | Current State |
|---------|--------------|------------|---------------|
| Working partner dashboard | Partners can't operate blind | Medium | Placeholder - needs full implementation |
| Referral link copy button | Partners need to share links | Low | Missing - link in DB but no UI |
| Real-time referral tracking | Partners need to see their referrals | Medium | Backend exists, frontend incomplete |
| Payout request flow | Partners need to get paid | Medium | Backend exists via Stripe Connect |
| Encrypt bank account data | PCI compliance requirement | Medium | Currently plaintext - security risk |

### Nice to Have (v1.1+)

| Feature | Value | Complexity |
|---------|-------|------------|
| Custom referral codes | Memorable codes vs UUID | Low |
| Marketing asset library | Self-service materials | Medium |
| Performance analytics | Conversion funnel visibility | Medium |
| Bulk email tools for partners | Partner-to-member outreach | High |

### Anti-Features (Don't Build for v1)

| Feature | Why Avoid |
|---------|-----------|
| Multi-level affiliate (MLM) | Complexity, legal concerns, unnecessary |
| Partner-created custom landing pages | Too much support burden at launch |
| Real-time commission calculation preview | Complexity for edge cases |

---

## Email Notifications

### Current State

Extensive email template library exists (41 templates found):
- Booking confirmation
- Payment receipt
- Refund confirmation
- Installment reminders
- Admin alerts (high-value booking, payment failure, system error)
- Partner notifications (booking, tier change, commission)
- Pre-trip sequence
- Document approval/rejection

### Gap Analysis

| Gap | Impact | Confidence |
|-----|--------|------------|
| Booking cancellation email | Guest not notified of cancellation | HIGH |
| Payment failure email (initial checkout) | Guest doesn't know payment failed | HIGH |
| Trip assignment notification | Guest doesn't know which trip they're on | MEDIUM |
| Payment method update confirmation | No confirmation after card update | LOW |

### Critical Transactional Emails

Based on industry standards and codebase TODOs:

#### Must Have for Launch

| Email Type | Trigger | Current State | Priority |
|------------|---------|---------------|----------|
| Booking confirmation | Payment succeeded | Exists | - |
| Payment receipt | Each payment | Exists | - |
| Booking cancellation | Cancellation processed | Template exists, not wired | P1 |
| Payment failed (initial) | First payment fails | Missing | P1 |
| Installment due reminder | 3 days before due | Exists | - |
| Installment failed | Charge failed | Exists | - |
| Refund processed | Refund completed | Exists | - |
| Pre-trip welcome | 14 days before trip | Exists | - |

#### Admin Alerts (Table Stakes)

| Email Type | Trigger | Current State | Priority |
|------------|---------|---------------|----------|
| High-value booking | Booking > $5,000 | Exists | - |
| Payment failure (permanent) | All retries exhausted | Exists | - |
| Booking cancellation | Any cancellation | Template exists, not wired | P1 |
| Overbooking alert | Capacity exceeded | Missing - TODO in code | P1 |
| Dispute created | Chargeback initiated | Missing - TODO in code | P2 |

### Nice to Have (v1.1+)

| Email Type | Value |
|------------|-------|
| Booking modification confirmation | Guest peace of mind |
| Travel document reminder | Reduce no-shows |
| Post-trip feedback request | NPS collection |
| Partner monthly digest | Engagement |

### Anti-Features (Don't Build for v1)

| Feature | Why Avoid |
|---------|-----------|
| Complex email preference center | Simple unsubscribe sufficient |
| A/B testing framework | Premature optimization |
| In-app vs email notification routing | Complexity for low volume |

---

## Admin Tooling

### Current State

Admin dashboard has navigation to multiple sections:
- Document review
- Booking management
- Guest management
- Trip management
- Analytics dashboard
- CMS
- Partner payouts

Backend tRPC routers exist for most operations (`lib/trpc/server/routers/admin.ts`).

### Gap Analysis

| Gap | Impact | Confidence |
|-----|--------|------------|
| Admin auth not enforced on all routes | Security vulnerability | CRITICAL |
| No failed payment queue | Admin can't see payments needing attention | HIGH |
| No overbooking visibility | Admin unaware of capacity issues | HIGH |
| Hardcoded test user in documents | Data ownership broken | HIGH |

### Day 1 Ops Requirements

Based on codebase analysis and travel booking operations:

#### Must Have

| Feature | Why Critical | Complexity | Current State |
|---------|--------------|------------|---------------|
| Admin role enforcement | Security - non-admins can access admin routes | Low | Missing on page.tsx, exists in some procedures |
| Booking list with filters | View and manage bookings | Medium | Backend exists, UI partial |
| Guest list with search | Find specific guests | Medium | Backend exists, UI partial |
| Trip capacity dashboard | See availability at a glance | Low | Data exists, no dedicated view |
| Failed payment queue | Action items for revenue recovery | Medium | Data exists, no dedicated view |
| Manual refund capability | Handle customer service requests | Low | Exists via Stripe dashboard |
| Document approval workflow | Verify travel documents | Medium | Exists |
| Partner payout processing | Pay partners | Medium | Exists with Stripe Connect |

#### Nice to Have (Week 2+)

| Feature | Value | Complexity |
|---------|-------|------------|
| Booking modification | Change dates/accommodation | Medium |
| Guest communication log | Audit trail | Medium |
| Revenue dashboard | Business health visibility | Medium |
| Bulk email to trip guests | Operational communication | Medium |

### Anti-Features (Don't Build for v1)

| Feature | Why Avoid |
|---------|-----------|
| Complex permissions/roles | Single admin role sufficient at launch |
| Audit log viewer | Database sufficient for launch volume |
| Custom report builder | Fixed reports sufficient |
| Real-time analytics | Daily/hourly refresh sufficient |

---

## Launch Checklist

### P0 - Launch Blockers (Must fix before any paying customer)

| Item | Category | Effort | Files |
|------|----------|--------|-------|
| Enforce admin role on all admin routes | Security | Low | `app/(dashboard)/dashboard/admin/page.tsx` - add role check |
| Replace hardcoded test user ID in documents | Security | Low | `app/(dashboard)/dashboard/documents/page.tsx:143` |
| SendGrid webhook signature verification | Security | Medium | `app/api/webhooks/sendgrid/events/route.ts:46-48` |
| Email token secret enforcement | Security | Low | `lib/preferences/email-token.ts:8` - remove fallback |
| Encrypt partner bank account data | Security/Compliance | Medium | `prisma/schema.prisma:899-900` |

### P1 - Critical for Go-to-Market (Must have for paying customers)

| Item | Category | Effort | Notes |
|------|----------|--------|-------|
| Payment failed email (initial checkout) | Payment | Low | Wire up template to webhook |
| Booking cancellation email | Email | Low | Template exists, wire to cancellation flow |
| Admin overbooking alert | Admin | Low | TODO exists in webhook |
| Working partner dashboard | Partner | Medium | Replace placeholder with real data |
| Referral link copy UI | Partner | Low | Add to partner dashboard |

### P2 - Important for Operations (Week 1-2 post-launch)

| Item | Category | Effort | Notes |
|------|----------|--------|-------|
| Failed payment admin queue view | Admin | Medium | Filter bookings by payment status |
| Dispute created admin alert | Admin | Low | TODO in webhook |
| Payment method update flow | Payment | Medium | Guest self-service card update |
| Partner payout history view | Partner | Low | Show completed payouts to partners |

### P3 - Nice to Have (Month 1+)

| Item | Category | Effort | Notes |
|------|----------|--------|-------|
| Network tokenization | Payment | High | 4-6% higher approval rates |
| Marketing materials library | Partner | Medium | Self-service assets |
| Post-trip feedback emails | Email | Low | NPS collection |
| Revenue analytics dashboard | Admin | Medium | Business health visibility |

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Payment flow gaps | HIGH | Codebase analysis shows TODOs, reviewed webhook handlers |
| Partner portal needs | HIGH | Analyzed router + UI, compared to industry standards |
| Email coverage | HIGH | Enumerated all templates, cross-referenced with triggers |
| Admin tooling | HIGH | Reviewed tRPC routers and page components |
| Prioritization | MEDIUM | Based on typical launch patterns, may need adjustment based on business priorities |

---

## Sources

### Codebase Files Analyzed
- `/Users/grantcharge/Pickleball-Passport/app/api/webhooks/stripe/route.ts`
- `/Users/grantcharge/Pickleball-Passport/app/api/cron/charge-installments/route.ts`
- `/Users/grantcharge/Pickleball-Passport/lib/payments/charge-installment.ts`
- `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/partner.ts`
- `/Users/grantcharge/Pickleball-Passport/lib/email/admin-alerts.ts`
- `/Users/grantcharge/Pickleball-Passport/.planning/codebase/CONCERNS.md`
- `/Users/grantcharge/Pickleball-Passport/.planning/PROJECT.md`

### Industry Research
- [Payrails Hospitality Payment Report 2025](https://www.payrails.com/blog/hospitality-payment-report) - Network tokenization approval rates
- [Zoho Zeptomail: Transactional Emails in Travel](https://www.zoho.com/zeptomail/articles/transactional-emails-in-travel-industry.html) - Email timing and types
- [UserJot: SaaS Affiliate Program Software 2025](https://userjot.com/blog/saas-affiliate-program-software-2025/) - Partner portal features
- [Partnero: Best Affiliate Management Tools 2025](https://www.partnero.com/articles/best-affiliate-management-tools-in-2025) - Commission and payout features
- [QloApps Travel Agent Management](https://qloapps.com/qloapps-travel-agent-management/) - Agent commission management
- [ASD Team: How to Develop Travel MVP 2026](https://asd.team/blog/develop-travel-mvp/) - MVP scope recommendations

---

*Research complete. Ready for roadmap creation.*
