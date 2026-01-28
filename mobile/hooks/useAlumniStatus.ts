import { trpc } from '../lib/api';

/**
 * Hook to get the current user's alumni status.
 *
 * Alumni status is determined by having at least one completed booking
 * (a booking where the associated trip's end date has passed).
 */
export function useAlumniStatus() {
  const { data, isLoading, error, refetch } = trpc.alumni.getStatus.useQuery();

  return {
    isAlumni: data?.isAlumni ?? false,
    alumniSince: data?.alumniSince ?? null,
    totalTrips: data?.totalTrips ?? 0,
    completedBookings: data?.completedBookings ?? [],
    isLoading,
    error,
    refetch,
  };
}
