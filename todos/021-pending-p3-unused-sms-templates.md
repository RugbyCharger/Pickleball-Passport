# Unused SMS Templates (Dead Code)

---
status: pending
priority: p3
issue_id: "021"
tags: [code-review, cleanup, dead-code]
dependencies: []
---

## Problem Statement

The SMS templates file contains 89 lines of code that is never called anywhere in the codebase. Functions like `paymentFailureSMS`, `flightDelaySMS` are exported but unused.

## Findings

**Source:** Code Simplicity Reviewer Agent

**Location:** `/Users/grantcharge/Pickleball-Passport/lib/sms/templates.ts`

## Proposed Solutions

Delete the file or mark as dead code until SMS functionality is actually implemented.

**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] Unused SMS template file removed
- [ ] Or: SMS functionality completed and templates used

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during simplicity review | 89 lines of unused code |
