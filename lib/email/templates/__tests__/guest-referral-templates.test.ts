/**
 * Guest Referral Email Templates Tests
 * Epic 10 - US-008: Unit Tests for Referral System
 *
 * Tests cover:
 * - Guest referral booking notification email
 * - Guest referral code generation email
 * - Guest referral completion bonus email
 */

import { describe, it, expect } from 'vitest';
import {
  generateGuestReferralBookingEmail,
  type GuestReferralBookingData,
} from '../guest-referral-booking';
import {
  generateGuestReferralCodeEmail,
  type GuestReferralCodeData,
} from '../guest-referral-code';
import {
  generateGuestReferralCompletionEmail,
  type GuestReferralCompletionData,
} from '../guest-referral-completion';

describe('Guest Referral Booking Email Template', () => {
  const mockData: GuestReferralBookingData = {
    referrerName: 'Susan Smith',
    referrerEmail: 'susan@example.com',
    guestName: 'Jane Doe',
    bookingReference: 'PBP-2026-123456',
    packageName: '14-Day Thailand Adventure',
    tripDates: {
      start: '2026-03-01T00:00:00.000Z',
      end: '2026-03-15T00:00:00.000Z',
    },
    totalValue: 1200000, // $12,000
    pointsEarned: 1000,
    newPointsBalance: 2500,
  };

  it('should generate email with correct subject', () => {
    const { subject } = generateGuestReferralBookingEmail(mockData);

    expect(subject).toContain('Just Booked');
    expect(subject).toContain('1,000');
  });

  it('should include referrer name in HTML content', () => {
    const { html } = generateGuestReferralBookingEmail(mockData);

    expect(html).toContain('Susan Smith');
  });

  it('should include guest name in HTML content', () => {
    const { html } = generateGuestReferralBookingEmail(mockData);

    expect(html).toContain('Jane Doe');
  });

  it('should include booking reference', () => {
    const { html } = generateGuestReferralBookingEmail(mockData);

    expect(html).toContain('PBP-2026-123456');
  });

  it('should include package name', () => {
    const { html } = generateGuestReferralBookingEmail(mockData);

    expect(html).toContain('14-Day Thailand Adventure');
  });

  it('should format booking value correctly', () => {
    const { html } = generateGuestReferralBookingEmail(mockData);

    expect(html).toContain('$12,000');
  });

  it('should include points earned', () => {
    const { html } = generateGuestReferralBookingEmail(mockData);

    expect(html).toContain('1,000');
  });

  it('should include new points balance', () => {
    const { html } = generateGuestReferralBookingEmail(mockData);

    expect(html).toContain('2,500');
  });

  it('should include dashboard link', () => {
    const { html } = generateGuestReferralBookingEmail(mockData);

    expect(html).toContain('/dashboard/referrals');
  });

  it('should generate plain text version', () => {
    const { text } = generateGuestReferralBookingEmail(mockData);

    expect(text).toContain('Susan Smith');
    expect(text).toContain('Jane Doe');
    expect(text).toContain('PBP-2026-123456');
    expect(text).toContain('$12,000');
  });

  it('should handle guest initials when name not available', () => {
    const dataWithInitials: GuestReferralBookingData = {
      ...mockData,
      guestName: undefined as any,
      guestInitials: 'J.D.',
    };

    const { html } = generateGuestReferralBookingEmail(dataWithInitials);

    expect(html).toContain('J.D.');
  });

  it('should format dates correctly', () => {
    const { html } = generateGuestReferralBookingEmail(mockData);

    expect(html).toContain('March');
    expect(html).toContain('2026');
  });

  it('should use custom dashboard URL when provided', () => {
    const dataWithCustomUrl: GuestReferralBookingData = {
      ...mockData,
      dashboardUrl: 'https://custom.example.com/dashboard',
    };

    const { html } = generateGuestReferralBookingEmail(dataWithCustomUrl);

    expect(html).toContain('https://custom.example.com/dashboard');
  });
});

describe('Guest Referral Code Email Template', () => {
  const mockData: GuestReferralCodeData = {
    guestName: 'Susan',
    referralCode: 'SUSAN-2026',
    shareableLink: 'https://thepickleballpassport.org/r/SUSAN-2026',
  };

  it('should generate email with correct subject', () => {
    const { subject } = generateGuestReferralCodeEmail(mockData);

    expect(subject).toContain('Referral Code');
    expect(subject).toContain('Ready');
  });

  it('should include guest name', () => {
    const { html } = generateGuestReferralCodeEmail(mockData);

    expect(html).toContain('Susan');
  });

  it('should include referral code prominently', () => {
    const { html } = generateGuestReferralCodeEmail(mockData);

    expect(html).toContain('SUSAN-2026');
  });

  it('should include shareable link', () => {
    const { html } = generateGuestReferralCodeEmail(mockData);

    expect(html).toContain('https://thepickleballpassport.org/r/SUSAN-2026');
  });

  it('should include how it works section', () => {
    const { html } = generateGuestReferralCodeEmail(mockData);

    expect(html).toContain('How It Works');
    expect(html).toContain('Share Your Link');
    expect(html).toContain('They Book a Trip');
    expect(html).toContain('Earn Rewards');
  });

  it('should include rewards breakdown', () => {
    const { html } = generateGuestReferralCodeEmail(mockData);

    expect(html).toContain('+100 points'); // Application
    expect(html).toContain('+1,000 points'); // Booking < $15K
    expect(html).toContain('+1,500 points'); // Booking >= $15K
    expect(html).toContain('+500 points'); // Completion
  });

  it('should include dashboard link', () => {
    const { html } = generateGuestReferralCodeEmail(mockData);

    expect(html).toContain('/dashboard/referrals');
  });

  it('should generate plain text version', () => {
    const { text } = generateGuestReferralCodeEmail(mockData);

    expect(text).toContain('Susan');
    expect(text).toContain('SUSAN-2026');
    expect(text).toContain('https://thepickleballpassport.org/r/SUSAN-2026');
  });

  it('should use custom dashboard URL when provided', () => {
    const dataWithCustomUrl: GuestReferralCodeData = {
      ...mockData,
      dashboardUrl: 'https://custom.example.com/referrals',
    };

    const { html } = generateGuestReferralCodeEmail(dataWithCustomUrl);

    expect(html).toContain('https://custom.example.com/referrals');
  });
});

describe('Guest Referral Completion Email Template', () => {
  const mockData: GuestReferralCompletionData = {
    referrerName: 'Susan Smith',
    referrerEmail: 'susan@example.com',
    guestName: 'Jane Doe',
    packageName: '14-Day Thailand Adventure',
    tripDates: {
      start: '2026-03-01T00:00:00.000Z',
      end: '2026-03-15T00:00:00.000Z',
    },
    bonusPointsEarned: 500,
    newPointsBalance: 3000,
  };

  it('should generate email with correct subject', () => {
    const { subject } = generateGuestReferralCompletionEmail(mockData);

    expect(subject).toContain('Trip Complete');
    expect(subject).toContain('500');
    expect(subject).toContain('Bonus');
  });

  it('should include referrer name', () => {
    const { html } = generateGuestReferralCompletionEmail(mockData);

    expect(html).toContain('Susan Smith');
  });

  it('should include guest name', () => {
    const { html } = generateGuestReferralCompletionEmail(mockData);

    expect(html).toContain('Jane Doe');
  });

  it('should include package name', () => {
    const { html } = generateGuestReferralCompletionEmail(mockData);

    expect(html).toContain('14-Day Thailand Adventure');
  });

  it('should include bonus points earned', () => {
    const { html } = generateGuestReferralCompletionEmail(mockData);

    expect(html).toContain('+500');
    expect(html).toContain('Bonus Points');
  });

  it('should include new points balance', () => {
    const { html } = generateGuestReferralCompletionEmail(mockData);

    expect(html).toContain('3,000');
  });

  it('should show completed status', () => {
    const { html } = generateGuestReferralCompletionEmail(mockData);

    expect(html).toContain('Completed');
  });

  it('should include dashboard link', () => {
    const { html } = generateGuestReferralCompletionEmail(mockData);

    expect(html).toContain('/dashboard/referrals');
  });

  it('should generate plain text version', () => {
    const { text } = generateGuestReferralCompletionEmail(mockData);

    expect(text).toContain('Susan Smith');
    expect(text).toContain('Jane Doe');
    expect(text).toContain('+500');
    expect(text).toContain('3,000');
  });

  it('should handle guest initials when name not available', () => {
    const dataWithInitials: GuestReferralCompletionData = {
      ...mockData,
      guestName: undefined as any,
      guestInitials: 'J.D.',
    };

    const { html } = generateGuestReferralCompletionEmail(dataWithInitials);

    expect(html).toContain('J.D.');
  });

  it('should format dates correctly', () => {
    const { html } = generateGuestReferralCompletionEmail(mockData);

    expect(html).toContain('March');
    expect(html).toContain('2026');
  });

  it('should use custom dashboard URL when provided', () => {
    const dataWithCustomUrl: GuestReferralCompletionData = {
      ...mockData,
      dashboardUrl: 'https://custom.example.com/dashboard',
    };

    const { html } = generateGuestReferralCompletionEmail(dataWithCustomUrl);

    expect(html).toContain('https://custom.example.com/dashboard');
  });
});
