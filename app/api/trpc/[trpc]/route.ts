/**
 * tRPC API Route Handler
 *
 * This is the Next.js App Router handler for tRPC requests.
 * All tRPC requests are routed through /api/trpc/*
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/lib/trpc/server/root'
import { createTRPCContext } from '@/lib/trpc/server/trpc'
import { apiLogger } from '@/lib/logger'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            apiLogger.error(
              { err: error, path: path ?? '<no-path>' },
              'tRPC handler error'
            )
          }
        : undefined,
  })

export { handler as GET, handler as POST }
