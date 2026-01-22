# Mixed Export Styles in Components

---
status: pending
priority: p3
issue_id: "026"
tags: [code-review, consistency, style]
dependencies: []
---

## Problem Statement

18 components use `export default` while 78 use named exports. Inconsistent patterns make refactoring harder.

## Findings

**Source:** Pattern Recognition Agent

**Pattern:**
- Named exports: 78 components
- Default exports: 18 components

## Proposed Solutions

Standardize on named exports for better refactoring support and tree-shaking.

**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] All components use named exports
- [ ] Import statements updated
- [ ] ESLint rule added to enforce

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during pattern review | Inconsistent export patterns |
