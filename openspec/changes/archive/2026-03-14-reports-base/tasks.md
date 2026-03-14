# Tasks: reports-base

**Change**: reports-base  
**Status**: pending  
**Version**: 1.0

---

## Phase 1 — New Django App Bootstrap (3 tasks)

- [x] **T-01** Create `backend/apps/reports/__init__.py`  
  Empty file. Marks `apps/reports/` as a Python package.  
  _Acceptance_: File exists; `from apps.reports import urls` does not raise ImportError.

- [x] **T-02** Create `backend/apps/reports/apps.py`  
  ```python
  from django.apps import AppConfig

  class ReportsConfig(AppConfig):
      default_auto_field = "django.db.models.BigAutoField"
      name = "apps.reports"
      verbose_name = "Reports"
  ```  
  _Acceptance_: `AppConfig.name == "apps.reports"`.

- [x] **T-03** Register app in `backend/config/settings/base.py`  
  Add `"apps.reports"` to `INSTALLED_APPS`.  
  _Acceptance_: `django.apps.apps.get_app_config("reports")` returns `ReportsConfig`.

---

## Phase 2 — API Views and URL Routes (7 tasks)

- [x] **T-04** Create `backend/apps/reports/views.py` — `LotSummaryView`  
  `GET /api/v1/reports/lots/summary/`  
  Uses `get_request_membership`; returns 403 if no membership.  
  Aggregates `Lot` counts by status + total + this_month via ORM.  
  _Acceptance_: Returns `{total, this_month, by_status}` for authenticated request.

- [x] **T-05** Add `FormSummaryView` to `backend/apps/reports/views.py`  
  `GET /api/v1/reports/forms/summary/`  
  Aggregates `QualityForm` counts by `form_type` and by `status`.  
  _Acceptance_: Returns `{total, by_type, by_status}` for authenticated request.

- [x] **T-06** Add `ActivityView` to `backend/apps/reports/views.py`  
  `GET /api/v1/reports/activity/`  
  Returns last 20 `AuditEvent` rows for tenant, ordered `-created_at`.  
  Serialises: `id`, `action`, `level`, `actor` (username or null), `created_at`, `metadata`.  
  _Acceptance_: Returns array of at most 20 items; any active member can access.

- [x] **T-07** Add `DashboardView` to `backend/apps/reports/views.py`  
  `GET /api/v1/reports/dashboard/`  
  Calls lot summary, form summary, and activity logic inline.  
  Returns `{lot_summary, form_summary, recent_activity}`.  
  _Acceptance_: All three keys present in a single HTTP response.

- [x] **T-08** Create `backend/apps/reports/urls.py`  
  Register four URL patterns:
  ```python
  path("lots/summary/",  LotSummaryView.as_view(),  name="lots-summary"),
  path("forms/summary/", FormSummaryView.as_view(), name="forms-summary"),
  path("activity/",      ActivityView.as_view(),    name="activity"),
  path("dashboard/",     DashboardView.as_view(),   name="dashboard"),
  ```  
  _Acceptance_: `reverse("reports:dashboard")` resolves to `/api/v1/reports/dashboard/`.

- [x] **T-09** Wire reports URLs in `backend/config/urls.py`  
  Add:
  ```python
  path("api/v1/reports/", include("apps.reports.urls", namespace="reports")),
  ```  
  _Acceptance_: `GET /api/v1/reports/dashboard/` returns 200 (not 404).

- [x] **T-10** Verify 403 guard — no membership returns 403 on all four endpoints  
  Manual smoke-test or verify in tests that a request with valid token but no membership returns HTTP 403.  
  _Acceptance_: All four endpoints return 403 when `get_request_membership(request)` is `None`.

---

## Phase 3 — Frontend (4 tasks)

- [x] **T-11** Create `frontend/lib/reports/types.ts`  
  Define and export:
  - `LotByStatus`, `LotSummary`
  - `FormByStatus`, `FormSummary`
  - `ActivityEvent`
  - `DashboardStats`  
  _Acceptance_: TypeScript compiles without errors; all fields match the backend response shape.

- [x] **T-12** Create `frontend/lib/reports/api.ts`  
  Implement `getDashboardStats(): Promise<DashboardStats>`.  
  Uses `fetch("/api/v1/reports/dashboard/")` with auth header from session.  
  Throws an error (with message) on non-2xx response.  
  _Acceptance_: Returns `DashboardStats` on success; throws on error.

- [x] **T-13** Create `frontend/hooks/use-reports.ts`  
  Implement `useReports(): UseReportsResult`.  
  - Calls `getDashboardStats()` on mount via `useEffect`.
  - Exposes `{ stats, isLoading, error, refresh }`.
  - `refresh()` re-triggers the fetch.  
  _Acceptance_: `isLoading` transitions correctly; `error` populated on fetch failure.

- [x] **T-14** Create `frontend/components/dashboard/stats-cards.tsx`  
  Presentational component accepting `stats: DashboardStats` prop.  
  Renders 4 cards:
  1. Total Lotes — `stats.lot_summary.total`
  2. Lotes Este Mes — `stats.lot_summary.this_month`
  3. Formularios Enviados — `stats.form_summary.by_status.submitted`
  4. Formularios Aprobados — `stats.form_summary.by_status.approved`  
  _Acceptance_: All 4 cards visible when rendered with valid props; no internal data fetching.

---

## Phase 4 — Tests (6 tasks)

- [x] **T-15** `test_lot_summary_counts` in `backend/tests/test_reports.py`  
  Create 3 pending + 1 approved lots; call `/api/v1/reports/lots/summary/`; assert `total==4`, `by_status.pending==3`, `by_status.approved==1`.

- [x] **T-16** `test_lot_summary_unauthenticated`  
  Call `/api/v1/reports/lots/summary/` without token; assert HTTP 401.

- [x] **T-17** `test_form_summary_counts`  
  Create forms of mixed types and statuses; call `/api/v1/reports/forms/summary/`; assert `by_type` and `by_status` counts.

- [x] **T-18** `test_activity_feed_limit`  
  Create 25 `AuditEvent` rows for the tenant; call `/api/v1/reports/activity/`; assert `len(response.data) == 20`.

- [x] **T-19** `test_dashboard_all_sections_present`  
  Call `/api/v1/reports/dashboard/`; assert response has keys `lot_summary`, `form_summary`, `recent_activity`.

- [x] **T-20** `test_cross_tenant_isolation`  
  Create tenant A and tenant B each with distinct lots.  
  Authenticate as tenant A user; call `/api/v1/reports/lots/summary/`.  
  Assert `total` equals tenant A's lot count (tenant B lots not included).

---

## Phase 5 — Documentation (3 tasks)

- [x] **T-21** Update `openspec/specs/` — move `changes/reports-base/specs/reports/spec.md` reference into main specs index if one exists (or create entry).  
  _Acceptance_: Spec is reachable from openspec root.

- [x] **T-22** Add reports endpoints to project API reference (if `docs/api.md` or similar exists).  
  _Acceptance_: Four endpoints documented with request/response shape.

- [ ] **T-23** Archive change on completion — move `openspec/changes/reports-base/` to `openspec/changes/archive/reports-base/` after all tasks are verified.  
  _Acceptance_: No open tasks remain; change is archived.

---

## Summary

| Phase | Tasks | Count |
|-------|-------|-------|
| 1 — App Bootstrap | T-01 → T-03 | 3 |
| 2 — API Views + URLs | T-04 → T-10 | 7 |
| 3 — Frontend | T-11 → T-14 | 4 |
| 4 — Tests | T-15 → T-20 | 6 |
| 5 — Documentation | T-21 → T-23 | 3 |
| **Total** | | **23** |
