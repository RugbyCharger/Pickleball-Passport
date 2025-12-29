'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

// Enum definition matching Prisma schema
enum PickleballSkillLevel {
  RECREATIONAL = 'RECREATIONAL',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

// Validation schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  age: z.coerce.number().int().min(18, 'Must be at least 18 years old').max(120, 'Please enter a valid age'),
  location: z.string().min(2, 'Location is required'),
  pickleballSkillLevel: z.enum(['RECREATIONAL', 'INTERMEDIATE', 'ADVANCED']),
  pickleballFrequency: z.string().min(1, 'Please tell us how often you play'),
  dietaryRestrictions: z.array(z.string()).default([]),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Valid phone number is required'),
  emergencyContactRelationship: z.string().min(2, 'Relationship is required'),
})

type ProfileFormData = z.infer<typeof profileSchema>

const DIETARY_OPTIONS = [
  { value: 'None', label: 'None' },
  { value: 'Vegetarian', label: 'Vegetarian' },
  { value: 'Vegan', label: 'Vegan' },
  { value: 'Gluten-Free', label: 'Gluten-Free' },
  { value: 'Dairy-Free', label: 'Dairy-Free' },
  { value: 'Nut Allergy', label: 'Nut Allergy' },
]

interface GuestProfileFormProps {
  existingProfile?: Partial<ProfileFormData> | null
}

export default function GuestProfileForm({ existingProfile }: GuestProfileFormProps) {
  const router = useRouter()
  const [showOtherDietary, setShowOtherDietary] = useState(false)
  const [otherDietary, setOtherDietary] = useState('')

  const form = useForm({
    resolver: zodResolver(profileSchema) as any,
    mode: 'onBlur',
    defaultValues: (existingProfile || {
      firstName: '',
      lastName: '',
      age: '',
      location: '',
      pickleballSkillLevel: '',
      pickleballFrequency: '',
      dietaryRestrictions: [],
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
    }) as any,
  })

  const { register, handleSubmit, formState: { errors, isValid }, watch, setValue } = form

  const saveMutation = trpc.user.completeGuestProfile.useMutation({
    onSuccess: () => {
      toast.success('Profile saved successfully!')
      router.push('/booking/payment')
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to save profile. Please check your information and try again.'
      toast.error(errorMessage)
      console.error('Profile save error:', error)
    },
  })

  const dietaryRestrictions = watch('dietaryRestrictions')

  const handleDietaryChange = (value: string) => {
    const current = dietaryRestrictions || []

    if (value === 'None') {
      setValue('dietaryRestrictions', ['None'])
      setShowOtherDietary(false)
      return
    }

    const newRestrictions = current.includes(value)
      ? current.filter((r: string) => r !== value && r !== 'None')
      : [...current.filter((r: string) => r !== 'None'), value]

    setValue('dietaryRestrictions', newRestrictions)
  }

  const onSubmit = (data: any) => {
    // Validate custom dietary restriction if checkbox is checked
    if (showOtherDietary && !otherDietary.trim()) {
      toast.error('Please specify your dietary restriction or uncheck "Other"')
      return
    }

    // Add custom dietary restriction if specified
    if (showOtherDietary && otherDietary.trim()) {
      data.dietaryRestrictions = [
        ...(data.dietaryRestrictions || []).filter((r: string) => r !== 'Other'),
        otherDietary.trim(),
      ]
    }

    // Type assertion for mutation - Zod has already validated
    saveMutation.mutate(data as ProfileFormData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Information Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {String(errors.firstName?.message || "")}
              </p>
            )}
            {!errors.firstName && watch('firstName') && (watch('firstName') as string).length >= 2 && (
              <p className="mt-1 text-sm text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Looks good!
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {String(errors.lastName?.message || "")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              {...register('age')}
              type="number"
              id="age"
              min="18"
              max="120"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.age ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="30"
            />
            <p className="mt-1 text-xs text-gray-600">Must be 18 or older to book</p>
            {errors.age && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {String(errors.age?.message || "")}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">
              Home Location <span className="text-red-500">*</span>
            </label>
            <input
              {...register('location')}
              type="text"
              id="location"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="City, State/Province, Country"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {String(errors.location?.message || "")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pickleball Background Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900">Pickleball Background</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skill Level */}
          <div>
            <label htmlFor="pickleballSkillLevel" className="block text-sm font-medium text-slate-700 mb-2">
              Skill Level <span className="text-red-500">*</span>
            </label>
            <select
              {...register('pickleballSkillLevel')}
              id="pickleballSkillLevel"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.pickleballSkillLevel ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select your skill level</option>
              <option value="RECREATIONAL">Recreational</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <p className="mt-1 text-xs text-gray-600">We'll match you with players at your level</p>
            {errors.pickleballSkillLevel && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {String(errors.pickleballSkillLevel?.message || "")}
              </p>
            )}
          </div>

          {/* Frequency */}
          <div>
            <label htmlFor="pickleballFrequency" className="block text-sm font-medium text-slate-700 mb-2">
              How Often Do You Play? <span className="text-red-500">*</span>
            </label>
            <input
              {...register('pickleballFrequency')}
              type="text"
              id="pickleballFrequency"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.pickleballFrequency ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 3x per week, 2-3 times per month"
            />
            {errors.pickleballFrequency && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {String(errors.pickleballFrequency?.message || "")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dietary Restrictions Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900">Dietary Restrictions</h3>

        <div className="space-y-3">
          {DIETARY_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dietaryRestrictions?.includes(option.value)}
                onChange={() => handleDietaryChange(option.value)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">{option.label}</span>
            </label>
          ))}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showOtherDietary}
              onChange={(e) => setShowOtherDietary(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">Other (please specify)</span>
          </label>

          {showOtherDietary && (
            <input
              type="text"
              value={otherDietary}
              onChange={(e) => setOtherDietary(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Please specify your dietary restriction"
            />
          )}
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900">Emergency Contact</h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="emergencyContactName" className="block text-sm font-medium text-slate-700 mb-2">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('emergencyContactName')}
              type="text"
              id="emergencyContactName"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Jane Doe"
            />
            {errors.emergencyContactName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {String(errors.emergencyContactName?.message || "")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-slate-700 mb-2">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                {...register('emergencyContactPhone')}
                type="tel"
                id="emergencyContactPhone"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.emergencyContactPhone && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {String(errors.emergencyContactPhone?.message || "")}
                </p>
              )}
            </div>

            {/* Relationship */}
            <div>
              <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-slate-700 mb-2">
                Relationship <span className="text-red-500">*</span>
              </label>
              <input
                {...register('emergencyContactRelationship')}
                type="text"
                id="emergencyContactRelationship"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.emergencyContactRelationship ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
              {errors.emergencyContactRelationship && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {String(errors.emergencyContactRelationship?.message || "")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/booking/configure/trip')}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Trip Selection
        </button>
        <button
          type="submit"
          disabled={!isValid || saveMutation.isPending}
          className="flex-1 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            'Save & Continue to Payment'
          )}
        </button>
      </div>

      {/* Error Message */}
      {saveMutation.isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Failed to save profile. Please check your information and try again.
          </p>
        </div>
      )}
    </form>
  )
}
