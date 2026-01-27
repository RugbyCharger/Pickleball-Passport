# Requirements: Pickleball Passport v1.3

**Defined:** 2026-01-28
**Core Value:** Guests can book a transformation trip and partners can refer members

## v1.3 Requirements

Requirements for Gift Enhancements milestone. Gives purchasers control over pending gifts.

### Gift Management

- [ ] **GIFT-01**: Purchaser can cancel a PENDING gift before delivery (full refund)
- [ ] **GIFT-02**: Purchaser can edit the gift message before delivery (PENDING status only)
- [ ] **GIFT-03**: Purchaser can resend the gift notification email (SENT status, rate limited)

## Future Requirements

Deferred to future releases. Not in current roadmap.

### Gift Extensions

- **GIFT-EXT-01**: Purchaser can change scheduled delivery date
- **GIFT-EXT-02**: Purchaser can change recipient email address before delivery
- **GIFT-EXT-03**: Admin can manually trigger gift actions (cancel, resend)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Cancel SENT gifts | Recipient already notified, too complex |
| Partial refunds | Keep it simple - full refund or nothing |
| Gift message templates | Personalization is the point |
| Multiple gift messages | One message per gift |
| Recipient-initiated cancel | Only purchaser controls the gift |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| GIFT-01 | Phase 9 | Pending |
| GIFT-02 | Phase 9 | Pending |
| GIFT-03 | Phase 9 | Pending |

**Coverage:**
- v1.3 requirements: 3 total
- Mapped to phases: 3
- Unmapped: 0

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 after roadmap creation*
