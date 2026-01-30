import { appRouter } from './root'
import { createTRPCContext } from './trpc'

export type AppRouterCaller = ReturnType<typeof appRouter.createCaller>

export const createAppCaller = async (headers: Headers) => {
  const ctx = await createTRPCContext({ headers })
  const caller = appRouter.createCaller(ctx)

  return { caller, ctx }
}
