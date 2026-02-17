'use client';

/**
 * Guest Testimonials Dashboard Page (Epic 12-5)
 *
 * Allows guests to:
 * - Submit new testimonials
 * - View their submitted testimonials and status
 * - Edit testimonials that require revisions
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { TestimonialSubmissionForm } from '@/components/testimonials/testimonial-submission-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Video,
  Image,
  FileText,
  AlertCircle,
} from 'lucide-react';

// Status badge configuration
const statusConfig = {
  PENDING: {
    label: 'Pending Review',
    variant: 'outline' as const,
    icon: Clock,
    description: 'Your testimonial is waiting to be reviewed.',
  },
  APPROVED: {
    label: 'Approved',
    variant: 'secondary' as const,
    icon: CheckCircle2,
    description: 'Your testimonial has been approved and will be published soon.',
  },
  PUBLISHED: {
    label: 'Published',
    variant: 'default' as const,
    icon: CheckCircle2,
    description: 'Your testimonial is live on our website!',
  },
  REJECTED: {
    label: 'Not Published',
    variant: 'destructive' as const,
    icon: XCircle,
    description: 'Your testimonial could not be published.',
  },
  EDIT_REQUESTED: {
    label: 'Edits Requested',
    variant: 'secondary' as const,
    icon: Edit,
    description: 'Please review and update your testimonial.',
  },
};

// Type icon configuration
const typeIcons = {
  TEXT: FileText,
  VIDEO: Video,
  BEFORE_AFTER: Image,
  COMBINED: Video,
};

export default function TestimonialsPage() {
  const [showForm, setShowForm] = useState(false);

  const { data: testimonials, isLoading, refetch } = trpc.guestTestimonial.myTestimonials.useQuery();

  const handleSubmitSuccess = () => {
    setShowForm(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Testimonials</h1>
          <p className="text-muted-foreground">
            Share your experience and help others discover The Pickleball Passport
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Submit Testimonial
          </Button>
        )}
      </div>

      {/* Submission Form */}
      {showForm && (
        <div className="mb-8">
          <TestimonialSubmissionForm onSuccess={handleSubmitSuccess} />
          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Testimonials List */}
      {!showForm && (
        <>
          {!testimonials || testimonials.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Testimonials Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your Pickleball Passport experience with future guests!
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Your First Testimonial
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial) => {
                const status = statusConfig[testimonial.status];
                const StatusIcon = status.icon;
                const TypeIcon = typeIcons[testimonial.type];

                return (
                  <Card key={testimonial.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-muted">
                            <TypeIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {testimonial.type === 'TEXT' && 'Written Testimonial'}
                              {testimonial.type === 'VIDEO' && 'Video Testimonial'}
                              {testimonial.type === 'BEFORE_AFTER' && 'Before/After Photos'}
                              {testimonial.type === 'COMBINED' && 'Full Testimonial'}
                            </CardTitle>
                            <CardDescription>
                              Submitted {new Date(testimonial.submittedAt).toLocaleDateString()}
                              {testimonial.packageType && ` - ${testimonial.packageType}`}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={status.variant} className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Content Preview */}
                      {testimonial.content && (
                        <div className="bg-muted/50 rounded-md p-4">
                          <p className="text-sm italic line-clamp-3">
                            &ldquo;{testimonial.content}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Status Message */}
                      <div className="flex items-start gap-2 text-sm">
                        <StatusIcon
                          className={`h-4 w-4 mt-0.5 ${
                            testimonial.status === 'PUBLISHED'
                              ? 'text-green-500'
                              : testimonial.status === 'REJECTED'
                              ? 'text-red-500'
                              : testimonial.status === 'EDIT_REQUESTED'
                              ? 'text-amber-500'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <span className="text-muted-foreground">{status.description}</span>
                      </div>

                      {/* Rejection Reason */}
                      {testimonial.status === 'REJECTED' && testimonial.rejectionReason && (
                        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3">
                          <p className="text-sm text-red-700 dark:text-red-300">
                            <strong>Reason:</strong> {testimonial.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* Edit Request Notes */}
                      {testimonial.status === 'EDIT_REQUESTED' && testimonial.editRequestNotes && (
                        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                Requested Changes:
                              </p>
                              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                {testimonial.editRequestNotes}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" className="mt-3" variant="outline">
                            <Edit className="mr-2 h-3 w-3" />
                            Update Testimonial
                          </Button>
                        </div>
                      )}

                      {/* Media Indicators */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {testimonial.videoUrl && (
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Video included
                          </span>
                        )}
                        {(testimonial.beforePhotoUrl || testimonial.afterPhotoUrl) && (
                          <span className="flex items-center gap-1">
                            <Image className="h-3 w-3" />
                            Photos included
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
