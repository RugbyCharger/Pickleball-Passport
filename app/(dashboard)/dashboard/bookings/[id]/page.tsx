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
  Users,
} from 'lucide-react'
import { prisma } from '@/lib/db'
import { BookingStatus } from '@prisma/client'
import { BookingStatusTimeline } from '@/components/bookings/booking-status-timeline'
import CancelBookingButton from '@/components/booking/cancel-booking-button'
import RescheduleBookingButton from '@/components/booking/reschedule-booking-button'
import ModifyBookingButton from '@/components/booking/modify-booking-button'
import { PaymentScheduleDisplay } from '@/components/booking/payment-schedule-display'
import { calculateInstallmentAmounts, calculateInstallmentDates } from '@/lib/utils/installment-calculator'

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

  // Fetch complete booking details including companion relationships
  const booking = await prisma.booking.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      bookingReference: true,
      status: true,
      totalPrice: true,
      basePrice: true,
      accommodationPrice: true,
      addOnsTotal: true,
      duration: true,
      accommodationTier: true,
      referredBy: true,
      paymentPlan: true, // E4-S6
      stripeCustomerId: true, // E4-S6
      createdAt: true,
      updatedAt: true,
      rescheduleCount: true,
      isCompanionBooking: true,
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
          receiptNumber: true,
          receiptUrl: true,
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

  // E4-S6: Build payment schedule for installment plans
  const paymentSchedule = (() => {
    if (booking.paymentPlan !== 'INSTALLMENT_4' || !booking.trip) return null

    const amounts = calculateInstallmentAmounts(booking.totalPrice)
    const dates = calculateInstallmentDates(booking.trip.startDate)

    // Match payments to installments
    const successfulPayments = booking.payments
      .filter(p => p.status === 'SUCCEEDED')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    return amounts.map((amount, index) => {
      const payment = successfulPayments[index]
      const dueDate = dates[index]
      const now = new Date()

      let status: 'PAID' | 'PENDING' | 'UPCOMING' | 'OVERDUE'
      if (payment) {
        status = 'PAID'
      } else if (dueDate < now) {
        status = 'OVERDUE'
      } else if (index === successfulPayments.length) {
        // Next payment due
        status = 'PENDING'
      } else {
        status = 'UPCOMING'
      }

      return {
        id: payment?.id || `installment-${index + 1}`,
        number: index + 1,
        amount,
        dueDate,
        status,
        paidDate: payment?.createdAt,
        paymentIntentId: payment?.stripePaymentIntentId,
      }
    })
  })()

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
        <div className="flex flex-col sm:flex-row gap-2">
          {booking.trip && (
            <>
              <ModifyBookingButton
                bookingId={booking.id}
                bookingReference={booking.bookingReference}
                bookingStatus={booking.status}
                tripStartDate={booking.trip.startDate}
                tripAssigned={true}
                currentAddOns={booking.bookingAddOns.map((ba) => ({
                  id: ba.addOn.id,
                  name: ba.addOn.name,
                  price: ba.price
                }))}
                packageName={booking.package.name}
                duration={booking.duration}
                accommodationTier={booking.accommodationTier}
                currentTotal={booking.totalPrice}
              />
              <RescheduleBookingButton
                bookingId={booking.id}
                bookingReference={booking.bookingReference}
                bookingStatus={booking.status}
                tripName={booking.trip.destination}
                tripStartDate={booking.trip.startDate}
                tripEndDate={booking.trip.endDate}
                rescheduleCount={booking.rescheduleCount}
                companionBooking={booking.companionBookings[0] ? {
                  id: booking.companionBookings[0].id,
                  bookingReference: booking.companionBookings[0].bookingReference,
                  guestFirstName: booking.companionBookings[0].guestFirstName,
                  guestLastName: booking.companionBookings[0].guestLastName,
                  totalPrice: booking.companionBookings[0].totalPrice,
                } : undefined}
                primaryBooking={booking.primaryBooking ? {
                  id: booking.primaryBooking.id,
                  bookingReference: booking.primaryBooking.bookingReference,
                } : undefined}
                isCompanionBooking={booking.isCompanionBooking}
              />
              <CancelBookingButton
                bookingId={booking.id}
                bookingReference={booking.bookingReference}
                bookingStatus={booking.status}
                tripName={booking.trip.destination}
                tripStartDate={booking.trip.startDate}
                totalPrice={booking.totalPrice}
                companionBooking={booking.companionBookings[0] ? {
                  id: booking.companionBookings[0].id,
                  bookingReference: booking.companionBookings[0].bookingReference,
                  guestFirstName: booking.companionBookings[0].guestFirstName,
                  guestLastName: booking.companionBookings[0].guestLastName,
                  totalPrice: booking.companionBookings[0].totalPrice,
                } : undefined}
                primaryBooking={booking.primaryBooking ? {
                  id: booking.primaryBooking.id,
                  bookingReference: booking.primaryBooking.bookingReference,
                } : undefined}
                isCompanionBooking={booking.isCompanionBooking}
              />
            </>
          )}
          <Button variant="outline" size="sm" disabled>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Linked Booking Info (if companion booking or has companion) */}
      {(booking.companionBookings.length > 0 || booking.primaryBooking) && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Users className="h-5 w-5" />
              {booking.companionBookings.length > 0 ? 'Traveling With Companion' : 'Companion Booking'}
            </CardTitle>
            <CardDescription>
              {booking.companionBookings.length > 0
                ? 'This booking is linked with a companion booking'
                : 'This is a companion booking linked to a primary booking'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.companionBookings.length > 0 ? (
              <>
                {booking.companionBookings.map((companion) => {
                  const companionName = companion.guestFirstName && companion.guestLastName
                    ? `${companion.guestFirstName} ${companion.guestLastName}`
                    : 'Your Companion'

                  return (
                    <div key={companion.id} className="flex items-start justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{companionName}</h4>
                          <Badge variant={getStatusVariant(companion.status)}>
                            {getStatusLabel(companion.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Booking Reference: <span className="font-mono font-semibold">{companion.bookingReference}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Accommodation: {formatAccommodationTier(companion.accommodationTier)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: ${(companion.totalPrice / 100).toLocaleString()}
                        </p>
                      </div>
                      <Link href={`/dashboard/bookings/${companion.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  )
                })}
                <div className="pt-3 border-t">
                  <p className="text-sm text-center">
                    <span className="font-medium">Combined Total:</span>{' '}
                    <span className="text-lg font-semibold">
                      ${((booking.totalPrice + booking.companionBookings[0].totalPrice) / 100).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground ml-2">(2 bookings)</span>
                  </p>
                </div>
              </>
            ) : booking.primaryBooking && (
              <div className="flex items-start justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Primary Booking</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Booking Reference: <span className="font-mono font-semibold">{booking.primaryBooking.bookingReference}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This companion booking is linked to the primary booking above.
                  </p>
                </div>
                <Link href={`/dashboard/bookings/${booking.primaryBooking.id}`}>
                  <Button variant="outline" size="sm">
                    View Primary Booking
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                  You haven&apos;t selected a trip date yet. Choose your preferred dates to complete your booking.
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

          {/* Payment Schedule - E4-S6 (for installment plans) */}
          {booking.paymentPlan === 'INSTALLMENT_4' && paymentSchedule && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Payment Schedule
                </CardTitle>
                <CardDescription>
                  Your 4-installment payment plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentScheduleDisplay
                  bookingReference={booking.bookingReference}
                  totalAmount={booking.totalPrice}
                  schedule={paymentSchedule}
                  showTitle={false}
                  compact={false}
                />
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
                      className="flex items-start justify-between py-3 border-b last:border-0"
                    >
                      <div className="flex-1">
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
                        {payment.receiptNumber && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Receipt: {payment.receiptNumber}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={payment.status === 'SUCCEEDED' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                        {payment.status === 'SUCCEEDED' && payment.receiptUrl && (
                          <Link href={`/api/receipts/${payment.id}/download`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
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
