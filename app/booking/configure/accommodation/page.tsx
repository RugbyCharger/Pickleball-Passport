/**
 * Booking Configurator - Accommodation Tier Selection (Step 3)
 *
 * Placeholder for E3-S3: Accommodation Tier story (Sprint 4)
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Select Accommodation | Pickleball Passport',
  description: 'Choose your luxury accommodation tier.',
}

export default async function AccommodationSelectionPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/booking/configure/accommodation')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              3
            </span>
            Step 3 of 5
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Accommodation Tier Selection
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Coming in E3-S3 (Sprint 4)
          </p>
          <div className="mt-8">
            <Link
              href="/booking/configure/duration"
              className="text-emerald-600 hover:text-emerald-700"
            >
              ← Back to Duration Selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
