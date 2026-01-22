# Unused State Machine Methods

---
status: pending
priority: p3
issue_id: "027"
tags: [code-review, cleanup, dead-code]
dependencies: []
---

## Problem Statement

The gift state machine has methods that are only used in tests, not production: `getTerminalStates()`, `getAllStates()`, `isInitialState()`.

## Findings

**Source:** Code Simplicity Reviewer Agent

**Location:** `/Users/grantcharge/Pickleball-Passport/lib/gift/gift-state-machine.ts:151-177`

## Proposed Solutions

Remove unused methods (~35 LOC) unless there's a documented planned use case.

**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] Unused methods removed
- [ ] Or: Methods documented with planned usage

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during simplicity review | Methods only used in tests |
