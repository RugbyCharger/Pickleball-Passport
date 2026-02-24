/**
 * Public Partner Landing Page
 * E9-S8: Co-Branded Landing Pages
 *
 * Features:
 * - Displays Pickleball Passport content with partner branding
 * - Pre-filled referral code in application form
 * - Tracks views and clicks
 */

'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle,
  Plane,
  Award,
  Users,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PartnerLandingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: landingPage, isLoading } = trpc.partner.getLandingPageBySlug.useQuery(
    { slug },
    { retry: false }
  );

  const trackViewMutation = trpc.partner.trackLandingPageView.useMutation();
  const trackClickMutation = trpc.partner.trackLandingPageClick.useMutation();

  // Track view on mount
  useEffect(() => {
    if (landingPage?.isPublished) {
      trackViewMutation.mutate({ slug });
    }
  }, [landingPage, slug, trackViewMutation]);

  const handleApplyClick = () => {
    if (landingPage?.isPublished) {
      trackClickMutation.mutate({ slug });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!landingPage || !landingPage.isPublished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
          <p className="mt-2 text-slate-600">
            This landing page doesn't exist or hasn't been published yet.
          </p>
          <Link href="/" className="mt-4 inline-block">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = landingPage.primaryColor || '#1D2D44';
  const secondaryColor = landingPage.secondaryColor || '#B08D55';
  const referralCode = landingPage.partner?.referralCode || '';

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with Partner Branding */}
      <section
        className="bg-gradient-to-br py-16 sm:py-24 text-white"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Partner Logo */}
            {landingPage.clubLogoUrl && (
              <div className="mb-8">
                <img
                  src={landingPage.clubLogoUrl}
                  alt={`${landingPage.partner?.clubName || 'Partner'} Logo`}
                  className="mx-auto h-20 w-auto object-contain"
                />
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              {landingPage.headline ||
                'Transform Your Life in Thailand with The Pickleball Passport'}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {landingPage.subheadline ||
                'Experience exceptional pickleball, wellness, and adventure in beautiful Thailand.'}
            </p>

            {/* CTA Button */}
            <Link
              href={`/apply?ref=${referralCode}`}
              onClick={handleApplyClick}
            >
              <Button
                size="lg"
                className="px-8 py-6 text-lg font-semibold"
                style={{
                  backgroundColor: secondaryColor,
                  color: '#000',
                }}
              >
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            {/* Partner Contact */}
            {landingPage.clubContact && (
              <p className="mt-6 text-sm text-blue-100">
                {landingPage.clubContact}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 text-center">
            Why Choose The Pickleball Passport?
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Experience exceptional wellness transformations while playing the sport you love.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Wellness & Relaxation */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 rounded-full bg-emerald-100 p-3 w-fit">
                <Award className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                World-Class Wellness
              </h3>
              <p className="text-slate-600">
                Spa treatments, Thai massage, yoga, and wellness activities woven into every trip.
              </p>
            </div>

            {/* Daily Pickleball */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 rounded-full bg-blue-100 p-3 w-fit">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Play Every Day
              </h3>
              <p className="text-slate-600">
                Enjoy daily pickleball sessions with fellow players in beautiful facilities.
              </p>
            </div>

            {/* Cultural Experience */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 rounded-full bg-amber-100 p-3 w-fit">
                <Plane className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Explore Thailand
              </h3>
              <p className="text-slate-600">
                Immerse yourself in Thai culture, cuisine, and breathtaking landscapes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-12 text-center">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-900">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Apply</h3>
              <p className="text-slate-600">
                Submit your application and tell us about your wellness goals.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-900">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Plan</h3>
              <p className="text-slate-600">
                Work with our team to customize your transformation package.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-900">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Transform</h3>
              <p className="text-slate-600">
                Experience your life-changing journey in Thailand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 sm:py-20"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of pickleball players who have experienced life-changing transformations.
          </p>
          <Link
            href={`/apply?ref=${referralCode}`}
            onClick={handleApplyClick}
          >
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-semibold"
              style={{
                backgroundColor: secondaryColor,
                color: '#000',
              }}
            >
              Start Your Application
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
