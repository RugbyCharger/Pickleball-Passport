import { Stack } from 'expo-router';

export default function TripLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#059669' },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Trip Overview' }}
      />
      <Stack.Screen
        name="itinerary"
        options={{ title: 'Itinerary' }}
      />
      <Stack.Screen
        name="travelers"
        options={{ title: 'Fellow Travelers' }}
      />
      <Stack.Screen
        name="chat"
        options={{ title: 'Group Chat' }}
      />
      <Stack.Screen
        name="packing"
        options={{ title: 'Packing List' }}
      />
      <Stack.Screen
        name="photos"
        options={{ title: 'Trip Photos' }}
      />
      <Stack.Screen
        name="journal"
        options={{ title: 'My Journal' }}
      />
      <Stack.Screen
        name="concierge"
        options={{ title: 'Concierge' }}
      />
    </Stack>
  );
}
