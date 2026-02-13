'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

// Zod Validation Schemas for each step
const step1Schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  location: z.string().min(2, 'Location is required'),
});

const step2Schema = z.object({
  pickleballSkillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'pro']),
  pickleballFrequency: z.enum(['1-2x/week', '3-4x/week', '5+x/week', 'daily']),
  homeClub: z.string().optional(),
});

const step3Schema = z.object({
  interests: z.array(z.string()).min(1, 'Select at least one transformation interest'),
});

const step4Schema = z.object({
  preferredDuration: z.enum(['7', '10', '14', '21']),
  preferredDates: z.string().optional(),
  travelingAlone: z.boolean(),
  budgetRange: z.string().optional(),
});

const step5Schema = z.object({
  referralSource: z.string().min(1, 'Please tell us how you heard about us'),
});

// Combined schema for full form
const fullApplicationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

type ApplicationFormData = z.infer<typeof fullApplicationSchema>;

const STORAGE_KEY = 'pickleball-passport-application-draft';

interface ApplicationFormProps {
  onSuccess: () => void;
}

export function ApplicationForm({ onSuccess }: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(fullApplicationSchema),
    mode: 'onChange',
    defaultValues: {
      interests: [],
      travelingAlone: true,
    },
  });

  const createApplicationMutation = trpc.application.create.useMutation();

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        Object.keys(draft).forEach((key) => {
          setValue(key as keyof ApplicationFormData, draft[key]);
        });
        toast.info('Draft application loaded');
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [setValue]);

  // Save to localStorage on field change
  const saveToLocalStorage = () => {
    const currentData = getValues();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
    toast.success('Draft saved');
  };

  // Fields to validate per step
  const stepFields: Record<number, (keyof ApplicationFormData)[]> = {
    1: ['firstName', 'lastName', 'email', 'phone', 'location'],
    2: ['pickleballSkillLevel', 'pickleballFrequency'],
    3: ['interests'],
    4: ['preferredDuration'],
    5: ['referralSource'],
  };

  // Handle next step
  const handleNext = async () => {
    const isValid = await trigger(stepFields[currentStep]);
    if (isValid) {
      saveToLocalStorage();
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // Handle previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const onSubmit = async (data: ApplicationFormData) => {
    try {
      const result = await createApplicationMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        pickleballSkillLevel: data.pickleballSkillLevel,
        pickleballFrequency: data.pickleballFrequency,
        homeClub: data.homeClub || null,
        interests: data.interests,
        preferredDuration: data.preferredDuration,
        preferredDates: data.preferredDates || null,
        travelingAlone: data.travelingAlone,
        budgetRange: data.budgetRange || null,
        referralSource: data.referralSource,
      });

      // Clear draft from localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Epic 10: Clear referral cookie after successful attribution
      if (result.referralAttributed) {
        try {
          await fetch('/api/referral/clear-cookie', { method: 'POST' });
        } catch (err) {
          console.error('Failed to clear referral cookie:', err);
        }
      }

      toast.success('Application submitted successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit application');
    }
  };

  // Watch interests for checkbox handling
  const watchedInterests = watch('interests') || [];

  const toggleInterest = (interest: string) => {
    const currentInterests = watchedInterests;
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter((i) => i !== interest)
      : [...currentInterests, interest];
    setValue('interests', newInterests);
  };

  // Progress percentage
  const progress = (currentStep / totalSteps) * 100;

  return (
    <Card className="p-6 md:p-10">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-slate-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-emerald-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Basic Information</h2>
              <p className="text-slate-600">Let's start with the basics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="John"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Doe"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+1 (555) 123-4567"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="location">Current Location (City, State/Country) *</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="San Diego, California"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && (
                <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Pickleball Background */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Pickleball Background</h2>
              <p className="text-slate-600">Tell us about your pickleball experience</p>
            </div>

            <div>
              <Label>Skill Level *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {['beginner', 'intermediate', 'advanced', 'pro'].map((level) => (
                  <label
                    key={level}
                    className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      watch('pickleballSkillLevel') === level
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={level}
                      {...register('pickleballSkillLevel')}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium capitalize">{level}</span>
                  </label>
                ))}
              </div>
              {errors.pickleballSkillLevel && (
                <p className="text-sm text-red-600 mt-1">{errors.pickleballSkillLevel.message}</p>
              )}
            </div>

            <div>
              <Label>How often do you play? *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {['1-2x/week', '3-4x/week', '5+x/week', 'daily'].map((freq) => (
                  <label
                    key={freq}
                    className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      watch('pickleballFrequency') === freq
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={freq}
                      {...register('pickleballFrequency')}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{freq}</span>
                  </label>
                ))}
              </div>
              {errors.pickleballFrequency && (
                <p className="text-sm text-red-600 mt-1">{errors.pickleballFrequency.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="homeClub">Home Club or Facility (Optional)</Label>
              <Input
                id="homeClub"
                {...register('homeClub')}
                placeholder="e.g., San Diego Pickleball Club"
              />
            </div>
          </div>
        )}

        {/* Step 3: Transformation Interests */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Transformation Interests</h2>
              <p className="text-slate-600">What aspects of transformation interest you? (Select all that apply)</p>
            </div>

            <div className="space-y-3">
              {[
                { value: 'dental', label: 'Dental', description: 'Veneers, whitening, implants' },
                { value: 'cosmetic', label: 'Cosmetic', description: 'Botox, fillers, skincare' },
                { value: 'wellness', label: 'Wellness', description: 'Spa, massage, meditation' },
                { value: 'spiritual', label: 'Spiritual', description: 'Temples, mindfulness, yoga' },
                { value: 'pure_play', label: 'Pure Play', description: 'Just pickleball and fun!' },
              ].map((interest) => (
                <label
                  key={interest.value}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    watchedInterests.includes(interest.value)
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                  onClick={() => toggleInterest(interest.value)}
                >
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      checked={watchedInterests.includes(interest.value)}
                      onChange={() => {}}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-slate-900">{interest.label}</p>
                    <p className="text-sm text-slate-600">{interest.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.interests && (
              <p className="text-sm text-red-600 mt-1">{errors.interests.message}</p>
            )}
          </div>
        )}

        {/* Step 4: Travel Preferences */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Travel Preferences</h2>
              <p className="text-slate-600">Help us plan your perfect trip</p>
            </div>

            <div>
              <Label>Preferred Duration *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {['7', '10', '14', '21'].map((days) => (
                  <label
                    key={days}
                    className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      watch('preferredDuration') === days
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={days}
                      {...register('preferredDuration')}
                      className="sr-only"
                    />
                    <span className="text-2xl font-bold text-slate-900">{days}</span>
                    <span className="text-sm text-slate-600">days</span>
                  </label>
                ))}
              </div>
              {errors.preferredDuration && (
                <p className="text-sm text-red-600 mt-1">{errors.preferredDuration.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="preferredDates">Preferred Travel Timeframe (Optional)</Label>
              <Input
                id="preferredDates"
                {...register('preferredDates')}
                placeholder="e.g., Spring 2026, June-July, Flexible"
              />
              <p className="text-xs text-slate-500 mt-1">
                Don't worry - we'll finalize exact dates later
              </p>
            </div>

            <div>
              <Label>Traveling with... *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <label
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    watch('travelingAlone') === true
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-slate-200'
                  }`}
                  onClick={() => setValue('travelingAlone', true)}
                >
                  <input type="radio" className="sr-only" checked={watch('travelingAlone') === true} onChange={() => {}} />
                  <p className="font-semibold text-center">Solo</p>
                </label>
                <label
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    watch('travelingAlone') === false
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-slate-200'
                  }`}
                  onClick={() => setValue('travelingAlone', false)}
                >
                  <input type="radio" className="sr-only" checked={watch('travelingAlone') === false} onChange={() => {}} />
                  <p className="font-semibold text-center">Partner/Couple</p>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="budgetRange">Budget Range (Optional)</Label>
              <select
                id="budgetRange"
                {...register('budgetRange')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select a range</option>
                <option value="under-5k">Under $5,000</option>
                <option value="5k-10k">$5,000 - $10,000</option>
                <option value="10k-15k">$10,000 - $15,000</option>
                <option value="15k-20k">$15,000 - $20,000</option>
                <option value="20k+">$20,000+</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                This helps us recommend the right package
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Discovery */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">How Did You Hear About Us?</h2>
              <p className="text-slate-600">Help us understand how guests find us</p>
            </div>

            <div>
              <Label htmlFor="referralSource">Referral Source *</Label>
              <select
                id="referralSource"
                {...register('referralSource')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.referralSource ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select an option</option>
                <option value="google-search">Google Search</option>
                <option value="social-media-instagram">Instagram</option>
                <option value="social-media-facebook">Facebook</option>
                <option value="social-media-youtube">YouTube</option>
                <option value="pickleball-forum">Pickleball Forum/Community</option>
                <option value="friend-referral">Friend or Family Referral</option>
                <option value="podcast">Podcast</option>
                <option value="blog-article">Blog or Article</option>
                <option value="online-ad">Online Advertisement</option>
                <option value="travel-agent">Travel Agent</option>
                <option value="other">Other</option>
              </select>
              {errors.referralSource && (
                <p className="text-sm text-red-600 mt-1">{errors.referralSource.message}</p>
              )}
            </div>

            {/* Review Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-slate-900 mb-4">Application Summary</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-slate-600">Name:</span>{' '}
                  <span className="font-medium">{watch('firstName')} {watch('lastName')}</span>
                </p>
                <p>
                  <span className="text-slate-600">Email:</span>{' '}
                  <span className="font-medium">{watch('email')}</span>
                </p>
                <p>
                  <span className="text-slate-600">Skill Level:</span>{' '}
                  <span className="font-medium capitalize">{watch('pickleballSkillLevel')}</span>
                </p>
                <p>
                  <span className="text-slate-600">Interests:</span>{' '}
                  <span className="font-medium">
                    {watchedInterests.map(i => i.replace('_', ' ')).join(', ')}
                  </span>
                </p>
                <p>
                  <span className="text-slate-600">Duration:</span>{' '}
                  <span className="font-medium">{watch('preferredDuration')} days</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                ← Back
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={saveToLocalStorage}
              className="hidden sm:flex"
            >
              💾 Save Draft
            </Button>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                Next →
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createApplicationMutation.isPending}
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
              >
                {createApplicationMutation.isPending ? 'Submitting...' : 'Submit Application 🚀'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}
