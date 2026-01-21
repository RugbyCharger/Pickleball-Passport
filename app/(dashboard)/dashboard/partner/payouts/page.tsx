/**
 * Partner Payout Management Page
 * E9-S11: Payout Management
 * E4-S14: Stripe Connect Integration
 *
 * Features:
 * - Bank account settings
 * - Request payout
 * - Payout history
 * - Eligibility checks
 * - Stripe Connect onboarding and management
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  DollarSign,
  Loader2,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Save,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const PAYOUT_RATE = 0.80; // $0.80 per point
const MIN_POINTS = 5000;

const payoutSettingsSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(4, 'Account number must be at least 4 digits'),
  routingNumber: z.string().min(9, 'Routing number must be 9 digits'),
});

type PayoutSettingsForm = z.infer<typeof payoutSettingsSchema>;

const payoutRequestSchema = z.object({
  pointsToRedeem: z.number().min(MIN_POINTS, `Minimum ${MIN_POINTS.toLocaleString()} points required`),
});

type PayoutRequestForm = z.infer<typeof payoutRequestSchema>;

/**
 * StripeConnectCard Component
 * E4-S14-003: Partner Stripe Connect Onboarding UI
 *
 * Displays Stripe Connect status and provides onboarding/dashboard access buttons
 */
function StripeConnectCard({
  stripeReturnMessage
}: {
  stripeReturnMessage: string | null
}) {
  const { data: stripeStatus, isLoading } = trpc.partner.getStripeConnectStatus.useQuery();

  const createAccountMutation = trpc.partner.createStripeConnectAccount.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl;
    },
  });

  const getOnboardingLinkMutation = trpc.partner.getStripeConnectOnboardingLink.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl;
    },
  });

  const getDashboardLinkMutation = trpc.partner.getStripeConnectDashboardLink.useMutation({
    onSuccess: (data) => {
      // Open Stripe dashboard in new tab
      window.open(data.dashboardUrl, '_blank');
    },
  });

  const handleConnectStripe = () => {
    createAccountMutation.mutate();
  };

  const handleCompleteOnboarding = () => {
    getOnboardingLinkMutation.mutate();
  };

  const handleViewDashboard = () => {
    getDashboardLinkMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  // Stripe Connect not configured for platform
  if (!stripeStatus?.isStripeConnectConfigured) {
    return null;
  }

  const isOnboardingComplete = stripeStatus.onboardingComplete;
  const isPayoutsEnabled = stripeStatus.payoutsEnabled;

  return (
    <div className="mb-6 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 p-2">
            <Zap className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Stripe Connect</h2>
            <p className="text-sm text-slate-600">
              Receive instant payouts directly to your bank account
            </p>
          </div>
        </div>
      </div>

      {/* Return message from Stripe redirect */}
      {stripeReturnMessage && (
        <div className={cn(
          'mb-4 rounded-lg border p-4',
          stripeReturnMessage.includes('successfully')
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-amber-200 bg-amber-50'
        )}>
          <div className="flex items-start gap-3">
            {stripeReturnMessage.includes('successfully') ? (
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            )}
            <p className={cn(
              'text-sm',
              stripeReturnMessage.includes('successfully')
                ? 'text-emerald-800'
                : 'text-amber-800'
            )}>
              {stripeReturnMessage}
            </p>
          </div>
        </div>
      )}

      {/* Status indicators */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {stripeStatus.hasStripeAccount ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
          )}
          <span className="text-sm text-slate-600">Account Created</span>
        </div>
        <div className="flex items-center gap-2">
          {isOnboardingComplete ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
          )}
          <span className="text-sm text-slate-600">Onboarding Complete</span>
        </div>
        <div className="flex items-center gap-2">
          {isPayoutsEnabled ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
          )}
          <span className="text-sm text-slate-600">Payouts Enabled</span>
        </div>
      </div>

      {/* Action buttons based on status */}
      {!stripeStatus.hasStripeAccount && (
        <div>
          <p className="mb-3 text-sm text-slate-700">
            Connect your bank account with Stripe to receive faster, automated payouts.
          </p>
          <Button
            onClick={handleConnectStripe}
            disabled={createAccountMutation.isPending}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {createAccountMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Connect with Stripe
              </>
            )}
          </Button>
          {createAccountMutation.isError && (
            <p className="mt-2 text-sm text-red-600">
              {createAccountMutation.error.message}
            </p>
          )}
        </div>
      )}

      {stripeStatus.hasStripeAccount && !isOnboardingComplete && (
        <div>
          <p className="mb-3 text-sm text-slate-700">
            Complete your Stripe onboarding to start receiving payouts.
          </p>
          <Button
            onClick={handleCompleteOnboarding}
            disabled={getOnboardingLinkMutation.isPending}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {getOnboardingLinkMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Complete Onboarding
              </>
            )}
          </Button>
          {getOnboardingLinkMutation.isError && (
            <p className="mt-2 text-sm text-red-600">
              {getOnboardingLinkMutation.error.message}
            </p>
          )}
        </div>
      )}

      {isOnboardingComplete && isPayoutsEnabled && (
        <div>
          <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-emerald-900">
                Stripe Connect is active
              </span>
            </div>
            <p className="mt-1 text-sm text-emerald-700">
              Your payouts will be processed automatically via Stripe.
            </p>
          </div>
          <Button
            onClick={handleViewDashboard}
            disabled={getDashboardLinkMutation.isPending}
            variant="outline"
            className="gap-2"
          >
            {getDashboardLinkMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                View Stripe Dashboard
              </>
            )}
          </Button>
          {getDashboardLinkMutation.isError && (
            <p className="mt-2 text-sm text-red-600">
              {getDashboardLinkMutation.error.message}
            </p>
          )}
        </div>
      )}

      {isOnboardingComplete && !isPayoutsEnabled && (
        <div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <span className="font-medium text-amber-900">
                  Payouts not yet enabled
                </span>
                <p className="mt-1 text-sm text-amber-700">
                  Stripe is reviewing your account. You may need to provide additional information.
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleCompleteOnboarding}
            disabled={getOnboardingLinkMutation.isPending}
            variant="outline"
            className="mt-3 gap-2"
          >
            {getOnboardingLinkMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Update Account Information
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PartnerPayoutsPage() {
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Derive the Stripe return message from URL params
  const stripeReturnMessage = useMemo(() => {
    const stripeReturn = searchParams.get('stripe_return');
    const stripeRefresh = searchParams.get('stripe_refresh');

    if (stripeReturn === 'true') {
      return 'Stripe onboarding completed successfully. Your account status will be updated shortly.';
    } else if (stripeRefresh === 'true') {
      return 'Your Stripe session expired. Please click the button below to continue onboarding.';
    }
    return null;
  }, [searchParams]);

  // Clear the URL params after displaying the message
  useEffect(() => {
    const stripeReturn = searchParams.get('stripe_return');
    const stripeRefresh = searchParams.get('stripe_refresh');

    if (stripeReturn || stripeRefresh) {
      // Use router.replace to clear params without triggering a full navigation
      router.replace('/dashboard/partner/payouts', { scroll: false });
    }
  }, [searchParams, router]);

  const { data: profile, isLoading: profileLoading } = trpc.partner.getMyProfile.useQuery();
  const { data: payoutSettings, isLoading: settingsLoading } = trpc.partner.getPayoutSettings.useQuery();
  const { data: payoutHistory, isLoading: historyLoading } = trpc.partner.getPayoutHistory.useQuery();
  const utils = trpc.useUtils();

  const updateSettingsMutation = trpc.partner.updatePayoutSettings.useMutation({
    onSuccess: () => {
      utils.partner.getPayoutSettings.invalidate();
      setShowSettingsForm(false);
      settingsForm.reset();
    },
  });

  const requestPayoutMutation = trpc.partner.requestPayout.useMutation({
    onSuccess: () => {
      utils.partner.getMyProfile.invalidate();
      utils.partner.getPayoutHistory.invalidate();
      utils.partner.getPointsBalance.invalidate();
      setShowRequestForm(false);
      requestForm.reset();
    },
  });

  const settingsForm = useForm<PayoutSettingsForm>({
    resolver: zodResolver(payoutSettingsSchema),
    defaultValues: {
      bankName: payoutSettings?.bankName || '',
      accountNumber: '',
      routingNumber: payoutSettings?.routingNumber || '',
    },
  });

  const requestForm = useForm<PayoutRequestForm>({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: {
      pointsToRedeem: MIN_POINTS,
    },
  });

  const pointsBalance = profile?.passportPoints || 0;
  const canRequestPayout = pointsBalance >= MIN_POINTS && !!payoutSettings;
  const payoutAmount = requestForm.watch('pointsToRedeem')
    ? Math.round(requestForm.watch('pointsToRedeem') * PAYOUT_RATE * 100)
    : 0;

  const handleRequestPayout = async (data: PayoutRequestForm) => {
    if (!confirm(`Request payout of ${(data.pointsToRedeem * PAYOUT_RATE).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}?\n\nThis will deduct ${data.pointsToRedeem.toLocaleString()} points from your balance.`)) {
      return;
    }

    try {
      await requestPayoutMutation.mutateAsync({
        pointsToRedeem: data.pointsToRedeem,
      });
    } catch (error) {
      console.error('Failed to request payout:', error);
    }
  };

  const isLoading = profileLoading || settingsLoading || historyLoading;

  if (isLoading && !profile && !payoutSettings && !payoutHistory) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-emerald-100 text-emerald-700',
      FAILED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-slate-100 text-slate-700',
    };

    const icons = {
      PENDING: Clock,
      PROCESSING: Loader2,
      COMPLETED: CheckCircle,
      FAILED: XCircle,
      CANCELLED: XCircle,
    };

    const Icon = icons[status as keyof typeof icons] || AlertCircle;

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
          styles[status as keyof typeof styles] || styles.PENDING
        )}
      >
        <Icon className={status === 'PROCESSING' ? 'h-3 w-3 animate-spin' : 'h-3 w-3'} />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/partner" className="text-slate-600 hover:text-slate-900">
                Partner Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Payouts</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Payout Management</h1>
          <p className="mt-1 text-slate-600">
            Request cash payouts for your points (${PAYOUT_RATE} per point)
          </p>
        </div>

        {/* Stripe Connect Card */}
        <StripeConnectCard stripeReturnMessage={stripeReturnMessage} />

        {/* Points Balance */}
        <div className="mb-6 rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Available Points</p>
              <p className="mt-2 text-4xl font-bold text-emerald-900">
                {pointsBalance.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-emerald-600">
                Minimum {MIN_POINTS.toLocaleString()} points required for payout
              </p>
            </div>
            <div className="rounded-full bg-emerald-100 p-4">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Payout Settings */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Bank Account Settings</h2>
              <p className="mt-1 text-sm text-slate-600">
                Add or update your bank account for payouts
              </p>
            </div>
            {!payoutSettings && (
              <Button
                onClick={() => setShowSettingsForm(true)}
                variant="outline"
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Add Bank Account
              </Button>
            )}
          </div>

          {payoutSettings ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{payoutSettings.bankName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Account ending in ••••{payoutSettings.accountLast4}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    settingsForm.setValue('bankName', payoutSettings.bankName);
                    setShowSettingsForm(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Update
                </Button>
              </div>
            </div>
          ) : showSettingsForm ? (
            <form
              onSubmit={settingsForm.handleSubmit((data) => updateSettingsMutation.mutateAsync(data))}
              className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-slate-700">
                  Bank Name
                </label>
                <input
                  {...settingsForm.register('bankName')}
                  type="text"
                  id="bankName"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Chase Bank"
                />
                {settingsForm.formState.errors.bankName && (
                  <p className="mt-1 text-sm text-red-600">
                    {settingsForm.formState.errors.bankName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="routingNumber" className="block text-sm font-medium text-slate-700">
                  Routing Number
                </label>
                <input
                  {...settingsForm.register('routingNumber')}
                  type="text"
                  id="routingNumber"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="123456789"
                />
                {settingsForm.formState.errors.routingNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {settingsForm.formState.errors.routingNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-slate-700">
                  Account Number
                </label>
                <input
                  {...settingsForm.register('accountNumber')}
                  type="text"
                  id="accountNumber"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Enter account number"
                />
                {settingsForm.formState.errors.accountNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {settingsForm.formState.errors.accountNumber.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="gap-2"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Bank Account
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSettingsForm(false);
                    settingsForm.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </div>

        {/* Request Payout */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Request Payout</h2>
              <p className="mt-1 text-sm text-slate-600">
                Convert points to cash at ${PAYOUT_RATE} per point
              </p>
            </div>
            {canRequestPayout && !showRequestForm && (
              <Button
                onClick={() => {
                  requestForm.setValue('pointsToRedeem', Math.min(pointsBalance, MIN_POINTS));
                  setShowRequestForm(true);
                }}
                className="gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Request Payout
              </Button>
            )}
          </div>

          {!payoutSettings && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Bank Account Required</p>
                  <p className="mt-1 text-sm text-amber-800">
                    You must add a bank account before requesting a payout.
                  </p>
                </div>
              </div>
            </div>
          )}

          {payoutSettings && pointsBalance < MIN_POINTS && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-slate-600 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Insufficient Points</p>
                  <p className="mt-1 text-sm text-slate-700">
                    You need at least {MIN_POINTS.toLocaleString()} points to request a payout.
                    You currently have {pointsBalance.toLocaleString()} points.
                  </p>
                </div>
              </div>
            </div>
          )}

          {showRequestForm && payoutSettings && canRequestPayout && (
            <form
              onSubmit={requestForm.handleSubmit(handleRequestPayout)}
              className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div>
                <label htmlFor="pointsToRedeem" className="block text-sm font-medium text-slate-700">
                  Points to Redeem (minimum {MIN_POINTS.toLocaleString()})
                </label>
                <input
                  {...requestForm.register('pointsToRedeem', {
                    valueAsNumber: true,
                    min: MIN_POINTS,
                    max: pointsBalance,
                  })}
                  type="number"
                  id="pointsToRedeem"
                  min={MIN_POINTS}
                  max={pointsBalance}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {requestForm.formState.errors.pointsToRedeem && (
                  <p className="mt-1 text-sm text-red-600">
                    {requestForm.formState.errors.pointsToRedeem.message}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-emerald-900">Payout Amount</span>
                  <span className="text-2xl font-bold text-emerald-900">
                    {payoutAmount > 0
                      ? (payoutAmount / 100).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })
                      : '$0.00'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-emerald-700">
                  Processing time: 3-5 business days
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={requestPayoutMutation.isPending}
                  className="gap-2"
                >
                  {requestPayoutMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4" />
                      Request Payout
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRequestForm(false);
                    requestForm.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Payout History */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Payout History</h2>
          {payoutHistory && payoutHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Date Requested</th>
                    <th className="px-4 py-3">Points Redeemed</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payoutHistory.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-sm text-slate-900">
                        {new Date(payout.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {payout.pointsRedeemed.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {(payout.amountInCents / 100).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(payout.status)}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {payout.bankAccountLast4 ? `••••${payout.bankAccountLast4}` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No payout history</h3>
              <p className="mt-2 text-sm text-slate-600">
                Request your first payout when you're ready
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
