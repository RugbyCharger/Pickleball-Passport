/**
 * Currency Service Tests
 * E4-S13: Multi-Currency Support
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
  CURRENCY_OPTIONS,
  formatCurrency,
  getCurrencySymbol,
  isSupportedCurrency,
  toStripeCurrency,
  fromStripeCurrency,
  getMinimumChargeAmount,
  meetsMinimumCharge,
  convertAmountSync,
} from '../currency'

describe('Currency Service', () => {
  describe('SUPPORTED_CURRENCIES', () => {
    it('should have 5 supported currencies', () => {
      expect(Object.keys(SUPPORTED_CURRENCIES)).toHaveLength(5)
    })

    it('should include USD, EUR, GBP, CAD, AUD', () => {
      expect(SUPPORTED_CURRENCIES.USD).toBeDefined()
      expect(SUPPORTED_CURRENCIES.EUR).toBeDefined()
      expect(SUPPORTED_CURRENCIES.GBP).toBeDefined()
      expect(SUPPORTED_CURRENCIES.CAD).toBeDefined()
      expect(SUPPORTED_CURRENCIES.AUD).toBeDefined()
    })

    it('should have correct symbols', () => {
      expect(SUPPORTED_CURRENCIES.USD.symbol).toBe('$')
      expect(SUPPORTED_CURRENCIES.EUR.symbol).toBe('\u20AC')
      expect(SUPPORTED_CURRENCIES.GBP.symbol).toBe('\u00A3')
      expect(SUPPORTED_CURRENCIES.CAD.symbol).toBe('C$')
      expect(SUPPORTED_CURRENCIES.AUD.symbol).toBe('A$')
    })
  })

  describe('DEFAULT_CURRENCY', () => {
    it('should be USD', () => {
      expect(DEFAULT_CURRENCY).toBe('USD')
    })
  })

  describe('CURRENCY_OPTIONS', () => {
    it('should have 5 currency options', () => {
      expect(CURRENCY_OPTIONS).toHaveLength(5)
    })

    it('should have code, symbol, name, and flag for each option', () => {
      CURRENCY_OPTIONS.forEach((option) => {
        expect(option.code).toBeDefined()
        expect(option.symbol).toBeDefined()
        expect(option.name).toBeDefined()
        expect(option.flag).toBeDefined()
      })
    })
  })

  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      expect(formatCurrency(150000, 'USD')).toMatch(/^\$1,500/)
    })

    it('should format EUR correctly', () => {
      const result = formatCurrency(150000, 'EUR')
      expect(result).toMatch(/1,500/)
    })

    it('should format GBP correctly', () => {
      const result = formatCurrency(150000, 'GBP')
      expect(result).toMatch(/1,500/)
    })

    it('should handle cents correctly', () => {
      expect(formatCurrency(99, 'USD')).toMatch(/\$0\.99/)
    })

    it('should hide decimals for whole numbers', () => {
      expect(formatCurrency(100000, 'USD')).toBe('$1,000')
    })

    it('should default to USD if no currency specified', () => {
      expect(formatCurrency(150000)).toMatch(/^\$1,500/)
    })
  })

  describe('getCurrencySymbol', () => {
    it('should return correct symbol for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$')
    })

    it('should return correct symbol for EUR', () => {
      expect(getCurrencySymbol('EUR')).toBe('\u20AC')
    })

    it('should return correct symbol for GBP', () => {
      expect(getCurrencySymbol('GBP')).toBe('\u00A3')
    })

    it('should return correct symbol for CAD', () => {
      expect(getCurrencySymbol('CAD')).toBe('C$')
    })

    it('should return correct symbol for AUD', () => {
      expect(getCurrencySymbol('AUD')).toBe('A$')
    })
  })

  describe('isSupportedCurrency', () => {
    it('should return true for supported currencies', () => {
      expect(isSupportedCurrency('USD')).toBe(true)
      expect(isSupportedCurrency('EUR')).toBe(true)
      expect(isSupportedCurrency('GBP')).toBe(true)
      expect(isSupportedCurrency('CAD')).toBe(true)
      expect(isSupportedCurrency('AUD')).toBe(true)
    })

    it('should return false for unsupported currencies', () => {
      expect(isSupportedCurrency('JPY')).toBe(false)
      expect(isSupportedCurrency('CNY')).toBe(false)
      expect(isSupportedCurrency('XYZ')).toBe(false)
    })

    it('should return false for invalid inputs', () => {
      expect(isSupportedCurrency('')).toBe(false)
      expect(isSupportedCurrency('usd')).toBe(false) // Case sensitive
    })
  })

  describe('toStripeCurrency', () => {
    it('should convert to lowercase for Stripe', () => {
      expect(toStripeCurrency('USD')).toBe('usd')
      expect(toStripeCurrency('EUR')).toBe('eur')
      expect(toStripeCurrency('GBP')).toBe('gbp')
    })
  })

  describe('fromStripeCurrency', () => {
    it('should convert from Stripe lowercase to uppercase', () => {
      expect(fromStripeCurrency('usd')).toBe('USD')
      expect(fromStripeCurrency('eur')).toBe('EUR')
      expect(fromStripeCurrency('gbp')).toBe('GBP')
    })

    it('should default to USD for unsupported currencies', () => {
      expect(fromStripeCurrency('jpy')).toBe('USD')
      expect(fromStripeCurrency('xyz')).toBe('USD')
    })
  })

  describe('getMinimumChargeAmount', () => {
    it('should return correct minimum for USD', () => {
      expect(getMinimumChargeAmount('USD')).toBe(50) // $0.50
    })

    it('should return correct minimum for EUR', () => {
      expect(getMinimumChargeAmount('EUR')).toBe(50)
    })

    it('should return correct minimum for GBP', () => {
      expect(getMinimumChargeAmount('GBP')).toBe(30)
    })

    it('should return correct minimum for CAD', () => {
      expect(getMinimumChargeAmount('CAD')).toBe(50)
    })

    it('should return correct minimum for AUD', () => {
      expect(getMinimumChargeAmount('AUD')).toBe(50)
    })
  })

  describe('meetsMinimumCharge', () => {
    it('should return true for amounts above minimum', () => {
      expect(meetsMinimumCharge(100, 'USD')).toBe(true)
      expect(meetsMinimumCharge(50, 'USD')).toBe(true)
    })

    it('should return false for amounts below minimum', () => {
      expect(meetsMinimumCharge(49, 'USD')).toBe(false)
      expect(meetsMinimumCharge(29, 'GBP')).toBe(false)
    })
  })

  describe('convertAmountSync', () => {
    const mockRates = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      CAD: 1.36,
      AUD: 1.53,
    }

    it('should return same amount when converting to same currency', () => {
      expect(convertAmountSync(10000, 'USD', 'USD')).toBe(10000)
      expect(convertAmountSync(10000, 'EUR', 'EUR')).toBe(10000)
    })

    it('should convert USD to EUR correctly', () => {
      const result = convertAmountSync(10000, 'USD', 'EUR', mockRates)
      expect(result).toBe(9200) // 10000 * 0.92
    })

    it('should convert USD to GBP correctly', () => {
      const result = convertAmountSync(10000, 'USD', 'GBP', mockRates)
      expect(result).toBe(7900) // 10000 * 0.79
    })

    it('should convert USD to CAD correctly', () => {
      const result = convertAmountSync(10000, 'USD', 'CAD', mockRates)
      expect(result).toBe(13600) // 10000 * 1.36
    })

    it('should convert EUR to USD correctly', () => {
      const result = convertAmountSync(9200, 'EUR', 'USD', mockRates)
      expect(result).toBe(10000) // 9200 / 0.92
    })

    it('should handle large booking amounts', () => {
      // $15,000 USD = 1500000 cents
      const usdAmount = 1500000
      const eurResult = convertAmountSync(usdAmount, 'USD', 'EUR', mockRates)
      expect(eurResult).toBe(1380000) // 1500000 * 0.92
    })

    it('should round to nearest integer', () => {
      // Test with amount that would produce decimals
      const result = convertAmountSync(10001, 'USD', 'EUR', mockRates)
      expect(result).toBe(Math.round(10001 * 0.92))
      expect(Number.isInteger(result)).toBe(true)
    })
  })
})
