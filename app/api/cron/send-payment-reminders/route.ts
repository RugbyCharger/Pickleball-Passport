/**
 * Send Payment Reminders Cron Job
 * E4-S8: Installment Payment Reminders
 *
 * Daily cron job (9 AM UTC) that sends reminder emails
 * to guests with payments due in 7 days.
 *
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendPaymentReminders } from '@/lib/payments/send-payment-reminders'
import { cronLogger, emailLogger, logError } from '@/lib/logger'

/**
 * GET /api/cron/send-payment-reminders
 *
 * Cron job endpoint - secured with CRON_SECRET
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()

  // 1. Verify authorization
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    cronLogger.error({ job: 'payment-reminders' }, 'CRON_SECRET not configured')
    return NextResponse.json(
      { error: 'Cron job not configured' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    cronLogger.warn({ job: 'payment-reminders' }, 'Unauthorized cron request')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  cronLogger.info({ job: 'payment-reminders' }, 'Send Payment Reminders Cron Job Started')

  try {
    // 2. Run the reminder service
    const result = await sendPaymentReminders()

    const executionTimeMs = Date.now() - startTime

    // 3. Log summary
    cronLogger.info({
      job: 'payment-reminders',
      totalFound: result.totalFound,
      remindersSent: result.remindersSent,
      errors: result.errors,
      skipped: result.skipped,
      executionTimeMs,
    }, 'Send Payment Reminders Cron Job Complete')

    // 4. Return summary
    return NextResponse.json({
      processedAt: new Date().toISOString(),
      ...result,
      executionTimeMs,
    })
  } catch (error) {
    logError(cronLogger, error, 'Fatal error in payment-reminders cron job')

    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
