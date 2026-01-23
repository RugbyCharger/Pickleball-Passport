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
  MessageCircle,
  Sparkles,
  Sun,
  Palmtree,
  Waves,
} from 'lucide-react'

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/

const categoryOptions = [
  { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
  { value: 'BOOKING_QUESTION', label: 'Booking Question' },
  { value: 'MEDICAL_WELLNESS_QUESTION', label: 'Medical/Wellness Question' },
  { value: 'PAYMENT_ISSUE', label: 'Payment Issue' },
  { value: 'PARTNERSHIP_INQUIRY', label: 'Partnership Inquiry' },
  { value: 'OTHER', label: 'Other' },
] as const

const tripInterestOptions = [
  { value: '', label: 'Select a trip (optional)' },
  { value: 'Singles Retreat', label: 'Singles Retreat' },
  { value: 'Couples Getaway', label: 'Couples Getaway' },
  { value: 'Group Adventure', label: 'Group Adventure' },
  { value: 'Corporate Event', label: 'Corporate Event' },
  { value: 'Custom Trip', label: 'Custom Trip' },
  { value: 'Not Sure Yet', label: 'Not Sure Yet' },
] as const

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
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] via-white to-[#F5E6D3]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#003D5C] via-[#005580] to-[#4AA4B5] text-white py-20 px-4">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-10">
          <Palmtree className="w-32 h-32" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10">
          <Waves className="w-40 h-40" />
        </div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#4AA4B5]/20 rounded-full blur-2xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4" />
            We&apos;d Love to Hear From You
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-2xl mx-auto">
            Have questions about your transformation journey? Our team is here to help.
          </p>
          <div className="flex items-center justify-center gap-2 text-[#D4AF37]">
            <Sun className="w-5 h-5" />
            <span className="text-sm font-medium">Typically respond within 24 hours</span>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 px-4 -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 p-8 md:p-10 border border-[#D4AF37]/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#E5C969] flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-[#003D5C]">
                    Send Us a Message
                  </h2>
                </div>
                <p className="text-[#003D5C]/60 mb-8 ml-13">
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </p>

                {isSubmitted && referenceNumber && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-[#2D5A3D]/10 to-[#3D7A52]/10 border border-[#2D5A3D]/20 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#2D5A3D] flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[#2D5A3D] font-semibold text-lg mb-1">
                          Message sent successfully!
                        </p>
                        <p className="text-[#2D5A3D]/70 text-sm mb-4">
                          We&apos;ve received your message and will respond within 24 hours.
                        </p>
                        <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-[#2D5A3D]/20">
                          <span className="text-[#003D5C] text-sm font-medium">
                            Reference:
                          </span>
                          <code className="text-[#2D5A3D] font-mono font-bold text-lg">
                            {referenceNumber}
                          </code>
                          <button
                            type="button"
                            onClick={copyReferenceNumber}
                            className="ml-auto text-[#2D5A3D] hover:text-[#003D5C] p-2 hover:bg-[#2D5A3D]/10 rounded-lg transition-colors"
                            aria-label="Copy reference number"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-[#2D5A3D]/60 text-xs mt-2">
                          Save this reference number to check on your ticket status.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Honeypot field */}
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

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-[#003D5C] font-medium mb-2 block">
                        Name <span className="text-[#E07A5F]">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        aria-required="true"
                        aria-invalid={errors.name ? 'true' : 'false'}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        {...register('name')}
                        className={`h-12 rounded-xl border-2 bg-[#FDF8F3]/50 focus:bg-white transition-colors ${
                          errors.name
                            ? 'border-[#E07A5F] focus:border-[#E07A5F] focus:ring-[#E07A5F]/20'
                            : 'border-[#003D5C]/10 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p id="name-error" className="text-[#E07A5F] text-sm mt-2" role="alert">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-[#003D5C] font-medium mb-2 block">
                        Email <span className="text-[#E07A5F]">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        aria-required="true"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        {...register('email')}
                        className={`h-12 rounded-xl border-2 bg-[#FDF8F3]/50 focus:bg-white transition-colors ${
                          errors.email
                            ? 'border-[#E07A5F] focus:border-[#E07A5F] focus:ring-[#E07A5F]/20'
                            : 'border-[#003D5C]/10 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-[#E07A5F] text-sm mt-2" role="alert">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone & Category Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-[#003D5C] font-medium mb-2 block">
                        Phone <span className="text-[#003D5C]/40">(optional)</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        aria-invalid={errors.phone ? 'true' : 'false'}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                        {...register('phone')}
                        className={`h-12 rounded-xl border-2 bg-[#FDF8F3]/50 focus:bg-white transition-colors ${
                          errors.phone
                            ? 'border-[#E07A5F] focus:border-[#E07A5F] focus:ring-[#E07A5F]/20'
                            : 'border-[#003D5C]/10 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.phone && (
                        <p id="phone-error" className="text-[#E07A5F] text-sm mt-2" role="alert">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-[#003D5C] font-medium mb-2 block">
                        How can we help? <span className="text-[#E07A5F]">*</span>
                      </Label>
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) =>
                          setValue('category', value as ContactFormInput['category'])
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          id="category"
                          className={`h-12 rounded-xl border-2 bg-[#FDF8F3]/50 focus:bg-white transition-colors ${
                            errors.category
                              ? 'border-[#E07A5F]'
                              : 'border-[#003D5C]/10 focus:border-[#D4AF37]'
                          }`}
                        >
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#D4AF37]/20">
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p id="category-error" className="text-[#E07A5F] text-sm mt-2" role="alert">
                          {errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Trip Interest & Timeline Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="tripInterest" className="text-[#003D5C] font-medium mb-2 block">
                        Trip Interest <span className="text-[#003D5C]/40">(optional)</span>
                      </Label>
                      <Select
                        value={selectedTripInterest}
                        onValueChange={(value) => setValue('tripInterest', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          id="tripInterest"
                          className="h-12 rounded-xl border-2 border-[#003D5C]/10 bg-[#FDF8F3]/50 focus:bg-white focus:border-[#D4AF37] transition-colors"
                        >
                          <SelectValue placeholder="Select a trip (optional)" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#D4AF37]/20">
                          {tripInterestOptions.map((option) => (
                            <SelectItem key={option.value || 'empty'} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="timeline" className="text-[#003D5C] font-medium mb-2 block">
                        Timeline <span className="text-[#003D5C]/40">(optional)</span>
                      </Label>
                      <Select
                        value={selectedTimeline}
                        onValueChange={(value) => setValue('timeline', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          id="timeline"
                          className="h-12 rounded-xl border-2 border-[#003D5C]/10 bg-[#FDF8F3]/50 focus:bg-white focus:border-[#D4AF37] transition-colors"
                        >
                          <SelectValue placeholder="Select timeline (optional)" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#D4AF37]/20">
                          {timelineOptions.map((option) => (
                            <SelectItem key={option.value || 'empty'} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <Label htmlFor="message" className="text-[#003D5C] font-medium mb-2 block">
                      Message <span className="text-[#E07A5F]">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your questions or interests... (minimum 20 characters)"
                      rows={6}
                      aria-required="true"
                      aria-invalid={errors.message ? 'true' : 'false'}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      {...register('message')}
                      className={`rounded-xl border-2 bg-[#FDF8F3]/50 focus:bg-white transition-colors resize-none ${
                        errors.message
                          ? 'border-[#E07A5F] focus:border-[#E07A5F] focus:ring-[#E07A5F]/20'
                          : 'border-[#003D5C]/10 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-[#E07A5F] text-sm mt-2" role="alert">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* reCAPTCHA Notice */}
                  <p className="text-xs text-[#003D5C]/50">
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#003D5C] hover:text-[#D4AF37] underline"
                    >
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a
                      href="https://policies.google.com/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#003D5C] hover:text-[#D4AF37] underline"
                    >
                      Terms of Service
                    </a>{' '}
                    apply.
                  </p>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] hover:from-[#C19A2E] hover:to-[#D4AF37] text-[#003D5C] font-bold text-lg rounded-xl shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl hover:shadow-[#D4AF37]/40 transition-all flex items-center justify-center gap-3"
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
                        <Sparkles className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Details Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 p-8 border border-[#D4AF37]/10">
                <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#003D5C] flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  Contact Information
                </h3>

                <div className="space-y-5">
                  <a
                    href="mailto:hello@pickleballpassport.com"
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#F5E6D3]/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#E5C969]/20 flex items-center justify-center flex-shrink-0 group-hover:from-[#D4AF37]/30 group-hover:to-[#E5C969]/30 transition-colors">
                      <Mail className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#003D5C]/60 mb-1">Email</p>
                      <p className="text-[#003D5C] font-medium group-hover:text-[#D4AF37] transition-colors">
                        hello@pickleballpassport.com
                      </p>
                    </div>
                  </a>

                  <a
                    href="tel:+15551234567"
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#F5E6D3]/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#E5C969]/20 flex items-center justify-center flex-shrink-0 group-hover:from-[#D4AF37]/30 group-hover:to-[#E5C969]/30 transition-colors">
                      <Phone className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#003D5C]/60 mb-1">Phone</p>
                      <p className="text-[#003D5C] font-medium group-hover:text-[#D4AF37] transition-colors">
                        +1 (555) 123-4567
                      </p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 p-4 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#E5C969]/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#003D5C]/60 mb-1">Office Hours</p>
                      <p className="text-[#003D5C] font-medium">Monday - Friday</p>
                      <p className="text-[#003D5C]/70 text-sm">9am - 6pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#E5C969]/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#003D5C]/60 mb-1">Location</p>
                      <p className="text-[#003D5C] font-medium">Chiang Mai, Thailand</p>
                      <p className="text-[#003D5C]/70 text-sm">Experiences throughout Thailand</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time Card */}
              <div className="bg-gradient-to-br from-[#003D5C] to-[#005580] text-white rounded-2xl shadow-xl shadow-[#003D5C]/20 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center mb-4">
                    <Sun className="w-6 h-6 text-[#003D5C]" />
                  </div>
                  <h3 className="text-lg font-serif font-bold mb-3">Response Time</h3>
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">
                    We typically respond within 24 hours during business days.
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    For urgent inquiries, please call us directly during office hours.
                  </p>
                </div>
              </div>

              {/* FAQ Link Card */}
              <div className="bg-gradient-to-r from-[#F5E6D3] to-[#FDF8F3] rounded-2xl p-8 border border-[#D4AF37]/20">
                <h3 className="text-lg font-serif font-bold text-[#003D5C] mb-3">
                  Quick Answers
                </h3>
                <p className="text-[#003D5C]/70 text-sm mb-6 leading-relaxed">
                  Looking for quick answers? Check our FAQ page for common questions about packages, bookings, and Thailand travel.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-2 border-[#003D5C] text-[#003D5C] hover:bg-[#003D5C] hover:text-white font-semibold rounded-xl h-12 transition-all"
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
