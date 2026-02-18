/**
 * Post-Trip Follow-Up Email Sequence Templates
 * E15: Post-Trip Email Sequence (COMM-03)
 *
 * 5 emails sent at different milestones after trip ends:
 * - 3 days: Welcome back, how was trip
 * - 7 days: Request testimonial/review
 * - 14 days: Share photos, alumni community
 * - 30 days: Referral program reminder
 * - 60 days: Rebook incentive, upcoming trips
 */

import { baseEmailTemplate, generatePlainText } from './base'

// Milestone constants for tracking
export const POST_TRIP_MILESTONES = {
  THREE_DAYS: { key: '3_DAYS', daysAfterTrip: 3, label: '3 Days After' },
  SEVEN_DAYS: { key: '7_DAYS', daysAfterTrip: 7, label: '7 Days After' },
  FOURTEEN_DAYS: { key: '14_DAYS', daysAfterTrip: 14, label: '14 Days After' },
  THIRTY_DAYS: { key: '30_DAYS', daysAfterTrip: 30, label: '30 Days After' },
  SIXTY_DAYS: { key: '60_DAYS', daysAfterTrip: 60, label: '60 Days After' },
} as const

export type PostTripMilestoneKey = typeof POST_TRIP_MILESTONES[keyof typeof POST_TRIP_MILESTONES]['key']

export interface PostTripEmailData {
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

  // Links
  testimonialUrl: string
  rebookUrl: string
  portalUrl: string
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
 * Generate trip recap box (reusable across emails)
 */
function generateTripRecapBox(data: PostTripEmailData): string {
  return `
    <div style="margin: 24px 0; padding: 20px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">
        Your Transformation Journey
      </p>
      <p style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">
        ${data.packageName}
      </p>
      <p style="color: #ffffff; font-size: 14px; margin: 0;">
        ${formatShortDate(data.tripStartDate)} - ${formatShortDate(data.tripEndDate)}
      </p>
    </div>
  `
}

/**
 * 3 Days After: Welcome Back
 */
function generate3DaysEmail(data: PostTripEmailData): string {
  return `
    <h1>Welcome Home, ${data.firstName}!</h1>

    <p>
      We hope you've had a chance to settle back in after your incredible
      ${data.packageName} experience in ${data.destination}!
    </p>

    ${generateTripRecapBox(data)}

    <p>
      The Pickleball Passport team wants to hear from you! How was your trip?
      We'd love to know:
    </p>

    <div style="margin: 24px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        <li style="margin: 8px 0;">What was your favorite moment?</li>
        <li style="margin: 8px 0;">How are you feeling post-trip?</li>
        <li style="margin: 8px 0;">Any feedback on how we can improve?</li>
      </ul>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">What's Next?</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 12px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
        <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">Follow Up on Treatments</p>
        <p style="margin: 0; color: #166534; font-size: 14px;">
          If you had any medical or dental procedures, remember to follow the post-care instructions
          provided by your doctors. Contact us if you have questions!
        </p>
      </div>
      <div style="margin: 12px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
        <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">Access Your Trip Photos</p>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          Your trip photos will be uploaded to your member portal within the next few days.
          Check back soon to relive the memories!
        </p>
      </div>
      <div style="margin: 12px 0; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600;">Stay Connected</p>
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          You're now part of The Pickleball Passport alumni community!
          Stay tuned for exclusive alumni events and offers.
        </p>
      </div>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.portalUrl}" class="button">
        Access Your Member Portal
      </a>
    </p>

    <p>
      We're so glad you chose The Pickleball Passport for your transformation journey.
      Reply to this email anytime - we love hearing from our alumni!
    </p>

    <p>
      Welcome home!<br>
      <strong>The Pickleball Passport Team</strong>
    </p>
  `
}

/**
 * 7 Days After: Testimonial Request
 */
function generate7DaysEmail(data: PostTripEmailData): string {
  return `
    <h1>Share Your Story, ${data.firstName}!</h1>

    <p>
      It's been a week since your return from ${data.destination}, and we hope
      you're still riding that post-trip high!
    </p>

    ${generateTripRecapBox(data)}

    <div style="margin: 24px 0; padding: 24px; background-color: #f0fdf4; border-radius: 12px; border: 2px solid #059669; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 24px;">Your Voice Matters</p>
      <p style="margin: 0 0 16px 0; color: #166534; font-size: 16px;">
        Your experience can help others discover the life-changing journey
        that awaits them in Thailand.
      </p>
      <a href="${data.testimonialUrl}" class="button" style="background-color: #059669;">
        Share Your Testimonial
      </a>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Why Share?</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        <li style="margin: 8px 0;">
          <strong>Help others</strong> – Your story could be the nudge someone needs to take the leap
        </li>
        <li style="margin: 8px 0;">
          <strong>Earn rewards</strong> – Approved testimonials earn you bonus referral points!
        </li>
        <li style="margin: 8px 0;">
          <strong>Be featured</strong> – Selected testimonials appear on our website and social media
        </li>
        <li style="margin: 8px 0;">
          <strong>Just 5 minutes</strong> – Quick form with optional photo/video upload
        </li>
      </ul>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">What to Include</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 12px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">Ideas for Your Testimonial</p>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px;">
          <li style="margin: 4px 0;">Your favorite pickleball moments</li>
          <li style="margin: 4px 0;">Results from your medical/dental treatments</li>
          <li style="margin: 4px 0;">The wellness experiences that stood out</li>
          <li style="margin: 4px 0;">How the trip exceeded your expectations</li>
          <li style="margin: 4px 0;">Before & after photos (if applicable)</li>
        </ul>
      </div>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.testimonialUrl}" class="button">
        Write Your Review
      </a>
    </p>

    <p>
      Thank you for being part of The Pickleball Passport family!
    </p>

    <p>
      With gratitude,<br>
      <strong>The Pickleball Passport Team</strong>
    </p>
  `
}

/**
 * 14 Days After: Share Photos & Alumni Community
 */
function generate14DaysEmail(data: PostTripEmailData): string {
  return `
    <h1>Relive the Memories, ${data.firstName}!</h1>

    <p>
      Two weeks have flown by since your ${data.packageName} adventure.
      Ready to take a trip down memory lane?
    </p>

    ${generateTripRecapBox(data)}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Your Trip Photos Are Ready!</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
      <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">Download & Share</p>
      <p style="margin: 0; color: #166534; font-size: 14px;">
        Professional photos from your trip are now available in your member portal.
        Download them, share with friends, and relive those amazing moments!
      </p>
    </div>

    <p style="text-align: center; margin: 24px 0;">
      <a href="${data.portalUrl}" class="button" style="background-color: #D4AF37;">
        View Your Photos
      </a>
    </p>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Welcome to the Alumni Community!</h2>

    <div style="margin: 16px 0; padding: 24px; background-color: #eff6ff; border-radius: 12px;">
      <p style="margin: 0 0 16px 0; color: #1e40af; font-size: 16px;">
        As The Pickleball Passport alumni, you now have access to exclusive benefits:
      </p>

      <div style="margin: 12px 0;">
        <p style="margin: 0 0 4px 0; color: #1e40af; font-weight: 600;">Alumni Directory</p>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          Connect with fellow travelers who share your passion for pickleball and adventure.
        </p>
      </div>

      <div style="margin: 12px 0;">
        <p style="margin: 0 0 4px 0; color: #1e40af; font-weight: 600;">Exclusive Events</p>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          Get invites to alumni-only pickleball tournaments, reunions, and special gatherings.
        </p>
      </div>

      <div style="margin: 12px 0;">
        <p style="margin: 0 0 4px 0; color: #1e40af; font-weight: 600;">Return Guest Perks</p>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          Special discounts and VIP treatment on your next trip.
        </p>
      </div>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Share Your Photos</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #fce7f3; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #9d174d; font-weight: 600;">Tag Us on Social!</p>
      <p style="margin: 0; color: #9d174d; font-size: 14px;">
        Sharing your trip photos on social media? Don't forget to tag
        <strong>@PickleballPassport</strong> – we love celebrating our travelers!
      </p>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.portalUrl}" class="button">
        Explore Alumni Portal
      </a>
    </p>

    <p>
      Thanks for making memories with us!
    </p>

    <p>
      Cheers,<br>
      <strong>The Pickleball Passport Team</strong>
    </p>
  `
}

/**
 * 30 Days After: Referral Program Reminder
 */
function generate30DaysEmail(data: PostTripEmailData): string {
  return `
    <h1>Share the Adventure, ${data.firstName}!</h1>

    <p>
      It's been a month since your return from ${data.destination}. We bet you've
      been telling friends about your incredible experience!
    </p>

    ${generateTripRecapBox(data)}

    <div style="margin: 24px 0; padding: 24px; background: linear-gradient(135deg, #D4AF37 0%, #f59e0b 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">
        Earn Rewards for Referrals!
      </p>
      <p style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0;">
        Know someone who'd love The Pickleball Passport?
      </p>
      <p style="color: #ffffff; font-size: 14px; margin: 0;">
        Share your referral code and earn points toward your next trip!
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">How It Works</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 12px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
        <p style="margin: 0 0 4px 0; color: #166534; font-weight: 600;">1. Share Your Code</p>
        <p style="margin: 0; color: #166534; font-size: 14px;">
          Find your unique referral code in your member portal
        </p>
      </div>
      <div style="margin: 12px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px;">
        <p style="margin: 0 0 4px 0; color: #1e40af; font-weight: 600;">2. Friend Books a Trip</p>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          They use your code when booking their adventure
        </p>
      </div>
      <div style="margin: 12px 0; padding: 16px; background-color: #fef3c7; border-radius: 8px;">
        <p style="margin: 0 0 4px 0; color: #92400e; font-weight: 600;">3. You Both Win</p>
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          Earn points redeemable for discounts, and they get a friend discount too!
        </p>
      </div>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Bring a Friend Discount</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #111827;">
        Planning to return with friends or family?
      </p>
      <p style="margin: 0; color: #4b5563; font-size: 14px;">
        Book together and everyone in your group saves! Contact us for group discounts
        on your next transformation journey.
      </p>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.portalUrl}" class="button">
        Get Your Referral Code
      </a>
    </p>

    <div style="margin: 24px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        Pro Tip
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        The best referrals come from sharing your real experience! Tell friends about
        your favorite moments, the quality of care you received, and how much you saved
        compared to US prices.
      </p>
    </div>

    <p>
      Thanks for spreading the word about The Pickleball Passport!
    </p>

    <p>
      Your friends in Thailand,<br>
      <strong>The Pickleball Passport Team</strong>
    </p>
  `
}

/**
 * 60 Days After: Rebook Incentive
 */
function generate60DaysEmail(data: PostTripEmailData): string {
  return `
    <h1>Ready for Round Two, ${data.firstName}?</h1>

    <p>
      It's been two months since your ${data.packageName} experience. We're
      already planning amazing trips for this year – and we'd love to see you again!
    </p>

    ${generateTripRecapBox(data)}

    <div style="margin: 24px 0; padding: 24px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">
        Alumni Exclusive
      </p>
      <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">
        Return Guest Discount
      </p>
      <p style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0;">
        Book your next trip and enjoy special alumni pricing
      </p>
      <a href="${data.rebookUrl}" class="button" style="background-color: #D4AF37; color: #1f2937 !important;">
        View Upcoming Trips
      </a>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">What's New at The Pickleball Passport</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 12px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">New Packages</p>
        <p style="margin: 0; color: #166534; font-size: 14px;">
          We've added exciting new packages including advanced pickleball clinics,
          extended wellness retreats, and comprehensive health transformation programs.
        </p>
      </div>
      <div style="margin: 12px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">New Partners</p>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          We've expanded our network of exceptional medical facilities and premier
          accommodations to give you even more choices.
        </p>
      </div>
      <div style="margin: 12px 0; padding: 16px; background-color: #fce7f3; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #9d174d; font-weight: 600;">Alumni Reunions</p>
        <p style="margin: 0; color: #9d174d; font-size: 14px;">
          Join fellow The Pickleball Passport alumni for special reunion trips with
          familiar faces and new friends!
        </p>
      </div>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Upcoming Trip Dates</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #111827;">
        Don't miss out on these popular departures:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        <li style="margin: 8px 0;">Spring trips filling fast</li>
        <li style="margin: 8px 0;">Summer adventure packages</li>
        <li style="margin: 8px 0;">Fall wellness retreats</li>
        <li style="margin: 8px 0;">Holiday special experiences</li>
      </ul>
      <p style="margin: 16px 0 0 0; color: #dc2626; font-size: 14px; font-weight: 600;">
        Popular dates book months in advance!
      </p>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.rebookUrl}" class="button">
        Explore & Book Now
      </a>
    </p>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Why Come Back?</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <ul style="margin: 0; padding-left: 20px; color: #92400e;">
        <li style="margin: 4px 0;"><strong>Continue your transformation</strong> – Follow-up treatments at incredible savings</li>
        <li style="margin: 4px 0;"><strong>Try a new package</strong> – Experience a different side of Thailand</li>
        <li style="margin: 4px 0;"><strong>Bring friends</strong> – Share the experience with people you love</li>
        <li style="margin: 4px 0;"><strong>Alumni perks</strong> – VIP treatment as a returning guest</li>
      </ul>
    </div>

    <p>
      We'd love to welcome you back to Thailand! Have questions or want to discuss
      your next trip? Just reply to this email.
    </p>

    <p>
      See you soon!<br>
      <strong>The Pickleball Passport Team</strong>
    </p>
  `
}

/**
 * Generate post-trip email for a specific milestone
 */
export function generatePostTripEmail(
  data: PostTripEmailData,
  milestone: PostTripMilestoneKey
): {
  html: string
  text: string
  subject: string
} {
  let content: string
  let subject: string

  switch (milestone) {
    case '3_DAYS':
      content = generate3DaysEmail(data)
      subject = `Welcome Home, ${data.firstName}! How Was Your Trip?`
      break
    case '7_DAYS':
      content = generate7DaysEmail(data)
      subject = `Share Your Story, ${data.firstName} - Help Others Discover The Pickleball Passport`
      break
    case '14_DAYS':
      content = generate14DaysEmail(data)
      subject = `Your Trip Photos Are Ready + Welcome to the Alumni Community!`
      break
    case '30_DAYS':
      content = generate30DaysEmail(data)
      subject = `Earn Rewards: Share The Pickleball Passport With Friends`
      break
    case '60_DAYS':
      content = generate60DaysEmail(data)
      subject = `Ready for Round Two? Alumni Discount Inside`
      break
    default:
      throw new Error(`Unknown milestone: ${milestone}`)
  }

  const html = baseEmailTemplate({
    title: subject,
    content,
    preheader: `Post-trip follow-up from your Pickleball Passport journey`,
    footerText: `This is a post-trip email for your Pickleball Passport booking (${data.bookingReference}).`,
  })

  const text = generatePlainText(content)

  return { html, text, subject }
}
