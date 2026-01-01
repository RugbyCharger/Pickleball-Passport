# Story 4.8: Receipt Generation

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a guest who made a successful payment,
I want to receive a downloadable PDF receipt,
So that I have an official document for my records and expense reporting.

## Acceptance Criteria

### AC-1: PDF Receipt Generation

- [ ] Generate professional PDF receipt for successful payments
- [ ] Triggered automatically when `payment_intent.succeeded` webhook is received
- [ ] PDF generated server-side (not client-side)
- [ ] Include receipt number in format: `RCPT-YYYYMMDD-XXXXX` (e.g., `RCPT-20260102-00123`)
- [ ] Store receipt metadata in Payment record (receipt number, generation timestamp)

### AC-2: PDF Content - Header Section

- [ ] Company branding: Pickleball Passport logo
- [ ] Receipt title: "PAYMENT RECEIPT" (bold, prominent)
- [ ] Receipt number (top right)
- [ ] Receipt date (current date, formatted)
- [ ] Company information:
  - Pickleball Passport LLC
  - 123 Wellness Way, Suite 100
  - San Diego, CA 92101
  - +1 (555) 123-4567
  - hello@pickleballpassport.com

### AC-3: PDF Content - Guest Information

- [ ] Billed To section:
  - Guest name
  - Email address
  - Booking reference number
  - Payment date

### AC-4: PDF Content - Itemized Payment Details

- [ ] Table with line items:
  - Package name and description
  - Accommodation tier upgrade (if applicable)
  - Medical/cosmetic add-ons (itemized)
  - Wellness/cultural add-ons (itemized)
  - Subtotal
  - Taxes/fees (if applicable)
  - Total amount
- [ ] All amounts formatted with currency symbol ($)
- [ ] Two decimal places for all amounts
- [ ] Clear visual separation between line items and totals

### AC-5: PDF Content - Payment Information

- [ ] Payment method (e.g., "Visa ending in 4242")
- [ ] Transaction ID (Stripe Payment Intent ID)
- [ ] Payment status: "PAID" (green badge or bold text)
- [ ] Payment date and time (formatted)

### AC-6: PDF Content - Booking Summary

- [ ] Trip details:
  - Destination (e.g., "Phuket, Thailand")
  - Travel dates (start - end date)
  - Duration (days)
  - Package tier (e.g., "Pure Play Package")

### AC-7: PDF Content - Footer Section

- [ ] Legal disclaimer: "This receipt is for your records. Please retain for tax purposes."
- [ ] Company legal information
- [ ] Support contact information
- [ ] Optional: QR code linking to booking details (future enhancement)
- [ ] Page number (if multi-page)

### AC-8: PDF Design Requirements

- [ ] Professional, clean design matching brand
- [ ] Brand colors: Ocean blue (#003D5C), Gold accents (#D4AF37)
- [ ] Print-friendly (black text on white background)
- [ ] Consistent typography (easy to read)
- [ ] PDF metadata (title, author, subject, creation date)
- [ ] Optimized file size (< 500KB)

### AC-9: Storage Strategy

**Option A: Supabase Storage (Recommended)**
- [ ] Upload generated PDF to Supabase Storage bucket: `receipts/`
- [ ] File naming: `{bookingReference}/{receiptNumber}.pdf`
- [ ] Store URL in Payment model: `receiptUrl` field
- [ ] Set appropriate permissions (authenticated users only)
- [ ] Retention policy: Keep indefinitely for tax/audit purposes

**Option B: Generate On-Demand**
- [ ] Generate PDF when user clicks download button
- [ ] No storage required (stateless generation)
- [ ] Cache receipt data in Payment model
- [ ] May be slower but simpler

**Decision:** Use Option A (Supabase Storage) for better UX and reliability.

### AC-10: Email Integration

- [ ] Attach PDF receipt to payment receipt email (E11-S5)
- [ ] Include download link in email body
- [ ] Email attachment size validation (< 5MB)
- [ ] Fallback: If attachment fails, include download link only

### AC-11: Download Endpoint

- [ ] Create API endpoint: `GET /api/receipts/[receiptId]/download`
- [ ] Verify user authentication (Clerk)
- [ ] Verify user owns the receipt (payment belongs to user's booking)
- [ ] Return PDF with appropriate headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="receipt-{receiptNumber}.pdf"`
- [ ] Handle errors gracefully (receipt not found, unauthorized)

### AC-12: Guest Dashboard Integration

- [ ] Add "Download Receipt" button to booking details page
- [ ] Display receipt number and generation date
- [ ] Button triggers download via `/api/receipts/[receiptId]/download`
- [ ] Show success toast after download
- [ ] Handle errors (receipt not generated, download failed)
- [ ] Optional: Show PDF preview in modal before download

### AC-13: PDF Library Selection

**Option A: @react-pdf/renderer (Recommended)**
- [x] Pros: React-based, easy styling, great for complex layouts
- [x] Pros: Supports JSX syntax, familiar to React developers
- [x] Cons: Larger bundle size, requires React runtime
- [x] Use case: Best for professional receipts with complex design

**Option B: jsPDF**
- [ ] Pros: Lightweight, simple API
- [ ] Cons: Manual positioning, harder for complex layouts
- [ ] Use case: Best for simple documents

**Option C: pdfkit**
- [ ] Pros: Node.js native, powerful
- [ ] Cons: Steeper learning curve, manual layout
- [ ] Use case: Best for server-side generation

**Decision:** Use @react-pdf/renderer for professional design and maintainability.

### AC-14: Database Schema Updates

- [ ] Add fields to Payment model:
  ```prisma
  model Payment {
    // ... existing fields ...
    receiptNumber String?   // Format: RCPT-YYYYMMDD-XXXXX
    receiptUrl    String?   // Supabase Storage URL
    receiptGeneratedAt DateTime? // When PDF was generated
    // ... rest of model ...
  }
  ```
- [ ] Create migration: `npx prisma migrate dev --name add-receipt-fields`
- [ ] Generate Prisma client: `npx prisma generate`

### AC-15: Webhook Integration

- [ ] Integrate PDF generation into `handlePaymentSuccess` function
- [ ] Generate PDF AFTER payment record is updated to SUCCEEDED
- [ ] Generate receipt number sequentially or using CUID
- [ ] Upload PDF to Supabase Storage
- [ ] Update Payment record with receipt URL and number
- [ ] Attach PDF to payment receipt email
- [ ] Handle errors gracefully (log error, don't block webhook)
- [ ] Non-blocking: PDF generation shouldn't fail webhook processing

### AC-16: Error Handling

- [ ] If PDF generation fails: Log error, send email without attachment
- [ ] If storage upload fails: Retry once, then log error
- [ ] If receipt already exists: Skip generation (idempotent)
- [ ] All errors logged with context (booking reference, payment ID)
- [ ] No sensitive data in logs (card numbers, CVV)
- [ ] Graceful degradation: Receipt email still sent without PDF

### AC-17: Testing

- [ ] Test PDF generation with real payment data
- [ ] Verify PDF renders correctly (font, layout, spacing)
- [ ] Test with different payment amounts (formatting)
- [ ] Test with long package names (text wrapping)
- [ ] Test with multiple add-ons (pagination if needed)
- [ ] Verify download endpoint authentication
- [ ] Test storage upload and retrieval
- [ ] Verify email attachment delivery
- [ ] Test on mobile devices (download button, PDF viewer)

### AC-18: Security Requirements

- [ ] Receipt download requires authentication (Clerk)
- [ ] User can only download their own receipts (ownership check)
- [ ] Receipt URLs are not predictable (use CUID or UUID)
- [ ] Supabase Storage permissions: Authenticated users only
- [ ] No sensitive data exposed in PDF (full card number, CVV)
- [ ] HTTPS for all receipt downloads
- [ ] Rate limiting on download endpoint (prevent abuse)

### AC-19: Performance Optimization

- [ ] PDF generation completes within 5 seconds (webhook timeout)
- [ ] If generation takes longer, move to background job
- [ ] Cache receipt number generation (avoid DB queries)
- [ ] Optimize PDF file size (compress images, use web fonts)
- [ ] Consider lazy loading PDF preview in dashboard

### AC-20: Documentation

- [ ] Update Dev Notes with PDF generation workflow
- [ ] Document receipt number format and generation logic
- [ ] Add inline comments to PDF template code
- [ ] Document Supabase Storage setup (bucket creation, permissions)
- [ ] Add README section for receipt generation
- [ ] Document troubleshooting steps for common issues

## Tasks / Subtasks

- [ ] Task 1: Setup & Dependencies (AC: 13, 14)
  - [ ] Subtask 1.1: Install @react-pdf/renderer: `npm install @react-pdf/renderer`
  - [ ] Subtask 1.2: Add receipt fields to Payment model in Prisma schema
  - [ ] Subtask 1.3: Create migration: `npx prisma migrate dev --name add-receipt-fields`
  - [ ] Subtask 1.4: Generate Prisma client: `npx prisma generate`
  - [ ] Subtask 1.5: Verify migration in development database
  - [ ] Subtask 1.6: Configure Supabase Storage bucket: `receipts/`
  - [ ] Subtask 1.7: Set Supabase bucket permissions (authenticated users)

- [ ] Task 2: PDF Template Creation (AC: 2, 3, 4, 5, 6, 7, 8)
  - [ ] Subtask 2.1: Create PDF template file: `lib/pdf/templates/payment-receipt.tsx`
  - [ ] Subtask 2.2: Define TypeScript interface for receipt data
  - [ ] Subtask 2.3: Build PDF structure using @react-pdf/renderer components
  - [ ] Subtask 2.4: Add header section (logo, receipt number, company info)
  - [ ] Subtask 2.5: Add guest information section
  - [ ] Subtask 2.6: Add itemized payment details table
  - [ ] Subtask 2.7: Add payment information section
  - [ ] Subtask 2.8: Add booking summary section
  - [ ] Subtask 2.9: Add footer section (legal, support info)
  - [ ] Subtask 2.10: Apply brand styling (colors, fonts, layout)
  - [ ] Subtask 2.11: Test PDF rendering locally (generate sample PDF)

- [ ] Task 3: Receipt Number Generation (AC: 1)
  - [ ] Subtask 3.1: Create utility function: `generateReceiptNumber()`
  - [ ] Subtask 3.2: Format: `RCPT-YYYYMMDD-{5-digit sequential}`
  - [ ] Subtask 3.3: Use current date for YYYYMMDD portion
  - [ ] Subtask 3.4: Generate sequential number or use CUID for uniqueness
  - [ ] Subtask 3.5: Ensure no duplicates (check existing receipts)
  - [ ] Subtask 3.6: Test receipt number generation (multiple receipts same day)

- [ ] Task 4: PDF Generation Service (AC: 1, 9)
  - [ ] Subtask 4.1: Create service file: `lib/pdf/receipt-generator.ts`
  - [ ] Subtask 4.2: Export function: `generatePaymentReceipt(payment, booking, user)`
  - [ ] Subtask 4.3: Prepare receipt data from payment/booking objects
  - [ ] Subtask 4.4: Generate receipt number
  - [ ] Subtask 4.5: Render PDF using @react-pdf/renderer
  - [ ] Subtask 4.6: Convert to Buffer for storage
  - [ ] Subtask 4.7: Return PDF Buffer and receipt number
  - [ ] Subtask 4.8: Handle errors gracefully (log, throw with context)

- [ ] Task 5: Supabase Storage Integration (AC: 9)
  - [ ] Subtask 5.1: Create storage service: `lib/storage/supabase-storage.ts`
  - [ ] Subtask 5.2: Initialize Supabase client (use existing config or create new)
  - [ ] Subtask 5.3: Export function: `uploadReceipt(buffer, bookingReference, receiptNumber)`
  - [ ] Subtask 5.4: Upload PDF to `receipts/{bookingReference}/{receiptNumber}.pdf`
  - [ ] Subtask 5.5: Return public URL (signed or public based on permissions)
  - [ ] Subtask 5.6: Handle upload errors (retry once, then throw)
  - [ ] Subtask 5.7: Test upload and retrieval locally

- [ ] Task 6: Download Endpoint (AC: 11, 18)
  - [ ] Subtask 6.1: Create API route: `app/api/receipts/[receiptId]/download/route.ts`
  - [ ] Subtask 6.2: Verify user authentication using Clerk
  - [ ] Subtask 6.3: Find Payment record by receipt ID
  - [ ] Subtask 6.4: Verify ownership (payment.booking.userId === currentUser.id)
  - [ ] Subtask 6.5: Fetch PDF from Supabase Storage using receiptUrl
  - [ ] Subtask 6.6: Return PDF with correct headers (Content-Type, Content-Disposition)
  - [ ] Subtask 6.7: Handle errors (404 if not found, 403 if unauthorized)
  - [ ] Subtask 6.8: Add rate limiting (max 10 downloads per minute per user)
  - [ ] Subtask 6.9: Test endpoint with authentication

- [ ] Task 7: Webhook Integration (AC: 15, 16)
  - [ ] Subtask 7.1: Import receipt generation service in webhook route
  - [ ] Subtask 7.2: Call in `handlePaymentSuccess` AFTER payment update
  - [ ] Subtask 7.3: Generate PDF with payment/booking/user data
  - [ ] Subtask 7.4: Upload PDF to Supabase Storage
  - [ ] Subtask 7.5: Update Payment record with receiptUrl and receiptNumber
  - [ ] Subtask 7.6: Wrap in try-catch (log errors, don't block webhook)
  - [ ] Subtask 7.7: Test with Stripe CLI webhook trigger

- [ ] Task 8: Email Attachment Integration (AC: 10)
  - [ ] Subtask 8.1: Modify `sendPaymentReceipt()` in `lib/email/sendgrid.ts`
  - [ ] Subtask 8.2: Accept optional PDF Buffer parameter
  - [ ] Subtask 8.3: Attach PDF to email using SendGrid attachments API
  - [ ] Subtask 8.4: Base64 encode PDF Buffer for SendGrid
  - [ ] Subtask 8.5: Set attachment filename: `receipt-{receiptNumber}.pdf`
  - [ ] Subtask 8.6: Fallback: If attachment fails, include download link only
  - [ ] Subtask 8.7: Test email with PDF attachment

- [ ] Task 9: Guest Dashboard Integration (AC: 12)
  - [ ] Subtask 9.1: Update booking details page: `app/dashboard/bookings/[id]/page.tsx`
  - [ ] Subtask 9.2: Fetch payment data with receipt information
  - [ ] Subtask 9.3: Add "Download Receipt" button (conditional on receiptUrl exists)
  - [ ] Subtask 9.4: Button triggers download: `window.open(/api/receipts/${paymentId}/download)`
  - [ ] Subtask 9.5: Show receipt number and generation date below button
  - [ ] Subtask 9.6: Handle download errors (toast notification)
  - [ ] Subtask 9.7: Optional: Add PDF preview modal (iframe or object tag)
  - [ ] Subtask 9.8: Test download button on desktop and mobile

- [ ] Task 10: Testing & Validation (AC: 17, 19)
  - [ ] Subtask 10.1: Test full flow: Payment → PDF generation → Storage → Email
  - [ ] Subtask 10.2: Verify PDF content accuracy (amounts, dates, formatting)
  - [ ] Subtask 10.3: Test PDF rendering (font, layout, spacing)
  - [ ] Subtask 10.4: Test with different payment amounts
  - [ ] Subtask 10.5: Test with multiple add-ons (check pagination)
  - [ ] Subtask 10.6: Test download endpoint authentication
  - [ ] Subtask 10.7: Test ownership verification (try downloading another user's receipt)
  - [ ] Subtask 10.8: Test email attachment delivery
  - [ ] Subtask 10.9: Test on mobile devices (download, PDF viewer)
  - [ ] Subtask 10.10: Run TypeScript validation: `npx tsc --noEmit`
  - [ ] Subtask 10.11: Verify PDF file size (< 500KB)
  - [ ] Subtask 10.12: Measure PDF generation time (< 5 seconds)

- [ ] Task 11: Documentation (AC: 20)
  - [ ] Subtask 11.1: Add inline comments to PDF template
  - [ ] Subtask 11.2: Document receipt generation workflow in Dev Notes
  - [ ] Subtask 11.3: Document receipt number format and logic
  - [ ] Subtask 11.4: Document Supabase Storage setup steps
  - [ ] Subtask 11.5: Add troubleshooting guide for common issues
  - [ ] Subtask 11.6: Update README with receipt generation feature

## Dev Notes

### Architecture Requirements (MUST FOLLOW)

**Existing Infrastructure:**
- Payment webhook handler: `app/api/webhooks/stripe/route.ts` (E4-S4)
- Payment receipt email: `lib/email/templates/payment-receipt.ts` (E11-S5)
- SendGrid integration: `lib/email/sendgrid.ts` (E11-S1)
- Payment model: `prisma/schema.prisma` (has payment details)

**What Needs to Be Added:**
1. @react-pdf/renderer dependency
2. PDF template for payment receipt
3. Receipt number generation utility
4. PDF generation service
5. Supabase Storage integration
6. Download API endpoint
7. Guest dashboard download button
8. Email attachment integration

**Critical Implementation Notes:**
- ✅ Webhook handler ALREADY processes payments (E4-S4)
- ✅ Payment receipt email ALREADY sent (E11-S5)
- ⚠️ PDF receipt generation NOT implemented yet
- ⚠️ Must be non-blocking (don't fail webhook if PDF generation fails)
- ⚠️ PDF generation must complete within 5 seconds (Stripe webhook timeout)

### PDF Library: @react-pdf/renderer

**Why @react-pdf/renderer?**
- React-based API (familiar to team)
- Declarative JSX syntax
- Easy styling with stylesheet API
- Supports complex layouts (tables, images, page breaks)
- Active maintenance and community support
- Professional output quality

**Installation:**
```bash
npm install @react-pdf/renderer
```

**Basic Usage:**
```typescript
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from '@react-pdf/renderer'

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30
  },
  section: {
    margin: 10,
    padding: 10
  }
})

// Create PDF component
const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Section #1</Text>
      </View>
    </Page>
  </Document>
)

// Generate PDF Buffer (server-side)
const buffer = await pdf(<MyDocument />).toBuffer()
```

### Receipt Number Generation

**Format:** `RCPT-YYYYMMDD-XXXXX`

**Example:** `RCPT-20260102-00123`

**Implementation:**
```typescript
// lib/pdf/receipt-number.ts

import { prisma } from '@/lib/prisma'

/**
 * Generate unique receipt number
 * Format: RCPT-YYYYMMDD-XXXXX (e.g., RCPT-20260102-00123)
 */
export async function generateReceiptNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD

  // Get count of receipts generated today
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))
  const endOfDay = new Date(today.setHours(23, 59, 59, 999))

  const count = await prisma.payment.count({
    where: {
      receiptGeneratedAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  })

  // Generate sequential number (pad with zeros)
  const sequence = String(count + 1).padStart(5, '0')

  return `RCPT-${dateStr}-${sequence}`
}
```

**Alternative: CUID-based (Simpler, No DB Query)**
```typescript
import { cuid } from '@paralleldrive/cuid2'

export function generateReceiptNumber(): string {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const uniqueId = cuid().slice(0, 5).toUpperCase() // Use first 5 chars of CUID

  return `RCPT-${dateStr}-${uniqueId}`
}
```

**Recommendation:** Use CUID-based approach for simplicity and performance.

### PDF Template Structure

**File:** `lib/pdf/templates/payment-receipt.tsx`

**Data Interface:**
```typescript
export interface PaymentReceiptPDFData {
  // Receipt Information
  receiptNumber: string // RCPT-20260102-00123
  receiptDate: string // ISO date

  // Guest Information
  guestName: string
  guestEmail: string

  // Payment Details
  bookingReference: string
  paymentAmount: number // in cents
  paymentDate: string // ISO date
  paymentMethod: string // "Visa ending in 4242"
  transactionId: string // Stripe Payment Intent ID

  // Line Items
  lineItems: Array<{
    description: string
    quantity?: number
    unitPrice?: number
    amount: number
  }>
  subtotal: number
  tax?: number
  total: number

  // Booking Summary
  packageName: string
  destination: string
  travelDates: string
  duration: number
  accommodationTier: string
}
```

**Template Structure:**
```typescript
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer'

// Register fonts (optional, for custom fonts)
// Font.register({ family: 'Roboto', src: 'path/to/font.ttf' })

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#003D5C'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003D5C'
  },
  receiptNumber: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#003D5C',
    marginBottom: 10
  },
  table: {
    display: 'table' as any,
    width: '100%',
    marginBottom: 20
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    fontWeight: 'bold'
  },
  tableCol: {
    flex: 1,
    fontSize: 10
  },
  tableColRight: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#003D5C',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#10B981'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#6B7280',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10
  }
})

export const PaymentReceiptPDF: React.FC<{ data: PaymentReceiptPDFData }> = ({ data }) => {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>PAYMENT RECEIPT</Text>
            <Text style={{ fontSize: 10, color: '#6B7280' }}>Pickleball Passport</Text>
          </View>
          <View>
            <Text style={styles.receiptNumber}>Receipt #: {data.receiptNumber}</Text>
            <Text style={styles.receiptNumber}>Date: {formatDate(data.receiptDate)}</Text>
          </View>
        </View>

        {/* Guest Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billed To:</Text>
          <Text style={{ fontSize: 10 }}>{data.guestName}</Text>
          <Text style={{ fontSize: 10, color: '#6B7280' }}>{data.guestEmail}</Text>
          <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 5 }}>
            Booking Reference: {data.bookingReference}
          </Text>
        </View>

        {/* Payment Details Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details:</Text>

          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCol, { flex: 3 }]}>Description</Text>
            <Text style={styles.tableColRight}>Amount</Text>
          </View>

          {/* Line Items */}
          {data.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 3 }]}>{item.description}</Text>
              <Text style={styles.tableColRight}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}

          {/* Subtotal */}
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.tableCol, { flex: 3, textAlign: 'right', fontWeight: 'bold' }]}>
              Subtotal:
            </Text>
            <Text style={styles.tableColRight}>{formatCurrency(data.subtotal)}</Text>
          </View>

          {/* Tax (if applicable) */}
          {data.tax && (
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.tableCol, { flex: 3, textAlign: 'right', fontWeight: 'bold' }]}>
                Tax:
              </Text>
              <Text style={styles.tableColRight}>{formatCurrency(data.tax)}</Text>
            </View>
          )}

          {/* Total */}
          <View style={styles.totalRow}>
            <Text>TOTAL PAID:</Text>
            <Text>{formatCurrency(data.total)}</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information:</Text>
          <View style={{ fontSize: 10 }}>
            <Text>Payment Method: {data.paymentMethod}</Text>
            <Text style={{ marginTop: 5 }}>Payment Date: {formatDate(data.paymentDate)}</Text>
            <Text style={{ marginTop: 5, color: '#6B7280', fontSize: 8 }}>
              Transaction ID: {data.transactionId}
            </Text>
            <Text style={{ marginTop: 10, color: '#10B981', fontWeight: 'bold' }}>
              Status: PAID ✓
            </Text>
          </View>
        </View>

        {/* Trip Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Summary:</Text>
          <View style={{ fontSize: 10 }}>
            <Text>Package: {data.packageName}</Text>
            <Text style={{ marginTop: 5 }}>Destination: {data.destination}</Text>
            <Text style={{ marginTop: 5 }}>Travel Dates: {data.travelDates}</Text>
            <Text style={{ marginTop: 5 }}>Duration: {data.duration} days</Text>
            <Text style={{ marginTop: 5 }}>Accommodation: {data.accommodationTier}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Pickleball Passport LLC</Text>
          <Text>123 Wellness Way, Suite 100, San Diego, CA 92101</Text>
          <Text>+1 (555) 123-4567 | hello@pickleballpassport.com</Text>
          <Text style={{ marginTop: 10 }}>
            This receipt is for your records. Please retain for tax purposes.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
```

### PDF Generation Service

**File:** `lib/pdf/receipt-generator.ts`

```typescript
import { pdf } from '@react-pdf/renderer'
import { PaymentReceiptPDF, PaymentReceiptPDFData } from './templates/payment-receipt'
import { generateReceiptNumber } from './receipt-number'
import type { Payment, Booking, User, Package } from '@prisma/client'

/**
 * Generate Payment Receipt PDF
 *
 * Creates a professional PDF receipt for a successful payment.
 * Returns PDF Buffer and receipt number for storage.
 */
export async function generatePaymentReceipt(
  payment: Payment & {
    booking: Booking & {
      user: User
      package: Package
      trip?: { destination: string; startDate: Date; endDate: Date } | null
    }
  }
): Promise<{ buffer: Buffer; receiptNumber: string }> {
  try {
    // Generate unique receipt number
    const receiptNumber = generateReceiptNumber()

    // Prepare line items
    const lineItems: Array<{ description: string; amount: number }> = [
      {
        description: payment.booking.package.name,
        amount: payment.booking.package.basePrice
      }
    ]

    // Add accommodation tier if upgraded
    if (payment.booking.accommodationTier !== 'Standard') {
      lineItems.push({
        description: `${payment.booking.accommodationTier} Accommodation Upgrade`,
        amount: 0 // Calculate from upgrade pricing
      })
    }

    // Add add-ons (if stored in booking)
    // TODO: Iterate over booking.addOns and add line items

    // Prepare receipt data
    const receiptData: PaymentReceiptPDFData = {
      receiptNumber,
      receiptDate: new Date().toISOString(),
      guestName: payment.booking.user.email.split('@')[0], // Fallback, use full name if available
      guestEmail: payment.booking.user.email,
      bookingReference: payment.booking.bookingReference,
      paymentAmount: payment.amount,
      paymentDate: payment.createdAt.toISOString(),
      paymentMethod: 'Credit Card', // TODO: Extract from Stripe PaymentIntent
      transactionId: payment.stripePaymentIntentId,
      lineItems,
      subtotal: payment.amount,
      total: payment.amount,
      packageName: payment.booking.package.name,
      destination: payment.booking.trip?.destination || 'TBD',
      travelDates: payment.booking.trip
        ? `${payment.booking.trip.startDate.toLocaleDateString()} - ${payment.booking.trip.endDate.toLocaleDateString()}`
        : 'TBD',
      duration: payment.booking.duration,
      accommodationTier: payment.booking.accommodationTier
    }

    // Generate PDF
    const pdfDoc = <PaymentReceiptPDF data={receiptData} />
    const buffer = await pdf(pdfDoc).toBuffer()

    console.log(`[PDF] Receipt generated: ${receiptNumber} (${buffer.length} bytes)`)

    return { buffer, receiptNumber }
  } catch (error) {
    console.error('[PDF] Failed to generate receipt:', error)
    throw new Error(`Receipt generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
```

### Supabase Storage Integration

**File:** `lib/storage/supabase-storage.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Upload Receipt PDF to Supabase Storage
 *
 * Uploads PDF to receipts bucket with path: {bookingReference}/{receiptNumber}.pdf
 */
export async function uploadReceipt(
  buffer: Buffer,
  bookingReference: string,
  receiptNumber: string
): Promise<string> {
  try {
    const fileName = `${receiptNumber}.pdf`
    const filePath = `${bookingReference}/${fileName}`

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: false // Don't overwrite existing receipts
      })

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath)

    console.log(`[Storage] Receipt uploaded: ${filePath}`)

    return publicUrl
  } catch (error) {
    console.error('[Storage] Failed to upload receipt:', error)
    throw error
  }
}

/**
 * Download Receipt PDF from Supabase Storage
 */
export async function downloadReceipt(receiptUrl: string): Promise<Buffer> {
  try {
    // Extract path from URL
    const url = new URL(receiptUrl)
    const pathMatch = url.pathname.match(/\/receipts\/(.+)$/)

    if (!pathMatch) {
      throw new Error('Invalid receipt URL')
    }

    const filePath = pathMatch[1]

    const { data, error } = await supabase.storage
      .from('receipts')
      .download(filePath)

    if (error) {
      throw new Error(`Supabase download failed: ${error.message}`)
    }

    const buffer = Buffer.from(await data.arrayBuffer())

    console.log(`[Storage] Receipt downloaded: ${filePath}`)

    return buffer
  } catch (error) {
    console.error('[Storage] Failed to download receipt:', error)
    throw error
  }
}
```

**Supabase Setup:**
```bash
# 1. Create bucket in Supabase dashboard
# Bucket name: receipts
# Public: No (authenticated users only)

# 2. Set bucket policies:
# - Allow authenticated users to read their own receipts
# - Allow service role to write receipts

# 3. Add environment variables:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Webhook Integration

**Update:** `app/api/webhooks/stripe/route.ts`

```typescript
// In handlePaymentSuccess function:

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  // ... existing code to update payment and booking ...

  // Generate and upload PDF receipt (non-blocking)
  try {
    const { generatePaymentReceipt } = await import('@/lib/pdf/receipt-generator')
    const { uploadReceipt } = await import('@/lib/storage/supabase-storage')

    // Generate PDF
    const { buffer, receiptNumber } = await generatePaymentReceipt(payment)

    // Upload to Supabase Storage
    const receiptUrl = await uploadReceipt(buffer, payment.booking.bookingReference, receiptNumber)

    // Update Payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        receiptNumber,
        receiptUrl,
        receiptGeneratedAt: new Date()
      }
    })

    console.log(`[Webhook] Receipt generated and uploaded: ${receiptNumber}`)

    // Send payment receipt email WITH PDF attachment
    const { sendPaymentReceipt } = await import('@/lib/email/sendgrid')

    await sendPaymentReceipt(payment.booking.user.email, {
      // ... existing email data ...
    }, buffer).catch(console.error) // Pass PDF buffer for attachment

  } catch (error) {
    console.error('[Webhook] Receipt generation failed (non-blocking):', error)
    // Don't fail webhook if receipt generation fails
  }

  // ... rest of webhook handler ...
}
```

### Download Endpoint

**File:** `app/api/receipts/[paymentId]/download/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { downloadReceipt } from '@/lib/storage/supabase-storage'

export async function GET(
  req: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    // Verify authentication
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find payment with booking and user
    const payment = await prisma.payment.findUnique({
      where: { id: params.paymentId },
      include: {
        booking: {
          include: {
            user: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (payment.booking.user.clerkId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - not your receipt' },
        { status: 403 }
      )
    }

    // Check if receipt exists
    if (!payment.receiptUrl) {
      return NextResponse.json(
        { error: 'Receipt not generated yet' },
        { status: 404 }
      )
    }

    // Download PDF from Supabase
    const buffer = await downloadReceipt(payment.receiptUrl)

    // Return PDF with correct headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${payment.receiptNumber}.pdf"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (error) {
    console.error('[API] Receipt download error:', error)
    return NextResponse.json(
      { error: 'Failed to download receipt' },
      { status: 500 }
    )
  }
}
```

### Guest Dashboard Integration

**Update:** `app/dashboard/bookings/[id]/page.tsx`

```typescript
// In booking details page component:

export default async function BookingDetailsPage({ params }: { params: { id: string } }) {
  // ... existing code to fetch booking ...

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      payment: true, // Include payment with receipt info
      package: true,
      trip: true
    }
  })

  return (
    <div>
      {/* ... existing booking details ... */}

      {/* Receipt Download Section */}
      {booking.payment?.receiptUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Receipt Number: {booking.payment.receiptNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Generated: {new Date(booking.payment.receiptGeneratedAt!).toLocaleDateString()}
                </p>
              </div>
              <Button
                onClick={() => {
                  window.open(`/api/receipts/${booking.payment!.id}/download`, '_blank')
                }}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### Email Attachment Integration

**Update:** `lib/email/sendgrid.ts`

```typescript
/**
 * Send Payment Receipt Email (with PDF attachment)
 */
export async function sendPaymentReceipt(
  email: string,
  data: PaymentReceiptData,
  pdfBuffer?: Buffer // Optional PDF attachment
): Promise<void> {
  try {
    const html = generatePaymentReceiptEmail(data)

    const msg: any = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'hello@pickleballpassport.com',
      subject: 'Payment Receipt - Pickleball Passport',
      html
    }

    // Attach PDF if provided
    if (pdfBuffer) {
      msg.attachments = [
        {
          content: pdfBuffer.toString('base64'),
          filename: `receipt-${data.bookingReference}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    }

    await sgMail.send(msg)

    console.log(`[Email] Payment receipt sent to ${email} ${pdfBuffer ? 'with PDF attachment' : ''}`)
  } catch (error) {
    console.error('[Email] Failed to send payment receipt:', error)
    // Don't throw - email failure shouldn't block webhook
  }
}
```

### Testing Workflow

**Local Testing:**
```bash
# 1. Start development server
npm run dev

# 2. Create Supabase bucket (if not exists)
# Go to Supabase dashboard → Storage → Create bucket: "receipts"

# 3. Trigger webhook with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded

# 4. Check logs for PDF generation
# 5. Verify PDF uploaded to Supabase Storage
# 6. Test download from guest dashboard
# 7. Check email for PDF attachment
```

**Production Testing:**
```bash
# 1. Deploy to production
# 2. Configure Stripe webhook endpoint in dashboard
# 3. Create test booking with test card
# 4. Complete payment
# 5. Verify PDF receipt generated
# 6. Download receipt from dashboard
# 7. Verify email attachment
```

### Common Pitfalls to Avoid

1. **❌ DON'T block webhook on PDF generation failure**
   - Wrap PDF generation in try-catch
   - Log errors, don't throw
   - Send email without attachment if PDF fails

2. **❌ DON'T exceed Stripe webhook timeout (5 seconds)**
   - PDF generation should be fast (< 2 seconds)
   - If slower, consider background job queue
   - Optimize PDF template (minimize images, fonts)

3. **❌ DON'T expose receipt URLs publicly**
   - Require authentication for downloads
   - Verify ownership before serving PDF
   - Use signed URLs or authentication-based access

4. **❌ DON'T include sensitive data in PDF**
   - Never include full card number or CVV
   - Only last 4 digits of card
   - Stripe transaction ID is safe

5. **❌ DON'T forget to handle missing data gracefully**
   - Some bookings may not have trip assigned
   - Add-ons may be optional
   - Use fallback values ("TBD", "Not selected", etc.)

6. **❌ DON'T create duplicate receipts**
   - Check if receiptNumber already exists before generating
   - Use unique constraint on receiptNumber in schema
   - Idempotent generation based on payment ID

7. **❌ DON'T forget to test mobile PDF viewers**
   - Some mobile browsers don't support PDF download
   - Consider alternative: Email attachment + download link
   - Test on iOS Safari, Android Chrome

### Performance Considerations

**PDF Generation Time:**
- Target: < 2 seconds per receipt
- Optimize: Minimize complex layouts, use web fonts
- If slower: Move to background job (Bull, Inngest)

**File Size:**
- Target: < 500KB per PDF
- Compress images if used
- Use system fonts instead of custom fonts

**Storage Costs:**
- Supabase: ~$0.021/GB/month
- Estimate: 500KB/receipt × 1000 receipts = 500MB = ~$0.01/month
- Retention: Keep indefinitely (tax/audit purposes)

**Rate Limiting:**
- Download endpoint: Max 10 downloads/minute/user
- Prevent abuse and excessive bandwidth usage

### Security Best Practices

**Authentication:**
- ✅ Require Clerk authentication for downloads
- ✅ Verify user owns the receipt (booking.userId === currentUser.id)
- ✅ Use HTTPS for all receipt downloads

**Data Privacy:**
- ✅ Only last 4 digits of card in PDF
- ✅ No CVV or full card number
- ✅ Stripe transaction ID is safe (not sensitive)

**Storage Security:**
- ✅ Supabase bucket: Authenticated users only
- ✅ No public access to receipts
- ✅ Service role key for server-side uploads

**Rate Limiting:**
- ✅ Prevent excessive downloads
- ✅ Protect against abuse
- ✅ Monitor download patterns

### Troubleshooting Guide

**Problem: PDF generation fails**
- Check: @react-pdf/renderer installed correctly
- Check: All required data present (payment, booking, user)
- Check: PDF template syntax (JSX errors)
- Check: Font loading issues

**Problem: Supabase upload fails**
- Check: SUPABASE_SERVICE_ROLE_KEY configured
- Check: Bucket "receipts" exists
- Check: File size within limits (< 5MB)
- Check: Network connectivity

**Problem: Download endpoint returns 403**
- Check: User authenticated (Clerk session valid)
- Check: User owns the receipt (booking.userId matches)
- Check: Payment has receiptUrl populated

**Problem: Email attachment not delivered**
- Check: PDF buffer passed to sendPaymentReceipt()
- Check: Base64 encoding correct
- Check: Attachment size < 10MB (SendGrid limit)
- Check: SendGrid logs for delivery errors

**Problem: PDF renders incorrectly**
- Check: Font compatibility
- Check: Layout overflow (long text)
- Check: Table pagination (many line items)
- Check: Test with different data sets

### Related Stories & Dependencies

**Depends On:**
- ✅ E4-S4: Webhook Handler (payment_intent.succeeded event)
- ✅ E11-S5: Payment Receipt Email (email template and SendGrid integration)
- ✅ E4-S2: Payment Intent Creation (payment processing)

**Unblocks:**
- E4-S10: Payment History View (can display receipt download links)
- E3-S16: Booking Modification (may need to regenerate receipt)

**Related Stories:**
- E4-S9: Refund Processing (may need refund receipt generation)
- E11-S3: Payment Reminder Emails (similar email attachment pattern)

### References

**@react-pdf/renderer Documentation:**
- [Getting Started](https://react-pdf.org/get-started)
- [Styling](https://react-pdf.org/styling)
- [Components](https://react-pdf.org/components)
- [Advanced Features](https://react-pdf.org/advanced)

**Supabase Storage:**
- [Storage Documentation](https://supabase.com/docs/guides/storage)
- [Upload Files](https://supabase.com/docs/guides/storage/uploads)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)

**SendGrid Attachments:**
- [Sending Attachments](https://docs.sendgrid.com/for-developers/sending-email/attachments-with-digioh)

**Code References:**
- Webhook handler: `app/api/webhooks/stripe/route.ts`
- Payment receipt email: `lib/email/templates/payment-receipt.ts`
- SendGrid service: `lib/email/sendgrid.ts`
- Payment model: `prisma/schema.prisma`

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

(To be filled by dev agent)

### Completion Notes

(To be filled by dev agent after implementation)

### File List

**Files to Create:**
1. `lib/pdf/templates/payment-receipt.tsx` - PDF template using @react-pdf/renderer
2. `lib/pdf/receipt-number.ts` - Receipt number generation utility
3. `lib/pdf/receipt-generator.ts` - PDF generation service
4. `lib/storage/supabase-storage.ts` - Supabase Storage integration
5. `app/api/receipts/[paymentId]/download/route.ts` - Download endpoint

**Files to Modify:**
1. `prisma/schema.prisma` - Add receipt fields to Payment model
2. `app/api/webhooks/stripe/route.ts` - Integrate PDF generation in webhook
3. `lib/email/sendgrid.ts` - Add PDF attachment to payment receipt email
4. `app/dashboard/bookings/[id]/page.tsx` - Add download button

**Migrations:**
1. Prisma migration: `add-receipt-fields`

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server-side storage access

**Dependencies:**
- `@react-pdf/renderer` - PDF generation library

**No Breaking Changes** - Enhances existing payment flow with receipt generation
