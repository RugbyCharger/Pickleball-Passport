/**
 * User Router
 *
 * tRPC procedures for user-related operations
 */

import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { PickleballSkillLevel } from '@prisma/client'

export const userRouter = router({
  /**
   * Get current user profile
   * Requires authentication
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        guestProfile: true,
        partnerProfile: true,
      },
    })

    return user
  }),

  /**
   * Get user by ID (public - for testimonials, etc.)
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })

      return user
    }),

  /**
   * Update user role (used during onboarding)
   */
  updateRole: protectedProcedure
    .input(
      z.object({
        role: z.enum(['GUEST', 'PARTNER', 'ADMIN']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: { role: input.role },
      })

      return updatedUser
    }),

  /**
   * Check if guest profile is complete
   * Returns profile completion status and guest profile if exists
   */
  checkProfileComplete: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        guestProfile: true,
      },
    })

    return {
      profileCompleted: user?.guestProfile?.profileCompleted ?? false,
      hasProfile: !!user?.guestProfile,
      guestProfile: user?.guestProfile,
    }
  }),

  /**
   * Complete guest profile (create or update)
   * Sets profileCompleted to true after successful save
   */
  completeGuestProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(2, 'First name must be at least 2 characters'),
        lastName: z.string().min(2, 'Last name must be at least 2 characters'),
        age: z.number().int().min(18, 'Must be at least 18 years old').max(120),
        location: z.string().min(2, 'Location is required'),
        pickleballSkillLevel: z.nativeEnum(PickleballSkillLevel),
        pickleballFrequency: z.string().min(1, 'Frequency is required'),
        dietaryRestrictions: z.array(z.string()),
        emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
        emergencyContactPhone: z.string().min(10, 'Valid phone number is required'),
        emergencyContactRelationship: z.string().min(2, 'Relationship is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if guest profile exists
      const existingProfile = await ctx.db.guestProfile.findUnique({
        where: { userId: ctx.user.id },
      })

      let guestProfile

      if (existingProfile) {
        // Update existing profile
        guestProfile = await ctx.db.guestProfile.update({
          where: { userId: ctx.user.id },
          data: {
            ...input,
            profileCompleted: true,
          },
        })
      } else {
        // Create new profile
        guestProfile = await ctx.db.guestProfile.create({
          data: {
            userId: ctx.user.id,
            ...input,
            profileCompleted: true,
          },
        })
      }

      return { success: true, guestProfile }
    }),
})
