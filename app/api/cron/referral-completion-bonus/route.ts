/**
 * Referral Completion Bonus Cron Job
 * Epic 10 - US-005: Post-Trip Completion Bonus
 *
 * Daily cron job that:
 * 1. Finds trips that ended yesterday
 * 2. Awards 500 bonus points to referrers
 * 3. Creates COMPLETION ReferralEvent
 * 4. Updates GuestReferral status to COMPLETED
 * 5. Sends notification email to referrer
 *
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email/send-email';
import { generateGuestReferralCompletionEmail } from '@/lib/email/templates/guest-referral-completion';
import { GUEST_REFERRAL_POINTS_CONFIG } from '@/lib/config/business-constants';
import { cronLogger, partnerLogger, emailLogger, logError } from '@/lib/logger';

/**
 * GET /api/cron/referral-completion-bonus
 *
 * Cron job endpoint - secured with CRON_SECRET
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  // 1. Verify authorization
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    cronLogger.error({ job: 'referral-completion-bonus' }, 'CRON_SECRET not configured');
    return NextResponse.json(
      { error: 'Cron job not configured' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    cronLogger.warn({ job: 'referral-completion-bonus' }, 'Unauthorized cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  cronLogger.info({ job: 'referral-completion-bonus' }, 'Referral Completion Bonus Cron Job Started');

  try {
    // 2. Calculate date range for trips that ended yesterday
    const now = new Date();
    const yesterdayStart = new Date(now);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(now);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    cronLogger.info({
      job: 'referral-completion-bonus',
      dateRangeStart: yesterdayStart.toISOString(),
      dateRangeEnd: yesterdayEnd.toISOString(),
    }, 'Looking for trips ended in date range');

    // 3. Find completed bookings with referral codes from trips that ended yesterday
    // A booking is eligible if:
    // - The trip ended yesterday
    // - It has a referredBy code (was referred)
    // - Status is CONFIRMED or COMPLETED
    // - No COMPLETION event exists yet for this referral (prevent duplicates)
    const completedBookings = await prisma.booking.findMany({
      where: {
        trip: {
          endDate: {
            gte: yesterdayStart,
            lte: yesterdayEnd,
          },
        },
        referredBy: {
          not: null,
        },
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
      },
      include: {
        trip: true,
        package: true,
        user: {
          include: {
            guestProfile: true,
          },
        },
      },
    });

    cronLogger.info({
      job: 'referral-completion-bonus',
      count: completedBookings.length,
    }, 'Found bookings with referral codes from completed trips');

    // Process results tracking
    const results: Array<{
      bookingId: string;
      bookingReference: string;
      referralCode: string;
      referrerType: 'partner' | 'guest' | 'unknown';
      pointsAwarded: number;
      status: 'success' | 'skipped_duplicate' | 'skipped_no_referrer' | 'error';
      error?: string;
    }> = [];

    let successCount = 0;
    let skippedDuplicateCount = 0;
    let skippedNoReferrerCount = 0;
    let errorCount = 0;

    // 4. Process each completed booking
    for (const booking of completedBookings) {
      const referralCode = booking.referredBy!;

      try {
        // Check if COMPLETION event already exists (prevent duplicates)
        const existingCompletionEvent = await prisma.referralEvent.findFirst({
          where: {
            referralCode,
            eventType: 'COMPLETION',
            userId: booking.userId,
          },
        });

        if (existingCompletionEvent) {
          cronLogger.debug({
            job: 'referral-completion-bonus',
            bookingReference: booking.bookingReference,
          }, 'Skipping - completion bonus already awarded');
          results.push({
            bookingId: booking.id,
            bookingReference: booking.bookingReference,
            referralCode,
            referrerType: 'unknown',
            pointsAwarded: 0,
            status: 'skipped_duplicate',
          });
          skippedDuplicateCount++;
          continue;
        }

        // Find the referrer (check both partner and guest codes)
        const [partnerProfile, referrerUser] = await Promise.all([
          prisma.partnerProfile.findUnique({
            where: { referralCode },
            include: { user: true },
          }),
          prisma.user.findFirst({
            where: { referralCode },
            include: { guestProfile: true },
          }),
        ]);

        if (!partnerProfile && !referrerUser) {
          cronLogger.warn({
            job: 'referral-completion-bonus',
            bookingReference: booking.bookingReference,
            referralCode,
          }, 'Skipping - referrer not found for code');
          results.push({
            bookingId: booking.id,
            bookingReference: booking.bookingReference,
            referralCode,
            referrerType: 'unknown',
            pointsAwarded: 0,
            status: 'skipped_no_referrer',
          });
          skippedNoReferrerCount++;
          continue;
        }

        const isPartnerReferral = !!partnerProfile;
        const bonusPoints = GUEST_REFERRAL_POINTS_CONFIG.COMPLETION_BONUS_POINTS;

        // Perform all updates in a transaction
        await prisma.$transaction(async (tx) => {
          // 5a. Create ReferralEvent with type COMPLETION
          await tx.referralEvent.create({
            data: {
              referralCode,
              eventType: 'COMPLETION',
              userId: booking.userId,
            },
          });

          // 5b. Award bonus points
          if (isPartnerReferral) {
            // Award to partner's passportPoints
            await tx.partnerProfile.update({
              where: { id: partnerProfile.id },
              data: {
                passportPoints: {
                  increment: bonusPoints,
                },
              },
            });
          } else {
            // Award to guest's referralPointsBalance
            await tx.user.update({
              where: { id: referrerUser!.id },
              data: {
                referralPointsBalance: {
                  increment: bonusPoints,
                },
              },
            });

            // 5c. Update GuestReferral status to COMPLETED (if it exists)
            await tx.guestReferral.updateMany({
              where: {
                referrerUserId: referrerUser!.id,
                referredUserId: booking.userId,
                status: { not: 'COMPLETED' },
              },
              data: {
                status: 'COMPLETED',
                pointsEarned: {
                  increment: bonusPoints,
                },
              },
            });
          }

          // 5d. Mark booking as COMPLETED if still CONFIRMED
          if (booking.status === 'CONFIRMED') {
            await tx.booking.update({
              where: { id: booking.id },
              data: { status: 'COMPLETED' },
            });
          }
        });

        // 6. Send notification email to referrer
        const referrerEmail = isPartnerReferral
          ? partnerProfile.user.email
          : referrerUser!.email;
        const referrerName = isPartnerReferral
          ? partnerProfile.clubName
          : referrerUser!.guestProfile?.firstName || 'Referrer';

        // Get updated points balance
        const newBalance = isPartnerReferral
          ? (await prisma.partnerProfile.findUnique({
              where: { id: partnerProfile.id },
              select: { passportPoints: true },
            }))?.passportPoints || 0
          : (await prisma.user.findUnique({
              where: { id: referrerUser!.id },
              select: { referralPointsBalance: true },
            }))?.referralPointsBalance || 0;

        const guestName = booking.user.guestProfile
          ? `${booking.user.guestProfile.firstName} ${booking.user.guestProfile.lastName}`
          : 'A guest';

        try {
          const emailData = {
            referrerName,
            referrerEmail,
            guestName,
            packageName: booking.package.name,
            tripDates: {
              start: booking.trip!.startDate.toISOString(),
              end: booking.trip!.endDate.toISOString(),
            },
            bonusPointsEarned: bonusPoints,
            newPointsBalance: newBalance,
          };

          const { html, text, subject } = generateGuestReferralCompletionEmail(emailData);

          await sendEmail({
            to: referrerEmail,
            subject,
            html,
            text,
          });

          emailLogger.info({
            job: 'referral-completion-bonus',
            bookingReference: booking.bookingReference,
          }, 'Referral completion email sent');
        } catch (emailError) {
          logError(emailLogger, emailError, 'Failed to send referral completion email', {
            job: 'referral-completion-bonus',
            bookingReference: booking.bookingReference,
          });
          // Don't fail the whole operation if email fails
        }

        results.push({
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          referralCode,
          referrerType: isPartnerReferral ? 'partner' : 'guest',
          pointsAwarded: bonusPoints,
          status: 'success',
        });
        successCount++;

        partnerLogger.info({
          job: 'referral-completion-bonus',
          bookingReference: booking.bookingReference,
          bonusPoints,
          referrerType: isPartnerReferral ? 'partner' : 'guest',
        }, 'Awarded bonus points for completed referral');
      } catch (error) {
        logError(cronLogger, error, 'Error processing booking for referral completion bonus', {
          bookingReference: booking.bookingReference,
        });
        results.push({
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          referralCode,
          referrerType: 'unknown',
          pointsAwarded: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        errorCount++;
      }
    }

    const executionTimeMs = Date.now() - startTime;

    // 7. Log summary
    cronLogger.info({
      job: 'referral-completion-bonus',
      totalBookingsFound: completedBookings.length,
      successfullyProcessed: successCount,
      skippedDuplicate: skippedDuplicateCount,
      skippedNoReferrer: skippedNoReferrerCount,
      errors: errorCount,
      executionTimeMs,
    }, 'Referral Completion Bonus Cron Job Complete');

    // 8. Return summary
    return NextResponse.json({
      processedAt: new Date().toISOString(),
      dateRange: {
        start: yesterdayStart.toISOString(),
        end: yesterdayEnd.toISOString(),
      },
      totalBookingsFound: completedBookings.length,
      successful: successCount,
      skippedDuplicate: skippedDuplicateCount,
      skippedNoReferrer: skippedNoReferrerCount,
      errors: errorCount,
      totalPointsAwarded: results
        .filter((r) => r.status === 'success')
        .reduce((sum, r) => sum + r.pointsAwarded, 0),
      executionTimeMs,
      results,
    });
  } catch (error) {
    logError(cronLogger, error, 'Fatal error in referral-completion-bonus cron job');

    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
