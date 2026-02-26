'use client';

import Image from 'next/image';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComingSoonCardProps {
  destination: string;
  imageUrl?: string;
  onNotifyClick?: () => void;
}

export function ComingSoonCard({ destination, imageUrl, onNotifyClick }: ComingSoonCardProps) {
  return (
    <div className="bg-white/60 rounded-2xl shadow-md overflow-hidden border border-[#B08D55]/10 h-full flex flex-col opacity-80">
      {/* Hero image area */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={destination}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />
        )}
        {imageUrl && <div className="absolute inset-0 bg-black/20" />}

        {/* Coming Soon badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 text-gray-600 text-xs font-semibold">
            Coming Soon
          </span>
        </div>

        {/* Destination name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/30 to-transparent z-10">
          <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white/90">
            {destination}
          </h3>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-sm text-[#1D2D44]/40 mb-5">
          Dates &amp; pricing coming soon
        </p>

        <div className="mt-auto">
          <Button
            variant="outline"
            className="w-full border-2 border-[#B08D55]/30 text-[#1D2D44]/70 hover:bg-[#F5E6D3]/50 hover:border-[#B08D55]/50 rounded-xl h-12"
            onClick={onNotifyClick}
          >
            <Bell className="mr-2 h-4 w-4" />
            Notify Me
          </Button>
        </div>
      </div>
    </div>
  );
}
