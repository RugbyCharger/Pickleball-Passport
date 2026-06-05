import { NextRequest, NextResponse } from 'next/server';

// Partner codes → landing page destination
// BK100 goes to the July 16 clinic/trip page since it's BK's personal code
const PARTNER_DESTINATIONS: Record<string, string> = {
  DinkingDad: '/trips',
  PKLClub: '/trips',
  DinkingHub: '/trips',
  MindYourPickle: '/trips',
  Sindhya: '/trips',
  PCOL: '/trips',
  CubaPBClub: '/trips',
  Derek: '/trips',
  BK100: '/clinics',
  MattHale: '/trips',
  PerformancePickleball: '/trips',
  ChrisLo: '/trips',
  Hartland: '/trips',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partner: string }> }
) {
  const { partner } = await params;

  // Case-insensitive lookup
  const key = Object.keys(PARTNER_DESTINATIONS).find(
    (k) => k.toLowerCase() === partner.toLowerCase()
  ) ?? partner;

  const destination = PARTNER_DESTINATIONS[key] ?? '/trips';

  const response = NextResponse.redirect(new URL(destination, request.url));

  // Set sticky 30-day affiliate cookie
  response.cookies.set('tpp_ref', key, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false, // must be readable by client-side JS to append to payment links
  });

  return response;
}
