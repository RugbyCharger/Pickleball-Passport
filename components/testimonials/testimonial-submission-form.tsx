'use client';

/**
 * Guest Testimonial Submission Form (Epic 12-5)
 *
 * Allows guests to submit testimonials with:
 * - Text content
 * - Video upload
 * - Before/After photos
 * - GDPR consent tracking
 *
 * File uploads use Supabase Storage via signed URLs.
 */

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Upload, Video, Image, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  validateTestimonialFile,
  TESTIMONIAL_FILE_LIMITS,
} from '@/lib/storage/testimonial-storage';

// Form validation schema
const testimonialFormSchema = z.object({
  type: z.enum(['TEXT', 'VIDEO', 'BEFORE_AFTER', 'COMBINED']),
  content: z.string().min(10, 'Please write at least 10 characters').max(5000).optional(),
  guestName: z.string().min(2, 'Please enter your name'),
  guestLocation: z.string().optional(),
  packageType: z.string().optional(),
  tripDate: z.string().optional(),
  bookingId: z.string().optional(),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'You must consent to share your testimonial',
  }),
});

type TestimonialFormData = z.infer<typeof testimonialFormSchema>;

interface TestimonialSubmissionFormProps {
  defaultGuestName?: string;
  defaultGuestLocation?: string;
  bookingId?: string;
  packageType?: string;
  tripDate?: string;
  onSuccess?: () => void;
}

export function TestimonialSubmissionForm({
  defaultGuestName = '',
  defaultGuestLocation = '',
  bookingId,
  packageType,
  tripDate,
  onSuccess,
}: TestimonialSubmissionFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      type: 'TEXT',
      content: '',
      guestName: defaultGuestName,
      guestLocation: defaultGuestLocation,
      packageType: packageType || '',
      tripDate: tripDate || '',
      bookingId: bookingId || '',
      consentGiven: false,
    },
  });

  const testimonialType = form.watch('type');

  const getUploadUrlMutation = trpc.guestTestimonial.getUploadUrl.useMutation();

  const submitMutation = trpc.guestTestimonial.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Thank you! Your testimonial has been submitted for review.');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit testimonial');
    },
  });

  const handleVideoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateTestimonialFile({ size: file.size, type: file.type }, 'video');
    if (!validation.valid) {
      toast.error(validation.error);
      e.target.value = '';
      return;
    }

    setVideoFile(file);
    toast.success('Video selected successfully');
  }, []);

  const handlePhotoChange = useCallback(
    (type: 'before' | 'after') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = validateTestimonialFile({ size: file.size, type: file.type }, 'photo');
      if (!validation.valid) {
        toast.error(validation.error);
        e.target.value = '';
        return;
      }

      if (type === 'before') {
        setBeforePhoto(file);
      } else {
        setAfterPhoto(file);
      }
      toast.success(`${type === 'before' ? 'Before' : 'After'} photo selected`);
    },
    []
  );

  /**
   * Upload a file to Supabase Storage using signed URL
   */
  const uploadFileToStorage = async (
    file: File,
    fileType: 'video' | 'before-photo' | 'after-photo'
  ): Promise<string | null> => {
    try {
      setUploadingFile(fileType);
      setUploadProgress(0);

      // 1. Get signed upload URL from server
      const { uploadUrl, publicUrl } = await getUploadUrlMutation.mutateAsync({
        fileName: file.name,
        fileType,
        fileSize: file.size,
        mimeType: file.type,
      });

      // 2. Upload file directly to Supabase Storage using signed URL
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      setUploadProgress(100);
      return publicUrl;
    } catch (error) {
      console.error(`Failed to upload ${fileType}:`, error);
      toast.error(`Failed to upload ${fileType.replace('-', ' ')}. Please try again.`);
      return null;
    } finally {
      setUploadingFile(null);
    }
  };

  const onSubmit = async (data: TestimonialFormData) => {
    try {
      setUploading(true);

      let videoUrl: string | undefined;
      let beforePhotoUrl: string | undefined;
      let afterPhotoUrl: string | undefined;

      // Upload files based on testimonial type
      if ((data.type === 'VIDEO' || data.type === 'COMBINED') && videoFile) {
        const url = await uploadFileToStorage(videoFile, 'video');
        if (!url) {
          setUploading(false);
          return; // Upload failed, error toast already shown
        }
        videoUrl = url;
      }

      if ((data.type === 'BEFORE_AFTER' || data.type === 'COMBINED') && beforePhoto && afterPhoto) {
        const beforeUrl = await uploadFileToStorage(beforePhoto, 'before-photo');
        if (!beforeUrl) {
          setUploading(false);
          return;
        }
        beforePhotoUrl = beforeUrl;

        const afterUrl = await uploadFileToStorage(afterPhoto, 'after-photo');
        if (!afterUrl) {
          setUploading(false);
          return;
        }
        afterPhotoUrl = afterUrl;
      }

      // Submit testimonial
      await submitMutation.mutateAsync({
        type: data.type,
        content: data.content,
        guestName: data.guestName,
        guestLocation: data.guestLocation || undefined,
        packageType: data.packageType || undefined,
        tripDate: data.tripDate || undefined,
        bookingId: data.bookingId || undefined,
        consentGiven: data.consentGiven,
        videoUrl,
        beforePhotoUrl,
        afterPhotoUrl,
      });
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-4">
            Your testimonial has been submitted and is pending review.
            We&apos;ll notify you once it&apos;s approved and published.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline">
            Submit Another Testimonial
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
        <CardDescription>
          Help others discover the Pickleball Passport experience by sharing your story.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Testimonial Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What would you like to share?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select testimonial type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TEXT">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Written Testimonial
                        </div>
                      </SelectItem>
                      <SelectItem value="VIDEO">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Video Testimonial
                        </div>
                      </SelectItem>
                      <SelectItem value="BEFORE_AFTER">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Before/After Photos
                        </div>
                      </SelectItem>
                      <SelectItem value="COMBINED">
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Video + Photos + Text
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Guest Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guestName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormDescription>This will be displayed with your testimonial</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="San Diego, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Package and Trip Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="packageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select package" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pure Play">Pure Play</SelectItem>
                        <SelectItem value="Smile Makeover">Smile Makeover</SelectItem>
                        <SelectItem value="Total Transformation">Total Transformation</SelectItem>
                        <SelectItem value="Wellness Retreat">Wellness Retreat</SelectItem>
                        <SelectItem value="Custom">Custom Package</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tripDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Written Content */}
            {(testimonialType === 'TEXT' ||
              testimonialType === 'BEFORE_AFTER' ||
              testimonialType === 'COMBINED') && (
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Your Story {testimonialType === 'TEXT' ? '*' : '(optional)'}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience with Pickleball Passport..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tell us about your transformation, favorite memories, or advice for future guests.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Video Upload */}
            {(testimonialType === 'VIDEO' || testimonialType === 'COMBINED') && (
              <div className="space-y-2">
                <Label>Video Testimonial {testimonialType === 'VIDEO' ? '*' : '(optional)'}</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    id="video-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="video-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Video className="h-8 w-8 text-muted-foreground" />
                    {videoFile ? (
                      <span className="text-sm font-medium text-green-600">
                        {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)}MB)
                      </span>
                    ) : (
                      <>
                        <span className="text-sm font-medium">Click to upload video</span>
                        <span className="text-xs text-muted-foreground">
                          MP4, MOV, WebM up to {TESTIMONIAL_FILE_LIMITS.VIDEO_MAX_SIZE / 1024 / 1024}MB
                        </span>
                      </>
                    )}
                  </label>
                </div>
                {uploadingFile === 'video' && (
                  <div className="space-y-1">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      Uploading video... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Before/After Photos */}
            {(testimonialType === 'BEFORE_AFTER' || testimonialType === 'COMBINED') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Before Photo *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange('before')}
                      className="hidden"
                      id="before-photo"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="before-photo"
                      className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Image className="h-6 w-6 text-muted-foreground" />
                      {beforePhoto ? (
                        <span className="text-xs font-medium text-green-600">
                          {beforePhoto.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Click to upload</span>
                      )}
                    </label>
                  </div>
                  {uploadingFile === 'before-photo' && (
                    <div className="space-y-1">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">Uploading...</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>After Photo *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange('after')}
                      className="hidden"
                      id="after-photo"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="after-photo"
                      className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Image className="h-6 w-6 text-muted-foreground" />
                      {afterPhoto ? (
                        <span className="text-xs font-medium text-green-600">
                          {afterPhoto.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Click to upload</span>
                      )}
                    </label>
                  </div>
                  {uploadingFile === 'after-photo' && (
                    <div className="space-y-1">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">Uploading...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GDPR Consent */}
            <FormField
              control={form.control}
              name="consentGiven"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I consent to share my testimonial *</FormLabel>
                    <FormDescription>
                      By checking this box, I consent to Pickleball Passport using my name, photo,
                      video, and testimonial content for marketing and promotional purposes. I
                      understand my testimonial may be displayed on the website and social media
                      channels.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Privacy Notice */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
              <p>
                Your testimonial will be reviewed by our team before being published. We may
                contact you for clarification or to request minor edits. You can withdraw your
                consent at any time by contacting us.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={uploading || submitMutation.isPending}
            >
              {uploading || submitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadingFile ? `Uploading ${uploadingFile.replace('-', ' ')}...` : 'Submitting...'}
                </>
              ) : (
                'Submit Testimonial'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
