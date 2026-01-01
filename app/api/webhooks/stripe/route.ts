/**
 * Stripe Webhook Handler
 *
 * Receives and processes webhook events from Stripe.
 * Critical events:
 * - payment_intent.succeeded: Payment completed successfully
 * - payment_intent.payment_failed: Payment failed
 * - payment_intent.canceled: Payment was canceled
 *
 * Security: Verifies webhook signature to prevent spoofing
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature } from '@/lib/stripe/stripe-service';
import { prisma } from '@/lib/db';
import { sendBookingConfirmation } from '@/lib/email/sendgrid';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe not configured');
      return NextResponse.json(
        { error: 'Stripe integration not configured' },
        { status: 503 }
      );
    }

    // Get the raw body for signature verification
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      event = verifyWebhookSignature(body, signature, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Check if event already processed (idempotency)
    const alreadyProcessed = await checkEventProcessed(event.id);
    if (alreadyProcessed) {
      console.log(`Event ${event.id} (${event.type}) already processed, skipping`);
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    // Handle the event based on type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefundCompleted(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case 'charge.dispute.closed':
        await handleDisputeClosed(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await markEventProcessed(event.id, event.type);

    const duration = Date.now() - startTime;
    console.log(`Event ${event.id} (${event.type}) processed successfully in ${duration}ms`);

    return NextResponse.json({ received: true, status: 'processed' });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle Successful Payment
 *
 * Updates booking and payment status, sends confirmation email,
 * awards partner points if applicable.
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { bookingId } = paymentIntent.metadata;

  if (!bookingId) {
    console.error('Payment intent missing bookingId in metadata');
    return;
  }

  try {
    // Update payment status
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      console.error(`Payment not found for intent: ${paymentIntent.id}`);
      return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCEEDED',
        receiptUrl: null, // Will be populated from charge.succeeded webhook if needed
      },
    });

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        package: true,
        trip: true,
        user: true,
        bookingAddOns: {
          include: {
            addOn: true,
          },
        },
      },
    });

    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return;
    }

    // Check if this is full payment or installment
    const totalPaid = await prisma.payment.aggregate({
      where: {
        bookingId,
        status: 'SUCCEEDED',
      },
      _sum: {
        amount: true,
      },
    });

    const isFullyPaid = totalPaid._sum.amount! >= booking.totalPrice;

    // Update booking status if fully paid
    if (isFullyPaid) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      });

      // Award partner points if booking was referred
      if (booking.referredBy) {
        await awardPartnerPoints(booking.referredBy, booking.id);
      }

      // Get guest name from profile or email
      const guestFirstName = booking.user.email.split('@')[0]; // Fallback

      // Send payment receipt email
      const { sendPaymentReceipt } = await import('@/lib/email/sendgrid');

      await sendPaymentReceipt(booking.user.email, {
        firstName: guestFirstName,
        email: booking.user.email,
        receiptNumber: `RCPT-${payment.id.slice(-8).toUpperCase()}`,
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentIntent.payment_method_types?.[0]
          ? `${paymentIntent.payment_method_types[0].charAt(0).toUpperCase()}${paymentIntent.payment_method_types[0].slice(1)}`
          : 'Card',
        bookingReference: bookingId.slice(-8).toUpperCase(),
        packageName: booking.package.name,
        items: [
          {
            description: `${booking.package.name} - ${booking.duration} days`,
            amount: booking.basePrice,
          },
          ...(booking.accommodationPrice > 0 ? [{
            description: `${booking.accommodationTier} Accommodation`,
            amount: booking.accommodationPrice,
          }] : []),
          ...booking.bookingAddOns.map((ba) => ({
            description: ba.addOn.name,
            quantity: ba.quantity,
            amount: ba.price,
          })),
        ],
        subtotal: booking.totalPrice,
        totalAmount: booking.totalPrice,
        receiptUrl: undefined, // Receipt URL would be available from charge.succeeded event if needed
      });

      // Send booking confirmation email
      await sendBookingConfirmation(booking.user.email, {
        firstName: guestFirstName,
        email: booking.user.email,
        bookingReference: bookingId.slice(-8).toUpperCase(),
        packageName: booking.package.name,
        duration: booking.duration,
        accommodationTier: booking.accommodationTier,
        tripStartDate: booking.trip?.startDate
          ? new Date(booking.trip.startDate).toISOString()
          : undefined,
        tripEndDate: booking.trip?.endDate
          ? new Date(booking.trip.endDate).toISOString()
          : undefined,
        destination: booking.trip?.destination || 'Thailand',
        basePrice: booking.basePrice,
        accommodationPrice: booking.accommodationPrice,
        addOnsTotal: booking.addOnsTotal,
        totalPrice: booking.totalPrice,
        addOns: booking.bookingAddOns.map((ba) => ({
          name: ba.addOn.name,
          quantity: ba.quantity,
          price: ba.price,
        })),
      });
    }

    console.log(`Payment succeeded for booking: ${bookingId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

/**
 * Handle Failed Payment
 *
 * Updates payment status and optionally sends failure notification.
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      console.error(`Payment not found for intent: ${paymentIntent.id}`);
      return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
      },
    });

    // TODO: Send payment failure email with retry link

    console.log(`Payment failed for intent: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Handle Canceled Payment
 *
 * Updates payment status to reflect cancellation.
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      console.error(`Payment not found for intent: ${paymentIntent.id}`);
      return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'PENDING' },
    });

    console.log(`Payment canceled for intent: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}

/**
 * Award Partner Points
 *
 * Awards points to the referring partner when a booking is confirmed.
 */
async function awardPartnerPoints(referralCode: string, bookingId: string) {
  try {
    // Find partner by referral code
    const partner = await prisma.partnerProfile.findUnique({
      where: { referralCode },
    });

    if (!partner) {
      console.error(`Partner not found with referral code: ${referralCode}`);
      return;
    }

    // Get booking to calculate points
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return;
    }

    // Calculate points (e.g., 1 point per $100)
    const pointsEarned = Math.floor(booking.totalPrice / 100 / 100); // Convert cents to dollars, then to points

    // Create referral record
    await prisma.partnerReferral.create({
      data: {
        partnerId: partner.id,
        bookingId,
        pointsEarned,
      },
    });

    // Update partner's total points
    await prisma.partnerProfile.update({
      where: { id: partner.id },
      data: {
        passportPoints: {
          increment: pointsEarned,
        },
      },
    });

    console.log(
      `Awarded ${pointsEarned} points to partner ${partner.id} for booking ${bookingId}`
    );
  } catch (error) {
    console.error('Error awarding partner points:', error);
  }
}

/**
 * Check if webhook event has already been processed (idempotency)
 */
async function checkEventProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: eventId },
  });

  return existing !== null;
}

/**
 * Mark webhook event as processed (idempotency)
 */
async function markEventProcessed(
  eventId: string,
  eventType: string
): Promise<void> {
  await prisma.webhookEvent.create({
    data: {
      stripeEventId: eventId,
      type: eventType,
      processed: true,
    },
  });
}

/**
 * Handle Refund Completed
 *
 * Triggered when a refund is processed (from E3-S13 cancellation or Stripe dashboard).
 * Updates payment status, booking status, and sends confirmation email.
 */
async function handleRefundCompleted(charge: Stripe.Charge) {
  const { payment_intent: paymentIntentId, amount_refunded, id: chargeId } = charge;

  if (!paymentIntentId) {
    console.error('Charge missing payment_intent:', chargeId);
    return;
  }

  try {
    // Find payment by payment intent ID
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId as string },
      include: {
        booking: {
          include: {
            trip: true,
            user: true,
            package: true,
          },
        },
      },
    });

    if (!payment) {
      console.error(`Payment not found for intent: ${paymentIntentId}`);
      return;
    }

    // Check if this is a partial refund or full refund
    const isFullRefund = amount_refunded >= payment.amount;

    // Use transaction for atomic updates
    await prisma.$transaction(async (tx) => {
      // Update payment record
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          refundedAmount: amount_refunded,
          stripeRefundId: charge.refunds?.data?.[0]?.id || null,
        },
      });

      // If full refund, update booking status
      if (isFullRefund && payment.booking.status === 'CONFIRMED') {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CANCELLED' },
        });

        // Decrement trip capacity if booking has a trip
        if (payment.booking.tripId) {
          await tx.trip.update({
            where: { id: payment.booking.tripId },
            data: {
              currentBookings: {
                decrement: 1,
              },
            },
          });
        }
      }
    });

    // Send refund confirmation email (non-blocking)
    const { sendRefundConfirmation } = await import('@/lib/email/sendgrid');

    await sendRefundConfirmation(payment.booking.user.email, {
      firstName: payment.booking.user.email.split('@')[0], // Fallback
      email: payment.booking.user.email,
      bookingReference: payment.booking.bookingReference,
      packageName: payment.booking.package.name,
      refundAmount: amount_refunded,
      originalAmount: payment.amount,
      isPartialRefund: !isFullRefund,
      refundDate: new Date().toISOString(),
      expectedTimeline: '5-10 business days',
    }).catch((error) => {
      console.error('Failed to send refund confirmation email:', error);
      // Don't throw - email failure shouldn't block webhook
    });

    console.log(
      `Refund processed for payment ${payment.id}: $${amount_refunded / 100} (${
        isFullRefund ? 'full' : 'partial'
      })`
    );
  } catch (error) {
    console.error('Error handling refund:', error);
    throw error; // Re-throw to trigger Stripe retry if needed
  }
}

/**
 * Handle Dispute Created
 *
 * When a guest disputes a charge with their bank.
 * Creates urgent admin notification and email alert.
 */
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const { id: disputeId, amount, reason, charge, evidence_details } = dispute;

  try {
    // Find payment by charge ID
    const chargeObj = charge as Stripe.Charge;
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: chargeObj.payment_intent as string },
      include: {
        booking: {
          include: {
            user: true,
            package: true,
          },
        },
      },
    });

    if (!payment) {
      console.error(`Payment not found for charge: ${charge}`);
      return;
    }

    // Create admin notification (Note: Requires admin user or system account)
    // For now, log the dispute details
    console.warn(`🚨 URGENT: Payment Dispute - ${payment.booking.bookingReference}`);
    console.warn(`Dispute ID: ${disputeId}`);
    console.warn(`Amount: $${amount / 100}`);
    console.warn(`Reason: ${reason}`);
    if (evidence_details?.due_by) {
      console.warn(`Deadline: ${new Date(evidence_details.due_by * 1000).toLocaleDateString()}`);
    }

    // TODO: Send email alert to admin team
    // This would require admin email configuration or admin user lookup

    console.log(`Dispute created for payment ${payment.id}: ${disputeId}`);
  } catch (error) {
    console.error('Error handling dispute creation:', error);
    // Don't throw - log error but acknowledge webhook
  }
}

/**
 * Handle Dispute Closed
 *
 * When a dispute is resolved (won or lost).
 * Updates payment/booking status if dispute was lost.
 */
async function handleDisputeClosed(dispute: Stripe.Dispute) {
  const { id: disputeId, status, charge, amount } = dispute;

  try {
    // Find payment
    const chargeObj = charge as Stripe.Charge;
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: chargeObj.payment_intent as string },
      include: {
        booking: {
          include: {
            user: true,
            trip: true,
            package: true,
          },
        },
      },
    });

    if (!payment) {
      console.error(`Payment not found for charge: ${charge}`);
      return;
    }

    if (status === 'won') {
      // Dispute won - no action needed, just log
      console.log(`✅ Dispute won: ${disputeId} for booking ${payment.booking.bookingReference}`);
    } else if (status === 'lost') {
      // Dispute lost - refund the guest, cancel booking
      await prisma.$transaction(async (tx) => {
        // Update payment to REFUNDED
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'REFUNDED',
            refundedAmount: amount,
            stripeRefundId: disputeId,
          },
        });

        // Cancel booking if currently confirmed
        if (payment.booking.status === 'CONFIRMED') {
          await tx.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CANCELLED' },
          });

          // Decrement trip capacity
          if (payment.booking.tripId) {
            await tx.trip.update({
              where: { id: payment.booking.tripId },
              data: {
                currentBookings: {
                  decrement: 1,
                },
              },
            });
          }
        }
      });

      console.log(
        `❌ Dispute lost: ${disputeId}, booking ${payment.booking.bookingReference} cancelled`
      );

      // TODO: Send email to guest explaining outcome
    }
  } catch (error) {
    console.error('Error handling dispute closure:', error);
    // Don't throw - log error but acknowledge webhook
  }
}
