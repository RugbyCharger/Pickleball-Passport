'use client'

/**
 * Email Block Palette Component
 * Story 12-8: Email Template Editor
 *
 * Displays available block types that can be added to the email
 */

import {
  Type,
  Image,
  Square,
  Minus,
  MousePointer2,
  LayoutTemplate,
} from 'lucide-react'
import type { EmailBlockType } from '@/lib/email/visual-editor/types'
import {
  BLOCK_TYPE_LABELS,
  BLOCK_TYPE_DESCRIPTIONS,
} from '@/lib/email/visual-editor/types'

interface EmailBlockPaletteProps {
  onAddBlock: (type: EmailBlockType) => void
  disabled?: boolean
}

const BLOCK_ICONS: Record<EmailBlockType, React.ComponentType<{ className?: string }>> = {
  HEADER: LayoutTemplate,
  TEXT: Type,
  IMAGE: Image,
  BUTTON: MousePointer2,
  DIVIDER: Minus,
  FOOTER: Square,
}

export function EmailBlockPalette({ onAddBlock, disabled }: EmailBlockPaletteProps) {
  const blockTypes: EmailBlockType[] = ['HEADER', 'TEXT', 'IMAGE', 'BUTTON', 'DIVIDER', 'FOOTER']

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Add Block</h3>
      <p className="mb-4 text-xs text-slate-500">
        Click to add a block to the end of your email
      </p>
      <div className="grid grid-cols-2 gap-2">
        {blockTypes.map((type) => {
          const Icon = BLOCK_ICONS[type]
          return (
            <button
              key={type}
              type="button"
              onClick={() => onAddBlock(type)}
              disabled={disabled}
              className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center transition-all hover:border-emerald-500 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              title={BLOCK_TYPE_DESCRIPTIONS[type]}
            >
              <Icon className="h-5 w-5 text-slate-600" />
              <span className="text-xs font-medium text-slate-700">
                {BLOCK_TYPE_LABELS[type]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
