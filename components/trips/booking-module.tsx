'use client';

import { useState } from 'react';

interface BookingModuleProps {
  // Future: tripId, available dates, pricing, spots remaining
}

export function BookingModule({}: BookingModuleProps) {
  const [occupancy, setOccupancy] = useState<'DOUBLE' | 'SINGLE' | 'COUPLE'>('DOUBLE');
  const [includesPickleball, setIncludesPickleball] = useState(true);
  const [paymentPlan, setPaymentPlan] = useState<'deposit' | 'full'>('deposit');

  return (
    <div className="rounded-2xl shadow-xl shadow-[#1D2D44]/10 border border-[#B08D55]/10 bg-white overflow-hidden">
      {/* Photo Carousel Placeholder */}
      <div className="relative h-[180px] bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] rounded-t-2xl flex flex-col items-center justify-center">
        <h3 className="font-serif text-2xl text-white font-semibold tracking-wide">
          Thailand
        </h3>
        <p className="text-white/70 text-sm mt-1">
          Bangkok &bull; Chiang Mai &bull; Phuket
        </p>
        {/* Dot indicators */}
        <div className="absolute bottom-3 flex gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B08D55]" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </div>

      {/* Form Area */}
      <div className="p-5 space-y-4">
        {/* Tour Dates */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#1D2D44]/50">
            Tour Dates
          </label>
          <select
            disabled
            className="w-full h-11 rounded-xl border border-[#1D2D44]/15 bg-white px-3 text-sm text-[#1D2D44] focus:border-[#B08D55] focus:ring-1 focus:ring-[#B08D55] outline-none appearance-none cursor-not-allowed opacity-60"
          >
            <option>Dates Coming Soon</option>
          </select>
        </div>

        {/* Room Occupancy */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#1D2D44]/50">
            Room Occupancy
          </label>
          <select
            value={occupancy}
            onChange={(e) => setOccupancy(e.target.value as 'DOUBLE' | 'SINGLE' | 'COUPLE')}
            className="w-full h-11 rounded-xl border border-[#1D2D44]/15 bg-white px-3 text-sm text-[#1D2D44] focus:border-[#B08D55] focus:ring-1 focus:ring-[#B08D55] outline-none appearance-none"
          >
            <option value="DOUBLE">Double Occupancy</option>
            <option value="SINGLE">Single Occupancy</option>
            <option value="COUPLE">Couple&apos;s Rate</option>
          </select>
        </div>

        {/* Pickleball Toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#1D2D44]/50">
            Playing Pickleball?
          </label>
          <select
            value={includesPickleball ? 'true' : 'false'}
            onChange={(e) => setIncludesPickleball(e.target.value === 'true')}
            className="w-full h-11 rounded-xl border border-[#1D2D44]/15 bg-white px-3 text-sm text-[#1D2D44] focus:border-[#B08D55] focus:ring-1 focus:ring-[#B08D55] outline-none appearance-none"
          >
            <option value="true">Yes — Full Program</option>
            <option value="false">Travel Companion Only</option>
          </select>
        </div>

        {/* Payment Plan Toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#1D2D44]/50">
            Payment Plan
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentPlan('deposit')}
              className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                paymentPlan === 'deposit'
                  ? 'border-[#B08D55] bg-[#FDF8F3]'
                  : 'border-[#1D2D44]/10 bg-white hover:border-[#1D2D44]/20'
              }`}
            >
              <span className="block text-sm font-medium text-[#1D2D44]">Pay Deposit</span>
              <span className="block text-[11px] text-[#1D2D44]/45 mt-0.5 leading-tight">
                20% to reserve your spot
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentPlan('full')}
              className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                paymentPlan === 'full'
                  ? 'border-[#B08D55] bg-[#FDF8F3]'
                  : 'border-[#1D2D44]/10 bg-white hover:border-[#1D2D44]/20'
              }`}
            >
              <span className="block text-sm font-medium text-[#1D2D44]">Pay in Full</span>
              <span className="block text-[11px] text-[#1D2D44]/45 mt-0.5 leading-tight">
                Early booking discount (2% off)
              </span>
            </button>
          </div>
        </div>

        {/* Price Display */}
        <div className="pt-2 pb-1 text-center">
          <p className="font-serif text-2xl font-semibold text-[#1D2D44]">Price TBD</p>
        </div>

        {/* Urgency Element */}
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-[#B08D55]">
          Remaining Spots: &mdash; / 16
        </p>

        {/* CTA Button */}
        <div className="space-y-2">
          <button
            type="button"
            disabled
            className="w-full h-12 rounded-xl bg-[#1D2D44]/20 text-white/60 font-semibold text-sm uppercase tracking-wider cursor-not-allowed"
          >
            Book Now
          </button>
          <p className="text-center text-xs text-[#1D2D44]/40">
            Dates &amp; pricing coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
