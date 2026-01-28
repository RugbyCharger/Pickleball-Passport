import { MMKV } from 'react-native-mmkv';

// Create MMKV storage instance for query cache
export const storage = new MMKV({
  id: 'trpc-cache',
});

// Helper to clear cache (for logout)
export function clearQueryCache() {
  storage.clearAll();
}
