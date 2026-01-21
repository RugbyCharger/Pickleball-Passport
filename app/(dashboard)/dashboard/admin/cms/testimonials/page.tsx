'use client';

/**
 * Admin Testimonial Moderation Page (Epic 12-5)
 *
 * Allows admins to:
 * - View moderation queue with status filters
 * - Approve, reject, or request edits
 * - Preview testimonials before publishing
 * - Publish approved testimonials
 * - Manage featured testimonials
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  Eye,
  Star,
  Trash2,
  Video,
  Image,
  FileText,
  Send,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

// Status configuration
const statusConfig = {
  PENDING: {
    label: 'Pending',
    variant: 'outline' as const,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-700 dark:text-yellow-300',
  },
  APPROVED: {
    label: 'Approved',
    variant: 'secondary' as const,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  PUBLISHED: {
    label: 'Published',
    variant: 'default' as const,
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-700 dark:text-green-300',
  },
  REJECTED: {
    label: 'Rejected',
    variant: 'destructive' as const,
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-700 dark:text-red-300',
  },
  EDIT_REQUESTED: {
    label: 'Edits Requested',
    variant: 'secondary' as const,
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    textColor: 'text-amber-700 dark:text-amber-300',
  },
};

type TestimonialStatus = keyof typeof statusConfig;

export default function AdminTestimonialsPage() {
  const [statusFilter, setStatusFilter] = useState<TestimonialStatus | 'ALL'>('PENDING');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: 'reject' | 'requestEdits' | 'preview' | null;
    testimonialId: string | null;
  }>({ type: null, testimonialId: null });
  const [actionNotes, setActionNotes] = useState('');

  const limit = 20;

  // Queries
  const { data: queueCounts } = trpc.guestTestimonial.getQueueCounts.useQuery();

  const {
    data: testimonialsData,
    isLoading,
    refetch,
  } = trpc.guestTestimonial.listAll.useQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    type: typeFilter === 'ALL' ? undefined : (typeFilter as any),
    search: search || undefined,
    limit,
    offset: page * limit,
  });

  const { data: selectedTestimonial, isLoading: isLoadingSelected } =
    trpc.guestTestimonial.getById.useQuery(
      { id: selectedId! },
      { enabled: !!selectedId }
    );

  // Mutations
  const approveMutation = trpc.guestTestimonial.approve.useMutation({
    onSuccess: () => {
      toast.success('Testimonial approved');
      refetch();
      setSelectedId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const publishMutation = trpc.guestTestimonial.publish.useMutation({
    onSuccess: () => {
      toast.success('Testimonial published');
      refetch();
      setSelectedId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const unpublishMutation = trpc.guestTestimonial.unpublish.useMutation({
    onSuccess: () => {
      toast.success('Testimonial unpublished');
      refetch();
      setSelectedId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const rejectMutation = trpc.guestTestimonial.reject.useMutation({
    onSuccess: () => {
      toast.success('Testimonial rejected and guest notified');
      refetch();
      setActionDialog({ type: null, testimonialId: null });
      setActionNotes('');
      setSelectedId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const requestEditsMutation = trpc.guestTestimonial.requestEdits.useMutation({
    onSuccess: () => {
      toast.success('Edit request sent to guest');
      refetch();
      setActionDialog({ type: null, testimonialId: null });
      setActionNotes('');
      setSelectedId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const toggleFeaturedMutation = trpc.guestTestimonial.toggleFeatured.useMutation({
    onSuccess: () => {
      toast.success('Featured status updated');
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.guestTestimonial.delete.useMutation({
    onSuccess: () => {
      toast.success('Testimonial deleted');
      refetch();
      setSelectedId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleReject = () => {
    if (!actionDialog.testimonialId || actionNotes.length < 10) {
      toast.error('Please provide a reason (at least 10 characters)');
      return;
    }
    rejectMutation.mutate({ id: actionDialog.testimonialId, reason: actionNotes });
  };

  const handleRequestEdits = () => {
    if (!actionDialog.testimonialId || actionNotes.length < 10) {
      toast.error('Please provide edit instructions (at least 10 characters)');
      return;
    }
    requestEditsMutation.mutate({ id: actionDialog.testimonialId, notes: actionNotes });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this testimonial?')) return;
    deleteMutation.mutate({ id });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Testimonial Moderation</h1>
        <p className="text-muted-foreground">
          Review and moderate guest testimonials for publication
        </p>
      </div>

      {/* Queue Status Cards */}
      {queueCounts && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card
            className={`cursor-pointer transition-colors ${
              statusFilter === 'PENDING' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setStatusFilter('PENDING')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{queueCounts.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${
              statusFilter === 'APPROVED' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setStatusFilter('APPROVED')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{queueCounts.approved}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${
              statusFilter === 'PUBLISHED' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setStatusFilter('PUBLISHED')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{queueCounts.published}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${
              statusFilter === 'EDIT_REQUESTED' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setStatusFilter('EDIT_REQUESTED')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{queueCounts.editRequested}</p>
                  <p className="text-xs text-muted-foreground">Edits Req.</p>
                </div>
                <Edit className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${
              statusFilter === 'REJECTED' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setStatusFilter('REJECTED')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{queueCounts.rejected}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, content, or location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as TestimonialStatus | 'ALL');
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="EDIT_REQUESTED">Edits Requested</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="TEXT">Written</SelectItem>
            <SelectItem value="VIDEO">Video</SelectItem>
            <SelectItem value="BEFORE_AFTER">Before/After</SelectItem>
            <SelectItem value="COMBINED">Combined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !testimonialsData?.testimonials.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No testimonials found</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {testimonialsData.testimonials.map((testimonial) => {
                const status = statusConfig[testimonial.status];
                return (
                  <Card
                    key={testimonial.id}
                    className={`cursor-pointer transition-all ${
                      selectedId === testimonial.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedId(testimonial.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {testimonial.type === 'VIDEO' && <Video className="h-4 w-4" />}
                            {testimonial.type === 'BEFORE_AFTER' && <Image className="h-4 w-4" />}
                            {testimonial.type === 'TEXT' && <FileText className="h-4 w-4" />}
                            {testimonial.type === 'COMBINED' && <Video className="h-4 w-4" />}
                            {testimonial.guestName}
                            {testimonial.isFeatured && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </CardTitle>
                          <CardDescription>
                            {testimonial.guestLocation && `${testimonial.guestLocation} - `}
                            {new Date(testimonial.submittedAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {testimonial.content && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          &ldquo;{testimonial.content}&rdquo;
                        </p>
                      )}
                      {testimonial.packageType && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Package: {testimonial.packageType}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Pagination */}
              {testimonialsData.total > limit && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * limit + 1}-
                    {Math.min((page + 1) * limit, testimonialsData.total)} of{' '}
                    {testimonialsData.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!testimonialsData.hasMore}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:sticky lg:top-4 h-fit">
          {selectedId ? (
            isLoadingSelected ? (
              <Card>
                <CardContent className="py-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : selectedTestimonial ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedTestimonial.guestName}</CardTitle>
                      <CardDescription>
                        {selectedTestimonial.guestLocation}
                        {selectedTestimonial.packageType &&
                          ` - ${selectedTestimonial.packageType}`}
                      </CardDescription>
                    </div>
                    <Badge variant={statusConfig[selectedTestimonial.status].variant}>
                      {statusConfig[selectedTestimonial.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Guest Email */}
                  <div>
                    <p className="text-sm font-medium mb-1">Guest Email</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedTestimonial.guest.email}
                    </p>
                  </div>

                  {/* Content */}
                  {selectedTestimonial.content && (
                    <div>
                      <p className="text-sm font-medium mb-1">Testimonial</p>
                      <div className="bg-muted/50 rounded-md p-4">
                        <p className="text-sm italic">&ldquo;{selectedTestimonial.content}&rdquo;</p>
                      </div>
                    </div>
                  )}

                  {/* Video Preview */}
                  {selectedTestimonial.videoUrl && (
                    <div>
                      <p className="text-sm font-medium mb-1">Video</p>
                      <div className="bg-muted rounded-md aspect-video flex items-center justify-center">
                        <a
                          href={selectedTestimonial.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Video className="h-5 w-5" />
                          View Video
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Before/After Photos */}
                  {(selectedTestimonial.beforePhotoUrl || selectedTestimonial.afterPhotoUrl) && (
                    <div>
                      <p className="text-sm font-medium mb-1">Before/After Photos</p>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedTestimonial.beforePhotoUrl && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Before</p>
                            <div className="bg-muted rounded-md aspect-square flex items-center justify-center">
                              <a
                                href={selectedTestimonial.beforePhotoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Image className="h-8 w-8 text-muted-foreground" />
                              </a>
                            </div>
                          </div>
                        )}
                        {selectedTestimonial.afterPhotoUrl && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">After</p>
                            <div className="bg-muted rounded-md aspect-square flex items-center justify-center">
                              <a
                                href={selectedTestimonial.afterPhotoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Image className="h-8 w-8 text-muted-foreground" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* GDPR Consent */}
                  <div className="text-sm">
                    <p className="font-medium mb-1">Consent</p>
                    <div className="flex items-center gap-2">
                      {selectedTestimonial.consentGiven ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-green-700 dark:text-green-300">
                            Consent given{' '}
                            {selectedTestimonial.consentTimestamp &&
                              `on ${new Date(selectedTestimonial.consentTimestamp).toLocaleString()}`}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-700 dark:text-red-300">No consent recorded</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {selectedTestimonial.rejectionReason && (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                        Rejection Reason
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {selectedTestimonial.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Edit Request Notes */}
                  {selectedTestimonial.editRequestNotes && (
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                        Edit Request Notes
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {selectedTestimonial.editRequestNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {/* Pending Actions */}
                    {selectedTestimonial.status === 'PENDING' && (
                      <>
                        <Button
                          onClick={() => approveMutation.mutate({ id: selectedTestimonial.id })}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setActionDialog({ type: 'requestEdits', testimonialId: selectedTestimonial.id })
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Request Edits
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            setActionDialog({ type: 'reject', testimonialId: selectedTestimonial.id })
                          }
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}

                    {/* Approved Actions */}
                    {selectedTestimonial.status === 'APPROVED' && (
                      <>
                        <Button
                          onClick={() => publishMutation.mutate({ id: selectedTestimonial.id })}
                          disabled={publishMutation.isPending}
                        >
                          {publishMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          <Send className="mr-2 h-4 w-4" />
                          Publish
                        </Button>
                      </>
                    )}

                    {/* Published Actions */}
                    {selectedTestimonial.status === 'PUBLISHED' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => unpublishMutation.mutate({ id: selectedTestimonial.id })}
                          disabled={unpublishMutation.isPending}
                        >
                          Unpublish
                        </Button>
                        <Button
                          variant={selectedTestimonial.isFeatured ? 'secondary' : 'outline'}
                          onClick={() =>
                            toggleFeaturedMutation.mutate({ id: selectedTestimonial.id })
                          }
                        >
                          <Star
                            className={`mr-2 h-4 w-4 ${
                              selectedTestimonial.isFeatured ? 'fill-current' : ''
                            }`}
                          />
                          {selectedTestimonial.isFeatured ? 'Unfeature' : 'Feature'}
                        </Button>
                      </>
                    )}

                    {/* Preview Button */}
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setActionDialog({ type: 'preview', testimonialId: selectedTestimonial.id })
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(selectedTestimonial.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a testimonial to view details and take action
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog
        open={actionDialog.type === 'reject'}
        onOpenChange={(open) => !open && setActionDialog({ type: null, testimonialId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Testimonial</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be shared with the guest.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog({ type: null, testimonialId: null });
                setActionNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || actionNotes.length < 10}
            >
              {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Testimonial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Edits Dialog */}
      <Dialog
        open={actionDialog.type === 'requestEdits'}
        onOpenChange={(open) => !open && setActionDialog({ type: null, testimonialId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Edits</DialogTitle>
            <DialogDescription>
              Provide instructions for the guest on what changes are needed.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Please update your testimonial to..."
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog({ type: null, testimonialId: null });
                setActionNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestEdits}
              disabled={requestEditsMutation.isPending || actionNotes.length < 10}
            >
              {requestEditsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={actionDialog.type === 'preview'}
        onOpenChange={(open) => !open && setActionDialog({ type: null, testimonialId: null })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Testimonial Preview</DialogTitle>
            <DialogDescription>How this testimonial will appear on the website</DialogDescription>
          </DialogHeader>
          {selectedTestimonial && (
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 flex items-center justify-center text-white text-xl font-bold">
                  {selectedTestimonial.guestName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{selectedTestimonial.guestName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTestimonial.guestLocation}
                    {selectedTestimonial.packageType && ` - ${selectedTestimonial.packageType}`}
                  </p>
                </div>
                {selectedTestimonial.isFeatured && (
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              {selectedTestimonial.content && (
                <blockquote className="mt-4 text-lg italic">
                  &ldquo;{selectedTestimonial.content}&rdquo;
                </blockquote>
              )}
              {selectedTestimonial.tripDate && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Trip: {new Date(selectedTestimonial.tripDate).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
