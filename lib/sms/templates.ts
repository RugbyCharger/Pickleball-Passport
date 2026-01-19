/**
 * SMS Message Templates
 * E11-S6: SMS Notifications
 *
 * Template functions for generating SMS messages
 * Messages must be brief (160 chars per segment) and actionable
 */

/**
 * Payment Failure SMS Template
 * 
 * @param bookingReference - Booking reference (e.g., "PBP-2026-123456")
 * @param amount - Amount in cents
 * @param retryLink - Link to update payment method
 * @returns SMS message
 */
export function paymentFailureSMS(
  bookingReference: string,
  amount: number,
  retryLink: string
): string {
  const amountDollars = (amount / 100).toFixed(2);
  // Keep under 160 chars, include essential info and link
  return `URGENT: Payment failed for booking ${bookingReference}. Amount: $${amountDollars}. Update payment: ${retryLink}`;
}

/**
 * Flight Delay SMS Template
 * 
 * @param tripDate - Trip date (formatted string)
 * @param newTime - New departure time
 * @param contactInfo - Contact phone number
 * @param detailsLink - Link to view full details
 * @returns SMS message
 */
export function flightDelaySMS(
  tripDate: string,
  newTime: string,
  contactInfo: string,
  detailsLink: string
): string {
  // Keep concise, include key info
  return `UPDATE: Flight on ${tripDate} delayed. New departure: ${newTime}. Contact: ${contactInfo}. Details: ${detailsLink}`;
}

/**
 * Itinerary Change SMS Template
 * 
 * @param bookingReference - Booking reference
 * @param changeDetails - Brief description of change
 * @param dashboardLink - Link to view updated itinerary
 * @returns SMS message
 */
export function itineraryChangeSMS(
  bookingReference: string,
  changeDetails: string,
  dashboardLink: string
): string {
  // Truncate changeDetails if too long to fit in SMS
  const maxChangeLength = 80;
  const truncatedChange = changeDetails.length > maxChangeLength
    ? `${changeDetails.slice(0, maxChangeLength)}...`
    : changeDetails;
  
  return `IMPORTANT: Itinerary change for ${bookingReference}: ${truncatedChange}. View: ${dashboardLink}`;
}

/**
 * Emergency Alert SMS Template
 * 
 * @param alertMessage - Emergency message
 * @param contactInfo - Emergency contact phone
 * @param safetyLink - Link to safety info or dashboard
 * @returns SMS message
 */
export function emergencyAlertSMS(
  alertMessage: string,
  contactInfo: string,
  safetyLink: string
): string {
  // Truncate alert message if needed
  const maxMessageLength = 100;
  const truncatedMessage = alertMessage.length > maxMessageLength
    ? `${alertMessage.slice(0, maxMessageLength)}...`
    : alertMessage;
  
  return `ALERT: ${truncatedMessage} Contact: ${contactInfo}. Stay safe: ${safetyLink}`;
}
