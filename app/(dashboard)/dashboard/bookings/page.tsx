/**
 * Booking History Page
 *
 * Displays all user bookings with:
 * - Status filtering
 * - Date sorting
 * - Booking cards with key details
 * - Click to view details
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { BookingsList } from '@/components/dashboard/bookings-list'
import { prisma } from '@/lib/db'

export default async function BookingsPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch all user bookings with related data including companion relationships
  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
    },
    include: {
      package: {
        select: {
          name: true,
          slug: true,
        },
      },
      trip: {
        select: {
          startDate: true,
          endDate: true,
          destination: true,
        },
      },
      payments: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
      companionBookings: {
        select: {
          id: true,
          bookingReference: true,
          guestFirstName: true,
          guestLastName: true,
          status: true,
          totalPrice: true,
          accommodationTier: true,
        },
      },
      primaryBooking: {
        select: {
          id: true,
          bookingReference: true,
          userId: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Your Bookings</h2>
        <p className="text-muted-foreground">
          View and manage all your transformation package bookings
        </p>
      </div>

      {/* Bookings List Component (Client-side for filtering/sorting) */}
      <BookingsList bookings={bookings} />
    </div>
  )
}
