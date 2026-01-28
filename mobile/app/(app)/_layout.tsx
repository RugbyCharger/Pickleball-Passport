import { Stack } from 'expo-router';

export default function AppLayout() {
  // TODO: Add auth protection in Phase 10-02
  // Will redirect to (auth) if user is not authenticated

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
