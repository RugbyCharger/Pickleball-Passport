import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface LocationState {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: Location.PermissionStatus | null;
}

/**
 * Hook to access device GPS location with permission handling.
 *
 * Requests foreground location permission and provides current coordinates.
 * Returns null location if permission is denied, allowing SOS to work without GPS.
 */
export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    isLoading: true,
    error: null,
    permissionStatus: null,
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setState((prev) => ({ ...prev, permissionStatus: status }));
      return status === Location.PermissionStatus.GRANTED;
    } catch (err) {
      console.error('Failed to request location permission:', err);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check current permission status
      const { status } = await Location.getForegroundPermissionsAsync();
      setState((prev) => ({ ...prev, permissionStatus: status }));

      if (status !== Location.PermissionStatus.GRANTED) {
        // Try to request permission
        const granted = await requestPermission();
        if (!granted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Location permission not granted',
          }));
          return null;
        }
      }

      // Get current position with balanced accuracy
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      setState((prev) => ({
        ...prev,
        location: locationData,
        isLoading: false,
        error: null,
      }));

      return locationData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      console.error('Failed to get current location:', err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [requestPermission]);

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setState((prev) => ({
          ...prev,
          permissionStatus: status,
          isLoading: false,
        }));
      } catch (err) {
        console.error('Failed to check location permission:', err);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    checkPermission();
  }, []);

  return {
    ...state,
    getCurrentLocation,
    requestPermission,
    hasPermission: state.permissionStatus === Location.PermissionStatus.GRANTED,
    permissionDenied: state.permissionStatus === Location.PermissionStatus.DENIED,
  };
}
