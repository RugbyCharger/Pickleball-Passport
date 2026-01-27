# Requirements: Pickleball Passport v1.1

**Defined:** 2026-01-27
**Core Value:** Guests can book a transformation trip and partners can refer members

## v1.1 Requirements: Gift Booking System

Enable guests to purchase transformation trips as gifts, with full lifecycle management.

### Gift Purchase Flow

- [x] **GIFT-01**: Guest can toggle "This is a gift" during booking configuration
- [x] **GIFT-02**: Guest can enter recipient name and email when booking as gift
- [x] **GIFT-03**: Guest can write a personal message for the recipient (optional)
- [x] **GIFT-04**: Guest can choose immediate delivery or schedule a future date
- [x] **GIFT-05**: Gift booking creates with PENDING state and generates acceptance token
- [x] **GIFT-06**: Purchaser receives confirmation email with gift details

### Gift Notification

- [x] **GIFT-07**: Recipient receives gift notification email when state transitions to SENT
- [x] **GIFT-08**: Gift notification email includes package details, message, and accept link
- [x] **GIFT-09**: Scheduled gifts are sent by cron at configured delivery date

### Gift Acceptance

- [x] **GIFT-10**: Recipient can view gift details via acceptance link (already built - verify)
- [x] **GIFT-11**: Recipient can create account or login to accept gift (already built - verify)
- [x] **GIFT-12**: Accepted gift transfers booking ownership to recipient
- [x] **GIFT-13**: Both purchaser and recipient receive confirmation email on acceptance

### Gift Decline

- [x] **GIFT-14**: Recipient can decline gift via dedicated decline page
- [x] **GIFT-15**: Declined gift triggers refund to purchaser
- [x] **GIFT-16**: Both purchaser and recipient receive notification on decline

### Gift Expiration

- [x] **GIFT-17**: Gifts expire 30 days after SENT state if no response
- [x] **GIFT-18**: Expired gift triggers refund to purchaser
- [x] **GIFT-19**: Purchaser receives notification on gift expiration

### Dashboard & Visibility

- [x] **GIFT-20**: Purchaser can view gift status in their dashboard
- [x] **GIFT-21**: Purchaser can see recipient response (accepted/declined/pending)
- [x] **GIFT-22**: Admin can view all gift bookings with status filter

## v2 Requirements

Deferred to future release.

### Gift Enhancements

- **GIFT-F01**: Purchaser can cancel pending gift before delivery
- **GIFT-F02**: Purchaser can edit gift message before delivery
- **GIFT-F03**: Purchaser can resend gift notification
- **GIFT-F04**: Custom gift presentation themes (birthday, holiday, etc.)
- **GIFT-F05**: Physical gift card option with QR code

## Out of Scope

| Feature | Reason |
|---------|--------|
| Gift card balance system | Not a gift card, it's a specific booking gift |
| Multiple recipients | One gift = one booking = one recipient |
| Partial gift (recipient pays difference) | Keep it simple - fully paid or not |
| Gift registry | Different product, out of scope |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GIFT-01 | Phase 5 | Complete |
| GIFT-02 | Phase 5 | Complete |
| GIFT-03 | Phase 5 | Complete |
| GIFT-04 | Phase 5 | Complete |
| GIFT-05 | Phase 5 | Complete |
| GIFT-06 | Phase 5 | Complete |
| GIFT-07 | Phase 6 | Complete |
| GIFT-08 | Phase 6 | Complete |
| GIFT-09 | Phase 6 | Complete |
| GIFT-10 | Phase 6 | Complete |
| GIFT-11 | Phase 6 | Complete |
| GIFT-12 | Phase 6 | Complete |
| GIFT-13 | Phase 6 | Complete |
| GIFT-14 | Phase 6 | Complete |
| GIFT-15 | Phase 6 | Complete |
| GIFT-16 | Phase 6 | Complete |
| GIFT-17 | Phase 7 | Complete |
| GIFT-18 | Phase 7 | Complete |
| GIFT-19 | Phase 7 | Complete |
| GIFT-20 | Phase 7 | Complete |
| GIFT-21 | Phase 7 | Complete |
| GIFT-22 | Phase 7 | Complete |

**Coverage:**
- v1.1 requirements: 22 total
- Completed: 22
- Remaining: 0

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-27 after roadmap creation*
