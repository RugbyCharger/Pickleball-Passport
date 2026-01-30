# Requirements: v2.1 Communication & Content

**Milestone:** v2.1 Communication & Content
**Created:** 2026-01-30
**Source:** BMAD Epics E11 (Communication System) + E12 (Content Management) — P1 stories only
**Core Value:** Operators can communicate with guests throughout the trip lifecycle

## v2.1 Requirements

### Email Sequences

- [x] **COMM-01**: Guest receives payment reminder email 7 days before scheduled installment
- [x] **COMM-02**: Guest receives pre-trip nurture sequence (60/30/14/7/1 days before departure)
- [x] **COMM-03**: Guest receives post-trip follow-up emails (3/7/14/30/60 days after return)

### SMS Notifications

- [x] **SMS-01**: System can send SMS via Twilio integration
- [x] **SMS-02**: Guest receives SMS for urgent updates (flight delays, itinerary changes, emergencies)

### Testimonial Workflow

- [ ] **TEST-01**: Guest can submit testimonial (video, written, or photo) via web or mobile
- [ ] **TEST-02**: Admin can review testimonials and approve/reject/request edits
- [ ] **TEST-03**: Published testimonials display on website testimonials page

## Future Requirements

Deferred to v2.2 or later (P2/P3 stories):

### Communication (P2)
- **COMM-04**: Guest can manage email preferences (unsubscribe by category)
- **COMM-05**: Admin can send broadcast messages to trip groups
- **COMM-06**: System sends automated NPS surveys 30 days after trip

### Content (P2/P3)
- **CONT-01**: Admin can manage photo galleries (upload, tag, feature)
- **CONT-02**: Admin can manage marketing asset versions
- **CONT-03**: System auto-transcodes uploaded videos via Mux
- **CONT-04**: System tracks content consent per testimonial/photo
- **CONT-05**: Admin can search content by tags and keywords

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat in admin | Concierge chat exists in mobile app, no web admin chat needed |
| Video conferencing | External Zoom links sufficient |
| AI-generated email content | Manual templates sufficient for v2.1 |
| Multi-language emails | English only for now |
| WhatsApp Business API | Existing WhatsApp integration via manual groups sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| COMM-01 | Phase 15 | Complete |
| COMM-02 | Phase 15 | Complete |
| COMM-03 | Phase 15 | Complete |
| SMS-01 | Phase 16 | Complete |
| SMS-02 | Phase 16 | Complete |
| TEST-01 | Phase 17 | Pending |
| TEST-02 | Phase 17 | Pending |
| TEST-03 | Phase 17 | Pending |

**Coverage:**
- v2.1 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-30*
*Roadmap created: 2026-01-30*
*Source: BMAD epics-and-stories-Pickleball-Passport-2025-12-28.md (E11-S3/S4/S5/S6/S7, E12-S1/S2/S3)*
