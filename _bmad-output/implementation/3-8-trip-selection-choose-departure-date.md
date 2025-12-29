# Story 3.8: Trip Selection - Choose Departure Date

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a guest,
I want to choose which trip I'm booking,
So that I can select a departure date that works for me.

## Acceptance Criteria

###

 AC-1: Trip Listing Page

- [ ] After package configuration (/booking/configure/wellness), navigate to `/booking/configure/trip`
- [ ] Protected route (requires Clerk authentication)
- [ ] Page displays "Step 6 of 6" progress indicator
- [ ] Page title: "Choose Your Departure Date"
- [ ] Subtitle: "Select from our upcoming transformation journeys to Thailand"

### AC-2: Trip Display & Information

- [ ] Display available trips sorted by start date (ascending)
- [ ] Each trip card shows:
  - Trip name (e.g., "Phuket January 2026")
  - Destination
  - Start date (formatted: "January 15, 2026")
  - End date (formatted: "January 29, 2026")
  - Availability indicator: "X/12 spots remaining"
  - Duration badge (calculated from dates)
- [ ] Trips are displayed in a grid layout (2 columns desktop, 1 column mobile)

### AC-3: Availability & Booking Status

- [ ] Filter: Show only trips with availability (currentBookings < capacity)
- [ ] If trip is fully booked (currentBookings >= capacity):
  - Display "Fully Booked" badge
  - Card is disabled (greyed out, not clickable)
  - Show "Join Waitlist" button instead of "Select"
- [ ] Display trips with status SCHEDULED or CONFIRMED only
- [ ] Hide trips with status IN_PROGRESS or COMPLETED

### AC-4: Trip Selection Interaction

- [ ] Clicking a trip card selects it (radio button behavior - only one selected)
- [ ] Selected trip shows:
  - Emerald green border (2px)
  - Checkmark icon in top-right corner
  - Slight elevation/shadow increase
- [ ] Previously selected trip is automatically deselected when new trip chosen

### AC-5: Navigation & Flow

- [ ] "Back to Wellness Add-Ons" button (routes to `/booking/configure/wellness`)
- [ ] "Next: Review Booking" button
  - Disabled until a trip is selected
  - When enabled, routes to `/booking/review`
- [ ] Back button preserves all previous selections (package, duration, accommodation, add-ons)

### AC-6: State Management

- [ ] Selected trip ID stored in Zustand booking store
- [ ] Trip selection persists across page refreshes (localStorage via Zustand persist)
- [ ] Selected trip data accessible to review page for display

### AC-7: Empty States

- [ ] If no trips available: Display message "No upcoming trips available. Check back soon!"
- [ ] If all trips fully booked: Display "All trips are fully booked. Join our waitlist to be notified when new dates open."
- [ ] Loading state: Show skeleton cards while fetching trips

### AC-8: Error Handling

- [ ] If trip fetch fails: Display error message with retry button
- [ ] If trip selection fails: Show toast notification with error
- [ ] Network errors handled gracefully with user-friendly messages

### AC-9: Mobile Responsiveness

- [ ] Trip cards stack vertically on mobile (<768px)
- [ ] Touch-friendly card sizes (minimum 48px tap targets)
- [ ] Horizontal scrolling for long trip names (with ellipsis)
- [ ] Bottom navigation buttons fixed on mobile for easy access

### AC-10: Accessibility

- [ ] Semantic HTML (use `<article>` for trip cards)
- [ ] ARIA labels for trip selection ("Select trip: Phuket January 2026")
- [ ] Keyboard navigation support (Tab to navigate, Enter/Space to select)
- [ ] Focus indicators visible and clear
- [ ] Screen reader announces selection state changes

## Tasks / Subtasks

- [ ] Task 1: Create tRPC trip query (AC: 2, 3)
  - [ ] Subtask 1.1: Add `getAvailable` query to trip router
  - [ ] Subtask 1.2: Implement filtering logic (availability, status)
  - [ ] Subtask 1.3: Include booking count in response (_count)
  - [ ] Subtask 1.4: Add proper TypeScript types and Zod validation

- [ ] Task 2: Update Zustand booking store (AC: 6)
  - [ ] Subtask 2.1: Add `selectedTripId: string | null` field
  - [ ] Subtask 2.2: Add `setSelectedTrip(tripId: string)` method
  - [ ] Subtask 2.3: Add trip ID to persisted fields in localStorage

- [ ] Task 3: Create TripCard component (AC: 2, 4)
  - [ ] Subtask 3.1: Build reusable TripCard with all trip information
  - [ ] Subtask 3.2: Implement selection state (border, checkmark)
  - [ ] Subtask 3.3: Add "Fully Booked" badge for unavailable trips
  - [ ] Subtask 3.4: Add accessibility attributes (ARIA, semantic HTML)

- [ ] Task 4: Create TripSelector component (AC: 2, 3, 4, 7)
  - [ ] Subtask 4.1: Fetch trips using tRPC query
  - [ ] Subtask 4.2: Render trip cards in grid layout
  - [ ] Subtask 4.3: Implement radio selection logic
  - [ ] Subtask 4.4: Handle loading, empty, and error states

- [ ] Task 5: Create trip selection page (AC: 1, 5, 9)
  - [ ] Subtask 5.1: Create `/app/booking/configure/trip/page.tsx`
  - [ ] Subtask 5.2: Add progress indicator ("Step 6 of 6")
  - [ ] Subtask 5.3: Add page title and subtitle
  - [ ] Subtask 5.4: Integrate TripSelector component
  - [ ] Subtask 5.5: Add navigation buttons (Back/Next)
  - [ ] Subtask 5.6: Implement route protection with Clerk

- [ ] Task 6: Update navigation flow (AC: 5)
  - [ ] Subtask 6.1: Update wellness selector "Next" button to route to `/booking/configure/trip`
  - [ ] Subtask 6.2: Ensure trip page "Next" validates selection before routing to review

- [ ] Task 7: Testing & validation (AC: All)
  - [ ] Subtask 7.1: Write unit tests for TripCard component
  - [ ] Subtask 7.2: Write integration tests for trip selection flow
  - [ ] Subtask 7.3: Test state persistence (localStorage)
  - [ ] Subtask 7.4: Test mobile responsiveness
  - [ ] Subtask 7.5: Run TypeScript validation (0 errors)
  - [ ] Subtask 7.6: Test keyboard navigation and accessibility

## Dev Notes

###  Architecture Requirements (MUST FOLLOW)

**Database Schema:**
- Trip model structure (from Prisma schema lines 245-269):
  ```prisma
  model Trip {
    id              String   @id @default(cuid())
    name            String
    destination     String
    startDate       DateTime
    endDate         DateTime
    capacity        Int      @default(12)
    currentBookings Int      @default(0)
    isActive        Boolean  @default(true)

    bookings        Booking[]

    @@index([startDate])
    @@index([isActive])
  }
  ```

**tRPC API Pattern:**
- Create `getAvailable` query in `lib/trpc/server/routers/trip.ts`:
  ```typescript
  getAvailable: publicProcedure
    .input(z.object({
      statusFilter: z.boolean().optional() // Filter by isActive
    }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.trip.findMany({
        where: {
          isActive: true,
          currentBookings: { lt: ctx.prisma.trip.fields.capacity },
          startDate: { gte: new Date() } // Future trips only
        },
        orderBy: { startDate: 'asc' },
        include: {
          _count: {
            select: { bookings: true }
          }
        }
      })
    })
  ```

**Key Implementation Points:**
1. **Query Optimization:** Use `_count` to get booking count in single query (prevent N+1)
2. **Filtering:** Only show trips with `startDate >= now()` and `currentBookings < capacity`
3. **Caching:** tRPC + React Query will cache for 5 minutes automatically
4. **Type Safety:** Response types auto-generated from Prisma schema

### Component Patterns (Learned from E3-S4, E3-S5)

**Page Structure Pattern:**
```typescript
// app/booking/configure/trip/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import TripSelector from '@/components/booking/trip-selector'
import { PricingSummary } from '@/components/booking/pricing-summary'

export const metadata: Metadata = {
  title: 'Choose Departure Date | Pickleball Passport',
  description: 'Select your transformation journey departure date.'
}

export default async function TripSelectionPage() {
  const user = await currentUser()
  if (!user) {
    redirect('/sign-in?redirect_url=/booking/configure/trip')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      {/* Page content */}
    </div>
  )
}
```

**Selector Component Pattern (from medical/wellness selectors):**
- Use `'use client'` directive at top
- Import tRPC with `import { trpc } from '@/lib/trpc/client'`
- Use Zustand store: `import { useBookingStore } from '@/lib/stores/booking-store'`
- Use Next.js router: `import { useRouter } from 'next/navigation'`
- Handle loading/empty/error states explicitly
- Navigation: Back/Next buttons at bottom

**Card Component Pattern (from AddOnCard):**
- Reusable, controlled component
- Props: `trip`, `isSelected`, `onToggle`
- TypeScript interface for props
- Radix UI for interactive elements (if needed)
- Tailwind for styling
- Hover effects and transitions

### Zustand Store Updates

**Add to booking-store.ts:**
```typescript
export interface BookingState {
  // ... existing fields
  selectedTripId: string | null

  // ... existing methods
  setSelectedTrip: (tripId: string) => void
  clearTrip: () => void
}

// In create() implementation:
selectedTripId: null,

setSelectedTrip: (tripId) => set({ selectedTripId: tripId }),

clearTrip: () => set({ selectedTripId: null }),

// In persist() partialize:
partialize: (state) => ({
  // ... existing fields
  selectedTripId: state.selectedTripId,
})
```

### File Structure & Locations

**Files to Create:**
- `lib/trpc/server/routers/trip.ts` - tRPC router for trip queries
- `components/booking/trip-card.tsx` - Individual trip card component
- `components/booking/trip-selector.tsx` - Trip selection grid with logic
- `app/booking/configure/trip/page.tsx` - Trip selection page

**Files to Modify:**
- `lib/stores/booking-store.ts` - Add selectedTripId field and methods
- `components/booking/wellness-add-ons-selector.tsx` - Update "Next" button to route to `/booking/configure/trip`
- `lib/trpc/server/routers/_app.ts` - Add trip router to root router

### Testing Requirements

**Unit Tests:**
- TripCard component renders correctly
- TripCard shows "Fully Booked" badge when capacity reached
- TripCard selection state changes on click
- TripSelector filters trips correctly

**Integration Tests:**
- tRPC query returns trips in correct order
- Trip selection updates Zustand store
- Navigation flow works correctly
- State persists across page refreshes

**TypeScript Validation:**
- Run `npx tsc --noEmit` - must pass with 0 errors
- All components properly typed
- No `any` types used

### UI/UX Design Specifications

**Colors (from architecture):**
- Primary: Ocean Blue (#003D5C)
- Accent: Gold (#D4AF37)
- Success/Selected: Emerald (#10B981)
- Background: Slate-50 to White gradient

**Typography:**
- Headings: Serif (Playfair Display via Tailwind `font-serif`)
- Body: Sans-serif (Inter via Tailwind `font-sans`)

**Spacing:**
- Page padding: `py-12 px-4 sm:px-6 lg:px-8`
- Card gap: `gap-6`
- Grid: `grid-cols-1 md:grid-cols-2 gap-6`

**Components:**
- Use existing `PricingSummary` component in sidebar
- Follow pattern from wellness/medical pages for layout
- Emerald theme for primary actions

### Previous Story Intelligence (E3-S5 Learnings)

**From E3-S5 (Wellness Add-Ons) - Commit 9ed0f53:**
- ✅ Successfully implemented multi-select with category filtering
- ✅ Reused AddOnCard component effectively - consider similar reusable TripCard
- ✅ tRPC `getByCategories` query pattern works well - use similar filtering for trips
- ✅ TypeScript validation passed with type-safe category casting
- ✅ Navigation flow: Medical → Wellness → **TRIP** (next in sequence)
- ✅ Zustand store integration smooth with localStorage persistence

**Key Patterns to Replicate:**
1. **Component Reusability:** Create TripCard similar to AddOnCard structure
2. **Loading States:** Implement skeleton/spinner while fetching (Loader2 from lucide-react)
3. **Empty States:** Clear messaging when no trips available
4. **State Management:** Add trip selection to same booking store pattern
5. **Navigation:** Consistent Back/Next button styling and behavior

### Git Intelligence (Recent Commits)

**Recent Booking Flow Work:**
- 9ed0f53: E3-S5 Wellness Add-Ons (just completed)
- d1c39b6: E3-S4 Medical Add-Ons
- Pattern: Multi-step configurator with state persistence
- Navigation: Each step routes to next step on "Next" click
- All steps use similar page structure and component patterns

**Established Conventions:**
- Commit message format: `feat: <Story Title> (E<Epic>-S<Story> - <Points> pts)`
- Include implementation summary in commit body
- List files changed
- Note testing results

### Project Structure Notes

**Alignment with Project Structure:**
- **Route organization:** `/app/booking/configure/[step]/page.tsx` pattern
- **Component location:** Booking components in `/components/booking/`
- **Store location:** `/lib/stores/booking-store.ts` (singleton)
- **tRPC routers:** `/lib/trpc/server/routers/` with root at `_app.ts`
- **Client setup:** `/lib/trpc/client.ts` for React components

**No conflicts detected** - Trip selection fits naturally in existing configurator flow.

### References

**Source Documents:**
- [Epics File: Epic 3, Story 8](/_bmad-output/solutioning/epics-and-stories-Pickleball-Passport-2025-12-28.md#L862-L884)
- [Architecture: Database Schema](/_bmad-output/solutioning/architecture-Pickleball-Passport-2025-12-28.md#Trip Model)
- [Architecture: tRPC Patterns](/_bmad-output/solutioning/architecture-Pickleball-Passport-2025-12-28.md#API Architecture)
- [Prisma Schema: Trip Model](/prisma/schema.prisma#L245-L269)
- [Booking Store](/lib/stores/booking-store.ts)

**Related Stories:**
- E3-S1 to E3-S7: Prerequisite booking configurator steps (all completed)
- E3-S5: Wellness Add-Ons (just completed) - provides navigation entry point
- E3-S7: Booking Review (depends on trip selection)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

### File List

