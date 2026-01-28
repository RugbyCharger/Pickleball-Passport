import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { storage } from './mmkv';

// Adapt MMKV to AsyncStorage interface for TanStack Query
export const clientStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string): string | null => {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

// Create persister for TanStack Query
export const queryPersister = createAsyncStoragePersister({
  storage: clientStorage,
  throttleTime: 1000, // Throttle writes to 1s for performance
});
