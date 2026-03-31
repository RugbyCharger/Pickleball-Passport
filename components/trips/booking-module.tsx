'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Users } from 'lucide-react';

interface BookingModuleProps {
  tripName?: string;
  cities?: string;
  dates?: string;
  price?: number;
  depositAmount?: number;
  depositLink?: string;
  fullLink?: string;
  spotsLeft?: number;
  totalSpots?: number;
}

export function BookingModule({
  cities = 'Bangkok · Hua Hin',
  dates = 'Jun 18–26, 2026',
  price = 3488,
  depositAmount = 872,
  depositLink,
  fullLink,
  spotsLeft,
  totalSpots,
}: BookingModuleProps) {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  return (
    <div className="rounded-2xl shadow-xl shadow-[#1D2D44]/10 border border-[#B08D55]/10 bg-white overflow-hidden">
      {/* Header */}
      <div className="relative h-[180px] bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] rounded-t-2xl flex flex-col items-center justify-center">
        <h3 className="font-serif text-2xl text-white font-semibold tracking-wide">
          Thailand
        </h3>
        <p className="text-white/70 text-sm mt-1">
          {cities}
        </p>
        <div className="flex items-center gap-1.5 mt-3 text-white/80 text-xs">
          <Calendar className="w-3.5 h-3.5 text-[#B08D55]" />
          {dates}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 space-y-4">
        {/* Price Display */}
        <div className="pt-2 pb-1 text-center">
          <p className="font-serif text-2xl font-bold text-[#1D2D44]">
            From ${price.toLocaleString()}<span className="text-base font-normal text-[#1D2D44]/60">/person</span>
          </p>
          <p className="text-xs text-[#1D2D44]/60 mt-1">
            Secure your spot with a 25% deposit (${depositAmount.toLocaleString()})
          </p>
        </div>

        {/* Spots Counter */}
        {spotsLeft !== undefined && totalSpots !== undefined && (
          <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold ${
            spotsLeft <= 4
              ? 'bg-red-50 text-red-700 border border-red-200'
              : spotsLeft <= 8
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            <Users className="w-4 h-4" />
            {spotsLeft === 0
              ? 'Sold Out'
              : spotsLeft <= 4
                ? `Only ${spotsLeft} Spots Left!`
                : `${spotsLeft} of ${totalSpots} Spots Available`
            }
          </div>
        )}

        {/* Dual CTA Buttons */}
        <div className="space-y-3">
          {/* Reserve Your Spot — outline */}
          <Link
            href="/reserve"
            className="flex w-full h-12 items-center justify-center rounded-xl border-2 border-[#1D2D44] text-[#1D2D44] font-semibold text-sm uppercase tracking-wider hover:bg-[#1D2D44] hover:text-white transition-all"
          >
            Reserve Your Spot
          </Link>

          {/* Book Now — gold filled */}
          {depositLink && fullLink ? (
            <>
              <button
                type="button"
                onClick={() => setShowPaymentOptions(!showPaymentOptions)}
                className="flex w-full h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-semibold text-sm uppercase tracking-wider shadow-lg shadow-[#B08D55]/25 hover:shadow-xl hover:shadow-[#B08D55]/30 transition-all hover:-translate-y-0.5"
              >
                Book Now
              </button>

              {showPaymentOptions && (
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={depositLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-[#B08D55] p-3 text-center hover:bg-[#B08D55]/10 transition-colors"
                  >
                    <span className="text-xs font-semibold uppercase text-[#1D2D44]">Pay Deposit</span>
                    <span className="text-base font-bold text-[#1D2D44] mt-0.5">${depositAmount.toLocaleString()}</span>
                    <span className="text-xs text-[#1D2D44]/50">25%</span>
                  </a>
                  <a
                    href={fullLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-[#B08D55] p-3 text-center hover:bg-[#B08D55]/10 transition-colors"
                  >
                    <span className="text-xs font-semibold uppercase text-[#1D2D44]">Pay in Full</span>
                    <span className="text-base font-bold text-[#1D2D44] mt-0.5">${price.toLocaleString()}</span>
                    <span className="text-xs text-[#1D2D44]/50">Full amount</span>
                  </a>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/reserve"
              className="flex w-full h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-semibold text-sm uppercase tracking-wider shadow-lg shadow-[#B08D55]/25 hover:shadow-xl hover:shadow-[#B08D55]/30 transition-all hover:-translate-y-0.5"
            >
              Book Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
