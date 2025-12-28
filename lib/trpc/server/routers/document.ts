/**
 * Document Router
 *
 * tRPC procedures for document upload and management
 * Handles passports, medical forms, insurance documents, etc.
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const documentRouter = router({
  /**
   * Get all documents for current user
   * Returns list of uploaded documents with status
   */
  list: protectedProcedure
    .input(
      z
        .object({
          bookingId: z.string().optional(),
          type: z
            .enum(['PASSPORT', 'MEDICAL_FORM', 'INSURANCE', 'VISA', 'OTHER'])
            .optional(),
          status: z
            .enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'])
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const documents = await ctx.db.document.findMany({
        where: {
          userId: ctx.user.id,
          ...(input?.bookingId && { bookingId: input.bookingId }),
          ...(input?.type && { type: input.type }),
          ...(input?.status && { status: input.status }),
        },
        orderBy: {
          uploadedAt: 'desc',
        },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              package: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return documents;
    }),

  /**
   * Get single document by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.db.document.findUnique({
        where: { id: input.id },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              package: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        });
      }

      // Ensure user owns this document
      if (document.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this document',
        });
      }

      return document;
    }),

  /**
   * Create document record after file upload
   * Note: Actual file upload happens client-side via Supabase Storage
   * This just creates the database record
   */
  create: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().optional(),
        type: z.enum(['PASSPORT', 'MEDICAL_FORM', 'INSURANCE', 'VISA', 'OTHER']),
        fileName: z.string(),
        fileUrl: z.string().url(),
        fileSize: z.number().int().positive(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If bookingId provided, verify it belongs to user
      if (input.bookingId) {
        const booking = await ctx.db.booking.findUnique({
          where: { id: input.bookingId },
          select: { userId: true },
        });

        if (!booking || booking.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Invalid booking reference',
          });
        }
      }

      const document = await ctx.db.document.create({
        data: {
          userId: ctx.user.id,
          bookingId: input.bookingId,
          type: input.type,
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          status: 'PENDING_REVIEW',
        },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              package: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return document;
    }),

  /**
   * Delete document
   * Note: Client should also delete the file from Supabase Storage
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify document belongs to user
      const document = await ctx.db.document.findUnique({
        where: { id: input.id },
        select: { userId: true, fileUrl: true },
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        });
      }

      if (document.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this document',
        });
      }

      // Delete from database
      await ctx.db.document.delete({
        where: { id: input.id },
      });

      // Return file URL so client can delete from storage
      return {
        success: true,
        fileUrl: document.fileUrl,
      };
    }),

  /**
   * Get document counts by status
   * Useful for dashboard summary
   */
  getCounts: protectedProcedure.query(async ({ ctx }) => {
    const [total, pending, approved, rejected] = await Promise.all([
      ctx.db.document.count({
        where: { userId: ctx.user.id },
      }),
      ctx.db.document.count({
        where: { userId: ctx.user.id, status: 'PENDING_REVIEW' },
      }),
      ctx.db.document.count({
        where: { userId: ctx.user.id, status: 'APPROVED' },
      }),
      ctx.db.document.count({
        where: { userId: ctx.user.id, status: 'REJECTED' },
      }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }),

  /**
   * Get required documents for a booking
   * Returns which document types are still needed
   */
  getRequiredForBooking: protectedProcedure
    .input(z.object({ bookingId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify booking belongs to user
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        select: { userId: true },
      });

      if (!booking || booking.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid booking reference',
        });
      }

      // Get all documents for this booking
      const documents = await ctx.db.document.findMany({
        where: {
          userId: ctx.user.id,
          bookingId: input.bookingId,
        },
        select: {
          type: true,
          status: true,
        },
      });

      // Required document types for international medical tourism
      const requiredTypes = ['PASSPORT', 'MEDICAL_FORM', 'INSURANCE'] as const;

      const requirements = requiredTypes.map((type) => {
        const doc = documents.find((d) => d.type === type);
        return {
          type,
          uploaded: !!doc,
          status: doc?.status || null,
          required: true,
        };
      });

      return {
        requirements,
        allRequiredUploaded: requirements.every((r) => r.uploaded),
        allApproved: requirements.every((r) => r.status === 'APPROVED'),
      };
    }),
});
