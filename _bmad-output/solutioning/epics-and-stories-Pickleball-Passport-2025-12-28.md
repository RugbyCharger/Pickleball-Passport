---
date: 2025-12-28
author: Grant
project: Pickleball Passport
version: 1.0
status: Draft
inputDocuments:
  - 'prd-Pickleball-Passport-2025-12-28.md'
  - 'architecture-Pickleball-Passport-2025-12-28.md'
---

# Epics & User Stories: Pickleball Passport

## Document Purpose

This document breaks down the Pickleball Passport product into actionable epics and user stories for development. Each epic represents a major feature area, and stories define specific, testable units of work.

**Story Format:**
```
As a [user type],
I want to [action],
So that [benefit].

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2

Technical Notes:
- Implementation details
- Dependencies
- Edge cases

Story Points: [1, 2, 3, 5, 8, 13, 21]
Priority: [P0-Critical, P1-High, P2-Medium, P3-Low]
```

---

## Epic Overview

| Epic ID | Epic Name | Priority | Target Phase | Story Count | Estimated Points |
|---------|-----------|----------|--------------|-------------|------------------|
| **E1** | Marketing Website | P0 | Phase 1 (MVP) | 15 | 55 |
| **E2** | User Authentication | P0 | Phase 1 (MVP) | 8 | 34 |
| **E3** | Booking System | P0 | Phase 1 (MVP) | 18 | 89 |
| **E4** | Payment Processing | P0 | Phase 1 (MVP) | 12 | 55 |
| **E5** | Admin Dashboard | P1 | Phase 1 (MVP) | 10 | 34 |
| **E6** | Mobile App - Pre-Trip | P1 | Phase 2 | 12 | 55 |
| **E7** | Mobile App - During Trip | P1 | Phase 2 | 15 | 68 |
| **E8** | Mobile App - Alumni | P1 | Phase 2 | 8 | 34 |
| **E9** | Partner Portal | P1 | Phase 2 | 20 | 89 |
| **E10** | Referral System | P1 | Phase 2 | 10 | 55 |
| **E11** | Communication System | P2 | Phase 2 | 12 | 55 |
| **E12** | Content Management | P2 | Phase 3 | 8 | 34 |
| **E13** | Analytics & Reporting | P2 | Phase 3 | 10 | 44 |

**Total Stories:** 158
**Total Estimated Points:** ~700 points

**Velocity Assumptions:**
- Team of 2 developers: ~20-30 points/sprint (2 weeks)
- Phase 1 (MVP): ~200 points = 8-10 sprints (4-5 months)
- Phase 2 (Scale): ~300 points = 12-15 sprints (6-7 months)
- Phase 3 (Optimize): ~200 points = 8-10 sprints (4-5 months)

---

## EPIC 1: Marketing Website

**Goal:** Create a luxury-tier marketing website that converts visitors into applicants through transformation storytelling and social proof.

**Success Metrics:**
- Application conversion: 15-20%
- Avg time on site: >3 minutes
- Bounce rate: <40%

### Stories

#### E1-S1: Homepage Hero Section

**As a** potential guest,
**I want to** see a compelling homepage with cinematic video and clear value proposition,
**So that** I immediately understand what Pickleball Passport offers.

**Acceptance Criteria:**
- [ ] Hero section with full-screen video background (Thailand/pickleball scenes)
- [ ] Headline: "Where Pickleball Meets World-Class Wellness and Medical Care in Thailand"
- [ ] Subheadline explaining transformation tourism concept
- [ ] Primary CTA: "Begin Your Transformation" (scroll to application)
- [ ] Secondary CTA: "Explore Packages"
- [ ] Trust indicators: JCI hospital badges, testimonial count, years operating
- [ ] Video auto-plays (muted), loops
- [ ] Fallback image if video fails to load
- [ ] Mobile-responsive (video replaced with static image on mobile)

**Technical Notes:**
- Use Next.js Image component for optimization
- Host video on Mux (streaming) or S3
- Lazy load below-fold content
- Lighthouse score >90

**Story Points:** 5
**Priority:** P0

---

#### E1-S2: Package Explorer Grid

**As a** potential guest,
**I want to** browse available transformation packages,
**So that** I can find one that matches my goals.

**Acceptance Criteria:**
- [ ] Display 5 package cards: Pure Play, Smile Makeover, Total Refresh, Soul & Sport, Health Reset
- [ ] Each card shows: hero image, name, short description, duration range, price range
- [ ] "Learn More" button opens package detail page
- [ ] Hover state shows subtle shadow/scale effect
- [ ] Mobile: Stack cards vertically
- [ ] Desktop: 2-column grid (luxury spacing)
- [ ] Skeleton loading state while data fetches

**Technical Notes:**
- Fetch from Prisma (package table)
- Static generation (SSG) for performance
- Revalidate every 7 days

**Story Points:** 3
**Priority:** P0

---

#### E1-S3: Package Detail Pages

**As a** potential guest,
**I want to** see detailed information about a specific package,
**So that** I can understand what's included and decide if it's right for me.

**Acceptance Criteria:**
- [ ] Dynamic route: `/packages/[slug]`
- [ ] Hero image (full-width)
- [ ] Package name and tagline
- [ ] Detailed description (markdown rendering)
- [ ] Duration options (7/10/14/21 days)
- [ ] Price breakdown (base price + typical add-ons)
- [ ] "What's Included" section (bulleted list)
- [ ] Sample itinerary (collapsible day-by-day)
- [ ] CTA: "Apply Now" (scroll to application form)
- [ ] Related testimonials (guests who booked this package)
- [ ] FAQ section specific to package

**Technical Notes:**
- SSG with `generateStaticParams`
- Markdown rendering via `react-markdown`
- Prisma query includes package + sample itinerary + testimonials

**Story Points:** 8
**Priority:** P0

---

#### E1-S4: Testimonial Video Gallery

**As a** potential guest,
**I want to** watch video testimonials from past guests,
**So that** I can see real transformation stories and build trust.

**Acceptance Criteria:**
- [ ] Grid of video thumbnails (3 columns desktop, 1 mobile)
- [ ] Each thumbnail shows: guest name, package type, before/after badge
- [ ] Click opens modal with full video player
- [ ] Video player: Mux-powered, adaptive bitrate streaming
- [ ] Player controls: play/pause, volume, fullscreen
- [ ] Video metadata: guest name, age, location, package, date
- [ ] "Close" button exits modal
- [ ] Keyboard navigation (ESC to close, arrow keys to navigate)
- [ ] Filter by package type
- [ ] Sort by: "Most Recent", "Most Popular"

**Technical Notes:**
- Mux playback IDs stored in database
- Mux player API for custom controls
- Modal: Headless UI or Radix
- Prefetch thumbnail images

**Story Points:** 8
**Priority:** P0

---

#### E1-S5: Medical Tourism Cost Calculator

**As a** potential guest considering medical procedures,
**I want to** calculate potential cost savings,
**So that** I understand the financial value of combining medical tourism with vacation.

**Acceptance Criteria:**
- [ ] Interactive calculator UI
- [ ] Dropdown: Select procedure type (dental veneers, cosmetic dentistry, facial procedures, etc.)
- [ ] Input: Number of procedures (for things like veneers)
- [ ] Display: US cost estimate
- [ ] Display: Thailand cost estimate
- [ ] Display: Net savings (highlighted)
- [ ] Display: "Your $20K smile makeover costs $7K in Thailand. Net savings: $13K!"
- [ ] Visual comparison: Bar chart (US vs Thailand)
- [ ] CTA below: "Apply to Learn More"
- [ ] Mobile-friendly inputs (large touch targets)

**Technical Notes:**
- Hardcoded pricing data (JSON config file)
- Recharts or similar for visualizations
- Format currency properly ($XX,XXX)
- Debounce input changes

**Story Points:** 5
**Priority:** P1

---

#### E1-S6: Application Form (Multi-Step)

**As a** potential guest,
**I want to** submit an application to join Pickleball Passport,
**So that** I can start my transformation journey.

**Acceptance Criteria:**
- [ ] Multi-step form (5 steps):
  - Step 1: Basic info (name, email, phone, location)
  - Step 2: Pickleball background (skill level, frequency, home club)
  - Step 3: Transformation interests (checkboxes: dental, cosmetic, wellness, spiritual, pure play)
  - Step 4: Travel preferences (duration, dates, solo/couple, budget range)
  - Step 5: Discovery (how did you hear about us? - track referral sources)
- [ ] Progress indicator (1 of 5, 2 of 5, etc.)
- [ ] "Back" and "Next" buttons
- [ ] Form validation (Zod schema)
- [ ] Error messages inline (below fields)
- [ ] "Save & Resume Later" (stores in localStorage, sends reminder email)
- [ ] Final step: "Submit Application" button
- [ ] Success page: "We received your application. Next step: Schedule your video consultation" + Calendly embed
- [ ] Auto-create contact in HubSpot (webhook)
- [ ] Auto-send confirmation email (SendGrid)

**Technical Notes:**
- React Hook Form + Zod
- tRPC mutation: `application.create`
- Store in database (applications table)
- Trigger email via SendGrid API
- HubSpot webhook for CRM sync

**Story Points:** 13
**Priority:** P0

---

#### E1-S7: Trust & Safety Section

**As a** potential guest who is hesitant,
**I want to** see credentials, safety data, and policies,
**So that** I feel confident this is legitimate.

**Acceptance Criteria:**
- [ ] Page: `/trust-and-safety`
- [ ] Section: Hospital credentials (JCI accreditation badges, hospital rankings)
- [ ] Section: Thailand tourism safety statistics (sourced, cited)
- [ ] Section: Travel insurance details (what's covered)
- [ ] Section: Emergency support (24/7 concierge, medical liaison)
- [ ] Section: Pricing transparency (sample breakdown, refund policy)
- [ ] Section: Cancellation policy (clear terms)
- [ ] Section: Guest testimonials (trust-building quotes)
- [ ] CTA: "Ready to Apply?"
- [ ] Link from footer + navigation

**Technical Notes:**
- Static page (markdown content)
- Next.js SSG
- Embed PDF documents (accreditation certificates)

**Story Points:** 3
**Priority:** P1

---

#### E1-S8: Partner Program Landing Page

**As a** pickleball club director,
**I want to** learn about the partner program,
**So that** I can decide if I want to refer my members.

**Acceptance Criteria:**
- [ ] Page: `/partners`
- [ ] Hero: "Offer Your Members Life-Changing Experiences"
- [ ] Section: Value proposition (turnkey marketing, earn rewards, free trips)
- [ ] Section: Passport Points system (earn/redeem structure)
- [ ] Section: Tier structure (Bronze → Silver → Gold → Platinum) with benefits table
- [ ] Section: "How It Works" (3-step process)
- [ ] Section: Testimonials from existing partners
- [ ] CTA: "Become a Partner" (opens signup form)
- [ ] FAQ accordion (common questions from directors)

**Technical Notes:**
- Static page
- Partner signup form (modal or separate page)
- CRM integration (HubSpot)

**Story Points:** 5
**Priority:** P1

---

#### E1-S9: Partner Signup Form

**As a** club director,
**I want to** sign up as a partner,
**So that** I can start referring members and earning rewards.

**Acceptance Criteria:**
- [ ] Form fields: Name, email, phone, club name, club location, job title
- [ ] Checkbox: "I agree to partner terms"
- [ ] Submit creates partner profile (database)
- [ ] Auto-generates unique referral code (e.g., `VILLAGES-JEN-2025`)
- [ ] Auto-assigns Bronze tier
- [ ] Sends welcome email with onboarding instructions
- [ ] Redirects to partner portal (instant access)
- [ ] No approval required (self-service)

**Technical Notes:**
- tRPC mutation: `partner.signup`
- Generate referral code: `slugify(clubName)-${firstName}-${year}`
- Create user + partner_profile records
- SendGrid welcome email template

**Story Points:** 5
**Priority:** P1

---

#### E1-S10: SEO Optimization

**As a** search engine,
**I want to** properly index Pickleball Passport pages,
**So that** potential guests can find the site via organic search.

**Acceptance Criteria:**
- [ ] All pages have unique meta titles and descriptions
- [ ] Open Graph tags (social sharing previews)
- [ ] Twitter Card tags
- [ ] Structured data (JSON-LD): Organization, Product, Review
- [ ] Sitemap.xml generated automatically
- [ ] Robots.txt configured
- [ ] Canonical URLs set
- [ ] Alt text for all images
- [ ] Semantic HTML (proper heading hierarchy)
- [ ] Core Web Vitals optimized (Lighthouse >90)

**Technical Notes:**
- Next.js Metadata API
- next-sitemap package
- Schema.org structured data

**Story Points:** 3
**Priority:** P2

---

#### E1-S11: Email Capture & Newsletter Signup

**As a** potential guest not ready to apply,
**I want to** subscribe to updates,
**So that** I can stay informed about Pickleball Passport.

**Acceptance Criteria:**
- [ ] Footer newsletter signup form (email input + button)
- [ ] Validation: Valid email required
- [ ] Submit adds to Mailchimp/SendGrid mailing list
- [ ] Success message: "You're subscribed! Check your inbox."
- [ ] Welcome email sent immediately
- [ ] Unsubscribe link in all emails

**Technical Notes:**
- Mailchimp API or SendGrid Marketing Campaigns
- Store in database (newsletter_subscribers table)

**Story Points:** 2
**Priority:** P2

---

#### E1-S12: Mobile Navigation

**As a** mobile user,
**I want to** navigate the site easily,
**So that** I can find information quickly.

**Acceptance Criteria:**
- [ ] Hamburger menu icon (top right)
- [ ] Slide-out menu animation (smooth)
- [ ] Menu items: Home, Packages, Testimonials, Partners, Apply, Login
- [ ] Close button (X icon)
- [ ] Close on outside click
- [ ] Close on route change
- [ ] Accessible (keyboard navigation, ARIA labels)

**Technical Notes:**
- Headless UI or Radix Dialog
- Framer Motion for animations

**Story Points:** 3
**Priority:** P1

---

#### E1-S13: Contact Form

**As a** potential guest with questions,
**I want to** contact Pickleball Passport directly,
**So that** I can get answers before applying.

**Acceptance Criteria:**
- [ ] Page: `/contact`
- [ ] Form fields: Name, email, phone (optional), message
- [ ] Submit sends email to hello@pickleballpassport.com
- [ ] Auto-reply to user: "We received your message and will respond within 24 hours"
- [ ] Copy stored in database (messages table)
- [ ] reCAPTCHA to prevent spam

**Technical Notes:**
- SendGrid API for sending
- tRPC mutation: `contact.submit`
- Google reCAPTCHA v3

**Story Points:** 3
**Priority:** P2

---

#### E1-S14: Footer

**As a** site visitor,
**I want to** access important links and information in the footer,
**So that** I can navigate to legal pages and social media.

**Acceptance Criteria:**
- [ ] 4 columns: About, Packages, Legal, Contact
- [ ] About: Mission statement, team (optional)
- [ ] Packages: Links to all 5 packages
- [ ] Legal: Privacy Policy, Terms of Service, Refund Policy
- [ ] Contact: Email, phone, social media icons (Instagram, Facebook, LinkedIn)
- [ ] Newsletter signup form (embedded)
- [ ] Copyright notice
- [ ] Mobile: Stack columns vertically

**Technical Notes:**
- Shared component (layout.tsx)
- Static links

**Story Points:** 2
**Priority:** P1

---

#### E1-S15: Privacy Policy & Terms of Service

**As a** site visitor,
**I want to** read the privacy policy and terms,
**So that** I understand how my data is used.

**Acceptance Criteria:**
- [ ] Page: `/privacy`
- [ ] Page: `/terms`
- [ ] Markdown content (easy to update)
- [ ] Cover: GDPR, CCPA, data collection, cookies, third-party services
- [ ] Terms: Booking terms, cancellation policy, liability, dispute resolution
- [ ] Last updated date

**Technical Notes:**
- Markdown files in `/content` folder
- Rendered via `react-markdown`

**Story Points:** 2
**Priority:** P2

---

## EPIC 2: User Authentication

**Goal:** Secure, seamless authentication for guests, partners, and admins using Clerk.

**Success Metrics:**
- Auth success rate: >99%
- Login time: <3 seconds
- Password reset completion: >80%

### Stories

#### E2-S1: Clerk Integration Setup

**As a** developer,
**I want to** integrate Clerk authentication,
**So that** users can sign up and log in securely.

**Acceptance Criteria:**
- [ ] Clerk account created, API keys configured
- [ ] `@clerk/nextjs` package installed
- [ ] ClerkProvider wraps app
- [ ] Middleware configured (public vs protected routes)
- [ ] Environment variables set (development + production)

**Technical Notes:**
- Follow Clerk Next.js quickstart
- Configure in `layout.tsx`
- Middleware in `middleware.ts`

**Story Points:** 3
**Priority:** P0

---

#### E2-S2: Sign-Up Flow

**As a** new user,
**I want to** create an account,
**So that** I can access the booking platform or partner portal.

**Acceptance Criteria:**
- [ ] Sign-up button in navigation
- [ ] Clerk sign-up modal opens
- [ ] Options: Email/password, Google, Apple
- [ ] Email verification required
- [ ] After signup, redirect to onboarding flow (role selection: Guest or Partner)
- [ ] Create user record in database (Clerk webhook)
- [ ] Send welcome email

**Technical Notes:**
- Use Clerk's built-in UI components
- Webhook: `user.created` → create database record
- Sync user ID between Clerk and database

**Story Points:** 5
**Priority:** P0

---

#### E2-S3: Login Flow

**As a** returning user,
**I want to** log in to my account,
**So that** I can access my bookings or partner dashboard.

**Acceptance Criteria:**
- [ ] Login button in navigation
- [ ] Clerk login modal opens
- [ ] Options: Email/password, Google, Apple, magic link
- [ ] After login, redirect to appropriate dashboard (guest vs partner vs admin)
- [ ] "Remember me" checkbox (handled by Clerk)
- [ ] Session persists across tabs

**Technical Notes:**
- Clerk SignIn component
- Role-based redirect logic
- Session stored in HTTP-only cookies

**Story Points:** 3
**Priority:** P0

---

#### E2-S4: Role-Based Access Control

**As a** user,
**I want to** only access features appropriate for my role,
**So that** security is maintained.

**Acceptance Criteria:**
- [ ] Database: User role enum (GUEST, PARTNER, ADMIN)
- [ ] After signup, prompt: "Are you a guest or partner?"
- [ ] Guest role: Access to booking, member portal
- [ ] Partner role: Access to partner portal
- [ ] Admin role: Access to admin dashboard
- [ ] Middleware enforces role-based routes
- [ ] tRPC procedures check user role

**Technical Notes:**
- Store role in database (not Clerk metadata)
- Fetch role from database in tRPC context
- Middleware checks role before allowing access

**Story Points:** 5
**Priority:** P0

---

#### E2-S5: User Profile Management

**As a** logged-in user,
**I want to** view and edit my profile,
**So that** my information is up to date.

**Acceptance Criteria:**
- [ ] Page: `/profile`
- [ ] Display: Name, email, phone, profile photo
- [ ] Edit: Name, phone (email change via Clerk)
- [ ] Upload profile photo (S3 upload)
- [ ] Change password (via Clerk)
- [ ] Delete account (confirmation modal)
- [ ] Save changes button
- [ ] Success toast on save

**Technical Notes:**
- Clerk UserProfile component (built-in)
- Custom fields stored in database
- tRPC mutation: `user.update`

**Story Points:** 5
**Priority:** P1

---

#### E2-S6: Password Reset Flow

**As a** user who forgot my password,
**I want to** reset it via email,
**So that** I can regain access to my account.

**Acceptance Criteria:**
- [ ] "Forgot password?" link on login modal
- [ ] Enter email address
- [ ] Receive password reset email
- [ ] Click link in email → set new password
- [ ] Redirect to login after successful reset

**Technical Notes:**
- Clerk handles entire flow
- Customize email template (optional)

**Story Points:** 2
**Priority:** P1

---

#### E2-S7: Email Verification

**As a** new user,
**I want to** verify my email address,
**So that** my account is secure.

**Acceptance Criteria:**
- [ ] After signup, user receives verification email
- [ ] Click link in email → email verified
- [ ] Cannot access certain features until verified (e.g., booking)
- [ ] Resend verification email option

**Technical Notes:**
- Clerk handles verification flow
- Check `user.emailVerified` in protected routes

**Story Points:** 2
**Priority:** P1

---

#### E2-S8: Session Management

**As a** logged-in user,
**I want to** stay logged in across browser sessions,
**So that** I don't have to re-login frequently.

**Acceptance Criteria:**
- [ ] Session expires after 7 days of inactivity
- [ ] "Remember me" extends session to 30 days
- [ ] Logout clears session
- [ ] Session stored securely (HTTP-only cookies)
- [ ] Concurrent sessions allowed (multiple devices)

**Technical Notes:**
- Clerk manages sessions
- Configure session lifetime in Clerk dashboard

**Story Points:** 2
**Priority:** P1

---

## EPIC 3: Booking System

**Goal:** Enable guests to configure, review, and book transformation packages with ease.

**Success Metrics:**
- Configuration completion rate: >70%
- Average package value: $18K-22K
- Add-on attachment rate: >60%

### Stories

#### E3-S1: Package Configurator - Base Package Selection

**As a** guest,
**I want to** select a base transformation package,
**So that** I can start building my custom trip.

**Acceptance Criteria:**
- [ ] Page: `/booking/configure`
- [ ] Protected route (requires login)
- [ ] Display 5 package cards (visual)
- [ ] Select one package (radio button behavior)
- [ ] Show package details on selection
- [ ] Selected state: Blue border, checkmark
- [ ] "Next: Choose Duration" button (disabled until selection)

**Technical Notes:**
- Zustand store for configurator state
- tRPC query: `package.getAll`
- Persist selection to localStorage

**Story Points:** 5
**Priority:** P0

---

#### E3-S2: Package Configurator - Duration Selection

**As a** guest,
**I want to** choose the duration of my trip,
**So that** it fits my schedule.

**Acceptance Criteria:**
- [ ] Step 2 of configurator
- [ ] Options: 7, 10, 14, 21 days (buttons)
- [ ] Show sample itinerary for selected duration
- [ ] Price updates based on duration (dynamic calculation)
- [ ] "Back" and "Next: Accommodation" buttons

**Technical Notes:**
- Pricing formula: basePrice × (duration / 14)
- Fetch sample itinerary from database
- Update Zustand store

**Story Points:** 3
**Priority:** P0

---

#### E3-S3: Package Configurator - Accommodation Tier

**As a** guest,
**I want to** choose my accommodation tier,
**So that** my trip matches my luxury preferences.

**Acceptance Criteria:**
- [ ] Step 3 of configurator
- [ ] Options: Luxury (Four Seasons), Ultra-Luxury (Aman), Villa (private)
- [ ] Each option shows: Photo, description, price difference
- [ ] Selected tier highlighted
- [ ] Price updates dynamically
- [ ] "Back" and "Next: Add-Ons" buttons

**Technical Notes:**
- Pricing: Luxury +$0, Ultra-Luxury +$3K, Villa +$5K
- Images from S3 bucket

**Story Points:** 3
**Priority:** P0

---

#### E3-S4: Package Configurator - Medical/Cosmetic Add-Ons

**As a** guest,
**I want to** add medical or cosmetic procedures,
**So that** I can customize my transformation.

**Acceptance Criteria:**
- [ ] Step 4 of configurator
- [ ] Categories: Dental, Facial Cosmetic, Body, Health Screening
- [ ] Each add-on shows: Name, description, price
- [ ] Multi-select (checkboxes)
- [ ] Price updates as add-ons selected
- [ ] Show "Estimated US cost" vs "Thailand cost" (savings calculator)
- [ ] "Skip Add-Ons" option (for Pure Play packages)
- [ ] "Back" and "Next: Wellness" buttons

**Technical Notes:**
- Fetch add-ons from database (addon_types table)
- Filter by category
- Calculate savings: US price - Thailand price

**Story Points:** 8
**Priority:** P0

---

#### E3-S5: Package Configurator - Wellness & Cultural Add-Ons

**As a** guest,
**I want to** add wellness treatments and cultural experiences,
**So that** my trip is holistic.

**Acceptance Criteria:**
- [ ] Step 5 of configurator
- [ ] Categories: Spa, Yoga/Meditation, Cultural, Pickleball
- [ ] Multi-select add-ons
- [ ] Price updates dynamically
- [ ] "Back" and "Next: Review" buttons

**Technical Notes:**
- Similar to medical add-ons
- Different categories

**Story Points:** 5
**Priority:** P0

---

#### E3-S6: Package Configurator - Pricing Summary (Sticky)

**As a** guest,
**I want to** see the current total price at all times,
**So that** I know what I'm paying.

**Acceptance Criteria:**
- [ ] Sticky sidebar (desktop) or bottom bar (mobile)
- [ ] Shows: Base price, add-on prices (itemized), total price
- [ ] Updates in real-time as selections change
- [ ] Comparison: "Your total: $18,500" vs "US cost: $32,000" → "You save: $13,500"
- [ ] CTA: "Review Booking" (proceeds to review page)

**Technical Notes:**
- Zustand store calculates total
- Sticky positioning (CSS)

**Story Points:** 3
**Priority:** P0

---

#### E3-S7: Booking Review Page

**As a** guest,
**I want to** review my full booking before payment,
**So that** I can confirm everything is correct.

**Acceptance Criteria:**
- [ ] Page: `/booking/review`
- [ ] Display: Package name, duration, accommodation tier
- [ ] Display: All selected add-ons (bulleted list)
- [ ] Display: Sample itinerary (day-by-day summary)
- [ ] Display: Pricing breakdown (base + add-ons + total)
- [ ] Display: "What's Included" section
- [ ] Display: "What's NOT Included" section
- [ ] Edit buttons (go back to configurator)
- [ ] CTA: "Proceed to Payment"
- [ ] Save booking draft (database)

**Technical Notes:**
- tRPC mutation: `booking.createDraft` (status: DRAFT)
- Fetch itinerary based on package + duration
- Allow edits without losing data

**Story Points:** 5
**Priority:** P0

---

#### E3-S8: Trip Selection (Choose Departure Date)

**As a** guest,
**I want to** choose which trip I'm booking,
**So that** I can select a departure date that works for me.

**Acceptance Criteria:**
- [ ] After package configuration, show available trips
- [ ] Display: Trip name, destination, start date, end date, availability (X/12 spots)
- [ ] Filter: "Show only trips with availability"
- [ ] Sort: By start date
- [ ] Select trip (radio button)
- [ ] If trip fully booked, show "Fully Booked" badge (cannot select)
- [ ] "Next: Review" button

**Technical Notes:**
- tRPC query: `trip.getAvailable`
- Filter where `currentBookings < capacity`
- Associate booking with tripId

**Story Points:** 5
**Priority:** P0

---

#### E3-S9: Guest Profile Completion (Before Booking)

**As a** first-time guest,
**I want to** complete my profile,
**So that** my booking has all necessary information.

**Acceptance Criteria:**
- [ ] Required before booking confirmation
- [ ] Form fields:
  - Age (number)
  - Location (text)
  - Pickleball skill level (dropdown: Recreational, Intermediate, Advanced)
  - Pickleball frequency (e.g., "3x per week")
  - Dietary restrictions (multi-select: Vegetarian, Vegan, Gluten-Free, Allergies)
  - Emergency contact (name, phone, relationship)
- [ ] Validation: All fields required
- [ ] Save to guest_profile table
- [ ] "Save & Continue to Payment" button

**Technical Notes:**
- tRPC mutation: `user.completeGuestProfile`
- Conditional render: Only show if profile incomplete

**Story Points:** 5
**Priority:** P0

---

#### E3-S10: Booking Confirmation Page

**As a** guest who completed payment,
**I want to** see a confirmation page,
**So that** I know my booking is successful.

**Acceptance Criteria:**
- [ ] Page: `/booking/confirmation?id={bookingId}`
- [ ] Display: Booking reference number (unique)
- [ ] Display: Trip details (destination, dates, package)
- [ ] Display: Pricing summary
- [ ] Display: Payment status (paid in full or installment schedule)
- [ ] Display: Next steps (checklist):
  - [ ] Schedule medical consultation
  - [ ] Book flights
  - [ ] Download mobile app
  - [ ] Join pre-trip group chat
- [ ] CTA: "Access Member Portal"
- [ ] CTA: "Download Booking Summary (PDF)"
- [ ] Confetti animation on load (celebration!)

**Technical Notes:**
- tRPC query: `booking.getById`
- Generate PDF (puppeteer or react-pdf)
- Send confirmation email (SendGrid)

**Story Points:** 8
**Priority:** P0

---

#### E3-S11: Guest Dashboard (My Bookings)

**As a** guest with bookings,
**I want to** see all my bookings,
**So that** I can manage my trips.

**Acceptance Criteria:**
- [ ] Page: `/dashboard`
- [ ] Protected route (guest role required)
- [ ] List all bookings: Upcoming, Past, Cancelled
- [ ] Each booking card shows: Trip name, dates, status, total price
- [ ] Upcoming trips: Countdown timer ("42 days until your transformation!")
- [ ] Click booking → Booking details page
- [ ] Empty state: "No bookings yet. Explore packages."

**Technical Notes:**
- tRPC query: `booking.getMyBookings`
- Group by status
- Sort upcoming by start date (ASC)

**Story Points:** 5
**Priority:** P0

---

#### E3-S12: Booking Details Page

**As a** guest,
**I want to** view full details of a specific booking,
**So that** I can see my itinerary and payment schedule.

**Acceptance Criteria:**
- [ ] Page: `/booking/{id}`
- [ ] Display: Trip details, package, add-ons, pricing
- [ ] Display: Itinerary (day-by-day, expandable)
- [ ] Display: Payment schedule (if installment plan)
- [ ] Display: Payment history (completed payments)
- [ ] CTA: "Download Itinerary (PDF)"
- [ ] CTA: "Cancel Booking" (shows refund policy modal)
- [ ] CTA: "Contact Concierge"

**Technical Notes:**
- tRPC query: `booking.getById`
- Include: trip, addons, payments, itinerary
- PDF generation

**Story Points:** 8
**Priority:** P0

---

#### E3-S13: Booking Cancellation Flow

**As a** guest who needs to cancel,
**I want to** cancel my booking,
**So that** I can receive a refund per the cancellation policy.

**Acceptance Criteria:**
- [ ] "Cancel Booking" button on booking details page
- [ ] Modal: "Are you sure? This action cannot be undone."
- [ ] Display refund policy (time-based):
  - >60 days before trip: 100% refund minus $500 fee
  - 30-60 days: 50% refund
  - <30 days: Non-refundable (can reschedule once)
- [ ] Calculate refund amount based on current date
- [ ] Display: "You will receive $X back"
- [ ] Confirm cancellation button
- [ ] Process refund via Stripe
- [ ] Update booking status: CANCELLED
- [ ] Send cancellation confirmation email

**Technical Notes:**
- tRPC mutation: `booking.cancel`
- Stripe refund API
- Calculate days until trip: `trip.startDate - Date.now()`

**Story Points:** 8
**Priority:** P1

---

#### E3-S14: Booking Rescheduling

**As a** guest who needs to reschedule,
**I want to** move my booking to a different trip,
**So that** I don't lose my deposit.

**Acceptance Criteria:**
- [ ] "Reschedule Booking" button (if eligible)
- [ ] Eligibility: <30 days before trip, first reschedule only
- [ ] Show available future trips
- [ ] Select new trip
- [ ] If new trip price differs, show price adjustment (charge or credit)
- [ ] Confirm reschedule
- [ ] Update booking: tripId, adjustedPrice
- [ ] Send reschedule confirmation email

**Technical Notes:**
- tRPC mutation: `booking.reschedule`
- Track reschedule count (max 1)

**Story Points:** 8
**Priority:** P2

---

#### E3-S15: Referral Code Application (At Booking)

**As a** guest who was referred by a partner,
**I want to** apply a referral code at booking,
**So that** the partner gets credit.

**Acceptance Criteria:**
- [ ] Optional field on review page: "Referral Code"
- [ ] Validate code against database (partner_profiles.referralCode)
- [ ] If valid: Display "Referred by {partner name} at {club name}"
- [ ] If invalid: Show error "Invalid referral code"
- [ ] Store referredBy (partnerId) on booking
- [ ] Award points to partner after booking confirmed

**Technical Notes:**
- tRPC query: `partner.validateReferralCode`
- Case-insensitive matching

**Story Points:** 3
**Priority:** P1

---

#### E3-S16: Booking Modification (Change Add-Ons)

**As a** guest before my trip,
**I want to** add or remove add-ons,
**So that** I can adjust my experience.

**Acceptance Criteria:**
- [ ] "Modify Booking" button (if >60 days before trip)
- [ ] Re-open configurator with current selections
- [ ] Allow changes to add-ons only (cannot change base package)
- [ ] Recalculate total price
- [ ] If price increases: Charge difference
- [ ] If price decreases: Issue credit (future use)
- [ ] Confirm changes
- [ ] Send modification confirmation email

**Technical Notes:**
- tRPC mutation: `booking.modify`
- Stripe payment adjustment

**Story Points:** 8
**Priority:** P2

---

#### E3-S17: Companion Booking (Bring a Friend/Spouse)

**As a** guest,
**I want to** book for my spouse/friend in the same trip,
**So that** we can travel together.

**Acceptance Criteria:**
- [ ] During configuration: "Add Companion" toggle
- [ ] If enabled: Fields for companion info (name, email, package selection)
- [ ] Companion can have different package/add-ons
- [ ] Shared accommodation option (couple): No additional charge
- [ ] Separate rooms option: Each pays accommodation
- [ ] Both bookings linked in database (companionBookingId)
- [ ] Both receive confirmation emails

**Technical Notes:**
- Create 2 bookings with linkage
- Discount logic for shared accommodation

**Story Points:** 8
**Priority:** P2

---

#### E3-S18: Gift Booking (Purchase for Someone Else)

**As a** adult child,
**I want to** purchase a trip as a gift for my parent,
**So that** they can enjoy a transformation experience.

**Acceptance Criteria:**
- [ ] During configuration: "This is a gift" toggle
- [ ] If enabled: Fields for recipient info (name, email, phone)
- [ ] Purchaser (logged-in user) pays
- [ ] Recipient receives gift notification email
- [ ] Recipient can accept gift (creates their account)
- [ ] Booking transferred to recipient account
- [ ] Gift message option (custom text)

**Technical Notes:**
- Booking initially assigned to purchaser
- Transfer ownership after acceptance
- Gift notification email template

**Story Points:** 8
**Priority:** P3

---

## EPIC 4: Payment Processing

**Goal:** Secure, flexible payment processing supporting full payments, installments, and financing.

**Success Metrics:**
- Payment success rate: >95%
- Installment completion rate: >95%
- Fraud rate: <0.5%

### Stories

#### E4-S1: Stripe Integration Setup

**As a** developer,
**I want to** integrate Stripe for payment processing,
**So that** guests can pay securely.

**Acceptance Criteria:**
- [ ] Stripe account created (production + test mode)
- [ ] `@stripe/stripe-js` and `@stripe/react-stripe-js` installed
- [ ] Stripe API keys configured (environment variables)
- [ ] Stripe webhook endpoint created
- [ ] Webhook secret configured

**Technical Notes:**
- Follow Stripe integration guide
- Test mode for development
- Production mode for live bookings

**Story Points:** 3
**Priority:** P0

---

#### E4-S2: Payment Intent Creation

**As a** guest ready to pay,
**I want to** initiate payment,
**So that** I can complete my booking.

**Acceptance Criteria:**
- [ ] After booking review, guest proceeds to payment page
- [ ] Backend creates Stripe PaymentIntent
- [ ] Amount: Booking total (in cents)
- [ ] Currency: USD
- [ ] Metadata: bookingId, guestEmail
- [ ] Return client_secret to frontend
- [ ] Create payment record in database (status: PENDING)

**Technical Notes:**
- tRPC mutation: `payment.createIntent`
- PaymentService.createPaymentIntent()
- Store stripePaymentIntentId

**Story Points:** 5
**Priority:** P0

---

#### E4-S3: Credit Card Payment Form

**As a** guest,
**I want to** enter my credit card details,
**So that** I can pay for my booking.

**Acceptance Criteria:**
- [ ] Page: `/booking/payment?bookingId={id}`
- [ ] Display: Booking summary (package, price)
- [ ] Stripe Elements embedded (CardElement or PaymentElement)
- [ ] Fields: Card number, expiry, CVC, ZIP (Stripe handles)
- [ ] "Pay Now" button
- [ ] Loading state during payment processing
- [ ] 3D Secure authentication (if required)
- [ ] Success: Redirect to confirmation page
- [ ] Error: Display error message (e.g., "Card declined")

**Technical Notes:**
- Use Stripe Elements
- Handle `stripe.confirmPayment()`
- Return URL: `/booking/confirmation?id={bookingId}`

**Story Points:** 8
**Priority:** P0

---

#### E4-S4: Payment Success Webhook

**As a** system,
**I want to** receive payment success notifications from Stripe,
**So that** I can update booking status.

**Acceptance Criteria:**
- [ ] Webhook endpoint: `/api/webhooks/stripe`
- [ ] Listen for: `payment_intent.succeeded`
- [ ] Verify webhook signature (security)
- [ ] Update payment status: SUCCEEDED
- [ ] Update booking status: CONFIRMED (if fully paid)
- [ ] Award partner points (if referredBy exists)
- [ ] Send booking confirmation email
- [ ] Log event to database

**Technical Notes:**
- Stripe webhook handler
- PaymentService.handleWebhookEvent()
- Idempotency (handle duplicate events)

**Story Points:** 5
**Priority:** P0

---

#### E4-S5: Payment Failure Handling

**As a** system,
**I want to** handle failed payments gracefully,
**So that** guests are notified and can retry.

**Acceptance Criteria:**
- [ ] Listen for: `payment_intent.payment_failed`
- [ ] Update payment status: FAILED
- [ ] Send failure email (with retry link)
- [ ] Display user-friendly error message
- [ ] Retry options: Update payment method, try different card

**Technical Notes:**
- Webhook event: `payment_intent.payment_failed`
- Email template for failures

**Story Points:** 3
**Priority:** P0

---

#### E4-S6: Installment Plan Selection

**As a** guest,
**I want to** choose an installment plan,
**So that** I can spread payments over time.

**Acceptance Criteria:**
- [ ] On payment page: Option to choose payment plan
- [ ] Options: Pay in Full (2% discount), 4 Installments, Financing (Affirm)
- [ ] Display installment schedule:
  - 50% today (deposit)
  - 25% at 60 days before trip
  - 15% at 30 days before trip
  - 10% at 7 days before trip
- [ ] If installment selected: Charge first installment immediately
- [ ] Schedule remaining installments in database

**Technical Notes:**
- Calculate installment amounts
- Create 4 payment records (status: PENDING, scheduled dates)
- Charge first installment via PaymentIntent

**Story Points:** 8
**Priority:** P0

---

#### E4-S7: Automated Installment Charging

**As a** system,
**I want to** automatically charge scheduled installments,
**So that** guests don't have to manually pay.

**Acceptance Criteria:**
- [ ] Background job (daily at 9 AM): Check for due payments
- [ ] Find payments where `scheduledDate <= today` and `status = PENDING`
- [ ] Charge using stored payment method (Stripe customer)
- [ ] If success: Update payment status: SUCCEEDED
- [ ] If failure: Retry 3 times over 7 days
- [ ] If all retries fail: Send notification to guest + admin
- [ ] Send receipt email after each successful installment

**Technical Notes:**
- BullMQ job queue
- Stripe PaymentIntent with saved payment method
- Retry logic with exponential backoff

**Story Points:** 13
**Priority:** P0

---

#### E4-S8: Installment Payment Reminders

**As a** guest on an installment plan,
**I want to** receive reminders before payments are charged,
**So that** I'm not surprised.

**Acceptance Criteria:**
- [ ] Email reminder 7 days before scheduled payment
- [ ] Content: Amount, date, booking details
- [ ] CTA: "Update Payment Method" (if needed)
- [ ] SMS reminder 1 day before (optional)

**Technical Notes:**
- Background job: Find payments with `scheduledDate - 7 days = today`
- SendGrid email template
- Twilio SMS (optional)

**Story Points:** 3
**Priority:** P1

---

#### E4-S9: Affirm/Klarna Financing Integration

**As a** guest who needs financing,
**I want to** apply for payment plans through Affirm or Klarna,
**So that** I can afford the trip.

**Acceptance Criteria:**
- [ ] On payment page: "Finance with Affirm" button
- [ ] Redirect to Affirm checkout
- [ ] Guest completes credit application
- [ ] If approved: Payment processed via Affirm
- [ ] Return to confirmation page
- [ ] If declined: Return to payment page (try different method)

**Technical Notes:**
- Affirm or Klarna SDK
- Stripe supports Affirm (easier integration)
- Affirm handles installments (not in our system)

**Story Points:** 8
**Priority:** P1

---

#### E4-S10: Refund Processing

**As a** guest who cancelled,
**I want to** receive my refund,
**So that** I get my money back.

**Acceptance Criteria:**
- [ ] After cancellation confirmed, process refund
- [ ] Refund via Stripe Refunds API
- [ ] Refund amount based on policy (calculated earlier)
- [ ] Refund to original payment method
- [ ] Create refund record in database
- [ ] Send refund confirmation email
- [ ] Refund processing time: 5-10 business days (Stripe standard)

**Technical Notes:**
- Stripe `refund.create()`
- Update payment status: REFUNDED

**Story Points:** 5
**Priority:** P1

---

#### E4-S11: Payment History (Guest View)

**As a** guest,
**I want to** see all my payments,
**So that** I can track what I've paid.

**Acceptance Criteria:**
- [ ] On booking details page: "Payment History" section
- [ ] List all payments: Date, amount, status, method
- [ ] Download receipt (PDF) for each payment
- [ ] Show outstanding balance (if installments remain)
- [ ] Next payment due date (if applicable)

**Technical Notes:**
- tRPC query: `payment.getByBooking`
- Generate PDF receipts

**Story Points:** 5
**Priority:** P1

---

#### E4-S12: Update Payment Method

**As a** guest on an installment plan,
**I want to** update my payment method,
**So that** future charges succeed.

**Acceptance Criteria:**
- [ ] On dashboard: "Update Payment Method" button
- [ ] Stripe Elements (update credit card)
- [ ] Save new payment method to Stripe customer
- [ ] Update default payment method
- [ ] Confirmation message: "Payment method updated successfully"

**Technical Notes:**
- Stripe SetupIntent (for saving payment method)
- Update customer default source

**Story Points:** 5
**Priority:** P1

---

## EPIC 5: Admin Dashboard

**Goal:** Provide internal team (Jaron, Ryan, Grant) with tools to manage bookings, guests, partners, and operations.

**Success Metrics:**
- Operations checklist completion: 100% (7 days before trip)
- Booking management efficiency: <5 min per booking
- Data accuracy: >99%

### Stories

#### E5-S1: Admin Authentication & Access Control

**As an** admin,
**I want to** log in to the admin dashboard,
**So that** I can manage the platform.

**Acceptance Criteria:**
- [ ] Page: `/admin`
- [ ] Protected route (ADMIN role required)
- [ ] Redirect to login if not authenticated
- [ ] Redirect to guest dashboard if GUEST role
- [ ] Simple password protection (additional layer beyond Clerk)

**Technical Notes:**
- Middleware checks: `user.role === 'ADMIN'`
- Optional: IP whitelist for extra security

**Story Points:** 3
**Priority:** P1

---

#### E5-S2: Admin Dashboard Homepage

**As an** admin,
**I want to** see key metrics at a glance,
**So that** I can monitor platform health.

**Acceptance Criteria:**
- [ ] Display key metrics:
  - Total bookings (all-time)
  - Upcoming trips (next 90 days)
  - Total revenue (year-to-date)
  - Active partners (generated ≥1 referral)
  - Applications this month
  - Average package value
- [ ] Charts: Bookings over time, revenue by package type
- [ ] Alerts: Upcoming trips needing attention, failed payments

**Technical Notes:**
- tRPC query: `admin.getDashboardMetrics`
- Recharts for visualizations

**Story Points:** 8
**Priority:** P1

---

#### E5-S3: Bookings Management Table

**As an** admin,
**I want to** view all bookings in a table,
**So that** I can manage them efficiently.

**Acceptance Criteria:**
- [ ] Page: `/admin/bookings`
- [ ] Table columns: Booking ID, Guest Name, Trip, Package, Status, Total Price, Booked Date
- [ ] Search: By guest name, booking ID, trip
- [ ] Filter: By status (Pending, Confirmed, Completed, Cancelled)
- [ ] Sort: By date, price, status
- [ ] Pagination: 50 per page
- [ ] Click row → Booking details modal

**Technical Notes:**
- tRPC query: `admin.getBookings`
- TanStack Table for sorting/filtering

**Story Points:** 8
**Priority:** P1

---

#### E5-S4: Booking Detail Modal (Admin)

**As an** admin,
**I want to** view full booking details,
**So that** I can review guest information and trip details.

**Acceptance Criteria:**
- [ ] Modal: Full booking details (guest, trip, package, add-ons, payments)
- [ ] Guest contact info (email, phone)
- [ ] Payment status (paid, pending installments)
- [ ] Actions:
  - Send email to guest
  - Update booking status
  - Issue refund
  - Download booking PDF
- [ ] Operations checklist (for upcoming trips):
  - [ ] Medical appointments confirmed
  - [ ] Hotels booked
  - [ ] Transportation arranged
  - [ ] Welcome packet prepared
  - [ ] Group chat created
  - [ ] Photographer scheduled

**Technical Notes:**
- tRPC query: `booking.getById` (admin version includes sensitive data)
- Actions trigger tRPC mutations

**Story Points:** 8
**Priority:** P1

---

#### E5-S5: Trips Management

**As an** admin,
**I want to** create and manage trips,
**So that** guests can book them.

**Acceptance Criteria:**
- [ ] Page: `/admin/trips`
- [ ] Table: All trips (past, upcoming, future)
- [ ] Create trip button → form:
  - Name (e.g., "Thailand Transformation - March 2026")
  - Destination (e.g., "Bangkok & Phuket")
  - Start date, end date
  - Capacity (default 12)
  - Status (Scheduled, Confirmed, In Progress, Completed)
- [ ] Edit trip (same form)
- [ ] Delete trip (confirmation, only if no bookings)
- [ ] View bookings for trip (linked table)

**Technical Notes:**
- tRPC mutations: `trip.create`, `trip.update`, `trip.delete`
- Prevent deletion if bookings exist

**Story Points:** 8
**Priority:** P1

---

#### E5-S6: Guest Directory

**As an** admin,
**I want to** view all guests,
**So that** I can manage user accounts.

**Acceptance Criteria:**
- [ ] Page: `/admin/guests`
- [ ] Table: Guest name, email, phone, location, bookings count, total spent
- [ ] Search: By name, email
- [ ] Filter: By pickleball skill, transformation interests
- [ ] Click guest → Guest profile modal
- [ ] Actions: Send email, view bookings, deactivate account

**Technical Notes:**
- tRPC query: `admin.getGuests`
- Include aggregate data (bookings count, total spent)

**Story Points:** 5
**Priority:** P1

---

#### E5-S7: Partner Directory

**As an** admin,
**I want to** view all partners,
**So that** I can manage partnerships.

**Acceptance Criteria:**
- [ ] Page: `/admin/partners`
- [ ] Table: Partner name, club, referrals sent, bookings generated, points balance, tier
- [ ] Search: By name, club
- [ ] Filter: By tier, activity status
- [ ] Click partner → Partner profile modal
- [ ] Actions: Award bonus points, send email, adjust tier manually

**Technical Notes:**
- tRPC query: `admin.getPartners`
- Include referral statistics

**Story Points:** 5
**Priority:** P1

---

#### E5-S8: Applications Review

**As an** admin,
**I want to** review new applications,
**So that** I can follow up with potential guests.

**Acceptance Criteria:**
- [ ] Page: `/admin/applications`
- [ ] Table: Applicant name, email, interests, budget, submitted date, status
- [ ] Status: New, Contacted, Consultation Scheduled, Converted, Declined
- [ ] Actions:
  - Mark as contacted
  - Schedule consultation (Calendly link)
  - Convert to guest (if booked)
  - Decline
  - Send follow-up email
- [ ] Filter: By status, date range

**Technical Notes:**
- tRPC query: `admin.getApplications`
- Update status mutations

**Story Points:** 8
**Priority:** P1

---

#### E5-S9: Financial Dashboard

**As an** admin,
**I want to** view revenue and payment data,
**So that** I can track business performance.

**Acceptance Criteria:**
- [ ] Page: `/admin/financials`
- [ ] Metrics:
  - Total revenue (all-time, YTD, MTD)
  - Revenue by package type (pie chart)
  - Revenue by month (line chart)
  - Average booking value
  - Outstanding balance (pending installments)
- [ ] Table: All payments (date, booking, amount, status)
- [ ] Export CSV

**Technical Notes:**
- tRPC query: `admin.getFinancials`
- Recharts for visualizations
- CSV export via `json2csv`

**Story Points:** 8
**Priority:** P2

---

#### E5-S10: Content Moderation (Testimonials)

**As an** admin,
**I want to** review and approve testimonials,
**So that** only quality content is published.

**Acceptance Criteria:**
- [ ] Page: `/admin/testimonials`
- [ ] Table: Testimonials with status (Draft, Approved, Published)
- [ ] Filter: By type (Video, Written, Photo), status
- [ ] Preview testimonial (video player, text display)
- [ ] Actions:
  - Approve (changes status to Approved)
  - Publish (changes status to Published, shows on website)
  - Reject (delete or request revision)
  - Edit content (minor fixes)

**Technical Notes:**
- tRPC query: `admin.getTestimonials`
- Status workflow: Draft → Approved → Published

**Story Points:** 5
**Priority:** P2

---

## EPIC 6: Mobile App - Pre-Trip

**Goal:** Provide guests with a pre-trip dashboard to prepare for their transformation journey.

**Success Metrics:**
- App download rate: >90% of guests
- Checklist completion: >85%
- Pre-trip engagement: >60%

### Stories

#### E6-S1: Mobile App Scaffolding (Expo)

**As a** developer,
**I want to** set up the React Native mobile app,
**So that** we can build mobile features.

**Acceptance Criteria:**
- [ ] Initialize Expo app
- [ ] Setup navigation (Expo Router)
- [ ] Configure TypeScript
- [ ] Install dependencies (tRPC client, React Query, NativeWind)
- [ ] Setup environment variables
- [ ] Configure Expo EAS (build service)

**Technical Notes:**
- `npx create-expo-app`
- Expo Router for file-based routing
- NativeWind (Tailwind for React Native)

**Story Points:** 5
**Priority:** P1

---

#### E6-S2: Mobile App Authentication

**As a** guest,
**I want to** log in to the mobile app,
**So that** I can access my trip information.

**Acceptance Criteria:**
- [ ] Login screen
- [ ] Email/password login (Clerk)
- [ ] Biometric login (Face ID, Touch ID, Fingerprint)
- [ ] "Remember me" persists session
- [ ] Logout clears session

**Technical Notes:**
- Expo Clerk integration
- `expo-local-authentication` for biometrics

**Story Points:** 5
**Priority:** P1

---

#### E6-S3: Pre-Trip Dashboard (Countdown)

**As a** guest before my trip,
**I want to** see a countdown to my departure,
**So that** I can track how much time I have to prepare.

**Acceptance Criteria:**
- [ ] Home screen shows countdown: "42 days until your transformation!"
- [ ] Visual: Circular progress bar
- [ ] Motivational message (changes as date approaches)
- [ ] Tap countdown → Trip details

**Technical Notes:**
- Calculate days: `trip.startDate - Date.now()`
- Use `react-native-svg` for progress circle

**Story Points:** 3
**Priority:** P1

---

#### E6-S4: Pre-Trip Checklist

**As a** guest,
**I want to** see a pre-trip checklist,
**So that** I complete all necessary preparations.

**Acceptance Criteria:**
- [ ] Checklist items:
  - [ ] Complete health questionnaire
  - [ ] Upload passport copy
  - [ ] Book international flights
  - [ ] Obtain travel insurance proof
  - [ ] Join group chat
  - [ ] Schedule medical consultation
  - [ ] Review packing list
  - [ ] Download offline itinerary
- [ ] Check/uncheck items
- [ ] Progress bar: "3 of 8 completed"
- [ ] Push notification reminders for incomplete items

**Technical Notes:**
- Store checklist state in database (guest_profile.pretrip_checklist JSON)
- tRPC mutation: `user.updateChecklist`

**Story Points:** 5
**Priority:** P1

---

#### E6-S5: Document Upload (Passport)

**As a** guest,
**I want to** upload my passport copy,
**So that** the team has necessary travel documents.

**Acceptance Criteria:**
- [ ] Checklist item: "Upload passport copy"
- [ ] Tap → Open camera or photo library
- [ ] Take photo or select existing
- [ ] Preview image
- [ ] Confirm upload
- [ ] Upload to S3 (`users/{userId}/documents/passport.pdf`)
- [ ] Mark checklist item complete
- [ ] Admin can view uploaded document

**Technical Notes:**
- `expo-image-picker` for camera/library access
- S3 presigned URL upload
- File compression before upload

**Story Points:** 5
**Priority:** P1

---

#### E6-S6: Group Introduction (Meet Your Fellow Travelers)

**As a** guest,
**I want to** see who else is on my trip,
**So that** I can start building connections before arrival.

**Acceptance Criteria:**
- [ ] "Meet Your Fellow Travelers" section
- [ ] List all guests on same trip (opt-in only)
- [ ] Each guest profile shows: Name, age, hometown, fun fact (optional)
- [ ] Privacy toggle: "Share my profile with trip-mates"
- [ ] Empty state: "Profiles will appear as guests opt-in"

**Technical Notes:**
- tRPC query: `trip.getGuestsByTrip` (filtered by privacy setting)
- Profile opt-in stored in guest_profile.share_profile

**Story Points:** 5
**Priority:** P1

---

#### E6-S7: Pre-Trip Group Chat

**As a** guest,
**I want to** chat with fellow travelers before the trip,
**So that** we can introduce ourselves and plan together.

**Acceptance Criteria:**
- [ ] "Group Chat" tab (bottom navigation)
- [ ] Real-time chat (all guests on same trip)
- [ ] Send text messages
- [ ] Send photos (from camera or library)
- [ ] Emoji reactions
- [ ] See who's typing indicator
- [ ] Push notifications for new messages
- [ ] Mute notifications toggle

**Technical Notes:**
- Supabase Realtime or Pusher
- Messages stored in `messages` table (tripId filter)
- OneSignal for push notifications

**Story Points:** 13
**Priority:** P1

---

#### E6-S8: Packing List

**As a** guest,
**I want to** see a suggested packing list,
**So that** I don't forget important items.

**Acceptance Criteria:**
- [ ] Checklist item: "Review packing list"
- [ ] Tap → Opens packing list
- [ ] Categories: Essentials, Pickleball Gear, Medical Prep, Cultural, Optional
- [ ] Each category has items (checkboxes)
- [ ] Check off items as packed
- [ ] Custom items: Add your own
- [ ] Download as PDF option

**Technical Notes:**
- Hardcoded default packing list (JSON)
- Custom items stored in database

**Story Points:** 5
**Priority:** P2

---

#### E6-S9: Flight Booking Assistance

**As a** guest,
**I want to** get help booking flights,
**So that** I arrive on time.

**Acceptance Criteria:**
- [ ] Checklist item: "Book international flights"
- [ ] Tap → Shows recommended flight info:
  - Arrival airport: Suvarnabhumi Airport (BKK)
  - Recommended arrival date/time
  - Recommended departure date/time
- [ ] Links to flight search (Google Flights, Skyscanner)
- [ ] Once booked: "Upload flight confirmation" (optional)

**Technical Notes:**
- Static content (departure dates based on trip)
- Deep links to flight search apps

**Story Points:** 3
**Priority:** P2

---

#### E6-S10: Medical Consultation Scheduling

**As a** guest with medical add-ons,
**I want to** schedule my pre-trip medical consultation,
**So that** I can discuss procedures with the hospital.

**Acceptance Criteria:**
- [ ] Checklist item: "Schedule medical consultation"
- [ ] Tap → Opens Calendly embed (or similar)
- [ ] Select available time slot
- [ ] Confirm booking
- [ ] Receive confirmation email
- [ ] Mark checklist item complete

**Technical Notes:**
- Calendly embed or custom scheduling
- Webhook: Mark complete when booked

**Story Points:** 3
**Priority:** P2

---

#### E6-S11: Push Notification Setup

**As a** guest,
**I want to** enable push notifications,
**So that** I receive important updates.

**Acceptance Criteria:**
- [ ] On first app launch: "Enable notifications" prompt
- [ ] Allow or deny
- [ ] Settings: Toggle notifications on/off
- [ ] Categories: Itinerary updates, Messages, Concierge, Alumni

**Technical Notes:**
- OneSignal integration
- Request permission: `expo-notifications`

**Story Points:** 3
**Priority:** P1

---

#### E6-S12: Offline Itinerary Download

**As a** guest,
**I want to** download my itinerary for offline access,
**So that** I can view it without internet.

**Acceptance Criteria:**
- [ ] Checklist item: "Download offline itinerary"
- [ ] Tap → Downloads itinerary data
- [ ] Stores in device storage (AsyncStorage)
- [ ] Accessible even without internet
- [ ] Updates when online (sync)

**Technical Notes:**
- React Query cache persistence
- AsyncStorage for offline data

**Story Points:** 5
**Priority:** P1

---

## EPIC 7: Mobile App - During Trip

**Goal:** Provide guests with real-time itinerary management, concierge access, and social features during their trip.

**Success Metrics:**
- Daily itinerary views: >3 per guest per day
- Concierge response time: <15 min
- Photo uploads: >20 per guest

### Stories

#### E7-S1: Daily Itinerary View

**As a** guest on my trip,
**I want to** see today's schedule,
**So that** I know what activities are planned.

**Acceptance Criteria:**
- [ ] "Itinerary" tab (bottom navigation)
- [ ] Default view: Today's activities
- [ ] Swipe left/right to navigate days
- [ ] Each activity card shows: Time, name, location, duration, category icon
- [ ] Tap activity → Activity details (description, map, what to bring)
- [ ] Current activity highlighted (green border)
- [ ] Past activities grayed out

**Technical Notes:**
- tRPC query: `itinerary.getByTrip`
- Filter by current day
- Use FlatList for performance

**Story Points:** 8
**Priority:** P1

---

#### E7-S2: Activity Check-In

**As a** guest,
**I want to** check in to activities,
**So that** the team knows I'm participating.

**Acceptance Criteria:**
- [ ] Each activity card has "Check In" button
- [ ] Tap → Confirms attendance
- [ ] Button changes to "Checked In" (green checkmark)
- [ ] Admin dashboard shows check-in count per activity
- [ ] Optional: QR code check-in (for automated tracking)

**Technical Notes:**
- tRPC mutation: `itinerary.checkIn`
- Store in activity_checkins table

**Story Points:** 3
**Priority:** P2

---

#### E7-S3: Activity Details & Maps

**As a** guest,
**I want to** see detailed information about an activity,
**So that** I know what to expect.

**Acceptance Criteria:**
- [ ] Tap activity → Detail modal
- [ ] Display: Full description, location (map), duration, what to bring
- [ ] Map: Embedded Google Maps (static or interactive)
- [ ] "Get Directions" button (opens Google Maps app)
- [ ] Weather forecast for activity time

**Technical Notes:**
- Google Maps API
- Deep link to Google Maps app
- Weather API (OpenWeather or similar)

**Story Points:** 5
**Priority:** P1

---

#### E7-S4: Concierge Chat (24/7 Support)

**As a** guest,
**I want to** chat with the concierge,
**So that** I can get help instantly.

**Acceptance Criteria:**
- [ ] "Concierge" tab (bottom navigation)
- [ ] Real-time chat interface
- [ ] Send text messages, photos, location
- [ ] Concierge responds (admin dashboard)
- [ ] Response time SLA: <15 min (displayed)
- [ ] Message history persists
- [ ] Push notifications for concierge replies

**Technical Notes:**
- Supabase Realtime or Pusher
- Store in `messages` table (guestId, concierge)
- OneSignal push notifications

**Story Points:** 8
**Priority:** P1

---

#### E7-S5: Emergency SOS Button

**As a** guest in an emergency,
**I want to** quickly contact emergency support,
**So that** I can get immediate help.

**Acceptance Criteria:**
- [ ] Prominent red "SOS" button (always visible, maybe floating)
- [ ] Tap → Confirmation modal: "Are you in an emergency?"
- [ ] Confirm → Immediately calls emergency line (Twilio or local number)
- [ ] Sends SMS with GPS location to concierge team
- [ ] Sends push notification to admin dashboard (high priority alert)
- [ ] Works offline (calls directly, no internet needed)

**Technical Notes:**
- `Linking.openURL('tel:+66...')` for call
- Geolocation API for GPS
- SMS via Twilio

**Story Points:** 5
**Priority:** P1

---

#### E7-S6: Court Booking System

**As a** guest,
**I want to** book pickleball courts,
**So that** I can play at convenient times.

**Acceptance Criteria:**
- [ ] "Book a Court" button on home screen
- [ ] Select venue (if multiple)
- [ ] View available time slots (calendar grid)
- [ ] Select time slot
- [ ] Optional: Invite trip-mates (multi-select)
- [ ] Confirm booking
- [ ] Booking added to personal itinerary
- [ ] Cancellation option (if >2 hours notice)

**Technical Notes:**
- Court availability stored in database (courts table)
- Booking creates itinerary_activity (custom)

**Story Points:** 8
**Priority:** P2

---

#### E7-S7: Find a Game (Match with Other Guests)

**As a** guest looking to play,
**I want to** find other guests who want to play now,
**So that** I can join a game.

**Acceptance Criteria:**
- [ ] "Find a Game" feature (in court booking or separate tab)
- [ ] Display: "Who's playing now?" live board
- [ ] See guests who marked "looking to play"
- [ ] Filter by skill level
- [ ] Join game button → Notify guest
- [ ] Mark yourself "looking to play" (toggle)

**Technical Notes:**
- Real-time status (Supabase Realtime)
- Store in guest_profile.looking_to_play (boolean)

**Story Points:** 5
**Priority:** P2

---

#### E7-S8: Photo Journal (Daily Capture)

**As a** guest,
**I want to** upload photos of my trip,
**So that** I can capture memories.

**Acceptance Criteria:**
- [ ] "Photos" tab or "Add Photo" button
- [ ] Take photo (camera) or select from library
- [ ] Optional: Add caption, tag location, tag activity
- [ ] Upload to S3
- [ ] Private or shared (group gallery) toggle
- [ ] Daily prompt: "Capture today's transformation!"

**Technical Notes:**
- `expo-image-picker`
- S3 presigned URL upload
- Store in `photos` table

**Story Points:** 5
**Priority:** P1

---

#### E7-S9: Group Photo Gallery

**As a** guest,
**I want to** see photos uploaded by other guests,
**So that** I can relive shared moments.

**Acceptance Criteria:**
- [ ] "Gallery" tab
- [ ] Display: All shared photos from trip
- [ ] Grid view (thumbnails)
- [ ] Tap → Full-screen view
- [ ] Swipe between photos
- [ ] Like photos (heart icon)
- [ ] Download photos to device

**Technical Notes:**
- tRPC query: `photos.getByTrip` (filter: shared = true)
- Use `expo-media-library` for downloads

**Story Points:** 5
**Priority:** P1

---

#### E7-S10: Restaurant Recommendations & Reservations

**As a** guest,
**I want to** discover recommended restaurants,
**So that** I can enjoy great meals.

**Acceptance Criteria:**
- [ ] "Dining" section (in home or explore tab)
- [ ] List of curated restaurants (concierge-approved)
- [ ] Each listing: Name, cuisine, price range, distance, Michelin stars (if applicable)
- [ ] Filter by: Cuisine, price, distance
- [ ] Tap restaurant → Details (photos, description, map)
- [ ] "Request Reservation" → Sends request to concierge
- [ ] Concierge confirms via chat

**Technical Notes:**
- Hardcoded restaurant data (JSON) or database
- Reservation requests via concierge chat

**Story Points:** 5
**Priority:** P2

---

#### E7-S11: Group Dining Coordination

**As a** guest,
**I want to** coordinate group dinners,
**So that** I can dine with trip-mates.

**Acceptance Criteria:**
- [ ] "Who wants to join for dinner?" feature
- [ ] Create group dining event: Restaurant, time
- [ ] Invite trip-mates (push notification)
- [ ] Guests can accept/decline
- [ ] See who's attending
- [ ] Concierge makes group reservation

**Technical Notes:**
- Store in `group_events` table
- Push notifications to invitees

**Story Points:** 5
**Priority:** P2

---

#### E7-S12: Daily Reflection Prompts

**As a** guest,
**I want to** reflect on my day,
**So that** I can capture my transformation journey.

**Acceptance Criteria:**
- [ ] End-of-day push notification: "How was your day?"
- [ ] Prompts:
  - "What surprised you today?"
  - "New friend you made?"
  - "Favorite moment?"
  - "How are you feeling?"
- [ ] Text input (short answers)
- [ ] Saved to database (reflections table)
- [ ] Used later for testimonial creation

**Technical Notes:**
- Push notification at 9 PM daily
- Store responses for later use

**Story Points:** 3
**Priority:** P2

---

#### E7-S13: Weather Widget

**As a** guest,
**I want to** see the weather forecast,
**So that** I can plan my activities.

**Acceptance Criteria:**
- [ ] Weather widget on home screen
- [ ] Display: Current temp, conditions, high/low
- [ ] 5-day forecast
- [ ] Tap → Detailed forecast (hourly)

**Technical Notes:**
- OpenWeather API
- Cache forecast data (refresh every 3 hours)

**Story Points:** 3
**Priority:** P2

---

#### E7-S14: Transportation Requests

**As a** guest,
**I want to** request transportation,
**So that** I can get around easily.

**Acceptance Criteria:**
- [ ] "Book a Ride" button (in concierge or home)
- [ ] Select: Pickup location, destination, time
- [ ] Submit request to concierge
- [ ] Concierge arranges car service
- [ ] Confirmation via chat

**Technical Notes:**
- Form sends request to concierge chat
- Manual coordination (no Uber API needed)

**Story Points:** 3
**Priority:** P2

---

#### E7-S15: Celebration Moments (Smile Reveal, Milestones)

**As a** guest,
**I want to** participate in celebration events,
**So that** I can share my transformation.

**Acceptance Criteria:**
- [ ] Special events marked in itinerary: "Smile Reveal Party" (day 8)
- [ ] Before/after photo capture feature
- [ ] Share with group (optional)
- [ ] Confetti animation on milestone completion

**Technical Notes:**
- Special activity category: CELEBRATION
- Before/after photos stored with tags

**Story Points:** 3
**Priority:** P2

---

## EPIC 8: Mobile App - Alumni

**Goal:** Engage guests after their trip through alumni community, referrals, and rebooking features.

**Success Metrics:**
- Alumni engagement: >60% monthly active
- Referrals generated: 0.8 per guest
- Repeat booking rate: >20% within 12 months

### Stories

#### E8-S1: Transformation Story Summary

**As a** returning guest,
**I want to** see a summary of my transformation journey,
**So that** I can reflect on my experience.

**Acceptance Criteria:**
- [ ] "Your Transformation Journey" page
- [ ] Display: Trip dates, package, destination
- [ ] Stats:
  - Before/after photos (if uploaded)
  - New friends made (# of connections)
  - Skills improved (pickleball rating change, optional)
  - Procedures completed
  - Savings realized (medical cost savings)
- [ ] Share button (social media, email)

**Technical Notes:**
- tRPC query: `alumni.getJourneySummary`
- Calculate stats from booking + photos + activities

**Story Points:** 5
**Priority:** P1

---

#### E8-S2: Alumni Directory (Fellow Travelers)

**As a** returning guest,
**I want to** stay connected with trip-mates,
**So that** our friendships continue.

**Acceptance Criteria:**
- [ ] "Alumni Network" page
- [ ] Filter: By trip date, package, location
- [ ] Directory of fellow alumni (opt-in)
- [ ] Each profile: Name, location, trip date
- [ ] "Reconnect" button → Send message (in-app chat)
- [ ] Privacy toggle: "Show me in alumni directory"

**Technical Notes:**
- tRPC query: `alumni.getDirectory`
- Filtered by privacy settings

**Story Points:** 5
**Priority:** P1

---

#### E8-S3: Virtual Meetup Calendar

**As a** returning guest,
**I want to** attend virtual alumni events,
**So that** I can stay engaged with the community.

**Acceptance Criteria:**
- [ ] "Upcoming Events" section
- [ ] Events: Monthly alumni calls, quarterly pickleball clinics, reunion announcements
- [ ] Each event: Date, time, description, host (Jaron)
- [ ] RSVP button
- [ ] Add to calendar (ICS export)
- [ ] Join Zoom link (sent day before event)

**Technical Notes:**
- Events stored in database (alumni_events table)
- Email reminder 1 day before

**Story Points:** 5
**Priority:** P1

---

#### E8-S4: Referral Program (Give $500, Get $500)

**As a** returning guest,
**I want to** refer friends,
**So that** I can earn credits toward my next trip.

**Acceptance Criteria:**
- [ ] "Refer a Friend" page
- [ ] Unique referral link generated
- [ ] Share via: SMS, email, WhatsApp, copy link
- [ ] Referral tracking dashboard:
  - Referrals sent (clicks)
  - Applications submitted
  - Bookings completed
  - Credits earned ($500 per booking)
- [ ] Redeem credits: Apply to next booking

**Technical Notes:**
- Referral links: `pickleballpassport.com/r/{guestId}`
- Track clicks, applications, bookings
- Credits stored in guest_profile.referral_credits

**Story Points:** 8
**Priority:** P1

---

#### E8-S5: Rebook Next Trip

**As a** returning guest,
**I want to** book another trip,
**So that** I can continue my transformation journey.

**Acceptance Criteria:**
- [ ] "Book Your Next Transformation" CTA (prominent)
- [ ] 20% alumni discount (auto-applied)
- [ ] Browse upcoming trips
- [ ] Package configurator (same as first booking)
- [ ] Pre-filled profile (from previous booking)
- [ ] "Invite a friend" option (dual booking)

**Technical Notes:**
- Alumni discount logic in pricing calculation
- Auto-apply discount if repeat guest

**Story Points:** 5
**Priority:** P1

---

#### E8-S6: Passport Stamps (Gamification)

**As a** returning guest,
**I want to** collect passport stamps for achievements,
**So that** I can track my engagement and earn rewards.

**Acceptance Criteria:**
- [ ] "Passport Stamps" page (visual passport book)
- [ ] Stamps earned for:
  - Completing first trip
  - Referring a friend (booked)
  - Attending virtual meetup
  - Rebooking next trip
  - Sharing testimonial
  - 5 trips completed (Platinum traveler)
- [ ] Each stamp shows: Icon, name, date earned
- [ ] Redeem stamps for: Upgrades, exclusive experiences, merchandise
- [ ] Progress toward next stamp

**Technical Notes:**
- Stamps stored in database (passport_stamps table)
- Gamification logic triggers stamp awards

**Story Points:** 8
**Priority:** P2

---

#### E8-S7: Testimonial Creation Flow

**As a** returning guest,
**I want to** share my testimonial,
**So that** I can help others discover Pickleball Passport.

**Acceptance Criteria:**
- [ ] "Share Your Story" prompt (post-trip)
- [ ] Guided prompts:
  - "Why did you come?" (before)
  - "What surprised you?" (during)
  - "What are you taking home?" (after)
- [ ] Text + photo + video (optional)
- [ ] Record video (in-app) or upload
- [ ] Before/after photo upload
- [ ] Consent checkbox: "I agree to share my story on the website"
- [ ] Submit for review (admin approves)

**Technical Notes:**
- tRPC mutation: `testimonial.create`
- Video upload to S3 → Mux transcoding

**Story Points:** 8
**Priority:** P1

---

#### E8-S8: Alumni Exclusive Perks

**As a** returning guest,
**I want to** access exclusive perks,
**So that** I feel valued as a loyal customer.

**Acceptance Criteria:**
- [ ] "Alumni Perks" page
- [ ] Perks:
  - 20% discount on next trip
  - Priority booking (early access to new trips)
  - Free accommodation upgrade (once per year)
  - Exclusive merchandise (Pickleball Passport paddle, apparel)
  - Invitation to annual reunion trip
- [ ] Redeem perks (apply at booking)

**Technical Notes:**
- Perks logic in booking system
- Track perk redemptions

**Story Points:** 5
**Priority:** P2

---

## EPIC 9: Partner Portal

**Goal:** Empower pickleball club directors to refer guests, track performance, and earn rewards.

**Success Metrics:**
- Active partners: 50% (generated ≥1 referral within 90 days)
- Referral link usage: >80%
- Points redemption: >40% within 12 months

### Stories

#### E9-S1: Partner Dashboard (Overview Metrics)

**As a** partner,
**I want to** see my performance metrics,
**So that** I know how many referrals I've generated.

**Acceptance Criteria:**
- [ ] Page: `/partners/dashboard`
- [ ] Metrics:
  - Total referrals sent (clicks)
  - Applications submitted
  - Bookings confirmed
  - Passport Points balance
  - Current tier (Bronze, Silver, Gold, Platinum)
  - Next tier progress bar
- [ ] Charts: Referrals over time, conversion funnel
- [ ] Leaderboard: Top partners this month (opt-in display)

**Technical Notes:**
- tRPC query: `partner.getDashboardMetrics`
- Calculate conversion rates

**Story Points:** 8
**Priority:** P1

---

#### E9-S2: Referral Link Generation

**As a** partner,
**I want to** generate my unique referral link,
**So that** I can share it with my members.

**Acceptance Criteria:**
- [ ] "Your Referral Link" section
- [ ] Display: Unique link (e.g., `pickleballpassport.com/r/VILLAGES-JEN`)
- [ ] Copy link button (clipboard)
- [ ] QR code (for print materials)
- [ ] Option to create custom links (e.g., for specific campaigns)
- [ ] Track performance per link

**Technical Notes:**
- Referral code auto-generated at signup
- QR code: Use `qrcode.react` package

**Story Points:** 3
**Priority:** P1

---

#### E9-S3: Referral Tracking Table

**As a** partner,
**I want to** see all my referrals,
**So that** I can track their status.

**Acceptance Criteria:**
- [ ] Page: `/partners/referrals`
- [ ] Table columns: Guest Name (anonymized until booked), Date Referred, Status (Clicked, Applied, Booked, Departed), Points Earned
- [ ] Filter: By status, date range
- [ ] Sort: By date, points earned
- [ ] Click row → Referral details (if booked)

**Technical Notes:**
- tRPC query: `partner.getReferrals`
- Anonymize guest names (show initials) until booking confirmed

**Story Points:** 5
**Priority:** P1

---

#### E9-S4: Points Balance & Transactions

**As a** partner,
**I want to** see my points balance and transaction history,
**So that** I can track earnings.

**Acceptance Criteria:**
- [ ] Page: `/partners/points`
- [ ] Display: Current balance (large, prominent)
- [ ] Recent transactions (last 10):
  - Date, description, points earned/redeemed
- [ ] Filter: Earned vs Redeemed
- [ ] Expiration warnings (if applicable)

**Technical Notes:**
- tRPC query: `partner.getPointsTransactions`
- Calculate balance: SUM(earned) - SUM(redeemed)

**Story Points:** 3
**Priority:** P1

---

#### E9-S5: Points Redemption Catalog

**As a** partner,
**I want to** redeem points for rewards,
**So that** I can benefit from my referrals.

**Acceptance Criteria:**
- [ ] Page: `/partners/rewards`
- [ ] Catalog of rewards:
  - Free trip (solo): 15,000 points
  - Free trip (+ spouse): 25,000 points
  - Accommodation upgrade: 3,000 points
  - Exclusive experience: 1,000 points
  - Gift trip to member: 18,000 points
  - Cash out: $0.80/point (minimum 5,000 points)
- [ ] Each reward shows: Image, description, points required
- [ ] "Redeem" button (if sufficient balance)
- [ ] Confirmation modal
- [ ] Process redemption (deduct points, create reward record)

**Technical Notes:**
- tRPC mutation: `partner.redeemPoints`
- Create reward_redemptions record
- Admin fulfillment workflow

**Story Points:** 8
**Priority:** P1

---

#### E9-S6: Tier System & Benefits

**As a** partner,
**I want to** understand the tier system,
**So that** I can work toward higher tiers.

**Acceptance Criteria:**
- [ ] Page: `/partners/tiers`
- [ ] Display current tier badge
- [ ] Tier structure table:
  - Bronze: 0-4 bookings ($500/player, 50% off trip)
  - Silver: 5-9 bookings ($750/player, FREE trip)
  - Gold: 10-19 bookings ($1,000/player, FREE trip + spouse)
  - Platinum: 20+ bookings ($1,500/player, FREE trip + spouse + equity)
- [ ] Progress: "2 more bookings to Gold!"
- [ ] Benefits per tier listed

**Technical Notes:**
- Tier auto-calculated based on bookings count
- Update tier in database when thresholds met

**Story Points:** 3
**Priority:** P1

---

#### E9-S7: Marketing Materials Library

**As a** partner,
**I want to** download marketing materials,
**So that** I can promote Pickleball Passport easily.

**Acceptance Criteria:**
- [ ] Page: `/partners/materials`
- [ ] Categories: Email Templates, Flyers, Social Media, Presentation
- [ ] Each material shows: Preview, description, download button
- [ ] Email templates: 3 variations (plain text + HTML)
- [ ] Flyers: PDF (8.5x11, 11x17)
- [ ] Social media: Image + caption (Facebook, Instagram, LinkedIn)
- [ ] Presentation deck: PowerPoint/PDF
- [ ] Customization: Add your club logo, contact info (optional)
- [ ] Download count tracking (analytics for admin)

**Technical Notes:**
- Assets stored in S3
- Download links (presigned URLs)
- Track downloads in database

**Story Points:** 5
**Priority:** P1

---

#### E9-S8: Partner Success Manager Chat

**As a** partner,
**I want to** chat with my success manager,
**So that** I can get support.

**Acceptance Criteria:**
- [ ] "Contact Support" button (in dashboard or navigation)
- [ ] Opens chat modal
- [ ] Send message to dedicated partner success manager
- [ ] Response time SLA: <24 hours
- [ ] Message history persists

**Technical Notes:**
- Similar to concierge chat (Supabase Realtime)
- Assign success manager (admin user)

**Story Points:** 5
**Priority:** P2

---

#### E9-S9: Recruit Other Partners

**As a** partner,
**I want to** recruit other club directors,
**So that** I can earn points on their referrals.

**Acceptance Criteria:**
- [ ] "Refer a Partner" section
- [ ] Unique partner recruitment link
- [ ] Share via email, SMS
- [ ] Track partner signups
- [ ] Earn 2,000 points per partner signup (who generates ≥1 booking)
- [ ] See recruited partners list

**Technical Notes:**
- Partner referral links: `pickleballpassport.com/partners?ref={partnerId}`
- Store recruitedById in partner_profiles

**Story Points:** 5
**Priority:** P2

---

#### E9-S10: Directors Circle (Community Forum)

**As a** partner,
**I want to** connect with other partners,
**So that** I can share best practices.

**Acceptance Criteria:**
- [ ] "Directors Circle" page (private community)
- [ ] Forum/discussion board (threads)
- [ ] Topics: Best practices, success stories, Q&A
- [ ] Post threads, reply to threads
- [ ] Like/upvote threads
- [ ] Search threads
- [ ] Monthly group call announcements (Jaron hosts)

**Technical Notes:**
- Forum: Custom-built or integrate Discourse/Circle
- Moderation: Admin-only initially

**Story Points:** 13
**Priority:** P2

---

#### E9-S11: Preview Trip Invitation (Scouting Trips)

**As a** high-performing partner,
**I want to** be invited to a preview trip,
**So that** I can experience the product firsthand.

**Acceptance Criteria:**
- [ ] Eligibility: Partners with 5+ referrals
- [ ] Admin sends invitation (email + in-app notification)
- [ ] Heavily discounted trip: $3K (vs $18K)
- [ ] Partner books preview trip (same booking flow)
- [ ] After trip: Partner becomes advocate, shares testimonial

**Technical Notes:**
- Admin manually sends invitations
- Special discount code for preview trips

**Story Points:** 5
**Priority:** P2

---

#### E9-S12: Partner Performance Reports (Monthly Email)

**As a** partner,
**I want to** receive monthly performance reports,
**So that** I stay informed about my progress.

**Acceptance Criteria:**
- [ ] Automated email (first of each month)
- [ ] Content:
  - Referrals sent (last month)
  - Bookings generated
  - Points earned
  - Tier status
  - Comparison: "You're in top 20% of partners!"
- [ ] CTA: "View Full Dashboard"

**Technical Notes:**
- Background job (monthly)
- SendGrid email template

**Story Points:** 3
**Priority:** P2

---

#### E9-S13: Leaderboard (Gamification)

**As a** partner,
**I want to** see how I rank against other partners,
**So that** I'm motivated to perform better.

**Acceptance Criteria:**
- [ ] Leaderboard page (opt-in visibility)
- [ ] Rankings: Top partners by bookings (monthly + all-time)
- [ ] Display: Partner name (or anonymous), bookings count, tier
- [ ] Highlight current user's rank
- [ ] Prize for #1 (monthly): Bonus points, free trip upgrade

**Technical Notes:**
- Privacy toggle: "Show me on leaderboard"
- tRPC query: `partner.getLeaderboard`

**Story Points:** 3
**Priority:** P2

---

#### E9-S14: Marketing Campaign Tracking

**As a** partner,
**I want to** track performance by marketing campaign,
**So that** I know which tactics work best.

**Acceptance Criteria:**
- [ ] Create multiple referral links (campaigns)
- [ ] Example: "Spring Promo", "Email Campaign", "Club Event"
- [ ] Track clicks/bookings per campaign
- [ ] Compare campaign performance
- [ ] Analytics: Which channel drives most bookings?

**Technical Notes:**
- Allow custom UTM parameters
- Track referral_events by campaign

**Story Points:** 5
**Priority:** P3

---

#### E9-S15: Partner Onboarding Wizard

**As a** new partner,
**I want to** complete an onboarding wizard,
**So that** I understand how to get started.

**Acceptance Criteria:**
- [ ] After signup: Onboarding wizard (multi-step)
- [ ] Step 1: Welcome video (Jaron introduction)
- [ ] Step 2: How the program works (Passport Points, tiers)
- [ ] Step 3: Copy your referral link
- [ ] Step 4: Download marketing materials
- [ ] Step 5: Join Directors Circle
- [ ] Progress tracker (1 of 5 completed)
- [ ] Skip option (can return later)

**Technical Notes:**
- Store onboarding_completed in partner_profile
- Progressive disclosure

**Story Points:** 5
**Priority:** P2

---

#### E9-S16: Manual Referral Entry

**As a** partner,
**I want to** manually submit a referral,
**So that** I get credit if a guest didn't use my link.

**Acceptance Criteria:**
- [ ] "Submit Manual Referral" form
- [ ] Fields: Guest email, guest name (optional), notes
- [ ] Submit → Creates manual referral request
- [ ] Admin reviews and approves/denies
- [ ] If approved: Partner receives points
- [ ] Prevents abuse: Limit 5 manual entries per month

**Technical Notes:**
- tRPC mutation: `partner.submitManualReferral`
- Admin approval workflow

**Story Points:** 5
**Priority:** P2

---

#### E9-S17: Partner Profile Customization

**As a** partner,
**I want to** customize my profile,
**So that** it reflects my club and brand.

**Acceptance Criteria:**
- [ ] Edit profile: Club name, location, job title, bio
- [ ] Upload club logo (for marketing materials)
- [ ] Profile visibility toggle (show on alumni directory)

**Technical Notes:**
- tRPC mutation: `partner.updateProfile`
- S3 upload for logo

**Story Points:** 3
**Priority:** P3

---

#### E9-S18: Tax Reporting (1099 Forms)

**As a** partner who receives cash payouts,
**I want to** receive tax documentation,
**So that** I can file my taxes correctly.

**Acceptance Criteria:**
- [ ] If cash payouts >$600/year: Generate 1099 form
- [ ] Partner submits W-9 (during onboarding)
- [ ] Admin generates 1099 (end of year)
- [ ] Email PDF to partner

**Technical Notes:**
- Tax form generation (manual or via service like Stripe)
- Store W-9 data securely

**Story Points:** 5
**Priority:** P3

---

#### E9-S19: Analytics Export (CSV Download)

**As a** partner,
**I want to** export my referral data,
**So that** I can analyze it externally.

**Acceptance Criteria:**
- [ ] "Export Data" button (on referrals page)
- [ ] Downloads CSV: Referral ID, Date, Status, Points Earned
- [ ] Date range filter

**Technical Notes:**
- Generate CSV server-side
- Use `json2csv` package

**Story Points:** 2
**Priority:** P3

---

#### E9-S20: Partner Settings & Preferences

**As a** partner,
**I want to** manage my account settings,
**So that** I can control notifications and privacy.

**Acceptance Criteria:**
- [ ] Page: `/partners/settings`
- [ ] Email notification preferences:
  - New referral click
  - Application submitted
  - Booking confirmed
  - Monthly report
- [ ] Privacy: Show on leaderboard, show in directory
- [ ] Change password
- [ ] Delete account (confirmation)

**Technical Notes:**
- tRPC mutation: `partner.updateSettings`
- Store preferences in partner_profile

**Story Points:** 3
**Priority:** P2

---

## EPIC 10: Referral System

**Goal:** Track referrals from partners and guests, attribute bookings correctly, and award points automatically.

**Success Metrics:**
- Attribution accuracy: >95%
- Automated point awards: 100%
- Partner satisfaction with tracking: NPS >70

### Stories

#### E10-S1: Referral Link Tracking (Cookie-Based)

**As a** system,
**I want to** track referral clicks,
**So that** we can attribute bookings to partners/guests.

**Acceptance Criteria:**
- [ ] Referral link format: `pickleballpassport.com/r/{code}`
- [ ] Click → Set cookie (30-day expiration)
- [ ] Store: referralCode, timestamp
- [ ] Track click in database (referral_events table)
- [ ] If user already has cookie: Don't overwrite (first-click attribution)
- [ ] Alternative: Last-click attribution (configurable)

**Technical Notes:**
- Middleware detects `/r/{code}` routes
- Set HTTP cookie: `referralCode={code}; Max-Age=2592000`
- Increment clicks count in referrals table

**Story Points:** 5
**Priority:** P1

---

#### E10-S2: Referral Attribution at Application

**As a** system,
**I want to** attribute applications to referral sources,
**So that** partners/guests get credit.

**Acceptance Criteria:**
- [ ] When guest submits application:
  - Check for referralCode cookie
  - If exists: Create referral_event (APPLICATION)
  - Link application to referral
- [ ] Increment applications count in referrals table
- [ ] Award points to partner/guest (100 points for application)

**Technical Notes:**
- Read cookie in application submission handler
- tRPC mutation: `application.create` includes referral logic

**Story Points:** 3
**Priority:** P1

---

#### E10-S3: Referral Attribution at Booking

**As a** system,
**I want to** attribute bookings to referral sources,
**So that** partners/guests receive full credit and points.

**Acceptance Criteria:**
- [ ] When booking confirmed:
  - Check for referralCode cookie OR manual referral code input
  - If exists: Create referral_event (BOOKING)
  - Store referredBy in bookings table
  - Increment bookings count in referrals table
- [ ] Award points to partner/guest:
  - 1,000 points for $10K package
  - 1,500 points for $20K+ package
- [ ] Create points_transaction record

**Technical Notes:**
- Booking mutation checks referral attribution
- Points calculation based on package value

**Story Points:** 5
**Priority:** P1

---

#### E10-S4: Post-Trip Bonus Points

**As a** partner/guest,
**I want to** receive bonus points after the trip completes,
**So that** I'm rewarded for successful referrals.

**Acceptance Criteria:**
- [ ] After trip completion (trip.endDate passes):
  - Find all bookings for that trip
  - For each booking with referredBy:
    - Award 500 bonus points (completion bonus)
    - Create referral_event (COMPLETION)
- [ ] Email notification to partner/guest

**Technical Notes:**
- Background job (daily): Check completed trips
- Award bonus points

**Story Points:** 3
**Priority:** P1

---

#### E10-S5: Manual Referral Code Input (Fallback)

**As a** guest who was referred but didn't use the link,
**I want to** enter a referral code manually,
**So that** the partner/guest gets credit.

**Acceptance Criteria:**
- [ ] Optional field at booking: "Referral Code (if applicable)"
- [ ] Validate code against database
- [ ] If valid: Attribute booking to referral
- [ ] If invalid: Show error, allow proceeding without

**Technical Notes:**
- Overrides cookie if both exist (manual takes precedence)
- Admin can approve disputed referrals

**Story Points:** 3
**Priority:** P1

---

#### E10-S6: Referral Conflict Resolution

**As an** admin,
**I want to** resolve referral disputes,
**So that** attribution is fair.

**Acceptance Criteria:**
- [ ] Admin dashboard: View bookings with disputed referrals
- [ ] Display: Guest email, claimed referral codes (if multiple)
- [ ] Manual attribution: Assign booking to specific referral
- [ ] Update referral_events, points_transactions
- [ ] Notify partner/guest of resolution

**Technical Notes:**
- Rare edge case (guest used multiple links)
- Admin manually assigns correct attribution

**Story Points:** 3
**Priority:** P2

---

#### E10-S7: Referral Analytics (Admin)

**As an** admin,
**I want to** see referral funnel analytics,
**So that** I can optimize the referral program.

**Acceptance Criteria:**
- [ ] Admin page: `/admin/referrals/analytics`
- [ ] Funnel: Clicks → Applications → Bookings
- [ ] Conversion rates at each stage
- [ ] Top-performing referrals (partner/guest)
- [ ] Referral source breakdown (partner vs guest vs organic)

**Technical Notes:**
- tRPC query: `admin.getReferralAnalytics`
- Aggregate referral_events data

**Story Points:** 5
**Priority:** P2

---

#### E10-S8: Referral Code Generation (Guest Referrals)

**As a** returning guest,
**I want to** have a unique referral code,
**So that** I can refer friends.

**Acceptance Criteria:**
- [ ] After trip completion: Generate guest referral code
- [ ] Format: `{firstName}-{tripYear}` (e.g., `SUSAN-2026`)
- [ ] Store in guest_profile.referralCode
- [ ] Display in alumni app ("Your Referral Code")

**Technical Notes:**
- Auto-generate after first trip
- Ensure uniqueness (append number if duplicate)

**Story Points:** 3
**Priority:** P1

---

#### E10-S9: UTM Parameter Tracking

**As a** marketer,
**I want to** track campaign sources via UTM parameters,
**So that** I know which marketing channels work.

**Acceptance Criteria:**
- [ ] Capture UTM parameters: source, medium, campaign
- [ ] Store in application/booking records
- [ ] Admin analytics: Bookings by UTM source

**Technical Notes:**
- Read UTM params from URL
- Store in database (utm_source, utm_medium, utm_campaign)

**Story Points:** 3
**Priority:** P2

---

#### E10-S10: Multi-Touch Attribution (Future)

**As a** system,
**I want to** track all touchpoints in the customer journey,
**So that** we can understand the full funnel.

**Acceptance Criteria:**
- [ ] Track all visits, clicks, page views
- [ ] Store journey in timeline
- [ ] Attribute booking to all contributing touchpoints (weighted)

**Technical Notes:**
- Complex feature (Phase 3+)
- Requires analytics infrastructure

**Story Points:** 13
**Priority:** P3

---

## EPIC 11: Communication System

**Goal:** Automated, personalized communication across email, SMS, and push notifications.

**Success Metrics:**
- Email open rate: >40%
- SMS delivery rate: >95%
- Push notification opt-in: >70%

### Stories

#### E11-S1: SendGrid Integration (Email)

**As a** developer,
**I want to** integrate SendGrid for transactional emails,
**So that** we can send automated emails.

**Acceptance Criteria:**
- [ ] SendGrid account created, API key configured
- [ ] Email templates created (SendGrid dashboard or code-based)
- [ ] Test email sending (development environment)

**Technical Notes:**
- `@sendgrid/mail` package
- Environment variables for API key

**Story Points:** 2
**Priority:** P0

---

#### E11-S2: Booking Confirmation Email

**As a** guest who booked,
**I want to** receive a confirmation email,
**So that** I have booking details in my inbox.

**Acceptance Criteria:**
- [ ] Triggered: After payment succeeded
- [ ] Content:
  - Booking reference number
  - Trip details (destination, dates, package)
  - Total price paid
  - Next steps (checklist)
  - CTA: "Access Member Portal"
- [ ] Attachment: Booking summary PDF

**Technical Notes:**
- SendGrid dynamic template
- Trigger in webhook handler (payment_intent.succeeded)

**Story Points:** 3
**Priority:** P0

---

#### E11-S3: Payment Reminder Emails (Installments)

**As a** guest on installment plan,
**I want to** receive reminders before payments,
**So that** I'm not surprised.

**Acceptance Criteria:**
- [ ] Triggered: 7 days before scheduled payment
- [ ] Content:
  - Amount due
  - Due date
  - Payment method on file
  - CTA: "Update Payment Method" (if needed)

**Technical Notes:**
- Background job: Daily check for upcoming payments
- SendGrid template

**Story Points:** 3
**Priority:** P1

---

#### E11-S4: Pre-Trip Nurture Sequence

**As a** booked guest,
**I want to** receive helpful emails leading up to my trip,
**So that** I'm well-prepared.

**Acceptance Criteria:**
- [ ] Sequence timeline:
  - 60 days before: "Your transformation journey begins soon!"
  - 30 days before: "Time to book your flights"
  - 14 days before: "Complete your pre-trip checklist"
  - 7 days before: "What to pack for Thailand"
  - 1 day before: "Departing tomorrow! Final reminders"
- [ ] Each email: Actionable tips, CTAs, excitement-building

**Technical Notes:**
- Scheduled email jobs (based on trip.startDate)
- SendGrid automation or custom scheduler

**Story Points:** 5
**Priority:** P1

---

#### E11-S5: Post-Trip Follow-Up Emails

**As a** returned guest,
**I want to** receive follow-up emails,
**So that** I stay engaged with Pickleball Passport.

**Acceptance Criteria:**
- [ ] Sequence timeline:
  - Day 3 after return: "Welcome home! How was your trip?"
  - Day 7: "Share your transformation story" (testimonial request)
  - Day 14: "Refer a friend" (referral program)
  - Day 30: "Join our next virtual meetup"
  - Day 60: "Ready for your next adventure?"

**Technical Notes:**
- Triggered after trip.endDate
- SendGrid templates

**Story Points:** 5
**Priority:** P1

---

#### E11-S6: Twilio Integration (SMS)

**As a** developer,
**I want to** integrate Twilio for SMS notifications,
**So that** we can send urgent updates.

**Acceptance Criteria:**
- [ ] Twilio account created, phone number provisioned
- [ ] API credentials configured
- [ ] Test SMS sending

**Technical Notes:**
- `twilio` package
- Use for urgent notifications only (minimize cost)

**Story Points:** 2
**Priority:** P1

---

#### E11-S7: SMS Notifications (Urgent Updates)

**As a** guest on my trip,
**I want to** receive SMS for urgent updates,
**So that** I don't miss important information.

**Acceptance Criteria:**
- [ ] Use cases:
  - Flight delays affecting pickup
  - Itinerary changes (activity cancelled)
  - Emergency alerts
  - Payment failure (immediate retry needed)
- [ ] SMS content: Brief, actionable, includes link to app

**Technical Notes:**
- Twilio API
- Trigger via admin action or automated events

**Story Points:** 3
**Priority:** P1

---

#### E11-S8: OneSignal Integration (Push Notifications)

**As a** developer,
**I want to** integrate OneSignal for push notifications,
**So that** we can engage mobile app users.

**Acceptance Criteria:**
- [ ] OneSignal account created, app configured
- [ ] React Native SDK integrated
- [ ] Test push notification sending

**Technical Notes:**
- `react-native-onesignal` package
- Segment users by trip, status

**Story Points:** 3
**Priority:** P1

---

#### E11-S9: Push Notifications (Mobile App)

**As a** mobile app user,
**I want to** receive push notifications,
**So that** I stay informed.

**Acceptance Criteria:**
- [ ] Notification types:
  - Itinerary updates
  - Concierge messages
  - Group chat messages
  - Pre-trip reminders
  - Alumni event invitations
- [ ] Tap notification → Opens relevant app screen
- [ ] Settings: Toggle notifications by category

**Technical Notes:**
- OneSignal segmentation
- Deep linking to app screens

**Story Points:** 5
**Priority:** P1

---

#### E11-S10: Email Preferences Center

**As a** user,
**I want to** manage my email preferences,
**So that** I only receive emails I want.

**Acceptance Criteria:**
- [ ] Page: `/preferences` (accessible via email footer link)
- [ ] Categories:
  - Booking confirmations (cannot unsubscribe)
  - Pre-trip tips
  - Post-trip follow-ups
  - Alumni events
  - Marketing promotions
- [ ] Toggle on/off per category
- [ ] "Unsubscribe from all" option (except transactional)

**Technical Notes:**
- Store preferences in user record
- SendGrid unsubscribe groups

**Story Points:** 3
**Priority:** P2

---

#### E11-S11: Admin Broadcast Messaging

**As an** admin,
**I want to** send broadcast messages to guests,
**So that** I can communicate important updates.

**Acceptance Criteria:**
- [ ] Admin page: `/admin/messages/broadcast`
- [ ] Select audience:
  - All guests
  - Upcoming trip guests
  - Alumni
  - Specific trip
- [ ] Compose message (email, SMS, push, or all)
- [ ] Preview before sending
- [ ] Send button
- [ ] Confirm send (cannot undo)

**Technical Notes:**
- tRPC mutation: `admin.sendBroadcast`
- Queue messages (avoid rate limits)

**Story Points:** 5
**Priority:** P2

---

#### E11-S12: Automated NPS Surveys

**As an** admin,
**I want to** automatically send NPS surveys,
**So that** we can measure guest satisfaction.

**Acceptance Criteria:**
- [ ] Triggered: 30 days after trip completion
- [ ] Email: "How likely are you to recommend Pickleball Passport?"
- [ ] Scale: 0-10
- [ ] Follow-up: "What's the main reason for your score?"
- [ ] Store responses in database
- [ ] Admin dashboard: View NPS score over time

**Technical Notes:**
- SendGrid template with embedded survey
- Webhook to capture responses
- Calculate NPS: (Promoters - Detractors) / Total × 100

**Story Points:** 5
**Priority:** P2

---

## EPIC 12: Content Management

**Goal:** Manage testimonials, photos, videos, and marketing content efficiently.

**Success Metrics:**
- Testimonial capture rate: >60%
- Content approval time: <3 days
- Published content library: 15-20 pieces (Year 1)

### Stories

#### E12-S1: Testimonial Submission Form (Guest)

**As a** returning guest,
**I want to** submit my testimonial,
**So that** I can share my story.

**Acceptance Criteria:**
- [ ] Form (web or mobile app): "Share Your Story"
- [ ] Fields:
  - Type: Video, Written, Photo
  - Content: Text area (for written) or file upload (video/photo)
  - Before/after photos (optional)
  - Consent: "I agree to share my story publicly"
- [ ] Submit → Status: DRAFT
- [ ] Admin notified of new testimonial

**Technical Notes:**
- tRPC mutation: `testimonial.create`
- Video upload to S3 → Mux processing

**Story Points:** 5
**Priority:** P1

---

#### E12-S2: Testimonial Review & Approval (Admin)

**As an** admin,
**I want to** review testimonials before publishing,
**So that** only quality content goes live.

**Acceptance Criteria:**
- [ ] Admin page: `/admin/testimonials`
- [ ] List: All testimonials (filter by status)
- [ ] Preview: View content (video player, text, photos)
- [ ] Actions:
  - Approve (status → APPROVED)
  - Publish (status → PUBLISHED, shows on website)
  - Request edits (send feedback to guest)
  - Reject (delete)

**Technical Notes:**
- tRPC mutations: `admin.approveTestimonial`, `admin.publishTestimonial`

**Story Points:** 3
**Priority:** P1

---

#### E12-S3: Testimonial Display (Website)

**As a** website visitor,
**I want to** see published testimonials,
**So that** I can learn from past guests.

**Acceptance Criteria:**
- [ ] Page: `/testimonials`
- [ ] Filter: By type (video, written, photo), package
- [ ] Display: Grid of testimonials
- [ ] Video thumbnails clickable (opens modal with player)
- [ ] Written testimonials: Quote + guest info
- [ ] Photos: Gallery view

**Technical Notes:**
- tRPC query: `testimonial.getPublished`
- Mux video player

**Story Points:** 3
**Priority:** P1

---

#### E12-S4: Photo Gallery Management (Admin)

**As an** admin,
**I want to** manage trip photo galleries,
**So that** I can curate content.

**Acceptance Criteria:**
- [ ] Admin page: `/admin/photos`
- [ ] Upload photos (bulk upload)
- [ ] Tag photos: Trip, activity, guests (opt-in)
- [ ] Featured photo toggle (for homepage hero)
- [ ] Delete photos

**Technical Notes:**
- S3 upload (presigned URLs)
- Store metadata in database

**Story Points:** 5
**Priority:** P2

---

#### E12-S5: Marketing Asset Versioning

**As an** admin,
**I want to** manage versions of marketing materials,
**So that** partners always have the latest.

**Acceptance Criteria:**
- [ ] Upload new version of asset (e.g., updated flyer)
- [ ] Version history: V1, V2, V3
- [ ] Notify partners of new version (email)
- [ ] Partners download latest version by default

**Technical Notes:**
- S3 versioning enabled
- Track versions in database

**Story Points:** 3
**Priority:** P2

---

#### E12-S6: Content Tagging & Search

**As an** admin,
**I want to** tag and search content,
**So that** I can find assets quickly.

**Acceptance Criteria:**
- [ ] Tag content: Trip, package, category (dental, cultural, etc.)
- [ ] Search: By tag, keyword, date
- [ ] Filter: By type (photo, video, testimonial)

**Technical Notes:**
- Full-text search (PostgreSQL)
- Tags stored in database (many-to-many)

**Story Points:** 5
**Priority:** P3

---

#### E12-S7: Automated Video Transcoding (Mux)

**As a** system,
**I want to** automatically transcode uploaded videos,
**So that** they stream smoothly.

**Acceptance Criteria:**
- [ ] Video uploaded → S3
- [ ] Webhook triggers Mux ingestion
- [ ] Mux transcodes video (multiple quality levels)
- [ ] Generate thumbnail automatically
- [ ] Webhook: Transcoding complete → Update database with playback ID

**Technical Notes:**
- Mux webhook handler
- Store playbackId in testimonials table

**Story Points:** 5
**Priority:** P2

---

#### E12-S8: Content Consent Management

**As an** admin,
**I want to** track content consent,
**So that** we only use authorized content.

**Acceptance Criteria:**
- [ ] Consent checkbox on testimonial/photo upload
- [ ] Track consent status (boolean)
- [ ] Filter: "Only show consented content"
- [ ] Revoke consent option (for guest)

**Technical Notes:**
- Consent stored per testimonial/photo
- GDPR compliance

**Story Points:** 2
**Priority:** P2

---

## EPIC 13: Analytics & Reporting

**Goal:** Track product usage, business metrics, and user behavior to inform decisions.

**Success Metrics:**
- Dashboard load time: <2 seconds
- Data accuracy: >99%
- Report generation: <30 seconds

### Stories

#### E13-S1: Mixpanel Integration (Product Analytics)

**As a** developer,
**I want to** integrate Mixpanel,
**So that** we can track user behavior.

**Acceptance Criteria:**
- [ ] Mixpanel account created, project token configured
- [ ] SDK integrated (web + mobile)
- [ ] Test event tracking

**Technical Notes:**
- `mixpanel-browser` (web)
- `mixpanel-react-native` (mobile)

**Story Points:** 2
**Priority:** P1

---

#### E13-S2: Event Tracking (Key Actions)

**As a** product manager,
**I want to** track key user actions,
**So that** I can understand usage patterns.

**Acceptance Criteria:**
- [ ] Events tracked:
  - **Web:**
    - Page viewed (all pages)
    - Application submitted
    - Package configured (step-by-step)
    - Booking created
    - Payment completed
    - Referral link clicked
  - **Mobile:**
    - App opened
    - Itinerary viewed
    - Activity checked in
    - Message sent (concierge/group)
    - Photo uploaded
    - Testimonial submitted
  - **Partner Portal:**
    - Dashboard viewed
    - Referral link shared
    - Points redeemed
    - Material downloaded

**Technical Notes:**
- AnalyticsService.trackEvent() wrapper
- Event properties: userId, timestamp, metadata

**Story Points:** 8
**Priority:** P1

---

#### E13-S3: User Identification (Identity Stitching)

**As a** product manager,
**I want to** track users across devices,
**So that** I can understand full customer journey.

**Acceptance Criteria:**
- [ ] Identify user on login (Mixpanel.identify)
- [ ] Set user properties: role, tier, bookings count
- [ ] Track across web + mobile (same user ID)

**Technical Notes:**
- Clerk userId used as Mixpanel distinct_id

**Story Points:** 3
**Priority:** P1

---

#### E13-S4: Conversion Funnel Reports

**As a** product manager,
**I want to** see conversion funnels,
**So that** I can identify drop-off points.

**Acceptance Criteria:**
- [ ] Funnels:
  - Homepage → Application → Booking → Payment
  - Package page → Configurator → Review → Payment
  - Partner signup → Referral shared → Booking generated
- [ ] Display: Conversion rate at each step
- [ ] Identify bottlenecks

**Technical Notes:**
- Mixpanel Funnels report
- Custom dashboards

**Story Points:** 3
**Priority:** P1

---

#### E13-S5: Cohort Analysis

**As a** product manager,
**I want to** analyze cohorts (groups of users),
**So that** I can track retention over time.

**Acceptance Criteria:**
- [ ] Cohorts:
  - Guests by booking month
  - Partners by signup month
  - Alumni by trip completion month
- [ ] Metrics: Retention (monthly), repeat bookings, referrals generated

**Technical Notes:**
- Mixpanel Cohort analysis

**Story Points:** 3
**Priority:** P2

---

#### E13-S6: Revenue Analytics

**As a** business owner,
**I want to** track revenue metrics,
**So that** I can monitor business performance.

**Acceptance Criteria:**
- [ ] Metrics:
  - Total revenue (all-time, YTD, MTD)
  - Revenue by package type
  - Revenue by month (trend)
  - Average booking value
  - Revenue per guest (LTV)
- [ ] Charts: Line (revenue over time), Pie (package mix)

**Technical Notes:**
- Database queries (aggregate payments)
- Admin dashboard displays

**Story Points:** 5
**Priority:** P1

---

#### E13-S7: Partner Performance Analytics

**As a** business owner,
**I want to** track partner performance,
**So that** I can identify top partners.

**Acceptance Criteria:**
- [ ] Metrics:
  - Total partners
  - Active partners (generated ≥1 referral)
  - Top 10 partners by bookings
  - Referral conversion rate (clicks → bookings)
  - Points issued vs redeemed

**Technical Notes:**
- Database queries (aggregate referrals)
- Admin dashboard

**Story Points:** 5
**Priority:** P2

---

#### E13-S8: Guest Satisfaction Analytics

**As a** business owner,
**I want to** track guest satisfaction,
**So that** I can improve the experience.

**Acceptance Criteria:**
- [ ] Metrics:
  - NPS score (trend over time)
  - Testimonial submission rate
  - Repeat booking rate
  - Referrals generated per guest

**Technical Notes:**
- NPS calculated from survey responses
- Database queries

**Story Points:** 3
**Priority:** P2

---

#### E13-S9: Custom Reports (Admin Export)

**As an** admin,
**I want to** generate custom reports,
**So that** I can analyze data externally.

**Acceptance Criteria:**
- [ ] Report types:
  - All bookings (CSV)
  - All payments (CSV)
  - Partner performance (CSV)
  - Testimonials (CSV)
- [ ] Date range filter
- [ ] Download button

**Technical Notes:**
- Server-side CSV generation
- `json2csv` package

**Story Points:** 5
**Priority:** P2

---

#### E13-S10: Real-Time Dashboard (Admin)

**As an** admin,
**I want to** see real-time metrics,
**So that** I can monitor platform health.

**Acceptance Criteria:**
- [ ] Metrics (auto-refresh every 60 seconds):
  - Active users (now)
  - Bookings today
  - Applications today
  - Revenue today
  - Failed payments (alerts)
- [ ] Alerts: Red badge for critical issues

**Technical Notes:**
- WebSocket or polling for real-time data
- Database queries

**Story Points:** 5
**Priority:** P3

---

## Story Prioritization Framework

### Priority Definitions

**P0 - Critical (MVP Blocker):**
- Required for first trip booking
- Security or payment-critical
- Legal compliance

**P1 - High (Core Features):**
- Needed for core user experience
- Required for Phase 1-2 launch
- High user impact

**P2 - Medium (Important but Not Urgent):**
- Enhances experience
- Can be added post-MVP
- Lower user impact

**P3 - Low (Nice to Have):**
- Future optimization
- Edge cases
- Low user impact

### Sprint Planning Recommendations

**Phase 1 (MVP) - Sprints 1-10:**
- Focus: P0 stories (all epics E1-E5)
- Velocity: 20-30 points/sprint
- Estimated sprints: 8-10 (4-5 months)

**Phase 2 (Scale) - Sprints 11-25:**
- Focus: P1 stories (epics E6-E10)
- Velocity: 25-35 points/sprint
- Estimated sprints: 12-15 (6-7 months)

**Phase 3 (Optimize) - Sprints 26+:**
- Focus: P2-P3 stories (epics E11-E13)
- Velocity: 30-40 points/sprint
- Estimated sprints: 8-10 (4-5 months)

---

## Appendix: Story Point Estimation Guide

**1 Point:** Trivial (1-2 hours)
- Add field to form
- Update copy/text
- Simple UI tweak

**2 Points:** Simple (half day)
- Create basic page
- Simple form
- Basic API endpoint

**3 Points:** Small (1 day)
- Component with logic
- Database query with filtering
- Integration (simple third-party)

**5 Points:** Medium (2-3 days)
- Complex component
- Multi-step form
- API with business logic

**8 Points:** Large (1 week)
- Feature with multiple components
- Complex integration
- Database schema changes

**13 Points:** Very Large (2 weeks)
- Major feature
- Multiple integrations
- Requires research/spike

**21 Points:** Epic-level (break down further)
- Too large to estimate
- Should be split into smaller stories

---

**End of Epics & User Stories Document**

Total Stories: 158
Total Estimated Points: ~700 points
Estimated Development Time: 12-18 months (2-developer team)
