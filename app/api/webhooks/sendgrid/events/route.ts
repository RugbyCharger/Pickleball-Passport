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
 * Settings → Mail Settings → Event Webhook
 * Enable events: unsubscribe, spamreport, group_unsubscribe
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailLogger } from '@/lib/logger';

interface SendGridEvent {
  email: string;
  timestamp: number;
  event: string;
  sg_event_id: string;
  sg_message_id: string;
  [key: string]: any; // Additional fields vary by event type
}

/**
 * Verify SendGrid webhook signature (optional security)
 *
 * SendGrid uses elliptic curve signatures for webhook verification.
 * For MVP, we rely on HTTPS + secret URL path.
 * In production, implement proper signature verification using SendGrid's public key.
 *
 * @see https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security-features
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  // TODO: Implement SendGrid signature verification for production
  // For now, accept all requests (secured by secret URL and HTTPS)
  return true;
}

/**
 * POST handler for SendGrid webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (optional security layer)
    const signature = request.headers.get('X-Twilio-Email-Event-Webhook-Signature');
    const timestamp = request.headers.get('X-Twilio-Email-Event-Webhook-Timestamp');

    // In production, enable signature verification
    // if (!verifyWebhookSignature(await request.text(), signature, timestamp)) {
    //   emailLogger.warn('Invalid webhook signature');
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const events: SendGridEvent[] = await request.json();

    for (const event of events) {
      emailLogger.info(
        { event: event.event, email: event.email },
        'SendGrid webhook event received'
      );

      // Find user by email
      const user = await db.user.findUnique({
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
        await db.user.update({
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
        await db.user.update({
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
