/**
 * Chat Router
 *
 * tRPC procedures for Stream Chat integration:
 * - Generate user tokens for Stream Chat client
 */

import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { StreamChat } from 'stream-chat'

// Lazy-initialize Stream Chat client to avoid build-time errors
let streamClient: StreamChat | null = null

function getStreamClient(): StreamChat {
  if (!streamClient) {
    const apiKey = process.env.STREAM_API_KEY
    const apiSecret = process.env.STREAM_API_SECRET

    if (!apiKey || !apiSecret) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Stream Chat is not configured',
      })
    }

    streamClient = StreamChat.getInstance(apiKey, apiSecret)
  }
  return streamClient
}

export const chatRouter = router({
  /**
   * Get Stream Chat token for authenticated user
   *
   * Uses the current session user to generate a JWT token
   * for authenticating with Stream Chat on the client.
   */
  getStreamToken: protectedProcedure.query(async ({ ctx }) => {
    const apiKey = process.env.STREAM_API_KEY

    if (!apiKey) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Stream Chat is not configured',
      })
    }

    try {
      const client = getStreamClient()

      // Generate user token using the Clerk user ID
      const token = client.createToken(ctx.user.id)

      return {
        token,
        apiKey,
      }
    } catch (error) {
      console.error('[Chat] Error generating Stream token:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate chat token',
      })
    }
  }),

  /**
   * Get or create a trip chat channel
   *
   * Creates a channel for a specific trip if it doesn't exist,
   * or returns the existing channel info.
   */
  getTripChannel: protectedProcedure
    .input(
      z.object({
        tripId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user has a booking for this trip
      const userBooking = await ctx.db.booking.findFirst({
        where: {
          tripId: input.tripId,
          userId: ctx.user.id,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        select: { id: true },
      })

      if (!userBooking) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have a booking for this trip',
        })
      }

      // Get trip details for channel name
      const trip = await ctx.db.trip.findUnique({
        where: { id: input.tripId },
        select: {
          id: true,
          name: true,
        },
      })

      if (!trip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found',
        })
      }

      try {
        const client = getStreamClient()

        // Channel ID format: trip-{tripId}
        const channelId = `trip-${input.tripId}`

        // Get or create the channel
        const channel = client.channel('messaging', channelId, {
          name: trip.name,
          created_by_id: 'system',
        })

        // Query the channel to ensure it exists
        await channel.create()

        // Add user as member if not already
        await channel.addMembers([ctx.user.id])

        return {
          channelId,
          channelType: 'messaging',
          tripName: trip.name,
        }
      } catch (error) {
        console.error('[Chat] Error getting trip channel:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get or create chat channel',
        })
      }
    }),
})
