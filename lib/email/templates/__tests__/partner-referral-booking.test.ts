/**
 * Partner Referral Booking Email Template Tests
 * E11-S9: Partner Notification System
 */

import { describe, it, expect } from 'vitest'
import { generatePartnerReferralBookingEmail, type PartnerReferralBookingData } from '../partner-referral-booking'

describe('Partner Referral Booking Email Template', () => {
  const mockData: PartnerReferralBookingData = {
    partnerName: 'John Smith',
    partnerEmail: 'john@example.com',
    guestName: 'Jane Doe',
    bookingReference: 'BOOK-12345',
    packageName: '14-Day Wellness & Pickleball Adventure',
    tripDates: {
      start: '2025-03-01T00:00:00.000Z',
      end: '2025-03-15T00:00:00.000Z',
    },
    totalValue: 850000, // $8,500
    pointsEarned: 850,
    newPointsBalance: 2500,
    currentTier: 'SILVER',
    bookingsUntilNextTier: 3,
    nextTier: 'Gold',
  }

  it('should generate email with correct subject', () => {
    const { subject } = generatePartnerReferralBookingEmail(mockData)

    expect(subject).toContain('Jane Doe')
    expect(subject).toContain('Just Booked')
    expect(subject).toContain('850')
  })

  it('should generate HTML content with partner name', () => {
    const { html } = generatePartnerReferralBookingEmail(mockData)

    expect(html).toContain('John Smith')
  })

  it('should include booking details in HTML', () => {
    const { html } = generatePartnerReferralBookingEmail(mockData)

    expect(html).toContain('Jane Doe')
    expect(html).toContain('BOOK-12345')
    expect(html).toContain('14-Day Wellness & Pickleball Adventure')
    expect(html).toContain('$8,500')
  })

  it('should include points earned and balance', () => {
    const { html } = generatePartnerReferralBookingEmail(mockData)

    expect(html).toContain('850')
    expect(html).toContain('2,500')
  })

  it('should show tier progress when bookings until next tier provided', () => {
    const { html } = generatePartnerReferralBookingEmail(mockData)

    expect(html).toContain('3 bookings away from Gold')
  })

  it('should not show tier progress for Platinum tier', () => {
    const platinumData = {
      ...mockData,
      currentTier: 'PLATINUM',
      bookingsUntilNextTier: undefined,
      nextTier: undefined,
    }

    const { html } = generatePartnerReferralBookingEmail(platinumData)

    expect(html).toContain('Platinum')
    expect(html).not.toContain('bookings away')
  })

  it('should generate plain text version', () => {
    const { text } = generatePartnerReferralBookingEmail(mockData)

    expect(text).toContain('John Smith')
    expect(text).toContain('Jane Doe')
    expect(text).toContain('BOOK-12345')
    expect(text).toContain('$8,500')
    expect(text).toContain('850')
  })

  it('should handle guest initials when name not available', () => {
    const dataWithInitials = {
      ...mockData,
      guestName: undefined as any,
      guestInitials: 'J.D.',
    }

    const { html } = generatePartnerReferralBookingEmail(dataWithInitials)

    expect(html).toContain('J.D.')
  })

  it('should format dates correctly', () => {
    const { html } = generatePartnerReferralBookingEmail(mockData)

    expect(html).toContain('March')
    expect(html).toContain('2025')
  })

  it('should include CTA link to dashboard', () => {
    const { html } = generatePartnerReferralBookingEmail(mockData)

    expect(html).toContain('/partners/dashboard')
    expect(html).toContain('View Your Dashboard')
  })

  it('should use custom dashboard URL when provided', () => {
    const dataWithCustomUrl = {
      ...mockData,
      dashboardUrl: 'https://custom.com/dashboard',
    }

    const { html } = generatePartnerReferralBookingEmail(dataWithCustomUrl)

    expect(html).toContain('https://custom.com/dashboard')
  })
})
