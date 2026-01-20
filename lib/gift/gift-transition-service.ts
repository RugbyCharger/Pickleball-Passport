/**
 * Gift State Transition Service (GS-003)
 *
 * Service layer for executing gift state transitions with side effects.
 * All transitions are atomic (wrapped in database transactions) and
 * recorded in the GiftStateTransition audit table.
 */

import { prisma } from '@/lib/db'
import { GiftState, GiftStatus, Prisma } from '@prisma/client'
import { giftStateMachine, TransitionMetadata } from './gift-state-machine'
import { sendEmail } from '@/lib/email/sendgrid'
import {
  generateGiftNotificationRecipientEmail,
  GiftNotificationRecipientData,
} from '@/lib/email/templates/gift-notification-recipient'
import {
  generateGiftAcceptanceConfirmationRecipientEmail,
  GiftAcceptanceConfirmationRecipientData,
} from '@/lib/email/templates/gift-acceptance-confirmation-recipient'
import {
  generateGiftAcceptanceNotificationPurchaserEmail,
  GiftAcceptanceNotificationPurchaserData,
} from '@/lib/email/templates/gift-acceptance-notification-purchaser'
import { giftLogger, logError, emailLogger, stripeLogger } from '@/lib/logger'
import { clerkClient } from '@clerk/nextjs/server'
import { addDays } from 'date-fns'

/**
 * Result of a state transition
 */
export interface TransitionResult {
  success: boolean
  fromState: GiftState
  toState: GiftState
  bookingId: string
  transitionId: string
  error?: string
}

/**
 * Options for transition operations
 */
export interface TransitionOptions {
  /** ID of user triggering the transition */
  userId?: string
  /** Custom reason for the transition (overrides default) */
  customReason?: string
  /** Additional context to store in metadata */
  additionalContext?: Record<string, unknown>
  /** Recipient email (for ACCEPTED transition) */
  recipientEmail?: string
  /** Recipient user ID (for ACCEPTED transition) */
  recipientUserId?: string
  /** Decline reason (for DECLINED transition) */
  declineReason?: string
  /** Skip email sending (useful for testing or batch operations) */
  skipEmails?: boolean
}

/**
 * Default expiration window in days
 */
const GIFT_EXPIRATION_DAYS = 30

/**
 * Map GiftState to GiftStatus for backwards compatibility
 */
function mapStateToStatus(state: GiftState): GiftStatus {
  const mapping: Record<GiftState, GiftStatus> = {
    [GiftState.PENDING]: 'PENDING',
    [GiftState.SENT]: 'SENT',
    [GiftState.ACCEPTED]: 'ACCEPTED',
    [GiftState.DECLINED]: 'DECLINED',
    [GiftState.EXPIRED]: 'DECLINED', // EXPIRED maps to DECLINED for backwards compat
  }
  return mapping[state]
}

/**
 * Get purchaser information from Clerk
 */
async function getPurchaserInfo(purchaserId: string): Promise<{
  firstName: string
  lastName: string
  email: string
} | null> {
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(purchaserId)
    return {
      firstName: user.firstName || 'Valued Customer',
      lastName: user.lastName || '',
      email: user.emailAddresses[0]?.emailAddress || '',
    }
  } catch (error) {
    logError(giftLogger, error, 'Failed to fetch purchaser from Clerk')
    return null
  }
}

/**
 * Transition a gift to a new state
 *
 * This is the main entry point for all gift state transitions.
 * It validates the transition, records it in the audit log, and
 * executes any side effects (emails, refunds, etc.)
 *
 * @param bookingId - The booking ID to transition
 * @param toState - The target state
 * @param triggeredBy - Who triggered the transition
 * @param options - Additional options for the transition
 */
export async function transitionGiftState(
  bookingId: string,
  toState: GiftState,
  triggeredBy: TransitionMetadata['triggeredBy'],
  options: TransitionOptions = {}
): Promise<TransitionResult> {
  // 1. Fetch the current booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      package: true,
      trip: true,
      user: true,
      payments: {
        where: { status: 'SUCCEEDED' },
        take: 1,
      },
    },
  })

  if (!booking) {
    return {
      success: false,
      fromState: GiftState.PENDING,
      toState,
      bookingId,
      transitionId: '',
      error: 'Booking not found',
    }
  }

  if (!booking.isGift) {
    return {
      success: false,
      fromState: GiftState.PENDING,
      toState,
      bookingId,
      transitionId: '',
      error: 'Booking is not a gift',
    }
  }

  // Map current GiftStatus to GiftState
  const currentState = booking.giftStatus as unknown as GiftState

  // 2. Validate the transition
  const validation = giftStateMachine.validateTransition(currentState, toState)
  if (!validation.valid) {
    return {
      success: false,
      fromState: currentState,
      toState,
      bookingId,
      transitionId: '',
      error: validation.error,
    }
  }

  // 3. Build transition reason and metadata
  const reason =
    options.customReason || giftStateMachine.getTransitionReason(currentState, toState)
  const metadata: TransitionMetadata = giftStateMachine.createMetadata(triggeredBy, {
    userId: options.userId,
    reason: options.customReason,
    additionalContext: options.additionalContext,
  })

  // 4. Execute transition in a transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Record the transition
      const transition = await tx.giftStateTransition.create({
        data: {
          bookingId,
          fromState: currentState,
          toState,
          reason,
          metadata: metadata as unknown as Prisma.JsonValue,
        },
      })

      // Calculate expiration date if transitioning to SENT
      const giftExpiresAt =
        toState === GiftState.SENT
          ? addDays(booking.giftDeliveryDate || new Date(), GIFT_EXPIRATION_DAYS)
          : booking.giftExpiresAt

      // Update the booking
      const updateData: Prisma.BookingUpdateInput = {
        giftStatus: mapStateToStatus(toState),
        giftStateChangedAt: new Date(),
        giftExpiresAt,
      }

      // Additional updates based on state
      if (toState === GiftState.ACCEPTED && options.recipientUserId) {
        updateData.userId = options.recipientUserId
        updateData.giftAcceptedAt = new Date()
      }

      if (toState === GiftState.DECLINED || toState === GiftState.EXPIRED) {
        updateData.status = 'CANCELLED'
      }

      await tx.booking.update({
        where: { id: bookingId },
        data: updateData,
      })

      // Decrement trip capacity if cancelled
      if (
        (toState === GiftState.DECLINED || toState === GiftState.EXPIRED) &&
        booking.tripId
      ) {
        await tx.trip.update({
          where: { id: booking.tripId },
          data: { currentBookings: { decrement: 1 } },
        })
      }

      return transition
    })

    // 5. Execute side effects (outside transaction)
    if (!options.skipEmails) {
      await executeSideEffects(booking, currentState, toState, options)
    }

    giftLogger.info({
      msg: 'Gift state transition successful',
      bookingId,
      bookingReference: booking.bookingReference,
      fromState: currentState,
      toState,
      transitionId: result.id,
      triggeredBy,
    })

    return {
      success: true,
      fromState: currentState,
      toState,
      bookingId,
      transitionId: result.id,
    }
  } catch (error) {
    logError(giftLogger, error, 'Gift state transition failed')
    return {
      success: false,
      fromState: currentState,
      toState,
      bookingId,
      transitionId: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Execute side effects for a state transition
 */
async function executeSideEffects(
  booking: Prisma.BookingGetPayload<{
    include: { package: true; trip: true; user: true; payments: true }
  }>,
  fromState: GiftState,
  toState: GiftState,
  options: TransitionOptions
): Promise<void> {
  switch (toState) {
    case GiftState.SENT:
      await handleSentTransition(booking)
      break
    case GiftState.ACCEPTED:
      await handleAcceptedTransition(booking, options)
      break
    case GiftState.DECLINED:
      await handleDeclinedTransition(booking, options)
      break
    case GiftState.EXPIRED:
      await handleExpiredTransition(booking)
      break
  }
}

/**
 * Handle SENT transition - send gift notification to recipient
 */
async function handleSentTransition(
  booking: Prisma.BookingGetPayload<{
    include: { package: true; trip: true; user: true }
  }>
): Promise<void> {
  const purchaserInfo = await getPurchaserInfo(booking.giftPurchaserId!)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'
  const acceptanceUrl = `${baseUrl}/gift/accept?token=${booking.giftAcceptanceToken}`

  const emailData: GiftNotificationRecipientData = {
    recipientFirstName: booking.giftRecipientName?.split(' ')[0] || 'Guest',
    recipientEmail: booking.giftRecipientEmail!,
    purchaserFirstName: purchaserInfo?.firstName || 'Someone special',
    purchaserLastName: purchaserInfo?.lastName || '',
    bookingReference: booking.bookingReference,
    packageName: booking.package.name,
    packageDescription: booking.package.tagline || undefined,
    duration: booking.duration,
    accommodationTier: booking.accommodationTier,
    tripStartDate: booking.trip?.startDate?.toISOString(),
    tripEndDate: booking.trip?.endDate?.toISOString(),
    destination: booking.trip?.destination || 'Chiang Mai, Thailand',
    totalValue: booking.totalPrice,
    giftMessage: booking.giftMessage || undefined,
    acceptanceUrl,
  }

  try {
    const { subject, html, text } = generateGiftNotificationRecipientEmail(emailData)
    await sendEmail({
      to: booking.giftRecipientEmail!,
      subject,
      html,
      text,
    })
    giftLogger.info({
      msg: 'Gift notification sent to recipient',
      bookingReference: booking.bookingReference,
      recipientEmail: booking.giftRecipientEmail,
    })
  } catch (error) {
    logError(emailLogger, error, 'Failed to send gift notification email')
  }
}

/**
 * Handle ACCEPTED transition - transfer ownership and send emails
 */
async function handleAcceptedTransition(
  booking: Prisma.BookingGetPayload<{
    include: { package: true; trip: true; user: true }
  }>,
  options: TransitionOptions
): Promise<void> {
  const purchaserInfo = await getPurchaserInfo(booking.giftPurchaserId!)
  const recipientEmail = options.recipientEmail || booking.giftRecipientEmail!

  // Send confirmation to recipient
  try {
    const recipientData: GiftAcceptanceConfirmationRecipientData = {
      recipientFirstName: booking.giftRecipientName?.split(' ')[0] || 'Guest',
      recipientEmail,
      purchaserFirstName: purchaserInfo?.firstName || 'the purchaser',
      purchaserLastName: purchaserInfo?.lastName || '',
      bookingReference: booking.bookingReference,
      packageName: booking.package.name,
      duration: booking.duration,
      accommodationTier: booking.accommodationTier,
      tripStartDate: booking.trip?.startDate?.toISOString(),
      tripEndDate: booking.trip?.endDate?.toISOString(),
      destination: booking.trip?.destination || 'Chiang Mai, Thailand',
      needsDateSelection: !booking.trip?.startDate,
      portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard`,
    }

    const { subject, html, text } =
      generateGiftAcceptanceConfirmationRecipientEmail(recipientData)
    await sendEmail({ to: recipientEmail, subject, html, text })
  } catch (error) {
    logError(emailLogger, error, 'Failed to send acceptance confirmation to recipient')
  }

  // Send notification to purchaser
  if (purchaserInfo?.email) {
    try {
      const purchaserData: GiftAcceptanceNotificationPurchaserData = {
        purchaserFirstName: purchaserInfo.firstName,
        purchaserEmail: purchaserInfo.email,
        recipientFirstName: booking.giftRecipientName?.split(' ')[0] || 'the recipient',
        recipientLastName: booking.giftRecipientName?.split(' ').slice(1).join(' ') || '',
        recipientEmail,
        bookingReference: booking.bookingReference,
        packageName: booking.package.name,
        duration: booking.duration,
        accommodationTier: booking.accommodationTier,
        acceptedAt: new Date().toISOString(),
        portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard`,
      }

      const { subject, html, text } =
        generateGiftAcceptanceNotificationPurchaserEmail(purchaserData)
      await sendEmail({ to: purchaserInfo.email, subject, html, text })
    } catch (error) {
      logError(emailLogger, error, 'Failed to send acceptance notification to purchaser')
    }
  }
}

/**
 * Handle DECLINED transition - process refund and send emails
 */
async function handleDeclinedTransition(
  booking: Prisma.BookingGetPayload<{
    include: { package: true; trip: true; user: true; payments: true }
  }>,
  options: TransitionOptions
): Promise<void> {
  const purchaserInfo = await getPurchaserInfo(booking.giftPurchaserId!)

  // Process refund
  const payment = booking.payments?.[0]
  if (payment && payment.stripePaymentIntentId) {
    try {
      const stripe = (await import('stripe')).default
      const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-12-15.clover',
      })

      await stripeClient.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          bookingReference: booking.bookingReference,
          reason: options.declineReason || 'Gift declined by recipient',
        },
      })

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      })

      stripeLogger.info({
        msg: 'Gift decline refund processed',
        bookingReference: booking.bookingReference,
        paymentIntentId: payment.stripePaymentIntentId,
      })
    } catch (error) {
      logError(stripeLogger, error, 'Failed to process gift decline refund')
      // Continue with emails even if refund fails
    }
  }

  // Send email to purchaser
  if (purchaserInfo?.email) {
    try {
      await sendEmail({
        to: purchaserInfo.email,
        subject: `Gift Declined - Refund Processed - ${booking.bookingReference}`,
        html: `
          <h1>Gift Declined</h1>
          <p>Hi ${purchaserInfo.firstName},</p>
          <p>Unfortunately, the recipient of your gift booking (${booking.giftRecipientName}) has declined the gift.</p>
          ${options.declineReason ? `<p><strong>Reason provided:</strong> ${options.declineReason}</p>` : ''}
          <p>A full refund of $${(booking.totalPrice / 100).toFixed(2)} has been processed to your original payment method.
          It may take 5-10 business days for the refund to appear in your account.</p>
          <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
          <p>If you have any questions, please contact us at support@pickleballpassport.com.</p>
          <p>The Pickleball Passport Team</p>
        `,
        text: `Gift Declined - Refund Processed\n\nHi ${purchaserInfo.firstName},\n\nThe recipient has declined your gift booking. A full refund has been processed.\n\nBooking Reference: ${booking.bookingReference}`,
      })
    } catch (error) {
      logError(emailLogger, error, 'Failed to send decline notification to purchaser')
    }
  }

  // Send email to recipient
  try {
    await sendEmail({
      to: booking.giftRecipientEmail!,
      subject: `Gift Declined - Confirmation`,
      html: `
        <h1>Gift Declined</h1>
        <p>Hi ${booking.giftRecipientName?.split(' ')[0] || 'Guest'},</p>
        <p>We've received your request to decline the gift from ${purchaserInfo?.firstName || 'the purchaser'}.</p>
        <p>The purchaser has been notified and a full refund has been processed.</p>
        ${options.declineReason ? `<p><strong>Your message:</strong> ${options.declineReason}</p>` : ''}
        <p>If you have any questions, please contact us at support@pickleballpassport.com.</p>
        <p>The Pickleball Passport Team</p>
      `,
      text: `Gift Declined - Confirmation\n\nYour gift decline request has been processed.`,
    })
  } catch (error) {
    logError(emailLogger, error, 'Failed to send decline confirmation to recipient')
  }
}

/**
 * Handle EXPIRED transition - process refund and notify purchaser
 */
async function handleExpiredTransition(
  booking: Prisma.BookingGetPayload<{
    include: { package: true; trip: true; user: true; payments: true }
  }>
): Promise<void> {
  const purchaserInfo = await getPurchaserInfo(booking.giftPurchaserId!)

  // Process refund
  const payment = booking.payments?.[0]
  if (payment && payment.stripePaymentIntentId) {
    try {
      const stripe = (await import('stripe')).default
      const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-12-15.clover',
      })

      await stripeClient.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          bookingReference: booking.bookingReference,
          reason: 'Gift expired after 30 days without response',
        },
      })

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      })

      stripeLogger.info({
        msg: 'Gift expiration refund processed',
        bookingReference: booking.bookingReference,
        paymentIntentId: payment.stripePaymentIntentId,
      })
    } catch (error) {
      logError(stripeLogger, error, 'Failed to process gift expiration refund')
    }
  }

  // Send email to purchaser
  if (purchaserInfo?.email) {
    try {
      await sendEmail({
        to: purchaserInfo.email,
        subject: `Gift Expired - Refund Processed - ${booking.bookingReference}`,
        html: `
          <h1>Gift Expired</h1>
          <p>Hi ${purchaserInfo.firstName},</p>
          <p>Unfortunately, your gift to ${booking.giftRecipientName} has expired after 30 days without a response.</p>
          <p>A full refund of $${(booking.totalPrice / 100).toFixed(2)} has been processed to your original payment method.
          It may take 5-10 business days for the refund to appear in your account.</p>
          <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
          <p>If you'd like to send another gift or have any questions, please contact us at support@pickleballpassport.com.</p>
          <p>The Pickleball Passport Team</p>
        `,
        text: `Gift Expired - Refund Processed\n\nHi ${purchaserInfo.firstName},\n\nYour gift has expired after 30 days without a response. A full refund has been processed.\n\nBooking Reference: ${booking.bookingReference}`,
      })
    } catch (error) {
      logError(emailLogger, error, 'Failed to send expiration notification to purchaser')
    }
  }
}

/**
 * Get the state transition history for a booking
 */
export async function getGiftStateHistory(bookingId: string) {
  return prisma.giftStateTransition.findMany({
    where: { bookingId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Check if a gift has expired
 */
export function isGiftExpired(giftExpiresAt: Date | null): boolean {
  if (!giftExpiresAt) return false
  return new Date() > giftExpiresAt
}
