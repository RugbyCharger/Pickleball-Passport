import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager, useQueryClient, useMutation } from '@tanstack/react-query';

// Set up TanStack Query online/offline detection
export function setupOfflineDetection() {
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
  });
}

// Hook to check network status in components
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected };
}

// Hook to check for pending (paused) mutations
export function useHasPendingMutations() {
  const queryClient = useQueryClient();
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    const mutationCache = queryClient.getMutationCache();

    const checkPending = () => {
      const pending = mutationCache.getAll().some(
        (mutation) => mutation.state.isPaused
      );
      setHasPending(pending);
    };

    checkPending();

    const unsubscribe = mutationCache.subscribe(checkPending);
    return () => unsubscribe();
  }, [queryClient]);

  return hasPending;
}

// Utility to create offline-friendly mutations
export function useOfflineMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
  }
) {
  return useMutation({
    mutationFn,
    networkMode: 'offlineFirst',
    retry: 3,
    ...options,
  });
}
