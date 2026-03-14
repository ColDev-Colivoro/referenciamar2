# Proposal: Billing & Licensing — Tenant Plan Management

## Intent

Implement tenant plan/licensing management for ColdevConAC. `TenantRegistry` already has a
bare `plan = CharField(default="starter")` field but no structured plan catalog, no feature
limits, and no subscription lifecycle. This change adds:

- A `Plan` model (structured catalog with limits and feature flags)
- A `TenantSubscription` model (tenant → plan binding with status and expiry)
- A read API so apps can check what a tenant is allowed to do
- A `seed_plans` management command (idempotent, like `seed_roles`)
- A minimal frontend slice: hook + badge component + read-only billing page

## Scope

### In Scope

**Backend models (in `apps.core`):**
- `Plan` model: `code` (unique slug: starter/professional/enterprise), `name`, `max_users`,
  `max_lots_per_month`, `features` (JSONField with feature flags), `price_monthly`, `is_active`
- `TenantSubscription` model: `tenant` (OneToOne → TenantRegistry), `plan` (FK → Plan),
  `status` (TextChoices: active/trial/expired/suspended), `trial_ends_at` (nullable datetime),
  `expires_at` (nullable datetime), `created_at`, `updated_at`

**Backend API (in new thin `apps.billing`):**
- `GET /api/v1/billing/plans/` — public, no auth required; returns active plans ordered by
  `price_monthly`
- `GET /api/v1/billing/subscription/` — `tenant_admin` or `global_admin` only; returns current
  tenant subscription + plan details; 404 with helpful message if no subscription exists

**Backend management command:**
- `seed_plans` in `apps.core/management/commands/seed_plans.py` — idempotent creation of 3
  canonical plans (starter, professional, enterprise); safe to re-run

**Frontend:**
- `frontend/lib/billing/types.ts` — `Plan`, `TenantSubscription`, `SubscriptionStatus` types
- `frontend/lib/billing/api.ts` — `listPlans()`, `getSubscription()` API functions
- `frontend/hooks/use-subscription.ts` — `useSubscription()` hook (subscription, plan,
  isLoading, error)
- `frontend/components/billing/plan-badge.tsx` — color-coded badge (starter=gray,
  professional=blue, enterprise=gold)
- `frontend/app/dashboard/billing/page.tsx` — read-only page showing current plan, status,
  limits, expires_at

**Tests:**
- 8 backend tests covering plan list, subscription retrieval, permissions, seed_plans

### Out of Scope

- Payment processing (Stripe, MercadoPago, etc.)
- Invoicing / receipts
- Plan upgrades/downgrades API
- Usage metering and overage enforcement
- Email billing notifications
- Frontend tests (Cypress/Playwright)
- Webhooks for payment events

## Approach

Models live in `apps.core` — billing is infrastructure-level, not domain-specific.
`TenantSubscription` is a OneToOne on `TenantRegistry` so lookups are O(1).

A new thin `apps.billing` module contains only API views (no models) that import from `core`.
This mirrors how `apps.audit` has views that import from `core` helpers.

`GET /api/v1/billing/plans/` is unauthenticated to support public pricing page use cases.
`GET /api/v1/billing/subscription/` uses the same `get_request_membership()` guard pattern
already established in `users/views.py` and `audit/views.py`.

`seed_plans` follows the exact `update_or_create` pattern of `seed_roles`.

## Affected Areas

| Area | Change |
|---|---|
| `backend/apps/core/models.py` | Add `Plan` + `TenantSubscription` models |
| `backend/apps/core/migrations/` | New migration for the two models |
| `backend/apps/core/management/commands/seed_plans.py` | New idempotent seed command |
| `backend/apps/core/admin.py` | Register `Plan` and `TenantSubscription` |
| `backend/apps/billing/__init__.py` | New thin app (no models) |
| `backend/apps/billing/apps.py` | AppConfig |
| `backend/apps/billing/views.py` | `PlanListView`, `SubscriptionView` |
| `backend/apps/billing/urls.py` | URL patterns |
| `backend/apps/billing/serializers.py` | `PlanSerializer`, `TenantSubscriptionSerializer` |
| `backend/config/settings.py` | Add `apps.billing` to `INSTALLED_APPS` |
| `backend/config/urls.py` | Include `apps.billing.urls` at `api/v1/billing/` |
| `frontend/lib/billing/types.ts` | TypeScript types |
| `frontend/lib/billing/api.ts` | API helper functions |
| `frontend/hooks/use-subscription.ts` | React hook |
| `frontend/components/billing/plan-badge.tsx` | Badge UI component |
| `frontend/app/dashboard/billing/page.tsx` | Billing dashboard page |
| `backend/tests/test_billing.py` | 8 backend tests |

## Risks

- **OneToOne subscription means tenant may have no subscription.** Mitigate: `GET
  /api/v1/billing/subscription/` returns HTTP 404 with `{"detail": "No subscription found for
  this tenant."}` — callers handle gracefully.
- **TenantRegistry already has a `plan` CharField.** The new `TenantSubscription` is additive
  and does not remove the legacy field in this iteration — migration keeps backward compat.

## Success Criteria

- [ ] `Plan` + `TenantSubscription` pass `manage.py check` with 0 issues
- [ ] `seed_plans` creates 3 plans idempotently (re-run produces no duplicates)
- [ ] `GET /api/v1/billing/plans/` returns plan list without auth token (HTTP 200)
- [ ] `GET /api/v1/billing/subscription/` returns plan details for authenticated tenant_admin
- [ ] `GET /api/v1/billing/subscription/` returns HTTP 404 when tenant has no subscription
- [ ] All 8 backend tests pass
