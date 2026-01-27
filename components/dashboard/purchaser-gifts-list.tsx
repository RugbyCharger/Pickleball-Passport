'use client'

/**
 * Purchaser Gifts List Component
 *
 * Displays gifts purchased by the current user.
 * Shows recipient info, status, delivery date, and state history.
 * Follows the pattern from bookings-list.tsx.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gift, Calendar, User, Mail, MapPin, DollarSign, Package } from 'lucide-react'
import { GiftStatusBadge } from './gift-state-timeline'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GiftStatus } from '@prisma/client'

interface PurchasedGift {
  id: string
  bookingReference: string
  packageName: string
  packageSlug: string
  recipientName: string | null
  recipientEmail: string | null
  giftMessage: string | null
  giftStatus: GiftStatus
  giftDeliveryDate: string | null
  giftExpiresAt: string | null
  totalPrice: number
  createdAt: string
  trip: {
    startDate: string | null
    endDate: string | null
    destination: string | null
  } | null
  stateHistory: Array<{
    fromState: string
    toState: string
    reason: string
    createdAt: string
  }>
}

interface PurchaserGiftsListProps {
  gifts: PurchasedGift[]
}

export function PurchaserGiftsList({ gifts }: PurchaserGiftsListProps) {
  // Empty state
  if (gifts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-semibold mb-2">No Gifts Purchased Yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            You haven&apos;t purchased any gifts yet. Gift a transformation trip to someone special!
          </p>
          <Link href="/packages">
            <Button>Browse Packages</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Gifts Count */}
      <p className="text-sm text-muted-foreground">
        Showing {gifts.length} gift{gifts.length !== 1 ? 's' : ''}
      </p>

      {/* Gifts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {gifts.map((gift) => (
          <Card
            key={gift.id}
            className="hover:shadow-md transition-shadow border-purple-200 bg-purple-50/20"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="truncate">{gift.packageName}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {gift.bookingReference}
                  </p>
                </div>
                <GiftStatusBadge
                  currentState={gift.giftStatus}
                  expiresAt={gift.giftExpiresAt}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Recipient Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Gift className="h-4 w-4" />
                  Recipient
                </h4>
                <div className="bg-white rounded-lg p-3 space-y-2 border">
                  {gift.recipientName && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{gift.recipientName}</span>
                    </div>
                  )}
                  {gift.recipientEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{gift.recipientEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gift Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Price */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>${(gift.totalPrice / 100).toLocaleString()}</span>
                </div>

                {/* Delivery Date */}
                {gift.giftDeliveryDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(gift.giftDeliveryDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}

                {/* Trip Info */}
                {gift.trip && gift.trip.destination && (
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {gift.trip.destination}
                      {gift.trip.startDate && (
                        <> - {format(new Date(gift.trip.startDate), 'MMM d, yyyy')}</>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Gift Message Preview */}
              {gift.giftMessage && (
                <div className="bg-purple-50 rounded-lg p-3 text-sm">
                  <p className="text-gray-600 italic line-clamp-2">
                    &ldquo;{gift.giftMessage}&rdquo;
                  </p>
                </div>
              )}

              {/* Purchase Date */}
              <div className="pt-2 border-t text-xs text-muted-foreground">
                Purchased on {format(new Date(gift.createdAt), 'MMMM d, yyyy')}
              </div>

              {/* View Details Link */}
              <Link href={`/dashboard/bookings/${gift.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
