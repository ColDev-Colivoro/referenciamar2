# Users Specification — ColdevConAC

## Purpose

Define the behavior of the user and role management system for ColdevConAC.
This spec covers the backend API for listing, creating, updating, and deactivating
user memberships within a tenant, as well as the canonical role catalog and
the permission model that controls who may manage users.

A "user" in this context is always a `UserMembership` — the binding between a
Django `User`, a `TenantRegistry`, and a `Role`. Users exist globally in Django's
auth system; their access to a tenant is governed exclusively by memberships.

---

## Requirements

### Requirement: Canonical Role Seed

The system MUST provide a way to populate the `Role` table with the canonical
set of roles used across all tenants. The seed operation MUST be idempotent —
running it multiple times MUST NOT create duplicates.

Each canonical role MUST have a `code`, a `name`, and a `permissions` array
that lists the string-coded capabilities granted to that role.

The canonical roles are: `global_admin`, `tenant_admin`, `manager`,
`quality_manager`, `monitor`, `production_supervisor`.

#### Scenario: Seed creates roles on empty table

- GIVEN the `Role` table is empty
- WHEN the seed operation is executed
- THEN all 6 canonical roles exist in the database
- AND each role has a non-empty `permissions` array

#### Scenario: Seed is idempotent on existing data

- GIVEN the `Role` table already contains the 6 canonical roles
- WHEN the seed operation is executed again
- THEN no duplicate roles are created
- AND existing roles are updated if their definition changed

---

### Requirement: List Users in Tenant

The system MUST provide an endpoint to retrieve all `UserMembership` records
belonging to the current tenant.

Only users with a role that has user management authority MUST be permitted
to call this endpoint. Unauthorized callers MUST receive HTTP 403.

The response MUST include for each membership: `id`, `user_id`, `username`,
`full_name`, `email`, `role` (with `id`, `code`, `name`, `permissions`),
`is_active`, `created_at`, `updated_at`.

#### Scenario: Admin lists users in their tenant

- GIVEN a user with role `tenant_admin` is authenticated
- AND the tenant has 3 active memberships
- WHEN `GET /api/v1/users/` is called with a valid token and tenant context
- THEN the server returns HTTP 200
- AND the response body is a list of 3 membership objects

#### Scenario: Non-admin cannot list users

- GIVEN a user with role `monitor` is authenticated
- WHEN `GET /api/v1/users/` is called
- THEN the server returns HTTP 403

#### Scenario: Unauthenticated request is rejected

- GIVEN no `Authorization` header is provided
- WHEN `GET /api/v1/users/` is called
- THEN the server returns HTTP 401

---

### Requirement: Get User Membership Detail

The system MUST provide an endpoint to retrieve a single `UserMembership`
by its ID within the current tenant.

The endpoint MUST return HTTP 404 if the membership does not belong to the
current tenant, even if the ID exists in another tenant.

#### Scenario: Admin retrieves a membership by ID

- GIVEN a user with role `tenant_admin` is authenticated
- AND a membership with `id=5` exists in the current tenant
- WHEN `GET /api/v1/users/5/` is called
- THEN the server returns HTTP 200 with the membership object

#### Scenario: Membership from another tenant returns 404

- GIVEN a user with role `tenant_admin` in tenant A is authenticated
- AND a membership with `id=99` exists in tenant B
- WHEN `GET /api/v1/users/99/` is called with tenant A context
- THEN the server returns HTTP 404

---

### Requirement: Create User in Tenant

The system MUST provide an endpoint to create a new Django `User` and bind
it to the current tenant with a specified role in a single atomic operation.

The system MUST reject requests where the `username` already exists globally.
The system MUST reject requests that reference a non-existent `role_id`.
The system MUST log an audit event on successful user creation.

#### Scenario: Admin creates a new user

- GIVEN a user with role `tenant_admin` is authenticated
- AND `username` does not already exist in the system
- AND `role_id` references a valid role
- WHEN `POST /api/v1/users/` is called with `{username, password, first_name, last_name, email, role_id}`
- THEN the server returns HTTP 201
- AND the response body contains the new `UserMembership` with `is_active: true`
- AND an audit event `users.create` is logged

#### Scenario: Duplicate username is rejected

- GIVEN a user with `username="maria"` already exists
- WHEN `POST /api/v1/users/` is called with `username="maria"`
- THEN the server returns HTTP 400
- AND no new user or membership is created

#### Scenario: Invalid role_id is rejected

- GIVEN `role_id=9999` does not exist in the database
- WHEN `POST /api/v1/users/` is called with `role_id=9999`
- THEN the server returns HTTP 400

#### Scenario: Non-admin cannot create users

- GIVEN a user with role `monitor` is authenticated
- WHEN `POST /api/v1/users/` is called
- THEN the server returns HTTP 403

---

### Requirement: Update User Membership

The system MUST provide an endpoint to update a `UserMembership`'s `role`
and/or `is_active` status.

The system MUST reject updates that reference a non-existent `role_id`.
The system MUST log an audit event on successful update.
The endpoint MUST return HTTP 404 if the membership does not belong to the
current tenant.

#### Scenario: Admin updates user role

- GIVEN a membership with `id=5` exists in the current tenant
- AND a role with `id=2` exists
- WHEN `PATCH /api/v1/users/5/` is called with `{role_id: 2}`
- THEN the server returns HTTP 200
- AND the membership's role is updated
- AND an audit event `users.update_membership` is logged

#### Scenario: Admin deactivates a user via PATCH

- GIVEN a membership with `id=5` and `is_active: true` exists
- WHEN `PATCH /api/v1/users/5/` is called with `{is_active: false}`
- THEN the server returns HTTP 200
- AND the membership's `is_active` is now `false`

#### Scenario: Update with invalid role_id is rejected

- GIVEN `role_id=9999` does not exist
- WHEN `PATCH /api/v1/users/5/` is called with `{role_id: 9999}`
- THEN the server returns HTTP 400

---

### Requirement: Deactivate User Membership

The system MUST provide a DELETE endpoint that performs a **soft-delete**:
it sets `is_active=False` on the membership and logs an audit event.

The system MUST NOT delete the underlying `User` record from Django's auth system.
The system MUST return HTTP 404 if the membership does not belong to the current tenant.

A deactivated user MUST NOT be able to access tenant resources. Specifically,
`get_request_membership` MUST filter out memberships where `is_active=False`.

#### Scenario: Admin deactivates a user via DELETE

- GIVEN a membership with `id=5` and `is_active: true` exists in the current tenant
- WHEN `DELETE /api/v1/users/5/` is called by a `tenant_admin`
- THEN the server returns HTTP 204
- AND the membership's `is_active` is `false` in the database
- AND the Django `User` record still exists
- AND an audit event `users.deactivate` is logged

#### Scenario: Deactivated user cannot access tenant resources

- GIVEN a membership is deactivated (`is_active=False`)
- WHEN the user makes an authenticated request to any protected endpoint with that tenant context
- THEN the server returns HTTP 403 or HTTP 401

#### Scenario: DELETE on non-tenant membership returns 404

- GIVEN a membership `id=99` belongs to a different tenant
- WHEN `DELETE /api/v1/users/99/` is called
- THEN the server returns HTTP 404

---

### Requirement: List Roles

The system MUST provide an endpoint to retrieve all available roles.
Any authenticated user with a valid tenant membership MAY call this endpoint.

#### Scenario: Authenticated user lists roles

- GIVEN a user is authenticated with any role
- WHEN `GET /api/v1/users/roles/` is called
- THEN the server returns HTTP 200 with a list of role objects
- AND each role contains `id`, `code`, `name`, `permissions`

#### Scenario: Unauthenticated request is rejected

- GIVEN no `Authorization` header is provided
- WHEN `GET /api/v1/users/roles/` is called
- THEN the server returns HTTP 401

---

### Requirement: User Management Authorization

The system MUST enforce that only users with user management authority can
create, update, or deactivate users.

A user has management authority if their `role.code` is `global_admin` or
`tenant_admin`, OR if their `role.permissions` array contains any of:
`users.manage`, `users.write`, `users.admin`, or `tenant.users.manage`.

#### Scenario: Role with explicit permission can manage users

- GIVEN a user has role with `permissions = ["users.manage"]`
- AND the role code is NOT in the admin set
- WHEN `GET /api/v1/users/` is called
- THEN the server returns HTTP 200 (not 403)

#### Scenario: Role without permission cannot manage users

- GIVEN a user has role `monitor` with no user management permissions
- WHEN any user management endpoint is called
- THEN the server returns HTTP 403
