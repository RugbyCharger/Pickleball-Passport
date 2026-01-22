# Direct Prisma Imports Instead of Context

---
status: pending
priority: p2
issue_id: "020"
tags: [code-review, architecture, testability]
dependencies: []
---

## Problem Statement

Some tRPC routers import prisma directly instead of using `ctx.db`, creating inconsistency and reducing testability.

**Why it matters:** Direct imports make testing harder (can't mock easily) and bypass any middleware applied to the context.

## Findings

**Source:** Architecture Strategist Agent

**Affected Routers:**
- `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/application.ts`
- `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/newsletter.ts`
- `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/contact.ts`

## Proposed Solutions

### Option 1: Use ctx.db Consistently (Recommended)

```typescript
// Before
import { prisma } from '@/lib/db'
const result = await prisma.user.findMany()

// After
const result = await ctx.db.user.findMany()
```

**Pros:** Consistent, testable, follows established pattern
**Cons:** Minor refactoring effort
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] All routers use ctx.db for database access
- [ ] No direct prisma imports in routers
- [ ] Tests can mock database context

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during architecture review | Inconsistent database access patterns |
