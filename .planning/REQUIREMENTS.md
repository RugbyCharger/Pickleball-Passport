# Requirements: Pickleball Passport v1.1

**Defined:** 2026-01-27
**Core Value:** Guests can book a transformation trip and partners can refer members

## v1.1 Requirements: Gift Booking System

Enable guests to purchase transformation trips as gifts, with full lifecycle management.

### Gift Purchase Flow

- [ ] **GIFT-01**: Guest can toggle "This is a gift" during booking configuration
- [ ] **GIFT-02**: Guest can enter recipient name and email when booking as gift
- [ ] **GIFT-03**: Guest can write a personal message for the recipient (optional)
- [ ] **GIFT-04**: Guest can choose immediate delivery or schedule a future date
- [ ] **GIFT-05**: Gift booking creates with PENDING state and generates acceptance token
- [ ] **GIFT-06**: Purchaser receives confirmation email with gift details

### Gift Notification

- [ ] **GIFT-07**: Recipient receives gift notification email when state transitions to SENT
- [ ] **GIFT-08**: Gift notification email includes package details, message, and accept link
- [ ] **GIFT-09**: Scheduled gifts are sent by cron at configured delivery date

### Gift Acceptance

- [ ] **GIFT-10**: Recipient can view gift details via acceptance link (already built - verify)
- [ ] **GIFT-11**: Recipient can create account or login to accept gift (already built - verify)
- [ ] **GIFT-12**: Accepted gift transfers booking ownership to recipient
- [ ] **GIFT-13**: Both purchaser and recipient receive confirmation email on acceptance

### Gift Decline

- [ ] **GIFT-14**: Recipient can decline gift via dedicated decline page
- [ ] **GIFT-15**: Declined gift triggers refund to purchaser
- [ ] **GIFT-16**: Both purchaser and recipient receive notification on decline

### Gift Expiration

- [ ] **GIFT-17**: Gifts expire 30 days after SENT state if no response
- [ ] **GIFT-18**: Expired gift triggers refund to purchaser
- [ ] **GIFT-19**: Purchaser receives notification on gift expiration

### Dashboard & Visibility

- [ ] **GIFT-20**: Purchaser can view gift status in their dashboard
- [ ] **GIFT-21**: Purchaser can see recipient response (accepted/declined/pending)
- [ ] **GIFT-22**: Admin can view all gift bookings with status filter

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
| Partial gift (recipient pays difference) | Keep it simple — fully paid or not |
| Gift registry | Different product, out of scope |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GIFT-01 | TBD | Pending |
| GIFT-02 | TBD | Pending |
| GIFT-03 | TBD | Pending |
| GIFT-04 | TBD | Pending |
| GIFT-05 | TBD | Pending |
| GIFT-06 | TBD | Pending |
| GIFT-07 | TBD | Pending |
| GIFT-08 | TBD | Pending |
| GIFT-09 | TBD | Pending |
| GIFT-10 | TBD | Pending |
| GIFT-11 | TBD | Pending |
| GIFT-12 | TBD | Pending |
| GIFT-13 | TBD | Pending |
| GIFT-14 | TBD | Pending |
| GIFT-15 | TBD | Pending |
| GIFT-16 | TBD | Pending |
| GIFT-17 | TBD | Pending |
| GIFT-18 | TBD | Pending |
| GIFT-19 | TBD | Pending |
| GIFT-20 | TBD | Pending |
| GIFT-21 | TBD | Pending |
| GIFT-22 | TBD | Pending |

**Coverage:**
- v1.1 requirements: 22 total
- Mapped to phases: 0
- Unmapped: 22 ⚠️

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-27 after initial definition*
