/**
 * Booking Modification Email Template (E3-S16)
 *
 * Sent to guests after successfully modifying add-ons
 */

import { baseEmailTemplate, generatePlainText } from './base'

export interface BookingModificationData {
  // Guest details
  firstName: string
  email: string

  // Booking details
  bookingReference: string
  packageName: string

  // Change details
  addedAddOns: Array<{
    name: string
    price: number // In cents
  }>
  removedAddOns: Array<{
    name: string
    price: number // In cents
  }>

  // Pricing
  originalTotal: number // In cents
  newTotal: number // In cents
  priceDifference: number // In cents (positive = increase, negative = decrease)
  adjustmentType: 'charge' | 'refund' | 'none'

  // Trip details
  tripStartDate: string // ISO date string
  tripEndDate: string // ISO date string
  destination: string

  // Portal link
  portalUrl?: string
}

/**
 * Format currency in USD
 */
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function generateBookingModificationEmail(data: BookingModificationData): {
  html: string
  text: string
  subject: string
} {
  const portalUrl = data.portalUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/dashboard/bookings`

  // Build added add-ons section
  const addedAddOnsHtml = data.addedAddOns.length > 0
    ? `
    <div style="margin: 16px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
      <h3 style="color: #166534; font-size: 16px; margin: 0 0 12px 0;">✓ Added</h3>
      ${data.addedAddOns.map(addOn => `
        <p style="margin: 4px 0; color: #166534; font-size: 14px;">
          <strong>${addOn.name}</strong> - ${formatCurrency(addOn.price)}
        </p>
      `).join('')}
    </div>
    `
    : ''

  // Build removed add-ons section
  const removedAddOnsHtml = data.removedAddOns.length > 0
    ? `
    <div style="margin: 16px 0; padding: 16px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
      <h3 style="color: #991b1b; font-size: 16px; margin: 0 0 12px 0;">✕ Removed</h3>
      ${data.removedAddOns.map(addOn => `
        <p style="margin: 4px 0; color: #991b1b; font-size: 14px; text-decoration: line-through;">
          ${addOn.name} - ${formatCurrency(addOn.price)}
        </p>
      `).join('')}
    </div>
    `
    : ''

  // Build payment adjustment section
  const paymentAdjustmentHtml = data.adjustmentType !== 'none'
    ? `
    <div style="margin: 24px 0; padding: 20px; background-color: ${data.adjustmentType === 'charge' ? '#fef2f2' : '#f0fdf4'}; border-radius: 8px; border: 2px solid ${data.adjustmentType === 'charge' ? '#dc2626' : '#059669'};">
      <h3 style="color: ${data.adjustmentType === 'charge' ? '#991b1b' : '#166534'}; font-size: 18px; margin: 0 0 12px 0;">
        💳 Payment Adjustment
      </h3>
      <p style="color: ${data.adjustmentType === 'charge' ? '#991b1b' : '#166534'}; font-size: 16px; margin: 8px 0;">
        ${data.adjustmentType === 'charge'
          ? `<strong>Charge:</strong> We've charged ${formatCurrency(Math.abs(data.priceDifference))} to your card ending in XXXX.`
          : `<strong>Refund:</strong> A refund of ${formatCurrency(Math.abs(data.priceDifference))} will appear on your card ending in XXXX within 5-10 business days.`
        }
      </p>
      ${data.adjustmentType === 'refund'
        ? `<p style="color: #166534; font-size: 14px; margin: 8px 0 0 0;">
             <em>Refund processing time: 5-10 business days depending on your bank</em>
           </p>`
        : ''
      }
    </div>
    `
    : '<p style="color: #059669; font-size: 16px; margin: 24px 0;"><strong>✓ No payment adjustment needed</strong> - The changes you made had no net price impact.</p>'

  const content = `
    <h1>Booking Modified Successfully! ✓</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      Your booking has been successfully modified. We've updated your add-ons as requested.
      Below is a summary of the changes and any payment adjustments.
    </p>

    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Booking Reference
      </p>
      <p style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">
        ${data.bookingReference}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📝 Changes Summary</h2>

    ${addedAddOnsHtml}
    ${removedAddOnsHtml}

    ${data.addedAddOns.length === 0 && data.removedAddOns.length === 0
      ? '<p style="color: #6b7280; font-size: 14px; margin: 16px 0;">No add-ons were added or removed.</p>'
      : ''
    }

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">💰 Price Comparison</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Original Add-Ons Total:</td>
          <td style="padding: 8px 0; color: #6b7280; text-decoration: line-through; text-align: right;">${formatCurrency(data.originalTotal)}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #111827; font-size: 16px; font-weight: 600;">New Add-Ons Total:</td>
          <td style="padding: 12px 0; color: #111827; font-size: 18px; font-weight: bold; text-align: right;">${formatCurrency(data.newTotal)}</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 12px 0; color: ${data.priceDifference > 0 ? '#dc2626' : data.priceDifference < 0 ? '#059669' : '#6b7280'}; font-size: 16px; font-weight: 600;">
            ${data.priceDifference > 0 ? 'Price Increase:' : data.priceDifference < 0 ? 'Price Decrease:' : 'No Change:'}
          </td>
          <td style="padding: 12px 0; color: ${data.priceDifference > 0 ? '#dc2626' : data.priceDifference < 0 ? '#059669' : '#6b7280'}; font-size: 18px; font-weight: bold; text-align: right;">
            ${data.priceDifference > 0 ? '+' : data.priceDifference < 0 ? '-' : ''}${formatCurrency(Math.abs(data.priceDifference))}
          </td>
        </tr>
      </table>
    </div>

    ${paymentAdjustmentHtml}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📅 Your Trip Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 4px 0; color: #1e40af; font-size: 14px;">
        <strong>Package:</strong> ${data.packageName}
      </p>
      <p style="margin: 4px 0; color: #1e40af; font-size: 14px;">
        <strong>Check-in:</strong> ${formatDate(data.tripStartDate)}
      </p>
      <p style="margin: 4px 0; color: #1e40af; font-size: 14px;">
        <strong>Check-out:</strong> ${formatDate(data.tripEndDate)}
      </p>
      <p style="margin: 4px 0; color: #1e40af; font-size: 14px;">
        <strong>Destination:</strong> ${data.destination}
      </p>
    </div>

    <div style="margin: 32px 0; text-align: center;">
      <a href="${portalUrl}" style="display: inline-block; padding: 14px 32px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Updated Booking
      </a>
    </div>

    <h2 style="color: #111827; font-size: 18px; margin: 32px 0 16px 0;">Important Reminders</h2>

    <div style="margin: 16px 0; padding: 16px; background-color: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 4px 0; color: #78350f; font-size: 14px;">
        • <strong>Modification window:</strong> You can modify add-ons only 60+ days before your trip
      </p>
      <p style="margin: 4px 0; color: #78350f; font-size: 14px;">
        • <strong>Locked items:</strong> Base package, duration, and accommodation cannot be modified
      </p>
      <p style="margin: 4px 0; color: #78350f; font-size: 14px;">
        • <strong>Need help?</strong> Contact us at support@thepickleballpassport.org
      </p>
    </div>

    <p style="margin: 32px 0 16px 0;">
      We're here to make your journey perfect! If you have any questions about your modified
      booking, don't hesitate to reach out.
    </p>

    <p>
      Safe travels,<br/>
      <strong>The Pickleball Passport Team</strong>
    </p>
  `

  const htmlContent = baseEmailTemplate({
    title: `Booking Modified - ${data.bookingReference}`,
    content,
    preheader: 'Your booking has been successfully modified'
  })
  const textContent = generatePlainText(`
Booking Modified Successfully!

Hi ${data.firstName},

Your booking has been successfully modified. Below is a summary of the changes.

Booking Reference: ${data.bookingReference}

CHANGES SUMMARY:

${data.addedAddOns.length > 0 ? `Added:\n${data.addedAddOns.map(a => `- ${a.name}: ${formatCurrency(a.price)}`).join('\n')}` : ''}

${data.removedAddOns.length > 0 ? `Removed:\n${data.removedAddOns.map(a => `- ${a.name}: ${formatCurrency(a.price)}`).join('\n')}` : ''}

PRICE COMPARISON:

Original Add-Ons Total: ${formatCurrency(data.originalTotal)}
New Add-Ons Total: ${formatCurrency(data.newTotal)}
Price ${data.priceDifference > 0 ? 'Increase' : data.priceDifference < 0 ? 'Decrease' : 'Change'}: ${data.priceDifference > 0 ? '+' : data.priceDifference < 0 ? '-' : ''}${formatCurrency(Math.abs(data.priceDifference))}

PAYMENT ADJUSTMENT:

${data.adjustmentType === 'charge'
  ? `We've charged ${formatCurrency(Math.abs(data.priceDifference))} to your card.`
  : data.adjustmentType === 'refund'
  ? `A refund of ${formatCurrency(Math.abs(data.priceDifference))} will appear on your card within 5-10 business days.`
  : 'No payment adjustment needed.'
}

YOUR TRIP DETAILS:

Package: ${data.packageName}
Check-in: ${formatDate(data.tripStartDate)}
Check-out: ${formatDate(data.tripEndDate)}
Destination: ${data.destination}

View your updated booking: ${portalUrl}

IMPORTANT REMINDERS:

• Modifications allowed only 60+ days before trip
• Base package, duration, and accommodation cannot be modified
• Need help? Email support@thepickleballpassport.org

Safe travels,
The Pickleball Passport Team
  `)

  return {
    html: htmlContent,
    text: textContent,
    subject: `Booking Modified - ${data.bookingReference}`
  }
}
