import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import {
  isBiometricsEnabled,
  authenticateWithBiometrics,
} from '../../lib/biometrics';
import { OfflineBanner } from '@/components/OfflineBanner';
import { PendingMutationsIndicator } from '@/components/PendingMutationsIndicator';

export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [isCheckingBiometrics, setIsCheckingBiometrics] = useState(false);
  const appState = useRef(AppState.currentState);

  // Check biometrics when app comes to foreground
  useEffect(() => {
    const checkBiometrics = async () => {
      const enabled = await isBiometricsEnabled();
      if (enabled && isSignedIn) {
        setIsCheckingBiometrics(true);
        const success = await authenticateWithBiometrics();
        setIsUnlocked(success);
        setIsCheckingBiometrics(false);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        // Only check biometrics when coming from background to active
        if (
          appState.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          checkBiometrics();
        }
        appState.current = nextState;
      }
    );

    return () => subscription.remove();
  }, [isSignedIn]);

  // Show loading while checking auth state
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Show loading while checking biometrics
  if (isCheckingBiometrics || !isUnlocked) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <OfflineBanner />
      <View className="absolute top-12 right-4 z-50">
        <PendingMutationsIndicator />
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
}
