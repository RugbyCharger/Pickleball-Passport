/**
 * Email Template Router
 *
 * tRPC procedures for email template management (Story 11-11)
 * Supports CRUD operations, versioning, preview, and test emails.
 */

import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  renderTemplateContent,
  generatePlainText,
  extractTemplateVariables,
  getSampleDataForCategory,
  TemplateVariables,
} from '@/lib/email/template-renderer'
import { sendEmail, isConfigured } from '@/lib/email/sendgrid'

// Schema for email template category
const emailTemplateCategorySchema = z.enum([
  'TRANSACTIONAL',
  'MARKETING',
  'NOTIFICATIONS',
  'SYSTEM',
])

// Schema for email template status
const emailTemplateStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED'])

export const emailTemplateRouter = router({
  /**
   * Get all email templates with optional filtering
   */
  getAll: adminProcedure
    .input(
      z
        .object({
          category: emailTemplateCategorySchema.optional(),
          status: emailTemplateStatusSchema.optional(),
          search: z.string().optional(),
          sortBy: z.enum(['name', 'updatedAt', 'category']).default('updatedAt'),
          sortOrder: z.enum(['asc', 'desc']).default('desc'),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { category, status, search, sortBy = 'updatedAt', sortOrder = 'desc' } = input || {}

      const templates = await ctx.db.emailTemplate.findMany({
        where: {
          ...(category && { category }),
          ...(status && { status }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          analytics: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      })

      return templates
    }),

  /**
   * Get single template by ID
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.db.emailTemplate.findUnique({
        where: { id: input.id },
        include: {
          baseTemplate: true,
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 10,
          },
          analytics: true,
        },
      })

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email template not found',
        })
      }

      return template
    }),

  /**
   * Get template by slug
   */
  getBySlug: adminProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.db.emailTemplate.findUnique({
        where: { slug: input.slug },
        include: {
          baseTemplate: true,
          analytics: true,
        },
      })

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email template not found',
        })
      }

      return template
    }),

  /**
   * Create new email template
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        slug: z
          .string()
          .min(1, 'Slug is required')
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
        description: z.string().optional(),
        category: emailTemplateCategorySchema,
        subjectLine: z.string().min(1, 'Subject line is required'),
        preheaderText: z.string().optional(),
        htmlContent: z.string().min(1, 'HTML content is required'),
        textContent: z.string().optional(),
        variables: z.array(z.string()).optional(),
        baseTemplateId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if slug already exists
      const existing = await ctx.db.emailTemplate.findUnique({
        where: { slug: input.slug },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A template with this slug already exists',
        })
      }

      // Auto-generate text content if not provided
      const textContent = input.textContent || generatePlainText(input.htmlContent)

      // Auto-extract variables if not provided
      const variables =
        input.variables || extractTemplateVariables(input.htmlContent + input.subjectLine)

      const template = await ctx.db.emailTemplate.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          category: input.category,
          subjectLine: input.subjectLine,
          preheaderText: input.preheaderText,
          htmlContent: input.htmlContent,
          textContent,
          variables,
          baseTemplateId: input.baseTemplateId,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
          status: 'DRAFT',
        },
        include: {
          baseTemplate: true,
        },
      })

      // Create analytics record
      await ctx.db.emailTemplateAnalytics.create({
        data: {
          templateId: template.id,
        },
      })

      return template
    }),

  /**
   * Update email template
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        category: emailTemplateCategorySchema.optional(),
        status: emailTemplateStatusSchema.optional(),
        subjectLine: z.string().min(1).optional(),
        preheaderText: z.string().optional().nullable(),
        htmlContent: z.string().min(1).optional(),
        textContent: z.string().optional(),
        variables: z.array(z.string()).optional(),
        baseTemplateId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Fetch current template
      const currentTemplate = await ctx.db.emailTemplate.findUnique({
        where: { id },
        include: { versions: { select: { versionNumber: true }, orderBy: { versionNumber: 'desc' }, take: 1 } },
      })

      if (!currentTemplate) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email template not found',
        })
      }

      // Create version snapshot before updating (if content changes)
      const contentChanged =
        updateData.htmlContent || updateData.textContent || updateData.subjectLine

      if (contentChanged) {
        const nextVersion = (currentTemplate.versions[0]?.versionNumber || 0) + 1
        await ctx.db.emailTemplateVersion.create({
          data: {
            templateId: id,
            versionNumber: nextVersion,
            content: {
              subjectLine: currentTemplate.subjectLine,
              htmlContent: currentTemplate.htmlContent,
              textContent: currentTemplate.textContent,
              preheaderText: currentTemplate.preheaderText,
            },
            changesSummary: 'Auto-saved before update',
            createdBy: ctx.user.id,
          },
        })
      }

      // Auto-generate text content if HTML changed but text not provided
      let textContent = updateData.textContent
      if (updateData.htmlContent && !updateData.textContent) {
        textContent = generatePlainText(updateData.htmlContent)
      }

      // Auto-extract variables if HTML changed
      let variables = updateData.variables
      if (updateData.htmlContent || updateData.subjectLine) {
        const htmlToScan = updateData.htmlContent || currentTemplate.htmlContent
        const subjectToScan = updateData.subjectLine || currentTemplate.subjectLine
        variables = extractTemplateVariables(htmlToScan + subjectToScan)
      }

      // Update template
      const updated = await ctx.db.emailTemplate.update({
        where: { id },
        data: {
          ...updateData,
          ...(textContent && { textContent }),
          ...(variables && { variables }),
          updatedBy: ctx.user.id,
        },
        include: {
          baseTemplate: true,
          analytics: true,
        },
      })

      return updated
    }),

  /**
   * Duplicate email template
   */
  duplicate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const original = await ctx.db.emailTemplate.findUnique({
        where: { id: input.id },
      })

      if (!original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email template not found',
        })
      }

      // Generate unique slug
      const timestamp = Date.now()
      const newSlug = `${original.slug}-copy-${timestamp}`

      const duplicate = await ctx.db.emailTemplate.create({
        data: {
          name: `${original.name} (Copy)`,
          slug: newSlug,
          description: original.description,
          category: original.category,
          status: 'DRAFT',
          subjectLine: original.subjectLine,
          preheaderText: original.preheaderText,
          htmlContent: original.htmlContent,
          textContent: original.textContent,
          variables: original.variables ?? Prisma.JsonNull,
          baseTemplateId: original.baseTemplateId,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        },
      })

      // Create analytics record for duplicate
      await ctx.db.emailTemplateAnalytics.create({
        data: {
          templateId: duplicate.id,
        },
      })

      return duplicate
    }),

  /**
   * Delete (archive) email template
   */
  archive: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.emailTemplate.findUnique({
        where: { id: input.id },
      })

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email template not found',
        })
      }

      const archived = await ctx.db.emailTemplate.update({
        where: { id: input.id },
        data: {
          status: 'ARCHIVED',
          updatedBy: ctx.user.id,
        },
      })

      return archived
    }),

  /**
   * Permanently delete email template
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.emailTemplate.findUnique({
        where: { id: input.id },
      })

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email template not found',
        })
      }

      // Delete template (cascades to versions and analytics)
      await ctx.db.emailTemplate.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Restore template version
   */
  restoreVersion: adminProcedure
    .input(
      z.object({
        templateId: z.string(),
        versionNumber: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const version = await ctx.db.emailTemplateVersion.findUnique({
        where: {
          templateId_versionNumber: {
            templateId: input.templateId,
            versionNumber: input.versionNumber,
          },
        },
      })

      if (!version) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template version not found',
        })
      }

      const content = version.content as {
        subjectLine: string
        htmlContent: string
        textContent: string
        preheaderText?: string
      }

      // Update template with version content
      const updated = await ctx.db.emailTemplate.update({
        where: { id: input.templateId },
        data: {
          subjectLine: content.subjectLine,
          htmlContent: content.htmlContent,
          textContent: content.textContent,
          preheaderText: content.preheaderText,
          updatedBy: ctx.user.id,
        },
      })

      return updated
    }),

  /**
   * Preview template with sample data
   */
  preview: adminProcedure
    .input(
      z.object({
        htmlContent: z.string(),
        textContent: z.string().optional(),
        subjectLine: z.string(),
        category: emailTemplateCategorySchema,
        variables: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Get sample data for category, merge with custom variables
      const sampleData = getSampleDataForCategory(input.category) as TemplateVariables
      const mergedVariables = { ...sampleData, ...(input.variables || {}) }

      try {
        const rendered = renderTemplateContent(
          {
            htmlContent: input.htmlContent,
            textContent: input.textContent || generatePlainText(input.htmlContent),
            subjectLine: input.subjectLine,
          },
          mergedVariables
        )

        return {
          html: rendered.html,
          text: rendered.text,
          subject: rendered.subject,
          variables: mergedVariables,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Template rendering error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    }),

  /**
   * Send test email with template
   */
  sendTestEmail: adminProcedure
    .input(
      z.object({
        templateId: z.string().optional(),
        htmlContent: z.string().optional(),
        textContent: z.string().optional(),
        subjectLine: z.string().optional(),
        category: emailTemplateCategorySchema.optional(),
        recipientEmail: z.string().email('Invalid email address'),
        testVariables: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!isConfigured()) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'SendGrid is not configured',
        })
      }

      let htmlContent: string
      let textContent: string
      let subjectLine: string
      let category: string

      // Load from template ID or use provided content
      if (input.templateId) {
        const template = await ctx.db.emailTemplate.findUnique({
          where: { id: input.templateId },
          include: { baseTemplate: true },
        })

        if (!template) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Email template not found',
          })
        }

        htmlContent = template.htmlContent
        textContent = template.textContent
        subjectLine = template.subjectLine
        category = template.category
      } else if (input.htmlContent && input.subjectLine) {
        htmlContent = input.htmlContent
        textContent = input.textContent || generatePlainText(input.htmlContent)
        subjectLine = input.subjectLine
        category = input.category || 'TRANSACTIONAL'
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Either templateId or htmlContent and subjectLine must be provided',
        })
      }

      // Merge sample data with custom variables
      const sampleData = getSampleDataForCategory(category) as TemplateVariables
      const variables = { ...sampleData, ...(input.testVariables || {}) }

      try {
        const rendered = renderTemplateContent(
          { htmlContent, textContent, subjectLine },
          variables
        )

        await sendEmail({
          to: input.recipientEmail,
          subject: `[TEST] ${rendered.subject}`,
          html: rendered.html,
          text: rendered.text,
        })

        return { success: true, message: 'Test email sent successfully' }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to send test email',
        })
      }
    }),

  /**
   * Get template categories with counts
   */
  getCategoryCounts: adminProcedure.query(async ({ ctx }) => {
    const counts = await ctx.db.emailTemplate.groupBy({
      by: ['category'],
      _count: { category: true },
      where: { status: { not: 'ARCHIVED' } },
    })

    return counts.reduce(
      (acc, item) => {
        acc[item.category] = item._count.category
        return acc
      },
      {} as Record<string, number>
    )
  }),

  /**
   * Get available variables for a category
   */
  getVariablesForCategory: adminProcedure
    .input(z.object({ category: emailTemplateCategorySchema }))
    .query(({ input }) => {
      const variableDefinitions: Record<string, { name: string; description: string }[]> = {
        TRANSACTIONAL: [
          { name: 'guestName', description: 'Full name of the guest' },
          { name: 'bookingReference', description: 'Unique booking reference code' },
          { name: 'tripName', description: 'Name of the trip package' },
          { name: 'tripDates', description: 'Trip start and end dates' },
          { name: 'totalAmount', description: 'Total booking amount' },
          { name: 'packageDetails', description: 'Package name and duration' },
          { name: 'paymentAmount', description: 'Payment amount for receipts' },
          { name: 'paymentMethod', description: 'Payment method used' },
          { name: 'nextPaymentDate', description: 'Next installment date' },
          { name: 'remainingBalance', description: 'Remaining balance to pay' },
        ],
        MARKETING: [
          { name: 'guestName', description: 'First name of the guest' },
          { name: 'tripCountdown', description: 'Days until trip starts' },
          { name: 'tripName', description: 'Name of the booked trip' },
          { name: 'tripStartDate', description: 'Trip start date' },
          { name: 'destinationHighlight', description: 'Featured destination info' },
        ],
        NOTIFICATIONS: [
          { name: 'alertType', description: 'Type of admin alert' },
          { name: 'guestName', description: 'Guest name for context' },
          { name: 'guestEmail', description: 'Guest email address' },
          { name: 'bookingCount', description: 'Total booking count' },
          { name: 'totalRevenue', description: 'Revenue amount' },
          { name: 'guestDetails', description: 'Additional guest details' },
        ],
        SYSTEM: [
          { name: 'userName', description: 'User display name' },
          { name: 'userEmail', description: 'User email address' },
          { name: 'verificationLink', description: 'Email verification URL' },
          { name: 'resetLink', description: 'Password reset URL' },
        ],
      }

      return variableDefinitions[input.category] || []
    }),

  /**
   * Get base templates
   */
  getBaseTemplates: adminProcedure.query(async ({ ctx }) => {
    // Base templates have no baseTemplateId and are marked as such in description or by convention
    const baseTemplates = await ctx.db.emailTemplate.findMany({
      where: {
        baseTemplateId: null,
        // Convention: base templates have 'base-' prefix in slug
        slug: { startsWith: 'base-' },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    })

    return baseTemplates
  }),
})
