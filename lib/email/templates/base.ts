/**
 * Email Template Base
 *
 * Provides a consistent HTML structure for all emails
 */

export interface EmailTemplateProps {
  title: string;
  content: string;
  preheader?: string;
  footerText?: string;
}

/**
 * Base email template with responsive design
 */
export function baseEmailTemplate({
  title,
  content,
  preheader = '',
  footerText = 'You received this email because you signed up for Pickleball Passport.',
}: EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #2563eb 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
      text-decoration: none;
    }
    .content {
      padding: 40px 24px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #059669;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
    }
    .button:hover {
      background-color: #047857;
    }
    h1 {
      color: #111827;
      font-size: 24px;
      margin: 0 0 16px 0;
    }
    p {
      color: #4b5563;
      font-size: 16px;
      line-height: 24px;
      margin: 0 0 16px 0;
    }
    .preheader {
      display: none;
      max-height: 0;
      overflow: hidden;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 24px 16px;
      }
      h1 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" class="container">
          <!-- Header -->
          <tr>
            <td class="header">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}" class="logo">
                🏓 Pickleball Passport
              </a>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="margin: 0 0 8px 0;">${footerText}</p>
              <p style="margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Pickleball Passport. All rights reserved.<br>
                Chiang Mai, Thailand
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain text version generator (for email clients that don't support HTML)
 */
export function generatePlainText(htmlContent: string): string {
  // Simple HTML to text conversion
  return htmlContent
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s\s+/g, '\n') // Multiple spaces to single newline
    .trim();
}
