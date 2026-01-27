/**
 * Gifts I've Purchased Page
 *
 * Displays all gifts purchased by the current user.
 * Shows recipient info, status, delivery date, and state history.
 * Allows purchaser to track the status of gifts they've sent.
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { PurchaserGiftsList } from '@/components/dashboard/purchaser-gifts-list'

export default async function GiftsPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch all gifts purchased by the current user
  const gifts = await prisma.booking.findMany({
    where: {
      giftPurchaserId: user.id,
      isGift: true,
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
      giftStateTransitions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Transform to match the component's expected interface
  const transformedGifts = gifts.map((gift) => ({
    id: gift.id,
    bookingReference: gift.bookingReference,
    packageName: gift.package.name,
    packageSlug: gift.package.slug,
    recipientName: gift.giftRecipientName,
    recipientEmail: gift.giftRecipientEmail,
    giftMessage: gift.giftMessage,
    giftStatus: gift.giftStatus!,
    giftDeliveryDate: gift.giftDeliveryDate?.toISOString() ?? null,
    giftExpiresAt: gift.giftExpiresAt?.toISOString() ?? null,
    totalPrice: gift.totalPrice,
    createdAt: gift.createdAt.toISOString(),
    trip: gift.trip
      ? {
          startDate: gift.trip.startDate?.toISOString() ?? null,
          endDate: gift.trip.endDate?.toISOString() ?? null,
          destination: gift.trip.destination,
        }
      : null,
    stateHistory: gift.giftStateTransitions.map((t) => ({
      fromState: t.fromState,
      toState: t.toState,
      reason: t.reason,
      createdAt: t.createdAt.toISOString(),
    })),
  }))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Gifts You&apos;ve Purchased</h2>
        <p className="text-muted-foreground">
          Track the status of transformation trips you&apos;ve gifted to others
        </p>
      </div>

      {/* Gifts List */}
      <PurchaserGiftsList gifts={transformedGifts} />
    </div>
  )
}
