/**
 * Companion Add-Ons Wrapper Component
 *
 * Wrapper for medical and wellness add-ons selectors in companion mode.
 * Features toggle between primary/companion views and "Copy from primary" functionality.
 *
 * Used in: /booking/configure/add-ons and /booking/configure/wellness (E3-S17, Task 6)
 */

'use client'

import { useState, cloneElement, ReactElement } from 'react'
import { useBookingStore } from '@/lib/stores/booking-store'
import { Check, Copy, Users } from 'lucide-react'

interface CompanionAddOnsWrapperProps {
  children: ReactElement
  type: 'medical' | 'wellness'
}

export default function CompanionAddOnsWrapper({
  children,
  type,
}: CompanionAddOnsWrapperProps) {
  const { hasCompanion, copyAddOnsToCompanion, companionInfo } =
    useBookingStore()
  const [viewMode, setViewMode] = useState<'primary' | 'companion'>('primary')
  const [copySuccess, setCopySuccess] = useState(false)

  // If not in companion mode, just render children
  if (!hasCompanion) {
    return <>{children}</>
  }

  // Handle copy from primary guest
  const handleCopyFromPrimary = () => {
    copyAddOnsToCompanion()
    setCopySuccess(true)

    // Reset success message after 3 seconds
    setTimeout(() => {
      setCopySuccess(false)
    }, 3000)
  }

  const companionName = companionInfo
    ? `${companionInfo.firstName} ${companionInfo.lastName}`
    : 'Companion'

  return (
    <div className="space-y-6">
      {/* Mode Toggle & Copy Button */}
      <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-900">
          <Users className="h-5 w-5" />
          <span>Companion Booking Active</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg border border-emerald-300 bg-white p-1">
            <button
              onClick={() => setViewMode('primary')}
              className={`
                rounded-md px-4 py-2 text-sm font-semibold transition-all
                ${
                  viewMode === 'primary'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }
              `}
            >
              Your Add-Ons
            </button>
            <button
              onClick={() => setViewMode('companion')}
              className={`
                rounded-md px-4 py-2 text-sm font-semibold transition-all
                ${
                  viewMode === 'companion'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }
              `}
            >
              {companionName}'s Add-Ons
            </button>
          </div>

          {/* Copy Button - Only show when viewing companion */}
          {viewMode === 'companion' && (
            <button
              onClick={handleCopyFromPrimary}
              disabled={copySuccess}
              className={`
                inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-all
                ${
                  copySuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-emerald-700 ring-1 ring-inset ring-emerald-300 hover:bg-emerald-50'
                }
              `}
            >
              {copySuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy from Your Add-Ons</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Explanation Text */}
        <p className="mt-4 text-sm text-emerald-800">
          {viewMode === 'primary' ? (
            <>
              Selecting <strong>{type}</strong> add-ons for your booking. Switch
              to companion view to select add-ons for {companionName}.
            </>
          ) : (
            <>
              Selecting <strong>{type}</strong> add-ons for {companionName}.{' '}
              {companionName} can have different add-ons, or you can copy yours.
            </>
          )}
        </p>
      </div>

      {/* Render children with appropriate mode prop */}
      <div className={viewMode === 'primary' ? 'block' : 'hidden'}>
        {cloneElement(children, { mode: 'primary' } as any)}
      </div>

      {viewMode === 'companion' && (
        <div>{cloneElement(children, { mode: 'companion' } as any)}</div>
      )}
    </div>
  )
}
