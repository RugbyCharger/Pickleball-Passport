'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Eye, EyeOff, Star, Upload } from 'lucide-react';
import Link from 'next/link';

export default function TestimonialsAdminPage() {
  const [showUnapproved, setShowUnapproved] = useState(false);

  const { data: testimonials, isLoading, refetch } = trpc.testimonial.listAll.useQuery({
    includeUnapproved: showUnapproved,
  });

  const deleteMutation = trpc.testimonial.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const updateMutation = trpc.testimonial.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial? This will also delete the video from Mux.')) {
      return;
    }
    deleteMutation.mutate({ id });
  };

  const toggleApproved = async (id: string, currentStatus: boolean) => {
    updateMutation.mutate({
      id,
      isApproved: !currentStatus,
    });
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    updateMutation.mutate({
      id,
      isFeatured: !currentStatus,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage video testimonials and guest reviews
          </p>
        </div>
        <Link href="/admin/testimonials/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Testimonial
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant={showUnapproved ? 'outline' : 'default'}
          onClick={() => setShowUnapproved(false)}
        >
          Approved Only
        </Button>
        <Button
          variant={showUnapproved ? 'default' : 'outline'}
          onClick={() => setShowUnapproved(true)}
        >
          Show All
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !testimonials || testimonials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No testimonials found</p>
            <Link href="/admin/testimonials/upload">
              <Button className="mt-4">
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First Testimonial
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {(testimonials ?? []).map((testimonial) => (
            <Card key={testimonial.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {testimonial.guestName}
                      {testimonial.isFeatured && (
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                      {!testimonial.isApproved && (
                        <Badge variant="outline">Pending Approval</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {testimonial.packageType}
                      {testimonial.guestLocation && ` • ${testimonial.guestLocation}`}
                      {testimonial.guestAge && ` • Age ${testimonial.guestAge}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleApproved(testimonial.id, testimonial.isApproved)}
                      disabled={updateMutation.isPending}
                    >
                      {testimonial.isApproved ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Unapprove
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFeatured(testimonial.id, testimonial.isFeatured)}
                      disabled={updateMutation.isPending}
                    >
                      <Star
                        className={`h-4 w-4 ${testimonial.isFeatured ? 'fill-current' : ''}`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(testimonial.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Video Thumbnail */}
                  {testimonial.thumbnailUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={testimonial.thumbnailUrl}
                        alt={testimonial.guestName}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  {/* Testimonial Details */}
                  <div className="space-y-2">
                    {testimonial.quote && (
                      <div>
                        <p className="text-sm font-medium">Quote</p>
                        <p className="text-sm text-muted-foreground italic">
                          &ldquo;{testimonial.quote}&rdquo;
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Views</p>
                        <p className="text-muted-foreground">{testimonial.viewCount}</p>
                      </div>
                      {testimonial.tripDate && (
                        <div>
                          <p className="font-medium">Trip Date</p>
                          <p className="text-muted-foreground">
                            {new Date(testimonial.tripDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Mux Playback ID: {testimonial.muxPlaybackId || 'N/A'}</p>
                      <p>Created: {new Date(testimonial.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
