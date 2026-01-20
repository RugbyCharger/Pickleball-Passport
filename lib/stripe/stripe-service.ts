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
import { stripeLogger, logError, webhookLogger } from '@/lib/logger';

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
  customerId?: string; // E4-S6: For installment plans
  setupFutureUsage?: 'off_session' | 'on_session'; // E4-S6: Save payment method for future charges
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
  const { amount, bookingId, guestEmail, guestName, metadata = {}, customerId, setupFutureUsage } = params;

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
      // E4-S6: For installment plans, attach customer and save payment method
      ...(customerId && { customer: customerId }),
      ...(setupFutureUsage && { setup_future_usage: setupFutureUsage }),
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    logError(stripeLogger, error, 'Error creating payment intent', { bookingId, amount });
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
    logError(stripeLogger, error, 'Error retrieving payment intent', { paymentIntentId });
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
    logError(stripeLogger, error, 'Error canceling payment intent', { paymentIntentId });
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
    logError(stripeLogger, error, 'Error creating refund', { paymentIntentId, amount });
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
    logError(webhookLogger, error, 'Webhook signature verification failed');
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

// ============================================================================
// E4-S12: Payment Method Management
// ============================================================================

export interface CreateSetupIntentParams {
  customerId: string;
}

export interface SetupIntentResult {
  clientSecret: string;
  setupIntentId: string;
}

/**
 * Create a Stripe SetupIntent
 *
 * Used to securely collect and save a customer's payment method
 * for future off-session charges (e.g., installment payments).
 */
export async function createSetupIntent(
  params: CreateSetupIntentParams
): Promise<SetupIntentResult> {
  const { customerId } = params;

  try {
    const setupIntent = await getStripe().setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session', // Payment method will be used for future off-session payments
    });

    stripeLogger.info({ customerId, setupIntentId: setupIntent.id }, 'SetupIntent created');

    return {
      clientSecret: setupIntent.client_secret!,
      setupIntentId: setupIntent.id,
    };
  } catch (error) {
    logError(stripeLogger, error, 'Error creating setup intent', { customerId });
    throw new Error('Failed to create setup intent');
  }
}

/**
 * Update Customer Default Payment Method
 *
 * Sets the customer's default payment method for future charges.
 * Used after a SetupIntent is confirmed to update the default source.
 */
export async function updateCustomerDefaultPaymentMethod(params: {
  customerId: string;
  paymentMethodId: string;
}): Promise<Stripe.Customer> {
  const { customerId, paymentMethodId } = params;

  try {
    // First, attach the payment method to the customer (if not already attached)
    await getStripe().paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Then, set it as the default payment method for invoices
    const customer = await getStripe().customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    stripeLogger.info(
      { customerId, paymentMethodId },
      'Customer default payment method updated'
    );

    return customer;
  } catch (error) {
    // Check if the error is because payment method is already attached
    if (error instanceof Stripe.errors.StripeError && error.code === 'resource_already_exists') {
      // Just update the default payment method
      const customer = await getStripe().customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      stripeLogger.info(
        { customerId, paymentMethodId },
        'Customer default payment method updated (already attached)'
      );
      return customer;
    }

    logError(stripeLogger, error, 'Error updating customer default payment method', {
      customerId,
      paymentMethodId,
    });
    throw new Error('Failed to update payment method');
  }
}

/**
 * Get Customer Payment Methods
 *
 * Retrieves all saved payment methods for a customer.
 */
export async function getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
  try {
    const paymentMethods = await getStripe().paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error) {
    logError(stripeLogger, error, 'Error fetching customer payment methods', { customerId });
    throw new Error('Failed to fetch payment methods');
  }
}

/**
 * Get Customer Default Payment Method
 *
 * Retrieves the customer's default payment method details.
 */
export async function getCustomerDefaultPaymentMethod(
  customerId: string
): Promise<Stripe.PaymentMethod | null> {
  try {
    const customer = await getStripe().customers.retrieve(customerId);

    if (customer.deleted) {
      return null;
    }

    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;

    if (!defaultPaymentMethodId || typeof defaultPaymentMethodId !== 'string') {
      return null;
    }

    const paymentMethod = await getStripe().paymentMethods.retrieve(defaultPaymentMethodId);
    return paymentMethod;
  } catch (error) {
    logError(stripeLogger, error, 'Error fetching customer default payment method', { customerId });
    return null;
  }
}
