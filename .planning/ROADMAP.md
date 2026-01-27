# Roadmap: Pickleball Passport v2.0 Mobile App

## Overview

The v2.0 Mobile App milestone adds a React Native mobile application to the Pickleball Passport platform. Guest can prepare for their trip (pre-trip phase), experience essential daily support during their journey (during-trip phase), stay engaged with the alumni community (post-trip phase), and access the app with production-ready quality through app store deployment.

## Milestones

- v1.0 MVP - Phases 1-4 (shipped 2026-01-26)
- v1.1 Gift Booking - Phases 5-7 (shipped 2026-01-27)
- v1.2 RLS Security Hardening - Phase 8 (shipped 2026-01-27)
- v1.3 Gift Enhancements - Phase 9 (shipped 2026-01-28)
- v2.0 Mobile App - Phases 10-14 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-4) - SHIPPED 2026-01-26</summary>

See: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>v1.1 Gift Booking (Phases 5-7) - SHIPPED 2026-01-27</summary>

See: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>v1.2 RLS Security Hardening (Phase 8) - SHIPPED 2026-01-27</summary>

See: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>v1.3 Gift Enhancements (Phase 9) - SHIPPED 2026-01-28</summary>

See: `.planning/milestones/v1.3-ROADMAP.md`

</details>

### v2.0 Mobile App (In Progress)

**Milestone Goal:** Deliver React Native mobile app for guests covering pre-trip preparation, during-trip experience, and post-trip alumni engagement.

**Phase Numbering:**
- Integer phases (10, 11, 12, 13, 14): Planned milestone work
- Decimal phases (10.1, 10.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 10: Foundation (Auth + API Integration)** - Mobile app can authenticate guests and call existing tRPC API
- [ ] **Phase 11: Pre-Trip Experience** - Guest can prepare for trip, connect with fellow travelers, and access offline itinerary
- [ ] **Phase 12: During-Trip Experience** - Guest receives essential daily support with itinerary, concierge chat, and safety features
- [ ] **Phase 13: Alumni Engagement** - Guest stays engaged post-trip with transformation tracking, referrals, and rebooking
- [ ] **Phase 14: Production Polish** - Mobile app published to App Store and Google Play with production-ready quality

## Phase Details

### Phase 10: Foundation (Auth + API Integration)

**Goal**: Mobile app can authenticate guests via Clerk and call existing tRPC API with full type safety

**Depends on**: Nothing (first phase of v2.0)

**Requirements**: MOB-SETUP-01, MOB-AUTH-01, MOB-AUTH-02

**Success Criteria** (what must be TRUE):
1. Guest can log in with email/password on mobile app
2. Guest can use Face ID or Touch ID for biometric login
3. Guest can view their bookings from tRPC API on mobile dashboard
4. Developer can build and run app on iOS and Android simulators

**Plans**: 3 plans in 3 waves

Plans:
- [ ] 10-01-PLAN.md — Scaffold Expo app with TypeScript, Expo Router, and NativeWind
- [ ] 10-02-PLAN.md — Implement Clerk auth and tRPC client with Bearer tokens
- [ ] 10-03-PLAN.md — Add biometrics and build authenticated dashboard with bookings

### Phase 11: Pre-Trip Experience

**Goal**: Guest can prepare for trip, connect with fellow travelers, and download offline itinerary

**Depends on**: Phase 10

**Requirements**: MOB-PRETRIP-01, MOB-PRETRIP-02, MOB-PRETRIP-03, MOB-PRETRIP-04, MOB-PRETRIP-05, MOB-PRETRIP-06, MOB-PRETRIP-07

**Success Criteria** (what must be TRUE):
1. Guest can see countdown timer to trip departure date
2. Guest can complete pre-trip checklist items (upload passport, review itinerary, etc.)
3. Guest can upload passport document via camera or photo library
4. Guest can view list of fellow travelers who opted in
5. Guest can send and receive messages in trip group chat
6. Guest can view and customize packing list
7. Guest can download itinerary and view it offline without internet connection

**Plans**: TBD

Plans:
- [ ] 11-01: TBD during phase planning

### Phase 12: During-Trip Experience

**Goal**: Guest receives essential daily support with itinerary, concierge chat, emergency SOS, photo journal, and group activities

**Depends on**: Phase 11

**Requirements**: MOB-TRIP-01, MOB-TRIP-02, MOB-TRIP-03, MOB-TRIP-04, MOB-TRIP-05, MOB-TRIP-06, MOB-TRIP-07, MOB-TRIP-08, MOB-TRIP-09

**Success Criteria** (what must be TRUE):
1. Guest can view daily itinerary with all scheduled activities
2. Guest can check in to activities to track attendance
3. Guest can send and receive messages with 24/7 concierge
4. Guest can trigger emergency SOS button that sends GPS location to operator
5. Guest can book available pickleball courts
6. Guest can find other guests looking to play pickleball
7. Guest can upload photos to their personal trip journal
8. Guest can view group photo gallery with all guest photos
9. Guest can request transportation (car, tuk-tuk, etc.)

**Plans**: TBD

Plans:
- [ ] 12-01: TBD during phase planning

### Phase 13: Alumni Engagement

**Goal**: Guest stays engaged post-trip with transformation journey summary, alumni directory, referral program, rebooking, passport stamps, and testimonials

**Depends on**: Phase 12

**Requirements**: MOB-ALUMNI-01, MOB-ALUMNI-02, MOB-ALUMNI-03, MOB-ALUMNI-04, MOB-ALUMNI-05, MOB-ALUMNI-06

**Success Criteria** (what must be TRUE):
1. Guest can view transformation journey summary (before/after metrics, photos, reflections)
2. Guest can browse alumni directory and search by name or trip
3. Guest can refer friends and track referral status and rewards
4. Guest can rebook next trip with alumni discount applied
5. Guest can view earned passport stamps and achievement progress
6. Guest can create and submit testimonial with photos and text

**Plans**: TBD

Plans:
- [ ] 13-01: TBD during phase planning

### Phase 14: Production Polish

**Goal**: Mobile app published to App Store and Google Play with production-ready push notifications, deep linking, and app store optimization

**Depends on**: Phase 13

**Requirements**: None (polish and deployment)

**Success Criteria** (what must be TRUE):
1. App is published and downloadable from Apple App Store
2. App is published and downloadable from Google Play Store
3. Guest receives push notifications for trip countdown, activity reminders, and important updates
4. Guest can tap notification and app opens to correct screen (deep linking works)
5. Offline mode gracefully degrades when internet unavailable (cached data shows, mutations require online)

**Plans**: TBD

Plans:
- [ ] 14-01: TBD during phase planning

## Progress

**Execution Order:**
Phases execute in numeric order: 10 -> 11 -> 12 -> 13 -> 14

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 10. Foundation | v2.0 | 0/3 | Ready to execute | - |
| 11. Pre-Trip | v2.0 | 0/? | Not started | - |
| 12. During-Trip | v2.0 | 0/? | Not started | - |
| 13. Alumni | v2.0 | 0/? | Not started | - |
| 14. Polish | v2.0 | 0/? | Not started | - |
