/**
 * Booking Configurator - Duration Selection (Step 2)
 *
 * Placeholder for E3-S2: Duration Selection story (Sprint 4)
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Select Duration | Pickleball Passport',
  description: 'Choose the duration of your transformation journey.',
}

export default async function DurationSelectionPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/booking/configure/duration')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              2
            </span>
            Step 2 of 5
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Duration Selection
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Coming in E3-S2 (Sprint 4)
          </p>
          <div className="mt-8">
            <Link
              href="/booking/configure"
              className="text-emerald-600 hover:text-emerald-700"
            >
              ← Back to Package Selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
