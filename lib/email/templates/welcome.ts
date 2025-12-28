/**
 * Welcome Email Template
 *
 * Sent to new users after they sign up
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface WelcomeEmailData {
  firstName: string;
  email: string;
  source?: string; // How they found us (optional)
}

export function generateWelcomeEmail(data: WelcomeEmailData): {
  html: string;
  text: string;
  subject: string;
} {
  const content = `
    <h1>Welcome to Pickleball Passport, ${data.firstName}! 🎉</h1>

    <p>
      We're absolutely thrilled to have you join our community! You've just taken the first step toward
      an incredible transformation journey that combines world-class medical care, wellness, and pickleball
      in beautiful Thailand.
    </p>

    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 18px; font-weight: bold; margin: 0 0 12px 0;">
        🌟 Why Pickleball Passport? 🌟
      </p>
      <p style="color: #ffffff; font-size: 14px; margin: 0; line-height: 22px;">
        60-70% savings on medical procedures • World-class healthcare<br>
        Daily pickleball sessions • Cultural immersion • Small group experiences
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">🎯 What You Can Expect</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #059669;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">🏥 Premium Medical Care</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          From dental makeovers to cosmetic procedures, all at JCI-accredited facilities with English-speaking doctors.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #2563eb;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">🏓 Daily Pickleball</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Play at top facilities with professional coaching, meet fellow enthusiasts, and improve your game.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #8b5cf6;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">🏨 All-Inclusive Comfort</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Handpicked accommodations, airport transfers, local guides, and curated cultural experiences.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">👥 Small Group Experience</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Travel with 8-12 like-minded people. Build friendships, share experiences, and create memories together.
        </p>
      </div>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">🚀 Get Started in 3 Easy Steps</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 16px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">1. Explore Our Packages</p>
        <p style="margin: 0; color: #166534; font-size: 14px;">
          Browse curated transformation packages designed for different goals: dental makeovers, wellness retreats,
          cosmetic enhancements, or comprehensive transformations.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">2. Find Your Perfect Trip</p>
        <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
          Check our upcoming trip dates and choose one that works for your schedule. Most trips are 7-14 days.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #fef3c7; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">3. Book Your Journey</p>
        <p style="margin: 0; color: #78350f; font-size: 14px;">
          Complete your booking, upload required documents, and we'll handle the rest. From flights to follow-up care,
          we're with you every step of the way.
        </p>
      </div>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/packages" class="button">
        Explore Packages
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        💡 Not Sure Where to Start?
      </p>
      <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
        Reply to this email or schedule a free 15-minute consultation call. Our team will help you design
        the perfect transformation package tailored to your goals and timeline.
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📚 Learn More</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; color: #111827; font-weight: 600;">
        Explore these resources to learn more:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
        <li style="margin: 8px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/packages" style="color: #059669; text-decoration: none;">
            Browse Transformation Packages
          </a>
        </li>
        <li style="margin: 8px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/trips" style="color: #059669; text-decoration: none;">
            View Upcoming Trip Dates
          </a>
        </li>
        <li style="margin: 8px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/about" style="color: #059669; text-decoration: none;">
            Read Guest Testimonials
          </a>
        </li>
        <li style="margin: 8px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/faq" style="color: #059669; text-decoration: none;">
            Frequently Asked Questions
          </a>
        </li>
      </ul>
    </div>

    <div style="margin: 32px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600;">
        🎁 Special Offer for New Members
      </p>
      <p style="margin: 0; color: #78350f; font-size: 14px;">
        Book your first trip within the next 30 days and receive a complimentary upgrade to the next
        accommodation tier! Mention code WELCOME2025 when you book.
      </p>
    </div>

    <p>
      We're here to answer any questions you have! Simply reply to this email, and a member of our team
      will get back to you within 24 hours.
    </p>

    <p>
      Welcome to the Pickleball Passport family! We can't wait to be part of your transformation journey.
    </p>

    <p>
      Here's to new adventures!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Welcome to Pickleball Passport',
    content,
    preheader: 'Your transformation journey starts here! Explore packages and find your perfect trip.',
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: 'Welcome to Pickleball Passport! Your Transformation Journey Starts Here 🏓',
  };
}
