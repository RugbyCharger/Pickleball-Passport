/**
 * Root tRPC Router
 *
 * This is the main router that combines all sub-routers.
 * Add new routers here as features are developed.
 */

import { router } from './trpc'
import { userRouter } from './routers/user'
import { packageRouter } from './routers/package'
import { emailRouter } from './routers/email'

export const appRouter = router({
  user: userRouter,
  package: packageRouter,
  email: emailRouter,
  // Future routers will be added here:
  // booking: bookingRouter,
  // payment: paymentRouter,
  // application: applicationRouter,
})

// Export type definition for the router
export type AppRouter = typeof appRouter
