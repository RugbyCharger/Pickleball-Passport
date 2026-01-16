/**
 * Gift Router (E3-S18)
 *
 * Handles gift acceptance, decline, and lookup operations
 */

import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { sendEmail } from '@/lib/email/sendgrid'
import {
  generateGiftAcceptanceConfirmationRecipientEmail,
  type GiftAcceptanceConfirmationRecipientData,
} from '@/lib/email/templates/gift-acceptance-confirmation-recipient'
import {
  generateGiftAcceptanceNotificationPurchaserEmail,
  type GiftAcceptanceNotificationPurchaserData,
} from '@/lib/email/templates/gift-acceptance-notification-purchaser'
import { clerkClient } from '@clerk/nextjs/server'
import { giftLogger, logError, authLogger, emailLogger, stripeLogger } from '@/lib/logger'

export const giftRouter = router({
  /**
   * Get Gift by Token (Public)
   *
   * Retrieves gift booking details using the acceptance token.
   * Used on the gift acceptance page to display gift information before login/signup.
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

      // Check if already accepted or declined
      if (booking.giftStatus === 'ACCEPTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This gift has already been accepted',
        })
      }

      if (booking.giftStatus === 'DECLINED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This gift has been declined',
        })
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

      // Return gift details
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
        purchaser: {
          firstName: purchaserFirstName,
          lastName: purchaserLastName,
        },
        recipient: {
          firstName: booking.giftRecipientName?.split(' ')[0] || '',
          lastName: booking.giftRecipientName?.split(' ').slice(1).join(' ') || '',
          email: booking.giftRecipientEmail!,
        },
      }
    }),

  /**
   * Accept Gift (Protected)
   *
   * Transfers booking ownership from purchaser to recipient.
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

      // 2. VALIDATE GIFT STATUS
      if (booking.giftStatus !== 'SENT' && booking.giftStatus !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Gift has already been accepted or declined',
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

      // 4. GET PURCHASER INFORMATION FROM CLERK
      let purchaserFirstName = 'the purchaser'
      let purchaserLastName = ''
      let purchaserEmail = ''
      try {
        const clerk = await clerkClient()
        const purchaserUser = await clerk.users.getUser(booking.giftPurchaserId!)
        purchaserFirstName = purchaserUser.firstName || 'the purchaser'
        purchaserLastName = purchaserUser.lastName || ''
        purchaserEmail = purchaserUser.emailAddresses[0]?.emailAddress || ''
      } catch (error) {
        console.error('Failed to fetch purchaser from Clerk:', error)
        // Get email from database as fallback
        const dbUser = await ctx.db.user.findUnique({
          where: { id: booking.giftPurchaserId! },
          select: { email: true },
        })
        purchaserEmail = dbUser?.email || ''
      }

      if (!purchaserEmail) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Purchaser information not found',
        })
      }

      // 5. TRANSFER OWNERSHIP TO RECIPIENT
      const updatedBooking = await ctx.db.booking.update({
        where: { id: booking.id },
        data: {
          userId: ctx.user.id, // Transfer to recipient
          giftStatus: 'ACCEPTED',
          giftAcceptedAt: new Date(),
        },
        include: {
          package: true,
          trip: true,
        },
      })

      // 6. SEND CONFIRMATION EMAIL TO RECIPIENT
      try {
        const recipientConfirmationData: GiftAcceptanceConfirmationRecipientData = {
          recipientFirstName: ctx.user.firstName || booking.giftRecipientName?.split(' ')[0] || 'Guest',
          recipientEmail,
          purchaserFirstName,
          purchaserLastName,
          bookingReference: updatedBooking.bookingReference,
          packageName: updatedBooking.package.name,
          duration: updatedBooking.duration,
          accommodationTier: updatedBooking.accommodationTier,
          tripStartDate: updatedBooking.trip?.startDate?.toISOString(),
          tripEndDate: updatedBooking.trip?.endDate?.toISOString(),
          destination: updatedBooking.trip?.destination || 'Chiang Mai, Thailand',
          needsDateSelection: !updatedBooking.trip?.startDate,
          portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard`,
        }

        const recipientEmail_template = generateGiftAcceptanceConfirmationRecipientEmail(recipientConfirmationData)

        await sendEmail({
          to: recipientEmail,
          subject: recipientEmail_template.subject,
          html: recipientEmail_template.html,
          text: recipientEmail_template.text,
        })
      } catch (emailError) {
        logError(emailLogger, emailError, 'Failed to send gift acceptance confirmation to recipient')
        // Don't throw - gift already accepted, email failure is not critical
      }

      // 7. SEND NOTIFICATION EMAIL TO PURCHASER
      try {
        const purchaserNotificationData: GiftAcceptanceNotificationPurchaserData = {
          purchaserFirstName,
          purchaserEmail,
          recipientFirstName: ctx.user.firstName || booking.giftRecipientName?.split(' ')[0] || 'the recipient',
          recipientLastName: ctx.user.lastName || booking.giftRecipientName?.split(' ').slice(1).join(' ') || '',
          recipientEmail,
          bookingReference: updatedBooking.bookingReference,
          packageName: updatedBooking.package.name,
          duration: updatedBooking.duration,
          accommodationTier: updatedBooking.accommodationTier,
          acceptedAt: updatedBooking.giftAcceptedAt!.toISOString(),
          portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard`,
        }

        const purchaserEmail_template = generateGiftAcceptanceNotificationPurchaserEmail(purchaserNotificationData)

        await sendEmail({
          to: purchaserEmail,
          subject: purchaserEmail_template.subject,
          html: purchaserEmail_template.html,
          text: purchaserEmail_template.text,
        })
      } catch (emailError) {
        logError(emailLogger, emailError, 'Failed to send gift acceptance notification to purchaser')
        // Don't throw - gift already accepted, email failure is not critical
      }

      // 8. RETURN SUCCESS
      return {
        success: true,
        bookingId: updatedBooking.id,
        bookingReference: updatedBooking.bookingReference,
        message: 'Gift accepted successfully! The booking has been transferred to your account.',
      }
    }),

  /**
   * Decline Gift (Public - can be declined without login)
   *
   * Allows recipient to decline the gift, triggering a refund to the purchaser.
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
          payments: {
            select: {
              id: true,
              stripePaymentIntentId: true,
              amount: true,
              status: true,
            },
            take: 1,
          },
        },
      })

      if (!booking || !booking.isGift) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid gift token',
        })
      }

      // 2. VALIDATE GIFT STATUS
      if (booking.giftStatus === 'ACCEPTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This gift has already been accepted and cannot be declined',
        })
      }

      if (booking.giftStatus === 'DECLINED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This gift has already been declined',
        })
      }

      // 3. GET PURCHASER INFORMATION FROM CLERK
      let purchaserFirstName = 'the purchaser'
      let purchaserLastName = ''
      let purchaserEmail = ''
      try {
        const clerk = await clerkClient()
        const purchaserUser = await clerk.users.getUser(booking.giftPurchaserId!)
        purchaserFirstName = purchaserUser.firstName || 'Valued Customer'
        purchaserLastName = purchaserUser.lastName || ''
        purchaserEmail = purchaserUser.emailAddresses[0]?.emailAddress || ''
      } catch (error) {
        console.error('Failed to fetch purchaser from Clerk:', error)
        // Get email from database as fallback
        const dbUser = await ctx.db.user.findUnique({
          where: { id: booking.giftPurchaserId! },
          select: { email: true },
        })
        purchaserEmail = dbUser?.email || ''
      }

      if (!purchaserEmail) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Purchaser information not found',
        })
      }

      // 4. PROCESS REFUND VIA STRIPE
      try {
        const payment = booking.payments?.[0]
        if (payment && payment.stripePaymentIntentId && payment.status === 'SUCCEEDED') {
          const stripe = (await import('stripe')).default
          const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2025-12-15.clover',
          })

          // Create refund
          await stripeClient.refunds.create({
            payment_intent: payment.stripePaymentIntentId,
            reason: 'requested_by_customer',
            metadata: {
              bookingReference: booking.bookingReference,
              reason: input.reason || 'Gift declined by recipient',
            },
          })

          // Update payment status
          await ctx.db.payment.update({
            where: { id: payment.id },
            data: { status: 'REFUNDED' },
          })
        }
      } catch (refundError) {
        logError(stripeLogger, refundError, 'Failed to process gift decline refund')
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process refund. Please contact support.',
        })
      }

      // 5. UPDATE BOOKING STATUS
      await ctx.db.booking.update({
        where: { id: booking.id },
        data: {
          giftStatus: 'DECLINED',
          status: 'CANCELLED',
        },
      })

      // 6. DECREMENT TRIP CAPACITY (if trip was booked)
      if (booking.tripId) {
        await ctx.db.trip.update({
          where: { id: booking.tripId },
          data: { currentBookings: { decrement: 1 } },
        })
      }

      // 7. SEND EMAILS (purchaser notification and recipient confirmation)
      try {
        // Email to purchaser - gift declined notification
        await sendEmail({
          to: purchaserEmail,
          subject: `Gift Declined - Refund Processed - ${booking.bookingReference}`,
          html: `
            <h1>Gift Declined</h1>
            <p>Hi ${purchaserFirstName},</p>
            <p>Unfortunately, the recipient of your gift booking (${booking.giftRecipientName}) has declined the gift.</p>
            ${input.reason ? `<p><strong>Reason provided:</strong> ${input.reason}</p>` : ''}
            <p>A full refund of $${(booking.totalPrice / 100).toFixed(2)} has been processed to your original payment method.
            It may take 5-10 business days for the refund to appear in your account.</p>
            <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
            <p>If you have any questions, please contact us at support@pickleballpassport.com.</p>
            <p>The Pickleball Passport Team</p>
          `,
          text: `Gift Declined - Refund Processed\n\nHi ${purchaserFirstName},\n\nUnfortunately, the recipient has declined your gift booking. A full refund has been processed.\n\nBooking Reference: ${booking.bookingReference}\n\nContact: support@pickleballpassport.com`,
        })

        // Email to recipient - decline confirmation
        await sendEmail({
          to: booking.giftRecipientEmail!,
          subject: `Gift Declined - Confirmation`,
          html: `
            <h1>Gift Declined</h1>
            <p>Hi ${booking.giftRecipientName?.split(' ')[0] || 'Guest'},</p>
            <p>We've received your request to decline the gift from ${purchaserFirstName} ${purchaserLastName}.</p>
            <p>The purchaser has been notified and a full refund has been processed.</p>
            ${input.reason ? `<p><strong>Your message:</strong> ${input.reason}</p>` : ''}
            <p>If you have any questions, please contact us at support@pickleballpassport.com.</p>
            <p>The Pickleball Passport Team</p>
          `,
          text: `Gift Declined - Confirmation\n\nYour gift decline request has been processed. The purchaser has been notified and refunded.`,
        })
      } catch (emailError) {
        logError(emailLogger, emailError, 'Failed to send gift decline emails')
        // Don't throw - gift already declined, email failure is not critical
      }

      // 8. RETURN SUCCESS
      return {
        success: true,
        message: 'Gift declined successfully. The purchaser has been notified and a refund has been processed.',
      }
    }),
})
