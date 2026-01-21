/**
 * Guest Referral Points Configuration Tests
 * Epic 10 - US-008: Unit Tests for Referral System
 *
 * Tests cover:
 * - Guest referral points configuration values
 * - calculateGuestReferralPoints helper function
 * - Points thresholds and boundaries
 */

import { describe, it, expect } from 'vitest';
import {
  GUEST_REFERRAL_POINTS_CONFIG,
  calculateGuestReferralPoints,
} from '../business-constants';

describe('Guest Referral Points Configuration', () => {
  describe('Configuration values', () => {
    it('should have correct standard points value', () => {
      expect(GUEST_REFERRAL_POINTS_CONFIG.STANDARD_POINTS).toBe(1000);
    });

    it('should have correct high-value points value', () => {
      expect(GUEST_REFERRAL_POINTS_CONFIG.HIGH_VALUE_POINTS).toBe(1500);
    });

    it('should have correct high-value threshold (in cents)', () => {
      // $15,000 = 1,500,000 cents
      expect(GUEST_REFERRAL_POINTS_CONFIG.HIGH_VALUE_THRESHOLD).toBe(1500000);
    });

    it('should have correct completion bonus points', () => {
      expect(GUEST_REFERRAL_POINTS_CONFIG.COMPLETION_BONUS_POINTS).toBe(500);
    });
  });

  describe('calculateGuestReferralPoints', () => {
    describe('Standard tier (under $15K)', () => {
      it('should return 1000 points for $5,000 booking', () => {
        const points = calculateGuestReferralPoints(500000); // $5,000
        expect(points).toBe(1000);
      });

      it('should return 1000 points for $10,000 booking', () => {
        const points = calculateGuestReferralPoints(1000000); // $10,000
        expect(points).toBe(1000);
      });

      it('should return 1000 points for $14,999 booking', () => {
        const points = calculateGuestReferralPoints(1499900); // $14,999
        expect(points).toBe(1000);
      });

      it('should return 1000 points for $0 booking', () => {
        const points = calculateGuestReferralPoints(0);
        expect(points).toBe(1000);
      });

      it('should return 1000 points for $1 booking', () => {
        const points = calculateGuestReferralPoints(100); // $1
        expect(points).toBe(1000);
      });
    });

    describe('High-value tier ($15K and above)', () => {
      it('should return 1500 points for exactly $15,000 booking', () => {
        const points = calculateGuestReferralPoints(1500000); // $15,000
        expect(points).toBe(1500);
      });

      it('should return 1500 points for $15,001 booking', () => {
        const points = calculateGuestReferralPoints(1500100); // $15,001
        expect(points).toBe(1500);
      });

      it('should return 1500 points for $20,000 booking', () => {
        const points = calculateGuestReferralPoints(2000000); // $20,000
        expect(points).toBe(1500);
      });

      it('should return 1500 points for $50,000 booking', () => {
        const points = calculateGuestReferralPoints(5000000); // $50,000
        expect(points).toBe(1500);
      });

      it('should return 1500 points for very large booking', () => {
        const points = calculateGuestReferralPoints(10000000); // $100,000
        expect(points).toBe(1500);
      });
    });

    describe('Boundary conditions', () => {
      it('should return 1000 points at $14,999.99', () => {
        const points = calculateGuestReferralPoints(1499999); // $14,999.99
        expect(points).toBe(1000);
      });

      it('should return 1500 points at exactly threshold', () => {
        const points = calculateGuestReferralPoints(
          GUEST_REFERRAL_POINTS_CONFIG.HIGH_VALUE_THRESHOLD
        );
        expect(points).toBe(1500);
      });

      it('should return 1000 points one cent below threshold', () => {
        const points = calculateGuestReferralPoints(
          GUEST_REFERRAL_POINTS_CONFIG.HIGH_VALUE_THRESHOLD - 1
        );
        expect(points).toBe(1000);
      });

      it('should return 1500 points one cent above threshold', () => {
        const points = calculateGuestReferralPoints(
          GUEST_REFERRAL_POINTS_CONFIG.HIGH_VALUE_THRESHOLD + 1
        );
        expect(points).toBe(1500);
      });
    });

    describe('Real-world scenarios', () => {
      it('should handle 7-day trip package ($3,500)', () => {
        const points = calculateGuestReferralPoints(350000);
        expect(points).toBe(1000);
      });

      it('should handle 10-day trip package ($5,000)', () => {
        const points = calculateGuestReferralPoints(500000);
        expect(points).toBe(1000);
      });

      it('should handle 14-day trip package ($7,000)', () => {
        const points = calculateGuestReferralPoints(700000);
        expect(points).toBe(1000);
      });

      it('should handle 21-day trip package ($10,500)', () => {
        const points = calculateGuestReferralPoints(1050000);
        expect(points).toBe(1000);
      });

      it('should handle ultra-luxury package ($18,000)', () => {
        const points = calculateGuestReferralPoints(1800000);
        expect(points).toBe(1500);
      });

      it('should handle villa package with add-ons ($25,000)', () => {
        const points = calculateGuestReferralPoints(2500000);
        expect(points).toBe(1500);
      });
    });
  });

  describe('Points value proposition', () => {
    it('should have meaningful point differential between tiers', () => {
      const standardPoints = GUEST_REFERRAL_POINTS_CONFIG.STANDARD_POINTS;
      const highValuePoints = GUEST_REFERRAL_POINTS_CONFIG.HIGH_VALUE_POINTS;
      const differential = highValuePoints - standardPoints;

      // 50% more for high-value bookings
      expect(differential).toBe(500);
      expect(highValuePoints / standardPoints).toBe(1.5);
    });

    it('should have reasonable completion bonus', () => {
      const completionBonus = GUEST_REFERRAL_POINTS_CONFIG.COMPLETION_BONUS_POINTS;
      const standardPoints = GUEST_REFERRAL_POINTS_CONFIG.STANDARD_POINTS;

      // Completion bonus is 50% of standard booking points
      expect(completionBonus).toBe(500);
      expect(completionBonus / standardPoints).toBe(0.5);
    });

    it('should calculate total potential points for standard referral', () => {
      const bookingPoints = GUEST_REFERRAL_POINTS_CONFIG.STANDARD_POINTS;
      const completionBonus = GUEST_REFERRAL_POINTS_CONFIG.COMPLETION_BONUS_POINTS;
      const applicationPoints = 100; // From US-002

      const totalPotential = bookingPoints + completionBonus + applicationPoints;
      expect(totalPotential).toBe(1600);
    });

    it('should calculate total potential points for high-value referral', () => {
      const bookingPoints = GUEST_REFERRAL_POINTS_CONFIG.HIGH_VALUE_POINTS;
      const completionBonus = GUEST_REFERRAL_POINTS_CONFIG.COMPLETION_BONUS_POINTS;
      const applicationPoints = 100; // From US-002

      const totalPotential = bookingPoints + completionBonus + applicationPoints;
      expect(totalPotential).toBe(2100);
    });
  });
});
