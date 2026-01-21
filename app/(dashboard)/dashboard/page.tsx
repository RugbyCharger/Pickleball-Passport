/**
 * Guest Dashboard
 *
 * Main dashboard for guests to view bookings, manage profile, and access key features.
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, CreditCard, FileText, Bell, ArrowRight, MapPin, CheckSquare } from 'lucide-react'
import { prisma } from '@/lib/db'
import { GuestTaskSection } from './guest-task-section'
import { WhatsAppGroupsSection } from './whatsapp-groups-section'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch user's active bookings
  const activeBookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      status: {
        in: ['PENDING_PAYMENT', 'CONFIRMED'],
      },
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
          whatsappGroupInviteLink: true,
          whatsappGroupStatus: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
  })

  // Get total bookings count
  const totalBookings = await prisma.booking.count({
    where: {
      userId: user.id,
    },
  })

  // Get pending tasks count for stats
  const pendingTasksCount = await prisma.task.count({
    where: {
      assignedToUserId: user.id,
      status: {
        in: ['PENDING', 'IN_PROGRESS'],
      },
    },
  })

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Welcome back, {user.firstName || 'Guest'}!
        </h2>
        <p className="text-muted-foreground">
          Track your transformation journey and manage your bookings.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Active Bookings</CardDescription>
            <CardTitle className="text-3xl">{activeBookings.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-3xl">{totalBookings}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Upcoming Trips</CardDescription>
            <CardTitle className="text-3xl">
              {activeBookings.filter((b) => b.tripId !== null).length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Pending Tasks</CardDescription>
            <CardTitle className="text-3xl">{pendingTasksCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Active Bookings Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Active Bookings</h3>
          {totalBookings > 0 && (
            <Link href="/dashboard/bookings">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {activeBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="font-semibold mb-2">No Active Bookings</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Ready to start your transformation journey?
              </p>
              <Link href="/packages">
                <Button>Browse Packages</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{booking.package.name}</h4>
                        <Badge variant={getStatusVariant(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">Reference:</span> {booking.bookingReference}
                        </p>
                        <p>
                          <span className="font-medium">Duration:</span> {booking.duration} days
                        </p>
                        {booking.trip && (
                          <div className="flex items-center gap-1 mt-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {booking.trip.destination} • {new Date(booking.trip.startDate).toLocaleDateString()} - {new Date(booking.trip.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link href={`/dashboard/bookings/${booking.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Groups Section */}
      <WhatsAppGroupsSection
        bookingIds={activeBookings
          .filter(
            (b) =>
              b.status === 'CONFIRMED' &&
              b.trip?.whatsappGroupInviteLink &&
              b.trip?.whatsappGroupStatus === 'ACTIVE'
          )
          .map((b) => b.id)}
      />

      {/* Tasks Section */}
      <GuestTaskSection userId={user.id} />

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/bookings">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-6 flex flex-col items-center text-center gap-2">
                <Calendar className="h-8 w-8 text-primary" />
                <h4 className="font-semibold">My Bookings</h4>
                <p className="text-xs text-muted-foreground">
                  View all bookings
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/payments">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-6 flex flex-col items-center text-center gap-2">
                <CreditCard className="h-8 w-8 text-primary" />
                <h4 className="font-semibold">Payments</h4>
                <p className="text-xs text-muted-foreground">
                  View payment history
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/documents">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-6 flex flex-col items-center text-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <h4 className="font-semibold">Documents</h4>
                <p className="text-xs text-muted-foreground">
                  Upload documents
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/notifications">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-6 flex flex-col items-center text-center gap-2">
                <Bell className="h-8 w-8 text-primary" />
                <h4 className="font-semibold">Notifications</h4>
                <p className="text-xs text-muted-foreground">
                  Manage preferences
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Get badge variant based on booking status
 */
function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
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
function getStatusLabel(status: string): string {
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
