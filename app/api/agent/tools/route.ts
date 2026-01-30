import { NextResponse } from 'next/server'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createAppCaller } from '@/lib/trpc/server/caller'
import { getAgentToolByName, getAgentTools } from '@/lib/agent/tools/registry'

const toolInvocationSchema = z.object({
  name: z.string(),
  input: z.unknown().optional(),
})

export const GET = async (req: Request) => {
  const { ctx } = await createAppCaller(req.headers)

  if (!ctx.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tools = getAgentTools().map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchemaJson,
  }))

  return NextResponse.json({ tools })
}

export const POST = async (req: Request) => {
  const { caller, ctx } = await createAppCaller(req.headers)

  if (!ctx.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: z.infer<typeof toolInvocationSchema>
  try {
    payload = toolInvocationSchema.parse(await req.json())
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body', details: error },
      { status: 400 }
    )
  }

  const tool = getAgentToolByName(payload.name)
  if (!tool) {
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
  }

  try {
    const input = tool.inputSchema.parse(payload.input ?? {})
    const data = await tool.execute({ caller, ctx }, input)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof TRPCError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid tool input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Tool execution failed' },
      { status: 500 }
    )
  }
}
