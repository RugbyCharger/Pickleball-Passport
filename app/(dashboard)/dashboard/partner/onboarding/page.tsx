/**
 * Partner Onboarding Wizard
 * E9-S14: Partner Onboarding Flow
 *
 * Features:
 * - Multi-step wizard (5 steps)
 * - Progress tracker
 * - Skip functionality
 * - Complete onboarding
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  Loader2,
  Check,
  ArrowRight,
  ArrowLeft,
  Play,
  Copy,
  CheckCircle,
  Download,
  MessageSquare,
  Trophy,
  TrendingUp,
  Gift,
  Users,
  FileText,
  Target,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    id: 1,
    title: 'Welcome',
    description: 'Introduction to the partner program',
  },
  {
    id: 2,
    title: 'How It Works',
    description: 'Points, tiers, and rewards',
  },
  {
    id: 3,
    title: 'Your Referral Link',
    description: 'Get started sharing',
  },
  {
    id: 4,
    title: 'Marketing Materials',
    description: 'Download resources',
  },
  {
    id: 5,
    title: 'Join the Community',
    description: 'Connect with other partners',
  },
];

export default function PartnerOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);

  const utils = trpc.useUtils();

  const { data: profile, isLoading: profileLoading } =
    trpc.partner.getMyProfile.useQuery();

  const completeOnboardingMutation = trpc.partner.completeOnboarding.useMutation({
    onSuccess: () => {
      utils.partner.getMyProfile.invalidate();
      router.push('/dashboard/partner');
    },
  });

  const handleCopyCode = async () => {
    if (profile?.referralCode) {
      await navigator.clipboard.writeText(profile.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleComplete = async () => {
    await completeOnboardingMutation.mutateAsync();
  };

  const handleSkip = () => {
    router.push('/dashboard/partner');
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Partner profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome to The Pickleball Passport!
              </h1>
              <p className="mt-2 text-slate-600">
                Let's get you set up in just a few steps
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
            >
              Skip for now
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                      currentStep > step.id
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : currentStep === step.id
                        ? 'border-emerald-600 bg-white text-emerald-600'
                        : 'border-slate-300 bg-white text-slate-400'
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        'text-xs font-medium',
                        currentStep >= step.id
                          ? 'text-slate-900'
                          : 'text-slate-500'
                      )}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2 transition-colors',
                      currentStep > step.id
                        ? 'bg-emerald-600'
                        : 'bg-slate-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Play className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Welcome, {profile.clubName}!</h2>
                <p className="mt-2 text-slate-600">
                  We're excited to have you join our partner network
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-3 font-semibold text-slate-900">Introduction Video</h3>
                <div className="aspect-video rounded-lg bg-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">
                      Welcome video from Jaron (Coming soon)
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Learn about our partner program and how to get started
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-900">
                  <strong>What's next?</strong> We'll walk you through the program, show you how to
                  earn points, and help you get started sharing with your members.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: How It Works */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">How the Program Works</h2>
                <p className="mt-2 text-slate-600">
                  Earn points, advance tiers, and unlock rewards
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-full bg-emerald-100 p-2">
                      <Target className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Passport Points</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Earn points for every referral click, application, and booking. Use points to
                    redeem rewards or cash out.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Trophy className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Tier System</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Advance through Bronze, Silver, Gold, and Platinum tiers. Higher tiers
                    mean higher commissions and exclusive benefits.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-full bg-amber-100 p-2">
                      <Gift className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Rewards</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Redeem points for free trips, upgrades, exclusive experiences, or cash payouts
                    at $0.80 per point.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-full bg-indigo-100 p-2">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Support</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Access marketing materials, training resources, and our partner community forum
                    for best practices.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Copy Referral Link */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <Copy className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Your Unique Referral Code</h2>
                <p className="mt-2 text-slate-600">
                  Share this code with your members to start earning points
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Referral Code</label>
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copiedCode ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="rounded-lg border border-slate-300 bg-white p-4 font-mono text-lg font-semibold text-slate-900">
                  {profile.referralCode}
                </div>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <h3 className="mb-2 font-semibold text-emerald-900">How to Share</h3>
                <ul className="space-y-2 text-sm text-emerald-800">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>Email your referral link to members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>Post on your club's social media</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>Include in newsletters or flyers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>Generate QR codes for easy sharing</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Link href="/dashboard/partner/referral-links">
                  <Button variant="outline" className="gap-2">
                    View Referral Links Page
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Step 4: Marketing Materials */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                  <FileText className="h-8 w-8 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Marketing Materials</h2>
                <p className="mt-2 text-slate-600">
                  Download ready-to-use resources to promote The Pickleball Passport
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Email Templates</h3>
                  </div>
                  <p className="mb-3 text-sm text-slate-600">
                    Pre-written emails you can customize and send to members
                  </p>
                  <Link href="/dashboard/partner/materials">
                    <Button variant="outline" size="sm" className="gap-2">
                      View Templates
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Download className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Flyers & PDFs</h3>
                  </div>
                  <p className="mb-3 text-sm text-slate-600">
                    Printable flyers, brochures, and presentation decks
                  </p>
                  <Link href="/dashboard/partner/materials">
                    <Button variant="outline" size="sm" className="gap-2">
                      Download
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-full bg-orange-100 p-2">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Social Media</h3>
                  </div>
                  <p className="mb-3 text-sm text-slate-600">
                    Images and captions for Facebook, Instagram, and LinkedIn
                  </p>
                  <Link href="/dashboard/partner/materials">
                    <Button variant="outline" size="sm" className="gap-2">
                      View Content
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-full bg-indigo-100 p-2">
                      <Target className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Training Resources</h3>
                  </div>
                  <p className="mb-3 text-sm text-slate-600">
                    Guides, tutorials, and FAQs to help you succeed
                  </p>
                  <Link href="/dashboard/partner/training">
                    <Button variant="outline" size="sm" className="gap-2">
                      View Guides
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Join Directors Circle */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Join Directors Circle</h2>
                <p className="mt-2 text-slate-600">
                  Connect with other partners and share best practices
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-3 font-semibold text-slate-900">Partner Community Forum</h3>
                <p className="mb-4 text-slate-600">
                  The Directors Circle is a private community where partners can:
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>Share success stories and best practices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>Ask questions and get answers from other partners</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>Get updates on new packages and programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>Connect with monthly group calls (Jaron hosts)</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Link href="/dashboard/partner/forum">
                  <Button variant="outline" className="gap-2">
                    Visit Directors Circle
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-slate-600">
            Step {currentStep} of {STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <Button onClick={nextStep} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={completeOnboardingMutation.isPending}
              className="gap-2"
            >
              {completeOnboardingMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete Onboarding
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
