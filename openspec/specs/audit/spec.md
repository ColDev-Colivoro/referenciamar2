# Audit API Specification — ColdevConAC

## Purpose

Define the behavior of the Audit backend module for ColdevConAC. This spec covers
the `AuditEvent` model, the `log_audit_event()` helper, the `GET /api/v1/audit/`
list endpoint, and the quality retrofit that ensures Lot mutations are traceable.

Audit events are always scoped to a tenant. No event from another tenant may ever
be visible to a requesting user. The audit log is read-only from the API — events
are created exclusively by server-side helpers after successful mutations.

---

## Requirements

### Requirement: AuditEvent Model

The system MUST persist audit events in an `AuditEvent` model with the following
fields: `tenant` (FK → `TenantRegistry`, nullable), `actor` (FK → `AUTH_USER_MODEL`,
nullable), `action` (string, max 120 chars), `level` (string, default `"info"`),
`metadata` (JSON, default `{}`), `created_at` (auto timestamp).

The model MUST NOT expose events from tenant A to queries scoped to tenant B.
The default ordering MUST be `"-created_at"` (most recent first).

#### Scenario: AuditEvent is persisted with all fields

- GIVEN a tenant, an actor user, an action string, a level, and a metadata dict
- WHEN an `AuditEvent` is created with those values
- THEN the record is saved to the database
- AND `created_at` is populated automatically
- AND the event is retrievable only through the owning tenant's queryset

#### Scenario: AuditEvent can be created without actor or tenant

- GIVEN no actor and no tenant are provided
- WHEN an `AuditEvent` is created with only `action="system.boot"` and `level="info"`
- THEN the record is saved with `actor=NULL` and `tenant=NULL`
- AND no integrity error is raised

#### Scenario: Cross-tenant isolation at queryset level

- GIVEN tenant A has 3 audit events and tenant B has 2 audit events
- WHEN `AuditEvent.objects.filter(tenant=tenant_a)` is evaluated
- THEN exactly 3 events are returned
- AND none of the returned events belong to tenant B

---

### Requirement: log_audit_event Helper

The system MUST provide a `log_audit_event()` helper that creates an `AuditEvent`
record. The helper MUST accept keyword-only arguments: `action` (required),
`tenant` (optional), `actor` (optional), `level` (optional, default `"info"`),
`metadata` (optional dict, default `{}`).

The helper MUST be called after every successful mutation in the system (create,
update, delete, status change). It MUST NOT be called if the mutation fails or
raises an exception before committing.

The helper MUST capture the acting user as `actor`, the tenant from the request
context, the `action` as a namespaced string (e.g. `"users.create"`), and any
additional context in `metadata`.

#### Scenario: Helper creates event after successful mutation

- GIVEN a tenant object and an actor user exist
- WHEN `log_audit_event(action="users.create", tenant=tenant, actor=user, metadata={"username": "ana"})` is called
- THEN an `AuditEvent` record is created in the database
- AND `action="users.create"`, `actor=user`, `tenant=tenant`, `metadata={"username": "ana"}`
- AND `level` defaults to `"info"`

#### Scenario: Helper is NOT called when mutation fails

- GIVEN a `POST /api/v1/lots/` request with an invalid body
- WHEN the serializer raises a validation error and returns HTTP 400
- THEN no `AuditEvent` record is created for that failed request

#### Scenario: Helper accepts optional level override

- GIVEN a critical action is about to be recorded
- WHEN `log_audit_event(action="users.deactivate", tenant=tenant, actor=user, level="warning")` is called
- THEN the resulting `AuditEvent` has `level="warning"`

---

### Requirement: List Audit Events

The system MUST provide `GET /api/v1/audit/` that returns a paginated list of
`AuditEvent` records filtered to the requesting user's tenant.

The endpoint MUST require authentication (DRF Token). Unauthenticated requests
MUST receive HTTP 401.

The endpoint MUST be accessible only to users whose role is `global_admin` or
`tenant_admin`. Any other authenticated role MUST receive HTTP 403.

The response MUST be paginated with `page_size=50`. The response MUST include
`count`, `next`, `previous`, and `results`.

Each result item MUST include: `id`, `action`, `level`, `actor_email`,
`metadata`, `created_at`.

The endpoint MUST support optional query parameters: `action` (exact match),
`level` (exact match), `date_from` (ISO date, inclusive), `date_to` (ISO date, inclusive).

The endpoint MUST NOT return events belonging to any tenant other than the
requesting user's tenant, regardless of query parameters supplied.

#### Scenario: tenant_admin retrieves paginated audit events

- GIVEN a user with role `tenant_admin` is authenticated
- AND the current tenant has 60 audit events
- WHEN `GET /api/v1/audit/` is called with a valid token
- THEN the server returns HTTP 200
- AND `results` contains exactly 50 items
- AND `count` equals 60
- AND `next` is a non-null URL pointing to page 2

#### Scenario: global_admin can access the audit endpoint

- GIVEN a user with role `global_admin` is authenticated
- WHEN `GET /api/v1/audit/` is called
- THEN the server returns HTTP 200

#### Scenario: Unauthenticated request is rejected

- GIVEN no `Authorization` header is provided
- WHEN `GET /api/v1/audit/` is called
- THEN the server returns HTTP 401

#### Scenario: Unauthorized role receives 403

- GIVEN a user with role `monitor` is authenticated
- WHEN `GET /api/v1/audit/` is called
- THEN the server returns HTTP 403

#### Scenario: Cross-tenant isolation in API response

- GIVEN user U belongs to tenant A
- AND tenant B has 5 audit events
- WHEN `GET /api/v1/audit/` is called with user U's token and tenant A context
- THEN the server returns HTTP 200
- AND none of the returned events belong to tenant B
- AND `count` does NOT include tenant B's events

#### Scenario: Filter by action returns matching events only

- GIVEN the current tenant has 10 events with `action="lots.create"` and 5 with `action="users.create"`
- WHEN `GET /api/v1/audit/?action=lots.create` is called by a `tenant_admin`
- THEN the server returns HTTP 200
- AND all items in `results` have `action="lots.create"`
- AND items with `action="users.create"` are NOT present

#### Scenario: Filter by level returns matching events only

- GIVEN the current tenant has events with `level="info"` and `level="warning"`
- WHEN `GET /api/v1/audit/?level=warning` is called
- THEN only events with `level="warning"` are returned

#### Scenario: Filter by date_from excludes older events

- GIVEN the current tenant has events on 2024-01-01 and 2024-06-01
- WHEN `GET /api/v1/audit/?date_from=2024-03-01` is called
- THEN only the event from 2024-06-01 is returned
- AND the event from 2024-01-01 is NOT present

#### Scenario: Filter by date_to excludes newer events

- GIVEN the current tenant has events on 2024-01-01 and 2024-06-01
- WHEN `GET /api/v1/audit/?date_to=2024-03-01` is called
- THEN only the event from 2024-01-01 is returned
- AND the event from 2024-06-01 is NOT present

#### Scenario: Combined filters narrow results correctly

- GIVEN the current tenant has events with various actions and dates
- WHEN `GET /api/v1/audit/?action=lots.update&date_from=2024-01-01&date_to=2024-12-31` is called
- THEN only events matching `action="lots.update"` AND within the date range are returned

---

### Requirement: Quality Retrofit — Lot Mutation Audit Logging

The system MUST call `log_audit_event` after each of the following successful
Lot mutations in `quality/views.py`:

- `POST /api/v1/lots/` — MUST log `action="lots.create"`
- `PATCH /api/v1/lots/{id}/` — MUST log `action="lots.update"`
- `PATCH /api/v1/lots/{id}/status/` — MUST log `action="lots.change_status"`

Each call MUST pass `tenant=request.tenant`, `actor=request.user`, and a
`metadata` dict containing at minimum the `lot_id`.

These calls MUST NOT be made if the mutation returns a non-2xx response.

#### Scenario: Creating a lot generates a lots.create audit event

- GIVEN a user with role `manager` is authenticated
- AND the request body contains valid lot data
- WHEN `POST /api/v1/lots/` is called and returns HTTP 201
- THEN an `AuditEvent` with `action="lots.create"` exists in the database
- AND the event's `tenant` matches the request's tenant
- AND the event's `actor` matches the authenticated user

#### Scenario: Updating a lot generates a lots.update audit event

- GIVEN a lot with `id=7` exists in the current tenant
- AND a user with role `manager` is authenticated
- WHEN `PATCH /api/v1/lots/7/` is called with `{quantity_kg: 500}` and returns HTTP 200
- THEN an `AuditEvent` with `action="lots.update"` exists in the database
- AND `metadata` contains at minimum `{"lot_id": 7}`

#### Scenario: Changing lot status generates a lots.change_status audit event

- GIVEN a lot with `status="pending"` exists in the current tenant
- WHEN `PATCH /api/v1/lots/{id}/status/` is called with `{status: "in_process"}` and returns HTTP 200
- THEN an `AuditEvent` with `action="lots.change_status"` exists in the database
- AND `metadata` contains at minimum `{"lot_id": <id>}`

#### Scenario: Failed lot creation does NOT generate an audit event

- GIVEN a user with role `manager` is authenticated
- AND the request body is missing required fields
- WHEN `POST /api/v1/lots/` is called and returns HTTP 400
- THEN NO `AuditEvent` with `action="lots.create"` is created

#### Scenario: Invalid status transition does NOT generate an audit event

- GIVEN a lot with `status="pending"` exists
- WHEN `PATCH /api/v1/lots/{id}/status/` is called with `{status: "approved"}` (invalid transition)
- THEN the server returns HTTP 400
- AND NO `AuditEvent` with `action="lots.change_status"` is created
