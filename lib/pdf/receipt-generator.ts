/**
 * PDF Receipt Generation Service - E4-S8
 *
 * Generates professional PDF receipts for successful payments
 * Targets < 2 second generation time, < 500KB file size
 */

import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { PaymentReceipt, type ReceiptData } from './templates/payment-receipt';
import { generateReceiptNumber } from './receipt-number';
import { uploadToSupabaseStorage } from '@/lib/storage/supabase-storage';
import { prisma as db } from '@/lib/db';

export interface GenerateReceiptInput {
  paymentId: string;
  bookingId: string;
}

export interface GenerateReceiptResult {
  success: boolean;
  receiptNumber?: string;
  receiptUrl?: string;
  pdfBuffer?: Buffer;
  error?: string;
}

/**
 * Generate PDF receipt for a payment
 *
 * @param {GenerateReceiptInput} input - Payment and booking IDs
 * @returns {Promise<GenerateReceiptResult>} Generation result with URL and buffer
 */
export async function generateReceipt(
  input: GenerateReceiptInput
): Promise<GenerateReceiptResult> {
  try {
    // 1. Fetch payment and booking data with all relations
    const payment = await db.payment.findUnique({
      where: { id: input.paymentId },
      include: {
        booking: {
          include: {
            trip: {
              select: {
                id: true,
                name: true,
                destination: true,
                startDate: true,
                endDate: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                guestProfile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            package: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return {
        success: false,
        error: 'Payment not found',
      };
    }

    if (!payment.booking) {
      return {
        success: false,
        error: 'Booking not found for payment',
      };
    }

    // 2. Check if receipt already exists
    if (payment.receiptNumber && payment.receiptUrl) {
      console.log(`Receipt already exists for payment ${payment.id}: ${payment.receiptNumber}`);
      return {
        success: true,
        receiptNumber: payment.receiptNumber,
        receiptUrl: payment.receiptUrl,
      };
    }

    // 3. Generate unique receipt number
    const receiptNumber = generateReceiptNumber();

    // 4. Format payment method for display (Payment model doesn't have these fields, use default)
    const paymentMethod = 'Card payment';

    // 5. Prepare receipt data
    const receiptData: ReceiptData = {
      // Receipt metadata
      receiptNumber,
      receiptDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),

      // Payment details
      paymentId: payment.id,
      stripePaymentIntentId: payment.stripePaymentIntentId || 'N/A',
      amount: payment.amount,
      currency: 'USD', // Default to USD since Payment model doesn't have currency field
      paymentMethod,

      // Booking details
      bookingReference: payment.booking.bookingReference,
      bookingDate: payment.booking.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),

      // Trip details
      tripName: payment.booking.trip?.name || payment.booking.package.name,
      tripDates: payment.booking.trip
        ? formatTripDates(
            payment.booking.trip.startDate,
            payment.booking.trip.endDate
          )
        : 'To be scheduled',
      tripLocation: payment.booking.trip?.destination || 'Thailand',
      guestCount: 1, // Default to 1 since Booking model doesn't have guestCount field

      // Guest details
      guestName: payment.booking.user.guestProfile
        ? `${payment.booking.user.guestProfile.firstName} ${payment.booking.user.guestProfile.lastName}`
        : payment.booking.user.email.split('@')[0],
      guestEmail: payment.booking.user.email,

      // Company details
      companyName: 'The Pickleball Passport',
      companyEmail: 'support@thepickleballpassport.org',
      companyWebsite: 'www.thepickleballpassport.org',
    };

    // 6. Generate PDF buffer
    const startTime = Date.now();
    const pdfBuffer = await renderToBuffer(
      React.createElement(PaymentReceipt, { data: receiptData }) as any
    );
    const generationTime = Date.now() - startTime;

    console.log(`PDF generated in ${generationTime}ms, size: ${pdfBuffer.length} bytes`);

    // Performance warning if generation took too long
    if (generationTime > 2000) {
      console.warn(`PDF generation took ${generationTime}ms (target: < 2000ms)`);
    }

    // Size warning if file is too large
    if (pdfBuffer.length > 500 * 1024) {
      console.warn(`PDF size is ${pdfBuffer.length} bytes (target: < 500KB)`);
    }

    // 7. Upload to Supabase Storage
    const fileName = `${receiptNumber}.pdf`;
    const filePath = `${payment.booking.bookingReference}/${fileName}`;

    const uploadResult = await uploadToSupabaseStorage({
      bucket: 'receipts',
      path: filePath,
      buffer: pdfBuffer,
      contentType: 'application/pdf',
    });

    if (!uploadResult.success || !uploadResult.url) {
      return {
        success: false,
        error: uploadResult.error || 'Failed to upload PDF to storage',
        pdfBuffer, // Return buffer for fallback attachment
      };
    }

    // 8. Update payment record with receipt details
    await db.payment.update({
      where: { id: payment.id },
      data: {
        receiptNumber,
        receiptUrl: uploadResult.url,
        receiptGeneratedAt: new Date(),
      },
    });

    console.log(`Receipt generated successfully: ${receiptNumber}`);

    return {
      success: true,
      receiptNumber,
      receiptUrl: uploadResult.url,
      pdfBuffer,
    };
  } catch (error) {
    console.error('Error generating receipt:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format trip dates for display
 */
function formatTripDates(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  const start = startDate.toLocaleDateString('en-US', options);
  const end = endDate.toLocaleDateString('en-US', options);

  return `${start} - ${end}`;
}

/**
 * Get receipt by payment ID
 */
export async function getReceiptByPaymentId(
  paymentId: string
): Promise<{ receiptNumber: string; receiptUrl: string } | null> {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    select: {
      receiptNumber: true,
      receiptUrl: true,
    },
  });

  if (!payment?.receiptNumber || !payment?.receiptUrl) {
    return null;
  }

  return {
    receiptNumber: payment.receiptNumber,
    receiptUrl: payment.receiptUrl,
  };
}
