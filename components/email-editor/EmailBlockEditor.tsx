'use client'

/**
 * Email Block Editor Component
 * Story 12-8: Email Template Editor
 *
 * Provides editing UI for different block types
 */

import { Input } from '@/components/ui/input'
import type {
  EmailBlock,
  HeaderBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  FooterBlock,
} from '@/lib/email/visual-editor/types'

interface EmailBlockEditorProps {
  block: EmailBlock
  onUpdate: (block: EmailBlock) => void
  showSettings: boolean
}

export function EmailBlockEditor({ block, onUpdate, showSettings }: EmailBlockEditorProps) {
  switch (block.type) {
    case 'HEADER':
      return (
        <HeaderBlockEditor
          block={block}
          onUpdate={(updated) => onUpdate({ ...block, ...updated } as EmailBlock)}
          showSettings={showSettings}
        />
      )
    case 'TEXT':
      return (
        <TextBlockEditor
          block={block}
          onUpdate={(updated) => onUpdate({ ...block, ...updated } as EmailBlock)}
          showSettings={showSettings}
        />
      )
    case 'IMAGE':
      return (
        <ImageBlockEditor
          block={block}
          onUpdate={(updated) => onUpdate({ ...block, ...updated } as EmailBlock)}
          showSettings={showSettings}
        />
      )
    case 'BUTTON':
      return (
        <ButtonBlockEditor
          block={block}
          onUpdate={(updated) => onUpdate({ ...block, ...updated } as EmailBlock)}
          showSettings={showSettings}
        />
      )
    case 'DIVIDER':
      return (
        <DividerBlockEditor
          block={block}
          onUpdate={(updated) => onUpdate({ ...block, ...updated } as EmailBlock)}
          showSettings={showSettings}
        />
      )
    case 'FOOTER':
      return (
        <FooterBlockEditor
          block={block}
          onUpdate={(updated) => onUpdate({ ...block, ...updated } as EmailBlock)}
          showSettings={showSettings}
        />
      )
    default:
      return null
  }
}

// Header Block Editor
function HeaderBlockEditor({
  block,
  onUpdate,
  showSettings,
}: {
  block: HeaderBlock
  onUpdate: (updates: Partial<HeaderBlock>) => void
  showSettings: boolean
}) {
  return (
    <div className="space-y-4">
      {/* Content */}
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
          <Input
            value={block.content.title}
            onChange={(e) =>
              onUpdate({ content: { ...block.content, title: e.target.value } })
            }
            placeholder="Header title"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Subtitle (optional)
          </label>
          <Input
            value={block.content.subtitle || ''}
            onChange={(e) =>
              onUpdate({ content: { ...block.content, subtitle: e.target.value } })
            }
            placeholder="Subtitle text"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Logo URL (optional)
          </label>
          <Input
            value={block.content.logoUrl || ''}
            onChange={(e) =>
              onUpdate({ content: { ...block.content, logoUrl: e.target.value } })
            }
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="border-t border-slate-100 pt-4">
          <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Settings</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={block.settings.backgroundColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, backgroundColor: e.target.value },
                    })
                  }
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                />
                <Input
                  value={block.settings.backgroundColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, backgroundColor: e.target.value },
                    })
                  }
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Text Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={block.settings.textColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, textColor: e.target.value },
                    })
                  }
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                />
                <Input
                  value={block.settings.textColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, textColor: e.target.value },
                    })
                  }
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Alignment</label>
              <select
                value={block.settings.alignment}
                onChange={(e) =>
                  onUpdate({
                    settings: {
                      ...block.settings,
                      alignment: e.target.value as 'left' | 'center' | 'right',
                    },
                  })
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Padding (Top/Bottom)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={block.settings.paddingTop}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, paddingTop: Number(e.target.value) },
                    })
                  }
                  min={0}
                  className="w-20"
                />
                <Input
                  type="number"
                  value={block.settings.paddingBottom}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, paddingBottom: Number(e.target.value) },
                    })
                  }
                  min={0}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Text Block Editor
function TextBlockEditor({
  block,
  onUpdate,
  showSettings,
}: {
  block: TextBlock
  onUpdate: (updates: Partial<TextBlock>) => void
  showSettings: boolean
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Content (HTML)</label>
        <textarea
          value={block.content.html}
          onChange={(e) => onUpdate({ content: { html: e.target.value } })}
          rows={5}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="<p>Your text content here...</p>"
        />
        <p className="mt-1 text-xs text-slate-500">
          Use {'{{variableName}}'} for dynamic content
        </p>
      </div>

      {showSettings && (
        <div className="border-t border-slate-100 pt-4">
          <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Settings</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={block.settings.backgroundColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, backgroundColor: e.target.value },
                    })
                  }
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                />
                <Input
                  value={block.settings.backgroundColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, backgroundColor: e.target.value },
                    })
                  }
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Text Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={block.settings.textColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, textColor: e.target.value },
                    })
                  }
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                />
                <Input
                  value={block.settings.textColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, textColor: e.target.value },
                    })
                  }
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Font Size</label>
              <Input
                type="number"
                value={block.settings.fontSize}
                onChange={(e) =>
                  onUpdate({
                    settings: { ...block.settings, fontSize: Number(e.target.value) },
                  })
                }
                min={10}
                max={36}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Line Height</label>
              <Input
                type="number"
                value={block.settings.lineHeight}
                onChange={(e) =>
                  onUpdate({
                    settings: { ...block.settings, lineHeight: Number(e.target.value) },
                  })
                }
                min={1}
                max={3}
                step={0.1}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Image Block Editor
function ImageBlockEditor({
  block,
  onUpdate,
  showSettings,
}: {
  block: ImageBlock
  onUpdate: (updates: Partial<ImageBlock>) => void
  showSettings: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Image URL</label>
          <Input
            value={block.content.src}
            onChange={(e) => onUpdate({ content: { ...block.content, src: e.target.value } })}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Alt Text</label>
          <Input
            value={block.content.alt}
            onChange={(e) => onUpdate({ content: { ...block.content, alt: e.target.value } })}
            placeholder="Image description"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Link URL (optional)
          </label>
          <Input
            value={block.content.linkUrl || ''}
            onChange={(e) =>
              onUpdate({ content: { ...block.content, linkUrl: e.target.value } })
            }
            placeholder="https://..."
          />
        </div>
      </div>

      {showSettings && (
        <div className="border-t border-slate-100 pt-4">
          <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Settings</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Width</label>
              <select
                value={typeof block.settings.width === 'number' ? 'custom' : block.settings.width}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === 'custom') {
                    onUpdate({ settings: { ...block.settings, width: 300 } })
                  } else {
                    onUpdate({
                      settings: { ...block.settings, width: value as 'full' | 'auto' },
                    })
                  }
                }}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="full">Full Width</option>
                <option value="auto">Auto</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Alignment</label>
              <select
                value={block.settings.alignment}
                onChange={(e) =>
                  onUpdate({
                    settings: {
                      ...block.settings,
                      alignment: e.target.value as 'left' | 'center' | 'right',
                    },
                  })
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Border Radius
              </label>
              <Input
                type="number"
                value={block.settings.borderRadius}
                onChange={(e) =>
                  onUpdate({
                    settings: { ...block.settings, borderRadius: Number(e.target.value) },
                  })
                }
                min={0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Button Block Editor
function ButtonBlockEditor({
  block,
  onUpdate,
  showSettings,
}: {
  block: ButtonBlock
  onUpdate: (updates: Partial<ButtonBlock>) => void
  showSettings: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Button Text</label>
          <Input
            value={block.content.text}
            onChange={(e) => onUpdate({ content: { ...block.content, text: e.target.value } })}
            placeholder="Click here"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">URL</label>
          <Input
            value={block.content.url}
            onChange={(e) => onUpdate({ content: { ...block.content, url: e.target.value } })}
            placeholder="https://... or {{variableUrl}}"
          />
        </div>
      </div>

      {showSettings && (
        <div className="border-t border-slate-100 pt-4">
          <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Settings</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={block.settings.backgroundColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, backgroundColor: e.target.value },
                    })
                  }
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                />
                <Input
                  value={block.settings.backgroundColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, backgroundColor: e.target.value },
                    })
                  }
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Text Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={block.settings.textColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, textColor: e.target.value },
                    })
                  }
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                />
                <Input
                  value={block.settings.textColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, textColor: e.target.value },
                    })
                  }
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Width</label>
              <select
                value={block.settings.width}
                onChange={(e) =>
                  onUpdate({
                    settings: {
                      ...block.settings,
                      width: e.target.value as 'auto' | 'full',
                    },
                  })
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="auto">Auto</option>
                <option value="full">Full Width</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Border Radius
              </label>
              <Input
                type="number"
                value={block.settings.borderRadius}
                onChange={(e) =>
                  onUpdate({
                    settings: { ...block.settings, borderRadius: Number(e.target.value) },
                  })
                }
                min={0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Divider Block Editor
function DividerBlockEditor({
  block,
  onUpdate,
  showSettings,
}: {
  block: DividerBlock
  onUpdate: (updates: Partial<DividerBlock>) => void
  showSettings: boolean
}) {
  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="py-4">
        <div
          style={{
            width: `${block.settings.width}%`,
            margin: '0 auto',
            borderTop: `${block.settings.thickness}px ${block.settings.style} ${block.settings.color}`,
          }}
        />
      </div>

      {showSettings && (
        <div className="border-t border-slate-100 pt-4">
          <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Settings</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Style</label>
              <select
                value={block.settings.style}
                onChange={(e) =>
                  onUpdate({
                    settings: {
                      ...block.settings,
                      style: e.target.value as 'solid' | 'dashed' | 'dotted',
                    },
                  })
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={block.settings.color}
                  onChange={(e) =>
                    onUpdate({ settings: { ...block.settings, color: e.target.value } })
                  }
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                />
                <Input
                  value={block.settings.color}
                  onChange={(e) =>
                    onUpdate({ settings: { ...block.settings, color: e.target.value } })
                  }
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Thickness</label>
              <Input
                type="number"
                value={block.settings.thickness}
                onChange={(e) =>
                  onUpdate({
                    settings: { ...block.settings, thickness: Number(e.target.value) },
                  })
                }
                min={1}
                max={10}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Width (%)</label>
              <Input
                type="number"
                value={block.settings.width}
                onChange={(e) =>
                  onUpdate({
                    settings: { ...block.settings, width: Number(e.target.value) },
                  })
                }
                min={10}
                max={100}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Footer Block Editor
function FooterBlockEditor({
  block,
  onUpdate,
  showSettings,
}: {
  block: FooterBlock
  onUpdate: (updates: Partial<FooterBlock>) => void
  showSettings: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Company Name</label>
          <Input
            value={block.content.companyName}
            onChange={(e) =>
              onUpdate({ content: { ...block.content, companyName: e.target.value } })
            }
            placeholder="Company Name"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Address (optional)
          </label>
          <Input
            value={block.content.address || ''}
            onChange={(e) =>
              onUpdate({ content: { ...block.content, address: e.target.value } })
            }
            placeholder="123 Main St, City, Country"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Unsubscribe Text</label>
          <Input
            value={block.content.unsubscribeText}
            onChange={(e) =>
              onUpdate({ content: { ...block.content, unsubscribeText: e.target.value } })
            }
            placeholder="Unsubscribe from these emails"
          />
        </div>
      </div>

      {showSettings && (
        <div className="border-t border-slate-100 pt-4">
          <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Settings</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={block.settings.backgroundColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, backgroundColor: e.target.value },
                    })
                  }
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                />
                <Input
                  value={block.settings.backgroundColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, backgroundColor: e.target.value },
                    })
                  }
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Text Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={block.settings.textColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, textColor: e.target.value },
                    })
                  }
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200"
                />
                <Input
                  value={block.settings.textColor}
                  onChange={(e) =>
                    onUpdate({
                      settings: { ...block.settings, textColor: e.target.value },
                    })
                  }
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Font Size</label>
              <Input
                type="number"
                value={block.settings.fontSize}
                onChange={(e) =>
                  onUpdate({
                    settings: { ...block.settings, fontSize: Number(e.target.value) },
                  })
                }
                min={10}
                max={16}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Alignment</label>
              <select
                value={block.settings.alignment}
                onChange={(e) =>
                  onUpdate({
                    settings: {
                      ...block.settings,
                      alignment: e.target.value as 'left' | 'center' | 'right',
                    },
                  })
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
