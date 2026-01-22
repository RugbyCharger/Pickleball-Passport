/**
 * Reminder Router
 *
 * tRPC procedures for trip reminder operations:
 * - Get upcoming trips requiring reminders
 * - Send reminder emails with tracking
 * - View reminder history
 */

import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { generateTripReminderEmail } from '@/lib/email/templates/trip-reminder'
import { sendEmail } from '@/lib/email/sendgrid'
import { canSendNotification } from '@/lib/preferences/user-preferences'
import { emailLogger } from '@/lib/logger'

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const diffMs = date2.getTime() - date1.getTime()
  return Math.floor(diffMs / msPerDay)
}

export const reminderRouter = router({
  /**
   * Get upcoming trips requiring reminders
   * Returns trips grouped by reminder type (30/7/1 day)
   */
  getUpcomingTrips: adminProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const thirtyDaysOut = new Date()
    thirtyDaysOut.setDate(now.getDate() + 30)

    // Get all confirmed bookings with upcoming trips
    const bookings = await ctx.db.booking.findMany({
      where: {
        status: 'CONFIRMED',
        trip: {
          startDate: {
            gte: now, // Trip hasn't started yet
            lte: thirtyDaysOut, // Within next 30 days
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        package: {
          select: {
            name: true,
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
          include: {
            addOn: {
              select: {
                name: true,
              },
            },
          },
        },
        reminderHistory: {
          orderBy: {
            sentAt: 'desc',
          },
        },
      },
      orderBy: {
        trip: {
          startDate: 'asc',
        },
      },
    })

    // Categorize by reminder type
    const reminders = {
      thirtyDay: [] as typeof bookings,
      sevenDay: [] as typeof bookings,
      oneDay: [] as typeof bookings,
    }

    for (const booking of bookings) {
      if (!booking.trip) continue

      const daysUntil = daysBetween(now, booking.trip.startDate)
      const hasSent30Day = booking.reminderHistory.some(r => r.reminderType === '30_DAY')
      const hasSent7Day = booking.reminderHistory.some(r => r.reminderType === '7_DAY')
      const hasSent1Day = booking.reminderHistory.some(r => r.reminderType === '1_DAY')

      // 30-day reminder: send between 30-28 days out
      if (daysUntil >= 28 && daysUntil <= 30 && !hasSent30Day) {
        reminders.thirtyDay.push(booking)
      }
      // 7-day reminder: send between 7-6 days out
      else if (daysUntil >= 6 && daysUntil <= 7 && !hasSent7Day) {
        reminders.sevenDay.push(booking)
      }
      // 1-day reminder: send on day before or day of
      else if (daysUntil >= 0 && daysUntil <= 1 && !hasSent1Day) {
        reminders.oneDay.push(booking)
      }
    }

    return reminders
  }),

  /**
   * Send reminder email for a specific booking
   * Creates ReminderHistory entry to track sent reminders
   */
  sendReminder: adminProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
        reminderType: z.enum(['30_DAY', '7_DAY', '1_DAY']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get booking with full details
      const booking = await ctx.db.booking.findUnique({
        where: {
          id: input.bookingId,
          status: 'CONFIRMED',
        },
        include: {
          user: {
            include: {
              guestProfile: true,
            },
          },
          package: true,
          trip: true,
          bookingAddOns: {
            include: {
              addOn: true,
            },
          },
          reminderHistory: {
            where: {
              reminderType: input.reminderType,
            },
          },
        },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found or not confirmed',
        })
      }

      if (!booking.trip) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Booking does not have a trip assigned',
        })
      }

      // Check if reminder already sent
      if (booking.reminderHistory.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This reminder has already been sent for this booking',
        })
      }

      // Calculate days until trip
      const now = new Date()
      const daysUntil = daysBetween(now, booking.trip.startDate)

      // Check preference before sending (E11-S12)
      const canSend = await canSendNotification(booking.user.id, 'emailPreTripSequence')
      if (!canSend) {
        emailLogger.info(
          { userId: booking.user.id, bookingId: booking.id },
          'User opted out of pre-trip emails, skipping reminder'
        )
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'User has opted out of pre-trip reminder emails',
        })
      }

      // Generate email
      const emailData = generateTripReminderEmail({
        userId: booking.user.id, // For preference token generation (E11-S12)
        firstName: booking.user.guestProfile?.firstName || 'Traveler',
        email: booking.user.email,
        bookingReference: booking.bookingReference,
        packageName: booking.package.name,
        tripStartDate: booking.trip.startDate.toISOString(),
        tripEndDate: booking.trip.endDate.toISOString(),
        destination: booking.trip.destination,
        accommodationTier: booking.accommodationTier,
        daysUntilTrip: daysUntil,
        checklistItems: [
          { item: 'Upload passport copy to your portal', completed: false },
          { item: 'Complete medical questionnaire', completed: false },
          { item: 'Confirm travel insurance details', completed: false },
          { item: 'Review and sign consent forms', completed: false },
        ],
        addOns: booking.bookingAddOns.map(ba => ({
          name: ba.addOn.name,
          quantity: ba.quantity,
        })),
        portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard`,
      })

      // Send email
      await sendEmail({
        to: booking.user.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        userId: booking.user.id, // For List-Unsubscribe header (E11-S12)
        isMarketing: false, // Pre-trip reminders are not marketing
      })

      // Create reminder history entry
      await ctx.db.reminderHistory.create({
        data: {
          bookingId: booking.id,
          reminderType: input.reminderType,
          sentBy: ctx.user!.id, // Admin who triggered it
        },
      })

      return {
        success: true,
        bookingReference: booking.bookingReference,
        sentTo: booking.user.email,
      }
    }),

  /**
   * Send bulk reminders for a specific reminder type
   * Sends to all eligible bookings and returns results
   */
  sendBulkReminders: adminProcedure
    .input(
      z.object({
        reminderType: z.enum(['30_DAY', '7_DAY', '1_DAY']),
        bookingIds: z.array(z.string().cuid()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const results = {
        successful: [] as string[],
        failed: [] as { bookingId: string; error: string }[],
      }

      for (const bookingId of input.bookingIds) {
        try {
          // Get booking with full details
          const booking = await ctx.db.booking.findUnique({
            where: {
              id: bookingId,
              status: 'CONFIRMED',
            },
            include: {
              user: {
                include: {
                  guestProfile: true,
                },
              },
              package: true,
              trip: true,
              bookingAddOns: {
                include: {
                  addOn: true,
                },
              },
              reminderHistory: {
                where: {
                  reminderType: input.reminderType,
                },
              },
            },
          })

          if (!booking || !booking.trip) {
            results.failed.push({
              bookingId,
              error: 'Booking not found or no trip assigned',
            })
            continue
          }

          // Skip if already sent
          if (booking.reminderHistory.length > 0) {
            results.failed.push({
              bookingId,
              error: 'Reminder already sent',
            })
            continue
          }

          // Calculate days until trip
          const now = new Date()
          const daysUntil = daysBetween(now, booking.trip.startDate)

          // Generate and send email
          const emailData = generateTripReminderEmail({
            firstName: booking.user.guestProfile?.firstName || 'Traveler',
            email: booking.user.email,
            bookingReference: booking.bookingReference,
            packageName: booking.package.name,
            tripStartDate: booking.trip.startDate.toISOString(),
            tripEndDate: booking.trip.endDate.toISOString(),
            destination: booking.trip.destination,
            accommodationTier: booking.accommodationTier,
            daysUntilTrip: daysUntil,
            checklistItems: [
              { item: 'Upload passport copy to your portal', completed: false },
              { item: 'Complete medical questionnaire', completed: false },
              { item: 'Confirm travel insurance details', completed: false },
              { item: 'Review and sign consent forms', completed: false },
            ],
            addOns: booking.bookingAddOns.map(ba => ({
              name: ba.addOn.name,
              quantity: ba.quantity,
            })),
            portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard`,
          })

          await sendEmail({
            to: booking.user.email,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
          })

          // Create reminder history
          await ctx.db.reminderHistory.create({
            data: {
              bookingId: booking.id,
              reminderType: input.reminderType,
              sentBy: ctx.user!.id,
            },
          })

          results.successful.push(bookingId)
        } catch (error) {
          results.failed.push({
            bookingId,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      return results
    }),

  /**
   * Get reminder history for a specific booking
   * Shows all reminders sent for this booking
   */
  getReminderHistory: adminProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const history = await ctx.db.reminderHistory.findMany({
        where: {
          bookingId: input.bookingId,
        },
        orderBy: {
          sentAt: 'desc',
        },
      })

      return history
    }),

  /**
   * Get all reminder history (admin analytics)
   * Shows all sent reminders across all bookings
   */
  getAllReminderHistory: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const [history, total] = await Promise.all([
        ctx.db.reminderHistory.findMany({
          take: input.limit,
          skip: input.offset,
          orderBy: {
            sentAt: 'desc',
          },
          include: {
            booking: {
              select: {
                bookingReference: true,
                user: {
                  select: {
                    email: true,
                    guestProfile: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
                trip: {
                  select: {
                    name: true,
                    startDate: true,
                  },
                },
              },
            },
          },
        }),
        ctx.db.reminderHistory.count(),
      ])

      return {
        history,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),
})
