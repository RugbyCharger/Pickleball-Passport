import type { z } from 'zod'
import type { AppRouterCaller } from '@/lib/trpc/server/caller'
import type { Context } from '@/lib/trpc/server/trpc'

export type AgentToolContext = {
  caller: AppRouterCaller
  ctx: Context
}

export type AgentTool<Input> = {
  name: string
  description: string
  inputSchema: z.ZodType<Input>
  inputSchemaJson: Record<string, unknown>
  execute: (ctx: AgentToolContext, input: Input) => Promise<unknown>
}
