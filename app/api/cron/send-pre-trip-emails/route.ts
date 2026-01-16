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
    console.error('[PreTripEmails] CRON_SECRET not configured')
    return NextResponse.json(
      { error: 'Cron job not configured' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('[PreTripEmails] Unauthorized cron request')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('=== Send Pre-Trip Emails Cron Job Started ===')

  try {
    // 2. Run the pre-trip email service
    const result = await sendPreTripEmails()

    const executionTimeMs = Date.now() - startTime

    // 3. Log summary
    console.log('=== Cron Job Summary ===')
    console.log(`Total processed: ${result.totalProcessed}`)
    console.log(`Emails sent: ${result.emailsSent}`)
    console.log(`Errors: ${result.errors}`)
    console.log(`Skipped: ${result.skipped}`)
    console.log('By milestone:', result.byMilestone)
    console.log(`Execution time: ${executionTimeMs}ms`)
    console.log('=== Cron Job Complete ===')

    // 4. Return summary
    return NextResponse.json({
      processedAt: new Date().toISOString(),
      ...result,
      executionTimeMs,
    })
  } catch (error) {
    console.error('[PreTripEmails] Fatal error in cron job:', error)

    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
