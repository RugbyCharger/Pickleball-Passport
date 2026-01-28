import { Stack } from 'expo-router';

/**
 * Alumni section layout with Stack navigator.
 *
 * Purple theme color (#7c3aed) distinguishes the alumni section
 * from other parts of the app.
 */
export default function AlumniLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#7c3aed' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Alumni Hub' }} />
      <Stack.Screen name="journey" options={{ title: 'My Journey' }} />
      <Stack.Screen name="referrals" options={{ title: 'Referrals' }} />
      <Stack.Screen name="directory" options={{ title: 'Alumni Directory' }} />
      <Stack.Screen name="stamps" options={{ title: 'Passport Stamps' }} />
      <Stack.Screen name="testimonial" options={{ title: 'Share Your Story' }} />
      <Stack.Screen name="rebook" options={{ title: 'Book Again' }} />
    </Stack>
  );
}
