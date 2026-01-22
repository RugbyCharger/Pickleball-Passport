# Missing Content Security Policy Headers

---
status: pending
priority: p3
issue_id: "023"
tags: [code-review, security, headers]
dependencies: []
---

## Problem Statement

The application does not implement Content Security Policy (CSP) headers, reducing defense-in-depth against XSS attacks.

## Findings

**Source:** Security Sentinel Agent

**Note:** The `dangerouslySetInnerHTML` usage found is safe (JSON-LD), but CSP provides additional protection.

## Proposed Solutions

Add CSP headers in middleware or next.config.js.

**Effort:** Small
**Risk:** Low (may need tuning for third-party scripts)

## Acceptance Criteria

- [ ] CSP headers configured
- [ ] Third-party integrations (Stripe, Clerk, etc.) still work
- [ ] XSS protection enhanced

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during security review | No CSP headers |
