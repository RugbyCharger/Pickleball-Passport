/**
 * Group Welcome Message WhatsApp Template
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Personalized welcome message sent when a guest joins the WhatsApp group.
 * Can be sent as a group message or as a direct message to the new member.
 */

export interface GroupWelcomeMessageData {
  /** Guest's first name */
  guestName: string;

  /** Trip/package name (e.g., "7-Day Chiang Mai Transformation") */
  tripName: string;

  /** Trip destination (e.g., "Chiang Mai, Thailand") */
  destination: string;

  /** Trip start date in readable format (e.g., "March 15, 2024") */
  startDate: string;

  /** Number of days until the trip starts */
  daysUntilTrip: number;

  /** Total number of members in the group (optional) */
  totalMembers?: number;
}

/**
 * Generate the welcome message for a new group member
 *
 * @example
 * const message = generateGroupWelcomeMessage({
 *   guestName: 'Sarah',
 *   tripName: '7-Day Chiang Mai Transformation',
 *   destination: 'Chiang Mai, Thailand',
 *   startDate: 'March 15, 2024',
 *   daysUntilTrip: 45,
 *   totalMembers: 8,
 * });
 */
export function generateGroupWelcomeMessage(
  data: GroupWelcomeMessageData
): string {
  const countdown = data.daysUntilTrip > 0
    ? `⏳ Only *${data.daysUntilTrip} day${data.daysUntilTrip === 1 ? '' : 's'}* until our adventure begins!`
    : `🎉 The adventure is about to begin!`;

  const memberInfo = data.totalMembers && data.totalMembers > 1
    ? `\n\nYou're now part of a group of *${data.totalMembers} travelers* heading to ${data.destination} together!`
    : '';

  return `🎊 Welcome to the group, ${data.guestName}!

We're thrilled to have you join our *${data.tripName}* WhatsApp group!

📍 *Destination:* ${data.destination}
📅 *Departure:* ${data.startDate}
${countdown}${memberInfo}

💬 *Quick intro tips:*
• Share your name and where you're from
• What procedures or experiences are you most excited about?
• Do you play pickleball? What's your skill level?

Feel free to introduce yourself and ask any questions!

Looking forward to an amazing trip together! 🏓🇹🇭`;
}

/**
 * Generate a group announcement for when a new member joins
 * (To be posted in the group chat)
 */
export function generateNewMemberAnnouncementMessage(
  data: Pick<GroupWelcomeMessageData, 'guestName'>
): string {
  return `👋 Everyone, please welcome *${data.guestName}* to our group!

${data.guestName}, feel free to introduce yourself - we'd love to hear about you and what you're looking forward to on our trip!

🏓🎉`;
}

/**
 * Generate a welcome message for when the group is first created
 * (Pinned as the first message in the group)
 */
export interface GroupIntroMessageData {
  /** Trip/package name */
  tripName: string;

  /** Trip destination */
  destination: string;

  /** Trip start date */
  startDate: string;

  /** Trip end date */
  endDate: string;

  /** Organizer name or "The Pickleball Passport Team" */
  organizerName?: string;
}

export function generateGroupIntroMessage(
  data: GroupIntroMessageData
): string {
  const organizer = data.organizerName || 'The Pickleball Passport Team';

  return `🏓 *Welcome to ${data.tripName}!* 🏓

This is the official WhatsApp group for our upcoming trip to ${data.destination}.

📅 *Trip Dates:* ${data.startDate} - ${data.endDate}

*What this group is for:*
✅ Meeting your fellow travelers before the trip
✅ Asking questions about the trip
✅ Sharing excitement and travel tips
✅ Receiving important updates from our team
✅ Coordinating meetups and activities

*Group Guidelines:*
🔹 Be friendly and respectful
🔹 Keep discussions trip-related
🔹 No spam or promotional content
🔹 Questions? Tag an admin or reply to this message

We'll share updates here as your departure date approaches. In the meantime, introduce yourself!

Looking forward to an incredible journey together! 🇹🇭✨

- ${organizer}`;
}
