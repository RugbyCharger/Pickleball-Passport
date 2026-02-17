/**
 * Application Router
 *
 * tRPC procedures for guest application operations
 * Includes Epic 10 referral attribution at application submission
 */

import { z } from 'zod';
import { router, guestProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';
import { ReferralEventType } from '@prisma/client';
import { sendEmail } from '@/lib/email/sendgrid';
import { generateApplicationConfirmationEmail } from '@/lib/email/templates/application-confirmation';
import { generatePartnerReferralApplicationEmail } from '@/lib/email/templates/partner-referral-application';

const REFERRAL_COOKIE_NAME = 'referral_code';
const APPLICATION_REFERRAL_POINTS = 100; // Points awarded for application submission

export const applicationRouter = router({
  /**
   * Create a new application
   * Includes Epic 10 referral attribution tracking
   */
  create: guestProcedure
    .input(
      z.object({
        // Step 1: Basic Info
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(10),
        location: z.string().min(2),

        // Step 2: Pickleball Background
        pickleballSkillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'pro']),
        pickleballFrequency: z.enum(['1-2x/week', '3-4x/week', '5+x/week', 'daily']),
        homeClub: z.string().nullable(),

        // Step 3: Transformation Interests
        interests: z.array(z.string()).min(1),

        // Step 4: Travel Preferences
        preferredDuration: z.enum(['8', '10', '13', '18-20']),
        preferredDates: z.string().nullable(),
        travelingAlone: z.boolean(),
        budgetRange: z.string().nullable(),

        // Step 5: Discovery
        referralSource: z.string().min(1),
        referredByPartner: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is authenticated
        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to submit an application. Please sign up or sign in first.',
          });
        }

        const userId = ctx.user.id;

        // Epic 10: Extract referral code and UTM params from cookies
        let referralCode: string | null = null;
        let referralAttributed = false;

        // UTM Tracking (Epic 10 - US-007)
        let utmSource: string | null = null;
        let utmMedium: string | null = null;
        let utmCampaign: string | null = null;

        // Parse cookies from headers
        const cookieHeader = ctx.headers.get('cookie');
        if (cookieHeader) {
          const cookies = cookieHeader.split(';').map(c => c.trim());
          for (const cookie of cookies) {
            const [name, value] = cookie.split('=');
            if (name === REFERRAL_COOKIE_NAME && value) {
              referralCode = decodeURIComponent(value);
            }
            // Extract UTM params from cookies
            if (name === 'utm_source' && value) {
              utmSource = decodeURIComponent(value);
            }
            if (name === 'utm_medium' && value) {
              utmMedium = decodeURIComponent(value);
            }
            if (name === 'utm_campaign' && value) {
              utmCampaign = decodeURIComponent(value);
            }
          }
        }

        // Create application with referral code and UTM params if present
        const application = await prisma.application.create({
          data: {
            userId,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            location: input.location,
            pickleballSkillLevel: input.pickleballSkillLevel,
            pickleballFrequency: input.pickleballFrequency,
            homeClub: input.homeClub,
            interests: input.interests,
            preferredDuration: input.preferredDuration,
            preferredDates: input.preferredDates,
            travelingAlone: input.travelingAlone,
            budgetRange: input.budgetRange,
            referralSource: input.referralSource,
            referredByPartner: input.referredByPartner || null,
            referralCode: referralCode, // Epic 10: Store referral code
            // Epic 10 - US-007: Store UTM params
            utmSource,
            utmMedium,
            utmCampaign,
            status: 'SUBMITTED',
          },
        });

        // Epic 10: Process referral attribution if we have a code
        if (referralCode) {
          try {
            // Validate the referral code - check both partner profiles and user referral codes
            const [partnerProfile, userWithReferralCode] = await Promise.all([
              prisma.partnerProfile.findUnique({
                where: { referralCode: referralCode },
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                    }
                  }
                }
              }),
              prisma.user.findUnique({
                where: { referralCode: referralCode },
                select: { id: true, email: true },
              }),
            ]);

            const isPartnerReferral = partnerProfile !== null;
            const isGuestReferral = userWithReferralCode !== null;

            if (isPartnerReferral || isGuestReferral) {
              // Determine the referrer user ID
              const referrerUserId = isPartnerReferral
                ? partnerProfile!.userId
                : userWithReferralCode!.id;

              // Create ReferralEvent with type APPLICATION
              await prisma.referralEvent.create({
                data: {
                  referralCode: referralCode,
                  eventType: ReferralEventType.APPLICATION,
                  userId: userId, // The applicant's user ID
                },
              });

              // Award points to the referrer
              if (isPartnerReferral) {
                // Award to partner's passportPoints
                await prisma.partnerProfile.update({
                  where: { id: partnerProfile!.id },
                  data: {
                    passportPoints: { increment: APPLICATION_REFERRAL_POINTS },
                  },
                });

                // Send notification email to partner (non-blocking)
                try {
                  const guestInitials = `${input.firstName[0]}.${input.lastName[0]}.`;
                  const emailContent = generatePartnerReferralApplicationEmail({
                    partnerName: partnerProfile!.user?.email?.split('@')[0] || 'Partner',
                    partnerEmail: partnerProfile!.user?.email || '',
                    guestInitials,
                    applicationDate: new Date().toISOString(),
                    potentialPoints: 1000, // Estimated booking points
                    currentTier: 'BRONZE', // Default, could be fetched from profile
                  });

                  if (partnerProfile!.user?.email) {
                    await sendEmail({
                      to: partnerProfile!.user.email,
                      subject: emailContent.subject,
                      html: emailContent.html,
                      text: emailContent.text,
                    });
                  }
                } catch (emailError) {
                  console.error('[Referral] Failed to send partner notification email:', emailError);
                }
              } else {
                // Award to guest's referralPointsBalance
                await prisma.user.update({
                  where: { id: referrerUserId },
                  data: {
                    referralPointsBalance: { increment: APPLICATION_REFERRAL_POINTS },
                  },
                });
              }

              referralAttributed = true;
              console.log(
                `[Referral] Application attribution: code=${referralCode}, ` +
                `type=${isPartnerReferral ? 'partner' : 'guest'}, ` +
                `points=${APPLICATION_REFERRAL_POINTS}, applicantId=${userId}`
              );
            } else {
              console.log(`[Referral] Invalid referral code at application: ${referralCode}`);
            }
          } catch (referralError) {
            // Log but don't fail the application for referral errors
            console.error('[Referral] Error processing referral attribution:', referralError);
          }
        }

        // Send confirmation email (non-blocking)
        try {
          const emailContent = generateApplicationConfirmationEmail({
            firstName: input.firstName,
            email: input.email,
            applicationId: application.id,
            interests: input.interests,
            preferredDuration: input.preferredDuration,
          });

          await sendEmail({
            to: input.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });
        } catch (emailError) {
          // Log but don't fail the application
          console.error('Failed to send application confirmation email:', emailError);
        }

        return {
          success: true,
          applicationId: application.id,
          message: 'Application submitted successfully',
          referralAttributed, // Epic 10: Flag to indicate cookie should be cleared
        };
      } catch (error) {
        console.error('Application creation error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit application',
        });
      }
    }),

  /**
   * Get user's applications
   */
  list: guestProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }

    const applications = await prisma.application.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return applications;
  }),

  /**
   * Get single application by ID
   */
  getById: guestProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        });
      }

      const application = await prisma.application.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Application not found',
        });
      }

      // Verify ownership
      if (application.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this application',
        });
      }

      return application;
    }),
});
