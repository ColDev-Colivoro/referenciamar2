# Design: Billing & Licensing — Tenant Plan Management

## Technical Approach

`TenantRegistry` already exists with a bare `plan = CharField(default="starter")`. This change
is additive: we add two new models (`Plan`, `TenantSubscription`) to `apps.core`, then build a
thin `apps.billing` module with only views/serializers/URLs (no models). The frontend follows
the same `types → api → hook → component → page` slice pattern used in every previous feature.

No existing files are broken. The legacy `plan` CharField on `TenantRegistry` is left intact
for backward compatibility and can be deprecated in a future migration.

---

## Architecture Decisions

### Decision: Models in `apps.core`, not in a new `apps.billing`

**Choice**: `Plan` and `TenantSubscription` live in `backend/apps/core/models.py`.

**Alternatives considered**: New `apps.billing` with its own models; separate billing DB.

**Rationale**: Per `AGENTS.md` lines 96–115, the global (base) database is the correct home for
"licencias, planes y estado comercial". `apps.core` is the established infrastructure module.
Putting models in a separate billing app would require cross-app FKs into `core` anyway.
Keeping them in `core` is consistent with how `TenantRegistry` is already there.

---

### Decision: Thin `apps.billing` for API views only (no models)

**Choice**: Create `backend/apps/billing/` with `apps.py`, `serializers.py`, `views.py`,
`urls.py` — import `Plan` and `TenantSubscription` from `apps.core.models`.

**Alternatives considered**: Add billing views directly to `apps.core/billing_views.py`.

**Rationale**: Keeping views in a dedicated app makes routing cleaner (`api/v1/billing/`)
and mirrors the existing project structure where each API domain has its own app directory
(`apps.audit`, `apps.quality`, etc.). The thin app pattern (no models) is pragmatic and avoids
circular imports.

---

### Decision: `GET /api/v1/billing/plans/` is unauthenticated

**Choice**: `PlanListView` has `authentication_classes = []` and `permission_classes = []`.

**Alternatives considered**: Require auth like all other endpoints.

**Rationale**: Public pricing pages are a standard SaaS pattern. The plan catalog contains no
sensitive data. Making it public avoids needing a token in a future marketing site or
onboarding flow.

---

### Decision: Permission guard via `get_request_membership()` + role check

**Choice**: `SubscriptionView.get()` calls `get_request_membership(request)`; if
`membership is None` or `membership.role.code not in {"global_admin", "tenant_admin"}`,
returns HTTP 403. This is identical to the `AuditListView` guard.

**Alternatives considered**: Custom DRF permission class.

**Rationale**: `get_request_membership()` is the established guard in this project.
Consistency reduces cognitive load when reading views across modules.

---

### Decision: 404 on missing subscription, not 200 with null

**Choice**: If `TenantSubscription.DoesNotExist`, return
`Response({"detail": "No subscription found for this tenant."}, status=404)`.

**Alternatives considered**: Return `{"subscription": null}` with 200.

**Rationale**: The absence of a subscription is a meaningful state that callers should
handle explicitly. HTTP 404 is semantically correct and makes it easy for API consumers
(frontend, other services) to distinguish "subscription not found" from "empty data".

---

### Decision: `seed_plans` follows `update_or_create` pattern of `seed_roles`

**Choice**: Each plan is created/updated with `Plan.objects.update_or_create(code=code,
defaults={...})`. Output per plan: `Created` or `Updated`.

**Rationale**: This is the established idempotent seed pattern in the project. Re-running
is safe and will apply any definition changes.

---

## File Changes Table

| File | Change | Status |
|---|---|---|
| `backend/apps/core/models.py` | Add `Plan` + `TenantSubscription` models | ✅ Done |
| `backend/apps/core/migrations/00XX_add_plan_tenantsubscription.py` | New migration | ✅ Done |
| `backend/apps/core/management/commands/seed_plans.py` | New idempotent seed command | ✅ Done |
| `backend/apps/core/admin.py` | Register `Plan`, `TenantSubscription` | ✅ Done |
| `backend/apps/billing/__init__.py` | New thin app | ✅ Done |
| `backend/apps/billing/apps.py` | `BillingConfig` | ✅ Done |
| `backend/apps/billing/serializers.py` | `PlanSerializer`, `TenantSubscriptionSerializer` | ✅ Done |
| `backend/apps/billing/views.py` | `PlanListView`, `SubscriptionView` | ✅ Done |
| `backend/apps/billing/urls.py` | URL patterns for billing | ✅ Done |
| `backend/config/settings.py` | Add `"apps.billing"` to `INSTALLED_APPS` | ✅ Done |
| `backend/config/urls.py` | `include("apps.billing.urls")` at `api/v1/billing/` | ✅ Done |
| `frontend/lib/billing/types.ts` | TypeScript interfaces | ✅ Done |
| `frontend/lib/billing/api.ts` | `listPlans()`, `getSubscription()` | ✅ Done |
| `frontend/hooks/use-subscription.ts` | `useSubscription()` hook | ✅ Done |
| `frontend/components/billing/plan-badge.tsx` | `PlanBadge` component | ✅ Done |
| `frontend/app/dashboard/billing/page.tsx` | Read-only billing page | ✅ Done |
| `backend/tests/test_billing.py` | 8 backend tests | ✅ Done |

---

## Data Flow

```
Client (no auth)
  └─► GET /api/v1/billing/plans/
        └─► PlanListView.get()
              └─► Plan.objects.filter(is_active=True).order_by("price_monthly")
                    └─► PlanSerializer(many=True) → JSON array

Client (tenant_admin token)
  └─► GET /api/v1/billing/subscription/
        └─► SubscriptionView.get()
              ├─► get_request_membership(request) → membership
              ├─► membership.role.code not in admin_codes → 403
              ├─► TenantSubscription.objects.get(tenant=membership.tenant)
              │     DoesNotExist → 404
              └─► TenantSubscriptionSerializer → JSON object

Frontend
  └─► useSubscription()
        ├─► getSubscription() → API call
        ├─► 404 → { subscription: null, error: null }
        ├─► 200 → { subscription, plan, isLoading: false, error: null }
        └─► 401/403 → { subscription: null, error: "message" }
              └─► /dashboard/billing/page.tsx
                    ├─► role guard → redirect if not admin
                    ├─► isLoading → skeleton
                    ├─► subscription → plan name + PlanBadge + limits table
                    └─► subscription null → "No active subscription" message
```

---

## Python Interfaces

```python
# apps/core/models.py (additions)

class Plan(models.Model):
    code = models.SlugField(unique=True)           # "starter" | "professional" | "enterprise"
    name = models.CharField(max_length=100)
    max_users = models.PositiveIntegerField()
    max_lots_per_month = models.PositiveIntegerField()
    features = models.JSONField(default=dict)       # {"reports": bool, "audit": bool, ...}
    price_monthly = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["price_monthly"]

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"


class TenantSubscription(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        TRIAL = "trial", "Trial"
        EXPIRED = "expired", "Expired"
        SUSPENDED = "suspended", "Suspended"

    tenant = models.OneToOneField(
        TenantRegistry, on_delete=models.CASCADE, related_name="subscription"
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name="subscriptions")
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.TRIAL
    )
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.tenant.slug} — {self.plan.code} ({self.status})"
```

---

## TypeScript Interfaces

```typescript
// frontend/lib/billing/types.ts

export type SubscriptionStatus = "active" | "trial" | "expired" | "suspended";

export interface Plan {
  id: number;
  code: string;           // "starter" | "professional" | "enterprise"
  name: string;
  max_users: number;
  max_lots_per_month: number;
  features: Record<string, boolean>;
  price_monthly: string;  // decimal as string from DRF
}

export interface TenantSubscription {
  id: number;
  status: SubscriptionStatus;
  trial_ends_at: string | null;  // ISO datetime
  expires_at: string | null;     // ISO datetime
  created_at: string;
  updated_at: string;
  plan: Plan;
}
```

---

## Open Questions

_None at proposal time._
