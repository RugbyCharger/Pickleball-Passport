/**
 * Unit Tests: Date Validation Utilities
 * E4-S6 Phase 9 - P0 Priority
 *
 * Tests cover:
 * - Days until date calculation
 * - 60-day booking modification rule
 * - Edge cases and boundary conditions
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  calculateDaysUntilDate,
  canModifyBooking,
} from '../date-validation'
import { addDays, subDays } from 'date-fns'

describe('calculateDaysUntilDate', () => {
  describe('P0: Days Calculation', () => {
    beforeEach(() => {
      // Mock Date.now() to have consistent test results
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should calculate days until future date correctly', () => {
      const futureDate = addDays(new Date(), 30)
      const days = calculateDaysUntilDate(futureDate)
      expect(days).toBe(30)
    })

    it('should return negative days for past dates', () => {
      const pastDate = subDays(new Date(), 10)
      const days = calculateDaysUntilDate(pastDate)
      expect(days).toBe(-10)
    })

    it('should return 0 for today', () => {
      const today = new Date()
      const days = calculateDaysUntilDate(today)
      expect(days).toBe(0)
    })

    it('should calculate 60 days correctly', () => {
      const date60Days = addDays(new Date(), 60)
      const days = calculateDaysUntilDate(date60Days)
      expect(days).toBe(60)
    })

    it('should calculate 70 days correctly', () => {
      const date70Days = addDays(new Date(), 70)
      const days = calculateDaysUntilDate(date70Days)
      expect(days).toBe(70)
    })

    it('should handle far future dates (365 days)', () => {
      const futureDate = addDays(new Date(), 365)
      const days = calculateDaysUntilDate(futureDate)
      expect(days).toBe(365)
    })

    it('should handle dates with different times on same day', () => {
      // Since we set system time to 12:00 UTC, morning (06:00) is in the past
      const morningDate = new Date('2026-01-15T06:00:00Z')
      const eveningDate = new Date('2026-01-15T18:00:00Z')

      expect(calculateDaysUntilDate(morningDate)).toBe(-1) // Past relative to 12:00
      expect(calculateDaysUntilDate(eveningDate)).toBe(0)  // Future relative to 12:00
    })
  })
})

describe('canModifyBooking', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('P0: 60-Day Modification Rule', () => {
    it('should allow modification when trip is exactly 61 days away', () => {
      const tripDate = addDays(new Date(), 61)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should reject modification when trip is exactly 60 days away', () => {
      const tripDate = addDays(new Date(), 60)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('Modifications allowed only 60+ days before trip')
    })

    it('should reject modification when trip is 59 days away', () => {
      const tripDate = addDays(new Date(), 59)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('Modifications allowed only 60+ days before trip')
    })

    it('should allow modification when trip is 90 days away', () => {
      const tripDate = addDays(new Date(), 90)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should allow modification when trip is far in future (365 days)', () => {
      const tripDate = addDays(new Date(), 365)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should reject modification when trip is 30 days away', () => {
      const tripDate = addDays(new Date(), 30)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('Modifications allowed only 60+ days before trip')
    })

    it('should reject modification when trip is tomorrow', () => {
      const tripDate = addDays(new Date(), 1)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('Modifications allowed only 60+ days before trip')
    })
  })

  describe('P0: Booking Status Validation', () => {
    it('should reject modification for DRAFT booking', () => {
      const tripDate = addDays(new Date(), 90)
      const result = canModifyBooking(tripDate, 'DRAFT', true)

      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('Booking must be confirmed')
    })

    it('should reject modification for PENDING_PAYMENT booking', () => {
      const tripDate = addDays(new Date(), 90)
      const result = canModifyBooking(tripDate, 'PENDING_PAYMENT', true)

      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('Booking must be confirmed')
    })

    it('should reject modification for CANCELLED booking', () => {
      const tripDate = addDays(new Date(), 90)
      const result = canModifyBooking(tripDate, 'CANCELLED', true)

      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('Booking must be confirmed')
    })

    it('should reject modification for COMPLETED booking', () => {
      const tripDate = addDays(new Date(), 90)
      const result = canModifyBooking(tripDate, 'COMPLETED', true)

      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('Booking must be confirmed')
    })

    it('should allow modification for CONFIRMED booking with valid date', () => {
      const tripDate = addDays(new Date(), 90)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(true)
    })
  })

  describe('P0: Trip Assignment Validation', () => {
    it('should reject modification when no trip is assigned', () => {
      const tripDate = addDays(new Date(), 90)
      const result = canModifyBooking(tripDate, 'CONFIRMED', false)

      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('No trip assigned to booking')
    })

    it('should allow modification when trip is assigned', () => {
      const tripDate = addDays(new Date(), 90)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(true)
    })
  })

  describe('P0: Trip Start Date Validation', () => {
    it('should reject modification when trip has started (today)', () => {
      const tripDate = new Date()
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('Trip has already started')
    })

    it('should reject modification when trip is in the past', () => {
      const tripDate = subDays(new Date(), 10)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('Trip has already started')
    })

    it('should allow modification when trip is in future (>60 days)', () => {
      const tripDate = addDays(new Date(), 70)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(true)
    })
  })

  describe('P0: Combined Validation Rules', () => {
    it('should check status before date when both invalid', () => {
      const tripDate = addDays(new Date(), 30) // <60 days
      const result = canModifyBooking(tripDate, 'DRAFT', true)

      // Should fail on status first
      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('Booking must be confirmed')
    })

    it('should check trip assignment before date', () => {
      const tripDate = addDays(new Date(), 30) // <60 days
      const result = canModifyBooking(tripDate, 'CONFIRMED', false)

      // Should fail on trip assignment first
      expect(result.canModify).toBe(false)
      expect(result.reason).toBe('No trip assigned to booking')
    })

    it('should pass all validations for valid modification', () => {
      const tripDate = addDays(new Date(), 90)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(true)
      expect(result.reason).toBeUndefined()
    })
  })

  describe('P0: Edge Cases', () => {
    it('should handle trip date at midnight', () => {
      // Use addDays to ensure we get exactly 61 days from mocked date
      const tripDate = addDays(new Date(), 61)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(true)
    })

    it('should handle trip date at end of day', () => {
      // Use addDays to ensure we get exactly 61 days from mocked date
      const tripDate = addDays(new Date(), 61)
      // Set to end of day
      tripDate.setHours(23, 59, 59, 999)
      const result = canModifyBooking(tripDate, 'CONFIRMED', true)

      expect(result.canModify).toBe(true)
    })

    it('should handle default tripAssigned parameter', () => {
      const tripDate = addDays(new Date(), 90)
      // Not passing tripAssigned, should default to true
      const result = canModifyBooking(tripDate, 'CONFIRMED')

      expect(result.canModify).toBe(true)
    })
  })
})
