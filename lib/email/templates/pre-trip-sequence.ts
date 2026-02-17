/**
 * Pre-Trip Nurture Email Sequence Templates
 * E11-S4: Pre-Trip Email Sequence
 *
 * 5 emails sent at different milestones before trip:
 * - 60 days: Excitement & prep overview
 * - 30 days: Flight booking & visa info
 * - 14 days: Checklist & documents
 * - 7 days: Packing list & weather
 * - 1 day: Final reminders & arrival info
 */

import { baseEmailTemplate, generatePlainText } from './base'

// Milestone constants for tracking
export const PRE_TRIP_MILESTONES = {
  SIXTY_DAYS: { key: '60_DAYS', daysBeforeTrip: 60, label: '60 Days' },
  THIRTY_DAYS: { key: '30_DAYS', daysBeforeTrip: 30, label: '30 Days' },
  FOURTEEN_DAYS: { key: '14_DAYS', daysBeforeTrip: 14, label: '14 Days' },
  SEVEN_DAYS: { key: '7_DAYS', daysBeforeTrip: 7, label: '7 Days' },
  ONE_DAY: { key: '1_DAY', daysBeforeTrip: 1, label: '1 Day' },
} as const

export type PreTripMilestoneKey = typeof PRE_TRIP_MILESTONES[keyof typeof PRE_TRIP_MILESTONES]['key']

export interface PreTripEmailData {
  // Guest details
  firstName: string
  email: string

  // Booking info
  bookingReference: string
  packageName: string

  // Trip details
  tripStartDate: string // ISO date string
  tripEndDate: string // ISO date string
  destination: string
  accommodationTier: string
  duration: number // days

  // Links
  portalUrl: string
  checklistUrl: string
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format short date
 */
function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Generate trip details box (reusable across emails)
 */
function generateTripDetailsBox(data: PreTripEmailData): string {
  return `
    <div style="margin: 24px 0; padding: 20px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">
        Your Transformation Journey
      </p>
      <p style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">
        ${data.packageName}
      </p>
      <p style="color: #ffffff; font-size: 14px; margin: 0;">
        ${formatShortDate(data.tripStartDate)} - ${formatShortDate(data.tripEndDate)} · ${data.duration} days
      </p>
    </div>
  `
}

/**
 * 60 Days Before: Excitement & Prep Overview
 */
function generate60DaysEmail(data: PreTripEmailData): string {
  return `
    <h1>Your Transformation Journey Begins Soon! 🌟</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      <strong>60 days from now</strong>, you'll be stepping off a plane in Thailand, 
      ready to begin an incredible transformation journey that combines world-class 
      pickleball, rejuvenating wellness experiences, and amazing medical care – 
      all at a fraction of US costs!
    </p>

    ${generateTripDetailsBox(data)}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">🎯 What's Ahead</h2>

    <p>
      Over the next two months, we'll guide you through everything you need to prepare. 
      Here's a preview of what's coming:
    </p>

    <div style="margin: 24px 0;">
      <div style="margin: 16px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
        <p style="margin: 0 0 4px 0; color: #166534; font-weight: 600;">📅 30 Days Before</p>
        <p style="margin: 0; color: #166534; font-size: 14px;">Book your flights & check visa requirements</p>
      </div>
      <div style="margin: 16px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
        <p style="margin: 0 0 4px 0; color: #1e40af; font-weight: 600;">📋 14 Days Before</p>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">Complete pre-trip checklist & upload documents</p>
      </div>
      <div style="margin: 16px 0; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0 0 4px 0; color: #92400e; font-weight: 600;">🎒 7 Days Before</p>
        <p style="margin: 0; color: #92400e; font-size: 14px;">Pack your bags with our curated packing list</p>
      </div>
      <div style="margin: 16px 0; padding: 16px; background-color: #fce7f3; border-radius: 8px; border-left: 4px solid #ec4899;">
        <p style="margin: 0 0 4px 0; color: #9d174d; font-weight: 600;">✈️ 1 Day Before</p>
        <p style="margin: 0; color: #9d174d; font-size: 14px;">Final reminders & arrival information</p>
      </div>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ What You Can Do Now</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        <li style="margin: 8px 0;"><strong>Check your passport</strong> – Make sure it's valid for at least 6 months beyond your travel dates</li>
        <li style="margin: 8px 0;"><strong>Start researching flights</strong> – Prices to Thailand often drop 6-8 weeks before departure</li>
        <li style="margin: 8px 0;"><strong>Explore your member portal</strong> – Get familiar with your itinerary and package details</li>
        <li style="margin: 8px 0;"><strong>Get excited!</strong> – Start telling friends about your upcoming adventure 🎉</li>
      </ul>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.portalUrl}" class="button">
        Access Your Member Portal
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        💡 Did You Know?
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        Thailand is consistently ranked as one of the world's top destinations for medical tourism, 
        with JCI-accredited hospitals and dental clinics that serve over 3 million international 
        patients annually. You're in excellent hands!
      </p>
    </div>

    <p>
      We're counting down the days with you! If you have any questions, 
      don't hesitate to reach out.
    </p>

    <p>
      See you in Thailand soon!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `
}

/**
 * 30 Days Before: Flight Booking & Visa Info
 */
function generate30DaysEmail(data: PreTripEmailData): string {
  return `
    <h1>Time to Book Your Flights! ✈️</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      <strong>Just 30 days to go!</strong> Now's the perfect time to book your flights 
      to Thailand. This is typically when you'll find the best balance of price and availability.
    </p>

    ${generateTripDetailsBox(data)}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✈️ Flight Booking Tips</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; color: #111827; font-weight: 600;">Recommended Arrival:</p>
      <p style="margin: 0 0 16px 0; color: #059669; font-size: 18px; font-weight: bold;">
        ${formatDate(data.tripStartDate)} (before 6 PM local time)
      </p>
      
      <p style="margin: 0 0 12px 0; color: #111827; font-weight: 600;">Recommended Departure:</p>
      <p style="margin: 0; color: #dc2626; font-size: 18px; font-weight: bold;">
        ${formatDate(data.tripEndDate)} (after 10 AM local time)
      </p>
    </div>

    <div style="margin: 24px 0;">
      <div style="margin: 16px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">🎯 Pro Tips</p>
        <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px;">
          <li style="margin: 4px 0;">Flying into <strong>Chiang Mai (CNX)</strong> is most convenient</li>
          <li style="margin: 4px 0;">Consider adding a day buffer before your program starts</li>
          <li style="margin: 4px 0;">Book directly with airlines for easier changes if needed</li>
          <li style="margin: 4px 0;">Check Google Flights for price comparison across dates</li>
        </ul>
      </div>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">🛂 Visa Information</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        Good News for Most Travelers!
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        Citizens from the USA, UK, Canada, Australia, and most EU countries can enter Thailand 
        <strong>visa-free for up to 30 days</strong>. Since your trip is ${data.duration} days, 
        you should be covered!
      </p>
    </div>

    <div style="margin: 16px 0; padding: 16px; background-color: #fef3c7; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600;">⚠️ Important Requirements</p>
      <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
        <li style="margin: 4px 0;">Passport valid for 6+ months beyond travel dates</li>
        <li style="margin: 4px 0;">Proof of onward travel (your return flight)</li>
        <li style="margin: 4px 0;">Address in Thailand (we'll provide this)</li>
      </ul>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📱 Travel Essentials to Arrange</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 12px 0; padding: 12px 16px; background-color: #f9fafb; border-radius: 8px; display: flex; align-items: center;">
        <span style="font-size: 20px; margin-right: 12px;">💳</span>
        <div>
          <p style="margin: 0; color: #111827; font-weight: 600;">Notify Your Bank</p>
          <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">Set travel alerts so your cards work abroad</p>
        </div>
      </div>
      <div style="margin: 12px 0; padding: 12px 16px; background-color: #f9fafb; border-radius: 8px; display: flex; align-items: center;">
        <span style="font-size: 20px; margin-right: 12px;">📶</span>
        <div>
          <p style="margin: 0; color: #111827; font-weight: 600;">Phone Plan</p>
          <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">We provide a Thai SIM card – or check if your plan has international coverage</p>
        </div>
      </div>
      <div style="margin: 12px 0; padding: 12px 16px; background-color: #f9fafb; border-radius: 8px; display: flex; align-items: center;">
        <span style="font-size: 20px; margin-right: 12px;">🏥</span>
        <div>
          <p style="margin: 0; color: #111827; font-weight: 600;">Travel Insurance</p>
          <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">Recommended for peace of mind (we can suggest providers)</p>
        </div>
      </div>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.portalUrl}" class="button">
        View Your Itinerary
      </a>
    </p>

    <p>
      Questions about flights or visa? Reply to this email and we'll help!
    </p>

    <p>
      Happy booking!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `
}

/**
 * 14 Days Before: Checklist & Documents
 */
function generate14DaysEmail(data: PreTripEmailData): string {
  return `
    <h1>Two Weeks to Go – Checklist Time! 📋</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      <strong>Only 14 days until you're in Thailand!</strong> This is the perfect time 
      to make sure all your ducks are in a row. Let's go through your pre-trip checklist.
    </p>

    ${generateTripDetailsBox(data)}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ Pre-Trip Checklist</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <div style="margin: 12px 0; padding: 12px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #111827;">☐ <strong>Flights booked</strong> – arriving ${formatShortDate(data.tripStartDate)}</p>
      </div>
      <div style="margin: 12px 0; padding: 12px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #111827;">☐ <strong>Passport valid</strong> – 6+ months from travel date</p>
      </div>
      <div style="margin: 12px 0; padding: 12px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #111827;">☐ <strong>Flight details submitted</strong> – upload in member portal</p>
      </div>
      <div style="margin: 12px 0; padding: 12px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #111827;">☐ <strong>Medical questionnaire completed</strong> – for any procedures</p>
      </div>
      <div style="margin: 12px 0; padding: 12px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #111827;">☐ <strong>Emergency contact info added</strong> – in your profile</p>
      </div>
      <div style="margin: 12px 0; padding: 12px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #111827;">☐ <strong>Dietary restrictions noted</strong> – we'll accommodate!</p>
      </div>
    </div>

    <p style="text-align: center; margin: 24px 0;">
      <a href="${data.checklistUrl}" class="button" style="background-color: #D4AF37;">
        Complete Your Checklist
      </a>
    </p>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📄 Documents to Have Ready</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 12px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">🛂 At the Airport</p>
        <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px;">
          <li style="margin: 4px 0;">Valid passport</li>
          <li style="margin: 4px 0;">Printed or digital flight confirmation</li>
          <li style="margin: 4px 0;">Hotel address (we'll email this to you)</li>
        </ul>
      </div>
      <div style="margin: 12px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">🏥 For Medical Procedures</p>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px;">
          <li style="margin: 4px 0;">Recent X-rays or dental records (if applicable)</li>
          <li style="margin: 4px 0;">List of current medications</li>
          <li style="margin: 4px 0;">Any doctor's notes or referrals</li>
        </ul>
      </div>
    </div>

    <div style="margin: 24px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600;">
        💊 Medications Reminder
      </p>
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        Bring enough of your current prescriptions for your entire trip, plus a few extra days. 
        Keep them in original containers in your carry-on bag. Thai pharmacies are well-stocked, 
        but it's best to bring what you need.
      </p>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.portalUrl}" class="button">
        Go to Member Portal
      </a>
    </p>

    <p>
      Two weeks and counting! Let us know if you need help with anything.
    </p>

    <p>
      Almost there!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `
}

/**
 * 7 Days Before: Packing List & Weather
 */
function generate7DaysEmail(data: PreTripEmailData): string {
  return `
    <h1>One Week to Go – Time to Pack! 🎒</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      <strong>Just 7 days until your adventure begins!</strong> Let's make sure you're 
      packed and ready for an amazing trip to Thailand.
    </p>

    ${generateTripDetailsBox(data)}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">🌤️ Weather in ${data.destination}</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        Expect: Warm & Tropical ☀️
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px;">
        <li style="margin: 4px 0;">Daytime: 75-90°F (24-32°C)</li>
        <li style="margin: 4px 0;">Evening: 65-75°F (18-24°C)</li>
        <li style="margin: 4px 0;">Light rain possible – pack a compact umbrella</li>
        <li style="margin: 4px 0;">Strong sun – sunscreen is a must!</li>
      </ul>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">👕 Packing Essentials</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 12px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">🏓 For Pickleball</p>
        <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px;">
          <li style="margin: 4px 0;">Athletic shoes (court shoes preferred)</li>
          <li style="margin: 4px 0;">Moisture-wicking shirts/shorts</li>
          <li style="margin: 4px 0;">Sports sunglasses</li>
          <li style="margin: 4px 0;">Your favorite paddle (optional – we provide quality paddles)</li>
        </ul>
      </div>

      <div style="margin: 12px 0; padding: 16px; background-color: #fce7f3; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #9d174d; font-weight: 600;">🧘 For Wellness & Spa</p>
        <ul style="margin: 0; padding-left: 20px; color: #9d174d; font-size: 14px;">
          <li style="margin: 4px 0;">Comfortable yoga/workout clothes</li>
          <li style="margin: 4px 0;">Swimsuit for pool/spa</li>
          <li style="margin: 4px 0;">Light robe or cover-up</li>
          <li style="margin: 4px 0;">Flip flops or sandals</li>
        </ul>
      </div>

      <div style="margin: 12px 0; padding: 16px; background-color: #fef3c7; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600;">🌴 Casual & Exploring</p>
        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
          <li style="margin: 4px 0;">Light, breathable clothing</li>
          <li style="margin: 4px 0;">Modest outfit for temples (shoulders/knees covered)</li>
          <li style="margin: 4px 0;">Comfortable walking shoes</li>
          <li style="margin: 4px 0;">Light jacket/sweater for air conditioning</li>
        </ul>
      </div>

      <div style="margin: 12px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">🧳 Don't Forget</p>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
          <li style="margin: 4px 0;">Sunscreen (SPF 30+) & sunglasses</li>
          <li style="margin: 4px 0;">Insect repellent</li>
          <li style="margin: 4px 0;">Reusable water bottle</li>
          <li style="margin: 4px 0;">Power adapter (Thailand uses Type A/B/C plugs)</li>
          <li style="margin: 4px 0;">Small day bag or backpack</li>
          <li style="margin: 4px 0;">Any medications in original containers</li>
        </ul>
      </div>
    </div>

    <div style="margin: 24px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
      <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">
        💡 Pro Tip: Pack Light!
      </p>
      <p style="margin: 0; color: #166534; font-size: 14px;">
        Thailand has amazing laundry services (often same-day for just a few dollars). 
        Plus, you might want room for souvenirs! Aim for a carry-on if you can.
      </p>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.portalUrl}" class="button">
        View Full Packing List
      </a>
    </p>

    <p>
      One week to go – the excitement is building!
    </p>

    <p>
      Pack light, travel happy!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `
}

/**
 * 1 Day Before: Final Reminders & Arrival Info
 */
function generate1DayEmail(data: PreTripEmailData): string {
  return `
    <h1>You're Leaving Tomorrow! 🎉</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      <strong>This is it – you leave TOMORROW!</strong> We are so excited to welcome you 
      to Thailand for your transformation journey. Here's everything you need for a smooth arrival.
    </p>

    ${generateTripDetailsBox(data)}

    <div style="margin: 32px 0; padding: 24px; background-color: #f0fdf4; border-radius: 12px; border: 2px solid #059669;">
      <h2 style="color: #166534; font-size: 20px; margin: 0 0 16px 0;">🛬 Arrival Information</h2>
      
      <div style="margin: 12px 0; padding: 12px; background-color: #ffffff; border-radius: 6px;">
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Your Arrival Date</p>
        <p style="margin: 0; color: #111827; font-weight: 600; font-size: 16px;">${formatDate(data.tripStartDate)}</p>
      </div>

      <div style="margin: 12px 0; padding: 12px; background-color: #ffffff; border-radius: 6px;">
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Airport Pickup</p>
        <p style="margin: 0; color: #111827; font-weight: 600; font-size: 16px;">
          Our team will meet you at arrivals with The Pickleball Passport sign
        </p>
      </div>

      <div style="margin: 12px 0; padding: 12px; background-color: #ffffff; border-radius: 6px;">
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Emergency Contact (24/7)</p>
        <p style="margin: 0; color: #111827; font-weight: 600; font-size: 16px;">
          📞 +66 123 456 789 (WhatsApp available)
        </p>
      </div>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ Final Checklist</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <div style="margin: 8px 0;">
        <p style="margin: 0; color: #111827;">☐ Passport (valid 6+ months)</p>
      </div>
      <div style="margin: 8px 0;">
        <p style="margin: 0; color: #111827;">☐ Flight confirmation (printed or digital)</p>
      </div>
      <div style="margin: 8px 0;">
        <p style="margin: 0; color: #111827;">☐ Phone charger & power adapter</p>
      </div>
      <div style="margin: 8px 0;">
        <p style="margin: 0; color: #111827;">☐ Medications in carry-on</p>
      </div>
      <div style="margin: 8px 0;">
        <p style="margin: 0; color: #111827;">☐ This email saved for reference</p>
      </div>
      <div style="margin: 8px 0;">
        <p style="margin: 0; color: #111827;">☐ Big smile and excitement! 😄</p>
      </div>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✈️ Flight Tips</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 12px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">💧 Stay Hydrated</p>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          Drink plenty of water on the flight. Skip alcohol – it dehydrates you at altitude.
        </p>
      </div>
      <div style="margin: 12px 0; padding: 16px; background-color: #fce7f3; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #9d174d; font-weight: 600;">🚶 Move Around</p>
        <p style="margin: 0; color: #9d174d; font-size: 14px;">
          Get up and stretch every few hours. Your body will thank you!
        </p>
      </div>
      <div style="margin: 12px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">😴 Adjust Your Clock</p>
        <p style="margin: 0; color: #166534; font-size: 14px;">
          Start shifting your sleep schedule now if you can. Thailand is GMT+7.
        </p>
      </div>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">🎁 Upon Arrival</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 12px 0; color: #92400e; font-weight: 600;">
        What to Expect:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
        <li style="margin: 4px 0;">Our driver will hold a sign with your name at arrivals</li>
        <li style="margin: 4px 0;">You'll receive a welcome kit with Thai SIM card & essentials</li>
        <li style="margin: 4px 0;">Transfer to your ${data.accommodationTier} accommodation</li>
        <li style="margin: 4px 0;">Rest and settle in – orientation is the next morning</li>
      </ul>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.portalUrl}" class="button">
        Access Member Portal
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #166534; font-size: 18px; font-weight: 600;">
        🏓 See you in Thailand tomorrow! 🇹🇭
      </p>
    </div>

    <p>
      Safe travels! We can't wait to meet you and start your transformation journey together.
    </p>

    <p>
      Travel safe!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `
}

/**
 * Generate pre-trip email for a specific milestone
 */
export function generatePreTripEmail(
  data: PreTripEmailData,
  milestone: PreTripMilestoneKey
): {
  html: string
  text: string
  subject: string
} {
  let content: string
  let subject: string

  switch (milestone) {
    case '60_DAYS':
      content = generate60DaysEmail(data)
      subject = `60 Days to Go! Your ${data.packageName} Journey Awaits 🌟`
      break
    case '30_DAYS':
      content = generate30DaysEmail(data)
      subject = `30 Days Out – Time to Book Your Flights to Thailand ✈️`
      break
    case '14_DAYS':
      content = generate14DaysEmail(data)
      subject = `2 Weeks to Thailand! Complete Your Pre-Trip Checklist 📋`
      break
    case '7_DAYS':
      content = generate7DaysEmail(data)
      subject = `1 Week to Go – What to Pack for Thailand 🎒`
      break
    case '1_DAY':
      content = generate1DayEmail(data)
      subject = `🎉 You Leave TOMORROW! Final Reminders for Thailand`
      break
    default:
      throw new Error(`Unknown milestone: ${milestone}`)
  }

  const html = baseEmailTemplate({
    title: subject,
    content,
    preheader: `Pre-trip update for your Pickleball Passport journey`,
    footerText: `This is a pre-trip email for your Pickleball Passport booking (${data.bookingReference}).`,
  })

  const text = generatePlainText(content)

  return { html, text, subject }
}
