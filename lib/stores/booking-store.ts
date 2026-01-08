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

export interface CompanionInfo {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  passportNumber?: string
  dietaryNotes?: string
}

export interface CompanionPackage {
  packageId: string
  sameAsPrimary: boolean
  duration: number
}

export interface CompanionAccommodation {
  shared: boolean
  tier?: AccommodationTier
}

export interface GiftRecipient {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
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

  // Modification Mode (E3-S16)
  isModificationMode: boolean
  originalBookingId: string | null
  originalAddOns: SelectedAddOn[]
  lockedPackageId: string | null
  lockedDuration: number | null
  lockedAccommodationTier: AccommodationTier | null

  // Companion Booking (E3-S17)
  hasCompanion: boolean
  companionInfo: CompanionInfo | null
  companionPackage: CompanionPackage | null
  companionAccommodation: CompanionAccommodation | null
  companionAddOns: SelectedAddOn[]

  // Gift Booking (E3-S18)
  isGift: boolean
  giftRecipient: GiftRecipient | null
  giftMessage: string
  giftDeliveryOption: 'immediate' | 'scheduled'
  giftDeliveryDate: Date | null

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

  // Modification mode actions
  enterModificationMode: (booking: {
    bookingId: string
    packageId: string
    duration: number
    accommodationTier: AccommodationTier
    addOns: SelectedAddOn[]
  }) => void
  exitModificationMode: () => void
  calculatePriceDifference: () => number

  // Companion booking actions
  toggleCompanion: () => void
  setCompanionInfo: (info: CompanionInfo | null) => void
  setCompanionPackage: (pkg: CompanionPackage | null) => void
  setCompanionAccommodation: (acc: CompanionAccommodation | null) => void
  addCompanionAddOn: (addOn: SelectedAddOn) => void
  removeCompanionAddOn: (addOnId: string) => void
  clearCompanionAddOns: () => void
  copyAddOnsToCompanion: () => void
  calculateCompanionSubtotal: () => number
  calculateCombinedTotal: () => number
  validateCompanionBooking: () => { isValid: boolean; errors: string[] }

  // Gift booking actions
  toggleGift: () => void
  setGiftRecipient: (recipient: GiftRecipient | null) => void
  setGiftMessage: (message: string) => void
  setGiftDeliveryOption: (option: 'immediate' | 'scheduled') => void
  setGiftDeliveryDate: (date: Date | null) => void
  validateGiftBooking: () => { isValid: boolean; errors: string[] }

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
  isModificationMode: false,
  originalBookingId: null,
  originalAddOns: [],
  lockedPackageId: null,
  lockedDuration: null,
  lockedAccommodationTier: null,
  hasCompanion: false,
  companionInfo: null,
  companionPackage: null,
  companionAccommodation: null,
  companionAddOns: [],
  isGift: false,
  giftRecipient: null,
  giftMessage: '',
  giftDeliveryOption: 'immediate' as 'immediate' | 'scheduled',
  giftDeliveryDate: null,
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

      // Modification Mode Actions (E3-S16)
      enterModificationMode: (booking) => set({
        isModificationMode: true,
        originalBookingId: booking.bookingId,
        originalAddOns: booking.addOns,
        lockedPackageId: booking.packageId,
        lockedDuration: booking.duration,
        lockedAccommodationTier: booking.accommodationTier,
        selectedAddOns: booking.addOns, // Pre-populate current selections
      }),

      exitModificationMode: () => set({
        isModificationMode: false,
        originalBookingId: null,
        originalAddOns: [],
        lockedPackageId: null,
        lockedDuration: null,
        lockedAccommodationTier: null,
      }),

      calculatePriceDifference: () => {
        const state = get()
        const originalTotal = state.originalAddOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)
        const newTotal = state.selectedAddOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)
        return newTotal - originalTotal
      },

      // Companion Booking Actions (E3-S17)
      toggleCompanion: () => set((state) => {
        const newHasCompanion = !state.hasCompanion
        // If disabling companion, clear all companion data
        if (!newHasCompanion) {
          return {
            hasCompanion: false,
            companionInfo: null,
            companionPackage: null,
            companionAccommodation: null,
            companionAddOns: [],
          }
        }
        return { hasCompanion: true }
      }),

      setCompanionInfo: (info) => set({ companionInfo: info }),

      setCompanionPackage: (pkg) => set({ companionPackage: pkg }),

      setCompanionAccommodation: (acc) => set({ companionAccommodation: acc }),

      addCompanionAddOn: (addOn) => set((state) => {
        const exists = state.companionAddOns.some((a) => a.id === addOn.id)
        if (exists) return state
        return {
          companionAddOns: [...state.companionAddOns, addOn],
        }
      }),

      removeCompanionAddOn: (addOnId) => set((state) => ({
        companionAddOns: state.companionAddOns.filter((a) => a.id !== addOnId),
      })),

      clearCompanionAddOns: () => set({ companionAddOns: [] }),

      copyAddOnsToCompanion: () => set((state) => ({
        companionAddOns: [...state.selectedAddOns],
      })),

      calculateCompanionSubtotal: () => {
        const state = get()
        if (!state.hasCompanion || !state.companionPackage) return 0

        let subtotal = 0

        // Companion base package price
        if (state.selectedPackage && state.companionPackage.sameAsPrimary) {
          const basePrice = state.selectedPackage.basePrice
          subtotal += Math.round(basePrice * (state.companionPackage.duration / 14))
        } else if (state.companionPackage.packageId) {
          // Different package - would need to look up price (handled in backend)
          // For now, use same pricing logic as primary
          if (state.selectedPackage) {
            const basePrice = state.selectedPackage.basePrice
            subtotal += Math.round(basePrice * (state.companionPackage.duration / 14))
          }
        }

        // Companion accommodation (FREE if shared, full price if separate)
        if (state.companionAccommodation) {
          if (!state.companionAccommodation.shared && state.companionAccommodation.tier) {
            subtotal += ACCOMMODATION_TIER_PRICING[state.companionAccommodation.tier]
          }
          // If shared: $0 accommodation cost
        }

        // Companion add-ons
        state.companionAddOns.forEach((addOn) => {
          subtotal += addOn.thPrice
        })

        return subtotal
      },

      calculateCombinedTotal: () => {
        const primaryTotal = get().calculateTotal()
        const companionTotal = get().calculateCompanionSubtotal()
        return primaryTotal + companionTotal
      },

      validateCompanionBooking: () => {
        const state = get()
        const errors: string[] = []

        if (!state.hasCompanion) {
          return { isValid: true, errors: [] }
        }

        // Validate companion info
        if (!state.companionInfo) {
          errors.push('Companion information is required')
        } else {
          if (!state.companionInfo.firstName) errors.push('Companion first name is required')
          if (!state.companionInfo.lastName) errors.push('Companion last name is required')
          if (!state.companionInfo.email) errors.push('Companion email is required')

          // Email format validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (state.companionInfo.email && !emailRegex.test(state.companionInfo.email)) {
            errors.push('Companion email format is invalid')
          }

          // Age validation (18+)
          if (state.companionInfo.dateOfBirth) {
            const today = new Date()
            const birthDate = new Date(state.companionInfo.dateOfBirth)
            const age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
              ? age - 1
              : age

            if (adjustedAge < 18) {
              errors.push('Companion must be 18 years or older')
            }
          }
        }

        // Validate companion package
        if (!state.companionPackage) {
          errors.push('Companion package selection is required')
        }

        // Validate companion accommodation
        if (!state.companionAccommodation) {
          errors.push('Companion accommodation option is required')
        } else if (state.companionAccommodation.shared) {
          // Shared room validation
          if (state.duration !== state.companionPackage?.duration) {
            errors.push('Shared accommodation requires same trip duration')
          }
          if (state.accommodationTier !== state.companionAccommodation.tier) {
            errors.push('Shared accommodation requires same accommodation tier')
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
        }
      },

      // Gift Booking Actions (E3-S18)
      toggleGift: () => set((state) => {
        const newIsGift = !state.isGift
        // If disabling gift mode, clear all gift data
        if (!newIsGift) {
          return {
            isGift: false,
            giftRecipient: null,
            giftMessage: '',
            giftDeliveryOption: 'immediate',
            giftDeliveryDate: null,
          }
        }
        // If enabling gift mode, disable companion mode (can't be both)
        return {
          isGift: true,
          hasCompanion: false,
          companionInfo: null,
          companionPackage: null,
          companionAccommodation: null,
          companionAddOns: [],
        }
      }),

      setGiftRecipient: (recipient) => set({ giftRecipient: recipient }),

      setGiftMessage: (message) => set({ giftMessage: message }),

      setGiftDeliveryOption: (option) => set((state) => ({
        giftDeliveryOption: option,
        // Clear delivery date if switching to immediate
        giftDeliveryDate: option === 'immediate' ? null : state.giftDeliveryDate,
      })),

      setGiftDeliveryDate: (date) => set({ giftDeliveryDate: date }),

      validateGiftBooking: () => {
        const state = get()
        const errors: string[] = []

        if (!state.isGift) {
          return { isValid: true, errors: [] }
        }

        // Validate gift recipient
        if (!state.giftRecipient) {
          errors.push('Gift recipient information is required')
        } else {
          if (!state.giftRecipient.firstName) {
            errors.push('Recipient first name is required')
          }
          if (!state.giftRecipient.lastName) {
            errors.push('Recipient last name is required')
          }
          if (!state.giftRecipient.email) {
            errors.push('Recipient email is required')
          }

          // Email format validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (state.giftRecipient.email && !emailRegex.test(state.giftRecipient.email)) {
            errors.push('Recipient email format is invalid')
          }

          // Age validation (18+)
          if (state.giftRecipient.dateOfBirth) {
            const today = new Date()
            const birthDate = new Date(state.giftRecipient.dateOfBirth)
            const age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
              ? age - 1
              : age

            if (adjustedAge < 18) {
              errors.push('Recipient must be 18 years or older')
            }
          }
        }

        // Validate gift message length
        if (state.giftMessage.length > 500) {
          errors.push('Gift message must be 500 characters or less')
        }

        // Validate delivery date if scheduled
        if (state.giftDeliveryOption === 'scheduled') {
          if (!state.giftDeliveryDate) {
            errors.push('Delivery date is required for scheduled gifts')
          } else {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            tomorrow.setHours(0, 0, 0, 0)

            const oneYearFromNow = new Date()
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

            const deliveryDate = new Date(state.giftDeliveryDate)
            deliveryDate.setHours(0, 0, 0, 0)

            if (deliveryDate < tomorrow) {
              errors.push('Delivery date must be at least tomorrow')
            }
            if (deliveryDate > oneYearFromNow) {
              errors.push('Delivery date must be within one year')
            }
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
        }
      },

      // Reset to initial state
      reset: () => set(initialState),
    }),
    {
      name: 'booking-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the essential state (DO NOT persist modification mode)
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
        // Companion booking state
        hasCompanion: state.hasCompanion,
        companionInfo: state.companionInfo,
        companionPackage: state.companionPackage,
        companionAccommodation: state.companionAccommodation,
        companionAddOns: state.companionAddOns,
        // Gift booking state
        isGift: state.isGift,
        giftRecipient: state.giftRecipient,
        giftMessage: state.giftMessage,
        giftDeliveryOption: state.giftDeliveryOption,
        giftDeliveryDate: state.giftDeliveryDate,
        // Modification mode state excluded from persistence
      }),
    }
  )
)
