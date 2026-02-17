'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

/**
 * Admin Email Test Page
 *
 * Allows admins to test SendGrid email functionality
 */
export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Test Email from The Pickleball Passport');
  const [message, setMessage] = useState('This is a test email to verify SendGrid integration.');
  const [bookingEmail, setBookingEmail] = useState('');

  const { data: configStatus } = trpc.email.isConfigured.useQuery();
  const sendTestMutation = trpc.email.sendTest.useMutation();
  const sendBookingConfirmationMutation = trpc.email.sendBookingConfirmation.useMutation();

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await sendTestMutation.mutateAsync({
        to: email,
        subject,
        message,
      });

      toast.success(result.message);
      setEmail('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send test email');
    }
  };

  const handleSendBookingConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Mock booking data
      const result = await sendBookingConfirmationMutation.mutateAsync({
        email: bookingEmail,
        firstName: 'John',
        bookingReference: 'PP-2025-001234',
        packageName: 'Total Transformation Package',
        duration: 14,
        accommodationTier: 'Ultra-Luxury',
        tripStartDate: new Date(2025, 2, 15).toISOString(),
        tripEndDate: new Date(2025, 2, 29).toISOString(),
        destination: 'Chiang Mai, Thailand',
        basePrice: 449900, // $4,499.00
        accommodationPrice: 200000, // $2,000.00
        addOnsTotal: 89900, // $899.00
        totalPrice: 739800, // $7,398.00
        addOns: [
          {
            name: 'Full Set of Porcelain Veneers',
            quantity: 1,
            price: 59900,
          },
          {
            name: 'Advanced Pickleball Training (3 sessions)',
            quantity: 1,
            price: 30000,
          },
        ],
      });

      toast.success(result.message);
      setBookingEmail('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send booking confirmation email');
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Email Testing</h1>
        <p className="text-slate-600 mt-2">
          Test SendGrid integration and email delivery
        </p>
      </div>

      {/* Configuration Status */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">SendGrid Status</h2>
            <p className="text-sm text-slate-600 mt-1">
              Email service configuration status
            </p>
          </div>
          <div>
            {configStatus?.configured ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Configured
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                ✗ Not Configured
              </span>
            )}
          </div>
        </div>

        {!configStatus?.configured && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Warning:</strong> SendGrid API key is not configured.
              Set the <code className="bg-amber-100 px-1 py-0.5 rounded">SENDGRID_API_KEY</code> environment
              variable to enable email functionality.
            </p>
          </div>
        )}
      </Card>

      {/* Test Email Form */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Send Test Email</h2>

        <form onSubmit={handleSendTest} className="space-y-4">
          <div>
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              required
              disabled={!configStatus?.configured}
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
              disabled={!configStatus?.configured}
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Email message content..."
              rows={5}
              required
              disabled={!configStatus?.configured}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <Button
            type="submit"
            disabled={!configStatus?.configured || sendTestMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {sendTestMutation.isPending ? 'Sending...' : 'Send Test Email'}
          </Button>
        </form>
      </Card>

      {/* Booking Confirmation Email Test */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Test Booking Confirmation Email</h2>
        <p className="text-sm text-slate-600 mb-4">
          Send a sample booking confirmation email with mock data
        </p>

        <form onSubmit={handleSendBookingConfirmation} className="space-y-4">
          <div>
            <Label htmlFor="bookingEmail">Recipient Email</Label>
            <Input
              id="bookingEmail"
              type="email"
              value={bookingEmail}
              onChange={(e) => setBookingEmail(e.target.value)}
              placeholder="test@example.com"
              required
              disabled={!configStatus?.configured}
            />
            <p className="text-xs text-slate-500 mt-1">
              Preview data: Total Transformation Package, 14 days, $7,398.00
            </p>
          </div>

          <Button
            type="submit"
            disabled={!configStatus?.configured || sendBookingConfirmationMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {sendBookingConfirmationMutation.isPending ? 'Sending...' : 'Send Booking Confirmation'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
