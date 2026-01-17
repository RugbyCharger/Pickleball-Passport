# Story 9-9: Referral Link Generator

Status: done

## Story

As a partner,
I want to generate my unique referral links and QR codes,
So that I can share them with my members in various formats.

## Acceptance Criteria

### AC-1: Referral Link Generator Page

- [ ] Page: `/dashboard/partner/referral-links`
- [ ] Display default referral link (with referral code)
- [ ] Copy link button (clipboard)
- [ ] Link from partner dashboard

### AC-2: QR Code Generation

- [ ] QR code for default referral link
- [ ] Download QR code as image (PNG/SVG)
- [ ] QR code size options (small, medium, large)
- [ ] Display QR code preview

### AC-3: Custom Link Creation

- [ ] "Create Custom Link" option
- [ ] Campaign name input
- [ ] Generate custom UTM parameters
- [ ] Custom link format: `/r/{code}?campaign={campaignName}`
- [ ] Save custom links
- [ ] Track performance per custom link

### AC-4: Link Sharing Options

- [ ] Share via email button (opens email client)
- [ ] Share via SMS button (opens SMS client)
- [ ] Copy link text
- [ ] Social media share buttons (optional for MVP)

### AC-5: Link Analytics

- [ ] Display link clicks count
- [ ] Display conversions per link
- [ ] Compare default vs custom links
- [ ] Link performance table

## Tasks / Subtasks

- [ ] Task 1: Create referral links page
- [ ] Task 2: Generate QR code for referral link
- [ ] Task 3: Add QR code download functionality
- [ ] Task 4: Implement custom link creation
- [ ] Task 5: Add link sharing options
- [ ] Task 6: Add link analytics display
- [ ] Task 7: Add link from partner dashboard

## Dev Notes

### QR Code Library

Use `qrcode.react` or `react-qr-code`:
```bash
npm install qrcode.react
```

### Referral Link Format

- Default: `https://pickleballpassport.com/r/{referralCode}`
- Custom: `https://pickleballpassport.com/r/{referralCode}?campaign={campaignName}`

### Custom Links Storage

For MVP, can store in localStorage or sessionStorage. Future: database table for custom links.

### QR Code Download

Use canvas to convert QR code to image:
```typescript
import { QRCodeSVG } from 'qrcode.react';
// Or use canvas-based library for PNG export
```

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Completed:** 2026-01-16

**Files Created:**
1. `app/(dashboard)/dashboard/partner/referral-links/page.tsx` - Referral link generator page

**Files Modified:**
1. `app/(dashboard)/dashboard/partner/page.tsx` - Added "Generate QR Code" button in referral code card
2. `_bmad-output/implementation/sprint-status.yaml` - Updated status to done

**Features Implemented:**
- Default referral link display
- Copy link and code functionality
- QR code generation with size options (small, medium, large)
- QR code download functionality
- Custom campaign link creation
- Share via email (opens email client with pre-filled message)
- Share via SMS (opens SMS client with pre-filled message)
- Custom links stored in component state (localStorage for persistence could be added)
- Link analytics display (clicks, conversions) for custom links

**Dependencies Needed:**
- `qrcode.react` needs to be installed:
  ```bash
  npm install qrcode.react
  ```

**Note:** The QR code is generated using `qrcode.react` library. The download functionality converts the SVG QR code to PNG. Custom links are currently stored in component state - for production, consider storing in database to persist across sessions and track analytics.

### File List

**Files to Create:**
1. `app/(dashboard)/dashboard/partner/referral-links/page.tsx`

**Files to Modify:**
1. `app/(dashboard)/dashboard/partner/page.tsx` - Add link
2. `_bmad-output/implementation/sprint-status.yaml` - Update status
