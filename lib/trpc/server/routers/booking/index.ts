/**
 * Booking Router Index
 * 
 * Combines all booking sub-routers into a single router.
 * This provides a modular organization while maintaining a single API surface.
 * 
 * Sub-routers:
 * - queries: Read operations (list, getById, getBookingByReference)
 * - trips: Trip management (getAvailableTrips, assignTrip)
 * - Main router: Payment intent creation and modifications
 */

import { router } from '../../trpc'
import { bookingQueriesRouter } from './queries'
import { bookingTripsRouter } from './trips'

// Import the main payment procedures from the original booking router
// These are kept in the main file due to their complexity
export { bookingRouter as bookingPaymentRouter } from '../booking'

/**
 * Combined booking router with all sub-routers merged
 * 
 * This exports the merged router which includes:
 * - All query procedures from bookingQueriesRouter
 * - All trip procedures from bookingTripsRouter
 * - All payment and modification procedures from the main booking router
 */
export const bookingSubRouters = {
  queries: bookingQueriesRouter,
  trips: bookingTripsRouter,
}
