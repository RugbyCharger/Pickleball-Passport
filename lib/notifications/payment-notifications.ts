/**
 * Payment Notification Helpers
 * E11-S7: In-App Notifications
 *
 * Creates in-app notifications for payment-related events:
 * - Payment success
 * - Payment failure
 * - Installment due reminders
 * - Installment success
 * - Installment failure
 * - Refund processed
 */

import { prisma } from '@/lib/db';
import { NotificationType } from '@prisma/client';

/**
 * Format amount in cents to dollar string
 */
function formatAmount(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

/**
 * Create notification for successful payment
 */
export async function createPaymentSuccessNotification(
  userId: string,
  bookingId: string,
  amountCents: number,
  isInstallment: boolean = false
): Promise<void> {
  // Get booking details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      bookingReference: true,
      package: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!booking) {
    console.error(`Booking ${bookingId} not found for payment notification`);
    return;
  }

  const amount = formatAmount(amountCents);
  const title = isInstallment
    ? 'Installment Payment Received'
    : 'Payment Received - Booking Confirmed!';
  const content = isInstallment
    ? `Your installment payment of ${amount} for booking ${booking.bookingReference} has been successfully processed.`
    : `Thank you! Your payment of ${amount} for ${booking.package.name} (${booking.bookingReference}) has been successfully processed. Your booking is now confirmed.`;

  await prisma.notification.create({
    data: {
      userId,
      type: 'PAYMENT_RECEIPT',
      title,
      content,
      linkUrl: `/dashboard/payments`,
      linkText: 'View Payment Details',
    },
  });
}

/**
 * Create notification for failed payment
 */
export async function createPaymentFailureNotification(
  userId: string,
  bookingId: string,
  amountCents: number,
  retryLink?: string
): Promise<void> {
  // Get booking details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      bookingReference: true,
      package: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!booking) {
    console.error(`Booking ${bookingId} not found for payment failure notification`);
    return;
  }

  const amount = formatAmount(amountCents);
  const content = `Your payment of ${amount} for booking ${booking.bookingReference} failed. Please update your payment method to complete your booking.`;

  await prisma.notification.create({
    data: {
      userId,
      type: 'PAYMENT_RECEIPT',
      title: 'Payment Failed - Action Required',
      content,
      linkUrl: retryLink || `/dashboard/bookings/${bookingId}`,
      linkText: 'Update Payment Method',
    },
  });
}

/**
 * Create notification for upcoming installment payment
 */
export async function createInstallmentDueNotification(
  userId: string,
  bookingId: string,
  amountCents: number,
  dueDate: Date,
  installmentNumber?: number
): Promise<void> {
  // Get booking details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      bookingReference: true,
      package: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!booking) {
    console.error(`Booking ${bookingId} not found for installment due notification`);
    return;
  }

  const amount = formatAmount(amountCents);
  const installmentText = installmentNumber
    ? `installment ${installmentNumber}`
    : 'installment';
  const dueDateText = dueDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  await prisma.notification.create({
    data: {
      userId,
      type: 'PAYMENT_RECEIPT',
      title: `Upcoming Payment - ${dueDateText}`,
      content: `Your ${installmentText} payment of ${amount} for booking ${booking.bookingReference} is due on ${dueDateText}. Please ensure your payment method is up to date.`,
      linkUrl: `/dashboard/payments`,
      linkText: 'View Payment Schedule',
    },
  });
}

/**
 * Create notification for successful installment payment
 */
export async function createInstallmentSuccessNotification(
  userId: string,
  bookingId: string,
  amountCents: number,
  installmentNumber?: number
): Promise<void> {
  // Get booking details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      bookingReference: true,
      package: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!booking) {
    console.error(`Booking ${bookingId} not found for installment success notification`);
    return;
  }

  const amount = formatAmount(amountCents);
  const installmentText = installmentNumber
    ? `Installment ${installmentNumber}`
    : 'Installment';

  await prisma.notification.create({
    data: {
      userId,
      type: 'PAYMENT_RECEIPT',
      title: `${installmentText} Payment Received`,
      content: `Your ${installmentText.toLowerCase()} payment of ${amount} for booking ${booking.bookingReference} has been successfully processed.`,
      linkUrl: `/dashboard/payments`,
      linkText: 'View Payment Details',
    },
  });
}

/**
 * Create notification for failed installment payment (after all retries)
 */
export async function createInstallmentFailureNotification(
  userId: string,
  bookingId: string,
  amountCents: number,
  installmentNumber?: number
): Promise<void> {
  // Get booking details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      bookingReference: true,
      package: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!booking) {
    console.error(`Booking ${bookingId} not found for installment failure notification`);
    return;
  }

  const amount = formatAmount(amountCents);
  const installmentText = installmentNumber
    ? `installment ${installmentNumber}`
    : 'installment';

  await prisma.notification.create({
    data: {
      userId,
      type: 'PAYMENT_RECEIPT',
      title: 'URGENT: Payment Failed - Action Required',
      content: `Your ${installmentText} payment of ${amount} for booking ${booking.bookingReference} failed after multiple attempts. Please update your payment method immediately to avoid service interruption.`,
      linkUrl: `/dashboard/bookings/${bookingId}`,
      linkText: 'Update Payment Method',
    },
  });
}

/**
 * Create notification for processed refund
 */
export async function createRefundProcessedNotification(
  userId: string,
  bookingId: string,
  refundAmountCents: number,
  bookingReference?: string
): Promise<void> {
  // Get booking details if bookingReference not provided
  let bookingRef = bookingReference;
  if (!bookingRef) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        bookingReference: true,
      },
    });
    bookingRef = booking?.bookingReference;
  }

  const amount = formatAmount(refundAmountCents);
  const refText = bookingRef ? ` for booking ${bookingRef}` : '';

  await prisma.notification.create({
    data: {
      userId,
      type: 'PAYMENT_RECEIPT',
      title: 'Refund Processed',
      content: `Your refund of ${amount}${refText} has been processed and will appear in your account within 5-10 business days.`,
      linkUrl: `/dashboard/payments`,
      linkText: 'View Payment History',
    },
  });
}

/**
 * Create notification for document rejection
 */
export async function createDocumentRejectedNotification(
  userId: string,
  documentType: string,
  rejectionReason?: string,
  bookingReference?: string
): Promise<void> {
  const reasonText = rejectionReason ? ` Reason: ${rejectionReason}.` : '';
  const bookingText = bookingReference ? ` for booking ${bookingReference}` : '';

  await prisma.notification.create({
    data: {
      userId,
      type: 'GENERAL',
      title: 'Document Rejected - Action Required',
      content: `Your ${documentType}${bookingText} has been reviewed and requires attention.${reasonText} Please upload a new document.`,
      linkUrl: '/dashboard/documents',
      linkText: 'View Documents',
    },
  });
}
