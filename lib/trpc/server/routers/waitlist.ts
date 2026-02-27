/**
 * Waitlist Router
 *
 * tRPC procedures for waitlist submissions.
 * Allows users to join a waitlist for upcoming trips.
 */

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { checkRateLimit, getIpAddress } from '@/lib/rate-limit';

export const waitlistRouter = router({
  /**
   * Submit a waitlist entry (unauthenticated)
   *
   * Rate limited: 3 requests per minute per IP (same as contact form)
   */
  submit: publicProcedure
    .input(
      z.object({
        fullName: z
          .string()
          .min(1, 'Full name is required')
          .max(100, 'Name must be 100 characters or less'),
        email: z.string().email('Please enter a valid email address'),
        phone: z
          .string()
          .max(30, 'Phone number is too long')
          .optional()
          .or(z.literal('')),
        trip: z.string().min(1, 'Trip is required'),
        hearAbout: z
          .string()
          .max(500, 'Response must be 500 characters or less')
          .optional()
          .or(z.literal('')),
        clubRef: z
          .string()
          .max(200, 'Response must be 200 characters or less')
          .optional()
          .or(z.literal('')),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { fullName, email, phone, trip, hearAbout, clubRef } = input;

      // Rate limiting check
      const ip = getIpAddress(ctx.headers);
      const rateLimitResult = await checkRateLimit('waitlist', ip);

      if (rateLimitResult && !rateLimitResult.success) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests. Please try again in a minute.',
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      try {
        await ctx.db.waitlistEntry.create({
          data: {
            fullName: fullName.trim(),
            email: normalizedEmail,
            phone: phone || null,
            trip,
            hearAbout: hearAbout || null,
            clubRef: clubRef || null,
          },
        });

        // Zapier webhook — awaited so Vercel doesn't kill the function before it fires
        if (process.env.ZAPIER_WEBHOOK_URL) {
          try {
            await fetch(process.env.ZAPIER_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: fullName.trim(),
                email: normalizedEmail,
                phone: phone || '',
                preferred_trip: trip,
                how_heard: hearAbout || '',
                referred_by: clubRef || '',
              }),
            });
          } catch (err) {
            console.error('Zapier webhook failed:', err);
          }
        }

        return {
          success: true,
          message:
            "You're on the list! We'll reach out with final pricing and booking details soon.",
        };
      } catch (error) {
        console.error('Failed to create waitlist entry:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit your request. Please try again.',
        });
      }
    }),
});
