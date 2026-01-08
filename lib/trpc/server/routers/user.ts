/**
 * User Router
 *
 * tRPC procedures for user-related operations
 */

import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
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
   * Update own role during onboarding (GUEST or PARTNER only)
   * Users cannot self-assign ADMIN role - this must be done by an existing admin
   */
  updateRole: protectedProcedure
    .input(
      z.object({
        // SECURITY: ADMIN role removed - cannot self-escalate privileges
        role: z.enum(['GUEST', 'PARTNER']),
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
   * Admin-only: Update any user's role
   * Only admins can assign the ADMIN role to other users
   */
  adminUpdateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['GUEST', 'PARTNER', 'ADMIN']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent admins from demoting themselves (safety check)
      if (input.userId === ctx.user.id && input.role !== 'ADMIN') {
        // Verify there's at least one other admin before allowing self-demotion
        const otherAdminCount = await ctx.db.user.count({
          where: {
            role: 'ADMIN',
            id: { not: ctx.user.id },
          },
        })
        
        if (otherAdminCount === 0) {
          throw new Error('Cannot demote yourself when you are the only admin')
        }
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
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
   * Updates Clerk user metadata
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

      // Update Clerk user metadata to reflect profile completion
      try {
        const { clerkClient } = await import('@clerk/nextjs/server')
        const client = await clerkClient()
        await client.users.updateUserMetadata(ctx.user.id, {
          publicMetadata: {
            profileCompleted: true,
          },
        })
      } catch (error) {
        // Log error but don't fail the mutation
        console.error('Failed to update Clerk metadata:', error)
      }

      return { success: true, guestProfile }
    }),
})
