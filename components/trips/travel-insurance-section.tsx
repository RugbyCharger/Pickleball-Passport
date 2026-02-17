'use client';

import { Shield, ExternalLink } from 'lucide-react';

interface InsuranceProvider {
  name: string;
  description: string;
}

const providers: InsuranceProvider[] = [
  {
    name: 'World Nomads',
    description:
      'Popular with active travelers. Covers adventure sports including pickleball.',
  },
  {
    name: 'Allianz Travel Insurance',
    description:
      'Comprehensive plans with 24/7 assistance hotline.',
  },
  {
    name: 'SafetyWing',
    description:
      'Affordable option popular with frequent travelers. Monthly subscription model.',
  },
];

export function TravelInsuranceSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#1D2D44] mb-2">
          Travel Insurance
        </h2>
        <p className="text-[#1D2D44]/60 text-sm">
          Protect your trip investment and your health abroad.
        </p>
      </div>

      {/* Recommendation */}
      <div className="rounded-xl border border-[#B08D55]/30 bg-[#FDF8F3] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#B08D55]/10">
            <Shield className="h-5 w-5 text-[#B08D55]" />
          </div>
          <div className="space-y-3">
            <p className="text-sm text-[#1D2D44]/80 leading-relaxed">
              We strongly recommend purchasing comprehensive travel insurance
              before your trip. Travel insurance protects against trip
              cancellation, medical emergencies, lost baggage, and flight delays.
            </p>
            <p className="text-sm text-[#1D2D44]/60 leading-relaxed">
              The Pickleball Passport does not sell, arrange, or provide travel
              insurance. The providers below are suggestions based on traveler
              reviews. Please research and compare options that best suit
              your needs.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {providers.map((provider) => (
          <div
            key={provider.name}
            className="rounded-xl border border-[#1D2D44]/10 bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="h-4 w-4 text-[#B08D55]" />
              <h3 className="font-serif font-semibold text-[#1D2D44] text-sm">
                {provider.name}
              </h3>
            </div>
            <p className="text-sm text-[#1D2D44]/70 leading-relaxed">
              {provider.description}
            </p>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="rounded-xl bg-[#1D2D44]/5 border border-[#1D2D44]/10 p-4">
        <p className="text-sm text-[#1D2D44]/80 leading-relaxed">
          <span className="font-serif font-semibold text-[#1D2D44]">
            Tip:
          </span>{' '}
          Purchase travel insurance within 14 days of your initial trip deposit
          to maximize coverage options, including pre-existing condition waivers.
        </p>
      </div>
    </div>
  );
}
