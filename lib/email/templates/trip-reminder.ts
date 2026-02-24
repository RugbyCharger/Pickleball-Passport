/**
 * Trip Reminder Email Template
 *
 * Sent to guests before their trip (7 days, 1 day before)
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface TripReminderData {
  // Guest details
  userId?: string; // Optional userId for preference token generation (E11-S12)
  firstName: string;
  email: string;

  // Trip details
  bookingReference: string;
  packageName: string;
  tripStartDate: string; // ISO date string
  tripEndDate: string; // ISO date string
  destination: string;
  accommodationTier: string;

  // Pre-trip checklist
  checklistItems: Array<{
    item: string;
    completed: boolean;
  }>;

  // Days until trip
  daysUntilTrip: number;

  // Portal link
  portalUrl?: string;

  // Optional add-ons
  addOns?: Array<{
    name: string;
    quantity: number;
  }>;

  // Preference token for footer links (E11-S12)
  preferenceToken?: string;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format short date
 */
function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function generateTripReminderEmail(data: TripReminderData): {
  html: string;
  text: string;
  subject: string;
} {
  const portalUrl = data.portalUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/dashboard`;

  // Determine urgency level
  const isUrgent = data.daysUntilTrip <= 1;
  const urgencyColor = isUrgent ? '#dc2626' : '#f59e0b';
  const urgencyBg = isUrgent ? '#fee2e2' : '#fef3c7';
  const urgencyText = isUrgent ? '#991b1b' : '#92400e';

  // Get incomplete checklist items
  const incompleteItems = data.checklistItems.filter(item => !item.completed);
  const completedItems = data.checklistItems.filter(item => item.completed);

  const content = `
    <h1>${isUrgent ? '🚨' : '✈️'} Your Trip is ${data.daysUntilTrip === 0 ? 'Today' : data.daysUntilTrip === 1 ? 'Tomorrow' : `in ${data.daysUntilTrip} Days`}!</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      ${isUrgent
        ? 'Your Pickleball Passport transformation journey starts very soon! Here\'s everything you need to know for a smooth arrival.'
        : 'Your trip to Thailand is coming up! Time to make sure everything is ready for your amazing transformation journey.'
      }
    </p>

    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Booking Reference
      </p>
      <p style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 16px 0; letter-spacing: 2px;">
        ${data.bookingReference}
      </p>
      <p style="color: #ffffff; font-size: 16px; margin: 0;">
        ${formatShortDate(data.tripStartDate)} - ${formatShortDate(data.tripEndDate)}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📅 Your Trip Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Check-in:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatDate(data.tripStartDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Check-out:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatDate(data.tripEndDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Destination:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.destination}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.packageName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Accommodation:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.accommodationTier}</td>
        </tr>
      </table>
    </div>

    ${data.addOns && data.addOns.length > 0 ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
      <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">Your Add-Ons:</h3>
      ${data.addOns.map(addOn => `
        <p style="margin: 4px 0; color: #166534; font-size: 14px;">
          ${addOn.quantity > 1 ? `${addOn.quantity}x ` : ''}${addOn.name}
        </p>
      `).join('')}
    </div>
    ` : ''}

    ${incompleteItems.length > 0 ? `
    <div style="margin: 32px 0; padding: 20px; background-color: ${urgencyBg}; border-radius: 8px; border-left: 4px solid ${urgencyColor};">
      <p style="margin: 0 0 12px 0; color: ${urgencyText}; font-weight: 600;">
        ${isUrgent ? '🚨 Action Required Before Departure!' : '⚠️ Pre-Trip Checklist'}
      </p>
      ${incompleteItems.map(item => `
        <p style="margin: 8px 0; color: ${urgencyText}; font-size: 14px;">
          ❌ ${item.item}
        </p>
      `).join('')}
    </div>
    ` : ''}

    ${completedItems.length > 0 ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
      <p style="margin: 0 0 12px 0; color: #166534; font-weight: 600;">
        ✅ Completed Items
      </p>
      ${completedItems.map(item => `
        <p style="margin: 4px 0; color: #166534; font-size: 14px;">
          ✓ ${item.item}
        </p>
      `).join('')}
    </div>
    ` : ''}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">${isUrgent ? '🎒 Final Reminders' : '📝 Important Reminders'}</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">📱 Download Offline Maps</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Get Google Maps offline for Chiang Mai in case you need directions without data.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">💊 Pack Your Medications</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Bring any current prescriptions in original containers. Keep them in carry-on luggage.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">🏓 Bring Your Paddle (Optional)</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          We provide quality paddles, but feel free to bring your favorite if you prefer!
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">💳 Notify Your Bank</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Let your bank know you'll be traveling to Thailand to avoid card blocks.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">🌡️ Check the Weather</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Chiang Mai is tropical! Pack light, breathable clothing and sunscreen.
        </p>
      </div>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${portalUrl}" class="button">
        Access Member Portal
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        💡 Upon Arrival
      </p>
      <ul style="margin: 8px 0; padding-left: 20px; color: #1e3a8a; font-size: 14px;">
        <li style="margin: 4px 0;">Our team will meet you at the airport or your hotel (check your itinerary)</li>
        <li style="margin: 4px 0;">You'll receive a welcome package with local SIM card and essentials</li>
        <li style="margin: 4px 0;">First orientation session typically happens the next morning</li>
        <li style="margin: 4px 0;">Emergency contact number: +66 123 456 789 (available 24/7)</li>
      </ul>
    </div>

    <p>
      ${isUrgent
        ? 'Safe travels! We can\'t wait to welcome you to Thailand tomorrow. If you have any last-minute questions, please call or text our emergency line.'
        : 'If you have any questions or need assistance with your preparations, feel free to reach out. We\'re here to help make your journey seamless!'
      }
    </p>

    <p>
      See you soon in Thailand!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `;

  const html = baseEmailTemplate({
    title: `Trip Reminder - ${data.daysUntilTrip} ${data.daysUntilTrip === 1 ? 'Day' : 'Days'} to Go!`,
    content,
    preheader: `Your trip starts ${data.daysUntilTrip === 0 ? 'today' : data.daysUntilTrip === 1 ? 'tomorrow' : `in ${data.daysUntilTrip} days`}! Here's what you need to know.`,
    footerText: `This is a trip reminder for your Pickleball Passport booking.`,
    preferenceToken: data.preferenceToken,
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `${isUrgent ? '🚨 ' : ''}Your Trip ${data.daysUntilTrip === 0 ? 'is Today' : data.daysUntilTrip === 1 ? 'is Tomorrow' : `in ${data.daysUntilTrip} Days`}! - ${data.packageName}`,
  };
}
