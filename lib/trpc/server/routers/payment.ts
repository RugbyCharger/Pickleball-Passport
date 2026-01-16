/**
 * Payment Router
 * E4-S12: Update Payment Method
 *
 * tRPC procedures for payment method management including:
 * - Creating SetupIntents for new payment methods
 * - Updating default payment methods
 * - Retrieving saved payment methods
 */

import { z } from 'zod'
import { router, guestProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  createSetupIntent,
  updateCustomerDefaultPaymentMethod,
  getCustomerPaymentMethods,
  getCustomerDefaultPaymentMethod,
} from '@/lib/stripe/stripe-service'
import { paymentLogger, logError } from '@/lib/logger'

export const paymentRouter = router({
  /**
   * Create SetupIntent
   *
   * Creates a Stripe SetupIntent to securely collect a new payment method.
   * The SetupIntent client secret is returned for use with Stripe Elements.
   *
   * E4-S12: Used when guest wants to update their payment method for installments.
   */
  createSetupIntent: guestProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { bookingId } = input

      paymentLogger.info({ bookingId, userId: ctx.user.id }, 'Creating SetupIntent for payment method update')

      // Fetch the booking to get the Stripe customer ID
      const booking = await ctx.db.booking.findFirst({
        where: {
          id: bookingId,
          userId: ctx.user.id,
        },
        select: {
          id: true,
          bookingReference: true,
          stripeCustomerId: true,
          paymentPlan: true,
          status: true,
        },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      // Verify booking has a Stripe customer ID (only for installment plans)
      if (!booking.stripeCustomerId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This booking does not have a saved payment method. Only installment plan bookings can update payment methods.',
        })
      }

      // Verify booking is active (not cancelled or completed)
      if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot update payment method for cancelled or completed bookings',
        })
      }

      try {
        const result = await createSetupIntent({
          customerId: booking.stripeCustomerId,
        })

        paymentLogger.info(
          { bookingId, setupIntentId: result.setupIntentId },
          'SetupIntent created successfully'
        )

        return {
          clientSecret: result.clientSecret,
          setupIntentId: result.setupIntentId,
          bookingReference: booking.bookingReference,
        }
      } catch (error) {
        logError(paymentLogger, error, 'Failed to create SetupIntent', { bookingId })
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment setup. Please try again.',
        })
      }
    }),

  /**
   * Update Default Payment Method
   *
   * After a SetupIntent is confirmed, this updates the customer's
   * default payment method for future installment charges.
   *
   * E4-S12: Called after user successfully adds new payment method.
   */
  updateDefaultPaymentMethod: guestProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
        paymentMethodId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { bookingId, paymentMethodId } = input

      paymentLogger.info(
        { bookingId, userId: ctx.user.id, paymentMethodId },
        'Updating default payment method'
      )

      // Fetch the booking to get the Stripe customer ID
      const booking = await ctx.db.booking.findFirst({
        where: {
          id: bookingId,
          userId: ctx.user.id,
        },
        select: {
          id: true,
          bookingReference: true,
          stripeCustomerId: true,
        },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      if (!booking.stripeCustomerId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This booking does not have a saved payment method',
        })
      }

      try {
        await updateCustomerDefaultPaymentMethod({
          customerId: booking.stripeCustomerId,
          paymentMethodId,
        })

        paymentLogger.info(
          { bookingId, paymentMethodId },
          'Default payment method updated successfully'
        )

        return {
          success: true,
          message: 'Payment method updated successfully',
        }
      } catch (error) {
        logError(paymentLogger, error, 'Failed to update default payment method', {
          bookingId,
          paymentMethodId,
        })
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update payment method. Please try again.',
        })
      }
    }),

  /**
   * Get Payment Methods
   *
   * Retrieves saved payment methods for a booking's Stripe customer.
   * Includes the default payment method indicator.
   *
   * E4-S12: Used to display current payment method on file.
   */
  getPaymentMethods: guestProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { bookingId } = input

      // Fetch the booking to get the Stripe customer ID
      const booking = await ctx.db.booking.findFirst({
        where: {
          id: bookingId,
          userId: ctx.user.id,
        },
        select: {
          id: true,
          stripeCustomerId: true,
        },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      if (!booking.stripeCustomerId) {
        return {
          paymentMethods: [],
          defaultPaymentMethodId: null,
        }
      }

      try {
        const [paymentMethods, defaultPaymentMethod] = await Promise.all([
          getCustomerPaymentMethods(booking.stripeCustomerId),
          getCustomerDefaultPaymentMethod(booking.stripeCustomerId),
        ])

        return {
          paymentMethods: paymentMethods.map((pm) => ({
            id: pm.id,
            brand: pm.card?.brand || 'unknown',
            last4: pm.card?.last4 || '****',
            expMonth: pm.card?.exp_month || 0,
            expYear: pm.card?.exp_year || 0,
          })),
          defaultPaymentMethodId: defaultPaymentMethod?.id || null,
        }
      } catch (error) {
        logError(paymentLogger, error, 'Failed to fetch payment methods', { bookingId })
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch payment methods',
        })
      }
    }),
})
