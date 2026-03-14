# Tasks: Billing & Licensing — Tenant Plan Management

## Phase 1: Models, Migration, Seed Command (5 tasks)

- [x] **T1.1** — Add `Plan` model to `backend/apps/core/models.py` — define `Plan(models.Model)`
  with fields: `code = SlugField(unique=True)`, `name = CharField(max_length=100)`,
  `max_users = PositiveIntegerField()`, `max_lots_per_month = PositiveIntegerField()`,
  `features = JSONField(default=dict)`, `price_monthly = DecimalField(max_digits=8,
  decimal_places=2)`, `is_active = BooleanField(default=True)`; `Meta.ordering = ["price_monthly"]`;
  `__str__` returns `f"{self.name} ({self.code})"`.
  Done when `python manage.py check` exits 0.

- [x] **T1.2** — Add `TenantSubscription` model to `backend/apps/core/models.py` — define
  `TenantSubscription(models.Model)` with inner `Status(TextChoices)` (active/trial/expired/
  suspended); `tenant = OneToOneField(TenantRegistry, CASCADE, related_name="subscription")`;
  `plan = ForeignKey(Plan, PROTECT, related_name="subscriptions")`; `status = CharField(choices,
  default=Status.TRIAL)`; `trial_ends_at` and `expires_at` as nullable `DateTimeField`;
  `created_at`/`updated_at` auto-timestamps; `__str__` returns
  `f"{self.tenant.slug} — {self.plan.code} ({self.status})"`.
  Done when `python manage.py check` exits 0.

- [x] **T1.3** — Generate migration for `Plan` + `TenantSubscription` — run
  `python manage.py makemigrations core --name add_plan_tenantsubscription` inside `backend/`.
  Done when the migration file is created under `apps/core/migrations/` and
  `python manage.py migrate --run-syncdb` (in test DB) exits 0.

- [x] **T1.4** — Create `backend/apps/core/management/commands/seed_plans.py` — implement
  `Command(BaseCommand)` with `handle()` that calls
  `Plan.objects.update_or_create(code=code, defaults={...})` for each of the 3 canonical plans
  (starter: max_users=5, max_lots_per_month=100, price_monthly=0.00,
  features={"reports": false, "audit": false, "api_access": false};
  professional: max_users=25, max_lots_per_month=1000, price_monthly=49.00,
  features={"reports": true, "audit": true, "api_access": false};
  enterprise: max_users=999, max_lots_per_month=99999, price_monthly=199.00,
  features={"reports": true, "audit": true, "api_access": true});
  prints `Created: {code}` or `Updated: {code}` for each; all plans have `is_active=True`.
  Done when `python manage.py seed_plans` runs twice and `Plan.objects.count()` equals 3.

- [x] **T1.5** — Register `Plan` and `TenantSubscription` in `backend/apps/core/admin.py` —
  add `@admin.register(Plan)` with `list_display = ["code", "name", "price_monthly", "is_active"]`
  and `@admin.register(TenantSubscription)` with
  `list_display = ["tenant", "plan", "status", "expires_at"]`.
  Done when Django admin at `/admin/core/plan/` and `/admin/core/tenantsubscription/` renders
  without errors.

---

## Phase 2: Billing API App + Views (6 tasks)

- [x] **T2.1** — Create `backend/apps/billing/__init__.py` (empty) and
  `backend/apps/billing/apps.py` — define `BillingConfig(AppConfig)` with
  `name = "apps.billing"`, `default_auto_field = "django.db.models.BigAutoField"`.
  Add `"apps.billing"` to `INSTALLED_APPS` in `backend/config/settings.py`.
  Done when `python manage.py check` exits 0.

- [x] **T2.2** — Create `backend/apps/billing/serializers.py` — define
  `PlanSerializer(ModelSerializer)` with `model = Plan` and
  `fields = ["id", "code", "name", "max_users", "max_lots_per_month", "features",
  "price_monthly"]` all read-only; define `TenantSubscriptionSerializer(ModelSerializer)`
  with `model = TenantSubscription` and `fields = ["id", "status", "trial_ends_at",
  "expires_at", "created_at", "updated_at", "plan"]` with nested `PlanSerializer(read_only=True)`
  for the `plan` field.
  Done when `TenantSubscriptionSerializer(instance).data` contains a nested `plan` dict.

- [x] **T2.3** — Create `PlanListView(APIView)` in `backend/apps/billing/views.py` —
  set `authentication_classes = []`, `permission_classes = []`; `get()` returns
  `Response(PlanSerializer(Plan.objects.filter(is_active=True).order_by("price_monthly"),
  many=True).data)` with HTTP 200.
  Done when `GET /api/v1/billing/plans/` with no Authorization header returns HTTP 200 and a
  JSON array.

- [x] **T2.4** — Create `SubscriptionView(APIView)` in `backend/apps/billing/views.py` —
  `authentication_classes = [TokenAuthentication]`, `permission_classes = [IsAuthenticated]`;
  `get()` calls `get_request_membership(request)` and returns HTTP 403 if membership is None
  or `membership.role.code not in {"global_admin", "tenant_admin"}`; attempts
  `TenantSubscription.objects.select_related("plan").get(tenant=membership.tenant)` and returns
  HTTP 404 with `{"detail": "No subscription found for this tenant."}` on `DoesNotExist`;
  on success returns `TenantSubscriptionSerializer(sub).data` with HTTP 200.
  Done when `GET /api/v1/billing/subscription/` returns 200 for tenant_admin, 403 for monitor,
  401 for unauthenticated, 404 when no subscription.

- [x] **T2.5** — Create `backend/apps/billing/urls.py` — define
  `urlpatterns = [path("plans/", PlanListView.as_view(), name="billing-plans"),
  path("subscription/", SubscriptionView.as_view(), name="billing-subscription")]`.
  Done when `python manage.py show_urls | grep billing` lists both routes.

- [x] **T2.6** — Modify `backend/config/urls.py` — add
  `path("api/v1/billing/", include("apps.billing.urls"))` to `urlpatterns`.
  Done when `GET /api/v1/billing/plans/` returns HTTP 200 (not 404) from a live server or
  test client.

---

## Phase 3: Frontend Slice (4 tasks)

- [x] **T3.1** — Create `frontend/lib/billing/types.ts` — export `SubscriptionStatus` type
  (`"active" | "trial" | "expired" | "suspended"`); export `Plan` interface (`id`, `code`,
  `name`, `max_users`, `max_lots_per_month`, `features: Record<string, boolean>`,
  `price_monthly: string`); export `TenantSubscription` interface (`id`, `status`, `trial_ends_at`,
  `expires_at`, `created_at`, `updated_at`, `plan: Plan`).
  Create `frontend/lib/billing/api.ts` — export `listPlans(): Promise<Plan[]>` calling
  `GET /api/v1/billing/plans/` and `getSubscription(): Promise<TenantSubscription>` calling
  `GET /api/v1/billing/subscription/` using the project's existing `apiRequest` helper.
  Done when TypeScript compilation passes with no errors referencing these files.

- [x] **T3.2** — Create `frontend/hooks/use-subscription.ts` — implement `useSubscription()`
  following the `useLots()` pattern (`useState + useCallback + useEffect + useMemo`); internal
  state: `subscription: TenantSubscription | null`, `isLoading: boolean`, `error: string | null`;
  `fetchSubscription` useCallback calls `getSubscription()`, on 404 sets `subscription=null,
  error=null`, on other errors sets error message; `useEffect` calls `fetchSubscription()` on
  mount; `useMemo` returns `{ subscription, plan: subscription?.plan ?? null, isLoading, error,
  refresh: fetchSubscription }`.
  Done when hook satisfies `UseSubscriptionReturn` and TypeScript compiles cleanly.

- [x] **T3.3** — Create `frontend/components/billing/plan-badge.tsx` — `"use client"`;
  accept props `{ planCode: string; planName?: string }`; define color map
  `{ starter: "bg-gray-100 text-gray-700", professional: "bg-blue-100 text-blue-700",
  enterprise: "bg-amber-100 text-amber-700" }`; render a `<span>` with the resolved classes
  plus base badge classes (`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs
  font-medium`); display `planName ?? planCode`.
  Done when the component renders with correct color classes for each plan code.

- [x] **T3.4** — Create `frontend/app/dashboard/billing/page.tsx` — `"use client"`;
  on mount read role from `AuthContext`; if role not in `["global_admin", "tenant_admin"]`
  call `router.replace("/dashboard")` and return null; call `useSubscription()`;
  while `isLoading` render a loading skeleton (3 placeholder divs); if `error` render an error
  banner; if `subscription` is null (and not loading and no error) render
  `"No active subscription. Contact your administrator."`; otherwise render: page title
  "Plan & Subscription", `PlanBadge` with plan code/name, a details grid showing `status`,
  `max_users`, `max_lots_per_month`, `expires_at` (formatted or "No expiry"),
  `trial_ends_at` (only when `status === "trial"`); no edit/upgrade/payment controls.
  Done when `/dashboard/billing` renders for tenant_admin and redirects for monitor.

---

## Phase 4: Backend Tests (9 tasks)

- [x] **T4.1** — Create `backend/tests/test_billing.py` — add module docstring; import pytest,
  Django test utilities, `Plan`, `TenantSubscription`; define fixtures: `plan_starter` (creates
  starter Plan), `plan_professional` (creates professional Plan), `active_subscription`
  (creates TenantSubscription linking `tenant` to `plan_professional` with `status="active"`);
  reuse `admin_client`, `monitor_client`, `tenant`, `seeded_roles` from `conftest.py`.
  Done when fixtures are importable and produce correct model instances.

- [x] **T4.2** — In `backend/tests/test_billing.py` — write `test_plan_list_public_200`:
  create 2 active plans and 1 inactive plan; `GET /api/v1/billing/plans/` with NO Authorization
  header returns HTTP 200 and `len(response.data) == 2`.
  Done when assert passes.

- [x] **T4.3** — In `backend/tests/test_billing.py` — write `test_plan_list_ordered_by_price`:
  create plans with prices 49.00, 0.00, 199.00; `GET /api/v1/billing/plans/` returns items in
  price order [0.00, 49.00, 199.00].
  Done when assert passes.

- [x] **T4.4** — In `backend/tests/test_billing.py` — write
  `test_subscription_tenant_admin_200`: create `active_subscription`; `GET
  /api/v1/billing/subscription/` with `admin_client` returns HTTP 200;
  `response.data["status"] == "active"` and `response.data["plan"]["code"] == "professional"`.
  Done when asserts pass.

- [x] **T4.5** — In `backend/tests/test_billing.py` — write
  `test_subscription_monitor_403`: `GET /api/v1/billing/subscription/` with `monitor_client`
  returns HTTP 403.
  Done when assert passes.

- [x] **T4.6** — In `backend/tests/test_billing.py` — write
  `test_subscription_unauthenticated_401`: `GET /api/v1/billing/subscription/` with no
  Authorization header returns HTTP 401.
  Done when assert passes.

- [x] **T4.7** — In `backend/tests/test_billing.py` — write
  `test_subscription_not_found_404`: ensure tenant has NO `TenantSubscription`;
  `GET /api/v1/billing/subscription/` with `admin_client` returns HTTP 404 and
  `response.data["detail"] == "No subscription found for this tenant."`.
  Done when asserts pass.

- [x] **T4.8** — In `backend/tests/test_billing.py` — write `test_seed_plans_creates_three`:
  call `call_command("seed_plans")`; assert `Plan.objects.count() == 3` and
  `Plan.objects.get(code="enterprise").max_users == 999`.
  Done when asserts pass.

- [x] **T4.9** — In `backend/tests/test_billing.py` — write `test_seed_plans_idempotent`:
  call `call_command("seed_plans")` twice; assert `Plan.objects.count() == 3` (no duplicates).
  Done when assert passes.

---

## Phase 5: Documentation (3 tasks)

- [x] **T5.1** — Update `openspec/changes/billing-licensing/design.md` — mark each row in the
  File Changes Table with ✅ after implementation; resolve Open Questions section if any arise
  during implementation.
  Done when all rows show ✅ and no open questions remain.

- [x] **T5.2** — Update `docs/analisis/estado-proyecto.md` — add entry for billing-licensing:
  note that `Plan` + `TenantSubscription` models, `seed_plans` command, `GET
  /api/v1/billing/plans/` (public), `GET /api/v1/billing/subscription/` (admin), and frontend
  `/dashboard/billing/` page are operational; update module completion percentage.
  Done when the file reflects the new state.

- [x] **T5.3** — Mark all tasks complete in `openspec/changes/billing-licensing/tasks.md` after
  all tests pass — change every `- [x]` to `- [x]`.
  Done when `grep -c "\- \[ \]" tasks.md` returns 0.
