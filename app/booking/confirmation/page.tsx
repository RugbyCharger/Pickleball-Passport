/**
 * Booking Confirmation Page (Placeholder)
 *
 * E4-S3: Payment Form UI - Redirect Target
 *
 * This is a placeholder page where users land after successful payment.
 * Full implementation will be done in E3-S10: Booking Confirmation Page.
 *
 * For now, just displays a success message and booking reference.
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Booking Confirmed | Pickleball Passport',
  description: 'Your booking has been confirmed!',
}

interface ConfirmationPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const params = await searchParams
  const bookingRef = params.booking as string | undefined

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 mb-6">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Payment Successful!
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Your booking has been confirmed. We're excited for your Thailand adventure!
          </p>

          {/* Booking Reference */}
          {bookingRef && (
            <div className="mt-8 rounded-xl border border-emerald-200 bg-white p-6">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">
                Booking Reference
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{bookingRef}</p>
            </div>
          )}

          {/* Next Steps */}
          <div className="mt-12 rounded-xl border border-slate-200 bg-white p-8 text-left">
            <h2 className="text-xl font-bold text-slate-900 mb-4">What's Next?</h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">Confirmation Email:</strong> Check your inbox
                  for booking details and next steps
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">Medical Consultation:</strong> We'll reach out
                  within 24 hours to schedule your video consultation
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">Trip Selection:</strong> Choose your preferred
                  trip dates from your dashboard
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">Pre-Trip Info:</strong> Receive detailed
                  itinerary and preparation guide 30 days before departure
                </span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              View Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-8 py-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
