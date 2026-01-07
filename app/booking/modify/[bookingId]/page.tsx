/**
 * Booking Modification Entry Route (E3-S16)
 *
 * Loads existing booking data and initializes modification mode.
 * Redirects to add-on selection page with locked package/duration/accommodation.
 *
 * Flow:
 * 1. Fetch booking with all details
 * 2. Initialize booking store in modification mode
 * 3. Pre-populate add-on selections
 * 4. Redirect to add-ons selection page
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import ModificationLoader from '@/components/booking/modification-loader'

export const metadata: Metadata = {
  title: 'Modify Booking | Pickleball Passport',
  description: 'Modify your booking add-ons and preferences.',
}

interface ModificationEntryPageProps {
  params: {
    bookingId: string
  }
}

export default async function ModificationEntryPage({
  params,
}: ModificationEntryPageProps) {
  // Protected route - require authentication
  const user = await currentUser()

  if (!user) {
    redirect(`/sign-in?redirect_url=/booking/modify/${params.bookingId}`)
  }

  // Render client component that will:
  // 1. Fetch booking data with tRPC
  // 2. Initialize modification mode
  // 3. Redirect to add-ons page
  return <ModificationLoader bookingId={params.bookingId} />
}
