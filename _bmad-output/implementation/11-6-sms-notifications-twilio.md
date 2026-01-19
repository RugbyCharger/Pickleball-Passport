# Story 11.6: SMS Notifications with Twilio

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a guest on my trip,
I want to receive SMS notifications for urgent updates,
So that I don't miss important information that requires immediate attention.

## Acceptance Criteria

### AC-1: Twilio Integration Setup

- [ ] Twilio account created and phone number provisioned
- [ ] Twilio npm package installed (`twilio`)
- [ ] Environment variables configured:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER` (provisioned phone number, e.g., "+1 555 123 4567")
- [ ] Configuration verification function
- [ ] Log warning if Twilio not configured (non-blocking)

### AC-2: SMS Service Library

- [ ] Create `lib/sms/twilio.ts` following pattern from `lib/email/sendgrid.ts`
- [ ] Core function: `sendSMS(options: SendSMSOptions): Promise<void>`
- [ ] Send options interface:
  - `to: string` (E.164 format: "+15551234567")
  - `message: string` (brief, actionable text)
  - `from?: string` (optional override of default Twilio number)
- [ ] Error handling: Log errors, don't throw (non-blocking for critical flows)
- [ ] Lazy initialization (similar to SendGrid pattern)
- [ ] Configuration check: `isConfigured(): boolean`

### AC-3: SMS Notification Templates

- [ ] Create `lib/sms/templates.ts` for SMS message builders
- [ ] Template functions for each use case:
  - `paymentFailureSMS(bookingReference, amount, retryLink): string`
  - `flightDelaySMS(tripDate, newTime, contactInfo): string`
  - `itineraryChangeSMS(bookingReference, changeDetails, dashboardLink): string`
  - `emergencyAlertSMS(alertMessage, contactInfo): string`
- [ ] Messages must be:
  - Brief (SMS 160 character limit per segment, use concatenation if needed)
  - Actionable (include link to app/dashboard when relevant)
  - Clear about urgency
  - Include booking reference when applicable

### AC-4: Payment Failure SMS

- [ ] Trigger: When payment retry fails (after all retry attempts exhausted)
- [ ] Recipient: Guest's phone number from booking/user profile
- [ ] Message content:
  - "URGENT: Payment failed for booking {ref}. Amount: ${amount}. Update payment method: {link}"
- [ ] Integration point: `lib/payments/charge-installment.ts` or webhook handler
- [ ] Non-blocking: SMS failure doesn't prevent other error handling

### AC-5: Flight Delay SMS

- [ ] Admin-triggered: Admin can send SMS from booking/trip management page
- [ ] tRPC procedure: `admin.sendFlightDelaySMS(bookingId, delayInfo)`
- [ ] Message content:
  - "UPDATE: Your flight on {date} is delayed. New departure: {time}. Contact: {phone}. Details: {link}"
- [ ] Admin UI: Button on booking detail page to send flight delay SMS

### AC-6: Itinerary Change SMS

- [ ] Admin-triggered: Admin can send SMS when itinerary changes
- [ ] tRPC procedure: `admin.sendItineraryChangeSMS(bookingId, changeDetails)`
- [ ] Message content:
  - "IMPORTANT: Itinerary change for {ref}: {details}. View: {link}"
- [ ] Admin UI: Button on booking detail page to send itinerary change SMS

### AC-7: Emergency Alert SMS

- [ ] Admin-triggered: Emergency broadcast to all guests on active trip
- [ ] tRPC procedure: `admin.sendEmergencyAlertSMS(tripId, message)`
- [ ] Recipients: All confirmed bookings for the trip
- [ ] Message content:
  - "ALERT: {message}. Contact: {phone}. Stay safe: {link}"
- [ ] Admin UI: Emergency alert button on trip management page

### AC-8: Phone Number Storage

- [ ] Add `phoneNumber` field to User model (String, optional)
- [ ] Add `phoneNumber` field to GuestProfile model (String, optional)
- [ ] Validate phone number format (E.164 format: "+15551234567")
- [ ] Update guest profile completion to collect phone number
- [ ] Allow users to update phone number in profile settings

### AC-9: SMS Preferences

- [ ] Add SMS notification preferences to User model (or separate preferences table)
- [ ] Default: Opt-in for urgent SMS (payment failures, emergencies)
- [ ] Allow users to opt-out in notification preferences page
- [ ] Always allow SMS for emergencies (even if opted out)
- [ ] Store preference: `smsUrgentNotifications: boolean`

### AC-10: Error Handling & Logging

- [ ] All SMS sending wrapped in try-catch
- [ ] Log SMS attempts (success/failure) with context
- [ ] Use existing logger: `logger` from `@/lib/logger`
- [ ] Log without sensitive data (no full phone numbers, only last 4 digits)
- [ ] SMS failures are non-blocking (log error, continue execution)

### AC-11: Testing

- [ ] Unit tests for SMS service functions
- [ ] Integration test: Send test SMS in development
- [ ] Mock Twilio for unit tests
- [ ] Test error handling (invalid phone number, API failure)
- [ ] Test message formatting (character limits, concatenation)

## Tasks / Subtasks

- [ ] Task 1: Twilio Package Installation (AC: 1)
  - [ ] Install `twilio` package: `pnpm add twilio`
  - [ ] Add environment variables to `.env.example`
  - [ ] Document Twilio setup in README

- [ ] Task 2: SMS Service Library (AC: 1, 2)
  - [ ] Create `lib/sms/twilio.ts`
  - [ ] Implement `sendSMS()` function
  - [ ] Implement `isConfigured()` function
  - [ ] Follow SendGrid pattern for initialization

- [ ] Task 3: SMS Templates (AC: 3)
  - [ ] Create `lib/sms/templates.ts`
  - [ ] Implement payment failure template
  - [ ] Implement flight delay template
  - [ ] Implement itinerary change template
  - [ ] Implement emergency alert template

- [ ] Task 4: Database Schema Updates (AC: 8, 9)
  - [ ] Add `phoneNumber` to User model
  - [ ] Add `phoneNumber` to GuestProfile model
  - [ ] Add `smsUrgentNotifications` to User model (default: true)
  - [ ] Create Prisma migration

- [ ] Task 5: Payment Failure SMS Integration (AC: 4)
  - [ ] Add SMS sending to payment retry failure handler
  - [ ] Use payment failure SMS template
  - [ ] Check user preference before sending

- [ ] Task 6: Admin SMS Procedures (AC: 5, 6, 7)
  - [ ] Create `admin.sendFlightDelaySMS` tRPC procedure
  - [ ] Create `admin.sendItineraryChangeSMS` tRPC procedure
  - [ ] Create `admin.sendEmergencyAlertSMS` tRPC procedure
  - [ ] Add to admin router

- [ ] Task 7: Admin UI for SMS (AC: 5, 6, 7)
  - [ ] Add "Send Flight Delay SMS" button to booking detail page
  - [ ] Add "Send Itinerary Change SMS" button to booking detail page
  - [ ] Add "Send Emergency Alert" button to trip management page
  - [ ] Add confirmation dialogs before sending

- [ ] Task 8: User Profile Updates (AC: 8)
  - [ ] Add phone number field to guest profile form
  - [ ] Add phone number to user profile settings
  - [ ] Add phone number validation (E.164 format)

- [ ] Task 9: SMS Preferences (AC: 9)
  - [ ] Update notification preferences page with SMS options
  - [ ] Allow opt-out of urgent SMS (except emergencies)
  - [ ] Respect preferences when sending SMS

- [ ] Task 10: Testing (AC: 11)
  - [ ] Write unit tests for SMS service
  - [ ] Write unit tests for SMS templates
  - [ ] Test integration in development environment
  - [ ] Document testing with Twilio test credentials

## Dev Notes

### Twilio Setup

```bash
# Install package
pnpm add twilio

# Environment variables (.env)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567  # Provisioned number from Twilio
```

### SMS Service Pattern (similar to SendGrid)

```typescript
// lib/sms/twilio.ts
import twilio from 'twilio';
import { logger } from '@/lib/logger';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

export interface SendSMSOptions {
  to: string; // E.164 format: "+15551234567"
  message: string;
  from?: string; // Optional override
}

export async function sendSMS(options: SendSMSOptions): Promise<void> {
  // Implementation
}

export function isConfigured(): boolean {
  return !!(accountSid && authToken && phoneNumber);
}
```

### Phone Number Validation

```typescript
// E.164 format validation
function isValidPhoneNumber(phone: string): boolean {
  // Format: +[country code][number]
  // Example: "+15551234567"
  return /^\+[1-9]\d{1,14}$/.test(phone);
}
```

### SMS Character Limits

- Single SMS: 160 characters (GSM-7 encoding)
- Concatenated SMS: 160 characters per segment (up to 255 segments)
- For this story: Keep messages under 160 characters when possible
- Include short links (bit.ly or app links) to save characters

### Database Schema Changes

```prisma
model User {
  // ... existing fields ...
  
  // E11-S6: SMS Notifications
  phoneNumber      String?  // E.164 format
  smsUrgentNotifications Boolean @default(true) // Opt-in for urgent SMS
}

model GuestProfile {
  // ... existing fields ...
  
  // E11-S6: SMS Notifications
  phoneNumber String? // E.164 format, can override user phone number
}
```

### Use Cases & Triggers

1. **Payment Failure (Automated)**
   - Trigger: After all retry attempts fail in installment payment
   - Location: `lib/payments/charge-installment.ts`
   - Message: Brief, include link to update payment method

2. **Flight Delay (Admin Triggered)**
   - Trigger: Admin action from booking detail page
   - Location: Admin dashboard
   - Message: Delay details, new time, contact info

3. **Itinerary Change (Admin Triggered)**
   - Trigger: Admin action when itinerary modified
   - Location: Admin dashboard
   - Message: Change summary, link to updated itinerary

4. **Emergency Alert (Admin Triggered)**
   - Trigger: Admin broadcast to all trip guests
   - Location: Trip management page
   - Message: Alert details, emergency contact, safety info

### Error Handling Strategy

- SMS failures should NOT block critical flows (payment processing, etc.)
- Log all SMS attempts (success/failure)
- For automated SMS (payment failures): Use `.catch(console.error)` pattern
- For admin-triggered SMS: Show success/error toast to admin
- Never throw errors from SMS service (log and return)

### Cost Considerations

- Twilio pricing: ~$0.0075 per SMS (US) to $0.05+ (international)
- Use SMS sparingly: Only for urgent, time-sensitive notifications
- Email remains primary communication channel
- SMS should complement, not replace, email notifications

## Dependencies

- E11-S1: SendGrid Integration (done) - Pattern reference
- E4: Payment Processing (done) - Payment failure integration point
- E5: Admin Dashboard (done) - Admin UI location
- E3: Booking System (done) - Booking/trip data models

## Dev Agent Record

### Agent Model Used

Auto (Claude)

### Implementation Date

2026-01-17
