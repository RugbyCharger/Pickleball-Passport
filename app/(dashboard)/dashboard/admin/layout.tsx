export const dynamic = 'force-dynamic';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

/**
 * Admin Layout - Server-side role verification
 *
 * This layout ensures only ADMIN users can access /dashboard/admin/* routes.
 * It checks the database role directly, which is more reliable than
 * depending on Clerk session claims configuration.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Not authenticated (shouldn't happen - middleware handles this)
  if (!userId) {
    redirect('/sign-in');
  }

  // Check database role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // Not admin -> redirect to regular dashboard
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Admin user -> render children
  return <>{children}</>;
}
