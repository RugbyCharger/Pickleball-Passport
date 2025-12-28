/**
 * Review Page Client Component
 *
 * Handles client-side navigation and validation for the review page.
 * Separated from the server component to use client-side hooks.
 */

'use client'

import { useBookingStore } from '@/lib/stores/booking-store'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ReviewPageClient() {
  const router = useRouter()
  const { isReadyForReview } = useBookingStore()
  const [canProceed, setCanProceed] = useState(false)

  useEffect(() => {
    // Check if all required selections are made
    const ready = isReadyForReview()
    setCanProceed(ready)

    // Redirect to configure if not ready
    if (!ready) {
      router.push('/booking/configure')
    }
  }, [isReadyForReview, router])

  const handleBack = () => {
    router.push('/booking/configure/accommodation')
  }

  const handleProceedToPayment = () => {
    router.push('/booking/payment')
  }

  return (
    <>
      <button
        onClick={handleBack}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Accommodation
      </button>

      <button
        onClick={handleProceedToPayment}
        disabled={!canProceed}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <CreditCard className="h-5 w-5" />
        Proceed to Payment
      </button>
    </>
  )
}
