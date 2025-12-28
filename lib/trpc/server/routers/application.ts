/**
 * Application Router
 *
 * tRPC procedures for guest application operations
 */

import { z } from 'zod';
import { router, publicProcedure, guestProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';
import { sendEmail } from '@/lib/email/sendgrid';
import { generateApplicationConfirmationEmail } from '@/lib/email/templates/application-confirmation';

export const applicationRouter = router({
  /**
   * Create a new application
   */
  create: guestProcedure
    .input(
      z.object({
        // Step 1: Basic Info
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(10),
        location: z.string().min(2),

        // Step 2: Pickleball Background
        pickleballSkillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'pro']),
        pickleballFrequency: z.enum(['1-2x/week', '3-4x/week', '5+x/week', 'daily']),
        homeClub: z.string().nullable(),

        // Step 3: Transformation Interests
        interests: z.array(z.string()).min(1),

        // Step 4: Travel Preferences
        preferredDuration: z.enum(['7', '10', '14', '21']),
        preferredDates: z.string().nullable(),
        travelingAlone: z.boolean(),
        budgetRange: z.string().nullable(),

        // Step 5: Discovery
        referralSource: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is authenticated
        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to submit an application. Please sign up or sign in first.',
          });
        }

        const userId = ctx.user.id;

        // Create application
        const application = await prisma.application.create({
          data: {
            userId,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            location: input.location,
            pickleballSkillLevel: input.pickleballSkillLevel,
            pickleballFrequency: input.pickleballFrequency,
            homeClub: input.homeClub,
            interests: input.interests,
            preferredDuration: input.preferredDuration,
            preferredDates: input.preferredDates,
            travelingAlone: input.travelingAlone,
            budgetRange: input.budgetRange,
            referralSource: input.referralSource,
            status: 'SUBMITTED',
          },
        });

        // Send confirmation email (non-blocking)
        try {
          const emailContent = generateApplicationConfirmationEmail({
            firstName: input.firstName,
            email: input.email,
            applicationId: application.id,
            interests: input.interests,
            preferredDuration: input.preferredDuration,
          });

          await sendEmail({
            to: input.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });
        } catch (emailError) {
          // Log but don't fail the application
          console.error('Failed to send application confirmation email:', emailError);
        }

        return {
          success: true,
          applicationId: application.id,
          message: 'Application submitted successfully',
        };
      } catch (error) {
        console.error('Application creation error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit application',
        });
      }
    }),

  /**
   * Get user's applications
   */
  list: guestProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }

    const applications = await prisma.application.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return applications;
  }),

  /**
   * Get single application by ID
   */
  getById: guestProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        });
      }

      const application = await prisma.application.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Application not found',
        });
      }

      // Verify ownership
      if (application.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this application',
        });
      }

      return application;
    }),
});
