# Missing Agent-Native APIs for Programmatic Access

---
status: pending
priority: p2
issue_id: "019"
tags: [code-review, api, agent-native]
dependencies: []
---

## Problem Statement

Several critical features available in the UI have no API equivalent, preventing programmatic/agent access. The application is approximately 75% agent-native.

**Why it matters:** External integrations, automation, and AI agents cannot perform actions that users can do manually.

## Findings

**Source:** Agent-Native Reviewer Agent

**Missing APIs:**
1. **System Health Check** - No endpoint to verify system status
2. **User List/Search (Admin)** - Cannot list or search users programmatically
3. **Gift Creation API** - Can accept/decline but not create gift bookings
4. **Retry Failed Payment** - Users can retry payments in UI, no API
5. **Bulk Operations** - Missing bulk reject, bulk trip status update
6. **Financial Report Export** - No programmatic report generation

**Capability Score:** 27/36 documented actions have API equivalents (75%)

## Proposed Solutions

### Option 1: Add Missing API Endpoints (Recommended)

Create the following tRPC procedures:
```typescript
admin.system.healthCheck
admin.users.list
admin.users.search
gift.createGiftBooking
gift.resendGiftEmail
payment.retryFailedPayment
admin.reports.exportFinancial
```

**Pros:** Full agent parity, enables automation
**Cons:** Development effort
**Effort:** Large
**Risk:** Low

## Acceptance Criteria

- [ ] Health check endpoint exists and returns system status
- [ ] Admin can list and search users via API
- [ ] Gifts can be created programmatically
- [ ] Failed payments can be retried via API
- [ ] Financial reports can be generated via API

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during agent-native review | 75% agent-native coverage |
