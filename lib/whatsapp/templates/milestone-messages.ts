/**
 * Pre-Trip Milestone WhatsApp Message Templates
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Messages sent at specific milestones before the trip:
 * - 60 days: Excitement & initial prep
 * - 30 days: Flight booking reminder
 * - 14 days: Checklist & documents
 * - 7 days: Packing tips
 * - 1 day: Final reminders & arrival info
 *
 * These mirror the email sequence (lib/email/templates/pre-trip-sequence.ts)
 * but are optimized for WhatsApp's mobile-first, concise format.
 */

// Milestone constants - consistent with email templates
export const WHATSAPP_MILESTONES = {
  SIXTY_DAYS: { key: '60_DAYS', daysBeforeTrip: 60, label: '60 Days' },
  THIRTY_DAYS: { key: '30_DAYS', daysBeforeTrip: 30, label: '30 Days' },
  FOURTEEN_DAYS: { key: '14_DAYS', daysBeforeTrip: 14, label: '14 Days' },
  SEVEN_DAYS: { key: '7_DAYS', daysBeforeTrip: 7, label: '7 Days' },
  ONE_DAY: { key: '1_DAY', daysBeforeTrip: 1, label: '1 Day' },
} as const;

export type WhatsAppMilestoneKey =
  (typeof WHATSAPP_MILESTONES)[keyof typeof WHATSAPP_MILESTONES]['key'];

export interface MilestoneMessageData {
  /** Guest's first name */
  guestName: string;

  /** Trip/package name */
  tripName: string;

  /** Trip destination (e.g., "Chiang Mai, Thailand") */
  destination: string;

  /** Trip start date in readable format */
  startDate: string;

  /** Trip end date in readable format */
  endDate: string;

  /** Link to the member portal */
  portalUrl: string;

  /** Accommodation tier name (optional) */
  accommodationTier?: string;
}

/**
 * 60 Days Before: Excitement & Initial Prep
 */
export function generate60DaysMessage(data: MilestoneMessageData): string {
  return `🌟 *60 Days to Go, ${data.guestName}!*

Your *${data.tripName}* adventure is coming up!

📍 ${data.destination}
📅 ${data.startDate} - ${data.endDate}

*Quick prep checklist:*
✅ Check passport (valid 6+ months)
✅ Start researching flights
✅ Get excited! 🎉

We'll send helpful reminders as your trip approaches. Any questions? Reply here!

🏓 See you in Thailand!`;
}

/**
 * 30 Days Before: Flight Booking Reminder
 */
export function generate30DaysMessage(data: MilestoneMessageData): string {
  return `✈️ *30 Days Out, ${data.guestName}!*

Time to book your flights for *${data.tripName}*!

📍 Flying to: ${data.destination}
📅 Arrive by: ${data.startDate}

*Flight tips:*
🔹 Chiang Mai (CNX) is the closest airport
🔹 Aim to arrive before 6 PM local time
🔹 Book directly with airlines for flexibility

*Visa info:* US/UK/EU citizens get 30-day visa-free entry! 🎉

Need flight recommendations? Just ask!

✈️ Happy booking!`;
}

/**
 * 14 Days Before: Checklist & Documents
 */
export function generate14DaysMessage(data: MilestoneMessageData): string {
  return `📋 *2 Weeks to Go, ${data.guestName}!*

Time to wrap up your pre-trip checklist for *${data.tripName}*!

*Before you go:*
☐ Flights booked (arriving ${data.startDate})
☐ Passport valid 6+ months
☐ Flight details uploaded to portal
☐ Medical forms completed
☐ Emergency contact added

*Don't forget:*
💊 Bring enough medications for the trip
📄 Any medical records (if having procedures)

Complete your checklist: ${data.portalUrl}

Almost there! 🙌`;
}

/**
 * 7 Days Before: Packing Tips
 */
export function generate7DaysMessage(data: MilestoneMessageData): string {
  return `🎒 *1 Week to Go, ${data.guestName}!*

Time to pack for *${data.tripName}*!

*Weather in ${data.destination}:*
☀️ Warm & tropical (75-90°F / 24-32°C)
🌧️ Possible light rain – bring an umbrella

*Packing essentials:*
🏓 Athletic wear & court shoes
🧘 Yoga/swimwear for wellness
👕 Light, breathable clothes
🔌 Power adapter (Type A/B/C)
☀️ Sunscreen & sunglasses
💊 Medications (in original containers)

*Pro tip:* Pack light! Amazing laundry services for just a few dollars. Leave room for souvenirs! 🛍️

See you soon! 🇹🇭`;
}

/**
 * 1 Day Before: Final Reminders & Arrival Info
 */
export function generate1DayMessage(data: MilestoneMessageData): string {
  const accommodation = data.accommodationTier
    ? `\n🏨 Transfer to your ${data.accommodationTier} accommodation`
    : '';

  return `🎉 *You Leave TOMORROW, ${data.guestName}!*

So excited to welcome you to *${data.tripName}*!

📍 ${data.destination}
📅 Arriving: ${data.startDate}

*On arrival:*
🛬 Look for our Pickleball Passport sign at arrivals
📱 You'll receive a Thai SIM card & welcome kit${accommodation}
😴 Rest up – orientation is the next morning!

*Final checklist:*
✅ Passport
✅ Flight confirmation
✅ Phone charger & adapter
✅ Medications in carry-on
✅ This message saved for reference! 📌

*Emergency contact (24/7):*
📞 WhatsApp: +66 123 456 789

Safe travels! See you in Thailand! 🏓🇹🇭`;
}

/**
 * Generate a milestone message based on the milestone key
 */
export function generateMilestoneMessage(
  data: MilestoneMessageData,
  milestone: WhatsAppMilestoneKey
): string {
  switch (milestone) {
    case '60_DAYS':
      return generate60DaysMessage(data);
    case '30_DAYS':
      return generate30DaysMessage(data);
    case '14_DAYS':
      return generate14DaysMessage(data);
    case '7_DAYS':
      return generate7DaysMessage(data);
    case '1_DAY':
      return generate1DayMessage(data);
    default: {
      // TypeScript exhaustive check
      const _exhaustiveCheck: never = milestone;
      throw new Error(`Unknown milestone: ${_exhaustiveCheck}`);
    }
  }
}

/**
 * Get the milestone key for a given number of days before trip
 * Returns undefined if not at a milestone day
 */
export function getMilestoneForDays(
  daysBeforeTrip: number
): WhatsAppMilestoneKey | undefined {
  const milestone = Object.values(WHATSAPP_MILESTONES).find(
    (m) => m.daysBeforeTrip === daysBeforeTrip
  );
  return milestone?.key;
}

/**
 * Get all milestones that should be sent for a given days range
 * Useful for catching up if milestones were missed
 */
export function getMilestonesInRange(
  fromDays: number,
  toDays: number
): WhatsAppMilestoneKey[] {
  return Object.values(WHATSAPP_MILESTONES)
    .filter((m) => m.daysBeforeTrip <= fromDays && m.daysBeforeTrip >= toDays)
    .sort((a, b) => b.daysBeforeTrip - a.daysBeforeTrip)
    .map((m) => m.key);
}
