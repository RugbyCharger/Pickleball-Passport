# Phase 11: Pre-Trip Experience - Research

**Researched:** 2026-01-28
**Domain:** Mobile pre-trip preparation, real-time chat, document upload, offline storage
**Confidence:** MEDIUM (known blocker with chat solution requires validation)

## Summary

Phase 11 implements the pre-trip experience for mobile guests: countdown timer, pre-trip checklist with document uploads, fellow travelers view, group chat, packing list management, and offline itinerary download.

The most significant technical challenge is **real-time chat**. The known blocker (Supabase Realtime WebSocket issues on React Native) is confirmed - this requires a different solution. After research, **Stream Chat React Native SDK** is the recommended alternative due to its mature Expo support, offline capabilities, and production-ready features.

The existing document router (`lib/trpc/server/routers/document.ts`) already supports passport upload with PASSPORT document type. Itinerary templates exist in the database with the full structure needed for offline caching.

**Primary recommendation:** Use Stream Chat for real-time messaging (not Supabase Realtime), MMKV + TanStack Query persistence for offline itinerary, and the existing document router for passport uploads.

## Standard Stack

The established libraries/tools for this domain:

### Core (Pre-Trip Features)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **stream-chat-expo** | ^6.0.0 | Real-time chat SDK | Official Expo integration, offline support, mature React Native SDK with 231 code snippets in Context7. Supports new architecture as of v6.0.0. |
| **react-native-mmkv** | ^3.x | Fast key-value storage | 30x faster than AsyncStorage, used by TanStack Query persistence. High reputation (Benchmark: 83.4). |
| **@tanstack/query-async-storage-persister** | ^5.x | Query persistence | Official TanStack plugin for persisting queries to storage |
| **@tanstack/react-query-persist-client** | ^5.x | Persistence provider | Wrap app with PersistQueryClientProvider |
| **expo-image-picker** | SDK 54 | Camera/gallery access | Official Expo SDK for image selection, already in stack |
| **date-fns** | ^4.1.0 | Date calculations | Already in mobile package.json, used for countdown |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@op-engineering/op-sqlite** | ^11.x | Offline chat database | Required for Stream Chat offline support |
| **expo-file-system** | SDK 54 | File downloads | For caching itinerary data to device |
| **@react-native-community/netinfo** | ^11.x | Network detection | Detect offline mode for TanStack Query |
| **react-native-countdown-circle-timer** | ^3.x | Visual countdown | Optional: animated circular countdown display |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stream Chat | Supabase Realtime | Supabase has WebSocket issues on RN - `ws/stream` module import fails even when realtime disabled (GitHub issues #1400, #1403, #1434) |
| Stream Chat | PubNub | PubNub discontinued Chat Components Jan 2025, recommends Chat SDK migration |
| Stream Chat | tRPC SSE subscriptions | Requires polyfills (rn-eventsource-reborn, web-streams-polyfill, @azure/core-asynciterator-polyfill), more fragile than dedicated chat SDK |
| MMKV | AsyncStorage | AsyncStorage is 30x slower, MMKV is industry standard for performance |
| date-fns | moment.js | moment.js is deprecated, date-fns is tree-shakeable and already installed |

**Installation:**
```bash
# Chat
npm install stream-chat-expo stream-chat
npx expo install @react-native-community/netinfo react-native-gesture-handler

# Offline support for Stream Chat (optional but recommended)
npm install @op-engineering/op-sqlite

# Query persistence
npm install @tanstack/query-async-storage-persister @tanstack/react-query-persist-client

# MMKV for fast storage
npm install react-native-mmkv

# Optional: Visual countdown
npm install react-native-countdown-circle-timer
```

## Architecture Patterns

### Recommended Project Structure

```
mobile/
├── app/
│   └── (app)/
│       └── trip/
│           └── [tripId]/
│               ├── index.tsx          # Trip overview (countdown, checklist)
│               ├── itinerary.tsx      # Itinerary view (offline-capable)
│               ├── travelers.tsx      # Fellow travelers list
│               ├── chat.tsx           # Group chat
│               └── packing.tsx        # Packing list
├── lib/
│   ├── stream-chat.ts      # Stream Chat client setup
│   ├── mmkv.ts             # MMKV storage configuration
│   ├── query-persister.ts  # TanStack Query persistence
│   └── offline.ts          # Network detection utilities
├── components/
│   ├── trip/
│   │   ├── CountdownTimer.tsx
│   │   ├── ChecklistItem.tsx
│   │   ├── TravelerCard.tsx
│   │   └── PackingListItem.tsx
│   └── chat/
│       └── TripChat.tsx    # Stream Chat wrapper
└── hooks/
    ├── useCountdown.ts
    ├── useOfflineItinerary.ts
    └── useNetworkStatus.ts
```

### Pattern 1: Stream Chat Setup with Clerk Auth

**What:** Initialize Stream Chat client with user token from Clerk session
**When to use:** App initialization for authenticated users

```typescript
// Source: Context7 /getstream/stream-chat-react-native
// lib/stream-chat.ts
import { StreamChat } from 'stream-chat';
import { useAuth } from '@clerk/clerk-expo';

const chatClient = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY!);

export function useStreamChatClient() {
  const { getToken, userId } = useAuth();
  const [client, setClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    if (!userId) return;

    const connectUser = async () => {
      // Get Stream Chat token from your backend
      const streamToken = await trpc.chat.getStreamToken.query();

      await chatClient.connectUser(
        { id: userId, name: user.fullName },
        streamToken
      );
      setClient(chatClient);
    };

    connectUser();

    return () => {
      chatClient.disconnectUser();
    };
  }, [userId]);

  return client;
}
```

### Pattern 2: MMKV + TanStack Query Persistence

**What:** Persist TanStack Query cache to MMKV for offline access
**When to use:** Itinerary data that must be available offline

```typescript
// Source: Context7 /mrousavy/react-native-mmkv
// lib/query-persister.ts
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'trpc-cache' });

const clientStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

export const queryPersister = createAsyncStoragePersister({
  storage: clientStorage,
});
```

### Pattern 3: Offline-First Itinerary Query

**What:** Query itinerary with offline-first behavior using TanStack Query
**When to use:** Itinerary screen that must work without network

```typescript
// hooks/useOfflineItinerary.ts
export function useOfflineItinerary(bookingId: string) {
  return trpc.itinerary.getTemplateByPackage.useQuery(
    { packageId: booking?.packageId },
    {
      staleTime: Infinity,              // Never consider stale while in cache
      gcTime: 30 * 24 * 60 * 60 * 1000, // Keep for 30 days
      networkMode: 'offlineFirst',      // Use cache first
      enabled: !!booking?.packageId,
    }
  );
}
```

### Pattern 4: Countdown Timer Hook

**What:** Custom hook for trip departure countdown
**When to use:** Trip overview screen showing days until departure

```typescript
// hooks/useCountdown.ts
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

export function useCountdown(targetDate: Date) {
  const [countdown, setCountdown] = useState(calculateCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(targetDate));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [targetDate]);

  return countdown;
}

function calculateCountdown(target: Date) {
  const now = new Date();
  return {
    days: Math.max(0, differenceInDays(target, now)),
    hours: Math.max(0, differenceInHours(target, now) % 24),
    minutes: Math.max(0, differenceInMinutes(target, now) % 60),
    isPast: target < now,
  };
}
```

### Anti-Patterns to Avoid

- **Using Supabase Realtime on React Native:** The `ws` module import fails even when realtime is disabled. This is a bundler-level issue with the `stream` Node.js module not being available in React Native.

- **Storing large JSON in MMKV:** While MMKV is fast, storing the entire TanStack Query cache on every change can impact performance. Set `throttleTime` in persist options.

- **Polling for chat updates:** Real-time chat must use WebSocket/SSE connections, not polling. Use Stream Chat's built-in connection management.

- **Fetching itinerary every time:** Cache itinerary aggressively with `staleTime: Infinity` for offline access.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Real-time chat | Custom WebSocket + message queue | Stream Chat SDK | Presence, typing indicators, read receipts, offline queue, delivery status - years of edge cases |
| Offline storage | Raw AsyncStorage | MMKV | 30x faster, synchronous reads, automatic serialization |
| Query persistence | Manual localStorage sync | TanStack Query Persist | Handles hydration, stale cache, GC timing correctly |
| Countdown timer | setInterval + manual calculation | date-fns + useEffect | Timezone handling, DST transitions, edge cases |
| Image compression | Manual canvas resize | expo-image-picker quality option | SDK handles compression, memory management |

**Key insight:** Chat is deceptively complex. Stream Chat handles message ordering during reconnection, optimistic updates, retry queues, presence management, typing indicators, and delivery receipts. Building this custom would take weeks and have bugs.

## Common Pitfalls

### Pitfall 1: Supabase Realtime Module Import Failure

**What goes wrong:** App crashes on startup with "Unable to resolve module stream from node_modules/ws/lib/sender.js"
**Why it happens:** Supabase JS client imports `ws` module which depends on Node.js `stream` module, not available in React Native
**How to avoid:** Use Stream Chat instead of Supabase Realtime for chat. If using Supabase for other features, use separate auth/database clients without realtime.
**Warning signs:** Build errors mentioning `ws`, `stream`, or WebSocket modules

### Pitfall 2: TanStack Query GC Discarding Offline Cache

**What goes wrong:** User opens app offline, sees empty screen despite previously cached data
**Why it happens:** `gcTime` default is 5 minutes, but `maxAge` in persist is 24 hours. GC runs first and clears cache.
**How to avoid:** Set `gcTime` >= `maxAge` in persist options. For offline data, use `gcTime: 30 * 24 * 60 * 60 * 1000` (30 days).
**Warning signs:** Data loads online, missing offline after app restart

### Pitfall 3: Chat Messages Duplicated After Reconnection

**What goes wrong:** Messages appear twice after user goes offline and comes back online
**Why it happens:** Optimistic updates + server sync without proper deduplication
**How to avoid:** Use Stream Chat's built-in offline support with `enableOfflineSupport={true}` - it handles message deduplication
**Warning signs:** Duplicate messages, messages in wrong order

### Pitfall 4: Passport Upload Fails with Large Images

**What goes wrong:** Upload hangs or times out when user takes high-resolution passport photo
**Why it happens:** Modern phones take 10MB+ photos, upload is slow and may timeout
**How to avoid:** Use expo-image-picker with `quality: 0.7` and `allowsEditing: true` to compress before upload
**Warning signs:** Long upload times, timeouts, out of memory errors

### Pitfall 5: Countdown Shows Wrong Time After Background

**What goes wrong:** Countdown freezes or shows wrong value when app returns from background
**Why it happens:** setInterval pauses when app is backgrounded, doesn't update state
**How to avoid:** Use AppState listener to recalculate countdown when app comes to foreground
**Warning signs:** Countdown stuck, jumps when user interacts

## Code Examples

Verified patterns from official sources:

### Stream Chat Integration

```typescript
// Source: Context7 /getstream/stream-chat-react-native
// app/(app)/trip/[tripId]/chat.tsx
import { Chat, Channel, MessageList, MessageInput, OverlayProvider } from 'stream-chat-expo';

export default function TripChatScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const chatClient = useStreamChatClient();
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (!chatClient) return;

    const tripChannel = chatClient.channel('messaging', `trip-${tripId}`);
    tripChannel.watch().then(() => setChannel(tripChannel));
  }, [chatClient, tripId]);

  if (!chatClient || !channel) {
    return <LoadingScreen />;
  }

  return (
    <OverlayProvider>
      <Chat client={chatClient} enableOfflineSupport={true}>
        <Channel channel={channel}>
          <MessageList />
          <MessageInput />
        </Channel>
      </Chat>
    </OverlayProvider>
  );
}
```

### Passport Upload with Compression

```typescript
// Source: Expo ImagePicker docs
// components/PassportUpload.tsx
import * as ImagePicker from 'expo-image-picker';

export function PassportUpload({ bookingId }: { bookingId: string }) {
  const createDocument = trpc.document.create.useMutation();

  const handleUpload = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to scan your passport');
      return;
    }

    // Launch camera with compression
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 2], // Passport aspect ratio
      quality: 0.7,   // Compress to 70% quality
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    // Upload to Supabase Storage (existing pattern)
    const fileUrl = await uploadToSupabase(asset.uri);

    // Create document record
    await createDocument.mutateAsync({
      bookingId,
      type: 'PASSPORT',
      fileName: 'passport-scan.jpg',
      fileUrl,
      fileSize: asset.fileSize || 0,
      mimeType: 'image/jpeg',
    });
  };

  return (
    <TouchableOpacity onPress={handleUpload}>
      <View className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center">
        <Camera size={48} className="text-gray-400" />
        <Text className="text-gray-600 mt-2">Tap to scan passport</Text>
      </View>
    </TouchableOpacity>
  );
}
```

### App Provider with Persistence

```typescript
// Source: Context7 /mrousavy/react-native-mmkv
// app/_layout.tsx (update existing)
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryPersister } from '@/lib/query-persister';
import { onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

// Set up network status for TanStack Query
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// In providers:
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister: queryPersister,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    gcTime: 30 * 24 * 60 * 60 * 1000, // Must match or exceed maxAge
  }}
>
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    {children}
  </trpc.Provider>
</PersistQueryClientProvider>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Supabase Realtime for RN chat | Dedicated chat SDK (Stream, PubNub) | 2024-2025 | Supabase `ws` import broken on RN since SDK 53+ |
| AsyncStorage for offline | MMKV | 2023+ | 30x faster, better performance |
| moment.js for dates | date-fns | 2020+ | Tree-shakeable, smaller bundle |
| Custom setInterval countdown | useCountdown hook with AppState | Current | Handles background correctly |
| Manual query caching | TanStack Query persist | 2024+ | Automatic cache hydration |

**Deprecated/outdated:**
- **PubNub Chat Components:** Discontinued Jan 2025, migrate to Chat SDK
- **Supabase Realtime on React Native:** Broken due to `ws` module, use dedicated chat SDK
- **AsyncStorage for performance-critical data:** Use MMKV instead

## Open Questions

Things that couldn't be fully resolved:

1. **Stream Chat Token Generation**
   - What we know: Stream Chat requires server-generated tokens for user authentication
   - What's unclear: Exact tRPC procedure needed on backend to generate Stream tokens
   - Recommendation: Create `chat.getStreamToken` procedure using Stream's server SDK

2. **Fellow Travelers Opt-In Implementation**
   - What we know: Users must opt-in to be visible to other travelers
   - What's unclear: Where to store opt-in preference (Booking model? User model?)
   - Recommendation: Add `showInTravelersList: Boolean @default(false)` to Booking model

3. **Packing List Data Model**
   - What we know: Users can view and customize packing lists
   - What's unclear: No existing PackingList/PackingItem models in schema
   - Recommendation: Create `PackingListTemplate` (admin-managed) and `GuestPackingItem` (user overrides) models

4. **Stream Chat Pricing**
   - What we know: Stream Chat has free tier, paid plans for production
   - What's unclear: Monthly cost for expected user volume
   - Recommendation: Start with free tier (1000 MAU), evaluate during development

## New Database Models Needed

Based on research, these models should be added:

```prisma
// Packing list template (admin-managed defaults)
model PackingListTemplate {
  id          String   @id @default(cuid())
  packageId   String?
  package     Package? @relation(fields: [packageId], references: [id], onDelete: SetNull)
  category    String   // "Clothing", "Medical", "Electronics", "Documents"
  item        String   // "Sunscreen", "Passport copy", etc.
  isDefault   Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([packageId])
  @@index([category])
}

// Guest's personalized packing list item
model GuestPackingItem {
  id          String   @id @default(cuid())
  bookingId   String
  booking     Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  templateId  String?  // Link to template item if based on default
  template    PackingListTemplate? @relation(fields: [templateId], references: [id])
  item        String   // Custom item name or override
  category    String
  isPacked    Boolean  @default(false)
  isCustom    Boolean  @default(false) // User-added vs template-based
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([bookingId])
  @@index([isPacked])
}
```

## New tRPC Procedures Needed

| Router | Procedure | Purpose |
|--------|-----------|---------|
| chat | getStreamToken | Generate Stream Chat user token |
| trip | getTripDetails | Get trip with countdown, travelers, checklist status |
| packing | getPackingList | Get user's packing list (template + customizations) |
| packing | toggleItem | Mark item packed/unpacked |
| packing | addCustomItem | Add user's custom packing item |
| packing | deleteCustomItem | Remove custom item |
| booking | updateTravelerVisibility | Toggle showInTravelersList |
| trip | getFellowTravelers | Get opt-in travelers for a trip |

## Sources

### Primary (HIGH confidence)
- [Context7 /getstream/stream-chat-react-native](https://context7.com/getstream/stream-chat-react-native/llms.txt) - Stream Chat setup, offline support, channel creation
- [Context7 /mrousavy/react-native-mmkv](https://context7.com/mrousavy/react-native-mmkv) - MMKV + TanStack Query integration
- [Context7 /supabase/supabase-js](https://context7.com/supabase/supabase-js/llms.txt) - React Native support notes, realtime configuration
- [Expo ImagePicker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/) - Camera permissions, compression options
- [TanStack Query Persist Documentation](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient) - gcTime, maxAge configuration
- [tRPC HTTP Subscription Link](https://trpc.io/docs/client/links/httpSubscriptionLink) - SSE polyfills for React Native

### Secondary (MEDIUM confidence)
- [Stream Chat React Native Expo Tutorial](https://getstream.io/chat/react-native-chat-expo/tutorial/) - Installation, navigation setup
- [GitHub: react-native-mmkv React Query wrapper](https://github.com/mrousavy/react-native-mmkv/blob/main/docs/WRAPPER_REACT_QUERY.md) - Storage adapter implementation
- [TanStack Query Offline Discussion](https://github.com/TanStack/query/discussions/4342) - networkMode, offline patterns

### Tertiary (LOW confidence - needs validation)
- [Supabase GitHub Issue #1434](https://github.com/supabase/supabase-js/issues/1434) - ws module import failure on RN
- [Supabase GitHub Issue #1403](https://github.com/supabase/supabase-js/issues/1403) - SDK 53 stream error
- [Supabase GitHub Issue #1400](https://github.com/supabase/supabase-js/issues/1400) - Expo SDK 53 compatibility
- Stream Chat pricing tiers - verify on getstream.io

## Metadata

**Confidence breakdown:**
- Standard stack (chat): MEDIUM - Stream Chat is validated, but requires new backend integration
- Standard stack (offline): HIGH - MMKV + TanStack Query well-documented pattern
- Architecture: HIGH - Clear patterns from Context7 documentation
- Pitfalls: HIGH - Multiple sources confirm Supabase Realtime issue

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - chat SDK versions may update)

---

## Existing Code Reuse

The following existing code can be reused for Phase 11:

**Already Implemented:**
- `lib/trpc/server/routers/document.ts` - Full passport upload support with PASSPORT type
- `lib/trpc/server/routers/itinerary.ts` - `getTemplateByPackage` procedure for itinerary data
- `mobile/components/BookingCard.tsx` - Card component pattern for travelers
- `mobile/lib/biometrics.ts` - Pattern for feature toggles with SecureStore

**Database Models Already Exist:**
- `Document` model with PASSPORT type - no schema changes needed for passport upload
- `ItineraryTemplate`, `ItineraryDay`, `ItineraryActivity` - full itinerary structure exists
- `Trip` model with `whatsappGroupInviteLink` - shows group communication pattern

**Needs Extension:**
- `Booking` model - add `showInTravelersList` field
- New `PackingListTemplate` and `GuestPackingItem` models
- New `chat` tRPC router for Stream token generation
