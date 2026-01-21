/**
 * Itinerary Preview Page
 * Story 12-7: Itinerary Templates
 *
 * Preview how the itinerary will appear to guests on package detail pages.
 */

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Loader2, Edit, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Activity type colors and labels (same as editor)
const ACTIVITY_TYPES = {
  PICKLEBALL: { label: 'Pickleball', color: 'bg-green-100 text-green-700', icon: '🎾' },
  MEDICAL: { label: 'Medical', color: 'bg-red-100 text-red-700', icon: '🏥' },
  WELLNESS: { label: 'Wellness', color: 'bg-purple-100 text-purple-700', icon: '🧘' },
  CULTURAL: { label: 'Cultural', color: 'bg-amber-100 text-amber-700', icon: '🏛️' },
  MEAL: { label: 'Meal', color: 'bg-orange-100 text-orange-700', icon: '🍽️' },
  FREE_TIME: { label: 'Free Time', color: 'bg-blue-100 text-blue-700', icon: '☀️' },
} as const;

type ActivityType = keyof typeof ACTIVITY_TYPES;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ItineraryPreviewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  // Fetch template
  const { data: template, isLoading, error } = trpc.itinerary.getTemplateById.useQuery({
    id: resolvedParams.id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <p className="text-slate-500">Template not found</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/admin/cms/itineraries/${resolvedParams.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <p className="text-sm font-medium text-slate-900">Preview Mode</p>
              <p className="text-xs text-slate-500">This is how guests will see the itinerary</p>
            </div>
          </div>
          <Link href={`/dashboard/admin/cms/itineraries/${resolvedParams.id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Preview Content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">{template.name}</h1>
          {template.description && (
            <p className="mt-2 text-lg text-slate-600">{template.description}</p>
          )}
          <div className="mt-4 flex items-center justify-center gap-4 text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-5 w-5" />
              {template.duration} Days
            </span>
            {template.package && (
              <span className="flex items-center gap-1.5">
                Package: {template.package.name}
              </span>
            )}
          </div>
        </div>

        {/* Itinerary Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 lg:left-1/2 lg:-ml-px" />

          {/* Days */}
          <div className="space-y-12">
            {template.days.map((day, index) => (
              <div key={day.id} className="relative">
                {/* Day Number Circle */}
                <div className="absolute left-8 -ml-5 lg:left-1/2 lg:-ml-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-lg">
                    {day.dayNumber}
                  </div>
                </div>

                {/* Day Content */}
                <div
                  className={cn(
                    'ml-20 lg:ml-0 lg:w-[calc(50%-40px)]',
                    index % 2 === 0 ? 'lg:mr-auto lg:pr-8' : 'lg:ml-auto lg:pl-8'
                  )}
                >
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">
                      Day {day.dayNumber}: {day.title}
                    </h2>

                    {day.itineraryActivities.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {day.itineraryActivities.map((activity) => {
                          const typeConfig = ACTIVITY_TYPES[activity.type as ActivityType];
                          return (
                            <div
                              key={activity.id}
                              className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
                            >
                              <div className="text-2xl">{typeConfig?.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-slate-900">
                                    {activity.title}
                                  </span>
                                  <span
                                    className={cn(
                                      'rounded px-1.5 py-0.5 text-xs font-medium',
                                      typeConfig?.color
                                    )}
                                  >
                                    {typeConfig?.label}
                                  </span>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                  {activity.time && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      {activity.time}
                                    </span>
                                  )}
                                  {activity.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {activity.location}
                                    </span>
                                  )}
                                </div>
                                {activity.description && (
                                  <p className="mt-2 text-sm text-slate-600">
                                    {activity.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500 italic">
                        No activities scheduled for this day
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
