/**
 * Unit Tests: Installment Calculator
 * E4-S6 Phase 9 - P0 Priority
 *
 * Tests cover:
 * - R-001: Installment rounding errors (Risk Score: 9)
 * - R-003: 2% discount not applied (Risk Score: 6)
 * - Installment percentage calculations (50%, 25%, 15%, 10%)
 * - Date calculations (60d, 30d, 7d before trip)
 * - 70-day eligibility rule
 */

import { describe, it, expect } from 'vitest'
import {
  calculateInstallmentAmounts,
  calculateInstallmentDates,
  canUseInstallmentPlan,
  calculateFullPaymentDiscount,
  validateInstallmentSum,
  formatCentsAsDollars,
} from '../installment-calculator'
import { addDays, subDays } from 'date-fns'

describe('calculateInstallmentAmounts', () => {
  describe('P0: Rounding Validation (R-001)', () => {
    it('should calculate exact amounts for $5,000 trip', () => {
      const total = 500000 // $5,000.00
      const installments = calculateInstallmentAmounts(total)

      expect(installments).toHaveLength(4)
      expect(installments[0]).toBe(250000) // 50% = $2,500.00
      expect(installments[1]).toBe(125000) // 25% = $1,250.00
      expect(installments[2]).toBe(75000)  // 15% = $750.00
      expect(installments[3]).toBe(50000)  // 10% = $500.00

      // Verify exact sum
      expect(validateInstallmentSum(installments, total)).toBe(true)
    })

    it('should handle rounding for odd amounts ($5,001)', () => {
      const total = 500100 // $5,001.00
      const installments = calculateInstallmentAmounts(total)

      expect(installments[0]).toBe(250050) // 50% = $2,500.50
      expect(installments[1]).toBe(125025) // 25% = $1,250.25
      expect(installments[2]).toBe(75015)  // 15% = $750.15
      expect(installments[3]).toBe(50010)  // 10% = $500.10 (adjusted)

      // Must sum to exact total
      expect(validateInstallmentSum(installments, total)).toBe(true)
    })

    it('should handle rounding for $4,999', () => {
      const total = 499900 // $4,999.00
      const installments = calculateInstallmentAmounts(total)

      expect(installments[0]).toBe(249950) // 50% = $2,499.50
      expect(installments[1]).toBe(124975) // 25% = $1,249.75
      expect(installments[2]).toBe(74985)  // 15% = $749.85
      expect(installments[3]).toBe(49990)  // 10% = $499.90 (adjusted)

      expect(validateInstallmentSum(installments, total)).toBe(true)
    })

    it('should handle $1 total without errors', () => {
      const total = 1 // $0.01
      const installments = calculateInstallmentAmounts(total)

      expect(installments[0]).toBe(1)  // 50% rounds to 1 cent
      expect(installments[1]).toBe(0)  // 25% rounds to 0
      expect(installments[2]).toBe(0)  // 15% rounds to 0
      expect(installments[3]).toBe(0)  // 10% adjusted to 0

      expect(validateInstallmentSum(installments, total)).toBe(true)
    })

    it('should handle $100 total', () => {
      const total = 10000 // $100.00
      const installments = calculateInstallmentAmounts(total)

      expect(installments[0]).toBe(5000)  // 50% = $50.00
      expect(installments[1]).toBe(2500)  // 25% = $25.00
      expect(installments[2]).toBe(1500)  // 15% = $15.00
      expect(installments[3]).toBe(1000)  // 10% = $10.00

      expect(validateInstallmentSum(installments, total)).toBe(true)
    })

    it('should handle large amounts ($50,000)', () => {
      const total = 5000000 // $50,000.00
      const installments = calculateInstallmentAmounts(total)

      expect(installments[0]).toBe(2500000) // 50% = $25,000.00
      expect(installments[1]).toBe(1250000) // 25% = $12,500.00
      expect(installments[2]).toBe(750000)  // 15% = $7,500.00
      expect(installments[3]).toBe(500000)  // 10% = $5,000.00

      expect(validateInstallmentSum(installments, total)).toBe(true)
    })

    it('should adjust last installment for rounding errors', () => {
      // Test a value that causes rounding issues
      const total = 333333 // $3,333.33
      const installments = calculateInstallmentAmounts(total)

      const installment1 = Math.round(333333 * 0.50) // 166667
      const installment2 = Math.round(333333 * 0.25) // 83333
      const installment3 = Math.round(333333 * 0.15) // 50000
      const installment4 = 333333 - installment1 - installment2 - installment3 // 33333 (adjusted)

      expect(installments[0]).toBe(installment1)
      expect(installments[1]).toBe(installment2)
      expect(installments[2]).toBe(installment3)
      expect(installments[3]).toBe(installment4)

      expect(validateInstallmentSum(installments, total)).toBe(true)
    })
  })

  describe('P0: Percentage Accuracy', () => {
    it('should maintain correct percentages for $10,000', () => {
      const total = 1000000 // $10,000.00
      const installments = calculateInstallmentAmounts(total)

      // Check percentages (allowing for rounding)
      expect(installments[0]).toBe(500000) // Exactly 50%
      expect(installments[1]).toBe(250000) // Exactly 25%
      expect(installments[2]).toBe(150000) // Exactly 15%
      expect(installments[3]).toBe(100000) // Exactly 10%

      expect(validateInstallmentSum(installments, total)).toBe(true)
    })

    it('should always sum to 100% of total', () => {
      const testAmounts = [100, 500, 1234, 9999, 500000, 1000000, 5000000]

      testAmounts.forEach((total) => {
        const installments = calculateInstallmentAmounts(total)
        const sum = installments.reduce((acc, amt) => acc + amt, 0)
        expect(sum).toBe(total)
      })
    })
  })
})

describe('calculateInstallmentDates', () => {
  describe('P0: Date Calculations', () => {
    it('should calculate correct dates for trip in 90 days', () => {
      const tripStartDate = addDays(new Date(), 90)
      const dates = calculateInstallmentDates(tripStartDate)

      // Date 1: Today (within 1 minute tolerance)
      const now = new Date()
      const timeDiff = Math.abs(dates.first.getTime() - now.getTime())
      expect(timeDiff).toBeLessThan(60000) // Less than 1 minute

      // Date 2: 60 days before trip
      const expected60Days = subDays(tripStartDate, 60)
      expect(dates.second.toDateString()).toBe(expected60Days.toDateString())

      // Date 3: 30 days before trip
      const expected30Days = subDays(tripStartDate, 30)
      expect(dates.third.toDateString()).toBe(expected30Days.toDateString())

      // Date 4: 7 days before trip
      const expected7Days = subDays(tripStartDate, 7)
      expect(dates.fourth.toDateString()).toBe(expected7Days.toDateString())
    })

    it('should calculate dates for trip exactly 70 days away', () => {
      const tripStartDate = addDays(new Date(), 70)
      const dates = calculateInstallmentDates(tripStartDate)

      expect(dates.second).toEqual(subDays(tripStartDate, 60))
      expect(dates.third).toEqual(subDays(tripStartDate, 30))
      expect(dates.fourth).toEqual(subDays(tripStartDate, 7))
    })

    it('should handle trip far in the future (365 days)', () => {
      const tripStartDate = addDays(new Date(), 365)
      const dates = calculateInstallmentDates(tripStartDate)

      expect(dates.second).toEqual(subDays(tripStartDate, 60))
      expect(dates.third).toEqual(subDays(tripStartDate, 30))
      expect(dates.fourth).toEqual(subDays(tripStartDate, 7))
    })
  })
})

describe('canUseInstallmentPlan', () => {
  describe('P0: 70-Day Eligibility Rule', () => {
    it('should allow installments for trip exactly 70 days away', () => {
      const tripStartDate = addDays(new Date(), 70)
      expect(canUseInstallmentPlan(tripStartDate)).toBe(true)
    })

    it('should allow installments for trip 71+ days away', () => {
      const tripStartDate = addDays(new Date(), 71)
      expect(canUseInstallmentPlan(tripStartDate)).toBe(true)
    })

    it('should allow installments for trip 90 days away', () => {
      const tripStartDate = addDays(new Date(), 90)
      expect(canUseInstallmentPlan(tripStartDate)).toBe(true)
    })

    it('should reject installments for trip 69 days away', () => {
      const tripStartDate = addDays(new Date(), 69)
      expect(canUseInstallmentPlan(tripStartDate)).toBe(false)
    })

    it('should reject installments for trip 30 days away', () => {
      const tripStartDate = addDays(new Date(), 30)
      expect(canUseInstallmentPlan(tripStartDate)).toBe(false)
    })

    it('should reject installments for trip tomorrow', () => {
      const tripStartDate = addDays(new Date(), 1)
      expect(canUseInstallmentPlan(tripStartDate)).toBe(false)
    })

    it('should reject installments for trip today', () => {
      const tripStartDate = new Date()
      expect(canUseInstallmentPlan(tripStartDate)).toBe(false)
    })

    it('should reject installments for past trip', () => {
      const tripStartDate = subDays(new Date(), 10)
      expect(canUseInstallmentPlan(tripStartDate)).toBe(false)
    })
  })
})

describe('calculateFullPaymentDiscount', () => {
  describe('P0: 2% Discount Calculation (R-003)', () => {
    it('should calculate 2% discount for $5,000', () => {
      const total = 500000 // $5,000.00
      const result = calculateFullPaymentDiscount(total)

      expect(result.discount).toBe(10000) // 2% = $100.00
      expect(result.discountedTotal).toBe(490000) // $4,900.00
      expect(result.discount + result.discountedTotal).toBe(total)
    })

    it('should calculate 2% discount for $10,000', () => {
      const total = 1000000 // $10,000.00
      const result = calculateFullPaymentDiscount(total)

      expect(result.discount).toBe(20000) // 2% = $200.00
      expect(result.discountedTotal).toBe(980000) // $9,800.00
      expect(result.discount + result.discountedTotal).toBe(total)
    })

    it('should round discount correctly for odd amounts', () => {
      const total = 500001 // $5,000.01
      const result = calculateFullPaymentDiscount(total)

      expect(result.discount).toBe(10000) // 2% = $100.00 (rounded)
      expect(result.discountedTotal).toBe(490001) // $4,900.01
      expect(result.discount + result.discountedTotal).toBe(total)
    })

    it('should handle small amounts ($1)', () => {
      const total = 100 // $1.00
      const result = calculateFullPaymentDiscount(total)

      expect(result.discount).toBe(2) // 2% = $0.02
      expect(result.discountedTotal).toBe(98) // $0.98
      expect(result.discount + result.discountedTotal).toBe(total)
    })

    it('should handle $0.01', () => {
      const total = 1 // $0.01
      const result = calculateFullPaymentDiscount(total)

      expect(result.discount).toBe(0) // 2% rounds to $0.00
      expect(result.discountedTotal).toBe(1) // $0.01
      expect(result.discount + result.discountedTotal).toBe(total)
    })

    it('should handle large amounts ($50,000)', () => {
      const total = 5000000 // $50,000.00
      const result = calculateFullPaymentDiscount(total)

      expect(result.discount).toBe(100000) // 2% = $1,000.00
      expect(result.discountedTotal).toBe(4900000) // $49,000.00
      expect(result.discount + result.discountedTotal).toBe(total)
    })

    it('should always sum discount + discounted total to original', () => {
      const testAmounts = [100, 500, 1234, 9999, 500000, 1000000, 5000000]

      testAmounts.forEach((total) => {
        const result = calculateFullPaymentDiscount(total)
        expect(result.discount + result.discountedTotal).toBe(total)
      })
    })
  })
})

describe('validateInstallmentSum', () => {
  it('should return true when sum matches total', () => {
    const installments = [250000, 125000, 75000, 50000]
    expect(validateInstallmentSum(installments, 500000)).toBe(true)
  })

  it('should return false when sum does not match total', () => {
    const installments = [250000, 125000, 75000, 50000]
    expect(validateInstallmentSum(installments, 500001)).toBe(false)
  })

  it('should return true for empty array and zero total', () => {
    expect(validateInstallmentSum([], 0)).toBe(true)
  })
})

describe('formatCentsAsDollars', () => {
  it('should format $5,000.00 correctly', () => {
    expect(formatCentsAsDollars(500000)).toBe('$5,000.00')
  })

  it('should format $10,000.00 correctly', () => {
    expect(formatCentsAsDollars(1000000)).toBe('$10,000.00')
  })

  it('should format $0.01 correctly', () => {
    expect(formatCentsAsDollars(1)).toBe('$0.01')
  })

  it('should format $1.00 correctly', () => {
    expect(formatCentsAsDollars(100)).toBe('$1.00')
  })

  it('should format $123.45 correctly', () => {
    expect(formatCentsAsDollars(12345)).toBe('$123.45')
  })
})
