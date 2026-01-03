/**
 * Newsletter Router
 *
 * tRPC procedures for newsletter subscription operations (E1-S11)
 */

import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { sendEmail, isConfigured } from '@/lib/email/sendgrid';
import { newsletterConfirmationEmail } from '@/lib/email/templates/newsletter-confirmation';
import { newsletterWelcomeEmail } from '@/lib/email/templates/newsletter-welcome';
import { unsubscribeConfirmationEmail } from '@/lib/email/templates/unsubscribe-confirmation';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export const newsletterRouter = router({
  /**
   * Subscribe to newsletter (double opt-in)
   *
   * TODO: Add rate limiting to prevent abuse (recommend: 5 requests/minute per IP using Upstash Redis)
   * - Without rate limiting, attackers can spam database with PENDING subscriptions
   * - Can exhaust SendGrid quota causing service disruption
   * - Reference: Story E1-S11 Code Review Issue MEDIUM-4
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address'),
      })
    )
    .mutation(async ({ input }) => {
      // Normalize email
      const normalizedEmail = input.email.toLowerCase().trim();

      // Check if SendGrid is configured
      if (!isConfigured()) {
        console.warn('SendGrid not configured, skipping confirmation email');
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Email service is not configured. Please try again later.',
        });
      }

      // Check for existing subscriber
      const existing = await prisma.newsletterSubscriber.findUnique({
        where: { email: normalizedEmail },
      });

      // If already active, return friendly message
      if (existing && existing.status === 'ACTIVE') {
        return {
          success: true,
          message: "You're already subscribed!",
          alreadySubscribed: true,
        };
      }

      // Generate secure confirmation token
      const confirmToken = crypto.randomBytes(32).toString('hex');

      // Create or update subscriber
      const subscriber = await prisma.newsletterSubscriber.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          status: 'PENDING',
          confirmToken,
        },
        update: {
          status: 'PENDING',
          confirmToken,
          unsubscribedAt: null, // Clear unsubscribe date if re-subscribing
        },
      });

      // Send confirmation email
      try {
        const emailContent = newsletterConfirmationEmail(
          normalizedEmail,
          confirmToken
        );

        await sendEmail({
          to: normalizedEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        return {
          success: true,
          message: 'Thanks for subscribing! Check your inbox to confirm.',
        };
      } catch (error) {
        // TODO: Add structured logging (Sentry/LogRocket) for production monitoring
        // Current console.error does not persist to database or monitoring system
        // Reference: Story E1-S11 Code Review Issue MEDIUM-5
        console.error('Failed to send confirmation email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send confirmation email. Please try again.',
        });
      }
    }),

  /**
   * Confirm subscription via token
   */
  confirm: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, 'Confirmation token is required'),
      })
    )
    .mutation(async ({ input }) => {
      // Find subscriber by confirmation token
      const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { confirmToken: input.token },
      });

      // Validate token exists
      if (!subscriber) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid or expired confirmation link.',
        });
      }

      // Check token expiration (7 days = 604800000 milliseconds)
      const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
      const tokenAge = Date.now() - subscriber.subscribedAt.getTime();

      if (tokenAge > TOKEN_EXPIRY_MS) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Confirmation link has expired. Please subscribe again.',
        });
      }

      // Validate status is PENDING
      if (subscriber.status !== 'PENDING') {
        // Already confirmed
        if (subscriber.status === 'ACTIVE') {
          return {
            success: true,
            message: "You're already confirmed!",
            alreadyConfirmed: true,
          };
        }

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This subscription cannot be confirmed.',
        });
      }

      // Update status to ACTIVE
      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          status: 'ACTIVE',
          confirmedAt: new Date(),
          confirmToken: null, // Invalidate token after use
        },
      });

      // Send welcome email
      if (isConfigured()) {
        try {
          const emailContent = newsletterWelcomeEmail(subscriber.email);

          await sendEmail({
            to: subscriber.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });
        } catch (error) {
          console.error('Failed to send welcome email:', error);
          // Don't fail confirmation if welcome email fails
        }
      }

      return {
        success: true,
        message: "Thanks for confirming! You're now subscribed.",
      };
    }),

  /**
   * Unsubscribe from newsletter
   */
  unsubscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address').optional(),
        token: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // At least one identifier must be provided
      if (!input.email && !input.token) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Email or token is required.',
        });
      }

      // Build where conditions dynamically to avoid empty OR clause
      const whereConditions = [];
      if (input.email) {
        whereConditions.push({ email: input.email.toLowerCase().trim() });
      }
      if (input.token) {
        whereConditions.push({ confirmToken: input.token });
      }

      // Find subscriber
      const subscriber = await prisma.newsletterSubscriber.findFirst({
        where: {
          OR: whereConditions,
        },
      });

      if (!subscriber) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subscriber not found.',
        });
      }

      // Check if already unsubscribed
      if (subscriber.status === 'UNSUBSCRIBED') {
        return {
          success: true,
          message: "You're already unsubscribed.",
          alreadyUnsubscribed: true,
        };
      }

      // Update status to UNSUBSCRIBED
      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          status: 'UNSUBSCRIBED',
          unsubscribedAt: new Date(),
        },
      });

      // Send unsubscribe confirmation email
      if (isConfigured()) {
        try {
          const emailContent = unsubscribeConfirmationEmail(subscriber.email);

          await sendEmail({
            to: subscriber.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });
        } catch (error) {
          console.error('Failed to send unsubscribe confirmation email:', error);
          // Don't fail unsubscribe if confirmation email fails
        }
      }

      return {
        success: true,
        message: "You've been unsubscribed. Sorry to see you go!",
      };
    }),
});
