'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, X, MapPin, Calendar } from 'lucide-react';
import MuxPlayer from '@mux/mux-player-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [selectedTestimonial, setSelectedTestimonial] = useState<string | null>(null);

  const { data: testimonials, isLoading } = trpc.testimonial.list.useQuery({
    packageType: selectedPackageType,
    limit,
    sortBy,
  });

  const { data: selectedTestimonialData } = trpc.testimonial.getById.useQuery(
    { id: selectedTestimonial! },
    { enabled: !!selectedTestimonial }
  );

  const packageTypes = [
    'All',
    'Pure Play',
    'Smile Makeover',
    'Total Transformation',
    'Spiritual Journey',
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No testimonials available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="space-y-4">
          {/* Package Type Filter */}
          <div className="flex flex-wrap gap-2">
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
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('recent')}
            >
              Most Recent
            </Button>
            <Button
              variant={sortBy === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('popular')}
            >
              Most Popular
            </Button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial: any) => (
          <Card
            key={testimonial.id}
            className="group cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedTestimonial(testimonial.id)}
          >
            <CardContent className="p-0">
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                {testimonial.thumbnailUrl && (
                  <img
                    src={testimonial.thumbnailUrl}
                    alt={testimonial.guestName}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="bg-white rounded-full p-4 group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-gray-900 fill-gray-900" />
                  </div>
                </div>
                {testimonial.isFeatured && (
                  <Badge className="absolute top-2 right-2">Featured</Badge>
                )}
              </div>

              {/* Testimonial Info */}
              <div className="p-4 space-y-2">
                <div>
                  <h3 className="font-semibold text-lg">{testimonial.guestName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.packageType}
                  </p>
                </div>

                {testimonial.guestLocation && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {testimonial.guestLocation}
                  </div>
                )}

                {testimonial.quote && (
                  <p className="text-sm italic line-clamp-2">"{testimonial.quote}"</p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                  {testimonial.tripDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(testimonial.tripDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  )}
                  <div>{testimonial.viewCount} views</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Modal */}
      <Dialog
        open={!!selectedTestimonial}
        onOpenChange={(open) => !open && setSelectedTestimonial(null)}
      >
        <DialogContent className="max-w-4xl p-0">
          {selectedTestimonialData && (
            <>
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                {selectedTestimonialData.muxPlaybackId && (
                  <MuxPlayer
                    playbackId={selectedTestimonialData.muxPlaybackId}
                    metadata={{
                      video_title: `${selectedTestimonialData.guestName} - ${selectedTestimonialData.packageType}`,
                    }}
                    streamType="on-demand"
                    autoPlay
                    className="w-full h-full"
                  />
                )}
              </div>

              {/* Testimonial Details */}
              <div className="p-6 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selectedTestimonialData.guestName}
                  </DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {selectedTestimonialData.packageType}
                      </Badge>
                      {selectedTestimonialData.guestLocation && (
                        <span className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {selectedTestimonialData.guestLocation}
                        </span>
                      )}
                      {selectedTestimonialData.guestAge && (
                        <span className="text-sm">Age {selectedTestimonialData.guestAge}</span>
                      )}
                      {selectedTestimonialData.tripDate && (
                        <span className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(selectedTestimonialData.tripDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </DialogDescription>
                </DialogHeader>

                {selectedTestimonialData.quote && (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                    "{selectedTestimonialData.quote}"
                  </blockquote>
                )}

                <div className="flex gap-2 pt-4">
                  <Button asChild className="flex-1">
                    <a href="/apply">Start Your Journey</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/packages">Explore Packages</a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
