/**
 * Contact Router
 *
 * Handles contact form submissions with reCAPTCHA v3 verification,
 * database storage, and dual email notifications (user confirmation + admin alert).
 */

import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/sendgrid'
import {
  generateContactConfirmationEmail,
  type ContactConfirmationData,
} from '@/lib/email/templates/contact-confirmation'
import {
  generateContactAdminNotificationEmail,
  type ContactAdminNotificationData,
} from '@/lib/email/templates/contact-admin-notification'

/**
 * Contact form input schema with reCAPTCHA token
 */
const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be 2000 characters or less'),
  recaptchaToken: z.string().min(1, 'reCAPTCHA verification failed'),
})

/**
 * Verify reCAPTCHA token with Google API
 */
async function verifyRecaptcha(token: string): Promise<{
  success: boolean
  score: number
  action: string
}> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY is not configured')
    throw new Error('reCAPTCHA is not configured')
  }

  const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify'
  const response = await fetch(verifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${secretKey}&response=${token}`,
  })

  if (!response.ok) {
    throw new Error('reCAPTCHA verification request failed')
  }

  const data = await response.json()

  return {
    success: data.success || false,
    score: data.score || 0,
    action: data.action || '',
  }
}

/**
 * Contact Router
 */
export const contactRouter = router({
  /**
   * Submit contact form
   */
  submit: publicProcedure
    .input(contactFormSchema)
    .mutation(async ({ input }) => {
      const { name, email, phone, message, recaptchaToken } = input

      // Step 1: Verify reCAPTCHA token
      try {
        const recaptchaResult = await verifyRecaptcha(recaptchaToken)

        if (!recaptchaResult.success) {
          console.warn('reCAPTCHA verification failed:', {
            email,
            action: recaptchaResult.action,
          })
          throw new Error('reCAPTCHA verification failed. Please try again.')
        }

        // Check score threshold (0.5 is Google's recommended starting point)
        if (recaptchaResult.score < 0.5) {
          console.warn('reCAPTCHA score too low (possible spam):', {
            email,
            score: recaptchaResult.score,
            action: recaptchaResult.action,
          })
          throw new Error('Spam detected. Please try again.')
        }

        console.log('reCAPTCHA verification passed:', {
          email,
          score: recaptchaResult.score,
          action: recaptchaResult.action,
        })
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('reCAPTCHA verification failed')
      }

      // Step 2: Normalize email (lowercase, trim)
      const normalizedEmail = email.toLowerCase().trim()

      // Step 3: Save to database (Message model)
      try {
        await prisma.message.create({
          data: {
            name,
            email: normalizedEmail,
            phone: phone || null,
            message,
            isRead: false,
          },
        })

        console.log('Contact form submission saved to database:', {
          name,
          email: normalizedEmail,
        })
      } catch (error) {
        console.error('Failed to save contact form to database:', error)
        throw new Error('Failed to save your message. Please try again.')
      }

      // Step 4: Send confirmation email to user
      try {
        const confirmationData: ContactConfirmationData = {
          name,
          message,
        }

        const { html, text, subject } =
          generateContactConfirmationEmail(confirmationData)

        await sendEmail({
          to: normalizedEmail,
          subject,
          html,
          text,
        })

        console.log('Confirmation email sent to user:', normalizedEmail)
      } catch (error) {
        // Don't fail the request if email fails, just log it
        console.error('Failed to send confirmation email to user:', error)
      }

      // Step 5: Send notification email to admin
      try {
        const adminEmail =
          process.env.SENDGRID_FROM_EMAIL || 'hello@pickleballpassport.com'

        const adminData: ContactAdminNotificationData = {
          name,
          email: normalizedEmail,
          phone: phone || 'Not provided',
          message,
          timestamp: new Date(),
        }

        const { html, text, subject } =
          generateContactAdminNotificationEmail(adminData)

        await sendEmail({
          to: adminEmail,
          subject,
          html,
          text,
          replyTo: normalizedEmail,
        })

        console.log('Admin notification email sent:', adminEmail)
      } catch (error) {
        // Don't fail the request if email fails, just log it
        console.error('Failed to send admin notification email:', error)
      }

      // Step 6: Return success response
      return {
        success: true,
        message:
          "Message sent successfully! We'll respond within 24 hours.",
      }
    }),
})
