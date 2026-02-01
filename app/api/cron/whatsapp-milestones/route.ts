/**
 * WhatsApp Milestone Messages Cron Job
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Daily cron job that sends pre-trip WhatsApp milestone messages
 * to guests who have joined the trip's WhatsApp group.
 *
 * Milestones: 60, 30, 14, 7, 1 days before trip
 *
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 * Schedule in vercel.json: { "crons": [{ "path": "/api/cron/whatsapp-milestones", "schedule": "0 8 * * *" }] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAndSendMilestoneMessages } from '@/lib/jobs/whatsapp-milestone-messages';
import { cronLogger, whatsappLogger, logError } from '@/lib/logger';

/**
 * GET /api/cron/whatsapp-milestones
 *
 * Cron job endpoint - secured with CRON_SECRET
 * Can also be triggered manually by admin with the secret
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  // 1. Verify authorization
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    cronLogger.error({ job: 'whatsapp-milestones' }, 'CRON_SECRET not configured');
    return NextResponse.json({ error: 'Cron job not configured' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    cronLogger.warn({ job: 'whatsapp-milestones' }, 'Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  cronLogger.info({ job: 'whatsapp-milestones' }, 'WhatsApp Milestone Messages Cron Job Started');

  try {
    // 2. Run the milestone messages job
    const result = await checkAndSendMilestoneMessages();

    const executionTimeMs = Date.now() - startTime;

    // 3. Log summary
    cronLogger.info({
      job: 'whatsapp-milestones',
      totalProcessed: result.totalProcessed,
      messagesSent: result.messagesSent,
      errors: result.errors,
      skipped: result.skipped,
      byMilestone: result.byMilestone,
      executionTimeMs,
    }, 'WhatsApp Milestone Messages Cron Job Complete');

    // 4. Return summary
    return NextResponse.json({
      processedAt: new Date().toISOString(),
      ...result,
      executionTimeMs,
    });
  } catch (error) {
    logError(cronLogger, error, 'Fatal error in whatsapp-milestones cron job');

    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
