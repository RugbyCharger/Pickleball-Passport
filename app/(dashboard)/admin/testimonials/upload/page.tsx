'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

export default function UploadTestimonialPage() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState<
    'idle' | 'uploading' | 'processing' | 'complete' | 'error'
  >('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [muxAssetId, setMuxAssetId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [formData, setFormData] = useState({
    guestName: '',
    guestAge: '',
    guestLocation: '',
    packageType: '',
    tripDate: '',
    quote: '',
    isFeatured: false,
    isApproved: true,
  });

  const createUploadMutation = trpc.testimonial.createUploadUrl.useMutation();
  const createTestimonialMutation = trpc.testimonial.create.useMutation({
    onSuccess: () => {
      setUploadState('complete');
      setTimeout(() => {
        router.push('/admin/testimonials');
      }, 2000);
    },
    onError: (error) => {
      setUploadState('error');
      setErrorMessage(error.message);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Please select a valid video file');
      setUploadState('error');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      setErrorMessage('Video file must be smaller than 500MB');
      setUploadState('error');
      return;
    }

    setUploadState('uploading');
    setErrorMessage('');

    try {
      // Get upload URL from Mux
      const { uploadUrl, assetId } = await createUploadMutation.mutateAsync();
      setMuxAssetId(assetId);

      // Upload file directly to Mux
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setUploadState('processing');
          setUploadProgress(100);
        } else {
          setUploadState('error');
          setErrorMessage('Upload failed. Please try again.');
        }
      });

      xhr.addEventListener('error', () => {
        setUploadState('error');
        setErrorMessage('Upload failed. Please check your connection and try again.');
      });

      xhr.open('PUT', uploadUrl);
      xhr.send(file);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState('error');
      setErrorMessage('Failed to initialize upload. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!muxAssetId) {
      setErrorMessage('Please upload a video first');
      return;
    }

    if (!formData.guestName || !formData.packageType) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    createTestimonialMutation.mutate({
      guestName: formData.guestName,
      guestAge: formData.guestAge ? parseInt(formData.guestAge) : undefined,
      guestLocation: formData.guestLocation,
      packageType: formData.packageType,
      tripDate: formData.tripDate || undefined,
      muxAssetId,
      quote: formData.quote,
      isFeatured: formData.isFeatured,
      isApproved: formData.isApproved,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/testimonials">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Testimonials
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Testimonial</h1>
        <p className="text-muted-foreground">
          Upload a video testimonial from a past guest
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Upload</CardTitle>
          <CardDescription>
            Upload a video file (MP4, MOV, etc.). Maximum size: 500MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadState === 'idle' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="video-upload" className="cursor-pointer">
                  <span className="text-sm font-medium">Click to upload video</span>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </Label>
              </div>
            </div>
          )}

          {uploadState === 'uploading' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Uploading video...</p>
                  <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{uploadProgress}%</p>
                </div>
              </div>
            </div>
          )}

          {uploadState === 'processing' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Video uploaded successfully!
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Mux is processing your video. This may take a few minutes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {uploadState === 'complete' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Testimonial created successfully!
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Redirecting to testimonials list...
                </p>
              </div>
            </div>
          )}

          {uploadState === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Upload failed
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {errorMessage}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setUploadState('idle')}>
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {(uploadState === 'processing' || uploadState === 'complete') && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Testimonial Details</CardTitle>
              <CardDescription>
                Fill in the guest information and testimonial details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestName">
                    Guest Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="guestName"
                    value={formData.guestName}
                    onChange={(e) =>
                      setFormData({ ...formData, guestName: e.target.value })
                    }
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestAge">Guest Age</Label>
                  <Input
                    id="guestAge"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.guestAge}
                    onChange={(e) =>
                      setFormData({ ...formData, guestAge: e.target.value })
                    }
                    placeholder="45"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestLocation">Guest Location</Label>
                  <Input
                    id="guestLocation"
                    value={formData.guestLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, guestLocation: e.target.value })
                    }
                    placeholder="Miami, FL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packageType">
                    Package Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="packageType"
                    value={formData.packageType}
                    onChange={(e) =>
                      setFormData({ ...formData, packageType: e.target.value })
                    }
                    required
                    placeholder="Smile Makeover"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tripDate">Trip Date</Label>
                  <Input
                    id="tripDate"
                    type="date"
                    value={formData.tripDate}
                    onChange={(e) =>
                      setFormData({ ...formData, tripDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quote">Quote (Optional)</Label>
                <Textarea
                  id="quote"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="This experience changed my life..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="isFeatured">Featured Testimonial</Label>
                  <p className="text-xs text-muted-foreground">
                    Show on homepage and featured sections
                  </p>
                </div>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeatured: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="isApproved">Approve Immediately</Label>
                  <p className="text-xs text-muted-foreground">
                    Make visible on the public site
                  </p>
                </div>
                <Switch
                  id="isApproved"
                  checked={formData.isApproved}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isApproved: checked })
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createTestimonialMutation.isPending}
              >
                {createTestimonialMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Testimonial...
                  </>
                ) : (
                  'Create Testimonial'
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
