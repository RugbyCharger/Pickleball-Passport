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
  Mail,
  Phone,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  MapPin,
} from 'lucide-react'

const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be 2000 characters or less'),
})

type ContactFormInput = z.infer<typeof contactFormSchema>

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { executeRecaptcha } = useGoogleReCaptcha()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
  })

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully! We'll respond within 24 hours.")
      setIsSubmitted(true)
      reset()

      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
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

                {isSubmitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-green-800 font-medium">
                        Message sent successfully!
                      </p>
                      <p className="text-green-700 text-sm mt-1">
                        We&apos;ve received your message and will respond within 24
                        hours.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      {...register('name')}
                      className={`mt-1.5 ${errors.name ? 'border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
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
                      {...register('email')}
                      className={`mt-1.5 ${errors.email ? 'border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
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
                      {...register('phone')}
                      className="mt-1.5"
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
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
                      placeholder="Tell us about your questions or interests..."
                      rows={6}
                      {...register('message')}
                      className={`mt-1.5 resize-none ${errors.message ? 'border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">
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
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
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
                    <Mail className="h-5 w-5 text-[#003D5C] mt-0.5 flex-shrink-0" />
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
                    <Phone className="h-5 w-5 text-[#003D5C] mt-0.5 flex-shrink-0" />
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
                    <Clock className="h-5 w-5 text-[#003D5C] mt-0.5 flex-shrink-0" />
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
                    <MapPin className="h-5 w-5 text-[#003D5C] mt-0.5 flex-shrink-0" />
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
