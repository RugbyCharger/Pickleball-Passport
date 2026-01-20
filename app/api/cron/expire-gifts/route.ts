/**
 * Gift Expiration Cron Job (GS-005)
 *
 * Daily cron job that automatically expires gifts that have passed their expiration date.
 * Gifts are expired after 30 days from the sent date without recipient response.
 *
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/expire-gifts",
 *     "schedule": "0 10 * * *"  // 10:00 AM UTC daily
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GiftState } from '@prisma/client'
import { transitionGiftState } from '@/lib/gift/gift-transition-service'
import { giftLogger, logError } from '@/lib/logger'

// Batch size for processing (rate limiting)
const BATCH_SIZE = 10

// Maximum gifts to process per execution (safety limit)
const MAX_GIFTS_PER_RUN = 100

// Delay between batches (milliseconds)
const BATCH_DELAY_MS = 1000

/**
 * GET /api/cron/expire-gifts
 *
 * Cron job endpoint - secured with CRON_SECRET
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()

  // 1. Verify authorization
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET not configured')
    return NextResponse.json({ error: 'Cron job not configured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('Unauthorized cron request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  giftLogger.info({ msg: '=== Gift Expiration Cron Job Started ===' })

  try {
    const now = new Date()

    // 2. Find all expired gifts
    // Gifts are expired if: giftStatus=SENT and giftExpiresAt <= now
    const expiredGifts = await prisma.booking.findMany({
      where: {
        isGift: true,
        giftStatus: 'SENT',
        giftExpiresAt: {
          lte: now,
        },
      },
      select: {
        id: true,
        bookingReference: true,
        giftRecipientName: true,
        giftRecipientEmail: true,
        giftExpiresAt: true,
        totalPrice: true,
      },
      orderBy: {
        giftExpiresAt: 'asc', // Process oldest first
      },
      take: MAX_GIFTS_PER_RUN,
    })

    giftLogger.info({
      msg: `Found ${expiredGifts.length} expired gifts to process`,
      count: expiredGifts.length,
    })

    if (expiredGifts.length === 0) {
      const executionTimeMs = Date.now() - startTime
      return NextResponse.json({
        processedAt: new Date().toISOString(),
        totalExpired: 0,
        successful: 0,
        failed: 0,
        executionTimeMs,
        message: 'No expired gifts to process',
      })
    }

    // 3. Process expired gifts in batches
    const results: Array<{
      bookingId: string
      bookingReference: string
      recipientName: string | null
      recipientEmail: string | null
      expiredAt: string | null
      totalPrice: number
      result: 'success' | 'failed'
      error?: string
    }> = []

    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < expiredGifts.length; i += BATCH_SIZE) {
      const batch = expiredGifts.slice(i, i + BATCH_SIZE)

      giftLogger.info({
        msg: `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}`,
        batchSize: batch.length,
      })

      // Process batch sequentially to avoid overwhelming Stripe
      for (const gift of batch) {
        try {
          // Transition to EXPIRED state
          const transitionResult = await transitionGiftState(
            gift.id,
            GiftState.EXPIRED,
            'cron',
            {
              customReason: 'Auto-expired: 30 days without recipient response',
            }
          )

          if (transitionResult.success) {
            successCount++
            giftLogger.info({
              msg: 'Gift expired successfully',
              bookingId: gift.id,
              bookingReference: gift.bookingReference,
              transitionId: transitionResult.transitionId,
            })

            results.push({
              bookingId: gift.id,
              bookingReference: gift.bookingReference,
              recipientName: gift.giftRecipientName,
              recipientEmail: gift.giftRecipientEmail,
              expiredAt: gift.giftExpiresAt?.toISOString() || null,
              totalPrice: gift.totalPrice,
              result: 'success',
            })
          } else {
            failedCount++
            giftLogger.error({
              msg: 'Failed to expire gift',
              bookingId: gift.id,
              bookingReference: gift.bookingReference,
              error: transitionResult.error,
            })

            results.push({
              bookingId: gift.id,
              bookingReference: gift.bookingReference,
              recipientName: gift.giftRecipientName,
              recipientEmail: gift.giftRecipientEmail,
              expiredAt: gift.giftExpiresAt?.toISOString() || null,
              totalPrice: gift.totalPrice,
              result: 'failed',
              error: transitionResult.error,
            })
          }
        } catch (error) {
          failedCount++
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'

          logError(giftLogger, error, `Failed to process gift expiration`)

          results.push({
            bookingId: gift.id,
            bookingReference: gift.bookingReference,
            recipientName: gift.giftRecipientName,
            recipientEmail: gift.giftRecipientEmail,
            expiredAt: gift.giftExpiresAt?.toISOString() || null,
            totalPrice: gift.totalPrice,
            result: 'failed',
            error: errorMessage,
          })
        }
      }

      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < expiredGifts.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
      }
    }

    const executionTimeMs = Date.now() - startTime

    // 4. Log summary
    giftLogger.info({
      msg: '=== Gift Expiration Cron Job Complete ===',
      totalFound: expiredGifts.length,
      successful: successCount,
      failed: failedCount,
      executionTimeMs,
    })

    // 5. Return summary
    return NextResponse.json({
      processedAt: new Date().toISOString(),
      totalExpired: expiredGifts.length,
      successful: successCount,
      failed: failedCount,
      executionTimeMs,
      results,
    })
  } catch (error) {
    logError(giftLogger, error, 'Fatal error in gift expiration cron job')

    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
