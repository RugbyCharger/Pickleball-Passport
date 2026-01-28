# Phase 13: Alumni Engagement - Research

**Researched:** 2026-01-28
**Domain:** Post-trip alumni engagement, transformation tracking, referral system, gamification, testimonials
**Confidence:** HIGH

## Summary

Phase 13 implements the post-trip alumni engagement experience for the Pickleball Passport mobile app. After guests complete their trip, they transition to "alumni" status where they can view their transformation journey, browse fellow alumni, refer friends for rewards, rebook future trips with alumni discounts, earn passport stamps for achievements, and submit testimonials.

The technical foundation from Phase 11-12 (Stream Chat, MMKV persistence, tRPC, Expo Router) carries forward. The primary new challenges are: (1) aggregating transformation data from trip activities, photos, and reflections into a summary view, (2) implementing a searchable alumni directory with privacy controls, (3) integrating with the existing referral system (GuestReferral model already exists), (4) deep linking to web checkout for rebooking, (5) creating a passport stamps/achievements system, and (6) extending the existing GuestTestimonial router for mobile submission.

**Primary recommendation:** Leverage existing infrastructure heavily. The GuestReferral, GuestTestimonial, and referral tracking systems already exist in the backend. Alumni discount requires a new business constant. Passport stamps need a new data model. The alumni directory is a new screen with opt-in privacy. Rebooking flows should deep link to web checkout (in-app payments out of scope).

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed from Phase 10-12)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-router | SDK 54 | Navigation + deep linking | File-based routing, automatic deep link support |
| expo-linking | SDK 54 | Open external URLs | Launch web checkout for rebooking |
| @tanstack/react-query | v5.x | Data fetching + caching | Already configured with MMKV persistence |
| react-native-mmkv | v3.x | Offline data storage | Already integrated for offline caching |
| stream-chat-expo | v6.x | Real-time chat | Already used for trip chat (if alumni meetups need chat) |

### New Dependencies

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-sharing | SDK 54 | Share referral links | Native share sheet for referral code |
| expo-clipboard | SDK 54 | Copy referral link | Copy-to-clipboard for referral code |
| react-native-reanimated | v3.x | Achievement animations | Celebration effects for new stamps |
| lottie-react-native | v7.x | Achievement unlock animations | Visual delight when earning stamps |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Lottie animations | react-native-animatable | Lottie is more designer-friendly, better for achievements |
| expo-sharing | react-native-share | expo-sharing is simpler, sufficient for referral links |
| Custom achievement system | react-achievements | Custom is simpler for this use case, no Redux dependency |

**Installation:**
```bash
cd mobile && npx expo install expo-sharing expo-clipboard lottie-react-native
```

## Architecture Patterns

### Recommended Project Structure

```
mobile/
├── app/(app)/
│   └── alumni/
│       ├── index.tsx           # Alumni hub/dashboard
│       ├── journey.tsx         # Transformation journey summary
│       ├── directory.tsx       # Alumni directory (searchable)
│       ├── referrals.tsx       # Referral tracking + share
│       ├── stamps.tsx          # Passport stamps collection
│       └── testimonial.tsx     # Submit testimonial
├── components/
│   ├── alumni/
│   │   ├── JourneySummaryCard.tsx
│   │   ├── TransformationMetrics.tsx
│   │   ├── BeforeAfterGallery.tsx
│   │   ├── ReflectionTimeline.tsx
│   │   ├── AlumniCard.tsx
│   │   ├── AlumniSearchBar.tsx
│   │   ├── ReferralShareButton.tsx
│   │   ├── ReferralStatusList.tsx
│   │   ├── PassportStampBadge.tsx
│   │   ├── StampGrid.tsx
│   │   ├── AchievementUnlock.tsx  # Animation overlay
│   │   └── TestimonialForm.tsx
│   └── shared/
│       └── DiscountBanner.tsx     # Alumni discount display
├── hooks/
│   ├── useAlumniStatus.ts         # Check if user is alumni
│   ├── useTransformationData.ts   # Aggregate journey data
│   ├── useReferralStats.ts        # Referral tracking
│   └── usePassportStamps.ts       # Achievement tracking
└── lib/
    └── achievements.ts            # Stamp definitions + unlock logic
```

### Pattern 1: Alumni Status Detection

**What:** Determine if user qualifies as alumni (completed trip)
**When to use:** Gate alumni features, show alumni-only content
**Example:**
```typescript
// hooks/useAlumniStatus.ts
export function useAlumniStatus() {
  const { data: bookings } = trpc.booking.myBookings.useQuery();

  const completedBookings = bookings?.filter(
    (b) => b.status === 'COMPLETED'
  ) ?? [];

  const isAlumni = completedBookings.length > 0;
  const alumniSince = completedBookings[0]?.trip?.endDate;
  const totalTrips = completedBookings.length;

  return { isAlumni, alumniSince, totalTrips, completedBookings };
}
```

### Pattern 2: Deep Link to Web Checkout for Rebooking

**What:** Open web booking flow with alumni discount pre-applied
**When to use:** "Book Again" button in alumni dashboard
**Example:**
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/linking/
import * as Linking from 'expo-linking';

export async function openRebookingFlow(alumniCode: string) {
  const webUrl = `${process.env.EXPO_PUBLIC_WEB_URL}/booking/configure?` +
    `referral=${alumniCode}&source=mobile_alumni`;

  const canOpen = await Linking.canOpenURL(webUrl);
  if (canOpen) {
    await Linking.openURL(webUrl);
  }
}
```

### Pattern 3: Referral Link Sharing

**What:** Share referral code via native share sheet
**When to use:** User taps "Share" on referral screen
**Example:**
```typescript
// Source: Expo Sharing docs
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

export async function shareReferralLink(
  referralCode: string,
  userName: string
) {
  const shareUrl = `https://pickleballpassport.com/r/${referralCode}`;
  const message = `Join me on an incredible Pickleball Passport trip! Use my code ${referralCode} for a special discount: ${shareUrl}`;

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(shareUrl, {
      dialogTitle: 'Share Your Referral Link',
      UTI: 'public.url',
    });
  } else {
    // Fallback: copy to clipboard
    await Clipboard.setStringAsync(message);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  }
}
```

### Pattern 4: Searchable Alumni Directory with FlatList

**What:** Performant searchable list of alumni profiles
**When to use:** Alumni directory screen
**Example:**
```typescript
// Source: React Native FlatList docs
import { FlatList, TextInput } from 'react-native';
import { useDeferredValue, useState } from 'react';

export function AlumniDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  const { data: alumni } = trpc.alumni.directory.useQuery({
    search: deferredQuery,
    limit: 50,
  });

  return (
    <View className="flex-1">
      <TextInput
        placeholder="Search by name or trip..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="mx-4 my-2 p-3 bg-white rounded-lg border border-gray-200"
      />
      <FlatList
        data={alumni?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlumniCard alumni={item} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
}
```

### Pattern 5: Achievement Unlock Animation

**What:** Celebratory animation when user earns new stamp
**When to use:** After stamp-worthy action (e.g., submit testimonial, refer friend)
**Example:**
```typescript
// components/alumni/AchievementUnlock.tsx
import LottieView from 'lottie-react-native';
import { Modal, View, Text } from 'react-native';

export function AchievementUnlock({
  visible,
  stamp,
  onDismiss,
}: {
  visible: boolean;
  stamp: PassportStamp;
  onDismiss: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/70 items-center justify-center">
        <View className="bg-white rounded-2xl p-6 mx-8 items-center">
          <LottieView
            source={require('@/assets/animations/confetti.json')}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />
          <Text className="text-2xl font-bold mt-4">{stamp.name}</Text>
          <Text className="text-gray-600 text-center mt-2">
            {stamp.description}
          </Text>
          <TouchableOpacity
            onPress={onDismiss}
            className="mt-6 bg-primary px-8 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Awesome!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
```

### Anti-Patterns to Avoid

- **In-App Payment for Rebooking:** Per REQUIREMENTS.md, in-app payments are out of scope. Always deep link to web checkout.

- **Public Alumni Directory by Default:** Alumni visibility must be opt-in. Never expose user profiles without explicit consent.

- **Polling for Referral Status:** Use TanStack Query's refetch-on-focus, not polling. Referral status doesn't change frequently.

- **Complex Gamification:** Keep passport stamps simple - no points/levels/XP beyond milestone tracking. Over-gamification feels cheap for luxury travel.

- **Building Custom Share UI:** Use native share sheet via expo-sharing. Users expect familiar OS share interface.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Referral tracking | Custom tracking system | Existing GuestReferral model + ReferralEvent | Already implemented in Epic 10 with full funnel tracking |
| Testimonial submission | Custom form + storage | Existing GuestTestimonial router | Full moderation workflow already built (PENDING → APPROVED → PUBLISHED) |
| Share functionality | Custom share modal | expo-sharing | Native share sheet, handles all share targets |
| Link opening | Custom WebView | expo-linking | Proper external URL handling |
| Clipboard | Custom text selection | expo-clipboard | Works cross-platform |
| Achievement animations | requestAnimationFrame | lottie-react-native | Designer-friendly, performant |

**Key insight:** Most alumni features are UI for existing backend systems. GuestReferral, ReferralEvent, GuestTestimonial all exist. Focus on mobile UI, not backend logic.

## Common Pitfalls

### Pitfall 1: Alumni Discount Not Applied at Checkout

**What goes wrong:** User taps "Book Again" but discount doesn't appear on web checkout
**Why it happens:** Query parameters not properly passed to web or not handled by web booking flow
**How to avoid:**
- Pass referral code as URL parameter: `?referral=CODE&source=mobile_alumni`
- Web booking flow must detect `source=mobile_alumni` and apply alumni-specific discount
- Test the full flow: mobile → web → checkout → discount applied
**Warning signs:** Users report "no discount" after rebooking from app

### Pitfall 2: Privacy Violation in Alumni Directory

**What goes wrong:** Users appear in directory without consenting
**Why it happens:** Using existing `showInTravelersList` field which only covers pre-trip
**How to avoid:**
- Add new `showInAlumniDirectory` field to User or create AlumniProfile model
- Separate consent for pre-trip travelers list vs. post-trip alumni directory
- Default to false (opt-in, not opt-out)
**Warning signs:** User complaints about unwanted visibility

### Pitfall 3: Transformation Journey Data Incomplete

**What goes wrong:** Journey summary shows blank or incomplete data
**Why it happens:** Data scattered across TripPhoto, ActivityCheckIn, no dedicated reflection storage
**How to avoid:**
- Create aggregation query that pulls from all sources
- Handle gracefully when data is missing (show prompts to complete)
- Consider: Do we need a dedicated `JourneyReflection` model?
**Warning signs:** Empty journey summaries, users confused about what to view

### Pitfall 4: Passport Stamps Not Persisting

**What goes wrong:** User earns stamp, but it's gone after app restart
**Why it happens:** Stamps calculated client-side without backend storage
**How to avoid:**
- Store earned stamps in database (new PassportStamp model)
- Calculate eligible stamps server-side based on completed actions
- Never rely solely on client-side achievement tracking
**Warning signs:** Stamps disappear, users earn same stamp multiple times

### Pitfall 5: Referral Code Collision

**What goes wrong:** User can't get referral code, error about "code already exists"
**Why it happens:** FIRSTNAME-YEAR format collides for common names
**How to avoid:**
- Existing logic appends counter (SUSAN-2026-2) - verify it works
- Test with duplicate names
- Show clear error message if generation fails
**Warning signs:** Users with common names can't generate codes

## Code Examples

Verified patterns from official sources and existing codebase:

### Transformation Journey Summary

```typescript
// hooks/useTransformationData.ts
// Aggregates data from multiple sources into journey summary

export function useTransformationData(bookingId: string) {
  const { data: booking } = trpc.booking.getById.useQuery({ id: bookingId });
  const { data: photos } = trpc.photo.listByTrip.useQuery(
    { tripId: booking?.tripId ?? '' },
    { enabled: !!booking?.tripId }
  );
  const { data: checkIns } = trpc.activity.getCheckIns.useQuery(
    { bookingId },
    { enabled: !!bookingId }
  );

  // Aggregate metrics
  const metrics = useMemo(() => ({
    totalActivities: checkIns?.length ?? 0,
    photosUploaded: photos?.filter(p => p.uploadedBy === booking?.userId).length ?? 0,
    daysOnTrip: booking?.duration ?? 0,
    pickleballSessions: checkIns?.filter(c => c.activity?.type === 'PICKLEBALL').length ?? 0,
  }), [checkIns, photos, booking]);

  return {
    booking,
    photos,
    checkIns,
    metrics,
    isLoading: !booking,
  };
}
```

### Referral Status Display

```typescript
// components/alumni/ReferralStatusList.tsx
// Shows status of all referrals made by user

import { trpc } from '@/lib/trpc';

export function ReferralStatusList() {
  // Use existing GuestReferral query pattern
  const { data: referrals } = trpc.referral.myReferrals.useQuery();

  const statusColors = {
    CLICKED: 'bg-gray-200',
    APPLIED: 'bg-yellow-200',
    BOOKED: 'bg-blue-200',
    COMPLETED: 'bg-green-200',
  };

  return (
    <View className="space-y-3">
      {referrals?.map((referral) => (
        <View key={referral.id} className="bg-white p-4 rounded-lg shadow-sm">
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold">{referral.referredUser.email}</Text>
            <View className={`px-2 py-1 rounded-full ${statusColors[referral.status]}`}>
              <Text className="text-xs">{referral.status}</Text>
            </View>
          </View>
          <Text className="text-gray-500 text-sm mt-1">
            {referral.pointsEarned > 0
              ? `+${referral.pointsEarned} points earned`
              : 'Pending completion'}
          </Text>
        </View>
      ))}
    </View>
  );
}
```

### Testimonial Submission Form

```typescript
// Based on existing GuestTestimonial router patterns
// components/alumni/TestimonialForm.tsx

import { trpc } from '@/lib/trpc';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export function TestimonialForm({ bookingId }: { bookingId: string }) {
  const [content, setContent] = useState('');
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  const submitTestimonial = trpc.guestTestimonial.submit.useMutation({
    onSuccess: () => {
      Alert.alert('Thank You!', 'Your testimonial has been submitted for review.');
    },
  });

  const pickPhoto = async (setPhoto: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      // Compress per requirements: max 1920px, 70% quality
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1920 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPhoto(compressed.uri);
    }
  };

  const handleSubmit = async () => {
    if (!consentGiven) {
      Alert.alert('Consent Required', 'Please agree to share your testimonial.');
      return;
    }

    // Upload photos first (using existing Supabase pattern)
    const beforeUrl = beforePhoto ? await uploadToSupabase(beforePhoto) : undefined;
    const afterUrl = afterPhoto ? await uploadToSupabase(afterPhoto) : undefined;

    await submitTestimonial.mutateAsync({
      type: beforePhoto && afterPhoto ? 'BEFORE_AFTER' : 'TEXT',
      content,
      beforePhotoUrl: beforeUrl,
      afterPhotoUrl: afterUrl,
      bookingId,
      guestName: user.fullName,
      consentGiven: true,
    });
  };

  return (
    <ScrollView className="p-4">
      {/* Form fields */}
    </ScrollView>
  );
}
```

## New Database Models Needed

### PassportStamp Model

```prisma
// Passport stamp definitions (admin-managed)
model PassportStampDefinition {
  id          String   @id @default(cuid())
  code        String   @unique // "FIRST_TRIP", "REFERRAL_CHAMPION", etc.
  name        String   // "First Adventure"
  description String   // "Complete your first Pickleball Passport trip"
  iconUrl     String?  // Stamp image/icon
  category    String   // "TRIPS", "REFERRALS", "ENGAGEMENT", "ACHIEVEMENTS"
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)

  // Unlock criteria (stored as JSON for flexibility)
  unlockCriteria Json   // { type: "TRIPS_COMPLETED", count: 1 }

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  earnedStamps UserPassportStamp[]

  @@index([code])
  @@index([category])
  @@index([isActive])
}

// User's earned stamps
model UserPassportStamp {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stampId      String
  stamp        PassportStampDefinition @relation(fields: [stampId], references: [id])

  earnedAt     DateTime @default(now())
  tripId       String?  // Optional: which trip earned this stamp

  @@unique([userId, stampId])
  @@index([userId])
  @@index([stampId])
  @@index([earnedAt])
}
```

### AlumniProfile Extension

```prisma
// Add to existing User model or create separate AlumniProfile
// Option 1: Add fields to User
model User {
  // ... existing fields ...

  // Alumni Directory
  showInAlumniDirectory Boolean @default(false) // Opt-in for alumni directory
  alumniProfileBio      String? @db.Text        // Optional bio for directory
  alumniProfilePhoto    String?                  // Profile photo URL

  // Alumni Discount
  alumniDiscountUsedAt  DateTime?               // When alumni discount was last used

  // Relationships
  passportStamps UserPassportStamp[]
}
```

## New tRPC Routers/Procedures Needed

| Router | Procedure | Purpose |
|--------|-----------|---------|
| alumni | getStatus | Check if user is alumni + stats |
| alumni | directory | Searchable list of opted-in alumni |
| alumni | updateProfile | Update alumni directory visibility + bio |
| alumni | getJourneySummary | Aggregate transformation data |
| stamps | getDefinitions | List all stamp definitions |
| stamps | getMyStamps | User's earned stamps |
| stamps | checkAndAward | Check eligibility + award new stamps |
| referral | myReferrals | Get user's referral list with status (may exist) |
| referral | generateCode | Generate referral code if eligible (may exist) |
| referral | getStats | Referral funnel stats for user |

## Business Constants Needed

```typescript
// lib/config/business-constants.ts additions

// Alumni discount configuration
export const ALUMNI_DISCOUNT_CONFIG = {
  /** Alumni rebooking discount percentage */
  DISCOUNT_RATE: 0.10, // 10% discount

  /** Minimum days between using alumni discount */
  COOLDOWN_DAYS: 0, // No cooldown, can use on every booking

  /** Alumni discount stacks with partner referral? */
  STACKS_WITH_PARTNER_DISCOUNT: false, // Use best of the two
} as const;

// Passport stamps configuration
export const PASSPORT_STAMPS_CONFIG = {
  STAMPS: {
    FIRST_TRIP: {
      code: 'FIRST_TRIP',
      name: 'First Adventure',
      description: 'Complete your first Pickleball Passport trip',
      category: 'TRIPS',
      criteria: { type: 'TRIPS_COMPLETED', count: 1 },
    },
    REPEAT_TRAVELER: {
      code: 'REPEAT_TRAVELER',
      name: 'Repeat Traveler',
      description: 'Complete two Pickleball Passport trips',
      category: 'TRIPS',
      criteria: { type: 'TRIPS_COMPLETED', count: 2 },
    },
    REFERRAL_CHAMPION: {
      code: 'REFERRAL_CHAMPION',
      name: 'Referral Champion',
      description: 'Refer a friend who completes a trip',
      category: 'REFERRALS',
      criteria: { type: 'REFERRALS_COMPLETED', count: 1 },
    },
    STORYTELLER: {
      code: 'STORYTELLER',
      name: 'Storyteller',
      description: 'Submit an approved testimonial',
      category: 'ENGAGEMENT',
      criteria: { type: 'TESTIMONIAL_APPROVED', count: 1 },
    },
    MEMORY_MAKER: {
      code: 'MEMORY_MAKER',
      name: 'Memory Maker',
      description: 'Upload 10+ photos during a trip',
      category: 'ENGAGEMENT',
      criteria: { type: 'PHOTOS_UPLOADED', count: 10 },
    },
  },
} as const;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual referral tracking | GuestReferral + ReferralEvent models | Epic 10 (2026) | Full funnel tracking already exists |
| Basic badge display | Lottie animations for achievements | 2024+ | Delightful unlock experiences |
| WebView for external links | expo-linking.openURL | Standard | Proper external URL handling |
| Custom share dialogs | expo-sharing | Standard | Native share sheet experience |

**Deprecated/outdated:**
- **WebView for rebooking:** Always use deep link to external browser, not in-app WebView
- **Polling for referral updates:** Use TanStack Query's stale-while-revalidate pattern

## Open Questions

Things that couldn't be fully resolved:

1. **Alumni Discount Implementation Location**
   - What we know: Discount should apply at web checkout
   - What's unclear: How to identify alumni from mobile deep link
   - Recommendation: Pass `source=mobile_alumni&user_id=XXX` in URL, web validates alumni status server-side

2. **Journey Reflection Storage**
   - What we know: MOB-ALUMNI-01 mentions "reflections" but no Reflection model exists
   - What's unclear: Should reflections be stored? Or are they prompts without storage?
   - Recommendation: For v2.0, show prompts without storage. Add JourneyReflection model if product wants persistence.

3. **Stamp Award Timing**
   - What we know: Need to check/award stamps when criteria met
   - What's unclear: Real-time checking vs. batch job
   - Recommendation: Check on relevant actions (booking complete webhook, testimonial approved webhook). Don't poll.

4. **Alumni Directory Search Performance**
   - What we know: FlatList with search works for moderate lists
   - What's unclear: Expected alumni count over time
   - Recommendation: Start with client-side filtering, add server-side pagination if >1000 alumni

5. **Transformation "Before/After Metrics"**
   - What we know: MOB-ALUMNI-01 mentions "before/after metrics"
   - What's unclear: What metrics? Skill level? No pre-trip metric capture exists.
   - Recommendation: For v2.0, focus on photos + activity counts. "Metrics" can be qualitative reflections.

## Existing Code to Reuse

**Already Implemented (backend):**
- `lib/trpc/server/routers/guest-testimonial.ts` - Full testimonial submission + moderation workflow
- `GuestReferral` model + `ReferralEvent` model - Complete referral tracking
- `lib/config/business-constants.ts` - `GUEST_REFERRAL_POINTS_CONFIG` with points logic
- `calculateGuestReferralPoints()` function - Points calculation based on booking value

**Already Implemented (mobile, from Phase 11-12):**
- MMKV + TanStack Query persistence - Offline data caching
- Image compression pattern (`expo-image-manipulator`) - Before/after photo uploads
- Stream Chat integration - Could be used for alumni virtual meetups (future)

**Needs Extension:**
- User model - Add `showInAlumniDirectory`, `alumniProfileBio` fields
- New `PassportStampDefinition` and `UserPassportStamp` models
- New `alumni` tRPC router
- New `stamps` tRPC router
- `ALUMNI_DISCOUNT_CONFIG` in business constants

## Sources

### Primary (HIGH confidence)
- [Expo Linking Documentation](https://docs.expo.dev/versions/latest/sdk/linking/) - Deep linking, external URL opening
- [Expo Sharing Documentation](https://docs.expo.dev/linking/into-other-apps/) - Native share sheet
- [React Native FlatList](https://reactnative.dev/docs/flatlist) - Searchable list performance
- Existing codebase: `guest-testimonial.ts`, `business-constants.ts`, schema.prisma referral models

### Secondary (MEDIUM confidence)
- [React Native Best Practices 2026](https://www.esparkinfo.com/blog/react-native-best-practices) - Performance patterns
- [Building Searchable Lists in React Native](https://www.bomberbot.com/react-native/building-high-performance-searchable-lists-in-react-native-the-definitive-guide/) - FlatList optimization
- [Gamification in React Native](https://commt.co/blog/gamification-in-react-native) - Achievement patterns

### Tertiary (LOW confidence)
- [Top Gamification Tools 2026](https://www.plotline.so/blog/tools-to-gamify-apps) - External services (not using)
- WebSearch results for achievement animations - May need validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries well-documented, most already in use
- Architecture: HIGH - Follows established patterns from Phase 11-12
- Data models: MEDIUM - New models needed, but follow existing conventions
- Pitfalls: HIGH - Based on existing codebase knowledge

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - stable patterns)

---

## Requirements Traceability

| Requirement | Implementation Approach | Confidence |
|-------------|------------------------|------------|
| MOB-ALUMNI-01: Transformation journey summary | Aggregation query from photos, check-ins, booking data | MEDIUM |
| MOB-ALUMNI-02: Alumni directory | New screen with FlatList, opt-in visibility, search | HIGH |
| MOB-ALUMNI-03: Referral tracking | Use existing GuestReferral + ReferralEvent, new UI | HIGH |
| MOB-ALUMNI-04: Rebook with discount | Deep link to web checkout with alumni params | HIGH |
| MOB-ALUMNI-05: Passport stamps | New PassportStamp models, achievement system | MEDIUM |
| MOB-ALUMNI-06: Testimonial submission | Use existing GuestTestimonial router, new mobile UI | HIGH |
