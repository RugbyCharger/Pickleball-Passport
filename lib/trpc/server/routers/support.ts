/**
 * Support Router
 *
 * tRPC procedures for support ticket management
 * Handles ticket creation, listing, and status tracking
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { checkRateLimit, getIpAddress } from '@/lib/rate-limit';
import { apiLogger, dbLogger, logError } from '@/lib/logger';
import { nanoid } from 'nanoid';

/**
 * Generate a unique reference number for support tickets
 * Format: TKT-XXXXXXXX (8 character alphanumeric)
 */
function generateReferenceNumber(): string {
  return `TKT-${nanoid(8)}`;
}

/**
 * Phone validation regex - allows various phone formats
 */
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

/**
 * Public ticket creation schema
 */
const createPublicTicketSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(phoneRegex, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  category: z.enum([
    'GENERAL_INQUIRY',
    'BOOKING_QUESTION',
    'MEDICAL_WELLNESS_QUESTION',
    'PAYMENT_ISSUE',
    'PARTNERSHIP_INQUIRY',
    'OTHER',
  ]),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(5000, 'Message must be 5000 characters or less'),
  tripInterest: z.string().optional(),
  timeline: z.string().optional(),
  recaptchaToken: z.string().min(1, 'reCAPTCHA verification failed'),
  // Honeypot field - should always be empty for real users
  website: z.string().optional(),
});

/**
 * Verify reCAPTCHA token with Google API
 */
async function verifyRecaptcha(token: string): Promise<{
  success: boolean;
  score: number;
  action: string;
}> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    apiLogger.error('RECAPTCHA_SECRET_KEY is not configured');
    throw new Error('reCAPTCHA is not configured');
  }

  const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
  const response = await fetch(verifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${secretKey}&response=${token}`,
  });

  if (!response.ok) {
    throw new Error('reCAPTCHA verification request failed');
  }

  const data = await response.json();

  return {
    success: data.success || false,
    score: data.score || 0,
    action: data.action || '',
  };
}

export const supportRouter = router({
  /**
   * Create a public support ticket (unauthenticated)
   *
   * Rate limited: 3 requests per minute per IP
   * Used by the public contact form
   */
  createPublicTicket: publicProcedure
    .input(createPublicTicketSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        email,
        phone,
        category,
        message,
        tripInterest,
        timeline,
        recaptchaToken,
        website,
      } = input;

      // Honeypot check - if website field is filled, it's a bot
      if (website && website.length > 0) {
        apiLogger.warn(
          {
            emailDomain: email.split('@')[1] || 'unknown',
          },
          'Honeypot triggered - bot detected'
        );
        // Return success to fool the bot
        return {
          success: true,
          referenceNumber: 'TKT-XXXXXXXX',
          message: "Thank you! We'll be in touch soon.",
        };
      }

      // Rate limiting check
      const ip = getIpAddress(ctx.headers);
      const rateLimitResult = await checkRateLimit('contact', ip);

      if (rateLimitResult && !rateLimitResult.success) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests. Please try again in a minute.',
        });
      }

      // Verify reCAPTCHA
      try {
        const recaptchaResult = await verifyRecaptcha(recaptchaToken);

        if (!recaptchaResult.success) {
          apiLogger.warn(
            {
              emailDomain: email.split('@')[1] || 'unknown',
              action: recaptchaResult.action,
            },
            'reCAPTCHA verification failed'
          );
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'reCAPTCHA verification failed. Please try again.',
          });
        }

        // Check score threshold
        if (recaptchaResult.score < 0.5) {
          apiLogger.warn(
            {
              emailDomain: email.split('@')[1] || 'unknown',
              score: recaptchaResult.score,
            },
            'reCAPTCHA score too low'
          );
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Spam detected. Please try again.',
          });
        }

        apiLogger.info(
          {
            emailDomain: email.split('@')[1] || 'unknown',
            score: recaptchaResult.score,
          },
          'reCAPTCHA verification passed'
        );
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'reCAPTCHA verification failed',
        });
      }

      // Generate reference number
      const referenceNumber = generateReferenceNumber();
      const normalizedEmail = email.toLowerCase().trim();

      // Build subject from category and optional trip interest
      const categoryLabel = category
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
      let subject = `${categoryLabel}`;
      if (tripInterest) {
        subject += ` - ${tripInterest}`;
      }
      if (timeline) {
        subject += ` (Timeline: ${timeline})`;
      }

      // Create the support ticket
      try {
        const ticket = await ctx.db.supportTicket.create({
          data: {
            referenceNumber,
            subject,
            message,
            category,
            source: 'WEBSITE_CONTACT',
            status: 'OPEN',
            priority: 'NORMAL',
            email: normalizedEmail,
            name,
            phone: phone || null,
          },
        });

        dbLogger.info(
          {
            referenceNumber,
            category,
          },
          'Public support ticket created'
        );

        // TODO: Send confirmation email to user (US-004)
        // TODO: Send notification email to admin (US-004)

        return {
          success: true,
          referenceNumber: ticket.referenceNumber,
          message: `Thank you for contacting us! Your reference number is ${ticket.referenceNumber}. We'll respond within 24 hours.`,
        };
      } catch (error) {
        logError(dbLogger, error, 'Failed to create public support ticket');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit your request. Please try again.',
        });
      }
    }),

  /**
   * Create a new support ticket (authenticated users)
   */
  create: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(5, 'Subject must be at least 5 characters'),
        message: z.string().min(20, 'Message must be at least 20 characters'),
        priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
        category: z
          .enum([
            'GENERAL_INQUIRY',
            'BOOKING_QUESTION',
            'MEDICAL_WELLNESS_QUESTION',
            'PAYMENT_ISSUE',
            'PARTNERSHIP_INQUIRY',
            'OTHER',
          ])
          .default('GENERAL_INQUIRY'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user email from context
      const userEmail =
        ctx.user.emailAddresses?.[0]?.emailAddress || ctx.user.email || '';
      const userName =
        ctx.user.fullName ||
        `${ctx.user.firstName || ''} ${ctx.user.lastName || ''}`.trim() ||
        null;

      const referenceNumber = generateReferenceNumber();

      const ticket = await ctx.db.supportTicket.create({
        data: {
          referenceNumber,
          userId: ctx.user.id,
          subject: input.subject,
          message: input.message,
          priority: input.priority,
          category: input.category,
          source: 'GUEST_DASHBOARD',
          status: 'OPEN',
          email: userEmail,
          name: userName,
        },
      });

      // TODO: Send email notification to admin
      // TODO: Send confirmation email to user

      return ticket;
    }),

  /**
   * Get all support tickets for current user
   */
  list: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const tickets = await ctx.db.supportTicket.findMany({
        where: {
          userId: ctx.user.id,
          ...(input?.status && { status: input.status }),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return tickets;
    }),

  /**
   * Get single support ticket by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.db.supportTicket.findUnique({
        where: { id: input.id },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Support ticket not found',
        });
      }

      // Ensure user owns this ticket
      if (ticket.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this ticket',
        });
      }

      return ticket;
    }),

  /**
   * Get ticket counts by status
   */
  getCounts: protectedProcedure.query(async ({ ctx }) => {
    const [total, open, inProgress, resolved] = await Promise.all([
      ctx.db.supportTicket.count({
        where: { userId: ctx.user.id },
      }),
      ctx.db.supportTicket.count({
        where: { userId: ctx.user.id, status: 'OPEN' },
      }),
      ctx.db.supportTicket.count({
        where: { userId: ctx.user.id, status: 'IN_PROGRESS' },
      }),
      ctx.db.supportTicket.count({
        where: { userId: ctx.user.id, status: 'RESOLVED' },
      }),
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
    };
  }),
});
