/**
 * Send Post-Trip Emails Cron Job
 * E15: Post-Trip Email Sequence (COMM-03)
 *
 * Daily cron job (6 AM UTC) that sends post-trip follow-up emails
 * to guests at various milestones (3, 7, 14, 30, 60 days after trip ends).
 *
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendPostTripEmails } from '@/lib/email/send-post-trip-emails'

/**
 * GET /api/cron/send-post-trip-emails
 *
 * Cron job endpoint - secured with CRON_SECRET
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()

  // 1. Verify authorization
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[PostTripEmails] CRON_SECRET not configured')
    return NextResponse.json(
      { error: 'Cron job not configured' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('[PostTripEmails] Unauthorized cron request')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('=== Send Post-Trip Emails Cron Job Started ===')

  try {
    // 2. Run the post-trip email service
    const result = await sendPostTripEmails()

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
    console.error('[PostTripEmails] Fatal error in cron job:', error)

    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
