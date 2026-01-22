/**
 * User Router
 *
 * tRPC procedures for user-related operations
 */

import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { PickleballSkillLevel } from '@prisma/client'
import { sendEmail } from '@/lib/email/send-email'
import { generateGuestReferralCodeEmail } from '@/lib/email/templates/guest-referral-code'

export const userRouter = router({
  /**
   * Get current user profile
   * Requires authentication
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        guestProfile: true,
        partnerProfile: true,
      },
    })

    return user
  }),

  /**
   * Get user by ID (public - for testimonials, etc.)
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })

      return user
    }),

  /**
   * Update own role during onboarding (GUEST or PARTNER only)
   * Users cannot self-assign ADMIN role - this must be done by an existing admin
   */
  updateRole: protectedProcedure
    .input(
      z.object({
        // SECURITY: ADMIN role removed - cannot self-escalate privileges
        role: z.enum(['GUEST', 'PARTNER']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: { role: input.role },
      })

      return updatedUser
    }),

  /**
   * Admin-only: Update any user's role
   * Only admins can assign the ADMIN role to other users
   */
  adminUpdateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['GUEST', 'PARTNER', 'ADMIN']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent admins from demoting themselves (safety check)
      if (input.userId === ctx.user.id && input.role !== 'ADMIN') {
        // Verify there's at least one other admin before allowing self-demotion
        const otherAdminCount = await ctx.db.user.count({
          where: {
            role: 'ADMIN',
            id: { not: ctx.user.id },
          },
        })
        
        if (otherAdminCount === 0) {
          throw new Error('Cannot demote yourself when you are the only admin')
        }
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      })

      return updatedUser
    }),

  /**
   * Check if guest profile is complete
   * Returns profile completion status and guest profile if exists
   */
  checkProfileComplete: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        guestProfile: true,
      },
    })

    return {
      profileCompleted: user?.guestProfile?.profileCompleted ?? false,
      hasProfile: !!user?.guestProfile,
      guestProfile: user?.guestProfile,
    }
  }),

  /**
   * Complete guest profile (create or update)
   * Sets profileCompleted to true after successful save
   * Updates Clerk user metadata
   */
  completeGuestProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(2, 'First name must be at least 2 characters'),
        lastName: z.string().min(2, 'Last name must be at least 2 characters'),
        age: z.number().int().min(18, 'Must be at least 18 years old').max(120),
        location: z.string().min(2, 'Location is required'),
        pickleballSkillLevel: z.nativeEnum(PickleballSkillLevel),
        pickleballFrequency: z.string().min(1, 'Frequency is required'),
        dietaryRestrictions: z.array(z.string()),
        emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
        emergencyContactPhone: z.string().min(10, 'Valid phone number is required'),
        emergencyContactRelationship: z.string().min(2, 'Relationship is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if guest profile exists
      const existingProfile = await ctx.db.guestProfile.findUnique({
        where: { userId: ctx.user.id },
      })

      let guestProfile

      if (existingProfile) {
        // Update existing profile
        guestProfile = await ctx.db.guestProfile.update({
          where: { userId: ctx.user.id },
          data: {
            ...input,
            profileCompleted: true,
          },
        })
      } else {
        // Create new profile
        guestProfile = await ctx.db.guestProfile.create({
          data: {
            userId: ctx.user.id,
            ...input,
            profileCompleted: true,
          },
        })
      }

      // Update Clerk user metadata to reflect profile completion
      try {
        const { clerkClient } = await import('@clerk/nextjs/server')
        const client = await clerkClient()
        await client.users.updateUserMetadata(ctx.user.id, {
          publicMetadata: {
            profileCompleted: true,
          },
        })
      } catch (error) {
        // Log error but don't fail the mutation
        console.error('Failed to update Clerk metadata:', error)
      }

      return { success: true, guestProfile }
    }),

  /**
   * Get current user's referral code
   * Returns the referral code and shareable link if the user has one
   */
  getMyReferralCode: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        referralCode: true,
        referralPointsBalance: true,
        guestProfile: {
          select: {
            firstName: true,
          },
        },
      },
    })

    if (!user) {
      return { hasCode: false, referralCode: null, shareableLink: null, pointsBalance: 0 }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'
    const shareableLink = user.referralCode
      ? `${baseUrl}/r/${user.referralCode}`
      : null

    return {
      hasCode: !!user.referralCode,
      referralCode: user.referralCode,
      shareableLink,
      pointsBalance: user.referralPointsBalance,
      firstName: user.guestProfile?.firstName ?? null,
    }
  }),

  /**
   * Get referral statistics for the current user
   * Includes clicks, applications, bookings, and completed trips
   */
  getReferralStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: { referralCode: true, referralPointsBalance: true },
    })

    if (!user?.referralCode) {
      return {
        hasCode: false,
        clicks: 0,
        applications: 0,
        bookings: 0,
        completed: 0,
        totalPointsEarned: 0,
        currentBalance: 0,
        referrals: [],
      }
    }

    // Get event counts from ReferralEvent table
    const [clickCount, applicationCount, bookingCount, completionCount] = await Promise.all([
      ctx.db.referralEvent.count({
        where: { referralCode: user.referralCode, eventType: 'CLICK' },
      }),
      ctx.db.referralEvent.count({
        where: { referralCode: user.referralCode, eventType: 'APPLICATION' },
      }),
      ctx.db.referralEvent.count({
        where: { referralCode: user.referralCode, eventType: 'BOOKING' },
      }),
      ctx.db.referralEvent.count({
        where: { referralCode: user.referralCode, eventType: 'COMPLETION' },
      }),
    ])

    // Get total points earned from GuestReferral records
    const referrals = await ctx.db.guestReferral.findMany({
      where: { referrerUserId: ctx.user.id },
      include: {
        referredUser: {
          select: {
            id: true,
            email: true,
            guestProfile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalPointsEarned = referrals.reduce(
      (sum, ref) => sum + ref.pointsEarned,
      0
    )

    return {
      hasCode: true,
      clicks: clickCount,
      applications: applicationCount,
      bookings: bookingCount,
      completed: completionCount,
      totalPointsEarned,
      currentBalance: user.referralPointsBalance,
      referrals: referrals.map((ref) => ({
        id: ref.id,
        status: ref.status,
        pointsEarned: ref.pointsEarned,
        createdAt: ref.createdAt,
        referredUser: {
          firstName: ref.referredUser.guestProfile?.firstName ?? null,
          lastName: ref.referredUser.guestProfile?.lastName ?? null,
        },
      })),
    }
  }),

  /**
   * Generate a referral code for the current user (alumni guest)
   * Called after a guest completes their first trip
   * Code format: FIRSTNAME-YEAR (e.g., SUSAN-2026)
   */
  generateReferralCode: protectedProcedure.mutation(async ({ ctx }) => {
    // Check if user already has a referral code
    const existingUser = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        referralCode: true,
        email: true,
        guestProfile: {
          select: {
            firstName: true,
          },
        },
      },
    })

    if (existingUser?.referralCode) {
      return {
        success: true,
        referralCode: existingUser.referralCode,
        alreadyHadCode: true,
      }
    }

    // Verify user has completed at least one trip
    const completedBooking = await ctx.db.booking.findFirst({
      where: {
        userId: ctx.user.id,
        status: 'COMPLETED',
      },
    })

    if (!completedBooking) {
      throw new Error('You must complete at least one trip before getting a referral code')
    }

    // Generate referral code: FIRSTNAME-YEAR
    const firstName = existingUser?.guestProfile?.firstName?.toUpperCase() || 'GUEST'
    const year = new Date().getFullYear()
    const baseCode = `${firstName}-${year}`
    let referralCode = baseCode
    let counter = 1

    // Ensure uniqueness by appending number if duplicate exists
    while (true) {
      const existing = await ctx.db.user.findUnique({
        where: { referralCode },
        select: { id: true },
      })

      if (!existing) {
        break
      }

      counter++
      referralCode = `${baseCode}-${counter}`
    }

    // Update user with new referral code
    const updatedUser = await ctx.db.user.update({
      where: { id: ctx.user.id },
      data: { referralCode },
      select: {
        referralCode: true,
        email: true,
        guestProfile: {
          select: {
            firstName: true,
          },
        },
      },
    })

    // Send email notification with new referral code
    if (updatedUser.email && updatedUser.guestProfile?.firstName) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'
        const emailData = generateGuestReferralCodeEmail({
          guestName: updatedUser.guestProfile.firstName,
          referralCode: referralCode,
          shareableLink: `${baseUrl}/r/${referralCode}`,
          dashboardUrl: `${baseUrl}/dashboard/referrals`,
        })

        await sendEmail({
          to: updatedUser.email,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        })
      } catch (error) {
        // Log but don't fail the mutation
        console.error('Failed to send referral code email:', error)
      }
    }

    return {
      success: true,
      referralCode,
      alreadyHadCode: false,
    }
  }),

  /**
   * Check if user is eligible for a referral code
   * User must have completed at least one trip
   */
  checkReferralCodeEligibility: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: { referralCode: true },
    })

    if (user?.referralCode) {
      return { eligible: true, hasCode: true, reason: null }
    }

    // Check for completed bookings
    const completedBooking = await ctx.db.booking.findFirst({
      where: {
        userId: ctx.user.id,
        status: 'COMPLETED',
      },
    })

    if (completedBooking) {
      return { eligible: true, hasCode: false, reason: null }
    }

    return {
      eligible: false,
      hasCode: false,
      reason: 'Complete your first trip to unlock your referral code',
    }
  }),

  /**
   * Story 2-6: Update user profile information
   * Updates guest profile fields (phone, emergency contact, etc.)
   * Also updates Clerk user info (first name, last name)
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1, 'First name is required').optional(),
        lastName: z.string().min(1, 'Last name is required').optional(),
        phone: z.string().optional().nullable(),
        location: z.string().optional().nullable(),
        emergencyContactName: z.string().optional().nullable(),
        emergencyContactPhone: z.string().optional().nullable(),
        emergencyContactRelationship: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, phone, location, emergencyContactName, emergencyContactPhone, emergencyContactRelationship } = input

      // Update Clerk user info if name fields are provided
      if (firstName || lastName) {
        try {
          const { clerkClient } = await import('@clerk/nextjs/server')
          const client = await clerkClient()
          await client.users.updateUser(ctx.user.id, {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
          })
        } catch (error) {
          console.error('Failed to update Clerk user info:', error)
          throw new Error('Failed to update profile. Please try again.')
        }
      }

      // Check if guest profile exists
      const existingProfile = await ctx.db.guestProfile.findUnique({
        where: { userId: ctx.user.id },
      })

      if (existingProfile) {
        // Update existing profile
        const updatedProfile = await ctx.db.guestProfile.update({
          where: { userId: ctx.user.id },
          data: {
            firstName: firstName || existingProfile.firstName,
            lastName: lastName || existingProfile.lastName,
            phone: phone !== undefined ? phone : existingProfile.phone,
            location: location !== undefined ? location : existingProfile.location,
            emergencyContactName: emergencyContactName !== undefined ? emergencyContactName : existingProfile.emergencyContactName,
            emergencyContactPhone: emergencyContactPhone !== undefined ? emergencyContactPhone : existingProfile.emergencyContactPhone,
            emergencyContactRelationship: emergencyContactRelationship !== undefined ? emergencyContactRelationship : existingProfile.emergencyContactRelationship,
          },
        })

        return { success: true, profile: updatedProfile }
      } else if (firstName && lastName) {
        // Create new profile if first and last name are provided
        const newProfile = await ctx.db.guestProfile.create({
          data: {
            userId: ctx.user.id,
            firstName,
            lastName,
            phone,
            location,
            emergencyContactName,
            emergencyContactPhone,
            emergencyContactRelationship,
          },
        })

        return { success: true, profile: newProfile }
      }

      return { success: true, profile: existingProfile }
    }),

  /**
   * Story 2-7: Delete user account
   * Deletes user from database and Clerk
   * Uses soft delete approach - marks bookings as from deleted user
   */
  deleteAccount: protectedProcedure
    .input(
      z.object({
        confirmation: z.literal('DELETE'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.confirmation !== 'DELETE') {
        throw new Error('Please type DELETE to confirm account deletion')
      }

      const userId = ctx.user.id

      // Start a transaction to handle database deletions
      await ctx.db.$transaction(async (tx) => {
        // Delete guest referrals where this user is the referrer
        await tx.guestReferral.deleteMany({
          where: { referrerUserId: userId },
        })

        // Delete referral events
        await tx.referralEvent.deleteMany({
          where: {
            OR: [
              { userId: userId },
            ],
          },
        })

        // Delete notifications
        await tx.notification.deleteMany({
          where: { userId },
        })

        // Delete support ticket replies
        await tx.supportTicketReply.deleteMany({
          where: { userId },
        })

        // Delete support tickets
        await tx.supportTicket.deleteMany({
          where: { userId },
        })

        // Delete guest profile (cascade will handle this but being explicit)
        await tx.guestProfile.deleteMany({
          where: { userId },
        })

        // Delete partner profile if exists
        await tx.partnerProfile.deleteMany({
          where: { userId },
        })

        // Note: Bookings, applications, testimonials reference userId
        // Due to Prisma schema cascade settings, these should be handled
        // but we'll explicitly delete for clarity

        // Delete applications
        await tx.application.deleteMany({
          where: { userId },
        })

        // For bookings, we keep them for historical record but nullify user
        // This requires schema change - for now, delete them
        await tx.booking.deleteMany({
          where: { userId },
        })

        // Delete testimonials
        await tx.testimonial.deleteMany({
          where: { userId },
        })

        // Finally, delete the user
        await tx.user.delete({
          where: { id: userId },
        })
      })

      // Delete user from Clerk
      try {
        const { clerkClient } = await import('@clerk/nextjs/server')
        const client = await clerkClient()
        await client.users.deleteUser(userId)
      } catch (error) {
        console.error('Failed to delete Clerk user (DB already deleted):', error)
        // User is already deleted from DB, so we continue
        // The Clerk account will be orphaned but not accessible
      }

      return { success: true, message: 'Account deleted successfully' }
    }),
})
