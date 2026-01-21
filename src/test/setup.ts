/**
 * Vitest Test Setup
 *
 * This file is loaded before all tests run.
 * Add any global test setup, mocks, or configurations here.
 */

import { vi } from 'vitest'

// Mock environment variables for tests
vi.stubEnv('NODE_ENV', 'test')

// Silence console output during tests (optional - comment out for debugging)
// vi.spyOn(console, 'log').mockImplementation(() => {})
// vi.spyOn(console, 'warn').mockImplementation(() => {})

// Add any global mocks needed for tests
export {}
