import { faker } from '@faker-js/faker';

/**
 * Stripe Test Data Factory
 *
 * Generates mock Stripe objects for testing:
 * - Customers
 * - Payment Methods
 * - Payment Intents
 * - Errors
 *
 * Usage:
 *   const customer = createStripeCustomer();
 *   const paymentMethod = createStripePaymentMethod();
 *   const error = createStripeError('card_declined');
 */

export interface TestStripeCustomer {
  id: string;
  email: string;
  name: string;
  defaultPaymentMethod?: string;
  metadata: Record<string, string>;
  created: number;
}

export interface TestStripePaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: 'visa' | 'mastercard' | 'amex' | 'discover';
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billing_details: {
    name: string;
    email: string;
  };
}

export interface TestStripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'processing'
    | 'succeeded'
    | 'canceled';
  customer: string;
  paymentMethod?: string;
  metadata: Record<string, string>;
}

export interface TestStripeError {
  type: 'card_error' | 'api_error' | 'rate_limit_error' | 'authentication_error';
  code: string;
  message: string;
  statusCode: number;
}

/**
 * Create a mock Stripe customer
 */
export function createStripeCustomer(
  overrides: Partial<TestStripeCustomer> = {}
): TestStripeCustomer {
  return {
    id: `cus_${faker.string.alphanumeric(14)}`,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    metadata: {},
    created: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

/**
 * Create a mock Stripe payment method (card)
 */
export function createStripePaymentMethod(
  overrides: Partial<TestStripePaymentMethod> = {}
): TestStripePaymentMethod {
  const brand = faker.helpers.arrayElement(['visa', 'mastercard', 'amex', 'discover'] as const);
  const expYear = new Date().getFullYear() + faker.number.int({ min: 1, max: 5 });

  return {
    id: `pm_${faker.string.alphanumeric(24)}`,
    type: 'card',
    card: {
      brand,
      last4: faker.string.numeric(4),
      expMonth: faker.number.int({ min: 1, max: 12 }),
      expYear,
    },
    billing_details: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
    },
    ...overrides,
  };
}

/**
 * Create a mock Stripe payment intent
 */
export function createStripePaymentIntent(
  amountCents: number,
  customerId: string,
  overrides: Partial<TestStripePaymentIntent> = {}
): TestStripePaymentIntent {
  return {
    id: `pi_${faker.string.alphanumeric(24)}`,
    amount: amountCents,
    currency: 'usd',
    status: 'succeeded',
    customer: customerId,
    metadata: {},
    ...overrides,
  };
}

/**
 * Create a Stripe error for testing error handling
 */
export function createStripeError(
  code:
    | 'card_declined'
    | 'insufficient_funds'
    | 'expired_card'
    | 'incorrect_cvc'
    | 'processing_error'
    | 'rate_limit'
    | 'api_connection_error',
  overrides: Partial<TestStripeError> = {}
): TestStripeError {
  const errorDetails: Record<string, { type: TestStripeError['type']; message: string; statusCode: number }> = {
    card_declined: {
      type: 'card_error',
      message: 'Your card was declined',
      statusCode: 402,
    },
    insufficient_funds: {
      type: 'card_error',
      message: 'Your card has insufficient funds',
      statusCode: 402,
    },
    expired_card: {
      type: 'card_error',
      message: 'Your card has expired',
      statusCode: 402,
    },
    incorrect_cvc: {
      type: 'card_error',
      message: 'Your card\'s security code is incorrect',
      statusCode: 402,
    },
    processing_error: {
      type: 'api_error',
      message: 'An error occurred while processing your card',
      statusCode: 500,
    },
    rate_limit: {
      type: 'rate_limit_error',
      message: 'Too many requests. Please try again later',
      statusCode: 429,
    },
    api_connection_error: {
      type: 'api_error',
      message: 'Cannot connect to Stripe. Please check your internet connection',
      statusCode: 503,
    },
  };

  const details = errorDetails[code];

  return {
    type: details.type,
    code,
    message: details.message,
    statusCode: details.statusCode,
    ...overrides,
  };
}

/**
 * Standard Stripe test objects
 */
export const testStripe = {
  /**
   * Standard Visa card (test mode)
   */
  visaCard: (): TestStripePaymentMethod =>
    createStripePaymentMethod({
      id: 'pm_card_visa',
      card: {
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: new Date().getFullYear() + 2,
      },
    }),

  /**
   * Card that will be declined (test mode)
   */
  declinedCard: (): TestStripePaymentMethod =>
    createStripePaymentMethod({
      id: 'pm_card_chargeDeclined',
      card: {
        brand: 'visa',
        last4: '0002',
        expMonth: 12,
        expYear: new Date().getFullYear() + 2,
      },
    }),

  /**
   * Card with insufficient funds (test mode)
   */
  insufficientFundsCard: (): TestStripePaymentMethod =>
    createStripePaymentMethod({
      id: 'pm_card_chargeDeclinedInsufficientFunds',
      card: {
        brand: 'visa',
        last4: '9995',
        expMonth: 12,
        expYear: new Date().getFullYear() + 2,
      },
    }),

  /**
   * Standard test customer
   */
  customer: (): TestStripeCustomer =>
    createStripeCustomer({
      email: 'test@pickleball-passport.com',
      name: 'Test User',
    }),

  /**
   * Card declined error
   */
  cardDeclinedError: (): TestStripeError => createStripeError('card_declined'),

  /**
   * API connection error
   */
  connectionError: (): TestStripeError =>
    createStripeError('api_connection_error'),

  /**
   * Rate limit error
   */
  rateLimitError: (): TestStripeError => createStripeError('rate_limit'),
};
