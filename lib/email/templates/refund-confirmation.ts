/**
 * Refund Confirmation Email Template
 *
 * Sent when a refund is processed (via E3-S13 cancellation or Stripe dashboard).
 * Triggered by charge.refunded webhook event.
 */

export interface RefundConfirmationData {
  firstName: string
  email: string
  bookingReference: string
  packageName: string
  refundAmount: number // in cents
  originalAmount: number // in cents
  isPartialRefund: boolean
  refundDate: string // ISO date
  expectedTimeline: string // "5-10 business days"
}

export function generateRefundConfirmationEmail(
  data: RefundConfirmationData
): string {
  const refundAmountFormatted = `$${(data.refundAmount / 100).toLocaleString(
    'en-US',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  )}`

  const originalAmountFormatted = `$${(
    data.originalAmount / 100
  ).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refund Processed - Pickleball Passport</title>
    <style>
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        color: #374151;
        margin: 0;
        padding: 0;
        background-color: #F3F4F6;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #FFFFFF;
      }
      .header {
        background-color: #003D5C;
        color: white;
        padding: 30px 20px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
      }
      .content {
        padding: 30px 20px;
      }
      .info-box {
        background: #F3F4F6;
        border-left: 4px solid #003D5C;
        padding: 20px;
        margin: 20px 0;
        border-radius: 4px;
      }
      .info-box p {
        margin: 8px 0;
      }
      .info-box strong {
        color: #1F2937;
      }
      .amount {
        color: #10B981;
        font-size: 28px;
        font-weight: bold;
        margin: 15px 0;
      }
      .partial-refund-notice {
        background: #FEF3C7;
        border-left: 4px solid #F59E0B;
        padding: 15px;
        margin: 15px 0;
        border-radius: 4px;
      }
      .section {
        margin: 25px 0;
      }
      .section h3 {
        color: #003D5C;
        font-size: 18px;
        margin-bottom: 15px;
      }
      ul {
        margin: 10px 0;
        padding-left: 20px;
      }
      li {
        margin: 8px 0;
      }
      .support-box {
        background: #EFF6FF;
        border: 1px solid #BFDBFE;
        padding: 20px;
        margin: 25px 0;
        border-radius: 8px;
      }
      .support-box p {
        margin: 5px 0;
      }
      .footer {
        background: #F9FAFB;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #6B7280;
      }
      .footer a {
        color: #003D5C;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Refund Processed</h1>
      </div>

      <div class="content">
        <p>Hi ${data.firstName},</p>

        <p>Your refund has been processed successfully. We're sorry to see you go!</p>

        <div class="info-box">
          <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
          <p><strong>Package:</strong> ${data.packageName}</p>
          <p><strong>Original Amount:</strong> ${originalAmountFormatted}</p>
          ${
            data.isPartialRefund
              ? `<div class="partial-refund-notice">
                  <p style="margin: 0;"><strong>⚠️ Partial Refund</strong></p>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">This is a partial refund based on our cancellation policy.</p>
                </div>`
              : ''
          }
          <p><strong>Refund Amount:</strong></p>
          <div class="amount">${refundAmountFormatted}</div>
          <p style="font-size: 14px; color: #6B7280;"><strong>Processed On:</strong> ${new Date(
            data.refundDate
          ).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</p>
        </div>

        <div class="section">
          <h3>What Happens Next?</h3>
          <ul>
            <li>Your refund will appear on your original payment method within <strong>${
              data.expectedTimeline
            }</strong></li>
            <li>You will receive a separate receipt email from Stripe confirming the refund</li>
            <li>The exact timing depends on your bank or card issuer</li>
            <li>If you don't see the refund after 10 business days, please contact your bank first</li>
          </ul>
        </div>

        <div class="section">
          <h3>Questions or Concerns?</h3>
          <p>If there's anything we can do to improve your experience or if you'd like to rebook in the future, we'd love to hear from you.</p>
        </div>

        <div class="support-box">
          <p><strong>Customer Support</strong></p>
          <p>📧 Email: <a href="mailto:support@pickleballpassport.com">support@pickleballpassport.com</a></p>
          <p>📞 Phone: +1 (555) 123-4567</p>
          <p>🕐 Hours: Monday-Friday, 9am-5pm EST</p>
        </div>

        <p>We hope to welcome you back in the future for an amazing Pickleball Passport adventure!</p>

        <p>Best regards,<br>
        <strong>The Pickleball Passport Team</strong></p>
      </div>

      <div class="footer">
        <p>Pickleball Passport - Transform Your Game, Transform Yourself</p>
        <p>
          <a href="https://pickleballpassport.com">Visit Our Website</a> |
          <a href="https://pickleballpassport.com/contact">Contact Us</a>
        </p>
        <p style="font-size: 12px; color: #9CA3AF; margin-top: 15px;">
          This email was sent regarding your booking ${
            data.bookingReference
          }. If you have questions about this refund, please contact our support team.
        </p>
      </div>
    </div>
  </body>
</html>
  `.trim()
}
