/**
 * Trip Group Invitation WhatsApp Template
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Sent to guests after booking confirmation to invite them to join
 * the trip's WhatsApp group for pre-departure communication.
 */

export interface TripGroupInvitationData {
  /** Guest's first name */
  guestName: string;

  /** Trip/package name (e.g., "7-Day Chiang Mai Transformation") */
  tripName: string;

  /** Trip destination (e.g., "Chiang Mai, Thailand") */
  destination: string;

  /** Trip start date in readable format (e.g., "March 15, 2024") */
  startDate: string;

  /** Trip end date in readable format (e.g., "March 22, 2024") */
  endDate: string;

  /** WhatsApp group invite link (e.g., "https://chat.whatsapp.com/ABC123") */
  inviteLink: string;

  /** Number of guests already in the group (optional) */
  memberCount?: number;
}

/**
 * Generate the trip group invitation message
 *
 * @example
 * const message = generateTripGroupInvitationMessage({
 *   guestName: 'John',
 *   tripName: '7-Day Chiang Mai Transformation',
 *   destination: 'Chiang Mai, Thailand',
 *   startDate: 'March 15, 2024',
 *   endDate: 'March 22, 2024',
 *   inviteLink: 'https://chat.whatsapp.com/ABC123',
 *   memberCount: 5,
 * });
 */
export function generateTripGroupInvitationMessage(
  data: TripGroupInvitationData
): string {
  const memberInfo =
    data.memberCount && data.memberCount > 0
      ? `\n👥 ${data.memberCount} fellow traveler${data.memberCount === 1 ? '' : 's'} already in the group!`
      : '';

  return `🎉 Hi ${data.guestName}!

Welcome to The Pickleball Passport! Your booking for *${data.tripName}* is confirmed.

📍 *Destination:* ${data.destination}
📅 *Dates:* ${data.startDate} - ${data.endDate}

We've created a WhatsApp group for your trip where you can:
✈️ Connect with fellow travelers before departure
💬 Ask questions and share tips
📢 Receive important updates from our team
🤝 Start building friendships!${memberInfo}

👉 *Join the group here:*
${data.inviteLink}

Tap the link above to join and introduce yourself!

We're excited to have you join us in Thailand! 🏓🇹🇭

- The Pickleball Passport Team`;
}

/**
 * Generate a shorter version for follow-up reminders
 */
export function generateTripGroupReminderMessage(
  data: Pick<TripGroupInvitationData, 'guestName' | 'tripName' | 'inviteLink'>
): string {
  return `👋 Hi ${data.guestName}!

Just a friendly reminder to join our WhatsApp group for your upcoming *${data.tripName}* trip!

Don't miss out on connecting with your fellow travelers and getting important updates.

👉 Join here: ${data.inviteLink}

See you there! 🏓

- The Pickleball Passport Team`;
}
