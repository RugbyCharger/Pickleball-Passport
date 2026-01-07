# Story 3-16: Booking Modification Test Plan

**Story**: Booking Modification (Change Add-Ons)
**Epic**: E3 - Booking System
**Status**: Testing Phase
**Created**: 2026-01-08

---

## Test Overview

This test plan validates the complete booking modification feature that allows guests to add or remove add-ons if >60 days before trip with automatic price adjustments.

### Key Features to Test
- ✅ Eligibility validation (>60 days, CONFIRMED status)
- ✅ Price increase handling (new Stripe PaymentIntent)
- ✅ Price decrease handling (partial refund)
- ✅ Atomic database transactions
- ✅ Email confirmation delivery
- ✅ Mobile responsive UI
- ✅ Accessibility compliance

---

## Pre-Test Setup

### Database Requirements
1. **Test User Account** with guest profile
2. **Test Booking** with:
   - Status: `CONFIRMED`
   - Trip assigned with startDate >60 days in future
   - At least 2-3 add-ons already selected
   - Original payment recorded in database

3. **Available Add-Ons** in database:
   - At least 5 medical add-ons
   - At least 5 wellness add-ons
   - Various price points ($500 - $5,000)

### Test Environment
- **Browser**: Chrome/Firefox/Safari (latest)
- **Mobile**: iOS Safari / Android Chrome
- **Stripe**: Test mode with test cards
- **SendGrid**: Development API key configured

### Test Cards (Stripe Test Mode)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Authentication Required**: 4000 0025 0000 3155

---

## Test Cases

### TC-1: Eligibility - Button Visibility

**Objective**: Verify "Modify Add-Ons" button displays only when eligible

**Preconditions**:
- User logged in
- Viewing booking details page

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | View CONFIRMED booking >60 days before trip | Button visible with blue outline | ⬜ |
| 2 | Hover over button | Tooltip does NOT appear | ⬜ |
| 3 | View booking <60 days before trip | Button disabled with tooltip | ⬜ |
| 4 | Read tooltip text | "Modifications allowed only 60+ days before trip" | ⬜ |
| 5 | View PENDING status booking | Button disabled or hidden | ⬜ |
| 6 | View booking with no trip assigned | Button hidden | ⬜ |
| 7 | View booking after trip started | Button disabled with tooltip | ⬜ |

**Acceptance Criteria**: AC-1

---

### TC-2: Modification Modal - Display

**Objective**: Verify modification confirmation modal shows correct booking info

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Click "Modify Add-Ons" button | Modal opens with animation | ⬜ |
| 2 | Check modal header | Shows "Modify Your Booking" | ⬜ |
| 3 | Check booking reference | Shows correct booking reference (e.g., PBP-2026-001234) | ⬜ |
| 4 | Check package name | Shows locked package (e.g., "Ultimate Wellness") | ⬜ |
| 5 | Check duration | Shows locked duration (e.g., "14 days") | ⬜ |
| 6 | Check accommodation | Shows locked tier (e.g., "Luxury") | ⬜ |
| 7 | Check current add-ons list | Shows all currently selected add-ons with prices | ⬜ |
| 8 | Check current total | Shows correct total price | ⬜ |
| 9 | Check modification rules | Explains what can/cannot be changed | ⬜ |
| 10 | Press ESC key | Modal closes | ⬜ |
| 11 | Click "Cancel" button | Modal closes without changes | ⬜ |
| 12 | Click "Continue to Configurator" | Navigates to `/booking/modify/[bookingId]` | ⬜ |

**Acceptance Criteria**: AC-2

---

### TC-3: Package Selector - Locked State

**Objective**: Verify package selector is locked in modification mode

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Navigate to modification flow | Lands on add-ons selection page | ⬜ |
| 2 | Check if package selector visible | Should show selected package with badge | ⬜ |
| 3 | Try to click on different package | No interaction, cursor shows not-allowed | ⬜ |
| 4 | Hover over locked package | Tooltip: "Cannot change package in modification mode" | ⬜ |
| 5 | Check visual indicator | Selected package has checkmark and "Current Selection" badge | ⬜ |

**Acceptance Criteria**: AC-3

---

### TC-4: Add-Ons Selection - Pre-Population

**Objective**: Verify add-ons are pre-populated from current booking

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | View medical add-ons selector | Currently selected add-ons are checked | ⬜ |
| 2 | Check visual indicator | Selected add-ons show "Currently Selected" badge | ⬜ |
| 3 | View wellness add-ons selector | Currently selected add-ons are checked | ⬜ |
| 4 | Uncheck a currently selected add-on | Checkbox unchecks, price updates | ⬜ |
| 5 | Check a new add-on | Checkbox checks, price updates | ⬜ |
| 6 | Re-check the previously unchecked add-on | Checkbox checks again | ⬜ |

**Acceptance Criteria**: AC-4

---

### TC-5: Pricing Summary - Modification Mode

**Objective**: Verify pricing summary shows original vs new totals

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | View pricing summary | Shows "Original Total" (grayed, strikethrough) | ⬜ |
| 2 | Check new total | Shows "New Total" prominently | ⬜ |
| 3 | Add expensive add-on ($3,000) | Price difference shows "+$3,000 to charge" in red | ⬜ |
| 4 | Remove expensive add-on ($2,000) | Price difference shows "-$2,000 refund" in green | ⬜ |
| 5 | Make net-zero change | Price difference shows "$0 - No payment adjustment" | ⬜ |
| 6 | Scroll page on mobile | Pricing summary stays visible (sticky) | ⬜ |

**Acceptance Criteria**: AC-5

---

### TC-6: Review Page - Change Summary

**Objective**: Verify review page displays comprehensive change summary

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Click "Continue to Review" | Navigates to review page | ⬜ |
| 2 | Check booking reference | Shows correct booking reference | ⬜ |
| 3 | Check "Added" section | Lists newly selected add-ons with prices in green | ⬜ |
| 4 | Check "Removed" section | Lists deselected add-ons with prices in red | ⬜ |
| 5 | Check original add-ons total | Shows correct original total | ⬜ |
| 6 | Check new add-ons total | Shows correct new total | ⬜ |
| 7 | Check price difference | Shows correct difference with adjustment type | ⬜ |
| 8 | Check payment explanation | Explains charge/refund clearly | ⬜ |
| 9 | Check terms checkbox | Required to confirm before proceeding | ⬜ |
| 10 | Click "Back to Add-Ons" | Returns to configurator with selections preserved | ⬜ |

**Acceptance Criteria**: AC-6

---

### TC-7: Price Increase - Payment Flow

**Objective**: Verify payment flow for add-ons price increase

**Preconditions**:
- Add expensive add-ons to increase price by $2,000+

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Add add-ons totaling +$2,000 | Price difference shows correctly | ⬜ |
| 2 | Navigate to review page | Shows charge amount correctly | ⬜ |
| 3 | Check terms acceptance | Checkbox is unchecked by default | ⬜ |
| 4 | Try to click "Confirm Modification" | Button is disabled | ⬜ |
| 5 | Check terms checkbox | Button becomes enabled | ⬜ |
| 6 | Click "Confirm Modification" | Button shows loading state | ⬜ |
| 7 | Check navigation | Redirects to payment page with Stripe Elements | ⬜ |
| 8 | Enter test card 4242... | Card input accepts | ⬜ |
| 9 | Submit payment | Payment processes successfully | ⬜ |
| 10 | Check redirect | Redirects to booking details page | ⬜ |
| 11 | Check success toast | Shows "Booking modified successfully!" | ⬜ |
| 12 | Check updated booking | Shows new add-ons and updated total | ⬜ |
| 13 | Check payment history | Shows new payment record for adjustment | ⬜ |

**Acceptance Criteria**: AC-7, AC-8, AC-12

---

### TC-8: Price Decrease - Refund Flow

**Objective**: Verify refund processing for add-ons price decrease

**Preconditions**:
- Remove expensive add-ons to decrease price by $1,000+

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Remove add-ons totaling -$1,000 | Price difference shows correctly | ⬜ |
| 2 | Navigate to review page | Shows refund amount correctly | ⬜ |
| 3 | Check refund explanation | "A refund of $1,000 will appear on your card in 5-10 business days" | ⬜ |
| 4 | Check terms checkbox | Check the box | ⬜ |
| 5 | Click "Confirm Modification" | Button shows loading state | ⬜ |
| 6 | Wait for processing | Processing completes (no payment page redirect) | ⬜ |
| 7 | Check redirect | Redirects to booking details page | ⬜ |
| 8 | Check success toast | Shows "Booking modified successfully!" | ⬜ |
| 9 | Check updated booking | Shows updated add-ons and reduced total | ⬜ |
| 10 | Check payment history | Shows refund record (negative amount) | ⬜ |
| 11 | Check Stripe dashboard | Refund appears in Stripe test dashboard | ⬜ |

**Acceptance Criteria**: AC-7, AC-9, AC-10, AC-12

---

### TC-9: No Price Change - Swap Add-Ons

**Objective**: Verify handling when price change is $0 (swap add-ons)

**Preconditions**:
- Swap add-ons with equal total (e.g., add $2K, remove $2K)

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Remove add-on worth $2,000 | Price shows -$2,000 | ⬜ |
| 2 | Add different add-on worth $2,000 | Price difference shows $0 | ⬜ |
| 3 | Navigate to review page | Shows "No payment adjustment needed" | ⬜ |
| 4 | Check payment section | Neutral styling, explains no charge/refund | ⬜ |
| 5 | Confirm modification | Processes immediately (no payment redirect) | ⬜ |
| 6 | Check booking details | Shows swapped add-ons | ⬜ |
| 7 | Check payment history | No new payment record created | ⬜ |

**Acceptance Criteria**: AC-10, AC-12

---

### TC-10: Email Confirmation

**Objective**: Verify booking modification email is sent correctly

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Complete modification (any price change) | Email sent to guest email address | ⬜ |
| 2 | Check email subject | "Booking Modified - [Booking Reference]" | ⬜ |
| 3 | Check email header | "Your booking has been successfully modified!" | ⬜ |
| 4 | Check "Added" section | Lists added add-ons with green styling | ⬜ |
| 5 | Check "Removed" section | Lists removed add-ons with red styling | ⬜ |
| 6 | Check price summary | Shows original total, new total, difference | ⬜ |
| 7 | Check payment details | Explains charge/refund appropriately | ⬜ |
| 8 | Check trip summary | Shows dates, destination | ⬜ |
| 9 | Check portal link | Link works and navigates to booking details | ⬜ |
| 10 | Check support info | Shows support contact information | ⬜ |

**Acceptance Criteria**: AC-11

---

### TC-11: Validation Errors - <60 Days

**Objective**: Verify error when attempting modification <60 days before trip

**Preconditions**:
- Booking with trip starting in <60 days

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | View booking details | "Modify Add-Ons" button disabled | ⬜ |
| 2 | Hover over button | Tooltip: "Modifications allowed only 60+ days before trip" | ⬜ |
| 3 | Try direct URL access to modification route | Server redirects or shows error | ⬜ |
| 4 | Check error message | Clear, actionable: "Please contact support for assistance" | ⬜ |

**Acceptance Criteria**: AC-7, AC-13

---

### TC-12: Validation Errors - Non-CONFIRMED Status

**Objective**: Verify error when booking is not CONFIRMED

**Preconditions**:
- Booking with status PENDING or DRAFT

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | View booking details | "Modify Add-Ons" button hidden or disabled | ⬜ |
| 2 | Try direct URL access | Server returns error | ⬜ |
| 3 | Check error message | "Only confirmed bookings can be modified" | ⬜ |

**Acceptance Criteria**: AC-7, AC-13

---

### TC-13: Validation Errors - Trip Started

**Objective**: Verify error when trip has already started

**Preconditions**:
- Booking with trip that already started

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | View booking details | "Modify Add-Ons" button disabled | ⬜ |
| 2 | Try direct URL access | Server returns error | ⬜ |
| 3 | Check error message | "Cannot modify - your trip has already started" | ⬜ |

**Acceptance Criteria**: AC-7, AC-13

---

### TC-14: Payment Failure Handling

**Objective**: Verify graceful handling of payment failures

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Add expensive add-ons (+$2,000) | Navigate to review page | ⬜ |
| 2 | Confirm modification | Redirects to payment page | ⬜ |
| 3 | Enter declined card (4000 0000 0000 0002) | Payment fails | ⬜ |
| 4 | Check error message | "Payment declined. Please try a different card." | ⬜ |
| 5 | Check booking database | Booking NOT modified (rollback successful) | ⬜ |
| 6 | Return to payment page | Can retry with different card | ⬜ |
| 7 | Enter successful card | Payment succeeds, booking modified | ⬜ |

**Acceptance Criteria**: AC-13

---

### TC-15: Accessibility - Keyboard Navigation

**Objective**: Verify full keyboard navigation support

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Tab to "Modify Add-Ons" button | Button receives focus outline | ⬜ |
| 2 | Press Enter | Modal opens | ⬜ |
| 3 | Tab through modal | Focus cycles within modal (focus trap) | ⬜ |
| 4 | Press ESC | Modal closes | ⬜ |
| 5 | Navigate to add-ons page | Tab to each checkbox | ⬜ |
| 6 | Press Space on checkbox | Checkbox toggles | ⬜ |
| 7 | Tab through review page | All interactive elements focusable | ⬜ |
| 8 | Check aria-labels | All buttons have descriptive labels | ⬜ |

**Acceptance Criteria**: AC-15

---

### TC-16: Accessibility - Screen Reader

**Objective**: Verify screen reader announcements

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Enable screen reader (NVDA/JAWS/VoiceOver) | Screen reader active | ⬜ |
| 2 | Navigate to "Modify Add-Ons" button | Announces "Modify booking add-ons" | ⬜ |
| 3 | Open modal | Announces modal title and description | ⬜ |
| 4 | Change add-on selection | Announces price change with role="status" | ⬜ |
| 5 | Navigate to review page | Announces headings and sections | ⬜ |
| 6 | Check error messages | Linked to inputs with aria-describedby | ⬜ |

**Acceptance Criteria**: AC-15

---

### TC-17: Mobile Responsiveness - iPhone

**Objective**: Verify mobile experience on iOS Safari

**Device**: iPhone 13/14/15 (or simulator)

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | View booking details on mobile | "Modify Add-Ons" button is touch-friendly (min 48px) | ⬜ |
| 2 | Tap button | Modal opens smoothly | ⬜ |
| 3 | Check modal layout | Full-width on mobile, readable text | ⬜ |
| 4 | Navigate to add-ons page | Cards stack vertically | ⬜ |
| 5 | Check pricing summary | Sticky footer stays visible while scrolling | ⬜ |
| 6 | Tap checkboxes | Large enough tap targets, adequate spacing | ⬜ |
| 7 | View review page | Single column layout | ⬜ |
| 8 | Check payment page | Stripe Elements mobile-optimized | ⬜ |

**Acceptance Criteria**: AC-16

---

### TC-18: Mobile Responsiveness - Android

**Objective**: Verify mobile experience on Android Chrome

**Device**: Samsung Galaxy/Pixel (or emulator)

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | View booking details | UI renders correctly | ⬜ |
| 2 | Test all interactions from TC-17 | Same results as iOS | ⬜ |
| 3 | Check touch targets | All buttons/links min 48px height | ⬜ |
| 4 | Check spacing | Adequate spacing between touch targets (min 8px) | ⬜ |

**Acceptance Criteria**: AC-16

---

### TC-19: Database Transaction Atomicity

**Objective**: Verify database updates are atomic (all-or-nothing)

**Technical Test** (requires database access):

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Record original booking state | Note bookingAddOns and totals | ⬜ |
| 2 | Complete modification | Booking updated successfully | ⬜ |
| 3 | Check BookingAddOn table | Old records deleted, new records created | ⬜ |
| 4 | Check Booking table | addOnsTotal and totalPrice updated correctly | ⬜ |
| 5 | Check Payment table | New payment record created (if price changed) | ⬜ |
| 6 | Simulate transaction failure (disconnect DB mid-transaction) | Entire transaction rolls back | ⬜ |
| 7 | Verify booking state | Booking unchanged (no partial updates) | ⬜ |

**Acceptance Criteria**: AC-10

---

### TC-20: Stripe Integration - Test Mode

**Objective**: Verify Stripe API calls are correct

**Technical Test** (check Stripe dashboard):

**Test Steps**:

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Complete modification with price increase | PaymentIntent created in Stripe | ⬜ |
| 2 | Check PaymentIntent metadata | Contains bookingId, bookingReference, type, adjustmentReason | ⬜ |
| 3 | Check PaymentIntent amount | Matches price difference (in cents) | ⬜ |
| 4 | Check PaymentIntent customer | Linked to existing customer ID | ⬜ |
| 5 | Complete modification with price decrease | Refund created in Stripe | ⬜ |
| 6 | Check Refund metadata | Contains bookingId, bookingReference, type, adjustmentReason | ⬜ |
| 7 | Check Refund amount | Matches absolute value of price difference | ⬜ |
| 8 | Check Refund reason | Set to "requested_by_customer" | ⬜ |

**Acceptance Criteria**: AC-8, AC-9

---

## Bug Tracking Template

Use this template to report any bugs found during testing:

```markdown
### Bug #[ID]: [Brief Description]

**Priority**: Critical / High / Medium / Low
**Test Case**: TC-[number]
**Browser/Device**: [Browser/Device info]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Screenshots**:
[Attach screenshots if applicable]

**Additional Context**:
[Any other relevant information]
```

---

## Test Summary Report

**Test Execution Date**: [Date]
**Tester**: [Name]
**Environment**: [Production/Staging/Development]

| Category | Total | Passed | Failed | Blocked | Pass Rate |
|----------|-------|--------|--------|---------|-----------|
| Eligibility | 7 | 0 | 0 | 0 | 0% |
| UI Components | 6 | 0 | 0 | 0 | 0% |
| Payment Flows | 12 | 0 | 0 | 0 | 0% |
| Validation | 9 | 0 | 0 | 0 | 0% |
| Accessibility | 14 | 0 | 0 | 0 | 0% |
| Mobile | 10 | 0 | 0 | 0 | 0% |
| Technical | 10 | 0 | 0 | 0 | 0% |
| **TOTAL** | **68** | **0** | **0** | **0** | **0%** |

---

## Manual Testing Checklist

Before marking Story 3-16 as "done", verify:

- [ ] All 20 test cases executed
- [ ] Zero critical or high-priority bugs
- [ ] Medium/low bugs documented in backlog
- [ ] TypeScript compilation successful (0 errors)
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Mobile testing on real devices completed
- [ ] Stripe test mode transactions verified
- [ ] Email delivery confirmed (SendGrid logs)
- [ ] Database transactions validated
- [ ] Code review completed
- [ ] Documentation updated

---

## Recommended Testing Order

1. **Day 1**: TC-1 to TC-6 (Core functionality)
2. **Day 2**: TC-7 to TC-9 (Payment flows)
3. **Day 3**: TC-10 to TC-14 (Email and error handling)
4. **Day 4**: TC-15 to TC-16 (Accessibility)
5. **Day 5**: TC-17 to TC-18 (Mobile)
6. **Day 6**: TC-19 to TC-20 (Technical validation)

---

## Sign-Off

**Developer**: _________________ Date: _________
**QA Tester**: _________________ Date: _________
**Product Owner**: _____________ Date: _________

---

**Document Version**: 1.0
**Last Updated**: 2026-01-08
**Story Status**: Ready for Testing
