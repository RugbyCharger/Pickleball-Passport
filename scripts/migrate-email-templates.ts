/**
 * Email Template Migration Script
 * Story 11-11: Email Template Management
 *
 * Migrates existing code-based email templates to the database.
 * Run with: npx ts-node scripts/migrate-email-templates.ts
 *
 * Note: This script creates database entries with template metadata.
 * The actual HTML content should be customized in the admin UI.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type TemplateCategory = 'TRANSACTIONAL' | 'MARKETING' | 'NOTIFICATIONS' | 'SYSTEM';

interface TemplateMigration {
  name: string;
  slug: string;
  description: string;
  category: TemplateCategory;
  subjectLine: string;
  preheaderText: string;
  variables: string[];
}

/**
 * Template definitions based on existing code-based templates
 */
const TEMPLATE_MIGRATIONS: TemplateMigration[] = [
  // Transactional - Booking Flow
  {
    name: 'Booking Confirmation',
    slug: 'booking-confirmation',
    description: 'Sent to guests after successful payment for their booking',
    category: 'TRANSACTIONAL',
    subjectLine: '🎉 Booking Confirmed - {{packageName}} (Ref: {{bookingReference}})',
    preheaderText: 'Booking {{bookingReference}} confirmed! Your transformation journey awaits.',
    variables: [
      'firstName',
      'bookingReference',
      'packageName',
      'duration',
      'accommodationTier',
      'tripStartDate',
      'tripEndDate',
      'destination',
      'totalPrice',
      'portalUrl',
    ],
  },
  {
    name: 'Booking Confirmation (Primary with Companion)',
    slug: 'booking-confirmation-primary-with-companion',
    description: 'Booking confirmation for primary guest traveling with a companion',
    category: 'TRANSACTIONAL',
    subjectLine: '🎉 Booking Confirmed for Two - {{packageName}} (Ref: {{bookingReference}})',
    preheaderText: 'Your booking for two is confirmed! Get ready for your shared adventure.',
    variables: [
      'firstName',
      'companionName',
      'bookingReference',
      'packageName',
      'tripStartDate',
      'tripEndDate',
      'totalPrice',
    ],
  },
  {
    name: 'Booking Confirmation (Companion)',
    slug: 'booking-confirmation-companion',
    description: 'Booking confirmation sent to the companion guest',
    category: 'TRANSACTIONAL',
    subjectLine: "🎉 You're Invited! Join {{primaryGuestName}} in Thailand",
    preheaderText: "You've been added as a companion for an amazing trip!",
    variables: [
      'firstName',
      'primaryGuestName',
      'bookingReference',
      'packageName',
      'tripStartDate',
      'tripEndDate',
    ],
  },
  {
    name: 'Booking Modification',
    slug: 'booking-modification',
    description: 'Sent when a booking is modified (dates, add-ons, etc.)',
    category: 'TRANSACTIONAL',
    subjectLine: 'Booking Updated - {{bookingReference}}',
    preheaderText: 'Your booking has been updated. Review the changes.',
    variables: ['firstName', 'bookingReference', 'changesSummary', 'portalUrl'],
  },
  {
    name: 'Payment Receipt',
    slug: 'payment-receipt',
    description: 'Payment receipt sent after each successful payment',
    category: 'TRANSACTIONAL',
    subjectLine: 'Payment Receipt - {{receiptNumber}}',
    preheaderText: 'Your payment of {{paymentAmount}} has been received.',
    variables: [
      'firstName',
      'receiptNumber',
      'paymentDate',
      'paymentMethod',
      'paymentAmount',
      'bookingReference',
    ],
  },
  {
    name: 'Refund Confirmation',
    slug: 'refund-confirmation',
    description: 'Sent when a refund is processed',
    category: 'TRANSACTIONAL',
    subjectLine: 'Refund Processed - {{refundAmount}}',
    preheaderText: 'Your refund has been processed and will appear in 5-10 business days.',
    variables: ['firstName', 'refundAmount', 'refundReason', 'bookingReference'],
  },

  // Transactional - Documents
  {
    name: 'Document Approval',
    slug: 'document-approval',
    description: 'Sent when an uploaded document is approved',
    category: 'TRANSACTIONAL',
    subjectLine: '✅ Document Approved - {{documentType}}',
    preheaderText: 'Your {{documentType}} has been verified and approved.',
    variables: ['firstName', 'documentType', 'bookingReference', 'notes'],
  },
  {
    name: 'Document Rejection',
    slug: 'document-rejection',
    description: 'Sent when an uploaded document needs to be re-uploaded',
    category: 'TRANSACTIONAL',
    subjectLine: '⚠️ Document Needs Attention - {{documentType}}',
    preheaderText: 'Please re-upload your {{documentType}}.',
    variables: ['firstName', 'documentType', 'rejectionReason', 'bookingReference', 'uploadUrl'],
  },

  // Transactional - Payments
  {
    name: 'Installment Payment Reminder',
    slug: 'installment-payment-reminder',
    description: 'Reminder before an installment payment is due',
    category: 'TRANSACTIONAL',
    subjectLine: 'Payment Reminder - {{paymentAmount}} due {{dueDate}}',
    preheaderText: 'Your next installment payment is coming up.',
    variables: ['firstName', 'paymentAmount', 'dueDate', 'installmentNumber', 'bookingReference'],
  },
  {
    name: 'Upcoming Payment Reminder',
    slug: 'upcoming-payment-reminder',
    description: 'Reminder 7 days before payment is due',
    category: 'TRANSACTIONAL',
    subjectLine: 'Payment Due Soon - {{paymentAmount}}',
    preheaderText: 'Your payment of {{paymentAmount}} is due in 7 days.',
    variables: ['firstName', 'paymentAmount', 'dueDate', 'bookingReference'],
  },

  // Transactional - Gift Bookings
  {
    name: 'Gift Confirmation (Purchaser)',
    slug: 'gift-confirmation-purchaser',
    description: 'Confirmation sent to the gift purchaser',
    category: 'TRANSACTIONAL',
    subjectLine: '🎁 Gift Purchase Confirmed - {{packageName}}',
    preheaderText: "You've purchased an amazing gift!",
    variables: ['firstName', 'recipientName', 'packageName', 'giftCode', 'totalPrice'],
  },
  {
    name: 'Gift Notification (Recipient)',
    slug: 'gift-notification-recipient',
    description: 'Notification sent to the gift recipient',
    category: 'TRANSACTIONAL',
    subjectLine: "🎁 You've Received a Gift from {{senderName}}!",
    preheaderText: 'Someone special has gifted you an amazing experience!',
    variables: ['recipientName', 'senderName', 'packageName', 'giftMessage', 'redeemUrl'],
  },
  {
    name: 'Gift Acceptance Confirmation (Recipient)',
    slug: 'gift-acceptance-confirmation-recipient',
    description: 'Sent to recipient when they accept the gift',
    category: 'TRANSACTIONAL',
    subjectLine: '✅ Gift Accepted - Your Trip is Booked!',
    preheaderText: "You've accepted your gift. Your adventure awaits!",
    variables: ['recipientName', 'packageName', 'tripDates', 'bookingReference'],
  },
  {
    name: 'Gift Acceptance Notification (Purchaser)',
    slug: 'gift-acceptance-notification-purchaser',
    description: 'Notification to purchaser when recipient accepts',
    category: 'TRANSACTIONAL',
    subjectLine: '🎉 {{recipientName}} Accepted Your Gift!',
    preheaderText: 'Your gift has been redeemed!',
    variables: ['purchaserName', 'recipientName', 'packageName'],
  },

  // Marketing - Pre-trip Sequence
  {
    name: 'Trip Reminder (7 days)',
    slug: 'trip-reminder',
    description: 'Reminder sent 7 days before trip',
    category: 'MARKETING',
    subjectLine: '🌴 {{daysUntilTrip}} Days Until Your Thailand Adventure!',
    preheaderText: 'Your transformation journey is almost here!',
    variables: [
      'firstName',
      'daysUntilTrip',
      'tripStartDate',
      'destination',
      'checklistProgress',
      'portalUrl',
    ],
  },
  {
    name: 'Pre-Trip Sequence',
    slug: 'pre-trip-sequence',
    description: 'Automated pre-trip engagement emails',
    category: 'MARKETING',
    subjectLine: '{{sequenceTitle}} - {{firstName}}',
    preheaderText: '{{preheaderText}}',
    variables: ['firstName', 'sequenceTitle', 'preheaderText', 'content', 'tripDays'],
  },

  // System - Onboarding
  {
    name: 'Welcome Email',
    slug: 'welcome',
    description: 'Welcome email for new account registrations',
    category: 'SYSTEM',
    subjectLine: 'Welcome to The Pickleball Passport! 🏓',
    preheaderText: 'Your account has been created. Start exploring!',
    variables: ['firstName', 'loginUrl'],
  },
  {
    name: 'Application Confirmation',
    slug: 'application-confirmation',
    description: 'Sent when someone submits an interest application',
    category: 'SYSTEM',
    subjectLine: 'Application Received - The Pickleball Passport',
    preheaderText: "We've received your application and will be in touch soon.",
    variables: ['firstName', 'applicationId', 'interests'],
  },

  // System - Contact & Support
  {
    name: 'Contact Form Confirmation',
    slug: 'contact-confirmation',
    description: 'Confirmation sent when someone submits a contact form',
    category: 'SYSTEM',
    subjectLine: "We've Received Your Message",
    preheaderText: "Thanks for reaching out! We'll respond within 24 hours.",
    variables: ['name', 'subject', 'ticketNumber'],
  },
  {
    name: 'Contact Admin Notification',
    slug: 'contact-admin-notification',
    description: 'Internal notification when a contact form is submitted',
    category: 'NOTIFICATIONS',
    subjectLine: 'New Contact Form - {{subject}}',
    preheaderText: 'A new contact form has been submitted.',
    variables: ['name', 'email', 'subject', 'message', 'ticketNumber'],
  },

  // System - Newsletter
  {
    name: 'Newsletter Confirmation',
    slug: 'newsletter-confirmation',
    description: 'Double opt-in confirmation for newsletter',
    category: 'SYSTEM',
    subjectLine: 'Confirm Your Newsletter Subscription',
    preheaderText: 'One more step to get the latest news from The Pickleball Passport.',
    variables: ['email', 'confirmUrl'],
  },
  {
    name: 'Newsletter Welcome',
    slug: 'newsletter-welcome',
    description: 'Welcome email after newsletter subscription confirmed',
    category: 'MARKETING',
    subjectLine: "You're In! Welcome to The Pickleball Passport Newsletter",
    preheaderText: "You'll now receive our latest updates and exclusive offers.",
    variables: ['email', 'unsubscribeUrl'],
  },
  {
    name: 'Unsubscribe Confirmation',
    slug: 'unsubscribe-confirmation',
    description: 'Confirmation when someone unsubscribes from newsletter',
    category: 'SYSTEM',
    subjectLine: "You've Been Unsubscribed",
    preheaderText: "You've been removed from our mailing list.",
    variables: ['email', 'resubscribeUrl'],
  },

  // Support Tickets
  {
    name: 'Support Ticket Created',
    slug: 'ticket-created',
    description: 'Sent when a support ticket is created',
    category: 'TRANSACTIONAL',
    subjectLine: 'Support Ticket #{{ticketNumber}} - {{subject}}',
    preheaderText: 'Your support request has been received.',
    variables: ['name', 'ticketNumber', 'subject', 'statusUrl'],
  },
  {
    name: 'Support Ticket Reply',
    slug: 'ticket-reply',
    description: 'Sent when admin replies to a support ticket',
    category: 'TRANSACTIONAL',
    subjectLine: 'Re: Support Ticket #{{ticketNumber}} - {{subject}}',
    preheaderText: "We've replied to your support request.",
    variables: ['name', 'ticketNumber', 'subject', 'replyContent', 'statusUrl'],
  },
  {
    name: 'Support Ticket Resolved',
    slug: 'ticket-resolved',
    description: 'Sent when a support ticket is marked as resolved',
    category: 'TRANSACTIONAL',
    subjectLine: '✅ Resolved: Support Ticket #{{ticketNumber}}',
    preheaderText: 'Your support ticket has been resolved.',
    variables: ['name', 'ticketNumber', 'subject', 'resolution', 'feedbackUrl'],
  },
  {
    name: 'Support Ticket Admin Notification',
    slug: 'ticket-admin-notification',
    description: 'Internal notification for new support tickets',
    category: 'NOTIFICATIONS',
    subjectLine: '🎫 New Support Ticket - {{priority}} Priority',
    preheaderText: 'A new support ticket needs attention.',
    variables: ['ticketNumber', 'subject', 'priority', 'category', 'senderName', 'adminUrl'],
  },

  // Admin Notifications
  {
    name: 'Installment Failure Admin',
    slug: 'installment-failure-admin',
    description: 'Admin notification when an installment payment fails',
    category: 'NOTIFICATIONS',
    subjectLine: '⚠️ Payment Failed - {{guestName}} ({{bookingReference}})',
    preheaderText: 'An installment payment has failed and needs attention.',
    variables: ['guestName', 'guestEmail', 'bookingReference', 'paymentAmount', 'failureReason'],
  },
  {
    name: 'Booking Cancellation Admin',
    slug: 'booking-cancellation-admin',
    description: 'Admin notification when a booking is cancelled',
    category: 'NOTIFICATIONS',
    subjectLine: '❌ Booking Cancelled - {{bookingReference}}',
    preheaderText: 'A booking has been cancelled.',
    variables: ['guestName', 'bookingReference', 'packageName', 'cancellationReason', 'refundAmount'],
  },
  {
    name: 'High Value Booking Admin',
    slug: 'high-value-booking-admin',
    description: 'Admin notification for high-value bookings',
    category: 'NOTIFICATIONS',
    subjectLine: '💰 High Value Booking - {{totalPrice}}',
    preheaderText: 'A high-value booking has been received!',
    variables: ['guestName', 'guestEmail', 'bookingReference', 'packageName', 'totalPrice'],
  },
  {
    name: 'System Error Admin',
    slug: 'system-error-admin',
    description: 'Admin notification for critical system errors',
    category: 'NOTIFICATIONS',
    subjectLine: '🚨 System Error - {{errorType}}',
    preheaderText: 'A critical system error needs immediate attention.',
    variables: ['errorType', 'errorMessage', 'timestamp', 'stackTrace'],
  },

  // Partner Program
  {
    name: 'Partner Referral Booking',
    slug: 'partner-referral-booking',
    description: 'Sent to partner when a referral completes a booking',
    category: 'TRANSACTIONAL',
    subjectLine: '🎉 Referral Booked - {{pointsEarned}} Points Earned!',
    preheaderText: 'Your referral {{referralName}} just booked a trip!',
    variables: ['partnerName', 'referralName', 'packageName', 'pointsEarned', 'totalPoints'],
  },
  {
    name: 'Partner Referral Application',
    slug: 'partner-referral-application',
    description: 'Sent to partner when a referral submits an application',
    category: 'TRANSACTIONAL',
    subjectLine: '📋 New Referral Application - {{referralName}}',
    preheaderText: 'Someone used your referral link to apply!',
    variables: ['partnerName', 'referralName', 'applicationDate'],
  },
  {
    name: 'Partner Tier Change',
    slug: 'partner-tier-change',
    description: 'Sent when a partner moves to a new tier',
    category: 'TRANSACTIONAL',
    subjectLine: '🏆 Congratulations! You reached {{newTier}}!',
    preheaderText: "You've been upgraded to {{newTier}} status!",
    variables: ['partnerName', 'previousTier', 'newTier', 'newBenefits'],
  },
  {
    name: 'Partner Points Earned',
    slug: 'partner-points-earned',
    description: 'Summary of points earned',
    category: 'TRANSACTIONAL',
    subjectLine: '💎 Points Earned - {{pointsEarned}} Points',
    preheaderText: "You've earned {{pointsEarned}} points!",
    variables: ['partnerName', 'pointsEarned', 'reason', 'totalPoints'],
  },
  {
    name: 'Partner Commission Available',
    slug: 'partner-commission-available',
    description: 'Sent when commission is ready for payout',
    category: 'TRANSACTIONAL',
    subjectLine: '💵 Commission Available - {{commissionAmount}}',
    preheaderText: 'Your commission is ready for withdrawal!',
    variables: ['partnerName', 'commissionAmount', 'payoutUrl'],
  },
  {
    name: 'Partner Referral Click',
    slug: 'partner-referral-click',
    description: 'Notification when someone clicks a referral link',
    category: 'NOTIFICATIONS',
    subjectLine: '👀 Someone clicked your referral link!',
    preheaderText: 'A potential referral is viewing the site.',
    variables: ['partnerName', 'clickTime', 'referralSource'],
  },
  {
    name: 'Partner Monthly Summary',
    slug: 'partner-monthly-summary',
    description: 'Monthly summary of partner activity',
    category: 'MARKETING',
    subjectLine: '📊 Your {{month}} Partner Summary',
    preheaderText: 'Review your partner activity for {{month}}.',
    variables: [
      'partnerName',
      'month',
      'totalClicks',
      'totalApplications',
      'totalBookings',
      'totalPointsEarned',
      'totalCommission',
    ],
  },
];

/**
 * Default HTML template for migrated templates
 */
function generateDefaultHtml(template: TemplateMigration): string {
  const variablesList = template.variables.map((v) => `{{${v}}}`).join(', ');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subjectLine}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #059669; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">The Pickleball Passport</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #333333; margin: 0 0 16px 0;">${template.name}</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 16px 0;">
                This is a placeholder template. Customize the content in the admin UI.
              </p>
              <p style="color: #999999; font-size: 12px; margin: 16px 0 0 0;">
                <strong>Available variables:</strong> ${variablesList}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                &copy; 2026 The Pickleball Passport. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate plain text from template
 */
function generatePlainText(template: TemplateMigration): string {
  return `${template.name}

This is a placeholder template. Customize the content in the admin UI.

Available variables: ${template.variables.join(', ')}

---
The Pickleball Passport
`;
}

async function migrateTemplates() {
  console.log('Starting email template migration...\n');

  // Get system user ID (first admin user)
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    console.error('No admin user found. Please create an admin user first.');
    process.exit(1);
  }

  const userId = adminUser.id;
  console.log(`Using admin user: ${adminUser.email}\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const template of TEMPLATE_MIGRATIONS) {
    try {
      // Check if template already exists
      const existing = await prisma.emailTemplate.findUnique({
        where: { slug: template.slug },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${template.name} (already exists)`);
        skipped++;
        continue;
      }

      // Create the template
      const htmlContent = generateDefaultHtml(template);
      const textContent = generatePlainText(template);

      const newTemplate = await prisma.emailTemplate.create({
        data: {
          name: template.name,
          slug: template.slug,
          description: template.description,
          category: template.category,
          status: 'DRAFT',
          subjectLine: template.subjectLine,
          preheaderText: template.preheaderText,
          htmlContent,
          textContent,
          variables: template.variables,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      // Create analytics record
      await prisma.emailTemplateAnalytics.create({
        data: {
          templateId: newTemplate.id,
        },
      });

      console.log(`✅ Created: ${template.name}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${template.name}:`, error);
      errors++;
    }
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${TEMPLATE_MIGRATIONS.length}`);
}

migrateTemplates()
  .then(() => {
    console.log('\nMigration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
