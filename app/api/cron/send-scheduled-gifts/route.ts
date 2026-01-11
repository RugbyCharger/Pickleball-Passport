import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/sendgrid'
import { generateGiftNotificationRecipientEmail } from '@/lib/email/templates/gift-notification-recipient'

/**
 * Cron job to send scheduled gift notifications
 * Runs daily at 9:00 AM PST
 *
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-scheduled-gifts",
 *     "schedule": "0 16 * * *"  // 9:00 AM PST = 16:00 UTC
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
      include: {
        package: true,
        trip: true,
        user: true, // Purchaser
      },
    })

    console.log(`Found ${giftsToSend.length} scheduled gifts to send`)

    const results = {
      total: giftsToSend.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Send each gift notification
    for (const gift of giftsToSend) {
      try {
        // Generate acceptance URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pickleballpassport.com'
        const acceptanceUrl = `${baseUrl}/gift/accept?token=${gift.giftAcceptanceToken}`

        // Generate gift notification email
        const { subject, html, text } = generateGiftNotificationRecipientEmail({
          recipientName: gift.giftRecipientName!,
          purchaserName: gift.user.name || 'Someone special',
          packageName: gift.package.name,
          packageDescription: gift.package.tagline || '',
          giftMessage: gift.giftMessage || undefined,
          acceptanceUrl,
          tripDates: gift.trip
            ? {
                startDate: gift.trip.startDate.toLocaleDateString(),
                endDate: gift.trip.endDate.toLocaleDateString(),
              }
            : undefined,
        })

        // Send gift notification email to recipient
        await sendEmail({
          to: gift.giftRecipientEmail!,
          subject,
          html,
          text,
        })

        // Update gift status to SENT
        await prisma.booking.update({
          where: { id: gift.id },
          data: { giftStatus: 'SENT' },
        })

        console.log(`✅ Sent gift notification for booking ${gift.bookingReference}`)
        results.sent++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Failed to send gift ${gift.bookingReference}:`, errorMessage)

        results.failed++
        results.errors.push(`${gift.bookingReference}: ${errorMessage}`)

        // Don't throw - continue processing other gifts
        // Failed gifts will be retried on next cron run (still PENDING status)
      }
    }

    // Log summary
    console.log('Scheduled gifts delivery complete:', results)

    return NextResponse.json({
      success: true,
      message: `Sent ${results.sent} of ${results.total} scheduled gifts`,
      results,
    })
  } catch (error) {
    console.error('Cron job error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Export for Edge Runtime compatibility (Vercel)
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
