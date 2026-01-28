import { ClerkProvider, ClerkLoaded, useAuth, useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { ReactNode, useEffect } from 'react';
import { setOneSignalExternalId, clearOneSignalUser } from './onesignal';

// Token cache using expo-secure-store
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      // Handle error silently - secure store may not be available in all environments
    }
  },
};

/**
 * Syncs OneSignal external ID with Clerk user state
 *
 * When user signs in, associates their Clerk ID with OneSignal for targeted push.
 * When user signs out, clears the association.
 */
function OneSignalUserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (user?.id) {
      // User signed in - associate with OneSignal
      setOneSignalExternalId(user.id);
    } else {
      // User signed out - clear OneSignal association
      clearOneSignalUser();
    }
  }, [user?.id, isLoaded]);

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <OneSignalUserSync />
        {children}
      </ClerkLoaded>
    </ClerkProvider>
  );
}

export { useAuth };
