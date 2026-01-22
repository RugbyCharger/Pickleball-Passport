# N+1 Query Patterns Causing Performance Issues

---
status: pending
priority: p1
issue_id: "003"
tags: [code-review, performance, database, critical]
dependencies: []
---

## Problem Statement

Multiple N+1 query patterns exist in the codebase that will cause significant performance degradation as data grows. The partner dashboard and user stats are particularly affected.

**Why it matters:** N+1 queries cause linear scaling of database calls with data size. A partner with 100 referrals would trigger 100+ database queries instead of 1.

## Findings

**Source:** Performance Oracle Agent

**Locations:**

1. **Partner Dashboard Stats** - `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/partner.ts:113-139`
   - Separate queries for each stat instead of aggregation

2. **User Stats** - `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/user.ts:248-261`
   - Multiple sequential COUNT queries that could be combined

3. **Analytics Events** - Missing composite indexes
   - `/Users/grantcharge/Pickleball-Passport/prisma/schema.prisma:2268-2275`

4. **Unbounded Analytics Query** - `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/analytics.ts:233-237`
   - No limit on returned records

## Proposed Solutions

### Option 1: Combine Queries with Aggregation (Recommended)

```typescript
// Instead of multiple COUNT queries:
const stats = await ctx.db.$queryRaw`
  SELECT
    COUNT(*) FILTER (WHERE status = 'CONFIRMED') as confirmed,
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
    SUM(CASE WHEN status = 'CONFIRMED' THEN total_price ELSE 0 END) as revenue
  FROM "Booking"
  WHERE "userId" = ${userId}
`
```

**Pros:** Single database roundtrip
**Cons:** Raw SQL may be less type-safe
**Effort:** Medium
**Risk:** Low

### Option 2: Add Database Views
Create materialized views for common stat aggregations.

**Pros:** Fast queries, pre-computed
**Cons:** Requires view refresh strategy
**Effort:** Medium
**Risk:** Medium

## Acceptance Criteria

- [ ] Partner dashboard loads with single aggregation query
- [ ] User stats use combined COUNT query
- [ ] Composite indexes added for analytics queries
- [ ] All list queries have reasonable limits
- [ ] Query execution time < 100ms for dashboard loads

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during performance review | Multiple N+1 patterns found |

## Resources

- Prisma Performance Guide
- PostgreSQL Aggregate Functions
