'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Quote, MapPin, Calendar, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  guestName: string;
  location: string;
  packageType: string;
  quote: string;
  rating: number;
  date: string;
}

const placeholderTestimonials: Testimonial[] = [
  {
    id: '1',
    guestName: 'Sarah M.',
    location: 'Arizona, USA',
    packageType: 'Pickleball Paradise',
    quote: "The courts were pristine, and the level of play was exactly what I was looking for. The resort staff made me feel like royalty.",
    rating: 5,
    date: '2025-11-15',
  },
  {
    id: '2',
    guestName: 'James & Linda',
    location: 'Florida, USA',
    packageType: 'Full Passport',
    quote: "We came for the dental work but stayed for the pickleball! Saving 60% on our crowns paid for the entire luxury vacation.",
    rating: 5,
    date: '2025-10-22',
  },
  {
    id: '3',
    guestName: 'Robert T.',
    location: 'California, USA',
    packageType: '13-Day Ultimate',
    quote: "I've been on many pickleball tours, but this was on another level. The logistics were flawless.",
    rating: 5,
    date: '2025-12-05',
  },
];

interface TestimonialGalleryProps {
  packageType?: string;
  limit?: number;
  showFilters?: boolean;
}

export function TestimonialGallery({
  packageType: initialPackageType,
  limit = 6,
  showFilters = true,
}: TestimonialGalleryProps) {
  const [selectedPackageType, setSelectedPackageType] = useState<string | undefined>(
    initialPackageType
  );

  const filteredTestimonials = selectedPackageType && selectedPackageType !== 'All'
    ? placeholderTestimonials.filter(t => t.packageType === selectedPackageType)
    : placeholderTestimonials;

  const displayTestimonials = filteredTestimonials.slice(0, limit);

  const packageTypes = [
    'All',
    'Pickleball Paradise',
    'Full Passport',
    '13-Day Ultimate',
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 justify-center">
          {packageTypes.map((type) => (
            <Button
              key={type}
              variant={
                (type === 'All' && !selectedPackageType) ||
                selectedPackageType === type
                  ? 'default'
                  : 'outline'
              }
              size="sm"
              onClick={() =>
                setSelectedPackageType(type === 'All' ? undefined : type)
              }
              className="rounded-full"
            >
              {type}
            </Button>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayTestimonials.map((testimonial) => (
          <Card
            key={testimonial.id}
            className="group hover:shadow-lg transition-shadow border-none shadow-md bg-white/90 backdrop-blur-sm"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                 <div className="flex gap-1">
                   {[...Array(testimonial.rating)].map((_, i) => (
                     <Star key={i} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                   ))}
                 </div>
                 <Quote className="h-8 w-8 text-[#D4AF37]/20" />
              </div>

              <blockquote className="text-[#003D5C]/80 italic leading-relaxed min-h-[80px]">
                "{testimonial.quote}"
              </blockquote>

              <div className="pt-4 border-t border-[#D4AF37]/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#003D5C]">{testimonial.guestName}</div>
                  <div className="flex items-center gap-1 text-xs text-[#003D5C]/60">
                    <MapPin className="h-3 w-3" />
                    {testimonial.location}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-[#D4AF37]/10 text-[#003D5C] hover:bg-[#D4AF37]/20">
                    {testimonial.packageType}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-[#003D5C]/40 mt-1 justify-end">
                     <Calendar className="h-3 w-3" />
                     {new Date(testimonial.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
