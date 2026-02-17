/**
 * Partner Events Page
 * E9-S17: Partner Event Calendar
 *
 * Features:
 * - Calendar view (monthly) and list view toggle
 * - Event types with color coding (Webinar, Meetup, Training, Summit)
 * - Event cards with details and registration button
 * - My Registrations tab
 * - Add to Google Calendar / iCal download
 */

'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Loader2,
  Calendar,
  List,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Video,
  Clock,
  Users,
  Check,
  X,
  ExternalLink,
  Download,
  CalendarPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

type ViewMode = 'calendar' | 'list';
type TabMode = 'upcoming' | 'registered';
type EventType = 'WEBINAR' | 'MEETUP' | 'TRAINING' | 'SUMMIT';

const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; badge: string }> = {
  WEBINAR: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  MEETUP: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
  TRAINING: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  SUMMIT: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
};

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  WEBINAR: 'Webinar',
  MEETUP: 'Meetup',
  TRAINING: 'Training',
  SUMMIT: 'Summit',
};

// iCal format helper
function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Generate Google Calendar URL
function getGoogleCalendarUrl(event: {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string | null;
  isVirtual: boolean;
}): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatICalDate(event.startDate)}/${formatICalDate(event.endDate)}`,
    details: event.description,
    location: event.isVirtual ? 'Virtual Event' : event.location || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Generate iCal content
function generateICalContent(event: {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string | null;
  isVirtual: boolean;
}): string {
  const location = event.isVirtual ? 'Virtual Event' : event.location || '';
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The Pickleball Passport//Partner Events//EN
BEGIN:VEVENT
UID:${event.id}@pickleballpassport.com
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${formatICalDate(event.startDate)}
DTEND:${formatICalDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
}

// Download iCal file
function downloadICalFile(event: {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string | null;
  isVirtual: boolean;
}) {
  const content = generateICalContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Calendar helper functions
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarEvent {
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
  isRegistered: boolean;
  registrationId?: string | null;
  spotsRemaining?: number | null;
  isFull: boolean;
}

export default function PartnerEventsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [tabMode, setTabMode] = useState<TabMode>('upcoming');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | 'ALL'>('ALL');

  // Query for upcoming events
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = trpc.partner.getEvents.useQuery({
    eventType: eventTypeFilter === 'ALL' ? undefined : eventTypeFilter,
  });

  // Query for registered events
  const {
    data: registrationsData,
    isLoading: registrationsLoading,
    refetch: refetchRegistrations,
  } = trpc.partner.getMyRegistrations.useQuery({
    includesPast: true,
  });

  // Register mutation
  const registerMutation = trpc.partner.registerForEvent.useMutation({
    onSuccess: () => {
      toast.success('Successfully registered for event');
      refetchEvents();
      refetchRegistrations();
      setSelectedEvent(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to register');
    },
  });

  // Unregister mutation
  const unregisterMutation = trpc.partner.unregisterFromEvent.useMutation({
    onSuccess: () => {
      toast.success('Successfully unregistered from event');
      refetchEvents();
      refetchRegistrations();
      setSelectedEvent(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to unregister');
    },
  });

  // Process events for calendar view
  const calendarEvents = useMemo(() => {
    if (!eventsData) return new Map<string, CalendarEvent[]>();

    const eventMap = new Map<string, CalendarEvent[]>();
    eventsData.forEach((event: NonNullable<typeof eventsData>[number]) => {
      const eventDate = new Date(event.startDate);
      const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
      const existing = eventMap.get(dateKey) || [];
      existing.push({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
      } as CalendarEvent);
      eventMap.set(dateKey, existing);
    });
    return eventMap;
  }, [eventsData]);

  // Navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calendar grid calculation
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const calendarDays = [];

  // Previous month days
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: null, isCurrentMonth: false });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({ day, isCurrentMonth: true });
  }

  if (eventsError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Error loading events: {eventsError.message}</p>
      </div>
    );
  }

  const isLoading = eventsLoading || registrationsLoading;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/partner" className="text-slate-600 hover:text-slate-900">
                Partner Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Events</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Partner Events</h1>
          <p className="mt-1 text-slate-600">
            Webinars, meetups, trainings, and summits for our partner community
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-4 border-b border-slate-200">
          <button
            onClick={() => setTabMode('upcoming')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tabMode === 'upcoming'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            <Calendar className="inline-block h-4 w-4 mr-2" />
            Upcoming Events
          </button>
          <button
            onClick={() => setTabMode('registered')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tabMode === 'registered'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            <Check className="inline-block h-4 w-4 mr-2" />
            My Registrations
            {registrationsData && registrationsData.length > 0 && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                {registrationsData.length}
              </span>
            )}
          </button>
        </div>

        {tabMode === 'upcoming' ? (
          <>
            {/* View Toggle and Filters */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Type:</label>
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value as EventType | 'ALL')}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="WEBINAR">Webinars</option>
                  <option value="MEETUP">Meetups</option>
                  <option value="TRAINING">Training</option>
                  <option value="SUMMIT">Summits</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">View:</span>
                <div className="flex rounded-lg border border-slate-300 bg-white p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      viewMode === 'list'
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <List className="h-4 w-4" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={cn(
                      'flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      viewMode === 'calendar'
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : viewMode === 'calendar' ? (
              /* Calendar View */
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                {/* Month Navigation */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {MONTHS[currentMonth]} {currentYear}
                  </h2>
                  <Button variant="outline" size="sm" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-slate-200">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="px-2 py-3 text-center text-sm font-medium text-slate-600"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((cell, index) => {
                    const dateKey = cell.day
                      ? `${currentYear}-${currentMonth}-${cell.day}`
                      : '';
                    const dayEvents = calendarEvents.get(dateKey) || [];
                    const isToday =
                      cell.day === new Date().getDate() &&
                      currentMonth === new Date().getMonth() &&
                      currentYear === new Date().getFullYear();

                    return (
                      <div
                        key={index}
                        className={cn(
                          'min-h-[100px] border-b border-r border-slate-200 p-2',
                          !cell.isCurrentMonth && 'bg-slate-50'
                        )}
                      >
                        {cell.day && (
                          <>
                            <div
                              className={cn(
                                'mb-1 text-sm',
                                isToday
                                  ? 'font-bold text-emerald-600'
                                  : 'text-slate-700'
                              )}
                            >
                              {cell.day}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <button
                                  key={event.id}
                                  onClick={() => setSelectedEvent(event)}
                                  className={cn(
                                    'w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium',
                                    EVENT_TYPE_COLORS[event.eventType].bg,
                                    EVENT_TYPE_COLORS[event.eventType].text,
                                    'hover:opacity-80 transition-opacity'
                                  )}
                                >
                                  {event.title}
                                </button>
                              ))}
                              {dayEvents.length > 2 && (
                                <p className="text-xs text-slate-500">
                                  +{dayEvents.length - 2} more
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {eventsData && eventsData.length > 0 ? (
                  eventsData.map((event: NonNullable<typeof eventsData>[number]) => (
                    <EventCard
                      key={event.id}
                      event={{
                        ...event,
                        startDate: new Date(event.startDate),
                        endDate: new Date(event.endDate),
                      } as CalendarEvent}
                      onSelect={() =>
                        setSelectedEvent({
                          ...event,
                          startDate: new Date(event.startDate),
                          endDate: new Date(event.endDate),
                        } as CalendarEvent)
                      }
                      onRegister={() => registerMutation.mutate({ eventId: event.id })}
                      onUnregister={() => unregisterMutation.mutate({ eventId: event.id })}
                      isRegistering={registerMutation.isPending}
                      isUnregistering={unregisterMutation.isPending}
                    />
                  ))
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-white py-12 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900">
                      No upcoming events
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Check back later for new partner events and training opportunities.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* My Registrations Tab */
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : registrationsData && registrationsData.length > 0 ? (
              registrationsData.map((registration: NonNullable<typeof registrationsData>[number]) => (
                <EventCard
                  key={registration.id}
                  event={{
                    ...registration.event,
                    startDate: new Date(registration.event.startDate),
                    endDate: new Date(registration.event.endDate),
                    isRegistered: true,
                    registrationId: registration.id,
                    isFull: false,
                  } as CalendarEvent}
                  onSelect={() =>
                    setSelectedEvent({
                      ...registration.event,
                      startDate: new Date(registration.event.startDate),
                      endDate: new Date(registration.event.endDate),
                      isRegistered: true,
                      registrationId: registration.id,
                      isFull: false,
                    } as CalendarEvent)
                  }
                  onUnregister={() =>
                    unregisterMutation.mutate({ eventId: registration.event.id })
                  }
                  isUnregistering={unregisterMutation.isPending}
                  showCalendarExport
                />
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white py-12 text-center">
                <Check className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-medium text-slate-900">
                  No registrations yet
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Browse upcoming events and register for ones that interest you.
                </p>
                <Button
                  onClick={() => setTabMode('upcoming')}
                  className="mt-4"
                  variant="outline"
                >
                  Browse Events
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onRegister={() => registerMutation.mutate({ eventId: selectedEvent.id })}
            onUnregister={() => unregisterMutation.mutate({ eventId: selectedEvent.id })}
            isRegistering={registerMutation.isPending}
            isUnregistering={unregisterMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

// Event Card Component
function EventCard({
  event,
  onSelect,
  onRegister,
  onUnregister,
  isRegistering,
  isUnregistering,
  showCalendarExport,
}: {
  event: CalendarEvent;
  onSelect: () => void;
  onRegister?: () => void;
  onUnregister?: () => void;
  isRegistering?: boolean;
  isUnregistering?: boolean;
  showCalendarExport?: boolean;
}) {
  const colors = EVENT_TYPE_COLORS[event.eventType];
  const isPast = new Date() > event.endDate;

  return (
    <div
      className={cn(
        'rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md',
        isPast ? 'border-slate-200 opacity-60' : 'border-slate-200'
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Date Column */}
        <div className="flex-shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 p-4 sm:w-32 text-center">
          <div className="text-sm font-medium text-slate-500">
            {event.startDate.toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {event.startDate.getDate()}
          </div>
          <div className="text-sm text-slate-500">
            {event.startDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', colors.badge)}>
                  {EVENT_TYPE_LABELS[event.eventType]}
                </span>
                {event.isVirtual ? (
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <Video className="h-3 w-3" />
                    Virtual
                  </span>
                ) : event.location ? (
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </span>
                ) : null}
              </div>

              <h3
                onClick={onSelect}
                className="text-lg font-semibold text-slate-900 hover:text-emerald-600 cursor-pointer"
              >
                {event.title}
              </h3>

              <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                {event.description}
              </p>

              <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.round(
                    (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60)
                  )}{' '}
                  hours
                </span>
                {event.maxAttendees && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {event.spotsRemaining !== null
                      ? `${event.spotsRemaining} spots left`
                      : `${event.maxAttendees} max`}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {event.isRegistered ? (
                <>
                  <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                    <Check className="h-4 w-4" />
                    Registered
                  </span>
                  {!isPast && onUnregister && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onUnregister}
                      disabled={isUnregistering}
                      className="text-red-600 hover:text-red-700"
                    >
                      {isUnregistering ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Cancel'
                      )}
                    </Button>
                  )}
                  {showCalendarExport && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getGoogleCalendarUrl(event), '_blank')}
                        title="Add to Google Calendar"
                      >
                        <CalendarPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadICalFile(event)}
                        title="Download iCal"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : isPast ? (
                <span className="text-sm text-slate-500">Past Event</span>
              ) : event.isFull ? (
                <span className="text-sm font-medium text-amber-600">Event Full</span>
              ) : onRegister ? (
                <Button size="sm" onClick={onRegister} disabled={isRegistering}>
                  {isRegistering ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Register
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Event Detail Modal
function EventDetailModal({
  event,
  onClose,
  onRegister,
  onUnregister,
  isRegistering,
  isUnregistering,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onRegister: () => void;
  onUnregister: () => void;
  isRegistering: boolean;
  isUnregistering: boolean;
}) {
  const colors = EVENT_TYPE_COLORS[event.eventType];
  const isPast = new Date() > event.endDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={cn('px-6 py-4 border-b', colors.bg)}>
          <div className="flex items-start justify-between">
            <div>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', colors.badge)}>
                {EVENT_TYPE_LABELS[event.eventType]}
              </span>
              <h2 className="mt-2 text-xl font-bold text-slate-900">{event.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-white/50"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date & Time */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-3">
              <Calendar className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {event.startDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="text-sm text-slate-600">
                {event.startDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {event.endDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-3">
              {event.isVirtual ? (
                <Video className="h-6 w-6 text-slate-600" />
              ) : (
                <MapPin className="h-6 w-6 text-slate-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {event.isVirtual ? 'Virtual Event' : event.location || 'Location TBD'}
              </p>
              {event.registrationUrl && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-emerald-600 hover:underline"
                >
                  View event details <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Capacity */}
          {event.maxAttendees && (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-3">
                <Users className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {event.spotsRemaining !== null
                    ? `${event.spotsRemaining} of ${event.maxAttendees} spots available`
                    : `${event.maxAttendees} attendees max`}
                </p>
                {event.isFull && (
                  <p className="text-sm text-amber-600">This event is at full capacity</p>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-medium text-slate-900 mb-2">About this event</h3>
            <p className="text-slate-600 whitespace-pre-wrap">{event.description}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
          <div className="flex gap-2">
            {event.isRegistered && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getGoogleCalendarUrl(event), '_blank')}
                >
                  <CalendarPlus className="h-4 w-4 mr-1" />
                  Google Calendar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadICalFile(event)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  iCal
                </Button>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {event.isRegistered ? (
              !isPast && (
                <Button
                  variant="outline"
                  onClick={onUnregister}
                  disabled={isUnregistering}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isUnregistering ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Cancel Registration
                </Button>
              )
            ) : isPast ? null : event.isFull ? (
              <Button disabled>Event Full</Button>
            ) : (
              <Button onClick={onRegister} disabled={isRegistering}>
                {isRegistering ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Register Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
