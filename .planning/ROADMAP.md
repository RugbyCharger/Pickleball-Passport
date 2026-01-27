# Roadmap: Pickleball Passport v1.1 Gift Booking

## Overview

v1.1 adds a complete gift booking system to the platform, enabling guests to purchase transformation trips as gifts for others. The milestone spans three phases: building the purchase flow UI, implementing the recipient experience (notifications, accept, decline), and adding operational features (expiration handling, dashboard visibility, admin views). Several backend components already exist (state machine, tRPC router, cron jobs) - this milestone wires up the UI and fills remaining gaps.

## Milestones

- v1.0 MVP - Phases 1-4 (shipped 2026-01-26)
- v1.1 Gift Booking - Phases 5-7 (in progress)

## Phases

### v1.1 Gift Booking (In Progress)

**Milestone Goal:** Enable guests to purchase transformation trips as gifts, with full lifecycle management from purchase through acceptance/decline/expiration.

- [ ] **Phase 5: Gift Purchase Flow** - UI/UX for buying a gift during checkout
- [ ] **Phase 6: Gift Recipient Experience** - Notifications, acceptance, and decline handling
- [ ] **Phase 7: Gift Operations** - Expiration, dashboard views, and admin visibility

## Phase Details

### Phase 5: Gift Purchase Flow
**Goal**: Purchaser can buy a transformation trip as a gift for someone else
**Depends on**: v1.0 complete (booking flow exists)
**Requirements**: GIFT-01, GIFT-02, GIFT-03, GIFT-04, GIFT-05, GIFT-06
**Success Criteria** (what must be TRUE):
  1. User can toggle "This is a gift" on the booking configuration page
  2. User can enter recipient name, email, and optional personal message
  3. User can choose immediate delivery or schedule a future delivery date
  4. Completed gift purchase creates a PENDING gift booking with acceptance token
  5. Purchaser receives confirmation email with gift details after payment
**Plans**: 2 plans (Wave 1 - parallel)

Plans:
- [ ] 05-01-PLAN.md — Wire payment flow to call createGift mutation for gift bookings
- [ ] 05-02-PLAN.md — Add gift validation to review page before payment

### Phase 6: Gift Recipient Experience
**Goal**: Recipient can receive, view, accept, or decline a gift
**Depends on**: Phase 5
**Requirements**: GIFT-07, GIFT-08, GIFT-09, GIFT-10, GIFT-11, GIFT-12, GIFT-13, GIFT-14, GIFT-15, GIFT-16
**Success Criteria** (what must be TRUE):
  1. Recipient receives email with gift details, personal message, and accept link when gift is sent
  2. Scheduled gifts are automatically sent at configured delivery date
  3. Recipient can view gift details and accept (transferring booking ownership to their account)
  4. Recipient can decline gift via dedicated decline page, triggering refund to purchaser
  5. Both purchaser and recipient receive confirmation emails on accept or decline
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD
- [ ] 06-03: TBD

### Phase 7: Gift Operations
**Goal**: Gift lifecycle is fully managed with visibility for purchaser and admin
**Depends on**: Phase 6
**Requirements**: GIFT-17, GIFT-18, GIFT-19, GIFT-20, GIFT-21, GIFT-22
**Success Criteria** (what must be TRUE):
  1. Gifts automatically expire 30 days after SENT state if no response
  2. Expired gifts trigger automatic refund to purchaser with notification email
  3. Purchaser can view gift status (pending/sent/accepted/declined/expired) in their dashboard
  4. Admin can view all gift bookings with status filter in admin dashboard
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

## Progress

**Execution Order:** Phases execute in numeric order: 5 -> 6 -> 7

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 5. Gift Purchase Flow | v1.1 | 0/2 | Planned | - |
| 6. Gift Recipient Experience | v1.1 | 0/TBD | Not started | - |
| 7. Gift Operations | v1.1 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-27*
*Milestone: v1.1 Gift Booking*
