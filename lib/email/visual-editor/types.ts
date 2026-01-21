/**
 * Visual Email Editor Types
 * Story 12-8: Email Template Editor
 *
 * Defines types for drag-and-drop email block editing
 */

export type EmailBlockType =
  | 'HEADER'
  | 'TEXT'
  | 'IMAGE'
  | 'BUTTON'
  | 'DIVIDER'
  | 'FOOTER'

export interface EmailBlockBase {
  id: string
  type: EmailBlockType
  order: number
}

export interface HeaderBlock extends EmailBlockBase {
  type: 'HEADER'
  content: {
    title: string
    subtitle?: string
    logoUrl?: string
  }
  settings: {
    backgroundColor: string
    textColor: string
    alignment: 'left' | 'center' | 'right'
    paddingTop: number
    paddingBottom: number
  }
}

export interface TextBlock extends EmailBlockBase {
  type: 'TEXT'
  content: {
    html: string // Rich text HTML content
  }
  settings: {
    backgroundColor: string
    textColor: string
    fontSize: number
    lineHeight: number
    paddingTop: number
    paddingBottom: number
    paddingLeft: number
    paddingRight: number
  }
}

export interface ImageBlock extends EmailBlockBase {
  type: 'IMAGE'
  content: {
    src: string
    alt: string
    linkUrl?: string
  }
  settings: {
    width: 'full' | 'auto' | number
    alignment: 'left' | 'center' | 'right'
    borderRadius: number
    paddingTop: number
    paddingBottom: number
  }
}

export interface ButtonBlock extends EmailBlockBase {
  type: 'BUTTON'
  content: {
    text: string
    url: string
  }
  settings: {
    backgroundColor: string
    textColor: string
    borderRadius: number
    width: 'auto' | 'full'
    alignment: 'left' | 'center' | 'right'
    paddingTop: number
    paddingBottom: number
    fontSize: number
    fontWeight: 'normal' | 'bold'
  }
}

export interface DividerBlock extends EmailBlockBase {
  type: 'DIVIDER'
  content: Record<string, never>
  settings: {
    style: 'solid' | 'dashed' | 'dotted'
    color: string
    thickness: number
    width: number // Percentage
    marginTop: number
    marginBottom: number
  }
}

export interface FooterBlock extends EmailBlockBase {
  type: 'FOOTER'
  content: {
    companyName: string
    address?: string
    unsubscribeText: string
    socialLinks?: Array<{
      platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin'
      url: string
    }>
  }
  settings: {
    backgroundColor: string
    textColor: string
    fontSize: number
    alignment: 'left' | 'center' | 'right'
    paddingTop: number
    paddingBottom: number
  }
}

export type EmailBlock =
  | HeaderBlock
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | FooterBlock

export interface EmailVisualContent {
  blocks: EmailBlock[]
  globalSettings: {
    backgroundColor: string
    contentWidth: number
    fontFamily: string
  }
}

// Default settings for each block type
export const DEFAULT_BLOCK_SETTINGS: Record<EmailBlockType, Partial<EmailBlock['settings']>> = {
  HEADER: {
    backgroundColor: '#059669',
    textColor: '#ffffff',
    alignment: 'center',
    paddingTop: 32,
    paddingBottom: 32,
  },
  TEXT: {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    fontSize: 16,
    lineHeight: 1.6,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 24,
  },
  IMAGE: {
    width: 'full',
    alignment: 'center',
    borderRadius: 0,
    paddingTop: 16,
    paddingBottom: 16,
  },
  BUTTON: {
    backgroundColor: '#059669',
    textColor: '#ffffff',
    borderRadius: 6,
    width: 'auto',
    alignment: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  DIVIDER: {
    style: 'solid',
    color: '#e5e7eb',
    thickness: 1,
    width: 100,
    marginTop: 24,
    marginBottom: 24,
  },
  FOOTER: {
    backgroundColor: '#f9fafb',
    textColor: '#6b7280',
    fontSize: 12,
    alignment: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
}

// Block type labels for UI
export const BLOCK_TYPE_LABELS: Record<EmailBlockType, string> = {
  HEADER: 'Header',
  TEXT: 'Text',
  IMAGE: 'Image',
  BUTTON: 'Button',
  DIVIDER: 'Divider',
  FOOTER: 'Footer',
}

// Block type descriptions for UI
export const BLOCK_TYPE_DESCRIPTIONS: Record<EmailBlockType, string> = {
  HEADER: 'Logo and title section',
  TEXT: 'Rich text content',
  IMAGE: 'Single image with optional link',
  BUTTON: 'Call-to-action button',
  DIVIDER: 'Horizontal separator line',
  FOOTER: 'Company info and unsubscribe links',
}
