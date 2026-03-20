'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Script from 'next/script';

/**
 * Application Success Page
 *
 * Shown after successful application submission
 * Includes next steps and Calendly scheduling
 */
export default function ApplicationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <Card className="p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Application Received!
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Thank you for applying to The Pickleball Passport. We&apos;ve received your application
            and sent a confirmation email to your inbox.
          </p>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">What&apos;s Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Book a Consultation Call</p>
                  <p className="text-sm text-slate-600">
                    Schedule a quick 15-minute call with our team to discuss your trip, answer questions, and get you booked.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Receive Your Trip Details</p>
                  <p className="text-sm text-slate-600">
                    We&apos;ll follow up with your trip details, itinerary highlights, and next steps for booking.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Confirm Your Booking</p>
                  <p className="text-sm text-slate-600">
                    Review your package, select your dates, and secure your spot with a deposit.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendly Embed */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Schedule a Consultation Call
            </h2>
            <div
              className="calendly-inline-widget"
              data-url="https://calendly.com/jaron-thepickleballpassport/15min"
              style={{ minWidth: '280px', height: '630px' }}
            />
            <Script
              src="https://assets.calendly.com/assets/external/widget.js"
              strategy="lazyOnload"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trips">
              <Button variant="outline" size="lg">
                Explore Trips
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Questions? Email us at{' '}
              <a href="mailto:hello@thepickleballpassport.org" className="text-emerald-600 hover:underline">
                hello@thepickleballpassport.org
              </a>{' '}
              or call{' '}
              <a href="tel:+15125648522" className="text-emerald-600 hover:underline">
                +1 (512) 564-8522
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
