/**
 * Root tRPC Router
 *
 * This is the main router that combines all sub-routers.
 * Add new routers here as features are developed.
 */

import { router } from './trpc'
import { userRouter } from './routers/user'

export const appRouter = router({
  user: userRouter,
  // Future routers will be added here:
  // package: packageRouter,
  // booking: bookingRouter,
  // payment: paymentRouter,
  // application: applicationRouter,
})

// Export type definition for the router
export type AppRouter = typeof appRouter
