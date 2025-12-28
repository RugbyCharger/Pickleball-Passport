'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

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
            Application Received! 🎉
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Thank you for applying to Pickleball Passport. We've received your application
            and sent a confirmation email to your inbox.
          </p>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Schedule Your Video Consultation</p>
                  <p className="text-sm text-slate-600">
                    Book a 30-minute call with our team to discuss your transformation goals and answer any questions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Receive Your Custom Package Recommendation</p>
                  <p className="text-sm text-slate-600">
                    We'll create a personalized itinerary based on your interests and goals.
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

          {/* Calendly Embed Placeholder */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 mb-8">
            <p className="text-slate-600 mb-4">
              📅 <strong>Schedule your consultation below</strong>
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Calendly widget will be embedded here in production
            </p>
            <div className="text-xs text-slate-400">
              Integration: Add Calendly script to enable inline scheduling
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/packages">
              <Button variant="outline" size="lg">
                Explore Packages
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
              <a href="mailto:hello@pickleballpassport.com" className="text-emerald-600 hover:underline">
                hello@pickleballpassport.com
              </a>{' '}
              or call{' '}
              <a href="tel:+16192555555" className="text-emerald-600 hover:underline">
                +1 (619) 255-5555
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
