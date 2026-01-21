/**
 * Guest Testimonial Router (Epic 12-5)
 *
 * Handles guest testimonial submission and admin moderation workflow.
 * Supports text, video, and before/after photo testimonials.
 *
 * Workflow:
 * 1. Guest submits testimonial (PENDING)
 * 2. Admin reviews -> APPROVED, REJECTED, or EDIT_REQUESTED
 * 3. Admin publishes approved testimonial -> PUBLISHED
 */

import { z } from 'zod';
import { router, protectedProcedure, adminProcedure, publicProcedure, guestProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { GuestTestimonialStatus, GuestTestimonialType } from '@prisma/client';
import { sendEmail } from '@/lib/email/send-email';
import { baseEmailTemplate } from '@/lib/email/templates/base';

// Input validation schemas
const testimonialTypeSchema = z.enum(['TEXT', 'VIDEO', 'BEFORE_AFTER', 'COMBINED']);
const testimonialStatusSchema = z.enum(['PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'EDIT_REQUESTED']);

export const guestTestimonialRouter = router({
  // ============================================================================
  // GUEST PROCEDURES (Submission)
  // ============================================================================

  /**
   * Submit a new testimonial (guest only)
   */
  submit: guestProcedure
    .input(
      z.object({
        type: testimonialTypeSchema,
        content: z.string().min(10, 'Testimonial must be at least 10 characters').max(5000).optional(),
        videoUrl: z.string().url().optional(),
        videoAssetId: z.string().optional(),
        videoThumbnail: z.string().url().optional(),
        beforePhotoUrl: z.string().url().optional(),
        afterPhotoUrl: z.string().url().optional(),
        guestName: z.string().min(2, 'Name is required'),
        guestLocation: z.string().optional(),
        packageType: z.string().optional(),
        tripDate: z.string().optional(),
        bookingId: z.string().optional(),
        consentGiven: z.boolean(),
        consentIpAddress: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate consent
      if (!input.consentGiven) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You must consent to sharing your testimonial to submit.',
        });
      }

      // Validate content based on type
      if (input.type === 'TEXT' && !input.content) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Text content is required for text testimonials.',
        });
      }

      if (input.type === 'VIDEO' && !input.videoUrl) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Video URL is required for video testimonials.',
        });
      }

      if (input.type === 'BEFORE_AFTER' && (!input.beforePhotoUrl || !input.afterPhotoUrl)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Both before and after photos are required.',
        });
      }

      // If bookingId provided, verify it belongs to the user
      if (input.bookingId) {
        const booking = await ctx.db.booking.findUnique({
          where: { id: input.bookingId },
          select: { userId: true, package: { select: { name: true } } },
        });

        if (!booking || booking.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Invalid booking reference.',
          });
        }
      }

      // Create testimonial
      const testimonial = await ctx.db.guestTestimonial.create({
        data: {
          guestId: ctx.user.id,
          type: input.type as GuestTestimonialType,
          content: input.content,
          videoUrl: input.videoUrl,
          videoAssetId: input.videoAssetId,
          videoThumbnail: input.videoThumbnail,
          beforePhotoUrl: input.beforePhotoUrl,
          afterPhotoUrl: input.afterPhotoUrl,
          guestName: input.guestName,
          guestLocation: input.guestLocation,
          packageType: input.packageType,
          tripDate: input.tripDate ? new Date(input.tripDate) : null,
          bookingId: input.bookingId,
          consentGiven: true,
          consentTimestamp: new Date(),
          consentIpAddress: input.consentIpAddress,
          status: 'PENDING',
        },
      });

      return testimonial;
    }),

  /**
   * Get current user's testimonials
   */
  myTestimonials: guestProcedure.query(async ({ ctx }) => {
    const testimonials = await ctx.db.guestTestimonial.findMany({
      where: { guestId: ctx.user.id },
      orderBy: { submittedAt: 'desc' },
    });

    return testimonials;
  }),

  /**
   * Update a testimonial (only if edit requested)
   */
  updateSubmission: guestProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(10).max(5000).optional(),
        videoUrl: z.string().url().optional(),
        beforePhotoUrl: z.string().url().optional(),
        afterPhotoUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const testimonial = await ctx.db.guestTestimonial.findUnique({
        where: { id: input.id },
      });

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found.',
        });
      }

      if (testimonial.guestId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to edit this testimonial.',
        });
      }

      // Only allow updates if status is EDIT_REQUESTED or PENDING
      if (testimonial.status !== 'EDIT_REQUESTED' && testimonial.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This testimonial cannot be edited in its current status.',
        });
      }

      const { id, ...updateData } = input;

      const updated = await ctx.db.guestTestimonial.update({
        where: { id },
        data: {
          ...updateData,
          status: 'PENDING', // Reset to pending for review
          editRequestNotes: null, // Clear edit notes
        },
      });

      return updated;
    }),

  // ============================================================================
  // ADMIN PROCEDURES (Moderation)
  // ============================================================================

  /**
   * Get all testimonials (admin moderation queue)
   */
  listAll: adminProcedure
    .input(
      z.object({
        status: testimonialStatusSchema.optional(),
        type: testimonialTypeSchema.optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, type, limit, offset, search } = input;

      const where = {
        ...(status && { status }),
        ...(type && { type }),
        ...(search && {
          OR: [
            { guestName: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
            { guestLocation: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      };

      const [testimonials, total] = await Promise.all([
        ctx.db.guestTestimonial.findMany({
          where,
          orderBy: { submittedAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            guest: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        }),
        ctx.db.guestTestimonial.count({ where }),
      ]);

      return {
        testimonials,
        total,
        hasMore: offset + testimonials.length < total,
      };
    }),

  /**
   * Get moderation queue counts by status
   */
  getQueueCounts: adminProcedure.query(async ({ ctx }) => {
    const [pending, approved, published, rejected, editRequested] = await Promise.all([
      ctx.db.guestTestimonial.count({ where: { status: 'PENDING' } }),
      ctx.db.guestTestimonial.count({ where: { status: 'APPROVED' } }),
      ctx.db.guestTestimonial.count({ where: { status: 'PUBLISHED' } }),
      ctx.db.guestTestimonial.count({ where: { status: 'REJECTED' } }),
      ctx.db.guestTestimonial.count({ where: { status: 'EDIT_REQUESTED' } }),
    ]);

    return {
      pending,
      approved,
      published,
      rejected,
      editRequested,
      total: pending + approved + published + rejected + editRequested,
    };
  }),

  /**
   * Get single testimonial by ID (admin)
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const testimonial = await ctx.db.guestTestimonial.findUnique({
        where: { id: input.id },
        include: {
          guest: {
            select: {
              id: true,
              email: true,
              guestProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found.',
        });
      }

      return testimonial;
    }),

  /**
   * Approve a testimonial
   */
  approve: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const testimonial = await ctx.db.guestTestimonial.findUnique({
        where: { id: input.id },
      });

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found.',
        });
      }

      if (testimonial.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only pending testimonials can be approved.',
        });
      }

      const updated = await ctx.db.guestTestimonial.update({
        where: { id: input.id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: ctx.user.id,
          rejectionReason: null,
        },
      });

      return updated;
    }),

  /**
   * Publish an approved testimonial
   */
  publish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const testimonial = await ctx.db.guestTestimonial.findUnique({
        where: { id: input.id },
      });

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found.',
        });
      }

      if (testimonial.status !== 'APPROVED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only approved testimonials can be published.',
        });
      }

      const updated = await ctx.db.guestTestimonial.update({
        where: { id: input.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });

      return updated;
    }),

  /**
   * Unpublish a published testimonial
   */
  unpublish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const testimonial = await ctx.db.guestTestimonial.findUnique({
        where: { id: input.id },
      });

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found.',
        });
      }

      if (testimonial.status !== 'PUBLISHED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only published testimonials can be unpublished.',
        });
      }

      const updated = await ctx.db.guestTestimonial.update({
        where: { id: input.id },
        data: {
          status: 'APPROVED',
          publishedAt: null,
        },
      });

      return updated;
    }),

  /**
   * Reject a testimonial
   */
  reject: adminProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().min(10, 'Please provide a reason for rejection'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const testimonial = await ctx.db.guestTestimonial.findUnique({
        where: { id: input.id },
        include: {
          guest: {
            select: { email: true },
          },
        },
      });

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found.',
        });
      }

      const updated = await ctx.db.guestTestimonial.update({
        where: { id: input.id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: ctx.user.id,
          rejectionReason: input.reason,
        },
      });

      // Send rejection email to guest
      try {
        await sendEmail({
          to: testimonial.guest.email,
          subject: 'Update on Your Testimonial Submission',
          html: baseEmailTemplate({
            title: 'Testimonial Update',
            content: `
              <h1>Thank You for Your Submission</h1>
              <p>Dear ${testimonial.guestName},</p>
              <p>Thank you for taking the time to share your experience with us. Unfortunately, we are unable to publish your testimonial at this time.</p>
              <p><strong>Reason:</strong></p>
              <p style="background-color: #f3f4f6; padding: 16px; border-radius: 8px;">${input.reason}</p>
              <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
              <p>Best regards,<br>The Pickleball Passport Team</p>
            `,
            preheader: 'Update on your testimonial submission',
          }),
        });
      } catch (error) {
        console.error('Failed to send rejection email:', error);
      }

      return updated;
    }),

  /**
   * Request edits from guest
   */
  requestEdits: adminProcedure
    .input(
      z.object({
        id: z.string(),
        notes: z.string().min(10, 'Please provide edit instructions'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const testimonial = await ctx.db.guestTestimonial.findUnique({
        where: { id: input.id },
        include: {
          guest: {
            select: { email: true },
          },
        },
      });

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found.',
        });
      }

      if (testimonial.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only pending testimonials can have edits requested.',
        });
      }

      const updated = await ctx.db.guestTestimonial.update({
        where: { id: input.id },
        data: {
          status: 'EDIT_REQUESTED',
          reviewedAt: new Date(),
          reviewedBy: ctx.user.id,
          editRequestNotes: input.notes,
        },
      });

      // Send edit request email to guest
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com';

      try {
        await sendEmail({
          to: testimonial.guest.email,
          subject: 'Action Required: Please Update Your Testimonial',
          html: baseEmailTemplate({
            title: 'Edit Request',
            content: `
              <h1>We'd Love to Feature Your Story!</h1>
              <p>Dear ${testimonial.guestName},</p>
              <p>Thank you for sharing your experience with us! Before we can publish your testimonial, we need a few updates:</p>
              <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 16px 0;">
                <p style="margin: 0; font-weight: 600;">Requested Changes:</p>
                <p style="margin: 8px 0 0 0;">${input.notes}</p>
              </div>
              <p>Please update your testimonial at your earliest convenience:</p>
              <p style="text-align: center;">
                <a href="${appUrl}/dashboard/testimonials" class="button">Update Testimonial</a>
              </p>
              <p>Thank you for helping us share your amazing story!</p>
              <p>Best regards,<br>The Pickleball Passport Team</p>
            `,
            preheader: 'Please update your testimonial submission',
          }),
        });
      } catch (error) {
        console.error('Failed to send edit request email:', error);
      }

      return updated;
    }),

  /**
   * Toggle featured status
   */
  toggleFeatured: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const testimonial = await ctx.db.guestTestimonial.findUnique({
        where: { id: input.id },
      });

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found.',
        });
      }

      const updated = await ctx.db.guestTestimonial.update({
        where: { id: input.id },
        data: {
          isFeatured: !testimonial.isFeatured,
        },
      });

      return updated;
    }),

  /**
   * Update sort order
   */
  updateSortOrder: adminProcedure
    .input(
      z.object({
        id: z.string(),
        sortOrder: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.guestTestimonial.update({
        where: { id: input.id },
        data: { sortOrder: input.sortOrder },
      });

      return updated;
    }),

  /**
   * Delete a testimonial (admin only)
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const testimonial = await ctx.db.guestTestimonial.findUnique({
        where: { id: input.id },
      });

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found.',
        });
      }

      await ctx.db.guestTestimonial.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // ============================================================================
  // PUBLIC PROCEDURES (Display)
  // ============================================================================

  /**
   * Get published testimonials (public)
   */
  getPublished: publicProcedure
    .input(
      z.object({
        type: testimonialTypeSchema.optional(),
        packageType: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['recent', 'featured']).default('featured'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { type, packageType, limit, offset, sortBy } = input;

      const where = {
        status: 'PUBLISHED' as GuestTestimonialStatus,
        ...(type && { type }),
        ...(packageType && { packageType }),
      };

      const orderBy =
        sortBy === 'featured'
          ? [{ isFeatured: 'desc' as const }, { sortOrder: 'asc' as const }, { publishedAt: 'desc' as const }]
          : [{ publishedAt: 'desc' as const }];

      const testimonials = await ctx.db.guestTestimonial.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          content: true,
          videoUrl: true,
          videoThumbnail: true,
          beforePhotoUrl: true,
          afterPhotoUrl: true,
          guestName: true,
          guestLocation: true,
          packageType: true,
          tripDate: true,
          isFeatured: true,
          publishedAt: true,
        },
      });

      return testimonials;
    }),

  /**
   * Get featured testimonials for homepage
   */
  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(6) }))
    .query(async ({ ctx, input }) => {
      const testimonials = await ctx.db.guestTestimonial.findMany({
        where: {
          status: 'PUBLISHED',
          isFeatured: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
        take: input.limit,
        select: {
          id: true,
          type: true,
          content: true,
          videoUrl: true,
          videoThumbnail: true,
          beforePhotoUrl: true,
          afterPhotoUrl: true,
          guestName: true,
          guestLocation: true,
          packageType: true,
          isFeatured: true,
        },
      });

      return testimonials;
    }),
});
