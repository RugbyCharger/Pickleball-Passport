/**
 * Email Template Renderer
 *
 * Handles variable substitution and template rendering using Handlebars.
 * Supports conditional blocks, loops, and base template inheritance.
 */

import * as Handlebars from 'handlebars'
import { convert } from 'html-to-text'
import { prisma } from '@/lib/db'
import { apiLogger } from '@/lib/logger'

export interface TemplateVariables {
  [key: string]: unknown
}

export interface RenderedTemplate {
  html: string
  text: string
  subject: string
}

/**
 * Default sample data for template preview
 */
export const defaultSampleData: Record<string, TemplateVariables> = {
  TRANSACTIONAL: {
    guestName: 'John Doe',
    bookingReference: 'PBP-12345',
    tripName: 'Thailand Transformation',
    tripDates: 'March 15-29, 2026',
    totalAmount: '$15,000',
    packageDetails: 'Pure Play Package - 14 Days',
    paymentAmount: '$3,750',
    paymentMethod: 'Visa ****4242',
    nextPaymentDate: 'February 15, 2026',
    remainingBalance: '$11,250',
  },
  MARKETING: {
    guestName: 'John',
    tripCountdown: '60',
    tripName: 'Thailand Transformation',
    tripStartDate: 'March 15, 2026',
    destinationHighlight: 'Beautiful Chiang Mai',
  },
  NOTIFICATIONS: {
    alertType: 'New Booking',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    bookingCount: '15',
    totalRevenue: '$225,000',
    guestDetails: 'New guest from San Francisco, CA',
  },
  SYSTEM: {
    userName: 'John Doe',
    userEmail: 'john@example.com',
    verificationLink: 'https://thepickleballpassport.org/verify?token=abc123',
    resetLink: 'https://thepickleballpassport.org/reset?token=xyz789',
  },
  PARTNER: {
    partnerName: 'Jennifer Smith',
    pointsEarned: '1,500',
    currentTier: 'Gold Partner',
    referralName: 'John Doe',
    commissionAmount: '$450',
    totalReferrals: '12',
    monthlyCommission: '$2,700',
  },
}

/**
 * Register custom Handlebars helpers
 */
function registerHelpers(): void {
  // Format currency
  Handlebars.registerHelper('currency', (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  })

  // Format date
  Handlebars.registerHelper('date', (value: string | Date) => {
    const date = typeof value === 'string' ? new Date(value) : value
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  // Uppercase helper
  Handlebars.registerHelper('uppercase', (value: string) => {
    return value?.toUpperCase() ?? ''
  })

  // Lowercase helper
  Handlebars.registerHelper('lowercase', (value: string) => {
    return value?.toLowerCase() ?? ''
  })

  // Pluralize helper
  Handlebars.registerHelper(
    'pluralize',
    (count: number, singular: string, plural: string) => {
      return count === 1 ? singular : plural
    }
  )

  // Conditional equality
  Handlebars.registerHelper('eq', (a: unknown, b: unknown) => {
    return a === b
  })

  // Greater than
  Handlebars.registerHelper('gt', (a: number, b: number) => {
    return a > b
  })

  // Less than
  Handlebars.registerHelper('lt', (a: number, b: number) => {
    return a < b
  })
}

// Register helpers on module load
registerHelpers()

/**
 * Render email template with variable substitution
 */
export async function renderEmailTemplate(
  templateId: string,
  variables: TemplateVariables
): Promise<RenderedTemplate> {
  // Fetch template from database
  const template = await prisma.emailTemplate.findUnique({
    where: { id: templateId },
    include: { baseTemplate: true },
  })

  if (!template) {
    throw new Error(`Email template not found: ${templateId}`)
  }

  if (template.status !== 'ACTIVE') {
    apiLogger.warn({ templateId, status: template.status }, 'Using non-active template')
  }

  return renderTemplateContent(
    {
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      subjectLine: template.subjectLine,
      baseTemplate: template.baseTemplate,
    },
    variables
  )
}

/**
 * Render template by slug
 */
export async function renderTemplateBySlug(
  slug: string,
  variables: TemplateVariables
): Promise<RenderedTemplate> {
  const template = await prisma.emailTemplate.findUnique({
    where: { slug },
    include: { baseTemplate: true },
  })

  if (!template) {
    throw new Error(`Email template not found with slug: ${slug}`)
  }

  return renderTemplateContent(
    {
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      subjectLine: template.subjectLine,
      baseTemplate: template.baseTemplate,
    },
    variables
  )
}

/**
 * Render template content directly (for preview without saving)
 */
export function renderTemplateContent(
  template: {
    htmlContent: string
    textContent: string
    subjectLine: string
    baseTemplate?: { htmlContent: string } | null
  },
  variables: TemplateVariables
): RenderedTemplate {
  // Apply base template if exists
  let htmlContent = template.htmlContent
  if (template.baseTemplate) {
    htmlContent = applyBaseTemplate(template.baseTemplate.htmlContent, htmlContent)
  }

  // Compile templates with Handlebars
  const htmlTemplate = Handlebars.compile(htmlContent)
  const textTemplate = Handlebars.compile(template.textContent)
  const subjectTemplate = Handlebars.compile(template.subjectLine)

  // Render with variables
  const html = htmlTemplate(variables)
  const text = textTemplate(variables)
  const subject = subjectTemplate(variables)

  return { html, text, subject }
}

/**
 * Apply base template (header/footer) to content
 */
function applyBaseTemplate(baseHtml: string, contentHtml: string): string {
  // Replace {{content}} placeholder in base with actual content
  return baseHtml.replace(/\{\{content\}\}/g, contentHtml)
}

/**
 * Generate plain text from HTML
 */
export function generatePlainText(html: string): string {
  return convert(html, {
    wordwrap: 80,
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      { selector: 'img', format: 'skip' },
    ],
  })
}

/**
 * Validate template has all required variables
 */
export function validateTemplateVariables(
  requiredVariables: string[],
  providedVariables: TemplateVariables
): { valid: boolean; missing: string[] } {
  const missing = requiredVariables.filter(
    (varName) => !(varName in providedVariables) || providedVariables[varName] === undefined
  )

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Extract variables used in a template
 */
export function extractTemplateVariables(content: string): string[] {
  const regex = /\{\{([^#/}][^}]*)\}\}/g
  const variables = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    // Extract variable name, handling helpers like {{currency amount}}
    const varPart = match[1].trim()
    const parts = varPart.split(/\s+/)

    // If it's a helper, the variable is the second part
    if (parts.length > 1) {
      variables.add(parts[1])
    } else {
      variables.add(parts[0])
    }
  }

  return Array.from(variables)
}

/**
 * Get sample data for template category
 */
export function getSampleDataForCategory(category: string): TemplateVariables {
  return defaultSampleData[category] || defaultSampleData.TRANSACTIONAL
}
