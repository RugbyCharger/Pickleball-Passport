/**
 * Booking Detail Page
 *
 * Shows complete booking information including:
 * - Package details with images
 * - Pricing breakdown
 * - Trip dates and destination
 * - Add-ons list
 * - Payment history
 * - Download confirmation (placeholder)
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  MapPin,
  DollarSign,
  ArrowLeft,
  Download,
  CreditCard,
  Home,
  Package as PackageIcon,
} from 'lucide-react'
import { prisma } from '@/lib/db'
import { BookingStatus } from '@prisma/client'
import { BookingStatusTimeline } from '@/components/bookings/booking-status-timeline'

interface BookingDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch complete booking details
  const booking = await prisma.booking.findUnique({
    where: {
      id,
    },
    include: {
      package: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          basePrice: true,
        },
      },
      trip: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          destination: true,
          capacity: true,
          currentBookings: true,
        },
      },
      bookingAddOns: {
        include: {
          addOn: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          stripePaymentIntentId: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      documents: {
        select: {
          id: true,
          type: true,
          status: true,
          uploadedAt: true,
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

  // Calculate timeline data
  const hasRequiredDocuments = (() => {
    const requiredTypes = ['PASSPORT', 'MEDICAL_FORM', 'INSURANCE'] as const
    const uploadedTypes = new Set(
      booking.documents
        .filter((doc) => doc.status === 'APPROVED' || doc.status === 'PENDING_REVIEW')
        .map((doc) => doc.type)
    )
    return requiredTypes.every((type) => uploadedTypes.has(type))
  })()

  const paymentDate = booking.payments.find((p) => p.status === 'SUCCEEDED')?.createdAt
  const documentsSubmittedDate = booking.documents.length > 0
    ? booking.documents.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )[0]?.uploadedAt
    : undefined
  const tripConfirmedDate = booking.trip ? booking.createdAt : undefined
  const completedDate = booking.status === 'COMPLETED' ? booking.updatedAt : undefined

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/bookings">
        <Button variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-playfair text-3xl font-bold text-primary">
              {booking.package.name}
            </h1>
            <Badge variant={getStatusVariant(booking.status)}>
              {getStatusLabel(booking.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Booking Reference: <span className="font-mono font-semibold">{booking.bookingReference}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Booked on {new Date(booking.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Booking Status Timeline */}
      <Card>
        <CardContent className="pt-6">
          <BookingStatusTimeline
            bookingStatus={booking.status}
            createdAt={booking.createdAt}
            paymentDate={paymentDate}
            documentsSubmittedDate={documentsSubmittedDate}
            tripConfirmedDate={tripConfirmedDate}
            completedDate={completedDate}
            hasRequiredDocuments={hasRequiredDocuments}
            tripAssigned={!!booking.trip}
          />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Package Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageIcon className="h-5 w-5" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{booking.package.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {booking.package.description || 'A transformative wellness experience in Thailand.'}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold">{booking.duration} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Accommodation</p>
                  <p className="font-semibold">{formatAccommodationTier(booking.accommodationTier)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Details */}
          {booking.trip ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Destination</p>
                  <p className="font-semibold text-lg">{booking.trip.destination}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Check-in</p>
                    <p className="font-semibold">
                      {new Date(booking.trip.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Check-out</p>
                    <p className="font-semibold">
                      {new Date(booking.trip.endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Group Size: {booking.trip.currentBookings} / {booking.trip.capacity} guests
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Trip Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You haven't selected a trip date yet. Choose your preferred dates to complete your booking.
                </p>
                <Link href={`/dashboard/bookings/${booking.id}/select-trip`}>
                  <Button>Select Trip Dates</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Add-ons */}
          {booking.bookingAddOns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Add-ons & Extras</CardTitle>
                <CardDescription>
                  Additional services included in your booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking.bookingAddOns.map((bookingAddOn) => (
                    <div
                      key={bookingAddOn.id}
                      className="flex items-start justify-between py-3 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{bookingAddOn.addOn.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {bookingAddOn.addOn.description || `${bookingAddOn.addOn.category} add-on`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Quantity: {bookingAddOn.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${(bookingAddOn.price / 100).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booking.payments.length === 0 ? (
                <p className="text-muted-foreground">No payments recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {booking.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div>
                        <p className="font-semibold">
                          ${(payment.amount / 100).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Badge variant={payment.status === 'SUCCEEDED' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Package ({booking.duration} days)</span>
                <span className="font-medium">${(booking.basePrice / 100).toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accommodation Upgrade</span>
                <span className="font-medium">
                  {booking.accommodationPrice === 0
                    ? 'Included'
                    : `$${(booking.accommodationPrice / 100).toLocaleString()}`
                  }
                </span>
              </div>

              {booking.addOnsTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Add-ons Total</span>
                  <span className="font-medium">${(booking.addOnsTotal / 100).toLocaleString()}</span>
                </div>
              )}

              {booking.referredBy && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Referral Discount</span>
                  <span className="font-medium">Applied</span>
                </div>
              )}

              <div className="pt-3 mt-3 border-t flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg text-primary">
                  ${(booking.totalPrice / 100).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/documents">
                <Button variant="outline" className="w-full justify-start">
                  Upload Documents
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full justify-start">
                  Update Profile
                </Button>
              </Link>
              <Link href={`/packages/${booking.package.slug}`}>
                <Button variant="outline" className="w-full justify-start">
                  View Package Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/**
 * Get badge variant based on booking status
 */
function getStatusVariant(status: BookingStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'CONFIRMED':
      return 'default'
    case 'PENDING_PAYMENT':
      return 'secondary'
    case 'CANCELLED':
      return 'destructive'
    case 'COMPLETED':
      return 'outline'
    default:
      return 'outline'
  }
}

/**
 * Get human-readable status label
 */
function getStatusLabel(status: BookingStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft'
    case 'PENDING_PAYMENT':
      return 'Payment Pending'
    case 'CONFIRMED':
      return 'Confirmed'
    case 'CANCELLED':
      return 'Cancelled'
    case 'COMPLETED':
      return 'Completed'
    default:
      return status
  }
}

/**
 * Format accommodation tier for display
 */
function formatAccommodationTier(tier: string): string {
  switch (tier) {
    case 'LUXURY':
      return 'Four Seasons (Luxury)'
    case 'ULTRA_LUXURY':
      return 'Aman (Ultra Luxury)'
    case 'VILLA':
      return 'Private Villa'
    default:
      return tier
  }
}
