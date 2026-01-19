# Story 11-10: Group Chat Integration (WhatsApp)

Status: ready-for-dev

## Story

As a booked guest preparing for my trip,
I want to communicate with fellow travelers and trip organizers through WhatsApp group chat,
So that I can connect with my trip cohort, ask questions, and build excitement before departure.

## Acceptance Criteria

### AC-1: WhatsApp Business API Integration

- [ ] Set up WhatsApp Business API account
- [ ] Configure webhook endpoint for incoming messages
- [ ] Implement authentication and verification
- [ ] Create service module: `lib/whatsapp/client.ts`
- [ ] Environment variables:
  - `WHATSAPP_API_KEY`
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_BUSINESS_ACCOUNT_ID`
  - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- [ ] Test connection and message sending

### AC-2: Trip Group Creation (Automated)

- [ ] Automatically create WhatsApp group when trip is confirmed (minimum 3 bookings)
- [ ] Group naming convention: "Pickleball Passport - [Destination] [Month Year]"
  - Example: "Pickleball Passport - Thailand March 2026"
- [ ] Add trip organizers as group admins
- [ ] Store group metadata in database
- [ ] Create `TripGroup` model extension in Prisma:
  - `whatsappGroupId`
  - `whatsappGroupInviteLink`
  - `groupCreatedAt`
  - `groupStatus` (active, archived, pending)

### AC-3: Guest Auto-Invitation to Group

- [ ] When guest completes booking: Send WhatsApp invitation automatically
- [ ] Invitation message includes:
  - Welcome message
  - Trip details (destination, dates)
  - Group invite link
  - Instructions for joining
  - Contact info for support
- [ ] Template: `lib/whatsapp/templates/trip-group-invitation.ts`
- [ ] Track invitation status per guest
- [ ] Retry logic for failed invitations

### AC-4: WhatsApp Invitation UI (Dashboard Integration)

- [ ] Add "Join Your Trip Group" card to guest dashboard
- [ ] Display if guest has active booking
- [ ] Show:
  - Group name
  - Number of members
  - "Join WhatsApp Group" button (deep link)
  - QR code option for mobile scanning
- [ ] Mark as joined when guest clicks link
- [ ] Location: `/dashboard` (guest dashboard)

### AC-5: Admin Group Management Interface

- [ ] Admin page: `/admin/communication/whatsapp-groups`
- [ ] List all trip groups with:
  - Trip name and dates
  - Member count
  - Group status
  - Creation date
  - Actions: View, Archive, Refresh Link
- [ ] View group details:
  - Member list (with join status)
  - Group invite link
  - Message activity summary
  - Manually add/remove members
- [ ] Create group manually (for special cases)
- [ ] Archive group after trip completion (+30 days)

### AC-6: Welcome Message Automation

- [ ] When guest joins group: Send automated welcome message
- [ ] Welcome message includes:
  - Personalized greeting with guest name
  - Group purpose and guidelines
  - Key trip dates and highlights
  - Resources: Link to member portal, packing list, FAQs
  - Contact info for trip coordinator
- [ ] Template: `lib/whatsapp/templates/group-welcome-message.ts`
- [ ] Sent via WhatsApp Business API

### AC-7: Important Updates Broadcasting

- [ ] Admin can send broadcast messages to specific trip group
- [ ] Admin page: `/admin/communication/broadcast`
- [ ] Select destination:
  - Specific trip group
  - All active trips
  - Upcoming trips only
- [ ] Compose message with rich formatting:
  - Text (markdown support)
  - Attach images
  - Attach documents (PDFs, itineraries)
- [ ] Preview before sending
- [ ] Confirmation modal (cannot undo)
- [ ] Send via WhatsApp Business API
- [ ] Log all broadcasts

### AC-8: Pre-Trip Milestone Messages (Automated)

- [ ] Send automated milestone messages via WhatsApp:
  - **60 days before**: "Trip countdown begins! Join our group chat"
  - **30 days before**: "One month until departure! Flight booking reminder"
  - **14 days before**: "Two weeks away! Complete your pre-trip checklist"
  - **7 days before**: "One week countdown! Final preparations"
  - **1 day before**: "Departure tomorrow! Final reminders and excitement"
- [ ] Only sent to guests who have joined WhatsApp group
- [ ] Scheduled via cron job or background task
- [ ] Each message includes relevant action items and links

### AC-9: Group Moderation & Safety

- [ ] Group settings:
  - Only admins can change group info
  - Only admins can send messages (optional toggle)
  - All members can send messages (default)
  - Disappearing messages: Off (preserve trip memories)
- [ ] Admin moderation capabilities:
  - Remove members (if needed)
  - Mute notifications for all members
  - Archive group post-trip
- [ ] Community guidelines shared on group join
- [ ] Report/flag mechanism for inappropriate content

### AC-10: Analytics & Insights

- [ ] Track WhatsApp group metrics:
  - Invitation sent count
  - Join rate (guests who joined vs invited)
  - Active members count
  - Message activity (admin messages sent)
- [ ] Display metrics on admin dashboard
- [ ] Export group analytics report
- [ ] Integration with existing analytics system

### AC-11: Integration Points

- [ ] **Booking Confirmation** - Send WhatsApp group invitation after booking
  - Location: Booking confirmation logic (after payment success)
  - Template: `trip-group-invitation.ts`

- [ ] **Trip Creation** - Create WhatsApp group when trip reaches minimum bookings
  - Location: Admin trip management or automated check
  - Trigger: 3+ confirmed bookings

- [ ] **Guest Dashboard** - Display "Join WhatsApp Group" card
  - Location: `/dashboard` (guest dashboard)
  - Component: `components/guest/whatsapp-group-card.tsx`

- [ ] **Pre-Trip Emails** - Include WhatsApp group link in nurture emails
  - Location: Pre-trip email sequence (Story 11-4)
  - Add group invitation link to email templates

### AC-12: Error Handling & Fallbacks

- [ ] Graceful handling of WhatsApp API failures
- [ ] Retry logic for failed message sends (3 attempts with exponential backoff)
- [ ] Log all errors with context
- [ ] Non-blocking: WhatsApp failures don't block booking completion
- [ ] Fallback: Email invitation if WhatsApp fails
- [ ] Status tracking: Invitation sent, delivered, failed

### AC-13: Privacy & Compliance

- [ ] Phone number privacy:
  - Guests opt-in to share phone number
  - WhatsApp group uses phone numbers (required by platform)
  - Privacy notice on invitation
- [ ] GDPR compliance:
  - Data retention policy (archive groups after trip + 30 days)
  - Right to be forgotten (remove from group on request)
  - Consent tracking for WhatsApp communications
- [ ] Terms of service for group participation

### AC-14: Testing

- [ ] Unit tests for WhatsApp client functions
- [ ] Integration tests for group creation flow
- [ ] Test invitation sending (mock WhatsApp API)
- [ ] Test webhook endpoint for incoming messages
- [ ] Test admin broadcast functionality
- [ ] Test automated milestone messages
- [ ] Verify error handling and retry logic
- [ ] Test with real WhatsApp Business API (staging account)

## Implementation Details

### Files to Create

1. **lib/whatsapp/client.ts** (NEW)
   - WhatsApp Business API client
   - Functions: `createGroup()`, `sendMessage()`, `addMembers()`, `getGroupInfo()`
   - Authentication and webhook verification
   - Rate limiting and retry logic

2. **lib/whatsapp/templates/trip-group-invitation.ts** (NEW)
   - Template for trip group invitation message
   - Includes trip details, invite link, instructions

3. **lib/whatsapp/templates/group-welcome-message.ts** (NEW)
   - Template for automated welcome message when guest joins
   - Personalized with guest name and trip info

4. **lib/whatsapp/templates/milestone-messages.ts** (NEW)
   - Templates for pre-trip milestone messages (60d, 30d, 14d, 7d, 1d)
   - Each with specific action items and excitement-building content

5. **lib/whatsapp/group-manager.ts** (NEW)
   - Service module for trip group management
   - Functions: `createTripGroup()`, `inviteGuestToGroup()`, `sendGroupBroadcast()`
   - Group lifecycle management (create, archive)

6. **components/guest/whatsapp-group-card.tsx** (NEW)
   - Dashboard card component for "Join Your Trip Group"
   - Displays group info, join button, QR code

7. **app/api/webhooks/whatsapp/route.ts** (NEW)
   - Webhook endpoint for incoming WhatsApp messages
   - Verify webhook signature
   - Handle message events, status updates

8. **app/admin/communication/whatsapp-groups/page.tsx** (NEW)
   - Admin interface for managing WhatsApp groups
   - List all trip groups
   - Group details view
   - Manual group creation

9. **app/admin/communication/broadcast/page.tsx** (NEW)
   - Admin interface for broadcasting messages
   - Select trip group
   - Compose message
   - Send broadcast

10. **lib/jobs/whatsapp-milestone-messages.ts** (NEW)
    - Background job for sending milestone messages
    - Check upcoming trips and send appropriate messages
    - Scheduled via cron (daily at 9am)

### Files to Modify

1. **prisma/schema.prisma**
   - Add `TripGroup` model or extend `Trip` model:
     - `whatsappGroupId` (String, unique)
     - `whatsappGroupInviteLink` (String)
     - `whatsappGroupCreatedAt` (DateTime)
     - `whatsappGroupStatus` (Enum: PENDING, ACTIVE, ARCHIVED)
   - Add to `Booking` model:
     - `whatsappInvitationSentAt` (DateTime)
     - `whatsappGroupJoinedAt` (DateTime)
   - Migration: `npx prisma migrate dev --name add-whatsapp-groups`

2. **lib/trpc/server/routers/booking.ts**
   - Add WhatsApp group invitation after booking confirmation
   - Call `inviteGuestToGroup()` after successful payment
   - Non-blocking send

3. **lib/trpc/server/routers/trip.ts** (if exists) or **admin.ts**
   - Add mutation: `createWhatsAppGroup(tripId)`
   - Add mutation: `archiveWhatsAppGroup(tripId)`
   - Add query: `getWhatsAppGroupDetails(tripId)`

4. **lib/trpc/server/routers/admin.ts**
   - Add mutation: `sendWhatsAppBroadcast(groupId, message, attachments?)`
   - Add query: `getWhatsAppGroupAnalytics()`

5. **app/dashboard/page.tsx** (Guest Dashboard)
   - Add `<WhatsAppGroupCard />` component
   - Display if guest has active booking
   - Show group join status

6. **lib/email/templates/booking-confirmation.ts** (from Story 11-2)
   - Add WhatsApp group invitation section to email
   - Include group invite link as alternative to app

7. **.env.example**
   - Add WhatsApp environment variables
   - Documentation comments for each variable

### Database Schema

```typescript
// Extend Trip model
model Trip {
  // ... existing fields

  // WhatsApp Group Integration
  whatsappGroupId          String?   @unique
  whatsappGroupInviteLink  String?
  whatsappGroupCreatedAt   DateTime?
  whatsappGroupStatus      WhatsAppGroupStatus @default(PENDING)
  whatsappGroupMemberCount Int       @default(0)
}

enum WhatsAppGroupStatus {
  PENDING   // Waiting for minimum bookings
  ACTIVE    // Group created and active
  ARCHIVED  // Trip completed, group archived
}

// Extend Booking model
model Booking {
  // ... existing fields

  // WhatsApp Integration
  whatsappInvitationSentAt DateTime?
  whatsappGroupJoinedAt    DateTime?
  whatsappInvitationStatus String?   @default("pending") // pending, sent, joined, failed
}
```

### WhatsApp Business API Setup

```typescript
// lib/whatsapp/client.ts
import axios from 'axios';
import { logger, logError } from '@/lib/logger';

const WHATSAPP_API_BASE = 'https://graph.facebook.com/v18.0';

interface WhatsAppConfig {
  apiKey: string;
  phoneNumberId: string;
  businessAccountId: string;
}

class WhatsAppClient {
  private config: WhatsAppConfig;

  constructor() {
    this.config = {
      apiKey: process.env.WHATSAPP_API_KEY!,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
    };
  }

  /**
   * Check if WhatsApp is configured and ready
   */
  isConfigured(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.phoneNumberId &&
      this.config.businessAccountId
    );
  }

  /**
   * Send a text message to a phone number
   */
  async sendMessage(to: string, message: string): Promise<void> {
    if (!this.isConfigured()) {
      logger.warn('WhatsApp not configured, skipping message send');
      return;
    }

    try {
      await axios.post(
        `${WHATSAPP_API_BASE}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info({ to }, 'WhatsApp message sent successfully');
    } catch (error) {
      logError(logger, error, 'Failed to send WhatsApp message', { to });
      throw error;
    }
  }

  /**
   * Send a template message (for invitations)
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    parameters: Record<string, string>
  ): Promise<void> {
    // Implementation for template-based messages
    // Used for pre-approved WhatsApp Business templates
  }

  /**
   * Create a WhatsApp group
   * Note: Group creation via API requires WhatsApp Business Platform
   */
  async createGroup(name: string, description: string): Promise<string> {
    // Implementation for group creation
    // Returns group ID
    throw new Error('Not implemented - requires WhatsApp Business Platform setup');
  }
}

export const whatsappClient = new WhatsAppClient();
```

### Integration Pattern

```typescript
// lib/whatsapp/group-manager.ts
import { db } from '@/lib/db';
import { whatsappClient } from './client';
import { logger, logError } from '@/lib/logger';
import * as templates from './templates';

interface TripGroupInvitationData {
  guestName: string;
  guestPhone: string;
  tripName: string;
  tripDates: { start: Date; end: Date };
  groupInviteLink: string;
}

/**
 * Send WhatsApp group invitation to guest after booking
 */
export async function inviteGuestToGroup(
  bookingId: string,
  guestData: TripGroupInvitationData
): Promise<void> {
  try {
    const message = templates.tripGroupInvitation(guestData);

    await whatsappClient.sendMessage(guestData.guestPhone, message);

    // Update booking record
    await db.booking.update({
      where: { id: bookingId },
      data: {
        whatsappInvitationSentAt: new Date(),
        whatsappInvitationStatus: 'sent',
      },
    });

    logger.info(
      { bookingId, guestPhone: guestData.guestPhone },
      'WhatsApp group invitation sent'
    );
  } catch (error) {
    // Update status to failed
    await db.booking.update({
      where: { id: bookingId },
      data: { whatsappInvitationStatus: 'failed' },
    });

    logError(logger, error, 'Failed to send WhatsApp group invitation', {
      bookingId,
    });
    // Don't throw - this is non-blocking
  }
}

/**
 * Create WhatsApp group for a trip
 */
export async function createTripGroup(tripId: string): Promise<void> {
  try {
    const trip = await db.trip.findUnique({
      where: { id: tripId },
      include: { bookings: true },
    });

    if (!trip) throw new Error('Trip not found');
    if (trip.bookings.length < 3) {
      logger.info({ tripId }, 'Trip has less than 3 bookings, skipping group creation');
      return;
    }

    // Create group via WhatsApp Business API
    const groupName = `Pickleball Passport - ${trip.destination} ${trip.startDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;

    // For MVP: Generate invite link manually and store
    // Full implementation would use WhatsApp Business Platform API
    const groupInviteLink = `https://chat.whatsapp.com/[PLACEHOLDER]`;

    // Update trip record
    await db.trip.update({
      where: { id: tripId },
      data: {
        whatsappGroupInviteLink: groupInviteLink,
        whatsappGroupCreatedAt: new Date(),
        whatsappGroupStatus: 'ACTIVE',
      },
    });

    logger.info({ tripId, groupName }, 'WhatsApp group created for trip');
  } catch (error) {
    logError(logger, error, 'Failed to create WhatsApp group', { tripId });
    throw error;
  }
}
```

### Template Examples

```typescript
// lib/whatsapp/templates/trip-group-invitation.ts

export interface TripGroupInvitationData {
  guestName: string;
  tripName: string;
  tripDates: { start: Date; end: Date };
  groupInviteLink: string;
}

export function tripGroupInvitation(data: TripGroupInvitationData): string {
  const startDate = data.tripDates.start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `
🏓✨ Welcome to Pickleball Passport, ${data.guestName}!

Your transformation journey to ${data.tripName} begins ${startDate}!

Join your trip group chat to:
• Meet your fellow travelers
• Get trip updates and important info
• Ask questions and share excitement
• Connect before departure

👉 Join WhatsApp Group:
${data.groupInviteLink}

Questions? Reply to this message or contact us at support@pickleballpassport.com

See you in Thailand! 🇹🇭🏝️
`.trim();
}
```

### Admin Broadcast Interface

```typescript
// app/admin/communication/broadcast/page.tsx
'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

export default function WhatsAppBroadcastPage() {
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const { data: trips } = api.trip.getAll.useQuery();
  const sendBroadcast = api.admin.sendWhatsAppBroadcast.useMutation();

  const handleSendBroadcast = async () => {
    if (!selectedTripId || !message) {
      alert('Please select a trip and enter a message');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to send this message to all group members? This action cannot be undone.'
    );

    if (!confirmed) return;

    await sendBroadcast.mutateAsync({
      tripId: selectedTripId,
      message,
    });

    alert('Broadcast sent successfully!');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">WhatsApp Broadcast</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select Trip Group</label>
          <Select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
          >
            <option value="">Choose a trip...</option>
            {trips?.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name} - {trip.startDate.toLocaleDateString()}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            placeholder="Type your message here..."
          />
          <p className="text-sm text-gray-500 mt-2">
            This message will be sent to all members of the selected trip group.
          </p>
        </div>

        <Button
          onClick={handleSendBroadcast}
          disabled={!selectedTripId || !message || sendBroadcast.isLoading}
        >
          {sendBroadcast.isLoading ? 'Sending...' : 'Send Broadcast'}
        </Button>
      </div>
    </div>
  );
}
```

### Testing Checklist

- [ ] WhatsApp Business API connection works
- [ ] Webhook endpoint receives and processes messages
- [ ] Trip group creation logic works (minimum 3 bookings)
- [ ] Guest receives invitation after booking
- [ ] Invitation includes correct trip details and invite link
- [ ] Dashboard displays WhatsApp group card for booked guests
- [ ] Admin can view all trip groups
- [ ] Admin can send broadcast messages
- [ ] Milestone messages sent at correct intervals
- [ ] Error handling works (API failures, network issues)
- [ ] Retry logic works for failed sends
- [ ] Non-blocking: WhatsApp failures don't block bookings
- [ ] Analytics tracking works (invitations sent, join rate)
- [ ] Group archiving works after trip completion

## Dev Notes

### Architecture Compliance

**Service Layer Pattern:**
- Create `lib/whatsapp/client.ts` for WhatsApp Business API integration
- Follow existing pattern from `lib/email/sendgrid.ts` and `lib/sms/twilio.ts`
- Lazy initialization for dependencies
- Type-safe interfaces
- Non-blocking error handling

**Template System:**
- Create message templates in `lib/whatsapp/templates/`
- Type-safe data interfaces
- Reusable template functions
- Plain text only (WhatsApp doesn't support HTML)

**Group Management:**
- Create `lib/whatsapp/group-manager.ts` for trip group lifecycle
- Functions: `createTripGroup()`, `inviteGuestToGroup()`, `sendGroupBroadcast()`
- Integration with booking and trip management flows

**Error Handling:**
- All WhatsApp operations wrapped in try-catch
- Non-blocking: WhatsApp failures don't block primary operations
- Comprehensive logging with context
- Retry logic for transient failures

### Library & Framework Requirements

**New Dependencies:**
```bash
npm install axios  # Already installed, used for WhatsApp API
```

**Existing Dependencies (Reuse):**
- Logger - Already implemented
- Database (Prisma) - Already implemented
- tRPC - Already implemented

**WhatsApp Business API:**
- Requires WhatsApp Business account
- Phone number verification
- Webhook setup for incoming messages
- API access token

### Integration Points

1. **Booking Confirmation (High Priority)**
   - Location: `lib/trpc/server/routers/booking.ts` or Stripe webhook
   - Event: Guest completes booking
   - Action: Send WhatsApp group invitation
   - Template: `trip-group-invitation.ts`
   - Status: Integration needed

2. **Trip Management (High Priority)**
   - Location: Admin trip management or automated check
   - Event: Trip reaches 3+ confirmed bookings
   - Action: Create WhatsApp group
   - Function: `createTripGroup()`
   - Status: Integration needed

3. **Guest Dashboard (High Priority)**
   - Location: `/dashboard` (guest dashboard)
   - Component: `<WhatsAppGroupCard />`
   - Display: Group join button and QR code
   - Status: Component needed

4. **Pre-Trip Emails (Medium Priority)**
   - Location: Pre-trip email templates (Story 11-4)
   - Action: Include WhatsApp group link
   - Status: Template update needed

5. **Milestone Messages (Medium Priority)**
   - Location: Background job (cron)
   - Schedule: Daily check for upcoming milestones
   - Action: Send milestone messages
   - Status: Job creation needed

### Previous Story Intelligence

**From Story 11-6 (SMS Notifications - Twilio):**
- Similar integration pattern for third-party messaging API
- Non-blocking send pattern
- Configuration checking: `isConfigured()` function
- Template system for message generation
- Webhook endpoint for status updates

**From Story 11-7 (In-App Notifications):**
- User notification preferences pattern
- Notification tracking (sent, delivered, read)
- Dashboard integration for notifications

**From Story 11-8 (Admin Email Alerts):**
- Admin broadcast messaging pattern
- Audience selection (specific trips, all guests)
- Preview and confirmation before sending

**From Epic 3 (Booking System):**
- Booking confirmation flow already established
- Integration point identified for WhatsApp invitation

**From Epic 6 (Mobile App - Pre-Trip):**
- E6-S7 describes pre-trip group chat concept
- User stories around group communication
- Feature requirements for chat functionality

**Key Patterns to Follow:**
1. Non-blocking third-party API calls
2. Retry logic for failed sends
3. Comprehensive logging
4. Configuration checking before operations
5. Template-based message generation
6. Admin interfaces for management and broadcasting

### WhatsApp Business Platform Considerations

**MVP Approach:**
- Start with manual group creation and invite link sharing
- Automated invitation sending via WhatsApp Business API
- Admin interface for group management
- Analytics tracking

**Full Implementation (Future):**
- Automated group creation via API
- Two-way messaging (webhook handling)
- Rich media support (images, documents)
- Advanced analytics and insights

**Cost Considerations:**
- WhatsApp Business API pricing (per conversation)
- Volume discounts available
- Free tier for low volume (check current WhatsApp pricing)

**Compliance:**
- Opt-in required for marketing messages
- 24-hour window for promotional messages
- Transactional messages allowed anytime
- Template approval process for message templates

### References

**Architecture:**
- [Architecture Doc](../../solutioning/architecture-Pickleball-Passport-2025-12-28.md) - Communication system and guest engagement patterns

**Previous Stories:**
- [Story 11-6](./11-6-sms-notifications-twilio.md) - SMS integration pattern
- [Story 11-7](./11-7-in-app-notifications.md) - Notification tracking
- [Story 11-8](./11-8-admin-email-alerts.md) - Admin broadcast pattern
- [Story 11-4](./11-4-pre-trip-email-sequence.md) - Pre-trip communication flow

**Existing Code:**
- `lib/email/sendgrid.ts` - Email service pattern
- `lib/sms/twilio.ts` - SMS service pattern (Story 11-6)
- `lib/logger.ts` - Logging utilities
- `lib/trpc/server/routers/booking.ts` - Booking integration point

**WhatsApp Documentation:**
- WhatsApp Business Platform: https://developers.facebook.com/docs/whatsapp
- Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
- Message Templates: https://developers.facebook.com/docs/whatsapp/message-templates

## Dependencies

- E11-S1: SendGrid Integration (done) ✅ - Email fallback if WhatsApp fails
- E11-S6: Twilio Integration (done) ✅ - Similar third-party messaging API pattern
- E3-S10: Booking Confirmation (done) ✅ - Integration point for invitation
- E5-S5: Trip Management (done) ✅ - Trip data for group creation

## Story Points

5 points

**Breakdown:**
- WhatsApp Business API setup (1 pt) - Account, webhook, authentication
- Service module & templates (1.5 pts) - Client, group manager, message templates
- Dashboard integration (0.5 pt) - WhatsApp group card component
- Admin interfaces (1 pt) - Group management, broadcast messaging
- Integration points (0.5 pt) - Booking confirmation, trip creation
- Testing & polish (0.5 pt) - Unit tests, integration verification

## Priority

P2 - Medium

**Rationale:**
- Enhances guest pre-trip experience and community building
- WhatsApp is widely used internationally (especially in Southeast Asia)
- Complements existing email and SMS communication
- Reduces support burden (guests can help each other)
- Builds excitement and engagement before trip
- Not critical for MVP but high value for guest satisfaction
- Can be phased: Start with manual group creation, automate later
