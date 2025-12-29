'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import GuestProfileForm from '@/components/booking/guest-profile-form'
import { PricingSummary } from '@/components/booking/pricing-summary'
import { Loader2 } from 'lucide-react'

export default function ProfileCompletionClient() {
  const router = useRouter()

  // Check if profile is already complete
  const { data: profileStatus, isLoading } = trpc.user.checkProfileComplete.useQuery()

  // Redirect to payment if profile is already complete
  useEffect(() => {
    if (profileStatus?.profileCompleted) {
      router.push('/booking/payment')
    }
  }, [profileStatus, router])

  // Show loading state
  if (isLoading || profileStatus?.profileCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-sm text-slate-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Get existing profile data if it exists (for pre-filling form)
  const existingProfile = profileStatus?.guestProfile
    ? {
        firstName: profileStatus.guestProfile.firstName,
        lastName: profileStatus.guestProfile.lastName,
        age: profileStatus.guestProfile.age ?? undefined,
        location: profileStatus.guestProfile.location ?? undefined,
        pickleballSkillLevel: profileStatus.guestProfile.pickleballSkillLevel ?? undefined,
        pickleballFrequency: profileStatus.guestProfile.pickleballFrequency ?? undefined,
        dietaryRestrictions: profileStatus.guestProfile.dietaryRestrictions ?? [],
        emergencyContactName: profileStatus.guestProfile.emergencyContactName ?? undefined,
        emergencyContactPhone: profileStatus.guestProfile.emergencyContactPhone ?? undefined,
        emergencyContactRelationship: profileStatus.guestProfile.emergencyContactRelationship ?? undefined,
      }
    : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="text-sm text-gray-600">Step 7 of 7</div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="text-sm font-medium text-emerald-600">Almost there!</div>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">
            Complete Your Guest Profile
          </h1>
          <p className="text-lg text-slate-600">
            Help us personalize your transformation journey by providing a few more details
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <GuestProfileForm existingProfile={existingProfile} />
            </div>
          </div>

          {/* Pricing Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <PricingSummary />

              {/* Why We Need This Info */}
              <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Why We Need This Info
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Match you with players at your skill level</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Prepare meals according to your dietary needs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Ensure your safety with emergency contact info</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Personalize your experience based on your background</span>
                  </li>
                </ul>
              </div>

              {/* Security Note */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <p>
                    Your information is secure and will never be shared with third parties without your consent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
