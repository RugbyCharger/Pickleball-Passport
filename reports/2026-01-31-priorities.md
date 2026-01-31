# Prioritized Feature Report - January 31, 2026

## Priority 1: Emergency Alert SMS on Trips Page
**Impact:** High | **Effort:** Low | **Status:** Ready

The emergency alert SMS dialog was implemented in Phase 16 but only integrated into the bookings page. Need to add it to the admin trips page where trip context is available for broadcasting to all guests on a trip.

**Acceptance Criteria:**
- Admin can send emergency SMS to all guests on a specific trip
- Dialog accessible from trips list and trip detail pages
- Uses existing sendEmergencyAlertSMS tRPC procedure

---

## Priority 2: Mobile App Deep Links for Testimonials
**Impact:** Medium | **Effort:** Medium | **Status:** Needs Research

The 7-day post-trip email requests testimonials but links to web. Should deep link to mobile app testimonial screen when app is installed.

**Acceptance Criteria:**
- Email detects if user has mobile app installed
- Links open native testimonial screen on mobile
- Falls back to web if app not installed

---

## Priority 3: Admin Dashboard Analytics Widgets
**Impact:** Medium | **Effort:** High | **Status:** Backlog

Add at-a-glance metrics to admin dashboard: bookings this month, revenue, pending testimonials, upcoming trips.

---

## Priority 4: Referral Partner Leaderboard Caching
**Impact:** Low | **Effort:** Low | **Status:** Backlog

Leaderboard query is slow. Add Redis caching with 15-minute TTL.

---

*Report generated: 2026-01-31*
