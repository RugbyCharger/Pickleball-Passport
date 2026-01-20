'use client';

/**
 * Email Preview Admin Page
 *
 * Allows admins to preview all email templates with sample data
 */

import { useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateBookingConfirmationEmail } from '@/lib/email/templates/booking-confirmation';
import { generatePaymentReceiptEmail } from '@/lib/email/templates/payment-receipt';
import { generateTripReminderEmail } from '@/lib/email/templates/trip-reminder';
import { generateDocumentApprovalEmail } from '@/lib/email/templates/document-approval';
import { generateDocumentRejectionEmail } from '@/lib/email/templates/document-rejection';
import { generateWelcomeEmail } from '@/lib/email/templates/welcome';
import { generateApplicationConfirmationEmail } from '@/lib/email/templates/application-confirmation';

type EmailTemplate =
  | 'booking-confirmation'
  | 'payment-receipt'
  | 'trip-reminder'
  | 'document-approval'
  | 'document-rejection'
  | 'welcome'
  | 'application-confirmation';

const emailTemplates: { value: EmailTemplate; label: string }[] = [
  { value: 'booking-confirmation', label: 'Booking Confirmation' },
  { value: 'payment-receipt', label: 'Payment Receipt' },
  { value: 'trip-reminder', label: 'Trip Reminder (7 days)' },
  { value: 'document-approval', label: 'Document Approval' },
  { value: 'document-rejection', label: 'Document Rejection' },
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'application-confirmation', label: 'Application Confirmation' },
];

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>('booking-confirmation');
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');

  // Use stable timestamps (captured once) to avoid impure calls during render
  const [now] = useState(() => Date.now());
  const today = new Date(now).toISOString();
  const futureDate = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
  const tripStart = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
  const tripEnd = new Date(now + 37 * 24 * 60 * 60 * 1000).toISOString();
  const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();

  // Generate sample data for the selected template
  const getEmailContent = () => {
    switch (selectedTemplate) {
      case 'booking-confirmation':
        return generateBookingConfirmationEmail({
          firstName: 'Sarah',
          email: 'sarah@example.com',
          bookingReference: 'ABC12345',
          packageName: 'Complete Transformation Package',
          duration: 14,
          accommodationTier: 'Premium Suite',
          tripStartDate: tripStart,
          tripEndDate: tripEnd,
          destination: 'Chiang Mai, Thailand',
          basePrice: 450000,
          accommodationPrice: 150000,
          addOnsTotal: 50000,
          totalPrice: 650000,
          addOns: [
            { name: 'Thai Massage Session (3x)', quantity: 3, price: 30000 },
            { name: 'Private Pickleball Coaching', quantity: 1, price: 20000 },
          ],
        });

      case 'payment-receipt':
        return generatePaymentReceiptEmail({
          firstName: 'Sarah',
          email: 'sarah@example.com',
          receiptNumber: 'RCPT-98765',
          paymentDate: today,
          paymentMethod: 'Visa ending in 4242',
          bookingReference: 'ABC12345',
          packageName: 'Complete Transformation Package',
          items: [
            { description: 'Complete Transformation Package - 14 days', amount: 450000 },
            { description: 'Premium Suite Accommodation', amount: 150000 },
            { description: 'Thai Massage Session (3x)', quantity: 3, amount: 30000 },
            { description: 'Private Pickleball Coaching', quantity: 1, amount: 20000 },
          ],
          subtotal: 650000,
          totalAmount: 650000,
          notes: 'Thank you for your payment. Your booking is now confirmed!',
        });

      case 'trip-reminder':
        return generateTripReminderEmail({
          firstName: 'Sarah',
          email: 'sarah@example.com',
          bookingReference: 'ABC12345',
          packageName: 'Complete Transformation Package',
          tripStartDate: futureDate,
          tripEndDate: new Date(new Date(futureDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          destination: 'Chiang Mai, Thailand',
          accommodationTier: 'Premium Suite',
          daysUntilTrip: 7,
          checklistItems: [
            { item: 'Upload passport copy', completed: true },
            { item: 'Complete medical questionnaire', completed: true },
            { item: 'Purchase travel insurance', completed: false },
            { item: 'Notify your bank of travel plans', completed: false },
          ],
          addOns: [
            { name: 'Thai Massage Session (3x)', quantity: 3 },
            { name: 'Private Pickleball Coaching', quantity: 1 },
          ],
        });

      case 'document-approval':
        return generateDocumentApprovalEmail({
          firstName: 'Sarah',
          email: 'sarah@example.com',
          documentType: 'PASSPORT',
          documentTypeFriendly: 'Passport Copy',
          uploadedDate: twoDaysAgo,
          reviewedDate: today,
          bookingReference: 'ABC12345',
          notes: 'Everything looks perfect! Your passport is valid and clearly readable.',
        });

      case 'document-rejection':
        return generateDocumentRejectionEmail({
          firstName: 'Sarah',
          email: 'sarah@example.com',
          documentType: 'PASSPORT',
          documentTypeFriendly: 'Passport Copy',
          uploadedDate: twoDaysAgo,
          reviewedDate: today,
          bookingReference: 'ABC12345',
          reason: 'The image appears to have glare on the photo page, making it difficult to read your passport number. Please upload a new photo without glare.',
          commonIssues: [
            'Shows all pages clearly (photo page, expiration date)',
            'Is valid for at least 6 months from travel date',
            'Has no glare or shadows obscuring text',
            'Shows your full legal name as it appears on flight bookings',
            'Is a color scan or photo (not black and white)',
          ],
        });

      case 'welcome':
        return generateWelcomeEmail({
          firstName: 'Sarah',
          email: 'sarah@example.com',
        });

      case 'application-confirmation':
        return generateApplicationConfirmationEmail({
          firstName: 'Sarah',
          email: 'sarah@example.com',
          applicationId: 'APP-87654',
          interests: ['dental', 'wellness', 'pickleball'],
          preferredDuration: '10-14',
        });

      default:
        return { html: '', text: '', subject: '' };
    }
  };

  const emailContent = getEmailContent();

  return (
    <div className="space-y-6">
      {/* Template Management Banner */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-900">New Template Management</p>
              <p className="text-sm text-emerald-700">
                Create and manage database-driven email templates with live preview
              </p>
            </div>
          </div>
          <Link href="/dashboard/admin/emails/templates">
            <Button className="gap-2">
              Manage Templates
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Email Preview (Legacy)</h1>
        <p className="mt-2 text-gray-600">
          Preview code-based email templates with sample data
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Template Selector */}
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
              Email Template
            </label>
            <select
              id="template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as EmailTemplate)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {emailTemplates.map((template) => (
                <option key={template.value} value={template.value}>
                  {template.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Selector */}
          <div>
            <label htmlFor="viewMode" className="block text-sm font-medium text-gray-700 mb-2">
              View Mode
            </label>
            <select
              id="viewMode"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'html' | 'text')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="html">HTML Preview</option>
              <option value="text">Plain Text</option>
            </select>
          </div>
        </div>

        {/* Subject Line */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Line
          </label>
          <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-medium">
            {emailContent.subject}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Email Preview</h2>
        </div>

        {viewMode === 'html' ? (
          <div className="p-6">
            <div
              className="border border-gray-200 rounded-lg overflow-hidden"
              style={{ minHeight: '600px' }}
            >
              <iframe
                srcDoc={emailContent.html}
                className="w-full h-full"
                style={{ minHeight: '800px' }}
                title="Email Preview"
              />
            </div>
          </div>
        ) : (
          <div className="p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-gray-50 p-6 rounded-lg border border-gray-200 overflow-auto">
              {emailContent.text}
            </pre>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Email Template Tips</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>All emails use the same base template for consistent branding</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Templates are fully responsive and look great on mobile devices</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Plain text versions are automatically generated for email clients that don&apos;t support HTML</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>All templates include dynamic variables that populate with real user data</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Document rejection emails include helpful tips specific to each document type</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
