# Sensitive PII Stored in Plaintext

---
status: pending
priority: p1
issue_id: "001"
tags: [code-review, security, privacy, compliance, critical]
dependencies: []
---

## Problem Statement

Multiple PII fields are stored without encryption in the database, including passport numbers, bank account details, and medical notes. This is a data privacy compliance risk (GDPR, PCI-DSS) and a security vulnerability.

**Why it matters:** A database breach would expose sensitive user data in plaintext. Bank account numbers stored unencrypted violate financial data handling best practices.

## Findings

**Source:** Security Sentinel + Data Integrity Guardian Agents

**Locations:**
- `/Users/grantcharge/Pickleball-Passport/prisma/schema.prisma:508` - `guestPassportNumber` (Government ID)
- `/Users/grantcharge/Pickleball-Passport/prisma/schema.prisma:279` - `medicalNotes` (Protected Health Information)
- `/Users/grantcharge/Pickleball-Passport/prisma/schema.prisma:897-898` - `accountNumber`, `routingNumber` (Bank details)

**Evidence:**
```prisma
// Line 897-898 - Contains TODO acknowledging the issue
accountNumber String // TODO: Encrypt in production
routingNumber String // TODO: Encrypt in production
```

## Proposed Solutions

### Option 1: Field-Level Encryption with Prisma Middleware (Recommended)
Create encryption middleware that automatically encrypts/decrypts sensitive fields.

**Pros:** Transparent to application code, centralized logic
**Cons:** Requires key management setup
**Effort:** Medium
**Risk:** Low

### Option 2: Use Stripe for Bank Details
Stop storing bank details locally - use Stripe Connect to manage payouts.

**Pros:** Eliminates PCI-DSS scope, industry best practice
**Cons:** Requires Stripe Connect integration
**Effort:** Large
**Risk:** Low

## Acceptance Criteria

- [ ] Passport numbers encrypted at rest
- [ ] Bank account details encrypted or moved to Stripe
- [ ] Medical notes encrypted at rest
- [ ] Encryption keys managed securely (env vars or secrets manager)
- [ ] Existing data migrated to encrypted format

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during security review | Multiple PII fields stored plaintext |

## Resources

- GDPR Article 32: Security of Processing
- PCI-DSS Requirement 3: Protect Stored Cardholder Data
