/**
 * Admin Guest Management Dashboard
 * A1-S3: Guest Management Dashboard (5 pts)
 *
 * Features:
 * - View all guest profiles
 * - Search and filter guests
 * - View guest booking history
 * - Guest journey tracking
 * - Communication tools
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Role } from '@prisma/client';
import Link from 'next/link';
import {
  Users,
  Filter,
  Search,
  Calendar,
  FileText,
  Bell,
  Mail,
  Phone,
  Loader2,
  User as UserIcon,
  Shield,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FilterRole = Role | 'ALL';

export default function AdminGuestsPage() {
  const [roleFilter, setRoleFilter] = useState<FilterRole>('GUEST');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);

  // Fetch guests with filters
  const { data, isLoading } = trpc.admin.guests.list.useQuery({
    role: roleFilter === 'ALL' ? undefined : roleFilter,
    search: searchQuery || undefined,
  });

  // Fetch counts
  const { data: counts } = trpc.admin.guests.getCounts.useQuery();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PARTNER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'GUEST':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      case 'PARTNER':
        return <Award className="h-4 w-4" />;
      case 'GUEST':
        return <UserIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
        <p className="mt-2 text-gray-600">
          View and manage guest profiles, booking history, and preferences
        </p>
      </div>

      {/* Stats Cards */}
      {counts && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Guests</p>
                <p className="text-2xl font-bold text-green-600">{counts.guests}</p>
              </div>
              <UserIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Partners</p>
                <p className="text-2xl font-bold text-blue-600">{counts.partners}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-purple-600">{counts.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Role Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as FilterRole)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="GUEST">Guests</option>
              <option value="PARTNER">Partners</option>
              <option value="ADMIN">Admins</option>
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
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Guests List */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading guests...</p>
          </div>
        ) : !data?.users || data.users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No guests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedGuest(selectedGuest === user.id ? null : user.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {('guestProfile' in user && user.guestProfile?.firstName?.[0]) ||
                            user.email[0]?.toUpperCase() ||
                            'G'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {'guestProfile' in user && user.guestProfile
                              ? `${user.guestProfile.firstName} ${user.guestProfile.lastName}`
                              : 'partnerProfile' in user && user.partnerProfile
                                ? user.partnerProfile.clubName
                                : 'No profile'}
                          </p>
                          {'guestProfile' in user && user.guestProfile?.location && (
                            <p className="text-xs text-gray-500">{user.guestProfile.location}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                        {'guestProfile' in user && user.guestProfile?.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {user.guestProfile.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {'_count' in user ? user._count.bookings : 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {'bookings' in user ? user.bookings.length : 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Email functionality coming soon for ${user.email}`);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guest Details Panel (Expandable) */}
      {selectedGuest && data?.users && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          {(() => {
            const guest = data.users.find((u) => u.id === selectedGuest);
            if (!guest) return null;

            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Guest Details</h3>
                  <Button onClick={() => setSelectedGuest(null)} variant="outline" size="sm">
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Info */}
                  {'guestProfile' in guest && guest.guestProfile && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Profile Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>{' '}
                          <span className="font-medium">
                            {guest.guestProfile.firstName} {guest.guestProfile.lastName}
                          </span>
                        </div>
                        {guest.guestProfile.age && (
                          <div>
                            <span className="text-gray-600">Age:</span>{' '}
                            <span className="font-medium">{guest.guestProfile.age}</span>
                          </div>
                        )}
                        {guest.guestProfile.pickleballSkillLevel && (
                          <div>
                            <span className="text-gray-600">Skill Level:</span>{' '}
                            <span className="font-medium">
                              {guest.guestProfile.pickleballSkillLevel}
                            </span>
                          </div>
                        )}
                        {guest.guestProfile.dietaryRestrictions &&
                          guest.guestProfile.dietaryRestrictions.length > 0 && (
                            <div>
                              <span className="text-gray-600">Dietary Restrictions:</span>{' '}
                              <span className="font-medium">
                                {guest.guestProfile.dietaryRestrictions.join(', ')}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Booking History */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Recent Bookings</h4>
                    {'bookings' in guest && guest.bookings.length > 0 ? (
                      <div className="space-y-2">
                        {guest.bookings.map((booking: any) => (
                          <div
                            key={booking.id}
                            className="p-3 bg-gray-50 rounded border border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                {booking.bookingReference}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  booking.status === 'CONFIRMED'
                                    ? 'bg-green-100 text-green-800'
                                    : booking.status === 'PENDING_PAYMENT'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {booking.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(booking.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No bookings yet</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Pagination Info */}
      {data && data.total > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {data.users.length} of {data.total} guests
        </div>
      )}
    </div>
  );
}
