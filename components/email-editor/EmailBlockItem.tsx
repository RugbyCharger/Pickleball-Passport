'use client'

/**
 * Email Block Item Component
 * Story 12-8: Email Template Editor
 *
 * Renders a single email block with drag handle and controls
 */

import { useState } from 'react'
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { EmailBlock } from '@/lib/email/visual-editor/types'
import { BLOCK_TYPE_LABELS } from '@/lib/email/visual-editor/types'
import { EmailBlockEditor } from './EmailBlockEditor'

interface EmailBlockItemProps {
  block: EmailBlock
  index: number
  totalBlocks: number
  isSelected: boolean
  onSelect: () => void
  onUpdate: (block: EmailBlock) => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function EmailBlockItem({
  block,
  index,
  totalBlocks,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: EmailBlockItemProps) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div
      className={`relative rounded-lg border transition-all ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-200'
          : 'border-slate-200 hover:border-slate-300'
      }`}
      onClick={onSelect}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 cursor-grab text-slate-400" />
          <span className="text-sm font-medium text-slate-700">
            {BLOCK_TYPE_LABELS[block.type]}
          </span>
          <span className="text-xs text-slate-400">#{index + 1}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp()
            }}
            disabled={index === 0}
            className="h-7 w-7 p-0"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown()
            }}
            disabled={index === totalBlocks - 1}
            className="h-7 w-7 p-0"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setShowSettings(!showSettings)
            }}
            className={`h-7 w-7 p-0 ${showSettings ? 'bg-slate-200' : ''}`}
            title="Block settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            className="h-7 w-7 p-0"
            title="Duplicate block"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
            title="Delete block"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Block Editor */}
      <div className="p-4">
        <EmailBlockEditor
          block={block}
          onUpdate={onUpdate}
          showSettings={showSettings}
        />
      </div>
    </div>
  )
}
