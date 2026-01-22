# Duplicated formatCurrency and formatDate Functions

---
status: pending
priority: p2
issue_id: "013"
tags: [code-review, dry, maintainability]
dependencies: []
---

## Problem Statement

The `formatCurrency` function is duplicated 17 times across email templates, and `formatDate` is duplicated 25 times. This violates DRY and creates maintenance burden.

**Why it matters:** Bug fixes must be applied in 17+ places. Inconsistent formatting could occur between templates.

## Findings

**Source:** Pattern Recognition Agent

**Locations:**
- `formatCurrency`: 17 instances across email templates
- `formatDate`: 25 instances across email templates

**Canonical Implementation Exists:**
`/Users/grantcharge/Pickleball-Passport/lib/services/currency.ts:159` exports `formatCurrency`

## Proposed Solutions

### Option 1: Import from Shared Utility (Recommended)

```typescript
// In email templates
import { formatCurrency } from '@/lib/services/currency'
import { formatDate } from '@/lib/utils/date-formatting'

// Remove local implementations
```

**Pros:** Single source of truth, easier maintenance
**Cons:** Initial refactoring effort
**Effort:** Medium
**Risk:** Low

## Acceptance Criteria

- [ ] All email templates import formatCurrency from shared utility
- [ ] All email templates import formatDate from shared utility
- [ ] No duplicate implementations remain
- [ ] All email formats remain consistent

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during pattern review | 42+ duplicate utility functions |
