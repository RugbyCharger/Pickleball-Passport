/**
 * Currency Service
 * E4-S13: Multi-Currency Support
 *
 * Handles currency conversion, exchange rates, and formatting.
 * Uses free exchange rate API with 1-hour caching.
 *
 * @see https://api.exchangerate-api.com/v4/latest/USD
 */

// Supported currencies for the booking system
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', flag: 'US' },
  EUR: { symbol: '\u20AC', name: 'Euro', flag: 'EU' },
  GBP: { symbol: '\u00A3', name: 'British Pound', flag: 'GB' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', flag: 'CA' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', flag: 'AU' },
} as const

export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES

// Default currency
export const DEFAULT_CURRENCY: SupportedCurrency = 'USD'

// Currency list for UI components
export const CURRENCY_OPTIONS = Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => ({
  code: code as SupportedCurrency,
  ...info,
}))

// Exchange rate cache (1 hour TTL)
interface ExchangeRateCache {
  rates: Record<string, number>
  timestamp: number
}

let exchangeRateCache: ExchangeRateCache | null = null
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// Fallback rates (approximate, used if API fails)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
}

/**
 * Fetch exchange rates from API
 * Uses exchangerate-api.com (no API key required for basic usage)
 */
async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 3600 }, // Next.js caching hint
    })

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`)
    }

    const data = await response.json()
    return data.rates as Record<string, number>
  } catch (error) {
    console.error('Failed to fetch exchange rates, using fallback:', error)
    return FALLBACK_RATES
  }
}

/**
 * Get current exchange rates (with caching)
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now()

  // Return cached rates if still valid
  if (exchangeRateCache && now - exchangeRateCache.timestamp < CACHE_TTL_MS) {
    return exchangeRateCache.rates
  }

  // Fetch fresh rates
  const rates = await fetchExchangeRates()

  // Update cache
  exchangeRateCache = {
    rates,
    timestamp: now,
  }

  return rates
}

/**
 * Get a single exchange rate
 */
export async function getExchangeRate(currency: SupportedCurrency): Promise<number> {
  if (currency === 'USD') return 1

  const rates = await getExchangeRates()
  return rates[currency] || FALLBACK_RATES[currency] || 1
}

/**
 * Convert amount from one currency to another
 *
 * @param amount - Amount in smallest currency unit (e.g., cents)
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Converted amount in smallest currency unit
 */
export async function convertAmount(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency
): Promise<number> {
  if (from === to) return amount

  const rates = await getExchangeRates()

  // Convert to USD first (if not already), then to target currency
  const usdAmount = from === 'USD' ? amount : amount / (rates[from] || 1)
  const convertedAmount = to === 'USD' ? usdAmount : usdAmount * (rates[to] || 1)

  // Round to nearest integer (we're dealing with cents/smallest units)
  return Math.round(convertedAmount)
}

/**
 * Convert amount synchronously using cached/fallback rates
 * Use this in UI components where async is not ideal
 */
export function convertAmountSync(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
  rates?: Record<string, number>
): number {
  if (from === to) return amount

  const exchangeRates = rates || exchangeRateCache?.rates || FALLBACK_RATES

  // Convert to USD first (if not already), then to target currency
  const usdAmount = from === 'USD' ? amount : amount / (exchangeRates[from] || 1)
  const convertedAmount = to === 'USD' ? usdAmount : usdAmount * (exchangeRates[to] || 1)

  // Round to nearest integer
  return Math.round(convertedAmount)
}

/**
 * Format currency amount for display
 *
 * @param amount - Amount in smallest currency unit (e.g., cents)
 * @param currency - Currency code
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'USD',
  options: Partial<Intl.NumberFormatOptions> = {}
): string {
  const currencyInfo = SUPPORTED_CURRENCIES[currency]
  if (!currencyInfo) {
    return formatCurrency(amount, 'USD', options)
  }

  // Convert from cents to dollars
  const dollars = amount / 100

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: dollars % 1 === 0 ? 0 : 2,
    ...options,
  }).format(dollars)
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  return SUPPORTED_CURRENCIES[currency]?.symbol || '$'
}

/**
 * Validate if a currency code is supported
 */
export function isSupportedCurrency(currency: string): currency is SupportedCurrency {
  return currency in SUPPORTED_CURRENCIES
}

/**
 * Stripe-compatible currency code (lowercase)
 * Stripe requires lowercase currency codes
 */
export function toStripeCurrency(currency: SupportedCurrency): string {
  return currency.toLowerCase()
}

/**
 * Convert Stripe currency code to our format (uppercase)
 */
export function fromStripeCurrency(currency: string): SupportedCurrency {
  const upper = currency.toUpperCase()
  return isSupportedCurrency(upper) ? upper : 'USD'
}

/**
 * Get the minimum charge amount for a currency (Stripe requirement)
 * https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
 */
export function getMinimumChargeAmount(currency: SupportedCurrency): number {
  const minimums: Record<SupportedCurrency, number> = {
    USD: 50, // $0.50
    EUR: 50, // 0.50 EUR
    GBP: 30, // 0.30 GBP
    CAD: 50, // C$0.50
    AUD: 50, // A$0.50
  }
  return minimums[currency] || 50
}

/**
 * Check if an amount meets the minimum charge requirement
 */
export function meetsMinimumCharge(amount: number, currency: SupportedCurrency): boolean {
  return amount >= getMinimumChargeAmount(currency)
}
