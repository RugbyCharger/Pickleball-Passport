/**
 * Booking Route Layout
 *
 * Covers all booking-related routes:
 * - /booking/configure/*
 * - /booking/confirmation/*
 * - /booking/modify/*
 * - /booking/payment/*
 * - /booking/review/*
 *
 * Prevents static generation since these routes use Clerk for auth
 */

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
