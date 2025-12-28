/**
 * Role-Based Redirect Page
 *
 * After sign-in, users are sent here to be redirected to the appropriate
 * dashboard based on their role in the database.
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export default async function RedirectPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Fetch user from database to get role
  const user = await prisma.user.findUnique({
    where: { id: clerkUser.id },
    select: { role: true },
  })

  // If user doesn't exist in database yet (webhook may not have fired),
  // redirect to onboarding
  if (!user) {
    redirect('/onboarding')
  }

  // Redirect based on role
  switch (user.role) {
    case 'ADMIN':
      redirect('/admin/dashboard')
    case 'PARTNER':
      redirect('/partner/dashboard')
    case 'GUEST':
    default:
      redirect('/dashboard')
  }
}
