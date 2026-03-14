# Spec: Reports API — Backend

**Change**: reports-base  
**Domain**: reports  
**Version**: 1.0

---

## Requirements

### REQ-R-01 — Lot Summary Endpoint

The system **MUST** provide `GET /api/v1/reports/lots/summary/` that returns aggregate lot counts for the current tenant.

The response **MUST** include the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total lots for the tenant (all statuses) |
| `this_month` | integer | Lots whose `entry_date` falls in the current calendar month |
| `by_status.pending` | integer | Lots with `status="pending"` |
| `by_status.in_process` | integer | Lots with `status="in_process"` |
| `by_status.approved` | integer | Lots with `status="approved"` |
| `by_status.rejected` | integer | Lots with `status="rejected"` |

The endpoint **MUST** require `TokenAuthentication` + `IsAuthenticated`.  
The endpoint **MUST** be scoped to the tenant resolved by `TenantContextMiddleware`.  
The endpoint **MUST** return HTTP 403 if `get_request_membership` returns `None` or membership is inactive.  
The endpoint **MUST NOT** expose data from any other tenant.

#### Scenario R-01-A: Authenticated member retrieves lot summary

```
Given a tenant has 3 pending, 2 in_process, 1 approved, 0 rejected lots
And 2 of those lots have entry_date in the current month
When GET /api/v1/reports/lots/summary/ with a valid token
Then HTTP 200 is returned
And response contains:
  total: 6
  this_month: 2
  by_status: {pending: 3, in_process: 2, approved: 1, rejected: 0}
```

#### Scenario R-01-B: Unauthenticated request is rejected

```
Given no Authorization header is provided
When GET /api/v1/reports/lots/summary/
Then HTTP 401 is returned
```

#### Scenario R-01-C: Data from other tenants is excluded

```
Given Tenant A has 4 lots and Tenant B has 7 lots
And the authenticated user belongs to Tenant A
When GET /api/v1/reports/lots/summary/ with Tenant A context
Then total == 4 (Tenant B lots are not included)
```

---

### REQ-R-02 — Form Summary Endpoint

The system **MUST** provide `GET /api/v1/reports/forms/summary/` that returns aggregate `QualityForm` counts for the current tenant.

The response **MUST** include:

| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total quality forms for the tenant |
| `by_type` | object | Counts keyed by `form_type` value |
| `by_status.draft` | integer | Forms with `status="draft"` |
| `by_status.submitted` | integer | Forms with `status="submitted"` |
| `by_status.approved` | integer | Forms with `status="approved"` |
| `by_status.rejected` | integer | Forms with `status="rejected"` |

The endpoint **MUST** require authentication and active tenant membership.  
The endpoint **MUST** be tenant-scoped.

#### Scenario R-02-A: Form summary returns correct counts

```
Given a tenant has:
  - 3 forms of type "recepcion_materia_prima" (2 submitted, 1 approved)
  - 2 forms of type "control_temperatura" (both draft)
When GET /api/v1/reports/forms/summary/
Then HTTP 200 is returned
And by_type.recepcion_materia_prima == 3
And by_type.control_temperatura == 2
And by_status.draft == 2, submitted == 2, approved == 1, rejected == 0
```

#### Scenario R-02-B: Tenant with no forms returns zero counts

```
Given a tenant has no QualityForms
When GET /api/v1/reports/forms/summary/
Then HTTP 200 is returned
And total == 0
And by_status all fields are 0
```

---

### REQ-R-03 — Activity Feed Endpoint

The system **MUST** provide `GET /api/v1/reports/activity/` that returns the last 20 `AuditEvent` rows for the current tenant, ordered by `created_at` descending.

The response **MUST** be a JSON array. Each item **MUST** include:

| Field | Type |
|-------|------|
| `id` | integer |
| `action` | string |
| `level` | string |
| `actor` | string (username or `null`) |
| `created_at` | ISO 8601 datetime string |
| `metadata` | object |

The endpoint **MUST** require authentication and active tenant membership.  
Any active tenant member (any role) **MAY** access this endpoint — no elevated role is required.  
The endpoint **MUST** return at most 20 events (hard limit, no pagination).

#### Scenario R-03-A: Active member retrieves recent activity

```
Given a tenant has 25 audit events
When GET /api/v1/reports/activity/ by any authenticated active member
Then HTTP 200 is returned
And the response contains exactly 20 items (the 20 most recent)
And items are ordered newest-first
```

#### Scenario R-03-B: Inactive membership is rejected

```
Given a user's UserMembership.is_active is False
When GET /api/v1/reports/activity/
Then HTTP 403 is returned
```

---

### REQ-R-04 — Dashboard Endpoint

The system **MUST** provide `GET /api/v1/reports/dashboard/` that returns a single combined response for the dashboard page.

The response **MUST** include:

| Field | Type | Source |
|-------|------|--------|
| `lot_summary` | object | Same shape as REQ-R-01 response |
| `form_summary` | object | Same shape as REQ-R-02 response |
| `recent_activity` | array | Same shape as REQ-R-03 response (max 20 items) |

The endpoint **MUST** require authentication and active tenant membership.  
All three aggregations **MUST** be computed within a single request (no additional HTTP round-trips).  
The endpoint **MUST** be tenant-scoped.

#### Scenario R-04-A: Dashboard returns all sections

```
Given a tenant with lots, forms, and audit events
When GET /api/v1/reports/dashboard/ with a valid token
Then HTTP 200 is returned
And the response body contains keys: lot_summary, form_summary, recent_activity
And lot_summary.total matches the actual lot count
And recent_activity has at most 20 items
```

#### Scenario R-04-B: Empty tenant dashboard returns zero counts

```
Given a brand-new tenant with no lots, forms, or audit events
When GET /api/v1/reports/dashboard/
Then HTTP 200 is returned
And lot_summary.total == 0
And form_summary.total == 0
And recent_activity == []
```
