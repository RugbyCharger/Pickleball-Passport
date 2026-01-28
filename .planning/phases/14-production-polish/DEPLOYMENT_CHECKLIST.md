# Pickleball Passport - App Store Deployment Checklist

This checklist documents all the steps required to deploy the mobile app to Apple TestFlight and Google Play Store.

## Quick Reference

```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login to Expo
npx eas login

# Build for iOS (10-30 minutes)
cd mobile && npx eas build --platform ios --profile production

# Build for Android (10-20 minutes)
cd mobile && npx eas build --platform android --profile production

# Submit iOS to TestFlight
cd mobile && npx eas submit --platform ios --latest

# Submit Android to Play Store Internal
cd mobile && npx eas submit --platform android --latest

# View/manage credentials
npx eas credentials --platform ios
npx eas credentials --platform android
```

## Prerequisites

Before starting, ensure you have:
- [ ] Apple Developer Program membership ($99/year)
- [ ] Google Play Developer account ($25 one-time)
- [ ] Expo account (free) with EAS CLI installed
- [ ] Node.js 18+ and npm installed

## 1. Credential Setup

### 1.1 Apple Team ID

**Current Status:** Placeholder `APPLE_TEAM_ID_PLACEHOLDER` in mobile/app.json

**How to find:**
1. Log in to [Apple Developer Portal](https://developer.apple.com/account)
2. Go to Membership
3. Copy your Team ID (10-character alphanumeric)

**Files to update:**
```bash
# mobile/app.json - line 71
# Change: ["onesignal-expo-plugin", { "mode": "production", "devTeam": "APPLE_TEAM_ID_PLACEHOLDER" }]
# To:     ["onesignal-expo-plugin", { "mode": "production", "devTeam": "YOUR_TEAM_ID" }]

# public/.well-known/apple-app-site-association - lines 6, 16
# Change: "TEAM_ID.com.pickleballpassport.app"
# To:     "YOUR_TEAM_ID.com.pickleballpassport.app"
```

### 1.2 App Store Connect App ID

**Current Status:** Placeholder `APP_STORE_CONNECT_APP_ID_PLACEHOLDER` in mobile/eas.json

**How to set up:**
1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to My Apps > Add (+) > New App
3. Fill in:
   - Platform: iOS
   - Name: Pickleball Passport
   - Primary Language: English (U.S.)
   - Bundle ID: com.pickleballpassport.app
   - SKU: pickleballpassport (any unique string)
4. After creation, find the App ID in the URL or General > App Information

**File to update:**
```bash
# mobile/eas.json - line 39
# Change: "ascAppId": "APP_STORE_CONNECT_APP_ID_PLACEHOLDER"
# To:     "ascAppId": "1234567890"  # Your numeric app ID
```

### 1.3 Google Play Service Account

**Current Status:** File `google-service-account.json` does not exist in mobile/

**How to set up:**
1. Log in to [Google Play Console](https://play.google.com/console)
2. Go to Setup > API access
3. Link to a Google Cloud Project or create one
4. Create a new service account with these permissions:
   - Service Accounts > Create Service Account
   - Role: Service Account User
5. Download the JSON key file
6. In Play Console, grant the service account these permissions:
   - Release apps to testing tracks
   - Manage testing tracks
   - Manage app information

**File to create:**
```bash
# Place the downloaded file at: mobile/google-service-account.json
# This file is already in .gitignore for security
```

### 1.4 Android SHA256 Fingerprint

**Current Status:** Placeholder `SHA256_FINGERPRINT_PLACEHOLDER` in public/.well-known/assetlinks.json

**How to get:**
```bash
cd mobile && npx eas credentials --platform android
```

This will show your signing key fingerprint. If you haven't created credentials yet, EAS will prompt during first build.

**File to update:**
```bash
# public/.well-known/assetlinks.json
# Change: "SHA256_FINGERPRINT_PLACEHOLDER"
# To:     "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
```

### 1.5 OneSignal Setup

**Current Status:** Environment variables need to be set

**How to set up:**
1. Log in to [OneSignal Dashboard](https://onesignal.com)
2. Create a new app or use existing
3. Configure iOS: Upload your Apple Push Notification Certificate (.p12)
4. Configure Android: Enter Firebase Server Key (from Firebase Console)
5. Get the OneSignal App ID from Settings > Keys & IDs

**Environment variables to set:**
```bash
# .env.local (web) and mobile environment
ONESIGNAL_APP_ID=your-onesignal-app-id
ONESIGNAL_REST_API_KEY=your-rest-api-key
EXPO_PUBLIC_ONESIGNAL_APP_ID=your-onesignal-app-id  # same as above
```

## 2. Build Commands

### 2.1 iOS Production Build

```bash
cd mobile && npx eas build --platform ios --profile production
```

**What this does:**
- Generates/uses iOS distribution certificate (automatic with EAS)
- Generates/uses provisioning profile
- Builds an optimized IPA file
- Uploads to EAS servers

**Duration:** 10-30 minutes

**First-time prompts:**
- May ask to log in to Apple Developer account
- May ask to generate new credentials

### 2.2 Android Production Build

```bash
cd mobile && npx eas build --platform android --profile production
```

**What this does:**
- Generates/uses Android signing keystore
- Builds an optimized AAB file (Android App Bundle)
- Uploads to EAS servers

**Duration:** 10-20 minutes

**First-time prompts:**
- May ask to create new keystore or use existing

### 2.3 Monitor Builds

Check build status at:
```
https://expo.dev/accounts/[your-username]/projects/pickleball-passport/builds
```

## 3. App Store Submission

### 3.1 Submit to iOS TestFlight

```bash
cd mobile && npx eas submit --platform ios --latest
```

**After submission:**
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to My Apps > Pickleball Passport > TestFlight
3. Wait for Apple to process build (10-30 minutes)
4. If prompted, complete Export Compliance (usually "No encryption")
5. Build appears for internal testing automatically

**To add external testers:**
1. TestFlight > External Testing > Add External Testers
2. Testers receive TestFlight invite via email

### 3.2 Submit to Google Play Internal Track

```bash
cd mobile && npx eas submit --platform android --latest
```

**After submission:**
1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to Pickleball Passport > Testing > Internal testing
3. Build appears automatically
4. Create a testers list under Internal testing > Testers

**To get internal testing link:**
1. Internal testing > Testers > Copy link
2. Share link with testers (they must be in your testers list)

## 4. Post-Deployment Verification

### 4.1 Install and Test iOS

1. Install TestFlight app from App Store
2. Accept TestFlight invite (check email)
3. Install Pickleball Passport from TestFlight

**Test checklist:**
- [ ] App launches without crash
- [ ] Authentication works (sign in/sign up)
- [ ] Dashboard loads with bookings
- [ ] Push notifications prompt appears
- [ ] Deep links work (test with Messages app)

### 4.2 Install and Test Android

1. Join internal testing via shared link
2. Install from Play Store (shows as "Internal testing" badge)

**Test checklist:**
- [ ] App launches without crash
- [ ] Authentication works (sign in/sign up)
- [ ] Dashboard loads with bookings
- [ ] Push notifications prompt appears
- [ ] Deep links work (test with SMS app)

### 4.3 Test Deep Links

**iOS Universal Links:**
```
# Send these links via iMessage or email:
https://pickleballpassport.com/app/dashboard
https://pickleballpassport.com/trip/test-trip-id
https://pickleballpassport.com/alumni
```

Note: iOS caches AASA files aggressively. If links don't work:
1. Delete and reinstall the app
2. Wait up to 24 hours for Apple's CDN cache
3. Verify AASA at: https://app-site-association.cdn-apple.com/a/v1/pickleballpassport.com

**Android App Links:**
```
# Send these links via SMS or email:
https://pickleballpassport.com/app/dashboard
https://pickleballpassport.com/trip/test-trip-id
https://pickleballpassport.com/alumni
```

### 4.4 Test Push Notifications

1. Go to [OneSignal Dashboard](https://onesignal.com)
2. Messages > New Push
3. Target: Send to yourself (filter by user ID)
4. Include test data:
   ```json
   {
     "type": "trip_update",
     "tripId": "your-trip-id"
   }
   ```
5. Send and verify:
   - Notification appears
   - Tapping opens app to correct screen

## 5. Deploy Web Updates

After updating credential files, deploy the web app:

```bash
# If using Vercel CLI:
vercel --prod

# Or push to git (if Vercel is connected):
git add public/.well-known/
git commit -m "chore: update deep link credentials"
git push
```

Verify deployment:
```bash
curl https://pickleballpassport.com/.well-known/apple-app-site-association
curl https://pickleballpassport.com/.well-known/assetlinks.json
```

## Summary of Placeholders to Replace

| File | Placeholder | Replace With |
|------|-------------|--------------|
| mobile/app.json:71 | APPLE_TEAM_ID_PLACEHOLDER | Your Apple Team ID |
| mobile/eas.json:39 | APP_STORE_CONNECT_APP_ID_PLACEHOLDER | Your App Store Connect App ID |
| public/.well-known/apple-app-site-association | TEAM_ID | Your Apple Team ID |
| public/.well-known/assetlinks.json | SHA256_FINGERPRINT_PLACEHOLDER | Your Android signing key fingerprint |
| (create) mobile/google-service-account.json | N/A | Google Play service account JSON |
| .env | ONESIGNAL_APP_ID | Your OneSignal App ID |
| .env | ONESIGNAL_REST_API_KEY | Your OneSignal REST API Key |
| .env | EXPO_PUBLIC_ONESIGNAL_APP_ID | Your OneSignal App ID |

## Troubleshooting

### iOS Build Fails
- Ensure Apple Developer account is active
- Try: `npx eas credentials --platform ios` to manage certificates
- Check EAS build logs for specific error

### Android Build Fails
- Ensure google-service-account.json is valid
- Try: `npx eas credentials --platform android` to manage keystore
- Check EAS build logs for specific error

### TestFlight Submission Rejected
- Usually Export Compliance - answer "No" if no encryption
- App crashes on review - test thoroughly before submission

### Play Store Rejected
- Review policies at https://play.google.com/console/policy-center
- Common issues: missing privacy policy, inappropriate content

### Deep Links Not Working
- iOS: Wait 24h for AASA cache, delete/reinstall app
- Android: Verify assetlinks.json is accessible at /.well-known/assetlinks.json
- Both: Ensure HTTPS is working and no redirects

---

**Estimated Total Time:** 1-2 hours (mostly waiting for builds)

**Contact:** If issues persist, consult [EAS Documentation](https://docs.expo.dev/eas/) or [Expo Forums](https://forums.expo.dev/)
