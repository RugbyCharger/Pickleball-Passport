/**
 * WhatsApp Webhook Handler
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Receives webhook events from Meta WhatsApp Business API:
 * - Webhook verification (GET) - Meta challenge/response
 * - Message status updates (POST) - sent, delivered, read, failed
 * - Incoming messages (POST) - if configured to receive
 *
 * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
 *
 * Security: Verifies webhook with WHATSAPP_WEBHOOK_VERIFY_TOKEN
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createLogger, logError } from '@/lib/logger';
import { prisma } from '@/lib/db';
import { getWebhookVerifyToken } from '@/lib/whatsapp/client';

const webhookLogger = createLogger('whatsapp-webhook');

// ============================================================================
// TYPES
// ============================================================================

/**
 * WhatsApp webhook payload structure
 * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
 */
interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppWebhookEntry[];
}

interface WhatsAppWebhookEntry {
  id: string;
  changes: WhatsAppWebhookChange[];
}

interface WhatsAppWebhookChange {
  value: WhatsAppWebhookValue;
  field: string;
}

interface WhatsAppWebhookValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
  errors?: WhatsAppError[];
}

interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
  button?: {
    text: string;
    payload: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
    };
  };
  context?: {
    from: string;
    id: string;
  };
}

interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    origin?: {
      type: string;
    };
    expiration_timestamp?: string;
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: WhatsAppError[];
}

interface WhatsAppError {
  code: number;
  title: string;
  message?: string;
  error_data?: {
    details: string;
  };
}

// ============================================================================
// GET HANDLER - Webhook Verification
// ============================================================================

/**
 * GET /api/webhooks/whatsapp
 *
 * Handles webhook verification from Meta.
 * Meta sends a challenge request with:
 * - hub.mode: 'subscribe'
 * - hub.verify_token: Your verification token
 * - hub.challenge: Random string to echo back
 *
 * Must respond with the challenge value to verify ownership.
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = req.nextUrl.searchParams;

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    webhookLogger.info(
      { mode, hasToken: !!token, hasChallenge: !!challenge },
      'Received webhook verification request'
    );

    // Check if this is a subscribe verification
    if (mode !== 'subscribe') {
      webhookLogger.warn({ mode }, 'Invalid webhook mode');
      return new NextResponse('Invalid mode', { status: 400 });
    }

    // Verify the token
    const verifyToken = getWebhookVerifyToken();
    if (!verifyToken) {
      webhookLogger.error('WHATSAPP_WEBHOOK_VERIFY_TOKEN not configured');
      return new NextResponse('Webhook not configured', { status: 503 });
    }

    if (token !== verifyToken) {
      webhookLogger.warn('Webhook verification token mismatch');
      return new NextResponse('Verification failed', { status: 403 });
    }

    // Respond with the challenge
    if (!challenge) {
      webhookLogger.warn('Missing challenge in verification request');
      return new NextResponse('Missing challenge', { status: 400 });
    }

    const duration = Date.now() - startTime;
    webhookLogger.info(
      { duration },
      'Webhook verification successful'
    );

    // Return the challenge as plain text (Meta expects this format)
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    logError(webhookLogger, error, 'Webhook verification error');
    return new NextResponse('Internal error', { status: 500 });
  }
}

// ============================================================================
// POST HANDLER - Webhook Events
// ============================================================================

/**
 * POST /api/webhooks/whatsapp
 *
 * Handles incoming webhook events from Meta:
 * - Message status updates (sent, delivered, read, failed)
 * - Incoming messages (optional, if configured)
 *
 * IMPORTANT: Must respond with 200 OK quickly.
 * Meta will retry if response takes too long or returns error.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify X-Hub-Signature-256 from Meta to prevent forged events
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    const signature = req.headers.get('x-hub-signature-256');
    const rawBody = await req.text();

    if (appSecret) {
      if (!signature) {
        webhookLogger.warn('Missing X-Hub-Signature-256 header');
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }

      const expectedSignature = 'sha256=' +
        createHmac('sha256', appSecret).update(rawBody).digest('hex');

      if (signature !== expectedSignature) {
        webhookLogger.warn('Invalid X-Hub-Signature-256 — possible forged event');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      webhookLogger.error('WHATSAPP_APP_SECRET not configured — webhook signature verification disabled');
    }

    // Parse the request body
    let payload: WhatsAppWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      webhookLogger.warn('Failed to parse webhook payload');
      // Still return 200 to prevent Meta from retrying invalid payloads
      return NextResponse.json({ received: true, error: 'Invalid JSON' });
    }

    // Log the incoming webhook for debugging
    webhookLogger.info(
      {
        object: payload.object,
        entryCount: payload.entry?.length || 0,
      },
      'Received WhatsApp webhook event'
    );

    // Verify this is a WhatsApp webhook
    if (payload.object !== 'whatsapp_business_account') {
      webhookLogger.warn(
        { object: payload.object },
        'Unexpected webhook object type'
      );
      // Return 200 to acknowledge receipt
      return NextResponse.json({ received: true, status: 'ignored' });
    }

    // Process each entry
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          await processMessagesChange(change.value);
        } else {
          webhookLogger.debug(
            { field: change.field },
            'Ignoring non-messages webhook field'
          );
        }
      }
    }

    const duration = Date.now() - startTime;
    webhookLogger.info(
      { duration },
      'Webhook processed successfully'
    );

    // Always return 200 quickly to acknowledge receipt
    return NextResponse.json({ received: true, status: 'processed' });
  } catch (error) {
    logError(webhookLogger, error, 'Webhook handler error');
    // Return 200 even on errors to prevent Meta from excessive retries
    // Log the error for investigation but acknowledge receipt
    return NextResponse.json({
      received: true,
      status: 'error',
      message: 'Internal processing error',
    });
  }
}

// ============================================================================
// EVENT PROCESSORS
// ============================================================================

/**
 * Process messages field changes (statuses and incoming messages)
 */
async function processMessagesChange(value: WhatsAppWebhookValue): Promise<void> {
  // Process status updates
  if (value.statuses) {
    for (const status of value.statuses) {
      await processMessageStatus(status);
    }
  }

  // Process incoming messages
  if (value.messages && value.contacts) {
    for (const message of value.messages) {
      const contact = value.contacts.find((c) => c.wa_id === message.from);
      await processIncomingMessage(message, contact);
    }
  }

  // Log any errors from Meta
  if (value.errors) {
    for (const error of value.errors) {
      webhookLogger.error(
        {
          code: error.code,
          title: error.title,
          message: error.message,
          details: error.error_data?.details,
        },
        'WhatsApp API error received via webhook'
      );
    }
  }
}

/**
 * Process message status update
 *
 * Updates message delivery status for tracking and analytics.
 */
async function processMessageStatus(status: WhatsAppStatus): Promise<void> {
  webhookLogger.debug(
    {
      messageId: status.id,
      status: status.status,
      recipientId: status.recipient_id.slice(-4), // Log only last 4 digits for privacy
      conversationId: status.conversation?.id,
    },
    `Message status update: ${status.status}`
  );

  // Handle failed messages
  if (status.status === 'failed' && status.errors) {
    for (const error of status.errors) {
      webhookLogger.warn(
        {
          messageId: status.id,
          recipientId: status.recipient_id.slice(-4),
          errorCode: error.code,
          errorTitle: error.title,
          errorMessage: error.message,
        },
        'WhatsApp message delivery failed'
      );
    }
  }

  // Optional: Track delivery metrics in database
  // For MVP, we just log the status updates
  // Future enhancement: Store in WhatsAppMessageLog table for analytics
}

/**
 * Process incoming message
 *
 * Handles messages sent TO the business number.
 * For MVP, we log these but don't process automated responses.
 * This could be enhanced to:
 * - Auto-respond with trip info
 * - Route messages to support
 * - Track engagement
 */
async function processIncomingMessage(
  message: WhatsAppMessage,
  contact?: WhatsAppContact
): Promise<void> {
  webhookLogger.info(
    {
      messageId: message.id,
      from: message.from.slice(-4), // Log only last 4 digits for privacy
      type: message.type,
      contactName: contact?.profile?.name,
      timestamp: message.timestamp,
    },
    'Received incoming WhatsApp message'
  );

  // Check for button replies (e.g., "Join Group" confirmation)
  if (message.type === 'button' && message.button) {
    await handleButtonReply(message);
  }

  // Check for interactive replies
  if (message.type === 'interactive' && message.interactive) {
    await handleInteractiveReply(message);
  }

  // For text messages, check for keywords that might indicate group join
  if (message.type === 'text' && message.text) {
    await checkForJoinConfirmation(message);
  }
}

/**
 * Handle button reply (e.g., quick reply buttons in template messages)
 */
async function handleButtonReply(message: WhatsAppMessage): Promise<void> {
  const buttonPayload = message.button?.payload?.toLowerCase();

  webhookLogger.debug(
    {
      messageId: message.id,
      buttonText: message.button?.text,
      buttonPayload,
    },
    'Processing button reply'
  );

  // Check if this is a "joined group" confirmation
  if (buttonPayload?.includes('joined') || buttonPayload?.includes('join')) {
    await markGuestJoinedByPhone(message.from);
  }
}

/**
 * Handle interactive reply (list or button selection)
 */
async function handleInteractiveReply(message: WhatsAppMessage): Promise<void> {
  const replyId = message.interactive?.button_reply?.id ||
    message.interactive?.list_reply?.id;

  webhookLogger.debug(
    {
      messageId: message.id,
      replyType: message.interactive?.type,
      replyId,
    },
    'Processing interactive reply'
  );

  // Check if this is a group join confirmation
  if (replyId?.includes('joined') || replyId?.includes('join')) {
    await markGuestJoinedByPhone(message.from);
  }
}

/**
 * Check text message for join confirmation keywords
 */
async function checkForJoinConfirmation(message: WhatsAppMessage): Promise<void> {
  const text = message.text?.body?.toLowerCase() || '';

  // Simple keyword matching for join confirmations
  const joinKeywords = ['joined', 'i joined', "i'm in", 'im in', 'count me in', 'see you there'];

  if (joinKeywords.some((keyword) => text.includes(keyword))) {
    webhookLogger.info(
      { messageId: message.id },
      'Detected potential join confirmation in message'
    );
    await markGuestJoinedByPhone(message.from);
  }
}

/**
 * Mark a guest as joined based on their phone number
 *
 * Finds the booking by matching the guest's phone number and updates
 * the whatsappGroupJoinedAt timestamp.
 */
async function markGuestJoinedByPhone(phoneNumber: string): Promise<void> {
  try {
    // Format phone number for search (add + prefix if missing)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    // Find guest profile by phone number
    const guestProfile = await prisma.guestProfile.findFirst({
      where: {
        phone: formattedPhone,
      },
      include: {
        user: {
          include: {
            bookings: {
              where: {
                status: 'CONFIRMED',
                whatsappInvitationStatus: 'sent', // Only update if invitation was sent
                whatsappGroupJoinedAt: null, // Only update if not already joined
              },
              include: {
                trip: {
                  select: {
                    id: true,
                    whatsappGroupStatus: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc', // Get most recent booking first
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!guestProfile || guestProfile.user.bookings.length === 0) {
      webhookLogger.debug(
        { phone: phoneNumber.slice(-4) },
        'No matching booking found for phone number'
      );
      return;
    }

    const booking = guestProfile.user.bookings[0];

    // Verify the trip has an active WhatsApp group
    if (booking.trip?.whatsappGroupStatus !== 'ACTIVE') {
      webhookLogger.debug(
        { bookingId: booking.id },
        'Trip does not have an active WhatsApp group'
      );
      return;
    }

    // Update booking to mark guest as joined
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        whatsappGroupJoinedAt: new Date(),
        whatsappInvitationStatus: 'joined',
      },
    });

    // Increment member count on trip
    await prisma.trip.update({
      where: { id: booking.trip.id },
      data: {
        whatsappGroupMemberCount: { increment: 1 },
      },
    });

    webhookLogger.info(
      {
        bookingId: booking.id,
        tripId: booking.trip.id,
        phone: phoneNumber.slice(-4),
      },
      'Guest marked as joined WhatsApp group via webhook'
    );
  } catch (error) {
    logError(webhookLogger, error, 'Failed to mark guest as joined', {
      phone: phoneNumber.slice(-4),
    });
  }
}
