---
title: "feat: Thailand Trip Detail Page + All Trips Listing"
type: feat
date: 2026-02-13
source: PP-Developer-Handoff-Complete.pdf (pages 9-18)
---

# Thailand Trip Detail Page + All Trips Listing

## Overview

Build two new pages from the developer handoff document (pages 9-18):

1. **All Trips Listing** (`/trips`) — Grid of trip cards with Thailand (active) and Coming Soon placeholders (Bali, Portugal, Japan)
2. **Thailand Trip Detail** (`/trips/thailand`) — Two-column layout with left sidebar navigation (8 sections), right sticky booking module, and full Stripe payment integration

This replaces the current `/pickleball` page's role as the primary trip browsing experience and introduces a competitor-style trip detail page modeled after Pickleball Getaways.

## Problem Statement / Motivation

The current site has no dedicated trip detail page. The `/pickleball` page shows two hardcoded package cards that link to `/apply` (an inquiry form). There's no way for a customer to:
- See detailed itinerary, accommodations, pickleball programming, or dining information
- Book and pay directly through the website
- Browse upcoming trips with clear availability

The handoff document specifies a complete trip detail page with 8 navigable sections and an always-visible booking module — the core conversion page for the business.

## Technical Approach

### Architecture Decisions

**Route structure:** New routes under `app/(marketing)/trips/`
- `app/(marketing)/trips/page.tsx` — All Trips listing
- `app/(marketing)/trips/thailand/page.tsx` — Thailand trip detail (hardcoded for now)

**Why not dynamic `[slug]`?** Content is hardcoded per user's request. When trips become database-driven later, we can refactor to `[slug]` and pull from Prisma. Starting with a static page avoids premature abstraction.

**Sidebar navigation pattern:** Use React state (not URL hash or router) to control which section is visible. This keeps the page as a single component tree with conditional rendering — simpler than 8 separate routes and matches the competitor reference (click tab, content swaps instantly, no page navigation).

**Booking module:** A self-contained client component that uses the existing Zustand booking store. It populates store state (trip selection, occupancy, pickleball option, payment plan) and redirects to `/booking/payment` for Stripe checkout. This reuses the existing `createPaymentIntent` tRPC procedure.

**Mobile adaptation:** CSS-driven responsive design using Tailwind breakpoints. Sidebar becomes horizontal scrollable tabs (`overflow-x-auto`). Booking module becomes a sticky bottom bar that expands on tap.

### Key Files to Create

```
app/(marketing)/trips/
├── page.tsx                          # All Trips listing page
└── thailand/
    └── page.tsx                      # Thailand trip detail (server component wrapper)

components/trips/
├── trip-card.tsx                     # Trip card for listing grid
├── coming-soon-card.tsx             # Coming Soon placeholder card
├── trip-detail-layout.tsx           # Two-column layout with sidebar + booking module
├── trip-sidebar-nav.tsx             # Left sidebar navigation (8 buttons)
├── trip-section-content.tsx         # Content switcher for all 8 sections
├── booking-module.tsx               # Right sticky booking module
├── booking-module-mobile.tsx        # Mobile bottom bar + expandable sheet
├── stat-bar.tsx                     # Reusable 4-box stat bar component
├── hotel-card.tsx                   # Hotel property card
├── session-table.tsx                # Pickleball session breakdown table
├── dining-section.tsx               # Dining highlights with included + optional
├── trip-faq.tsx                     # Trip-specific FAQ accordion
├── cancellation-section.tsx         # Cancellation policy display
├── travel-insurance-section.tsx     # Travel insurance recommendation
├── trip-details-section.tsx         # Trip details (stat bar + included/extras)
├── itinerary-section.tsx            # 13-day accordion itinerary
├── accommodations-section.tsx       # 3 hotel cards
└── pickleball-section.tsx           # Pickleball programming details
```

### Key Files to Modify

- `components/marketing/header.tsx` — Add "Trips" to navigation (or rename "Pickleball" link to point to `/trips`)
- `components/marketing/hero-section.tsx` — Update "Explore Thailand" CTA to link to `/trips/thailand`
- `app/(marketing)/pickleball/page.tsx` — Update CTAs to link to `/trips/thailand` instead of `/apply`

## Implementation Phases

### Phase 1: Foundation — Static Content Pages (No Booking)

**Goal:** Get all 8 content sections rendering with sidebar navigation and responsive layout. No booking module yet.

#### Tasks

1. **Create `stat-bar.tsx` component**
   - Accepts array of `{ value: string; label: string; tooltip?: string }` items
   - Renders 4 boxes in horizontal row on desktop, 2x2 grid on mobile
   - Activity Level tooltip: "5/10 — Moderate. Pickleball sessions are the most physically active part..."

2. **Create `trip-sidebar-nav.tsx` component**
   - 8 buttons: Trip Details, Itinerary, Accommodations, Pickleball, Dining, FAQ, Cancellation, Travel Insurance
   - Active button has filled/dark background, inactive are light
   - On desktop: vertical stack, sticky (`sticky top-24`)
   - On mobile: horizontal scrollable tab bar (`overflow-x-auto flex gap-2`)
   - Icons per button (use lucide-react: `Info`, `Calendar`, `Building2`, `Trophy`, `Utensils`, `HelpCircle`, `XCircle`, `Shield`)

3. **Create all 8 section content components** (hardcoded data from PDF):
   - `trip-details-section.tsx` — Stat bar (16 max group, 5/10 activity, 8-10 hrs instruction, 8-12 hrs social play) + What's Included (16 checkmark items) + Extras/Not Included (9 plus items)
   - `itinerary-section.tsx` — 13-day accordion. Each day header shows: day number, title, city name, small icon (pickleball paddle for play days, temple for culture, boat for adventure). Collapsed by default. Expanding shows morning/afternoon/evening breakdown with times.
   - `accommodations-section.tsx` — Section intro text + 3 hotel cards (Grande Centre Point Bangkok / 5 nights, Maraya Chiang Mai / 4 nights, Sole Mio Phuket / 3 nights). Each card: hotel name, city, duration badge, 5-6 bullet highlights. Stacked vertically or responsive grid.
   - `pickleball-section.tsx` — Section intro + stat bar (6 sessions, ~15 hrs, 8-10 instruction, 8-12 social) + 6-session breakdown table (session number, city, venue, time, focus description)
   - `dining-section.tsx` — Section intro + 5 included group dinners (restaurant name, description) + 6 optional Michelin upgrades (restaurant, star rating, city, ~THB/~USD price)
   - `trip-faq.tsx` — Accordion with questions: visa requirements, what to pack, fitness level expectations, dietary accommodations, tipping customs, weather/best time to visit, solo traveler info, companion/non-player questions
   - `cancellation-section.tsx` — Policy display: 60+ days = full refund minus $500 fee, 30-60 days = 50% refund, under 30 = no refund. Transfer/credit options. Straightforward and transparent.
   - `travel-insurance-section.tsx` — Recommendation text + note that PP does not provide insurance + links to suggested providers (World Nomads, Allianz, SafetyWing)

4. **Create `trip-section-content.tsx` switcher**
   - Takes `activeSection` prop (string enum of 8 sections)
   - Renders only the active section's component
   - Clean transition between sections (fade or instant swap)

5. **Create `trip-detail-layout.tsx`**
   - Two-column layout: `grid lg:grid-cols-[240px_1fr]` (sidebar + content)
   - Left column: `trip-sidebar-nav` (sticky)
   - Right column: `trip-section-content` (active section only)
   - Right sidebar placeholder for booking module (Phase 2)
   - On mobile: tabs at top, content below

6. **Create `app/(marketing)/trips/thailand/page.tsx`**
   - Server component with SEO metadata
   - Renders trip header (tag pill "Flagship Experience", headline "Thailand", subline "Bangkok . Chiang Mai . Phuket", trip summary "13 Days / 12 Nights | 3 Cities | 3 Boutique Hotels | 6 Pickleball Sessions")
   - Renders `trip-detail-layout`

7. **Create trip listing page components:**
   - `trip-card.tsx` — Active trip card: hero image area, destination name (large bold), subtitle, dates (gold/accent), price, duration badge ("13 Days / 12 Nights"), status badge + CTA button. Three states: AVAILABLE (gold BOOK NOW + optional "X ROOMS LEFT"), SOLD OUT (gray button + "JOIN WAITLIST" link), COMING SOON (muted + "Notify Me")
   - `coming-soon-card.tsx` — Muted card with destination name, "COMING SOON" badge, "Notify Me" link/button (links to newsletter signup or captures email inline)

8. **Create `app/(marketing)/trips/page.tsx`**
   - Page header: "Upcoming Trips" headline, subhead about curated lineup
   - Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
   - Thailand card (active, BOOK NOW)
   - Bali, Portugal, Japan (Coming Soon placeholders)
   - Show most imminent departures first

#### Acceptance Criteria — Phase 1
- [ ] `/trips` renders with Thailand active card + 3 Coming Soon cards
- [ ] `/trips/thailand` renders with sidebar navigation and all 8 sections
- [ ] Clicking sidebar buttons swaps content (only one section visible at a time)
- [ ] Default view is "Trip Details" section
- [ ] Mobile: sidebar becomes horizontal scrollable tabs
- [ ] Mobile: stat bars render as 2x2 grid
- [ ] Mobile: hotel cards stack vertically
- [ ] All 13 itinerary days render in accordion (collapsed by default)
- [ ] All content matches PDF exactly (copy, structure, data)
- [ ] Build passes with no errors

---

### Phase 2: Booking Module + Stripe Integration

**Goal:** Add the sticky booking module and wire it to the existing Stripe payment flow.

#### Tasks

1. **Create `booking-module.tsx`**
   - Photo carousel: 3-5 trip highlight photos (auto-rotate or swipe). Placeholder images initially. Use CSS-only carousel or lightweight approach (no heavy library).
   - **Step 1 — Tour Dates:** Dropdown of available departure windows. Fetches from `bookingTrips.getAvailableTrips` tRPC query. Sold-out dates grayed with "SOLD OUT" label. For now with TBD dates, show a single "Dates TBD — Reserve Your Spot" option.
   - **Step 2 — Room Occupancy:** Dropdown with options: Single Occupancy (premium rate), Double Occupancy (shared room, matched roommate or bring your own), Couple's Rate (two travelers, one room).
   - **Step 3 — Playing Pickleball?** Dropdown: Yes (full 6-session program, instruction, tournaments) | Travel Companion (all cultural activities, meals, hotels, adventures — no pickleball, reduced rate).
   - **Payment Toggle:** Two radio buttons: "Pay Deposit" (default, 20% to reserve) and "Pay in Full" (early booking discount — 2% off). Display helper text: "Pay a 20% deposit to reserve your spot" / "Pay in full for an early booking discount."
   - **Price Display:** Dynamic "From $X,XXX per person" — updates as occupancy/pickleball selections change. For now with TBD pricing, show "Price TBD" or a placeholder.
   - **CTA Button:** "BOOK NOW" — large, gold/branded, full-width. On click: populates Zustand booking store with selections (hardcoded packageId for Thailand, duration=13, occupancy type, pickleball boolean, payment plan), redirects to `/booking/payment` (or `/apply` as interim if payment flow isn't ready for TBD pricing).
   - **Urgency Element:** "REMAINING SPOTS: X / 16" in gold/accent text between price and button. Dynamic counter based on `trip.capacity - trip.currentBookings`.
   - **Dev notes from PDF:** If fewer than 4 spots remain, add red "Almost Full" badge. If sold out, replace BOOK NOW with orange "JOIN WAITLIST" button.

2. **Create `booking-module-mobile.tsx`**
   - Sticky bottom bar: shows price + "Book Now" button
   - Tapping expands full booking module as bottom sheet/overlay
   - Photo carousel swipeable with dot indicators on mobile

3. **Update business constants and booking store**
   - Add `13` to `VALID_DURATIONS` in `lib/config/business-constants.ts`
   - Add `DEPOSIT_20` payment plan config: `{ FIRST: 0.20, REMAINDER: 0.80 }` with remainder due 30 days before trip
   - Add `occupancy` field to Zustand booking store: `'SINGLE' | 'DOUBLE' | 'COUPLE'`
   - Add `includesPickleball` boolean to booking store (default true)
   - Update Zod validation in `createPaymentIntent` to accept duration=13 and new payment plan

4. **Wire booking module to Zustand store**
   - On "BOOK NOW" click:
     - Set `selectedPackage` (Thailand package, hardcoded ID)
     - Set `duration` (13 days)
     - Set `occupancy` based on dropdown selection
     - Set `includesPickleball` based on toggle
     - Set `paymentPlan` (FULL or DEPOSIT_20)
     - Set `selectedTrip` if a trip date was selected
   - Redirect to booking flow (existing `/booking/configure` or `/booking/payment`)

5. **Create tRPC query for trip availability** (if not already sufficient)
   - The existing `bookingTrips.getAvailableTrips` returns trips with `availableSpots` and `isAlmostFull`
   - May need a public (non-authenticated) version for the trip detail page since visitors won't be signed in yet
   - Create `publicProcedure` variant if needed

6. **Integrate booking module into `trip-detail-layout.tsx`**
   - Desktop: right column, sticky (`sticky top-24`), always visible regardless of which section is active
   - Layout becomes: `grid lg:grid-cols-[240px_1fr_340px]` (sidebar + content + booking)
   - Mobile: bottom sticky bar from `booking-module-mobile.tsx`

#### Acceptance Criteria — Phase 2
- [ ] Booking module is always visible on desktop (sticky sidebar)
- [ ] Photo carousel works (auto-rotate or manual)
- [ ] Tour dates dropdown shows available trips (or TBD placeholder)
- [ ] Room occupancy dropdown works with 3 options
- [ ] Pickleball toggle works (Yes/Travel Companion)
- [ ] Payment toggle switches between deposit and full payment
- [ ] Price updates dynamically based on selections
- [ ] "REMAINING SPOTS: X/16" shows correct count
- [ ] "Almost Full" badge appears when < 4 spots
- [ ] BOOK NOW click populates Zustand store and redirects to booking flow
- [ ] Mobile: sticky bottom bar with price + Book Now
- [ ] Mobile: tapping expands full booking module
- [ ] Mobile: photo carousel is swipeable with dot indicators

---

### Phase 3: Navigation Updates + Polish

**Goal:** Update site navigation to include trips, fix CTAs across the site, and polish responsive behavior.

#### Tasks

1. **Update header navigation**
   - Consider adding "Trips" nav item or updating "Pickleball" to link to `/trips`
   - Decision: Keep "Pickleball" linking to `/pickleball` (existing package overview page) and add `/trips` as the detail destination. The "Explore Thailand" hero CTA should go to `/trips/thailand`.

2. **Update hero section CTA**
   - Change "Explore Thailand" button to link to `/trips/thailand` instead of `/pickleball`

3. **Update pickleball page CTAs**
   - Change "Book This Trip" buttons on package cards to link to `/trips/thailand` instead of `/apply`

4. **Coming Soon "Notify Me" functionality**
   - Use existing newsletter subscription tRPC route
   - Or simple mailto link as interim
   - The Coming Soon cards should capture interest but don't need a full signup flow for MVP

5. **SEO metadata**
   - `/trips` — "Upcoming Pickleball Trips | Pickleball Passport"
   - `/trips/thailand` — "Thailand: Bangkok, Chiang Mai & Phuket | 13-Day Pickleball Trip | Pickleball Passport"
   - OpenGraph images, descriptions, canonical URLs using production domain `www.thepickleballpassport.org`

6. **Polish and edge cases**
   - Itinerary accordion day headers: add small icon per day type (pickleball paddle, temple, boat, spa) as specified in PDF dev notes
   - Activity Level stat tooltip implementation
   - Smooth scroll-to-top when switching sections on mobile
   - Test all breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)

#### Acceptance Criteria — Phase 3
- [ ] Hero CTA links to `/trips/thailand`
- [ ] Pickleball page CTAs link to `/trips/thailand`
- [ ] SEO metadata set correctly with production domain
- [ ] Coming Soon cards have working "Notify Me" action
- [ ] All responsive breakpoints tested and working
- [ ] No broken links across the site
- [ ] Build and deploy succeed

## Alternative Approaches Considered

1. **Dynamic `[slug]` route pulling from DB** — Rejected for now. Content is hardcoded per user request. Would add unnecessary DB dependency and complexity. Easy to refactor later.

2. **URL-hash-based section navigation** (`#itinerary`, `#accommodations`) — Rejected. Would cause URL changes on every tab click, pollute browser history, and the PDF specifically says "no scrolling through all sections." State-based switching is cleaner.

3. **Reuse existing `PackageDetailClient` component** — Considered but rejected. The existing component has a fundamentally different layout (two-column with markdown content) and uses emerald green color scheme. The new trip detail page needs the sidebar navigation pattern, brand colors, and custom sections. Starting fresh is less work than adapting.

4. **Full multi-step booking configurator** — The existing Zustand store supports a 5-step flow (Package → Duration → Accommodation → Add-ons → Review). The trip detail page booking module is simpler — it's a single-panel configurator that sets a few options and redirects. We use the store but skip the step-by-step wizard.

## Dependencies & Prerequisites

- **Existing infrastructure (no changes needed):**
  - Zustand booking store (`lib/stores/booking-store.ts`)
  - Stripe integration (`lib/trpc/server/routers/booking.ts`)
  - tRPC trip queries (`lib/trpc/server/routers/booking/trips.ts`)
  - Business constants (`lib/config/business-constants.ts`)
  - shadcn/ui Accordion component (already installed)

- **May need:**
  - Public (unauthenticated) trip availability query — current one uses `guestProcedure` which requires auth
  - shadcn/ui Tabs component (`npx shadcn@latest add tabs`) — for mobile tab navigation alternative
  - Placeholder images for photo carousel and trip cards

## Risk Analysis & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| TBD pricing makes booking module awkward | Medium | Show "Price TBD — Reserve Your Spot" with deposit option. Allow booking flow to handle TBD state gracefully. |
| No trip records in DB yet | High | Booking module gracefully handles zero available trips. Show "Dates Coming Soon" instead of empty dropdown. |
| Three-column layout complexity on tablet | Medium | On tablet (md breakpoint), collapse to two columns: sidebar + content, with booking module below content. Three columns only on lg+. |
| Photo carousel images don't exist | Low | Use gradient placeholder backgrounds with text overlay. Replace with real images later. |
| Existing booking flow expects multi-step configuration | Medium | The trip detail booking module populates the Zustand store directly with pre-selected values, then skips to the review/payment step. |

## Success Metrics

- Trip detail page loads in < 2s (LCP)
- Users can navigate all 8 sections without confusion
- Booking module is always visible and accessible
- Mobile experience is smooth with no layout shift
- Zero broken payment flows — BOOK NOW successfully creates a Stripe PaymentIntent

## Confirmed Decisions

These were clarified during planning and are now locked in:

| Decision | Answer | Impact |
|----------|--------|--------|
| **Room occupancy** | Same 3 hotels for all guests. Single/Double/Couple = room sharing arrangement, not hotel tier. | New `occupancy` field in booking store. Accommodation tier unused for this trip. |
| **Deposit amount** | 20% deposit (new, per PDF). Not the existing 50% installment. | New `DEPOSIT_20` payment plan in business-constants.ts. First charge = 20%, remaining 80% charged later. |
| **Trip duration** | 13 days / 12 nights (per PDF). | Add `13` to `VALID_DURATIONS`. Update Zod validation in createPaymentIntent. |
| **Group capacity** | 16 max (per PDF), up from 12. | Set `capacity: 16` on Thailand Trip records. Dynamic display via `trip.capacity`. |
| **Navigation** | Replace "Pickleball" with "Trips" in header nav, linking to `/trips`. | Old `/pickleball` page stays but leaves the nav. |
| **Pickleball toggle** | "Travel Companion" = same trip minus pickleball at reduced rate. Package variant, not add-on. | Boolean flag adjusting base price. |
| **Dates TBD** | Show "Dates Coming Soon" in dropdown, disable BOOK NOW, show Notify Me. | Graceful degradation — page works for browsing, booking waits for dates. |
| **`/trips` vs `/packages`** | Coexist. `/trips` replaces `/pickleball` in nav. `/packages` remains for configurator path. | No redirects needed. |

## References & Research

### Internal References
- Existing two-column layout pattern: `components/marketing/package-detail-client.tsx:112` (`grid lg:grid-cols-3`)
- Sticky sidebar pattern: `components/marketing/package-detail-client.tsx:168` (`sticky top-4`)
- Itinerary accordion: `components/marketing/itinerary-accordion.tsx` (AnimatePresence pattern)
- FAQ accordion: `components/marketing/package-faq.tsx` (same pattern)
- Zustand booking store: `lib/stores/booking-store.ts` (full multi-step state)
- Business constants: `lib/config/business-constants.ts` (pricing, refund policy, installments)
- Trip queries: `lib/trpc/server/routers/booking/trips.ts` (getAvailableTrips, assignTrip)
- Booking creation: `lib/trpc/server/routers/booking.ts` (createPaymentIntent — 2,883 lines)
- Brand colors: Navy `#1D2D44`, Gold `#B08D55`, Cream `#FDF8F3`/`#F5E6D3`
- Marketing page pattern: `app/(marketing)/medical-tourism/page.tsx` (section structure, wave SVGs)

### External References
- Source document: `PP-Developer-Handoff-Complete.pdf` (pages 9-18)
- Competitor reference: Pickleball Getaways trip pages (sidebar nav pattern)
- Competitor reference: Pickleball Trips (3-column grid with BOOK NOW / SOLD OUT badges)

### Existing Patterns to Follow
- Marketing pages use `'use client'` with direct Tailwind styling
- Font: `font-serif` for headings, system font for body
- Section dividers: gradient accent lines (`w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D]`)
- Card shadows: `shadow-xl shadow-[#1D2D44]/10`
- Button patterns: gold gradient for primary CTAs, navy for secondary
- Wave SVG transitions between sections
