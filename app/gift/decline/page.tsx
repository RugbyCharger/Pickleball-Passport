/**
 * Gift Decline Page (GIFT-14)
 *
 * This page allows recipients to view gift details and decline the gift.
 * Declining triggers a refund to the purchaser.
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Gift, Loader2, CheckCircle2, XCircle, AlertCircle, AlertTriangle } from 'lucide-react'

type ViewMode = 'loading' | 'gift-details' | 'confirming' | 'success' | 'error'

export default function GiftDeclinePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [viewMode, setViewMode] = useState<ViewMode>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')

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

  // Decline gift mutation
  const declineGiftMutation = trpc.gift.declineGift.useMutation({
    onSuccess: () => {
      setViewMode('success')
    },
    onError: (error) => {
      setErrorMessage(error.message)
      setViewMode('error')
    },
  })

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
      setViewMode('gift-details')
    }
  }, [token, giftError, giftData, isLoadingGift])

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

  // Handle decline submission
  const handleDecline = () => {
    if (!token) return
    setViewMode('confirming')
    declineGiftMutation.mutate({
      token,
      reason: declineReason.trim() || undefined,
    })
  }

  // Loading state
  if (viewMode === 'loading' || isLoadingGift) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 to-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading gift details...</p>
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
                    <a href="mailto:Ryan@thepickleballpassport.org" className="underline font-medium">
                      Ryan@thepickleballpassport.org
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

  // Confirming state
  if (viewMode === 'confirming') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 to-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xl font-semibold text-foreground mb-2">Processing Your Request...</p>
          <p className="text-muted-foreground">Please wait while we process the decline.</p>
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
            <CardTitle className="text-2xl">Gift Declined</CardTitle>
            <CardDescription>
              The purchaser has been notified and will receive a full refund.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <p className="text-sm text-green-800 text-center">
                Thank you for letting us know. We appreciate your honesty.
              </p>
            </div>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Home Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Gift details view (default)
  if (!giftData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
            <AlertTriangle className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-2">
            Decline This Gift?
          </h1>
          <p className="text-lg text-muted-foreground">
            From <span className="font-semibold text-foreground">{giftData.purchaser.firstName} {giftData.purchaser.lastName}</span>
          </p>
        </div>

        {/* Gift Summary */}
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
                {formatCurrency(giftData.totalValue)} Value
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
              {giftData.tripStartDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Trip Start</p>
                  <p className="font-semibold">{formatDate(giftData.tripStartDate)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gift Message */}
        {giftData.giftMessage && (
          <Card className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Personal Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="italic text-foreground/80">"{giftData.giftMessage}"</p>
            </CardContent>
          </Card>
        )}

        {/* Warning Box */}
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-1">Are you sure?</p>
                <p>
                  If you decline this gift, {giftData.purchaser.firstName} will receive a full refund.
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Decline Reason */}
        <Card className="mb-6">
          <CardHeader>
            <Label htmlFor="decline-reason" className="text-base font-semibold">
              Reason (optional)
            </Label>
            <CardDescription>
              Let them know why you're declining this gift
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="decline-reason"
              placeholder="Let them know why you're declining..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value.slice(0, 500))}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {declineReason.length}/500 characters
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/gift/accept?token=${token}`)}
            className="w-full sm:w-1/2"
          >
            Go Back
          </Button>
          <Button
            onClick={handleDecline}
            disabled={declineGiftMutation.isPending}
            className="w-full sm:w-1/2 bg-destructive hover:bg-destructive/90"
          >
            {declineGiftMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Yes, Decline Gift'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
