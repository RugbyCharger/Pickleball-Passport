/**
 * Visual Email Block Renderer
 * Story 12-8: Email Template Editor
 *
 * Converts visual blocks to HTML for email rendering
 */

import type {
  EmailBlock,
  HeaderBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  FooterBlock,
  EmailVisualContent,
} from './types'

/**
 * Render a header block to HTML
 */
function renderHeaderBlock(block: HeaderBlock): string {
  const { content, settings } = block
  const logoHtml = content.logoUrl
    ? `<img src="${content.logoUrl}" alt="Logo" style="max-height: 50px; margin-bottom: 16px;" />`
    : ''
  const subtitleHtml = content.subtitle
    ? `<p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">${content.subtitle}</p>`
    : ''

  return `
    <tr>
      <td style="background-color: ${settings.backgroundColor}; padding: ${settings.paddingTop}px 24px ${settings.paddingBottom}px 24px; text-align: ${settings.alignment};">
        ${logoHtml}
        <h1 style="margin: 0; color: ${settings.textColor}; font-size: 24px; font-weight: bold;">${content.title}</h1>
        ${subtitleHtml}
      </td>
    </tr>
  `
}

/**
 * Render a text block to HTML
 */
function renderTextBlock(block: TextBlock): string {
  const { content, settings } = block

  return `
    <tr>
      <td style="background-color: ${settings.backgroundColor}; padding: ${settings.paddingTop}px ${settings.paddingRight}px ${settings.paddingBottom}px ${settings.paddingLeft}px;">
        <div style="color: ${settings.textColor}; font-size: ${settings.fontSize}px; line-height: ${settings.lineHeight};">
          ${content.html}
        </div>
      </td>
    </tr>
  `
}

/**
 * Render an image block to HTML
 */
function renderImageBlock(block: ImageBlock): string {
  const { content, settings } = block
  const widthStyle =
    settings.width === 'full'
      ? 'width: 100%;'
      : settings.width === 'auto'
        ? 'max-width: 100%;'
        : `width: ${settings.width}px; max-width: 100%;`

  const imgHtml = `<img src="${content.src}" alt="${content.alt}" style="${widthStyle} border-radius: ${settings.borderRadius}px; display: block;" />`
  const wrappedImg = content.linkUrl
    ? `<a href="${content.linkUrl}" target="_blank" rel="noopener noreferrer">${imgHtml}</a>`
    : imgHtml

  return `
    <tr>
      <td style="padding: ${settings.paddingTop}px 24px ${settings.paddingBottom}px 24px; text-align: ${settings.alignment};">
        ${wrappedImg}
      </td>
    </tr>
  `
}

/**
 * Render a button block to HTML
 */
function renderButtonBlock(block: ButtonBlock): string {
  const { content, settings } = block
  const widthStyle = settings.width === 'full' ? 'width: 100%;' : ''

  return `
    <tr>
      <td style="padding: ${settings.paddingTop}px 24px ${settings.paddingBottom}px 24px; text-align: ${settings.alignment};">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="${settings.width === 'full' ? 'width: 100%;' : 'display: inline-block;'}">
          <tr>
            <td style="background-color: ${settings.backgroundColor}; border-radius: ${settings.borderRadius}px; ${widthStyle}">
              <a href="${content.url}" target="_blank" rel="noopener noreferrer" style="display: block; padding: 12px 24px; color: ${settings.textColor}; text-decoration: none; font-size: ${settings.fontSize}px; font-weight: ${settings.fontWeight}; text-align: center;">
                ${content.text}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}

/**
 * Render a divider block to HTML
 */
function renderDividerBlock(block: DividerBlock): string {
  const { settings } = block

  return `
    <tr>
      <td style="padding: ${settings.marginTop}px 24px ${settings.marginBottom}px 24px;">
        <div style="width: ${settings.width}%; margin: 0 auto; border-top: ${settings.thickness}px ${settings.style} ${settings.color};"></div>
      </td>
    </tr>
  `
}

/**
 * Render a footer block to HTML
 */
function renderFooterBlock(block: FooterBlock): string {
  const { content, settings } = block

  const socialLinksHtml = content.socialLinks?.length
    ? `
      <p style="margin: 16px 0 0 0;">
        ${content.socialLinks
          .map(
            (link) =>
              `<a href="${link.url}" style="color: ${settings.textColor}; text-decoration: none; margin: 0 8px;">${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</a>`
          )
          .join(' | ')}
      </p>
    `
    : ''

  const addressHtml = content.address
    ? `<p style="margin: 8px 0 0 0;">${content.address}</p>`
    : ''

  return `
    <tr>
      <td style="background-color: ${settings.backgroundColor}; padding: ${settings.paddingTop}px 24px ${settings.paddingBottom}px 24px; text-align: ${settings.alignment}; font-size: ${settings.fontSize}px; color: ${settings.textColor};">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${content.companyName}. All rights reserved.</p>
        ${addressHtml}
        <p style="margin: 16px 0 0 0;">
          <a href="{{unsubscribeUrl}}" style="color: ${settings.textColor}; text-decoration: underline;">${content.unsubscribeText}</a>
        </p>
        ${socialLinksHtml}
      </td>
    </tr>
  `
}

/**
 * Render a single block to HTML
 */
export function renderBlock(block: EmailBlock): string {
  switch (block.type) {
    case 'HEADER':
      return renderHeaderBlock(block)
    case 'TEXT':
      return renderTextBlock(block)
    case 'IMAGE':
      return renderImageBlock(block)
    case 'BUTTON':
      return renderButtonBlock(block)
    case 'DIVIDER':
      return renderDividerBlock(block)
    case 'FOOTER':
      return renderFooterBlock(block)
    default:
      return ''
  }
}

/**
 * Convert visual blocks to complete HTML email
 */
export function blocksToHtml(visualContent: EmailVisualContent): string {
  const { blocks, globalSettings } = visualContent
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)
  const blocksHtml = sortedBlocks.map((block) => renderBlock(block)).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{{subject}}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: ${globalSettings.fontFamily};
      background-color: ${globalSettings.backgroundColor};
    }
    a {
      color: inherit;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${globalSettings.backgroundColor};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${globalSettings.backgroundColor};">
    <tr>
      <td align="center" style="padding: 24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" class="email-container" width="${globalSettings.contentWidth}" style="background-color: #ffffff; max-width: ${globalSettings.contentWidth}px; width: 100%;">
          ${blocksHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Generate plain text version from visual blocks
 */
export function blocksToPlainText(visualContent: EmailVisualContent): string {
  const { blocks } = visualContent
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)
  const lines: string[] = []

  for (const block of sortedBlocks) {
    switch (block.type) {
      case 'HEADER': {
        const header = block as HeaderBlock
        lines.push(header.content.title)
        if (header.content.subtitle) {
          lines.push(header.content.subtitle)
        }
        lines.push('')
        break
      }
      case 'TEXT': {
        const text = block as TextBlock
        // Strip HTML tags for plain text
        const plainText = text.content.html
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .trim()
        lines.push(plainText)
        lines.push('')
        break
      }
      case 'IMAGE': {
        const image = block as ImageBlock
        if (image.content.linkUrl) {
          lines.push(`[Image: ${image.content.alt}] - ${image.content.linkUrl}`)
        } else {
          lines.push(`[Image: ${image.content.alt}]`)
        }
        lines.push('')
        break
      }
      case 'BUTTON': {
        const button = block as ButtonBlock
        lines.push(`${button.content.text}: ${button.content.url}`)
        lines.push('')
        break
      }
      case 'DIVIDER':
        lines.push('---')
        lines.push('')
        break
      case 'FOOTER': {
        const footer = block as FooterBlock
        lines.push(`${footer.content.companyName}`)
        if (footer.content.address) {
          lines.push(footer.content.address)
        }
        lines.push(`${footer.content.unsubscribeText}: {{unsubscribeUrl}}`)
        break
      }
    }
  }

  return lines.join('\n')
}

/**
 * Create default visual content with common blocks
 */
export function createDefaultVisualContent(): EmailVisualContent {
  return {
    blocks: [
      {
        id: 'header-1',
        type: 'HEADER',
        order: 0,
        content: {
          title: 'The Pickleball Passport',
          subtitle: '',
        },
        settings: {
          backgroundColor: '#059669',
          textColor: '#ffffff',
          alignment: 'center',
          paddingTop: 32,
          paddingBottom: 32,
        },
      },
      {
        id: 'text-1',
        type: 'TEXT',
        order: 1,
        content: {
          html: '<p>Hello {{guestName}},</p><p>Your content goes here. Use variable placeholders like {{variableName}} for dynamic content.</p>',
        },
        settings: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontSize: 16,
          lineHeight: 1.6,
          paddingTop: 32,
          paddingBottom: 16,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
      {
        id: 'button-1',
        type: 'BUTTON',
        order: 2,
        content: {
          text: 'View Details',
          url: '{{dashboardUrl}}',
        },
        settings: {
          backgroundColor: '#059669',
          textColor: '#ffffff',
          borderRadius: 6,
          width: 'auto',
          alignment: 'center',
          paddingTop: 16,
          paddingBottom: 32,
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      {
        id: 'footer-1',
        type: 'FOOTER',
        order: 3,
        content: {
          companyName: 'The Pickleball Passport',
          address: '123 Main Street, Chiang Mai, Thailand',
          unsubscribeText: 'Unsubscribe from these emails',
        },
        settings: {
          backgroundColor: '#f9fafb',
          textColor: '#6b7280',
          fontSize: 12,
          alignment: 'center',
          paddingTop: 24,
          paddingBottom: 24,
        },
      },
    ],
    globalSettings: {
      backgroundColor: '#f3f4f6',
      contentWidth: 600,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
  }
}

/**
 * Generate a unique block ID
 */
export function generateBlockId(type: string): string {
  return `${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
