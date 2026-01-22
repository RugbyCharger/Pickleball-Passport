/**
 * Currency Selector Component
 * E4-S13: Multi-Currency Support
 *
 * Dropdown component for selecting payment currency.
 * Persists selection in localStorage for returning users.
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import {
  CURRENCY_OPTIONS,
  type SupportedCurrency,
  DEFAULT_CURRENCY,
  getExchangeRates,
} from '@/lib/services/currency'

const STORAGE_KEY = 'preferred-currency'

interface CurrencySelectorProps {
  value?: SupportedCurrency
  onChange?: (currency: SupportedCurrency) => void
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Get flag emoji for a country code
 */
function getFlagEmoji(countryCode: string): string {
  // Special case for EU
  if (countryCode === 'EU') {
    return '\uD83C\uDDEA\uD83C\uDDFA' // EU flag
  }

  // Convert country code to flag emoji
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export function CurrencySelector({
  value,
  onChange,
  showLabel = true,
  size = 'md',
  className = '',
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(
    value || DEFAULT_CURRENCY
  )
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null)

  // Load saved preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !value) {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && CURRENCY_OPTIONS.some((c) => c.code === saved)) {
        setSelectedCurrency(saved as SupportedCurrency)
      }
    }
  }, [value])

  // Update from props
  useEffect(() => {
    if (value) {
      setSelectedCurrency(value)
    }
  }, [value])

  // Fetch exchange rates on mount
  useEffect(() => {
    getExchangeRates().then(setExchangeRates).catch(console.error)
  }, [])

  const handleSelect = useCallback((currency: SupportedCurrency) => {
    setSelectedCurrency(currency)
    setIsOpen(false)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, currency)
    }

    // Notify parent
    onChange?.(currency)
  }, [onChange])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-currency-selector]')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = CURRENCY_OPTIONS.find((c) => c.code === selectedCurrency)

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  }

  return (
    <div className={`relative inline-block ${className}`} data-currency-selector>
      {showLabel && (
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Currency
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between gap-2
          ${sizeClasses[size]}
          min-w-[140px]
          bg-white border border-slate-200 rounded-lg
          hover:border-slate-300 hover:bg-slate-50
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
          transition-colors
        `}
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900">
            {selectedOption && (
              <>
                <span className="mr-1.5">{getFlagEmoji(selectedOption.flag)}</span>
                {selectedOption.code}
              </>
            )}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="py-1">
            {CURRENCY_OPTIONS.map((option) => {
              const isSelected = option.code === selectedCurrency
              const rate = exchangeRates?.[option.code]

              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => handleSelect(option.code)}
                  className={`
                    w-full flex items-center justify-between gap-2 px-3 py-2 text-left
                    ${isSelected ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}
                    transition-colors
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getFlagEmoji(option.flag)}</span>
                    <div>
                      <span className="font-medium">{option.code}</span>
                      <span className="text-slate-500 text-sm ml-2">
                        {option.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {rate && option.code !== 'USD' && (
                      <span>1 USD = {rate.toFixed(2)}</span>
                    )}
                    {option.code === 'USD' && <span>Base</span>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Info footer */}
          <div className="border-t border-slate-100 px-3 py-2 bg-slate-50">
            <p className="text-xs text-slate-500">
              Prices converted at current exchange rates
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Hook to manage currency preference
 */
export function useCurrencyPreference(): [SupportedCurrency, (currency: SupportedCurrency) => void] {
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && CURRENCY_OPTIONS.some((c) => c.code === saved)) {
        setCurrency(saved as SupportedCurrency)
      }
    }
  }, [])

  const setAndPersist = useCallback((newCurrency: SupportedCurrency) => {
    setCurrency(newCurrency)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newCurrency)
    }
  }, [])

  return [currency, setAndPersist]
}
