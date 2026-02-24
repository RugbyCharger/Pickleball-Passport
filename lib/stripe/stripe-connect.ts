/**
 * Stripe Connect Service for Partner Payouts
 * E4-S14: Stripe Connect Partner Payouts
 *
 * Handles:
 * - Creating Stripe Connect Express accounts for partners
 * - Generating onboarding links
 * - Processing payouts via Stripe transfers
 * - Managing connected account status
 *
 * @see https://stripe.com/docs/connect
 */

import Stripe from 'stripe';
import { stripeLogger, logError } from '@/lib/logger';
import { getStripeServer } from '@/lib/stripe/server';

// Use canonical singleton from server.ts
const getStripeClient = getStripeServer;

// Lazy initialization
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    stripe = getStripeClient();
  }
  return stripe;
};

// ============================================================================
// Types
// ============================================================================

export interface CreateConnectAccountParams {
  partnerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  accountType?: 'express' | 'standard';
}

export interface CreateConnectAccountResult {
  accountId: string;
  accountType: string;
}

export interface CreateAccountLinkParams {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}

export interface AccountLinkResult {
  url: string;
  expiresAt: number;
}

export interface ConnectAccountStatus {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
  };
}

export interface CreateTransferParams {
  amount: number; // Amount in cents
  connectedAccountId: string;
  payoutId: string; // Our internal payout ID for metadata
  description?: string;
}

export interface TransferResult {
  transferId: string;
  amount: number;
  status: string;
}

// ============================================================================
// Account Management
// ============================================================================

/**
 * Create a Stripe Connect Express Account
 *
 * Express accounts are the recommended account type for most platforms.
 * Stripe handles most compliance/onboarding, and the partner gets a
 * Stripe-hosted dashboard.
 */
export async function createConnectAccount(
  params: CreateConnectAccountParams
): Promise<CreateConnectAccountResult> {
  const { partnerId, email, firstName, lastName, businessName, accountType = 'express' } = params;

  try {
    const account = await getStripe().accounts.create({
      type: accountType,
      email,
      metadata: {
        partnerId,
        platform: 'pickleball_passport',
      },
      business_type: 'individual',
      ...(firstName && lastName && {
        individual: {
          first_name: firstName,
          last_name: lastName,
          email,
        },
      }),
      ...(businessName && {
        business_profile: {
          name: businessName,
        },
      }),
      capabilities: {
        transfers: { requested: true },
      },
    });

    stripeLogger.info(
      { partnerId, accountId: account.id, accountType },
      'Created Stripe Connect account'
    );

    return {
      accountId: account.id,
      accountType,
    };
  } catch (error) {
    logError(stripeLogger, error, 'Error creating Stripe Connect account', { partnerId, email });
    throw new Error('Failed to create Stripe Connect account');
  }
}

/**
 * Create an Account Link for Onboarding
 *
 * This generates a URL that redirects the partner to Stripe's
 * onboarding flow to provide required information.
 */
export async function createAccountLink(
  params: CreateAccountLinkParams
): Promise<AccountLinkResult> {
  const { accountId, refreshUrl, returnUrl } = params;

  try {
    const accountLink = await getStripe().accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    stripeLogger.info(
      { accountId },
      'Created Stripe Connect account link'
    );

    return {
      url: accountLink.url,
      expiresAt: accountLink.expires_at,
    };
  } catch (error) {
    logError(stripeLogger, error, 'Error creating account link', { accountId });
    throw new Error('Failed to create onboarding link');
  }
}

/**
 * Get Connected Account Status
 *
 * Retrieves the current status of a connected account,
 * including whether they can receive payouts.
 */
export async function getConnectAccountStatus(
  accountId: string
): Promise<ConnectAccountStatus> {
  try {
    const account = await getStripe().accounts.retrieve(accountId);

    return {
      accountId: account.id,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      detailsSubmitted: account.details_submitted || false,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
      },
    };
  } catch (error) {
    logError(stripeLogger, error, 'Error retrieving account status', { accountId });
    throw new Error('Failed to retrieve account status');
  }
}

/**
 * Create a Login Link for Connected Account Dashboard
 *
 * For Express accounts, this creates a link to the Stripe Express Dashboard.
 */
export async function createLoginLink(accountId: string): Promise<string> {
  try {
    const loginLink = await getStripe().accounts.createLoginLink(accountId);
    return loginLink.url;
  } catch (error) {
    logError(stripeLogger, error, 'Error creating login link', { accountId });
    throw new Error('Failed to create dashboard link');
  }
}

// ============================================================================
// Transfers & Payouts
// ============================================================================

/**
 * Create a Transfer to Connected Account
 *
 * This transfers funds from the platform's Stripe account to the
 * connected partner's account. The partner can then withdraw to their bank.
 */
export async function createTransfer(
  params: CreateTransferParams
): Promise<TransferResult> {
  const { amount, connectedAccountId, payoutId, description } = params;

  try {
    const transfer = await getStripe().transfers.create({
      amount,
      currency: 'usd',
      destination: connectedAccountId,
      description: description || `Partner payout #${payoutId}`,
      metadata: {
        payoutId,
        platform: 'pickleball_passport',
      },
    });

    stripeLogger.info(
      { transferId: transfer.id, amount, connectedAccountId, payoutId },
      'Created Stripe transfer to connected account'
    );

    return {
      transferId: transfer.id,
      amount: transfer.amount,
      status: transfer.reversed ? 'reversed' : 'completed',
    };
  } catch (error) {
    logError(stripeLogger, error, 'Error creating transfer', {
      amount,
      connectedAccountId,
      payoutId,
    });

    // Return more specific error message
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe transfer failed: ${error.message}`);
    }
    throw new Error('Failed to create transfer');
  }
}

/**
 * Get Transfer Details
 */
export async function getTransfer(transferId: string): Promise<Stripe.Transfer> {
  try {
    return await getStripe().transfers.retrieve(transferId);
  } catch (error) {
    logError(stripeLogger, error, 'Error retrieving transfer', { transferId });
    throw new Error('Failed to retrieve transfer');
  }
}

/**
 * Get Platform Account Balance
 *
 * Retrieves the platform's available balance to ensure sufficient funds
 * for partner payouts.
 */
export async function getPlatformBalance(): Promise<{
  available: number;
  pending: number;
}> {
  try {
    const balance = await getStripe().balance.retrieve();

    // Find USD balance
    const availableUsd = balance.available.find((b) => b.currency === 'usd');
    const pendingUsd = balance.pending.find((b) => b.currency === 'usd');

    return {
      available: availableUsd?.amount || 0,
      pending: pendingUsd?.amount || 0,
    };
  } catch (error) {
    logError(stripeLogger, error, 'Error retrieving platform balance');
    throw new Error('Failed to retrieve platform balance');
  }
}

// ============================================================================
// Webhook Event Handlers
// ============================================================================

/**
 * Handle account.updated webhook event
 *
 * Called when a connected account's status changes (e.g., onboarding complete).
 */
export function parseAccountUpdatedEvent(event: Stripe.Event): {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
} | null {
  if (event.type !== 'account.updated') {
    return null;
  }

  const account = event.data.object as Stripe.Account;

  return {
    accountId: account.id,
    chargesEnabled: account.charges_enabled || false,
    payoutsEnabled: account.payouts_enabled || false,
    detailsSubmitted: account.details_submitted || false,
  };
}

/**
 * Handle transfer.created webhook event
 */
export function parseTransferEvent(event: Stripe.Event): {
  transferId: string;
  amount: number;
  destination: string;
  payoutId: string | null;
  status: string;
} | null {
  if (!event.type.startsWith('transfer.')) {
    return null;
  }

  const transfer = event.data.object as Stripe.Transfer;

  return {
    transferId: transfer.id,
    amount: transfer.amount,
    destination: typeof transfer.destination === 'string'
      ? transfer.destination
      : transfer.destination?.id || '',
    payoutId: (transfer.metadata?.payoutId as string) || null,
    status: transfer.reversed ? 'reversed' : 'completed',
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if Stripe Connect is configured
 */
export function isStripeConnectConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

/**
 * Format amount for display
 */
export function formatPayoutAmount(amountInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100);
}
