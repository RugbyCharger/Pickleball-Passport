/**
 * Referral Link Tracking Route
 * Epic 10 - US-001: Referral Link Tracking (Cookie-Based)
 *
 * Handles referral link redirects:
 * - Sets referral_code cookie (30-day expiration)
 * - Stores click event in ReferralEvent table
 * - Increments click count on partner/user profile
 * - First-click attribution (doesn't overwrite existing cookie)
 * - Graceful handling of invalid codes
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ReferralEventType } from '@prisma/client';

const REFERRAL_COOKIE_NAME = 'referral_code';
const REFERRAL_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { code } = await params;

  // Extract UTM parameters from URL
  const url = new URL(request.url);
  const utmSource = url.searchParams.get('utm_source');
  const utmMedium = url.searchParams.get('utm_medium');
  const utmCampaign = url.searchParams.get('utm_campaign');

  // Extract IP address and user agent
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Check for first-click attribution: don't overwrite existing cookie
  const existingCookie = request.cookies.get(REFERRAL_COOKIE_NAME);
  const shouldSetCookie = !existingCookie;

  // Create the redirect response with ref param for client-side attribution
  const redirectUrl = new URL('/', request.url);
  redirectUrl.searchParams.set('ref', code);
  const response = NextResponse.redirect(redirectUrl);

  try {
    // Validate the referral code - check both partner profiles and user referral codes
    const [partnerProfile, userWithReferralCode] = await Promise.all([
      prisma.partnerProfile.findUnique({
        where: { referralCode: code },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { referralCode: code },
        select: { id: true },
      }),
    ]);

    const isValidCode = partnerProfile !== null || userWithReferralCode !== null;

    if (!isValidCode) {
      // Invalid code - redirect to homepage without setting cookie or tracking
      console.log(`[Referral] Invalid referral code: ${code}`);
      return response;
    }

    // Record the click event in ReferralEvent table
    await prisma.referralEvent.create({
      data: {
        referralCode: code,
        eventType: ReferralEventType.CLICK,
        ipAddress,
        userAgent,
        utmSource,
        utmMedium,
        utmCampaign,
      },
    });

    // Increment click count on the appropriate profile
    if (partnerProfile) {
      await prisma.partnerProfile.update({
        where: { id: partnerProfile.id },
        data: {
          referralCodeClickCount: { increment: 1 },
        },
      });
    }
    // Note: User referral codes don't have a dedicated click count field,
    // but the ReferralEvent table tracks all clicks

    // Set cookie only if first-click attribution (no existing cookie)
    if (shouldSetCookie) {
      response.cookies.set(REFERRAL_COOKIE_NAME, code, {
        maxAge: REFERRAL_COOKIE_MAX_AGE,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    console.log(
      `[Referral] Click tracked for code: ${code}, cookie set: ${shouldSetCookie}`
    );
  } catch (error) {
    // Log error but don't fail the redirect - graceful degradation
    console.error(`[Referral] Error processing referral code ${code}:`, error);
  }

  return response;
}
