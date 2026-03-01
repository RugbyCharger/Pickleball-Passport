/**
 * Support Router
 *
 * tRPC procedures for support ticket management
 * Handles ticket creation, listing, and status tracking
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { checkRateLimit, getIpAddress } from '@/lib/rate-limit';
import { apiLogger, dbLogger, emailLogger, logError } from '@/lib/logger';
import { nanoid } from 'nanoid';
import {
  sendTicketCreatedEmail,
  sendTicketAdminNotification,
  sendTicketReplyEmail,
  sendTicketResolvedEmail,
  isConfigured as isEmailConfigured,
} from '@/lib/email/sendgrid';

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
  // Honeypot field - should always be empty for real users
  website: z.string().optional(),
});

export const supportRouter = router({
  /**
   * Get public ticket status by reference number and email
   *
   * Rate limited: 10 lookups per hour per email
   * Used by the public ticket status page
   */
  getPublicTicketStatus: publicProcedure
    .input(
      z.object({
        referenceNumber: z
          .string()
          .min(1, 'Reference number is required')
          .regex(/^TKT-[A-Za-z0-9]{8}$/, 'Invalid reference number format'),
        email: z.string().email('Please enter a valid email address'),
      })
    )
    .query(async ({ input, ctx }) => {
      const { referenceNumber, email } = input;
      const normalizedEmail = email.toLowerCase().trim();

      // Rate limiting by email (10 lookups per hour)
      const rateLimitResult = await checkRateLimit(
        'ticketStatus',
        `email:${normalizedEmail}`
      );

      if (rateLimitResult && !rateLimitResult.success) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message:
            'Too many status lookups. Please try again later (limit: 10 per hour).',
        });
      }

      // Find ticket by reference number AND email
      const ticket = await ctx.db.supportTicket.findFirst({
        where: {
          referenceNumber,
          email: normalizedEmail,
        },
        include: {
          replies: {
            where: {
              isAdminReply: true,
            },
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              message: true,
              createdAt: true,
              isAdminReply: true,
            },
          },
        },
      });

      if (!ticket) {
        // Don't reveal whether the reference number exists for security
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'No ticket found with this reference number and email combination. Please check your details and try again.',
        });
      }

      // Return sanitized ticket info (no internal IDs, user info, etc.)
      return {
        referenceNumber: ticket.referenceNumber,
        subject: ticket.subject,
        message: ticket.message,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        resolvedAt: ticket.resolvedAt,
        replies: ticket.replies.map((reply) => ({
          message: reply.message,
          createdAt: reply.createdAt,
        })),
      };
    }),

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

      const normalizedEmail = email.toLowerCase().trim();

      // Build human-readable category label
      const categoryLabel = category
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());

      // ── Zapier webhook (primary — ensures lead reaches CRM) ──
      if (process.env.ZAPIER_WEBHOOK_URL) {
        try {
          const payload: Record<string, string> = {
            source: 'contact_form',
            name: name.trim(),
            email: normalizedEmail,
            how_can_we_help: categoryLabel,
            message,
          };
          if (timeline) payload.timeline = timeline;
          if (tripInterest) payload.trip_interest = tripInterest;
          if (phone) payload.phone = phone;

          await fetch(process.env.ZAPIER_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch (err) {
          console.error('Zapier webhook failed (contact form):', err);
        }
      }

      // ── DB ticket (secondary — best-effort) ──
      const referenceNumber = generateReferenceNumber();
      let subject = `${categoryLabel}`;
      if (tripInterest) subject += ` - ${tripInterest}`;
      if (timeline) subject += ` (Timeline: ${timeline})`;

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

        dbLogger.info({ referenceNumber, category }, 'Public support ticket created');

        // Send emails non-blocking
        if (isEmailConfigured()) {
          sendTicketCreatedEmail(normalizedEmail, {
            name,
            email: normalizedEmail,
            referenceNumber,
            category,
            message,
            source: 'WEBSITE_CONTACT',
          }).catch((error) => {
            logError(emailLogger, error, 'Failed to send ticket created email', {
              referenceNumber,
              email: normalizedEmail,
            });
          });

          sendTicketAdminNotification({
            referenceNumber,
            name,
            email: normalizedEmail,
            phone: phone || null,
            category,
            message,
            priority: 'NORMAL',
            source: 'WEBSITE_CONTACT',
            createdAt: ticket.createdAt,
          }).catch((error) => {
            logError(emailLogger, error, 'Failed to send ticket admin notification', {
              referenceNumber,
            });
          });
        }
      } catch (error) {
        // DB failure is non-fatal — the Zapier webhook already captured the lead
        logError(dbLogger, error, 'Failed to create public support ticket (non-fatal, webhook sent)');
      }

      return {
        success: true,
        referenceNumber,
        message: "Message sent! We'll get back to you within 24 hours.",
      };
    }),

  /**
   * Create a new support ticket (authenticated users)
   * Auto-links to the guest's latest booking if available
   */
  create: protectedProcedure
    .input(
      z.object({
        message: z.string().min(20, 'Message must be at least 20 characters'),
        priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
        category: z.enum([
          'GENERAL_INQUIRY',
          'BOOKING_QUESTION',
          'MEDICAL_WELLNESS_QUESTION',
          'PAYMENT_ISSUE',
          'PARTNERSHIP_INQUIRY',
          'OTHER',
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user email from context
      const userEmail =
        ctx.user.emailAddresses?.[0]?.emailAddress || '';
      const userName =
        ctx.user.fullName ||
        `${ctx.user.firstName || ''} ${ctx.user.lastName || ''}`.trim() ||
        null;

      const referenceNumber = generateReferenceNumber();

      // Auto-link to the guest's latest booking (if available)
      const latestBooking = await ctx.db.booking.findFirst({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      // Build subject from category
      const categoryLabel = input.category
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
      const subject = `${categoryLabel} - Guest Dashboard`;

      const ticket = await ctx.db.supportTicket.create({
        data: {
          referenceNumber,
          userId: ctx.user.id,
          subject,
          message: input.message,
          priority: input.priority,
          category: input.category,
          source: 'GUEST_DASHBOARD',
          status: 'OPEN',
          email: userEmail,
          name: userName,
          bookingId: latestBooking?.id || null,
        },
      });

      dbLogger.info(
        {
          referenceNumber,
          category: input.category,
          hasBooking: !!latestBooking,
        },
        'Guest support ticket created'
      );

      // Send emails non-blocking (don't wait for them to complete)
      if (isEmailConfigured()) {
        // Send confirmation email to user
        sendTicketCreatedEmail(userEmail, {
          name: userName || 'Guest',
          email: userEmail,
          referenceNumber,
          category: input.category,
          message: input.message,
          source: 'GUEST_DASHBOARD',
        }).catch((error) => {
          logError(emailLogger, error, 'Failed to send ticket created email', {
            referenceNumber,
            email: userEmail,
          });
        });

        // Send notification email to admin
        sendTicketAdminNotification({
          referenceNumber,
          name: userName || 'Guest',
          email: userEmail,
          category: input.category,
          message: input.message,
          priority: input.priority,
          source: 'GUEST_DASHBOARD',
          createdAt: ticket.createdAt,
        }).catch((error) => {
          logError(emailLogger, error, 'Failed to send ticket admin notification', {
            referenceNumber,
          });
        });
      }

      return {
        ...ticket,
        referenceNumber: ticket.referenceNumber,
      };
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
   * Get single support ticket by ID with replies
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.db.supportTicket.findUnique({
        where: { id: input.id },
        include: {
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          booking: {
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
        },
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

  // ============================================================================
  // ADMIN PROCEDURES
  // ============================================================================

  /**
   * Admin: Get all support tickets with filters
   */
  adminGetTickets: adminProcedure
    .input(
      z
        .object({
          status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
          priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
          source: z.enum(['WEBSITE_CONTACT', 'GUEST_DASHBOARD', 'ADMIN_CREATED', 'EMAIL']).optional(),
          category: z
            .enum([
              'GENERAL_INQUIRY',
              'BOOKING_QUESTION',
              'MEDICAL_WELLNESS_QUESTION',
              'PAYMENT_ISSUE',
              'PARTNERSHIP_INQUIRY',
              'OTHER',
            ])
            .optional(),
          search: z.string().optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
          assignedToId: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      if (input?.status) where.status = input.status;
      if (input?.priority) where.priority = input.priority;
      if (input?.source) where.source = input.source;
      if (input?.category) where.category = input.category;
      if (input?.assignedToId) where.assignedToId = input.assignedToId;

      // Date range filter
      if (input?.dateFrom || input?.dateTo) {
        where.createdAt = {};
        if (input?.dateFrom) {
          (where.createdAt as Record<string, Date>).gte = new Date(input.dateFrom);
        }
        if (input?.dateTo) {
          const endDate = new Date(input.dateTo);
          endDate.setHours(23, 59, 59, 999);
          (where.createdAt as Record<string, Date>).lte = endDate;
        }
      }

      // Search filter (search across name, email, message, referenceNumber)
      if (input?.search && input.search.trim()) {
        const searchTerm = input.search.trim();
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { message: { contains: searchTerm, mode: 'insensitive' } },
          { subject: { contains: searchTerm, mode: 'insensitive' } },
          { referenceNumber: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      const [tickets, total] = await Promise.all([
        ctx.db.supportTicket.findMany({
          where,
          include: {
            assignedTo: {
              select: {
                id: true,
                email: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                guestProfile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
          orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
          take: input?.limit ?? 50,
          skip: input?.offset ?? 0,
        }),
        ctx.db.supportTicket.count({ where }),
      ]);

      return {
        tickets,
        total,
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      };
    }),

  /**
   * Admin: Get ticket counts by status for dashboard stats
   */
  adminGetCounts: adminProcedure.query(async ({ ctx }) => {
    const [total, open, inProgress, resolved, closed, urgent] = await Promise.all([
      ctx.db.supportTicket.count(),
      ctx.db.supportTicket.count({ where: { status: 'OPEN' } }),
      ctx.db.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      ctx.db.supportTicket.count({ where: { status: 'RESOLVED' } }),
      ctx.db.supportTicket.count({ where: { status: 'CLOSED' } }),
      ctx.db.supportTicket.count({ where: { priority: 'URGENT', status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      urgent,
    };
  }),

  /**
   * Admin: Get single ticket by ID with full details
   */
  adminGetTicketDetail: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.db.supportTicket.findUnique({
        where: { id: input.id },
        include: {
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          attachments: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
            },
          },
          booking: {
            select: {
              id: true,
              bookingReference: true,
              status: true,
              createdAt: true,
              package: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Support ticket not found',
        });
      }

      return ticket;
    }),

  /**
   * Admin: Reply to a ticket
   */
  adminReplyToTicket: adminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        message: z.string().min(1, 'Reply message is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ticket exists
      const ticket = await ctx.db.supportTicket.findUnique({
        where: { id: input.ticketId },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Support ticket not found',
        });
      }

      // Create the reply
      const reply = await ctx.db.supportTicketReply.create({
        data: {
          ticketId: input.ticketId,
          userId: ctx.user.id,
          message: input.message,
          isAdminReply: true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Auto-update ticket status to IN_PROGRESS if it was OPEN
      if (ticket.status === 'OPEN') {
        await ctx.db.supportTicket.update({
          where: { id: input.ticketId },
          data: { status: 'IN_PROGRESS' },
        });
      }

      dbLogger.info(
        {
          ticketId: input.ticketId,
          referenceNumber: ticket.referenceNumber,
          adminId: ctx.user.id,
        },
        'Admin replied to support ticket'
      );

      // Send email notification to ticket submitter (non-blocking)
      if (isEmailConfigured() && ticket.email) {
        const adminName = reply.user?.email || 'The Pickleball Passport Support';

        sendTicketReplyEmail(ticket.email, {
          name: ticket.name || 'Guest',
          email: ticket.email,
          referenceNumber: ticket.referenceNumber,
          adminName,
          replyMessage: input.message,
          originalSubject: ticket.subject,
          source: ticket.source,
        }).catch((error) => {
          logError(emailLogger, error, 'Failed to send ticket reply email', {
            referenceNumber: ticket.referenceNumber,
            email: ticket.email,
          });
        });
      }

      return reply;
    }),

  /**
   * Admin: Update ticket status
   */
  adminUpdateTicketStatus: adminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.supportTicket.findUnique({
        where: { id: input.ticketId },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Support ticket not found',
        });
      }

      const updateData: Record<string, unknown> = {
        status: input.status,
      };

      // Set resolvedAt when moving to RESOLVED or CLOSED
      if (input.status === 'RESOLVED' || input.status === 'CLOSED') {
        updateData.resolvedAt = new Date();
      } else if (ticket.resolvedAt) {
        // Clear resolvedAt if reopening
        updateData.resolvedAt = null;
      }

      const updatedTicket = await ctx.db.supportTicket.update({
        where: { id: input.ticketId },
        data: updateData,
      });

      dbLogger.info(
        {
          ticketId: input.ticketId,
          referenceNumber: ticket.referenceNumber,
          oldStatus: ticket.status,
          newStatus: input.status,
          adminId: ctx.user.id,
        },
        'Admin updated ticket status'
      );

      // Send email notification when ticket is resolved (non-blocking)
      if (
        isEmailConfigured() &&
        ticket.email &&
        input.status === 'RESOLVED' &&
        ticket.status !== 'RESOLVED'
      ) {
        sendTicketResolvedEmail(ticket.email, {
          name: ticket.name || 'Guest',
          email: ticket.email,
          referenceNumber: ticket.referenceNumber,
          originalSubject: ticket.subject,
          source: ticket.source,
        }).catch((error) => {
          logError(emailLogger, error, 'Failed to send ticket resolved email', {
            referenceNumber: ticket.referenceNumber,
            email: ticket.email,
          });
        });
      }

      return updatedTicket;
    }),

  /**
   * Admin: Assign ticket to admin user
   */
  adminAssignTicket: adminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        assignedToId: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.supportTicket.findUnique({
        where: { id: input.ticketId },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Support ticket not found',
        });
      }

      // If assigning to someone, verify they are an admin
      if (input.assignedToId) {
        const assignee = await ctx.db.user.findUnique({
          where: { id: input.assignedToId },
          select: { role: true },
        });

        if (!assignee || assignee.role !== 'ADMIN') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Can only assign tickets to admin users',
          });
        }
      }

      const updatedTicket = await ctx.db.supportTicket.update({
        where: { id: input.ticketId },
        data: {
          assignedToId: input.assignedToId,
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      dbLogger.info(
        {
          ticketId: input.ticketId,
          referenceNumber: ticket.referenceNumber,
          assignedToId: input.assignedToId,
          adminId: ctx.user.id,
        },
        'Admin assigned ticket'
      );

      return updatedTicket;
    }),

  /**
   * Admin: Get list of admin users for assignment dropdown
   */
  adminGetAdminUsers: adminProcedure.query(async ({ ctx }) => {
    const admins = await ctx.db.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
      },
      orderBy: { email: 'asc' },
    });

    return admins;
  }),
});
