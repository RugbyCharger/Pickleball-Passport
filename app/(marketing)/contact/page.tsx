'use client'

import { Button } from '@/components/ui/button'
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  MessageCircle,
  Sun,
  Palmtree,
  Waves,
} from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] via-white to-[#F5E6D3]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] text-white py-20 px-4">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-10">
          <Palmtree className="w-32 h-32" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10">
          <Waves className="w-40 h-40" />
        </div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#B08D55]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#7587A5]/20 rounded-full blur-2xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4" />
            We&apos;d Love to Hear From You
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-2xl mx-auto">
            Have questions about our trips? Our team is here to help.
          </p>
          <div className="flex items-center justify-center gap-2 text-[#B08D55]">
            <Sun className="w-5 h-5" />
            <span className="text-sm font-medium">Typically respond within 24 hours</span>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 px-4 -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* GHL Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10">
                <iframe
                  src="https://api.leadconnectorhq.com/widget/form/DOYQ7o4C8pR6V0hSLxcm"
                  style={{ width: '100%', border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  id="inline-DOYQ7o4C8pR6V0hSLxcm"
                  data-layout="{'id':'INLINE'}"
                  data-trigger-type="alwaysShow"
                  data-trigger-value=""
                  data-activation-type="alwaysActivated"
                  data-activation-value=""
                  data-deactivation-type="neverDeactivate"
                  data-deactivation-value=""
                  data-form-name="Contact Us"
                  data-height="700"
                  data-layout-iframe-id="inline-DOYQ7o4C8pR6V0hSLxcm"
                  data-form-id="DOYQ7o4C8pR6V0hSLxcm"
                  title="Contact Us"
                  className="min-h-[700px]"
                />
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Details Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 p-8 border border-[#B08D55]/10">
                <h3 className="text-xl font-serif font-bold text-[#1D2D44] mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1D2D44] flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  Contact Information
                </h3>

                <div className="space-y-5">
                  <a
                    href="mailto:hello@thepickleballpassport.org"
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#F5E6D3]/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B08D55]/20 to-[#CFB78D]/20 flex items-center justify-center flex-shrink-0 group-hover:from-[#B08D55]/30 group-hover:to-[#CFB78D]/30 transition-colors">
                      <Mail className="h-5 w-5 text-[#B08D55]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1D2D44]/60 mb-1">Email</p>
                      <p className="text-[#1D2D44] font-medium group-hover:text-[#B08D55] transition-colors">
                        hello@thepickleballpassport.org
                      </p>
                    </div>
                  </a>

                  <a
                    href="tel:+15125648522"
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#F5E6D3]/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B08D55]/20 to-[#CFB78D]/20 flex items-center justify-center flex-shrink-0 group-hover:from-[#B08D55]/30 group-hover:to-[#CFB78D]/30 transition-colors">
                      <Phone className="h-5 w-5 text-[#B08D55]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1D2D44]/60 mb-1">Phone</p>
                      <p className="text-[#1D2D44] font-medium group-hover:text-[#B08D55] transition-colors">
                        +1 512-564-8522
                      </p>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/66991433298"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#F5E6D3]/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B08D55]/20 to-[#CFB78D]/20 flex items-center justify-center flex-shrink-0 group-hover:from-[#B08D55]/30 group-hover:to-[#CFB78D]/30 transition-colors">
                      <svg className="h-5 w-5 text-[#B08D55]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1D2D44]/60 mb-1">WhatsApp</p>
                      <p className="text-[#1D2D44] font-medium group-hover:text-[#B08D55] transition-colors">
                        +66 99-143-3298
                      </p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 p-4 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B08D55]/20 to-[#CFB78D]/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-[#B08D55]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1D2D44]/60 mb-1">Office Hours</p>
                      <p className="text-[#1D2D44] font-medium">Monday - Friday</p>
                      <p className="text-[#1D2D44]/70 text-sm">9:00 AM - 6:00 PM ICT (GMT+7)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B08D55]/20 to-[#CFB78D]/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-[#B08D55]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1D2D44]/60 mb-1">Location</p>
                      <p className="text-[#1D2D44] font-medium">Bangkok, Thailand</p>
                      <p className="text-[#1D2D44]/70 text-sm">Experiences throughout Thailand</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time Card */}
              <div className="bg-gradient-to-br from-[#1D2D44] to-[#495F87] text-white rounded-2xl shadow-xl shadow-[#1D2D44]/20 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#B08D55]/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#B08D55] flex items-center justify-center mb-4">
                    <Sun className="w-6 h-6 text-[#1D2D44]" />
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
              <div className="bg-gradient-to-r from-[#F5E6D3] to-[#FDF8F3] rounded-2xl p-8 border border-[#B08D55]/20">
                <h3 className="text-lg font-serif font-bold text-[#1D2D44] mb-3">
                  Quick Answers
                </h3>
                <p className="text-[#1D2D44]/70 text-sm mb-6 leading-relaxed">
                  Looking for quick answers? Check our FAQ page for common questions about packages, bookings, and Thailand travel.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-2 border-[#1D2D44] text-[#1D2D44] hover:bg-[#1D2D44] hover:text-white font-semibold rounded-xl h-12 transition-all"
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
