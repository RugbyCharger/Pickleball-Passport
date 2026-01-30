import { NextResponse } from 'next/server'
import { createAppCaller } from '@/lib/trpc/server/caller'

export const GET = async (req: Request) => {
  const { ctx } = await createAppCaller(req.headers)

  if (!ctx.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = ctx.user.id
  const now = new Date()

  // Fetch user data in parallel
  const [
    user,
    guestProfile,
    partnerProfile,
    bookings,
    unreadNotificationCount,
    pendingDocuments,
    openSupportTickets,
  ] = await Promise.all([
    // Basic user info
    ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),

    // Guest profile
    ctx.db.guestProfile.findUnique({
      where: { userId },
      select: {
        firstName: true,
        lastName: true,
        phone: true,
        location: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
      },
    }),

    // Partner profile with referral count
    ctx.db.partnerProfile.findUnique({
      where: { userId },
      select: {
        clubName: true,
        clubLocation: true,
        referralCode: true,
        tier: true,
        passportPoints: true,
        onboardingCompleted: true,
        _count: {
          select: {
            referrals: true,
          },
        },
      },
    }),

    // Active bookings with trip and add-on info
    ctx.db.booking.findMany({
      where: {
        userId,
        status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'] },
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        bookingReference: true,
        status: true,
        totalPrice: true,
        currency: true,
        createdAt: true,
        package: {
          select: {
            name: true,
            slug: true,
          },
        },
        trip: {
          select: {
            id: true,
            name: true,
            destination: true,
            startDate: true,
            endDate: true,
          },
        },
        bookingAddOns: {
          select: {
            addOn: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
    }),

    // Unread notification count (readAt is null)
    ctx.db.notification.count({
      where: {
        userId,
        readAt: null,
      },
    }),

    // Pending documents
    ctx.db.document.findMany({
      where: {
        userId,
        status: { in: ['PENDING_REVIEW', 'REJECTED'] },
      },
      select: {
        id: true,
        type: true,
        status: true,
        fileName: true,
      },
    }),

    // Open support tickets
    ctx.db.supportTicket.count({
      where: {
        userId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    }),
  ])

  // Process bookings into upcoming/active/past
  const upcomingTrip = bookings.find(
    (b) => b.trip && new Date(b.trip.startDate) > now && b.status === 'CONFIRMED'
  )

  const activeTrip = bookings.find(
    (b) =>
      b.trip &&
      new Date(b.trip.startDate) <= now &&
      new Date(b.trip.endDate) >= now &&
      b.status === 'CONFIRMED'
  )

  // Calculate days until next trip
  let daysUntilTrip: number | null = null
  if (upcomingTrip?.trip) {
    const tripStart = new Date(upcomingTrip.trip.startDate)
    daysUntilTrip = Math.ceil((tripStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Build context response
  const context = {
    user: {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      memberSince: user?.createdAt,
    },

    profile: guestProfile
      ? {
          name: [guestProfile.firstName, guestProfile.lastName].filter(Boolean).join(' ') || null,
          firstName: guestProfile.firstName,
          lastName: guestProfile.lastName,
          phone: guestProfile.phone,
          location: guestProfile.location,
          hasEmergencyContact: !!(
            guestProfile.emergencyContactName && guestProfile.emergencyContactPhone
          ),
        }
      : null,

    partner: partnerProfile
      ? {
          clubName: partnerProfile.clubName,
          clubLocation: partnerProfile.clubLocation,
          referralCode: partnerProfile.referralCode,
          tier: partnerProfile.tier,
          passportPoints: partnerProfile.passportPoints,
          onboardingCompleted: partnerProfile.onboardingCompleted,
          totalReferrals: partnerProfile._count.referrals,
        }
      : null,

    bookings: {
      total: bookings.length,
      pendingPayment: bookings.filter((b) => b.status === 'PENDING_PAYMENT').length,
      confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      recent: bookings.slice(0, 3).map((b) => ({
        id: b.id,
        reference: b.bookingReference,
        status: b.status,
        package: b.package?.name,
        trip: b.trip
          ? {
              name: b.trip.name,
              destination: b.trip.destination,
              startDate: b.trip.startDate,
              endDate: b.trip.endDate,
            }
          : null,
        totalPrice: b.totalPrice,
        currency: b.currency,
        addOnCount: b.bookingAddOns.length,
      })),
    },

    upcomingTrip: upcomingTrip?.trip
      ? {
          bookingId: upcomingTrip.id,
          bookingReference: upcomingTrip.bookingReference,
          tripId: upcomingTrip.trip.id,
          name: upcomingTrip.trip.name,
          destination: upcomingTrip.trip.destination,
          startDate: upcomingTrip.trip.startDate,
          endDate: upcomingTrip.trip.endDate,
          daysUntil: daysUntilTrip,
        }
      : null,

    activeTrip: activeTrip?.trip
      ? {
          bookingId: activeTrip.id,
          bookingReference: activeTrip.bookingReference,
          tripId: activeTrip.trip.id,
          name: activeTrip.trip.name,
          destination: activeTrip.trip.destination,
          startDate: activeTrip.trip.startDate,
          endDate: activeTrip.trip.endDate,
        }
      : null,

    pendingActions: {
      unreadNotifications: unreadNotificationCount,
      pendingDocuments: pendingDocuments.map((d) => ({
        id: d.id,
        type: d.type,
        status: d.status,
        fileName: d.fileName,
      })),
      openSupportTickets,
    },

    capabilities: [
      'View and manage bookings',
      'Browse packages, trips, and add-ons',
      'Create and track support tickets',
      'Upload and manage documents',
      'Update profile information',
      'View and manage notifications',
      ...(partnerProfile ? ['Track referrals and commissions', 'View partner analytics'] : []),
    ],

    timestamp: now.toISOString(),
  }

  return NextResponse.json(context)
}
