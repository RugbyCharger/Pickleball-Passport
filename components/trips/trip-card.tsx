'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, MapPin, Clock, Users } from 'lucide-react';

interface TripCardProps {
  destination: string;
  subtitle: string;
  dates: string;
  price: string;
  badge: string;
  href: string;
  spotsLeft?: number;
  totalSpots?: number;
  status: 'available' | 'sold_out' | 'coming_soon';
}

export function TripCard({
  destination,
  subtitle,
  dates,
  price,
  badge,
  href,
  spotsLeft,
  totalSpots,
  status,
}: TripCardProps) {
  const isAvailable = status === 'available';
  const isSoldOut = status === 'sold_out';

  return (
    <Link href={href} className="block group">
        <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 border border-[#B08D55]/10 h-full flex flex-col">
          {/* Hero image area */}
          <div className="relative h-48 sm:h-56 bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#B08D55]/20 rounded-full blur-2xl" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl" />

            {/* Badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#B08D55]" />
                {badge}
              </span>
            </div>

            {/* Spots indicator */}
            {isAvailable && spotsLeft !== undefined && totalSpots !== undefined && (
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    spotsLeft <= 4
                      ? 'bg-red-500/90 text-white'
                      : 'bg-[#B08D55]/90 text-[#1D2D44]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  {spotsLeft <= 4 ? 'Almost Full' : `${spotsLeft} Rooms Left`}
                </span>
              </div>
            )}

            {/* Destination name overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
              <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                {destination}
              </h3>
            </div>
          </div>

          {/* Card content */}
          <div className="p-6 flex-1 flex flex-col">
            <p className="text-[#1D2D44]/70 text-sm mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#B08D55]" />
              {subtitle}
            </p>

            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-[#B08D55]" />
              <span className="text-sm font-medium text-[#B08D55]">{dates}</span>
            </div>

            <div className="text-lg font-bold text-[#1D2D44] mb-5">
              {price}
            </div>

            <div className="mt-auto">
              {isAvailable && (
                <Button
                  className="w-full bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-bold shadow-lg shadow-[#B08D55]/30 hover:shadow-xl rounded-xl h-12"
                >
                  Reserve Your Spot
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {isSoldOut && (
                <Button
                  variant="outline"
                  className="w-full border-2 border-gray-300 text-gray-500 cursor-not-allowed rounded-xl h-12"
                  disabled
                >
                  Sold Out
                </Button>
              )}
            </div>
          </div>
        </div>
    </Link>
  );
}
