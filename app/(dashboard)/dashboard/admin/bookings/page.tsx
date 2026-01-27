/**
 * Admin Booking Status Management
 * A1-S2: Booking Status Management (5 pts)
 *
 * Features:
 * - View all bookings with filters
 * - Update booking status with validation
 * - Prevent invalid status transitions
 * - Auto-trigger notifications on status change
 * - Search and filtering
 * - Status change audit log
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { BookingStatus } from '@prisma/client';
import {
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Loader2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type FilterStatus = BookingStatus | 'ALL';

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('CONFIRMED');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch bookings with filters
  const { data, isLoading, refetch } = trpc.admin.bookings.list.useQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  // Fetch counts
  const { data: counts } = trpc.admin.bookings.getCounts.useQuery();

  // Update status mutation
  const updateStatusMutation = trpc.admin.bookings.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    const confirmation = confirm(
      `Are you sure you want to update the booking status to ${newStatus}?`
    );
    if (!confirmation) return;

    let notes: string | null = null;
    if (newStatus === 'CANCELLED') {
      notes = prompt('Please provide a reason for cancellation:');
      if (notes === null) return; // User clicked cancel
    }

    try {
      await updateStatusMutation.mutateAsync({
        bookingId,
        status: newStatus,
        notes: notes || undefined,
      });
    } catch (error) {
      alert('Failed to update status: ' + (error as Error).message);
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'PENDING_PAYMENT':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getAvailableTransitions = (currentStatus: BookingStatus): BookingStatus[] => {
    const transitions: Record<BookingStatus, BookingStatus[]> = {
      DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
      PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      CANCELLED: [],
      COMPLETED: [],
    };

    return transitions[currentStatus] || [];
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
        <p className="mt-2 text-gray-600">Manage booking statuses and guest assignments</p>
      </div>

      {/* Stats Cards */}
      {counts && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{counts.pendingPayment}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{counts.confirmed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{counts.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{counts.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Search
            </label>
            <Input
              type="text"
              placeholder="Search by booking reference, guest name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : !data?.bookings || data.bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.bookings.map((booking) => {
                  const availableTransitions = getAvailableTransitions(booking.status);

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.bookingReference}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.user.guestProfile
                              ? `${booking.user.guestProfile.firstName} ${booking.user.guestProfile.lastName}`
                              : 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">{booking.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{booking.package.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {booking.trip ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.trip.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(booking.trip.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(booking.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border',
                            getStatusColor(booking.status)
                          )}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-green-600">
                            {booking.documents.filter((d) => d.status === 'APPROVED').length}{' '}
                            approved
                          </span>
                          <span className="text-gray-400">/</span>
                          <span className="text-yellow-600">
                            {booking.documents.filter((d) => d.status === 'PENDING_REVIEW').length}{' '}
                            pending
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {availableTransitions.length > 0 ? (
                          <div className="flex items-center justify-end gap-2">
                            {availableTransitions.map((newStatus) => (
                              <Button
                                key={newStatus}
                                onClick={() => handleUpdateStatus(booking.id, newStatus)}
                                disabled={updateStatusMutation.isPending}
                                size="sm"
                                className={cn(
                                  'flex items-center gap-1',
                                  newStatus === 'CONFIRMED' &&
                                    'bg-green-600 hover:bg-green-700',
                                  newStatus === 'COMPLETED' && 'bg-blue-600 hover:bg-blue-700',
                                  newStatus === 'CANCELLED' && 'bg-red-600 hover:bg-red-700'
                                )}
                              >
                                {newStatus === 'CONFIRMED' && <CheckCircle className="h-3 w-3" />}
                                {newStatus === 'COMPLETED' && <CheckCircle className="h-3 w-3" />}
                                {newStatus === 'CANCELLED' && <XCircle className="h-3 w-3" />}
                                {newStatus === 'PENDING_PAYMENT' && <Clock className="h-3 w-3" />}
                                <ArrowRight className="h-3 w-3" />
                                {newStatus.replace('_', ' ')}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">No actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {data && data.total > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {data.bookings.length} of {data.total} bookings
        </div>
      )}

      {/* Status Transition Rules */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Status Transition Rules
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• DRAFT → PENDING_PAYMENT or CANCELLED</li>
              <li>• PENDING_PAYMENT → CONFIRMED or CANCELLED</li>
              <li>• CONFIRMED → COMPLETED or CANCELLED</li>
              <li>• CANCELLED and COMPLETED are final states</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
