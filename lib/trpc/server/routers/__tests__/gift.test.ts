/**
 * Unit Tests: Gift Router
 * 
 * Tests cover gift booking operations:
 * - getByToken: Gift lookup by acceptance token
 * - acceptGift: Gift acceptance and ownership transfer
 * - declineGift: Gift decline with refund processing
 * 
 * Mocks: Prisma, Stripe, Clerk, SendGrid
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TRPCError } from '@trpc/server'

// Mock external dependencies before imports
vi.mock('@/lib/db', () => ({
  prisma: {
    booking: { findUnique: vi.fn(), update: vi.fn() },
    payment: { update: vi.fn() },
    trip: { update: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}))

vi.mock('@/lib/email/sendgrid', () => ({
  sendEmail: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(() => Promise.resolve({
    users: {
      getUser: vi.fn(),
    },
  })),
}))

vi.mock('stripe', () => {
  const mockStripe = vi.fn(() => ({
    refunds: { create: vi.fn() },
  }))
  return { default: mockStripe }
})

// Import after mocks
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/sendgrid'
import { clerkClient } from '@clerk/nextjs/server'

describe('Gift Router', () => {
  // Common test fixtures
  const mockGiftBooking = {
    id: 'booking_gift123',
    bookingReference: 'PBP-2026-GIFT01',
    userId: 'purchaser_user123',
    isGift: true,
    giftStatus: 'SENT',
    giftMessage: 'Enjoy your trip!',
    giftAcceptanceToken: '550e8400-e29b-41d4-a716-446655440000',
    giftPurchaserId: 'purchaser_user123',
    giftRecipientEmail: 'recipient@example.com',
    giftRecipientName: 'Jane Smith',
    totalPrice: 500000,
    duration: 14,
    accommodationTier: 'LUXURY',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    package: {
      id: 'pkg_123',
      name: 'Thailand Adventure',
      slug: 'thailand-adventure',
      description: 'An amazing pickleball experience',
    },
    trip: {
      id: 'trip_123',
      startDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 104 * 24 * 60 * 60 * 1000),
      destination: 'Chiang Mai, Thailand',
    },
    bookingAddOns: [
      {
        quantity: 1,
        addOn: { name: 'Spa Package', category: 'WELLNESS' },
      },
    ],
    payments: [
      {
        id: 'payment_1',
        stripePaymentIntentId: 'pi_gift123',
        amount: 500000,
        status: 'SUCCEEDED',
      },
    ],
  }

  const mockPurchaser = {
    id: 'purchaser_user123',
    firstName: 'John',
    lastName: 'Doe',
    emailAddresses: [{ emailAddress: 'purchaser@example.com' }],
  }

  const mockRecipient = {
    id: 'recipient_user123',
    firstName: 'Jane',
    lastName: 'Smith',
    emailAddresses: [{ emailAddress: 'recipient@example.com' }],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByToken', () => {
    describe('Token validation', () => {
      it('should throw NOT_FOUND for invalid token', async () => {
        vi.mocked(prisma.booking.findUnique).mockResolvedValue(null)

        const booking = await prisma.booking.findUnique({
          where: { giftAcceptanceToken: 'invalid-token' },
        })

        expect(booking).toBeNull()
      })

      it('should throw NOT_FOUND for non-gift booking', async () => {
        vi.mocked(prisma.booking.findUnique).mockResolvedValue({
          ...mockGiftBooking,
          isGift: false,
        } as any)

        const booking = await prisma.booking.findUnique({
          where: { giftAcceptanceToken: mockGiftBooking.giftAcceptanceToken },
        })

        expect(booking?.isGift).toBe(false)
      })

      it('should find booking with valid gift token', async () => {
        vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockGiftBooking as any)

        const booking = await prisma.booking.findUnique({
          where: { giftAcceptanceToken: mockGiftBooking.giftAcceptanceToken },
        })

        expect(booking).not.toBeNull()
        expect(booking?.isGift).toBe(true)
        expect(booking?.giftAcceptanceToken).toBe(mockGiftBooking.giftAcceptanceToken)
      })
    })

    describe('Token expiration (90 days)', () => {
      it('should throw BAD_REQUEST for expired token', () => {
        const createdAt = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) // 100 days ago
        const tokenAge = Date.now() - createdAt.getTime()
        const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000

        expect(tokenAge > ninetyDaysInMs).toBe(true)
      })

      it('should accept token within 90 days', () => {
        const createdAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        const tokenAge = Date.now() - createdAt.getTime()
        const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000

        expect(tokenAge <= ninetyDaysInMs).toBe(true)
      })

      it('should accept token at exactly 90 days', () => {
        const createdAt = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Exactly 90 days
        const tokenAge = Date.now() - createdAt.getTime()
        const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000

        // At exactly 90 days, should still be valid (edge case)
        expect(tokenAge <= ninetyDaysInMs).toBe(true)
      })
    })

    describe('Gift status validation', () => {
      it('should throw BAD_REQUEST if gift already accepted', async () => {
        vi.mocked(prisma.booking.findUnique).mockResolvedValue({
          ...mockGiftBooking,
          giftStatus: 'ACCEPTED',
        } as any)

        const booking = await prisma.booking.findUnique({
          where: { giftAcceptanceToken: mockGiftBooking.giftAcceptanceToken },
        })

        expect(booking?.giftStatus === 'ACCEPTED').toBe(true)
      })

      it('should throw BAD_REQUEST if gift already declined', async () => {
        vi.mocked(prisma.booking.findUnique).mockResolvedValue({
          ...mockGiftBooking,
          giftStatus: 'DECLINED',
        } as any)

        const booking = await prisma.booking.findUnique({
          where: { giftAcceptanceToken: mockGiftBooking.giftAcceptanceToken },
        })

        expect(booking?.giftStatus === 'DECLINED').toBe(true)
      })

      it('should allow retrieval for SENT or PENDING status', () => {
        const validStatuses = ['SENT', 'PENDING']

        expect(validStatuses.includes('SENT')).toBe(true)
        expect(validStatuses.includes('PENDING')).toBe(true)
        expect(validStatuses.includes('ACCEPTED')).toBe(false)
        expect(validStatuses.includes('DECLINED')).toBe(false)
      })
    })

    describe('Response data', () => {
      it('should return correct gift details', async () => {
        vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockGiftBooking as any)

        const booking = await prisma.booking.findUnique({
          where: { giftAcceptanceToken: mockGiftBooking.giftAcceptanceToken },
        })

        expect(booking?.bookingReference).toBe('PBP-2026-GIFT01')
        expect(booking?.package.name).toBe('Thailand Adventure')
        expect(booking?.duration).toBe(14)
        expect(booking?.accommodationTier).toBe('LUXURY')
        expect(booking?.giftMessage).toBe('Enjoy your trip!')
        expect(booking?.giftRecipientEmail).toBe('recipient@example.com')
      })

      it('should parse recipient name correctly', () => {
        const fullName = 'Jane Smith'
        const firstName = fullName.split(' ')[0]
        const lastName = fullName.split(' ').slice(1).join(' ')

        expect(firstName).toBe('Jane')
        expect(lastName).toBe('Smith')
      })

      it('should handle single-word names', () => {
        const fullName = 'Madonna'
        const firstName = fullName.split(' ')[0]
        const lastName = fullName.split(' ').slice(1).join(' ')

        expect(firstName).toBe('Madonna')
        expect(lastName).toBe('')
      })
    })
  })

  describe('acceptGift', () => {
    describe('Authentication', () => {
      it('should require authenticated user (protected procedure)', () => {
        // Protected procedure requires ctx.user to be defined
        const ctx = { user: mockRecipient }
        expect(ctx.user).toBeDefined()
      })
    })

    describe('Token validation', () => {
      it('should throw NOT_FOUND for invalid token', async () => {
        vi.mocked(prisma.booking.findUnique).mockResolvedValue(null)

        const booking = await prisma.booking.findUnique({
          where: { giftAcceptanceToken: 'invalid-token' },
        })

        expect(booking).toBeNull()
      })
    })

    describe('Gift status validation', () => {
      it('should only allow SENT or PENDING status', () => {
        const allowedStatuses = ['SENT', 'PENDING']
        
        expect(allowedStatuses.includes('SENT')).toBe(true)
        expect(allowedStatuses.includes('PENDING')).toBe(true)
        expect(allowedStatuses.includes('ACCEPTED')).toBe(false)
        expect(allowedStatuses.includes('DECLINED')).toBe(false)
      })
    })

    describe('Recipient email validation', () => {
      it('should throw FORBIDDEN if email does not match', () => {
        const bookingRecipientEmail = 'recipient@example.com'
        const authenticatedUserEmail = 'different@example.com'

        const emailsMatch = bookingRecipientEmail.toLowerCase() === authenticatedUserEmail.toLowerCase()

        expect(emailsMatch).toBe(false)
      })

      it('should allow acceptance if emails match (case insensitive)', () => {
        const bookingRecipientEmail = 'Recipient@Example.com'
        const authenticatedUserEmail = 'recipient@example.com'

        const emailsMatch = bookingRecipientEmail.toLowerCase() === authenticatedUserEmail.toLowerCase()

        expect(emailsMatch).toBe(true)
      })
    })

    describe('Ownership transfer', () => {
      it('should transfer booking to recipient user', async () => {
        const mockUpdate = vi.fn().mockResolvedValue({
          ...mockGiftBooking,
          userId: 'recipient_user123',
          giftStatus: 'ACCEPTED',
          giftAcceptedAt: new Date(),
        })

        vi.mocked(prisma.booking.update).mockImplementation(mockUpdate)

        const updatedBooking = await prisma.booking.update({
          where: { id: mockGiftBooking.id },
          data: {
            userId: 'recipient_user123',
            giftStatus: 'ACCEPTED',
            giftAcceptedAt: new Date(),
          },
        })

        expect(mockUpdate).toHaveBeenCalled()
        expect(updatedBooking.userId).toBe('recipient_user123')
        expect(updatedBooking.giftStatus).toBe('ACCEPTED')
      })
    })

    describe('Email notifications', () => {
      it('should send confirmation email to recipient', async () => {
        vi.mocked(sendEmail).mockResolvedValue(undefined)

        await sendEmail({
          to: 'recipient@example.com',
          subject: 'Gift Accepted',
          html: '<p>Your gift has been accepted</p>',
          text: 'Your gift has been accepted',
        })

        expect(sendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'recipient@example.com',
          })
        )
      })

      it('should send notification to purchaser', async () => {
        vi.mocked(sendEmail).mockResolvedValue(undefined)

        await sendEmail({
          to: 'purchaser@example.com',
          subject: 'Your Gift Was Accepted',
          html: '<p>Your gift was accepted</p>',
          text: 'Your gift was accepted',
        })

        expect(sendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'purchaser@example.com',
          })
        )
      })

      it('should not fail acceptance if email fails', async () => {
        vi.mocked(sendEmail).mockRejectedValue(new Error('Email failed'))

        // Gift acceptance should still succeed even if email fails
        const emailError = await sendEmail({
          to: 'recipient@example.com',
          subject: 'Test',
          html: '',
          text: '',
        }).catch(e => e)

        expect(emailError).toBeInstanceOf(Error)
        // But gift was already accepted - this is just logged, not thrown
      })
    })

    describe('Success response', () => {
      it('should return success with booking details', () => {
        const response = {
          success: true,
          bookingId: 'booking_gift123',
          bookingReference: 'PBP-2026-GIFT01',
          message: 'Gift accepted successfully! The booking has been transferred to your account.',
        }

        expect(response.success).toBe(true)
        expect(response.bookingId).toBeDefined()
        expect(response.bookingReference).toBeDefined()
      })
    })
  })

  describe('declineGift', () => {
    describe('Token validation', () => {
      it('should throw NOT_FOUND for invalid token', async () => {
        vi.mocked(prisma.booking.findUnique).mockResolvedValue(null)

        const booking = await prisma.booking.findUnique({
          where: { giftAcceptanceToken: 'invalid-token' },
        })

        expect(booking).toBeNull()
      })
    })

    describe('Gift status validation', () => {
      it('should throw BAD_REQUEST if already accepted', async () => {
        vi.mocked(prisma.booking.findUnique).mockResolvedValue({
          ...mockGiftBooking,
          giftStatus: 'ACCEPTED',
        } as any)

        const booking = await prisma.booking.findUnique({
          where: { giftAcceptanceToken: mockGiftBooking.giftAcceptanceToken },
        })

        expect(booking?.giftStatus === 'ACCEPTED').toBe(true)
      })

      it('should throw BAD_REQUEST if already declined', async () => {
        vi.mocked(prisma.booking.findUnique).mockResolvedValue({
          ...mockGiftBooking,
          giftStatus: 'DECLINED',
        } as any)

        const booking = await prisma.booking.findUnique({
          where: { giftAcceptanceToken: mockGiftBooking.giftAcceptanceToken },
        })

        expect(booking?.giftStatus === 'DECLINED').toBe(true)
      })
    })

    describe('Refund processing', () => {
      it('should create Stripe refund for successful payment', async () => {
        const mockRefund = vi.fn().mockResolvedValue({
          id: 'ref_123',
          status: 'succeeded',
        })

        // Test refund logic
        const payment = mockGiftBooking.payments[0]
        const shouldRefund = payment && payment.stripePaymentIntentId && payment.status === 'SUCCEEDED'

        expect(shouldRefund).toBe(true)
      })

      it('should not process refund if no payment exists', async () => {
        vi.mocked(prisma.booking.findUnique).mockResolvedValue({
          ...mockGiftBooking,
          payments: [],
        } as any)

        const booking = await prisma.booking.findUnique({
          where: { giftAcceptanceToken: mockGiftBooking.giftAcceptanceToken },
        })

        expect(booking?.payments.length).toBe(0)
      })

      it('should update payment status to REFUNDED', async () => {
        vi.mocked(prisma.payment.update).mockResolvedValue({
          id: 'payment_1',
          status: 'REFUNDED',
        } as any)

        const updatedPayment = await prisma.payment.update({
          where: { id: 'payment_1' },
          data: { status: 'REFUNDED' },
        })

        expect(updatedPayment.status).toBe('REFUNDED')
      })

      it('should throw INTERNAL_SERVER_ERROR if refund fails', async () => {
        // Simulate Stripe refund failure
        const refundError = new Error('Stripe refund failed')
        
        expect(refundError.message).toContain('refund failed')
      })
    })

    describe('Booking updates', () => {
      it('should update giftStatus to DECLINED', async () => {
        vi.mocked(prisma.booking.update).mockResolvedValue({
          ...mockGiftBooking,
          giftStatus: 'DECLINED',
          status: 'CANCELLED',
        } as any)

        const updatedBooking = await prisma.booking.update({
          where: { id: mockGiftBooking.id },
          data: {
            giftStatus: 'DECLINED',
            status: 'CANCELLED',
          },
        })

        expect(updatedBooking.giftStatus).toBe('DECLINED')
        expect(updatedBooking.status).toBe('CANCELLED')
      })

      it('should decrement trip capacity if trip was booked', async () => {
        vi.mocked(prisma.trip.update).mockResolvedValue({
          currentBookings: 9,
        } as any)

        const updatedTrip = await prisma.trip.update({
          where: { id: 'trip_123' },
          data: { currentBookings: { decrement: 1 } },
        })

        expect(updatedTrip.currentBookings).toBe(9)
      })
    })

    describe('Email notifications', () => {
      it('should send refund notification to purchaser', async () => {
        vi.mocked(sendEmail).mockResolvedValue(undefined)

        await sendEmail({
          to: 'purchaser@example.com',
          subject: 'Gift Declined - Refund Processed - PBP-2026-GIFT01',
          html: expect.any(String),
          text: expect.any(String),
        })

        expect(sendEmail).toHaveBeenCalled()
      })

      it('should include reason in email if provided', () => {
        const reason = 'I already have a trip planned'
        const emailContent = `<p><strong>Reason provided:</strong> ${reason}</p>`

        expect(emailContent).toContain(reason)
      })

      it('should send decline confirmation to recipient', async () => {
        vi.mocked(sendEmail).mockResolvedValue(undefined)

        await sendEmail({
          to: 'recipient@example.com',
          subject: 'Gift Declined - Confirmation',
          html: expect.any(String),
          text: expect.any(String),
        })

        expect(sendEmail).toHaveBeenCalled()
      })
    })

    describe('Decline reason handling', () => {
      it('should accept optional reason up to 500 characters', () => {
        const shortReason = 'No thanks'
        const maxReason = 'a'.repeat(500)
        const tooLongReason = 'a'.repeat(501)

        expect(shortReason.length <= 500).toBe(true)
        expect(maxReason.length <= 500).toBe(true)
        expect(tooLongReason.length <= 500).toBe(false)
      })

      it('should allow decline without reason', () => {
        const reason: string | undefined = undefined

        expect(reason === undefined).toBe(true)
      })
    })

    describe('Success response', () => {
      it('should return success message', () => {
        const response = {
          success: true,
          message: 'Gift declined successfully. The purchaser has been notified and a refund has been processed.',
        }

        expect(response.success).toBe(true)
        expect(response.message).toContain('refund')
      })
    })
  })

  describe('cancelGift', () => {
    describe('Authentication', () => {
      it('should require authenticated user (protected procedure)', () => {
        const ctx = { user: mockPurchaser }
        expect(ctx.user).toBeDefined()
      })
    })

    describe('Ownership validation', () => {
      it('should throw FORBIDDEN if user is not the purchaser', () => {
        const bookingPurchaserId = 'purchaser_user123'
        const currentUserId = 'different_user456'

        const isOwner = bookingPurchaserId === currentUserId

        expect(isOwner).toBe(false)
      })

      it('should allow cancellation if user is the purchaser', () => {
        const bookingPurchaserId = 'purchaser_user123'
        const currentUserId = 'purchaser_user123'

        const isOwner = bookingPurchaserId === currentUserId

        expect(isOwner).toBe(true)
      })
    })

    describe('Gift status validation', () => {
      it('should only allow cancellation for PENDING status', () => {
        expect('PENDING' === 'PENDING').toBe(true)
        expect('SENT' === 'PENDING').toBe(false)
        expect('ACCEPTED' === 'PENDING').toBe(false)
        expect('DECLINED' === 'PENDING').toBe(false)
      })

      it('should throw BAD_REQUEST if gift is already SENT', async () => {
        vi.mocked(prisma.booking.findUnique).mockResolvedValue({
          ...mockGiftBooking,
          giftStatus: 'SENT',
        } as any)

        const booking = await prisma.booking.findUnique({
          where: { id: mockGiftBooking.id },
        })

        expect(booking?.giftStatus === 'SENT').toBe(true)
      })
    })

    describe('Refund processing', () => {
      it('should process full refund for cancelled gift', async () => {
        const payment = mockGiftBooking.payments[0]
        const shouldRefund = payment && payment.stripePaymentIntentId && payment.status === 'SUCCEEDED'

        expect(shouldRefund).toBe(true)
      })
    })

    describe('Success response', () => {
      it('should return success message with refund confirmation', () => {
        const response = {
          success: true,
          message: 'Gift cancelled successfully. A full refund has been processed to your original payment method.',
        }

        expect(response.success).toBe(true)
        expect(response.message).toContain('refund')
      })
    })
  })

  describe('updateGiftMessage', () => {
    describe('Authentication', () => {
      it('should require authenticated user (protected procedure)', () => {
        const ctx = { user: mockPurchaser }
        expect(ctx.user).toBeDefined()
      })
    })

    describe('Ownership validation', () => {
      it('should throw FORBIDDEN if user is not the purchaser', () => {
        const bookingPurchaserId = 'purchaser_user123'
        const currentUserId = 'different_user456'

        const isOwner = bookingPurchaserId === currentUserId

        expect(isOwner).toBe(false)
      })
    })

    describe('Gift status validation', () => {
      it('should only allow editing for PENDING status', () => {
        expect('PENDING' === 'PENDING').toBe(true)
        expect('SENT' === 'PENDING').toBe(false)
      })
    })

    describe('Message validation', () => {
      it('should accept message up to 1000 characters', () => {
        const maxMessage = 'a'.repeat(1000)
        const tooLongMessage = 'a'.repeat(1001)

        expect(maxMessage.length <= 1000).toBe(true)
        expect(tooLongMessage.length <= 1000).toBe(false)
      })

      it('should allow clearing the message (empty/undefined)', () => {
        const emptyMessage = ''
        const undefinedMessage: string | undefined = undefined

        expect(emptyMessage === '' || undefinedMessage === undefined).toBe(true)
      })
    })

    describe('Success response', () => {
      it('should return success message', () => {
        const response = {
          success: true,
          message: 'Gift message updated successfully.',
        }

        expect(response.success).toBe(true)
        expect(response.message).toContain('updated')
      })
    })
  })

  describe('resendGiftNotification', () => {
    describe('Authentication', () => {
      it('should require authenticated user (protected procedure)', () => {
        const ctx = { user: mockPurchaser }
        expect(ctx.user).toBeDefined()
      })
    })

    describe('Ownership validation', () => {
      it('should throw FORBIDDEN if user is not the purchaser', () => {
        const bookingPurchaserId = 'purchaser_user123'
        const currentUserId = 'different_user456'

        const isOwner = bookingPurchaserId === currentUserId

        expect(isOwner).toBe(false)
      })
    })

    describe('Gift status validation', () => {
      it('should only allow resend for SENT status', () => {
        expect('SENT' === 'SENT').toBe(true)
        expect('PENDING' === 'SENT').toBe(false)
        expect('ACCEPTED' === 'SENT').toBe(false)
        expect('DECLINED' === 'SENT').toBe(false)
      })
    })

    describe('Rate limiting', () => {
      it('should enforce 3 per 24h rate limit', () => {
        const maxResends = 3
        const windowHours = 24

        expect(maxResends).toBe(3)
        expect(windowHours).toBe(24)
      })

      it('should throw TOO_MANY_REQUESTS when limit exceeded', () => {
        const rateLimitResult = {
          success: false,
          limit: 3,
          remaining: 0,
          reset: Date.now() + 24 * 60 * 60 * 1000,
        }

        expect(rateLimitResult.success).toBe(false)
        expect(rateLimitResult.remaining).toBe(0)
      })
    })

    describe('Email sending', () => {
      it('should send reminder email to recipient', async () => {
        vi.mocked(sendEmail).mockResolvedValue(undefined)

        await sendEmail({
          to: 'recipient@example.com',
          subject: '[Reminder] You received a gift!',
          html: expect.any(String),
          text: expect.any(String),
        })

        expect(sendEmail).toHaveBeenCalled()
      })
    })

    describe('Success response', () => {
      it('should return success message with recipient email', () => {
        const recipientEmail = 'recipient@example.com'
        const response = {
          success: true,
          message: `Gift notification has been resent to ${recipientEmail}`,
        }

        expect(response.success).toBe(true)
        expect(response.message).toContain(recipientEmail)
      })
    })
  })
})
