/**
 * Rate Limiting Utility
 *
 * Uses Upstash Redis for distributed rate limiting.
 * Protects public endpoints from abuse (spam, DoS attacks).
 *
 * Configuration:
 * - UPSTASH_REDIS_REST_URL: Redis REST API URL
 * - UPSTASH_REDIS_REST_TOKEN: Redis REST API token
 *
 * Get these from: https://console.upstash.com/
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Check if rate limiting is configured
 */
export function isRateLimitConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/**
 * Create Redis client (lazy initialization)
 */
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!isRateLimitConfigured()) {
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return redis;
}

/**
 * Rate limiter configurations for different endpoints
 */
export const rateLimiters = {
  /**
   * Newsletter subscription: 5 requests per minute per IP
   * Prevents database spam and SendGrid quota exhaustion
   */
  newsletter: () => {
    const client = getRedis();
    if (!client) return null;

    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      prefix: 'ratelimit:newsletter',
      analytics: true,
    });
  },

  /**
   * Contact form: 3 requests per minute per IP
   * More restrictive due to email sending costs
   */
  contact: () => {
    const client = getRedis();
    if (!client) return null;

    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(3, '1 m'),
      prefix: 'ratelimit:contact',
      analytics: true,
    });
  },

  /**
   * General API: 60 requests per minute per IP
   * Fallback for other public endpoints
   */
  api: () => {
    const client = getRedis();
    if (!client) return null;

    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      prefix: 'ratelimit:api',
      analytics: true,
    });
  },

  /**
   * Ticket status lookup: 10 requests per hour per email
   * Prevents enumeration attacks on ticket reference numbers
   */
  ticketStatus: () => {
    const client = getRedis();
    if (!client) return null;

    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      prefix: 'ratelimit:ticket-status',
      analytics: true,
    });
  },

  /**
   * Gift notification resend: 3 requests per 24 hours per gift
   * Prevents spam by limiting how often gift notifications can be resent
   */
  giftResend: () => {
    const client = getRedis();
    if (!client) return null;

    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(3, '24 h'),
      prefix: 'ratelimit:gift-resend',
      analytics: true,
    });
  },

  /**
   * Auth endpoints: 10 requests per minute per IP
   * For login, signup, password reset - stricter to prevent credential stuffing
   */
  auth: () => {
    const client = getRedis();
    if (!client) return null;

    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      prefix: 'ratelimit:auth',
      analytics: true,
    });
  },

  /**
   * Authenticated API: 200 requests per minute per user ID
   * Higher limit for authenticated users to avoid carrier NAT issues
   * Uses user ID (not IP) to properly rate limit mobile app users
   */
  authApi: () => {
    const client = getRedis();
    if (!client) return null;

    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(200, '1 m'),
      prefix: 'ratelimit:auth-api',
      analytics: true,
    });
  },

  /**
   * Booking mutations: 20 requests per minute per user ID
   * Stricter limit for expensive booking operations
   * Uses user ID to avoid carrier NAT issues for mobile app users
   */
  booking: () => {
    const client = getRedis();
    if (!client) return null;

    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      prefix: 'ratelimit:booking',
      analytics: true,
    });
  },

  /**
   * Global rate limit: 100 requests per minute per IP
   * Applied in middleware for all non-webhook routes
   */
  global: () => {
    const client = getRedis();
    if (!client) return null;

    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      prefix: 'ratelimit:global',
      analytics: true,
    });
  },
};

/**
 * Rate limit result type
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a given identifier (usually IP address)
 *
 * @param limiterType - Type of rate limiter to use
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @returns Rate limit result or null if not configured
 */
export async function checkRateLimit(
  limiterType: keyof typeof rateLimiters,
  identifier: string
): Promise<RateLimitResult | null> {
  const limiter = rateLimiters[limiterType]();

  if (!limiter) {
    // Rate limiting not configured - allow request but log warning
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        `Rate limiting not configured for ${limiterType}. ` +
          'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
      );
    }
    return null;
  }

  try {
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // If rate limiting fails, log error but allow request
    console.error(`Rate limit check failed for ${limiterType}:`, error);
    return null;
  }
}

/**
 * Extract IP address from request headers
 * Works with various proxy configurations (Vercel, Cloudflare, etc.)
 */
export function getIpAddress(headers: Headers): string {
  // Check common proxy headers in order of priority
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Vercel-specific header
  const vercelForwardedFor = headers.get('x-vercel-forwarded-for');
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(',')[0].trim();
  }

  // Cloudflare-specific header
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback to unknown (should rarely happen in production)
  return 'unknown';
}

/**
 * Generate X-RateLimit response headers from rate limit result
 *
 * @param result - Rate limit check result
 * @returns Headers object with X-RateLimit-* and Retry-After headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const retryAfterSeconds = Math.ceil((result.reset - Date.now()) / 1000);

  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': retryAfterSeconds.toString(),
    'Retry-After': retryAfterSeconds.toString(),
  };
}
