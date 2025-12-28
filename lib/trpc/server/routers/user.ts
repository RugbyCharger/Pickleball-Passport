/**
 * User Router
 *
 * tRPC procedures for user-related operations
 */

import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

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
})
