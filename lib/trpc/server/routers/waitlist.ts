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
        // Extended CRM fields
        tripInterest: z.string().max(200).optional().or(z.literal('')),
        referralSource: z.string().max(200).optional().or(z.literal('')),
        referralName: z.string().max(200).optional().or(z.literal('')),
        utmSource: z.string().max(200).optional().or(z.literal('')),
        utmMedium: z.string().max(200).optional().or(z.literal('')),
        utmCampaign: z.string().max(200).optional().or(z.literal('')),
        utmContent: z.string().max(200).optional().or(z.literal('')),
        leadSource: z.string().max(200).optional().or(z.literal('')),
        tripType: z.string().max(200).optional().or(z.literal('')),
        departureDate: z.string().max(200).optional().or(z.literal('')),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        fullName, email, phone, trip, hearAbout, clubRef,
        tripInterest, referralSource, referralName,
        utmSource, utmMedium, utmCampaign, utmContent,
        leadSource, tripType, departureDate,
      } = input;

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

      // ── Zapier webhook (primary — fires first to ensure lead reaches CRM) ──
      if (process.env.ZAPIER_WEBHOOK_URL) {
        try {
          const payload: Record<string, string> = {
            source: 'reserve_your_spot',
            name: fullName.trim(),
            email: normalizedEmail,
            preferred_trip: trip,
          };
          // Phone: included when E.164 format (starts with +)
          if (phone && phone.startsWith('+')) payload.phone = phone;
          // Legacy fields (backward compat)
          if (hearAbout) payload.how_heard = hearAbout;
          if (clubRef) payload.referred_by = clubRef;
          // Extended CRM fields
          if (tripInterest) payload.trip_interest = tripInterest;
          if (referralSource) payload.referral_source = referralSource;
          if (referralName) payload.referral_name = referralName;
          if (utmSource) payload.utm_source = utmSource;
          if (utmMedium) payload.utm_medium = utmMedium;
          if (utmCampaign) payload.utm_campaign = utmCampaign;
          if (utmContent) payload.utm_content = utmContent;
          if (leadSource) payload.lead_source = leadSource;
          if (tripType) payload.trip_type = tripType;
          if (departureDate) payload.departure_date = departureDate;

          await fetch(process.env.ZAPIER_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch (err) {
          console.error('Zapier webhook failed:', err);
        }
      }

      // ── DB entry (secondary — best-effort) ──
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
      } catch (error) {
        // DB failure is non-fatal — the Zapier webhook already captured the lead
        console.error('Failed to create waitlist entry (non-fatal, webhook sent):', error);
      }

      return {
        success: true,
        message:
          "You're on the list! We'll reach out with final pricing and booking details soon.",
      };
    }),
});
