/**
 * Scheduled Gifts Cron Job (GS-006)
 *
 * Sends scheduled gift notifications and transitions to SENT state.
 * Uses gift state machine for transition and audit logging.
 *
 * Runs daily at 9:00 AM PST (16:00 UTC)
 *
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-scheduled-gifts",
 *     "schedule": "0 16 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GiftState } from '@prisma/client'
import { transitionGiftState } from '@/lib/gift/gift-transition-service'
import { giftLogger, logError } from '@/lib/logger'

// Batch size for processing
const BATCH_SIZE = 10

// Maximum gifts to process per execution
const MAX_GIFTS_PER_RUN = 100

/**
 * GET /api/cron/send-scheduled-gifts
 *
 * Cron job endpoint - secured with CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      giftLogger.error({ job: 'send-scheduled-gifts' }, 'CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron job not configured' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      giftLogger.warn({ job: 'send-scheduled-gifts' }, 'Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    giftLogger.info({ msg: '=== Send Scheduled Gifts Cron Job Started ===' })

    // Query pending gifts with delivery date <= today
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today

    const giftsToSend = await prisma.booking.findMany({
      where: {
        isGift: true,
        giftStatus: 'PENDING',
        giftDeliveryDate: {
          lte: today,
        },
      },
      select: {
        id: true,
        bookingReference: true,
        giftRecipientName: true,
        giftRecipientEmail: true,
        giftDeliveryDate: true,
        totalPrice: true,
      },
      orderBy: {
        giftDeliveryDate: 'asc', // Process oldest first
      },
      take: MAX_GIFTS_PER_RUN,
    })

    giftLogger.info({
      msg: `Found ${giftsToSend.length} scheduled gifts to send`,
      count: giftsToSend.length,
    })

    if (giftsToSend.length === 0) {
      const executionTimeMs = Date.now() - startTime
      return NextResponse.json({
        success: true,
        processedAt: new Date().toISOString(),
        total: 0,
        sent: 0,
        failed: 0,
        executionTimeMs,
        message: 'No scheduled gifts to send',
      })
    }

    const results: Array<{
      bookingId: string
      bookingReference: string
      recipientName: string | null
      recipientEmail: string | null
      result: 'sent' | 'failed'
      error?: string
    }> = []

    let sentCount = 0
    let failedCount = 0

    // Process gifts in batches
    for (let i = 0; i < giftsToSend.length; i += BATCH_SIZE) {
      const batch = giftsToSend.slice(i, i + BATCH_SIZE)

      giftLogger.info({
        msg: `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}`,
        batchSize: batch.length,
      })

      // Process batch sequentially for reliability
      for (const gift of batch) {
        try {
          // Use state machine to transition from PENDING to SENT
          // This handles:
          // 1. Validation
          // 2. Sending the notification email
          // 3. Setting giftExpiresAt
          // 4. Recording the transition in audit log
          const transitionResult = await transitionGiftState(
            gift.id,
            GiftState.SENT,
            'cron',
            {
              customReason: 'Scheduled gift notification sent',
            }
          )

          if (transitionResult.success) {
            sentCount++
            giftLogger.info({
              msg: 'Gift notification sent successfully',
              bookingId: gift.id,
              bookingReference: gift.bookingReference,
              transitionId: transitionResult.transitionId,
            })

            results.push({
              bookingId: gift.id,
              bookingReference: gift.bookingReference,
              recipientName: gift.giftRecipientName,
              recipientEmail: gift.giftRecipientEmail,
              result: 'sent',
            })
          } else {
            failedCount++
            giftLogger.error({
              msg: 'Failed to send gift notification',
              bookingId: gift.id,
              bookingReference: gift.bookingReference,
              error: transitionResult.error,
            })

            results.push({
              bookingId: gift.id,
              bookingReference: gift.bookingReference,
              recipientName: gift.giftRecipientName,
              recipientEmail: gift.giftRecipientEmail,
              result: 'failed',
              error: transitionResult.error,
            })
          }
        } catch (error) {
          failedCount++
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'

          logError(giftLogger, error, `Failed to process scheduled gift`)

          results.push({
            bookingId: gift.id,
            bookingReference: gift.bookingReference,
            recipientName: gift.giftRecipientName,
            recipientEmail: gift.giftRecipientEmail,
            result: 'failed',
            error: errorMessage,
          })
        }
      }
    }

    const executionTimeMs = Date.now() - startTime

    // Log summary
    giftLogger.info({
      msg: '=== Send Scheduled Gifts Cron Job Complete ===',
      total: giftsToSend.length,
      sent: sentCount,
      failed: failedCount,
      executionTimeMs,
    })

    return NextResponse.json({
      success: true,
      processedAt: new Date().toISOString(),
      message: `Sent ${sentCount} of ${giftsToSend.length} scheduled gifts`,
      total: giftsToSend.length,
      sent: sentCount,
      failed: failedCount,
      executionTimeMs,
      results,
    })
  } catch (error) {
    logError(giftLogger, error, 'Fatal error in send scheduled gifts cron job')

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Use Node.js runtime for Prisma transactions (Edge runtime not supported)
export const dynamic = 'force-dynamic'
