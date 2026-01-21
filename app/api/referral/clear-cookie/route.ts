/**
 * Clear Referral Cookie API Route
 * Epic 10 - US-002: Referral Attribution at Application
 *
 * Clears the referral_code cookie after successful attribution.
 * Called by the client after application submission when referralAttributed is true.
 */

import { NextResponse } from 'next/server';

const REFERRAL_COOKIE_NAME = 'referral_code';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear the referral cookie by setting it with an expired date
  response.cookies.set(REFERRAL_COOKIE_NAME, '', {
    maxAge: 0, // Expire immediately
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
