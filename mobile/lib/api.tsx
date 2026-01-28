import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { trpc, createTRPCClient } from './trpc';

export function ApiProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: 1,
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  );
}

export { trpc };
