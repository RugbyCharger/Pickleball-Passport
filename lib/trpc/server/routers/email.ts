/**
 * Email Router
 *
 * tRPC procedures for email operations
 */

import { z } from 'zod';
import { publicProcedure, router, adminProcedure } from '../trpc';
import { sendEmail, isConfigured, sendBookingConfirmation } from '@/lib/email/sendgrid';
import { generateWelcomeEmail } from '@/lib/email/templates/welcome';
import { TRPCError } from '@trpc/server';

export const emailRouter = router({
  /**
   * Check if SendGrid is configured
   */
  isConfigured: publicProcedure.query(() => {
    return { configured: isConfigured() };
  }),

  /**
   * Send a test email (admin only)
   */
  sendTest: adminProcedure
    .input(
      z.object({
        to: z.string().email('Invalid email address'),
        subject: z.string().min(1, 'Subject is required'),
        message: z.string().min(1, 'Message is required'),
      })
    )
    .mutation(async ({ input }) => {
      if (!isConfigured()) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'SendGrid is not configured. Please set SENDGRID_API_KEY environment variable.',
        });
      }

      const html = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Test Email from Pickleball Passport</h2>
          <p>${input.message}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is a test email sent from the admin panel.
          </p>
        </div>
      `;

      try {
        await sendEmail({
          to: input.to,
          subject: input.subject,
          html,
          text: input.message,
        });

        return { success: true, message: 'Test email sent successfully' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to send email',
        });
      }
    }),

  /**
   * Send welcome email (admin only - for testing/manual triggers)
   * SECURITY: Changed from publicProcedure to prevent email abuse
   */
  sendWelcome: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        firstName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      if (!isConfigured()) {
        console.warn('SendGrid not configured, skipping welcome email');
        return { success: false, message: 'Email service not configured' };
      }

      const emailContent = generateWelcomeEmail({
        email: input.email,
        firstName: input.firstName,
      });

      try {
        await sendEmail({
          to: input.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        return { success: true, message: 'Welcome email sent' };
      } catch (error) {
        console.error('Failed to send welcome email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send welcome email',
        });
      }
    }),

  /**
   * Send booking confirmation email (admin only - for testing/manual triggers)
   * SECURITY: Changed from publicProcedure to prevent email abuse
   */
  sendBookingConfirmation: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        firstName: z.string(),
        bookingReference: z.string(),
        packageName: z.string(),
        duration: z.number().positive(),
        accommodationTier: z.string(),
        tripStartDate: z.string().optional(),
        tripEndDate: z.string().optional(),
        destination: z.string().default('Chiang Mai, Thailand'),
        basePrice: z.number().nonnegative(),
        accommodationPrice: z.number().nonnegative(),
        addOnsTotal: z.number().nonnegative(),
        totalPrice: z.number().positive(),
        addOns: z
          .array(
            z.object({
              name: z.string(),
              quantity: z.number().positive(),
              price: z.number().nonnegative(),
            })
          )
          .optional(),
        portalUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!isConfigured()) {
        console.warn('SendGrid not configured, skipping booking confirmation email');
        return { success: false, message: 'Email service not configured' };
      }

      try {
        await sendBookingConfirmation(input.email, {
          firstName: input.firstName,
          email: input.email,
          bookingReference: input.bookingReference,
          packageName: input.packageName,
          duration: input.duration,
          accommodationTier: input.accommodationTier,
          tripStartDate: input.tripStartDate,
          tripEndDate: input.tripEndDate,
          destination: input.destination,
          basePrice: input.basePrice,
          accommodationPrice: input.accommodationPrice,
          addOnsTotal: input.addOnsTotal,
          totalPrice: input.totalPrice,
          addOns: input.addOns,
          portalUrl: input.portalUrl,
        });

        return { success: true, message: 'Booking confirmation email sent' };
      } catch (error) {
        console.error('Failed to send booking confirmation email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send booking confirmation email',
        });
      }
    }),
});
