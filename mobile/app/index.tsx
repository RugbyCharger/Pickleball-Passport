import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Add auth check in Phase 10-02
  // Will redirect to (auth)/sign-in if not authenticated

  // For now, redirect directly to the app tabs
  return <Redirect href="/(app)/(tabs)" />;
}
