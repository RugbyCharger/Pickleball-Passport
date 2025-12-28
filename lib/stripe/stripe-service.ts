/**
 * Stripe Payment Service
 *
 * Handles all Stripe-related operations including:
 * - Payment intent creation
 * - Webhook verification
 * - Payment processing
 * - Refunds and cancellations
 *
 * @see https://stripe.com/docs/payments/payment-intents
 */

import Stripe from 'stripe';

// Initialize Stripe client (server-side only)
// Note: During build time, this might not be available
const getStripeClient = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(apiKey, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
  });
};

// Lazy initialization
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    stripe = getStripeClient();
  }
  return stripe;
};

export interface CreatePaymentIntentParams {
  amount: number; // Amount in cents
  bookingId: string;
  guestEmail: string;
  guestName: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Create a Stripe Payment Intent
 *
 * This creates a payment intent on Stripe's servers and returns
 * the client secret needed for the frontend to complete payment.
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResult> {
  const { amount, bookingId, guestEmail, guestName, metadata = {} } = params;

  try {
    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: guestEmail,
      description: `Booking #${bookingId} - Pickleball Passport`,
      metadata: {
        bookingId,
        guestEmail,
        guestName,
        ...metadata,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Retrieve a Payment Intent
 *
 * Fetches the current status of a payment intent from Stripe.
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    return await getStripe().paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error('Failed to retrieve payment intent');
  }
}

/**
 * Cancel a Payment Intent
 *
 * Cancels a payment intent that hasn't been completed yet.
 */
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    return await getStripe().paymentIntents.cancel(paymentIntentId);
  } catch (error) {
    console.error('Error canceling payment intent:', error);
    throw new Error('Failed to cancel payment intent');
  }
}

/**
 * Create a Refund
 *
 * Issues a full or partial refund for a completed payment.
 */
export async function createRefund(params: {
  paymentIntentId: string;
  amount?: number; // Optional: partial refund amount in cents
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}): Promise<Stripe.Refund> {
  const { paymentIntentId, amount, reason } = params;

  try {
    return await getStripe().refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason,
    });
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
}

/**
 * Verify Webhook Signature
 *
 * Verifies that a webhook event actually came from Stripe.
 * CRITICAL for security - prevents malicious webhook spoofing.
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  try {
    return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

// Note: getStripe() is now defined above for lazy initialization

/**
 * Check if Stripe is Configured
 *
 * Verifies that Stripe API keys are set up correctly.
 */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

/**
 * Format Amount for Stripe
 *
 * Converts a dollar amount to cents (Stripe expects amounts in smallest currency unit)
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Format Amount from Stripe
 *
 * Converts cents back to dollars for display
 */
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}
