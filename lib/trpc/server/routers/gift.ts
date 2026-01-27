/**
 * Gift Router (E3-S18, GS-004)
 *
 * Handles gift acceptance, decline, and lookup operations.
 * Uses centralized state machine for all state transitions.
 */

import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { clerkClient } from '@clerk/nextjs/server'
import { giftLogger, logError, authLogger } from '@/lib/logger'
import { GiftState } from '@prisma/client'
import { giftStateMachine } from '@/lib/gift/gift-state-machine'
import {
  transitionGiftState,
  getGiftStateHistory,
} from '@/lib/gift/gift-transition-service'

export const giftRouter = router({
  /**
   * Get Gift by Token (Public)
   *
   * Retrieves gift booking details using the acceptance token.
   * Used on the gift acceptance page to display gift information before login/signup.
   * Now includes state transition history for audit visibility.
   */
  getByToken: publicProcedure
    .input(
      z.object({
        token: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Find booking by gift token
      const booking = await ctx.db.booking.findUnique({
        where: { giftAcceptanceToken: input.token },
        include: {
          package: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
            },
          },
          trip: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              destination: true,
            },
          },
          bookingAddOns: {
            include: {
              addOn: {
                select: {
                  name: true,
                  category: true,
                },
              },
            },
          },
          giftStateTransitions: {
            orderBy: { createdAt: 'desc' },
            take: 10, // Limit for performance
          },
        },
      })

      if (!booking || !booking.isGift) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid gift token',
        })
      }

      // Check token expiration (90 days)
      const tokenAge = Date.now() - booking.createdAt.getTime()
      const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000
      if (tokenAge > ninetyDaysInMs) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This gift link has expired. Please contact support for assistance.',
        })
      }

      // Use state machine to check terminal states
      const currentState = booking.giftStatus as unknown as GiftState
      if (giftStateMachine.isTerminalState(currentState)) {
        if (currentState === GiftState.ACCEPTED) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This gift has already been accepted',
          })
        }
        if (currentState === GiftState.DECLINED) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This gift has been declined',
          })
        }
        if (currentState === GiftState.EXPIRED) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This gift has expired',
          })
        }
      }

      // Get purchaser information from Clerk
      let purchaserFirstName = 'the purchaser'
      let purchaserLastName = ''
      try {
        const clerk = await clerkClient()
        const purchaserUser = await clerk.users.getUser(booking.giftPurchaserId!)
        purchaserFirstName = purchaserUser.firstName || 'the purchaser'
        purchaserLastName = purchaserUser.lastName || ''
      } catch (error) {
        logError(authLogger, error, 'Failed to fetch purchaser from Clerk')
        // Continue with default values
      }

      // Return gift details with state history
      return {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        packageName: booking.package.name,
        packageSlug: booking.package.slug,
        packageDescription: booking.package.description,
        duration: booking.duration,
        accommodationTier: booking.accommodationTier,
        totalValue: booking.totalPrice,
        tripStartDate: booking.trip?.startDate?.toISOString(),
        tripEndDate: booking.trip?.endDate?.toISOString(),
        destination: booking.trip?.destination || 'Chiang Mai, Thailand',
        addOns: booking.bookingAddOns.map((ba) => ({
          name: ba.addOn.name,
          quantity: ba.quantity,
        })),
        giftMessage: booking.giftMessage,
        giftStatus: booking.giftStatus,
        giftExpiresAt: booking.giftExpiresAt?.toISOString(),
        purchaser: {
          firstName: purchaserFirstName,
          lastName: purchaserLastName,
        },
        recipient: {
          firstName: booking.giftRecipientName?.split(' ')[0] || '',
          lastName: booking.giftRecipientName?.split(' ').slice(1).join(' ') || '',
          email: booking.giftRecipientEmail!,
        },
        // Include state transition history for audit trail
        stateHistory: booking.giftStateTransitions.map((t) => ({
          fromState: t.fromState,
          toState: t.toState,
          reason: t.reason,
          createdAt: t.createdAt.toISOString(),
        })),
      }
    }),

  /**
   * Accept Gift (Protected)
   *
   * Transfers booking ownership from purchaser to recipient.
   * Uses state machine for validation and transition.
   * Requires user to be authenticated.
   */
  acceptGift: protectedProcedure
    .input(
      z.object({
        token: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. FIND BOOKING BY TOKEN
      const booking = await ctx.db.booking.findUnique({
        where: { giftAcceptanceToken: input.token },
        include: {
          package: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          trip: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              destination: true,
            },
          },
        },
      })

      if (!booking || !booking.isGift) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid gift token',
        })
      }

      // 2. VALIDATE GIFT STATUS USING STATE MACHINE
      const currentState = booking.giftStatus as unknown as GiftState
      const validation = giftStateMachine.validateTransition(currentState, GiftState.ACCEPTED)

      if (!validation.valid) {
        // Provide user-friendly error messages
        if (giftStateMachine.isTerminalState(currentState)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Gift has already been accepted or declined',
          })
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: validation.error || 'Cannot accept gift in current state',
        })
      }

      // 3. VALIDATE RECIPIENT EMAIL MATCHES AUTHENTICATED USER
      const recipientEmail = ctx.user.emailAddresses[0]?.emailAddress || ''
      if (booking.giftRecipientEmail?.toLowerCase() !== recipientEmail.toLowerCase()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This gift was not sent to your email address',
        })
      }

      // 4. EXECUTE STATE TRANSITION
      const result = await transitionGiftState(
        booking.id,
        GiftState.ACCEPTED,
        'user',
        {
          userId: ctx.user.id,
          recipientUserId: ctx.user.id,
          recipientEmail,
        }
      )

      if (!result.success) {
        giftLogger.error({
          msg: 'Gift acceptance failed',
          bookingId: booking.id,
          error: result.error,
        })
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error || 'Failed to accept gift. Please try again.',
        })
      }

      giftLogger.info({
        msg: 'Gift accepted via router',
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        recipientUserId: ctx.user.id,
        transitionId: result.transitionId,
      })

      // 5. RETURN SUCCESS
      return {
        success: true,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        message: 'Gift accepted successfully! The booking has been transferred to your account.',
      }
    }),

  /**
   * Decline Gift (Public - can be declined without login)
   *
   * Allows recipient to decline the gift, triggering a refund to the purchaser.
   * Uses state machine for validation and transition.
   * This is a rare edge case but must be supported.
   */
  declineGift: publicProcedure
    .input(
      z.object({
        token: z.string().uuid(),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. FIND BOOKING BY TOKEN
      const booking = await ctx.db.booking.findUnique({
        where: { giftAcceptanceToken: input.token },
        include: {
          package: {
            select: {
              name: true,
            },
          },
        },
      })

      if (!booking || !booking.isGift) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid gift token',
        })
      }

      // 2. VALIDATE GIFT STATUS USING STATE MACHINE
      const currentState = booking.giftStatus as unknown as GiftState
      const validation = giftStateMachine.validateTransition(currentState, GiftState.DECLINED)

      if (!validation.valid) {
        // Provide user-friendly error messages
        if (currentState === GiftState.ACCEPTED) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This gift has already been accepted and cannot be declined',
          })
        }
        if (currentState === GiftState.DECLINED) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This gift has already been declined',
          })
        }
        if (currentState === GiftState.EXPIRED) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This gift has expired and cannot be declined',
          })
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: validation.error || 'Cannot decline gift in current state',
        })
      }

      // 3. EXECUTE STATE TRANSITION
      const result = await transitionGiftState(
        booking.id,
        GiftState.DECLINED,
        'user',
        {
          declineReason: input.reason,
          customReason: input.reason
            ? `Recipient declined: ${input.reason}`
            : 'Recipient declined the gift',
        }
      )

      if (!result.success) {
        giftLogger.error({
          msg: 'Gift decline failed',
          bookingId: booking.id,
          error: result.error,
        })
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error || 'Failed to process decline. Please contact support.',
        })
      }

      giftLogger.info({
        msg: 'Gift declined via router',
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        reason: input.reason,
        transitionId: result.transitionId,
      })

      // 4. RETURN SUCCESS
      return {
        success: true,
        message: 'Gift declined successfully. The purchaser has been notified and a refund has been processed.',
      }
    }),

  /**
   * Get Gifts Purchased by Current User (Protected)
   *
   * Returns all gift bookings where the current user is the purchaser.
   * Used on the "Gifts I Purchased" dashboard page.
   */
  myPurchasedGifts: protectedProcedure.query(async ({ ctx }) => {
    const gifts = await ctx.db.booking.findMany({
      where: {
        giftPurchaserId: ctx.user.id,
        isGift: true,
      },
      include: {
        package: {
          select: {
            name: true,
            slug: true,
          },
        },
        trip: {
          select: {
            startDate: true,
            endDate: true,
            destination: true,
          },
        },
        giftStateTransitions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return gifts.map((gift) => ({
      id: gift.id,
      bookingReference: gift.bookingReference,
      packageName: gift.package.name,
      packageSlug: gift.package.slug,
      recipientName: gift.giftRecipientName,
      recipientEmail: gift.giftRecipientEmail,
      giftMessage: gift.giftMessage,
      giftStatus: gift.giftStatus,
      giftDeliveryDate: gift.giftDeliveryDate?.toISOString(),
      giftExpiresAt: gift.giftExpiresAt?.toISOString(),
      totalPrice: gift.totalPrice,
      createdAt: gift.createdAt.toISOString(),
      trip: gift.trip
        ? {
            startDate: gift.trip.startDate?.toISOString(),
            endDate: gift.trip.endDate?.toISOString(),
            destination: gift.trip.destination,
          }
        : null,
      stateHistory: gift.giftStateTransitions.map((t) => ({
        fromState: t.fromState,
        toState: t.toState,
        reason: t.reason,
        createdAt: t.createdAt.toISOString(),
      })),
    }))
  }),
})
