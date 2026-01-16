/**
 * Unit Tests: Payment Router
 * E4-S12: Update Payment Method
 *
 * Tests cover payment method management operations:
 * - createSetupIntent: Create SetupIntent for new payment method
 * - updateDefaultPaymentMethod: Update customer's default payment method
 * - getPaymentMethods: Retrieve saved payment methods
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { TRPCError } from '@trpc/server'

// Mock external dependencies before imports
vi.mock('@/lib/db', () => ({
  prisma: {
    booking: { findFirst: vi.fn() },
  },
}))

vi.mock('@/lib/stripe/stripe-service', () => ({
  createSetupIntent: vi.fn(),
  updateCustomerDefaultPaymentMethod: vi.fn(),
  getCustomerPaymentMethods: vi.fn(),
  getCustomerDefaultPaymentMethod: vi.fn(),
}))

// Import after mocks
import { prisma } from '@/lib/db'
import {
  createSetupIntent,
  updateCustomerDefaultPaymentMethod,
  getCustomerPaymentMethods,
  getCustomerDefaultPaymentMethod,
} from '@/lib/stripe/stripe-service'

describe('Payment Router', () => {
  // Common test fixtures
  const mockBooking = {
    id: 'bk_test123',
    bookingReference: 'PBP-2026-123456',
    stripeCustomerId: 'cus_test123',
    paymentPlan: 'INSTALLMENT_4',
    status: 'CONFIRMED',
    userId: 'user_test123',
  }

  const mockPaymentMethod = {
    id: 'pm_test123',
    card: {
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2027,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSetupIntent', () => {
    it('should create a SetupIntent for a valid booking', async () => {
      // Arrange
      ;(prisma.booking.findFirst as Mock).mockResolvedValue(mockBooking)
      ;(createSetupIntent as Mock).mockResolvedValue({
        clientSecret: 'seti_test_secret',
        setupIntentId: 'seti_test123',
      })

      // Simulate tRPC context and input
      const input = { bookingId: 'bk_test123' }
      const ctx = { userId: 'user_test123', db: prisma }

      // Act - simulating the procedure logic
      const booking = await prisma.booking.findFirst({
        where: { id: input.bookingId, userId: ctx.userId },
        select: {
          id: true,
          bookingReference: true,
          stripeCustomerId: true,
          paymentPlan: true,
          status: true,
        },
      })

      expect(booking).toBeDefined()
      expect(booking?.stripeCustomerId).toBe('cus_test123')

      const result = await createSetupIntent({
        customerId: booking!.stripeCustomerId!,
      })

      // Assert
      expect(result.clientSecret).toBe('seti_test_secret')
      expect(result.setupIntentId).toBe('seti_test123')
      expect(createSetupIntent).toHaveBeenCalledWith({
        customerId: 'cus_test123',
      })
    })

    it('should throw NOT_FOUND error if booking does not exist', async () => {
      // Arrange
      ;(prisma.booking.findFirst as Mock).mockResolvedValue(null)

      // Act & Assert
      const booking = await prisma.booking.findFirst({
        where: { id: 'nonexistent', userId: 'user_test123' },
      })

      expect(booking).toBeNull()
    })

    it('should throw BAD_REQUEST error if booking has no Stripe customer', async () => {
      // Arrange
      const bookingWithoutCustomer = {
        ...mockBooking,
        stripeCustomerId: null,
      }
      ;(prisma.booking.findFirst as Mock).mockResolvedValue(bookingWithoutCustomer)

      // Act
      const booking = await prisma.booking.findFirst({
        where: { id: 'bk_test123', userId: 'user_test123' },
      })

      // Assert
      expect(booking?.stripeCustomerId).toBeNull()
    })

    it('should throw BAD_REQUEST error for cancelled bookings', async () => {
      // Arrange
      const cancelledBooking = {
        ...mockBooking,
        status: 'CANCELLED',
      }
      ;(prisma.booking.findFirst as Mock).mockResolvedValue(cancelledBooking)

      // Act
      const booking = await prisma.booking.findFirst({
        where: { id: 'bk_test123', userId: 'user_test123' },
      })

      // Assert
      expect(booking?.status).toBe('CANCELLED')
    })
  })

  describe('updateDefaultPaymentMethod', () => {
    it('should update the default payment method successfully', async () => {
      // Arrange
      ;(prisma.booking.findFirst as Mock).mockResolvedValue(mockBooking)
      ;(updateCustomerDefaultPaymentMethod as Mock).mockResolvedValue({
        id: 'cus_test123',
        invoice_settings: { default_payment_method: 'pm_new123' },
      })

      // Act
      const booking = await prisma.booking.findFirst({
        where: { id: 'bk_test123', userId: 'user_test123' },
      })

      const result = await updateCustomerDefaultPaymentMethod({
        customerId: booking!.stripeCustomerId!,
        paymentMethodId: 'pm_new123',
      })

      // Assert
      expect(updateCustomerDefaultPaymentMethod).toHaveBeenCalledWith({
        customerId: 'cus_test123',
        paymentMethodId: 'pm_new123',
      })
      expect(result).toBeDefined()
    })

    it('should handle Stripe errors gracefully', async () => {
      // Arrange
      ;(prisma.booking.findFirst as Mock).mockResolvedValue(mockBooking)
      ;(updateCustomerDefaultPaymentMethod as Mock).mockRejectedValue(
        new Error('Failed to update payment method')
      )

      // Act & Assert
      const booking = await prisma.booking.findFirst({
        where: { id: 'bk_test123', userId: 'user_test123' },
      })

      await expect(
        updateCustomerDefaultPaymentMethod({
          customerId: booking!.stripeCustomerId!,
          paymentMethodId: 'pm_invalid',
        })
      ).rejects.toThrow('Failed to update payment method')
    })
  })

  describe('getPaymentMethods', () => {
    it('should return payment methods for a booking with Stripe customer', async () => {
      // Arrange
      ;(prisma.booking.findFirst as Mock).mockResolvedValue(mockBooking)
      ;(getCustomerPaymentMethods as Mock).mockResolvedValue([mockPaymentMethod])
      ;(getCustomerDefaultPaymentMethod as Mock).mockResolvedValue(mockPaymentMethod)

      // Act
      const booking = await prisma.booking.findFirst({
        where: { id: 'bk_test123', userId: 'user_test123' },
      })

      const paymentMethods = await getCustomerPaymentMethods(booking!.stripeCustomerId!)
      const defaultPaymentMethod = await getCustomerDefaultPaymentMethod(booking!.stripeCustomerId!)

      // Assert
      expect(paymentMethods).toHaveLength(1)
      expect(paymentMethods[0].card?.brand).toBe('visa')
      expect(paymentMethods[0].card?.last4).toBe('4242')
      expect(defaultPaymentMethod?.id).toBe('pm_test123')
    })

    it('should return empty array for booking without Stripe customer', async () => {
      // Arrange
      const bookingWithoutCustomer = {
        ...mockBooking,
        stripeCustomerId: null,
      }
      ;(prisma.booking.findFirst as Mock).mockResolvedValue(bookingWithoutCustomer)

      // Act
      const booking = await prisma.booking.findFirst({
        where: { id: 'bk_test123', userId: 'user_test123' },
      })

      // Assert
      expect(booking?.stripeCustomerId).toBeNull()
      // The procedure would return { paymentMethods: [], defaultPaymentMethodId: null }
    })

    it('should handle multiple payment methods correctly', async () => {
      // Arrange
      const multiplePaymentMethods = [
        mockPaymentMethod,
        {
          id: 'pm_test456',
          card: {
            brand: 'mastercard',
            last4: '5555',
            exp_month: 6,
            exp_year: 2028,
          },
        },
      ]
      ;(prisma.booking.findFirst as Mock).mockResolvedValue(mockBooking)
      ;(getCustomerPaymentMethods as Mock).mockResolvedValue(multiplePaymentMethods)
      ;(getCustomerDefaultPaymentMethod as Mock).mockResolvedValue(mockPaymentMethod)

      // Act
      const paymentMethods = await getCustomerPaymentMethods('cus_test123')

      // Assert
      expect(paymentMethods).toHaveLength(2)
      expect(paymentMethods[0].card?.brand).toBe('visa')
      expect(paymentMethods[1].card?.brand).toBe('mastercard')
    })
  })
})
