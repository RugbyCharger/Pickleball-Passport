import { trpc } from '@/lib/trpc';

interface UseOfflineItineraryOptions {
  packageId: string | undefined;
  duration?: number;
}

/**
 * Hook for fetching itinerary with offline-first behavior.
 * Uses aggressive caching to ensure itinerary is available offline.
 */
export function useOfflineItinerary({ packageId, duration }: UseOfflineItineraryOptions) {
  return trpc.itinerary.getTemplateByPackage.useQuery(
    { packageId: packageId!, duration },
    {
      enabled: !!packageId,
      staleTime: Infinity,              // Never consider stale while in cache
      gcTime: 30 * 24 * 60 * 60 * 1000, // Keep for 30 days
      networkMode: 'offlineFirst',      // Use cache first, then fetch
      refetchOnMount: false,            // Don't refetch if we have data
      refetchOnWindowFocus: false,      // Don't refetch on focus
      refetchOnReconnect: false,        // Don't auto-refetch on reconnect
    }
  );
}
