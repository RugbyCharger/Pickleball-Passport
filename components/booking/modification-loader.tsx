'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useBookingStore, SelectedAddOn, AccommodationTier } from '@/lib/stores/booking-store'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ModificationLoaderProps {
  bookingId: string
}

export default function ModificationLoader({ bookingId }: ModificationLoaderProps) {
  const router = useRouter()
  const { enterModificationMode, setSelectedPackage } = useBookingStore()

  // Fetch booking details
  const { data: booking, isLoading, error } = trpc.booking.getById.useQuery({
    bookingId,
  })

  useEffect(() => {
    if (error) {
      toast.error('Failed to load booking. Please try again.')
      router.push(`/dashboard/bookings/${bookingId}`)
      return
    }

    if (booking) {
      // Map booking add-ons to SelectedAddOn format
      const addOns: SelectedAddOn[] = booking.bookingAddOns.map((ba) => ({
        id: ba.addOn.id,
        name: ba.addOn.name,
        description: ba.addOn.description,
        category: ba.addOn.category,
        thPrice: ba.addOn.thPrice,
        usPrice: ba.addOn.usPrice,
      }))

      // Initialize booking store in modification mode
      enterModificationMode({
        bookingId: booking.id,
        packageId: booking.packageId,
        duration: booking.duration,
        accommodationTier: booking.accommodationTier as AccommodationTier,
        addOns,
      })

      // Set the package in the store for pricing calculations
      if (booking.package) {
        setSelectedPackage({
          id: booking.package.id,
          slug: booking.package.slug,
          name: booking.package.name,
          tagline: booking.package.tagline,
          basePrice: booking.package.basePrice,
          durationOptions: [7, 10, 14, 21], // Standard duration options
          heroImageUrl: booking.package.heroImageUrl,
        })
      }

      // Redirect to add-ons selection page (skip package/duration/accommodation)
      router.push('/booking/configure/add-ons')
    }
  }, [booking, error, router, enterModificationMode, setSelectedPackage, bookingId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading your booking...
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare the modification interface.
          </p>
        </div>
      </div>
    )
  }

  // Loading state or error handling - show while processing
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Initializing modification mode...</p>
      </div>
    </div>
  )
}
