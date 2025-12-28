/**
 * Booking Confirmation Page
 *
 * E3-S10: Booking Confirmation Page (3 pts)
 *
 * Full confirmation page displayed after successful payment.
 * Shows complete booking details, triggers confirmation email,
 * and provides next steps with dashboard link.
 *
 * Features:
 * - Complete booking summary with all details
 * - Payment confirmation
 * - Formatted pricing breakdown
 * - Add-ons display
 * - Trip dates (if selected)
 * - Next steps checklist
 * - Dashboard and home navigation
 * - Email confirmation trigger
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import {
  CheckCircle2,
  ArrowRight,
  Calendar,
  MapPin,
  CreditCard,
  Mail,
  FileText,
  Home as HomeIcon,
} from 'lucide-react'
import Link from 'next/link'
import { BookingConfirmationClient } from './confirmation-client'

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

  if (!bookingRef) {
    // No booking reference - redirect to dashboard
    redirect('/dashboard')
  }

  return <BookingConfirmationClient bookingReference={bookingRef} />
}
