/**
 * Root tRPC Router
 *
 * This is the main router that combines all sub-routers.
 * Add new routers here as features are developed.
 */

import { router } from './trpc'
import { userRouter } from './routers/user'
import { packageRouter } from './routers/package'
import { addOnRouter } from './routers/addon'
import { emailRouter } from './routers/email'
import { applicationRouter } from './routers/application'
import { testimonialRouter } from './routers/testimonial'
import { bookingRouter } from './routers/booking'
import { documentRouter } from './routers/document'
import { notificationRouter } from './routers/notification'
import { supportRouter } from './routers/support'
import { partnerRouter } from './routers/partner'
import { adminRouter } from './routers/admin'
import { analyticsRouter } from './routers/analytics'
import { reminderRouter } from './routers/reminder'
import { tripRouter } from './routers/trip'
import { newsletterRouter } from './routers/newsletter'
import { contactRouter } from './routers/contact'
import { giftRouter } from './routers/gift'

export const appRouter = router({
  user: userRouter,
  package: packageRouter,
  addOn: addOnRouter,
  email: emailRouter,
  application: applicationRouter,
  testimonial: testimonialRouter,
  booking: bookingRouter,
  document: documentRouter,
  notification: notificationRouter,
  support: supportRouter,
  partner: partnerRouter,
  admin: adminRouter,
  analytics: analyticsRouter,
  reminder: reminderRouter,
  trip: tripRouter,
  newsletter: newsletterRouter,
  contact: contactRouter,
  gift: giftRouter,
  // Future routers will be added here:
  // payment: paymentRouter,
})

// Export type definition for the router
export type AppRouter = typeof appRouter
