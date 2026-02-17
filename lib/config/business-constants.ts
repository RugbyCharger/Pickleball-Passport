/**
 * Business Constants Configuration
 * 
 * Centralized configuration for all business logic constants.
 * All monetary values are in cents unless otherwise specified.
 * 
 * These values control pricing, fees, discounts, and business rules
 * across the entire application.
 */

// ============================================================================
// ACCOMMODATION PRICING
// ============================================================================

/**
 * Accommodation tier pricing additions (in cents)
 * These are added to the base package price
 */
export const ACCOMMODATION_TIER_PRICING = {
  /** Four Seasons - baseline (included in package) */
  LUXURY: 0,
  /** Aman - +$3,000 */
  ULTRA_LUXURY: 300000,
  /** Private Villa - +$5,000 */
  VILLA: 500000,
} as const

export type AccommodationTier = keyof typeof ACCOMMODATION_TIER_PRICING

// ============================================================================
// PARTNER REFERRAL DISCOUNTS
// ============================================================================

/**
 * Partner tier discount percentages
 * Applied to subtotal when a valid referral code is used
 */
export const PARTNER_TIER_DISCOUNTS = {
  /** Bronze tier: 5% discount */
  BRONZE: 0.05,
  /** Silver tier: 7.5% discount */
  SILVER: 0.075,
  /** Gold tier: 10% discount */
  GOLD: 0.10,
  /** Platinum tier: 15% discount */
  PLATINUM: 0.15,
} as const

export type PartnerTier = keyof typeof PARTNER_TIER_DISCOUNTS

// ============================================================================
// PAYMENT PLAN CONFIGURATION
// ============================================================================

/**
 * Full payment discount percentage (applied when paying in full upfront)
 */
export const FULL_PAYMENT_DISCOUNT_RATE = 0.02 // 2%

/**
 * Installment plan configuration
 */
export const INSTALLMENT_CONFIG = {
  /** Number of installments in the plan */
  NUM_INSTALLMENTS: 4,
  
  /** Percentage for each installment */
  PERCENTAGES: {
    FIRST: 0.50,  // 50%
    SECOND: 0.25, // 25%
    THIRD: 0.15,  // 15%
    FOURTH: 0.10, // 10%
  },
  
  /** Minimum days before trip to allow installment plans */
  MIN_DAYS_BEFORE_TRIP: 70,
  
  /** Days before trip for each installment due date */
  DUE_DATE_DAYS: {
    SECOND: 60,  // 60 days before trip
    THIRD: 30,   // 30 days before trip
    FOURTH: 7,   // 7 days before trip
  },
} as const

/**
 * 20% deposit payment plan configuration
 * Used for trip-page bookings (e.g., Thailand trip)
 */
export const DEPOSIT_20_CONFIG = {
  /** Deposit percentage (20%) */
  DEPOSIT_PERCENTAGE: 0.20,

  /** Remainder percentage (80%) */
  REMAINDER_PERCENTAGE: 0.80,

  /** Days before trip that remainder is due */
  REMAINDER_DUE_DAYS_BEFORE_TRIP: 30,
} as const

// ============================================================================
// REFUND POLICY
// ============================================================================

/**
 * Processing fee charged on cancellations (in cents)
 * This fee is retained from refunds when canceling more than 60 days out
 */
export const CANCELLATION_PROCESSING_FEE = 50000 // $500

/**
 * Refund policy configuration by days until trip
 */
export const REFUND_POLICY = {
  /** More than 60 days: 100% refund minus processing fee */
  FULL_REFUND_MIN_DAYS: 60,
  FULL_REFUND_PERCENTAGE: 1.0,
  
  /** 30-60 days: 50% refund */
  PARTIAL_REFUND_MIN_DAYS: 30,
  PARTIAL_REFUND_PERCENTAGE: 0.5,
  
  /** Less than 30 days: No refund */
  NO_REFUND_PERCENTAGE: 0,
} as const

// ============================================================================
// RESCHEDULE POLICY
// ============================================================================

export const RESCHEDULE_CONFIG = {
  /** Maximum number of reschedules allowed per booking */
  MAX_RESCHEDULES: 1,
  
  /** Rescheduling is only available less than 30 days before trip */
  ELIGIBLE_DAYS_BEFORE_TRIP: 30,
} as const

// ============================================================================
// GIFT BOOKING
// ============================================================================

export const GIFT_CONFIG = {
  /** Number of days before gift acceptance token expires */
  TOKEN_EXPIRY_DAYS: 90,
} as const

// ============================================================================
// PARTNER POINTS
// ============================================================================

export const PARTNER_POINTS_CONFIG = {
  /** Base points earned per $1,000 of booking value */
  POINTS_PER_1000_DOLLARS: 100,

  /** Minimum points earned per referral */
  MIN_POINTS: 500,

  /** Maximum points earned per referral */
  MAX_POINTS: 2000,
} as const

// ============================================================================
// GUEST REFERRAL POINTS (Epic 10)
// ============================================================================

/**
 * Guest referral points configuration
 * Points awarded when referred guest completes a booking
 */
export const GUEST_REFERRAL_POINTS_CONFIG = {
  /** Points for bookings under $15,000 */
  STANDARD_POINTS: 1000,

  /** Points for bookings $15,000 or more */
  HIGH_VALUE_POINTS: 1500,

  /** Threshold for high-value bookings (in cents) */
  HIGH_VALUE_THRESHOLD: 1500000, // $15,000

  /** Bonus points awarded when referred guest completes their trip */
  COMPLETION_BONUS_POINTS: 500,
} as const

// ============================================================================
// DURATION OPTIONS
// ============================================================================

/**
 * Valid trip duration options (in days)
 */
export const VALID_DURATIONS = [7, 10, 13, 14, 21] as const

/**
 * Base duration for price calculation (prices are scaled proportionally)
 */
export const BASE_DURATION_DAYS = 14

// ============================================================================
// RATE LIMITING
// ============================================================================

export const RATE_LIMIT_CONFIG = {
  /** Contact form: requests per minute per IP */
  CONTACT_FORM_REQUESTS_PER_MINUTE: 3,
  
  /** Newsletter signup: requests per minute per IP */
  NEWSLETTER_REQUESTS_PER_MINUTE: 5,
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate refund amount based on days until trip
 * @param totalPrice - Total booking price in cents
 * @param daysUntilTrip - Number of days until trip starts
 * @returns Refund amount and percentage
 */
export function calculateRefund(totalPrice: number, daysUntilTrip: number): {
  refundAmount: number
  refundPercentage: number
} {
  let refundAmount = 0
  let refundPercentage = 0

  if (daysUntilTrip > REFUND_POLICY.FULL_REFUND_MIN_DAYS) {
    refundAmount = totalPrice - CANCELLATION_PROCESSING_FEE
    refundPercentage = 100
  } else if (daysUntilTrip >= REFUND_POLICY.PARTIAL_REFUND_MIN_DAYS) {
    refundAmount = Math.floor(totalPrice * REFUND_POLICY.PARTIAL_REFUND_PERCENTAGE)
    refundPercentage = 50
  }

  // Ensure refund is never negative
  if (refundAmount < 0) {
    refundAmount = 0
  }

  return { refundAmount, refundPercentage }
}

/**
 * Calculate partner discount based on tier
 * @param tier - Partner tier
 * @param subtotal - Subtotal in cents
 * @returns Discount amount in cents
 */
export function calculatePartnerDiscount(tier: PartnerTier, subtotal: number): number {
  const discountRate = PARTNER_TIER_DISCOUNTS[tier] || 0
  return Math.round(subtotal * discountRate)
}

/**
 * Calculate duration-adjusted base price
 * @param basePrice - Base price for 14-day trip in cents
 * @param duration - Actual duration in days
 * @returns Adjusted price in cents
 */
export function calculateDurationAdjustedPrice(basePrice: number, duration: number): number {
  return Math.round(basePrice * (duration / BASE_DURATION_DAYS))
}

/**
 * Calculate partner points earned from a booking
 * @param totalPrice - Total booking price in cents
 * @returns Points earned
 */
export function calculatePartnerPoints(totalPrice: number): number {
  const basePoints = Math.floor(totalPrice / 100000) * PARTNER_POINTS_CONFIG.POINTS_PER_1000_DOLLARS
  return Math.min(
    Math.max(basePoints, PARTNER_POINTS_CONFIG.MIN_POINTS),
    PARTNER_POINTS_CONFIG.MAX_POINTS
  )
}

/**
 * Calculate guest referral points earned from a booking
 * Epic 10 - US-003: Points based on package value
 * @param totalPrice - Total booking price in cents
 * @returns Points earned (1000 for < $15K, 1500 for >= $15K)
 */
export function calculateGuestReferralPoints(totalPrice: number): number {
  return totalPrice >= GUEST_REFERRAL_POINTS_CONFIG.HIGH_VALUE_THRESHOLD
    ? GUEST_REFERRAL_POINTS_CONFIG.HIGH_VALUE_POINTS
    : GUEST_REFERRAL_POINTS_CONFIG.STANDARD_POINTS
}

// ============================================================================
// ALUMNI ENGAGEMENT (Phase 13)
// ============================================================================

/**
 * Alumni discount configuration
 * Applied when alumni guests rebook
 */
export const ALUMNI_DISCOUNT_CONFIG = {
  /** Alumni rebooking discount percentage */
  DISCOUNT_RATE: 0.10, // 10% discount
  /** Minimum days between using alumni discount */
  COOLDOWN_DAYS: 0, // No cooldown
  /** Alumni discount stacks with partner referral? */
  STACKS_WITH_PARTNER_DISCOUNT: false,
} as const

/**
 * Passport stamps configuration
 * Defines available stamps and their unlock criteria
 */
export const PASSPORT_STAMPS_CONFIG = {
  STAMPS: {
    FIRST_TRIP: {
      code: 'FIRST_TRIP',
      name: 'First Adventure',
      description: 'Complete your first The Pickleball Passport trip',
      category: 'TRIPS',
      criteria: { type: 'TRIPS_COMPLETED', count: 1 },
    },
    REPEAT_TRAVELER: {
      code: 'REPEAT_TRAVELER',
      name: 'Repeat Traveler',
      description: 'Complete two The Pickleball Passport trips',
      category: 'TRIPS',
      criteria: { type: 'TRIPS_COMPLETED', count: 2 },
    },
    REFERRAL_CHAMPION: {
      code: 'REFERRAL_CHAMPION',
      name: 'Referral Champion',
      description: 'Refer a friend who completes a trip',
      category: 'REFERRALS',
      criteria: { type: 'REFERRALS_COMPLETED', count: 1 },
    },
    STORYTELLER: {
      code: 'STORYTELLER',
      name: 'Storyteller',
      description: 'Submit an approved testimonial',
      category: 'ENGAGEMENT',
      criteria: { type: 'TESTIMONIAL_APPROVED', count: 1 },
    },
    MEMORY_MAKER: {
      code: 'MEMORY_MAKER',
      name: 'Memory Maker',
      description: 'Upload 10+ photos during a trip',
      category: 'ENGAGEMENT',
      criteria: { type: 'PHOTOS_UPLOADED', count: 10 },
    },
  },
} as const

export type StampCode = keyof typeof PASSPORT_STAMPS_CONFIG.STAMPS
export type StampCategory = 'TRIPS' | 'REFERRALS' | 'ENGAGEMENT' | 'ACHIEVEMENTS'
