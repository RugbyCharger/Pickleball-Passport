# Story 4-11: Affirm/Klarna Financing Integration

Status: done

## Story

As a guest who needs financing,
I want to apply for payment plans through Affirm or Klarna,
So that I can afford the trip.

## Acceptance Criteria

### AC-1: Affirm Payment Method Integration
- [x] Enable Affirm in PaymentIntent creation when FINANCING plan selected
- [x] Add 'affirm' to payment_method_types array
- [x] Include 'card' as fallback payment method
- [x] PaymentElement automatically displays Affirm option

### AC-2: Payment Plan Selector Update
- [x] Enable Financing option (remove disabled state)
- [x] Update badge from "Coming Soon" to "Available"
- [x] Add financing amount display
- [x] Show Affirm information in selector

### AC-3: Payment Form Affirm Support
- [x] PaymentElement automatically handles Affirm redirect
- [x] Add Affirm-specific messaging and information
- [x] Handle Affirm redirect flow (automatic via Stripe)
- [x] Show financing details when FINANCING plan selected

### AC-4: Affirm Redirect Flow
- [x] Customer redirected to Affirm checkout automatically
- [x] Return URL configured for confirmation page
- [x] Handle payment completion after Affirm approval
- [x] Handle cancellation/decline redirects

### AC-5: Error Handling
- [x] Add Affirm-specific error codes to payment error handler
- [x] Handle payment_method_not_available
- [x] Handle payment_intent_payment_attempt_expired
- [x] Handle payment_method_provider_decline (Affirm declined)
- [x] User-friendly error messages for Affirm failures

### AC-6: Webhook Processing
- [x] Webhook handler processes Affirm payments (same as card payments)
- [x] Payment method detection for Affirm
- [x] Booking confirmation email includes Affirm payment method
- [x] Booking status updated to CONFIRMED on payment success

### AC-7: Confirmation Page Handling
- [x] Handle PENDING_PAYMENT status (if Affirm cancelled)
- [x] Show appropriate message for pending payments
- [x] Provide link to complete payment with different method

### AC-8: Documentation
- [x] Update Stripe README with Affirm setup instructions
- [x] Document Affirm requirements (US/Canada, USD/CAD, $50 minimum)
- [x] Document error handling for Affirm
- [x] Update README.md with Affirm feature

## Implementation Details

### Files Modified

1. **lib/stripe/stripe-service.ts**
   - Added `paymentMethodTypes` parameter to `CreatePaymentIntentParams`
   - Updated `createPaymentIntent` to support custom payment method types
   - When `paymentMethodTypes` provided, uses explicit types instead of automatic

2. **lib/trpc/server/routers/booking.ts**
   - Added Affirm payment method types when `paymentPlan === 'FINANCING'`
   - Passes `paymentMethodTypes: ['affirm', 'card']` to payment intent creation

3. **components/booking/payment-plan-selector.tsx**
   - Enabled Financing option (removed `disabled: true`)
   - Changed badge from "Coming Soon" to "Available"
   - Added financing amount display
   - Added Affirm information section

4. **components/payments/payment-form.tsx**
   - Added Affirm-specific messaging
   - Added financing information section
   - Updated button text for Affirm ("Continue with Affirm")
   - Added redirect handling (automatic via Stripe PaymentElement)

5. **lib/stripe/payment-errors.ts**
   - Added Affirm-specific error codes:
     - `payment_method_not_available`
     - `payment_intent_payment_attempt_expired`
     - `payment_method_provider_decline`

6. **app/api/webhooks/stripe/route.ts**
   - Added `isAffirmFinancing` check
   - Updated payment method detection for Affirm
   - Updated booking confirmation email to show Affirm payment method

7. **app/booking/confirmation/confirmation-client.tsx**
   - Added PENDING_PAYMENT status check
   - Shows appropriate message if payment still pending
   - Provides link to complete payment

8. **lib/stripe/README.md**
   - Added Affirm setup instructions
   - Documented Affirm requirements and limitations
   - Added testing information

9. **README.md**
   - Updated with Affirm financing feature

### How It Works

1. **Customer selects Financing:**
   - Payment plan selector shows "Financing" option as enabled
   - Customer selects FINANCING payment plan

2. **Payment Intent Creation:**
   - Booking router creates payment intent with `paymentMethodTypes: ['affirm', 'card']`
   - Full booking amount is charged (no discount for Affirm)

3. **Payment Form:**
   - Stripe PaymentElement automatically shows Affirm as payment option
   - Customer can choose Affirm or card
   - If Affirm selected, customer clicks "Continue with Affirm"

4. **Affirm Redirect:**
   - Stripe automatically redirects to Affirm checkout
   - Customer completes credit application
   - Affirm processes application (instant decision)

5. **Return Flow:**
   - If approved: Redirected to confirmation page → Webhook processes payment → Booking confirmed
   - If declined: Redirected back to payment page with error → Can try card payment

6. **Webhook Processing:**
   - `payment_intent.succeeded` event received
   - Payment method detected as Affirm
   - Booking updated to CONFIRMED
   - Confirmation email sent with Affirm payment method

### Affirm Requirements

- **Geography:** US and Canada only
- **Currency:** USD or CAD
- **Minimum Amount:** $50 USD
- **Maximum Amount:** $30,000 USD
- **Payment Plans:** 3, 6, 12, or 18 months (determined by Affirm)
- **One-time payments only** (not for recurring subscriptions)

### Error Handling

**Affirm Not Available:**
- Transaction doesn't meet Affirm requirements
- Customer can use card payment instead

**Affirm Session Expired:**
- Payment intent expires after 12 hours if customer doesn't complete
- Customer can start new payment attempt

**Affirm Application Declined:**
- Credit application not approved
- Customer redirected back to payment page
- Can try different payment method (card)

### Testing

**Test Mode:**
- Affirm available in Stripe test mode
- Use test amounts ($50-$30,000)
- Test approval/decline scenarios

**Production:**
- Must enable Affirm in Stripe Dashboard
- Real credit checks performed
- Customer must be in US or Canada

## Dependencies

- E4-S1: Stripe Integration Setup (done)
- E4-S2: Payment Intent Creation (done)
- E4-S3: Payment Form UI (done)
- E4-S4: Webhook Handler (done)

## Dev Agent Record

### Agent Model Used
Auto (Claude)

### Implementation Date
2026-01-17
