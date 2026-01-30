# Roadmap: Pickleball Passport

## Milestones

- ✅ **v1.0 MVP** - Phases 1-4 (shipped 2026-01-26)
- ✅ **v1.1 Gift Booking** - Phases 5-7 (shipped 2026-01-27)
- ✅ **v1.2 RLS Security** - Phase 8 (shipped 2026-01-27)
- ✅ **v1.3 Gift Enhancements** - Phase 9 (shipped 2026-01-28)
- ✅ **v2.0 Mobile App** - Phases 10-14 (shipped 2026-01-28)
- 🚧 **v2.1 Communication & Content** - Phases 15-17 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) - SHIPPED 2026-01-26</summary>

See: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 Gift Booking (Phases 5-7) - SHIPPED 2026-01-27</summary>

See: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 RLS Security (Phase 8) - SHIPPED 2026-01-27</summary>

See: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>✅ v1.3 Gift Enhancements (Phase 9) - SHIPPED 2026-01-28</summary>

See: `.planning/milestones/v1.3-ROADMAP.md`

</details>

<details>
<summary>✅ v2.0 Mobile App (Phases 10-14) - SHIPPED 2026-01-28</summary>

See: `.planning/milestones/v2.0-ROADMAP.md`

</details>

### 🚧 v2.1 Communication & Content (In Progress)

**Milestone Goal:** Operators can communicate with guests throughout the trip lifecycle via automated email sequences, urgent SMS notifications, and curated testimonials.

#### Phase 15: Email Infrastructure
**Goal**: Guests receive post-trip follow-up emails at key moments (COMM-01 and COMM-02 already implemented)
**Depends on**: Phase 14 (existing SendGrid integration)
**Requirements**: COMM-01 (existing), COMM-02 (existing), COMM-03 (to implement)
**Success Criteria** (what must be TRUE):
  1. Guest receives payment reminder email 7 days before scheduled installment (COMM-01 - existing)
  2. Guest receives pre-trip emails at 60/30/14/7/1 days before departure (COMM-02 - existing)
  3. Guest receives post-trip emails at 3/7/14/30/60 days after return (COMM-03 - this phase)
  4. Scheduled email jobs run reliably via cron or queue system
  5. Post-trip emails respect user notification preferences
**Plans**: 1 plan

Plans:
- [x] 15-01-PLAN.md — Post-trip follow-up email sequence (COMM-03)

#### Phase 16: SMS Integration
**Goal**: Guests receive urgent SMS notifications for time-sensitive updates
**Depends on**: Phase 15
**Requirements**: SMS-01, SMS-02
**Success Criteria** (what must be TRUE):
  1. System can send SMS via Twilio (infrastructure works)
  2. Guest receives SMS for flight delays within minutes of notification
  3. Guest receives SMS for urgent itinerary changes
  4. Guest receives SMS for emergency broadcasts
  5. Admin can trigger urgent SMS from admin panel
**Plans**: 1 plan

Plans:
- [ ] 16-01-PLAN.md — Complete SMS admin procedures and integrate UI

#### Phase 17: Testimonial Workflow
**Goal**: Guests can share their transformation stories, admin can curate content, website displays approved testimonials
**Depends on**: Phase 16
**Requirements**: TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. Guest can submit testimonial (video URL, written text, or photo) via web or mobile
  2. Admin can view pending testimonials in admin panel
  3. Admin can approve, reject, or request edits on testimonials
  4. Approved testimonials display on public testimonials page
  5. Testimonial submission links to existing booking/guest record
**Plans**: TBD

Plans:
- [ ] 17-01: Testimonial Submission & Backend
- [ ] 17-02: Admin Review & Public Display

## Progress

**Execution Order:** Phases 15 → 16 → 17

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-4 | v1.0 MVP | 9/9 | Complete | 2026-01-26 |
| 5-7 | v1.1 Gift | 8/8 | Complete | 2026-01-27 |
| 8 | v1.2 RLS | 2/2 | Complete | 2026-01-27 |
| 9 | v1.3 Gift Enhancements | 1/1 | Complete | 2026-01-28 |
| 10-14 | v2.0 Mobile | 22/22 | Complete | 2026-01-28 |
| 15. Email Infrastructure | v2.1 | 1/1 | Complete | 2026-01-30 |
| 16. SMS Integration | v2.1 | 0/1 | Not started | - |
| 17. Testimonial Workflow | v2.1 | 0/2 | Not started | - |

---
*Roadmap created: 2026-01-30*
*Milestone: v2.1 Communication & Content*
