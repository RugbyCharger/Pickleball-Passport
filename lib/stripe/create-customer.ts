/**
 * Stripe Customer Management Utilities
 * E4-S6: Installment Payment Plans
 *
 * Functions for creating and managing Stripe customers for installment plans
 */

import Stripe from 'stripe'
import { stripeLogger, logError } from '@/lib/logger'
import { getStripeServer } from '@/lib/stripe/server'

// Use canonical singleton from server.ts
const getStripeClient = getStripeServer

export interface CreateCustomerInput {
  email: string
  name: string
  userId: string
  bookingId: string
}

export interface AttachPaymentMethodResult {
  success: boolean
  error?: string
}

/**
 * Create a Stripe customer for installment payments
 *
 * @param input - Customer information
 * @returns Stripe customer object
 * @throws Error if customer creation fails
 */
export async function createStripeCustomer(
  input: CreateCustomerInput
): Promise<Stripe.Customer> {
  try {
    const customer = await getStripeClient().customers.create({
      email: input.email,
      name: input.name,
      metadata: {
        userId: input.userId,
        bookingId: input.bookingId,
      },
    })

    return customer
  } catch (error) {
    logError(stripeLogger, error, 'Failed to create Stripe customer', { email: input.email, userId: input.userId })
    throw new Error(
      'Unable to create customer for installment plan. Please try again or select "Pay in Full".'
    )
  }
}

/**
 * Create a Stripe customer with retry logic
 *
 * @param input - Customer information
 * @param maxRetries - Maximum number of retry attempts (default: 1)
 * @returns Stripe customer object or null if all retries fail
 */
export async function createStripeCustomerWithRetry(
  input: CreateCustomerInput,
  maxRetries: number = 1
): Promise<Stripe.Customer | null> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await createStripeCustomer(input)
    } catch (error) {
      lastError = error as Error
      stripeLogger.warn({ attempt: attempt + 1, error: lastError.message }, 'Customer creation attempt failed')

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
      }
    }
  }

  logError(stripeLogger, lastError, 'All customer creation attempts failed', { email: input.email })
  return null
}

/**
 * Attach a payment method to a Stripe customer
 *
 * @param customerId - Stripe customer ID
 * @param paymentMethodId - Stripe payment method ID
 * @returns Result object with success status
 */
export async function attachPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<AttachPaymentMethodResult> {
  try {
    await getStripeClient().paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    return { success: true }
  } catch (error) {
    logError(stripeLogger, error, 'Failed to attach payment method', { customerId, paymentMethodId })
    return {
      success: false,
      error: 'Unable to save payment method for future charges.',
    }
  }
}

/**
 * Set a payment method as the default for a customer
 *
 * @param customerId - Stripe customer ID
 * @param paymentMethodId - Stripe payment method ID
 * @returns Result object with success status
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<AttachPaymentMethodResult> {
  try {
    await getStripeClient().customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    return { success: true }
  } catch (error) {
    logError(stripeLogger, error, 'Failed to set default payment method', { customerId, paymentMethodId })
    return {
      success: false,
      error: 'Unable to set default payment method.',
    }
  }
}

/**
 * Complete payment method setup after successful payment
 * This combines attaching and setting as default
 *
 * @param customerId - Stripe customer ID
 * @param paymentMethodId - Stripe payment method ID
 * @returns Result object with success status
 */
export async function completePaymentMethodSetup(
  customerId: string,
  paymentMethodId: string
): Promise<AttachPaymentMethodResult> {
  // First attach the payment method
  const attachResult = await attachPaymentMethod(customerId, paymentMethodId)
  if (!attachResult.success) {
    return attachResult
  }

  // Then set it as default
  const defaultResult = await setDefaultPaymentMethod(customerId, paymentMethodId)
  if (!defaultResult.success) {
    return defaultResult
  }

  return { success: true }
}

/**
 * Retrieve a Stripe customer by ID
 *
 * @param customerId - Stripe customer ID
 * @returns Stripe customer object or null if not found
 */
export async function getStripeCustomer(
  customerId: string
): Promise<Stripe.Customer | null> {
  
  try {
    const customer = await getStripeClient().customers.retrieve(customerId)

    // Check if customer was deleted
    if (customer.deleted) {
      return null
    }

    return customer as Stripe.Customer
  } catch (error) {
    logError(stripeLogger, error, 'Failed to retrieve Stripe customer', { customerId })
    return null
  }
}

/**
 * Retrieve the default payment method for a customer
 *
 * @param customerId - Stripe customer ID
 * @returns Stripe payment method object or null if none set
 */
export async function getCustomerDefaultPaymentMethod(
  customerId: string
): Promise<Stripe.PaymentMethod | null> {
  
  try {
    const customer = await getStripeClient().customers.retrieve(customerId, {
      expand: ['invoice_settings.default_payment_method'],
    })

    if (customer.deleted) {
      return null
    }

    const defaultPaymentMethod = (customer as Stripe.Customer).invoice_settings
      ?.default_payment_method

    if (!defaultPaymentMethod) {
      return null
    }

    // If it's already expanded, return it
    if (typeof defaultPaymentMethod === 'object') {
      return defaultPaymentMethod as Stripe.PaymentMethod
    }

    // Otherwise fetch it
    return await getStripeClient().paymentMethods.retrieve(defaultPaymentMethod)
  } catch (error) {
    logError(stripeLogger, error, 'Failed to retrieve default payment method', { customerId })
    return null
  }
}
