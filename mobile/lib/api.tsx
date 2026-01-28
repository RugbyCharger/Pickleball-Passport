import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useState, ReactNode, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { trpc, createTRPCClient } from './trpc';
import { queryPersister } from './query-persister';
import { setupOfflineDetection } from './offline';

export function ApiProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  // Set up offline detection on mount
  useEffect(() => {
    setupOfflineDetection();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: 1,
            gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days for persistence
          },
        },
      })
  );

  const [trpcClient] = useState(() => createTRPCClient(() => getToken()));

  // Use type assertion to bypass the type collision issue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TRPCProvider = (trpc as any).Provider;

  return (
    <TRPCProvider client={trpcClient} queryClient={queryClient}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: queryPersister,
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        }}
      >
        {children}
      </PersistQueryClientProvider>
    </TRPCProvider>
  );
}

export { trpc };
