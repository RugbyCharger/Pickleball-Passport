/**
 * Receipt Download API Endpoint - E4-S8
 *
 * GET /api/receipts/[paymentId]/download
 *
 * Downloads PDF receipt for a payment with authentication and ownership verification
 * Rate limited: 10 requests per minute per user (prevents enumeration attacks)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma as db } from '@/lib/db';
import { downloadFromSupabaseStorage } from '@/lib/storage/supabase-storage';
import { checkRateLimit } from '@/lib/rate-limit';
import { storageLogger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 1b. Rate limiting (prevents enumeration attacks on receipt IDs)
    const rateLimitResult = await checkRateLimit('api', userId);
    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // 2. Await params before accessing
    const { paymentId } = await params;

    // 3. Fetch payment with booking and user data
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // 4. Verify receipt exists
    if (!payment.receiptNumber || !payment.receiptUrl) {
      return NextResponse.json(
        { error: 'Receipt not available for this payment' },
        { status: 404 }
      );
    }

    // 5. Verify ownership (user owns the booking OR user is admin)
    // Note: User.id in the schema IS the Clerk ID
    const userRecord = await db.user.findUnique({
      where: { id: userId },
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isOwner = payment.booking.userId === userRecord.id;
    const isAdmin = userRecord.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this receipt' },
        { status: 403 }
      );
    }

    // 6. Extract file path from receipt URL
    // receiptUrl format: https://[project].supabase.co/storage/v1/object/public/receipts/[path]
    const filePath = extractFilePathFromUrl(payment.receiptUrl);
    if (!filePath) {
      storageLogger.error({ paymentId, receiptUrl: payment.receiptUrl }, 'Invalid receipt URL format');
      return NextResponse.json(
        { error: 'Invalid receipt URL' },
        { status: 500 }
      );
    }

    // 7. Download PDF from Supabase Storage
    const pdfBuffer = await downloadFromSupabaseStorage('receipts', filePath);

    if (!pdfBuffer) {
      storageLogger.error({ paymentId, filePath }, 'Failed to download receipt from storage');
      return NextResponse.json(
        { error: 'Failed to download receipt' },
        { status: 500 }
      );
    }

    // 8. Return PDF with appropriate headers
    const fileName = `${payment.receiptNumber}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    storageLogger.error({ err: error }, 'Error downloading receipt');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extract file path from Supabase Storage URL
 *
 * @param {string} url - Full Supabase Storage URL
 * @returns {string | null} File path or null if invalid
 */
function extractFilePathFromUrl(url: string): string | null {
  try {
    // URL format: https://[project].supabase.co/storage/v1/object/public/receipts/[path]
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // Find 'receipts' bucket in path and get everything after it
    const receiptsIndex = pathParts.indexOf('receipts');
    if (receiptsIndex === -1 || receiptsIndex === pathParts.length - 1) {
      return null;
    }

    // Join all parts after 'receipts' bucket name
    const filePath = pathParts.slice(receiptsIndex + 1).join('/');
    return filePath || null;
  } catch (error) {
    storageLogger.error({ err: error, url }, 'Error parsing receipt URL');
    return null;
  }
}
