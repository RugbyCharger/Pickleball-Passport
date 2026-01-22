# Force Dynamic Disables Static Optimization

---
status: pending
priority: p3
issue_id: "025"
tags: [code-review, performance, next-js]
dependencies: []
---

## Problem Statement

The root layout has `export const dynamic = 'force-dynamic'` which disables static generation for the entire app, potentially impacting performance.

## Findings

**Source:** Performance Oracle + Architecture Strategist Agents

**Location:** `/Users/grantcharge/Pickleball-Passport/app/layout.tsx:8`

## Proposed Solutions

Configure proper build-time environment variables to enable static optimization where appropriate.

**Effort:** Medium (may require Clerk configuration changes)
**Risk:** Low

## Acceptance Criteria

- [ ] Static pages can be statically generated
- [ ] Dynamic pages properly marked
- [ ] Build time improved

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during architecture review | force-dynamic on root layout |
