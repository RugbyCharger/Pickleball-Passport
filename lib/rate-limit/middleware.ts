/**
 * tRPC Rate Limit Middleware
 *
 * Provides per-procedure rate limiting for tRPC routers.
 * Uses Upstash Redis for distributed rate limiting.
 */

import { TRPCError } from '@trpc/server';
import { checkRateLimit, getIpAddress } from './index';
import type { Context } from '@/lib/trpc/server/trpc';

type RateLimiterType =
  | 'newsletter'
  | 'contact'
  | 'api'
  | 'ticketStatus'
  | 'giftResend'
  | 'auth'
  | 'authApi'
  | 'booking'
  | 'global';

interface RateLimitOptions {
  /**
   * Type of rate limiter to use
   */
  type: RateLimiterType;

  /**
   * Use user ID instead of IP for identifier (for authenticated routes)
   * Defaults to false (use IP)
   */
  useUserId?: boolean;

  /**
   * Custom identifier override (e.g., email for ticket status)
   */
  customIdentifier?: (ctx: Context) => string;
}

/**
 * Create a rate limit middleware for tRPC procedures
 *
 * Usage:
 * ```typescript
 * const rateLimitedProcedure = t.procedure.use(
 *   createRateLimitMiddleware({ type: 'booking', useUserId: true })
 * );
 * ```
 */
export function createRateLimitMiddleware(options: RateLimitOptions) {
  return async ({ ctx, next }: { ctx: Context; next: () => Promise<unknown> }) => {
    // Determine identifier
    let identifier: string;

    if (options.customIdentifier) {
      identifier = options.customIdentifier(ctx);
    } else if (options.useUserId && ctx.user?.id) {
      // Use user ID for authenticated routes (avoids carrier NAT issues)
      identifier = `user:${ctx.user.id}`;
    } else {
      // Fall back to IP for unauthenticated routes
      identifier = getIpAddress(ctx.headers);
    }

    // Check rate limit
    const result = await checkRateLimit(options.type, identifier);

    if (result && !result.success) {
      const retrySeconds = Math.ceil((result.reset - Date.now()) / 1000);
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${retrySeconds} seconds.`,
      });
    }

    return next();
  };
}

/**
 * Convenience wrapper for procedure builders
 *
 * Usage in routers:
 * ```typescript
 * myMutation: protectedProcedure
 *   .use(withRateLimit({ type: 'booking', useUserId: true }))
 *   .input(...)
 *   .mutation(...)
 * ```
 */
export const withRateLimit = createRateLimitMiddleware;
