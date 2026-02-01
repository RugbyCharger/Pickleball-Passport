/**
 * Send Pre-Trip Emails Cron Job
 * E11-S4: Pre-Trip Email Sequence
 *
 * Daily cron job (7 AM UTC) that sends pre-trip nurture emails
 * to guests at various milestones (60, 30, 14, 7, 1 days before trip).
 *
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendPreTripEmails } from '@/lib/email/send-pre-trip-emails'
import { cronLogger, emailLogger, logError } from '@/lib/logger'

/**
 * GET /api/cron/send-pre-trip-emails
 *
 * Cron job endpoint - secured with CRON_SECRET
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()

  // 1. Verify authorization
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    cronLogger.error({ job: 'pre-trip-emails' }, 'CRON_SECRET not configured')
    return NextResponse.json(
      { error: 'Cron job not configured' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    cronLogger.warn({ job: 'pre-trip-emails' }, 'Unauthorized cron request')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  cronLogger.info({ job: 'pre-trip-emails' }, 'Send Pre-Trip Emails Cron Job Started')

  try {
    // 2. Run the pre-trip email service
    const result = await sendPreTripEmails()

    const executionTimeMs = Date.now() - startTime

    // 3. Log summary
    cronLogger.info({
      job: 'pre-trip-emails',
      totalProcessed: result.totalProcessed,
      emailsSent: result.emailsSent,
      errors: result.errors,
      skipped: result.skipped,
      byMilestone: result.byMilestone,
      executionTimeMs,
    }, 'Send Pre-Trip Emails Cron Job Complete')

    // 4. Return summary
    return NextResponse.json({
      processedAt: new Date().toISOString(),
      ...result,
      executionTimeMs,
    })
  } catch (error) {
    logError(cronLogger, error, 'Fatal error in pre-trip-emails cron job')

    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
