/**
 * Booking Status Notification Helpers
 * E6-S3: Auto-generate notifications when booking status changes
 *
 * Creates in-app notifications and triggers email notifications
 * for important booking status updates.
 */

import { prisma } from '@/lib/db';
import { BookingStatus, NotificationType } from '@prisma/client';

interface StatusChangeNotification {
  title: string;
  content: string;
  type: NotificationType;
  linkUrl?: string;
  linkText?: string;
}

/**
 * Get notification content based on booking status
 */
function getNotificationForStatus(
  status: BookingStatus,
  bookingReference: string,
  packageName: string
): StatusChangeNotification | null {
  switch (status) {
    case 'PENDING_PAYMENT':
      return {
        title: 'Booking Created - Payment Pending',
        content: `Your booking for ${packageName} (${bookingReference}) has been created. Please complete your payment to confirm your booking.`,
        type: 'BOOKING_CONFIRMATION',
        linkUrl: `/dashboard/bookings`,
        linkText: 'View Booking',
      };

    case 'CONFIRMED':
      return {
        title: 'Payment Received - Booking Confirmed!',
        content: `Thank you! Your payment for ${packageName} (${bookingReference}) has been successfully processed. Your booking is now confirmed.`,
        type: 'PAYMENT_RECEIPT',
        linkUrl: `/dashboard/bookings`,
        linkText: 'View Booking Details',
      };

    case 'COMPLETED':
      return {
        title: 'Trip Completed - Thank You!',
        content: `We hope you enjoyed your transformational experience with ${packageName}. Please consider sharing your story with us!`,
        type: 'GENERAL',
        linkUrl: `/dashboard`,
        linkText: 'Share Your Experience',
      };

    case 'CANCELLED':
      return {
        title: 'Booking Cancelled',
        content: `Your booking for ${packageName} (${bookingReference}) has been cancelled. If this was a mistake, please contact our support team.`,
        type: 'GENERAL',
        linkUrl: `/dashboard/support`,
        linkText: 'Contact Support',
      };

    default:
      return null;
  }
}

/**
 * Create in-app notification for booking status change
 */
export async function createBookingStatusNotification(
  userId: string,
  bookingId: string,
  newStatus: BookingStatus
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
    console.error(`Booking ${bookingId} not found for notification`);
    return;
  }

  const notificationData = getNotificationForStatus(
    newStatus,
    booking.bookingReference,
    booking.package.name
  );

  if (!notificationData) {
    return; // No notification for this status
  }

  // Create in-app notification
  await prisma.notification.create({
    data: {
      userId,
      type: notificationData.type,
      title: notificationData.title,
      content: notificationData.content,
      linkUrl: notificationData.linkUrl,
      linkText: notificationData.linkText,
    },
  });

  // TODO: Trigger email notification via SendGrid
  // await sendBookingStatusEmail(userId, notificationData);
}

/**
 * Create notification for document approval
 */
export async function createDocumentApprovedNotification(
  userId: string,
  documentType: string,
  bookingReference?: string
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type: 'GENERAL',
      title: 'Document Approved',
      content: `Your ${documentType} has been reviewed and approved${
        bookingReference ? ` for booking ${bookingReference}` : ''
      }.`,
      linkUrl: '/dashboard/documents',
      linkText: 'View Documents',
    },
  });
}

/**
 * Create notification for trip reminder
 */
export async function createTripReminderNotification(
  userId: string,
  bookingReference: string,
  packageName: string,
  tripDate: Date,
  daysUntilTrip: number
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type: 'TRIP_REMINDER',
      title: `Trip Reminder - ${daysUntilTrip} Days to Go!`,
      content: `Your ${packageName} experience (${bookingReference}) starts in ${daysUntilTrip} days on ${tripDate.toLocaleDateString(
        'en-US',
        {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }
      )}. We're excited to welcome you!`,
      linkUrl: '/dashboard/bookings',
      linkText: 'View Booking',
    },
  });
}

/**
 * Create notification for missing documents
 */
export async function createMissingDocumentsNotification(
  userId: string,
  bookingReference: string,
  missingDocuments: string[]
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type: 'GENERAL',
      title: 'Action Required: Upload Documents',
      content: `Please upload the following required documents for your booking ${bookingReference}: ${missingDocuments.join(
        ', '
      )}.`,
      linkUrl: '/dashboard/documents',
      linkText: 'Upload Documents',
    },
  });
}
