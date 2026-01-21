'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Mail,
  Phone,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  MapPin,
  Copy,
} from 'lucide-react'

/**
 * Phone validation regex - allows various phone formats
 */
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/

/**
 * Category options for the contact form
 */
const categoryOptions = [
  { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
  { value: 'BOOKING_QUESTION', label: 'Booking Question' },
  { value: 'MEDICAL_WELLNESS_QUESTION', label: 'Medical/Wellness Question' },
  { value: 'PAYMENT_ISSUE', label: 'Payment Issue' },
  { value: 'PARTNERSHIP_INQUIRY', label: 'Partnership Inquiry' },
  { value: 'OTHER', label: 'Other' },
] as const

/**
 * Trip interest options
 */
const tripInterestOptions = [
  { value: '', label: 'Select a trip (optional)' },
  { value: 'Singles Retreat', label: 'Singles Retreat' },
  { value: 'Couples Getaway', label: 'Couples Getaway' },
  { value: 'Group Adventure', label: 'Group Adventure' },
  { value: 'Corporate Event', label: 'Corporate Event' },
  { value: 'Custom Trip', label: 'Custom Trip' },
  { value: 'Not Sure Yet', label: 'Not Sure Yet' },
] as const

/**
 * Timeline options
 */
const timelineOptions = [
  { value: '', label: 'Select timeline (optional)' },
  { value: 'Within 1 month', label: 'Within 1 month' },
  { value: '1-3 months', label: '1-3 months' },
  { value: '3-6 months', label: '3-6 months' },
  { value: '6+ months', label: '6+ months' },
  { value: 'Just exploring', label: 'Just exploring' },
] as const

const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(phoneRegex, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  category: z.enum([
    'GENERAL_INQUIRY',
    'BOOKING_QUESTION',
    'MEDICAL_WELLNESS_QUESTION',
    'PAYMENT_ISSUE',
    'PARTNERSHIP_INQUIRY',
    'OTHER',
  ]),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(5000, 'Message must be 5000 characters or less'),
  tripInterest: z.string().optional(),
  timeline: z.string().optional(),
  // Honeypot field - should always be empty
  website: z.string().optional(),
})

type ContactFormInput = z.infer<typeof contactFormSchema>

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null)
  const { executeRecaptcha } = useGoogleReCaptcha()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      category: 'GENERAL_INQUIRY',
      tripInterest: '',
      timeline: '',
      website: '',
    },
  })

  const selectedCategory = watch('category')
  const selectedTripInterest = watch('tripInterest')
  const selectedTimeline = watch('timeline')

  const contactMutation = trpc.support.createPublicTicket.useMutation({
    onSuccess: (data) => {
      toast.success(data.message)
      setIsSubmitted(true)
      setReferenceNumber(data.referenceNumber)
      reset()
    },
    onError: (error) => {
      console.error('Contact form error:', error)
      toast.error(error.message || 'Failed to send message. Please try again.')
    },
  })

  const onSubmit = async (data: ContactFormInput) => {
    if (!executeRecaptcha) {
      toast.error('reCAPTCHA not loaded. Please refresh the page.')
      return
    }

    try {
      const recaptchaToken = await executeRecaptcha('contact_form')

      if (!recaptchaToken) {
        toast.error('reCAPTCHA verification failed. Please try again.')
        return
      }

      await contactMutation.mutateAsync({
        ...data,
        recaptchaToken,
      })
    } catch (error) {
      console.error('Contact form submission error:', error)
    }
  }

  const copyReferenceNumber = () => {
    if (referenceNumber) {
      navigator.clipboard.writeText(referenceNumber)
      toast.success('Reference number copied!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#003D5C] to-[#005A82] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-4">
            Have questions? We&apos;re here to help.
          </p>
          <p className="text-base md:text-lg text-blue-200 max-w-3xl mx-auto">
            Whether you&apos;re curious about our packages, planning your
            transformation journey, or just want to learn more about our Thailand
            experiences, we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Send Us a Message
                </h2>
                <p className="text-gray-600 mb-6">
                  Fill out the form below and we&apos;ll get back to you within 24
                  hours.
                </p>

                {isSubmitted && referenceNumber && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle
                        className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div className="flex-1">
                        <p className="text-green-800 font-medium">
                          Message sent successfully!
                        </p>
                        <p className="text-green-700 text-sm mt-1">
                          We&apos;ve received your message and will respond within 24
                          hours.
                        </p>
                        <div className="mt-3 flex items-center gap-2 bg-green-100 rounded-md p-2">
                          <span className="text-green-800 text-sm font-medium">
                            Reference Number:
                          </span>
                          <code className="text-green-900 font-mono font-bold">
                            {referenceNumber}
                          </code>
                          <button
                            type="button"
                            onClick={copyReferenceNumber}
                            className="ml-auto text-green-700 hover:text-green-900 p-1"
                            aria-label="Copy reference number"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-green-600 text-xs mt-2">
                          Save this reference number to check on your ticket status.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Honeypot field - hidden from users, visible to bots */}
                  <div className="hidden" aria-hidden="true">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      {...register('website')}
                    />
                  </div>

                  {/* Name Field */}
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      aria-required="true"
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      {...register('name')}
                      className={`mt-1.5 ${errors.name ? 'border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      aria-required="true"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      {...register('email')}
                      className={`mt-1.5 ${errors.email ? 'border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      Phone (optional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      aria-invalid={errors.phone ? 'true' : 'false'}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      {...register('phone')}
                      className={`mt-1.5 ${errors.phone ? 'border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="text-red-500 text-sm mt-1" role="alert">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <Label htmlFor="category" className="text-gray-700 font-medium">
                      How can we help? <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(value) =>
                        setValue(
                          'category',
                          value as ContactFormInput['category']
                        )
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        id="category"
                        className={`mt-1.5 ${errors.category ? 'border-red-500' : ''}`}
                        aria-required="true"
                        aria-invalid={errors.category ? 'true' : 'false'}
                        aria-describedby={errors.category ? 'category-error' : undefined}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p id="category-error" className="text-red-500 text-sm mt-1" role="alert">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Trip Interest Dropdown */}
                  <div>
                    <Label htmlFor="tripInterest" className="text-gray-700 font-medium">
                      Trip Interest
                    </Label>
                    <Select
                      value={selectedTripInterest}
                      onValueChange={(value) => setValue('tripInterest', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="tripInterest" className="mt-1.5">
                        <SelectValue placeholder="Select a trip (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {tripInterestOptions.map((option) => (
                          <SelectItem key={option.value || 'empty'} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Timeline Dropdown */}
                  <div>
                    <Label htmlFor="timeline" className="text-gray-700 font-medium">
                      Timeline
                    </Label>
                    <Select
                      value={selectedTimeline}
                      onValueChange={(value) => setValue('timeline', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="timeline" className="mt-1.5">
                        <SelectValue placeholder="Select timeline (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {timelineOptions.map((option) => (
                          <SelectItem key={option.value || 'empty'} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message Field */}
                  <div>
                    <Label
                      htmlFor="message"
                      className="text-gray-700 font-medium"
                    >
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your questions or interests... (minimum 20 characters)"
                      rows={6}
                      aria-required="true"
                      aria-invalid={errors.message ? 'true' : 'false'}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      {...register('message')}
                      className={`mt-1.5 resize-none ${errors.message ? 'border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-red-500 text-sm mt-1" role="alert">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* reCAPTCHA Notice */}
                  <p className="text-xs text-gray-500">
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#003D5C] hover:underline"
                    >
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a
                      href="https://policies.google.com/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#003D5C] hover:underline"
                    >
                      Terms of Service
                    </a>{' '}
                    apply.
                  </p>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#003D5C] hover:bg-[#002B42] text-white font-semibold py-3 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" aria-hidden="true" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Details Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Contact Information
                </h3>

                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-[#003D5C] mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <a
                        href="mailto:hello@pickleballpassport.com"
                        className="text-[#003D5C] hover:underline"
                      >
                        hello@pickleballpassport.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-[#003D5C] mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <a
                        href="tel:+15551234567"
                        className="text-[#003D5C] hover:underline"
                      >
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#003D5C] mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Office Hours
                      </p>
                      <p className="text-gray-600 text-sm">
                        Monday-Friday
                        <br />
                        9am-6pm EST
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#003D5C] mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Location
                      </p>
                      <p className="text-gray-600 text-sm">
                        Chiang Mai, Thailand
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time Card */}
              <div className="bg-gradient-to-br from-[#003D5C] to-[#005A82] text-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-3">Response Time</h3>
                <p className="text-blue-100 text-sm mb-4">
                  We typically respond within 24 hours during business days.
                </p>
                <p className="text-blue-100 text-sm">
                  For urgent inquiries, please call us directly during office
                  hours.
                </p>
              </div>

              {/* FAQ Link Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Quick Answers
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Looking for quick answers? Check our FAQ page for common
                  questions about packages, bookings, and Thailand travel.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-[#003D5C] text-[#003D5C] hover:bg-[#003D5C] hover:text-white"
                  onClick={() => (window.location.href = '/faq')}
                >
                  View FAQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
