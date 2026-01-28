# Phase 12: During-Trip Experience - Research

**Researched:** 2026-01-28
**Domain:** Mobile trip experience (itinerary, concierge, SOS, photo gallery, court booking)
**Confidence:** HIGH

## Summary

Phase 12 builds on the solid foundation from Phase 11 (Stream Chat, MMKV, offline infrastructure, itinerary viewing). The primary technical challenges are: (1) GPS location access for emergency SOS, (2) image compression before upload for photo journal, (3) extending Stream Chat for concierge 1:1 support, and (4) simple form-based court booking and transportation requests.

The existing itinerary screen already displays activities with offline support. Activity check-in can be implemented as a simple mutation to track guest participation. Court booking and transportation requests are straightforward form submissions to new tRPC endpoints - no external integrations required for v2.0 MVP.

**Primary recommendation:** Leverage existing infrastructure heavily. Use expo-location for SOS GPS, expo-image-manipulator for photo compression, extend chatRouter for concierge channels, and add simple CRUD endpoints for activity check-in, court booking, and transportation requests.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stream-chat-expo | existing | Trip chat + concierge chat | Already proven in Phase 11 |
| expo-image-picker | existing | Camera/gallery access | Used in PassportUpload component |
| @tanstack/react-query | existing | API caching + offline | Already configured with MMKV persistence |
| react-native-mmkv | existing | Offline data storage | Already configured in Phase 11 |

### New Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-location | latest | GPS coordinates for SOS | Emergency SOS feature |
| expo-image-manipulator | latest | Resize/compress photos | Before photo upload (max 1920x1080, <2MB) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-location | react-native-geolocation | expo-location is better integrated with Expo |
| expo-image-manipulator | react-native-compressor | expo-image-manipulator is managed workflow compatible |
| New photo gallery model | Extend Document model | New model clearer for photo-specific features |

**Installation:**
```bash
cd mobile && npx expo install expo-location expo-image-manipulator
```

## Architecture Patterns

### Recommended Project Structure
```
mobile/
├── app/(app)/trip/[tripId]/
│   ├── index.tsx           # Trip overview (exists)
│   ├── itinerary.tsx       # Daily itinerary (exists - add check-in)
│   ├── chat.tsx            # Group chat (exists)
│   ├── concierge.tsx       # NEW: 1:1 concierge support
│   ├── photos.tsx          # NEW: Photo gallery
│   ├── courts.tsx          # NEW: Court booking
│   ├── players.tsx         # NEW: Find players
│   ├── transport.tsx       # NEW: Transportation request
│   └── travelers.tsx       # Fellow travelers (exists)
├── components/
│   ├── trip/               # Existing trip components
│   ├── photos/             # NEW: PhotoUpload, PhotoGallery, PhotoCard
│   └── sos/                # NEW: SOSButton, SOSModal
├── hooks/
│   ├── useLocation.ts      # NEW: GPS access wrapper
│   └── useImageCompressor.ts # NEW: Image resize/compress
└── lib/
    ├── stream-chat.ts      # Extend for concierge channel
    └── offline.ts          # Existing offline utilities
```

### Pattern 1: Concierge Channel (Extend Stream Chat)
**What:** Create a separate "concierge" channel type for 1:1 support chat (vs group "trip" channel)
**When to use:** User taps "Contact Concierge" button
**Example:**
```typescript
// Source: getstream.io/chat/docs/php/channel_features/
// Concierge channel pattern: user-{clerkId}-concierge
const getConciergeChannel = useCallback(
  async (): Promise<StreamChannel | null> => {
    if (!client || !userId) return null;
    // Channel ID: unique per user, connects to concierge staff
    const channel = client.channel('messaging', `concierge-${userId}`, {
      name: 'Concierge Support',
      members: [userId, 'concierge-staff'], // Staff added server-side
    });
    await channel.watch();
    return channel;
  },
  [client, userId]
);
```

### Pattern 2: Image Compression Before Upload
**What:** Resize and compress images to meet <2MB, max 1920x1080 constraints
**When to use:** Before any photo upload (trip journal, gallery)
**Example:**
```typescript
// Source: docs.expo.dev/versions/latest/sdk/imagemanipulator/
import * as ImageManipulator from 'expo-image-manipulator';

async function compressImage(uri: string): Promise<string> {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1920, height: 1080 } }], // Max dimensions
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult.uri;
}
```

### Pattern 3: GPS Location for SOS
**What:** Request foreground permissions, get current position with high accuracy
**When to use:** User triggers SOS button
**Example:**
```typescript
// Source: docs.expo.dev/versions/latest/sdk/location/
import * as Location from 'expo-location';

async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}
```

### Pattern 4: Activity Check-In (Simple Mutation)
**What:** Track when guest checks in to an activity
**When to use:** Guest taps "Check In" button on activity card
**Example:**
```typescript
// Backend mutation pattern - store check-in with timestamp
const checkIn = trpc.activity.checkIn.useMutation({
  onSuccess: () => {
    utils.trip.getItinerary.invalidate();
  },
});

// Call with activity ID
checkIn.mutate({ activityId: activity.id });
```

### Anti-Patterns to Avoid
- **Hand-rolling chat:** Don't build custom WebSocket chat - Stream Chat already works
- **Storing full-res images:** Always compress before upload per constraints
- **Background location:** v2.0 only needs foreground location for SOS (not tracking)
- **Complex booking integrations:** Court booking is internal form, not external API

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image compression | Custom canvas resize | expo-image-manipulator | Handles memory, formats, quality |
| GPS location | Navigator.geolocation | expo-location | Better Expo integration, permissions |
| Concierge chat | Custom WebSocket | Stream Chat channel | Already integrated, proven |
| Photo grid layout | Custom FlatList grid | FlatList numColumns={3} | Simple built-in solution |

**Key insight:** Phase 11 already solved the hard infrastructure problems (offline, chat, persistence). Phase 12 is primarily UI screens calling existing patterns.

## Common Pitfalls

### Pitfall 1: Memory Pressure from Large Images
**What goes wrong:** Loading many full-resolution photos crashes app on older devices
**Why it happens:** FlatList renders all visible images at full resolution
**How to avoid:**
- Always compress to max 1920x1080 before upload
- Use thumbnails in gallery grid (generate server-side or use small size)
- Use `removeClippedSubviews` on FlatList
**Warning signs:** App crashes or freezes when viewing photo gallery

### Pitfall 2: GPS Permission Denied State
**What goes wrong:** SOS fails silently when user denied location permission
**Why it happens:** No graceful fallback for permission denied
**How to avoid:**
- Show clear UI explaining why location is needed for SOS
- Store permission status and re-prompt on SOS tap
- Allow SOS to submit without location (with warning) rather than fail completely
**Warning signs:** Users report SOS "doesn't work"

### Pitfall 3: Stream Chat Channel Creation Race
**What goes wrong:** Multiple channel.create() calls from rapid navigation
**Why it happens:** useEffect triggers before previous channel is ready
**How to avoid:**
- Check if channel exists before creating
- Use single getConciergeChannel function (like getTripChannel)
- Memoize channel reference
**Warning signs:** Duplicate channels appear, "channel not found" errors

### Pitfall 4: Offline Photo Upload Queue
**What goes wrong:** Photos "uploaded" offline are lost
**Why it happens:** v2.0 is view-only offline (per REQUIREMENTS.md)
**How to avoid:**
- Disable upload button when offline (check useNetworkStatus)
- Show clear "You must be online to upload photos" message
- Don't build mutation queue for v2.0
**Warning signs:** Users lose photos they "uploaded" offline

## Code Examples

Verified patterns from official sources and existing codebase:

### Photo Upload with Compression
```typescript
// Based on existing PassportUpload.tsx pattern + expo-image-manipulator
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

async function pickAndCompressImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 1, // We'll compress ourselves
  });

  if (result.canceled) return null;

  // Compress per requirements: max 1920x1080, <2MB
  const compressed = await ImageManipulator.manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: 1920 } }], // Height auto-calculated
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  return compressed.uri;
}
```

### SOS Button Component Pattern
```typescript
// Emergency SOS with GPS location
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

async function triggerSOS(tripId: string) {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    let location = null;
    if (status === 'granted') {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      location = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
    }

    // Submit SOS to backend
    await sosApi.submit({
      tripId,
      location,
      timestamp: new Date().toISOString(),
    });

    // Show confirmation
    Alert.alert(
      'SOS Sent',
      'Our concierge team has been notified and will contact you immediately.',
      [
        { text: 'OK' },
        { text: 'Call Emergency', onPress: () => Linking.openURL('tel:911') },
      ]
    );
  } catch (error) {
    Alert.alert('Error', 'Failed to send SOS. Please call emergency services directly.');
  }
}
```

### Concierge Channel Extension
```typescript
// Extend existing stream-chat.ts
export function useStreamChatClient() {
  // ... existing code ...

  // NEW: Hook to get concierge support channel
  const getConciergeChannel = useCallback(
    async (): Promise<StreamChannel | null> => {
      if (!client || !userId) return null;

      const channel = client.channel('messaging', `concierge-${userId}`, {
        name: 'Concierge Support',
        created_by_id: userId,
      });

      await channel.watch();
      return channel;
    },
    [client, userId]
  );

  return { client, isReady, getTripChannel, getConciergeChannel };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual GPS polling | expo-location hooks | Expo SDK 50 | Simpler permissions handling |
| Custom image resize | ImageManipulator.manipulateAsync | Stable | Memory-safe compression |
| WebSocket chat | Stream Chat SDK | Already implemented | Production-ready chat |

**Deprecated/outdated:**
- `react-native-camera` (use expo-camera or expo-image-picker)
- Manual FormData upload (use file URI directly with Supabase)

## Data Model Extensions

### New Prisma Models Needed

```prisma
// Activity check-in tracking
model ActivityCheckIn {
  id          String   @id @default(cuid())
  bookingId   String
  booking     Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  activityId  String   // References ItineraryActivity
  checkedInAt DateTime @default(now())

  @@unique([bookingId, activityId])
  @@index([bookingId])
}

// Trip photos for journal/gallery
model TripPhoto {
  id          String   @id @default(cuid())
  tripId      String
  trip        Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  uploadedBy  String   // Clerk user ID
  fileUrl     String   // Supabase Storage URL
  thumbnailUrl String? // Optional thumbnail for gallery grid
  caption     String?
  uploadedAt  DateTime @default(now())

  @@index([tripId])
  @@index([uploadedBy])
}

// Court booking requests
model CourtBooking {
  id          String   @id @default(cuid())
  tripId      String
  trip        Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  requestedBy String   // Clerk user ID
  date        DateTime
  startTime   String   // e.g., "09:00"
  duration    Int      // minutes (60, 90, 120)
  players     Int      // number of players
  notes       String?
  status      String   @default("PENDING") // PENDING, CONFIRMED, CANCELLED
  createdAt   DateTime @default(now())

  @@index([tripId])
  @@index([requestedBy])
  @@index([date])
}

// Transportation requests
model TransportRequest {
  id          String   @id @default(cuid())
  tripId      String
  trip        Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  requestedBy String   // Clerk user ID
  date        DateTime
  pickupTime  String
  pickupLocation String
  destination String
  passengers  Int
  notes       String?
  status      String   @default("PENDING") // PENDING, CONFIRMED, COMPLETED
  createdAt   DateTime @default(now())

  @@index([tripId])
  @@index([requestedBy])
}

// SOS alerts
model SOSAlert {
  id          String   @id @default(cuid())
  tripId      String
  trip        Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  userId      String   // Clerk user ID
  latitude    Float?
  longitude   Float?
  message     String?
  status      String   @default("ACTIVE") // ACTIVE, RESOLVED
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?
  resolvedBy  String?  // Admin who resolved

  @@index([tripId])
  @@index([userId])
  @@index([status])
}
```

### Existing Models to Extend

```prisma
// Add relations to Trip model
model Trip {
  // ... existing fields ...
  photos          TripPhoto[]
  courtBookings   CourtBooking[]
  transportRequests TransportRequest[]
  sosAlerts       SOSAlert[]
}

// Add relations to Booking model
model Booking {
  // ... existing fields ...
  activityCheckIns ActivityCheckIn[]
}
```

## New tRPC Routers Needed

| Router | Purpose | Procedures |
|--------|---------|------------|
| photoRouter | Trip photo management | upload, list, delete |
| activityRouter | Activity check-in | checkIn, getCheckIns |
| courtRouter | Court booking | create, list, cancel |
| transportRouter | Transportation | create, list, cancel |
| sosRouter | Emergency SOS | trigger, resolve (admin) |

## Open Questions

Things that couldn't be fully resolved:

1. **Concierge Staff User**
   - What we know: Stream Chat needs a "concierge-staff" user for 1:1 channels
   - What's unclear: How to create/manage staff users in Stream Chat
   - Recommendation: Create system user on backend, add to channels server-side

2. **Photo Gallery Thumbnails**
   - What we know: Need smaller images for grid view performance
   - What's unclear: Generate client-side vs server-side
   - Recommendation: Upload at 1920x1080, rely on Supabase image transformations for thumbnails

3. **Court Availability**
   - What we know: Simple booking request form
   - What's unclear: Are there actual court schedules to check?
   - Recommendation: Start with simple request form, admin confirms availability manually

## Sources

### Primary (HIGH confidence)
- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/) - GPS API and permissions
- [Expo ImageManipulator Documentation](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) - Image resize/compress
- Existing codebase: PassportUpload.tsx, TripChat.tsx, stream-chat.ts patterns

### Secondary (MEDIUM confidence)
- [Stream Chat Channel Types](https://getstream.io/chat/docs/php/channel_features/) - Commerce type for support
- [Supabase React Native Storage Blog](https://supabase.com/blog/react-native-storage) - File upload patterns

### Tertiary (LOW confidence)
- WebSearch results for masonry grids - may need validation
- WebSearch results for QR check-in patterns - may need validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries well-documented, some already in use
- Architecture: HIGH - Follows established patterns from Phase 11
- Data models: HIGH - Simple CRUD, follows existing Prisma conventions
- Pitfalls: MEDIUM - Based on common React Native patterns

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - stable patterns)
