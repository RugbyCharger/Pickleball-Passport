import { test, expect } from '@playwright/test';
import {
  calculateInstallments,
  calculateFullPaymentDiscount,
  calculateInstallmentDates,
} from '../../src/lib/utils/installment-calculator';

/**
 * Unit Tests: Installment Payment Calculator
 *
 * Tests the core installment calculation logic for INSTALLMENT_4 plan:
 * - First installment: 50% (due at booking)
 * - Second installment: 25% (45 days before trip)
 * - Third installment: 15% (30 days before trip)
 * - Fourth installment: 10% (14 days before trip)
 *
 * Risk Coverage:
 * - R-001: Installment rounding errors (Score 9 - Critical)
 *
 * Priority: P0 (Critical) - Run on every commit
 */

test.describe('Installment Calculator - Amount Splitting', () => {
  test('should calculate installments for small amount ($10.00)', async () => {
    // GIVEN: Booking total is $10.00
    const totalCents = 1000; // $10.00 in cents

    // WHEN: Calculating installment amounts
    const installments = calculateInstallments(totalCents);

    // THEN: Amounts split correctly (50% / 25% / 15% / 10%)
    expect(installments.first).toBe(500); // 50% = $5.00
    expect(installments.second).toBe(250); // 25% = $2.50
    expect(installments.third).toBe(150); // 15% = $1.50
    expect(installments.fourth).toBe(100); // 10% = $1.00
  });

  test('should calculate installments for typical amount ($5,000.00)', async () => {
    // GIVEN: Booking total is $5,000.00
    const totalCents = 500000;

    // WHEN: Calculating installment amounts
    const installments = calculateInstallments(totalCents);

    // THEN: Amounts split correctly
    expect(installments.first).toBe(250000); // 50% = $2,500.00
    expect(installments.second).toBe(125000); // 25% = $1,250.00
    expect(installments.third).toBe(75000); // 15% = $750.00
    expect(installments.fourth).toBe(50000); // 10% = $500.00
  });

  test('should calculate installments for large amount ($15,385.67)', async () => {
    // GIVEN: Booking total is $15,385.67 (odd amount requiring rounding)
    const totalCents = 1538567;

    // WHEN: Calculating installment amounts
    const installments = calculateInstallments(totalCents);

    // THEN: Amounts split with proper rounding
    expect(installments.first).toBe(769284); // 50% = $7,692.84 (rounded up)
    expect(installments.second).toBe(384641); // 25% = $3,846.41 (rounded down)
    expect(installments.third).toBe(230785); // 15% = $2,307.85 (rounded down)
    expect(installments.fourth).toBe(153857); // 10% = $1,538.57 (rounded up)
  });

  test('should calculate installments for amount with 1 cent ($0.01)', async () => {
    // GIVEN: Booking total is $0.01 (edge case - minimum amount)
    const totalCents = 1;

    // WHEN: Calculating installment amounts
    const installments = calculateInstallments(totalCents);

    // THEN: All cents allocated (no loss due to rounding)
    expect(installments.first).toBe(1); // 50% rounds to 1 cent
    expect(installments.second).toBe(0); // 25% rounds to 0
    expect(installments.third).toBe(0); // 15% rounds to 0
    expect(installments.fourth).toBe(0); // 10% rounds to 0
  });

  test('should ensure installment sum equals exact total (no rounding errors)', async () => {
    // GIVEN: Various booking amounts
    const testAmounts = [
      1000, // $10.00
      500000, // $5,000.00
      1538567, // $15,385.67
      999, // $9.99
      123456, // $1,234.56
    ];

    for (const totalCents of testAmounts) {
      // WHEN: Calculating installments
      const installments = calculateInstallments(totalCents);

      // THEN: Sum of installments equals exact total (critical!)
      const sum =
        installments.first +
        installments.second +
        installments.third +
        installments.fourth;

      expect(sum).toBe(totalCents);
      expect(installments.total).toBe(totalCents);
    }
  });
});

test.describe('2% Discount Calculator - FULL Payment', () => {
  test('should calculate 2% discount for typical amount ($5,000.00)', async () => {
    // GIVEN: Booking total is $5,000.00
    const totalCents = 500000;

    // WHEN: Calculating FULL payment discount
    const result = calculateFullPaymentDiscount(totalCents);

    // THEN: 2% discount applied correctly
    expect(result.originalAmount).toBe(500000); // $5,000.00
    expect(result.discountAmount).toBe(10000); // 2% = $100.00
    expect(result.finalAmount).toBe(490000); // $4,900.00
  });

  test('should calculate 2% discount with rounding for odd amount ($1,234.56)', async () => {
    // GIVEN: Booking total is $1,234.56
    const totalCents = 123456;

    // WHEN: Calculating FULL payment discount
    const result = calculateFullPaymentDiscount(totalCents);

    // THEN: 2% discount rounds correctly
    expect(result.originalAmount).toBe(123456); // $1,234.56
    expect(result.discountAmount).toBe(2469); // 2% = $24.69 (rounded down)
    expect(result.finalAmount).toBe(120987); // $1,209.87
  });

  test('should ensure discount never exceeds 2%', async () => {
    // GIVEN: Various booking amounts
    const testAmounts = [
      100, // $1.00
      1000, // $10.00
      50000, // $500.00
      123456, // $1,234.56
      1000000, // $10,000.00
    ];

    for (const totalCents of testAmounts) {
      // WHEN: Calculating discount
      const result = calculateFullPaymentDiscount(totalCents);

      // THEN: Discount is at most 2% of original amount
      const maxDiscount = Math.floor(totalCents * 0.02);
      expect(result.discountAmount).toBeLessThanOrEqual(maxDiscount);

      // AND: Final amount is original minus discount
      expect(result.finalAmount).toBe(
        result.originalAmount - result.discountAmount
      );
    }
  });
});

test.describe('Date Calculation - Installment Due Dates', () => {
  test('should calculate installment dates for leap year trip (Feb 29)', async () => {
    // GIVEN: Trip starts on Feb 29, 2028 (leap year)
    const tripStart = new Date('2028-02-29T00:00:00Z');

    // WHEN: Calculating installment due dates
    const dates = calculateInstallmentDates(tripStart);

    // THEN: Dates calculated correctly accounting for leap year
    expect(dates.second.toISOString().split('T')[0]).toBe('2028-01-15'); // 45 days before
    expect(dates.third.toISOString().split('T')[0]).toBe('2028-01-30'); // 30 days before
    expect(dates.fourth.toISOString().split('T')[0]).toBe('2028-02-15'); // 14 days before
  });
});
