import { trpc } from '../lib/api';
import { useMemo } from 'react';

/**
 * Hook to fetch transformation journey data for a specific booking.
 *
 * Returns trip details, photos, check-ins, and computed metrics
 * for displaying the user's transformation journey summary.
 */
export function useTransformationData(bookingId: string) {
  const { data, isLoading, error, refetch } = trpc.alumni.getJourneySummary.useQuery(
    { bookingId },
    { enabled: !!bookingId }
  );

  const metrics = useMemo(() => ({
    totalActivities: data?.metrics?.totalActivities ?? 0,
    photosUploaded: data?.metrics?.photosUploaded ?? 0,
    daysOnTrip: data?.metrics?.daysOnTrip ?? 0,
    pickleballSessions: data?.metrics?.pickleballSessions ?? 0,
  }), [data?.metrics]);

  return {
    booking: data?.booking,
    trip: data?.trip,
    photos: data?.photos ?? [],
    checkIns: data?.checkIns ?? [],
    metrics,
    isLoading,
    error,
    refetch,
  };
}
