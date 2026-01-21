/**
 * Admin Router
 *
 * tRPC procedures for admin-only operations:
 * - Document review and approval
 * - Booking status management
 * - Guest management
 * - Trip management
 */

import { z } from 'zod';
import { router, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { sendEmail } from '@/lib/email/send-email';
import { apiLogger, emailLogger, stripeLogger, logError, logStripeError } from '@/lib/logger';

/**
 * Get common issues for document types to help users fix rejections
 */
function getCommonDocumentIssues(documentType: string): string[] {
  const issueMap: Record<string, string[]> = {
    PASSPORT: [
      'Shows all pages clearly (photo page, expiration date)',
      'Is valid for at least 6 months from travel date',
      'Has no glare or shadows obscuring text',
      'Shows your full legal name as it appears on flight bookings',
      'Is a color scan or photo (not black and white)',
    ],
    MEDICAL_FORM: [
      'Is completely filled out with no blank required fields',
      'Has your signature and date',
      'Is legible and clearly scanned',
      'Includes all required medical history information',
      'Matches the most recent form version',
    ],
    INSURANCE: [
      'Shows your name exactly as it appears on your passport',
      'Includes coverage dates that span your entire trip',
      'Clearly shows medical coverage amounts',
      'Is from a recognized insurance provider',
      'Is in English or has a certified English translation',
    ],
    VISA: [
      'Is the correct visa type for medical tourism',
      'Shows valid dates covering your trip',
      'Has clear, readable text and stamps',
      'Matches your passport information',
      'Includes all required pages',
    ],
    OTHER: [
      'Is clearly legible and well-lit',
      'Shows all required information',
      'Is the correct document as requested',
      'Is in an accepted format (PDF, JPG, PNG)',
      'Has no sensitive information that should be redacted',
    ],
  };

  return issueMap[documentType] || issueMap.OTHER;
}

export const adminRouter = router({
  // ============================================================================
  // DOCUMENT REVIEW
  // ============================================================================

  /**
   * Get all documents for review with filters
   * Admin can view all documents across all users
   */
  documents: router({
    /**
     * List all documents with filters
     */
    list: adminProcedure
      .input(
        z
          .object({
            status: z
              .enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'])
              .optional(),
            type: z
              .enum(['PASSPORT', 'MEDICAL_FORM', 'INSURANCE', 'VISA', 'OTHER'])
              .optional(),
            userId: z.string().optional(),
            bookingId: z.string().optional(),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.status && { status: input.status }),
          ...(input?.type && { type: input.type }),
          ...(input?.userId && { userId: input.userId }),
          ...(input?.bookingId && { bookingId: input.bookingId }),
        };

        const [documents, total] = await Promise.all([
          ctx.db.document.findMany({
            where,
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
                  user: {
                    select: {
                      email: true,
                      guestProfile: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: {
              uploadedAt: 'desc',
            },
            take: input?.limit || 50,
            skip: input?.offset || 0,
          }),
          ctx.db.document.count({ where }),
        ]);

        return {
          documents,
          total,
          hasMore: total > (input?.offset || 0) + (input?.limit || 50),
        };
      }),

    /**
     * Get document counts by status for admin dashboard
     */
    getCounts: adminProcedure.query(async ({ ctx }) => {
      const [total, pending, approved, rejected, expired] = await Promise.all([
        ctx.db.document.count(),
        ctx.db.document.count({ where: { status: 'PENDING_REVIEW' } }),
        ctx.db.document.count({ where: { status: 'APPROVED' } }),
        ctx.db.document.count({ where: { status: 'REJECTED' } }),
        ctx.db.document.count({ where: { status: 'EXPIRED' } }),
      ]);

      return {
        total,
        pending,
        approved,
        rejected,
        expired,
      };
    }),

    /**
     * Get single document by ID (admin can view any document)
     */
    getById: adminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const document = await ctx.db.document.findUnique({
          where: { id: input.id },
          include: {
            booking: {
              select: {
                id: true,
                bookingReference: true,
                status: true,
                package: {
                  select: {
                    name: true,
                  },
                },
                trip: {
                  select: {
                    name: true,
                    startDate: true,
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
                        phone: true,
                      },
                    },
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

        return document;
      }),

    /**
     * Approve document
     */
    approve: adminProcedure
      .input(
        z.object({
          documentId: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { documentId, notes } = input;

        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        // Get document with user info for notification
        const document = await ctx.db.document.findUnique({
          where: { id: documentId },
          include: {
            booking: {
              select: {
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

        // Update document status
        const updatedDocument = await ctx.db.document.update({
          where: { id: documentId },
          data: {
            status: 'APPROVED',
            reviewedAt: new Date(),
            reviewedBy: ctx.user.id,
            notes,
          },
        });

        // Create notification for user
        const guestName = document.booking?.user.guestProfile
          ? `${document.booking.user.guestProfile.firstName} ${document.booking.user.guestProfile.lastName}`
          : 'Guest';

        await ctx.db.notification.create({
          data: {
            userId: document.userId,
            type: 'GENERAL',
            title: 'Document Approved',
            content: `Your ${document.type.toLowerCase().replace('_', ' ')} has been approved.${
              notes ? ` Note: ${notes}` : ''
            }`,
            linkUrl: '/dashboard/documents',
            linkText: 'View Documents',
          },
        });

        // Send email notification using professional template
        try {
          const { sendDocumentApproval } = await import('@/lib/email/sendgrid');

          // Format document type for display
          const documentTypeFriendly = document.type
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          await sendDocumentApproval(document.booking?.user.email || '', {
            firstName: document.booking?.user.guestProfile?.firstName || 'Guest',
            email: document.booking?.user.email || '',
            documentType: document.type,
            documentTypeFriendly,
            uploadedDate: document.uploadedAt.toISOString(),
            reviewedDate: new Date().toISOString(),
            bookingReference: document.bookingId?.slice(-8).toUpperCase(),
            notes,
          });
        } catch (error) {
          logError(emailLogger, error, 'Failed to send document approval email');
          // Don't fail the operation if email fails
        }

        return updatedDocument;
      }),

    /**
     * Reject document
     */
    reject: adminProcedure
      .input(
        z.object({
          documentId: z.string(),
          notes: z.string().min(1, 'Please provide a reason for rejection'),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { documentId, notes } = input;

        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        // Get document with user info for notification
        const document = await ctx.db.document.findUnique({
          where: { id: documentId },
          include: {
            booking: {
              select: {
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

        // Update document status
        const updatedDocument = await ctx.db.document.update({
          where: { id: documentId },
          data: {
            status: 'REJECTED',
            reviewedAt: new Date(),
            reviewedBy: ctx.user.id,
            notes,
          },
        });

        // Create notification for user
        const guestName = document.booking?.user.guestProfile
          ? `${document.booking.user.guestProfile.firstName} ${document.booking.user.guestProfile.lastName}`
          : 'Guest';

        await ctx.db.notification.create({
          data: {
            userId: document.userId,
            type: 'GENERAL',
            title: 'Document Needs Attention',
            content: `Your ${document.type
              .toLowerCase()
              .replace('_', ' ')} needs to be re-uploaded. Reason: ${notes}`,
            linkUrl: '/dashboard/documents',
            linkText: 'Upload New Document',
          },
        });

        // Send email notification using professional template
        try {
          const { sendDocumentRejection } = await import('@/lib/email/sendgrid');

          // Format document type for display
          const documentTypeFriendly = document.type
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          // Common issues based on document type
          const commonIssues = getCommonDocumentIssues(document.type);

          await sendDocumentRejection(document.booking?.user.email || '', {
            firstName: document.booking?.user.guestProfile?.firstName || 'Guest',
            email: document.booking?.user.email || '',
            documentType: document.type,
            documentTypeFriendly,
            uploadedDate: document.uploadedAt.toISOString(),
            reviewedDate: new Date().toISOString(),
            bookingReference: document.bookingId?.slice(-8).toUpperCase(),
            reason: notes,
            commonIssues,
          });
        } catch (error) {
          logError(emailLogger, error, 'Failed to send document rejection email');
          // Don't fail the operation if email fails
        }

        return updatedDocument;
      }),

    /**
     * Bulk approve documents
     */
    bulkApprove: adminProcedure
      .input(
        z.object({
          documentIds: z.array(z.string()).min(1).max(50),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { documentIds, notes } = input;

        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        // Get all documents with user info
        const documents = await ctx.db.document.findMany({
          where: { id: { in: documentIds } },
          include: {
            booking: {
              select: {
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
              },
            },
          },
        });

        // Update all documents
        await ctx.db.document.updateMany({
          where: { id: { in: documentIds } },
          data: {
            status: 'APPROVED',
            reviewedAt: new Date(),
            reviewedBy: ctx.user.id,
            notes,
          },
        });

        // Create notifications for each user
        const notifications = documents.map((doc) => ({
          userId: doc.userId,
          type: 'GENERAL' as const,
          title: 'Document Approved',
          content: `Your ${doc.type.toLowerCase().replace('_', ' ')} has been approved.${
            notes ? ` Note: ${notes}` : ''
          }`,
          linkUrl: '/dashboard/documents',
          linkText: 'View Documents',
        }));

        await ctx.db.notification.createMany({
          data: notifications,
        });

        // Send email notifications (async, don't wait)
        documents.forEach(async (doc) => {
          const guestName = doc.booking?.user.guestProfile
            ? `${doc.booking.user.guestProfile.firstName} ${doc.booking.user.guestProfile.lastName}`
            : 'Guest';

          try {
            await sendEmail({
              to: doc.booking?.user.email || '',
              subject: 'Document Approved - Pickleball Passport',
              text: `Hi ${guestName},\n\nGood news! Your ${doc.type
                .toLowerCase()
                .replace(
                  '_',
                  ' '
                )} has been approved.\n\n${notes ? `Admin Note: ${notes}\n\n` : ''}Best regards,\nPickleball Passport Team`,
              html: `<p>Hi ${guestName},</p><p>Good news! Your <strong>${doc.type
                .toLowerCase()
                .replace('_', ' ')}</strong> has been approved.</p>${
                notes ? `<p><strong>Admin Note:</strong> ${notes}</p>` : ''
              }<p>Best regards,<br/>Pickleball Passport Team</p>`,
            });
          } catch (error) {
            logError(emailLogger, error, 'Failed to send bulk approval email');
          }
        });

        return {
          success: true,
          count: documentIds.length,
        };
      }),
  }),

  // ============================================================================
  // BOOKING MANAGEMENT
  // ============================================================================

  bookings: router({
    /**
     * Get all bookings with filters
     */
    list: adminProcedure
      .input(
        z
          .object({
            status: z
              .enum(['DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
              .optional(),
            userId: z.string().optional(),
            packageId: z.string().optional(),
            tripId: z.string().optional(),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.status && { status: input.status }),
          ...(input?.userId && { userId: input.userId }),
          ...(input?.packageId && { packageId: input.packageId }),
          ...(input?.tripId && { tripId: input.tripId }),
        };

        const [bookings, total] = await Promise.all([
          ctx.db.booking.findMany({
            where,
            include: {
              user: {
                select: {
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
              package: {
                select: {
                  name: true,
                  slug: true,
                },
              },
              trip: {
                select: {
                  name: true,
                  destination: true,
                  startDate: true,
                  endDate: true,
                },
              },
              payments: {
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
              },
              documents: {
                select: {
                  id: true,
                  type: true,
                  status: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: input?.limit || 50,
            skip: input?.offset || 0,
          }),
          ctx.db.booking.count({ where }),
        ]);

        return {
          bookings,
          total,
          hasMore: total > (input?.offset || 0) + (input?.limit || 50),
        };
      }),

    /**
     * Get booking counts by status
     */
    getCounts: adminProcedure.query(async ({ ctx }) => {
      const [total, draft, pendingPayment, confirmed, cancelled, completed] =
        await Promise.all([
          ctx.db.booking.count(),
          ctx.db.booking.count({ where: { status: 'DRAFT' } }),
          ctx.db.booking.count({ where: { status: 'PENDING_PAYMENT' } }),
          ctx.db.booking.count({ where: { status: 'CONFIRMED' } }),
          ctx.db.booking.count({ where: { status: 'CANCELLED' } }),
          ctx.db.booking.count({ where: { status: 'COMPLETED' } }),
        ]);

      return {
        total,
        draft,
        pendingPayment,
        confirmed,
        cancelled,
        completed,
      };
    }),

    /**
     * Update booking status
     */
    updateStatus: adminProcedure
      .input(
        z.object({
          bookingId: z.string(),
          status: z.enum(['DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { bookingId, status, notes } = input;

        // Get booking with user info
        const booking = await ctx.db.booking.findUnique({
          where: { id: bookingId },
          include: {
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
            package: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!booking) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Booking not found',
          });
        }

        // Validate status transition
        const validTransitions: Record<string, string[]> = {
          DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
          PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
          CONFIRMED: ['COMPLETED', 'CANCELLED'],
          CANCELLED: [], // Cannot transition from cancelled
          COMPLETED: [], // Cannot transition from completed
        };

        const allowedStatuses = validTransitions[booking.status] || [];
        if (!allowedStatuses.includes(status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot transition from ${booking.status} to ${status}`,
          });
        }

        // Update booking status
        const updatedBooking = await ctx.db.booking.update({
          where: { id: bookingId },
          data: { status },
        });

        // Create notification for user
        const guestName = booking.user.guestProfile
          ? `${booking.user.guestProfile.firstName} ${booking.user.guestProfile.lastName}`
          : 'Guest';

        const statusMessages: Record<string, { title: string; content: string }> = {
          CONFIRMED: {
            title: 'Booking Confirmed',
            content: `Your booking ${booking.bookingReference} for ${booking.package.name} has been confirmed!`,
          },
          CANCELLED: {
            title: 'Booking Cancelled',
            content: `Your booking ${booking.bookingReference} has been cancelled.${
              notes ? ` Reason: ${notes}` : ''
            }`,
          },
          COMPLETED: {
            title: 'Trip Completed',
            content: `Your trip has been completed! We hope you had an amazing experience.`,
          },
        };

        const message = statusMessages[status];
        if (message) {
          await ctx.db.notification.create({
            data: {
              userId: booking.userId,
              type: 'BOOKING_CONFIRMATION',
              title: message.title,
              content: message.content,
              linkUrl: `/dashboard/bookings/${booking.id}`,
              linkText: 'View Booking',
            },
          });

          // Send email notification
          try {
            await sendEmail({
              to: booking.user.email,
              subject: `${message.title} - Pickleball Passport`,
              text: `Hi ${guestName},\n\n${message.content}\n\nBooking Reference: ${booking.bookingReference}\n\nView details: https://pickleballpassport.com/dashboard/bookings/${booking.id}\n\nBest regards,\nPickleball Passport Team`,
              html: `<p>Hi ${guestName},</p><p>${message.content}</p><p><strong>Booking Reference:</strong> ${booking.bookingReference}</p><p><a href="https://pickleballpassport.com/dashboard/bookings/${booking.id}">View booking details</a></p><p>Best regards,<br/>Pickleball Passport Team</p>`,
            });
          } catch (error) {
            logError(emailLogger, error, 'Failed to send booking status update email');
          }
        }

        return updatedBooking;
      }),
  }),

  // ============================================================================
  // TRIP MANAGEMENT
  // ============================================================================

  trips: router({
    /**
     * List all trips
     */
    list: adminProcedure
      .input(
        z
          .object({
            isActive: z.boolean().optional(),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.isActive !== undefined && { isActive: input.isActive }),
        };

        const [trips, total] = await Promise.all([
          ctx.db.trip.findMany({
            where,
            include: {
              bookings: {
                select: {
                  id: true,
                  bookingReference: true,
                  status: true,
                  user: {
                    select: {
                      email: true,
                      guestProfile: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: {
              startDate: 'desc',
            },
            take: input?.limit || 50,
            skip: input?.offset || 0,
          }),
          ctx.db.trip.count({ where }),
        ]);

        return {
          trips,
          total,
          hasMore: total > (input?.offset || 0) + (input?.limit || 50),
        };
      }),

    /**
     * Get trip counts
     */
    getCounts: adminProcedure.query(async ({ ctx }) => {
      const now = new Date();

      const [total, active, upcoming, past] = await Promise.all([
        ctx.db.trip.count(),
        ctx.db.trip.count({ where: { isActive: true } }),
        ctx.db.trip.count({
          where: {
            isActive: true,
            startDate: { gte: now },
          },
        }),
        ctx.db.trip.count({
          where: {
            endDate: { lt: now },
          },
        }),
      ]);

      return {
        total,
        active,
        upcoming,
        past,
      };
    }),

    /**
     * Get single trip by ID
     */
    getById: adminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const trip = await ctx.db.trip.findUnique({
          where: { id: input.id },
          include: {
            bookings: {
              include: {
                user: {
                  select: {
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
                package: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (!trip) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Trip not found',
          });
        }

        return trip;
      }),

    /**
     * Create new trip
     */
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          destination: z.string().min(1),
          startDate: z.date(),
          endDate: z.date(),
          capacity: z.number().int().positive(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Validate dates
        if (input.endDate <= input.startDate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'End date must be after start date',
          });
        }

        const trip = await ctx.db.trip.create({
          data: {
            name: input.name,
            destination: input.destination,
            startDate: input.startDate,
            endDate: input.endDate,
            capacity: input.capacity,
            currentBookings: 0,
            isActive: true,
          },
        });

        return trip;
      }),

    /**
     * Update trip
     */
    update: adminProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          destination: z.string().min(1).optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          capacity: z.number().int().positive().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;

        // Get existing trip to validate
        const existingTrip = await ctx.db.trip.findUnique({
          where: { id },
          select: {
            currentBookings: true,
            startDate: true,
            endDate: true,
          },
        });

        if (!existingTrip) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Trip not found',
          });
        }

        // Validate capacity isn't reduced below current bookings
        if (data.capacity && data.capacity < existingTrip.currentBookings) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot reduce capacity below current bookings (${existingTrip.currentBookings})`,
          });
        }

        // Validate dates if both provided
        const startDate = data.startDate || existingTrip.startDate;
        const endDate = data.endDate || existingTrip.endDate;

        if (endDate <= startDate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'End date must be after start date',
          });
        }

        const trip = await ctx.db.trip.update({
          where: { id },
          data,
        });

        return trip;
      }),

    /**
     * Delete trip
     */
    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Check if trip has any bookings
        const trip = await ctx.db.trip.findUnique({
          where: { id: input.id },
          select: {
            currentBookings: true,
          },
        });

        if (!trip) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Trip not found',
          });
        }

        if (trip.currentBookings > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot delete trip with existing bookings. Set to inactive instead.',
          });
        }

        await ctx.db.trip.delete({
          where: { id: input.id },
        });

        return { success: true };
      }),
  }),

  // ============================================================================
  // GUEST MANAGEMENT
  // ============================================================================

  guests: router({
    /**
     * List all guests
     */
    list: adminProcedure
      .input(
        z
          .object({
            role: z.enum(['GUEST', 'PARTNER', 'ADMIN']).optional(),
            search: z.string().optional(),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.role && { role: input.role }),
          ...(input?.search && {
            OR: [
              { email: { contains: input.search, mode: 'insensitive' as const } },
              {
                guestProfile: {
                  OR: [
                    { firstName: { contains: input.search, mode: 'insensitive' as const } },
                    { lastName: { contains: input.search, mode: 'insensitive' as const } },
                  ],
                },
              },
            ],
          }),
        };

        const [users, total] = await Promise.all([
          ctx.db.user.findMany({
            where,
            include: {
              guestProfile: true,
              partnerProfile: true,
              bookings: {
                select: {
                  id: true,
                  bookingReference: true,
                  status: true,
                  createdAt: true,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 5,
              },
              _count: {
                select: {
                  bookings: true,
                  notifications: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: input?.limit || 50,
            skip: input?.offset || 0,
          }),
          ctx.db.user.count({ where }),
        ]);

        return {
          users,
          total,
          hasMore: total > (input?.offset || 0) + (input?.limit || 50),
        };
      }),

    /**
     * Get guest counts
     */
    getCounts: adminProcedure.query(async ({ ctx }) => {
      const [total, guests, partners, admins] = await Promise.all([
        ctx.db.user.count(),
        ctx.db.user.count({ where: { role: 'GUEST' } }),
        ctx.db.user.count({ where: { role: 'PARTNER' } }),
        ctx.db.user.count({ where: { role: 'ADMIN' } }),
      ]);

      return {
        total,
        guests,
        partners,
        admins,
      };
    }),
  }),

  // ============================================================================
  // REFUND PROCESSING - E4-S9
  // ============================================================================

  /**
   * Process a refund for a payment
   * Handles both full and partial refunds through Stripe API
   */
  processRefund: adminProcedure
    .input(
      z.object({
        paymentId: z.string(),
        amount: z.number().int().positive().optional(), // Optional for partial refunds (in cents)
        reason: z.enum([
          'REQUESTED_BY_CUSTOMER',
          'DUPLICATE',
          'FRAUDULENT',
          'EVENT_CANCELLED',
          'OTHER',
        ]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { paymentId, amount, reason, notes } = input;

      // 1. Fetch payment with booking details
      const payment = await ctx.db.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: {
            include: {
              trip: true,
              user: true,
              package: true,
            },
          },
        },
      });

      if (!payment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment not found',
        });
      }

      // 2. Validate payment status
      if (payment.status !== 'SUCCEEDED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only refund successful payments',
        });
      }

      // 3. Calculate refund amount
      const refundAmount = amount || payment.amount; // Full refund if amount not specified
      const isFullRefund = refundAmount >= payment.amount;

      // 4. Validate refund amount
      const alreadyRefunded = payment.refundedAmount || 0;
      const remainingAmount = payment.amount - alreadyRefunded;

      if (refundAmount > remainingAmount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Refund amount ($${refundAmount / 100}) exceeds remaining amount ($${remainingAmount / 100})`,
        });
      }

      // 5. Process refund through Stripe
      let stripeRefund;
      try {
        const stripe = (await import('stripe')).default;
        const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2025-12-15.clover',
        });

        stripeRefund = await stripeClient.refunds.create({
          payment_intent: payment.stripePaymentIntentId as string,
          amount: refundAmount,
          reason: reason === 'REQUESTED_BY_CUSTOMER' ? 'requested_by_customer' : 'requested_by_customer',
          metadata: {
            bookingId: payment.bookingId,
            adminUserId: ctx.user?.id || 'unknown',
            adminNotes: notes || '',
          },
        });
      } catch (error) {
        logStripeError(error, 'Stripe refund error');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to process refund through Stripe',
        });
      }

      // 6. Update database atomically
      const result = await ctx.db.$transaction(async (tx) => {
        // Update payment record
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            refundedAmount: alreadyRefunded + refundAmount,
            status: isFullRefund ? 'REFUNDED' : 'SUCCEEDED',
            stripeRefundId: stripeRefund.id,
          },
        });

        // Create refund log for audit trail
        const refundLog = await tx.refundLog.create({
          data: {
            paymentId: payment.id,
            amount: refundAmount,
            stripeRefundId: stripeRefund.id,
            reason,
            notes,
            processedBy: ctx.user?.id || 'unknown',
          },
        });

        // If full refund, update booking status and trip capacity
        if (isFullRefund && payment.booking.status === 'CONFIRMED') {
          await tx.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CANCELLED' },
          });

          // Decrement trip capacity if booking has a trip
          if (payment.booking.tripId) {
            await tx.trip.update({
              where: { id: payment.booking.tripId },
              data: {
                currentBookings: {
                  decrement: 1,
                },
              },
            });
          }
        }

        return { updatedPayment, refundLog };
      });

      // 7. Send refund confirmation email (non-blocking)
      try {
        const { sendRefundConfirmation } = await import('@/lib/email/sendgrid');

        await sendRefundConfirmation(payment.booking.user.email, {
          firstName: payment.booking.user.email.split('@')[0], // Fallback
          email: payment.booking.user.email,
          bookingReference: payment.booking.bookingReference,
          packageName: payment.booking.package.name,
          refundAmount,
          originalAmount: payment.amount,
          isPartialRefund: !isFullRefund,
          refundDate: new Date().toISOString(),
          expectedTimeline: '5-10 business days',
        });
      } catch (emailError) {
        logError(emailLogger, emailError, 'Failed to send refund confirmation email');
        // Don't throw - email failure shouldn't block refund
      }

      apiLogger.info({
        adminId: ctx.user?.id,
        amount: refundAmount / 100,
        paymentId: payment.id,
        isFullRefund
      }, 'Refund processed by admin'
      );

      return {
        success: true,
        refundId: stripeRefund.id,
        refundAmount,
        isFullRefund,
        payment: result.updatedPayment,
        refundLog: result.refundLog,
      };
    }),

  /**
   * Send itinerary change SMS to a guest
   * TODO: Implement Twilio SMS sending when Twilio is configured
   */
  sendItineraryChangeSMS: adminProcedure
    .input(
      z.object({
        bookingId: z.string(),
        changeDetails: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get booking with guest info
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        include: {
          user: {
            include: {
              guestProfile: true,
            },
          },
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        });
      }

      // TODO: Actually send SMS via Twilio when configured
      apiLogger.info({
        adminId: ctx.user?.id,
        bookingId: input.bookingId,
        changeDetails: input.changeDetails,
      }, 'Itinerary change SMS requested (not implemented)');

      return {
        success: true,
        message: 'SMS feature not yet implemented - no message was sent',
      };
    }),

  /**
   * Send flight delay SMS to a guest
   * TODO: Implement Twilio SMS sending when Twilio is configured
   */
  sendFlightDelaySMS: adminProcedure
    .input(
      z.object({
        bookingId: z.string(),
        delayInfo: z.object({
          tripDate: z.string(),
          newTime: z.string(),
          contactInfo: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get booking with guest info
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        include: {
          user: {
            include: {
              guestProfile: true,
            },
          },
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        });
      }

      // TODO: Actually send SMS via Twilio when configured
      apiLogger.info({
        adminId: ctx.user?.id,
        bookingId: input.bookingId,
        delayInfo: input.delayInfo,
      }, 'Flight delay SMS requested (not implemented)');

      return {
        success: true,
        message: 'SMS feature not yet implemented - no message was sent',
      };
    }),

  /**
   * Send emergency alert SMS to all guests on a trip
   * TODO: Implement Twilio SMS sending when Twilio is configured
   */
  sendEmergencyAlertSMS: adminProcedure
    .input(
      z.object({
        tripId: z.string(),
        alertMessage: z.string().min(1),
        contactInfo: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get all guests on this trip with phone numbers
      const bookings = await ctx.db.booking.findMany({
        where: {
          tripId: input.tripId,
          status: 'CONFIRMED',
        },
        include: {
          user: {
            include: {
              guestProfile: true,
            },
          },
        },
      });

      // Count guests with valid phone numbers
      const guestsWithPhones = bookings.filter(
        (b) => b.user.guestProfile?.phone
      );

      // TODO: Actually send SMS via Twilio when configured
      apiLogger.info({
        adminId: ctx.user?.id,
        tripId: input.tripId,
        guestCount: guestsWithPhones.length,
        message: input.alertMessage,
      }, 'Emergency alert SMS requested (not implemented)');

      return {
        sentCount: 0, // SMS not actually sent yet
        skippedCount: bookings.length - guestsWithPhones.length,
        message: 'SMS feature not yet implemented - no messages were sent',
      };
    }),

  // ============================================================================
  // E9-S15: Partner Agreement Management
  // ============================================================================

  /**
   * Get all partner agreements with filtering and pagination
   */
  getPartnerAgreements: adminProcedure
    .input(
      z
        .object({
          partnerId: z.string().optional(),
          version: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input?.partnerId && { partnerId: input.partnerId }),
        ...(input?.version && { version: input.version }),
      };

      const [agreements, total] = await Promise.all([
        ctx.db.partnerAgreement.findMany({
          where,
          include: {
            partner: {
              select: {
                id: true,
                clubName: true,
                clubLocation: true,
                tier: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            signedAt: 'desc',
          },
          take: input?.limit || 50,
          skip: input?.offset || 0,
        }),
        ctx.db.partnerAgreement.count({ where }),
      ]);

      return {
        agreements,
        total,
        hasMore: total > (input?.offset || 0) + (input?.limit || 50),
      };
    }),

  /**
   * Get single partner agreement by ID
   */
  getPartnerAgreementById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const agreement = await ctx.db.partnerAgreement.findUnique({
        where: { id: input.id },
        include: {
          partner: {
            select: {
              id: true,
              clubName: true,
              clubLocation: true,
              tier: true,
              referralCode: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!agreement) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agreement not found',
        });
      }

      return agreement;
    }),

  /**
   * Get partner agreement statistics
   */
  getPartnerAgreementStats: adminProcedure.query(async ({ ctx }) => {
    const currentVersion = '1.0';

    const [
      totalPartners,
      partnersWithCurrentAgreement,
      totalAgreements,
      recentAgreements,
    ] = await Promise.all([
      ctx.db.partnerProfile.count(),
      ctx.db.partnerAgreement.groupBy({
        by: ['partnerId'],
        where: {
          version: currentVersion,
        },
      }),
      ctx.db.partnerAgreement.count(),
      ctx.db.partnerAgreement.count({
        where: {
          signedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      totalPartners,
      partnersWithSignedAgreement: partnersWithCurrentAgreement.length,
      partnersWithoutAgreement: totalPartners - partnersWithCurrentAgreement.length,
      totalAgreements,
      recentAgreements,
      currentVersion,
      complianceRate: totalPartners > 0
        ? Math.round((partnersWithCurrentAgreement.length / totalPartners) * 100)
        : 0,
    };
  }),

  // ============================================================================
  // E9-S16: Partner Support Ticketing System (Admin)
  // ============================================================================

  /**
   * Get all partner support tickets with filters
   */
  getPartnerTickets: adminProcedure
    .input(
      z
        .object({
          status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
          priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
          partnerId: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input?.status && { status: input.status }),
        ...(input?.priority && { priority: input.priority }),
        ...(input?.partnerId && { partnerId: input.partnerId }),
      };

      const [tickets, total] = await Promise.all([
        ctx.db.partnerSupportTicket.findMany({
          where,
          include: {
            partner: {
              select: {
                id: true,
                clubName: true,
                tier: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            replies: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              select: {
                createdAt: true,
                isStaff: true,
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
          orderBy: [
            { status: 'asc' }, // OPEN first
            { priority: 'desc' }, // HIGH priority first
            { updatedAt: 'desc' },
          ],
          take: input?.limit || 50,
          skip: input?.offset || 0,
        }),
        ctx.db.partnerSupportTicket.count({ where }),
      ]);

      return {
        tickets: tickets.map((t) => ({
          ...t,
          lastReply: t.replies[0] || null,
          replyCount: t._count.replies,
        })),
        total,
        hasMore: (input?.offset || 0) + (input?.limit || 50) < total,
      };
    }),

  /**
   * Get single partner support ticket
   */
  getPartnerTicket: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.db.partnerSupportTicket.findUnique({
        where: { id: input.id },
        include: {
          partner: {
            select: {
              id: true,
              clubName: true,
              clubLocation: true,
              tier: true,
              referralCode: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          replies: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ticket not found',
        });
      }

      return ticket;
    }),

  /**
   * Reply to a partner support ticket (admin)
   */
  replyToPartnerTicket: adminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        message: z.string().min(1, 'Message is required').max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.partnerSupportTicket.findUnique({
        where: { id: input.ticketId },
        include: {
          partner: {
            select: {
              clubName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ticket not found',
        });
      }

      // Create reply
      const reply = await ctx.db.partnerSupportReply.create({
        data: {
          ticketId: input.ticketId,
          userId: ctx.user!.id,
          message: input.message,
          isStaff: true,
        },
      });

      // Update ticket status to IN_PROGRESS if it was OPEN
      if (ticket.status === 'OPEN') {
        await ctx.db.partnerSupportTicket.update({
          where: { id: input.ticketId },
          data: {
            status: 'IN_PROGRESS',
            updatedAt: new Date(),
          },
        });
      } else {
        await ctx.db.partnerSupportTicket.update({
          where: { id: input.ticketId },
          data: { updatedAt: new Date() },
        });
      }

      // Send email notification to partner (non-blocking)
      try {
        const { sendPartnerTicketReplyNotification } = await import('@/lib/email/sendgrid');
        await sendPartnerTicketReplyNotification({
          ticketId: ticket.id,
          subject: ticket.subject,
          partnerName: ticket.partner.clubName,
          partnerEmail: ticket.partner.user.email,
        });
      } catch (error) {
        logError(emailLogger, error, 'Failed to send ticket reply notification email');
        // Don't fail the operation if email fails
      }

      return reply;
    }),

  /**
   * Update partner ticket status
   */
  updatePartnerTicketStatus: adminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.partnerSupportTicket.findUnique({
        where: { id: input.ticketId },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ticket not found',
        });
      }

      const updateData: { status: typeof input.status; resolvedAt?: Date | null } = {
        status: input.status,
      };

      // Set resolvedAt when marking as resolved
      if (input.status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      } else if (input.status === 'OPEN' || input.status === 'IN_PROGRESS') {
        updateData.resolvedAt = null;
      }

      const updatedTicket = await ctx.db.partnerSupportTicket.update({
        where: { id: input.ticketId },
        data: updateData,
      });

      return updatedTicket;
    }),

  /**
   * Get partner support ticket statistics
   */
  getPartnerTicketStats: adminProcedure.query(async ({ ctx }) => {
    const [total, open, inProgress, resolved, closed, highPriority] = await Promise.all([
      ctx.db.partnerSupportTicket.count(),
      ctx.db.partnerSupportTicket.count({ where: { status: 'OPEN' } }),
      ctx.db.partnerSupportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      ctx.db.partnerSupportTicket.count({ where: { status: 'RESOLVED' } }),
      ctx.db.partnerSupportTicket.count({ where: { status: 'CLOSED' } }),
      ctx.db.partnerSupportTicket.count({
        where: {
          priority: 'HIGH',
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      highPriority,
      requiresAttention: open + highPriority,
    };
  }),

  // ============================================================================
  // E9-S17: Partner Event Management (Admin)
  // ============================================================================

  /**
   * Get all partner events
   */
  getPartnerEvents: adminProcedure
    .input(
      z
        .object({
          eventType: z.enum(['WEBINAR', 'MEETUP', 'TRAINING', 'SUMMIT']).optional(),
          isActive: z.boolean().optional(),
          includePast: z.boolean().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const where = {
        ...(input?.eventType && { eventType: input.eventType }),
        ...(input?.isActive !== undefined && { isActive: input.isActive }),
        ...(input?.includePast
          ? {}
          : { endDate: { gte: now } }),
      };

      const [events, total] = await Promise.all([
        ctx.db.partnerEvent.findMany({
          where,
          include: {
            _count: {
              select: {
                registrations: true,
              },
            },
          },
          orderBy: {
            startDate: 'asc',
          },
          take: input?.limit || 50,
          skip: input?.offset || 0,
        }),
        ctx.db.partnerEvent.count({ where }),
      ]);

      return {
        events: events.map((e) => ({
          ...e,
          registrationCount: e._count.registrations,
          spotsRemaining: e.maxAttendees ? e.maxAttendees - e._count.registrations : null,
        })),
        total,
        hasMore: total > (input?.offset || 0) + (input?.limit || 50),
      };
    }),

  /**
   * Get single partner event by ID
   */
  getPartnerEvent: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.partnerEvent.findUnique({
        where: { id: input.id },
        include: {
          registrations: {
            include: {
              partner: {
                select: {
                  id: true,
                  clubName: true,
                  clubLocation: true,
                  tier: true,
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              registeredAt: 'asc',
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      });

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      return {
        ...event,
        registrationCount: event._count.registrations,
        spotsRemaining: event.maxAttendees
          ? event.maxAttendees - event._count.registrations
          : null,
      };
    }),

  /**
   * Create a new partner event
   */
  createPartnerEvent: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required').max(200),
        description: z.string().min(1, 'Description is required'),
        eventType: z.enum(['WEBINAR', 'MEETUP', 'TRAINING', 'SUMMIT']),
        startDate: z.date(),
        endDate: z.date(),
        location: z.string().optional(),
        isVirtual: z.boolean().default(false),
        registrationUrl: z.string().url().optional().nullable(),
        maxAttendees: z.number().int().positive().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate dates
      if (input.endDate <= input.startDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End date must be after start date',
        });
      }

      const event = await ctx.db.partnerEvent.create({
        data: {
          title: input.title,
          description: input.description,
          eventType: input.eventType,
          startDate: input.startDate,
          endDate: input.endDate,
          location: input.location || null,
          isVirtual: input.isVirtual,
          registrationUrl: input.registrationUrl || null,
          maxAttendees: input.maxAttendees || null,
          isActive: true,
        },
      });

      return event;
    }),

  /**
   * Update a partner event
   */
  updatePartnerEvent: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().min(1).optional(),
        eventType: z.enum(['WEBINAR', 'MEETUP', 'TRAINING', 'SUMMIT']).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        location: z.string().optional().nullable(),
        isVirtual: z.boolean().optional(),
        registrationUrl: z.string().url().optional().nullable(),
        maxAttendees: z.number().int().positive().optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingEvent = await ctx.db.partnerEvent.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      });

      if (!existingEvent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      // Validate dates if both provided
      const startDate = data.startDate || existingEvent.startDate;
      const endDate = data.endDate || existingEvent.endDate;

      if (endDate <= startDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End date must be after start date',
        });
      }

      // Validate max attendees isn't less than current registrations
      if (
        data.maxAttendees !== undefined &&
        data.maxAttendees !== null &&
        data.maxAttendees < existingEvent._count.registrations
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot reduce max attendees below current registrations (${existingEvent._count.registrations})`,
        });
      }

      const event = await ctx.db.partnerEvent.update({
        where: { id },
        data,
      });

      return event;
    }),

  /**
   * Delete a partner event
   */
  deletePartnerEvent: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.partnerEvent.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      });

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      if (event._count.registrations > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot delete event with ${event._count.registrations} registrations. Set to inactive instead.`,
        });
      }

      await ctx.db.partnerEvent.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get partner event statistics
   */
  getPartnerEventStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();

    const [total, upcoming, active, totalRegistrations] = await Promise.all([
      ctx.db.partnerEvent.count(),
      ctx.db.partnerEvent.count({
        where: {
          startDate: { gte: now },
          isActive: true,
        },
      }),
      ctx.db.partnerEvent.count({
        where: { isActive: true },
      }),
      ctx.db.partnerEventRegistration.count(),
    ]);

    // Get events by type
    const eventsByType = await ctx.db.partnerEvent.groupBy({
      by: ['eventType'],
      _count: {
        id: true,
      },
    });

    return {
      total,
      upcoming,
      active,
      totalRegistrations,
      eventsByType: eventsByType.reduce(
        (acc, item) => ({
          ...acc,
          [item.eventType]: item._count.id,
        }),
        {} as Record<string, number>
      ),
    };
  }),
});
