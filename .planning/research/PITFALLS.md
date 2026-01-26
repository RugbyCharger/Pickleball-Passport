# Pitfalls Research: Launch Blockers

**Domain:** Luxury Travel Booking Platform with High-Value Transactions
**Researched:** 2026-01-26
**Confidence:** HIGH (multiple authoritative sources, codebase analysis, industry reports)

---

## Executive Summary

This document identifies critical pitfalls that commonly cause failures when launching booking platforms handling high-value transactions ($10K-25K+). Based on analysis of the Pickleball Passport codebase combined with industry research, this identifies specific risks given:
- 4-payment installment plans requiring off-session charges
- Partner referral program with commission payouts
- Luxury price points ($15K-25K packages) that attract fraud and demand premium support

---

## Payment Pitfalls

### P1: CRITICAL - Installment Payment Failures Without Recovery

**What goes wrong:** Off-session installment charges fail (card expired, insufficient funds, card lost) and the system has no clear recovery path. Guest has made 2 of 4 payments, trip is in 30 days, and card declines.

**Why it happens:**
- Cards expire between booking (6 months before trip) and final installments
- Banks flag unexpected large charges as fraud
- Customers change cards without updating payment method
- 42% of businesses lose revenue due to preventable failed payment issues

**Warning signs:**
- PaymentRecord status stuck at FAILED with no admin notification
- Multiple guests with partial payment status approaching trip date
- No retry history or customer communication trail

**Current codebase state:**
```
// From charge-installment.ts - retry logic exists but:
- Max 4 retries over 11 days (1+3+7 days)
- Admin alerts send but TODO: no admin UI to view/action them
- Customer reminder emails exist but updatePaymentUrl points to dashboard with no card update flow
```

**Prevention strategy:**
1. **Phase: Pre-Launch (Critical)**
   - Build card update flow in customer dashboard
   - Create admin view for failed installments with one-click retry
   - Implement Stripe Customer Portal integration for self-service card updates
   - Set up monitoring dashboard for payment health metrics

2. **Phase: Week 1 Operations**
   - Daily review of FAILED PaymentRecords
   - Proactive outreach 7 days before each installment due date
   - Escalation path when 2+ retries fail

**Detection:** Query for `PaymentRecord.status = 'FAILED'` where `booking.trip.startDate < NOW() + 30 days`

---

### P2: HIGH - Currency/3DS Authentication Failures on High-Value Charges

**What goes wrong:** $15,000+ charges trigger additional fraud checks, 3DS challenges, or bank holds. Customer abandons checkout or fails authentication.

**Why it happens:**
- European banks require 3DS (Strong Customer Authentication) - "highly problematic, basically short-circuits the transaction"
- US banks may soft-decline large amounts without prior relationship
- Network tokens would help but require initial setup

**Warning signs:**
- Checkout abandonment at payment confirmation step
- Payment intents created but never succeeded
- Customer complaints about "bank blocked the charge"

**Current codebase state:**
```
// Stripe integration appears standard - no explicit 3DS handling
// No pre-authorization for installment setup
// Currency selector exists (E4-S13) but exchange rate issues not handled
```

**Prevention strategy:**
1. **Phase: Pre-Launch**
   - Save payment method during first successful charge for off-session reuse
   - Verify Stripe radar rules aren't overly aggressive for $15K+ charges
   - Test checkout flow with international cards (UK, EU, CA, AU)

2. **Phase: Post-Launch Monitoring**
   - Track payment_intent.payment_failed by failure reason
   - Alert on 3DS failure rates exceeding 5%
   - Build retry flow with manual 3DS trigger option

**Detection:** `payment_intent.payment_failed` where `last_payment_error.code = 'authentication_required'`

---

### P3: HIGH - Overbooking from Race Conditions

**What goes wrong:** Two guests complete payment for last spot simultaneously. Trip is overbooked.

**Why it happens:**
- Check capacity -> Process payment -> Increment capacity is not atomic
- Webhook processing delays can allow double-booking
- Current code has this note: `"CRITICAL: Trip at capacity during payment confirmation"`

**Current codebase state:**
```typescript
// From stripe webhook - uses atomic increment but logs error without blocking:
if (incrementResult === 0) {
  console.error(`CRITICAL: Trip ${booking.tripId} at capacity...`);
  // TODO: Send alert to admin about potential overbooking
  return; // Continues processing - booking marked CONFIRMED
}
```

**Prevention strategy:**
1. **Phase: Pre-Launch (Critical)**
   - Reserve spot when booking created (with timeout)
   - Implement pessimistic locking: `SELECT FOR UPDATE` on trip
   - Alert admin immediately on overbooking (not just log)
   - Add booking soft-block until admin confirms resolution

2. **Phase: Operations**
   - Manual override workflow for overbooking resolution
   - Compensation policy for displaced guests

**Detection:** `Trip.currentBookings > Trip.capacity`

---

### P4: MEDIUM - Refund/Chargeback Handling for Partial Payments

**What goes wrong:** Guest disputes installment 3 of 4. They've paid $11,250 of $15,000. Cancellation policy unclear for partial payments.

**Why it happens:**
- Traditional refund policies assume single payment
- Dispute on one payment may not automatically cancel booking
- Partner commissions may have been paid on early installments

**Current codebase state:**
```
// Dispute handlers exist but:
// - handleDisputeLost: Cancels booking, decrements capacity
// - No handling for partial payment disputes
// - No clawback of partner points/commissions
```

**Prevention strategy:**
1. **Phase: Pre-Launch**
   - Define clear policy: dispute on any installment = full booking cancellation?
   - Build partial refund workflow
   - Track which PaymentRecords were disputed

2. **Phase: Legal/Terms**
   - Installment plan agreement explicitly covering disputes
   - Reservation of right to cancel for disputed payments

**Detection:** `charge.dispute.created` events where booking has multiple payments

---

### P5: MEDIUM - Webhook Reliability and Idempotency Gaps

**What goes wrong:** Webhook fails, retries, and double-processes. Guest receives duplicate emails. Capacity incremented twice.

**Why it happens:**
- Network issues cause Stripe to retry webhooks up to 72 hours
- Non-idempotent operations (email sends, capacity updates) repeated

**Current codebase state:**
```typescript
// Good: WebhookEvent model with idempotency
const eventRecord = await prisma.webhookEvent.upsert({
  where: { stripeEventId: event.id },
  create: { processed: false },
  update: {},
});
if (eventRecord.processed) return; // Skip if already processed

// But: processed flag set AFTER all operations complete
// If webhook times out during email send, it will retry and re-process
```

**Prevention strategy:**
1. **Phase: Pre-Launch**
   - Mark event processing BEFORE executing operations
   - Use database transactions for atomic state changes
   - Make email sends idempotent (check if already sent for this event)

**Detection:** Duplicate emails to same guest for same booking event

---

## Partner Program Pitfalls

### PP1: CRITICAL - Commission Attribution Disputes

**What goes wrong:** Partner claims they referred a booking but system didn't track it. Or guest used partner code but booking shows no referral.

**Why it happens:**
- Cookie expires before guest completes booking (days/weeks later)
- Guest switches devices (mobile browse, desktop book)
- Referral code in URL but not captured in booking flow

**Current codebase state:**
```
// referredBy field on Booking stores partner code
// UTM tracking fields exist
// But: No click-to-conversion attribution trail visible to partners
// Partner notification exists but no dispute workflow
```

**Prevention strategy:**
1. **Phase: Pre-Launch (Critical)**
   - Store referral code in server-side session, not just cookie
   - Log all referral code clicks with timestamps (ReferralEvent model exists)
   - Show partners their click-to-booking funnel in dashboard
   - Build manual attribution override for admin

2. **Phase: Partner Agreement**
   - Clear attribution window (30 days from click?)
   - Dispute process documented

**Detection:** Support tickets from partners about missing commissions

---

### PP2: HIGH - Stripe Connect Onboarding Abandonment

**What goes wrong:** Partner starts Stripe Connect onboarding, abandons midway. They refer bookings but can't receive payouts. Trust erodes.

**Why it happens:**
- Stripe Connect Express requires tax info, ID verification
- International partners face additional compliance
- Partners don't realize they need to complete onboarding to get paid

**Current codebase state:**
```prisma
// PartnerProfile has:
stripeConnectOnboardingComplete Boolean @default(false)
stripeConnectPayoutsEnabled Boolean @default(false)
// account.updated webhook updates these flags
```

**Prevention strategy:**
1. **Phase: Pre-Launch**
   - Block payout requests until onboarding complete
   - Email partners with incomplete onboarding (7, 14, 30 days after signup)
   - Show clear status in partner dashboard: "Complete payout setup to receive $X pending"

2. **Phase: Operations**
   - Monthly review of partners with pending commissions + incomplete onboarding
   - Admin tool to manually trigger onboarding reminder

**Detection:** `PartnerProfile.stripeConnectOnboardingComplete = false` AND `PartnerReferral.count > 0`

---

### PP3: HIGH - Partner Tier Calculation Errors

**What goes wrong:** Partner qualifies for GOLD tier but system shows BRONZE. Or tier downgrades unexpectedly.

**Why it happens:**
- Tier calculation based on rolling period not clearly defined
- Cancelled bookings count toward tier, then get reversed
- No audit trail of tier changes

**Current codebase state:**
```
// Tier stored as enum on PartnerProfile
// No automatic tier upgrade/downgrade logic visible
// Tier change notification template exists
```

**Prevention strategy:**
1. **Phase: Pre-Launch**
   - Document tier qualification criteria explicitly
   - Build tier audit log (who, when, why)
   - Admin override with reason required

2. **Phase: Partner Communication**
   - Proactive notification when approaching tier upgrade
   - 30-day grace period before downgrade

**Detection:** Partner support tickets about tier

---

### PP4: MEDIUM - Payout Timing and Expectations

**What goes wrong:** Partner expects immediate payout after booking. Actual payout follows trip completion or booking confirmation.

**Why it happens:**
- Commission should be held until refund window closes
- Trip cancellations need commission clawback
- Partners see "earned" vs "available" confusion

**Current codebase state:**
```
// PartnerPayout model tracks payouts
// No clear "hold period" before commission becomes available
// Points awarded immediately on booking confirmation
```

**Prevention strategy:**
1. **Phase: Pre-Launch**
   - Define payout schedule: "Available 30 days after trip completion"
   - Show "Pending" vs "Available" clearly in dashboard
   - Implement hold period before payout eligibility

2. **Phase: Partner Terms**
   - Clear commission terms in partner agreement
   - Cancellation/clawback policy documented

**Detection:** Payout requests for bookings with upcoming trips

---

## Security Pitfalls

### S1: CRITICAL - Admin Authentication Weakness

**What goes wrong:** Malicious actor gains admin access. Can view all customer data, process refunds, modify bookings.

**Current codebase state:**
```typescript
// Admin check is database role lookup:
const dbUser = await prisma.user.findUnique({
  where: { id: user.id },
  select: { role: true },
});
if (!dbUser || dbUser.role !== 'ADMIN') {
  redirect('/dashboard');
}

// Known issue from project context: "Admin auth missing"
// No MFA requirement for admin
// No admin action audit logging
```

**Warning signs:**
- Admin role changes without proper workflow
- No session timeouts for admin users
- Bulk data exports without logging

**Prevention strategy:**
1. **Phase: Pre-Launch (CRITICAL)**
   - Require MFA for all admin accounts
   - Implement admin action audit log
   - Session timeout after 30 minutes of inactivity
   - IP allowlist for admin access (optional)

2. **Phase: Operations**
   - Weekly review of admin access logs
   - Quarterly admin access audit

**Detection:** `User.role = 'ADMIN'` count changes unexpectedly

---

### S2: CRITICAL - SendGrid Webhook Verification

**What goes wrong:** Attacker spoofs SendGrid webhook, unsubscribes all users from emails.

**Current codebase state:**
```typescript
// From sendgrid webhook - verification key required in production
if (process.env.NODE_ENV === 'production') {
  if (!verificationKey) {
    emailLogger.error('SECURITY ERROR: SENDGRID_WEBHOOK_VERIFICATION_KEY not configured');
    return false;
  }
}

// Known issue: "webhook verification incomplete"
```

**Prevention strategy:**
1. **Phase: Pre-Launch (CRITICAL)**
   - Set SENDGRID_WEBHOOK_VERIFICATION_KEY in production environment
   - Verify webhook signature validation works end-to-end
   - Test with invalid signatures (should reject)

**Detection:** Production logs showing "SECURITY ERROR: SENDGRID_WEBHOOK_VERIFICATION_KEY not configured"

---

### S3: HIGH - PCI DSS 4.0 Compliance

**What goes wrong:** Data breach exposes customer card data. Fines up to $100,000/month. Average breach cost: $4.5 million.

**Why it matters:**
- PCI DSS 4.0 enforcement began April 2025
- 51 new requirements including continuous testing
- High-value travel bookings are prime targets

**Current codebase state:**
- Stripe handles card data (good - reduces PCI scope)
- No evidence of card data stored locally (good)
- Unknown: payment page script inventory, penetration testing schedule

**Prevention strategy:**
1. **Phase: Pre-Launch**
   - Complete PCI SAQ (Self-Assessment Questionnaire)
   - Inventory all scripts on payment pages
   - Enable CSP headers on checkout
   - Verify no card data in logs

2. **Phase: Quarterly**
   - Penetration testing
   - Script inventory review
   - Payment page monitoring

**Detection:** Security scan findings, Stripe radar alerts

---

### S4: HIGH - Document Upload Security

**What goes wrong:** Malicious file uploaded as "passport" executes code or exfiltrates data.

**Current codebase state:**
```prisma
// Document model stores files in Supabase Storage
// mimeType validated at model level
// Unknown: content-type validation, file scanning, access controls
```

**Prevention strategy:**
1. **Phase: Pre-Launch**
   - Validate file content matches claimed MIME type
   - Restrict allowed file types (PDF, JPG, PNG only)
   - Scan uploads for malware
   - Serve documents through signed URLs with expiration

**Detection:** Unusual file types in Document table, large file uploads

---

### S5: MEDIUM - Gift Token Predictability

**What goes wrong:** Attacker guesses or brute-forces gift acceptance tokens, hijacks gift bookings.

**Current codebase state:**
```prisma
// giftAcceptanceToken String? @unique
// Unknown: token generation method, entropy
```

**Prevention strategy:**
1. **Phase: Pre-Launch**
   - Verify tokens are cryptographically random (UUID v4 or better)
   - Rate limit gift acceptance endpoint
   - Expire tokens after 30 days (giftExpiresAt exists)

**Detection:** Multiple failed gift acceptance attempts from same IP

---

## Operational Pitfalls

### O1: CRITICAL - No Support Escalation for Trip-Critical Issues

**What goes wrong:** Guest contacts support 48 hours before departure with booking problem. Support response takes 72 hours. Guest misses trip.

**Why it matters:**
- Luxury travel = premium expectations
- $15K-25K customers expect immediate resolution
- Peak season call volumes spike 300-400% industry-wide

**Current codebase state:**
```
// SupportTicket model exists with priority levels
// No SLA enforcement
// No escalation rules
// "email stubs" suggests email delivery not fully implemented
```

**Prevention strategy:**
1. **Phase: Pre-Launch (CRITICAL)**
   - Define SLA: Urgent = 4 hours, High = 24 hours
   - Build trip-proximity detection: tickets from guests with trip < 7 days = auto-URGENT
   - On-call rotation for trip-critical issues
   - WhatsApp support channel for urgent issues

2. **Phase: Operations**
   - Daily triage of open tickets
   - Weekly review of SLA breaches

**Detection:** `SupportTicket` where `resolvedAt - createdAt > SLA` and `booking.trip.startDate < NOW() + 7 days`

---

### O2: HIGH - Missing Admin Notification Infrastructure

**What goes wrong:** Payment fails, dispute created, webhook errors - but no one knows until customer complains.

**Current codebase state:**
```
// Multiple TODOs for admin notifications:
// "TODO: Send alert to admin about potential overbooking"
// Admin alerts use lib/email/admin-alerts.ts but emails may be stubs
// No admin dashboard for real-time alerts
```

**Prevention strategy:**
1. **Phase: Pre-Launch**
   - Implement admin alert email delivery (verify SendGrid integration)
   - Create admin notification center in dashboard
   - Set up critical alert SMS/Slack backup channel

2. **Phase: Operations**
   - Morning check of overnight alerts
   - Alert acknowledgment tracking

**Detection:** Email send logs for admin-alerts, alert delivery confirmation

---

### O3: HIGH - Document Review Backlog

**What goes wrong:** Documents pile up awaiting review. Guest submits passport 2 weeks before trip, still pending at departure.

**Current codebase state:**
```
// Document model with PENDING_REVIEW status
// Admin document review page exists
// No SLA or queue management
```

**Prevention strategy:**
1. **Phase: Pre-Launch**
   - Define document review SLA (48 hours)
   - Build queue prioritization by trip date
   - Auto-reject expired passports
   - Email guest if documents still pending 14 days before trip

**Detection:** `Document.status = 'PENDING_REVIEW'` where `createdAt < NOW() - 48 hours`

---

### O4: MEDIUM - Trip Capacity Communication Gaps

**What goes wrong:** Trip fills up but interested guests don't know. Or trip is undersold but no outreach happens.

**Current codebase state:**
```
// Trip model has capacity and currentBookings
// No waitlist functionality
// No "trip filling fast" notifications
```

**Prevention strategy:**
1. **Phase: Post-MVP**
   - Build waitlist for full trips
   - "Only X spots left" messaging
   - Undersold trip marketing alerts

**Detection:** Trips at capacity with no waitlist, trips < 50% full at 30 days out

---

### O5: MEDIUM - Pre-Trip Email Sequence Failures

**What goes wrong:** Pre-trip emails (60, 30, 14, 7, 1 day) fail silently. Guest arrives unprepared.

**Current codebase state:**
```
// preTripEmailsSent String[] tracks which emails sent
// Cron job presumably sends these
// SendGrid integration may have delivery issues
```

**Prevention strategy:**
1. **Phase: Pre-Launch**
   - Verify cron job running
   - Monitor email delivery rates
   - Build fallback: if email bounces, try SMS/WhatsApp
   - Admin view of pre-trip sequence status per booking

**Detection:** `Booking.preTripEmailsSent` array length < expected for trip proximity

---

## Pre-Launch Checklist

### Payment Systems
- [ ] Card update flow in customer dashboard
- [ ] Admin view for failed installments with retry capability
- [ ] Stripe Customer Portal integration
- [ ] Test checkout with $15K+ charges on international cards
- [ ] Verify atomic capacity increment on payment success
- [ ] Test webhook idempotency under retry conditions

### Partner Program
- [ ] Attribution tracking visible to partners
- [ ] Stripe Connect onboarding reminder flow
- [ ] Tier criteria documented and audit trail built
- [ ] Payout hold period implemented
- [ ] Manual attribution override for admin

### Security
- [ ] MFA required for admin accounts
- [ ] Admin action audit logging
- [ ] SENDGRID_WEBHOOK_VERIFICATION_KEY configured in production
- [ ] PCI SAQ completed
- [ ] Document upload validation (MIME type, malware scan)
- [ ] Gift token entropy verification

### Operations
- [ ] Support SLA defined and enforced
- [ ] Trip-proximity escalation rules
- [ ] Admin notification delivery verified
- [ ] Document review queue with SLA
- [ ] On-call rotation for trip-critical issues
- [ ] Pre-trip email sequence monitoring

### Known Issues to Address
- [ ] Admin auth missing (from project context)
- [ ] Webhook verification incomplete (from project context)
- [ ] Email stubs (from project context)
- [ ] No payment failure handling (from project context)

---

## Phase Assignment Summary

| Pitfall | Severity | Phase |
|---------|----------|-------|
| P1: Installment Recovery | CRITICAL | Pre-Launch |
| P2: 3DS/Currency Failures | HIGH | Pre-Launch |
| P3: Overbooking Race | CRITICAL | Pre-Launch |
| P4: Partial Payment Disputes | MEDIUM | Pre-Launch + Legal |
| P5: Webhook Idempotency | MEDIUM | Pre-Launch |
| PP1: Commission Attribution | CRITICAL | Pre-Launch |
| PP2: Connect Onboarding | HIGH | Pre-Launch |
| PP3: Tier Calculation | HIGH | Pre-Launch |
| PP4: Payout Timing | MEDIUM | Pre-Launch + Terms |
| S1: Admin Auth | CRITICAL | Pre-Launch |
| S2: Webhook Verification | CRITICAL | Pre-Launch |
| S3: PCI Compliance | HIGH | Pre-Launch + Quarterly |
| S4: Document Security | HIGH | Pre-Launch |
| S5: Gift Token | MEDIUM | Pre-Launch |
| O1: Support Escalation | CRITICAL | Pre-Launch |
| O2: Admin Notifications | HIGH | Pre-Launch |
| O3: Document Backlog | HIGH | Pre-Launch |
| O4: Capacity Communication | MEDIUM | Post-MVP |
| O5: Pre-Trip Emails | MEDIUM | Pre-Launch |

---

## Sources

### Payment Industry Research
- [The Lost Booking Problem: How Payment Friction Kills Travel Conversions](https://thepaymentsassociation.org/article/the-lost-booking-problem-how-payment-friction-kills-travel-conversions/)
- [Navigating Payment Challenges in Travel: 2025](https://financialit.net/blog/travelpayments-paymentchallenges/navigating-payment-challenges-travel-road-ahead-2025)
- [Stripe Failed Payments Recovery](https://stripe.com/resources/more/failed-payment-recovery-101)
- [How to Handle Failed Subscription Payments in Stripe](https://benfoster.io/blog/stripe-failed-payments-how-to/)
- [Top Fraud Prevention Challenges for Airlines 2025](https://www.iddataweb.com/top-fraud-prevention-challenges-airlines/)

### Partner/Affiliate Research
- [Travel Affiliate Marketing Guide 2026](https://www.affiversemedia.com/travel-affiliate-marketing-guide-for-2026-strategic-positioning-for-the-deal-savvy-consumer/)
- [Why Booking.com Cut Thousands of Affiliate Partners](https://skift.com/2025/05/30/why-booking-com-cut-thousands-of-affiliate-partners-and-what-comes-next/)

### Security Research
- [PCI DSS 4.0 & VCC Security in 2026](https://antravia.com/pci-dss-40-and-vcc-security-in-2026-the-compliance-playbook-for-hotels-and-travel-agencies)
- [The 2025 Travel Boom: Is Your Website Secure?](https://hospitalitytech.com/2025-travel-boom-here-your-website-secure)
- [How to Avoid Costly PCI Mistakes in Hospitality](https://www.feroot.com/blog/pci-compliance-in-hospitality-and-travel-guide/)

### Operations Research
- [Why Travel Customer Service Fails in Peak Season](https://zealconnect.com/customer-service-failures-travel-peak-season/)
- [Top 2024 CX Fails in Travel and Hospitality](https://hospitalitytech.com/top-2024-cx-fails-travel-and-hospitality-lessons-future-success)
- [Common Mistakes When Using Online Booking Systems](https://ezbook.com/mistakes-to-avoid-when-using-online-booking-system/)
