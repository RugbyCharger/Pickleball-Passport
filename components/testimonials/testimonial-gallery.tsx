'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Quote, MapPin, Calendar, Star, Video, Image as ImageIcon } from 'lucide-react';

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

  // Fetch published testimonials from database via tRPC
  const { data: testimonials, isLoading, error } = trpc.guestTestimonial.getPublished.useQuery({
    packageType: selectedPackageType && selectedPackageType !== 'All' ? selectedPackageType : undefined,
    limit,
    sortBy: 'featured',
  });

  const packageTypes = [
    'All',
    'Pure Play',
    'Smile Makeover',
    'Total Transformation',
    'Wellness Retreat',
    'Custom',
  ];

  // Loading state with skeleton cards
  if (isLoading) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <div className="flex flex-wrap gap-2 justify-center">
            {packageTypes.map((type) => (
              <Skeleton key={type} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="border-none shadow-md bg-white/90">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-20 w-full" />
                <div className="pt-4 border-t border-[#D4AF37]/10">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Unable to load testimonials. Please try again later.</p>
      </div>
    );
  }

  // Empty state
  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="space-y-6">
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
        <div className="text-center py-12 text-muted-foreground">
          <Quote className="h-12 w-12 mx-auto mb-4 text-[#D4AF37]/30" />
          <p className="text-lg">No testimonials yet.</p>
          <p className="text-sm mt-2">Check back soon for guest stories!</p>
        </div>
      </div>
    );
  }

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
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.id}
            className="group hover:shadow-lg transition-shadow border-none shadow-md bg-white/90 backdrop-blur-sm"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-1">
                  {/* 5-star rating for featured testimonials */}
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        testimonial.isFeatured
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'fill-[#D4AF37]/50 text-[#D4AF37]/50'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {/* Media indicators */}
                  {testimonial.videoUrl && (
                    <Video className="h-4 w-4 text-[#D4AF37]/60" />
                  )}
                  {(testimonial.beforePhotoUrl || testimonial.afterPhotoUrl) && (
                    <ImageIcon className="h-4 w-4 text-[#D4AF37]/60" />
                  )}
                  <Quote className="h-8 w-8 text-[#D4AF37]/20" />
                </div>
              </div>

              <blockquote className="text-[#003D5C]/80 italic leading-relaxed min-h-[80px]">
                {testimonial.content ? (
                  <>
                    &ldquo;{testimonial.content.length > 200
                      ? `${testimonial.content.substring(0, 200)}...`
                      : testimonial.content}&rdquo;
                  </>
                ) : (
                  <span className="text-[#003D5C]/40 not-italic">
                    {testimonial.type === 'VIDEO'
                      ? 'Video testimonial'
                      : testimonial.type === 'BEFORE_AFTER'
                      ? 'Before/After transformation'
                      : 'View testimonial'}
                  </span>
                )}
              </blockquote>

              <div className="pt-4 border-t border-[#D4AF37]/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#003D5C]">{testimonial.guestName}</div>
                  {testimonial.guestLocation && (
                    <div className="flex items-center gap-1 text-xs text-[#003D5C]/60">
                      <MapPin className="h-3 w-3" />
                      {testimonial.guestLocation}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {testimonial.packageType && (
                    <Badge
                      variant="secondary"
                      className="bg-[#D4AF37]/10 text-[#003D5C] hover:bg-[#D4AF37]/20"
                    >
                      {testimonial.packageType}
                    </Badge>
                  )}
                  {testimonial.publishedAt && (
                    <div className="flex items-center gap-1 text-xs text-[#003D5C]/40 mt-1 justify-end">
                      <Calendar className="h-3 w-3" />
                      {new Date(testimonial.publishedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
