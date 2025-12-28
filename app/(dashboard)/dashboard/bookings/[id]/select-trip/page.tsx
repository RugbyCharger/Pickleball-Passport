/**
 * Trip Selection Page
 *
 * Allows guests to select trip dates for their booking.
 * Features:
 * - View available trips
 * - Check capacity
 * - Validate booking rules
 * - Assign trip to booking
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/db'
import { TripSelector } from '@/components/dashboard/trip-selector'

interface SelectTripPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SelectTripPage({ params }: SelectTripPageProps) {
  const { id } = await params
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch booking details
  const booking = await prisma.booking.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      packageId: true,
      tripId: true,
      status: true,
      bookingReference: true,
      package: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!booking) {
    notFound()
  }

  // Verify ownership
  if (booking.userId !== user.id) {
    redirect('/dashboard/bookings')
  }

  // Check if trip already assigned
  if (booking.tripId) {
    redirect(`/dashboard/bookings/${id}`)
  }

  // Check booking status
  if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING_PAYMENT') {
    redirect(`/dashboard/bookings/${id}`)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Button */}
      <Link href={`/dashboard/bookings/${id}`}>
        <Button variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Booking
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-playfair text-3xl font-bold text-primary mb-2">
          Select Your Trip Dates
        </h1>
        <p className="text-muted-foreground">
          {booking.package.name} • Booking {booking.bookingReference}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Choose from the available trip dates below. You can only select one trip per booking.
        </p>
      </div>

      {/* Trip Selector Component */}
      <TripSelector
        bookingId={booking.id}
        packageId={booking.packageId}
      />
    </div>
  )
}
