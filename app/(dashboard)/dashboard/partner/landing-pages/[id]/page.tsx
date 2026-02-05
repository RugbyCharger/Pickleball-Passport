/**
 * Partner Landing Page Editor
 * E9-S8: Co-Branded Landing Pages
 *
 * Features:
 * - Create/edit landing page
 * - Customize branding (logo, colors)
 * - Set headline and subheadline
 * - Preview landing page
 * - Publish/unpublish
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Eye, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const landingPageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  clubLogoUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  clubContact: z.string().optional(),
  isPublished: z.boolean().optional(),
});

type LandingPageForm = z.infer<typeof landingPageSchema>;

export default function LandingPageEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [isSaving, setIsSaving] = useState(false);

  const { data: existingPage, isLoading: loadingExisting } =
    trpc.partner.getLandingPage.useQuery(
      { id },
      { enabled: !isNew && id !== 'new', retry: false }
    );

  const createMutation = trpc.partner.createLandingPage.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/partner/landing-pages/${data.id}`);
    },
  });

  const updateMutation = trpc.partner.updateLandingPage.useMutation({
    onSuccess: () => {
      setIsSaving(false);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LandingPageForm>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: {
      name: '',
      slug: '',
      headline: '',
      subheadline: '',
      clubLogoUrl: '',
      primaryColor: '#1D2D44',
      secondaryColor: '#B08D55',
      clubContact: '',
      isPublished: false,
    },
  });

  // Load existing page data
  useEffect(() => {
    if (existingPage) {
      setValue('name', existingPage.name);
      setValue('slug', existingPage.slug);
      setValue('headline', existingPage.headline || '');
      setValue('subheadline', existingPage.subheadline || '');
      setValue('clubLogoUrl', existingPage.clubLogoUrl || '');
      setValue('primaryColor', existingPage.primaryColor || '#1D2D44');
      setValue('secondaryColor', existingPage.secondaryColor || '#B08D55');
      setValue('clubContact', existingPage.clubContact || '');
      setValue('isPublished', existingPage.isPublished);
    }
  }, [existingPage, setValue]);

  // Auto-generate slug from name
  const name = watch('name');
  useEffect(() => {
    if (isNew && name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug);
    }
  }, [name, isNew, setValue]);

  const onSubmit = async (data: LandingPageForm) => {
    setIsSaving(true);

    try {
      if (isNew) {
        await createMutation.mutateAsync({
          name: data.name,
          slug: data.slug,
          headline: data.headline || undefined,
          subheadline: data.subheadline || undefined,
          clubLogoUrl: data.clubLogoUrl || undefined,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          clubContact: data.clubContact || undefined,
        });
      } else {
        await updateMutation.mutateAsync({
          id,
          ...data,
          clubLogoUrl: data.clubLogoUrl || null,
          headline: data.headline || null,
          subheadline: data.subheadline || null,
          clubContact: data.clubContact || null,
        });
      }
    } catch (error) {
      console.error('Failed to save landing page:', error);
      setIsSaving(false);
    }
  };

  const isPublished = watch('isPublished');
  const slug = watch('slug');

  if (!isNew && loadingExisting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/partner" className="text-slate-600 hover:text-slate-900">
                Partner Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li>
              <Link
                href="/dashboard/partner/landing-pages"
                className="text-slate-600 hover:text-slate-900"
              >
                Landing Pages
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">
              {isNew ? 'New' : 'Edit'}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isNew ? 'Create Landing Page' : 'Edit Landing Page'}
            </h1>
            <p className="mt-1 text-slate-600">
              Customize your landing page with your club branding
            </p>
          </div>
          {!isNew && slug && (
            <Link href={`/p/${slug}`} target="_blank">
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </Link>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Basic Information</h2>

            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Page Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Phoenix Pickleball Club Landing Page"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="mb-4">
              <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
                URL Slug
              </label>
              <div className="mt-1 flex rounded-lg border border-slate-300">
                <span className="flex items-center rounded-l-lg border-r border-slate-300 bg-slate-50 px-3 text-sm text-slate-600">
                  /p/
                </span>
                <input
                  {...register('slug')}
                  type="text"
                  id="slug"
                  className="block flex-1 rounded-r-lg border-0 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="phoenix-pickleball-club"
                />
              </div>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Only lowercase letters, numbers, and hyphens allowed
              </p>
            </div>
          </div>

          {/* Branding */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Branding</h2>

            {/* Logo URL */}
            <div className="mb-4">
              <label htmlFor="clubLogoUrl" className="block text-sm font-medium text-slate-700">
                Club Logo URL (optional)
              </label>
              <input
                {...register('clubLogoUrl')}
                type="url"
                id="clubLogoUrl"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="https://example.com/logo.png"
              />
              <p className="mt-1 text-xs text-slate-500">
                Upload your logo to a hosting service and paste the URL here
              </p>
            </div>

            {/* Colors */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-slate-700">
                  Primary Color
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    {...register('primaryColor')}
                    type="color"
                    id="primaryColor"
                    className="h-10 w-20 cursor-pointer rounded-lg border border-slate-300"
                  />
                  <input
                    {...register('primaryColor')}
                    type="text"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="#1D2D44"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="secondaryColor"
                  className="block text-sm font-medium text-slate-700"
                >
                  Secondary Color
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    {...register('secondaryColor')}
                    type="color"
                    id="secondaryColor"
                    className="h-10 w-20 cursor-pointer rounded-lg border border-slate-300"
                  />
                  <input
                    {...register('secondaryColor')}
                    type="text"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="#B08D55"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Content</h2>

            {/* Headline */}
            <div className="mb-4">
              <label htmlFor="headline" className="block text-sm font-medium text-slate-700">
                Headline (optional)
              </label>
              <input
                {...register('headline')}
                type="text"
                id="headline"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Transform Your Life in Thailand"
              />
            </div>

            {/* Subheadline */}
            <div className="mb-4">
              <label htmlFor="subheadline" className="block text-sm font-medium text-slate-700">
                Subheadline (optional)
              </label>
              <textarea
                {...register('subheadline')}
                id="subheadline"
                rows={3}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Combine your love of pickleball with world-class wellness and medical care"
              />
            </div>

            {/* Club Contact */}
            <div>
              <label htmlFor="clubContact" className="block text-sm font-medium text-slate-700">
                Club Contact Info (optional)
              </label>
              <input
                {...register('clubContact')}
                type="text"
                id="clubContact"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Contact us at info@phoenixpickleball.com"
              />
            </div>
          </div>

          {/* Publish */}
          {!isNew && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Publish</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Published pages are visible to the public at /p/{slug}
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    {...register('isPublished')}
                    type="checkbox"
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard/partner/landing-pages">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isNew ? 'Create Landing Page' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
