/**
 * Application Confirmation Email Template
 *
 * Sent to guests after they submit an application
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface ApplicationConfirmationData {
  firstName: string;
  email: string;
  applicationId: string;
  interests: string[];
  preferredDuration: string;
}

/**
 * Format interests for display
 */
function formatInterests(interests: string[]): string {
  return interests
    .map((interest) => {
      const formatted = interest.replace('_', ' ');
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    })
    .join(', ');
}

export function generateApplicationConfirmationEmail(
  data: ApplicationConfirmationData
): {
  html: string;
  text: string;
  subject: string;
} {
  const content = `
    <h1>We Received Your Application! 🎉</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      Thank you for applying to The Pickleball Passport! We're excited to help you plan your
      transformation journey to Thailand.
    </p>

    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Application ID
      </p>
      <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 1px;">
        ${data.applicationId}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Your Application Summary</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Interests:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatInterests(data.interests)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Preferred Duration:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.preferredDuration} days</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: 600; text-align: right;">Under Review</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">What Happens Next?</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #059669;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">1. Schedule Your Video Consultation (Within 24 hours)</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Our team will review your application and send you a calendar link to book a 30-minute video call.
          We'll discuss your goals, answer questions, and start customizing your perfect package.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #2563eb;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">2. Receive Your Custom Package Proposal (Within 48 hours)</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Based on your consultation, we'll create a detailed, personalized itinerary including medical procedures,
          accommodations, pickleball activities, and pricing.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #8b5cf6;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">3. Finalize & Book Your Trip</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Review your package, ask any final questions, and secure your booking with a deposit to lock in your dates.
        </p>
      </div>
    </div>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        💡 While You Wait...
      </p>
      <ul style="margin: 8px 0; padding-left: 20px; color: #1e3a8a; font-size: 14px;">
        <li style="margin: 4px 0;">Browse our <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/packages" style="color: #2563eb; text-decoration: underline;">transformation packages</a></li>
        <li style="margin: 4px 0;">Watch video testimonials from past guests</li>
        <li style="margin: 4px 0;">Start a wishlist of add-ons you're interested in</li>
        <li style="margin: 4px 0;">Check that your passport is valid for at least 6 months</li>
      </ul>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/dashboard" class="button">
        View Your Application
      </a>
    </p>

    <p>
      If you have any questions in the meantime, feel free to reply to this email or
      call us at <a href="tel:+15125648522" style="color: #059669; text-decoration: none;">+1 (512) 564-8522</a>.
    </p>

    <p>
      We're thrilled to be part of your transformation journey!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Application Received - The Pickleball Passport',
    content,
    preheader: 'Your application has been received. Next step: Schedule your consultation!',
    footerText: 'You received this email because you submitted an application to The Pickleball Passport.',
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `Application Received - Let's Plan Your Transformation! 🎉`,
  };
}
