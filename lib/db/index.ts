/**
 * Prisma Client Instance
 *
 * This file creates a singleton instance of the Prisma client to avoid
 * creating multiple instances during development (hot reload).
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // Soft-delete middleware: automatically filter out soft-deleted bookings
  // on findMany, findFirst, findUnique, and count operations.
  // To include deleted bookings, pass `where: { deletedAt: { not: null } }` explicitly.
  client.$use(async (params, next) => {
    if (params.model === 'Booking') {
      // For read operations, auto-filter soft-deleted records
      if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'count') {
        if (!params.args) params.args = {}
        if (!params.args.where) params.args.where = {}

        // Only add filter if deletedAt is not already specified in the query
        if (params.args.where.deletedAt === undefined) {
          params.args.where.deletedAt = null
        }
      }

      if (params.action === 'findUnique' || params.action === 'findUniqueOrThrow') {
        // findUnique doesn't support arbitrary where clauses, so change to findFirst
        if (params.args?.where?.deletedAt === undefined) {
          params.action = 'findFirst'
          params.args.where = { ...params.args.where, deletedAt: null }
        }
      }
    }

    return next(params)
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
