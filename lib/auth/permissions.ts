/**
 * Permission and Role Utilities
 *
 * Centralized functions for checking user permissions and roles.
 * Used by middleware, tRPC procedures, and server components.
 */

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

/**
 * Get the current user's role from the database
 * Returns null if user is not authenticated or not in database
 */
export async function getUserRole(userId: string): Promise<Role | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * Check if the current user has admin role
 * Throws error if not authenticated or not an admin
 */
export async function requireAdmin(): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized: No user authenticated');
  }

  const role = await getUserRole(userId);

  if (role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }
}

/**
 * Check if the current user is an admin
 * Returns boolean without throwing
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'ADMIN';
}

/**
 * Check if the current user is a partner or admin
 * Returns boolean without throwing
 */
export async function isPartnerOrAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'PARTNER' || role === 'ADMIN';
}

/**
 * Check if the current user has any of the specified roles
 */
export async function hasRole(userId: string, allowedRoles: Role[]): Promise<boolean> {
  const role = await getUserRole(userId);
  return role !== null && allowedRoles.includes(role);
}
