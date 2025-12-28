'use client';

/**
 * Payment History & Receipts Page
 * E6-S1: Payment History & Receipts (5 pts)
 *
 * Features:
 * - Payment list with all transactions
 * - Payment status badges (pending, succeeded, failed, refunded)
 * - Receipt download (PDF placeholder)
 * - Payment method display
 * - Refund status tracking
 * - Filter by date range and status
 * - Linked to bookings
 */

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import {
  CreditCard,
  Download,
  Check,
  X,
  Clock,
  RefreshCcw,
  Calendar,
  DollarSign,
  ChevronRight,
  Filter,
} from 'lucide-react';

type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; icon: any; color: string; bgColor: string }
> = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
  },
  SUCCEEDED: {
    label: 'Succeeded',
    icon: Check,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  FAILED: {
    label: 'Failed',
    icon: X,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  REFUNDED: {
    label: 'Refunded',
    icon: RefreshCcw,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
};

export default function PaymentsPage() {
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');

  // In a real implementation, we'd create a payment router in tRPC
  // For now, we'll use the booking router to get payments
  const { data: bookings = [] } = trpc.booking.list.useQuery();

  // Extract all payments from bookings and sort by date
  const allPayments = bookings
    .flatMap((booking) =>
      booking.payments.map((payment) => ({
        ...payment,
        booking: {
          id: booking.id,
          bookingReference: booking.bookingReference,
          packageName: booking.package.name,
        },
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Apply filters
  const filteredPayments = allPayments.filter((payment) => {
    // Status filter
    if (filterStatus !== 'ALL' && payment.status !== filterStatus) {
      return false;
    }

    // Date range filter
    if (dateRange !== 'all') {
      const paymentDate = new Date(payment.createdAt);
      const now = new Date();
      const daysAgo = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
      }[dateRange];

      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      if (paymentDate < cutoffDate) {
        return false;
      }
    }

    return true;
  });

  // Calculate stats
  const stats = {
    total: allPayments.length,
    succeeded: allPayments.filter((p) => p.status === 'SUCCEEDED').length,
    pending: allPayments.filter((p) => p.status === 'PENDING').length,
    failed: allPayments.filter((p) => p.status === 'FAILED').length,
    refunded: allPayments.filter((p) => p.status === 'REFUNDED').length,
    totalAmount: allPayments
      .filter((p) => p.status === 'SUCCEEDED')
      .reduce((sum, p) => sum + p.amount, 0),
  };

  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleDownloadReceipt = (payment: any) => {
    // TODO: Generate PDF receipt
    // For now, we'll show an alert
    alert(
      `Receipt download functionality will be implemented.\n\nPayment ID: ${payment.id}\nAmount: ${formatCurrency(payment.amount)}\nDate: ${formatDate(payment.createdAt)}`
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="mt-2 text-gray-600">
          View and manage all your payment transactions
        </p>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Successful Payments</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.succeeded}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCEEDED">Succeeded</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Transactions ({filteredPayments.length})
          </h2>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No payments found</p>
            <p className="text-sm text-gray-500 mt-1">
              {filterStatus !== 'ALL' || dateRange !== 'all'
                ? 'Try adjusting your filters'
                : 'You haven\'t made any payments yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredPayments.map((payment) => {
              const StatusIcon = STATUS_CONFIG[payment.status].icon;
              return (
                <div
                  key={payment.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Payment Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </h3>
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[payment.status].bgColor} ${STATUS_CONFIG[payment.status].color}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {STATUS_CONFIG[payment.status].label}
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/bookings/${payment.booking.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                      >
                        {payment.booking.packageName} •{' '}
                        {payment.booking.bookingReference}
                        <ChevronRight className="h-4 w-4" />
                      </Link>

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {formatDate(payment.createdAt)} at{' '}
                          {formatTime(payment.createdAt)}
                        </div>
                      </div>

                      {payment.isInstallment && (
                        <div className="mt-2 text-sm text-gray-600">
                          Installment {payment.installmentNumber}
                          {payment.scheduledDate && (
                            <span>
                              {' '}
                              • Due: {formatDate(payment.scheduledDate)}
                            </span>
                          )}
                        </div>
                      )}

                      {payment.status === 'FAILED' && payment.failureReason && (
                        <div className="mt-2 text-sm text-red-600">
                          Failed: {payment.failureReason}
                        </div>
                      )}

                      {payment.status === 'REFUNDED' && (
                        <div className="mt-2 text-sm text-purple-600">
                          This payment has been refunded
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {(payment.status === 'SUCCEEDED' ||
                        payment.status === 'REFUNDED') && (
                        <button
                          onClick={() => handleDownloadReceipt(payment)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Download className="h-4 w-4" />
                          Download Receipt
                        </button>
                      )}

                      {payment.receiptUrl && (
                        <a
                          href={payment.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <Download className="h-4 w-4" />
                          Stripe Receipt
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Payment Method (if available) */}
                  {payment.stripePaymentIntentId && (
                    <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                      Payment ID: {payment.stripePaymentIntentId}
                      {payment.stripeCustomerId && (
                        <span className="ml-4">
                          Customer: {payment.stripeCustomerId}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      {stats.total > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Payment Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Total</p>
              <p className="text-lg font-semibold text-blue-900">
                {stats.total}
              </p>
            </div>
            <div>
              <p className="text-green-700">Succeeded</p>
              <p className="text-lg font-semibold text-green-900">
                {stats.succeeded}
              </p>
            </div>
            <div>
              <p className="text-yellow-700">Pending</p>
              <p className="text-lg font-semibold text-yellow-900">
                {stats.pending}
              </p>
            </div>
            <div>
              <p className="text-red-700">Failed</p>
              <p className="text-lg font-semibold text-red-900">
                {stats.failed}
              </p>
            </div>
            <div>
              <p className="text-purple-700">Refunded</p>
              <p className="text-lg font-semibold text-purple-900">
                {stats.refunded}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
