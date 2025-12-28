/**
 * Booking Configurator - Add-Ons Selection (Step 4)
 *
 * Placeholder for E3-S4/E3-S5: Add-Ons stories (Future Sprint)
 *
 * Will allow users to customize their package with:
 * - Medical procedures (dental, aesthetic, wellness)
 * - Excursions and activities
 * - Pickleball training upgrades
 * - Spa and wellness add-ons
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Add-Ons & Customization | Pickleball Passport',
  description: 'Customize your package with additional medical procedures and experiences.',
}

export default async function AddOnsSelectionPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/booking/configure/add-ons')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              4
            </span>
            Step 4 of 5
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Add-Ons & Customization
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Coming Soon: E3-S4 & E3-S5
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Add-Ons Selection Coming Soon
            </h2>
            <p className="text-slate-600 mb-8">
              This step will allow you to customize your package with:
            </p>
            <div className="grid gap-4 sm:grid-cols-2 text-left mb-8">
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Medical Procedures
                </h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Dental treatments</li>
                  <li>• Aesthetic procedures</li>
                  <li>• Wellness therapies</li>
                </ul>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Experiences
                </h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Island excursions</li>
                  <li>• Cultural tours</li>
                  <li>• Adventure activities</li>
                </ul>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Pickleball Training
                </h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Private coaching</li>
                  <li>• Group clinics</li>
                  <li>• Tournament entry</li>
                </ul>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Spa & Wellness
                </h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Thai massage packages</li>
                  <li>• Spa treatments</li>
                  <li>• Wellness programs</li>
                </ul>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <Link
                href="/booking/configure/accommodation"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                ← Back to Accommodation
              </Link>
              <Link
                href="/booking/configure"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                Back to Package Selection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
