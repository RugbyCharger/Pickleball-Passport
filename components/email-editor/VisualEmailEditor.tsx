'use client'

/**
 * Visual Email Editor Component
 * Story 12-8: Email Template Editor
 *
 * Main component for visual drag-and-drop email editing
 */

import { useState, useCallback, useEffect } from 'react'
import {
  Eye,
  Code,
  Smartphone,
  Monitor,
  RefreshCw,
  Settings2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmailBlockPalette } from './EmailBlockPalette'
import { EmailBlockItem } from './EmailBlockItem'
import type { EmailBlock, EmailBlockType, EmailVisualContent } from '@/lib/email/visual-editor/types'
import { DEFAULT_BLOCK_SETTINGS } from '@/lib/email/visual-editor/types'
import {
  blocksToHtml,
  blocksToPlainText,
  createDefaultVisualContent,
  generateBlockId,
} from '@/lib/email/visual-editor/block-renderer'

interface VisualEmailEditorProps {
  initialContent?: EmailVisualContent
  onContentChange: (content: EmailVisualContent) => void
  onHtmlGenerated: (html: string, plainText: string) => void
  previewHtml?: string
  isGeneratingPreview?: boolean
}

export function VisualEmailEditor({
  initialContent,
  onContentChange,
  onHtmlGenerated,
  previewHtml,
  isGeneratingPreview,
}: VisualEmailEditorProps) {
  const [content, setContent] = useState<EmailVisualContent>(
    initialContent || createDefaultVisualContent()
  )
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [showGlobalSettings, setShowGlobalSettings] = useState(false)

  // Update parent when content changes
  useEffect(() => {
    onContentChange(content)
    // Generate HTML from blocks
    const html = blocksToHtml(content)
    const plainText = blocksToPlainText(content)
    onHtmlGenerated(html, plainText)
  }, [content, onContentChange, onHtmlGenerated])

  // Add a new block
  const handleAddBlock = useCallback((type: EmailBlockType) => {
    const newBlock = createBlock(type, content.blocks.length)
    setContent((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }))
    setSelectedBlockId(newBlock.id)
  }, [content.blocks.length])

  // Update a block
  const handleUpdateBlock = useCallback((updatedBlock: EmailBlock) => {
    setContent((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
    }))
  }, [])

  // Delete a block
  const handleDeleteBlock = useCallback((id: string) => {
    setContent((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i })),
    }))
    setSelectedBlockId(null)
  }, [])

  // Duplicate a block
  const handleDuplicateBlock = useCallback((id: string) => {
    const blockIndex = content.blocks.findIndex((b) => b.id === id)
    if (blockIndex === -1) return

    const originalBlock = content.blocks[blockIndex]
    const newBlock = {
      ...JSON.parse(JSON.stringify(originalBlock)),
      id: generateBlockId(originalBlock.type),
      order: blockIndex + 1,
    }

    setContent((prev) => {
      const newBlocks = [...prev.blocks]
      newBlocks.splice(blockIndex + 1, 0, newBlock)
      return {
        ...prev,
        blocks: newBlocks.map((b, i) => ({ ...b, order: i })),
      }
    })
    setSelectedBlockId(newBlock.id)
  }, [content.blocks])

  // Move block up
  const handleMoveUp = useCallback((id: string) => {
    const blockIndex = content.blocks.findIndex((b) => b.id === id)
    if (blockIndex <= 0) return

    setContent((prev) => {
      const newBlocks = [...prev.blocks]
      const temp = newBlocks[blockIndex]
      newBlocks[blockIndex] = newBlocks[blockIndex - 1]
      newBlocks[blockIndex - 1] = temp
      return {
        ...prev,
        blocks: newBlocks.map((b, i) => ({ ...b, order: i })),
      }
    })
  }, [content.blocks])

  // Move block down
  const handleMoveDown = useCallback((id: string) => {
    const blockIndex = content.blocks.findIndex((b) => b.id === id)
    if (blockIndex === -1 || blockIndex >= content.blocks.length - 1) return

    setContent((prev) => {
      const newBlocks = [...prev.blocks]
      const temp = newBlocks[blockIndex]
      newBlocks[blockIndex] = newBlocks[blockIndex + 1]
      newBlocks[blockIndex + 1] = temp
      return {
        ...prev,
        blocks: newBlocks.map((b, i) => ({ ...b, order: i })),
      }
    })
  }, [content.blocks])

  // Update global settings
  const handleUpdateGlobalSettings = useCallback(
    (updates: Partial<EmailVisualContent['globalSettings']>) => {
      setContent((prev) => ({
        ...prev,
        globalSettings: { ...prev.globalSettings, ...updates },
      }))
    },
    []
  )

  const sortedBlocks = [...content.blocks].sort((a, b) => a.order - b.order)

  return (
    <div className="flex gap-6">
      {/* Left Panel - Block Editor */}
      <div className="flex-1 space-y-4">
        {/* Global Settings Toggle */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setShowGlobalSettings(!showGlobalSettings)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Global Settings</span>
            </div>
            <span className="text-xs text-slate-500">
              {showGlobalSettings ? 'Hide' : 'Show'}
            </span>
          </button>

          {showGlobalSettings && (
            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={content.globalSettings.backgroundColor}
                      onChange={(e) =>
                        handleUpdateGlobalSettings({ backgroundColor: e.target.value })
                      }
                      className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                    />
                    <Input
                      value={content.globalSettings.backgroundColor}
                      onChange={(e) =>
                        handleUpdateGlobalSettings({ backgroundColor: e.target.value })
                      }
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Content Width (px)
                  </label>
                  <Input
                    type="number"
                    value={content.globalSettings.contentWidth}
                    onChange={(e) =>
                      handleUpdateGlobalSettings({ contentWidth: Number(e.target.value) })
                    }
                    min={400}
                    max={800}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Font Family
                </label>
                <select
                  value={content.globalSettings.fontFamily}
                  onChange={(e) => handleUpdateGlobalSettings({ fontFamily: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif">
                    System Default
                  </option>
                  <option value="Arial, Helvetica, sans-serif">Arial</option>
                  <option value="Georgia, Times, serif">Georgia</option>
                  <option value="'Courier New', Courier, monospace">Courier New</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Blocks List */}
        <div className="space-y-3">
          {sortedBlocks.map((block, index) => (
            <EmailBlockItem
              key={block.id}
              block={block}
              index={index}
              totalBlocks={sortedBlocks.length}
              isSelected={selectedBlockId === block.id}
              onSelect={() => setSelectedBlockId(block.id)}
              onUpdate={handleUpdateBlock}
              onDelete={() => handleDeleteBlock(block.id)}
              onDuplicate={() => handleDuplicateBlock(block.id)}
              onMoveUp={() => handleMoveUp(block.id)}
              onMoveDown={() => handleMoveDown(block.id)}
            />
          ))}

          {sortedBlocks.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">
                No blocks yet. Add blocks from the palette to start building your email.
              </p>
            </div>
          )}
        </div>

        {/* Block Palette */}
        <EmailBlockPalette onAddBlock={handleAddBlock} />
      </div>

      {/* Right Panel - Preview */}
      <div className="w-[450px] space-y-4">
        <div className="sticky top-6">
          {/* Preview Controls */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Live Preview</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  previewMode === 'desktop'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="inline-block h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  previewMode === 'mobile'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="inline-block h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Preview Frame */}
          <div
            className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all ${
              previewMode === 'mobile' ? 'mx-auto w-[375px]' : 'w-full'
            }`}
          >
            {isGeneratingPreview ? (
              <div className="flex h-[600px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="h-[600px] w-full"
                title="Email Preview"
              />
            ) : (
              <div className="flex h-[600px] items-center justify-center">
                <p className="text-sm text-slate-400">Add blocks to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Create a new block with default content and settings
 */
function createBlock(type: EmailBlockType, order: number): EmailBlock {
  const id = generateBlockId(type)

  switch (type) {
    case 'HEADER':
      return {
        id,
        type: 'HEADER',
        order,
        content: {
          title: 'The Pickleball Passport',
          subtitle: '',
        },
        settings: {
          backgroundColor: '#059669',
          textColor: '#ffffff',
          alignment: 'center' as const,
          paddingTop: 32,
          paddingBottom: 32,
        },
      }
    case 'TEXT':
      return {
        id,
        type: 'TEXT',
        order,
        content: {
          html: '<p>Enter your text content here...</p>',
        },
        settings: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontSize: 16,
          lineHeight: 1.6,
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 24,
          paddingRight: 24,
        },
      }
    case 'IMAGE':
      return {
        id,
        type: 'IMAGE',
        order,
        content: {
          src: '',
          alt: 'Image description',
        },
        settings: {
          width: 'full' as const,
          alignment: 'center' as const,
          borderRadius: 0,
          paddingTop: 16,
          paddingBottom: 16,
        },
      }
    case 'BUTTON':
      return {
        id,
        type: 'BUTTON',
        order,
        content: {
          text: 'Click Here',
          url: '{{dashboardUrl}}',
        },
        settings: {
          backgroundColor: '#059669',
          textColor: '#ffffff',
          borderRadius: 6,
          width: 'auto' as const,
          alignment: 'center' as const,
          paddingTop: 16,
          paddingBottom: 16,
          fontSize: 16,
          fontWeight: 'bold' as const,
        },
      }
    case 'DIVIDER':
      return {
        id,
        type: 'DIVIDER',
        order,
        content: {},
        settings: {
          style: 'solid' as const,
          color: '#e5e7eb',
          thickness: 1,
          width: 100,
          marginTop: 24,
          marginBottom: 24,
        },
      }
    case 'FOOTER':
      return {
        id,
        type: 'FOOTER',
        order,
        content: {
          companyName: 'The Pickleball Passport',
          address: '123 Main Street, Chiang Mai, Thailand',
          unsubscribeText: 'Unsubscribe from these emails',
        },
        settings: {
          backgroundColor: '#f9fafb',
          textColor: '#6b7280',
          fontSize: 12,
          alignment: 'center' as const,
          paddingTop: 24,
          paddingBottom: 24,
        },
      }
    default:
      throw new Error(`Unknown block type: ${type}`)
  }
}
