# Unused Logger Functions

---
status: pending
priority: p3
issue_id: "024"
tags: [code-review, cleanup, dead-code]
dependencies: []
---

## Problem Statement

Several specialized logger functions are defined but never used: `logDbOperation`, `logApiRequest`, `logPaymentEvent`. Only `logError` and `logStripeError` are actually called.

## Findings

**Source:** Code Simplicity Reviewer Agent

**Location:** `/Users/grantcharge/Pickleball-Passport/lib/logger/index.ts:174-211`

## Proposed Solutions

Remove unused functions (~40 LOC) or document planned usage.

**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] Unused logger functions removed
- [ ] Or: Functions put into use with documentation

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during simplicity review | ~40 lines of unused code |
