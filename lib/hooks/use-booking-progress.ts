/**
 * Booking Progress Hook
 *
 * Provides consistent step counting across the booking flow
 */

import { usePathname } from 'next/navigation'

export interface BookingStep {
  step: number
  totalSteps: number
  label: string
  path: string
}

const BOOKING_STEPS: BookingStep[] = [
  { step: 1, totalSteps: 8, label: 'Package Selection', path: '/booking/configure' },
  { step: 2, totalSteps: 8, label: 'Duration', path: '/booking/configure/duration' },
  { step: 3, totalSteps: 8, label: 'Accommodation', path: '/booking/configure/accommodation' },
  { step: 4, totalSteps: 8, label: 'Medical Add-Ons', path: '/booking/configure/add-ons' },
  { step: 5, totalSteps: 8, label: 'Wellness Add-Ons', path: '/booking/configure/wellness' },
  { step: 6, totalSteps: 8, label: 'Trip Selection', path: '/booking/configure/trip' },
  { step: 7, totalSteps: 8, label: 'Complete Profile', path: '/booking/configure/profile' },
  { step: 8, totalSteps: 8, label: 'Review', path: '/booking/review' },
]

export function useBookingProgress(): BookingStep | null {
  const pathname = usePathname()

  // Find matching step
  const currentStep = BOOKING_STEPS.find(step => pathname === step.path)

  return currentStep || null
}

export function getBookingProgress(pathname: string): BookingStep | null {
  return BOOKING_STEPS.find(step => pathname === step.path) || null
}
