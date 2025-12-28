/**
 * tRPC Server Configuration
 *
 * This file sets up the tRPC context, middleware, and procedure builders.
 * - Context includes the authenticated Clerk user and Prisma database client
 * - Procedures can be public or protected (requiring authentication)
 */

import { initTRPC, TRPCError } from '@trpc/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import superjson from 'superjson'

/**
 * Create tRPC context
 * This runs for every request and provides the user and database client
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const user = await currentUser()

  return {
    user,
    db: prisma,
    headers: opts.headers,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

/**
 * Initialize tRPC with context type
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

/**
 * Reusable router and procedure builders
 */
export const router = t.router
export const publicProcedure = t.procedure

/**
 * Protected procedure - requires authentication
 * Throws UNAUTHORIZED error if user is not authenticated
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now TypeScript knows user is defined
    },
  })
})

/**
 * Role-based procedures for access control
 * These will be implemented after the User role is synced from Clerk
 */
export const enforceRole = (allowedRoles: string[]) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    // Fetch user from database to check role
    const dbUser = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: { role: true },
    })

    if (!dbUser || !allowedRoles.includes(dbUser.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource'
      })
    }

    return next({
      ctx: {
        ...ctx,
        role: dbUser.role,
      },
    })
  })

// Role-specific procedures
export const guestProcedure = t.procedure.use(enforceRole(['GUEST', 'PARTNER', 'ADMIN']))
export const partnerProcedure = t.procedure.use(enforceRole(['PARTNER', 'ADMIN']))
export const adminProcedure = t.procedure.use(enforceRole(['ADMIN']))
