# Change Proposal: reports-base

**Change ID**: reports-base  
**Status**: proposed  
**Created**: 2025-01-01  
**Author**: Copilot / Jose Colivoro

---

## Intent

Provide read-only reporting endpoints that aggregate operational data per tenant: lot counts by status, form counts by type/status, and a recent activity feed. This supports management dashboards without building full analytics infrastructure.

---

## Scope In

| Area | Deliverable |
|------|-------------|
| `GET /api/v1/reports/lots/summary/` | Lot counts by status (`pending`, `in_process`, `approved`, `rejected`), total count, `this_month` count |
| `GET /api/v1/reports/forms/summary/` | Form counts grouped by `form_type` and by `status` |
| `GET /api/v1/reports/activity/` | Last 20 `AuditEvent` rows for the tenant; any active member may access |
| `GET /api/v1/reports/dashboard/` | Single endpoint returning `lot_summary + form_summary + recent_activity` in one response |
| Frontend hook | `useReports()` — fetches `/api/v1/reports/dashboard/`, exposes `isLoading`, `error`, `stats`, `refresh` |
| Frontend component | `DashboardStats` — 4 stat cards: Total Lotes, Lotes Este Mes, Formularios Enviados, Formularios Aprobados |
| Backend tests | 6 tests covering all four endpoints |

---

## Scope Out

- CSV / Excel export
- Power BI integration
- Historical trend charts (time-series data)
- Scheduled report emails
- Cross-tenant admin reporting

---

## Approach

**Pure read-only aggregation** using Django ORM `Count` + `filter` annotations. No new database models are needed.

A thin `apps/reports/` module (new Django app) is created for separation of concerns — keeping reporting logic isolated from `apps/quality/` and `apps/audit/`. The app has no models, only views and URL configuration.

All views use `get_request_membership` (from `apps.users.services`) together with DRF's `IsAuthenticated` permission. Activity feed is restricted to active members (same as all other tenant-scoped endpoints) but does **not** require elevated roles.

The frontend consumes a single `/api/v1/reports/dashboard/` call per page load to minimise round-trips.

---

## Affected Areas

### Backend

| File | Change |
|------|--------|
| `backend/apps/reports/__init__.py` | New — empty init for Django app |
| `backend/apps/reports/apps.py` | New — `ReportsConfig` |
| `backend/apps/reports/views.py` | New — `LotSummaryView`, `FormSummaryView`, `ActivityView`, `DashboardView` |
| `backend/apps/reports/urls.py` | New — URL routes for four endpoints |
| `backend/config/urls.py` | Add `include("apps.reports.urls")` under `/api/v1/reports/` |
| `backend/config/settings/base.py` | Add `"apps.reports"` to `INSTALLED_APPS` |
| `backend/tests/test_reports.py` | New — 6 tests |

### Frontend

| File | Change |
|------|--------|
| `frontend/lib/reports/types.ts` | New — `LotSummary`, `FormSummary`, `DashboardStats` TypeScript interfaces |
| `frontend/lib/reports/api.ts` | New — `getDashboardStats()` fetch function |
| `frontend/hooks/use-reports.ts` | New — `useReports()` React hook |
| `frontend/components/dashboard/stats-cards.tsx` | New — `DashboardStats` 4-card presentational component |

---

## Open Questions

_None. All decisions are captured in `design.md`._
