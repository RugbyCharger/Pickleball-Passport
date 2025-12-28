/**
 * tRPC Client Configuration
 *
 * This file sets up the tRPC client for use in React components.
 * It provides type-safe API calls with full TypeScript autocomplete.
 */

import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from './server/root'

export const trpc = createTRPCReact<AppRouter>()
