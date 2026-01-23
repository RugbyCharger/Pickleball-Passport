'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Phone, Clock, MapPin, AlertTriangle } from 'lucide-react'

export default function ContactError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error for debugging
    console.error('Contact page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#003D5C] to-[#005A82] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-4">
            Have questions? We&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Error Message & Contact Info */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Error Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-amber-800 mb-2">
                  Contact Form Temporarily Unavailable
                </h2>
                <p className="text-amber-700 mb-4">
                  We&apos;re experiencing a technical issue with our contact form.
                  Please use the contact methods below to reach us directly.
                </p>
                <Button
                  onClick={reset}
                  variant="outline"
                  className="border-amber-600 text-amber-700 hover:bg-amber-100"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#003D5C] rounded-full p-3">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Email Us</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Send us an email and we&apos;ll respond within 24 hours.
              </p>
              <a
                href="mailto:hello@pickleballpassport.com"
                className="inline-block bg-[#003D5C] hover:bg-[#002B42] text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                hello@pickleballpassport.com
              </a>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#003D5C] rounded-full p-3">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Call Us</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Speak directly with our team during business hours.
              </p>
              <a
                href="tel:+15551234567"
                className="inline-block bg-[#003D5C] hover:bg-[#002B42] text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                +1 (555) 123-4567
              </a>
            </div>

            {/* Hours Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#003D5C] rounded-full p-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Office Hours</h3>
              </div>
              <p className="text-gray-600">
                Monday - Friday<br />
                9:00 AM - 6:00 PM EST
              </p>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#003D5C] rounded-full p-3">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Location</h3>
              </div>
              <p className="text-gray-600">
                Chiang Mai, Thailand<br />
                (Experiences throughout Thailand)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
