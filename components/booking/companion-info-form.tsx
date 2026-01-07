'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useBookingStore, type CompanionInfo } from '@/lib/stores/booking-store'
import { AlertCircle } from 'lucide-react'

export function CompanionInfoForm() {
  const companionInfo = useBookingStore((state) => state.companionInfo)
  const setCompanionInfo = useBookingStore((state) => state.setCompanionInfo)

  const [formData, setFormData] = useState<CompanionInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    passportNumber: '',
    dietaryNotes: '',
  })

  const [showDietaryNotes, setShowDietaryNotes] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load from store on mount
  useEffect(() => {
    if (companionInfo) {
      setFormData(companionInfo)
      setShowDietaryNotes(!!companionInfo.dietaryNotes)
    }
  }, [companionInfo])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateAge = (dateOfBirth: string): boolean => {
    if (!dateOfBirth) return true // Optional field
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age
    return adjustedAge >= 18
  }

  const validateField = (name: keyof CompanionInfo, value: string) => {
    const newErrors = { ...errors }

    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'First name is required'
        } else {
          delete newErrors.firstName
        }
        break
      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Last name is required'
        } else {
          delete newErrors.lastName
        }
        break
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required'
        } else if (!validateEmail(value)) {
          newErrors.email = 'Please enter a valid email address'
        } else {
          delete newErrors.email
        }
        break
      case 'dateOfBirth':
        if (value && !validateAge(value)) {
          newErrors.dateOfBirth = 'Companion must be 18 years or older'
        } else {
          delete newErrors.dateOfBirth
        }
        break
      default:
        break
    }

    setErrors(newErrors)
  }

  const handleChange = (field: keyof CompanionInfo, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    setCompanionInfo(updated)
    validateField(field, value)
  }

  const handleDietaryNotesToggle = (checked: boolean) => {
    setShowDietaryNotes(checked)
    if (!checked) {
      handleChange('dietaryNotes', '')
    }
  }

  return (
    <div className="space-y-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Companion Booking Details
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Enter information for the person traveling with you
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="companion-firstName" className="text-sm font-medium">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companion-firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => validateField('firstName', formData.firstName)}
            placeholder="Enter first name"
            aria-required="true"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            className={errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.firstName && (
            <p id="firstName-error" className="flex items-center gap-1 text-sm text-red-600" role="alert">
              <AlertCircle className="h-4 w-4" />
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="companion-lastName" className="text-sm font-medium">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companion-lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => validateField('lastName', formData.lastName)}
            placeholder="Enter last name"
            aria-required="true"
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            className={errors.lastName ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.lastName && (
            <p id="lastName-error" className="flex items-center gap-1 text-sm text-red-600" role="alert">
              <AlertCircle className="h-4 w-4" />
              {errors.lastName}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="companion-email" className="text-sm font-medium">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companion-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => validateField('email', formData.email)}
            placeholder="companion@example.com"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.email && (
            <p id="email-error" className="flex items-center gap-1 text-sm text-red-600" role="alert">
              <AlertCircle className="h-4 w-4" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="companion-phone" className="text-sm font-medium">
            Phone Number (Optional)
          </Label>
          <Input
            id="companion-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="companion-dob" className="text-sm font-medium">
            Date of Birth (Optional)
          </Label>
          <Input
            id="companion-dob"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            onBlur={() => validateField('dateOfBirth', formData.dateOfBirth || '')}
            aria-invalid={!!errors.dateOfBirth}
            aria-describedby={errors.dateOfBirth ? 'dob-error' : undefined}
            className={errors.dateOfBirth ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.dateOfBirth && (
            <p id="dob-error" className="flex items-center gap-1 text-sm text-red-600" role="alert">
              <AlertCircle className="h-4 w-4" />
              {errors.dateOfBirth}
            </p>
          )}
          <p className="text-xs text-slate-500">
            Companion must be 18 years or older
          </p>
        </div>

        {/* Passport Number */}
        <div className="space-y-2">
          <Label htmlFor="companion-passport" className="text-sm font-medium">
            Passport Number (Optional)
          </Label>
          <Input
            id="companion-passport"
            type="text"
            value={formData.passportNumber}
            onChange={(e) => handleChange('passportNumber', e.target.value)}
            placeholder="ABC123456"
          />
          <p className="text-xs text-slate-500">
            For travel documentation
          </p>
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="dietary-checkbox"
            checked={showDietaryNotes}
            onCheckedChange={handleDietaryNotesToggle}
          />
          <Label
            htmlFor="dietary-checkbox"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            This person has different dietary restrictions
          </Label>
        </div>

        {showDietaryNotes && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <Label htmlFor="companion-dietary" className="text-sm font-medium">
              Dietary Restrictions & Allergies
            </Label>
            <Textarea
              id="companion-dietary"
              value={formData.dietaryNotes}
              onChange={(e) => handleChange('dietaryNotes', e.target.value)}
              placeholder="Please describe any dietary restrictions, allergies, or special meal requirements..."
              rows={4}
              className="resize-none"
            />
          </div>
        )}
      </div>
    </div>
  )
}
