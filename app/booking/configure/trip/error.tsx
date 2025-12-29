'use client'

/**
 * Error Boundary for Trip Selection Page
 *
 * Handles runtime errors gracefully instead of showing Next.js error page.
 * Provides user-friendly error message with retry option.
 */

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service (e.g., Sentry)
    console.error('Trip selection page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-12 text-center">
          <AlertCircle className="mx-auto mb-6 h-16 w-16 text-red-500" />

          <h1 className="mb-3 text-2xl font-serif font-bold text-red-900">
            Failed to Load Trip Selection
          </h1>

          <p className="mb-6 text-red-700">
            We encountered an error while loading the trip selection page.
            This could be due to a network issue or temporary problem with our servers.
          </p>

          <div className="space-y-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
            >
              Try Again
            </button>

            <div className="text-center">
              <a
                href="/booking/configure/wellness"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 underline"
              >
                Go Back to Wellness Add-Ons
              </a>
            </div>
          </div>

          {error.digest && (
            <p className="mt-6 text-xs text-slate-500">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 rounded-lg bg-white border border-slate-200 p-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Need Help?
          </h2>
          <p className="mb-4 text-sm text-slate-600">
            If this problem persists, please contact our support team:
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>
              📧 Email:{' '}
              <a
                href="mailto:support@pickleballpassport.com"
                className="text-emerald-600 hover:text-emerald-700 underline"
              >
                support@pickleballpassport.com
              </a>
            </li>
            <li>
              💬 Live Chat: Available 9am-6pm PST
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
