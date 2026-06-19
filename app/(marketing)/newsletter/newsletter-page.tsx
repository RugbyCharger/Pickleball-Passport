'use client';

import Image from 'next/image';
import Script from 'next/script';
import { Sun, Calendar, Sparkles, Globe, Mail } from 'lucide-react';

const benefits = [
  {
    icon: Calendar,
    title: 'New Trip Announcements',
    description: 'Be the first to know when new departures and destinations open.',
  },
  {
    icon: Sparkles,
    title: 'Exclusive Offers',
    description: 'Early-access pricing and subscriber-only discounts on upcoming trips.',
  },
  {
    icon: Globe,
    title: 'Travel Insights',
    description: 'Tips on playing pickleball abroad, packing lists, and destination guides.',
  },
  {
    icon: Mail,
    title: 'Community Updates',
    description: 'Stories from the road, partner news, and what the Pickleball Passport crew is up to.',
  },
];

export function NewsletterPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F3]">

      {/* Hero */}
      <section className="relative overflow-hidden text-white py-20 sm:py-28">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/bangkok-skyline.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src="/tpp-aerial-0450.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
            <Sun className="w-4 h-4 text-[#B08D55]" />
            The Pickleball Passport Newsletter
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4">
            Stay in the Loop
          </h1>
          <p className="text-xl sm:text-2xl text-white/80">
            Trip updates, new destinations, and stories from the road. Delivered to your inbox.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              fill="#FDF8F3"
            />
          </svg>
        </div>
      </section>

      {/* GHL Form */}
      <section className="py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 border border-[#B08D55]/10 overflow-hidden">
            <iframe
              src="https://api.leadconnectorhq.com/widget/form/vkJ4qmu5BNpd2FgpGy0O"
              style={{ width: '100%', height: '100%', border: 'none', minHeight: '480px' }}
              id="inline-vkJ4qmu5BNpd2FgpGy0O"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Newsletter Signup"
              data-height="480"
              data-layout-iframe-id="inline-vkJ4qmu5BNpd2FgpGy0O"
              data-form-id="vkJ4qmu5BNpd2FgpGy0O"
              title="Newsletter Signup"
            />
          </div>
        </div>
      </section>

      <Script
        src="https://link.msgsndr.com/js/form_embed.js"
        strategy="lazyOnload"
      />

      {/* What you'll get */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] text-center mb-10">
            What You&apos;ll Receive
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-4 p-6 rounded-2xl bg-[#FDF8F3] border border-[#B08D55]/10"
              >
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#1D2D44] flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-[#B08D55]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1D2D44] mb-1">{benefit.title}</h3>
                  <p className="text-sm text-[#1D2D44]/70 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
