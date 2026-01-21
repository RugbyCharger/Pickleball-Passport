/**
 * Admin Add-On Create/Edit Form
 * A3-S1: Package & Add-On Management (5 pts)
 *
 * Features:
 * - Create new add-ons
 * - Edit existing add-ons
 * - All fields: name, description, category, thPrice, usPrice, imageUrl
 * - Form validation
 * - Success/error handling
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  Tag,
  Save,
  X,
  Loader2,
  ArrowLeft,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { AddOnCategory } from '@prisma/client';

const CATEGORY_LABELS: Record<AddOnCategory, string> = {
  DENTAL: 'Dental',
  FACIAL_COSMETIC: 'Facial & Cosmetic',
  BODY: 'Body',
  HEALTH_SCREENING: 'Health Screening',
  SPA: 'Spa & Wellness',
  YOGA_MEDITATION: 'Yoga & Meditation',
  CULTURAL: 'Cultural Experiences',
  PICKLEBALL: 'Pickleball',
};

type AddOnFormData = {
  name: string;
  description: string;
  category: AddOnCategory;
  thPrice: string;
  usPrice: string;
  imageUrl: string;
  isActive: boolean;
};

export default function AddOnFormPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === 'new';
  const addOnId = isNew ? null : (params.id as string);

  const [formData, setFormData] = useState<AddOnFormData>({
    name: '',
    description: '',
    category: 'DENTAL',
    thPrice: '',
    usPrice: '',
    imageUrl: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddOnFormData, string>>>({});

  // Fetch existing add-on data if editing
  const { data: addOnData, isLoading: isLoadingAddOn } = trpc.addOn.adminGetById.useQuery(
    { id: addOnId! },
    {
      enabled: !isNew && !!addOnId,
    }
  );

  // Populate form when data is loaded
  useEffect(() => {
    if (addOnData && !isNew) {
      setFormData({
        name: addOnData.name,
        description: addOnData.description || '',
        category: addOnData.category,
        thPrice: (addOnData.thPrice / 100).toString(),
        usPrice: (addOnData.usPrice / 100).toString(),
        imageUrl: addOnData.imageUrl || '',
        isActive: addOnData.isActive,
      });
    }
  }, [addOnData, isNew]);

  // Mutations
  const createMutation = trpc.addOn.adminCreate.useMutation({
    onSuccess: () => {
      router.push('/dashboard/admin/add-ons');
    },
    onError: (error) => {
      alert(error.message || 'Failed to create add-on');
    },
  });

  const updateMutation = trpc.addOn.adminUpdate.useMutation({
    onSuccess: () => {
      router.push('/dashboard/admin/add-ons');
    },
    onError: (error) => {
      alert(error.message || 'Failed to update add-on');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddOnFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.thPrice.trim()) {
      newErrors.thPrice = 'Thailand price is required';
    } else if (isNaN(Number(formData.thPrice)) || Number(formData.thPrice) < 0) {
      newErrors.thPrice = 'Thailand price must be a valid positive number';
    }

    if (!formData.usPrice.trim()) {
      newErrors.usPrice = 'US price is required';
    } else if (isNaN(Number(formData.usPrice)) || Number(formData.usPrice) < 0) {
      newErrors.usPrice = 'US price must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      thPrice: Math.round(parseFloat(formData.thPrice) * 100),
      usPrice: Math.round(parseFloat(formData.usPrice) * 100),
      imageUrl: formData.imageUrl.trim() || undefined,
      isActive: formData.isActive,
    };

    if (isNew) {
      await createMutation.mutateAsync(payload);
    } else {
      await updateMutation.mutateAsync({
        id: addOnId!,
        ...payload,
      });
    }
  };

  const handleChange = (field: keyof AddOnFormData, value: string | boolean | AddOnCategory) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const savingsPercentage =
    formData.thPrice && formData.usPrice
      ? Math.round(
          ((parseFloat(formData.usPrice) - parseFloat(formData.thPrice)) /
            parseFloat(formData.usPrice)) *
            100
        )
      : 0;

  if (isLoadingAddOn) {
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
            href="/dashboard/admin/add-ons"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Add-Ons
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-3">
              <Tag className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isNew ? 'Create New Add-On' : 'Edit Add-On'}
              </h1>
              <p className="mt-1 text-slate-600">
                {isNew
                  ? 'Add a new add-on to the booking flow'
                  : 'Update add-on details and pricing'}
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
                  Add-On Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Porcelain Veneers (per tooth)"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value as AddOnCategory)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of the add-on"
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Pricing</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Thailand Price (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.thPrice}
                    onChange={(e) => handleChange('thPrice', e.target.value)}
                    placeholder="450.00"
                    className={`pl-10 ${errors.thPrice ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.thPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.thPrice}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  US Comparison Price (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.usPrice}
                    onChange={(e) => handleChange('usPrice', e.target.value)}
                    placeholder="1500.00"
                    className={`pl-10 ${errors.usPrice ? 'border-red-500' : ''}`}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Price for comparison with US market
                </p>
                {errors.usPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.usPrice}</p>
                )}
              </div>
            </div>

            {/* Savings Display */}
            {savingsPercentage > 0 && (
              <div className="mt-4 rounded-lg bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-900">
                  💰 Guests save {savingsPercentage}% compared to US prices!
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Savings: ${(parseFloat(formData.usPrice || '0') - parseFloat(formData.thPrice || '0')).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Image */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Image (Optional)</h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Image URL
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="pl-10"
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
                Add-on is active (visible in booking flow)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/dashboard/admin/add-ons">
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
                  {isNew ? 'Create Add-On' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
