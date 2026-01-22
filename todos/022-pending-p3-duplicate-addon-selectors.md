# Near-Duplicate Add-On Selector Components

---
status: pending
priority: p3
issue_id: "022"
tags: [code-review, dry, refactoring]
dependencies: []
---

## Problem Statement

The `wellness-add-ons-selector.tsx` and `medical-add-ons-selector.tsx` components share ~80% identical code. This violates DRY and doubles maintenance effort.

## Findings

**Source:** Code Simplicity Reviewer Agent

**Locations:**
- `/Users/grantcharge/Pickleball-Passport/components/booking/wellness-add-ons-selector.tsx`
- `/Users/grantcharge/Pickleball-Passport/components/booking/medical-add-ons-selector.tsx`

## Proposed Solutions

Create single `AddOnsSelector` component with `categoryType: 'medical' | 'wellness'` prop.

**Estimated Savings:** ~200 LOC
**Effort:** Medium
**Risk:** Low

## Acceptance Criteria

- [ ] Single AddOnsSelector component created
- [ ] Both categories work correctly
- [ ] Old components removed
- [ ] ~200 LOC reduced

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during simplicity review | 80% code duplication |
