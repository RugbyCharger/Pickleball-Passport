'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Sun,
  Palmtree,
  Waves,
  MessageCircle,
  ArrowRight,
} from 'lucide-react'

export default function ContactError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Contact page error:', error)
  }, [error])

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
        </div>
      </section>

      {/* Error Message & Contact Info */}
      <section className="py-16 px-4 -mt-8 relative z-20">
        <div className="max-w-4xl mx-auto">
          {/* Error Notice */}
          <div className="bg-gradient-to-r from-[#E07A5F]/10 to-[#D4AF37]/10 border-2 border-[#E07A5F]/30 rounded-2xl p-8 mb-10 shadow-lg shadow-[#E07A5F]/10">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-[#E07A5F] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-serif font-bold text-[#003D5C] mb-2">
                  Contact Form Temporarily Unavailable
                </h2>
                <p className="text-[#003D5C]/70 mb-6 leading-relaxed">
                  We&apos;re experiencing a technical issue with our contact form.
                  Please use the contact methods below to reach us directly, or try again.
                </p>
                <Button
                  onClick={reset}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#E5C969] hover:from-[#C19A2E] hover:to-[#D4AF37] text-[#003D5C] font-semibold rounded-xl shadow-lg shadow-[#D4AF37]/20 h-12 px-6"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Email Card */}
            <a
              href="mailto:hello@pickleballpassport.com"
              className="group bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 p-8 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all hover:shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#003D5C] to-[#4AA4B5] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#003D5C]">Email Us</h3>
              </div>
              <p className="text-[#003D5C]/60 mb-6">
                Send us an email and we&apos;ll respond within 24 hours.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[#D4AF37] font-semibold">
                  hello@pickleballpassport.com
                </span>
                <ArrowRight className="w-5 h-5 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Phone Card */}
            <a
              href="tel:+15551234567"
              className="group bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 p-8 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all hover:shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#003D5C] to-[#4AA4B5] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#003D5C]">Call Us</h3>
              </div>
              <p className="text-[#003D5C]/60 mb-6">
                Speak directly with our team during business hours.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[#D4AF37] font-semibold">
                  +1 (555) 123-4567
                </span>
                <ArrowRight className="w-5 h-5 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Hours Card */}
            <div className="bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3] rounded-2xl p-8 border border-[#D4AF37]/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-[#D4AF37] flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#003D5C]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#003D5C]">Office Hours</h3>
              </div>
              <p className="text-[#003D5C] font-medium text-lg">
                Monday - Friday
              </p>
              <p className="text-[#003D5C]/70">
                9:00 AM - 6:00 PM EST
              </p>
            </div>

            {/* Location Card */}
            <div className="bg-gradient-to-br from-[#003D5C] to-[#005580] text-white rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-[#D4AF37] flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-[#003D5C]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold">Location</h3>
                </div>
                <p className="text-white font-medium text-lg">
                  Chiang Mai, Thailand
                </p>
                <p className="text-white/70">
                  Experiences throughout Thailand
                </p>
              </div>
            </div>
          </div>

          {/* Additional Help */}
          <div className="text-center bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 p-8 border border-[#D4AF37]/10">
            <Sun className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-2">
              Looking for Quick Answers?
            </h3>
            <p className="text-[#003D5C]/60 mb-6 max-w-md mx-auto">
              Check our FAQ page for common questions about packages, bookings, and Thailand travel.
            </p>
            <Link href="/faq">
              <Button className="bg-[#003D5C] hover:bg-[#002B42] text-white font-semibold rounded-xl h-12 px-8">
                Visit FAQ Page
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
