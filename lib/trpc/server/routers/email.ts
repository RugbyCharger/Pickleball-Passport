/**
 * Email Router
 *
 * tRPC procedures for email operations
 */

import { z } from 'zod';
import { publicProcedure, router, adminProcedure } from '../trpc';
import { sendEmail, isConfigured } from '@/lib/email/sendgrid';
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
   * Send welcome email (internal use)
   */
  sendWelcome: publicProcedure
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
});
