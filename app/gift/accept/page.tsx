/**
 * Gift Acceptance Page (E3-S18)
 *
 * This page allows recipients to view and accept gift bookings.
 * Recipients can either login or create a new account to accept the gift.
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { SignIn, SignUp, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Gift, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

type ViewMode = 'loading' | 'gift-details' | 'login' | 'signup' | 'accepting' | 'success' | 'error'

export default function GiftAcceptPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser()

  const [viewMode, setViewMode] = useState<ViewMode>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [shouldAcceptGift, setShouldAcceptGift] = useState(false)

  const token = searchParams.get('token')

  // Get gift details
  const {
    data: giftData,
    isLoading: isLoadingGift,
    error: giftError,
  } = trpc.gift.getByToken.useQuery(
    { token: token || '' },
    { enabled: !!token, retry: false }
  )

  // Accept gift mutation
  const acceptGiftMutation = trpc.gift.acceptGift.useMutation({
    onSuccess: () => {
      setViewMode('success')
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    },
    onError: (error) => {
      setErrorMessage(error.message)
      setViewMode('error')
    },
  })

  // Handle gift acceptance when user is authenticated
  useEffect(() => {
    if (isUserLoaded && isSignedIn && shouldAcceptGift && token) {
      setViewMode('accepting')
      acceptGiftMutation.mutate({ token })
      setShouldAcceptGift(false)
    }
  }, [isUserLoaded, isSignedIn, shouldAcceptGift, token])

  // Determine initial view mode
  useEffect(() => {
    if (!token) {
      setErrorMessage('No gift token provided')
      setViewMode('error')
      return
    }

    if (giftError) {
      setErrorMessage(giftError.message)
      setViewMode('error')
      return
    }

    if (!isLoadingGift && giftData) {
      // If user is already signed in, show gift details and allow immediate acceptance
      if (isUserLoaded && isSignedIn) {
        setViewMode('gift-details')
      } else if (isUserLoaded) {
        // User not signed in, show gift details
        setViewMode('gift-details')
      }
    }
  }, [token, giftError, giftData, isLoadingGift, isUserLoaded, isSignedIn])

  // Format currency
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Loading state
  if (viewMode === 'loading' || isLoadingGift) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 to-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your gift...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (viewMode === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Gift Not Found</CardTitle>
            <CardDescription>{errorMessage || 'This gift link is invalid or has expired.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Need Help?</p>
                  <p>
                    If you believe this is an error, please contact our support team at{' '}
                    <a href="mailto:support@thepickleballpassport.org" className="underline font-medium">
                      support@thepickleballpassport.org
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Home Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Accepting gift state
  if (viewMode === 'accepting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xl font-semibold text-foreground mb-2">Accepting Your Gift...</p>
          <p className="text-muted-foreground">Please wait while we transfer the booking to your account.</p>
        </div>
      </div>
    )
  }

  // Success state
  if (viewMode === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Gift Accepted!</CardTitle>
            <CardDescription>
              Your gift booking has been successfully transferred to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <p className="text-sm text-green-800 text-center">
                Redirecting to your dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Login view
  if (viewMode === 'login') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Gift className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-playfair text-3xl font-bold text-primary mb-2">
              Sign In to Accept Your Gift
            </h1>
            <p className="text-muted-foreground">
              Log in to your account to claim your gift booking
            </p>
          </div>

          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                card: 'shadow-lg',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
              },
            }}
            afterSignInUrl={`/gift/accept?token=${token}`}
            redirectUrl={`/gift/accept?token=${token}`}
          />

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => setViewMode('gift-details')}>
              ← Back to Gift Details
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Signup view
  if (viewMode === 'signup') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Gift className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-playfair text-3xl font-bold text-primary mb-2">
              Create Account to Accept Gift
            </h1>
            <p className="text-muted-foreground">
              {giftData?.recipient.email && `We'll pre-fill your email: ${giftData.recipient.email}`}
            </p>
          </div>

          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                card: 'shadow-lg',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
              },
            }}
            initialValues={{
              emailAddress: giftData?.recipient.email || '',
              firstName: giftData?.recipient.firstName || '',
              lastName: giftData?.recipient.lastName || '',
            }}
            afterSignUpUrl={`/gift/accept?token=${token}`}
            redirectUrl={`/gift/accept?token=${token}`}
          />

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => setViewMode('gift-details')}>
              ← Back to Gift Details
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Gift details view (default)
  if (!giftData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 mb-4">
            <Gift className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-2">
            You've Received a Gift!
          </h1>
          <p className="text-lg text-muted-foreground">
            From <span className="font-semibold text-foreground">{giftData.purchaser.firstName} {giftData.purchaser.lastName}</span>
          </p>
        </div>

        {/* Gift Message */}
        {giftData.giftMessage && (
          <Card className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                💌 Personal Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="italic text-foreground/80">"{giftData.giftMessage}"</p>
            </CardContent>
          </Card>
        )}

        {/* Gift Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{giftData.packageName}</CardTitle>
                <CardDescription>
                  {giftData.duration}-day transformation experience
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Fully Paid
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Package Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{giftData.duration} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accommodation</p>
                <p className="font-semibold">{giftData.accommodationTier}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-semibold">{giftData.destination}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="font-semibold text-green-600">{formatCurrency(giftData.totalValue)}</p>
              </div>
            </div>

            {/* Trip Dates */}
            {giftData.tripStartDate && giftData.tripEndDate && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">📅 Trip Dates</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Check-in:</span> {formatDate(giftData.tripStartDate)}</p>
                    <p><span className="text-muted-foreground">Check-out:</span> {formatDate(giftData.tripEndDate)}</p>
                  </div>
                </div>
              </>
            )}

            {/* Add-ons */}
            {giftData.addOns && giftData.addOns.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">✨ Included Add-Ons</h3>
                  <ul className="space-y-1">
                    {giftData.addOns.map((addOn, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        ✓ {addOn.quantity > 1 ? `${addOn.quantity}x ` : ''}{addOn.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Everything is Paid For!</p>
                <p>
                  This trip is completely paid for by {giftData.purchaser.firstName}. You just need to accept the gift
                  and {giftData.tripStartDate ? 'complete your profile' : 'choose your travel dates'}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isSignedIn ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center mb-4">
                You're signed in as <span className="font-semibold">{user?.primaryEmailAddress?.emailAddress}</span>
              </p>
              <Button
                onClick={() => {
                  setShouldAcceptGift(true)
                }}
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
              >
                Accept Gift & Add to My Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Accept Your Gift</CardTitle>
              <CardDescription className="text-center">
                Choose an option below to claim your gift booking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setViewMode('login')}
                size="lg"
                variant="outline"
                className="w-full"
              >
                I Already Have an Account
              </Button>
              <Button
                onClick={() => setViewMode('signup')}
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
              >
                Create My Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Decline Link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Unable to accept this gift?{' '}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to decline this gift? The purchaser will be refunded.')) {
                  router.push(`/gift/decline?token=${token}`)
                }
              }}
              className="text-destructive hover:underline"
            >
              Decline gift
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
