/**
 * WhatsApp Message Templates
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Re-exports all WhatsApp message templates for easy importing.
 */

// Trip Group Invitation
export {
  generateTripGroupInvitationMessage,
  generateTripGroupReminderMessage,
  type TripGroupInvitationData,
} from './trip-group-invitation';

// Group Welcome Messages
export {
  generateGroupWelcomeMessage,
  generateNewMemberAnnouncementMessage,
  generateGroupIntroMessage,
  type GroupWelcomeMessageData,
  type GroupIntroMessageData,
} from './group-welcome-message';

// Pre-Trip Milestone Messages
export {
  WHATSAPP_MILESTONES,
  generateMilestoneMessage,
  generate60DaysMessage,
  generate30DaysMessage,
  generate14DaysMessage,
  generate7DaysMessage,
  generate1DayMessage,
  getMilestoneForDays,
  getMilestonesInRange,
  type WhatsAppMilestoneKey,
  type MilestoneMessageData,
} from './milestone-messages';
