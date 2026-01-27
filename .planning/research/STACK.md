# Technology Stack: Mobile App Additions

**Project:** Pickleball Passport Mobile App (v2.0)
**Researched:** 2026-01-28
**Context:** Subsequent milestone - adding React Native mobile app to existing Next.js web platform

## Executive Summary

The mobile app requires 12 new dependencies spanning the React Native/Expo ecosystem. All selections prioritize integration with the existing validated web stack (tRPC, Clerk, Supabase, Stripe). The recommended approach uses Expo SDK 54 (stable) with managed workflow for maximum development velocity while maintaining full access to native capabilities.

**Key Integration Points:**
- **tRPC client** - Shared API types and procedures with web app
- **Clerk Expo SDK** - Unified auth across web and mobile
- **Supabase client** - Same PostgreSQL database and Realtime channels
- **Stripe** - Web checkout via deep links (no in-app payments)

## Validated Existing Stack (DO NOT CHANGE)

The following web platform technologies are already validated and should be reused where possible:

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | Web app framework |
| tRPC | 11.8.1 | Type-safe API layer |
| Prisma | 5.22.0 | Database ORM |
| Clerk | Latest | Authentication |
| Stripe | Latest | Payments + Connect |
| SendGrid | Latest | Email delivery |
| Supabase | Latest | PostgreSQL database |
| Vercel | Latest | Web deployment |

## Recommended Mobile Stack Additions

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Expo SDK** | 54.0.0 (stable) | React Native framework | Industry standard, managed workflow, 3x/year releases. Uses React Native 0.81 + React 19.1.0. Skip SDK 55 beta (expected Feb 2026). |
| **React Native** | 0.81 | Native rendering | Bundled with Expo SDK 54, no separate install needed |
| **Expo Router** | Latest (SDK 54) | File-based navigation | Built on React Navigation, automatic deep linking, type safety from filesystem. Default in new Expo apps. Aligns with Next.js App Router patterns. |

**Rationale for Expo SDK 54 (stable) over SDK 55 beta:**
- SDK 55 beta started Jan 22, 2026, expected stable in Feb 2026
- SDK 54.0.31 published 12 days ago, battle-tested
- Avoid beta period instability during initial mobile development
- Upgrade to SDK 55 stable in future sprint

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **NativeWind** | v4 (stable) | Tailwind CSS for React Native | Reuses existing Tailwind patterns from web app. v5 is pre-release (not production-ready). JSX transform approach = no wrapper components. |
| **react-native-reanimated** | Latest (peer dep) | Animation library | Required peer dependency for NativeWind |
| **react-native-safe-area-context** | Latest (peer dep) | Safe area handling | Required peer dependency for NativeWind |

**Why NOT v5:**
- NativeWind v5 is explicitly "pre-release, not intended for production use"
- v4 is stable and sufficient for Tailwind utility classes
- Upgrade to v5 stable when released

### Authentication & Security

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@clerk/clerk-expo** | >=2.2.0 | Authentication | Unified auth with web app. Supports OAuth, magic links, passkeys. Native requires custom UI (no prebuilt components). Tokens stored in expo-secure-store. |
| **expo-local-authentication** | Latest (SDK 54) | Biometrics (Face ID, Touch ID) | Native biometric auth. Requirement MOB-AUTH-02. Must use Class 3 (Strong) for sensitive data. Requires development build (not Expo Go). |
| **expo-secure-store** | Latest (SDK 54) | Encrypted token storage | iOS Keychain, Android Keystore. Persists across app reinstalls (iOS only). Clerk uses this automatically. |

**Critical Clerk Limitation:**
- Native apps must build custom auth UI using Clerk API
- Prebuilt components only available for web
- Email magic links NOT supported on native
- Use OAuth or password flows for mobile

### API & Data

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@trpc/client** | 11.8.1 (match web) | tRPC client | Shared with web app - reuse API types and procedures |
| **@trpc/react-query** | 11.8.1 (match web) | React Query integration | tRPC's React hooks layer |
| **@tanstack/react-query** | Latest compatible | Data fetching & caching | Required by tRPC, handles request caching |
| **@supabase/supabase-js** | Latest | Supabase client | Realtime chat channels (MOB-PRETRIP-05, MOB-TRIP-03). Same PostgreSQL database as web. |
| **@react-native-async-storage/async-storage** | Latest | Key-value storage | Required by Supabase for web crypto polyfill. Also used for offline persistence. |
| **react-native-url-polyfill** | Latest | URL polyfill | Required by Supabase for React Native |

**React Query Offline Persistence (Optional Enhancement):**
- **@tanstack/query-async-storage-persister** - Persist queries to AsyncStorage
- **@tanstack/react-query-persist-client** - PersistQueryClientProvider utilities
- **@react-native-community/netinfo** - Network status monitoring

Not required for MVP but recommended for robust offline experience.

### Push Notifications

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **onesignal-expo-plugin** | Latest | OneSignal Expo integration | Config plugin for OneSignal setup |
| **react-native-onesignal** | Latest | OneSignal SDK | Push notifications, in-app messaging. Industry standard. Requires Expo SDK 48+, EAS build. Must be first in plugins array. |

**Alternative Considered:**
- Expo Push Notifications (native) - Requires backend token management
- OneSignal preferred for full-featured notification platform with dashboard

**Critical Setup:**
- Must add plugin to front of app.json plugins array
- Requires EAS build (not Expo Go)
- iOS requires APNs configuration, app groups entitlement
- Android requires FCM configuration

### File & Media Handling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **expo-image-picker** | Latest (SDK 54) | Image & video selection | Camera + gallery access for MOB-PRETRIP-03 (passport docs), MOB-TRIP-07 (photo journal) |
| **expo-document-picker** | Latest (SDK 54) | Document selection | PDF, DOCX, etc. Alternative to image picker for document uploads. Set `copyToCacheDirectory: true` for expo-file-system access. |
| **expo-media-library** | Latest (SDK 54) | Photo library access | Read/write device photo library. Android auto-adds READ/WRITE_EXTERNAL_STORAGE. iOS requires Info.plist keys. |
| **expo-camera** | Latest (SDK 54) | Camera control | Direct camera access if image picker insufficient. Auto-adds CAMERA permission. |

**Permission Requirements:**
- **iOS:** NSPhotoLibraryUsageDescription, NSPhotoLibraryAddUsageDescription, NSCameraUsageDescription
- **Android:** Camera, READ/WRITE_EXTERNAL_STORAGE (auto-added), RECORD_AUDIO (for video)

### Location & Maps

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **expo-location** | Latest (SDK 54) | GPS & geolocation | Emergency SOS with GPS (MOB-TRIP-04). Foreground + background location. Polyfills navigator.geolocation for web API compat. |

**Accuracies Available:**
- BestForNavigation - Most accurate, high battery usage
- Best - Accurate to 10m
- Balanced - Accurate to 100m
- Low - Accurate to 1km

**Permissions:**
- Foreground only (while app in use)
- Background (always) - Requires additional justification in app store

### Date & Time UI

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@react-native-community/datetimepicker** | Latest | Native date/time picker | System UI for dates (court booking, itinerary). Official Expo package. Supports iOS 11+, Android 5+ (API 21+). |

**Alternative Considered:**
- **react-native-modal-datetime-picker** - Wrapper around datetimepicker with modal presentation
- **react-native-date-picker** - Requires development build (not Expo Go compatible)

Use official `@react-native-community/datetimepicker` for simplicity unless modal presentation needed.

## Integration Architecture

### tRPC Shared API

**Approach:** Monorepo structure with shared tRPC router types

```
/packages
  /api (or /server)
    - tRPC router definitions
    - AppRouter type export
  /mobile (Expo app)
    - Import AppRouter type
    - Create tRPC React client
  /web (Next.js app)
    - Same tRPC setup as now
```

**Mobile tRPC Setup:**
```typescript
// mobile/utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@acme/api' // Shared type

export const trpc = createTRPCReact<AppRouter>()

// mobile/App.tsx
const [queryClient] = useState(() => new QueryClient())
const [trpcClient] = useState(() =>
  trpc.createClient({
    links: [
      httpBatchLink({
        url: 'https://your-api.com/api/trpc',
        headers: () => ({
          authorization: getAuthToken(), // From Clerk
        }),
      }),
    ],
  })
)

<trpc.Provider client={trpcClient} queryClient={queryClient}>
  <QueryClientProvider client={queryClient}>
    {/* App */}
  </QueryClientProvider>
</trpc.Provider>
```

### Clerk Authentication Flow

**Web → Mobile Deep Link:**
- User books on web, gets email with mobile app link
- Deep link opens app with token
- Clerk SDK validates token
- Biometric unlock enabled for returning users

**Mobile Native Auth:**
- OAuth providers (Google, Apple)
- Password auth with email verification
- Custom UI required (no prebuilt components)
- Store tokens in expo-secure-store (automatic)

### Supabase Realtime Chat

**Channels:**
- Pre-trip group chat: `trip:{tripId}:group`
- Concierge chat: `trip:{tripId}:concierge`
- Photo journal: `trip:{tripId}:photos`

**Client Setup:**
```typescript
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-url-polyfill/auto'

const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Mobile doesn't use URL auth
  },
})
```

### Stripe Payment Deep Links

**DO NOT implement in-app purchases (Apple/Google tax).**

**Instead:**
- Mobile displays trip details, calls-to-action
- "Book Now" opens web checkout in browser
- Deep link returns to app after purchase
- App checks booking status via tRPC

```typescript
// Open web checkout
Linking.openURL('https://pickleballpassport.com/book/thailand-wellness?utm_source=mobile_app')

// Handle return deep link
Linking.addEventListener('url', ({ url }) => {
  if (url.includes('booking-confirmed')) {
    // Refresh booking status via tRPC
    trpc.booking.getByUserId.invalidate()
  }
})
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **Framework** | Expo managed workflow | Expo bare workflow | Managed = faster dev, auto-upgrades, less native code complexity. Can always eject later if needed. |
| **Framework** | Expo | React Native CLI | Expo provides better DX, over-the-air updates, and easier setup. RN CLI better for heavy native modules (not needed here). |
| **Navigation** | Expo Router | React Navigation | Expo Router is built on RN 7, adds file-based routing + types. Default for new Expo apps. Familiarity with Next.js patterns. |
| **Styling** | NativeWind | React Native StyleSheet | Reuse Tailwind knowledge from web. Faster than inline styles. Alternative: styled-components (more bundle size). |
| **Styling** | NativeWind | Tamagui | Tamagui is powerful but heavier. NativeWind sufficient for luxury travel app UI needs. |
| **Push** | OneSignal | Expo Push Notifications | OneSignal = full platform with segmentation, analytics, dashboard. Expo Push = build your own backend. |
| **Push** | OneSignal | Firebase Cloud Messaging | OneSignal wraps FCM + APNs with better DX. FCM direct = more setup complexity. |
| **Offline Storage** | AsyncStorage | SQLite (expo-sqlite) | AsyncStorage sufficient for <100 records. SQLite overkill unless heavy offline querying needed. |
| **Offline Storage** | AsyncStorage | WatermelonDB | WatermelonDB = complex setup for syncing. Not needed unless offline-first with complex relationships. |
| **Date Picker** | @react-native-community/datetimepicker | react-native-modal-datetime-picker | Official package sufficient. Modal wrapper adds minimal value for our use cases. |

## Installation

### Prerequisites
```bash
# Install Expo CLI globally (optional)
npm install -g eas-cli

# Verify Node.js version
node --version # Must be 20.19.x or higher for SDK 54
```

### Create Expo App (if new)
```bash
npx create-expo-app@latest pickleball-passport-mobile --template tabs
cd pickleball-passport-mobile
```

### Core Dependencies
```bash
# Expo SDK 54 (includes React Native 0.81, Expo Router)
npx expo install expo@^54.0.0

# Styling
npx expo install nativewind@^4.0.0 tailwindcss react-native-reanimated react-native-safe-area-context

# Authentication & Security
npx expo install @clerk/clerk-expo expo-local-authentication expo-secure-store

# API & Data
npm install @trpc/client@^11.8.1 @trpc/react-query@^11.8.1 @tanstack/react-query
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill

# Push Notifications
npm install react-native-onesignal onesignal-expo-plugin

# File & Media
npx expo install expo-image-picker expo-document-picker expo-media-library expo-camera

# Location
npx expo install expo-location

# Date/Time Picker
npx expo install @react-native-community/datetimepicker
```

### Optional: Offline Persistence
```bash
npm install @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
npx expo install @react-native-community/netinfo
```

### Dev Dependencies
```bash
npm install -D @types/react @types/react-native typescript
```

## Configuration Files

### app.json (Expo Config)
```json
{
  "expo": {
    "name": "Pickleball Passport",
    "slug": "pickleball-passport",
    "version": "2.0.0",
    "scheme": "pickleballpassport",
    "platforms": ["ios", "android"],
    "plugins": [
      "onesignal-expo-plugin", // MUST BE FIRST
      "expo-router",
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Allow Pickleball Passport to use Face ID for secure biometric login."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow Pickleball Passport to access your photos to upload documents and share trip memories.",
          "cameraPermission": "Allow Pickleball Passport to use your camera to take photos for your trip journal."
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "Allow Pickleball Passport to save photos to your library.",
          "savePhotosPermission": "Allow Pickleball Passport to save trip photos."
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Allow Pickleball Passport to access your location for emergency SOS.",
          "locationAlwaysPermission": "Allow Pickleball Passport to access your location in the background for trip tracking."
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.pickleballpassport.app",
      "supportsTablet": true,
      "infoPlist": {
        "NSFaceIDUsageDescription": "Allow Pickleball Passport to use Face ID for secure biometric login."
      }
    },
    "android": {
      "package": "com.pickleballpassport.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Reuse web theme colors
      colors: {
        primary: '#your-brand-color',
      },
    },
  },
  plugins: [],
}
```

### babel.config.js
```javascript
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin', // Must be last
    ],
  }
}
```

## Build & Deployment

### Development
```bash
# Start dev server
npx expo start

# iOS simulator
npx expo start --ios

# Android emulator
npx expo start --android

# Development build (for biometrics, OneSignal)
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production
```bash
# Build for app stores
eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Over-the-Air Updates
```bash
# Publish update (JS only, no native changes)
eas update --branch production --message "Fix chat UI"
```

## Environment Variables

Create `.env` in mobile project root:

```bash
# API
EXPO_PUBLIC_API_URL=https://api.pickleballpassport.com/trpc

# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OneSignal
ONESIGNAL_APP_ID=your-onesignal-app-id

# Deep Linking
EXPO_PUBLIC_WEB_URL=https://pickleballpassport.com
```

## Version Pinning Strategy

| Package | Strategy | Why |
|---------|----------|-----|
| Expo SDK | Pin major.minor (54.x) | Auto-patch updates safe, major requires migration |
| tRPC | Match web version exactly | Type safety depends on version alignment |
| React Query | Pin major (^5.0.0) | Breaking changes between majors |
| NativeWind | Pin v4.x until v5 stable | v5 pre-release, avoid in production |
| Clerk | Use latest | Security patches important, rare breaking changes |
| OneSignal | Use latest | Notification platform updates frequent |
| Expo modules | Use SDK-compatible | `npx expo install` handles versions |

**Upgrade cadence:**
- **Monthly:** Patch versions (security fixes)
- **Quarterly:** Expo SDK minors (new features)
- **Yearly:** Expo SDK majors (React Native upgrades)

## Confidence Assessment

| Technology | Confidence | Verification Source |
|------------|-----------|-------------------|
| Expo SDK 54 | HIGH | Official Expo docs, released stable |
| NativeWind v4 | HIGH | Official docs, widely used |
| Clerk Expo SDK | HIGH | Official Clerk docs, last updated Jan 14, 2026 |
| tRPC React Native | MEDIUM | Community examples, no official guide but straightforward |
| OneSignal Expo | HIGH | Official integration docs, Expo SDK 48+ required |
| React Query offline | MEDIUM | Multiple community tutorials, well-documented pattern |
| Supabase RN | HIGH | Official Supabase docs updated Jan 2026 |

## Open Questions & Future Research

### Requires Phase-Specific Investigation

1. **Map integration** - Not researched yet. Options: react-native-maps, Google Maps SDK, Apple Maps. Depends on MOB-TRIP requirements.

2. **Video chat** - PROJECT.md says "External Zoom links sufficient" but if in-app needed, research Agora, Daily.co, or Twilio.

3. **Payment UX** - Deep link to web vs presenting in-app browser (SafariView/Chrome Custom Tabs) for better UX.

4. **Code signing** - iOS provisioning profiles, Android keystore management in CI/CD.

5. **Analytics** - Web uses Vercel Analytics. Mobile options: Expo Application Services, PostHog, Amplitude.

6. **Error tracking** - Web uses Sentry (likely). Mobile: Sentry React Native, BugSnag.

7. **Monorepo structure** - If sharing tRPC types, consider Turborepo, Nx, or Yarn workspaces.

8. **E2E testing** - Detox, Maestro, or Appium for mobile testing strategy.

### Low Priority (Post-MVP)

- **App icon/splash screen generation** - expo-splash-screen, adaptive icons
- **App store screenshots** - Fastlane snapshot automation
- **Localization** - i18next, expo-localization if multi-language needed
- **Accessibility** - Screen reader testing, dynamic type support

## Sources

### High Confidence (Official Documentation)
- [Expo SDK 54 Documentation](https://docs.expo.dev/versions/latest/)
- [Expo Router Introduction](https://docs.expo.dev/router/introduction/)
- [NativeWind v5 Overview](https://www.nativewind.dev/v5)
- [Clerk Expo SDK Reference](https://clerk.com/docs/reference/expo/overview)
- [tRPC React Query Setup](https://trpc.io/docs/client/react/setup)
- [OneSignal Expo SDK Setup](https://documentation.onesignal.com/docs/en/react-native-expo-sdk-setup)
- [Supabase Expo React Native Guide](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native)
- [Expo Local Authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
- [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Expo Document Picker](https://docs.expo.dev/versions/latest/sdk/document-picker/)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [@react-native-community/datetimepicker](https://docs.expo.dev/versions/latest/sdk/date-time-picker/)

### Medium Confidence (Community Resources)
- [React Navigation 7 vs Expo Router Comparison](https://viewlytics.ai/blog/react-navigation-7-vs-expo-router)
- [tRPC React Native Monorepo Example](https://github.com/johnkueh/react-native-trpc-monorepo-example)
- [Building Offline-First React Native Apps with React Query](https://www.whitespectre.com/ideas/how-to-build-offline-first-react-native-apps-with-react-query-and-typescript/)
- [Biometric Authentication in React Native Expo Guide (Jan 2026)](https://sasandasaumya.medium.com/biometric-authentication-in-react-native-expo-a-complete-guide-face-id-fingerprint-732d80e5e423)

### Web Search (Current Ecosystem State)
- [Expo SDK 55 Beta Announcement](https://expo.dev/changelog/sdk-55-beta) (Jan 22, 2026)
- [What's New in Expo SDK 55 (Medium)](https://medium.com/@onix_react/whats-new-in-expo-sdk-55-6eac1553cee8)
- [Best React Native Component Libraries 2026](https://dev.to/ninarao/best-react-native-component-libraries-with-tailwind-support-for-fast-ui-development-in-2026-2fe4)
- [Expo vs OneSignal Push Comparison 2026](https://www.courier.com/integrations/compare/expo-vs-onesignal-push)

---

**Last Updated:** 2026-01-28
**Researcher:** GSD Project Researcher
**Next Steps:** Feed this into roadmap creation for phase structure and dependency ordering
