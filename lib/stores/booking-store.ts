/**
 * Booking Configurator Store
 *
 * Zustand store for managing booking flow state across multiple steps:
 * 1. Package Selection
 * 2. Duration Selection
 * 3. Accommodation Tier Selection
 * 4. Add-Ons Selection
 * 5. Review & Payment
 *
 * Features:
 * - Real-time price calculation
 * - localStorage persistence
 * - Step navigation
 * - Reset functionality
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Types based on Prisma schema
export type AccommodationTier = 'LUXURY' | 'ULTRA_LUXURY' | 'VILLA'

export interface SelectedPackage {
  id: string
  slug: string
  name: string
  tagline: string | null
  basePrice: number // in cents
  durationOptions: number[]
  heroImageUrl: string | null
}

export interface SelectedAddOn {
  id: string
  name: string
  description: string | null
  category: string
  thPrice: number // in cents
  usPrice: number // in cents
}

export interface BookingState {
  // Current step in the configurator
  currentStep: number

  // Step 1: Package Selection
  selectedPackage: SelectedPackage | null

  // Step 2: Duration Selection
  duration: number | null // in days (7, 10, 14, 21)

  // Step 3: Accommodation Tier
  accommodationTier: AccommodationTier | null

  // Step 4: Add-Ons
  selectedAddOns: SelectedAddOn[]

  // Step 5: Trip Selection (optional - if user wants specific dates)
  selectedTripId: string | null

  // Referral Code (applied at review step)
  referralCode: string | null
  referralDiscount: number // in cents
  referralPartnerId: string | null // Partner ID for database relation
  referralPartnerInfo: {
    partnerName: string
    clubName: string
    clubLocation: string
  } | null

  // Actions
  setCurrentStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void

  setSelectedPackage: (pkg: SelectedPackage | null) => void
  setDuration: (days: number | null) => void
  setAccommodationTier: (tier: AccommodationTier | null) => void

  addAddOn: (addOn: SelectedAddOn) => void
  removeAddOn: (addOnId: string) => void
  clearAddOns: () => void

  setSelectedTripId: (tripId: string | null) => void

  setReferralCode: (code: string | null) => void
  setReferralDiscount: (discount: number) => void
  setReferralPartnerId: (partnerId: string | null) => void
  setReferralPartnerInfo: (info: BookingState['referralPartnerInfo']) => void

  // Pricing calculations
  calculateSubtotal: () => number
  calculateSavings: () => number
  calculateTotal: () => number

  // Utility
  reset: () => void
  canProceedToNextStep: () => boolean
  isReadyForReview: () => boolean
}

// Accommodation tier pricing (additional cost per tier)
const ACCOMMODATION_TIER_PRICING: Record<AccommodationTier, number> = {
  LUXURY: 0,           // Four Seasons - baseline (included in package)
  ULTRA_LUXURY: 300000, // Aman - +$3,000
  VILLA: 500000,       // Private Villa - +$5,000
}

// Initial state
const initialState = {
  currentStep: 1,
  selectedPackage: null,
  duration: null,
  accommodationTier: null,
  selectedAddOns: [],
  selectedTripId: null,
  referralCode: null,
  referralDiscount: 0,
  referralPartnerId: null,
  referralPartnerInfo: null,
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () => set((state) => ({
        currentStep: Math.min(state.currentStep + 1, 5)
      })),

      previousStep: () => set((state) => ({
        currentStep: Math.max(state.currentStep - 1, 1)
      })),

      // Step 1: Package Selection
      setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),

      // Step 2: Duration Selection
      setDuration: (days) => set({ duration: days }),

      // Step 3: Accommodation Tier
      setAccommodationTier: (tier) => set({ accommodationTier: tier }),

      // Step 4: Add-Ons
      addAddOn: (addOn) => set((state) => {
        // Check if already selected
        const exists = state.selectedAddOns.some((a) => a.id === addOn.id)
        if (exists) return state

        return {
          selectedAddOns: [...state.selectedAddOns, addOn],
        }
      }),

      removeAddOn: (addOnId) => set((state) => ({
        selectedAddOns: state.selectedAddOns.filter((a) => a.id !== addOnId),
      })),

      clearAddOns: () => set({ selectedAddOns: [] }),

      // Step 5: Trip Selection
      setSelectedTripId: (tripId) => set({ selectedTripId: tripId }),

      // Referral Code
      setReferralCode: (code) => set({ referralCode: code }),
      setReferralDiscount: (discount) => set({ referralDiscount: discount }),
      setReferralPartnerId: (partnerId) => set({ referralPartnerId: partnerId }),
      setReferralPartnerInfo: (info) => set({ referralPartnerInfo: info }),

      // Pricing calculations
      calculateSubtotal: () => {
        const state = get()
        let subtotal = 0

        // Base package price
        if (state.selectedPackage) {
          const basePrice = state.selectedPackage.basePrice

          // Adjust for duration (14 days is the baseline)
          if (state.duration) {
            subtotal += Math.round(basePrice * (state.duration / 14))
          } else {
            subtotal += basePrice // default to 14-day pricing
          }
        }

        // Accommodation tier upcharge
        if (state.accommodationTier) {
          subtotal += ACCOMMODATION_TIER_PRICING[state.accommodationTier]
        }

        // Add-ons
        state.selectedAddOns.forEach((addOn) => {
          subtotal += addOn.thPrice
        })

        return subtotal
      },

      calculateSavings: () => {
        const state = get()
        let thaiPrice = 0
        let usPrice = 0

        // Add-ons savings (comparing Thailand vs US prices)
        state.selectedAddOns.forEach((addOn) => {
          thaiPrice += addOn.thPrice
          usPrice += addOn.usPrice
        })

        // Package base savings (assuming 40% savings compared to US)
        // This is a rough estimate - adjust based on actual data
        if (state.selectedPackage) {
          const basePrice = state.selectedPackage.basePrice
          const durationMultiplier = state.duration ? state.duration / 14 : 1
          const packageThaiPrice = Math.round(basePrice * durationMultiplier)
          const estimatedUSPrice = Math.round(packageThaiPrice * 1.67) // ~40% savings

          thaiPrice += packageThaiPrice
          usPrice += estimatedUSPrice
        }

        return Math.max(0, usPrice - thaiPrice)
      },

      calculateTotal: () => {
        const subtotal = get().calculateSubtotal()
        const discount = get().referralDiscount || 0
        return Math.max(0, subtotal - discount)
      },

      // Validation for review step
      isReadyForReview: () => {
        const state = get()
        return (
          state.selectedPackage !== null &&
          state.duration !== null &&
          state.accommodationTier !== null
        )
      },

      // Validation for step progression
      canProceedToNextStep: () => {
        const state = get()

        switch (state.currentStep) {
          case 1: // Package Selection
            return state.selectedPackage !== null
          case 2: // Duration Selection
            return state.duration !== null
          case 3: // Accommodation Tier
            return state.accommodationTier !== null
          case 4: // Add-Ons (optional - always can proceed)
            return true
          case 5: // Review (final step)
            return false
          default:
            return false
        }
      },

      // Reset to initial state
      reset: () => set(initialState),
    }),
    {
      name: 'booking-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the essential state
      partialize: (state) => ({
        selectedPackage: state.selectedPackage,
        duration: state.duration,
        accommodationTier: state.accommodationTier,
        selectedAddOns: state.selectedAddOns,
        selectedTripId: state.selectedTripId,
        referralCode: state.referralCode,
        referralDiscount: state.referralDiscount,
        referralPartnerId: state.referralPartnerId,
        referralPartnerInfo: state.referralPartnerInfo,
        currentStep: state.currentStep,
      }),
    }
  )
)
