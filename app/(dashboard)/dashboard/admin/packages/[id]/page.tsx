/**
 * Admin Package Create/Edit Form
 * A3-S1: Package & Add-On Management (5 pts)
 *
 * Features:
 * - Create new packages
 * - Edit existing packages
 * - All fields: name, slug, tagline, description, basePrice, durationOptions, images, SEO
 * - Form validation
 * - Success/error handling
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  Package,
  Save,
  X,
  Loader2,
  ArrowLeft,
  DollarSign,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

type PackageFormData = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  basePrice: string;
  durationOptions: string;
  heroImageUrl: string;
  imageUrls: string;
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
};

export default function PackageFormPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === 'new';
  const packageId = isNew ? null : (params.id as string);

  const [formData, setFormData] = useState<PackageFormData>({
    slug: '',
    name: '',
    tagline: '',
    description: '',
    basePrice: '',
    durationOptions: '7, 10, 14',
    heroImageUrl: '',
    imageUrls: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PackageFormData, string>>>({});

  // Fetch existing package data if editing
  const { data: existingPackage, isLoading: isLoadingPackage } = trpc.package.adminGetById.useQuery(
    { id: packageId! },
    { enabled: !isNew && !!packageId }
  );

  // Mutations
  const createMutation = trpc.package.adminCreate.useMutation({
    onSuccess: () => {
      router.push('/dashboard/admin/packages');
    },
    onError: (error) => {
      alert(error.message || 'Failed to create package');
    },
  });

  const updateMutation = trpc.package.adminUpdate.useMutation({
    onSuccess: () => {
      router.push('/dashboard/admin/packages');
    },
    onError: (error) => {
      alert(error.message || 'Failed to update package');
    },
  });

  // Load existing package data
  useEffect(() => {
    if (existingPackage && !isNew) {
      setFormData({
        slug: existingPackage.slug,
        name: existingPackage.name,
        tagline: existingPackage.tagline || '',
        description: existingPackage.description,
        basePrice: (existingPackage.basePrice / 100).toString(),
        durationOptions: existingPackage.durationOptions.join(', '),
        heroImageUrl: existingPackage.heroImageUrl || '',
        imageUrls: existingPackage.imageUrls.join('\n'),
        metaTitle: existingPackage.metaTitle || '',
        metaDescription: existingPackage.metaDescription || '',
        isActive: existingPackage.isActive,
      });
    }
  }, [existingPackage, isNew]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PackageFormData, string>> = {};

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.basePrice.trim()) {
      newErrors.basePrice = 'Base price is required';
    } else if (isNaN(Number(formData.basePrice)) || Number(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Base price must be a positive number';
    }

    if (!formData.durationOptions.trim()) {
      newErrors.durationOptions = 'At least one duration option is required';
    } else {
      const durations = formData.durationOptions.split(',').map((d) => d.trim());
      if (durations.some((d) => isNaN(Number(d)) || Number(d) <= 0)) {
        newErrors.durationOptions = 'Duration options must be comma-separated positive numbers';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const durationOptions = formData.durationOptions
      .split(',')
      .map((d) => parseInt(d.trim()))
      .filter((d) => !isNaN(d));

    const imageUrls = formData.imageUrls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const payload = {
      slug: formData.slug.trim(),
      name: formData.name.trim(),
      tagline: formData.tagline.trim() || undefined,
      description: formData.description.trim(),
      basePrice: Math.round(parseFloat(formData.basePrice) * 100),
      durationOptions,
      heroImageUrl: formData.heroImageUrl.trim() || undefined,
      imageUrls,
      metaTitle: formData.metaTitle.trim() || undefined,
      metaDescription: formData.metaDescription.trim() || undefined,
      isActive: formData.isActive,
    };

    if (isNew) {
      await createMutation.mutateAsync(payload);
    } else {
      await updateMutation.mutateAsync({
        id: packageId!,
        ...payload,
      });
    }
  };

  const handleChange = (field: keyof PackageFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isLoadingPackage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/admin/packages"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Packages
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-3">
              <Package className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isNew ? 'Create New Package' : 'Edit Package'}
              </h1>
              <p className="mt-1 text-slate-600">
                {isNew
                  ? 'Add a new package to the booking flow'
                  : 'Update package details and configuration'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Package Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Pure Play"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value.toLowerCase())}
                  placeholder="e.g., pure-play"
                  className={errors.slug ? 'border-red-500' : ''}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Lowercase letters, numbers, and hyphens only
                </p>
                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tagline</label>
                <Input
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="e.g., All Pickleball, All Paradise"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Full package description (Markdown supported)"
                  rows={8}
                  className={`w-full rounded-md border ${
                    errors.description ? 'border-red-500' : 'border-slate-300'
                  } px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Duration */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Pricing & Duration</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Base Price (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => handleChange('basePrice', e.target.value)}
                    placeholder="7999.00"
                    className={`pl-10 ${errors.basePrice ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.basePrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Duration Options (days) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={formData.durationOptions}
                    onChange={(e) => handleChange('durationOptions', e.target.value)}
                    placeholder="7, 10, 14, 21"
                    className={`pl-10 ${errors.durationOptions ? 'border-red-500' : ''}`}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Comma-separated numbers</p>
                {errors.durationOptions && (
                  <p className="mt-1 text-sm text-red-600">{errors.durationOptions}</p>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Images</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Hero Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={formData.heroImageUrl}
                    onChange={(e) => handleChange('heroImageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Gallery Image URLs
                </label>
                <textarea
                  value={formData.imageUrls}
                  onChange={(e) => handleChange('imageUrls', e.target.value)}
                  placeholder="One URL per line"
                  rows={4}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="mt-1 text-xs text-slate-500">One URL per line</p>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">SEO (Optional)</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Meta Title</label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                  placeholder="Package name - Pickleball Passport"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  placeholder="Brief description for search engines"
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Status</h2>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">
                Package is active (visible in booking flow)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/dashboard/admin/packages">
              <Button type="button" variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isNew ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isNew ? 'Create Package' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
