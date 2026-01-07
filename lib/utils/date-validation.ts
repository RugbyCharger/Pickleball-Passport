/**
 * Date validation utilities for booking modifications
 * Used for eligibility checks across booking operations
 */

/**
 * Calculate days until a future date
 * @param targetDate - The target date to calculate days until
 * @returns Number of days until the target date (negative if in the past)
 */
export function calculateDaysUntilDate(targetDate: Date): number {
  return Math.floor(
    (new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
}

/**
 * Check if booking can be modified (>60 days before trip)
 * @param tripStartDate - The start date of the trip
 * @param bookingStatus - Current booking status
 * @param tripAssigned - Whether a trip has been assigned
 * @returns Object with canModify boolean and optional reason string
 */
export function canModifyBooking(
  tripStartDate: Date,
  bookingStatus: string,
  tripAssigned: boolean = true
): { canModify: boolean; reason?: string } {
  if (bookingStatus !== 'CONFIRMED') {
    return { canModify: false, reason: 'Booking must be confirmed' }
  }

  if (!tripAssigned) {
    return { canModify: false, reason: 'No trip assigned to booking' }
  }

  const tripStart = new Date(tripStartDate)
  const now = new Date()

  if (tripStart <= now) {
    return { canModify: false, reason: 'Trip has already started' }
  }

  const daysUntil = calculateDaysUntilDate(tripStartDate)

  if (daysUntil <= 60) {
    return {
      canModify: false,
      reason: 'Modifications allowed only 60+ days before trip'
    }
  }

  return { canModify: true }
}
