/**
 * Push Notification Router
 *
 * tRPC procedures for push notification operations.
 * Admin-only test endpoint for verifying push setup.
 */

import { z } from 'zod'
import { router, adminProcedure, protectedProcedure } from '../trpc'
import { sendPushNotification, sendTripCountdownReminder } from '@/lib/push'

export const pushRouter = router({
  /**
   * Send test push notification to self (Admin only)
   *
   * Used to verify push notification setup is working correctly.
   * Sends a test notification to the admin's own device.
   */
  testPush: adminProcedure.mutation(async ({ ctx }) => {
    const result = await sendPushNotification({
      userIds: [ctx.user.id],
      title: 'Test Notification',
      message: 'Push notifications are working! This is a test from Pickleball Passport.',
      data: {
        screen: 'dashboard',
        deepLink: '/dashboard',
      },
    })

    return {
      success: result !== null,
      notificationId: result?.id,
    }
  }),

  /**
   * Send countdown reminder to a user (Admin only)
   *
   * Manually trigger a trip countdown reminder.
   * In production, these are sent automatically by scheduled jobs.
   */
  sendCountdownReminder: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        tripId: z.string().cuid(),
        tripName: z.string(),
        daysUntil: z.number().int().min(1).max(30),
      })
    )
    .mutation(async ({ input }) => {
      const result = await sendTripCountdownReminder(
        input.userId,
        input.tripId,
        input.tripName,
        input.daysUntil
      )

      return {
        success: result !== null,
        notificationId: result?.id,
      }
    }),

  /**
   * Get push notification status
   *
   * Returns whether push notifications are configured.
   * Used by mobile app to show/hide notification-related UI.
   */
  getStatus: protectedProcedure.query(async () => {
    const isConfigured = !!(
      process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_API_KEY
    )

    return {
      configured: isConfigured,
      provider: 'onesignal',
    }
  }),
})
