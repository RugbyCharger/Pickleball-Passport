/**
 * Public Itinerary Display Component
 * Story 12-7: Itinerary Templates
 *
 * A guest-facing component for displaying itinerary schedules
 * on package detail pages. Features a clean timeline view.
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Activity type configuration
const ACTIVITY_TYPES = {
  PICKLEBALL: { label: 'Pickleball', color: 'bg-green-100 text-green-700', icon: '🎾' },
  MEDICAL: { label: 'Medical', color: 'bg-red-100 text-red-700', icon: '🏥' },
  WELLNESS: { label: 'Wellness', color: 'bg-purple-100 text-purple-700', icon: '🧘' },
  CULTURAL: { label: 'Cultural', color: 'bg-amber-100 text-amber-700', icon: '🏛️' },
  MEAL: { label: 'Meal', color: 'bg-orange-100 text-orange-700', icon: '🍽️' },
  FREE_TIME: { label: 'Free Time', color: 'bg-blue-100 text-blue-700', icon: '☀️' },
} as const;

type ActivityType = keyof typeof ACTIVITY_TYPES;

interface PublicItineraryDisplayProps {
  packageId?: string;
  packageSlug?: string;
  duration?: number;
  className?: string;
}

export function PublicItineraryDisplay({
  packageId,
  packageSlug,
  duration,
  className,
}: PublicItineraryDisplayProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1])); // Expand day 1 by default

  const { data: template, isLoading, error } = trpc.itinerary.getTemplateByPackage.useQuery(
    {
      packageId,
      packageSlug,
      duration,
    },
    {
      enabled: !!(packageId || packageSlug),
    }
  );

  const toggleDay = (dayNumber: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayNumber)) {
      newExpanded.delete(dayNumber);
    } else {
      newExpanded.add(dayNumber);
    }
    setExpandedDays(newExpanded);
  };

  const expandAll = () => {
    if (template?.days) {
      setExpandedDays(new Set(template.days.map((d) => d.dayNumber)));
    }
  };

  const collapseAll = () => {
    setExpandedDays(new Set());
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !template) {
    return null; // Don't show anything if no itinerary
  }

  const allExpanded = template.days.every((d) => expandedDays.has(d.dayNumber));
  const noneExpanded = expandedDays.size === 0;

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your Itinerary</h2>
          <p className="mt-1 text-slate-600">
            {template.duration}-day schedule tailored for you
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            disabled={allExpanded}
          >
            Expand All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            disabled={noneExpanded}
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Days Accordion */}
      <div className="space-y-4">
        {template.days.map((day) => {
          const isExpanded = expandedDays.has(day.dayNumber);
          return (
            <div
              key={day.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Day Header */}
              <button
                onClick={() => toggleDay(day.dayNumber)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white shadow">
                    {day.dayNumber}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{day.title}</h3>
                    <p className="text-sm text-slate-500">
                      {day.itineraryActivities.length} activities
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {/* Activities */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                  {day.itineraryActivities.length > 0 ? (
                    <div className="space-y-3">
                      {day.itineraryActivities.map((activity, index) => {
                        const typeConfig = ACTIVITY_TYPES[activity.type as ActivityType];
                        return (
                          <div key={activity.id} className="relative pl-8">
                            {/* Timeline connector */}
                            {index < day.itineraryActivities.length - 1 && (
                              <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-slate-200" />
                            )}
                            {/* Activity dot */}
                            <div className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-blue-500 text-sm">
                              {typeConfig?.icon || '📌'}
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-slate-900">
                                      {activity.title}
                                    </span>
                                    <span
                                      className={cn(
                                        'rounded-full px-2 py-0.5 text-xs font-medium',
                                        typeConfig?.color
                                      )}
                                    >
                                      {typeConfig?.label}
                                    </span>
                                  </div>
                                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    {activity.time && (
                                      <span className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        {activity.time}
                                      </span>
                                    )}
                                    {activity.location && (
                                      <span className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4" />
                                        {activity.location}
                                      </span>
                                    )}
                                  </div>
                                  {activity.description && (
                                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                      {activity.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-slate-500 italic">
                      Flexible time - activities to be scheduled based on your preferences
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-6 rounded-lg bg-blue-50 border border-blue-100 p-4">
        <p className="text-sm text-blue-700">
          <Calendar className="mb-0.5 mr-1.5 inline-block h-4 w-4" />
          <strong>Note:</strong> This is a sample itinerary. Your actual schedule may vary based on
          availability, weather, and your personal preferences. We&apos;ll work with you to customize
          your experience.
        </p>
      </div>
    </div>
  );
}

export default PublicItineraryDisplay;
