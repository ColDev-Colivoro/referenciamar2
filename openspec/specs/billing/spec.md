# Billing & Licensing Specification — ColdevConAC

## Purpose

Define the behavior of the billing and licensing system for ColdevConAC. This spec covers
the `Plan` and `TenantSubscription` models, the public plan catalog API, the tenant
subscription API, and the idempotent `seed_plans` management command.

---

## Requirements

### Requirement: Plan Model

The system MUST provide a `Plan` model stored in the global (base) database in `apps.core`.
Each plan MUST have a unique `code` (slug), a human-readable `name`, integer limits
(`max_users`, `max_lots_per_month`), a `features` JSONField containing boolean feature flags,
a `price_monthly` decimal field, and an `is_active` boolean flag.

Plans with `is_active=False` MUST be treated as retired — they remain associated with existing
subscriptions but MUST NOT appear in the public plan list.

#### Scenario: Plan creation with valid data

- GIVEN the `Plan` table is empty
- WHEN a `Plan` is created with `code="starter"`, `name="Starter"`, `max_users=5`,
  `max_lots_per_month=100`, `features={"reports": false, "audit": true}`,
  `price_monthly=0.00`, `is_active=True`
- THEN the record is saved successfully
- AND `str(plan)` returns `"Starter (starter)"`

#### Scenario: Plan code must be unique

- GIVEN a `Plan` with `code="starter"` already exists
- WHEN a second `Plan` with `code="starter"` is created
- THEN a database integrity error (unique constraint violation) is raised

---

### Requirement: TenantSubscription Model

The system MUST provide a `TenantSubscription` model stored in the global database.
Each subscription MUST have a OneToOne relationship with `TenantRegistry`, a FK to `Plan`,
a `status` field using `TextChoices` with values `active`, `trial`, `expired`, `suspended`,
nullable `trial_ends_at` and `expires_at` datetime fields, and `created_at`/`updated_at`
auto-timestamps.

A given tenant MUST have at most one subscription at any time (enforced by OneToOne).

#### Scenario: Subscription created for a tenant

- GIVEN a tenant `TenantRegistry(slug="acme")` exists
- AND a plan `Plan(code="starter")` exists
- WHEN a `TenantSubscription` is created linking them with `status="trial"`
- THEN the record is saved successfully
- AND `TenantSubscription.objects.get(tenant=tenant).plan.code` returns `"starter"`

#### Scenario: Cannot create two subscriptions for the same tenant

- GIVEN a `TenantSubscription` already exists for tenant `acme`
- WHEN a second `TenantSubscription` is created for the same tenant
- THEN a database integrity error (unique constraint violation) is raised

---

### Requirement: Plan List API

The system MUST provide `GET /api/v1/billing/plans/` that returns all plans where
`is_active=True`, ordered by `price_monthly` ascending.

This endpoint MUST NOT require authentication — it is intended for public pricing page use.
It MUST return HTTP 200 with a JSON array even when called without an `Authorization` header.

Each plan object in the response MUST include: `id`, `code`, `name`, `max_users`,
`max_lots_per_month`, `features`, `price_monthly`.

#### Scenario: Public caller retrieves active plans

- GIVEN 3 active plans (starter, professional, enterprise) exist
- AND 1 inactive plan exists
- WHEN `GET /api/v1/billing/plans/` is called with no Authorization header
- THEN HTTP 200 is returned
- AND the response body is a JSON array with exactly 3 items
- AND no inactive plan appears in the results
- AND plans are ordered by `price_monthly` ascending

#### Scenario: Empty plan catalog returns empty array

- GIVEN the `Plan` table is empty
- WHEN `GET /api/v1/billing/plans/` is called
- THEN HTTP 200 is returned
- AND the response body is `[]`

---

### Requirement: Tenant Subscription API

The system MUST provide `GET /api/v1/billing/subscription/` that returns the current
tenant's subscription including nested plan details.

Only users with role `tenant_admin` or `global_admin` MUST be permitted to call this endpoint.
Users with any other role MUST receive HTTP 403.
Unauthenticated callers MUST receive HTTP 401.
If the tenant has no subscription record, the endpoint MUST return HTTP 404 with
`{"detail": "No subscription found for this tenant."}`.

The response MUST include: `id`, `status`, `trial_ends_at`, `expires_at`, `created_at`,
`updated_at`, and a nested `plan` object with all plan fields.

#### Scenario: tenant_admin retrieves active subscription

- GIVEN a user with role `tenant_admin` is authenticated
- AND the tenant has a `TenantSubscription` with `status="active"` linked to the `professional`
  plan
- WHEN `GET /api/v1/billing/subscription/` is called
- THEN HTTP 200 is returned
- AND `response.data["status"]` equals `"active"`
- AND `response.data["plan"]["code"]` equals `"professional"`

#### Scenario: monitor role is forbidden

- GIVEN a user with role `monitor` is authenticated
- WHEN `GET /api/v1/billing/subscription/` is called
- THEN HTTP 403 is returned

#### Scenario: tenant has no subscription

- GIVEN a user with role `tenant_admin` is authenticated
- AND the tenant has NO `TenantSubscription` record
- WHEN `GET /api/v1/billing/subscription/` is called
- THEN HTTP 404 is returned
- AND `response.data["detail"]` equals `"No subscription found for this tenant."`

#### Scenario: unauthenticated request

- GIVEN no Authorization header is present
- WHEN `GET /api/v1/billing/subscription/` is called
- THEN HTTP 401 is returned

---

### Requirement: seed_plans Management Command

The system MUST provide a `seed_plans` management command in
`apps.core.management.commands.seed_plans` that creates (or updates) exactly 3 canonical plans
using `update_or_create` keyed on `code`.

The canonical plans are:

| code | name | max_users | max_lots_per_month | price_monthly | features |
|---|---|---|---|---|---|
| starter | Starter | 5 | 100 | 0.00 | `{"reports": false, "audit": false, "api_access": false}` |
| professional | Professional | 25 | 1000 | 49.00 | `{"reports": true, "audit": true, "api_access": false}` |
| enterprise | Enterprise | 999 | 99999 | 199.00 | `{"reports": true, "audit": true, "api_access": true}` |

The command MUST be idempotent — running it multiple times MUST NOT create duplicates and
MUST update plans whose definitions have changed.

#### Scenario: seed creates plans on empty table

- GIVEN the `Plan` table is empty
- WHEN `python manage.py seed_plans` is executed
- THEN exactly 3 `Plan` records exist in the database
- AND each has `is_active=True`
- AND `Plan.objects.get(code="enterprise").max_users` equals `999`

#### Scenario: seed is idempotent on existing data

- GIVEN the 3 canonical plans already exist
- WHEN `python manage.py seed_plans` is executed again
- THEN `Plan.objects.count()` still equals 3
- AND no duplicate records exist
