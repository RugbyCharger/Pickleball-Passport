/**
 * Admin Task Management Page
 *
 * Admin interface for creating and managing guest tasks
 * Features:
 * - Create tasks and assign to bookings/users
 * - Set priority levels (URGENT/IMPORTANT/NORMAL)
 * - Filter by priority, status, booking
 * - Update and delete tasks
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AdminTasksClient } from './admin-tasks-client'

export default async function AdminTasksPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Verify admin role
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (dbUser?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Fetch all bookings for the task assignment dropdown
  const bookings = await prisma.booking.findMany({
    where: {
      status: {
        in: ['PENDING_PAYMENT', 'CONFIRMED'],
      },
    },
    select: {
      id: true,
      bookingReference: true,
      user: {
        select: {
          id: true,
          email: true,
          guestProfile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Task Management</h1>
        <p className="text-muted-foreground">
          Create and manage tasks for guests
        </p>
      </div>

      <AdminTasksClient bookings={bookings} />
    </div>
  )
}
