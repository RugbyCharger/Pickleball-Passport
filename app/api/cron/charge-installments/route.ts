/**
 * Charge Installments Cron Job
 * E4-S6 Phase 8
 *
 * Daily cron job (9 AM UTC) that charges due installment payments
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { chargeInstallment } from '@/lib/payments/charge-installment'
import { isRetryEligible } from '@/lib/payments/retry-calculator'

// Maximum payments to process per execution (safety limit)
const MAX_PAYMENTS_PER_RUN = 100

// Batch size for processing (rate limiting)
const BATCH_SIZE = 10

// Delay between batches (milliseconds)
const BATCH_DELAY_MS = 1000

/**
 * GET /api/cron/charge-installments
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
    return NextResponse.json(
      { error: 'Cron job not configured' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('Unauthorized cron request')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('=== Charge Installments Cron Job Started ===')

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Start of day

    // 2. Find all due payments (new + retry eligible)
    const duePayments = await prisma.paymentRecord.findMany({
      where: {
        status: 'PENDING',
        OR: [
          // New payments due today or overdue
          {
            dueDate: { lte: today },
            retryCount: 0,
          },
          // Failed payments ready for retry (attempts 1-3)
          {
            retryCount: { gte: 1, lt: 4 },
            lastAttemptAt: { not: null },
          },
        ],
      },
      include: {
        booking: {
          include: {
            user: true,
            trip: true,
            package: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc', // Process oldest first
      },
      take: MAX_PAYMENTS_PER_RUN,
    })

    console.log(`Found ${duePayments.length} payments to process`)

    // Filter out payments not yet eligible for retry
    const eligiblePayments = duePayments.filter((payment) => {
      if (payment.retryCount === 0) {
        return true // New payment
      }

      if (!payment.lastAttemptAt) {
        return false // Missing attempt date
      }

      return isRetryEligible(payment.lastAttemptAt, payment.retryCount, today)
    })

    console.log(`${eligiblePayments.length} payments are eligible for charging`)

    // 3. Process payments in batches
    const results: Array<{
      paymentRecordId: string
      bookingReference: string
      installmentNumber: number
      amountCents: number
      result: 'success' | 'failed_retry' | 'failed_permanent' | 'error'
      errorCode?: string
      stripePaymentIntentId?: string
    }> = []

    let successCount = 0
    let failedRetryCount = 0
    let failedPermanentCount = 0
    let errorCount = 0

    for (let i = 0; i < eligiblePayments.length; i += BATCH_SIZE) {
      const batch = eligiblePayments.slice(i, i + BATCH_SIZE)

      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} payments)`)

      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map(async (payment) => {
          try {
            const result = await chargeInstallment({
              paymentRecordId: payment.id,
            })

            let resultType: 'success' | 'failed_retry' | 'failed_permanent' | 'error'
            if (result.success) {
              resultType = 'success'
              successCount++
            } else if (result.isPermanentFailure) {
              resultType = 'failed_permanent'
              failedPermanentCount++
            } else if (result.shouldRetry) {
              resultType = 'failed_retry'
              failedRetryCount++
            } else {
              resultType = 'error'
              errorCount++
            }

            return {
              paymentRecordId: payment.id,
              bookingReference: payment.booking.bookingReference,
              installmentNumber: payment.installmentNumber || 0,
              amountCents: payment.amountCents,
              result: resultType,
              errorCode: result.errorCode,
              stripePaymentIntentId: result.stripePaymentIntentId,
            }
          } catch (error) {
            console.error(`Unexpected error processing payment ${payment.id}:`, error)
            errorCount++

            return {
              paymentRecordId: payment.id,
              bookingReference: payment.booking.bookingReference,
              installmentNumber: payment.installmentNumber || 0,
              amountCents: payment.amountCents,
              result: 'error' as const,
              errorCode: 'unexpected_error',
            }
          }
        })
      )

      results.push(...batchResults)

      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < eligiblePayments.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
      }
    }

    const executionTimeMs = Date.now() - startTime

    // 4. Log summary
    console.log('=== Cron Job Summary ===')
    console.log(`Total found: ${duePayments.length}`)
    console.log(`Total eligible: ${eligiblePayments.length}`)
    console.log(`Successful: ${successCount}`)
    console.log(`Failed (retry scheduled): ${failedRetryCount}`)
    console.log(`Failed (permanent): ${failedPermanentCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log(`Execution time: ${executionTimeMs}ms`)
    console.log('=== Cron Job Complete ===')

    // 5. Return summary
    return NextResponse.json({
      processedAt: new Date().toISOString(),
      totalFound: duePayments.length,
      totalEligible: eligiblePayments.length,
      successful: successCount,
      failedRetry: failedRetryCount,
      failedPermanent: failedPermanentCount,
      errors: errorCount,
      executionTimeMs,
      results,
    })
  } catch (error) {
    console.error('Fatal error in cron job:', error)

    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
