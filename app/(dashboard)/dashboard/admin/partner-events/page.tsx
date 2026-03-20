/**
 * Admin Partner Events Page
 * E9-S17: Partner Event Calendar (Admin View)
 *
 * Features:
 * - Create/edit/delete partner events
 * - View all events with registrations
 * - Filter by event type, active status
 * - Event statistics dashboard
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar,
  Video,
  MapPin,
  Users,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

type EventType = 'WEBINAR' | 'MEETUP' | 'TRAINING' | 'SUMMIT';
type EventTypeFilter = 'ALL' | EventType;

const EVENT_TYPE_OPTIONS: { value: EventTypeFilter; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'WEBINAR', label: 'Webinar' },
  { value: 'MEETUP', label: 'Meetup' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'SUMMIT', label: 'Summit' },
];

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  WEBINAR: 'bg-blue-100 text-blue-800',
  MEETUP: 'bg-emerald-100 text-emerald-800',
  TRAINING: 'bg-amber-100 text-amber-800',
  SUMMIT: 'bg-purple-100 text-purple-800',
};

interface EventFormData {
  title: string;
  description: string;
  eventType: EventType;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  isVirtual: boolean;
  registrationUrl: string;
  maxAttendees: string;
}

const defaultFormData: EventFormData = {
  title: '',
  description: '',
  eventType: 'WEBINAR',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '10:00',
  location: '',
  isVirtual: true,
  registrationUrl: '',
  maxAttendees: '',
};

export default function AdminPartnerEventsPage() {
  // Filter state
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('ALL');
  const [showPast, setShowPast] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const limit = 50;

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Query events
  const { data, isLoading, error, refetch } = trpc.admin.getPartnerEvents.useQuery({
    eventType: eventTypeFilter === 'ALL' ? undefined : eventTypeFilter,
    includePast: showPast,
    limit,
    offset: page * limit,
  });

  // Query stats
  const { data: stats } = trpc.admin.getPartnerEventStats.useQuery();

  // Create event mutation
  const createMutation = trpc.admin.createPartnerEvent.useMutation({
    onSuccess: () => {
      toast.success('Event created successfully');
      setShowCreateModal(false);
      setFormData(defaultFormData);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create event');
    },
  });

  // Update event mutation
  const updateMutation = trpc.admin.updatePartnerEvent.useMutation({
    onSuccess: () => {
      toast.success('Event updated successfully');
      setEditingEvent(null);
      setFormData(defaultFormData);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update event');
    },
  });

  // Delete event mutation
  const deleteMutation = trpc.admin.deletePartnerEvent.useMutation({
    onSuccess: () => {
      toast.success('Event deleted successfully');
      setShowDeleteConfirm(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    const eventData = {
      title: formData.title,
      description: formData.description,
      eventType: formData.eventType,
      startDate: startDateTime,
      endDate: endDateTime,
      location: formData.isVirtual ? undefined : formData.location || undefined,
      isVirtual: formData.isVirtual,
      registrationUrl: formData.registrationUrl || undefined,
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
    };

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent, ...eventData });
    } else {
      createMutation.mutate(eventData);
    }
  };

  // Open edit modal
  const openEditModal = (event: {
    id: string;
    title: string;
    description: string;
    eventType: EventType;
    startDate: Date;
    endDate: Date;
    location?: string | null;
    isVirtual: boolean;
    registrationUrl?: string | null;
    maxAttendees?: number | null;
    isActive: boolean;
    registrationCount: number;
  }) => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    setFormData({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split('T')[0],
      endTime: endDate.toTimeString().slice(0, 5),
      location: event.location || '',
      isVirtual: event.isVirtual,
      registrationUrl: event.registrationUrl || '',
      maxAttendees: event.maxAttendees?.toString() || '',
    });
    setEditingEvent(event.id);
  };

  // Toggle event active status
  const toggleActive = (event: { id: string; isActive: boolean }) => {
    updateMutation.mutate({
      id: event.id,
      isActive: !event.isActive,
    });
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Error loading events: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/admin" className="text-slate-600 hover:text-slate-900">
                Admin Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Partner Events</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Partner Events</h1>
            <p className="mt-1 text-slate-600">
              Create and manage events for the partner community
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Upcoming</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.upcoming}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Total Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Total Registrations</p>
              <p className="text-2xl font-bold text-amber-600">{stats.totalRegistrations}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">All Events</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Event Type
              </label>
              <select
                value={eventTypeFilter}
                onChange={(e) => {
                  setEventTypeFilter(e.target.value as EventTypeFilter);
                  setPage(0);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPast"
                checked={showPast}
                onChange={(e) => {
                  setShowPast(e.target.checked);
                  setPage(0);
                }}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="showPast" className="text-sm text-slate-700">
                Include past events
              </label>
            </div>
          </div>
        </div>

        {/* Event List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : data?.events && data.events.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-6 py-3">Event</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Location</th>
                      <th className="px-6 py-3">Registrations</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.events.map((event: typeof data.events[number]) => {
                      const startDate = new Date(event.startDate);
                      const isPast = startDate < new Date();

                      return (
                        <tr
                          key={event.id}
                          className={cn(
                            'hover:bg-slate-50',
                            isPast && 'opacity-60'
                          )}
                        >
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="font-medium text-slate-900 truncate">
                                {event.title}
                              </p>
                              <p className="text-sm text-slate-500 truncate">
                                {event.description.slice(0, 60)}...
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                                EVENT_TYPE_COLORS[event.eventType as EventType]
                              )}
                            >
                              {event.eventType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-slate-900">
                                {startDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                              <p className="text-slate-500">
                                {startDate.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              {event.isVirtual ? (
                                <>
                                  <Video className="h-4 w-4" />
                                  Virtual
                                </>
                              ) : (
                                <>
                                  <MapPin className="h-4 w-4" />
                                  {event.location || 'TBD'}
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm">
                              <Users className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-900">{event.registrationCount}</span>
                              {event.maxAttendees && (
                                <span className="text-slate-500">
                                  / {event.maxAttendees}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                                event.isActive
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              )}
                            >
                              {event.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(event)}
                                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => toggleActive(event)}
                                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                                title={event.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {event.isActive ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                              {event.registrationCount === 0 && (
                                <button
                                  onClick={() => setShowDeleteConfirm(event.id)}
                                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.total > limit && (
                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                  <div className="text-sm text-slate-600">
                    Showing {page * limit + 1} to{' '}
                    {Math.min((page + 1) * limit, data.total)} of {data.total}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!data.hasMore}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No events found</h3>
              <p className="mt-2 text-sm text-slate-600">
                Create your first partner event to get started.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingEvent) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => {
              setShowCreateModal(false);
              setEditingEvent(null);
              setFormData(defaultFormData);
            }}
          >
            <div
              className="mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingEvent(null);
                      setFormData(defaultFormData);
                    }}
                    className="rounded-full p-1 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Q1 Partner Training Session"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    maxLength={200}
                    required
                  />
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Event Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="WEBINAR">Webinar</option>
                    <option value="MEETUP">Meetup</option>
                    <option value="TRAINING">Training</option>
                    <option value="SUMMIT">Summit</option>
                  </select>
                </div>

                {/* Date/Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Virtual Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVirtual"
                    checked={formData.isVirtual}
                    onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isVirtual" className="text-sm text-slate-700">
                    Virtual Event (online)
                  </label>
                </div>

                {/* Location (if not virtual) */}
                {!formData.isVirtual && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Bangkok, Thailand"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Registration URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    External Registration URL
                  </label>
                  <input
                    type="url"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Optional: Link to Zoom, meet link, or external registration page
                  </p>
                </div>

                {/* Max Attendees */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                    placeholder="Leave blank for unlimited"
                    min="1"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what partners will learn or experience..."
                    rows={5}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingEvent(null);
                      setFormData(defaultFormData);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingEvent ? (
                      'Update Event'
                    ) : (
                      'Create Event'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <div
              className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-slate-900">Delete Event?</h3>
              <p className="mt-2 text-sm text-slate-600">
                This action cannot be undone. The event will be permanently deleted.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate({ id: showDeleteConfirm })}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
