# Domain Pitfalls: Adding Expo React Native to Next.js/tRPC Platform

**Domain:** React Native Mobile App Integration (Expo + Next.js monorepo)
**Researched:** 2026-01-28
**Confidence:** HIGH (verified with official docs and recent 2026 sources)

## Critical Pitfalls

Mistakes that cause rewrites, major architectural issues, or complete blocking of features.

### Pitfall 1: tRPC Version Incompatibility with React Native (Hermes Engine)

**What goes wrong:** tRPC versions 11.4.0+ crash React Native apps on startup with `_unstableCoreDoNotImport.createRecursiveProxy is not a function (it is undefined)` when using the Hermes JavaScript engine (which Expo uses by default).

**Why it happens:** React Native's Hermes engine has different JavaScript runtime characteristics than web browsers, and breaking changes were introduced in tRPC 11.4.0 that are incompatible with Hermes.

**Consequences:**
- Mobile app crashes immediately on launch
- Zero functionality - complete blocker
- Difficult to diagnose because it works fine on web

**Prevention:**
- Pin tRPC to version 11.3.1 or earlier in mobile package
- Use exact versions (not `^11.8.1`) to prevent auto-upgrades
- Test mobile app startup immediately after any tRPC version change
- Monitor tRPC GitHub issues for Hermes compatibility before upgrading

**Detection:**
- App crashes on startup before UI renders
- Error mentions `createRecursiveProxy` or `_unstableCoreDoNotImport`
- Web app works fine, only mobile crashes

**Phase impact:** MOB-SETUP-01 (foundational infrastructure)

**Sources:**
- [Discord: react-native crashes with trpc > 11.3.0](https://discord-questions.trpc.io/m/1442530949068882011)
- [GitHub: Monorepo with React Native + Next.js #775](https://github.com/trpc/trpc/issues/775)

---

### Pitfall 2: Supabase Realtime WebSocket Module Import Failures

**What goes wrong:** Supabase JS v2.x crashes on React Native/Expo with `Unable to resolve module ws` or `Unable to resolve module stream` errors, **even when Realtime is explicitly disabled and not used**.

**Why it happens:** The Supabase client imports `@supabase/realtime-js` which depends on the Node.js `ws` WebSocket module. React Native doesn't support Node.js modules, and the dependency exists even when realtime features are disabled in the client config.

**Consequences:**
- Cannot use ANY Supabase features in React Native (auth, database, storage)
- Setting `realtime: false` doesn't prevent the error
- Blocks all Supabase Realtime chat functionality (MOB-PRETRIP-05, MOB-TRIP-03)

**Prevention:**
- Use separate Supabase Auth and Database clients that exclude Realtime dependencies
- For chat, consider alternative: tRPC subscriptions over WebSocket, or third-party like Stream Chat
- If Realtime is required, wait for Supabase to fix the React Native compatibility issue
- Test Supabase integration in React Native **immediately** in spike phase

**Detection:**
- Build errors: "Unable to resolve module ws" or "Unable to resolve module stream"
- Occurs during Metro bundler compilation, not at runtime
- Error references `node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js`

**Phase impact:** MOB-PRETRIP-05 (group chat), MOB-TRIP-03 (concierge chat)

**Sources:**
- [GitHub Issue #1434: supabase-js v2.x fails on React Native due to ws module](https://github.com/supabase/supabase-js/issues/1434)
- [GitHub Issue #1403: Expo SDK 53 + supabase-js ws/stream error](https://github.com/supabase/supabase-js/issues/1403)
- [Medium: Solving the stream Module Issue in React Native with Supabase](https://medium.com/@josephmuhindo089/solving-the-stream-module-issue-in-react-native-with-supabase-a-clean-lightweight-solution-c8f2789f9a7b)

---

### Pitfall 3: Clerk Prebuilt Components Not Available on React Native

**What goes wrong:** Developers assume Clerk's prebuilt UI components (`<SignIn />`, `<SignUp />`, etc.) work on React Native, but Clerk only provides **control components** (hooks and headless logic) for native platforms.

**Why it happens:** Clerk's prebuilt UI components are web-only. The Expo SDK provides only the authentication logic, requiring developers to build custom UI.

**Consequences:**
- Wasted time trying to import web components that don't exist
- Need to build custom login/signup/profile screens from scratch
- Cannot reuse web authentication UI patterns directly
- Significant additional development time for auth flows

**Prevention:**
- Plan for custom auth UI design and implementation from day one
- Budget time for building email/password, OAuth, and MFA flows manually
- Use Clerk's Expo SDK control components and hooks (`useSignIn`, `useSignUp`, `useAuth`)
- Reference Clerk's React Native examples for UI patterns
- Consider design system implications - auth screens need mobile-first design

**Detection:**
- Import errors when trying to use `<SignIn />` or similar components
- Clerk documentation references "control components only" for React Native
- No prebuilt UI in `@clerk/clerk-expo` package exports

**Phase impact:** MOB-AUTH-01 (authentication foundation)

**Sources:**
- [Clerk Expo Quickstart: "Clerk currently only supports control components for Expo native"](https://clerk.com/docs/quickstarts/expo)
- [Clerk Blog: Using Clerk in a React Native app](https://clerk.com/blog/using-clerk-in-a-react-native-app)

---

### Pitfall 4: Duplicate React/React Native Versions in Monorepo

**What goes wrong:** Having multiple versions of React, React Native, or native modules in a single monorepo causes cryptic runtime errors, crashes, and "Invalid hook call" errors.

**Why it happens:** React Native enforces singleton patterns for native modules. Package managers can install duplicate versions due to version mismatches between workspace packages, leading to multiple React contexts and broken native bridges.

**Consequences:**
- "Invalid hook call" errors that are difficult to debug
- Native module crashes with unclear error messages
- App may work in development but crash in production builds
- Waste days debugging version conflicts

**Prevention:**
- Use **exact version pinning** for React and React Native across all workspace packages
- Add `resolutions` (Yarn) or `overrides` (npm/pnpm) in root package.json to force single versions
- For pnpm: add `node-linker=hoisted` to `.npmrc` to prevent isolated installations
- Run `npm ls react` or `yarn why react` regularly to detect duplicates
- Set up automated checks in CI to fail on duplicate React versions

**Detection:**
- Run `npm ls react` or `npm ls react-native` and look for multiple versions
- "Invalid hook call" errors in development
- Metro bundler warnings about duplicate modules
- Native crashes with unclear stack traces

**Phase impact:** MOB-SETUP-01 (monorepo foundation)

**Sources:**
- [Expo Monorepos Docs: "Duplicate React Native versions in a single monorepo are not supported"](https://docs.expo.dev/guides/monorepos/)
- [Medium: Ditching monorepos for React Native](https://davotisolutions.com/blog/ditching-monorepos-for-react-native)
- [GitHub Discussion: Monorepo with React Native + Next.js](https://lightrun.com/answers/trpc-trpc-monorepo-with-react-native--nextjs)

---

### Pitfall 5: Hardcoded Native Build Paths Break in Monorepos

**What goes wrong:** Native build scripts (iOS/Android) use hardcoded paths like `../../node_modules/react-native/react.gradle` which break in monorepos due to dependency hoisting, causing "Script does not exist" build failures.

**Why it happens:** Package managers hoist dependencies to the workspace root, changing the relative path structure. React Native's default template assumes a flat structure where `node_modules` is exactly 2 directories up.

**Consequences:**
- iOS/Android native builds fail with "Script does not exist" errors
- Works locally but fails on CI/CD with different hoisting behavior
- Blocks all native functionality until fixed

**Prevention:**
- Use Node's `require.resolve()` to dynamically resolve paths instead of hardcoding
- Example: `require.resolve('react-native/react.gradle')` instead of `../../node_modules/react-native/react.gradle`
- Test native builds **immediately** after monorepo setup
- Document all path resolutions for iOS and Android build files

**Detection:**
- Native build errors: "Script does not exist at path"
- Error references `node_modules/react-native/`
- Build works in standalone app but fails in monorepo

**Phase impact:** MOB-SETUP-01 (native build configuration)

**Source:**
- [Expo Monorepos Docs: Hardcoded Native Paths](https://docs.expo.dev/guides/monorepos/)

---

### Pitfall 6: OneSignal Plugin Order Causes "Missing Push Capability" Error

**What goes wrong:** If `onesignal-expo-plugin` is not positioned **above all other plugins** that modify notification settings in `app.json`, iOS shows "Missing Push Capability" error on the OneSignal dashboard.

**Why it happens:** Expo plugins run in order, and if another plugin modifies notification settings before OneSignal, the necessary iOS capabilities may not be properly configured.

**Consequences:**
- Push notifications silently fail on iOS
- OneSignal dashboard shows capability errors
- No runtime errors - just notifications never arrive
- Difficult to debug because configuration looks correct

**Prevention:**
- Place `onesignal-expo-plugin` as the **first plugin** in `app.json` plugins array
- Review all plugins that might affect notifications (expo-notifications, etc.)
- Test push notifications on real iOS device immediately after adding OneSignal
- Check OneSignal dashboard for capability warnings

**Detection:**
- OneSignal dashboard shows "Missing Push Capability" error
- Push notifications don't arrive on iOS (but may work on Android)
- No console errors or obvious failures

**Phase impact:** Push notification setup (affects all MOB-* features with notifications)

**Source:**
- [GitHub Issue #154: Does not work unless OneSignal is the first plugin to modify notification settings on iOS](https://github.com/OneSignal/onesignal-expo-plugin/issues/154)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or require significant refactoring.

### Pitfall 7: OneSignal Conflicts with expo-notifications Event Listeners

**What goes wrong:** When both OneSignal and `expo-notifications` are installed, notification event listeners (`addNotificationResponseReceivedListener`) stop working when the user taps notifications.

**Why it happens:** OneSignal intercepts notification events and doesn't properly propagate them to other listeners, creating a conflict when multiple notification systems are present.

**Consequences:**
- Cannot use both OneSignal and expo-notifications simultaneously
- Custom notification handling breaks
- Inconsistent notification behavior between platforms

**Prevention:**
- Choose ONE notification system: OneSignal OR expo-notifications, not both
- If using OneSignal, use only OneSignal's event handlers
- Remove `expo-notifications` if OneSignal is the primary system
- Document this constraint for future developers

**Detection:**
- Notification listeners execute until OneSignal is configured
- After OneSignal setup, `addNotificationResponseReceivedListener` never fires
- Works on Android but not iOS (or vice versa)

**Phase impact:** All notification-dependent features

**Sources:**
- [GitHub Issue #177: Run OneSignal in parallel with expo-notifications](https://github.com/OneSignal/onesignal-expo-plugin/issues/177)
- [GitHub Issue #1742: Expo notification listeners stop working when used alongside OneSignal](https://github.com/OneSignal/react-native-onesignal/issues/1742)

---

### Pitfall 8: iOS Notification Service Extension Missing Configuration

**What goes wrong:** Rich push notifications (images, attachments) don't work on iOS because the OneSignal Notification Service Extension requires separate configuration not mentioned in basic setup docs.

**Why it happens:** iOS requires a Notification Service Extension to handle rich media in notifications. This extension needs its own App Group configuration and provisioning profile, which is a multi-step process not covered in quick-start guides.

**Consequences:**
- Text-only notifications work, but images/media don't display
- Works on Android but not iOS
- Users get degraded experience on iOS

**Prevention:**
- Follow complete OneSignal iOS setup guide (not just quick start)
- Configure App Groups in Apple Developer Portal
- Create provisioning profiles for both main app and notification extension
- Test rich media notifications on real iOS device before considering feature complete

**Detection:**
- Text notifications arrive on iOS, but images don't display
- OneSignal dashboard shows notifications sent but no errors
- Works perfectly on Android

**Phase impact:** Any feature sending rich push notifications with images

**Source:**
- [Blog: Expo iOS Build Failing with OneSignal - Here's the Fix](https://blog.krum.io/expo-ios-build-failing-with-onesignal-heres-the-fix/)

---

### Pitfall 9: File Upload URI Format Differences Between iOS and Android

**What goes wrong:** File uploads work on iOS but fail on Android (or vice versa) because iOS uses `file://` URIs while Android uses `content://` URIs, and backend expects one format.

**Why it happens:** Platform differences in how file systems are exposed. Image pickers and file selectors return different URI formats per platform, and backend upload handlers may not handle both.

**Consequences:**
- File uploads work on one platform but silently fail on the other
- Testing on iOS only misses Android issues (or vice versa)
- User frustration when uploads fail without clear error

**Prevention:**
- Normalize file URIs before upload using platform-specific handling
- Remove `file://` prefix on iOS if needed by upload handler
- Use `expo-file-system` to convert `content://` URIs on Android
- Test file uploads on **both platforms** immediately
- Implement cross-platform file upload library or abstraction

**Detection:**
- Uploads work on iOS but fail on Android with "file not found" or "invalid path"
- Backend logs show malformed file paths
- Platform-specific error patterns

**Phase impact:** MOB-PRETRIP-03 (passport upload), MOB-TRIP-07 (photo journal)

**Source:**
- [GitHub Issue #1272: Can't upload file, receiving 'file not present' error](https://github.com/ivpusic/react-native-image-crop-picker/issues/1272)

---

### Pitfall 10: Missing Apple Sign-In Requirement When Using Google OAuth

**What goes wrong:** App Store rejects the app during review because it includes "Sign in with Google" but not "Sign in with Apple", violating Apple's App Store Review Guidelines.

**Why it happens:** Apple requires apps that offer third-party social login to also offer Apple Sign-In as an option. This is a policy enforcement, not a technical limitation.

**Consequences:**
- App Store rejection after weeks of development
- Emergency scramble to add Apple Sign-In
- Delayed launch while implementing additional auth method

**Prevention:**
- Add Apple Sign-In support from day one if using any social OAuth (Google, Facebook, etc.)
- Apple Sign-In requires native build (doesn't work with Expo Go)
- Budget time for Apple Developer account setup and certificate management
- Review Apple's guidelines early in development

**Detection:**
- App Store rejection notice citing missing Apple Sign-In
- Only happens during App Store review, not during development

**Phase impact:** MOB-AUTH-01 (authentication setup)

**Sources:**
- [Clerk Expo Docs: "If you include 'Sign in with Google,' Apple may reject your app unless you also support 'Sign in with Apple'"](https://clerk.com/docs/quickstarts/expo)
- [WebSearch results: Clerk auth React Native Expo integration pitfalls](https://clerk.com/blog/using-clerk-in-a-react-native-app)

---

### Pitfall 11: Magic Link Authentication Not Supported on Expo

**What goes wrong:** Developers implement email magic link authentication (common on web) but Expo doesn't support email links, causing the feature to silently fail.

**Why it happens:** Email magic links rely on deep linking mechanisms that Expo doesn't fully support for email-based universal links.

**Consequences:**
- Magic link emails arrive but clicking them doesn't open the app or authenticate
- Need to implement alternative authentication method
- Wasted development time on unsupported feature

**Prevention:**
- Use email/password or OAuth instead of magic links for mobile
- If passwordless is required, use SMS OTP instead of email magic links
- Review Clerk's supported auth methods for Expo before implementing
- Test authentication flow end-to-end on real device immediately

**Detection:**
- Email arrives with link but clicking it opens browser instead of app
- Authentication never completes on mobile
- Works fine on web but not mobile

**Phase impact:** MOB-AUTH-01 (authentication setup)

**Source:**
- [Clerk Expo Docs: "Expo does not support email links"](https://clerk.com/docs/quickstarts/expo)

---

### Pitfall 12: Production Builds Cannot Be Installed Directly on Devices

**What goes wrong:** Developers create production builds (`.aab`, `.ipa`) and try to install them directly on devices/emulators, expecting them to work like development builds.

**Why it happens:** Production builds are code-signed for app stores and have different configurations than development builds. They require app store distribution channels.

**Consequences:**
- Cannot test production builds locally before submission
- Discover issues only after App Store/Play Store submission
- Longer feedback loop for production-specific bugs

**Prevention:**
- Use preview builds (internal distribution) for testing production-like configurations
- Create separate EAS Build profiles: `development`, `preview`, `production`
- Use TestFlight (iOS) or internal testing track (Android) for pre-release testing
- Never expect to install `.aab` or `.ipa` production builds directly

**Detection:**
- Installation fails when trying to sideload production build
- Error messages about code signing or provisioning profiles

**Phase impact:** Final testing and deployment

**Source:**
- [Expo Build Docs: "Production builds must be installed through their respective app stores"](https://docs.expo.dev/deploy/build-project/)

---

### Pitfall 13: Unnecessary Re-renders Degrading Performance

**What goes wrong:** Mobile app feels sluggish despite lightweight UI because components re-render unnecessarily, especially list items in long scrollable views.

**Why it happens:** React Native re-renders components when state or props change. Common causes:
- Anonymous functions in render (create new function reference each render)
- Inline object/array creation in props
- Missing `React.memo` on expensive components
- Over-reliance on Context API causing cascading re-renders

**Consequences:**
- Laggy scrolling in lists (itinerary, chat messages, photo gallery)
- Dropped frames (< 60 FPS), especially on lower-end Android devices
- Poor user experience compared to native apps
- Battery drain from excessive JavaScript execution

**Prevention:**
- Use `React.memo` for list item components
- Extract callbacks outside render or use `useCallback` hook
- Avoid inline objects/arrays in JSX props
- Use `FlatList`/`FlashList` virtualization for long lists
- Profile performance with React DevTools Profiler early and often
- Set performance budget: 60 FPS minimum for scrolling

**Detection:**
- Scrolling feels janky or drops frames
- React DevTools Profiler shows excessive re-renders
- Use `console.log` in render to count unnecessary renders

**Phase impact:** MOB-TRIP-01 (itinerary list), MOB-PRETRIP-05/MOB-TRIP-03 (chat messages), MOB-TRIP-08 (photo gallery)

**Sources:**
- [Medium: 7 React Native Mistakes Slowing Your App in 2026](https://medium.com/@baheer224/7-react-native-mistakes-slowing-your-app-in-2026-19702572796a)
- [Bits Kingdom: React Native Optimization - Fixing Slow Apps 2026](https://bitskingdom.com/blog/react-native-performance-optimization-fix-slow-apps/)

---

### Pitfall 14: Heavy JavaScript Thread Operations Blocking UI

**What goes wrong:** Long-running JavaScript operations (data processing, complex calculations, large JSON parsing) block the main thread, freezing the UI and making the app unresponsive.

**Why it happens:** React Native's JavaScript thread is single-threaded. Heavy operations must complete before the next frame can render, causing dropped frames and UI freezing.

**Consequences:**
- UI freezes during data loading or processing
- "Application Not Responding" (ANR) errors on Android
- Poor user experience, app feels broken
- Users force-quit the app

**Prevention:**
- Move heavy operations to background threads using `react-native-reanimated` or Web Workers
- For large datasets, paginate or lazy-load instead of processing all at once
- Use `InteractionManager.runAfterInteractions()` to defer non-critical work
- Profile JavaScript thread usage with React Native Performance Monitor
- Implement loading states and skeleton screens to mask processing time

**Detection:**
- UI freezes for > 100ms during operations
- React Native performance monitor shows dropped frames
- Yellow box warnings about long-running tasks

**Phase impact:** Any feature with data processing (MOB-PRETRIP-07 offline itinerary, MOB-TRIP-01 itinerary rendering)

**Source:**
- [React Native Docs: Performance Overview](https://reactnative.dev/docs/performance)

---

### Pitfall 15: Unoptimized Images Causing Memory Issues and Slow Loading

**What goes wrong:** Large, uncompressed images from device camera (4000x3000px, 5MB+) are uploaded or displayed directly, causing memory crashes, slow loading, and poor performance.

**Why it happens:** Developers don't resize or compress images before upload/display. Mobile cameras produce high-resolution images that exceed what's needed for display or reasonable upload sizes.

**Consequences:**
- App crashes with out-of-memory errors when displaying multiple images
- Slow upload times over cellular networks
- Excessive data usage
- Poor user experience in photo features

**Prevention:**
- Resize images to reasonable dimensions before upload (max 1920x1080 for display)
- Compress images to reduce file size (80-90% quality is visually identical)
- Use `expo-image-manipulator` or `react-native-image-resizer` before upload
- Implement progressive/lazy loading for image galleries
- Cache remote images using `expo-image` or `react-native-fast-image`
- Set maximum file size limits (e.g., 2MB per image after compression)

**Detection:**
- Out-of-memory crashes when viewing photo gallery
- Slow image upload times (> 10 seconds per image)
- Large app bundle size or storage usage

**Phase impact:** MOB-TRIP-07 (photo journal), MOB-TRIP-08 (photo gallery), MOB-PRETRIP-03 (document upload)

**Sources:**
- [Medium: 7 React Native Mistakes Slowing Your App in 2026](https://medium.com/@baheer224/7-react-native-mistakes-slowing-your-app-in-2026-19702572796a)
- [F22Labs: 10 Mistakes to Avoid When Developing React Native Apps](https://www.f22labs.com/blogs/10-mistakes-to-avoid-when-developing-react-native-apps/)

---

### Pitfall 16: Offline-First Architecture Complexity Leaking Into Codebase

**What goes wrong:** Implementing offline support without proper architecture causes networking concerns to leak throughout the codebase, making it difficult to maintain and reason about.

**Why it happens:** Offline-first requires:
- Optimistic updates (show UI changes before server confirms)
- Temporary client IDs that get replaced with server IDs
- Retryable request queues
- Background sync while keeping UI responsive
- Conflict resolution strategies

Without proper abstraction, these concerns spread across components.

**Consequences:**
- Business logic tightly coupled with networking state
- Difficult to test offline scenarios
- Bugs in sync logic cause data corruption
- Maintenance nightmare as features grow

**Prevention:**
- Use dedicated offline library: `@tanstack/react-query` with persistence, or `WatermelonDB` for complex data
- Centralize sync logic in a dedicated service layer, not components
- Define clear boundaries: UI layer doesn't know about sync details
- For trip itinerary (MOB-PRETRIP-07), consider simple JSON caching instead of full offline-first
- Test offline scenarios early and continuously

**Detection:**
- Components contain sync logic, retry logic, or conflict resolution
- Many `useState` hooks tracking network/sync state
- Duplicated offline logic across components

**Phase impact:** MOB-PRETRIP-07 (offline itinerary), any feature requiring offline support

**Sources:**
- [Hacker News: How do you design offline-first flows in large React Native apps?](https://news.ycombinator.com/item?id=46360277)
- [JavaScript Plain English: Building Offline-First React Native Apps 2026](https://javascript.plainenglish.io/building-offline-first-react-native-apps-the-complete-guide-2026-68ff77c7bb06)

---

### Pitfall 17: Deep Linking Breaks with Missing initialRouteName

**What goes wrong:** When testing deep links (e.g., notification taps that open specific screens), there's no back button, stranding users on the deep-linked screen with no navigation.

**Why it happens:** Expo Router needs to know the navigation stack history to show a back button. Without `initialRouteName` configuration, it doesn't know which parent route to navigate back to from a deep link.

**Consequences:**
- Users tap notification and get stuck on the screen (can't navigate elsewhere)
- Poor UX, feels like a broken app
- Only happens with deep links, not normal app navigation

**Prevention:**
- Set `initialRouteName` in layout files for all nested navigation groups
- Define the default route for each navigation stack before the deep-linked route
- Test all deep link scenarios on real devices (can't fully test in simulator)
- Document deep link paths and their expected back navigation

**Detection:**
- No back button appears when opening app via deep link
- Back button works fine when navigating normally through app
- Only affects deep link entry points

**Phase impact:** All notification-based features (MOB-PRETRIP-05 chat, MOB-TRIP-03 concierge, etc.)

**Source:**
- [Expo Issue #818: Using unstable_settings breaks deep linking in app when in foreground/background](https://github.com/expo/router/issues/818)

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

### Pitfall 18: Expo SDK Auto-Configuration Breaking with Manual Metro Config

**What goes wrong:** Developers manually configure Metro bundler for monorepo (adding `watchFolders`, `nodeModulesPath`, etc.) and then upgrade to Expo SDK 52+, which auto-configures Metro. The manual config conflicts with auto-config, causing build failures.

**Why it happens:** Expo SDK 52+ automatically configures Metro for monorepos when using `expo/metro-config`. Legacy manual configurations conflict with the new auto-configuration.

**Consequences:**
- Build failures after SDK upgrade
- Confusing errors about duplicate Metro configurations
- Metro cache issues

**Prevention:**
- When upgrading to SDK 52+, **delete** manual Metro config properties:
  - `watchFolders`
  - `resolver.nodeModulesPath`
  - `resolver.extraNodeModules`
  - `resolver.disableHierarchicalLookup`
- Run `npx expo start --clear` after removing manual config
- Let Expo's auto-configuration handle monorepo setup

**Detection:**
- Build errors after upgrading to Expo SDK 52+
- Metro bundler errors about configuration conflicts
- App worked before SDK upgrade, breaks after

**Phase impact:** MOB-SETUP-01 (when upgrading Expo SDK)

**Source:**
- [Expo Monorepos Docs: SDK 52+ auto-configuration](https://docs.expo.dev/guides/monorepos/)

---

### Pitfall 19: Forgetting to Clear Metro Cache After Configuration Changes

**What goes wrong:** After changing Metro bundler configuration, native build config, or monorepo structure, the app doesn't reflect changes because Metro cache is stale.

**Why it happens:** Metro caches bundler configuration and module resolution for performance. Changes to config files aren't automatically detected.

**Consequences:**
- Config changes don't take effect
- Mysterious "module not found" errors that should be resolved
- Wasted debugging time

**Prevention:**
- Always run `npx expo start --clear` after:
  - Changing `metro.config.js`
  - Modifying monorepo workspace structure
  - Adding/removing packages
  - Changing native build configuration
- Add clear-cache command to development workflow documentation

**Detection:**
- Changes to config don't take effect
- Old errors persist after fixes
- Works after running `--clear` flag

**Phase impact:** All phases (recurring issue)

**Source:**
- [Expo Monorepos Docs](https://docs.expo.dev/guides/monorepos/)

---

### Pitfall 20: TestFlight Build Not Auto-Promoted to Production

**What goes wrong:** Developers assume a successful TestFlight build automatically goes to the App Store, but it remains in TestFlight until manually submitted for review.

**Why it happens:** TestFlight is a separate pre-release distribution channel. Promotion to App Store production requires manual submission through App Store Connect.

**Consequences:**
- Delayed production release while waiting for "automatic" promotion
- Confusion about release status
- Missing release window if not manually submitted

**Prevention:**
- Understand TestFlight is for testing, not production distribution
- After TestFlight testing completes, manually log into App Store Connect
- Select the build and click "Submit for Review"
- Allow 24-48 hours for App Review process
- Document the App Store submission process for future releases

**Detection:**
- Build appears in TestFlight but not in App Store
- No automatic promotion after expected timeframe

**Phase impact:** Final deployment to App Store

**Source:**
- [WebSearch: EAS Build Expo deployment common mistakes](https://levi9-serbia.medium.com/react-native-app-deployment-with-expo-eas-cli-your-complete-guide-to-app-store-publishing-d4674cb00518)

---

### Pitfall 21: Missing Developer Account Memberships Before EAS Submit

**What goes wrong:** Developers attempt to submit app to stores using `eas submit` but the build fails because they haven't enrolled in Apple Developer Program ($99/year) or Google Play Console ($25 one-time).

**Why it happens:** EAS Build can create builds without paid accounts, but submission requires active store memberships.

**Consequences:**
- Blocked submission when trying to ship
- Emergency scramble to enroll and wait for account approval
- Delayed launch

**Prevention:**
- Enroll in both Apple Developer Program and Google Play Console **before starting mobile development**
- Budget for annual Apple renewal ($99/year)
- Complete enrollment early to allow time for approval
- Store credentials securely for EAS Submit configuration

**Detection:**
- EAS Submit fails with "No valid membership" or similar error
- Cannot access App Store Connect or Google Play Console

**Phase impact:** Final deployment

**Source:**
- [Expo Build Docs: Developer account requirements](https://docs.expo.dev/deploy/build-project/)

---

## Phase-Specific Warnings

Pitfalls mapped to specific milestone phases for proactive prevention.

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **MOB-SETUP-01: Monorepo & Infrastructure** | tRPC version incompatibility (Critical #1) | Pin tRPC to 11.3.1, test mobile startup immediately |
| | Duplicate React versions (Critical #4) | Exact version pinning, use resolutions/overrides, verify with `npm ls` |
| | Hardcoded native paths (Critical #5) | Use `require.resolve()` for all native paths |
| | Metro config conflicts (Minor #18) | Delete manual config when using SDK 52+, clear cache |
| **MOB-AUTH-01: Authentication** | No prebuilt Clerk components (Critical #3) | Budget time for custom UI, use control components |
| | Apple Sign-In requirement (Moderate #10) | Add Apple Sign-In from day one if using OAuth |
| | Magic links unsupported (Moderate #11) | Use email/password or OAuth, not magic links |
| **MOB-PRETRIP-03: Document Upload** | File URI format differences (Moderate #9) | Normalize URIs, test on both iOS and Android |
| | Unoptimized images (Moderate #15) | Resize and compress before upload |
| **MOB-PRETRIP-05: Group Chat** | Supabase Realtime breaks (Critical #2) | Use alternative chat solution or wait for fix |
| **MOB-PRETRIP-07: Offline Itinerary** | Offline architecture complexity (Moderate #16) | Use simple JSON caching, avoid full offline-first for MVP |
| **MOB-TRIP-01: Itinerary View** | Unnecessary re-renders (Moderate #13) | Use `React.memo`, `FlatList` virtualization, profile early |
| | Heavy JS operations (Moderate #14) | Move processing to background, paginate data |
| **MOB-TRIP-03: Concierge Chat** | Supabase Realtime breaks (Critical #2) | Alternative chat solution required |
| | Deep link navigation (Moderate #17) | Set `initialRouteName` for all nested routes |
| **MOB-TRIP-07: Photo Upload** | File URI formats (Moderate #9) | Cross-platform URI handling |
| | Unoptimized images (Moderate #15) | Resize to 1920x1080, compress to <2MB |
| **MOB-TRIP-08: Photo Gallery** | Unoptimized images (Moderate #15) | Lazy loading, image caching, progressive loading |
| | Re-renders (Moderate #13) | `FlatList` with `React.memo` for gallery items |
| **Push Notifications (All Phases)** | OneSignal plugin order (Critical #6) | Place OneSignal first in plugins array |
| | OneSignal vs expo-notifications conflict (Moderate #7) | Choose one system, remove the other |
| | iOS Notification Service Extension (Moderate #8) | Configure App Groups and provisioning profiles |
| | Deep linking with notifications (Moderate #17) | Set `initialRouteName` for notification routes |
| **Final Deployment** | Production builds can't install locally (Moderate #12) | Use preview builds and TestFlight for testing |
| | TestFlight not auto-promoting (Minor #20) | Manual submission through App Store Connect |
| | Missing developer accounts (Minor #21) | Enroll early in Apple/Google programs |

---

## Cross-Cutting Concerns

Pitfalls that affect multiple phases and require ongoing vigilance.

### Performance
- **Re-renders** (Moderate #13): Profile continuously, not just at end
- **Heavy JS operations** (Moderate #14): Performance budget from day one
- **Image optimization** (Moderate #15): Apply to all image features

### Testing Strategy
- **Test on BOTH platforms immediately**: iOS and Android behave differently
  - File uploads (Moderate #9)
  - Push notifications (Critical #6, Moderate #7-8)
  - Deep linking (Moderate #17)
- **Test on real devices, not just simulators**:
  - Biometric authentication requires physical device
  - Push notifications don't work in iOS simulator
  - Performance characteristics differ significantly

### Version Management
- **Pin exact versions** for critical dependencies:
  - tRPC 11.3.1 (Critical #1)
  - React/React Native (Critical #4)
- **Clear Metro cache** after any config change (Minor #19)
- **Test after upgrades**: SDK upgrades can break existing config (Minor #18)

### Monorepo-Specific
- All Critical pitfalls #1-6 are exacerbated by monorepo complexity
- Verify configuration at both workspace root and package level
- Use workspace dependency resolution to prevent duplicates

---

## Research Confidence Assessment

| Pitfall Category | Confidence | Source Quality |
|-----------------|------------|----------------|
| tRPC/React Native integration | HIGH | Official GitHub issues, Discord, recent 2026 sources |
| Supabase Realtime issues | HIGH | Official GitHub issues, active open issues from 2025-2026 |
| Clerk authentication limitations | HIGH | Official Clerk documentation, verified with WebFetch |
| Monorepo configuration | HIGH | Official Expo documentation, verified with WebFetch |
| OneSignal integration | MEDIUM | GitHub issues, community blog posts |
| Performance optimization | MEDIUM | Recent 2026 articles, official React Native docs |
| File upload issues | MEDIUM | Community GitHub issues, multiple corroborating sources |
| Offline-first architecture | MEDIUM | Community discussions, multiple architecture guides |
| Deep linking | MEDIUM | Official Expo docs, GitHub issues |
| App store deployment | HIGH | Official Expo documentation, verified with WebFetch |

---

## Sources

All findings verified with recent (2025-2026) sources and official documentation where available:

**Official Documentation:**
- [Clerk Expo Quickstart](https://clerk.com/docs/quickstarts/expo)
- [Expo Monorepos Documentation](https://docs.expo.dev/guides/monorepos/)
- [Expo Build Documentation](https://docs.expo.dev/deploy/build-project/)
- [React Native Performance Docs](https://reactnative.dev/docs/performance)

**Critical Issues:**
- [tRPC React Native crash > 11.3.0](https://discord-questions.trpc.io/m/1442530949068882011)
- [Supabase Issue #1434: ws module fails on RN](https://github.com/supabase/supabase-js/issues/1434)
- [Supabase Issue #1403: Expo SDK 53 stream error](https://github.com/supabase/supabase-js/issues/1403)

**Community & Guides:**
- [Medium: 7 React Native Mistakes Slowing Your App in 2026](https://medium.com/@baheer224/7-react-native-mistakes-slowing-your-app-in-2026-19702572796a)
- [JavaScript Plain English: Building Offline-First RN Apps 2026](https://javascript.plainenglish.io/building-offline-first-react-native-apps-the-complete-guide-2026-68ff77c7bb06)
- [Blog: Expo iOS Build Failing with OneSignal Fix](https://blog.krum.io/expo-ios-build-failing-with-onesignal-heres-the-fix/)
