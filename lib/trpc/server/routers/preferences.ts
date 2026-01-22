import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  getUserPreferences,
  updateUserPreferences,
  unsubscribeFromAll,
  type NotificationPreferences,
} from '@/lib/preferences/user-preferences';
import { verifyEmailToken } from '@/lib/preferences/email-token';

// Zod schema for preference updates
const PreferenceUpdateSchema = z.object({
  emailPreTripSequence: z.boolean().optional(),
  emailPostTripFollowUp: z.boolean().optional(),
  emailAlumniEvents: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
  emailNewsletter: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
});

export const preferencesRouter = router({
  /**
   * Get current user's notification preferences (authenticated)
   */
  getMyPreferences: protectedProcedure.query(async ({ ctx }) => {
    return await getUserPreferences(ctx.user.id);
  }),

  /**
   * Update current user's notification preferences (authenticated)
   */
  updatePreferences: protectedProcedure
    .input(PreferenceUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      await updateUserPreferences(ctx.user.id, input);
      return { success: true };
    }),

  /**
   * Unsubscribe from all optional notifications (authenticated)
   */
  unsubscribeAll: protectedProcedure.mutation(async ({ ctx }) => {
    await unsubscribeFromAll(ctx.user.id);
    return { success: true };
  }),

  /**
   * Get preferences by email token (public)
   */
  getPreferencesByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = await verifyEmailToken(input.token);

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        });
      }

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      const preferences = await getUserPreferences(userId);

      return {
        email: user?.email,
        preferences,
      };
    }),

  /**
   * Update preferences by email token (public)
   */
  updatePreferencesByToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
        updates: PreferenceUpdateSchema,
      })
    )
    .mutation(async ({ input }) => {
      const userId = await verifyEmailToken(input.token);

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        });
      }

      await updateUserPreferences(userId, input.updates);
      return { success: true };
    }),

  /**
   * Unsubscribe from all via email token (public)
   */
  unsubscribeAllByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const userId = await verifyEmailToken(input.token);

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        });
      }

      await unsubscribeFromAll(userId);
      return { success: true };
    }),
});
