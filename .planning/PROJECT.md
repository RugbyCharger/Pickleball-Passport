# Pickleball Passport

## What This Is

A luxury transformation travel platform combining world-class pickleball, medical tourism, and wellness experiences in Thailand. The web application enables affluent US retirees (55+) to discover, configure, and book transformation packages, while a partner portal empowers pickleball club directors to refer members and earn rewards.

## Current Milestone: v2.1 Communication & Content

**Goal:** Build operational systems for automated guest communication and content management to support real trip operations.

**Target features:**
- Pre-trip email sequences (60/30/14/7/1 days before departure)
- Post-trip follow-up emails (testimonial requests, referral prompts)
- Admin broadcast messaging (urgent updates to trip groups)
- Testimonial submission and admin approval workflow
- Photo gallery management with tagging and consent tracking

**Source:** BMAD Epics E11 (Communication System) + E12 (Content Management)

## Current State

**Version:** v2.0 Mobile App (shipped 2026-01-28)

The platform now includes web + mobile applications:
- v1.0 MVP shipped 2026-01-26
- v1.1 Gift Booking shipped 2026-01-27
- v1.2 RLS Security Hardening shipped 2026-01-27
- v1.3 Gift Enhancements shipped 2026-01-28
- v2.0 Mobile App shipped 2026-01-28

<details>
<summary>Completed: v2.0 Mobile App</summary>

**Goal:** Deliver React Native mobile app for guests covering pre-trip preparation, during-trip experience, and post-trip alumni engagement.

**Delivered features:**
- ✓ Expo React Native app with Clerk authentication and biometrics
- ✓ Pre-trip dashboard (countdown, checklist, document upload, group chat)
- ✓ During-trip experience (itinerary, concierge chat, court booking, photo journal)
- ✓ Alumni engagement (referrals, rebooking, passport stamps gamification)
- ✓ Push notifications via OneSignal
- ✓ Deep linking and offline mode support
- ✓ App Store / Play Store submission ready
</details>

<details>
<summary>Completed: v1.3 Gift Enhancements</summary>

**Goal:** Give purchasers control over pending gifts before delivery — cancel, edit message, or resend notification.

**Delivered features:**
- ✓ Cancel PENDING gifts with full Stripe refund
- ✓ Edit gift message before delivery
- ✓ Resend notification email (rate limited)
- ✓ Dashboard UI with action buttons and dialogs
</details>

<details>
<summary>Completed: v1.2 RLS Security Hardening</summary>

**Goal:** Replace overly permissive "Dev Access" RLS policies with service-role-only access for defense-in-depth security.

**Delivered features:**
- ✓ Dropped all 24 permissive RLS policies
- ✓ Service role only access pattern implemented
- ✓ Supabase security advisor: 24 WARN → 0 WARN
- ✓ App functionality verified
</details>

<details>
<summary>Completed: v1.1 Gift Booking</summary>

**Goal:** Enable guests to purchase transformation trips as gifts, with full lifecycle management from purchase through acceptance/decline/expiration.

**Delivered features:**
- ✓ Gift purchase flow (buy a trip for someone else)
- ✓ Gift notification emails (to purchaser and recipient)
- ✓ Recipient acceptance/decline UI
- ✓ Gift status tracking in dashboard
- ✓ Refund handling for declined/expired gifts
</details>

## Core Value

**Guests can book a transformation trip and partners can refer members.** Everything else supports these two flows. If booking doesn't work, there's no business. If partner referrals don't work, there's no distribution channel.

## Requirements

### Validated

<!-- Shipped and confirmed working -->

**Pre-existing (before v1.0):**
- ✓ **Marketing website** — Homepage, packages, testimonials, contact, partner program page
- ✓ **User authentication** — Clerk integration, signup/login, role-based access (GUEST/PARTNER/ADMIN)
- ✓ **Multi-step booking configurator** — Package, duration, accommodation, add-ons, wellness, profile
- ✓ **Booking review and confirmation** — Review page, confirmation page, PDF receipts
- ✓ **Stripe payment integration** — Payment intents, card processing, webhook handling
- ✓ **Installment payment plans** — 4-payment schedule, auto-charge cron job
- ✓ **Partner portal foundation** — Dashboard, referral links, points tracking, tiers, materials
- ✓ **Admin dashboard foundation** — Booking management, guest management, CMS, email templates
- ✓ **Email system foundation** — SendGrid integration, booking confirmation, payment receipts
- ✓ **WhatsApp integration** — Group management, message templates

**v1.0 MVP (shipped 2026-01-26):**
- ✓ **Admin route protection** — Clerk middleware with ADMIN role checking — v1.0
- ✓ **SendGrid webhook verification** — Official SDK signature verification — v1.0
- ✓ **Email token security** — Required secret, no fallback in production — v1.0
- ✓ **Document upload security** — Authenticated user ID from Clerk — v1.0
- ✓ **Stripe Connect exclusive** — Bank account fields removed — v1.0
- ✓ **Payment failure recovery** — Guest email with update payment link — v1.0
- ✓ **Payment method update** — Stripe Elements modal in dashboard — v1.0
- ✓ **Overbooking prevention** — Atomic capacity check with admin alerts — v1.0
- ✓ **Partner commission breakdown** — Pending vs available based on booking status — v1.0
- ✓ **Referral link UTM tracking** — utm_source, utm_medium, utm_campaign — v1.0
- ✓ **Guest cancellation emails** — Both self and admin-initiated paths — v1.0

**v1.1 Gift Booking (shipped 2026-01-27):**
- ✓ **Gift purchase flow** — Toggle, recipient fields, delivery scheduling — v1.1
- ✓ **Gift notification emails** — Recipient notification on SENT, purchaser confirmation — v1.1
- ✓ **Gift acceptance** — Auth flow, booking ownership transfer, confirmation emails — v1.1
- ✓ **Gift decline** — Dedicated page, automatic refund, notification emails — v1.1
- ✓ **Gift expiration** — 30-day auto-expire, refund, notification email — v1.1
- ✓ **Purchaser dashboard** — View gift status and recipient response — v1.1
- ✓ **Admin gifts view** — Status filtering and counts — v1.1

**v1.3 Gift Enhancements (shipped 2026-01-28):**
- ✓ **Gift cancellation** — Purchaser can cancel PENDING gift with full refund — v1.3
- ✓ **Gift message editing** — Purchaser can edit message before delivery — v1.3
- ✓ **Notification resend** — Purchaser can resend email to recipient (rate limited) — v1.3

**v2.0 Mobile App (shipped 2026-01-28):**
- ✓ **MOB-SETUP-01**: Developer can scaffold Expo React Native app with TypeScript — v2.0
- ✓ **MOB-AUTH-01**: Guest can log in with email/password via Clerk — v2.0
- ✓ **MOB-AUTH-02**: Guest can use biometric login (Face ID, Touch ID) — v2.0
- ✓ **MOB-PRETRIP-01**: Guest can view countdown to trip departure — v2.0
- ✓ **MOB-PRETRIP-02**: Guest can complete pre-trip checklist items — v2.0
- ✓ **MOB-PRETRIP-03**: Guest can upload passport document — v2.0
- ✓ **MOB-PRETRIP-04**: Guest can view fellow travelers (opt-in) — v2.0
- ✓ **MOB-PRETRIP-05**: Guest can chat with trip group before departure — v2.0
- ✓ **MOB-PRETRIP-06**: Guest can view and customize packing list — v2.0
- ✓ **MOB-PRETRIP-07**: Guest can download offline itinerary — v2.0
- ✓ **MOB-TRIP-01**: Guest can view daily itinerary with activities — v2.0
- ✓ **MOB-TRIP-02**: Guest can check in to activities — v2.0
- ✓ **MOB-TRIP-03**: Guest can chat with concierge 24/7 — v2.0
- ✓ **MOB-TRIP-04**: Guest can trigger emergency SOS with GPS location — v2.0
- ✓ **MOB-TRIP-05**: Guest can book pickleball courts — v2.0
- ✓ **MOB-TRIP-06**: Guest can find other guests to play with — v2.0
- ✓ **MOB-TRIP-07**: Guest can upload photos to trip journal — v2.0
- ✓ **MOB-TRIP-08**: Guest can view group photo gallery — v2.0
- ✓ **MOB-TRIP-09**: Guest can request transportation — v2.0
- ✓ **MOB-ALUMNI-01**: Guest can view transformation journey summary — v2.0
- ✓ **MOB-ALUMNI-02**: Guest can browse alumni directory — v2.0
- ✓ **MOB-ALUMNI-03**: Guest can refer friends and track referrals — v2.0
- ✓ **MOB-ALUMNI-04**: Guest can rebook with alumni discount — v2.0
- ✓ **MOB-ALUMNI-05**: Guest can earn passport stamps for achievements — v2.0
- ✓ **MOB-ALUMNI-06**: Guest can create and submit testimonial — v2.0

### Active

<!-- v2.1 Communication & Content milestone -->

**v2.1 Communication & Content:**
- [ ] **COMM-01**: Guest receives pre-trip email sequence (60/30/14/7/1 days before)
- [ ] **COMM-02**: Guest receives post-trip follow-up emails (testimonial request, referral prompt)
- [ ] **COMM-03**: Guest receives payment reminder emails (7 days before installment)
- [ ] **COMM-04**: Admin can send broadcast messages to trip groups
- [ ] **COMM-05**: Guest can manage email preferences (unsubscribe categories)
- [ ] **COMM-06**: System sends automated NPS surveys (30 days after trip)
- [ ] **CONT-01**: Guest can submit testimonial (video, written, photo)
- [ ] **CONT-02**: Admin can review and approve testimonials
- [ ] **CONT-03**: Published testimonials display on website
- [ ] **CONT-04**: Admin can manage photo galleries (upload, tag, feature)
- [ ] **CONT-05**: System tracks content consent per testimonial/photo

### Out of Scope

<!-- Explicit boundaries -->

- **SMS notifications** — Twilio stubs exist but not required for v2.0
- **Dynamic pricing per trip** — Hardcoded pricing acceptable
- **Gift card balance system** — Not a gift card, it's a specific booking gift
- **Multiple gift recipients** — One gift = one booking = one recipient
- **Partial gift payments** — Keep it simple - fully paid or not
- **Video calls in app** — External Zoom links sufficient for alumni meetups
- **In-app payments** — Use existing web checkout, deep link from app
- **Apple/Google Pay in app** — Web checkout handles payments

## Context

**Tech Stack (Web):**
- Next.js 16.1.1 with App Router
- tRPC 11.8.1
- Prisma 5.22.0
- Clerk authentication
- Stripe payments + Stripe Connect
- SendGrid email
- Supabase PostgreSQL
- Vercel deployment

**Tech Stack (Mobile - v2.0):**
- Expo (React Native)
- Expo Router (file-based navigation)
- NativeWind (Tailwind for React Native)
- tRPC client (shared API with web)
- Clerk Expo SDK (authentication)
- OneSignal (push notifications)
- Supabase Realtime (chat)

**Business Context:**
- v1.0 MVP shipped — ready for first bookings
- Partner distribution channel live (club directors)
- Both B2C (direct guests) and B2B2C (partner referrals) channels active

## Constraints

- **Tech stack**: Continue with existing stack — no rewrites
- **Quality bar**: All security requirements must be met before customer-facing
- **Budget**: Solo developer capacity — prioritize highest-impact work

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Partner Portal = Phase 1 | Key distribution channel | ✓ Shipped v1.0 |
| Gift system deprioritized | Not critical for go-to-market | ✓ Confirmed |
| Security before launch | Cannot ship known vulnerabilities | ✓ All SEC requirements met |
| Mobile app = Phase 2 | Web app sufficient for MVP | ✓ Confirmed |
| Use sessionClaims.metadata.role for ADMIN | Clerk-native approach | ✓ Implemented |
| Redirect non-admin to /dashboard | Better UX than 403 | ✓ Implemented |
| Official SendGrid SDK | Custom crypto had ECDSA issues | ✓ Implemented |
| Remove PartnerPayoutMethod | Stripe Connect exclusive | ✓ Model removed |
| Available = COMPLETED bookings | Clear business rule | ✓ Implemented |
| UTM standard params | Industry standard tracking | ✓ Implemented |

| Gift system = v1.1 | High-value gift market for luxury travel | ✓ Shipped v1.1 |
| Gift enhancements = v1.3 | Purchaser control over pending gifts | ✓ Shipped v1.3 |
| CANCELLED as terminal state | Matches ACCEPTED/DECLINED/EXPIRED behavior | ✓ Implemented v1.3 |
| Rate limit 3/24h per gift | Prevents spam while allowing multiple gifts | ✓ Implemented v1.3 |

| Mobile app = v2.0 | Major platform expansion | ✓ Shipped v2.0 |
| Expo + NativeWind | Aligns with existing Tailwind patterns | ✓ Implemented v2.0 |
| tRPC shared client | Reuse existing API infrastructure | ✓ Implemented v2.0 |
| OneSignal for push | Industry standard, good Expo support | ✓ Implemented v2.0 |
| Communication + Content = v2.1 | Operational systems for real trips | — Pending |
| BMAD Epics E11 + E12 | Source requirements from established planning | — Pending |

---
*Last updated: 2026-01-30 after v2.1 milestone started*
