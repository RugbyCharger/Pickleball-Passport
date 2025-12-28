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
import { applicationRouter } from './routers/application'
import { testimonialRouter } from './routers/testimonial'
import { bookingRouter } from './routers/booking'
import { documentRouter } from './routers/document'
import { notificationRouter } from './routers/notification'
import { supportRouter } from './routers/support'
import { adminRouter } from './routers/admin'
import { analyticsRouter } from './routers/analytics'

export const appRouter = router({
  user: userRouter,
  package: packageRouter,
  email: emailRouter,
  application: applicationRouter,
  testimonial: testimonialRouter,
  booking: bookingRouter,
  document: documentRouter,
  notification: notificationRouter,
  support: supportRouter,
  admin: adminRouter,
  analytics: analyticsRouter,
  // Future routers will be added here:
  // payment: paymentRouter,
})

// Export type definition for the router
export type AppRouter = typeof appRouter
