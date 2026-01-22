# Duplicate escapeHtml Function

---
status: pending
priority: p3
issue_id: "028"
tags: [code-review, dry, cleanup]
dependencies: []
---

## Problem Statement

A local `escapeHtml` function exists in gift-transition-service.ts when `@/lib/utils/html-escape` already exports this utility.

## Findings

**Source:** Code Simplicity Reviewer Agent

**Locations:**
- `/Users/grantcharge/Pickleball-Passport/lib/gift/gift-transition-service.ts:71-78` (duplicate)
- `/Users/grantcharge/Pickleball-Passport/lib/utils/html-escape.ts` (canonical)

## Proposed Solutions

Import from shared utility instead of defining locally.

**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] Local escapeHtml removed
- [ ] Import from @/lib/utils/html-escape
- [ ] Consistent XSS protection

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during simplicity review | Duplicate utility function |
