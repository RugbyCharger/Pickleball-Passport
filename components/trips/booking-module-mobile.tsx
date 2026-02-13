'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface BookingModuleMobileProps {
  // Future: tripId, pricing, spots
}

export function BookingModuleMobile({}: BookingModuleMobileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [occupancy, setOccupancy] = useState<'DOUBLE' | 'SINGLE' | 'COUPLE'>('DOUBLE');
  const [includesPickleball, setIncludesPickleball] = useState(true);
  const [paymentPlan, setPaymentPlan] = useState<'deposit' | 'full'>('deposit');

  return (
    <>
      {/* Collapsed Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-[#B08D55]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <div className="py-3 px-4 flex items-center justify-between">
          <div>
            <p className="font-serif font-bold text-[#1D2D44]">Price TBD</p>
            <p className="text-xs text-[#1D2D44]/50">per person</p>
          </div>
          <button
            type="button"
            disabled
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B08D55]/40 to-[#CFB78D]/40 text-[#1D2D44]/40 font-bold text-sm cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Expanded Bottom Sheet */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsOpen(false)}
        />

        {/* Sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 ease-out ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ height: '85vh' }}
        >
          {/* Drag Handle */}
          <div className="pt-3 pb-2 flex justify-center">
            <div className="w-12 h-1.5 bg-[#1D2D44]/20 rounded-full" />
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1 text-[#1D2D44]/50 hover:text-[#1D2D44]"
            aria-label="Close booking sheet"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Content */}
          <div className="overflow-y-auto h-full px-5 pb-8">
            <div className="space-y-4">
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

              {/* Payment Plan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#1D2D44]/50">
                  Payment Plan
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPaymentPlan('deposit')}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                      paymentPlan === 'deposit'
                        ? 'border-[#B08D55] bg-[#FDF8F3]'
                        : 'border-[#1D2D44]/10 bg-white hover:border-[#1D2D44]/20'
                    }`}
                  >
                    <span className="block text-sm font-medium text-[#1D2D44]">
                      Pay Deposit
                    </span>
                    <span className="block text-[11px] text-[#1D2D44]/45 mt-0.5 leading-tight">
                      20% to reserve your spot
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentPlan('full')}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                      paymentPlan === 'full'
                        ? 'border-[#B08D55] bg-[#FDF8F3]'
                        : 'border-[#1D2D44]/10 bg-white hover:border-[#1D2D44]/20'
                    }`}
                  >
                    <span className="block text-sm font-medium text-[#1D2D44]">
                      Pay in Full
                    </span>
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
        </div>
      </div>
    </>
  );
}
