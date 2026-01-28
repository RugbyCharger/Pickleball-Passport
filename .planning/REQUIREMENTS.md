# Requirements: v2.0 Mobile App

**Milestone:** v2.0 Mobile App
**Created:** 2026-01-28
**Core Value:** Guest can use mobile app for pre-trip preparation, during-trip experience, and post-trip alumni engagement

## v2.0 Requirements

### Setup & Authentication

- [x] **MOB-SETUP-01**: Developer can scaffold Expo React Native app with TypeScript
- [x] **MOB-AUTH-01**: Guest can log in with email/password via Clerk
- [x] **MOB-AUTH-02**: Guest can use biometric login (Face ID, Touch ID)

### Pre-Trip Experience

- [x] **MOB-PRETRIP-01**: Guest can view countdown to trip departure
- [x] **MOB-PRETRIP-02**: Guest can complete pre-trip checklist items
- [x] **MOB-PRETRIP-03**: Guest can upload passport document
- [x] **MOB-PRETRIP-04**: Guest can view fellow travelers (opt-in)
- [x] **MOB-PRETRIP-05**: Guest can chat with trip group before departure
- [x] **MOB-PRETRIP-06**: Guest can view and customize packing list
- [x] **MOB-PRETRIP-07**: Guest can download offline itinerary

### During-Trip Experience

- [x] **MOB-TRIP-01**: Guest can view daily itinerary with activities
- [x] **MOB-TRIP-02**: Guest can check in to activities
- [x] **MOB-TRIP-03**: Guest can chat with concierge 24/7
- [x] **MOB-TRIP-04**: Guest can trigger emergency SOS with GPS location
- [x] **MOB-TRIP-05**: Guest can book pickleball courts
- [x] **MOB-TRIP-06**: Guest can find other guests to play with
- [x] **MOB-TRIP-07**: Guest can upload photos to trip journal
- [x] **MOB-TRIP-08**: Guest can view group photo gallery
- [x] **MOB-TRIP-09**: Guest can request transportation

### Alumni Engagement

- [ ] **MOB-ALUMNI-01**: Guest can view transformation journey summary
- [ ] **MOB-ALUMNI-02**: Guest can browse alumni directory
- [ ] **MOB-ALUMNI-03**: Guest can refer friends and track referrals
- [ ] **MOB-ALUMNI-04**: Guest can rebook with alumni discount
- [ ] **MOB-ALUMNI-05**: Guest can earn passport stamps for achievements
- [ ] **MOB-ALUMNI-06**: Guest can create and submit testimonial

## Future Requirements

None identified for future milestones at this time.

## Out of Scope

- **SMS notifications** — Twilio stubs exist but not required for v2.0
- **In-app payments** — Use existing web checkout, deep link from app
- **Apple/Google Pay in app** — Web checkout handles payments
- **Video calls in app** — External Zoom links sufficient for alumni meetups
- **Public social feed** — Private trip experience, not social network
- **AI trip planning** — Curated packages, not AI-generated itineraries
- **Multi-language support** — English only for v2.0
- **Offline mutations** — View-only offline mode for v2.0 (read cached data, require online for actions)

## Technical Constraints

Based on research findings:

1. **tRPC Version:** Must pin to v11.3.1 (not 11.4+) for React Native/Hermes compatibility
2. **Clerk UI:** No prebuilt components on mobile — custom auth UI required
3. **Chat Solution:** Supabase Realtime may have WebSocket issues — spike during pre-trip phase
4. **Images:** Resize to max 1920x1080, compress to <2MB before upload
5. **OneSignal:** Must be first plugin in app.json for iOS push capability
6. **Apple Sign-In:** Required if offering Google OAuth (App Store policy)

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| MOB-SETUP-01 | 10 | Complete |
| MOB-AUTH-01 | 10 | Complete |
| MOB-AUTH-02 | 10 | Complete |
| MOB-PRETRIP-01 | 11 | Complete |
| MOB-PRETRIP-02 | 11 | Complete |
| MOB-PRETRIP-03 | 11 | Complete |
| MOB-PRETRIP-04 | 11 | Complete |
| MOB-PRETRIP-05 | 11 | Complete |
| MOB-PRETRIP-06 | 11 | Complete |
| MOB-PRETRIP-07 | 11 | Complete |
| MOB-TRIP-01 | 12 | Complete |
| MOB-TRIP-02 | 12 | Complete |
| MOB-TRIP-03 | 12 | Complete |
| MOB-TRIP-04 | 12 | Complete |
| MOB-TRIP-05 | 12 | Complete |
| MOB-TRIP-06 | 12 | Complete |
| MOB-TRIP-07 | 12 | Complete |
| MOB-TRIP-08 | 12 | Complete |
| MOB-TRIP-09 | 12 | Complete |
| MOB-ALUMNI-01 | 13 | Pending |
| MOB-ALUMNI-02 | 13 | Pending |
| MOB-ALUMNI-03 | 13 | Pending |
| MOB-ALUMNI-04 | 13 | Pending |
| MOB-ALUMNI-05 | 13 | Pending |
| MOB-ALUMNI-06 | 13 | Pending |

---
*26 requirements across 4 categories*
