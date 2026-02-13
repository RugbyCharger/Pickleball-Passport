'use client';

import { CheckCircle, AlertTriangle, XCircle, ArrowRightLeft, CreditCard, Shield } from 'lucide-react';

interface PolicyTier {
  timeframe: string;
  description: string;
  color: 'green' | 'amber' | 'red';
  icon: React.ReactNode;
}

const policyTiers: PolicyTier[] = [
  {
    timeframe: '60+ days before departure',
    description: 'Full refund minus $500 processing fee',
    color: 'green',
    icon: <CheckCircle className="h-5 w-5" />,
  },
  {
    timeframe: '30\u201360 days before departure',
    description: '50% refund',
    color: 'amber',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    timeframe: 'Less than 30 days',
    description: 'No refund',
    color: 'red',
    icon: <XCircle className="h-5 w-5" />,
  },
];

const colorStyles: Record<string, { border: string; bg: string; icon: string; text: string }> = {
  green: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    text: 'text-emerald-800',
  },
  amber: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    text: 'text-amber-800',
  },
  red: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    icon: 'text-red-600',
    text: 'text-red-800',
  },
};

export function CancellationSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#1D2D44] mb-2">
          Cancellation Policy
        </h2>
        <p className="text-[#1D2D44]/60 text-sm">
          Transparent and straightforward. No hidden terms.
        </p>
      </div>

      {/* Policy Tiers */}
      <div className="grid gap-4 sm:grid-cols-3">
        {policyTiers.map((tier, index) => {
          const styles = colorStyles[tier.color];
          return (
            <div
              key={index}
              className={`rounded-xl border-2 ${styles.border} ${styles.bg} p-5 text-center`}
            >
              <div className={`inline-flex ${styles.icon} mb-3`}>
                {tier.icon}
              </div>
              <p className="font-serif font-bold text-[#1D2D44] text-sm mb-1">
                {tier.timeframe}
              </p>
              <p className={`text-sm font-medium ${styles.text}`}>
                {tier.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Additional Options */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-[#1D2D44]/10 bg-white p-4">
          <ArrowRightLeft className="h-5 w-5 flex-shrink-0 text-[#B08D55] mt-0.5" />
          <div>
            <p className="font-serif font-semibold text-[#1D2D44] text-sm">
              Transfer Option
            </p>
            <p className="text-sm text-[#1D2D44]/70 mt-1 leading-relaxed">
              You may transfer your booking to another person at no charge up to
              30 days before departure.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-[#1D2D44]/10 bg-white p-4">
          <CreditCard className="h-5 w-5 flex-shrink-0 text-[#B08D55] mt-0.5" />
          <div>
            <p className="font-serif font-semibold text-[#1D2D44] text-sm">
              Trip Credit
            </p>
            <p className="text-sm text-[#1D2D44]/70 mt-1 leading-relaxed">
              If you cancel 60+ days before departure, you may opt for a full
              trip credit (no processing fee) valid for 12 months.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-[#B08D55]/30 bg-[#FDF8F3] p-4">
          <Shield className="h-5 w-5 flex-shrink-0 text-[#B08D55] mt-0.5" />
          <div>
            <p className="font-serif font-semibold text-[#1D2D44] text-sm">
              Travel Insurance Recommended
            </p>
            <p className="text-sm text-[#1D2D44]/70 mt-1 leading-relaxed">
              We strongly recommend travel insurance to protect against
              unforeseen circumstances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
