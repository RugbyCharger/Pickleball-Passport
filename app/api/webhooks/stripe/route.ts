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
  try {
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
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
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

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
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

      // Send booking confirmation email
      await sendBookingConfirmation(booking.user.email, {
        firstName: booking.user.email.split('@')[0], // Will be updated when we have guest profile
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
