/**
 * Admin Trip Management Interface
 * A1-S4: Trip Management Interface (3 pts)
 *
 * Features:
 * - Create and edit trips
 * - Manage trip capacity
 * - View trip roster
 * - Trip status management
 * - Trip analytics
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Calendar,
  Filter,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type TripFormData = {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  capacity: number;
};

export default function AdminTripsPage() {
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<string | null>(null);
  const [formData, setFormData] = useState<TripFormData>({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    capacity: 12,
  });

  // Fetch trips
  const { data, isLoading, refetch } = trpc.admin.trips.list.useQuery({
    isActive: activeFilter,
  });

  // Fetch counts
  const { data: counts } = trpc.admin.trips.getCounts.useQuery();

  // Mutations
  const createMutation = trpc.admin.trips.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreateModal(false);
      resetForm();
    },
  });

  const updateMutation = trpc.admin.trips.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingTrip(null);
      resetForm();
    },
  });

  const deleteMutation = trpc.admin.trips.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      destination: '',
      startDate: '',
      endDate: '',
      capacity: 12,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        destination: formData.destination,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        capacity: formData.capacity,
      });
    } catch (error) {
      alert('Failed to create trip: ' + (error as Error).message);
    }
  };

  const handleUpdate = async (tripId: string, isActive: boolean) => {
    try {
      await updateMutation.mutateAsync({
        id: tripId,
        isActive,
      });
    } catch (error) {
      alert('Failed to update trip: ' + (error as Error).message);
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      await deleteMutation.mutateAsync({ id: tripId });
    } catch (error) {
      alert('Failed to delete trip: ' + (error as Error).message);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateRange = (start: Date, end: Date) => {
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getTripStatus = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < now) return 'completed';
    if (start > now) return 'upcoming';
    return 'ongoing';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="h-3 w-3" />
            Upcoming
          </span>
        );
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="h-3 w-3" />
            Ongoing
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trip Management</h1>
          <p className="mt-2 text-gray-600">Create and manage trips, capacity, and guest assignments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Trip
        </Button>
      </div>

      {/* Stats Cards */}
      {counts && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{counts.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{counts.upcoming}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Past</p>
                <p className="text-2xl font-bold text-gray-600">{counts.past}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 mr-4">Filter:</span>
          <Button
            onClick={() => setActiveFilter(undefined)}
            variant={activeFilter === undefined ? 'default' : 'outline'}
            size="sm"
          >
            All Trips
          </Button>
          <Button
            onClick={() => setActiveFilter(true)}
            variant={activeFilter === true ? 'default' : 'outline'}
            size="sm"
          >
            Active Only
          </Button>
          <Button
            onClick={() => setActiveFilter(false)}
            variant={activeFilter === false ? 'default' : 'outline'}
            size="sm"
          >
            Inactive Only
          </Button>
        </div>
      </div>

      {/* Trips List */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading trips...</p>
          </div>
        ) : !data?.trips || data.trips.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No trips found</p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Trip
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.trips.map((trip) => {
                  const status = getTripStatus(trip.startDate, trip.endDate);
                  const spotsRemaining = trip.capacity - trip.currentBookings;
                  const percentFilled = (trip.currentBookings / trip.capacity) * 100;

                  return (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{trip.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin className="h-3 w-3" />
                            {trip.destination}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDateRange(trip.startDate, trip.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {trip.currentBookings} / {trip.capacity}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={cn(
                                'h-2 rounded-full',
                                percentFilled >= 100
                                  ? 'bg-red-600'
                                  : percentFilled >= 75
                                    ? 'bg-yellow-600'
                                    : 'bg-green-600'
                              )}
                              style={{ width: `${Math.min(percentFilled, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {spotsRemaining > 0
                              ? `${spotsRemaining} spot${spotsRemaining !== 1 ? 's' : ''} remaining`
                              : 'Full'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(status)}</td>
                      <td className="px-6 py-4">
                        {trip.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {trip.isActive ? (
                          <Button
                            onClick={() => handleUpdate(trip.id, false)}
                            disabled={updateMutation.isPending}
                            variant="outline"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleUpdate(trip.id, true)}
                            disabled={updateMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}

                        {trip.currentBookings === 0 && (
                          <Button
                            onClick={() => handleDelete(trip.id)}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
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

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowCreateModal(false)}
            />

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Trip</h3>
                  <p className="text-sm text-gray-600">
                    Fill in the trip details to create a new group trip
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trip Name
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Bangkok & Hua Hin January 2026"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination
                    </label>
                    <Input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="e.g., Bangkok & Hua Hin, Thailand"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity (Max Guests)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Trip
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Info */}
      {data && data.total > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {data.trips.length} of {data.total} trips
        </div>
      )}
    </div>
  );
}
