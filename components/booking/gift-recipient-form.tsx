'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBookingStore, type GiftRecipient } from '@/lib/stores/booking-store'
import { AlertCircle, Gift } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

export function GiftRecipientForm() {
  const { user } = useUser()
  const giftRecipient = useBookingStore((state) => state.giftRecipient)
  const setGiftRecipient = useBookingStore((state) => state.setGiftRecipient)

  const [formData, setFormData] = useState<GiftRecipient>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load from store on mount
  useEffect(() => {
    if (giftRecipient) {
      setFormData(giftRecipient)
    }
  }, [giftRecipient])

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

  const validateField = (name: keyof GiftRecipient, value: string) => {
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
        } else if (user?.emailAddresses[0]?.emailAddress === value) {
          newErrors.email = 'You cannot purchase a gift for yourself'
        } else {
          delete newErrors.email
        }
        break
      case 'dateOfBirth':
        if (value && !validateAge(value)) {
          newErrors.dateOfBirth = 'Recipient must be 18 years or older'
        } else {
          delete newErrors.dateOfBirth
        }
        break
      default:
        break
    }

    setErrors(newErrors)
  }

  const handleChange = (field: keyof GiftRecipient, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    setGiftRecipient(updated)
    validateField(field, value)
  }

  return (
    <div className="space-y-6 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/30 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Gift className="h-5 w-5 text-purple-600" />
        <div>
          <h3 className="font-semibold text-gray-900">Gift Recipient Details</h3>
          <p className="text-sm text-gray-600">
            We'll send the gift notification to this person
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="gift-recipient-first-name">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="gift-recipient-first-name"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => validateField('firstName', formData.firstName)}
            placeholder="Jane"
            required
            aria-required="true"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'first-name-error' : undefined}
            className="bg-white"
          />
          {errors.firstName && (
            <div id="first-name-error" className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.firstName}</span>
            </div>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="gift-recipient-last-name">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="gift-recipient-last-name"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => validateField('lastName', formData.lastName)}
            placeholder="Doe"
            required
            aria-required="true"
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'last-name-error' : undefined}
            className="bg-white"
          />
          {errors.lastName && (
            <div id="last-name-error" className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.lastName}</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="gift-recipient-email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="gift-recipient-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => validateField('email', formData.email)}
            placeholder="jane@example.com"
            required
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="bg-white"
          />
          {errors.email && (
            <div id="email-error" className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* Phone (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="gift-recipient-phone">
            Phone Number <span className="text-gray-500">(Optional)</span>
          </Label>
          <Input
            id="gift-recipient-phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="bg-white"
          />
          <p className="text-xs text-gray-500">
            Include country code (e.g., +1 for US)
          </p>
        </div>

        {/* Date of Birth (Optional) */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="gift-recipient-dob">
            Date of Birth <span className="text-gray-500">(Optional - for age verification)</span>
          </Label>
          <Input
            id="gift-recipient-dob"
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            onBlur={() => validateField('dateOfBirth', formData.dateOfBirth || '')}
            max={new Date().toISOString().split('T')[0]}
            aria-invalid={!!errors.dateOfBirth}
            aria-describedby={errors.dateOfBirth ? 'dob-error' : undefined}
            className="max-w-xs bg-white"
          />
          {errors.dateOfBirth && (
            <div id="dob-error" className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.dateOfBirth}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Recipient must be 18 years or older
          </p>
        </div>
      </div>
    </div>
  )
}
