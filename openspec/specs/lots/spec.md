# Lots API Specification

## Purpose

Define the behavior of the Lot (Lote) backend API for ColdevConAC. This spec covers
the `Lot` model, CRUD endpoints, status transition endpoint, tenant isolation, and
role-based authorization for the `/api/v1/lots/` resource.

A **Lot** is the central operational unit of the fishing quality-control platform.
Every lot belongs to exactly one tenant. All access is mediated by DRF Token
authentication and `TenantContextMiddleware`.

---

## Requirements

### Requirement: Lot Model

The system MUST persist lots in a `Lot` model with the following fields:
`code`, `species`, `origin`, `entry_date`, `status`, `quantity_kg`,
`tenant` (FK → `TenantRegistry`), `created_by` (FK → `AUTH_USER_MODEL`),
`created_at`, `updated_at`.

The `status` field MUST be one of: `pending`, `in_process`, `approved`, `rejected`.
The default status MUST be `pending`.

The system MUST enforce uniqueness of `code` per tenant via
`unique_together = ('code', 'tenant')`.

The system SHOULD auto-generate `code` in the format `LOT-{year}-{seq:03d}` (unique
per tenant) when no code is provided on creation.

#### Scenario: Lot is created with all required fields

- GIVEN a valid tenant and authenticated user exist
- WHEN a `Lot` instance is saved with `species`, `origin`, `entry_date`, and `quantity_kg`
- THEN the lot is persisted in the database
- AND `status` defaults to `pending`
- AND `created_at` and `updated_at` are populated automatically

#### Scenario: Duplicate code in same tenant is rejected

- GIVEN a lot with `code="LOT-2024-001"` exists for tenant A
- WHEN a second lot with the same `code` and same tenant A is saved
- THEN a database integrity error is raised
- AND no second lot is persisted

#### Scenario: Same code in different tenants is allowed

- GIVEN a lot with `code="LOT-2024-001"` exists for tenant A
- WHEN a lot with `code="LOT-2024-001"` is saved for tenant B
- THEN the lot is persisted successfully
- AND both lots coexist without conflict

#### Scenario: Code is auto-generated when omitted

- GIVEN a lot is created without providing a `code`
- WHEN the model's `save()` method is called
- THEN `code` is auto-populated with pattern `LOT-{year}-{seq:03d}`
- AND the generated code is unique within the tenant

---

### Requirement: List Lots

The system MUST provide `GET /api/v1/lots/` to return all lots belonging to the
current tenant context resolved by `TenantContextMiddleware`.

The endpoint MUST require authentication. Unauthenticated requests MUST receive
HTTP 401.

The response MUST be a JSON array. Each item MUST include:
`id`, `code`, `species`, `origin`, `entry_date`, `status`, `quantity_kg`,
`created_by` (username), `created_at`, `updated_at`.

The endpoint MUST NOT expose lots from any other tenant.

#### Scenario: Authenticated user lists lots in their tenant

- GIVEN a user is authenticated with a valid token
- AND the current tenant has 5 lots
- WHEN `GET /api/v1/lots/` is called
- THEN the server returns HTTP 200
- AND the response contains exactly 5 lot objects
- AND every object has a `status` field

#### Scenario: Unauthenticated request is rejected

- GIVEN no `Authorization` header is provided
- WHEN `GET /api/v1/lots/` is called
- THEN the server returns HTTP 401

#### Scenario: Lots from other tenants are not visible

- GIVEN user U is a member of tenant A
- AND tenant B has 3 lots
- WHEN `GET /api/v1/lots/` is called with tenant A context and U's token
- THEN the server returns HTTP 200
- AND the response does NOT contain any lot belonging to tenant B

---

### Requirement: Create Lot

The system MUST provide `POST /api/v1/lots/` to create a new lot in the current
tenant context.

The system MUST automatically assign `tenant` from `request.tenant` and
`created_by` from `request.user`. The caller MUST NOT be able to override these
fields.

The system MUST return HTTP 201 with the created lot on success.

The system MUST log an audit event `lots.create` on successful creation.

The system MUST return HTTP 400 if required fields (`species`, `origin`,
`entry_date`, `quantity_kg`) are missing or invalid.

#### Scenario: Manager creates a lot successfully

- GIVEN a user with role `manager` is authenticated
- AND the request body contains valid `species`, `origin`, `entry_date`, `quantity_kg`
- WHEN `POST /api/v1/lots/` is called
- THEN the server returns HTTP 201
- AND the response body contains the new lot with `status: "pending"`
- AND `tenant` and `created_by` are set from the request context
- AND an audit event `lots.create` is logged

#### Scenario: Create lot without required fields returns 400

- GIVEN a user with role `manager` is authenticated
- AND the request body is missing `species`
- WHEN `POST /api/v1/lots/` is called
- THEN the server returns HTTP 400
- AND the response body identifies `species` as a missing field
- AND no lot is persisted

#### Scenario: Monitor role cannot create lots

- GIVEN a user with role `monitor` is authenticated
- WHEN `POST /api/v1/lots/` is called with a valid body
- THEN the server returns HTTP 403

---

### Requirement: Get Lot Detail

The system MUST provide `GET /api/v1/lots/{id}/` to return a single lot by ID.

The system MUST return HTTP 404 if the lot does not belong to the current tenant,
even if the ID exists in another tenant.

The response MUST include the same fields as the list endpoint.

#### Scenario: Authenticated user retrieves an existing lot

- GIVEN a lot with `id=7` exists in the current tenant
- WHEN `GET /api/v1/lots/7/` is called with a valid token
- THEN the server returns HTTP 200
- AND the response body contains the lot with all required fields

#### Scenario: Lot from another tenant returns 404

- GIVEN a lot with `id=99` exists in tenant B
- AND the authenticated user belongs to tenant A
- WHEN `GET /api/v1/lots/99/` is called with tenant A context
- THEN the server returns HTTP 404

#### Scenario: Non-existent lot returns 404

- GIVEN no lot with `id=9999` exists in the current tenant
- WHEN `GET /api/v1/lots/9999/` is called
- THEN the server returns HTTP 404

---

### Requirement: Update Lot

The system MUST provide `PATCH /api/v1/lots/{id}/` to partially update a lot's
editable fields: `species`, `origin`, `entry_date`, `quantity_kg`.

The system MUST NOT allow updating `tenant`, `created_by`, `created_at`, or
`status` via this endpoint.

The system MUST return HTTP 404 if the lot does not belong to the current tenant.

The system MUST log an audit event `lots.update` on successful update.

#### Scenario: Manager updates lot fields

- GIVEN a lot with `id=7` exists in the current tenant
- AND a user with role `manager` is authenticated
- WHEN `PATCH /api/v1/lots/7/` is called with `{quantity_kg: 500}`
- THEN the server returns HTTP 200
- AND the lot's `quantity_kg` is updated to 500
- AND `updated_at` reflects the modification time
- AND an audit event `lots.update` is logged

#### Scenario: Update attempt on another tenant's lot returns 404

- GIVEN a lot with `id=50` belongs to tenant B
- AND the authenticated user belongs to tenant A
- WHEN `PATCH /api/v1/lots/50/` is called with tenant A context
- THEN the server returns HTTP 404

#### Scenario: Production supervisor cannot update lot fields

- GIVEN a user with role `production_supervisor` is authenticated
- WHEN `PATCH /api/v1/lots/7/` is called
- THEN the server returns HTTP 403

---

### Requirement: Change Lot Status

The system MUST provide `PATCH /api/v1/lots/{id}/status/` to transition the lot's
status, accepting a JSON body `{status: "<new_status>"}`.

The system MUST enforce valid transitions only:
- `pending` → `in_process`
- `in_process` → `approved`
- `in_process` → `rejected`

The system MUST return HTTP 400 with an error message if the requested transition
is not allowed.

The system MUST return HTTP 200 with the updated lot on success.

The system MUST log an audit event `lots.change_status` on every successful
transition.

#### Scenario: Manager advances lot from pending to in_process

- GIVEN a lot with `status="pending"` exists in the current tenant
- AND a user with role `manager` is authenticated
- WHEN `PATCH /api/v1/lots/{id}/status/` is called with `{status: "in_process"}`
- THEN the server returns HTTP 200
- AND the lot's `status` is now `"in_process"`
- AND an audit event `lots.change_status` is logged

#### Scenario: Invalid status transition returns 400

- GIVEN a lot with `status="pending"` exists
- WHEN `PATCH /api/v1/lots/{id}/status/` is called with `{status: "approved"}`
- THEN the server returns HTTP 400
- AND the response body contains an error describing the invalid transition
- AND the lot's status remains `"pending"`

#### Scenario: Approved lot cannot be transitioned further

- GIVEN a lot with `status="approved"` exists
- WHEN `PATCH /api/v1/lots/{id}/status/` is called with `{status: "in_process"}`
- THEN the server returns HTTP 400
- AND the lot's status remains `"approved"`

#### Scenario: Lot can be rejected from in_process

- GIVEN a lot with `status="in_process"` exists
- AND a user with role `quality_manager` is authenticated
- WHEN `PATCH /api/v1/lots/{id}/status/` is called with `{status: "rejected"}`
- THEN the server returns HTTP 200
- AND the lot's `status` is now `"rejected"`

---

### Requirement: Lot Authorization

The system MUST enforce role-based access for all lot write operations.

The following roles MUST have full read and write access to lots:
`manager`, `tenant_admin`, `global_admin`, `quality_manager`.

The following roles MUST have read-only access (list, detail):
`monitor`, `production_supervisor`.

Any authenticated user with an active membership in the current tenant MUST be
able to read lots. Unauthenticated or inactive-membership requests MUST receive
HTTP 401 or HTTP 403 respectively.

#### Scenario: quality_manager can create and update lots

- GIVEN a user with role `quality_manager` is authenticated
- WHEN `POST /api/v1/lots/` is called with a valid body
- THEN the server returns HTTP 201

#### Scenario: monitor role receives 403 on write operations

- GIVEN a user with role `monitor` is authenticated
- WHEN `POST /api/v1/lots/` is called
- THEN the server returns HTTP 403

#### Scenario: production_supervisor can read but not write

- GIVEN a user with role `production_supervisor` is authenticated
- WHEN `GET /api/v1/lots/` is called
- THEN the server returns HTTP 200
- WHEN `POST /api/v1/lots/` is called
- THEN the server returns HTTP 403

#### Scenario: Inactive membership is rejected

- GIVEN a user's `UserMembership.is_active` is `False`
- WHEN any `/api/v1/lots/` endpoint is called with that user's token
- THEN the server returns HTTP 403
