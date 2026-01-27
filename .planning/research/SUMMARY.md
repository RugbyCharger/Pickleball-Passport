# Project Research Summary

**Project:** Pickleball Passport Mobile App (v2.0)
**Domain:** Luxury Group Travel Mobile Application (React Native + Expo)
**Researched:** 2026-01-28
**Confidence:** HIGH

## Executive Summary

Pickleball Passport is adding a React Native mobile app to its existing Next.js/tRPC/Clerk/Supabase web platform. This is a **mobile integration project**, not a greenfield build. The mobile app will be a thin client consuming the existing tRPC API, with platform-specific enhancements for native features (push notifications, biometrics, offline caching, camera access).

The recommended approach uses **Expo SDK 54** (stable, managed workflow) with **shared tRPC routers** for maximum code reuse. The app follows luxury travel industry patterns: pre-trip anticipation, during-trip support, and post-trip community engagement. Critical differentiators include transformation tracking, group-first design, and pickleball-specific features (court booking, skill matching).

**Key risks:** Three critical pitfalls could block progress: (1) tRPC v11.4+ crashes on React Native Hermes engine — must pin to v11.3.1, (2) Supabase Realtime has module import failures on React Native — may require alternative chat solution, and (3) Clerk provides no prebuilt UI components for mobile — requires custom auth screens. All three are mitigable with early planning and proper technology selection.

## Key Findings

### Recommended Stack

The mobile stack adds 12 new dependencies to integrate with the existing validated web platform. All selections prioritize compatibility with the existing tRPC, Clerk, Supabase, and Stripe integrations.

**Core technologies:**
- **Expo SDK 54** (stable) with React Native 0.81 — industry standard managed workflow, 3x/year releases, battle-tested stability. Skip SDK 55 beta to avoid instability during initial development.
- **Expo Router** (file-based navigation) — built on React Navigation 7, aligns with Next.js App Router patterns, automatic deep linking and type safety from filesystem.
- **NativeWind v4** (Tailwind for React Native) — reuses existing Tailwind patterns from web app, v5 is pre-release and not production-ready.
- **@clerk/clerk-expo** (authentication) — unified auth with web app, supports OAuth/passwords/passkeys, stores tokens in expo-secure-store. **Critical limitation:** no prebuilt UI components on native — must build custom auth screens.
- **@trpc/client v11.8.1** (API layer) — shared with web app, reuses all existing API types and procedures. **Critical limitation:** must pin to v11.3.1 or earlier due to Hermes engine incompatibility in v11.4+.
- **@supabase/supabase-js** (realtime chat) — same PostgreSQL database as web, enables realtime chat channels. **Critical blocker:** current version has WebSocket module import failures on React Native — may require alternative chat solution (Stream Chat, PubNub, or tRPC subscriptions).
- **OneSignal** (push notifications) — full-featured notification platform with dashboard, segmentation, and analytics. Requires EAS build (not Expo Go) and must be first plugin in app.json.
- **expo-local-authentication** (biometrics) — Face ID/Touch ID, industry standard for luxury travel apps (73% of travelers expect biometric auth). Requires development build.
- **expo-image-picker/camera/media-library** (file handling) — camera and gallery access for passport docs and photo journal.
- **expo-location** (GPS) — emergency SOS with GPS, foreground and background location tracking.
- **@tanstack/react-query** with MMKV persistence (offline support) — offline-first caching for itinerary, packing lists, and photo gallery.

**Version pinning strategy:** Pin tRPC to exact v11.3.1 (not ^11.8.1), use SDK-compatible versions for Expo modules via `npx expo install`, and use latest for Clerk/OneSignal (security patches important). Upgrade cadence: monthly patches, quarterly Expo SDK minors, yearly Expo SDK majors.

### Expected Features

Luxury travel mobile apps in 2026 follow a clear pattern: **pre-trip anticipation and preparation**, **during-trip support and documentation**, and **post-trip community and rebooking**. Modern travelers expect AI-powered personalization, seamless mobile-first experiences, offline functionality, biometric security, and 24/7 concierge access.

**Must have (table stakes):**
- Biometric authentication (Touch ID/Face ID) — 73% of travelers expect this, industry standard for premium apps
- Secure document storage — passport scans, insurance docs accessible offline
- Offline itinerary access — essential for travel apps, users need access without connectivity
- Push notifications — expected for trip updates, reminders, time-sensitive communications
- 24/7 concierge chat — premium travel apps require always-on support, industry standard since 2024
- Emergency SOS button — safety-critical feature, expected after 2025 incident reports drove adoption
- Daily itinerary view — core travel app functionality, real-time organized schedules
- Activity details with maps — users expect location context for all activities
- Group photo gallery — social travel apps require shared albums, standard feature
- Payment processing — booking additional services (existing Stripe integration)
- Referral program — travel companies get 20-30% bookings from referrals, standard in 2026

**Should have (differentiators):**
- Pre-trip group introduction — reduces first-day anxiety, builds community before arrival, unique to group travel
- Pre-trip countdown dashboard — builds anticipation, gamifies preparation
- Transformation story tracking — wellness travel apps don't typically track long-term transformation, unique differentiator
- Pickleball-specific features — court booking + "find a game" are sport-specific, no competitors offer this
- Daily reflection prompts — wellness/journaling in travel apps is emerging (2026 trend)
- Celebration moments — automated milestone recognition unique to this domain
- Passport stamps gamification — digital stamps are emerging (FIFA 2026 trend), fun differentiation
- Alumni directory + meetups — post-trip community rare in travel apps, strong retention/rebooking driver
- Group dining coordination — most apps show restaurants, coordinating group decisions is unique

**Defer (v2+):**
- Packing list — nice-to-have, low priority compared to core trip features
- Flight booking assistance — complex, operator relationship dependent
- Medical consultation scheduling — complex, partnership dependent
- Court booking — nice-to-have, complex scheduling system
- Find a game — requires user density, matchmaking algorithm
- Group dining coordination — complex polling infrastructure
- Virtual meetup calendar — requires critical mass of alumni

**Anti-features (explicitly do NOT build):**
- Public social feed — transforms intimate group experience into social media, privacy concerns for luxury travelers
- Trip booking/price shopping — Pickleball Passport is post-booking, undermines existing web flow
- AI trip planning — users already booked specific curated trips, irrelevant post-booking
- Off-platform payment requests — major scam vector, removes payment protections
- Always-on location tracking — privacy concerns, battery drain, luxury travelers resist surveillance
- Aggressive push notification cadence — over-notification drives uninstalls
- Complex gamification — over-gamifying luxury experience feels cheap
- Review/rating system — luxury operators don't want public critique in-app

### Architecture Approach

The Expo mobile app integrates with the existing Next.js/tRPC/Clerk/Supabase architecture through **shared API endpoints and authentication sessions**. The architecture follows a **client-server model** where the mobile app is a thin client consuming the same tRPC API used by the web app, with platform-specific enhancements for native features.

**Major components:**

1. **Authentication Layer (Clerk)** — Web uses `@clerk/nextjs` with cookies, mobile uses `@clerk/clerk-expo` with Bearer tokens stored in expo-secure-store. Server validates both via `currentUser()` in tRPC context. Mobile requires custom auth UI (no prebuilt components). Biometric unlock via `expo-local-authentication` for returning users.

2. **API Layer (tRPC)** — Shared tRPC router types between web and mobile via monorepo structure. Mobile uses httpBatchLink with Bearer token headers from Clerk. Same 30+ router modules serve both platforms. Mobile-specific procedures needed: `trip.uploadPhoto`, `trip.checkInActivity`, `booking.updateDeviceToken`, `user.updateBiometricPreference`, `trip.triggerSOS`.

3. **Database Layer (Prisma + Supabase)** — Mobile has NO direct database access. All queries go through tRPC → Prisma → Supabase. **Exception:** Supabase Realtime for chat features requires direct WebSocket connection from mobile app. Row-level security policies enforce trip membership on both web and mobile.

4. **File Storage (S3)** — Same pattern as web: backend generates presigned URLs via tRPC, mobile uploads directly to S3 using `expo-image-picker` + `expo-file-system`. Images must be resized/compressed before upload (max 1920x1080, <2MB) to prevent memory issues.

5. **Push Notifications (OneSignal)** — Mobile-only feature. Device token registered via tRPC (`booking.updateDeviceToken`), server triggers notifications via OneSignal API. Requires EAS build, OneSignal must be first plugin in app.json, iOS requires Notification Service Extension with App Groups configuration.

6. **Offline Support (TanStack Query + MMKV)** — Offline-first caching for read-heavy data (itinerary, packing list). View-only offline for MVP, mutations require online connection. React Query persistence with MMKV storage for 24hr cache retention. Optimistic UI updates for mutations.

7. **Navigation (Expo Router)** — File-based routing with protected routes. Auth group (public), app group (protected with tab navigation). Deep linking via `pickleballpassport://` scheme and universal links. Must set `initialRouteName` for all nested routes to prevent stranded users on deep links.

**Integration points:** Mobile app hits production API at `https://pickleballpassport.com/api/trpc`, shares Clerk session validation, uses same Supabase database with direct Realtime WebSocket for chat, and redirects to web for Stripe checkout (deep link returns after purchase to avoid in-app payment tax).

**Build order recommendation:** Phase 1 (Auth + API foundation) → Phase 2 (Pre-trip features) → Phase 3 (During-trip experience) → Phase 4 (Alumni features) → Phase 5 (Production polish). Total estimate: 9-13 weeks for full v2.0 mobile app.

### Critical Pitfalls

Research identified 21 pitfalls across 3 severity levels. The top 5 critical pitfalls that could cause rewrites or complete blocking:

1. **tRPC v11.4+ crashes on React Native Hermes engine** — Breaking changes in tRPC 11.4.0+ cause `createRecursiveProxy is not a function` crashes on startup. **Prevention:** Pin tRPC to exact v11.3.1 in mobile package, test mobile startup immediately after any tRPC version change, monitor tRPC GitHub for Hermes compatibility before upgrading. **Phase impact:** MOB-SETUP-01 (foundational blocker).

2. **Supabase Realtime WebSocket module import failures** — Supabase JS v2.x crashes on React Native with "Unable to resolve module ws" even when Realtime is disabled, blocking ALL Supabase features including chat. **Prevention:** Use separate Supabase Auth/Database clients that exclude Realtime, or use alternative chat solution (Stream Chat, PubNub, tRPC subscriptions), test Supabase integration in spike phase immediately. **Phase impact:** MOB-PRETRIP-05 (group chat), MOB-TRIP-03 (concierge chat).

3. **Clerk prebuilt UI components not available on React Native** — Developers waste time trying to import `<SignIn />` components that don't exist. Clerk only provides control components (hooks/headless logic) for native. **Prevention:** Plan for custom auth UI design from day one, budget time for building email/password and OAuth flows manually, use Clerk's Expo SDK control components (`useSignIn`, `useSignUp`). **Phase impact:** MOB-AUTH-01 (authentication foundation).

4. **Duplicate React/React Native versions in monorepo** — Multiple versions cause "Invalid hook call" errors and native module crashes. Package managers install duplicates due to version mismatches. **Prevention:** Use exact version pinning for React/React Native across all workspace packages, add `resolutions` (Yarn) or `overrides` (npm/pnpm) to force single versions, run `npm ls react` regularly, set up CI checks to fail on duplicates. **Phase impact:** MOB-SETUP-01 (monorepo foundation).

5. **OneSignal plugin order causes "Missing Push Capability" on iOS** — If `onesignal-expo-plugin` is not positioned above all other plugins in app.json, iOS push notifications silently fail with no runtime errors. **Prevention:** Place OneSignal as first plugin in app.json plugins array, test push on real iOS device immediately after adding OneSignal, check OneSignal dashboard for capability warnings. **Phase impact:** All notification features across all phases.

**Moderate pitfalls to watch:** OneSignal conflicts with expo-notifications event listeners (choose one system only), iOS Notification Service Extension requires App Groups configuration for rich media, file upload URI format differences between iOS/Android (normalize before upload), Apple requires "Sign in with Apple" if offering Google OAuth, magic link auth not supported on Expo (use email/password or OAuth), unnecessary re-renders degrading performance (use React.memo and FlatList virtualization), unoptimized images causing memory crashes (resize to 1920x1080 and compress to <2MB).

## Implications for Roadmap

Based on architecture research, features analysis, and critical pitfalls, the recommended phase structure follows a clear dependency chain: **foundation → pre-trip → during-trip → alumni → polish**.

### Phase 1: Foundation (Auth + API Integration)
**Rationale:** Mobile app cannot function without authentication and tRPC API access. This phase establishes the integration layer with existing web platform. Must be completed before any feature work begins due to foundational dependencies.

**Delivers:** Authenticated mobile app that can call existing tRPC API and display user data.

**Stack elements:**
- Expo SDK 54 scaffolding
- Clerk Expo SDK with custom auth UI
- tRPC client with Bearer token headers
- First authenticated screen (dashboard)

**Addresses features:**
- Biometric authentication (MOB-AUTH-02) — table stakes security
- Authentication foundation for all downstream features

**Critical pitfalls to avoid:**
- Pin tRPC to v11.3.1 exactly (Pitfall #1)
- Use exact React/React Native versions with resolutions/overrides (Pitfall #4)
- Budget time for custom Clerk auth UI, no prebuilt components (Pitfall #3)
- Add Apple Sign-In if using Google OAuth (Pitfall #10)
- Use require.resolve() for native build paths (Pitfall #5)

**Research flag:** Standard authentication patterns, skip deep research. Clerk Expo docs are comprehensive.

**Estimated duration:** 1-2 weeks

---

### Phase 2: Pre-Trip Experience
**Rationale:** Pre-trip features drive early engagement (30-60 days before departure) and build community before arrival. These features have simpler dependencies than during-trip features (no location services, less real-time complexity). Group introduction establishes chat infrastructure reused in Phase 3.

**Delivers:** Guest can prepare for trip, connect with fellow travelers, and download offline itinerary.

**Stack elements:**
- React Query with MMKV persistence (offline caching)
- expo-image-picker (passport document upload)
- expo-document-picker (travel documents)
- Supabase Realtime (group chat) — **if compatible, else defer or use alternative**
- OneSignal (countdown reminders, pre-trip notifications)

**Addresses features:**
- Pre-trip countdown dashboard (differentiator) — builds anticipation, gamifies preparation
- Document upload (table stakes) — passport scans, insurance docs
- Offline itinerary download (table stakes) — essential for travel apps
- Group introduction (differentiator) — unique to group travel, reduces first-day anxiety
- Pre-trip checklist (table stakes) — valuable preparation tool
- Push notifications (table stakes) — enables all future notifications

**Critical pitfalls to avoid:**
- Test Supabase Realtime on React Native immediately in spike (Pitfall #2) — may require chat alternative
- OneSignal must be first plugin in app.json (Pitfall #6)
- Only use OneSignal OR expo-notifications, not both (Pitfall #7)
- Configure iOS App Groups for rich media notifications (Pitfall #8)
- Normalize file URIs for iOS vs Android uploads (Pitfall #9)
- Resize images before upload to prevent memory issues (Pitfall #15)

**Research flag:** **Needs deep research** for Supabase Realtime alternative if WebSocket module import fails. May need to evaluate Stream Chat, PubNub, or tRPC WebSocket subscriptions.

**Estimated duration:** 2-3 weeks

---

### Phase 3: During-Trip Experience
**Rationale:** Core trip experience requires the app to function offline (itinerary cached in Phase 2), handle real-time concierge chat (infrastructure from Phase 2), and integrate location services (new). This is the highest-value phase — where guests use the app most intensively.

**Delivers:** App becomes essential daily companion during trip, handling all guest needs and capturing memories.

**Stack elements:**
- expo-location (GPS for Emergency SOS)
- expo-file-system (photo uploads to S3)
- react-native-maps (activity locations)
- @react-native-community/datetimepicker (court booking)

**Addresses features:**
- Daily itinerary view (table stakes) — core app function, timeline UI
- Activity check-in (differentiator) — enables passport stamps, celebration moments
- Activity details with maps (table stakes) — location context for all activities
- Emergency SOS button (table stakes) — safety-critical, simple implementation
- Concierge chat (table stakes) — reuses group chat infrastructure from Phase 2
- Photo journal (differentiator) — feeds transformation story in Phase 4
- Group photo gallery (table stakes) — shared memories
- Restaurant recommendations (table stakes) — curated list from operator
- Weather widget (low complexity) — API integration

**Critical pitfalls to avoid:**
- Use React.memo and FlatList virtualization for itinerary list (Pitfall #13)
- Move heavy data processing to background to prevent UI freezing (Pitfall #14)
- Set initialRouteName for notification deep links to prevent stranded users (Pitfall #17)
- Test deep linking on both iOS and Android immediately
- Profile performance continuously, not just at end

**Research flag:** Standard patterns for location services and maps. Expo Location docs are comprehensive. Skip deep research.

**Estimated duration:** 3-4 weeks

---

### Phase 4: Alumni Engagement
**Rationale:** Post-trip features drive retention, referrals, and rebooking. These features have lower complexity than during-trip (no real-time requirements, less performance sensitivity) and can be built after core experience is validated. Transformation story is the key differentiator that justifies mobile app investment.

**Delivers:** Guests stay engaged post-trip, refer friends, and rebook future trips.

**Stack elements:**
- Existing tRPC API (journey summary data)
- Deep linking (referral tracking)
- Stripe web checkout via deep links (rebook flow)

**Addresses features:**
- Transformation story summary (differentiator) — core differentiator, retention driver
- Referral program (table stakes) — 20-30% bookings from referrals, revenue driver
- Alumni directory (differentiator) — searchable profiles, community building
- Rebook next trip (critical) — simple link to web configurator, revenue driver
- Passport stamps gamification (differentiator) — low complexity, fun engagement
- Testimonial creation (revenue driver) — social proof for marketing

**Critical pitfalls to avoid:**
- Standard implementation, no critical pitfalls specific to this phase
- Performance considerations for alumni directory (FlatList virtualization)

**Research flag:** Skip deep research. Standard CRUD operations with existing tRPC API.

**Estimated duration:** 2 weeks

---

### Phase 5: Production Polish
**Rationale:** Final production readiness phase handles app store submission, advanced biometrics setup, and deployment infrastructure. Cannot be done earlier because EAS Build requires completed feature set for meaningful testing. OneSignal push notification triggers depend on business logic from previous phases.

**Delivers:** Published mobile app in App Store and Google Play.

**Stack elements:**
- EAS Build configuration
- TestFlight / Google Play Console
- App Store assets (screenshots, descriptions)
- OneSignal notification triggers (server-side)

**Addresses features:**
- Biometric authentication refinement — ensure Class 3 (Strong) for sensitive data
- Push notification triggers — business logic for countdown, activity reminders, emergency alerts
- Deep linking validation — all notification → screen flows tested
- Offline mode refinement — ensure graceful degradation when offline
- App store optimization (ASO)

**Critical pitfalls to avoid:**
- Use preview builds for testing, not production builds (Pitfall #12)
- Manual submission to App Store after TestFlight testing (Pitfall #20)
- Enroll in Apple Developer Program and Google Play Console early (Pitfall #21)

**Research flag:** **Needs deep research** for App Store submission process, ASO best practices, and provisioning profile management.

**Estimated duration:** 1-2 weeks

---

### Phase Ordering Rationale

**Why this order:**
- **Phase 1 is foundational** — auth and API must work before any features can be built
- **Phase 2 before Phase 3** — pre-trip features are simpler (no location services, less real-time), establish chat infrastructure reused in during-trip concierge
- **Phase 3 is highest complexity** — during-trip experience requires offline support (cached in Phase 2), real-time chat (infrastructure from Phase 2), location services, performance optimization
- **Phase 4 deferred** — alumni features have lower priority than core trip experience, can be validated after trip features work
- **Phase 5 last** — production deployment requires completed feature set for meaningful testing, business logic for push triggers depends on Phases 2-4

**How this avoids pitfalls:**
- **Early spike in Phase 1** detects tRPC version issues and monorepo duplicate dependencies immediately (Pitfalls #1, #4)
- **Custom auth UI in Phase 1** prevents wasted time on non-existent Clerk components (Pitfall #3)
- **Supabase Realtime testing in Phase 2 spike** discovers WebSocket issues early, allows time to pivot to alternative chat solution (Pitfall #2)
- **OneSignal setup in Phase 2** with correct plugin ordering prevents silent iOS push failures (Pitfalls #6, #7, #8)
- **Performance profiling throughout Phases 2-3** prevents re-render and image optimization issues from accumulating (Pitfalls #13, #14, #15)
- **Deep linking validation in Phase 5** after all notification flows exist (Pitfall #17)

**Dependency chain:**
```
Phase 1 (Auth + API)
  ↓
Phase 2 (Pre-Trip) — establishes chat infrastructure, offline caching
  ↓
Phase 3 (During-Trip) — reuses chat, requires offline cache, adds location
  ↓
Phase 4 (Alumni) — references trip data, requires completed user journey
  ↓
Phase 5 (Polish) — requires feature-complete app for testing
```

### Research Flags

**Phases likely needing deeper research during planning:**

- **Phase 2 (Pre-Trip):** Supabase Realtime alternative if WebSocket module import fails. Need to research Stream Chat, PubNub, or tRPC WebSocket subscriptions. HIGH PRIORITY — this is a critical blocker for group chat and concierge features.

- **Phase 5 (Production Polish):** App Store submission process, ASO best practices, provisioning profile management in CI/CD. Moderate priority — standard process but niche documentation.

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Auth + API):** Clerk Expo authentication is well-documented with official quickstart guides and examples. tRPC React Query setup is standard pattern with high-confidence community examples.

- **Phase 3 (During-Trip):** Expo Location, expo-image-picker, and react-native-maps have comprehensive official docs. Standard travel app patterns.

- **Phase 4 (Alumni):** Standard CRUD operations with existing tRPC API. No novel integrations.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official Expo SDK 54 docs, Clerk Expo SDK verified, NativeWind v4 stable. tRPC version pinning requirement confirmed via Discord/GitHub issues. |
| Features | HIGH | Multiple luxury travel app sources from 2026, clear table stakes vs differentiators. Feature dependencies mapped from 10+ competitor apps and industry standards. |
| Architecture | HIGH | tRPC + Expo integration patterns verified with official docs and community examples. Clerk authentication flow documented in official quickstart. File upload pattern standard. |
| Pitfalls | HIGH | Critical pitfalls verified with official GitHub issues, Discord threads, and recent 2026 sources. Performance pitfalls confirmed in React Native official docs and recent Medium articles. |

**Overall confidence:** HIGH

Research is based on official documentation for core integrations (Expo, Clerk, tRPC), verified critical pitfalls with GitHub issues and Discord threads from 2025-2026, and cross-referenced feature expectations with 10+ luxury travel app sources. Phase structure recommendations are directly derived from architecture dependencies and pitfall prevention strategies.

### Gaps to Address

**Gaps requiring validation during implementation:**

- **Supabase Realtime compatibility with React Native:** GitHub issues #1434 and #1403 show active WebSocket module import failures as of Jan 2026. May require alternative chat solution. **Action:** Spike test Supabase Realtime on React Native in Phase 1 to determine if chat alternative needed.

- **tRPC version compatibility roadmap:** Pinning to v11.3.1 works now, but unclear when tRPC will fix Hermes engine compatibility. **Action:** Monitor tRPC GitHub issues and Discord for Hermes compatibility announcements before considering upgrade.

- **Monorepo structure decision:** Starting with separate repo for mobile (faster iteration) vs monorepo for type sharing (better DX). **Action:** Start with separate repo in Phase 1, revisit monorepo migration in v2.1 if type duplication becomes painful.

- **Offline mutation queue complexity:** TanStack Query doesn't have built-in mutation queue for React Native. **Action:** Phase 2 uses optimistic UI only (show "Pending"), Phase 3 evaluates simple queue with MMKV storage if needed. Fallback: require online for uploads (acceptable for luxury travel context).

- **iOS vs Android development priority:** Recommendation is iOS first (target demographic skews iPhone), but needs business validation. **Action:** Confirm with stakeholders during Phase 1 planning.

- **Push notification frequency and triggers:** Business decision needed for notification cadence. **Action:** Define notification strategy during Phase 2 planning. Recommendation: max 3 per trip (24h before, day-of, post-trip survey) to avoid over-notification (Pitfall: aggressive push cadence drives uninstalls).

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- [Expo SDK 54 Documentation](https://docs.expo.dev/versions/latest/) — Core framework, all native modules
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/) — File-based navigation
- [Clerk Expo SDK Reference](https://clerk.com/docs/reference/expo/overview) — Authentication, limitations on native
- [tRPC React Query Setup](https://trpc.io/docs/client/react/setup) — Client setup patterns
- [Supabase Expo React Native Guide](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native) — Database and Realtime
- [OneSignal Expo SDK Setup](https://documentation.onesignal.com/docs/en/react-native-expo-sdk-setup) — Push notifications
- [NativeWind v4 Documentation](https://www.nativewind.dev/v4) — Styling
- [Expo Monorepos Documentation](https://docs.expo.dev/guides/monorepos/) — Monorepo patterns, pitfall #5
- [React Native Performance Docs](https://reactnative.dev/docs/performance) — Performance optimization

**Critical Issues (Verified):**
- [tRPC Discord: React-native crashes with trpc > 11.3.0](https://discord-questions.trpc.io/m/1442530949068882011) — Pitfall #1
- [Supabase Issue #1434: ws module fails on RN](https://github.com/supabase/supabase-js/issues/1434) — Pitfall #2, open as of Jan 2026
- [Supabase Issue #1403: Expo SDK 53 stream error](https://github.com/supabase/supabase-js/issues/1403) — Pitfall #2, open as of Jan 2026
- [OneSignal Issue #154: Plugin order requirement](https://github.com/OneSignal/onesignal-expo-plugin/issues/154) — Pitfall #6

### Secondary (MEDIUM confidence)

**Community Examples & Tutorials:**
- [tRPC + Expo Integration Example](https://github.com/intergalacticspacehighway/expo-trpc) — Architecture patterns
- [tRPC React Native Monorepo Example](https://github.com/johnkueh/react-native-trpc-monorepo-example) — Type sharing
- [Create T3 Turbo Monorepo](https://github.com/juliusmarminge/create-t3-turbo-1) — Full-stack pattern
- [Clerk + Expo Full-Stack Example](https://dev.to/chrollo4ki/clerk-auth-full-stack-app-expressjs-trpc-expo-nextjs--4i3h) — Auth integration
- [Building Offline-First React Native Apps](https://www.whitespectre.com/ideas/how-to-build-offline-first-react-native-apps-with-react-query-and-typescript/) — React Query persistence

**Luxury Travel App Research:**
- [Top 10 Features Every Modern Travel App Should Have in 2026](https://www.vrinsofts.com/top-travel-app-features/) — Feature expectations
- [Travel App Development in 2026: Comprehensive Overview](https://www.cleveroad.com/blog/travel-app-development/) — Industry standards
- [Top Travel Technology Trends for 2025-26](https://kodytechnolab.com/blog/technology-trends-in-travel-and-tourism-industry/) — AI, biometrics, gamification
- [Perfect.Live Premium Concierge Services](https://perfect.live/) — Concierge feature patterns
- [TripIt: Highest-Rated Travel Itinerary App](https://www.tripit.com/web) — Offline itinerary standard
- [GUESTPIX QR Code Photo Sharing Platform](https://guestpix.com/vacations/) — Group photo gallery patterns

**Performance & Pitfalls:**
- [Medium: 7 React Native Mistakes Slowing Your App in 2026](https://medium.com/@baheer224/7-react-native-mistakes-slowing-your-app-in-2026-19702572796a) — Pitfalls #13-15
- [Bits Kingdom: React Native Optimization 2026](https://bitskingdom.com/blog/react-native-performance-optimization-fix-slow-apps/) — Performance patterns
- [JavaScript Plain English: Building Offline-First RN Apps 2026](https://javascript.plainenglish.io/building-offline-first-react-native-apps-the-complete-guide-2026-68ff77c7bb06) — Pitfall #16

### Tertiary (LOW confidence, needs validation)

- [Hacker News: Offline-first flows in large React Native apps](https://news.ycombinator.com/item?id=46360277) — Community discussion, patterns not official
- [TanStack Query Offline Patterns](https://github.com/TanStack/query/discussions/4342) — Community discussion, experimental solutions

---

**Research completed:** 2026-01-28
**Ready for roadmap:** Yes

**Next steps for orchestrator:**
1. Load SUMMARY.md as context for roadmap creation
2. Use phase structure recommendations as starting point
3. Flag Phase 2 for potential Supabase Realtime alternative research
4. Flag Phase 5 for App Store submission process research
5. Proceed to requirements definition with clear technology constraints (tRPC v11.3.1, Supabase Realtime compatibility unknown)
