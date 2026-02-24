import { z } from 'zod'
import type { AgentTool } from './types'

const emptyInputSchema = z.object({}).default({})

const bookingCreatePaymentIntentInput = z.object({
  packageId: z.string(),
  duration: z.number(),
  accommodationTier: z.enum(['LUXURY', 'ULTRA_LUXURY', 'VILLA']),
  addOnIds: z.array(z.string()).optional().default([]),
  tripId: z.string().optional(),
  referralCode: z.string().optional(),
  paymentPlan: z.enum(['FULL', 'INSTALLMENT_4', 'FINANCING']).optional().default('FULL'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).optional().default('USD'),
})

const bookingIdInput = z.object({
  bookingId: z.string(),
})

const bookingCancelInput = z.object({
  bookingId: z.string(),
  cancelBothBookings: z.boolean().optional().default(false),
  companionBookingId: z.string().optional(),
})

const bookingRescheduleInput = z.object({
  bookingId: z.string(),
  newTripId: z.string(),
  rescheduleBothBookings: z.boolean().optional(),
  companionBookingId: z.string().optional(),
})

const bookingModifyInput = z.object({
  bookingId: z.string(),
  addOnIds: z.array(z.string()),
})

const paymentSetupIntentInput = z.object({
  bookingId: z.string(),
})

const paymentUpdateDefaultInput = z.object({
  bookingId: z.string(),
  paymentMethodId: z.string(),
})

const userUpdateProfileInput = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  emergencyContactRelationship: z.string().optional().nullable(),
})

const userDeleteAccountInput = z.object({
  confirmation: z.literal('DELETE'),
})

const supportCreateInput = z.object({
  message: z.string(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  category: z.enum([
    'GENERAL_INQUIRY',
    'BOOKING_QUESTION',
    'MEDICAL_WELLNESS_QUESTION',
    'PAYMENT_ISSUE',
    'PARTNERSHIP_INQUIRY',
    'OTHER',
  ]),
})

const supportListInput = z
  .object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  })
  .optional()
  .default({})

const supportGetByIdInput = z.object({
  id: z.string(),
})

const documentListInput = z
  .object({
    bookingId: z.string().optional(),
    type: z.enum(['PASSPORT', 'MEDICAL_FORM', 'INSURANCE', 'VISA', 'OTHER']).optional(),
    status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED']).optional(),
  })
  .optional()
  .default({})

const documentGetByIdInput = z.object({
  id: z.string(),
})

const documentCreateInput = z.object({
  bookingId: z.string().optional(),
  type: z.enum(['PASSPORT', 'MEDICAL_FORM', 'INSURANCE', 'VISA', 'OTHER']),
  fileName: z.string(),
  fileUrl: z.string().url(),
  fileSize: z.number(),
  mimeType: z.string(),
})

const documentDeleteInput = z.object({
  id: z.string(),
})

const notificationListInput = z
  .object({
    unreadOnly: z.boolean().optional(),
    type: z.enum(['BOOKING_CONFIRMATION', 'PAYMENT_RECEIPT', 'TRIP_REMINDER', 'GENERAL']).optional(),
    limit: z.number().int().positive().max(100).optional().default(50),
  })
  .optional()
  .default({ limit: 50 })

const notificationIdInput = z.object({
  id: z.string(),
})

const packageGetBySlugInput = z.object({
  slug: z.string(),
})

const tripGetByIdInput = z.object({
  id: z.string(),
})

const addOnCategoryEnum = z.enum([
  'DENTAL',
  'FACIAL_COSMETIC',
  'BODY',
  'HEALTH_SCREENING',
  'SPA',
  'YOGA_MEDITATION',
  'CULTURAL',
  'PICKLEBALL',
])

const addOnGetByCategoryInput = z.object({
  category: addOnCategoryEnum,
})

const addOnGetByCategoriesInput = z
  .object({
    categories: z.array(addOnCategoryEnum).optional(),
  })
  .optional()
  .default({})

const agentTools: AgentTool<unknown>[] = [
  // ============================================================================
  // DISCOVERY TOOLS (Read-only)
  // ============================================================================
  {
    name: 'package.list',
    description: 'List all available packages with pricing and duration options.',
    inputSchema: emptyInputSchema,
    inputSchemaJson: { type: 'object', properties: {} },
    execute: async ({ caller }) => caller.package.getAll(),
  },
  {
    name: 'package.get_by_slug',
    description: 'Get detailed package information by slug (e.g., "pure-play", "smile-makeover").',
    inputSchema: packageGetBySlugInput,
    inputSchemaJson: {
      type: 'object',
      properties: { slug: { type: 'string' } },
      required: ['slug'],
    },
    execute: async ({ caller }, input) =>
      caller.package.getBySlug(input as z.infer<typeof packageGetBySlugInput>),
  },
  {
    name: 'trip.list_available',
    description:
      'List all available trips with dates, destinations, and remaining capacity. Only shows future trips with open spots.',
    inputSchema: emptyInputSchema,
    inputSchemaJson: { type: 'object', properties: {} },
    execute: async ({ caller }) => caller.trip.getAvailable(),
  },
  {
    name: 'trip.get_by_id',
    description: 'Get trip details by ID including dates, destination, and capacity.',
    inputSchema: tripGetByIdInput,
    inputSchemaJson: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    execute: async ({ caller }, input) =>
      caller.trip.getById(input as z.infer<typeof tripGetByIdInput>),
  },
  {
    name: 'addon.list',
    description:
      'List all available add-ons (medical, wellness, cultural) with Thailand vs US pricing comparison.',
    inputSchema: emptyInputSchema,
    inputSchemaJson: { type: 'object', properties: {} },
    execute: async ({ caller }) => caller.addOn.getAll(),
  },
  {
    name: 'addon.get_by_category',
    description:
      'Get add-ons filtered by category. Categories: DENTAL, FACIAL_COSMETIC, BODY, HEALTH_SCREENING, SPA, YOGA_MEDITATION, CULTURAL, PICKLEBALL.',
    inputSchema: addOnGetByCategoryInput,
    inputSchemaJson: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: [
            'DENTAL',
            'FACIAL_COSMETIC',
            'BODY',
            'HEALTH_SCREENING',
            'SPA',
            'YOGA_MEDITATION',
            'CULTURAL',
            'PICKLEBALL',
          ],
        },
      },
      required: ['category'],
    },
    execute: async ({ caller }, input) =>
      caller.addOn.getByCategory(input as z.infer<typeof addOnGetByCategoryInput>),
  },
  {
    name: 'addon.get_by_categories',
    description:
      'Get add-ons filtered by multiple categories. Useful for showing medical add-ons (DENTAL, FACIAL_COSMETIC, BODY, HEALTH_SCREENING) or wellness add-ons (SPA, YOGA_MEDITATION, CULTURAL, PICKLEBALL).',
    inputSchema: addOnGetByCategoriesInput,
    inputSchemaJson: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'DENTAL',
              'FACIAL_COSMETIC',
              'BODY',
              'HEALTH_SCREENING',
              'SPA',
              'YOGA_MEDITATION',
              'CULTURAL',
              'PICKLEBALL',
            ],
          },
        },
      },
    },
    execute: async ({ caller }, input) =>
      caller.addOn.getByCategories(input as z.infer<typeof addOnGetByCategoriesInput>),
  },
  // ============================================================================
  // BOOKING TOOLS
  // ============================================================================
  {
    name: 'booking.create_payment_intent',
    description: 'Create a booking and Stripe payment intent for a package selection.',
    inputSchema: bookingCreatePaymentIntentInput,
    inputSchemaJson: {
      type: 'object',
      properties: {
        packageId: { type: 'string' },
        duration: { type: 'number' },
        accommodationTier: { type: 'string', enum: ['LUXURY', 'ULTRA_LUXURY', 'VILLA'] },
        addOnIds: { type: 'array', items: { type: 'string' } },
        tripId: { type: 'string' },
        referralCode: { type: 'string' },
        paymentPlan: { type: 'string', enum: ['FULL', 'INSTALLMENT_4', 'FINANCING'] },
        currency: { type: 'string', enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] },
      },
      required: ['packageId', 'duration', 'accommodationTier'],
    },
    execute: async ({ caller }, input) =>
      caller.booking.createPaymentIntent(input as z.infer<typeof bookingCreatePaymentIntentInput>),
  },
  {
    name: 'booking.list',
    description: 'List bookings for the current user.',
    inputSchema: emptyInputSchema,
    inputSchemaJson: { type: 'object', properties: {} },
    execute: async ({ caller }) => caller.booking.list(),
  },
  {
    name: 'booking.get_by_id',
    description: 'Fetch a booking with details by ID.',
    inputSchema: bookingIdInput,
    inputSchemaJson: {
      type: 'object',
      properties: { bookingId: { type: 'string' } },
      required: ['bookingId'],
    },
    execute: async ({ caller }, input) =>
      caller.booking.getById(input as z.infer<typeof bookingIdInput>),
  },
  {
    name: 'booking.cancel',
    description: 'Cancel a booking and calculate refund based on policy.',
    inputSchema: bookingCancelInput,
    inputSchemaJson: {
      type: 'object',
      properties: {
        bookingId: { type: 'string' },
        cancelBothBookings: { type: 'boolean' },
        companionBookingId: { type: 'string' },
      },
      required: ['bookingId'],
    },
    execute: async ({ caller }, input) =>
      caller.booking.cancel(input as z.infer<typeof bookingCancelInput>),
  },
  {
    name: 'booking.reschedule',
    description: 'Reschedule a booking to a different trip.',
    inputSchema: bookingRescheduleInput,
    inputSchemaJson: {
      type: 'object',
      properties: {
        bookingId: { type: 'string' },
        newTripId: { type: 'string' },
        rescheduleBothBookings: { type: 'boolean' },
        companionBookingId: { type: 'string' },
      },
      required: ['bookingId', 'newTripId'],
    },
    execute: async ({ caller }, input) =>
      caller.booking.reschedule(input as z.infer<typeof bookingRescheduleInput>),
  },
  {
    name: 'booking.modify_add_ons',
    description: 'Modify add-ons for a booking (price adjustment handled server-side).',
    inputSchema: bookingModifyInput,
    inputSchemaJson: {
      type: 'object',
      properties: {
        bookingId: { type: 'string' },
        addOnIds: { type: 'array', items: { type: 'string' } },
      },
      required: ['bookingId', 'addOnIds'],
    },
    execute: async ({ caller }, input) =>
      caller.booking.modify(input as z.infer<typeof bookingModifyInput>),
  },
  {
    name: 'payment.create_setup_intent',
    description: 'Create a Stripe SetupIntent for updating payment method.',
    inputSchema: paymentSetupIntentInput,
    inputSchemaJson: {
      type: 'object',
      properties: { bookingId: { type: 'string' } },
      required: ['bookingId'],
    },
    execute: async ({ caller }, input) =>
      caller.payment.createSetupIntent(input as z.infer<typeof paymentSetupIntentInput>),
  },
  {
    name: 'payment.get_payment_methods',
    description: 'List saved payment methods for a booking.',
    inputSchema: paymentSetupIntentInput,
    inputSchemaJson: {
      type: 'object',
      properties: { bookingId: { type: 'string' } },
      required: ['bookingId'],
    },
    execute: async ({ caller }, input) =>
      caller.payment.getPaymentMethods(input as z.infer<typeof paymentSetupIntentInput>),
  },
  {
    name: 'payment.update_default_payment_method',
    description: 'Set the default payment method for a booking.',
    inputSchema: paymentUpdateDefaultInput,
    inputSchemaJson: {
      type: 'object',
      properties: {
        bookingId: { type: 'string' },
        paymentMethodId: { type: 'string' },
      },
      required: ['bookingId', 'paymentMethodId'],
    },
    execute: async ({ caller }, input) =>
      caller.payment.updateDefaultPaymentMethod(
        input as z.infer<typeof paymentUpdateDefaultInput>
      ),
  },
  {
    name: 'user.get_profile',
    description: 'Fetch the current user profile with guest/partner details.',
    inputSchema: emptyInputSchema,
    inputSchemaJson: { type: 'object', properties: {} },
    execute: async ({ caller }) => caller.user.getProfile(),
  },
  {
    name: 'user.update_profile',
    description: 'Update current user profile fields.',
    inputSchema: userUpdateProfileInput,
    inputSchemaJson: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        phone: { type: 'string', nullable: true },
        location: { type: 'string', nullable: true },
        emergencyContactName: { type: 'string', nullable: true },
        emergencyContactPhone: { type: 'string', nullable: true },
        emergencyContactRelationship: { type: 'string', nullable: true },
      },
    },
    execute: async ({ caller }, input) =>
      caller.user.updateProfile(input as z.infer<typeof userUpdateProfileInput>),
  },
  {
    name: 'user.delete_account',
    description: 'Delete the current user account (requires confirmation).',
    inputSchema: userDeleteAccountInput,
    inputSchemaJson: {
      type: 'object',
      properties: { confirmation: { type: 'string', enum: ['DELETE'] } },
      required: ['confirmation'],
    },
    execute: async ({ caller }, input) =>
      caller.user.deleteAccount(input as z.infer<typeof userDeleteAccountInput>),
  },
  {
    name: 'support.create_ticket',
    description: 'Create a support ticket for the current user.',
    inputSchema: supportCreateInput,
    inputSchemaJson: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] },
        category: {
          type: 'string',
          enum: [
            'GENERAL_INQUIRY',
            'BOOKING_QUESTION',
            'MEDICAL_WELLNESS_QUESTION',
            'PAYMENT_ISSUE',
            'PARTNERSHIP_INQUIRY',
            'OTHER',
          ],
        },
      },
      required: ['message', 'category'],
    },
    execute: async ({ caller }, input) =>
      caller.support.create(input as z.infer<typeof supportCreateInput>),
  },
  {
    name: 'support.list_tickets',
    description: 'List support tickets for the current user.',
    inputSchema: supportListInput,
    inputSchemaJson: {
      type: 'object',
      properties: { status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] } },
    },
    execute: async ({ caller }, input) =>
      caller.support.list(input as z.infer<typeof supportListInput>),
  },
  {
    name: 'support.get_ticket',
    description: 'Get a support ticket with replies by ID.',
    inputSchema: supportGetByIdInput,
    inputSchemaJson: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    execute: async ({ caller }, input) =>
      caller.support.getById(input as z.infer<typeof supportGetByIdInput>),
  },
  {
    name: 'document.list',
    description: 'List documents for the current user.',
    inputSchema: documentListInput,
    inputSchemaJson: {
      type: 'object',
      properties: {
        bookingId: { type: 'string' },
        type: { type: 'string', enum: ['PASSPORT', 'MEDICAL_FORM', 'INSURANCE', 'VISA', 'OTHER'] },
        status: { type: 'string', enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'] },
      },
    },
    execute: async ({ caller }, input) =>
      caller.document.list(input as z.infer<typeof documentListInput>),
  },
  {
    name: 'document.get',
    description: 'Get a document by ID.',
    inputSchema: documentGetByIdInput,
    inputSchemaJson: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    execute: async ({ caller }, input) =>
      caller.document.getById(input as z.infer<typeof documentGetByIdInput>),
  },
  {
    name: 'document.create',
    description: 'Create a document record for an uploaded file.',
    inputSchema: documentCreateInput,
    inputSchemaJson: {
      type: 'object',
      properties: {
        bookingId: { type: 'string' },
        type: { type: 'string', enum: ['PASSPORT', 'MEDICAL_FORM', 'INSURANCE', 'VISA', 'OTHER'] },
        fileName: { type: 'string' },
        fileUrl: { type: 'string' },
        fileSize: { type: 'number' },
        mimeType: { type: 'string' },
      },
      required: ['type', 'fileName', 'fileUrl', 'fileSize', 'mimeType'],
    },
    execute: async ({ caller }, input) =>
      caller.document.create(input as z.infer<typeof documentCreateInput>),
  },
  {
    name: 'document.delete',
    description: 'Delete a document by ID.',
    inputSchema: documentDeleteInput,
    inputSchemaJson: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    execute: async ({ caller }, input) =>
      caller.document.delete(input as z.infer<typeof documentDeleteInput>),
  },
  {
    name: 'notification.list',
    description: 'List notifications for the current user.',
    inputSchema: notificationListInput,
    inputSchemaJson: {
      type: 'object',
      properties: {
        unreadOnly: { type: 'boolean' },
        type: { type: 'string', enum: ['BOOKING_CONFIRMATION', 'PAYMENT_RECEIPT', 'TRIP_REMINDER', 'GENERAL'] },
        limit: { type: 'number' },
      },
    },
    execute: async ({ caller }, input) =>
      caller.notification.list(input as z.infer<typeof notificationListInput>),
  },
  {
    name: 'notification.mark_as_read',
    description: 'Mark a notification as read.',
    inputSchema: notificationIdInput,
    inputSchemaJson: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    execute: async ({ caller }, input) =>
      caller.notification.markAsRead(input as z.infer<typeof notificationIdInput>),
  },
  {
    name: 'notification.mark_all_as_read',
    description: 'Mark all notifications as read.',
    inputSchema: emptyInputSchema,
    inputSchemaJson: { type: 'object', properties: {} },
    execute: async ({ caller }) => caller.notification.markAllAsRead(),
  },
  {
    name: 'notification.delete',
    description: 'Delete a notification by ID.',
    inputSchema: notificationIdInput,
    inputSchemaJson: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    execute: async ({ caller }, input) =>
      caller.notification.delete(input as z.infer<typeof notificationIdInput>),
  },
]

export const getAgentTools = () => agentTools

export const getAgentToolByName = (name: string) =>
  agentTools.find((tool) => tool.name === name) || null
