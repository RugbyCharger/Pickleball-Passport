# Story 11-8: Admin Email Alerts

Status: ready-for-dev

## Story

As an admin managing the platform,
I want to receive email alerts for critical events that require my attention,
So that I can respond quickly to issues like payment failures, booking cancellations, and system errors.

## Acceptance Criteria

### AC-1: Payment Failure Admin Alerts

- [ ] When installment payment fails after all retry attempts: Send admin email alert
- [ ] Email includes:
  - Customer details (name, email, phone)
  - Booking information (reference, package, trip dates)
  - Payment details (installment number, amount, due date)
  - Failure history (all retry attempts with error codes)
  - Recommended actions
  - Links to admin dashboard and customer dashboard
- [ ] Integration point: `lib/payments/charge-installment.ts` (already has in-app notification)
- [ ] Use existing template: `lib/email/templates/installment-failure-admin.ts` ✅ (Already exists)
- [ ] Recipients: Admin email address(es) from environment variable or config

### AC-2: Booking Cancellation Admin Alerts

- [ ] When booking is cancelled by guest: Send admin email alert
- [ ] Email includes:
  - Customer details (name, email, booking reference)
  - Cancellation reason (if provided)
  - Booking details (package, trip dates, total value)
  - Refund status and amount
  - Time remaining until trip start date
  - Link to admin dashboard
- [ ] Integration point: `lib/trpc/server/routers/booking.ts` (cancellation endpoint)
- [ ] Create new template: `lib/email/templates/booking-cancellation-admin.ts`

### AC-3: High-Value Booking Admin Alerts

- [ ] When booking is confirmed with total value > threshold: Send admin email alert
- [ ] Configurable threshold (default: $5,000)
- [ ] Email includes:
  - Customer details (name, email, location)
  - Booking summary (package, add-ons, trip dates)
  - Total booking value
  - Payment method and plan (full pay vs installments)
  - Link to admin dashboard
- [ ] Integration point: `lib/trpc/server/routers/booking.ts` or Stripe webhook
- [ ] Create new template: `lib/email/templates/high-value-booking-admin.ts`

### AC-4: Guest Support Escalation Alerts

- [ ] When guest submits support request via contact form: Send admin email alert
- [ ] Email includes:
  - Guest details (name, email, phone if provided)
  - Booking reference (if provided)
  - Support category (booking issue, payment problem, trip question, etc.)
  - Message content
  - Urgency level
  - Link to respond
- [ ] Integration point: Contact form submission (existing endpoint)
- [ ] Template already exists: `lib/email/templates/contact-admin-notification.ts` ✅
- [ ] Verify integration is active

### AC-5: System Error Admin Alerts

- [ ] When critical system errors occur: Send admin email alert
- [ ] Error types:
  - Payment processing failures (Stripe API errors)
  - Email delivery failures (SendGrid errors)
  - SMS delivery failures (Twilio errors)
  - Database connection errors (if critical)
- [ ] Email includes:
  - Error type and severity
  - Error message and stack trace
  - Context (user ID, booking ID, etc.)
  - Timestamp
  - Environment (production, staging)
- [ ] Create new template: `lib/email/templates/system-error-admin.ts`
- [ ] Integration points: Error logging middleware, service error handlers

### AC-6: Admin Email Configuration

- [ ] Add admin email address configuration:
  - `ADMIN_ALERT_EMAIL` - Primary admin email
  - `ADMIN_ALERT_CC_EMAILS` - Optional CC emails (comma-separated)
- [ ] Create `lib/email/admin-alerts.ts` service module
- [ ] Functions:
  - `sendAdminAlert(options: AdminAlertOptions)`
  - `sendBookingCancellationAlert(data: BookingCancellationData)`
  - `sendHighValueBookingAlert(data: HighValueBookingData)`
  - `sendSystemErrorAlert(data: SystemErrorData)`
  - `isAdminAlertsConfigured(): boolean`

### AC-7: Admin Alert Preferences (Future Enhancement)

- [ ] Database table for admin alert preferences (optional - Phase 2)
- [ ] For Phase 1: Use environment variables only
- [ ] For Phase 2: Admin UI to configure:
  - Which alerts to receive
  - Email addresses per alert type
  - Alert thresholds (e.g., high-value booking amount)
  - Notification channels (email, SMS, Slack)

### AC-8: Error Handling & Logging

- [ ] All admin alert sending wrapped in try-catch
- [ ] Non-blocking: Admin alert failure doesn't affect primary operation
- [ ] Log all admin alert attempts (success/failure)
- [ ] Use existing logger: `emailLogger` from `@/lib/logger`
- [ ] Log admin alert errors without throwing

### AC-9: Testing

- [ ] Unit tests for admin alert functions
- [ ] Integration tests for each alert type
- [ ] Test with mock SendGrid
- [ ] Verify templates render correctly
- [ ] Test error handling (SendGrid API failure)

## Implementation Details

### Files to Create

1. **lib/email/templates/booking-cancellation-admin.ts** (NEW)
   - Template for booking cancellation admin alerts
   - Similar structure to installment-failure-admin.ts
   - Includes cancellation reason, refund details, customer info

2. **lib/email/templates/high-value-booking-admin.ts** (NEW)
   - Template for high-value booking alerts
   - Celebrates the booking, provides full context
   - Includes total value, payment plan, customer profile

3. **lib/email/templates/system-error-admin.ts** (NEW)
   - Template for system error alerts
   - Technical format with error details
   - Includes stack trace, context, environment info

4. **lib/email/admin-alerts.ts** (NEW)
   - Central service module for all admin alerts
   - Functions for each alert type
   - Configuration checking
   - Non-blocking error handling

### Files to Modify

1. **lib/payments/charge-installment.ts**
   - Add admin email alert when payment fails after all retries
   - Already sends in-app notification (Story 11-7)
   - Add call to `sendAdminAlert()` after notification created
   - Use existing installment-failure-admin.ts template

2. **lib/trpc/server/routers/booking.ts**
   - Add admin email alert on booking cancellation
   - Add admin email alert on high-value booking confirmation
   - Non-blocking: Log errors, don't throw

3. **lib/trpc/server/routers/contact.ts** (or wherever contact form is)
   - Verify admin notification is sent on form submission
   - Template already exists: contact-admin-notification.ts
   - If not integrated: Add integration

4. **lib/email/sendgrid.ts** (Error handling)
   - Consider adding admin alert on SendGrid failures (optional)
   - Already has error logging
   - Can add admin alert for repeated failures

5. **.env.example**
   - Add admin email configuration examples
   - Document required environment variables

### Environment Variables

```bash
# Admin Email Alerts (Story 11-8)
ADMIN_ALERT_EMAIL=admin@pickleballpassport.com
ADMIN_ALERT_CC_EMAILS=owner@pickleballpassport.com,operations@pickleballpassport.com

# Optional: High-value booking threshold (in cents)
HIGH_VALUE_BOOKING_THRESHOLD=500000  # $5,000
```

### Admin Alerts Service Pattern

```typescript
// lib/email/admin-alerts.ts
import { emailLogger, logError } from '@/lib/logger';
import { sendEmail } from './sendgrid';

const ADMIN_EMAIL = process.env.ADMIN_ALERT_EMAIL;
const ADMIN_CC_EMAILS = process.env.ADMIN_ALERT_CC_EMAILS?.split(',').map(e => e.trim()) || [];

export function isAdminAlertsConfigured(): boolean {
  return !!ADMIN_EMAIL;
}

export interface AdminAlertOptions {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send admin alert email
 * Non-blocking: Logs errors but doesn't throw
 */
export async function sendAdminAlert(options: AdminAlertOptions): Promise<void> {
  if (!isAdminAlertsConfigured()) {
    emailLogger.warn('Admin alerts not configured - skipping alert');
    return;
  }

  try {
    await sendEmail({
      to: [ADMIN_EMAIL, ...ADMIN_CC_EMAILS],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    emailLogger.info({ subject: options.subject }, 'Admin alert sent successfully');
  } catch (error) {
    logError(emailLogger, error, 'Failed to send admin alert', {
      subject: options.subject,
    });
    // Don't throw - admin alerts are non-blocking
  }
}

// ... specific admin alert functions
```

### Integration Points

1. **Payment Failure (High Priority)**
   - Location: `lib/payments/charge-installment.ts`
   - Event: After 4th retry attempt fails
   - Template: `installment-failure-admin.ts` (already exists)
   - Status: Integration needed (template exists)

2. **Booking Cancellation (Medium Priority)**
   - Location: `lib/trpc/server/routers/booking.ts`
   - Event: Guest cancels booking
   - Template: `booking-cancellation-admin.ts` (new)
   - Status: Both template and integration needed

3. **High-Value Booking (Medium Priority)**
   - Location: `lib/trpc/server/routers/booking.ts` or Stripe webhook
   - Event: Booking confirmed with value > threshold
   - Template: `high-value-booking-admin.ts` (new)
   - Status: Both template and integration needed

4. **Guest Support (Low Priority)**
   - Location: Contact form endpoint
   - Event: Guest submits support request
   - Template: `contact-admin-notification.ts` (already exists)
   - Status: Verify integration exists

5. **System Errors (Low Priority - Phase 2)**
   - Location: Error handling middleware, service error handlers
   - Event: Critical errors occur
   - Template: `system-error-admin.ts` (new)
   - Status: Design needed for error alerting strategy

### Testing Checklist

- [ ] Payment failure alert sent after 4th retry
- [ ] Booking cancellation alert sent on cancellation
- [ ] High-value booking alert sent when threshold exceeded
- [ ] Contact form submission sends admin notification
- [ ] Admin email configuration validated
- [ ] Non-blocking error handling works (SendGrid failure doesn't crash)
- [ ] Templates render correctly with all data
- [ ] Plain text version generated correctly
- [ ] CC emails included when configured
- [ ] Logging works for success and failure

## Dev Notes

### Architecture Compliance

**Email Service Pattern:**
- Follow existing SendGrid pattern in `lib/email/sendgrid.ts`
- Lazy initialization for dependencies
- Type-safe template interfaces
- Non-blocking error handling

**Template Structure:**
- Use `baseEmailTemplate()` from `lib/email/templates/base.ts`
- Export type-safe data interfaces
- Include `generatePlainText()` for text version
- Follow existing admin alert pattern (see installment-failure-admin.ts)

**Service Layer:**
- Create `lib/email/admin-alerts.ts` as central service
- Export individual functions for each alert type
- Configuration checking with `isAdminAlertsConfigured()`
- Non-blocking sends: Log errors, don't throw

**Error Handling:**
- All admin alert sends wrapped in try-catch
- Use `emailLogger` and `logError()` from `@/lib/logger`
- Admin alerts must not block primary operations
- Log success and failure with context

### Library & Framework Requirements

**Existing Dependencies (No new packages needed):**
- `@sendgrid/mail` - Already installed
- Template system - Already implemented
- Logger - Already implemented

**TypeScript Patterns:**
- Strict type checking for template data
- Interface exports for external use
- Optional fields with `?` notation
- Proper async/await error handling

### File Structure Requirements

**Email Templates Location:**
- `lib/email/templates/booking-cancellation-admin.ts`
- `lib/email/templates/high-value-booking-admin.ts`
- `lib/email/templates/system-error-admin.ts`

**Service Module Location:**
- `lib/email/admin-alerts.ts`

**Integration Locations:**
- `lib/payments/charge-installment.ts`
- `lib/trpc/server/routers/booking.ts`
- Contact form router (verify existence)

### Previous Story Intelligence

**From Story 11-7 (In-App Notifications):**
- Payment failure already creates in-app notification
- Integration point: `lib/payments/charge-installment.ts`
- Non-blocking notification pattern established
- Similar integration needed for admin email

**From Story 11-6 (SMS Notifications):**
- Twilio service pattern similar to what we need
- Non-blocking send pattern: Try-catch, log errors
- Configuration checking: `isConfigured()` function
- Template system for message generation

**From Story 11-5 (Payment Receipt Email):**
- SendGrid service already robust
- Template system working well
- PDF attachment capability exists if needed

**From Story 11-4 (Pre-Trip Email Sequence):**
- Scheduled email sending pattern
- Multiple email templates
- Email sequence management

**Key Patterns to Follow:**
1. Non-blocking sends (log errors, don't throw)
2. Lazy initialization for services
3. Configuration checking before sending
4. Type-safe data interfaces
5. Base template system usage
6. Comprehensive logging

### Git Intelligence Summary

**Recent Commits Show:**
- Epic 9 (Partner Portal) completed
- Epic 11 stories (Email, SMS, In-App) recently completed
- Testing infrastructure for payments
- Codebase review improvements applied

**Code Patterns Established:**
- Email templates follow consistent structure
- Admin alerts already have one example (installment-failure-admin.ts)
- Service layer pattern well-established
- tRPC router pattern for API endpoints
- Non-blocking notification pattern across email/SMS/in-app

### Latest Tech Information

**SendGrid Best Practices (2024):**
- Use dynamic templates for complex emails (optional)
- Batch sending for multiple recipients
- Webhook integration for delivery tracking (future)
- Suppression list management (future)

**Email Template Design:**
- Mobile-first responsive design
- Plain text fallback required
- Clear call-to-action buttons
- Professional admin alert format
- Include all context for decision-making

### References

**Architecture:**
- [Architecture Doc](../../solutioning/architecture-Pickleball-Passport-2025-12-28.md) - Email integration patterns
- Email Service Layer: Section on Communication integrations

**Previous Stories:**
- [Story 11-7](./11-7-in-app-notifications.md) - In-app notification pattern
- [Story 11-6](./11-6-sms-notifications-twilio.md) - SMS notification pattern
- [Story 11-5](./11-5-payment-receipt-email.md) - Email template pattern

**Existing Code:**
- `lib/email/sendgrid.ts` - SendGrid service implementation
- `lib/email/templates/installment-failure-admin.ts` - Existing admin alert template
- `lib/email/templates/base.ts` - Base template system
- `lib/notifications/payment-notifications.ts` - Notification helper functions

## Dependencies

- E11-S1: SendGrid Integration (done) ✅
- E11-S7: In-App Notifications (done) ✅ - Shares integration points
- E4-S7: Scheduled Payment Processing (done) ✅ - Payment failure integration
- E3-S13: Booking Cancellation Flow (done) ✅ - Cancellation integration

## Story Points

5 points

**Breakdown:**
- Template creation (2 pts) - 3 new email templates following existing pattern
- Service module (1 pt) - Central admin alerts service with configuration
- Integration (1.5 pts) - 4 integration points (payment, cancellation, high-value, contact)
- Testing & polish (0.5 pt) - Unit tests and integration verification

## Priority

P1 - High

**Rationale:**
- Critical for admin operations and manual intervention needs
- Completes communication system (email + SMS + in-app notifications)
- Builds on existing infrastructure (SendGrid, templates, notification patterns)
- Enables proactive issue management (payment failures, cancellations)
- Foundation already exists (one admin template, service patterns)

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes

_To be filled by dev agent_

### File List

**Files Created:**
- `lib/email/templates/booking-cancellation-admin.ts`
- `lib/email/templates/high-value-booking-admin.ts`
- `lib/email/templates/system-error-admin.ts`
- `lib/email/admin-alerts.ts`

**Files Modified:**
- `lib/payments/charge-installment.ts` - Add payment failure admin alert
- `lib/trpc/server/routers/booking.ts` - Add cancellation and high-value alerts
- `.env.example` - Add admin email configuration
