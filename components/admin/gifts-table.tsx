'use client'

/**
 * Admin Gifts Table Component (GIFT-22)
 *
 * Displays all gift bookings with filtering by status.
 * Shows both booking status and gift status for each row.
 */

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GiftStatusBadge } from '@/components/dashboard/gift-state-timeline'
import {
  Gift,
  Users,
  DollarSign,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Send,
  AlertTriangle,
  Filter,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface GiftBooking {
  id: string
  bookingReference: string
  status: string
  giftStatus: string
  packageName: string
  recipientName: string | null
  recipientEmail: string | null
  purchaserEmail: string | null
  purchaserName: string | null
  totalPrice: number
  giftDeliveryDate: string | null
  giftExpiresAt: string | null
  tripStartDate: string | null
  destination: string | null
  createdAt: string
  lastTransition: {
    toState: string
    reason: string
    createdAt: string
  } | null
}

interface GiftCounts {
  total: number
  pending: number
  sent: number
  accepted: number
  declined: number
  expired: number
}

interface AdminGiftsTableProps {
  initialGifts: GiftBooking[]
  counts: GiftCounts
  total: number
}

type GiftStatusFilter = 'ALL' | 'PENDING' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'

function getBookingStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'PENDING_PAYMENT':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getGiftStatusIcon(status: string) {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-4 w-4 text-gray-600" />
    case 'SENT':
      return <Send className="h-4 w-4 text-blue-600" />
    case 'ACCEPTED':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'DECLINED':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'EXPIRED':
      return <AlertTriangle className="h-4 w-4 text-amber-600" />
    default:
      return <Gift className="h-4 w-4 text-gray-600" />
  }
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function AdminGiftsTable({ initialGifts, counts, total }: AdminGiftsTableProps) {
  const [statusFilter, setStatusFilter] = useState<GiftStatusFilter>('ALL')

  // Client-side filtering
  const filteredGifts = statusFilter === 'ALL'
    ? initialGifts
    : initialGifts.filter((g) => g.giftStatus === statusFilter)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
            </div>
            <Gift className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-600">{counts.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-blue-600">{counts.sent}</p>
            </div>
            <Send className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{counts.accepted}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Declined</p>
              <p className="text-2xl font-bold text-red-600">{counts.declined}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-amber-600">{counts.expired}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Gift Status:</span>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as GiftStatusFilter)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="DECLINED">Declined</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gifts Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {filteredGifts.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No gift bookings found</p>
            {statusFilter !== 'ALL' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('ALL')}
                className="mt-2"
              >
                Clear filter
              </Button>
            )}
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
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchaser
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gift Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGifts.map((gift) => (
                  <tr key={gift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {gift.bookingReference}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(gift.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {gift.recipientName || 'Not specified'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {gift.recipientEmail || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {gift.purchaserName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {gift.purchaserEmail || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{gift.packageName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-1 rounded text-xs font-medium border',
                          getBookingStatusColor(gift.status)
                        )}
                      >
                        {gift.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <GiftStatusBadge
                        currentState={gift.giftStatus}
                        expiresAt={gift.giftExpiresAt}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {gift.giftDeliveryDate ? (
                          <>
                            <p className="text-sm text-gray-900">
                              {format(new Date(gift.giftDeliveryDate), 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(gift.giftDeliveryDate), 'h:mm a')}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Immediate</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(gift.totalPrice)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {filteredGifts.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {filteredGifts.length} of {total} gift bookings
          {statusFilter !== 'ALL' && ` (filtered by ${statusFilter.toLowerCase()})`}
        </div>
      )}
    </div>
  )
}
