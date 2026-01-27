# Architecture: Expo Mobile Integration with Existing Next.js Platform

**Project:** Pickleball Passport Mobile App (v2.0)
**Researched:** 2026-01-28
**Confidence:** HIGH

## Executive Summary

The Expo React Native mobile app integrates with the existing Next.js/tRPC/Clerk/Supabase architecture through shared API endpoints and authentication sessions. The architecture follows a **client-server model** where the mobile app is a thin client consuming the same tRPC API used by the web app, with platform-specific enhancements for native features (push notifications, biometrics, offline caching, camera access).

**Key architectural principle:** Maximum code reuse through shared tRPC routers, with mobile-specific features added as new tRPC procedures or native modules.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
├──────────────────────────┬──────────────────────────────────┤
│   Web App (Next.js)      │   Mobile App (Expo)              │
│   - Browser              │   - iOS/Android                   │
│   - React 19             │   - React Native                  │
│   - Clerk Web SDK        │   - Clerk Expo SDK                │
│   - tRPC React Hooks     │   - tRPC React Hooks              │
└──────────────┬───────────┴────────────┬─────────────────────┘
               │                        │
               │    HTTP + Clerk Token  │
               │                        │
┌──────────────┴────────────────────────┴─────────────────────┐
│                     API Layer                                │
│   Next.js App Router (/api/trpc/[trpc]/route.ts)           │
│   - tRPC Server (v11.8.1)                                   │
│   - Clerk Auth Context (currentUser)                        │
│   - 30+ Router Modules (booking, user, gift, trip, etc)    │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────────────────────────┐
│                   Database Layer                             │
│   Supabase PostgreSQL                                       │
│   - Prisma ORM (5.22.0)                                     │
│   - Service-role RLS                                        │
│   - Supabase Realtime (chat)                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 External Services                             │
│   - Stripe (payments)                                        │
│   - SendGrid (email)                                         │
│   - S3 (file storage)                                        │
│   - OneSignal (push - mobile only)                          │
└──────────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. Authentication (Clerk)

**Current Web Implementation:**
- `@clerk/nextjs` v6.36.5
- ClerkProvider wraps entire app
- `currentUser()` in tRPC context
- Session-based auth via cookies

**Mobile Integration:**
- `@clerk/clerk-expo` SDK
- ClerkProvider in app/_layout.tsx
- Biometric authentication via `useLocalCredentials()` hook
- Token-based auth (no cookies on mobile)

**Critical Differences:**
| Aspect | Web | Mobile |
|--------|-----|--------|
| SDK | @clerk/nextjs | @clerk/clerk-expo |
| Session Storage | Cookies | expo-secure-store |
| UI Components | Prebuilt components available | Must build custom auth UI |
| Token Handling | Automatic via middleware | Manual via headers in tRPC client |
| Biometrics | Not available | Face ID/Touch ID via LocalAuthentication |

**Implementation Pattern:**
```typescript
// Mobile: app/_layout.tsx
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from './token-cache' // expo-secure-store wrapper

<ClerkProvider
  publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
  tokenCache={tokenCache}
>
  {/* App content */}
</ClerkProvider>

// Mobile: tRPC client setup
import { useAuth } from '@clerk/clerk-expo'

const { getToken } = useAuth()
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'https://pickleballpassport.com/api/trpc',
      async headers() {
        const token = await getToken()
        return {
          authorization: token ? `Bearer ${token}` : '',
        }
      },
    }),
  ],
})
```

**Server-Side Changes Required:**
- NONE. Current tRPC context uses `currentUser()` from `@clerk/nextjs/server`, which validates both cookie-based (web) and token-based (mobile) sessions automatically.

**Sources:**
- [Clerk Expo SDK Documentation](https://clerk.com/docs/reference/expo/overview) - HIGH confidence
- [Clerk + Expo Full-Stack Example](https://dev.to/chrollo4ki/clerk-auth-full-stack-app-expressjs-trpc-expo-nextjs--4i3h) - MEDIUM confidence

---

### 2. API Layer (tRPC)

**Current Web Implementation:**
- tRPC v11.8.1 with React Query integration
- httpBatchLink in providers.tsx
- 30+ router modules in lib/trpc/server/routers/
- superjson transformer
- protectedProcedure middleware

**Mobile Integration:**
- Same tRPC client setup as web
- Same AppRouter type imported
- Different base URL (production domain vs localhost)
- Authentication via Bearer token in headers

**Shared Code:**
```
lib/
├── trpc/
│   ├── client.ts              # Shared: createTRPCReact<AppRouter>()
│   └── server/
│       ├── root.ts            # Shared: AppRouter export
│       ├── trpc.ts            # Shared: context, procedures
│       └── routers/           # Shared: All 30+ routers
│           ├── booking.ts
│           ├── user.ts
│           ├── trip.ts
│           ├── document.ts
│           └── ... (27 more)
```

**Platform-Specific Code:**
```
# Web
app/providers.tsx              # Web-specific tRPC client setup

# Mobile (new)
mobile/app/_layout.tsx         # Mobile-specific tRPC client setup
mobile/utils/trpc.tsx          # Mobile tRPC provider
```

**Key Configuration Differences:**

| Aspect | Web | Mobile |
|--------|-----|--------|
| Base URL | Relative ('/api/trpc') | Absolute ('https://...') |
| Auth Method | Automatic (cookies) | Manual (getToken in headers) |
| Persistence | Browser cache | MMKV + persistQueryClient |
| Network Mode | "online" (default) | "offlineFirst" for cached queries |

**Mobile tRPC Client Pattern:**
```typescript
// mobile/utils/trpc.tsx
import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import { useAuth } from '@clerk/clerk-expo'
import type { AppRouter } from '@/lib/trpc/server/root' // Shared type

export const trpc = createTRPCReact<AppRouter>()

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth()

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 24 * 60 * 60 * 1000, // 24 hours (for persistence)
        networkMode: 'offlineFirst', // Try cache first
      },
    },
  }))

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: process.env.EXPO_PUBLIC_API_URL + '/api/trpc',
          transformer: superjson,
          async headers() {
            const token = await getToken()
            return {
              authorization: token ? `Bearer ${token}` : '',
            }
          },
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: mmkvPersister }}
        >
          {children}
        </PersistQueryClientProvider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

**New Router Procedures Needed:**
- `trip.uploadPhoto` - Photo journal uploads
- `trip.checkInActivity` - Activity check-ins
- `trip.requestTransport` - Transportation requests
- `booking.updateDeviceToken` - OneSignal device registration
- `user.updateBiometricPreference` - Toggle biometric login

**Sources:**
- [tRPC + Expo Integration Examples](https://github.com/intergalacticspacehighway/expo-trpc) - HIGH confidence
- [tRPC React Setup Documentation](https://trpc.io/docs/client/react/setup) - HIGH confidence
- [tRPC Monorepo Patterns](https://github.com/juliusmarminge/create-t3-turbo-1) - MEDIUM confidence

---

### 3. Database Access (Prisma + Supabase)

**Current Pattern:**
- Direct Prisma access ONLY in tRPC procedures
- No client-side Prisma usage
- RLS security via service-role-only policies

**Mobile Integration:**
- IDENTICAL to web: Mobile calls tRPC, tRPC uses Prisma
- NO direct database access from mobile
- NO changes to Prisma schema needed

**Data Flow:**
```
Mobile App → tRPC Client → HTTP → tRPC Server → Prisma → Supabase
     ↑                                                        ↓
     └────────────── Response ──────────────────────────────┘
```

**Exception: Supabase Realtime (Chat)**

For real-time chat features, mobile app creates DIRECT WebSocket connection to Supabase Realtime:

```typescript
// Mobile: Direct Supabase Realtime connection
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

// Subscribe to chat messages
const channel = supabase
  .channel('trip-chat-' + tripId)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `trip_id=eq.${tripId}`
  }, (payload) => {
    // Handle new message
  })
  .subscribe()
```

**Why Direct Connection?**
- Real-time subscriptions require persistent WebSocket
- tRPC doesn't support WebSocket subscriptions well on mobile
- Supabase Realtime is designed for this use case

**Security:**
- Anon key is safe to expose (RLS protects data)
- Row Level Security policies enforce trip membership
- Same RLS policies apply to both web and mobile

**Sources:**
- [Supabase + Expo React Native Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native) - HIGH confidence
- [Expo Supabase Documentation](https://docs.expo.dev/guides/using-supabase/) - HIGH confidence

---

### 4. File Storage (S3)

**Current Web Pattern:**
- Backend generates presigned URLs via tRPC
- Frontend uploads directly to S3
- No S3 credentials in frontend

**Mobile Integration:**
- SAME PATTERN: tRPC generates presigned URL, mobile uploads to S3
- Different file picker: expo-image-picker
- Different upload library: expo-file-system or fetch API

**Implementation Flow:**
```
1. User selects photo with ImagePicker
2. Mobile calls trpc.document.getUploadUrl.mutate({ filename, contentType })
3. Server generates presigned S3 URL (existing code)
4. Mobile uploads file to presigned URL
5. Mobile calls trpc.trip.uploadPhoto.mutate({ url, tripId })
6. Server creates database record
```

**Mobile Upload Code:**
```typescript
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'

// 1. Pick image
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  quality: 0.8,
})

if (!result.canceled) {
  // 2. Get presigned URL
  const { url, fields } = await trpc.document.getUploadUrl.mutate({
    filename: 'photo.jpg',
    contentType: 'image/jpeg',
  })

  // 3. Upload to S3
  const file = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.Base64,
  })

  await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg',
    },
    body: file, // or use FormData for multipart
  })

  // 4. Save record
  await trpc.trip.uploadPhoto.mutate({
    url: url.split('?')[0], // Remove query params
    tripId,
  })
}
```

**New tRPC Procedures Needed:**
- `trip.uploadPhoto` - Save photo journal entry
- `document.getUploadUrl` - May need mobile-specific variant

**Sources:**
- [React Native S3 Upload with Presigned URLs](https://dev.to/ajulibe/uploading-files-from-react-native-to-an-s3-presigned-url-2ab7) - MEDIUM confidence
- [Expo ImagePicker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/) - HIGH confidence
- [React Native S3 Upload Patterns](https://jaka-tertinek.medium.com/upload-files-from-react-native-app-to-aws-s3-3d3cb85e9d4) - MEDIUM confidence

---

### 5. Push Notifications (OneSignal)

**Current State:**
- NOT implemented in web app
- Mobile-specific feature

**Mobile Integration:**
- OneSignal Expo SDK
- Device token registration via tRPC
- Server triggers notifications via OneSignal API

**Architecture:**
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ Mobile App   │ Token   │ tRPC API     │ Trigger │ OneSignal    │
│              ├────────>│              ├────────>│ API          │
│              │         │              │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
       ↑                                                   │
       │                  Push Notification               │
       └───────────────────────────────────────────────────┘
```

**Implementation:**
```typescript
// Mobile: Initialize OneSignal
import OneSignal from 'react-native-onesignal'

OneSignal.initialize(process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID!)

// Get device token
const deviceState = await OneSignal.getDeviceState()
const playerId = deviceState.userId

// Register with backend
await trpc.booking.updateDeviceToken.mutate({
  bookingId,
  deviceToken: playerId,
  platform: Platform.OS,
})

// Server-side: Trigger notification (new code)
import { OneSignalApi } from '@/lib/onesignal'

await OneSignalApi.sendNotification({
  playerIds: [booking.deviceToken],
  contents: { en: "Your trip starts tomorrow!" },
  headings: { en: "Departure Reminder" },
  data: { type: "trip-reminder", tripId: trip.id },
})
```

**Database Changes:**
```prisma
model Booking {
  // ... existing fields
  deviceToken String?
  devicePlatform String? // "ios" | "android"
}
```

**New tRPC Procedures:**
- `booking.updateDeviceToken` - Register/update push token
- `booking.unregisterDevice` - Remove token on logout

**Sources:**
- [OneSignal Expo SDK Setup](https://documentation.onesignal.com/docs/en/react-native-expo-sdk-setup) - HIGH confidence
- [Expo Push Notifications Guide](https://docs.expo.dev/guides/using-push-notifications-services/) - HIGH confidence

---

### 6. Offline Support

**Strategy:** Optimistic UI + TanStack Query Persistence

**Implementation:**
```typescript
// Setup MMKV storage
import { MMKV } from 'react-native-mmkv'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

const storage = new MMKV({ id: 'trpc-cache' })

const clientStorage = {
  setItem: (key: string, value: string) => storage.set(key, value),
  getItem: (key: string) => storage.getString(key) ?? null,
  removeItem: (key: string) => storage.delete(key),
}

export const mmkvPersister = createAsyncStoragePersister({
  storage: clientStorage,
})

// Use with PersistQueryClientProvider
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister: mmkvPersister }}
>
  {children}
</PersistQueryClientProvider>
```

**Offline-First Queries:**
```typescript
// Itinerary: Available offline
const { data: itinerary } = trpc.trip.getItinerary.useQuery(
  { tripId },
  {
    staleTime: Infinity, // Never refetch while in cache
    gcTime: 30 * 24 * 60 * 60 * 1000, // Keep 30 days
    networkMode: 'offlineFirst', // Use cache if available
  }
)

// Mutations: Queue when offline
const uploadPhoto = trpc.trip.uploadPhoto.useMutation({
  onMutate: async (newPhoto) => {
    // Optimistic update
    queryClient.setQueryData(['trip.photos', tripId], (old) => [...old, newPhoto])
  },
  onError: (err, newPhoto, context) => {
    // Rollback on error
    queryClient.setQueryData(['trip.photos', tripId], context.previousPhotos)
  },
})
```

**Offline Features:**
- View itinerary (pre-cached on trip page visit)
- View packing list (pre-cached)
- Browse photo gallery (cached thumbnails)
- Compose messages (queue for send)

**Online-Only Features:**
- Send chat messages
- Upload photos
- Book courts
- Trigger SOS

**Sources:**
- [TanStack Query Persistence Documentation](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient) - HIGH confidence
- [MMKV + TanStack Query Integration](https://github.com/mrousavy/react-native-mmkv/blob/main/docs/WRAPPER_REACT_QUERY.md) - HIGH confidence
- [React Native Offline Patterns with TanStack Query](https://github.com/TanStack/query/discussions/4342) - MEDIUM confidence

---

### 7. Navigation (Expo Router)

**Pattern:** File-based routing + protected routes

**Structure:**
```
mobile/app/
├── _layout.tsx              # Root layout (Clerk + tRPC providers)
├── (auth)/                  # Auth group (public routes)
│   ├── sign-in.tsx
│   └── sign-up.tsx
├── (app)/                   # Main app group (protected routes)
│   ├── _layout.tsx          # App layout with tabs
│   ├── (tabs)/
│   │   ├── index.tsx        # Dashboard
│   │   ├── trip.tsx         # Trip details
│   │   ├── chat.tsx         # Group chat
│   │   └── profile.tsx      # Profile
│   └── trip/
│       ├── [id]/
│       │   ├── itinerary.tsx
│       │   ├── photos.tsx
│       │   └── concierge.tsx
└── +not-found.tsx
```

**Protected Route Implementation:**
```typescript
// app/(app)/_layout.tsx
import { Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'

export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return <LoadingScreen />
  if (!isSignedIn) return <Redirect href="/sign-in" />

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="trip/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
```

**Deep Linking:**
```json
// app.json
{
  "expo": {
    "scheme": "pickleballpassport",
    "ios": {
      "associatedDomains": ["applinks:pickleballpassport.com"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "pickleballpassport.com",
              "pathPrefix": "/app"
            }
          ]
        }
      ]
    }
  }
}
```

**Sources:**
- [Expo Router Protected Routes](https://docs.expo.dev/router/advanced/protected/) - HIGH confidence
- [Expo Router Authentication Patterns](https://docs.expo.dev/router/advanced/authentication/) - HIGH confidence

---

## Component Architecture

### Shared Components (Cross-Platform)

These components can be shared between web and mobile using a monorepo structure:

```
packages/
├── shared-types/           # TypeScript types (Prisma types, API types)
│   ├── booking.ts
│   ├── trip.ts
│   └── user.ts
├── shared-utils/           # Platform-agnostic utilities
│   ├── date-utils.ts
│   ├── currency.ts
│   └── validation.ts
└── api-client/             # tRPC client hooks (if monorepo)
    └── trpc.ts
```

**Recommendation:** For v2.0, START with copy-paste approach (duplicate types in mobile app). MIGRATE to monorepo in future milestone if code sharing becomes painful.

**Why start simple:**
- Monorepo adds complexity (Metro config, workspace setup)
- Mobile app may diverge from web patterns
- Easier to move fast with duplication initially

### Platform-Specific Components

**Web:**
- Uses existing component library (Radix UI, Tailwind)
- Desktop-first layouts

**Mobile:**
- NativeWind for styling (Tailwind for React Native)
- Native UI components (FlatList, ScrollView, SafeAreaView)
- Platform-specific features (biometrics, camera, push)

**Shared Component Pattern:**
```typescript
// components/trip-card/index.web.tsx (Web)
export function TripCard({ trip }: Props) {
  return (
    <div className="border rounded-lg p-4">
      <h3>{trip.title}</h3>
      <p>{trip.dates}</p>
    </div>
  )
}

// components/trip-card/index.tsx (Mobile)
import { View, Text } from 'react-native'

export function TripCard({ trip }: Props) {
  return (
    <View className="border rounded-lg p-4"> {/* NativeWind */}
      <Text className="font-bold text-xl">{trip.title}</Text>
      <Text className="text-gray-600">{trip.dates}</Text>
    </View>
  )
}
```

**Sources:**
- [Expo Monorepo Patterns](https://docs.expo.dev/guides/monorepos/) - HIGH confidence
- [NativeWind Setup Guide](https://www.nativewind.dev/docs/getting-started/installation) - HIGH confidence

---

## Data Flow Patterns

### 1. Read-Heavy Flows (Dashboard, Itinerary)

```
Mobile → tRPC Query → Cache Check → Database → Response → Cache → UI
                ↓
              Cache Hit? → Return Cached → UI
```

### 2. Write-Heavy Flows (Chat Messages)

```
Mobile → Optimistic UI Update → tRPC Mutation → Database → Supabase Realtime Broadcast → All Clients
```

### 3. Real-Time Flows (Chat, Notifications)

```
Mobile → Supabase WebSocket Subscribe → Database INSERT Trigger → Realtime Broadcast → Mobile
```

### 4. File Upload Flows

```
Mobile → tRPC (get presigned URL) → S3 Direct Upload → tRPC (save record) → Database
```

---

## Security Considerations

### 1. Authentication

**Web:**
- Clerk session cookies (httpOnly)
- CSRF protection via Clerk middleware

**Mobile:**
- Clerk JWT tokens in expo-secure-store
- Token refresh handled by Clerk SDK
- Biometric unlock for convenience

**Shared Security:**
- tRPC context validates tokens (both cookie and Bearer)
- Same `currentUser()` function works for both platforms

### 2. API Security

**No changes needed:**
- Existing protectedProcedure middleware handles both platforms
- Role-based procedures (guestProcedure, adminProcedure) work unchanged

### 3. RLS Security

**No changes needed:**
- Mobile never accesses database directly
- All access via tRPC → Prisma → Service Role
- Same RLS policies apply to Supabase Realtime

---

## Build and Deployment

### Development Workflow

**Web (Current):**
```bash
npm run dev          # Next.js dev server on localhost:3000
```

**Mobile (New):**
```bash
npx expo start       # Expo dev server
# Scan QR with Expo Go (development)
# Or: npx expo run:ios / npx expo run:android
```

**Backend:**
- No changes needed
- Web dev server provides tRPC API at http://localhost:3000/api/trpc
- Mobile dev app can hit localhost API if on same network

### Production Deployment

**Web (Current):**
- Vercel (no changes)

**Mobile (New):**
- iOS: EAS Build → TestFlight → App Store
- Android: EAS Build → Google Play Console

**Configuration:**
```
# .env.production
EXPO_PUBLIC_API_URL=https://pickleballpassport.com
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_ONESIGNAL_APP_ID=...
```

---

## New Components Needed

### 1. Mobile-Specific tRPC Procedures

| Router | Procedure | Purpose |
|--------|-----------|---------|
| trip | uploadPhoto | Save photo journal entry |
| trip | checkInActivity | Mark activity as attended |
| trip | requestTransport | Request transportation |
| trip | getOfflineItinerary | Pre-cache itinerary data |
| booking | updateDeviceToken | Register OneSignal token |
| booking | unregisterDevice | Remove push token |
| user | updateBiometricPreference | Toggle biometric login |
| trip | triggerSOS | Emergency SOS with GPS |

### 2. Database Schema Changes

```prisma
model Booking {
  // ... existing fields

  // Push notifications
  deviceToken String?
  devicePlatform String? // "ios" | "android"

  // Biometric preferences
  biometricEnabled Boolean @default(false)
}

model TripPhoto {
  id String @id @default(cuid())
  tripId String
  bookingId String
  url String
  caption String?
  createdAt DateTime @default(now())

  trip Trip @relation(fields: [tripId], references: [id])
  booking Booking @relation(fields: [bookingId], references: [id])
}

model ActivityCheckIn {
  id String @id @default(cuid())
  tripId String
  bookingId String
  activityId String
  checkedInAt DateTime @default(now())

  trip Trip @relation(fields: [tripId], references: [id])
  booking Booking @relation(fields: [bookingId], references: [id])
}
```

### 3. Infrastructure Changes

**OneSignal Account:**
- Create account at onesignal.com
- Configure iOS/Android apps
- Get API key for server-side

**No Other Infrastructure Needed:**
- Existing Vercel deployment serves API
- Existing Supabase handles Realtime
- Existing S3 handles file storage

---

## Suggested Build Order

### Phase 1: Foundation (MOB-SETUP-01)
**Goal:** Mobile app can authenticate and call tRPC API

1. Scaffold Expo app with TypeScript
2. Install dependencies (Clerk, tRPC, NativeWind)
3. Setup Clerk authentication (custom UI)
4. Setup tRPC client with token auth
5. Create first screen that fetches user data
6. Verify API communication

**Key Deliverable:** Authenticated mobile app calling existing tRPC API

---

### Phase 2: Pre-Trip Features (MOB-PRETRIP-*)
**Goal:** Guest can prepare for trip

1. Dashboard screen (countdown, checklist)
2. Document upload (passport scan)
3. Packing list (cached offline)
4. Group chat (Supabase Realtime)
5. Fellow travelers view

**Key Deliverable:** Pre-trip preparation complete

---

### Phase 3: During-Trip Experience (MOB-TRIP-*)
**Goal:** Guest can use app during trip

1. Itinerary view (offline-first)
2. Activity check-ins
3. Concierge chat (Realtime)
4. Photo journal upload
5. Court booking
6. Transportation requests
7. Emergency SOS

**Key Deliverable:** Full trip experience

---

### Phase 4: Alumni Engagement (MOB-ALUMNI-*)
**Goal:** Guest stays engaged post-trip

1. Journey summary
2. Alumni directory
3. Referral tracking
4. Rebook flow
5. Passport stamps gamification
6. Testimonial submission

**Key Deliverable:** Alumni retention features

---

### Phase 5: Polish & Push Notifications
**Goal:** Production-ready mobile app

1. Biometric authentication (MOB-AUTH-02)
2. OneSignal integration
3. Push notification triggers
4. Offline mode refinement
5. Deep linking
6. App store assets
7. TestFlight/Play Store beta

**Key Deliverable:** Published mobile app

---

## Architectural Risks & Mitigations

### Risk 1: Offline Mutation Queue Complexity
**Impact:** HIGH
**Likelihood:** MEDIUM

**Problem:** User takes photo while offline, needs to upload when back online. TanStack Query doesn't have built-in mutation queue for React Native.

**Mitigation:**
- Phase 2: Use optimistic UI only (show "Pending" state)
- Phase 3: Build simple queue with MMKV storage
- Phase 4: Consider [Tanstack Query Offline Plugin](https://github.com/TanStack/query/discussions/4759) (experimental)

**Fallback:** Require online connection for uploads (acceptable for v2.0)

---

### Risk 2: Token Refresh on Mobile
**Impact:** MEDIUM
**Likelihood:** LOW

**Problem:** Clerk tokens expire after 1 hour. If user is offline during expiry, token becomes invalid.

**Mitigation:**
- Clerk SDK handles refresh automatically when online
- Store last-known good token in secure storage
- Show "Please reconnect" message if refresh fails

**Fallback:** Require re-authentication (rare edge case)

---

### Risk 3: Supabase Realtime Connection Stability
**Impact:** MEDIUM
**Likelihood:** MEDIUM

**Problem:** WebSocket connections can drop on mobile networks.

**Mitigation:**
- Supabase SDK has built-in reconnection logic
- Show connection status indicator in chat UI
- Poll tRPC endpoint as fallback if WebSocket down for >30s

**Fallback:** Use HTTP polling instead of Realtime (slower but reliable)

---

### Risk 4: File Upload Size Limits
**Impact:** LOW
**Likelihood:** LOW

**Problem:** Mobile photos can be 10MB+, S3 presigned URL may time out.

**Mitigation:**
- Compress images before upload (expo-image-manipulator)
- Set max resolution (1920x1080 acceptable for mobile viewing)
- Show upload progress with FileSystem.uploadAsync

**Fallback:** Instruct user to use lower quality setting

---

## Open Questions for Implementation

1. **Monorepo vs Separate Repo?**
   - Recommendation: Separate repo for v2.0 (faster iteration)
   - Revisit in v2.1 if type sharing becomes painful

2. **Expo Go vs Development Build?**
   - Expo Go: Faster for initial development
   - Development Build: Required for OneSignal, biometrics
   - Recommendation: Start with Expo Go, migrate to dev build in Phase 4

3. **iOS vs Android Priority?**
   - Recommendation: iOS first (target demographic skews iPhone)
   - Android in Phase 3 (test on one platform first)

4. **Push Notification Frequency?**
   - Needs business decision: How many notifications per trip?
   - Recommendation: Max 3 per trip (24h before, day-of, post-trip survey)

5. **Offline Mode Scope?**
   - Full offline support is complex
   - Recommendation: View-only offline (itinerary, packing list)
   - Mutations require online (acceptable for luxury travel context)

---

## Summary for Roadmap Creation

### Phase Structure Recommendation

**Phase 1: Auth + API Foundation** (1-2 weeks)
- Scaffold Expo app
- Clerk authentication
- tRPC client setup
- First authenticated screen

**Phase 2: Pre-Trip Features** (2-3 weeks)
- Dashboard
- Checklists
- Document upload
- Group chat
- Offline itinerary

**Phase 3: During-Trip Experience** (3-4 weeks)
- Activity check-ins
- Concierge chat
- Photo journal
- Court booking
- Emergency SOS

**Phase 4: Alumni Features** (2 weeks)
- Journey summary
- Referrals
- Rebook flow
- Gamification

**Phase 5: Production Polish** (1-2 weeks)
- Biometrics
- Push notifications
- Deep linking
- App store submission

**Total Estimate:** 9-13 weeks for full v2.0 mobile app

### Critical Dependencies

1. **Phase 1 must complete before Phase 2:** Auth is foundation
2. **OneSignal setup can happen in parallel:** Not blocking
3. **iOS development environment:** Must be available (Mac + Xcode)
4. **EAS Build account:** Needed for TestFlight (can defer to Phase 5)

### Likely Deep Research Flags

- Phase 2: Supabase Realtime WebSocket management on mobile
- Phase 3: Offline mutation queue implementation
- Phase 5: App Store submission process and ASO

---

**Confidence Assessment:**

| Area | Confidence | Reason |
|------|------------|--------|
| tRPC Integration | HIGH | Well-documented pattern, existing codebase analysis |
| Clerk Authentication | HIGH | Official Expo SDK with clear docs |
| Supabase Realtime | MEDIUM | Direct mobile integration is less common than tRPC pattern |
| File Uploads | MEDIUM | Multiple approaches, need to test performance |
| Offline Support | MEDIUM | Complex domain, TanStack Query persistence is relatively new |
| Push Notifications | HIGH | OneSignal has mature Expo SDK |
| Navigation | HIGH | Expo Router is standard, protected routes well-documented |

---

## Sources

### High Confidence (Official Documentation)
- [Clerk Expo SDK Documentation](https://clerk.com/docs/reference/expo/overview)
- [tRPC React Setup Documentation](https://trpc.io/docs/client/react/setup)
- [Expo Router Protected Routes](https://docs.expo.dev/router/advanced/protected/)
- [Supabase + Expo React Native Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native)
- [Expo ImagePicker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [OneSignal Expo SDK Setup](https://documentation.onesignal.com/docs/en/react-native-expo-sdk-setup)
- [TanStack Query Persistence Documentation](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient)
- [NativeWind Setup Guide](https://www.nativewind.dev/docs/getting-started/installation)
- [Expo Monorepo Patterns](https://docs.expo.dev/guides/monorepos/)

### Medium Confidence (Community Examples & Tutorials)
- [tRPC + Expo Integration Examples](https://github.com/intergalacticspacehighway/expo-trpc)
- [Create T3 Turbo (Monorepo Starter)](https://github.com/juliusmarminge/create-t3-turbo-1)
- [React Native S3 Upload with Presigned URLs](https://dev.to/ajulibe/uploading-files-from-react-native-to-an-s3-presigned-url-2ab7)
- [MMKV + TanStack Query Integration](https://github.com/mrousavy/react-native-mmkv/blob/main/docs/WRAPPER_REACT_QUERY.md)
- [Clerk + Expo Full-Stack Example](https://dev.to/chrollo4ki/clerk-auth-full-stack-app-expressjs-trpc-expo-nextjs--4i3h)

### Low Confidence (Needs Validation)
- [TanStack Query Offline Patterns](https://github.com/TanStack/query/discussions/4342) - Community discussion, not official solution
