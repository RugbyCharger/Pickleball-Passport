import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import superjson from 'superjson';

/**
 * tRPC Client Configuration for Mobile
 *
 * TODO: Set up proper monorepo type sharing in a later phase.
 * For now, we use a loosely typed client that still provides
 * runtime type safety through the server's schema validation.
 *
 * The actual AppRouter type is defined in lib/trpc/server/root.ts
 *
 * Proper solutions for later:
 * 1. Use Turborepo/Nx with shared packages
 * 2. Create a dedicated @pickleball/api-types package
 * 3. Use TypeScript project references
 */

// Use 'any' for the router type to avoid monorepo type import issues
// Runtime safety is still enforced by tRPC's schema validation on the server
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpc: any = createTRPCReact<any>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTRPCClient(getToken: () => Promise<string | null>): any {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${apiUrl}/api/trpc`,
        transformer: superjson,
        async headers() {
          const token = await getToken();
          return {
            Authorization: token ? `Bearer ${token}` : '',
          };
        },
      }),
    ],
  });
}

// Re-export TRPCClientError for error handling
export { TRPCClientError };
