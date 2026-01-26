/**
 * SendGrid Event Webhook Handler (E11-S12)
 *
 * Handles SendGrid webhook events for:
 * - Unsubscribe events (user clicked unsubscribe)
 * - Spam reports (user marked email as spam)
 * - Group unsubscribes (SendGrid suppression groups)
 *
 * Updates user notification preferences to honor unsubscribe requests
 * and maintain compliance with CAN-SPAM/GDPR requirements.
 *
 * Webhook URL: https://pickleballpassport.com/api/webhooks/sendgrid/events
 *
 * Configure in SendGrid Dashboard:
 * Settings -> Mail Settings -> Event Webhook
 * Enable events: unsubscribe, spamreport, group_unsubscribe
 * Enable "Signed Event Webhook Requests" and copy the Verification Key
 *
 * SECURITY: Signature verification is REQUIRED in production.
 * Set SENDGRID_WEBHOOK_VERIFICATION_KEY environment variable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { emailLogger } from '@/lib/logger';
import { EventWebhook, EventWebhookHeader } from '@sendgrid/eventwebhook';

interface SendGridEvent {
  email: string;
  timestamp: number;
  event: string;
  sg_event_id: string;
  sg_message_id: string;
  [key: string]: any; // Additional fields vary by event type
}

/**
 * Verify SendGrid webhook signature using the official SDK
 *
 * SendGrid uses elliptic curve (ECDSA) signatures for webhook verification.
 * The official SDK handles the key conversion and signature verification correctly.
 *
 * @see https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security-features
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  const publicKey = process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY;

  // In production, verification is required
  if (process.env.NODE_ENV === 'production') {
    if (!publicKey) {
      emailLogger.error(
        'SECURITY ERROR: SENDGRID_WEBHOOK_VERIFICATION_KEY not configured. ' +
          'Webhook requests will be rejected until configured.'
      );
      return false;
    }

    if (!signature || !timestamp) {
      emailLogger.warn('Missing signature or timestamp headers');
      return false;
    }

    try {
      const eventWebhook = new EventWebhook();
      const ecPublicKey = eventWebhook.convertPublicKeyToECDSA(publicKey);
      const isValid = eventWebhook.verifySignature(
        ecPublicKey,
        payload,
        signature,
        timestamp
      );

      if (!isValid) {
        emailLogger.warn('Invalid webhook signature');
      }

      return isValid;
    } catch (error) {
      emailLogger.error({ error }, 'Signature verification failed');
      return false;
    }
  }

  // In development, allow requests but warn if verification key is missing
  if (!publicKey) {
    emailLogger.warn(
      '[DEV] SENDGRID_WEBHOOK_VERIFICATION_KEY not configured. ' +
        'Signature verification skipped in development.'
    );
  }

  return true;
}

/**
 * POST handler for SendGrid webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification (must be done before parsing JSON)
    const rawBody = await request.text();

    // Verify webhook signature - REQUIRED in production
    const signature = request.headers.get(EventWebhookHeader.SIGNATURE());
    const timestamp = request.headers.get(EventWebhookHeader.TIMESTAMP());

    if (!verifyWebhookSignature(rawBody, signature, timestamp)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the verified payload
    const events: SendGridEvent[] = JSON.parse(rawBody);

    for (const event of events) {
      emailLogger.info(
        { event: event.event, email: event.email },
        'SendGrid webhook event received'
      );

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: event.email },
        select: { id: true, email: true },
      });

      if (!user) {
        emailLogger.warn(
          { email: event.email, eventId: event.sg_event_id },
          'User not found for webhook event'
        );
        continue;
      }

      // Handle unsubscribe and spam report events
      if (event.event === 'unsubscribe' || event.event === 'spamreport') {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            notificationPreferences: {
              // Disable all optional email notifications
              emailPreTripSequence: false,
              emailPostTripFollowUp: false,
              emailAlumniEvents: false,
              emailMarketing: false,
              emailNewsletter: false,
              // Keep non-email channels enabled
              smsEnabled: true,
              inAppEnabled: true,
              whatsappEnabled: true,
            },
            preferenceUpdatedAt: new Date(),
          },
        });

        emailLogger.info(
          { userId: user.id, event: event.event, eventId: event.sg_event_id },
          'User unsubscribed from all optional emails via SendGrid'
        );
      }

      // Handle group unsubscribe (if using SendGrid Groups in future)
      if (event.event === 'group_unsubscribe') {
        emailLogger.info(
          { userId: user.id, eventId: event.sg_event_id },
          'Group unsubscribe event received (not yet implemented)'
        );
        // TODO: Implement granular group-based unsubscribe if needed
        // For now, treat the same as full unsubscribe
        await prisma.user.update({
          where: { id: user.id },
          data: {
            notificationPreferences: {
              emailPreTripSequence: false,
              emailPostTripFollowUp: false,
              emailAlumniEvents: false,
              emailMarketing: false,
              emailNewsletter: false,
              smsEnabled: true,
              inAppEnabled: true,
              whatsappEnabled: true,
            },
            preferenceUpdatedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ success: true, processed: events.length });
  } catch (error) {
    emailLogger.error({ error }, 'SendGrid webhook processing error');
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for webhook verification
 * SendGrid doesn't require GET, but useful for testing
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    webhook: 'SendGrid Events',
    message: 'Webhook endpoint is active',
  });
}
