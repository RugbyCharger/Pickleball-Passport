/**
 * PDF Receipt Generation Service - E4-S8
 *
 * Generates professional PDF receipts for successful payments
 * Targets < 2 second generation time, < 500KB file size
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
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
            trip: true,
            user: true,
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

    // 4. Format payment method for display
    const paymentMethod = formatPaymentMethod(
      payment.paymentMethodType,
      payment.cardLast4,
      payment.cardBrand
    );

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
      stripePaymentIntentId: payment.stripePaymentIntentId,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod,

      // Booking details
      bookingReference: payment.booking.bookingReference,
      bookingDate: payment.booking.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),

      // Trip details
      tripName: payment.booking.trip.name,
      tripDates: formatTripDates(
        payment.booking.trip.startDate,
        payment.booking.trip.endDate
      ),
      tripLocation: formatTripLocation(
        payment.booking.trip.city,
        payment.booking.trip.state,
        payment.booking.trip.country
      ),
      guestCount: payment.booking.guestCount,

      // Guest details
      guestName: payment.booking.user.firstName && payment.booking.user.lastName
        ? `${payment.booking.user.firstName} ${payment.booking.user.lastName}`
        : payment.booking.user.email,
      guestEmail: payment.booking.user.email,

      // Company details
      companyName: 'Pickleball Passport',
      companyEmail: 'hello@pickleballpassport.com',
      companyWebsite: 'www.pickleballpassport.com',
    };

    // 6. Generate PDF buffer
    const startTime = Date.now();
    const pdfBuffer = await renderToBuffer(
      createElement(PaymentReceipt, { data: receiptData })
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
 * Format payment method for display
 */
function formatPaymentMethod(
  type?: string | null,
  last4?: string | null,
  brand?: string | null
): string {
  if (!type) {
    return 'Card payment';
  }

  if (type === 'card' && brand && last4) {
    const capitalizedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
    return `${capitalizedBrand} ending in ${last4}`;
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
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
 * Format trip location for display
 */
function formatTripLocation(
  city: string,
  state?: string | null,
  country: string = 'USA'
): string {
  if (state) {
    return `${city}, ${state}, ${country}`;
  }
  return `${city}, ${country}`;
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
