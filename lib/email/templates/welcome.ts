/**
 * Welcome Email Template
 *
 * Sent to new users after they sign up
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface WelcomeEmailData {
  firstName: string;
  email: string;
}

export function generateWelcomeEmail(data: WelcomeEmailData): {
  html: string;
  text: string;
  subject: string;
} {
  const content = `
    <h1>Welcome to Pickleball Passport, ${data.firstName}! 🎉</h1>

    <p>
      We're thrilled to have you join our community of pickleball enthusiasts and wellness seekers!
    </p>

    <p>
      Pickleball Passport offers a unique blend of world-class medical care, wellness treatments,
      and pickleball training in the beautiful setting of Thailand—all at 60-70% savings compared
      to the US.
    </p>

    <h2 style="color: #111827; font-size: 18px; margin: 24px 0 12px 0;">What's Next?</h2>

    <p>
      <strong>1. Explore Our Packages</strong><br>
      Browse our curated transformation packages, from dental makeovers to complete wellness journeys.
    </p>

    <p>
      <strong>2. Check Upcoming Trips</strong><br>
      View our scheduled trips and find dates that work for your schedule.
    </p>

    <p>
      <strong>3. Apply When Ready</strong><br>
      Complete a simple application to start your transformation journey.
    </p>

    <p style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/packages" class="button">
        Explore Packages
      </a>
    </p>

    <p>
      Have questions? Our team is here to help! Simply reply to this email or visit our website.
    </p>

    <p>
      Here's to your transformation journey!<br>
      <strong>The Pickleball Passport Team</strong>
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Welcome to Pickleball Passport',
    content,
    preheader: 'Your transformation journey starts here!',
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: 'Welcome to Pickleball Passport! 🏓',
  };
}
